import React, { useState, useEffect } from 'react';
import { Company, Employee, FinancialData, Role } from '../types';
import Modal from '../components/Modal';
import { EditIcon } from '../components/icons';

// --- HELPER FUNCTIONS & COMPONENTS ---

const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1_000_000) {
        return `$${(value / 1_000_000).toFixed(1)}M`;
    }
    if (Math.abs(value) >= 1_000) {
        return `$${(value / 1_000).toFixed(0)}K`;
    }
    return `$${value}`;
};

const MetricBar: React.FC<{ label: string; actual: number; plan: number }> = ({ label, actual, plan }) => {
    const percentage = plan > 0 ? Math.min((actual / plan) * 100, 100) : 0;
    const isOver = actual > plan;

    return (
        <div>
            <div className="flex justify-between items-baseline mb-1">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
                <div className="text-xs">
                    <span className="font-semibold text-slate-800 dark:text-white">{formatCurrency(actual)}</span>
                    <span className="text-slate-500 dark:text-slate-400"> / {formatCurrency(plan)}</span>
                </div>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                <div 
                    className={`h-2.5 rounded-full ${isOver ? 'bg-green-500' : 'bg-indigo-500'}`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};

const EditMonthlyModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<FinancialData>) => void;
    financialData: FinancialData;
    companyName: string;
}> = ({ isOpen, onClose, onSave, financialData, companyName }) => {
    const [formData, setFormData] = useState(financialData);

    useEffect(() => {
        setFormData(financialData);
    }, [financialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    const renderNumberInput = (label: string, name: string) => (
        <div className="col-span-1">
            <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-gray-300">{label}</label>
            <input type="number" id={name} name={name} value={formData[name as keyof FinancialData] as number} onChange={handleChange}
                className="mt-1 block w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Edit Monthly P&L for ${companyName}`} size="lg">
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label htmlFor="monthlyDataAsOf" className="block text-sm font-medium text-slate-700 dark:text-gray-300">Reporting Period (e.g., YTD June)</label>
                    <input type="text" id="monthlyDataAsOf" name="monthlyDataAsOf" value={formData.monthlyDataAsOf} onChange={handleChange} required className="mt-1 block w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 p-4 border border-slate-200 dark:border-slate-700 rounded-md">
                    <h4 className="col-span-2 text-sm font-semibold mb-2">Revenue</h4>
                    {renderNumberInput('Plan', 'planRevenue')}
                    {renderNumberInput('Actual', 'actualRevenue')}
                    <h4 className="col-span-2 text-sm font-semibold mt-3 mb-2">Gross Profit</h4>
                    {renderNumberInput('Plan', 'planGrossProfit')}
                    {renderNumberInput('Actual', 'actualGrossProfit')}
                    <h4 className="col-span-2 text-sm font-semibold mt-3 mb-2">EBITDA</h4>
                    {renderNumberInput('Plan', 'planEbitda')}
                    {renderNumberInput('Actual', 'actualEbitda')}
                    <h4 className="col-span-2 text-sm font-semibold mt-3 mb-2">EBIT</h4>
                    {renderNumberInput('Plan', 'planEbit')}
                    {renderNumberInput('Actual', 'actualEbit')}
                    <h4 className="col-span-2 text-sm font-semibold mt-3 mb-2">Net Income</h4>
                    {renderNumberInput('Plan', 'planNetIncome')}
                    {renderNumberInput('Actual', 'actualNetIncome')}
                </div>
                <div className="pt-4 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-white rounded-md hover:bg-slate-300 dark:hover:bg-slate-500">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Save Changes</button>
                </div>
            </form>
        </Modal>
    );
};


const EditCashModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<FinancialData>) => void;
    financialData: FinancialData;
    companyName: string;
}> = ({ isOpen, onClose, onSave, financialData, companyName }) => {
    const [formData, setFormData] = useState(financialData);

    useEffect(() => { setFormData(financialData); }, [financialData]);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Update Cash Balance for ${companyName}`} size="md">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label htmlFor="cashBalance" className="block text-sm font-medium text-slate-700 dark:text-gray-300">Cash Balance</label>
                        <input type="number" id="cashBalance" name="cashBalance" value={formData.cashBalance} onChange={handleChange} required className="mt-1 block w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="cashBalanceAsOfDate" className="block text-sm font-medium text-slate-700 dark:text-gray-300">As of Date</label>
                        <input type="date" id="cashBalanceAsOfDate" name="cashBalanceAsOfDate" value={formData.cashBalanceAsOfDate} onChange={handleChange} required className="mt-1 block w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-white rounded-md hover:bg-slate-300 dark:hover:bg-slate-500">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Save Changes</button>
                </div>
            </form>
        </Modal>
    );
}

const FinancialCard: React.FC<{
    company: Company;
    financials: FinancialData;
    employees: Employee[];
    onEditMonthly: (data: FinancialData) => void;
    onEditCash: (data: FinancialData) => void;
    canEdit: boolean;
}> = ({ company, financials, employees, onEditMonthly, onEditCash, canEdit }) => {
    const monthlyUpdatedBy = employees.find(e => e.id === financials.monthlyDataLastUpdatedBy);
    const cashUpdatedBy = employees.find(e => e.id === financials.cashBalanceLastUpdatedBy);

    return (
        <div className="bg-white dark:bg-slate-850 rounded-lg shadow-md p-6 flex flex-col gap-4">
            {/* P&L Section */}
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{company.name}</h3>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{financials.monthlyDataAsOf}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Updated {new Date(financials.monthlyDataLastUpdatedAt).toLocaleDateString()} by {monthlyUpdatedBy?.name || 'Unknown'}
                    </p>
                </div>
                {canEdit && (
                    <button onClick={() => onEditMonthly(financials)} className="p-2 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <EditIcon className="w-4 h-4" />
                    </button>
                )}
            </div>
            <div className="space-y-4">
                <MetricBar label="Revenue" actual={financials.actualRevenue} plan={financials.planRevenue} />
                <MetricBar label="Gross Profit" actual={financials.actualGrossProfit} plan={financials.planGrossProfit} />
                <MetricBar label="EBITDA" actual={financials.actualEbitda} plan={financials.planEbitda} />
                <MetricBar label="EBIT" actual={financials.actualEbit} plan={financials.planEbit} />
                <MetricBar label="Net Income" actual={financials.actualNetIncome} plan={financials.planNetIncome} />
            </div>

            {/* Cash Balance Section */}
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg mt-2">
                 <div className="flex justify-between items-start mb-2">
                    <div>
                        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-300">Cash Balance</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            As of {new Date(financials.cashBalanceAsOfDate).toLocaleDateString()} by {cashUpdatedBy?.name || 'Unknown'}
                        </p>
                    </div>
                    {canEdit && (
                        <button onClick={() => onEditCash(financials)} className="p-1.5 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-200 transition-colors -mr-1 -mt-1">
                            <EditIcon className="w-4 h-4" />
                        </button>
                    )}
                 </div>
                <p className="text-3xl font-bold text-indigo-800 dark:text-white text-center">{formatCurrency(financials.cashBalance)}</p>
            </div>
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---

interface DashboardPageProps {
    currentUser: Employee;
    companies: Company[];
    employees: Employee[];
    financials: FinancialData[];
    setFinancials: React.Dispatch<React.SetStateAction<FinancialData[]>>;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ currentUser, companies, employees, financials, setFinancials }) => {
    const [isMonthlyModalOpen, setIsMonthlyModalOpen] = useState(false);
    const [isCashModalOpen, setIsCashModalOpen] = useState(false);
    const [dataToEdit, setDataToEdit] = useState<FinancialData | null>(null);

    const handleEditMonthly = (data: FinancialData) => {
        setDataToEdit(data);
        setIsMonthlyModalOpen(true);
    };

    const handleEditCash = (data: FinancialData) => {
        setDataToEdit(data);
        setIsCashModalOpen(true);
    };

    const handleSaveMonthly = (updatedData: Partial<FinancialData>) => {
        setFinancials(prev =>
            prev.map(item =>
                item.companyId === updatedData.companyId
                    ? { ...item, ...updatedData, monthlyDataLastUpdatedBy: currentUser.id, monthlyDataLastUpdatedAt: new Date().toISOString() }
                    : item
            )
        );
    };

    const handleSaveCash = (updatedData: Partial<FinancialData>) => {
        setFinancials(prev =>
            prev.map(item =>
                item.companyId === updatedData.companyId
                    ? { ...item, ...updatedData, cashBalanceLastUpdatedBy: currentUser.id, cashBalanceLastUpdatedAt: new Date().toISOString() }
                    : item
            )
        );
    };
    
    if (!currentUser.canViewDashboard) {
        return (
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Access Denied</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">You do not have permission to view the financial dashboard.</p>
                </div>
            </div>
        );
    }
    
    const canEdit = currentUser.role === Role.CEO || currentUser.role === Role.Admin;

    return (
        <>
            <header className="bg-slate-100/80 dark:bg-slate-850/80 backdrop-blur-sm sticky top-0 z-40 shadow-sm flex-shrink-0">
                <div className="px-6">
                    <div className="flex items-center justify-between h-16">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Financial Dashboard</h1>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-6 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {companies.map(company => {
                        const companyFinancials = financials.find(f => f.companyId === company.id);
                        if (!companyFinancials) return null;
                        return (
                            <FinancialCard
                                key={company.id}
                                company={company}
                                financials={companyFinancials}
                                employees={employees}
                                onEditMonthly={handleEditMonthly}
                                onEditCash={handleEditCash}
                                canEdit={canEdit}
                            />
                        );
                    })}
                </div>
            </main>
            
            {dataToEdit && (
                <>
                    <EditMonthlyModal
                        isOpen={isMonthlyModalOpen}
                        onClose={() => setIsMonthlyModalOpen(false)}
                        onSave={handleSaveMonthly}
                        financialData={dataToEdit}
                        companyName={companies.find(c => c.id === dataToEdit.companyId)?.name || ''}
                    />
                    <EditCashModal
                        isOpen={isCashModalOpen}
                        onClose={() => setIsCashModalOpen(false)}
                        onSave={handleSaveCash}
                        financialData={dataToEdit}
                        companyName={companies.find(c => c.id === dataToEdit.companyId)?.name || ''}
                    />
                </>
            )}
        </>
    );
};

export default DashboardPage;