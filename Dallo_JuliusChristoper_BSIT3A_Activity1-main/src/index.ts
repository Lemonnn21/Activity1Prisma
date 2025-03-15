import { PrismaClient } from '@prisma/client';
import chalk from 'chalk';

const prisma = new PrismaClient();

// Type definitions
type AccountWithRelations = {
  id: number;
  email: string;
  username: string;
  password: string;
  createdAt: Date;
  updateAt: Date;
  profile: {
    id: number;
    userId: number;
    firstname: string;
    middlename: string | null;
    lastname: string;
    suffix: string | null;
    bio: string | null;
    picture: string | null;
    createdAt: Date;
    updateAt: Date;
  } | null;
  modules: {
    recID: number;
    accountCode: number;
    moduleCode: string;
    moduleDetails: string;
    moduleDesc: string;
    createdAt: Date;
    updateAt: Date;
  }[];
};

type FormattedAccount = {
  accountDetails: {
    id: number;
    email: string;
    username: string;
    password: string;
    createdAt: Date;
    updateAt: Date;
  };
  profile: {
    id: number;
    userId: number;
    firstname: string;
    middlename: string | null;
    lastname: string;
    suffix: string | null;
    bio: string | null;
    picture: string | null;
    createdAt: Date;
    updateAt: Date;
  } | null;
  modules: {
    id: number;
    accountCode: number;
    code: string;
    details: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
};

// Helper function to format date
function formatDate(date: Date): string {
  return date.toLocaleString();
}

// Helper function to print a labeled field
function printField(color: chalk.Chalk, label: string, value: any, prefix: string = '├─', indent: string = '') {
  console.log(color(`${indent}${prefix} ${label}: `) + value);
}

// Helper function to print section header
function printSectionHeader(emoji: string, title: string, color: chalk.Chalk) {
  console.log(color.bold(`\n${emoji} ${title}`));
}

// Helper function to print colored account details
function printColoredAccountDetails(accounts: FormattedAccount[]) {
  accounts.forEach((account, index) => {
    // Header
    const headerLine = '═'.repeat(45);
    console.log('\n' + chalk.bold.cyan(headerLine));
    console.log(chalk.bold.cyan(`📋 ACCOUNT #${index + 1}`));
    console.log(chalk.bold.cyan(headerLine));
    
    // Account Details
    printSectionHeader('🔑', 'Account Details', chalk.yellow);
    printField(chalk.yellow, 'ID', account.accountDetails.id);
    printField(chalk.yellow, 'Email', account.accountDetails.email);
    printField(chalk.yellow, 'Username', account.accountDetails.username);
    printField(chalk.yellow, 'Password', account.accountDetails.password);
    printField(chalk.yellow, 'Created', formatDate(account.accountDetails.createdAt));
    printField(chalk.yellow, 'Updated', formatDate(account.accountDetails.updateAt), '└─');

    // Profile Details
    if (account.profile) {
      printSectionHeader('👤', 'Profile Information', chalk.green);
      printField(chalk.green, 'ID', account.profile.id);
      printField(chalk.green, 'User ID', account.profile.userId);
      printField(chalk.green, 'First Name', account.profile.firstname);
      if (account.profile.middlename) {
        printField(chalk.green, 'Middle Name', account.profile.middlename);
      }
      printField(chalk.green, 'Last Name', account.profile.lastname);
      if (account.profile.suffix) {
        printField(chalk.green, 'Suffix', account.profile.suffix);
      }
      if (account.profile.bio) {
        printField(chalk.green, 'Bio', account.profile.bio);
      }
      if (account.profile.picture) {
        printField(chalk.green, 'Picture', account.profile.picture);
      }
      printField(chalk.green, 'Created', formatDate(account.profile.createdAt));
      printField(chalk.green, 'Updated', formatDate(account.profile.updateAt), '└─');
    }

    // Modules
    if (account.modules.length > 0) {
      printSectionHeader('📚', 'Modules', chalk.magenta);
      account.modules.forEach((module, moduleIndex) => {
        const isLast = moduleIndex === account.modules.length - 1;
        const modulePrefix = isLast ? '└─' : '├─';
        const indent = '   ';
        
        console.log(chalk.magenta(`${modulePrefix} Module ${moduleIndex + 1}:`));
        printField(chalk.magenta, 'Record ID', module.id, '├─', indent);
        printField(chalk.magenta, 'Account Code', module.accountCode, '├─', indent);
        printField(chalk.magenta, 'Code', module.code, '├─', indent);
        printField(chalk.magenta, 'Details', module.details, '├─', indent);
        printField(chalk.magenta, 'Description', module.description, '├─', indent);
        printField(chalk.magenta, 'Created', formatDate(module.createdAt), '├─', indent);
        printField(chalk.magenta, 'Updated', formatDate(module.updatedAt), '└─', indent);
        
        if (!isLast) {
          console.log(chalk.magenta(`${indent}│`));
        }
      });
    } else {
      console.log(chalk.red('\n❌ No modules assigned'));
    }
  });
}

// 1. Create Account with Profile
async function createAccountWithProfile(accountData: any, profileData: any) {
  try {
    const account = await prisma.account.create({
      data: {
        email: accountData.email,
        username: accountData.username,
        password: accountData.password,
        profile: {
          create: {
            firstname: profileData.firstname,
            lastname: profileData.lastname,
            middlename: profileData.middlename,
            suffix: profileData.suffix,
            bio: profileData.bio,
            picture: profileData.picture
          }
        }
      }
    });
    return account;
  } catch (error) {
    throw error;
  }
}

// 2. Add Module to Existing Account
async function addModuleToAccount(accountId: number, moduleData: any) {
  try {
    const module = await prisma.modules.create({
      data: {
        ...moduleData,
        accountCode: accountId,
      },
    });
    console.log(chalk.green(`✓ Module '${moduleData.moduleCode}' added successfully`));
    return module;
  } catch (error) {
    console.error(chalk.red('✖ Error adding module:'), error);
    throw error;
  }
}

// 3. Fetch Accounts with Profiles and Modules
async function fetchAccountsWithDetails() {
  try {
    const accounts = await prisma.account.findMany({
      include: {
        profile: {
          select: {
            id: true,
            userId: true,
            firstname: true,
            middlename: true,
            lastname: true,
            suffix: true,
            bio: true,
            picture: true,
            createdAt: true,
            updateAt: true
          }
        },
        modules: {
          select: {
            recID: true,
            accountCode: true,
            moduleCode: true,
            moduleDetails: true,
            moduleDesc: true,
            createdAt: true,
            updateAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    }) as unknown as AccountWithRelations[];
    
    // Format the output for better readability
    const formattedAccounts: FormattedAccount[] = accounts.map((account) => ({
      accountDetails: {
        id: account.id,
        email: account.email,
        username: account.username,
        password: account.password,
        createdAt: account.createdAt,
        updateAt: account.updateAt
      },
      profile: account.profile ? {
        id: account.profile.id,
        userId: account.profile.userId,
        firstname: account.profile.firstname,
        middlename: account.profile.middlename,
        lastname: account.profile.lastname,
        suffix: account.profile.suffix,
        bio: account.profile.bio,
        picture: account.profile.picture,
        createdAt: account.profile.createdAt,
        updateAt: account.profile.updateAt
      } : null,
      modules: account.modules.map((module) => ({
        id: module.recID,
        accountCode: module.accountCode,
        code: module.moduleCode,
        details: module.moduleDetails,
        description: module.moduleDesc,
        createdAt: module.createdAt,
        updatedAt: module.updateAt
      }))
    }));
    
    // Print colored output
    printColoredAccountDetails(formattedAccounts);
    return formattedAccounts;
  } catch (error) {
    console.error(chalk.red('Error fetching accounts:'), error);
    throw error;
  }
}

// Example usage
async function main() {
  // Create an account with profile
  const accountData = {
    email: 'juliusdallo520@gmail.com',
    username: 'JuliusDallo',
    password: 'Aa12345',
  };

  const profileData = {
    firstname: 'Julius Dallo',
    lastname: 'Dallo',
    middlename: 'Obedoza',
    suffix: 'II',
    bio: 'I love technology',
    picture: 'https://example.com/profile-picture.jpg'
  };

  const account = await createAccountWithProfile(accountData, profileData);

  // Add multiple modules to the account
  const moduleData1 = {
    moduleCode: 'MOD101',
    moduleDetails: 'Introduction to Programming',
    moduleDesc: 'Basic programming concepts and syntax',
  };

  const moduleData2 = {
    moduleCode: 'MOD102',
    moduleDetails: 'Web Development Fundamentals',
    moduleDesc: 'HTML, CSS, and JavaScript basics',
  };

  const moduleData3 = {
    moduleCode: 'MOD103',
    moduleDetails: 'Database Management',
    moduleDesc: 'SQL and database design principles',
  };

  await addModuleToAccount(account.id, moduleData1);
  await addModuleToAccount(account.id, moduleData2);
  await addModuleToAccount(account.id, moduleData3);

  // Fetch all accounts with their details
  await fetchAccountsWithDetails();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
