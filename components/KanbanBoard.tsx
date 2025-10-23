import React, { useState } from 'react';
import { Task, Employee, TaskStatus, TaskPriority, Company } from '../types';
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
  onView: (task: Task) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ task, employees, companies, onView, onDragStart }) => {
  const assignee = employees.find(e => e.id === task.assigneeId);
  const company = companies.find(c => c.id === task.companyId);
  const isCompleted = task.status === TaskStatus.Completed;

  return (
    <div
      draggable
      onClick={() => onView(task)}
      onDragStart={(e) => onDragStart(e, task.id)}
      className={`bg-white dark:bg-slate-800 p-3 rounded-lg shadow-md mb-3 cursor-pointer active:cursor-grabbing border-l-4 ${isCompleted ? 'border-l-green-500 opacity-60' : priorityColors[task.priority]} transition-all duration-150 hover:shadow-lg hover:bg-slate-50 dark:hover:bg-slate-700 hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/30`}
    >
      <h4 className={`font-semibold text-slate-800 dark:text-gray-100 mb-2 ${isCompleted ? 'line-through' : ''}`}>{task.title}</h4>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{company?.name}</p>
      <div className="flex items-center gap-2 mb-3">
        {isCompleted ? (
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
  onView: (task: Task) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, status: TaskStatus) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ status, tasks, employees, companies, onView, onDragStart, onDrop }) => {
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
        className={`bg-slate-100 dark:bg-slate-850 rounded-lg p-4 flex flex-col flex-1 transition-colors duration-300 ${isOver ? 'bg-indigo-200/50 dark:bg-indigo-900/30' : ''}`}
        onDrop={(e) => {onDrop(e, status); setIsOver(false);}}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-white pb-2 border-b-2 border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0">
          <span>{status}</span>
          <span className="text-sm font-normal bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full px-2 py-0.5">{tasks.length}</span>
        </h3>
        <div className="flex-grow overflow-y-auto pr-1 -mr-1 custom-scrollbar">
          {tasks.length > 0 ? tasks.map(task => (
            <KanbanCard key={task.id} task={task} employees={employees} companies={companies} onView={onView} onDragStart={onDragStart} />
          )) : <p className="text-slate-500 text-sm p-4 text-center">No tasks here.</p>}
        </div>
      </div>
    );
};

interface KanbanBoardProps {
  tasks: Task[];
  employees: Employee[];
  companies: Company[];
  onViewTask: (task: Task) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onAddTask: () => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, employees, companies, onViewTask, onUpdateTaskStatus, onAddTask }) => {
  const onDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: TaskStatus) => {
    const taskId = e.dataTransfer.getData("taskId");
    onUpdateTaskStatus(taskId, newStatus);
  };
  
  if (tasks.length === 0) {
    return <EmptyState message="No tasks to display" actionText="Create First Task" onActionClick={onAddTask}/>
  }

  const columns: TaskStatus[] = [TaskStatus.ToDo, TaskStatus.InProgress, TaskStatus.Completed];

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full">
      {columns.map(status => (
        <KanbanColumn
          key={status}
          status={status}
          tasks={tasks.filter(t => t.status === status)}
          employees={employees}
          companies={companies}
          onView={onViewTask}
          onDragStart={onDragStart}
          onDrop={onDrop}
        />
      ))}
    </div>
  );
};

export default KanbanBoard;