const { OpenAI } = require('openai');
const logger = require('../utils/logger');

class AIInvoiceProcessor {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    this.promptTemplates = {
      invoice_parsing: `
Analyze this invoice description and extract structured data:

INVOICE DESCRIPTION: {description}

Extract the following:
- Total amount and currency
- Payment milestones with amounts and conditions
- Parties involved (client, contractor)
- Project deliverables
- Timeline and deadlines
- Dispute resolution preferences

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "total_amount": number,
  "currency": "USD" | "sBTC" | "STX",
  "parties": {
    "client": string,
    "contractor": string
  },
  "milestones": [
    {
      "sequence": number,
      "amount": number,
      "title": string,
      "description": string,
      "condition": string,
      "due_date": "YYYY-MM-DD" or null
    }
  ],
  "arbitrator": string,
  "project_scope": string
}
      `,
      
      clarity_generation: `
Generate a Clarity smart contract for an invoice escrow system with the following specifications:

INVOICE DATA: {invoiceData}

Requirements:
1. Implement milestone-based payment releases
2. Include dispute resolution mechanism
3. Support refunds if project cancelled
4. Include arbitrator functionality
5. Use sBTC for payments
6. Implement time-lock mechanisms for milestones

Return ONLY the Clarity contract code without any markdown formatting or explanations.
      `
    };
  }

  /**
   * Parse natural language invoice description into structured data
   * @param {string} description - Natural language invoice description
   * @returns {Promise<Object>} Structured invoice data
   */
  async parseInvoiceDescription(description) {
    try {
      logger.info('Starting AI invoice parsing', { descriptionLength: description.length });

      const completion = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert at parsing invoice descriptions and converting them to structured contract data. Always respond with valid JSON only, no markdown formatting."
          },
          {
            role: "user",
            content: this.promptTemplates.invoice_parsing.replace('{description}', description)
          }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" }
      });

      const content = completion.choices[0].message.content;
      const parsedData = JSON.parse(content);
      
      logger.info('AI parsing successful', { parsedData });

      // Convert currency to sBTC if needed
      if (parsedData.currency === 'USD') {
        parsedData.total_amount = await this.convertToSats(parsedData.total_amount);
        parsedData.currency = 'sBTC';
      }

      return this.validateInvoiceData(parsedData);
    } catch (error) {
      logger.error('AI processing failed', { error: error.message, stack: error.stack });
      throw new Error(`AI processing failed: ${error.message}`);
    }
  }

  /**
   * Generate Clarity smart contract code based on invoice data
   * @param {Object} invoiceData - Structured invoice data
   * @returns {Promise<string>} Generated Clarity contract code
   */
  async generateClarityCode(invoiceData) {
    try {
      logger.info('Generating Clarity contract', { invoiceData });

      const completion = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert Clarity smart contract developer for the Stacks blockchain. Generate production-ready, secure Clarity code."
          },
          {
            role: "user",
            content: this.promptTemplates.clarity_generation.replace(
              '{invoiceData}',
              JSON.stringify(invoiceData, null, 2)
            )
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      });

      const clarityCode = completion.choices[0].message.content
        .replace(/```clarity\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      logger.info('Clarity contract generated successfully');
      
      return clarityCode;
    } catch (error) {
      logger.error('Clarity generation failed', { error: error.message, stack: error.stack });
      throw new Error(`Clarity generation failed: ${error.message}`);
    }
  }

  /**
   * Convert USD to satoshis using current BTC price
   * @param {number} usdAmount - Amount in USD
   * @returns {Promise<number>} Amount in satoshis
   */
  async convertToSats(usdAmount) {
    try {
      // Fetch current BTC price from CoinGecko
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch BTC price');
      }

      const data = await response.json();
      const btcPrice = data.bitcoin.usd;
      
      // Convert USD to BTC, then to satoshis (1 BTC = 100,000,000 sats)
      const btcAmount = usdAmount / btcPrice;
      const satsAmount = Math.floor(btcAmount * 100000000);
      
      logger.info('Currency conversion', { usdAmount, btcPrice, satsAmount });
      
      return satsAmount;
    } catch (error) {
      logger.warn('Currency conversion failed, using default rate', { error: error.message });
      // Fallback: assume 1 BTC = $50,000
      const defaultBtcPrice = 50000;
      return Math.floor((usdAmount / defaultBtcPrice) * 100000000);
    }
  }

  /**
   * Validate parsed invoice data
   * @param {Object} data - Parsed invoice data
   * @returns {Object} Validated data
   */
  validateInvoiceData(data) {
    const required = ['total_amount', 'currency', 'parties', 'milestones', 'project_scope'];
    
    for (const field of required) {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    if (!data.parties.client || !data.parties.contractor) {
      throw new Error('Client and contractor information required');
    }

    if (!Array.isArray(data.milestones) || data.milestones.length === 0) {
      throw new Error('At least one milestone is required');
    }

    // Validate milestone amounts sum to total
    const milestoneSum = data.milestones.reduce((sum, m) => sum + m.amount, 0);
    if (Math.abs(milestoneSum - data.total_amount) > 1) { // Allow 1 sat difference for rounding
      throw new Error('Milestone amounts must sum to total amount');
    }

    return data;
  }

  /**
   * Generate AI-powered invoice suggestions
   * @param {Object} partialData - Partial invoice data
   * @returns {Promise<Object>} Suggested improvements
   */
  async generateSuggestions(partialData) {
    try {
      const completion = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert at improving invoice contracts. Provide suggestions for clarity, fairness, and completeness."
          },
          {
            role: "user",
            content: `Review this invoice data and suggest improvements:\n${JSON.stringify(partialData, null, 2)}`
          }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      });

      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      logger.error('Suggestion generation failed', { error: error.message });
      throw new Error(`Suggestion generation failed: ${error.message}`);
    }
  }
}

module.exports = AIInvoiceProcessor;

