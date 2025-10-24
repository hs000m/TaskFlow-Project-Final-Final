import React from 'react';
import { Employee } from '../types';
import { MoonIcon, SunIcon, LogOutIcon, GithubIcon, LayoutDashboardIcon, FolderIcon, ChartBarIcon } from './icons';

type Page = 'taskflow' | 'sharefolder' | 'dashboard';

interface SidebarProps {
    currentUser: Employee;
    onLogout: () => void;
    currentPage: Page;
    onSetPage: (page: Page) => void;
    theme: 'light' | 'dark';
    onSetTheme: (theme: 'light' | 'dark') => void;
}

const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150 ${
            isActive 
            ? 'bg-indigo-600 text-white' 
            : 'text-slate-400 hover:bg-slate-700 hover:text-white'
        }`}
    >
        {icon}
        <span className="ml-3">{label}</span>
    </button>
);

const Sidebar: React.FC<SidebarProps> = ({ currentUser, onLogout, currentPage, onSetPage, theme, onSetTheme }) => {
    return (
        <div className="w-64 bg-slate-900 text-white flex flex-col flex-shrink-0">
            <div className="flex items-center justify-center h-16 border-b border-slate-800">
                <svg className="h-8 w-8 text-indigo-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V9z"></path><path d="M9 3V1"></path><path d="M15 3V1"></path><path d="M5 3a3 3 0 0 0-3 3"></path><path d="M19 3a3 3 0 0 1 3 3"></path><path d="M2 15h20"></path><path d="M9 18H7"></path></svg>
                <h1 className="text-2xl font-bold ml-2">TaskFlow</h1>
            </div>
            
            <nav className="flex-1 px-4 py-6 space-y-2">
                <NavItem 
                    icon={<LayoutDashboardIcon className="w-5 h-5" />} 
                    label="TaskFlow" 
                    isActive={currentPage === 'taskflow'} 
                    onClick={() => onSetPage('taskflow')} 
                />
                <NavItem 
                    icon={<FolderIcon className="w-5 h-5" />} 
                    label="ShareFolder" 
                    isActive={currentPage === 'sharefolder'} 
                    onClick={() => onSetPage('sharefolder')}
                />
                {currentUser.canViewDashboard && (
                    <NavItem
                        icon={<ChartBarIcon className="w-5 h-5" />}
                        label="Dashboard"
                        isActive={currentPage === 'dashboard'}
                        onClick={() => onSetPage('dashboard')}
                    />
                )}
            </nav>

            <div className="px-4 py-4 border-t border-slate-800">
                 <div className="flex items-center justify-between mb-4">
                     <button onClick={() => onSetTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full text-slate-400 hover:bg-slate-700 transition-colors">
                        {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                    </button>
                    <a href="https://github.com/hs000m/TaskFlow-Project-Final" target="_blank" rel="noopener noreferrer" title="View on GitHub" className="p-2 rounded-full text-slate-400 hover:bg-slate-700 transition-colors">
                        <GithubIcon className="w-5 h-5" />
                    </a>
                    <button onClick={onLogout} title="Logout" className="p-2 rounded-full text-slate-400 hover:bg-slate-700 transition-colors">
                        <LogOutIcon className="w-5 h-5"/>
                    </button>
                 </div>

                <div className="flex items-center gap-3 bg-slate-800 p-3 rounded-lg">
                     <div className="flex items-center justify-center w-9 h-9 bg-indigo-600 rounded-full text-white font-bold text-base uppercase">
                        {currentUser?.name.charAt(0)}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-white truncate">{currentUser.name}</p>
                        <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;