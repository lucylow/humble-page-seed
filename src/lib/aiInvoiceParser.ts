/**
 * AI Invoice Parser
 * Extracts structured invoice data from natural language text
 */

export interface InvoiceData {
  invoice_id: number;
  payee: string | null;
  payer: string | null;
  amount: number; // in base units (satoshis for BTC/sBTC)
  token_contract: string | null;
  arbiter: string | null;
  deadline: string | null; // ISO 8601 format
  milestone_description: string;
}

/**
 * System prompt for AI invoice extraction
 */
export const AI_SYSTEM_PROMPT = `You are an assistant that extracts structured invoice variables from free-form invoice text for an on-chain Clarity escrow contract. The output must be STRICT JSON only (no explanation, no prose). Validate and normalize dates to ISO 8601 (YYYY-MM-DD). Normalize monetary amounts to integers (in token base units). If currency symbol is BTC or sBTC assume 8 decimal places (multiply BTC value by 1e8 and output integer). For other currencies, assume 2 decimals and multiply by 100. If a field is missing, set it to null. Fields required: invoice_id (uint), payee (principal string, e.g., 'SP2...'), amount (integer in token base units), token_contract (principal string or null), arbiter (principal string or null), deadline (ISO date or null), milestone_description (string), payer (principal or null). Use the invoice text to infer reasonable invoice_id (prefer a numeric invoice number if present; else hash the invoice shortid as unsigned int). Output only valid JSON.`;

/**
 * Generate user prompt with invoice text
 */
export function generateUserPrompt(invoiceText: string): string {
  return `EXAMPLE:
Invoice text:
"Invoice #4592
To: alice.stacks
From: dao: ExampleDAO (treasury)
Amount: 0.125 sBTC for website redesign
Milestone: Deliver final static site + handover (due 2025-10-20)
Arbiter: arbiter.stacks"

Desired JSON output (example):
{
  "invoice_id": 4592,
  "payee": "alice.stacks",
  "payer": "SP3EXAMPLEDAO...", 
  "amount": 12500000,
  "token_contract": "SP000000000000000000002Q6VF78.sbtc-token",
  "arbiter": "arbiter.stacks",
  "deadline": "2025-10-20",
  "milestone_description": "Deliver final static site + handover"
}

NOW PROCESS:
Extract the variables from the following invoice text (do NOT include any extra text). Provide strict JSON only.

--- INVOICE START ---
${invoiceText}
--- INVOICE END ---`;
}

/**
 * Parse invoice using OpenAI API
 */
export async function parseInvoiceWithOpenAI(
  invoiceText: string,
  apiKey: string
): Promise<InvoiceData> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: AI_SYSTEM_PROMPT },
        { role: 'user', content: generateUserPrompt(invoiceText) },
      ],
      temperature: 0.1,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  try {
    const parsed = JSON.parse(content);
    return parsed as InvoiceData;
  } catch (error) {
    throw new Error('Failed to parse AI response as JSON');
  }
}

/**
 * Parse invoice using Anthropic Claude API
 */
export async function parseInvoiceWithClaude(
  invoiceText: string,
  apiKey: string
): Promise<InvoiceData> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      system: AI_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: generateUserPrompt(invoiceText),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.content[0].text;

  try {
    const parsed = JSON.parse(content);
    return parsed as InvoiceData;
  } catch (error) {
    throw new Error('Failed to parse AI response as JSON');
  }
}

/**
 * Parse invoice using local/custom API endpoint
 */
export async function parseInvoiceWithCustomAPI(
  invoiceText: string,
  apiEndpoint: string,
  apiKey?: string
): Promise<InvoiceData> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const response = await fetch(apiEndpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      system_prompt: AI_SYSTEM_PROMPT,
      user_prompt: generateUserPrompt(invoiceText),
    }),
  });

  if (!response.ok) {
    throw new Error(`Custom API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data as InvoiceData;
}

/**
 * Validate invoice data
 */
export function validateInvoiceData(data: InvoiceData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.invoice_id || data.invoice_id <= 0) {
    errors.push('invoice_id must be a positive integer');
  }

  if (!data.amount || data.amount <= 0) {
    errors.push('amount must be a positive integer');
  }

  if (data.deadline) {
    const deadlineDate = new Date(data.deadline);
    if (isNaN(deadlineDate.getTime())) {
      errors.push('deadline must be a valid ISO 8601 date');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Helper: Generate invoice ID from text (fallback if no ID in invoice)
 */
export function generateInvoiceIdFromText(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Helper: Convert ISO date to block height estimate (for deadline)
 * Stacks blocks are ~10 minutes apart
 */
export function isoDateToBlockHeight(isoDate: string, currentBlockHeight: number): number {
  const targetDate = new Date(isoDate);
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();
  const diffMinutes = diffMs / (1000 * 60);
  const blocksUntilDeadline = Math.floor(diffMinutes / 10); // ~10 min per block
  return currentBlockHeight + blocksUntilDeadline;
}

