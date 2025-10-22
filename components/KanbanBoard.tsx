import React, { useState } from 'react';
import { Task, Employee, TaskStatus, TaskPriority, Company } from '../types';
import { EditIcon, TrashIcon, BellIcon } from './icons';
import EmptyState from './EmptyState';

const priorityColors: Record<TaskPriority, string> = {
  [TaskPriority.High]: 'border-l-red-500',
  [TaskPriority.Medium]: 'border-l-yellow-500',
  [TaskPriority.Low]: 'border-l-blue-500',
};

const priorityBadgeColors: Record<TaskPriority, string> = {
  [TaskPriority.High]: 'bg-red-100 text-red-800 ring-1 ring-inset ring-red-200 dark:bg-red-500/20 dark:text-red-300 dark:ring-red-500/30',
  [TaskPriority.Medium]: 'bg-yellow-100 text-yellow-800 ring-1 ring-inset ring-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-300 dark:ring-yellow-500/30',
  [TaskPriority.Low]: 'bg-blue-100 text-blue-800 ring-1 ring-inset ring-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:ring-blue-500/30',
};
const completedBadgeColor = 'bg-green-100 text-green-800 ring-1 ring-inset ring-green-200 dark:bg-green-500/20 dark:text-green-300 dark:ring-green-500/30';

interface KanbanCardProps {
  task: Task;
  employees: Employee[];
  companies: Company[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ task, employees, companies, onEdit, onDelete, onDragStart }) => {
  const assignee = employees.find(e => e.id === task.assigneeId);
  const company = companies.find(c => c.id === task.companyId);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      className={`bg-white dark:bg-slate-800 p-3 rounded-lg shadow-md mb-3 cursor-grab active:cursor-grabbing border-l-4 ${task.status === TaskStatus.Completed ? 'border-l-green-500' : priorityColors[task.priority]} transition-shadow duration-200 hover:shadow-lg hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/30`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2 flex-1 pr-2">
            <h4 className="font-semibold text-slate-800 dark:text-gray-100">{task.title}</h4>
            {task.reminderDateTime && (
                <div title={`Reminder set for ${new Date(task.reminderDateTime).toLocaleString()}`}>
                    <BellIcon className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                </div>
            )}
        </div>
        <div className="flex items-center space-x-1 flex-shrink-0">
          <button onClick={() => onEdit(task)} className="text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><EditIcon className="w-4 h-4" /></button>
          <button onClick={() => onDelete(task.id)} className="text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><TrashIcon className="w-4 h-4" /></button>
        </div>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{company?.name}</p>
      <div className="flex items-center gap-2 mb-3">
        {task.status === TaskStatus.Completed ? (
            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${completedBadgeColor}`}>
                Completed
            </span>
        ) : (
            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${priorityBadgeColors[task.priority]}`}>
                {task.priority}
            </span>
        )}
      </div>
      <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
        <span>{assignee?.name || 'Unassigned'}</span>
        <span>{new Date(task.deadline).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  employees: Employee[];
  companies: Company[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, status: TaskStatus) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ status, tasks, employees, companies, onEdit, onDelete, onDragStart, onDrop }) => {
    const [isOver, setIsOver] = useState(false);
  
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsOver(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsOver(false);
    }
  
    return (
      <div 
        className={`bg-slate-100 dark:bg-slate-900/50 rounded-lg p-4 w-full md:w-96 flex-shrink-0 transition-colors duration-300 ${isOver ? 'bg-indigo-200/50 dark:bg-indigo-900/30' : ''}`}
        onDrop={(e) => {onDrop(e, status); setIsOver(false);}}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-white pb-2 border-b-2 border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <span>{status}</span>
          <span className="text-sm font-normal bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full px-2 py-0.5">{tasks.length}</span>
        </h3>
        <div className="space-y-3 h-[calc(100vh-20rem)] overflow-y-auto pr-1">
          {tasks.length > 0 ? tasks.map(task => (
            <KanbanCard key={task.id} task={task} employees={employees} companies={companies} onEdit={onEdit} onDelete={onDelete} onDragStart={onDragStart} />
          )) : <p className="text-slate-500 text-sm p-4 text-center">No tasks here.</p>}
        </div>
      </div>
    );
};

interface KanbanBoardProps {
  tasks: Task[];
  employees: Employee[];
  companies: Company[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onAddTask: () => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, employees, companies, onEditTask, onDeleteTask, onUpdateTaskStatus, onAddTask }) => {
  const onDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: TaskStatus) => {
    const taskId = e.dataTransfer.getData("taskId");
    onUpdateTaskStatus(taskId, newStatus);
  };
  
  if (tasks.length === 0) {
    return <div className="p-4"><EmptyState message="No tasks to display" actionText="Create First Task" onActionClick={onAddTask}/></div>
  }

  const columns: TaskStatus[] = [TaskStatus.ToDo, TaskStatus.InProgress, TaskStatus.Completed];

  return (
    <div className="flex flex-col md:flex-row gap-6 p-4 overflow-x-auto">
      {columns.map(status => (
        <KanbanColumn
          key={status}
          status={status}
          tasks={tasks.filter(t => t.status === status)}
          employees={employees}
          companies={companies}
          onEdit={onEditTask}
          onDelete={onDeleteTask}
          onDragStart={onDragStart}
          onDrop={onDrop}
        />
      ))}
    </div>
  );
};

export default KanbanBoard;
