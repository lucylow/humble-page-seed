/**
 * Deployment script for BitMind Smart Invoice Backend
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const logger = require('../src/utils/logger');

const prisma = new PrismaClient();

async function checkEnvironment() {
  console.log('\n🔍 Checking environment configuration...\n');

  const required = [
    'DATABASE_URL',
    'STACKS_NODE_URL',
    'OPENAI_API_KEY',
    'PINATA_JWT'
  ];

  const missing = [];

  for (const env of required) {
    if (!process.env[env]) {
      missing.push(env);
      console.log(`❌ ${env}: Missing`);
    } else {
      console.log(`✅ ${env}: Configured`);
    }
  }

  if (missing.length > 0) {
    console.log('\n⚠️  Warning: Missing required environment variables:');
    missing.forEach(env => console.log(`   - ${env}`));
    console.log('\nPlease configure these in your .env file.\n');
    return false;
  }

  console.log('\n✅ All required environment variables configured\n');
  return true;
}

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...\n');

  try {
    await prisma.$connect();
    console.log('✅ Database connection successful\n');
    return true;
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    console.log('\nPlease check your DATABASE_URL configuration.\n');
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function testStacksConnection() {
  console.log('🔍 Testing Stacks blockchain connection...\n');

  try {
    const url = process.env.STACKS_NODE_URL;
    const response = await fetch(`${url}/v2/info`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Stacks connection successful');
    console.log(`   Network: ${data.network_id}`);
    console.log(`   Chain: ${data.stacks_tip_height}\n`);
    return true;
  } catch (error) {
    console.log('❌ Stacks connection failed:', error.message);
    console.log('\nPlease check your STACKS_NODE_URL configuration.\n');
    return false;
  }
}

async function testOpenAI() {
  console.log('🔍 Testing OpenAI connection...\n');

  try {
    const { OpenAI } = require('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 5
    });

    if (completion.choices && completion.choices.length > 0) {
      console.log('✅ OpenAI connection successful\n');
      return true;
    }
  } catch (error) {
    console.log('❌ OpenAI connection failed:', error.message);
    console.log('\nPlease check your OPENAI_API_KEY configuration.\n');
    return false;
  }
}

async function testPinata() {
  console.log('🔍 Testing Pinata IPFS connection...\n');

  try {
    const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
      headers: {
        'Authorization': `Bearer ${process.env.PINATA_JWT}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Pinata connection successful');
    console.log(`   Message: ${data.message}\n`);
    return true;
  } catch (error) {
    console.log('❌ Pinata connection failed:', error.message);
    console.log('\nPlease check your PINATA_JWT configuration.\n');
    return false;
  }
}

async function runDeploymentChecks() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║  BitMind Smart Invoice Deployment Check   ║');
  console.log('╚════════════════════════════════════════════╝\n');

  const checks = [
    { name: 'Environment Variables', fn: checkEnvironment },
    { name: 'Database Connection', fn: testDatabaseConnection },
    { name: 'Stacks Blockchain', fn: testStacksConnection },
    { name: 'OpenAI API', fn: testOpenAI },
    { name: 'Pinata IPFS', fn: testPinata }
  ];

  const results = [];

  for (const check of checks) {
    try {
      const result = await check.fn();
      results.push({ name: check.name, success: result });
    } catch (error) {
      console.log(`❌ ${check.name} check failed:`, error.message, '\n');
      results.push({ name: check.name, success: false });
    }
  }

  console.log('╔════════════════════════════════════════════╗');
  console.log('║           Deployment Summary               ║');
  console.log('╚════════════════════════════════════════════╝\n');

  results.forEach(r => {
    const icon = r.success ? '✅' : '❌';
    console.log(`${icon} ${r.name}`);
  });

  const allPassed = results.every(r => r.success);

  if (allPassed) {
    console.log('\n🎉 All checks passed! Ready for deployment.\n');
    console.log('To start the server, run:');
    console.log('   npm start\n');
  } else {
    console.log('\n⚠️  Some checks failed. Please fix the issues above before deploying.\n');
    process.exit(1);
  }
}

// Run deployment checks
runDeploymentChecks()
  .catch(error => {
    console.error('Deployment check failed:', error);
    process.exit(1);
  });

