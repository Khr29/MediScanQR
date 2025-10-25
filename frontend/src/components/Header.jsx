import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut, QrCode, PlusCircle, Scan, Stethoscope, Pill, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Header = () => {
    const { user, role, logout } = useAuth();

    // Utility function for button styling
    const getBtnClass = (color) => {
        const base = "font-bold py-2 px-3 sm:px-4 rounded-xl shadow-sm transition duration-200 hover:shadow-lg text-sm sm:text-base whitespace-nowrap";
        if (color === 'primary') return `${base} bg-blue-600 text-white hover:bg-blue-700`;
        if (color === 'danger') return `${base} bg-red-600 text-white hover:bg-red-700`;
        return `${base} bg-gray-500 text-white hover:bg-gray-600`;
    };

    return (
        <header className="bg-white shadow-md sticky top-0 z-40">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center flex-wrap gap-2">
                
                {/* Logo */}
                <Link to="/" className="flex items-center space-x-2 text-xl sm:text-2xl font-bold text-blue-600 p-1 hover:text-blue-700 transition">
                    <QrCode className="w-6 h-6 sm:w-7 sm:h-7" />
                    <span>MediScanQR</span>
                </Link>

                <div className="flex items-center space-x-2 sm:space-x-4">
                    {user ? (
                        <>
                            {/* Role-Specific Links */}
                            {role === 'doctor' && (
                                <div className="flex space-x-2">
                                    <Link to="/drugs/new" className="px-3 py-2 rounded-lg font-semibold text-blue-600 hover:bg-blue-50 transition flex items-center text-sm sm:text-base">
                                        <PlusCircle className="w-4 h-4 mr-1 sm:mr-2" /> Add Drug
                                    </Link>
                                    <Link to="/prescriptions/new" className="px-3 py-2 rounded-lg font-semibold text-blue-600 hover:bg-blue-50 transition flex items-center text-sm sm:text-base">
                                        <QrCode className="w-4 h-4 mr-1 sm:mr-2" /> Create Rx
                                    </Link>
                                </div>
                            )}
                            
                            {role === 'pharmacist' && (
                                <Link to="/scan" className="px-3 py-2 rounded-lg font-semibold text-green-600 hover:bg-green-50 transition flex items-center text-sm sm:text-base">
                                    <Scan className="w-4 h-4 mr-1 sm:mr-2" /> Scan QR
                                </Link>
                            )}

                            {/* User Info and Logout */}
                            <span className="text-sm font-medium text-gray-700 hidden md:inline ml-4">
                                Logged in as: 
                                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${role === 'doctor' ? 'bg-blue-100 text-blue-600' : role === 'pharmacist' ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}`}>
                                    {role.toUpperCase()}
                                </span>
                            </span>
                            <button onClick={logout} className={getBtnClass('danger')} aria-label="Logout">
                                <LogOut className="w-5 h-5 inline mr-1" /> Logout
                            </button>
                        </>
                    ) : (
                        // Auth Links (Login/Register)
                        <>
                            <Link to="/login" className={getBtnClass('primary')}>Login</Link>
                            <Link to="/register" className={getBtnClass('default')}>Register</Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Header;