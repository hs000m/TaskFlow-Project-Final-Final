import React, { useState } from 'react';
import { Task, Employee, Company, TaskPriority, TaskStatus } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, BellIcon } from './icons';
import EmptyState from './EmptyState';

const priorityColors: Record<TaskPriority, string> = {
  [TaskPriority.High]: 'bg-red-500/80 hover:bg-red-500',
  [TaskPriority.Medium]: 'bg-yellow-500/80 hover:bg-yellow-500',
  [TaskPriority.Low]: 'bg-blue-500/80 hover:bg-blue-500',
};

interface CalendarViewProps {
  tasks: Task[];
  onViewTask: (task: Task) => void;
  onAddTask: () => void;
  companies: Company[];
  employees: Employee[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onViewTask, onAddTask, companies, employees }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDate = new Date(startOfMonth);
  startDate.setDate(startDate.getDate() - startDate.getDay());
  const endDate = new Date(endOfMonth);
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

  const days = [];
  let day = new Date(startDate);

  while (day <= endDate) {
    days.push(new Date(day));
    day.setDate(day.getDate() + 1);
  }

  const tasksByDate: { [key: string]: Task[] } = {};
  tasks.forEach(task => {
    const dateKey = task.deadline;
    if (!tasksByDate[dateKey]) {
      tasksByDate[dateKey] = [];
    }
    tasksByDate[dateKey].push(task);
  });
  
  if (tasks.length === 0) {
    return <EmptyState message="No tasks to display" actionText="Create a Task" onActionClick={onAddTask}/>
  }

  return (
    <div className="bg-white dark:bg-slate-850 rounded-lg shadow-lg p-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 px-2">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
        </h2>
        <div className="flex space-x-2">
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><ChevronLeftIcon /></button>
          <button onClick={() => setCurrentDate(new Date())} className="px-4 py-1 text-sm rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-300 dark:border-slate-600">Today</button>
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><ChevronRightIcon /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 flex-grow gap-px bg-slate-300 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-800">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
          <div key={dayName} className="text-center font-semibold text-xs text-slate-500 dark:text-slate-300 py-2 bg-slate-100 dark:bg-slate-800 uppercase">{dayName}</div>
        ))}
        {days.map((d, index) => {
          const dateKey = d.toISOString().split('T')[0];
          const isCurrentMonth = d.getMonth() === currentDate.getMonth();
          const isToday = dateKey === new Date().toISOString().split('T')[0];
          return (
            <div key={index} className={`bg-white dark:bg-slate-850 p-2 flex flex-col ${isCurrentMonth ? '' : 'bg-slate-50 dark:bg-slate-850/50 opacity-60'}`}>
              <span className={`mb-2 text-sm ${isToday ? 'bg-indigo-600 text-white rounded-full w-7 h-7 flex items-center justify-center font-bold' : 'text-slate-700 dark:text-slate-300'}`}>{d.getDate()}</span>
              <div className="flex-grow space-y-1 overflow-y-auto min-h-[80px]">
                {tasksByDate[dateKey]?.map(task => {
                    const assignee = employees.find(e => e.id === task.assigneeId);
                    const isCompleted = task.status === TaskStatus.Completed;
                    return (
                        <div 
                            key={task.id} 
                            className={`p-1.5 rounded text-white text-xs cursor-pointer transition-colors duration-150 ${isCompleted ? 'bg-green-600/80 hover:bg-green-600 opacity-60' : priorityColors[task.priority]}`}
                            onClick={() => onViewTask(task)}
                            title={`${task.title} - ${assignee?.name}${task.reminderDateTime ? ` (Reminder at ${new Date(task.reminderDateTime).toLocaleTimeString()})` : ''}`}
                        >
                            <div className="flex items-center gap-1 truncate">
                                {task.reminderDateTime && <BellIcon className="w-3 h-3 flex-shrink-0" />}
                                <p className={`font-semibold truncate ${isCompleted ? 'line-through' : ''}`}>{task.title}</p>
                            </div>
                            <p className="text-xs opacity-90">{isCompleted ? 'Completed' : task.priority}</p>
                        </div>
                    )
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;