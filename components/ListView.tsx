import React from 'react';
import { Task, Employee, Company, TaskStatus, TaskPriority } from '../types';
import { EditIcon, TrashIcon, BellIcon } from './icons';
import EmptyState from './EmptyState';

const priorityClasses: Record<TaskPriority, string> = {
  [TaskPriority.High]: 'bg-red-500',
  [TaskPriority.Medium]: 'bg-yellow-500',
  [TaskPriority.Low]: 'bg-sky-500',
};

const statusClasses: Record<TaskStatus, string> = {
  [TaskStatus.ToDo]: 'bg-gray-500',
  [TaskStatus.InProgress]: 'bg-blue-500',
  [TaskStatus.Completed]: 'bg-green-500',
};

interface ListViewProps {
  tasks: Task[];
  employees: Employee[];
  companies: Company[];
  onViewTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: () => void;
}

const ListView: React.FC<ListViewProps> = ({ tasks, employees, companies, onViewTask, onDeleteTask, onAddTask }) => {
  
  if (tasks.length === 0) {
    return <EmptyState message="No tasks to display" actionText="Create a Task" onActionClick={onAddTask} />;
  }
  
  return (
    <div className="bg-white dark:bg-slate-850 rounded-lg shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-100 dark:bg-slate-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Title</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Company</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Assignee</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Deadline</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Priority</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Status</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {tasks.map((task) => {
              const assignee = employees.find(e => e.id === task.assigneeId);
              const company = companies.find(c => c.id === task.companyId);
              const isCompleted = task.status === TaskStatus.Completed;

              return (
                <tr key={task.id} onClick={() => onViewTask(task)} className={`hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-150 cursor-pointer ${isCompleted ? 'opacity-60' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${isCompleted ? 'text-gray-500 line-through' : 'text-slate-900 dark:text-white'}`}>{task.title}</span>
                      {task.reminderDateTime && (
                          <div title={`Reminder set for ${new Date(task.reminderDateTime).toLocaleString()}`}>
                              <BellIcon className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                          </div>
                      )}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-gray-400 max-w-xs truncate">{task.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-gray-400">{company?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-gray-400">{assignee?.name || 'Unassigned'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-gray-400">{new Date(task.deadline).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {task.status !== TaskStatus.Completed && (
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full text-white ${priorityClasses[task.priority]}`}>
                        {task.priority}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full text-white ${statusClasses[task.status]}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-3">
                       <button onClick={(e) => { e.stopPropagation(); onViewTask(task);}} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"><EditIcon className="w-5 h-5"/></button>
                       <button onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id);}} className="text-red-600 dark:text-red-500 hover:text-red-800 dark:hover:text-red-400"><TrashIcon className="w-5 h-5"/></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListView;
