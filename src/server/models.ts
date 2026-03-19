import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee' | 'superadmin';
  employeeId?: string;
  companyId?: string;
  currentCompanyId?: string;
  avatar?: string;
  lastLogin?: Date;
  password?: string;
}

const UserSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['admin', 'employee', 'superadmin'], required: true },
  employeeId: { type: String },
  companyId: { type: String },
  currentCompanyId: { type: String },
  avatar: { type: String },
  lastLogin: { type: Date },
  password: { type: String }
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', UserSchema);

export interface IEmployee extends Document {
  id: string;
  companyId: string;
  employeeId: string;
  name: string;
  email: string;
  mobile?: string;
  dob?: string;
  designation?: string;
  joiningDate?: string;
  status: 'Active' | 'Inactive' | 'Terminated' | 'Resigned';
  bloodGroup?: string;
  nationalId?: string;
  department?: string;
  employeeType?: string;
  location?: string;
  city?: string;
  username?: string;
  password?: string;
  salary?: number;
  taxDeduction?: number;
  bankName?: string;
  bankAccountNo?: string;
  modeOfPayment?: string;
  notifications?: string[];
  rewardPoints?: number;
  allowedMenus?: string[];
}

const EmployeeSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  companyId: { type: String, required: true },
  employeeId: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String },
  dob: { type: String },
  designation: { type: String },
  joiningDate: { type: String },
  status: { type: String, enum: ['Active', 'Inactive', 'Terminated', 'Resigned'], required: true },
  bloodGroup: { type: String },
  nationalId: { type: String },
  department: { type: String },
  employeeType: { type: String },
  location: { type: String },
  city: { type: String },
  username: { type: String },
  password: { type: String },
  salary: { type: Number },
  taxDeduction: { type: Number },
  bankName: { type: String },
  bankAccountNo: { type: String },
  modeOfPayment: { type: String },
  notifications: { type: [String], default: [] },
  rewardPoints: { type: Number, default: 0 },
  allowedMenus: { type: [String], default: [] }
}, { timestamps: true });

export const Employee = mongoose.model<IEmployee>('Employee', EmployeeSchema);

export interface IAuditLog extends Document {
  companyId: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  recordId?: string;
  description: string;
  timestamp: Date;
}

const AuditLogSchema: Schema = new Schema({
  companyId: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  action: { type: String, required: true },
  module: { type: String, required: true },
  recordId: { type: String },
  description: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export interface IGenericEntity extends Document {
  id: string;
  companyId: string;
  name: string;
  status?: string;
  [key: string]: any;
}

const GenericEntitySchema: Schema = new Schema({
  id: { type: String, required: true },
  companyId: { type: String, required: true },
  name: { type: String, required: true },
  status: { type: String }
}, { timestamps: true, strict: false });

export const GenericEntity = mongoose.model<IGenericEntity>('GenericEntity', GenericEntitySchema);

export interface ITimeTracking extends Document {
  companyId: string;
  employeeId: string;
  date: string;
  status: string;
  lastActive: number;
  idleTime?: number;
  workingTime?: number;
  screenshot?: string;
  captureInterval?: number;
}

const TimeTrackingSchema: Schema = new Schema({
  companyId: { type: String, required: true },
  employeeId: { type: String, required: true },
  date: { type: String, required: true },
  status: { type: String, required: true },
  lastActive: { type: Number, required: true },
  idleTime: { type: Number, default: 0 },
  workingTime: { type: Number, default: 0 },
  screenshot: { type: String },
  captureInterval: { type: Number }
}, { timestamps: true });

export const TimeTracking = mongoose.model<ITimeTracking>('TimeTracking', TimeTrackingSchema);
