// --- ScanQRPage.jsx Content ---

import React, { useState } from 'react';
import { QrCode, Search, FileText, CheckCircle, XCircle } from 'lucide-react'; 

// Mock Data Source for Lookup
const mockPrescriptions = {
    "RX-1001": {
        id: "RX-1001",
        patientName: "Jane Doe",
        doctorName: "Dr. A. Smith",
        drugName: "Amoxicillin",
        dosage: "500mg Capsule",
        instructions: "Take one capsule by mouth every 8 hours for 7 days.",
        status: "Ready for Pickup",
        date: "2025-10-25"
    },
    "RX-1002": {
        id: "RX-1002",
        patientName: "John B. Day",
        doctorName: "Dr. B. Jones",
        drugName: "Lisinopril",
        dosage: "10mg Tablet",
        instructions: "Take one tablet once daily.",
        status: "Filled",
        date: "2025-09-15"
    }
};

/**
 * ScanQRPage Component: Simulates scanning a QR code to look up a prescription.
 * @param {object} props 
 * @param {string} props.userId The currently authenticated user's ID.
 */
const ScanQRPage = ({ userId }) => {
    const [scanInput, setScanInput] = useState('');
    const [lookupResult, setLookupResult] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // Simulates looking up the prescription ID in Firestore
    const handleLookup = async (e) => {
        e.preventDefault();
        setLookupResult(null);
        if (!scanInput) return;

        setLoading(true);

        // Simulate API/Firestore lookup delay
        await new Promise(resolve => setTimeout(resolve, 800)); 

        const id = scanInput.toUpperCase().trim();
        const prescription = mockPrescriptions[id];

        if (prescription) {
            setLookupResult({ type: 'success', data: prescription });
        } else {
            setLookupResult({ type: 'error', message: `No prescription found for ID: ${id}.` });
        }
        setLoading(false);
    };

    const renderResult = () => {
        if (!lookupResult) return null;

        if (lookupResult.type === 'error') {
            return (
                <div className="bg-red-100 p-6 rounded-lg border-l-4 border-red-500 flex items-center shadow-inner">
                    <XCircle className="w-6 h-6 text-red-600 mr-3" />
                    <p className="text-red-800 font-medium">{lookupResult.message}</p>
                </div>
            );
        }

        const data = lookupResult.data;
        return (
            <div className="bg-white p-6 rounded-xl shadow-xl border-t-4 border-green-500 transition duration-300">
                <div className="flex items-center text-green-600 font-semibold mb-4 border-b pb-3">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span className="text-xl">Prescription Found: {data.id}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="col-span-2">
                        <strong className="text-gray-700 block">Patient:</strong> 
                        <span className="text-lg font-medium text-gray-900">{data.patientName}</span>
                    </div>
                    <div>
                        <strong className="text-gray-700 block">Doctor:</strong> {data.doctorName}
                    </div>
                    <div>
                        <strong className="text-gray-700 block">Status:</strong> 
                        <span className={`font-semibold ${data.status === 'Ready for Pickup' ? 'text-blue-500' : 'text-gray-500'}`}>
                            {data.status}
                        </span>
                    </div>
                    
                    <div className="col-span-2 mt-4 p-4 bg-indigo-50 rounded-lg">
                        <strong className="text-indigo-800 block mb-1">Medication:</strong>
                        <p className="text-gray-800 text-base font-semibold">{data.drugName} - {data.dosage}</p>
                    </div>

                    <div className="col-span-2">
                        <strong className="text-gray-700 block">Instructions:</strong>
                        <p className="italic text-gray-600">{data.instructions}</p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <header className="mb-8 flex items-center border-b pb-4">
                <QrCode className="w-8 h-8 text-indigo-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-800">Scan & Verify Prescription</h2>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Scanner Simulation Area */}
                <div className="bg-gray-800 p-8 rounded-xl shadow-2xl relative flex flex-col items-center justify-center h-96">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4/5 h-px bg-red-500 animate-pulse-line"></div>
                    </div>
                    <QrCode className="w-24 h-24 text-gray-600 opacity-30 mb-4" />
                    <p className="text-gray-400 text-lg">Scanning Area Active...</p>
                    <style>{`
                        @keyframes pulse-line {
                            0% { transform: translateY(-100%); opacity: 0; }
                            50% { transform: translateY(100%); opacity: 1; }
                            100% { transform: translateY(-100%); opacity: 0; }
                        }
                        .animate-pulse-line {
                            animation: pulse-line 2s infinite linear;
                        }
                    `}</style>
                </div>
                
                {/* Manual Lookup Form and Results */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                            <Search className="w-5 h-5 mr-2" /> Manual ID Lookup
                        </h3>
                        <form onSubmit={handleLookup} className="flex space-x-2">
                            <input 
                                type="text" 
                                placeholder="Enter Prescription ID (e.g., RX-1001)"
                                value={scanInput}
                                onChange={(e) => setScanInput(e.target.value)}
                                required 
                                className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" 
                            />
                            <button 
                                type="submit" 
                                disabled={loading}
                                className={`py-3 px-6 rounded-lg text-white font-semibold transition duration-150 shadow-md flex items-center ${
                                    loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                                }`}
                            >
                                {loading ? (
                                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                ) : (
                                    'Lookup'
                                )}
                            </button>
                        </form>
                    </div>

                    {renderResult()}
                </div>
            </div>
        </div>
    );
};

export default ScanQRPage;