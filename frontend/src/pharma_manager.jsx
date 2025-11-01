import React, { useState, useEffect, useCallback } from 'react';
import { 
    initializeApp, 
    setLogLevel 
} from 'firebase/app';
import { 
    getAuth, 
    signInAnonymously, 
    signInWithCustomToken, 
    onAuthStateChanged 
} from 'firebase/auth';
import { 
    getFirestore, 
    collection, 
    addDoc, 
    serverTimestamp,
    onSnapshot, 
    query,
    doc,        
    updateDoc, 
    deleteDoc   
} from 'firebase/firestore';
import { 
    LayoutDashboard, 
    PlusCircle, 
    FileText, 
    Trash2, 
    Edit, 
    User, 
    Loader2,
    CheckCircle,
    XCircle,
    Info 
} from 'lucide-react'; 

// 🚨 VS CODE CONFIG IMPORTS (Assumes firebaseConfig.js is in the src/ folder)
import { FIREBASE_CONFIG, INITIAL_AUTH_TOKEN, LOCAL_APP_ID } from './firebaseConfig';

// Set Firebase log level to debug for better console feedback
setLogLevel('debug');

// --- FIREBASE GLOBALS ADAPTATION ---
const appId = LOCAL_APP_ID;
const firebaseConfig = FIREBASE_CONFIG;
const initialAuthToken = INITIAL_AUTH_TOKEN;

// =========================================================================
// --- CORE UI COMPONENTS ---
// =========================================================================

/**
 * Renders a standard status/alert message.
 */
const StatusMessage = ({ type, message }) => {
    let baseClasses = "p-4 rounded-xl font-medium flex items-center shadow-lg";
    let icon;

    switch (type) {
        case 'success':
            baseClasses += " bg-green-100 text-green-800 border-l-4 border-green-500";
            icon = <CheckCircle className="w-5 h-5 mr-3" />;
            break;
        case 'error':
            baseClasses += " bg-red-100 text-red-800 border-l-4 border-red-500";
            icon = <XCircle className="w-5 h-5 mr-3" />;
            break;
        case 'info':
        default:
            baseClasses += " bg-blue-100 text-blue-800 border-l-4 border-blue-500";
            icon = <Info className="w-5 h-5 mr-3" />;
            break;
    }

    return (
        <div className={baseClasses} role="alert">
            {icon}
            <span>{message}</span>
        </div>
    );
};

/**
 * Renders a custom styled button.
 */
const CustomButton = ({ onClick, children, className = '', disabled = false, type = 'button' }) => (
    <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`px-6 py-3 font-semibold rounded-xl transition-all duration-200 
            flex items-center justify-center space-x-2 shadow-lg 
            hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
            ${className}`}
    >
        {children}
    </button>
);

/**
 * Renders a standardized input field.
 */
const InputField = ({ label, id, type = 'text', value, onChange, placeholder, required = false }) => (
    <div className="mb-4">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
    </div>
);

/**
 * Renders a confirmation modal for delete actions.
 */
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, isProcessing }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Overlay */}
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

                {/* Modal Panel */}
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                <Trash2 className="h-6 w-6 text-red-600" aria-hidden="true" />
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                    {title}
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                        {message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <CustomButton
                            onClick={onConfirm}
                            disabled={isProcessing}
                            className="w-full sm:ml-3 sm:w-auto bg-red-600 text-white hover:bg-red-700"
                        >
                            {isProcessing ? <Loader2 className="animate-spin w-5 h-5" /> : 'Delete'}
                        </CustomButton>
                        <CustomButton
                            onClick={onClose}
                            disabled={isProcessing}
                            className="mt-3 sm:mt-0 w-full sm:w-auto bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </CustomButton>
                    </div>
                </div>
            </div>
        </div>
    );
};

// =========================================================================
// --- PAGE COMPONENTS (Internal Header/Dashboard/AddDrug logic) ---
// =========================================================================

/**
 * Dashboard Page: Displays real-time inventory and handles delete actions.
 */
const DashboardPage = ({ userId, db, setPage }) => {
    const [drugs, setDrugs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [drugToDelete, setDrugToDelete] = useState(null); // Stores { id, name }
    const [isDeleting, setIsDeleting] = useState(false);
    const [actionStatus, setActionStatus] = useState(null); // For success/error messages after actions

    // Helper to construct the Firestore collection path
    const getCollectionPath = useCallback(() => {
        return `artifacts/${appId}/users/${userId}/drugs`;
    }, [userId]);

    // Real-time data listener effect
    useEffect(() => {
        if (!db || !userId) return;

        setLoading(true);
        setError(null);
        
        try {
            const drugsCollectionRef = collection(db, getCollectionPath());
            const q = query(drugsCollectionRef); 

            // Set up real-time listener (onSnapshot)
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const drugList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                
                // Sort by name client-side
                drugList.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

                setDrugs(drugList);
                setLoading(false);
            }, (err) => {
                console.error("Firestore Snapshot Error:", err);
                setError("Failed to fetch inventory data.");
                setLoading(false);
            });

            // Cleanup the listener on component unmount
            return () => unsubscribe();
        } catch (e) {
            console.error("Dashboard Setup Error:", e);
            setError("An error occurred while setting up the dashboard data listener.");
            setLoading(false);
        }
    }, [db, userId, getCollectionPath]);

    // Handler to open the delete confirmation modal
    const handleDeleteClick = (drug) => {
        setActionStatus(null); // Clear previous action status
        setDrugToDelete(drug);
        setModalOpen(true);
    };

    // Handler for the actual delete operation
    const confirmDelete = async () => {
        if (!drugToDelete || !db) return;

        setIsDeleting(true);

        try {
            const drugRef = doc(db, getCollectionPath(), drugToDelete.id);
            await deleteDoc(drugRef);

            setActionStatus({ 
                type: 'success', 
                message: `Drug '${drugToDelete.name}' has been successfully deleted.` 
            });
            setModalOpen(false);
            setDrugToDelete(null);

        } catch (error) {
            console.error("Error deleting document:", error);
            setActionStatus({ 
                type: 'error', 
                message: `Failed to delete '${drugToDelete.name}': ${error.message}` 
            });
        } finally {
            setIsDeleting(false);
        }
    };

    // Handler to set the page state to 'editDrug' and pass the drug data
    const handleEditClick = (drug) => {
        // We will implement the Edit component later, for now, we'll log it.
        console.log("Preparing to edit drug:", drug);
        // setPage('editDrug', drug); // Future implementation
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-extrabold text-gray-900">Inventory Dashboard</h2>
                <CustomButton 
                    onClick={() => setPage('addDrug')} 
                    className="bg-indigo-600 text-white hover:bg-indigo-700"
                >
                    <PlusCircle className="w-5 h-5" />
                    <span>Add New Drug</span>
                </CustomButton>
            </div>
            
            <div className="flex justify-between items-center mb-6 p-4 bg-white rounded-xl shadow-md border-t-2 border-indigo-200">
                <div className="text-sm text-gray-600 font-semibold">
                    Total Drugs in Stock: <span className="font-bold text-indigo-700">{drugs.length}</span>
                </div>
            </div>

            {/* Action Status Message (for delete success/failure) */}
            {actionStatus && (
                <div className="mb-6">
                    <StatusMessage type={actionStatus.type} message={actionStatus.message} />
                </div>
            )}
            {error && (
                <div className="mb-6">
                    <StatusMessage type="error" message={error} />
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center p-20 bg-white rounded-xl shadow-lg border-t-4 border-indigo-500">
                    <Loader2 className="animate-spin h-8 w-8 text-indigo-500 mr-3" />
                    <span className="text-lg text-indigo-600">Loading Inventory Data...</span>
                </div>
            ) : drugs.length === 0 ? (
                <div className="text-center p-20 bg-white rounded-xl shadow-lg border-t-4 border-indigo-500">
                    <p className="text-xl font-semibold text-gray-600 mb-4">Your inventory is empty.</p>
                    <p className="text-gray-500">Click the "Add Drug" tab or button to start tracking your medications.</p>
                </div>
            ) : (
                <div className="shadow-2xl overflow-hidden rounded-xl border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-indigo-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Name
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Strength
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Stock
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Manufacturer
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Expiry
                                </th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {drugs.map((drug) => (
                                <tr key={drug.id} className="hover:bg-indigo-50 transition duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {drug.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {drug.strength}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 rounded-full ${
                                            drug.stock < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                            {drug.stock}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {drug.manufacturer || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {drug.expiryDate || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                                        <CustomButton 
                                            onClick={() => handleEditClick(drug)} 
                                            className="bg-yellow-50 text-yellow-700 p-2 text-xs hover:bg-yellow-100 shadow-none"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </CustomButton>
                                        <CustomButton 
                                            onClick={() => handleDeleteClick(drug)} 
                                            className="bg-red-50 text-red-700 p-2 text-xs hover:bg-red-100 shadow-none"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </CustomButton>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Confirmation Modal Render */}
            <ConfirmationModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={confirmDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete the drug: "${drugToDelete?.name || ''}"? This action cannot be undone. This drug will be permanently removed from your inventory.`}
                isProcessing={isDeleting}
            />
        </div>
    );
};


/**
 * Add Drug Page: Form to add new drug to inventory.
 */
const AddDrugPage = ({ userId, db, setPage }) => {
    const [formData, setFormData] = useState({
        name: '',
        strength: '',
        stock: '',
        expiryDate: '',
        manufacturer: '',
        notes: ''
    });
    const [status, setStatus] = useState(null); 
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const getCollectionPath = useCallback(() => {
        return `artifacts/${appId}/users/${userId}/drugs`;
    }, [userId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus(null);
        setIsSaving(true);
        
        const numericStock = parseInt(formData.stock, 10);
        
        if (isNaN(numericStock) || numericStock <= 0) {
            setStatus({ type: 'error', message: "Stock must be a positive number." });
            setIsSaving(false);
            return;
        }

        if (!db || !userId) {
            setStatus({ type: 'error', message: "Database connection not ready. Please try again." });
            setIsSaving(false);
            return;
        }

        const drugData = {
            name: formData.name.trim(),
            strength: formData.strength.trim(),
            stock: numericStock,
            expiryDate: formData.expiryDate || null,
            manufacturer: formData.manufacturer.trim() || null,
            notes: formData.notes.trim() || null,
            createdAt: serverTimestamp(), // Firestore timestamp
        };

        try {
            const docRef = await addDoc(collection(db, getCollectionPath()), drugData);
            setStatus({ 
                type: 'success', 
                message: `Drug '${formData.name}' saved successfully (ID: ${docRef.id}).` 
            });
            // Clear form after successful save
            setFormData({
                name: '', strength: '', stock: '', expiryDate: '', manufacturer: '', notes: ''
            });

        } catch (error) {
            console.error("Error adding document: ", error);
            setStatus({ 
                type: 'error', 
                message: `Failed to save drug: ${error.message}.` 
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h2 className="text-3xl font-extrabold text-indigo-700 mb-8">Add New Drug to Inventory</h2>
            
            {status && (
                <div className="mb-6">
                    <StatusMessage type={status.type} message={status.message} />
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-2xl border-t-4 border-indigo-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField 
                        label="Drug Name" id="name" value={formData.name} onChange={handleChange} 
                        placeholder="e.g., Amoxicillin" required 
                    />
                    <InputField 
                        label="Strength" id="strength" value={formData.strength} onChange={handleChange} 
                        placeholder="e.g., 500mg, 10ml" required 
                    />
                    <InputField 
                        label="Current Stock Quantity" id="stock" type="number" value={formData.stock} onChange={handleChange} 
                        placeholder="e.g., 150" required 
                    />
                    <InputField 
                        label="Expiry Date" id="expiryDate" type="date" value={formData.expiryDate} onChange={handleChange} 
                    />
                </div>

                <div className="mt-6">
                    <InputField 
                        label="Manufacturer/Supplier" id="manufacturer" value={formData.manufacturer} onChange={handleChange} 
                        placeholder="e.g., PharmaCorp" 
                    />
                </div>

                <div className="mt-6">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                        Notes / Description
                    </label>
                    <textarea
                        id="notes"
                        rows="3"
                        value={formData.notes}
                        onChange={handleChange}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Additional notes about storage, dosage, or location."
                    ></textarea>
                </div>

                <div className="mt-8 flex justify-end">
                    <CustomButton 
                        type="submit" 
                        disabled={isSaving || !formData.name || !formData.strength || !formData.stock}
                        className="bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                        {isSaving ? <Loader2 className="animate-spin w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
                        <span>{isSaving ? 'Saving...' : 'Save Drug to Inventory'}</span>
                    </CustomButton>
                </div>
            </form>
        </div>
    );
};

/**
 * Placeholder for future Reports Page.
 */
const ReportsPage = () => (
    <div className="p-8 max-w-7xl mx-auto">
        <div className="p-20 bg-white rounded-xl shadow-lg border-t-4 border-indigo-500 text-center">
            <FileText className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Reports Page</h2>
            <p className="text-lg text-gray-600">This feature will allow you to generate inventory and expiry reports.</p>
            <p className="text-sm text-gray-400 mt-2">Coming Soon!</p>
        </div>
    </div>
);


// =========================================================================
// --- MAIN APPLICATION COMPONENT (Including Header/Nav) ---
// =========================================================================

export const App = () => {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [db, setDb] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    // 1. Initialize Firebase and handle Authentication
    useEffect(() => {
        if (!firebaseConfig) {
            console.error("Firebase config is missing. Check src/firebaseConfig.js.");
            return;
        }

        try {
            const app = initializeApp(firebaseConfig);
            const firestore = getFirestore(app);
            const authService = getAuth(app);
            
            setDb(firestore);

            // Authentication Listener
            const unsubscribe = onAuthStateChanged(authService, async (user) => {
                if (user) {
                    setUserId(user.uid);
                    setIsAuthReady(true);
                } else if (initialAuthToken) {
                    // This path is usually not used locally, but kept for completeness
                    await signInWithCustomToken(authService, initialAuthToken)
                        .catch(err => {
                            console.error("Custom token sign-in failed:", err);
                            signInAnonymously(authService).then(u => setUserId(u.user.uid)).catch(e => console.error("Anonymous sign-in failed:", e));
                        });
                } else {
                    // Fallback to anonymous sign-in (most common for local testing)
                    signInAnonymously(authService)
                        .then(u => {
                            setUserId(u.user.uid);
                            setIsAuthReady(true);
                        })
                        .catch(e => console.error("Anonymous sign-in failed:", e));
                }
            });

            return () => unsubscribe();

        } catch (e) {
            console.error("Firebase Initialization Error:", e);
        }
    }, []);

    const navigate = (page) => setCurrentPage(page);

    const renderPage = () => {
        if (!isAuthReady || !db || !userId) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                    <div className="p-12 text-center bg-white shadow-2xl rounded-xl max-w-md mx-auto border-t-4 border-indigo-500">
                        <Loader2 className="animate-spin h-8 w-8 text-indigo-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-indigo-700 mb-2">Connecting to Inventory System</h2>
                        <p className="text-gray-600">Please wait while we establish your secure session.</p>
                        <div className="mt-4 text-xs text-gray-400">User ID: {userId ? `User ID: ${userId.substring(0, 8)}...` : 'Authenticating...'}</div>
                    </div>
                </div>
            );
        }

        const pageProps = { userId, db, setPage: navigate };

        switch (currentPage) {
            case 'addDrug':
                return <AddDrugPage {...pageProps} />;
            case 'reports':
                return <ReportsPage />;
            case 'dashboard':
            default:
                return <DashboardPage {...pageProps} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="text-2xl font-bold text-indigo-700 flex items-center">
                            <PlusCircle className="w-6 h-6 mr-2" />
                            PharmaManager
                        </div>
                        
                        <nav className="flex space-x-1">
                            {/* Navigation Items */}
                            {[
                                { name: 'Dashboard', page: 'dashboard', icon: LayoutDashboard },
                                { name: 'Add Drug', page: 'addDrug', icon: PlusCircle },
                                { name: 'Reports', page: 'reports', icon: FileText },
                            ].map((item) => {
                                const Icon = item.icon;
                                const isActive = currentPage === item.page;
                                return (
                                    <button
                                        key={item.name}
                                        onClick={() => navigate(item.page)}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 flex items-center space-x-1
                                            ${isActive 
                                                ? 'bg-indigo-100 text-indigo-700 shadow-inner' 
                                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span>{item.name}</span>
                                    </button>
                                );
                            })}
                        </nav>

                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1 p-2 bg-gray-100 rounded-lg">
                                <User className="w-4 h-4 text-indigo-500" />
                                <span className="font-semibold">{userId ? `User ID: ${userId.substring(0, 8)}...` : 'Guest'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            <main className="flex-grow py-8">{renderPage()}</main>
        </div>
    );
};

export default App;