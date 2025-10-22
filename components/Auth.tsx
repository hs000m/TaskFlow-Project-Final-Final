import React, { useState } from 'react';
import { Company } from '../types';

interface AuthProps {
    onLogin: (email: string, pass: string) => 'success' | 'pending' | 'unverified' | 'error';
    onRegister: (name: string, companyId: string, email: string, pass: string) => { success: boolean; token?: string };
    onVerifyEmail: (email: string, token: string) => boolean;
    companies: Company[];
}

const Auth: React.FC<AuthProps> = ({ onLogin, onRegister, onVerifyEmail, companies }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [companyId, setCompanyId] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [verificationInfo, setVerificationInfo] = useState<{ email: string; token: string } | null>(null);


    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        const result = onLogin(email, password);
        if (result === 'error') {
            setError('Invalid email or password.');
        } else if (result === 'pending') {
            setError('Your account is awaiting approval from the CEO.');
        } else if (result === 'unverified') {
            setError('Your account has not been verified. Please check your email.');
        }
    };

    const handleRegisterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        if (!companyId) {
            setError('Please select a company to join.');
            return;
        }
        const result = onRegister(name, companyId, email, password);
        if (result.success && result.token) {
            setSuccessMessage('Registration successful! A verification email has been sent.');
            setVerificationInfo({ email, token: result.token });
            setIsLoginView(false); // Stay on register "page" to show verification UI
        } else {
            setError('An account with this email already exists.');
        }
    };

    const handleVerifyClick = () => {
        if (verificationInfo) {
            const isVerified = onVerifyEmail(verificationInfo.email, verificationInfo.token);
            if (isVerified) {
                setVerificationInfo(null);
                setSuccessMessage('Email verified successfully! Your account is now pending CEO approval.');
                setIsLoginView(true); // Switch to login view after success
                setEmail('');
                setPassword('');
            } else {
                setError('Verification failed. The link may be invalid or expired.');
                setSuccessMessage('');
            }
        }
    };
    
    const toggleView = () => {
        setIsLoginView(!isLoginView);
        setError('');
        setSuccessMessage('');
        setEmail('');
        setPassword('');
        setName('');
        setCompanyId('');
        setVerificationInfo(null);
    };

    const renderContent = () => {
        if (isLoginView) {
            return (
                <form className="mt-8 space-y-6" onSubmit={handleLoginSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email address</label>
                            <input id="email-address" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-gray-200 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Email address" />
                        </div>
                        <div>
                            <label htmlFor="password-login" className="sr-only">Password</label>
                            <input id="password-login" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-gray-200 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Password" />
                        </div>
                    </div>
                    <div>
                        <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-800">
                            Sign in
                        </button>
                    </div>
                </form>
            );
        }

        if (verificationInfo) {
            return (
                 <div className="space-y-4">
                    {successMessage && <p className="text-center bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 p-3 rounded-md text-sm">{successMessage}</p>}
                    <h3 className="text-center text-lg font-medium text-slate-900 dark:text-gray-200">Verify Your Email</h3>
                    <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                        A (simulated) verification link has been sent to <strong>{verificationInfo.email}</strong>. Click the button below to complete your registration.
                    </p>
                    <div className="pt-2">
                        <button onClick={handleVerifyClick} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-800">
                            Verify Email Address
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <form className="mt-8 space-y-6" onSubmit={handleRegisterSubmit}>
                 <div className="rounded-md shadow-sm -space-y-px">
                    <div>
                        <label htmlFor="full-name" className="sr-only">Full Name</label>
                        <input id="full-name" name="name" type="text" value={name} onChange={e => setName(e.target.value)} autoComplete="name" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-gray-200 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Full Name" />
                    </div>
                     <div>
                        <label htmlFor="company-id" className="sr-only">Company</label>
                        <select id="company-id" name="company" value={companyId} onChange={e => setCompanyId(e.target.value)} required 
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm">
                            <option value="">Select Company</option>
                            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="email-register" className="sr-only">Email address</label>
                        <input id="email-register" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Email address" />
                    </div>
                    <div>
                        <label htmlFor="password-register" className="sr-only">Password</label>
                        <input id="password-register" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-gray-200 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Password" />
                    </div>
                </div>
                <div>
                    <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-800">
                        Request Account
                    </button>
                </div>
            </form>
        );
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 px-4">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="text-center">
                    <div className="flex items-center justify-center mb-4">
                        <svg className="h-10 w-10 text-indigo-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V9z"></path><path d="M9 3V1"></path><path d="M15 3V1"></path><path d="M5 3a3 3 0 0 0-3 3"></path><path d="M19 3a3 3 0 0 1 3 3"></path><path d="M2 15h20"></path><path d="M9 18H7"></path></svg>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white ml-2">TaskFlow</h1>
                    </div>
                    <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-gray-200">
                        {isLoginView ? 'Sign in to your account' : 'Request an account'}
                    </h2>
                </div>
                
                {error && <p className="text-center bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 p-3 rounded-md text-sm">{error}</p>}
                {successMessage && !verificationInfo && isLoginView && <p className="text-center bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 p-3 rounded-md text-sm">{successMessage}</p>}
                
                {renderContent()}

                {!verificationInfo && (
                    <div className="text-sm text-center">
                        <button onClick={toggleView} className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">
                            {isLoginView ? "Don't have an account? Request access" : 'Already have an account? Sign in'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Auth;
