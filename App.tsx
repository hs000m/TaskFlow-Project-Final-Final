import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Company, Employee, Task, Role, TaskStatus, TaskPriority, View, SortBy, EmployeeStatus } from './types';
import { initialCompanies, initialEmployees, initialTasks } from './data';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useReminderNotifications } from './hooks/useReminderNotifications';
import KanbanBoard from './components/KanbanBoard';
import ListView from './components/ListView';
import CalendarView from './components/CalendarView';
import TaskModal from './components/TaskModal';
import ManagementModal from './components/ManagementModal';
import ConfirmationModal from './components/ConfirmationModal';
import Auth from './components/Auth';
import AIInsightsModal from './components/AIInsightsModal';
import TaskDetailModal from './components/TaskDetailModal';
import StatCard from './components/StatCard';
import { MoonIcon, SunIcon, KanbanIcon, ListIcon, CalendarIcon, PlusIcon, UsersIcon, ClockIcon, AlertTriangleIcon, CheckCircleIcon, SettingsIcon, UserXIcon, XIcon, LogOutIcon, SparklesIcon, GithubIcon, CalendarCheckIcon, LoaderIcon, SearchIcon } from './components/icons';

const App: React.FC = () => {
    const [companies, setCompanies] = useLocalStorage<Company[]>('taskflow-companies', initialCompanies);
    const [employees, setEmployees] = useLocalStorage<Employee[]>('taskflow-employees', initialEmployees);
    const [tasks, setTasks] = useLocalStorage<Task[]>('taskflow-tasks', initialTasks);
    const [currentUser, setCurrentUser] = useLocalStorage<Employee | null>('taskflow-user', null);
    const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('taskflow-theme', 'dark');

    const [currentView, setCurrentView] = useState<View>(View.Kanban);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isManagementModalOpen, setIsManagementModalOpen] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
    const [taskToView, setTaskToView] = useState<Task | null>(null);
    const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

    // Filtering and Sorting State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCompany, setFilterCompany] = useState<string>('all');
    const [filterEmployee, setFilterEmployee] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [dateFilter, setDateFilter] = useState<'all' | 'overdue' | 'dueToday'>('all');
    const [sortBy, setSortBy] = useState<SortBy>(SortBy.CreationDate);
    const [activeStat, setActiveStat] = useState<'overdue' | 'dueToday' | 'inProgress' | 'unassigned' | null>(null);

    const profileMenuRef = useRef<HTMLDivElement>(null);
    
    // Enable reminder notifications
    useReminderNotifications(tasks);

    // Apply theme
    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [theme]);

    // Handle click outside for profile menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setIsProfileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    // Authentication Handlers
    const handleLogin = (email: string, pass: string): 'success' | 'pending' | 'unverified' | 'error' => {
        const user = employees.find(e => e.email.toLowerCase() === email.toLowerCase() && e.password === pass);
        if (!user) {
            return 'error';
        }
        if (user.status === EmployeeStatus.PendingVerification) {
            return 'unverified';
        }
        if (user.status === EmployeeStatus.Pending) {
            return 'pending';
        }
        if (user.status === EmployeeStatus.Approved) {
            setCurrentUser(user);
            return 'success';
        }
        return 'error';
    };

    const handleRegister = (name: string, companyId: string, email: string, pass: string): { success: boolean; token?: string } => {
        if (employees.some(e => e.email.toLowerCase() === email.toLowerCase())) {
            return { success: false }; // User already exists
        }
        const verificationToken = Math.random().toString(36).substring(2) + Date.now().toString(36);

        const newEmployee: Employee = {
            id: `emp-${Date.now()}`,
            name,
            email,
            password: pass,
            companyId,
            role: Role.Employee, // All new sign-ups are employees
            status: EmployeeStatus.PendingVerification,
            verificationToken,
        };

        setEmployees([...employees, newEmployee]);
        return { success: true, token: verificationToken };
    };

    const handleVerifyEmail = (email: string, token: string): boolean => {
        const userIndex = employees.findIndex(e => e.email.toLowerCase() === email.toLowerCase() && e.verificationToken === token);
        if (userIndex > -1) {
            const updatedEmployees = [...employees];
            updatedEmployees[userIndex] = {
                ...updatedEmployees[userIndex],
                status: EmployeeStatus.Pending,
                verificationToken: undefined,
            };
            setEmployees(updatedEmployees);
            return true;
        }
        return false;
    };
    
    const handleLogout = () => {
        setCurrentUser(null);
    };
    
    const handleApproveEmployee = (id: string) => {
        setEmployees(employees.map(e => (e.id === id ? { ...e, status: EmployeeStatus.Approved } : e)));
    };
    
    const handleDenyEmployee = (id: string) => {
        setEmployees(employees.filter(e => e.id !== id));
    };

    // Derived State
    const approvedEmployees = useMemo(() => employees.filter(e => e.status === EmployeeStatus.Approved), [employees]);

    const filteredAndSortedTasks = useMemo(() => {
        if (!currentUser) return [];
        
        let filteredTasks = tasks;

        // If user is not CEO, only show their tasks
        if (currentUser.role !== Role.CEO) {
            filteredTasks = filteredTasks.filter(t => t.assigneeId === currentUser.id);
        }

        // Search filter
        if (searchTerm) {
            filteredTasks = filteredTasks.filter(t => 
                t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                t.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterCompany !== 'all') {
            filteredTasks = filteredTasks.filter(t => t.companyId === filterCompany);
        }
        if (filterEmployee !== 'all') {
             if (filterEmployee === 'unassigned') {
                filteredTasks = filteredTasks.filter(t => !t.assigneeId);
            } else {
                filteredTasks = filteredTasks.filter(t => t.assigneeId === filterEmployee);
            }
        }
        if (filterStatus !== 'all') {
            filteredTasks = filteredTasks.filter(t => t.status === filterStatus);
        }
        
        const todayStr = new Date().toISOString().split('T')[0];
        if (dateFilter === 'overdue') {
            filteredTasks = filteredTasks.filter(t => t.deadline < todayStr && t.status !== TaskStatus.Completed);
        } else if (dateFilter === 'dueToday') {
            filteredTasks = filteredTasks.filter(t => t.deadline === todayStr && t.status !== TaskStatus.Completed);
        }

        return [...filteredTasks].sort((a, b) => {
            switch (sortBy) {
                case SortBy.CreationDate:
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case SortBy.Deadline:
                    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
                case SortBy.Priority:
                    const priorityOrder = { [TaskPriority.High]: 3, [TaskPriority.Medium]: 2, [TaskPriority.Low]: 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                default:
                    return 0;
            }
        });
    }, [tasks, filterCompany, filterEmployee, filterStatus, dateFilter, sortBy, currentUser, searchTerm]);

    const stats = useMemo(() => {
        const sourceTasks = currentUser?.role === Role.CEO ? tasks : tasks.filter(t => t.assigneeId === currentUser?.id);
        const todayStr = new Date().toISOString().split('T')[0];
        return {
            overdue: sourceTasks.filter(t => t.deadline < todayStr && t.status !== TaskStatus.Completed).length,
            dueToday: sourceTasks.filter(t => t.deadline === todayStr && t.status !== TaskStatus.Completed).length,
            inProgress: sourceTasks.filter(t => t.status === TaskStatus.InProgress).length,
            unassigned: sourceTasks.filter(t => !t.assigneeId && t.status !== TaskStatus.Completed).length,
        };
    }, [tasks, currentUser]);
    
    const resetFilters = () => {
        setFilterCompany('all');
        setFilterEmployee('all');
        setFilterStatus('all');
        setDateFilter('all');
        setActiveStat(null);
        setSearchTerm('');
    };

    const isAnyFilterActive = useMemo(() => {
        return filterCompany !== 'all' || filterEmployee !== 'all' || filterStatus !== 'all' || activeStat !== null || searchTerm !== '';
    }, [filterCompany, filterEmployee, filterStatus, activeStat, searchTerm]);


    // CRUD Handlers
    const handleSaveTask = (task: Task) => {
        const taskIndex = tasks.findIndex(t => t.id === task.id);
        if (taskIndex > -1) {
            const newTasks = [...tasks];
            newTasks[taskIndex] = task;
            setTasks(newTasks);
        } else {
            setTasks([...tasks, { ...task, creatorId: currentUser.id }]);
        }
        setTaskToEdit(null);
    };
    
    const handleViewTask = (task: Task) => {
        setTaskToView(task);
        setIsDetailModalOpen(true);
    };

    const handleEditTask = (task: Task) => {
        setIsDetailModalOpen(false);
        setTaskToEdit(task);
        setIsTaskModalOpen(true);
    };

    const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
        setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    };
    
    const handleInitiateDelete = (taskId: string) => {
        setTaskToDelete(taskId);
        setIsDetailModalOpen(false);
    }

    const handleDeleteTask = (taskId: string) => {
        setTasks(tasks.filter(t => t.id !== taskId));
    };
    
    // Management Handlers
    const handleAddCompany = (name: string) => {
        const newCompany: Company = { id: `comp-${Date.now()}`, name };
        setCompanies([...companies, newCompany]);
    };
    const handleDeleteCompany = (id: string) => {
        setCompanies(companies.filter(c => c.id !== id));
        // Also remove pending employees associated with that company
        setEmployees(prev => prev.filter(e => e.companyId !== id || e.status !== EmployeeStatus.Pending));
    };
    const handleEditCompany = (id: string, newName: string) => {
        setCompanies(companies.map(c => c.id === id ? { ...c, name: newName } : c));
    };
    
    const handleAddEmployee = (name: string, companyId: string) => {
        const newEmployee: Employee = { id: `emp-${Date.now()}`, name, companyId, role: Role.Employee, email: '', status: EmployeeStatus.Approved };
        setEmployees([...employees, newEmployee]);
    };
    const handleDeleteEmployee = (id: string) => {
        setTasks(tasks.map(task => 
            task.assigneeId === id ? { ...task, assigneeId: '' } : task
        ));
        setEmployees(employees.filter(e => e.id !== id));
    };
    const handleEditEmployee = (id: string, newName: string) => {
        setEmployees(employees.map(e => e.id === id ? { ...e, name: newName } : e));
    };
        
    const renderView = () => {
        const props = {
            tasks: filteredAndSortedTasks,
            employees: approvedEmployees,
            companies,
            onViewTask: handleViewTask,
            onAddTask: () => { setTaskToEdit(null); setIsTaskModalOpen(true); }
        };

        switch (currentView) {
            case View.List:
                return <ListView {...props} onDeleteTask={(id: string) => setTaskToDelete(id)} />;
            case View.Calendar:
                return <CalendarView {...props} />;
            case View.Kanban:
            default:
                return <KanbanBoard {...props} onUpdateTaskStatus={handleUpdateTaskStatus} />;
        }
    };
    
    if (!currentUser) {
        return <Auth onLogin={handleLogin} onRegister={handleRegister} onVerifyEmail={handleVerifyEmail} companies={companies} />;
    }

    return (
        <div className="h-screen text-slate-800 dark:text-gray-200 flex flex-col">
            {/* Header */}
            <header className="bg-slate-100/80 dark:bg-slate-850/80 backdrop-blur-sm sticky top-0 z-40 shadow-sm flex-shrink-0">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <svg className="h-8 w-8 text-indigo-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V9z"></path><path d="M9 3V1"></path><path d="M15 3V1"></path><path d="M5 3a3 3 0 0 0-3 3"></path><path d="M19 3a3 3 0 0 1 3 3"></path><path d="M2 15h20"></path><path d="M9 18H7"></path></svg>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white ml-2">TaskFlow</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                            </button>

                            <a href="https://github.com/hs000m/TaskFlow-Project-Final" target="_blank" rel="noopener noreferrer" title="View on GitHub" className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                <GithubIcon className="w-5 h-5" />
                            </a>
                            
                             {currentUser.role === Role.CEO && (
                                <button onClick={() => setIsAIModalOpen(true)} className="hidden sm:flex items-center space-x-2 px-3 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 dark:text-indigo-200 bg-indigo-100 dark:bg-indigo-900/50 hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900">
                                    <SparklesIcon className="h-5 w-5"/>
                                    <span className="hidden lg:inline">AI Insights</span>
                                </button>
                            )}

                             <button onClick={() => { setTaskToEdit(null); setIsTaskModalOpen(true); }} className="flex items-center space-x-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900">
                                <PlusIcon className="h-5 w-5"/>
                                <span className="hidden sm:inline">Add Task</span>
                            </button>
                           
                            {/* Profile Menu */}
                            <div className="relative" ref={profileMenuRef}>
                                <button onClick={() => setIsProfileMenuOpen(prev => !prev)} className="flex items-center justify-center w-9 h-9 bg-indigo-600 rounded-full text-white font-bold text-base focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900 uppercase">
                                    {currentUser?.name.charAt(0)}
                                </button>
                                
                                {isProfileMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white dark:bg-slate-850 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 divide-y divide-slate-100 dark:divide-slate-700">
                                        <div className="px-4 py-3">
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{currentUser.name}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{currentUser.email}</p>
                                        </div>
                                        <div className="py-1">
                                            {currentUser.role === Role.CEO && (
                                                <a href="#" onClick={(e) => { e.preventDefault(); setIsManagementModalOpen(true); setIsProfileMenuOpen(false); }} className="text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 flex items-center px-4 py-2 text-sm group">
                                                   <SettingsIcon className="mr-3 h-5 w-5 text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300"/>
                                                   Management
                                                </a>
                                            )}
                                            <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); setIsProfileMenuOpen(false); }} className="text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 flex items-center px-4 py-2 text-sm group">
                                                <LogOutIcon className="mr-3 h-5 w-5 text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300"/>
                                                Logout
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col min-h-0">
              <div className="flex flex-col gap-6 py-6 flex-1 min-h-0">
                {/* Stats Bar */}
                {currentUser.role === Role.CEO && (
                    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                icon={<AlertTriangleIcon />}
                                value={stats.overdue}
                                title="Overdue Tasks"
                                accentColor="border-red-500"
                                iconColor="text-red-500"
                                isActive={activeStat === 'overdue'}
                                onClick={() => { resetFilters(); setDateFilter('overdue'); setCurrentView(View.List); setActiveStat('overdue'); }}
                            />
                            <StatCard
                                icon={<CalendarCheckIcon />}
                                value={stats.dueToday}
                                title="Tasks Due Today"
                                accentColor="border-yellow-500"
                                iconColor="text-yellow-500"
                                isActive={activeStat === 'dueToday'}
                                onClick={() => { resetFilters(); setDateFilter('dueToday'); setCurrentView(View.List); setActiveStat('dueToday'); }}
                            />
                            <StatCard
                                icon={<LoaderIcon className="animate-spin"/>}
                                value={stats.inProgress}
                                title="In Progress"
                                accentColor="border-blue-500"
                                iconColor="text-blue-500"
                                isActive={activeStat === 'inProgress'}
                                onClick={() => { resetFilters(); setFilterStatus(TaskStatus.InProgress); setCurrentView(View.List); setActiveStat('inProgress'); }}
                            />
                            <StatCard
                                icon={<UserXIcon />}
                                value={stats.unassigned}
                                title="Unassigned Tasks"
                                accentColor="border-slate-500"
                                iconColor="text-slate-500"
                                isActive={activeStat === 'unassigned'}
                                onClick={() => { resetFilters(); setFilterEmployee('unassigned'); setCurrentView(View.List); setActiveStat('unassigned'); }}
                            />
                        </div>
                    </div>
                )}

                {/* Filter Bar */}
                 {currentUser.role === Role.CEO && (
                    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                        <div className="bg-white dark:bg-slate-850 rounded-lg shadow-md p-4">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="relative">
                                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input 
                                            type="text" 
                                            placeholder="Search tasks..." 
                                            value={searchTerm} 
                                            onChange={e => setSearchTerm(e.target.value)}
                                            className="w-48 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md py-1.5 pl-9 pr-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <select value={filterCompany} onChange={e => { setFilterCompany(e.target.value); setDateFilter('all'); setActiveStat(null); }} className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md py-1.5 px-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                        <option value="all">All Companies</option>
                                        {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    <select value={filterEmployee} onChange={e => { setFilterEmployee(e.target.value); setDateFilter('all'); setActiveStat(null); }} className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md py-1.5 px-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                        <option value="all">All Employees</option>
                                        <option value="unassigned">Unassigned</option>
                                        {approvedEmployees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                    </select>
                                    <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setDateFilter('all'); setActiveStat(null); }} className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md py-1.5 px-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                        <option value="all">All Statuses</option>
                                        {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <select value={sortBy} onChange={e => setSortBy(e.target.value as SortBy)} className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md py-1.5 px-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                        {Object.values(SortBy).map(s => <option key={s} value={s}>Sort by {s}</option>)}
                                    </select>
                                    {isAnyFilterActive && (
                                        <button
                                            onClick={resetFilters}
                                            className="flex items-center gap-1.5 py-1.5 px-3 text-sm text-indigo-600 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/40 hover:bg-indigo-200 dark:hover:bg-indigo-900/70 rounded-md border border-indigo-200 dark:border-indigo-800/50 transition-colors"
                                        >
                                            <XIcon className="w-4 h-4" />
                                            Clear Filters
                                        </button>
                                    )}
                                </div>
                                <div className="hidden md:flex items-center space-x-2 bg-slate-200 dark:bg-slate-800 rounded-lg p-1">
                                    {[View.Kanban, View.List, View.Calendar].map(view => {
                                        const Icon = { [View.Kanban]: KanbanIcon, [View.List]: ListIcon, [View.Calendar]: CalendarIcon }[view];
                                        return (
                                            <button key={view} onClick={() => setCurrentView(view)} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${currentView === view ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-slate-700'}`}>
                                                <Icon className="w-5 h-5"/>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex-grow w-full flex flex-col">
                  {renderView()}
                </div>
              </div>
            </main>

            {isTaskModalOpen && (
                <TaskModal
                    isOpen={isTaskModalOpen}
                    onClose={() => setIsTaskModalOpen(false)}
                    onSave={handleSaveTask}
                    taskToEdit={taskToEdit}
                    companies={companies}
                    employees={approvedEmployees}
                />
            )}
            
            {isDetailModalOpen && (
                <TaskDetailModal
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    task={taskToView}
                    onEdit={handleEditTask}
                    onDelete={handleInitiateDelete}
                    employees={employees}
                    companies={companies}
                />
            )}

            {isManagementModalOpen && (
                <ManagementModal
                    isOpen={isManagementModalOpen}
                    onClose={() => setIsManagementModalOpen(false)}
                    companies={companies}
                    employees={employees}
                    tasks={tasks}
                    onAddCompany={handleAddCompany}
                    onDeleteCompany={handleDeleteCompany}
                    onEditCompany={handleEditCompany}
                    onAddEmployee={handleAddEmployee}
                    onDeleteEmployee={handleDeleteEmployee}
                    onEditEmployee={handleEditEmployee}
                    onApproveEmployee={handleApproveEmployee}
                    onDenyEmployee={handleDenyEmployee}
                />
            )}
            
            {isAIModalOpen && currentUser.role === Role.CEO && (
                <AIInsightsModal
                    isOpen={isAIModalOpen}
                    onClose={() => setIsAIModalOpen(false)}
                    tasks={tasks}
                    employees={approvedEmployees}
                    companies={companies}
                />
            )}

            {taskToDelete && (
                <ConfirmationModal
                    isOpen={!!taskToDelete}
                    onClose={() => setTaskToDelete(null)}
                    onConfirm={() => {
                        if (taskToDelete) {
                            handleDeleteTask(taskToDelete);
                        }
                        setTaskToDelete(null);
                    }}
                    title="Delete Task"
                    message="Are you sure you want to delete this task? This action cannot be undone."
                />
            )}
        </div>
    );
};

export default App;
