#!/usr/bin/env node

/**
 * AI → Clarity Variable Mapper
 * Takes JSON output from AI invoice parser and generates Clarity contract deployment arguments
 * 
 * Usage:
 *   node scripts/ai-clarity-mapper.js <invoice-data.json>
 *   node scripts/ai-clarity-mapper.js --stdin < invoice-data.json
 */

const fs = require('fs');
const path = require('path');

// Default values
const DEFAULT_TOKEN_CONTRACT = 'SP000000000000000000002Q6VF78.sbtc-token';
const DEFAULT_ARBITER = 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7'; // Example arbiter

/**
 * Parse command-line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
AI → Clarity Variable Mapper

Usage:
  node scripts/ai-clarity-mapper.js <invoice-data.json>
  node scripts/ai-clarity-mapper.js --stdin < invoice-data.json

Options:
  --help, -h     Show this help message
  --stdin        Read JSON from stdin
  --format       Output format: 'json' (default) | 'clarity' | 'js'
  --output, -o   Output file (default: stdout)

Examples:
  # From file
  node scripts/ai-clarity-mapper.js invoice.json

  # From stdin
  echo '{"invoice_id":1,...}' | node scripts/ai-clarity-mapper.js --stdin

  # Generate Clarity function call
  node scripts/ai-clarity-mapper.js invoice.json --format clarity

  # Generate JavaScript array
  node scripts/ai-clarity-mapper.js invoice.json --format js
`);
    process.exit(0);
  }

  const config = {
    inputFile: null,
    useStdin: false,
    format: 'json',
    outputFile: null,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--stdin') {
      config.useStdin = true;
    } else if (arg === '--format') {
      config.format = args[++i];
    } else if (arg === '--output' || arg === '-o') {
      config.outputFile = args[++i];
    } else if (!arg.startsWith('--')) {
      config.inputFile = arg;
    }
  }

  return config;
}

/**
 * Read JSON data from file or stdin
 */
async function readInput(config) {
  if (config.useStdin) {
    return new Promise((resolve, reject) => {
      let data = '';
      process.stdin.on('data', chunk => data += chunk);
      process.stdin.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(new Error(`Failed to parse JSON from stdin: ${error.message}`));
        }
      });
      process.stdin.on('error', reject);
    });
  } else if (config.inputFile) {
    const filePath = path.resolve(config.inputFile);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
  } else {
    throw new Error('No input source specified. Use a file path or --stdin.');
  }
}

/**
 * Convert ISO date to Unix timestamp
 */
function isoToUnixTimestamp(isoDate) {
  if (!isoDate) return 99999999; // Far future default
  return Math.floor(new Date(isoDate).getTime() / 1000);
}

/**
 * Normalize principal address
 */
function normalizePrincipal(address) {
  if (!address) return null;
  // If it's already a principal format, return as-is
  if (address.startsWith('SP') || address.startsWith('ST')) {
    return address;
  }
  // If it's a name like "alice.stacks", would need BNS lookup (return as-is for now)
  return address;
}

/**
 * Map AI invoice data to Clarity contract arguments
 */
function mapToClarityArgs(invoiceData) {
  const invoiceId = invoiceData.invoice_id;
  const payee = normalizePrincipal(invoiceData.payee) || 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7';
  const amount = invoiceData.amount;
  const tokenContract = invoiceData.token_contract || DEFAULT_TOKEN_CONTRACT;
  const arbiter = normalizePrincipal(invoiceData.arbiter) || DEFAULT_ARBITER;
  const deadline = isoToUnixTimestamp(invoiceData.deadline);

  return {
    invoiceId,
    payee,
    amount,
    tokenContract,
    arbiter,
    deadline,
    milestoneDescription: invoiceData.milestone_description || '',
    payer: normalizePrincipal(invoiceData.payer) || null,
  };
}

/**
 * Format output based on requested format
 */
function formatOutput(clarityArgs, format) {
  switch (format) {
    case 'clarity':
      return `(contract-call? .escrow create-invoice
  u${clarityArgs.invoiceId}
  '${clarityArgs.payee}
  u${clarityArgs.amount}
  '${clarityArgs.tokenContract}
  '${clarityArgs.arbiter}
  u${clarityArgs.deadline})`;

    case 'js':
    case 'javascript':
      return `[
  uintCV(${clarityArgs.invoiceId}),
  standardPrincipalCV('${clarityArgs.payee}'),
  uintCV(${clarityArgs.amount}),
  standardPrincipalCV('${clarityArgs.tokenContract}'),
  standardPrincipalCV('${clarityArgs.arbiter}'),
  uintCV(${clarityArgs.deadline})
]`;

    case 'json':
    default:
      return JSON.stringify(clarityArgs, null, 2);
  }
}

/**
 * Write output to file or stdout
 */
function writeOutput(content, outputFile) {
  if (outputFile) {
    fs.writeFileSync(outputFile, content + '\n', 'utf8');
    console.error(`✅ Output written to ${outputFile}`);
  } else {
    console.log(content);
  }
}

/**
 * Main function
 */
async function main() {
  try {
    const config = parseArgs();
    const invoiceData = await readInput(config);
    
    console.error('📥 Invoice data received:');
    console.error(JSON.stringify(invoiceData, null, 2));
    console.error('');

    const clarityArgs = mapToClarityArgs(invoiceData);
    
    console.error('🔄 Mapped to Clarity arguments:');
    console.error(JSON.stringify(clarityArgs, null, 2));
    console.error('');

    const output = formatOutput(clarityArgs, config.format);
    
    console.error(`📤 Output (format: ${config.format}):`);
    console.error('─'.repeat(50));
    writeOutput(output, config.outputFile);

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { mapToClarityArgs, formatOutput, isoToUnixTimestamp, normalizePrincipal };

