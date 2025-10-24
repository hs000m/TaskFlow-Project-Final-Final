export enum Role {
  CEO = 'CEO',
  Admin = 'Admin',
  Manager = 'Manager',
  Employee = 'Employee',
}

export enum TaskStatus {
  ToDo = 'To-Do',
  InProgress = 'In Progress',
  Completed = 'Completed',
}

export enum TaskPriority {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

export enum View {
  Kanban = 'Kanban',
  List = 'List',
  Calendar = 'Calendar',
}

export enum SortBy {
    CreationDate = 'Creation Date',
    Deadline = 'Deadline',
    Priority = 'Priority',
}

export enum EmployeeStatus {
  PendingVerification = 'Pending Verification',
  Pending = 'Pending',
  Approved = 'Approved',
}

export interface Company {
  id: string;
  name: string;
}

export interface Employee {
  id:string;
  name: string;
  email: string;
  password?: string; // Optional for existing data, required for new users
  companyId: string;
  role: Role;
  status: EmployeeStatus;
  verificationToken?: string;
  canViewDashboard?: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  companyId: string;
  assigneeId: string;
  creatorId: string;
  deadline: string; // ISO date string
  createdAt: string; // ISO date string
  status: TaskStatus;
  priority: TaskPriority;
  reminderDateTime?: string; // ISO datetime string
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
}

export interface SharedFile {
  id: string;
  name: string;
  type: string; // MIME type
  size: number; // in bytes
  dataUrl: string; // base64 encoded file content
  uploadedAt: string; // ISO date string
  uploaderId: string;
  folderId: string | null;
}

export interface FinancialData {
  companyId: string;
  
  // Monthly P&L Data
  monthlyDataAsOf: string; // e.g., "YTD June"
  monthlyDataLastUpdatedBy: string; // employeeId
  monthlyDataLastUpdatedAt: string; // ISO date string
  planRevenue: number;
  actualRevenue: number;
  planGrossProfit: number;
  actualGrossProfit: number;
  planEbitda: number;
  actualEbitda: number;
  planEbit: number;
  actualEbit: number;
  planNetIncome: number;
  actualNetIncome: number;
  
  // Weekly Cash Data
  cashBalance: number;
  cashBalanceAsOfDate: string; // ISO date string
  cashBalanceLastUpdatedBy: string; // employeeId
  cashBalanceLastUpdatedAt: string; // ISO date string
}