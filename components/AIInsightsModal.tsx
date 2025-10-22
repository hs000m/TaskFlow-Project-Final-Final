import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Task, Company, Employee } from '../types';
import Modal from './Modal';
import { SparklesIcon } from './icons';

interface AIInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  employees: Employee[];
  companies: Company[];
}

const AIInsightsModal: React.FC<AIInsightsModalProps> = ({ isOpen, onClose, tasks, employees, companies }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateInsights = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setInsights(null);

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `
      You are a world-class project management assistant for a CEO overseeing multiple companies. Your task is to analyze the provided task data and generate a concise, actionable report. The data includes all tasks, employees, and companies. Today's date is ${new Date().toLocaleDateString()}.

      Your report should have three distinct sections in Markdown format:

      1.  **### Overall Summary:**
          *   Provide a brief, high-level overview of the current situation. Mention the total number of tasks and their distribution across different statuses (To-Do, In Progress, Completed).

      2.  **### At-Risk Tasks:**
          *   Identify tasks that require immediate attention. A task is considered "at-risk" if it is overdue, high-priority and nearing its deadline, or has been in progress for an unusually long time. List the specific task titles and the reason they are at risk.

      3.  **### Recommendations:**
          *   Based on your analysis, provide 2-3 concrete, actionable recommendations for the CEO. This could include suggestions for reassigning tasks to balance workload, following up with specific employees on critical tasks, or addressing bottlenecks.

      Here is the data in JSON format:

      ${JSON.stringify({ tasks, employees, companies }, null, 2)}

      Analyze this data and provide the report.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
      });
      setInsights(response.text);
    } catch (e) {
      console.error(e);
      setError('Failed to generate insights. Please check the console for more details.');
    } finally {
      setIsLoading(false);
    }
  }, [tasks, employees, companies]);

  const renderInsights = () => {
    if (!insights) return null;

    return insights.split('\n').map((line, index) => {
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-semibold text-indigo-500 dark:text-indigo-300 mt-4 mb-2">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('* ')) {
        return <li key={index} className="ml-5 list-disc text-slate-600 dark:text-slate-300">{line.replace('* ', '')}</li>;
      }
      return <p key={index} className="text-slate-500 dark:text-slate-400 mb-2">{line}</p>;
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Task Insights" size="lg">
      <div className="min-h-[300px]">
        {!isLoading && !insights && !error && (
          <div className="text-center flex flex-col items-center justify-center h-full pt-8">
            <SparklesIcon className="w-12 h-12 text-indigo-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">Unlock Actionable Insights</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">Let AI analyze your project data to identify risks, provide summaries, and suggest strategic actions.</p>
            <div className="mt-6">
              <button
                type="button"
                onClick={handleGenerateInsights}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-white dark:focus:ring-offset-slate-900"
              >
                <SparklesIcon className="-ml-1 mr-2 h-5 w-5" />
                Generate Insights
              </button>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center h-full pt-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 p-4 rounded-md text-sm">
            <h4 className="font-bold mb-2">An Error Occurred</h4>
            {error}
          </div>
        )}

        {insights && (
          <div className="prose prose-slate dark:prose-invert max-w-none">
            {renderInsights()}
            <button
                type="button"
                onClick={handleGenerateInsights}
                disabled={isLoading}
                className="mt-6 inline-flex items-center px-3 py-1.5 border border-slate-300 dark:border-slate-600 shadow-sm text-xs font-medium rounded-md text-slate-700 dark:text-gray-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-white dark:focus:ring-offset-slate-800 disabled:opacity-50"
              >
                Regenerate
              </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AIInsightsModal;
