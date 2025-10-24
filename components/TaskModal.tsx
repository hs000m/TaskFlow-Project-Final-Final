import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Task, Company, Employee, TaskStatus, TaskPriority } from '../types';
import Modal from './Modal';
import { SparklesIcon, LoaderIcon } from './icons';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  taskToEdit: Task | null;
  companies: Company[];
  employees: Employee[];
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, taskToEdit, companies, employees }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.Medium);
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.ToDo);
  const [reminderDateTime, setReminderDateTime] = useState('');

  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestionStatus, setSuggestionStatus] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description);
      setCompanyId(taskToEdit.companyId);
      setAssigneeId(taskToEdit.assigneeId);
      setDeadline(taskToEdit.deadline);
      setPriority(taskToEdit.priority);
      setStatus(taskToEdit.status);
      setReminderDateTime(taskToEdit.reminderDateTime || '');
    } else {
      // Reset form
      setTitle('');
      setDescription('');
      setCompanyId('');
      setAssigneeId('');
      setDeadline('');
      setPriority(TaskPriority.Medium);
      setStatus(TaskStatus.ToDo);
      setReminderDateTime('');
    }
    setSuggestionStatus('');
  }, [taskToEdit, isOpen]);

  const handleGenerateSuggestions = async () => {
    if (!title) return;
    setIsSuggesting(true);
    setSuggestionStatus('');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const responseSchema = {
        type: Type.OBJECT,
        properties: {
            companyId: { type: Type.STRING },
            assigneeId: { type: Type.STRING },
            deadline: { type: Type.STRING, description: "A date in YYYY-MM-DD format" },
            priority: { type: Type.STRING, enum: Object.values(TaskPriority) }
        },
        required: ["companyId", "assigneeId", "deadline", "priority"]
      };

      const prompt = `
        You are an intelligent task assistant for a project management app. Your goal is to analyze a task title and suggest the most likely company, assignee, deadline, and priority. Use the provided data lists of companies and employees to make your suggestions. Today's date is ${new Date().toISOString().split('T')[0]}.

        Analyze the following task title and provide suggestions in a JSON format.
        Task Title: "${title}"

        Available Companies (use their ID):
        ${JSON.stringify(companies.map(({ id, name }) => ({ id, name })))}

        Available Employees (use their ID):
        ${JSON.stringify(employees.map(({ id, name, companyId }) => ({ id, name, companyId })))}

        Return a JSON object matching the required schema.
        - For "deadline", infer a reasonable date in YYYY-MM-DD format based on the title. If no date is mentioned, suggest a date 3 days from today.
        - For "priority", choose from "High", "Medium", or "Low" based on keywords in the title (e.g., 'urgent', 'asap' -> High). Default to Medium.
        - For "companyId" and "assigneeId", use the IDs from the lists provided. Match based on names mentioned in the title. If a good fit isn't clear, return an empty string for that field.
        - If an assignee is suggested, ensure the companyId matches the assignee's company.
      `;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
        },
      });

      const suggestions = JSON.parse(response.text);
      
      if (suggestions.companyId && companies.some(c => c.id === suggestions.companyId)) {
        setCompanyId(suggestions.companyId);
      }
      if (suggestions.assigneeId && employees.some(e => e.id === suggestions.assigneeId)) {
          // If a new company was suggested, update companyId as well to match assignee
          const suggestedAssignee = employees.find(e => e.id === suggestions.assigneeId);
          if(suggestedAssignee) {
             setCompanyId(suggestedAssignee.companyId);
             setAssigneeId(suggestions.assigneeId);
          }
      }
      if (suggestions.deadline) {
        setDeadline(suggestions.deadline);
      }
      if (suggestions.priority) {
        setPriority(suggestions.priority);
      }
      setSuggestionStatus('✨ AI suggestions applied!');

    } catch (e) {
      console.error("AI suggestion error:", e);
      setSuggestionStatus('Could not generate suggestions.');
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !companyId || !assigneeId || !deadline) {
        alert("Please fill all required fields.");
        return;
    }
    onSave({
      id: taskToEdit ? taskToEdit.id : `task-${Date.now()}`,
      createdAt: taskToEdit ? taskToEdit.createdAt : new Date().toISOString(),
      creatorId: taskToEdit ? taskToEdit.creatorId : '',
      title,
      description,
      companyId,
      assigneeId,
      deadline,
      priority,
      status,
      reminderDateTime,
    });
    onClose();
  };

  const availableEmployees = employees.filter(emp => emp.companyId === companyId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={taskToEdit ? 'Edit Task' : 'Add New Task'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-gray-300">Title</label>
          <div className="relative mt-1">
            <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="block w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-12" />
            {!taskToEdit && (
                <button 
                  type="button" 
                  onClick={handleGenerateSuggestions} 
                  disabled={isSuggesting || !title.trim()}
                  title="Get AI Suggestions"
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-md"
                >
                    {isSuggesting ? <LoaderIcon className="w-5 h-5 animate-spin"/> : <SparklesIcon className="w-5 h-5" />}
                </button>
            )}
          </div>
          <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-1 h-4">{suggestionStatus}</p>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-gray-300">Description</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 block w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-slate-700 dark:text-gray-300">Company</label>
              <select id="company" value={companyId} onChange={(e) => { setCompanyId(e.target.value); setAssigneeId(''); }} required className="mt-1 block w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <option value="">Select Company</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="assignee" className="block text-sm font-medium text-slate-700 dark:text-gray-300">Assignee</label>
              <select id="assignee" value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} required disabled={!companyId} className="mt-1 block w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:opacity-50">
                <option value="">Select Assignee</option>
                {availableEmployees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-slate-700 dark:text-gray-300">Deadline</label>
                <input type="date" id="deadline" value={deadline} onChange={(e) => setDeadline(e.target.value)} required className="mt-1 block w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
             <div>
                <label htmlFor="reminder" className="block text-sm font-medium text-slate-700 dark:text-gray-300">Reminder (Optional)</label>
                <input type="datetime-local" id="reminder" value={reminderDateTime} onChange={(e) => setReminderDateTime(e.target.value)} className="mt-1 block w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div>
                <label htmlFor="priority" className="block text-sm font-medium text-slate-700 dark:text-gray-300">Priority</label>
                <select id="priority" value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} required className="mt-1 block w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-gray-300">Status</label>
                <select id="status" value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)} required className="mt-1 block w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
        </div>
        <div className="pt-4 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-white rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-white dark:focus:ring-offset-slate-800">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-white dark:focus:ring-offset-slate-800">{taskToEdit ? 'Save Changes' : 'Create Task'}</button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskModal;
