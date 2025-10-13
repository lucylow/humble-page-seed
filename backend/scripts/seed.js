/**
 * Database seeding script
 * Creates sample data for testing
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding database...\n');

  try {
    // Create sample users
    const users = await Promise.all([
      prisma.user.upsert({
        where: { walletAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM' },
        update: {},
        create: {
          walletAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
          username: 'alice_dao',
          email: 'alice@example.com',
          role: 'USER'
        }
      }),
      prisma.user.upsert({
        where: { walletAddress: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG' },
        update: {},
        create: {
          walletAddress: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
          username: 'bob_contractor',
          email: 'bob@example.com',
          role: 'USER'
        }
      }),
      prisma.user.upsert({
        where: { walletAddress: 'ST3AM1A56AK2C1XAFJ4115ZSV26EB49BVQ10MGCS0' },
        update: {},
        create: {
          walletAddress: 'ST3AM1A56AK2C1XAFJ4115ZSV26EB49BVQ10MGCS0',
          username: 'charlie_arbitrator',
          email: 'charlie@example.com',
          role: 'ARBITRATOR'
        }
      })
    ]);

    console.log('✅ Created users:', users.map(u => u.username).join(', '));

    // Create sample invoice
    const invoice = await prisma.invoice.create({
      data: {
        description: 'Build a decentralized application on Stacks blockchain',
        projectScope: 'Full-stack development including smart contracts, frontend, and backend',
        clientAddress: users[0].walletAddress,
        contractorAddress: users[1].walletAddress,
        arbitratorAddress: users[2].walletAddress,
        creatorId: users[0].walletAddress,
        totalAmount: 5000,
        currency: 'sBTC',
        status: 'ACTIVE',
        milestones: {
          create: [
            {
              sequence: 1,
              title: 'Smart Contract Development',
              description: 'Develop and test Clarity smart contracts',
              amount: 2000,
              condition: 'Contracts deployed and tested on testnet',
              status: 'RELEASED',
              releasedAt: new Date()
            },
            {
              sequence: 2,
              title: 'Frontend Development',
              description: 'Build React frontend with Stacks.js integration',
              amount: 2000,
              condition: 'Frontend deployed and functional',
              status: 'APPROVED'
            },
            {
              sequence: 3,
              title: 'Backend API',
              description: 'Develop backend API and database',
              amount: 1000,
              condition: 'API endpoints working and documented',
              status: 'PENDING'
            }
          ]
        }
      },
      include: {
        milestones: true
      }
    });

    console.log('✅ Created invoice:', invoice.invoiceNumber);

    // Create sample notifications
    await prisma.notification.createMany({
      data: [
        {
          userId: users[0].walletAddress,
          invoiceId: invoice.id,
          type: 'INVOICE_CREATED',
          title: 'Invoice Created',
          message: 'Your invoice has been created successfully'
        },
        {
          userId: users[1].walletAddress,
          invoiceId: invoice.id,
          type: 'MILESTONE_RELEASED',
          title: 'Milestone Payment Released',
          message: 'Payment for milestone 1 has been released'
        }
      ]
    });

    console.log('✅ Created notifications');

    // Create sample transaction
    await prisma.transaction.create({
      data: {
        invoiceId: invoice.id,
        txId: '0x1234567890abcdef',
        txType: 'DEPLOYMENT',
        from: users[0].walletAddress,
        to: users[1].walletAddress,
        amount: 5000,
        currency: 'sBTC',
        status: 'CONFIRMED',
        confirmations: 6
      }
    });

    console.log('✅ Created transaction');

    console.log('\n✨ Seeding completed successfully!\n');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

