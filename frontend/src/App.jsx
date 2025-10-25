// --- App.jsx Content ---

import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    signInAnonymously, 
    signInWithCustomToken, 
    onAuthStateChanged, 
    signOut 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { setLogLevel } from 'firebase/app';
import { Clipboard, User, LogOut, LayoutDashboard, PlusCircle, FileText, QrCode } from 'lucide-react'; 

// Set Firebase log level to debug for better console feedback
setLogLevel('debug');

// --- FIREBASE GLOBALS (Assuming these are available in the execution context) ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;


// =========================================================================
// NOTE: In your real project, replace these placeholders with actual imports:
// import AuthPage from './AuthPage.jsx';
// import DashboardPage from './DashboardPage.jsx';
// import AddDrugPage from './AddDrugPage.jsx';
// import CreatePrescriptionPage from './CreatePrescriptionPage.jsx';
// import ScanQRPage from './ScanQRPage.jsx';
// =========================================================================

const AuthPage = (props) => (
    <div className="text-center p-20 text-gray-500 bg-white shadow-lg rounded-xl">
        AuthPage Loaded. (Use your full component here)
    </div>
);
const DashboardPage = (props) => (
    <div className="text-center p-20 text-gray-500 bg-white shadow-lg rounded-xl">
        DashboardPage Loaded.
    </div>
);
const AddDrugPage = (props) => (
    <div className="text-center p-20 text-gray-500 bg-white shadow-lg rounded-xl">
        AddDrugPage Loaded.
    </div>
);
const CreatePrescriptionPage = (props) => (
    <div className="text-center p-20 text-gray-500 bg-white shadow-lg rounded-xl">
        CreatePrescriptionPage Loaded.
    </div>
);
const ScanQRPage = (props) => (
    <div className="text-center p-20 text-gray-500 bg-white shadow-lg rounded-xl">
        ScanQRPage Loaded.
    </div>
);


// --- Navigation Component ---

const Navigation = ({ currentPage, setPage, userId, handleSignOut }) => {
    const navItems = [
        { name: 'Dashboard', page: 'dashboard', icon: LayoutDashboard },
        { name: 'Add Drug', page: 'addDrug', icon: PlusCircle },
        { name: 'New Rx', page: 'createPrescription', icon: FileText },
        { name: 'Scan QR', page: 'scanQR', icon: QrCode },
    ];

    return (
        <header className="bg-white shadow-md sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-indigo-700">
                    <Clipboard className="inline-block mr-2 -mt-1 h-6 w-6 text-indigo-500" />
                    PharmaManager
                </h1>
                
                {userId && (
                    <nav className="hidden md:flex space-x-4">
                        {navItems.map(item => (
                            <button
                                key={item.page}
                                onClick={() => setPage(item.page)}
                                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition duration-150 
                                    ${currentPage === item.page 
                                        ? 'bg-indigo-100 text-indigo-700 font-semibold' 
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                            >
                                <item.icon className="h-4 w-4 mr-1" />
                                {item.name}
                            </button>
                        ))}
                    </nav>
                )}

                <div className="flex items-center space-x-4">
                    {userId && (
                        <>
                            <div className="hidden lg:block text-sm text-gray-500 truncate max-w-xs">
                                <User className="inline-block h-4 w-4 mr-1 -mt-0.5" /> 
                                User: {userId.substring(0, 8)}...
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-200 transition duration-150"
                            >
                                <LogOut className="h-4 w-4 mr-1" />
                                Sign Out
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};


// --- MAIN APPLICATION COMPONENT ---

const App = () => {
    // State for Firebase instances and user data
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState('dashboard'); // Default page

    // 1. Firebase Initialization and Authentication
    useEffect(() => {
        if (!firebaseConfig) {
            setError("Firebase configuration is missing.");
            return;
        }

        try {
            const app = initializeApp(firebaseConfig);
            const firestore = getFirestore(app);
            const firebaseAuth = getAuth(app);

            setDb(firestore);
            setAuth(firebaseAuth);

            // Auth listener
            const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
                if (user) {
                    setUserId(user.uid);
                    if (currentPage === 'auth') setCurrentPage('dashboard');
                } else {
                    setUserId(null);
                    setCurrentPage('auth');
                }
                setIsAuthReady(true);
                setIsSigningIn(false);
            });

            // Initial sign-in attempt
            const performInitialSignIn = async () => {
                setIsSigningIn(true);
                try {
                    if (initialAuthToken) {
                        await signInWithCustomToken(firebaseAuth, initialAuthToken);
                        console.log("Signed in with custom token.");
                    } else {
                        await signInAnonymously(firebaseAuth);
                        console.log("Signed in anonymously.");
                    }
                } catch (e) {
                    console.error("Authentication Error:", e.message);
                    setError(`Initial sign-in failed: ${e.message}`);
                }
            };

            performInitialSignIn();

            return () => unsubscribe();
        } catch (e) {
            console.error("Firebase Initialization Error:", e.message);
            setError(`Initialization failed: ${e.message}`);
        }
    }, []);

    // 2. Logout function
    const handleSignOut = useCallback(async () => {
        if (auth) {
            try {
                await signOut(auth);
            } catch (e) {
                console.error("Sign Out Error:", e.message);
            }
        }
    }, [auth]);

    // 3. Page Router
    const renderPage = () => {
        if (!userId) {
            return <AuthPage auth={auth} setIsSigningIn={setIsSigningIn} setError={setError} />;
        }

        switch (currentPage) {
            case 'addDrug':
                return <AddDrugPage userId={userId} db={db} />;
            case 'createPrescription':
                return <CreatePrescriptionPage userId={userId} db={db} />;
            case 'scanQR':
                return <ScanQRPage userId={userId} />;
            case 'dashboard':
            default:
                return <DashboardPage userId={userId} db={db} />;
        }
    };

    // 4. Loading/Error Screens
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-red-50 p-4 font-['Inter']">
                <div className="bg-white p-6 rounded-lg shadow-xl border-t-4 border-red-500 max-w-lg">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">System Error</h2>
                    <p className="text-gray-700">{error}</p>
                </div>
            </div>
        );
    }

    if (!isAuthReady || isSigningIn) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 font-['Inter']">
                <div className="flex items-center text-xl text-indigo-600">
                    <svg
                        className="animate-spin -ml-1 mr-3 h-6 w-6 text-indigo-500"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 
                            5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 
                            5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                    {isSigningIn ? 'Logging in...' : 'Initializing App...'}
                </div>
            </div>
        );
    }

    // 5. Main Render
    return (
        <div className="min-h-screen bg-gray-50 font-['Inter']">
            <script src="https://cdn.tailwindcss.com"></script>
            <Navigation 
                currentPage={currentPage} 
                setPage={setCurrentPage} 
                userId={userId} 
                handleSignOut={handleSignOut} 
            />
            <main className="max-w-7xl mx-auto pb-12">
                {renderPage()}
            </main>
        </div>
    );
};

export default App;
