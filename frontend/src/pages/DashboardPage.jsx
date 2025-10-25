// --- DashboardPage.jsx Content ---

import React, { useState, useEffect, useMemo } from 'react';
import { LayoutDashboard, Users, PlusCircle, TrendingUp, AlertTriangle } from 'lucide-react';
// Assuming the following dependencies are available or injected:
// import { getFirestore, collection, onSnapshot, query } from 'firebase/firestore';
// import { initializeApp } from 'firebase/app';
// const firebaseConfig = {...}; // Passed from App.jsx
// const appId = '...';          // Passed from App.jsx


// --- Helper Components ---
const StatCard = ({ title, value, colorClass, icon: Icon }) => (
    <div className={`p-6 rounded-xl shadow-lg text-white transition-transform duration-300 hover:scale-[1.02] ${colorClass}`}>
        <div className="flex items-center justify-between">
            <p className="text-sm font-medium opacity-90">{title}</p>
            <Icon className="w-6 h-6 opacity-70" />
        </div>
        <p className="text-4xl font-extrabold mt-2">{value}</p>
    </div>
);

// --- Dashboard Component ---

/**
 * DashboardPage Component: Displays key performance indicators and a list of the public drug inventory.
 * @param {object} props 
 * @param {string} props.userId The currently authenticated user's ID.
 */
const DashboardPage = ({ userId }) => {
    const [drugs, setDrugs] = useState([]);
    const [prescriptionsCount, setPrescriptionsCount] = useState(0); // Placeholder state for other data
    const [isLoading, setIsLoading] = useState(true);

    // 1. Data Fetching (Public Drug Inventory)
    useEffect(() => {
        if (!userId) return;
        
        // This assumes the Firestore setup is available globally or passed via context/props
        // REAL CODE (Requires Firebase instances):
        /*
        const db = getFirestore(initializeApp(firebaseConfig));
        const path = `/artifacts/${appId}/public/data/drugs`;
        const drugsRef = collection(db, path);
        const q = query(drugsRef);
        */

        // DEMO PLACEHOLDER: Simulate Firestore data and live updates
        const mockData = [
            { id: 'd1', name: 'Amoxicillin', dosage: '500mg', stock: 150, createdAt: { toMillis: () => Date.now() - 86400000 } },
            { id: 'd2', name: 'Lisinopril', dosage: '10mg', stock: 45, createdAt: { toMillis: () => Date.now() - 3600000 } },
            { id: 'd3', name: 'Atorvastatin', dosage: '20mg', stock: 12, createdAt: { toMillis: () => Date.now() - 7200000 } },
        ];
        setDrugs(mockData);
        setPrescriptionsCount(42);
        setIsLoading(false);
        // End of DEMO PLACEHOLDER

        // Cleanup function for onSnapshot would go here
        // return () => unsubscribe(); 

    }, [userId]); // Dependency on userId ensures it only runs after authentication

    // 2. Computed Values
    const lowStockCount = useMemo(() => {
        return drugs.filter(drug => drug.stock <= 20).length;
    }, [drugs]);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-8 flex items-center">
                <LayoutDashboard className="w-8 h-8 text-indigo-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-800">Pharmacy Dashboard</h2>
            </header>
            
            {/* --- Key Performance Indicators (KPIs) --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard 
                    title="Total Drug Lines" 
                    value={drugs.length} 
                    colorClass="bg-indigo-600" 
                    icon={PlusCircle}
                />
                <StatCard 
                    title="Total Prescriptions (Private)" 
                    value={prescriptionsCount} 
                    colorClass="bg-green-600" 
                    icon={Users}
                />
                <StatCard 
                    title="Low Stock Items" 
                    value={lowStockCount} 
                    colorClass={lowStockCount > 0 ? "bg-red-600" : "bg-yellow-600"} 
                    icon={AlertTriangle}
                />
                <StatCard 
                    title="User ID (Active)" 
                    value={userId.substring(0, 8) + '...'} 
                    colorClass="bg-gray-700" 
                    icon={Users}
                />
            </div>

            {/* --- Recent Drug Inventory Table --- */}
            <h3 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Public Inventory Snapshot</h3>
            <div className="bg-white shadow-xl rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-indigo-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">Dosage</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">Stock</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">Date Added</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                            <tr><td colSpan="4" className="text-center py-8 text-gray-500">Loading drug inventory...</td></tr>
                        ) : drugs.length === 0 ? (
                            <tr><td colSpan="4" className="text-center py-8 text-gray-500">No drugs have been added to the public inventory.</td></tr>
                        ) : (
                            drugs
                                .sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis()) // Sort by newest first
                                .slice(0, 10) // Show up to 10 recent drugs
                                .map(drug => (
                                    <tr key={drug.id} className="hover:bg-gray-50 transition duration-100">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                                            {drug.stock <= 20 && <AlertTriangle className="w-4 h-4 text-red-500 mr-2" title="Low Stock Warning" />}
                                            {drug.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{drug.dosage}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold" style={{ color: drug.stock <= 20 ? 'red' : 'green' }}>
                                            {drug.stock}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {drug.createdAt ? new Date(drug.createdAt.toMillis()).toLocaleDateString() : 'N/A'}
                                        </td>
                                    </tr>
                                ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DashboardPage;