import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    // Delete in correct order to respect foreign key constraints
    console.log('Clearing database...');
    
    // First delete Modules (they reference Account)
    await prisma.modules.deleteMany();
    console.log('✓ Cleared Modules table');
    
    // Then delete Profiles (they reference Account)
    await prisma.profile.deleteMany();
    console.log('✓ Cleared Profile table');
    
    // Finally delete Accounts
    await prisma.account.deleteMany();
    console.log('✓ Cleared Account table');
    
    console.log('Database cleared successfully!');
  } catch (error) {
    console.error('Error clearing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase(); 