import React from 'react';
import { Task, Company, Employee, TaskStatus, TaskPriority, Role } from '../types';
import Modal from './Modal';
// FIX: Import missing LoaderIcon.
import { EditIcon, TrashIcon, UserIcon, ClockIcon, AlertTriangleIcon, BellIcon, CheckCircleIcon, LoaderIcon } from './icons';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  task: Task | null;
  employees: Employee[];
  companies: Company[];
  currentUser: Employee;
}

const statusInfo: Record<TaskStatus, { icon: React.ReactNode, colors: string }> = {
    [TaskStatus.ToDo]: { icon: <ClockIcon className="w-5 h-5"/>, colors: 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-300' },
    [TaskStatus.InProgress]: { icon: <LoaderIcon className="w-5 h-5 animate-spin"/>, colors: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300' },
    [TaskStatus.Completed]: { icon: <CheckCircleIcon className="w-5 h-5"/>, colors: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300' },
};

const priorityInfo: Record<TaskPriority, { icon: React.ReactNode, colors: string }> = {
    [TaskPriority.Low]: { icon: <AlertTriangleIcon className="w-5 h-5"/>, colors: 'bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300' },
    [TaskPriority.Medium]: { icon: <AlertTriangleIcon className="w-5 h-5"/>, colors: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300' },
    [TaskPriority.High]: { icon: <AlertTriangleIcon className="w-5 h-5"/>, colors: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300' },
};

const DetailItem: React.FC<{label: string; children: React.ReactNode}> = ({ label, children }) => (
    <div>
        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</dt>
        <dd className="mt-1 text-sm text-slate-900 dark:text-white">{children}</dd>
    </div>
);


const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ isOpen, onClose, onEdit, onDelete, task, employees, companies, currentUser }) => {
  if (!task) return null;

  const assignee = employees.find(e => e.id === task.assigneeId);
  const company = companies.find(c => c.id === task.companyId);
  const creator = employees.find(e => e.id === task.creatorId);

  const canManageTask = currentUser.role === Role.CEO || 
                        currentUser.role === Role.Admin || 
                        (currentUser.role === Role.Manager && currentUser.companyId === task.companyId) || 
                        currentUser.id === task.assigneeId;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Task Details" size="lg">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-grow">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{task.title}</h2>
            <div className="mb-4">
                <span className={`inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium ${statusInfo[task.status].colors}`}>
                    {statusInfo[task.status].icon}
                    {task.status}
                </span>
            </div>
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Description</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 whitespace-pre-wrap">
                {task.description || 'No description provided.'}
            </p>
        </div>

        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-6">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
                 <dl className="space-y-4">
                    <DetailItem label="Assignee">
                        {assignee ? assignee.name : <span className="text-slate-500 italic">Unassigned</span>}
                    </DetailItem>
                    <DetailItem label="Company">{company?.name}</DetailItem>
                    <DetailItem label="Deadline">{new Date(task.deadline).toLocaleDateString()}</DetailItem>
                    <DetailItem label="Priority">
                        <span className={`inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium ${priorityInfo[task.priority].colors}`}>
                            {priorityInfo[task.priority].icon}
                            {task.priority}
                        </span>
                    </DetailItem>
                     {task.reminderDateTime && (
                        <DetailItem label="Reminder">
                           {new Date(task.reminderDateTime).toLocaleString()}
                        </DetailItem>
                    )}
                    <DetailItem label="Created By">
                        {creator ? `${creator.name} on ${new Date(task.createdAt).toLocaleDateString()}`: 'Unknown'}
                    </DetailItem>
                </dl>
            </div>
        </div>
      </div>
      {canManageTask && (
        <div className="pt-5 mt-5 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
          <button onClick={() => {onDelete(task.id)}} className="px-4 py-2 bg-red-600/10 text-red-700 dark:text-red-300 dark:bg-red-500/20 rounded-md hover:bg-red-600/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-white dark:focus:ring-offset-slate-850 flex items-center gap-2">
              <TrashIcon className="w-4 h-4"/> Delete
          </button>
          <button onClick={() => onEdit(task)} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-white dark:focus:ring-offset-slate-850 flex items-center gap-2">
              <EditIcon className="w-4 h-4" /> Edit Task
          </button>
        </div>
      )}
    </Modal>
  );
};

export default TaskDetailModal;