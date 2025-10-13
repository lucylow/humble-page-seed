import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config';
import { Logger } from '../utils/logger';
import { RedisService } from './redis';

interface AIParsedInvoice {
  total_amount: number;
  currency: 'sBTC' | 'STX' | 'USD';
  parties: {
    client: string;
    contractor: string;
  };
  milestones: Array<{
    sequence: number;
    amount: number;
    description: string;
    condition: string;
    due_date?: string;
    proof_required?: boolean;
    proof_type?: string;
  }>;
  arbitrator?: string;
  project_scope: string;
  timeline?: {
    start_date?: string;
    end_date?: string;
    duration_days?: number;
  };
  risk_assessment?: {
    level: 'low' | 'medium' | 'high';
    concerns: string[];
    recommendations: string[];
  };
}

interface ContractGenerationResult {
  clarity_code: string;
  template_used: string;
  functions_generated: string[];
  security_checks: string[];
  estimated_gas: number;
}

export class AIService {
  private openai: OpenAI;
  private anthropic: Anthropic;
  private redis: RedisService;
  private logger: Logger;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.ai.openai.apiKey
    });
    
    this.anthropic = new Anthropic({
      apiKey: config.ai.anthropic.apiKey || ''
    });
    
    this.redis = new RedisService();
    this.logger = new Logger('AIService');
  }

  public async initialize(): Promise<void> {
    this.logger.info('AI Service initialized', {
      openaiModel: config.ai.openai.model,
      anthropicModel: config.ai.anthropic.model
    });
  }

  public async parseInvoiceDescription(description: string): Promise<AIParsedInvoice> {
    const cacheKey = `ai:parse:${Buffer.from(description).toString('base64')}`;
    
    // Check cache first
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const prompt = this.buildParsingPrompt(description);
    
    try {
      const completion = await this.openai.chat.completions.create({
        model: config.ai.openai.model,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt('invoice_parsing')
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: config.ai.openai.temperature,
        max_tokens: config.ai.openai.maxTokens,
        response_format: { type: 'json_object' }
      });

      const parsedData = JSON.parse(completion.choices[0].message.content || '{}');
      
      // Validate and normalize the data
      const validatedData = this.validateInvoiceData(parsedData);
      
      // Cache the result for 1 hour
      await this.redis.setex(cacheKey, 3600, JSON.stringify(validatedData));
      
      this.logger.info('Invoice description parsed successfully', {
        milestones: validatedData.milestones.length,
        totalAmount: validatedData.total_amount
      });
      
      return validatedData;

    } catch (error: any) {
      this.logger.error('AI parsing failed', { error, description });
      throw new Error(`AI processing failed: ${error.message}`);
    }
  }

  public async generateClarityContract(
    invoiceData: AIParsedInvoice,
    templateType: string = 'milestone_escrow'
  ): Promise<ContractGenerationResult> {
    const cacheKey = `ai:contract:${Buffer.from(JSON.stringify(invoiceData)).toString('base64')}`;
    
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    try {
      const completion = await this.anthropic.messages.create({
        model: config.ai.anthropic.model,
        max_tokens: 4000,
        temperature: 0.1,
        system: this.getClaritySystemPrompt(),
        messages: [
          {
            role: 'user',
            content: this.buildContractGenerationPrompt(invoiceData, templateType)
          }
        ]
      });

      const content = completion.content[0];
      
      if (content.type !== 'text') {
        throw new Error('Unexpected response format from AI');
      }

      const result = this.parseContractGenerationResponse(content.text);
      
      // Validate generated code
      await this.validateClarityCode(result.clarity_code);
      
      // Cache the result
      await this.redis.setex(cacheKey, 7200, JSON.stringify(result));
      
      this.logger.info('Clarity contract generated successfully', {
        template: result.template_used,
        functions: result.functions_generated.length
      });
      
      return result;

    } catch (error: any) {
      this.logger.error('Contract generation failed', { error, templateType });
      throw new Error(`Contract generation failed: ${error.message}`);
    }
  }

  public async analyzeContractRisk(invoiceData: AIParsedInvoice): Promise<any> {
    const prompt = `
Analyze the following invoice data for potential risks and provide recommendations:

INVOICE DATA:
${JSON.stringify(invoiceData, null, 2)}

Consider:
1. Payment structure risks
2. Milestone dependency risks
3. Dispute resolution risks
4. Timeline and delivery risks
5. Counterparty risks

Provide analysis in JSON format with:
- overall_risk_level (low/medium/high)
- specific_risks: array of risk descriptions
- mitigation_recommendations: array of recommendations
- suggested_contract_terms: array of protective clauses
    `;

    try {
      const completion = await this.openai.chat.completions.create({
        model: config.ai.openai.model,
        messages: [
          {
            role: 'system',
            content: 'You are a smart contract risk analysis expert. Analyze invoice agreements for potential risks and provide mitigation recommendations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      });

      return JSON.parse(completion.choices[0].message.content || '{}');
    } catch (error: any) {
      this.logger.error('Risk analysis failed', { error });
      throw new Error(`Risk analysis failed: ${error.message}`);
    }
  }

  private buildParsingPrompt(description: string): string {
    return `
Parse the following invoice/project description and extract structured data:

DESCRIPTION:
${description}

EXTRACTION REQUIREMENTS:
1. Identify all parties involved (client, contractor, optional arbitrator)
2. Extract total amount and currency (convert to sBTC/STX if in USD)
3. Identify milestones with amounts, descriptions, and release conditions
4. Extract project scope and deliverables
5. Identify timelines and deadlines
6. Note any special conditions or requirements

OUTPUT FORMAT (JSON):
{
  "total_amount": number,
  "currency": "sBTC" | "STX" | "USD",
  "parties": {
    "client": "string (wallet address if specified)",
    "contractor": "string (wallet address if specified)",
    "arbitrator": "string (optional)"
  },
  "milestones": [
    {
      "sequence": number,
      "amount": number,
      "description": "string",
      "condition": "string",
      "due_date": "string (ISO format, optional)",
      "proof_required": boolean,
      "proof_type": "string (optional)"
    }
  ],
  "project_scope": "string",
  "timeline": {
    "start_date": "string (ISO format, optional)",
    "end_date": "string (ISO format, optional)",
    "duration_days": number
  }
}

IMPORTANT: If currency is USD, convert to sBTC using approximate rate of 1 sBTC = $0.01 (100 sats = $1)
    `;
  }

  private buildContractGenerationPrompt(
    invoiceData: AIParsedInvoice,
    templateType: string
  ): string {
    return `
Generate a Clarity smart contract for the following invoice agreement:

INVOICE DATA:
${JSON.stringify(invoiceData, null, 2)}

TEMPLATE TYPE: ${templateType}

REQUIREMENTS:
1. Use standard Clarity escrow pattern
2. Implement milestone-based payment releases
3. Include proper access control (client-only releases)
4. Add dispute resolution mechanism
5. Use sBTC token for payments if currency is sBTC
6. Include proper error handling with error codes
7. Add event emission for important state changes
8. Follow Clarity security best practices
9. Include time-locks for automatic releases if deadlines are missed

SPECIFIC IMPLEMENTATION DETAILS:
- Store total amount and milestone amounts in satoshis for sBTC
- Implement multi-sig approval if multiple approvers are needed
- Add automatic dispute escalation after timeout periods
- Include contract state tracking (initialized, funded, active, completed, disputed)

Generate the complete Clarity contract code with detailed comments.
    `;
  }

  private getSystemPrompt(task: string): string {
    const prompts: Record<string, string> = {
      invoice_parsing: `
You are an expert at parsing invoice and project descriptions. Extract structured data from natural language descriptions with high accuracy.

RULES:
1. Always return valid JSON in the specified format
2. Infer missing information with reasonable defaults
3. Convert all amounts to the specified currency
4. Identify implicit milestones and conditions
5. Flag any ambiguous terms for review
6. Default to mutual agreement dispute resolution if not specified
7. Use wallet address format starting with "SP" for Stacks addresses

VALIDATION:
- Ensure milestone amounts sum to total amount
- Verify timeline consistency
- Check for contradictory terms
- Validate currency conversions
      `,
      risk_analysis: `
You are a smart contract risk analysis expert. Analyze business agreements for potential risks in blockchain-based escrow contracts.

Focus on:
- Financial risks (payment structure, amounts)
- Operational risks (milestone definitions, conditions)
- Technical risks (smart contract vulnerabilities)
- Counterparty risks (reputation, capability)
- Legal risks (jurisdiction, enforceability)

Provide actionable recommendations for risk mitigation.
      `
    };

    return prompts[task] || prompts.invoice_parsing;
  }

  private getClaritySystemPrompt(): string {
    return `
You are an expert Clarity smart contract developer. Generate secure, efficient, and well-documented Clarity code.

CLARITY BEST PRACTICES:
1. Use descriptive variable and function names
2. Implement proper access control checks
3. Use checked responses for all external calls
4. Include comprehensive error handling
5. Emit events for important state changes
6. Follow the principle of least privilege
7. Use constants for magic numbers and error codes
8. Implement time-based security measures

SECURITY REQUIREMENTS:
- No reentrancy vulnerabilities (Clarity prevents this by design)
- Proper input validation
- Safe arithmetic operations
- Secure access patterns
- Clear state transition logic

Generate production-ready Clarity code that follows these standards.
    `;
  }

  private validateInvoiceData(data: any): AIParsedInvoice {
    // Implement comprehensive validation
    if (!data.total_amount || !data.currency) {
      throw new Error('Invalid invoice data: missing total_amount or currency');
    }

    if (!data.milestones || !Array.isArray(data.milestones)) {
      throw new Error('Invalid invoice data: milestones must be an array');
    }

    // Normalize currency
    if (data.currency === 'USD') {
      data.total_amount = data.total_amount * 100; // Convert to sats approximation
      data.currency = 'sBTC';
    }

    // Ensure milestone amounts sum to total
    const milestoneSum = data.milestones.reduce((sum: number, m: any) => sum + m.amount, 0);
    if (Math.abs(milestoneSum - data.total_amount) > 0.01) {
      throw new Error(`Milestone amounts (${milestoneSum}) do not match total amount (${data.total_amount})`);
    }

    return data as AIParsedInvoice;
  }

  private parseContractGenerationResponse(text: string): ContractGenerationResult {
    // Extract code from markdown code blocks if present
    let clarityCode = text;
    const codeBlockMatch = text.match(/```clarity\n([\s\S]*?)\n```/);
    if (codeBlockMatch) {
      clarityCode = codeBlockMatch[1];
    }

    // Parse metadata from comments or structured response
    const functions = this.extractFunctions(clarityCode);
    const securityChecks = this.analyzeSecurityFeatures(clarityCode);
    
    return {
      clarity_code: clarityCode,
      template_used: 'milestone_escrow',
      functions_generated: functions,
      security_checks: securityChecks,
      estimated_gas: this.estimateGasCost(clarityCode)
    };
  }

  private extractFunctions(code: string): string[] {
    const functionRegex = /define-public|define-private|define-read-only/g;
    const matches = code.match(functionRegex);
    return matches || [];
  }

  private analyzeSecurityFeatures(code: string): string[] {
    const checks: string[] = [];
    
    if (code.includes('asserts!')) checks.push('input_validation');
    if (code.includes('is-eq tx-sender')) checks.push('access_control');
    if (code.includes('try!')) checks.push('error_handling');
    if (code.includes('print {')) checks.push('event_emission');
    if (code.includes('contract-call?')) checks.push('external_call_checks');
    
    return checks;
  }

  private estimateGasCost(code: string): number {
    // Simple estimation based on code complexity
    const baseCost = 1000;
    const functionCost = (code.match(/define-public/g) || []).length * 200;
    const complexityCost = code.length / 100;
    
    return Math.ceil(baseCost + functionCost + complexityCost);
  }

  private async validateClarityCode(code: string): Promise<void> {
    // Basic syntax validation
    if (!code.includes('define-data-var') && !code.includes('define-map')) {
      throw new Error('Generated code missing data definitions');
    }
    
    if (!code.includes('define-public')) {
      throw new Error('Generated code missing public functions');
    }
    
    // Check for required functions
    const requiredFunctions = ['lock-funds', 'release-milestone'];
    const missingFunctions = requiredFunctions.filter(fn => !code.includes(fn));
    
    if (missingFunctions.length > 0) {
      throw new Error(`Missing required functions: ${missingFunctions.join(', ')}`);
    }
  }
}

