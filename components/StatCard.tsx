import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  title: string;
  accentColor: string; // e.g., 'border-red-500'
  iconColor: string;   // e.g., 'text-red-400'
  onClick: () => void;
  isActive?: boolean;
}

const shadowColors: Record<string, string> = {
    'border-red-500': 'hover:shadow-red-500/30',
    'border-yellow-500': 'hover:shadow-yellow-500/30',
    'border-blue-500': 'hover:shadow-blue-500/30',
    'border-slate-500': 'hover:shadow-slate-500/30',
};


const StatCard: React.FC<StatCardProps> = ({ icon, value, title, accentColor, iconColor, onClick, isActive }) => {
  const hoverShadow = shadowColors[accentColor] || 'hover:shadow-indigo-500/30';

  return (
    <button
      onClick={onClick}
      className={`w-full rounded-lg bg-white dark:bg-slate-850 p-4 text-left shadow-md transition-all ease-in-out duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-lg hover:bg-slate-50 dark:hover:bg-slate-800 border-l-4 ${accentColor} ${hoverShadow} ${isActive ? 'ring-2 ring-offset-2 ring-offset-slate-100 dark:ring-offset-slate-900 ring-indigo-500 dark:ring-indigo-400' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900/50`}>
          <div className={`h-6 w-6 ${iconColor}`}>
            {icon}
          </div>
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
        </div>
      </div>
    </button>
  );
};

export default StatCard;