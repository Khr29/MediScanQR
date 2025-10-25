import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const Toast = () => {
    const { toast, setToast } = useAuth();
    const { message, type } = toast;

    // Auto-hide the toast after 4 seconds
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setToast({ message: '', type: '' });
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [message, setToast]);

    if (!message) return null;

    const styleMap = {
        error: 'bg-red-500',
        success: 'bg-green-500',
    };

    return (
        <div className={`fixed bottom-4 right-4 p-4 rounded-xl shadow-xl text-white z-50 transition-all duration-500 ease-out ${styleMap[type] || 'bg-blue-500'} ${message ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex items-center">
                <span>{message}</span>
                <button onClick={() => setToast({ message: '', type: '' })} className="ml-4 font-bold focus:outline-none">×</button>
            </div>
        </div>
    );
};

export default Toast;