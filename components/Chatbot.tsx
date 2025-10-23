import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat, FunctionDeclaration, Type } from '@google/genai';
import { MessageSquareIcon, XIcon, SendIcon, SparklesIcon } from './icons';
import { Company, Employee, Task, TaskPriority, TaskStatus } from '../types';

interface Message {
    sender: 'user' | 'bot';
    text: string;
}

interface ChatbotProps {
    companies: Company[];
    employees: Employee[];
    currentUser: Employee | null;
    onSaveTask: (task: Task) => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ companies, employees, currentUser, onSaveTask }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && !chatRef.current) {
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

                const createTaskFunctionDeclaration: FunctionDeclaration = {
                    name: 'createTask',
                    description: 'Creates a new task in the TaskFlow application. Use this function whenever the user expresses intent to create, add, or make a new task.',
                    parameters: {
                        type: Type.OBJECT,
                        properties: {
                            title: {
                                type: Type.STRING,
                                description: 'The title or name of the task. This is a required field.',
                            },
                            description: {
                                type: Type.STRING,
                                description: 'A detailed description of what the task involves.',
                            },
                            companyName: {
                                type: Type.STRING,
                                description: `The name of the company this task belongs to. Available companies: ${companies.map(c => c.name).join(', ')}.`,
                            },
                            assigneeName: {
                                type: Type.STRING,
                                description: `The name of the employee to whom this task should be assigned. Available employees: ${employees.map(e => e.name).join(', ')}.`,
                            },
                            deadline: {
                                type: Type.STRING,
                                description: 'The due date for the task in YYYY-MM-DD format. The model should infer the date from user input like "tomorrow" or "next Friday".',
                            },
                            priority: {
                                type: Type.STRING,
                                enum: [TaskPriority.High, TaskPriority.Medium, TaskPriority.Low],
                                description: 'The priority level of the task. Defaults to Medium if not specified by the user.',
                            },
                        },
                        required: ['title'],
                    },
                };

                chatRef.current = ai.chats.create({
                    model: 'gemini-flash-lite-latest',
                    config: {
                        systemInstruction: 'You are a friendly and helpful assistant for TaskFlow, a project management application. Your primary function is to help users create tasks by calling the `createTask` function. You can also answer questions about productivity, time management, and general knowledge. When creating a task, confirm details with the user if they are ambiguous. Keep your answers concise and helpful.',
                        tools: [{ functionDeclarations: [createTaskFunctionDeclaration] }],
                    },
                });
                setMessages([{ sender: 'bot', text: "Hello! I'm your TaskFlow assistant. You can ask me to create a task for you, like 'Create a task to finish the report by Friday for Innovate Inc.'" }]);
            } catch (error) {
                console.error("Failed to initialize Gemini Chat:", error);
                setMessages([{ sender: 'bot', text: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
            }
        }
    }, [isOpen, companies, employees]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleFunctionCall = (functionCall: any) => {
        if (functionCall.name === 'createTask') {
            const { title, description, companyName, assigneeName, deadline, priority } = functionCall.args;
            
            if (!title) {
                setMessages(prev => [...prev, { sender: 'bot', text: "I can't create a task without a title. What should the task be called?" }]);
                return;
            }
            
            const company = companyName ? companies.find(c => c.name.toLowerCase() === companyName.toLowerCase()) : undefined;
            const assignee = assigneeName ? employees.find(e => e.name.toLowerCase() === assigneeName.toLowerCase()) : undefined;

            if (companyName && !company) {
                setMessages(prev => [...prev, { sender: 'bot', text: `I couldn't find a company named "${companyName}". I've left the company field blank.` }]);
            }
            if (assigneeName && !assignee) {
                setMessages(prev => [...prev, { sender: 'bot', text: `I couldn't find an employee named "${assigneeName}". The task will be unassigned.` }]);
            }

            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);

            const newTask: Task = {
                id: `task-${Date.now()}`,
                title,
                description: description || '',
                companyId: company?.id || '',
                assigneeId: assignee?.id || '',
                creatorId: currentUser?.id || '',
                deadline: deadline || tomorrow.toISOString().split('T')[0],
                createdAt: new Date().toISOString(),
                status: TaskStatus.ToDo,
                priority: priority || TaskPriority.Medium,
            };

            onSaveTask(newTask);

            let confirmationText = `✅ Task created: "${title}".`;
            if(company) confirmationText += ` For ${company.name}.`;
            if(assignee) confirmationText += ` Assigned to ${assignee.name}.`;
            confirmationText += " I've added it to the board.";

            const confirmationMessage: Message = { sender: 'bot', text: confirmationText };
            setMessages(prev => [...prev, confirmationMessage]);
        }
    }

    const handleSendMessage = async () => {
        if (inputValue.trim() === '' || isLoading) return;

        const userMessage: Message = { sender: 'user', text: inputValue };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            if (!chatRef.current) {
                throw new Error("Chat session not initialized.");
            }
            const response = await chatRef.current.sendMessage({ message: userMessage.text });
            
            if (response.functionCalls && response.functionCalls.length > 0) {
                handleFunctionCall(response.functionCalls[0]);
            } else {
                const botMessage: Message = { sender: 'bot', text: response.text };
                setMessages(prev => [...prev, botMessage]);
            }
        } catch (error: any) {
            console.error("Gemini API Error:", error);
            let errorText = "I'm sorry, I encountered an error. Please try again.";
            if (error.message && (error.message.includes('quota') || error.message.includes('RESOURCE_EXHAUSTED'))) {
                errorText = "It looks like I'm a bit busy right now (API quota exceeded). Please try again in a little while.";
            }
            const errorMessage: Message = { sender: 'bot', text: errorText };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <>
            <div className={`fixed bottom-6 right-6 z-50 transition-transform duration-300 ${isOpen ? 'scale-0' : 'scale-100'}`}>
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-16 h-16 bg-indigo-600 rounded-full text-white flex items-center justify-center shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900"
                    aria-label="Open chat"
                >
                    <MessageSquareIcon className="w-8 h-8" />
                </button>
            </div>

            <div
                className={`fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 w-[calc(100%-3rem)] max-w-sm h-[70vh] max-h-[500px] bg-white dark:bg-slate-850 rounded-xl shadow-2xl flex flex-col transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="chatbot-title"
            >
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                    <h3 id="chatbot-title" className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5 text-indigo-500"/>
                        Gemini Assistant
                    </h3>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        aria-label="Close chat"
                    >
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-xl px-4 py-2 ${msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-gray-200'}`}>
                                <p className="text-sm" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }} />
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                             <div className="max-w-[80%] rounded-xl px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-gray-200">
                                <div className="flex items-center space-x-1">
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></span>
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask me anything..."
                            className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm py-2 px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={isLoading || inputValue.trim() === ''}
                            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-white dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Send message"
                        >
                            <SendIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Chatbot;