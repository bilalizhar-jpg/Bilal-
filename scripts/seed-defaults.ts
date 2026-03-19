/**
 * Seed default company, users, and employees.
 * Run: npm run seed
 * Uses MONGODB_URI from env (default: mongodb://localhost:27017/hrms).
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, Employee, GenericEntity } from '../src/server/models.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hrms';

const DEFAULT_COMPANY_ID = 'default_company';

const defaultCompany = {
  id: DEFAULT_COMPANY_ID,
  companyId: DEFAULT_COMPANY_ID,
  name: 'Default Company',
  email: 'admin@default.com',
  mobile: '+1234567890',
  address: '123 Main St',
  status: 'active',
  subscriptionPlan: 'Basic',
  uniqueCode: 'DEFAULT01',
  blockedMenus: [] as string[],
  isActive: true,
  adminUsername: 'admin',
  adminPassword: 'admin123',
  website: 'https://default.example.com',
};

const defaultUsers = [
  {
    id: 'superadmin',
    name: 'Super Admin',
    email: 'superadmin@example.com',
    role: 'superadmin' as const,
  },
  {
    id: 'admin-default',
    name: 'Company Admin',
    email: 'admin@default.com',
    role: 'admin' as const,
    companyId: DEFAULT_COMPANY_ID,
    currentCompanyId: DEFAULT_COMPANY_ID,
  },
];

const defaultEmployees = [
  {
    id: 'emp-001',
    companyId: DEFAULT_COMPANY_ID,
    employeeId: 'EMP001',
    name: 'John Doe',
    email: 'john.doe@default.com',
    mobile: '+1234567891',
    designation: 'Software Engineer',
    department: 'Engineering',
    joiningDate: new Date().toISOString().split('T')[0],
    status: 'Active' as const,
    username: 'johndoe',
    password: 'employee1',
  },
  {
    id: 'emp-002',
    companyId: DEFAULT_COMPANY_ID,
    employeeId: 'EMP002',
    name: 'Jane Smith',
    email: 'jane.smith@default.com',
    mobile: '+1234567892',
    designation: 'HR Manager',
    department: 'Human Resources',
    joiningDate: new Date().toISOString().split('T')[0],
    status: 'Active' as const,
    username: 'janesmith',
    password: 'employee2',
  },
  {
    id: 'emp-003',
    companyId: DEFAULT_COMPANY_ID,
    employeeId: 'EMP003',
    name: 'Bob Wilson',
    email: 'bob.wilson@default.com',
    mobile: '+1234567893',
    designation: 'Accountant',
    department: 'Finance',
    joiningDate: new Date().toISOString().split('T')[0],
    status: 'Active' as const,
    username: 'bobwilson',
    password: 'employee3',
  },
];

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.');

  // 1. Default company (GenericEntity with collectionName 'companies')
  const companyExists = await GenericEntity.findOne({
    collectionName: 'companies',
    id: DEFAULT_COMPANY_ID,
  }).exec();

  if (companyExists) {
    console.log('Default company already exists, skipping.');
  } else {
    await GenericEntity.create({
      ...defaultCompany,
      collectionName: 'companies',
    });
    console.log('Created default company:', defaultCompany.name);
    console.log('  -> Admin login: username =', defaultCompany.adminUsername, ', password =', defaultCompany.adminPassword);
  }

  // 2. Users
  for (const u of defaultUsers) {
    const existing = await User.findOne({ id: u.id }).exec();
    if (existing) {
      console.log('User already exists:', u.email);
    } else {
      await User.create(u);
      console.log('Created user:', u.email, `(${u.role})`);
    }
  }

  // 3. Employees
  for (const e of defaultEmployees) {
    const existing = await Employee.findOne({ id: e.id }).exec();
    if (existing) {
      console.log('Employee already exists:', e.email);
    } else {
      await Employee.create(e);
      console.log('Created employee:', e.name, '| login:', e.username, '/', e.password);
    }
  }

  console.log('\nSeed complete.');
  console.log('\nLogin credentials:');
  console.log('  Company Admin: username = admin, password = admin123');
  console.log('  Employees: johndoe/employee1, janesmith/employee2, bobwilson/employee3');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
