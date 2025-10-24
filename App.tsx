import React, { useState, useEffect } from 'react';
import { Company, Employee, EmployeeStatus, FinancialData, Role } from './types';
import { initialCompanies, initialEmployees, initialFinancials } from './data';
import { useLocalStorage } from './hooks/useLocalStorage';
import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import TaskFlowPage from './pages/TaskFlowPage';
import ShareFolderPage from './pages/ShareFolderPage';
import DashboardPage from './pages/DashboardPage';

type Page = 'taskflow' | 'sharefolder' | 'dashboard';

const App: React.FC = () => {
    const [companies, setCompanies] = useLocalStorage<Company[]>('taskflow-companies', initialCompanies);
    const [employees, setEmployees] = useLocalStorage<Employee[]>('taskflow-employees', initialEmployees);
    const [financials, setFinancials] = useLocalStorage<FinancialData[]>('taskflow-financials', initialFinancials);
    const [currentUser, setCurrentUser] = useLocalStorage<Employee | null>('taskflow-user', null);
    const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('taskflow-theme', 'dark');
    const [currentPage, setCurrentPage] = useState<Page>('taskflow');

    // Apply theme
    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [theme]);

    // --- Authentication Handlers ---
    const handleLogin = (email: string, pass: string): 'success' | 'pending' | 'unverified' | 'error' => {
        const user = employees.find(e => e.email.toLowerCase() === email.toLowerCase() && e.password === pass);
        if (!user) return 'error';
        if (user.status === EmployeeStatus.PendingVerification) return 'unverified';
        if (user.status === EmployeeStatus.Pending) return 'pending';
        if (user.status === EmployeeStatus.Approved) {
            setCurrentUser(user);
            return 'success';
        }
        return 'error';
    };

    const handleRegister = (name: string, companyId: string, email: string, pass: string): { success: boolean; token?: string } => {
        if (employees.some(e => e.email.toLowerCase() === email.toLowerCase())) {
            return { success: false };
        }
        const verificationToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
        const newEmployee: Employee = {
            id: `emp-${Date.now()}`,
            name,
            email,
            password: pass,
            companyId,
            role: Role.Employee,
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
            updatedEmployees[userIndex] = { ...updatedEmployees[userIndex], status: EmployeeStatus.Pending, verificationToken: undefined };
            setEmployees(updatedEmployees);
            return true;
        }
        return false;
    };
    
    const handleLogout = () => {
        setCurrentUser(null);
    };

    if (!currentUser) {
        return <Auth onLogin={handleLogin} onRegister={handleRegister} onVerifyEmail={handleVerifyEmail} companies={companies} />;
    }

    return (
        <div className="h-screen text-slate-800 dark:text-gray-200 flex bg-slate-100 dark:bg-slate-950">
            <Sidebar 
                currentUser={currentUser}
                onLogout={handleLogout}
                currentPage={currentPage}
                onSetPage={setCurrentPage}
                theme={theme}
                onSetTheme={setTheme}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                {currentPage === 'taskflow' && 
                    <TaskFlowPage 
                        currentUser={currentUser}
                        companies={companies}
                        setCompanies={setCompanies}
                        employees={employees}
                        setEmployees={setEmployees}
                    />
                }
                {currentPage === 'sharefolder' && 
                    <ShareFolderPage
                         currentUser={currentUser}
                         employees={employees}
                    />
                }
                {currentPage === 'dashboard' &&
                    <DashboardPage
                        currentUser={currentUser}
                        companies={companies}
                        employees={employees}
                        financials={financials}
                        setFinancials={setFinancials}
                    />
                }
            </div>
        </div>
    );
};

export default App;