import { Company, Employee, Task, Role, TaskStatus, TaskPriority, EmployeeStatus } from './types';

export const initialCompanies: Company[] = [
  { id: 'comp-1', name: 'Innovate Inc.' },
  { id: 'comp-2', name: 'Synergy Solutions' },
  { id: 'comp-3', name: 'Apex Enterprises' },
];

export const initialEmployees: Employee[] = [
  { id: 'emp-1', name: 'Hossam Binqasim (CEO)', email: 'hs000m@gmail.com', password: '6005977', companyId: 'comp-1', role: Role.CEO, status: EmployeeStatus.Approved },
  { id: 'emp-2', name: 'Samantha Lee', email: 'samantha@innovate.inc', password: 'password123', companyId: 'comp-1', role: Role.Employee, status: EmployeeStatus.Approved },
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
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    status: TaskStatus.ToDo,
    priority: TaskPriority.Medium,
  },
];
