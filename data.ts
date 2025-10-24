import { Company, Employee, Task, Role, TaskStatus, TaskPriority, EmployeeStatus, FinancialData } from './types';

export const initialCompanies: Company[] = [
  { id: 'comp-1', name: 'Innovate Inc.' },
  { id: 'comp-2', name: 'Synergy Solutions' },
  { id: 'comp-3', name: 'Apex Enterprises' },
];

export const initialEmployees: Employee[] = [
  { id: 'emp-1', name: 'Hossam Binqasim (CEO)', email: 'hs000m@gmail.com', password: '6005977', companyId: 'comp-1', role: Role.CEO, status: EmployeeStatus.Approved, canViewDashboard: true },
  { id: 'emp-2', name: 'Samantha Lee', email: 'samantha@innovate.inc', password: 'password123', companyId: 'comp-1', role: Role.Manager, status: EmployeeStatus.Approved },
  { id: 'emp-3', name: 'Michael Chen', email: 'michael@innovate.inc', password: 'password123', companyId: 'comp-1', role: Role.Employee, status: EmployeeStatus.Approved },
  { id: 'emp-4', name: 'Jessica Brown', email: 'jessica@synergy.sol', password: 'password123', companyId: 'comp-2', role: Role.Employee, status: EmployeeStatus.Approved },
  { id: 'emp-5', name: 'David Wilson', email: 'david@synergy.sol', password: 'password123', companyId: 'comp-2', role: Role.Employee, status: EmployeeStatus.Approved },
  { id: 'emp-6', name: 'Emily Taylor', email: 'emily@apex.ent', password: 'password123', companyId: 'comp-3', role: Role.Employee, status: EmployeeStatus.Approved },
];

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const nextWeek = new Date(today);
nextWeek.setDate(today.getDate() + 7);
const lastWeek = new Date(today);
lastWeek.setDate(today.getDate() - 7);


export const initialTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Develop Q3 Marketing Strategy',
    description: 'Finalize the marketing plan for the upcoming quarter, including budget allocation and channel focus.',
    companyId: 'comp-1',
    assigneeId: 'emp-2',
    creatorId: 'emp-1',
    deadline: nextWeek.toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    status: TaskStatus.InProgress,
    priority: TaskPriority.High,
  },
  {
    id: 'task-2',
    title: 'Onboard New Sales Team Members',
    description: 'Prepare training materials and schedule orientation sessions for the new hires.',
    companyId: 'comp-2',
    assigneeId: 'emp-4',
    creatorId: 'emp-1',
    deadline: today.toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    status: TaskStatus.ToDo,
    priority: TaskPriority.Medium,
  },
  {
    id: 'task-3',
    title: 'Website Redesign Mockups',
    description: 'Create high-fidelity mockups for the new company website homepage and product pages.',
    companyId: 'comp-1',
    assigneeId: 'emp-3',
    creatorId: 'emp-1',
    deadline: tomorrow.toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    status: TaskStatus.ToDo,
    priority: TaskPriority.High,
  },
  {
    id: 'task-4',
    title: 'Finalize Annual Financial Report',
    description: 'Review and approve the final draft of the annual financial report before submission.',
    companyId: 'comp-3',
    assigneeId: 'emp-6',
    creatorId: 'emp-1',
    deadline: lastWeek.toISOString().split('T')[0], // Overdue
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: TaskStatus.InProgress,
    priority: TaskPriority.High,
  },
    {
    id: 'task-5',
    title: 'Client Meeting Prep for Synergy',
    description: 'Gather all necessary documents and presentation materials for the big client pitch.',
    companyId: 'comp-2',
    assigneeId: 'emp-5',
    creatorId: 'emp-1',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: TaskStatus.ToDo,
    priority: TaskPriority.Medium,
  },
  {
    id: 'task-6',
    title: 'Code Review for New Feature',
    description: 'Perform a thorough code review for the alpha version of the new mobile app feature.',
    companyId: 'comp-1',
    assigneeId: 'emp-3',
    creatorId: 'emp-1',
    deadline: yesterday.toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: TaskStatus.Completed,
    priority: TaskPriority.Low,
  },
  {
    id: 'task-7',
    title: 'Organize Company Offsite Event',
    description: 'Plan logistics, venue, and activities for the annual company-wide offsite.',
    companyId: 'comp-3',
    assigneeId: 'emp-6',
    creatorId: 'emp-1',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    status: TaskStatus.ToDo,
    priority: TaskPriority.Medium,
  },
];

export const initialFinancials: FinancialData[] = [
    {
        companyId: 'comp-1',
        monthlyDataAsOf: 'YTD May 2024',
        monthlyDataLastUpdatedBy: 'emp-1',
        monthlyDataLastUpdatedAt: new Date(Date.now() - 15 * 24*60*60*1000).toISOString(),
        planRevenue: 12000000,
        actualRevenue: 10500000,
        planGrossProfit: 8000000,
        actualGrossProfit: 7800000,
        planEbitda: 4000000,
        actualEbitda: 4100000,
        planEbit: 3500000,
        actualEbit: 3600000,
        planNetIncome: 2500000,
        actualNetIncome: 2400000,
        cashBalance: 5300000,
        cashBalanceAsOfDate: new Date(Date.now() - 5 * 24*60*60*1000).toISOString().split('T')[0],
        cashBalanceLastUpdatedBy: 'emp-1',
        cashBalanceLastUpdatedAt: new Date(Date.now() - 5 * 24*60*60*1000).toISOString(),
    },
    {
        companyId: 'comp-2',
        monthlyDataAsOf: 'YTD May 2024',
        monthlyDataLastUpdatedBy: 'emp-1',
        monthlyDataLastUpdatedAt: new Date(Date.now() - 12 * 24*60*60*1000).toISOString(),
        planRevenue: 8000000,
        actualRevenue: 8500000,
        planGrossProfit: 5000000,
        actualGrossProfit: 5200000,
        planEbitda: 2000000,
        actualEbitda: 2300000,
        planEbit: 1800000,
        actualEbit: 2100000,
        planNetIncome: 1200000,
        actualNetIncome: 1500000,
        cashBalance: 3100000,
        cashBalanceAsOfDate: new Date(Date.now() - 2 * 24*60*60*1000).toISOString().split('T')[0],
        cashBalanceLastUpdatedBy: 'emp-1',
        cashBalanceLastUpdatedAt: new Date(Date.now() - 2 * 24*60*60*1000).toISOString(),
    },
    {
        companyId: 'comp-3',
        monthlyDataAsOf: 'YTD April 2024',
        monthlyDataLastUpdatedBy: 'emp-1',
        monthlyDataLastUpdatedAt: new Date(Date.now() - 35 * 24*60*60*1000).toISOString(),
        planRevenue: 5000000,
        actualRevenue: 4100000,
        planGrossProfit: 3000000,
        actualGrossProfit: 2500000,
        planEbitda: 1000000,
        actualEbitda: 800000,
        planEbit: 900000,
        actualEbit: 700000,
        planNetIncome: 600000,
        actualNetIncome: 450000,
        cashBalance: 1250000,
        cashBalanceAsOfDate: new Date(Date.now() - 10 * 24*60*60*1000).toISOString().split('T')[0],
        cashBalanceLastUpdatedBy: 'emp-1',
        cashBalanceLastUpdatedAt: new Date(Date.now() - 10 * 24*60*60*1000).toISOString(),
    }
];