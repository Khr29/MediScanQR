// --- AddDrugPage.jsx Content ---

import React, { useState } from 'react';
import { PlusCircle, Database, Box, Tag, Zap } from 'lucide-react'; 
// Assuming the following dependencies are available or injected:
// import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore'; 
// const db = getFirestore(initializeApp(firebaseConfig));
// const appId = '...'; 

/**
 * AddDrugPage Component: Form to add a new drug to the public inventory collection.
 * @param {object} props 
 * @param {string} props.userId The currently authenticated user's ID.
 */
const AddDrugPage = ({ userId }) => {
    const [name, setName] = useState('');
    const [dosage, setDosage] = useState('');
    const [stock, setStock] = useState(0);
    const [supplier, setSupplier] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    
    // Placeholder function for Firestore access
    const addDrugToFirestore = async (drugData) => {
        // --- REAL IMPLEMENTATION GOES HERE ---
        /*
        try {
            // NOTE: Using the public collection path
            const path = `/artifacts/${appId}/public/data/drugs`;
            const drugsRef = collection(db, path);
            await addDoc(drugsRef, { 
                ...drugData, 
                stock: parseInt(drugData.stock), // Ensure stock is stored as a number
                createdAt: serverTimestamp(),
                addedByUserId: userId // To track who added the public data
            });
            return { success: true, id: 'mock-drug-id' };
        } catch (error) {
            console.error("Error saving drug:", error);
            return { success: false, error: error.message };
        }
        */

        // DEMO PLACEHOLDER: Simulate API delay and success
        await new Promise(resolve => setTimeout(resolve, 1500));
        return { success: true, id: `DRG-${Date.now().toString().slice(-6)}` };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        if (!name || !dosage || stock === null || !supplier) {
            setMessage({ type: 'error', text: 'Please fill out all fields correctly.' });
            return;
        }
        if (stock < 0) {
            setMessage({ type: 'error', text: 'Stock quantity cannot be negative.' });
            return;
        }

        setLoading(true);

        const drugData = {
            name,
            dosage,
            stock: Number(stock),
            supplier,
        };

        const result = await addDrugToFirestore(drugData);
        
        if (result.success) {
            setMessage({ 
                type: 'success', 
                text: `Drug "${name}" added successfully to the public inventory.`
            });
            // Clear form fields
            setName('');
            setDosage('');
            setStock(0);
            setSupplier('');
        } else {
            setMessage({ type: 'error', text: `Failed to save drug: ${result.error || 'Check console.'}` });
        }
        setLoading(false);
    };

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <header className="mb-8 flex items-center border-b pb-4">
                <PlusCircle className="w-8 h-8 text-indigo-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-800">Add New Public Inventory Item</h2>
            </header>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-2xl space-y-6">
                
                {/* --- Drug Identification --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center text-indigo-600 font-semibold mb-2 md:col-span-2">
                        <Tag className="w-5 h-5 mr-2" /> Basic Drug Info
                    </div>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Drug Name (e.g., Aspirin)</label>
                        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required 
                            className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label htmlFor="dosage" className="block text-sm font-medium text-gray-700">Dosage / Strength (e.g., 81mg, 250mg/5ml)</label>
                        <input type="text" id="dosage" value={dosage} onChange={(e) => setDosage(e.target.value)} required 
                            className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                </div>

                {/* --- Stock and Supply --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg bg-indigo-50">
                    <div className="flex items-center text-indigo-800 font-semibold mb-2 md:col-span-2">
                        <Box className="w-5 h-5 mr-2" /> Stock & Logistics
                    </div>
                    <div>
                        <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Current Stock Quantity</label>
                        <input type="number" id="stock" value={stock} min="0" onChange={(e) => setStock(e.target.value)} required 
                            className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label htmlFor="supplier" className="block text-sm font-medium text-gray-700">Supplier Name</label>
                        <input type="text" id="supplier" value={supplier} onChange={(e) => setSupplier(e.target.value)} required 
                            className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                </div>

                {/* --- Submission and Message --- */}
                {message && (
                    <div className={`p-4 rounded-lg text-sm transition-all duration-300 ${
                        message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'
                    }`}>
                        {message.text}
                    </div>
                )}

                <button type="submit" disabled={loading}
                    className={`w-full py-3 rounded-lg text-white font-semibold transition duration-200 shadow-lg flex justify-center items-center ${
                        loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800'
                    }`}>
                    {loading ? (
                        <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : (
                        <>
                            <Database className="w-5 h-5 mr-2" />
                            Commit Drug to Public Inventory
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default AddDrugPage;