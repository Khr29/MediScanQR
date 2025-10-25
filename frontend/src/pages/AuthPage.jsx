// --- AuthPage.jsx Content ---

import React, { useState } from 'react';
// Import necessary Firebase auth functions if this were a separate file
// For example: 
// import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

/**
 * AuthPage Component: Handles user login and registration forms.
 * * @param {object} props 
 * @param {object} props.auth The Firebase Auth instance.
 * @param {function} props.setIsSigningIn Function to manage global loading state.
 * @param {function} props.setError Function to display global errors.
 */
const AuthPage = ({ auth, setIsSigningIn, setError }) => {
    const [view, setView] = useState('login'); // 'login' or 'register'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Handler for Login/Registration form submission
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!auth || !email || !password) return;
        
        setLoading(true);
        setIsSigningIn(true);
        
        try {
            if (view === 'login') {
                // *** REAL CODE TO USE ***
                // await signInWithEmailAndPassword(auth, email, password);
                
                // DEMO PLACEHOLDER for asynchronous task:
                console.log(`Attempting login for ${email}`);
                // Replace the line below with your real Firebase sign-in call
                await new Promise(resolve => setTimeout(resolve, 1000)); 
            
            } else {
                // *** REAL CODE TO USE ***
                // await createUserWithEmailAndPassword(auth, email, password);

                // DEMO PLACEHOLDER for asynchronous task:
                console.log(`Attempting registration for ${email}`);
                // Replace the line below with your real Firebase registration call
                await new Promise(resolve => setTimeout(resolve, 1000)); 
            }
            
            // Success: onAuthStateChanged listener in App.jsx handles the user state change.
            
        } catch (e) {
            console.error("Authentication Error:", e.message);
            // In a real app, you'd show a user-friendly error box instead of logging
            setError(`Authentication failed: ${e.message}`); 
            setIsSigningIn(false); 
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full mx-auto border-t-4 border-indigo-500">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
                    {view === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-center text-gray-500 mb-8">Securely access PharmaManager.</p>

                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required 
                            className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150" />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required 
                            className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150" />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-lg text-white font-semibold transition duration-150 shadow-md flex justify-center items-center ${
                            loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800'
                        }`}
                    >
                        {loading ? (
                            <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : (view === 'login' ? 'Log In' : 'Sign Up')}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    {view === 'login' ? (
                        <p>
                            Don't have an account?{' '}
                            <button 
                                type="button"
                                onClick={() => setView('register')}
                                className="text-indigo-600 hover:text-indigo-800 font-medium transition duration-150"
                            >
                                Register Now
                            </button>
                        </p>
                    ) : (
                        <p>
                            Already registered?{' '}
                            <button 
                                type="button"
                                onClick={() => setView('login')}
                                className="text-indigo-600 hover:text-indigo-800 font-medium transition duration-150"
                            >
                                Log In
                            </button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;