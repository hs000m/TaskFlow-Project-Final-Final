import React, { useState } from 'react';
import { Company, Employee, Task, Role, EmployeeStatus } from '../types';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';
import EmptyState from './EmptyState';
import { PlusIcon, TrashIcon, EditIcon, SaveIcon, XIcon, CheckIcon } from './icons';

interface ManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: Company[];
  employees: Employee[];
  tasks: Task[];
  onAddCompany: (name: string) => void;
  onDeleteCompany: (id: string) => void;
  onEditCompany: (id: string, newName: string) => void;
  onAddEmployee: (name: string, companyId: string) => void;
  onDeleteEmployee: (id: string) => void;
  onEditEmployee: (id: string, newName: string) => void;
  onApproveEmployee: (id: string) => void;
  onDenyEmployee: (id: string) => void;
}

const ManagementModal: React.FC<ManagementModalProps> = ({ isOpen, onClose, companies, employees, tasks, onAddCompany, onDeleteCompany, onEditCompany, onAddEmployee, onDeleteEmployee, onEditEmployee, onApproveEmployee, onDenyEmployee }) => {
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newEmployeeCompanyId, setNewEmployeeCompanyId] = useState('');
  
  const [confirmState, setConfirmState] = useState<{ type: 'company' | 'employee' | 'deny', id: string, name: string, message: string } | null>(null);
  const [editing, setEditing] = useState<{ id: string, name: string } | null>(null);

  const pendingEmployees = employees.filter(e => e.status === EmployeeStatus.Pending);
  const approvedEmployees = employees.filter(e => e.status === EmployeeStatus.Approved);

  const handleEditClick = (id: string, name: string) => {
    setEditing({ id, name });
  };

  const handleCancelEdit = () => {
    setEditing(null);
  };

  const handleSaveCompany = (id: string) => {
    if (editing && editing.name.trim()) {
      onEditCompany(id, editing.name.trim());
      setEditing(null);
    }
  };

  const handleSaveEmployee = (id: string) => {
    if (editing && editing.name.trim()) {
      onEditEmployee(id, editing.name.trim());
      setEditing(null);
    }
  };

  const handleAddCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCompanyName.trim()) {
      onAddCompany(newCompanyName.trim());
      setNewCompanyName('');
    }
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEmployeeName.trim() && newEmployeeCompanyId) {
      onAddEmployee(newEmployeeName.trim(), newEmployeeCompanyId);
      setNewEmployeeName('');
      setNewEmployeeCompanyId('');
    }
  };

  const handleDeleteCompanyClick = (company: Company) => {
    const companyEmployees = employees.filter(e => e.companyId === company.id && e.status === EmployeeStatus.Approved);
    if (companyEmployees.length > 0) {
      alert(`Cannot delete "${company.name}". Please reassign or delete its ${companyEmployees.length} approved employee(s) first.`);
      return;
    }
    setConfirmState({ type: 'company', id: company.id, name: company.name, message: `Are you sure you want to delete "${company.name}"? This action will also remove pending registrations for this company and cannot be undone.` });
  };

  const handleDeleteEmployeeClick = (employee: Employee) => {
    const employeeTasks = tasks.filter(t => t.assigneeId === employee.id);
    const message = employeeTasks.length > 0 
      ? `Are you sure you want to delete "${employee.name}"? They have ${employeeTasks.length} task(s), which will become unassigned.`
      : `Are you sure you want to delete "${employee.name}"? This action cannot be undone.`;
    setConfirmState({ type: 'employee', id: employee.id, name: employee.name, message });
  };
  
  const handleDenyEmployeeClick = (employee: Employee) => {
    setConfirmState({ type: 'deny', id: employee.id, name: employee.name, message: `Are you sure you want to deny registration for "${employee.name}"? This will permanently delete their request.` });
  };


  const handleConfirmDelete = () => {
    if (confirmState) {
      if (confirmState.type === 'company') {
        onDeleteCompany(confirmState.id);
      } else if (confirmState.type === 'employee'){
        onDeleteEmployee(confirmState.id);
      } else if (confirmState.type === 'deny') {
        onDenyEmployee(confirmState.id);
      }
      setConfirmState(null);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Manage Companies & Employees" size="xl">
        <div className="flex flex-col gap-8">
            {/* Pending Approvals Section */}
            {pendingEmployees.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-yellow-500 dark:text-yellow-400 border-b border-slate-200 dark:border-slate-700 pb-2">Pending Approvals</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {pendingEmployees.map(employee => (
                            <div key={employee.id} className="flex justify-between items-center bg-slate-100 dark:bg-slate-800 p-2 rounded-md">
                                <div>
                                    <p className="text-slate-800 dark:text-gray-200">{employee.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{companies.find(c => c.id === employee.companyId)?.name}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button onClick={() => onApproveEmployee(employee.id)} className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><CheckIcon className="w-5 h-5"/></button>
                                    <button onClick={() => handleDenyEmployeeClick(employee)} className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><TrashIcon className="w-5 h-5"/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Companies Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">Companies</h3>
                <form onSubmit={handleAddCompany} className="flex gap-2">
                <input type="text" value={newCompanyName} onChange={(e) => setNewCompanyName(e.target.value)} placeholder="New company name" className="flex-grow bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-800 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                <button type="submit" className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-white dark:focus:ring-offset-slate-800 flex items-center"><PlusIcon className="w-5 h-5"/></button>
                </form>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {companies.length > 0 ? companies.map(company => (
                    <div key={company.id} className="flex justify-between items-center bg-slate-100 dark:bg-slate-800 p-2 rounded-md">
                    {editing?.id === company.id ? (
                        <input
                            type="text"
                            value={editing.name}
                            onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveCompany(company.id)}
                            autoFocus
                            className="flex-grow bg-slate-200 dark:bg-slate-700 border border-indigo-500 rounded-md py-1 px-2 text-slate-800 dark:text-white sm:text-sm"
                        />
                    ) : (
                        <span className="text-slate-800 dark:text-gray-200">{company.name}</span>
                    )}
                    <div className="flex items-center space-x-2">
                        {editing?.id === company.id ? (
                            <>
                                <button onClick={() => handleSaveCompany(company.id)} className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"><SaveIcon className="w-5 h-5"/></button>
                                <button onClick={handleCancelEdit} className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"><XIcon className="w-5 h-5"/></button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => handleEditClick(company.id, company.name)} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"><EditIcon className="w-5 h-5"/></button>
                                <button onClick={() => handleDeleteCompanyClick(company)} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"><TrashIcon className="w-5 h-5"/></button>
                            </>
                        )}
                    </div>
                    </div>
                )) : <EmptyState message="No companies found." />}
                </div>
            </div>
            {/* Employees Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">Approved Employees</h3>
                <form onSubmit={handleAddEmployee} className="space-y-2">
                <input type="text" value={newEmployeeName} onChange={(e) => setNewEmployeeName(e.target.value)} placeholder="New employee name" required className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-800 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                <div className="flex gap-2">
                    <select value={newEmployeeCompanyId} onChange={(e) => setNewEmployeeCompanyId(e.target.value)} required className="flex-grow bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-800 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option value="">Assign to company</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <button type="submit" className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-white dark:focus:ring-offset-slate-800 flex items-center"><PlusIcon className="w-5 h-5"/></button>
                </div>
                </form>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {approvedEmployees.length > 0 ? approvedEmployees.map(employee => (
                        <div key={employee.id} className="flex justify-between items-center bg-slate-100 dark:bg-slate-800 p-2 rounded-md">
                            {editing?.id === employee.id ? (
                                <input
                                    type="text"
                                    value={editing.name}
                                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveEmployee(employee.id)}
                                    autoFocus
                                    className="flex-grow bg-slate-200 dark:bg-slate-700 border border-indigo-500 rounded-md py-1 px-2 text-slate-800 dark:text-white sm:text-sm"
                                />
                            ) : (
                                <div>
                                    <p className="text-slate-800 dark:text-gray-200">{employee.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{companies.find(c => c.id === employee.companyId)?.name}</p>
                                </div>
                            )}
                            <div className="flex items-center space-x-2">
                                {editing?.id === employee.id ? (
                                    <>
                                        <button onClick={() => handleSaveEmployee(employee.id)} className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"><SaveIcon className="w-5 h-5"/></button>
                                        <button onClick={handleCancelEdit} className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"><XIcon className="w-5 h-5"/></button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => handleEditClick(employee.id, employee.name)} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"><EditIcon className="w-5 h-5"/></button>
                                        {employee.role !== Role.CEO && <button onClick={() => handleDeleteEmployeeClick(employee)} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"><TrashIcon className="w-5 h-5"/></button>}
                                    </>
                                )}
                            </div>
                        </div>
                    )) : <EmptyState message="No employees found." />}
                </div>
            </div>
            </div>
        </div>
      </Modal>

      {confirmState && (
        <ConfirmationModal
          isOpen={!!confirmState}
          onClose={() => setConfirmState(null)}
          onConfirm={handleConfirmDelete}
          title={`Confirm Action`}
          message={confirmState.message}
        />
      )}
    </>
  );
};

export default ManagementModal;
