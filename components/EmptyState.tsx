import React from 'react';
import { PlusIcon } from './icons';

interface EmptyStateProps {
  message: string;
  actionText?: string;
  onActionClick?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message, actionText, onActionClick }) => {
  return (
    <div className="text-center py-16 px-6 bg-slate-100 dark:bg-slate-850 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700">
      <div className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line>
        </svg>
      </div>
      <h3 className="mt-2 text-lg font-medium text-slate-900 dark:text-white">{message}</h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Get started by adding a new item.</p>
      {actionText && onActionClick && (
        <div className="mt-6">
          <button
            type="button"
            onClick={onActionClick}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            {actionText}
          </button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
