// --- CreatePrescriptionPage.jsx Content ---

import React, { useState } from 'react';
import { FileText, Save, Users, Stethoscope, Pills } from 'lucide-react'; 
// Assuming the following dependencies are available or injected:
// import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore'; 
// const db = getFirestore(initializeApp(firebaseConfig));
// const appId = '...'; 

/**
 * CreatePrescriptionPage Component: Allows authenticated users to input and save 
 * a new prescription to a private collection in Firestore.
 * * @param {object} props 
 * @param {string} props.userId The currently authenticated user's ID.
 */
const CreatePrescriptionPage = ({ userId }) => {
    const [patientName, setPatientName] = useState('');
    const [doctorName, setDoctorName] = useState('');
    const [drugName, setDrugName] = useState('');
    const [dosage, setDosage] = useState('');
    const [instructions, setInstructions] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    
    // Placeholder function for Firestore access (you'd need to ensure 
    // db is initialized and available in a real, separate file context)
    const savePrescriptionToFirestore = async (prescriptionData) => {
        // --- REAL IMPLEMENTATION GOES HERE ---
        /*
        try {
            // NOTE: Using a private user collection path
            const path = `/artifacts/${appId}/users/${userId}/prescriptions`;
            const prescriptionsRef = collection(db, path);
            await addDoc(prescriptionsRef, { 
                ...prescriptionData, 
                createdAt: serverTimestamp(),
                userId: userId
            });
            return { success: true, id: 'mock-Rx-12345' };
        } catch (error) {
            console.error("Error saving prescription:", error);
            return { success: false, error: error.message };
        }
        */

        // DEMO PLACEHOLDER: Simulate API delay and success
        await new Promise(resolve => setTimeout(resolve, 1500));
        return { success: true, id: `Rx-${Date.now().toString().slice(-6)}` };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        if (!patientName || !doctorName || !drugName || !dosage || !instructions) {
            setMessage({ type: 'error', text: 'Please fill out all prescription fields.' });
            return;
        }

        setLoading(true);

        const prescriptionData = {
            patientName,
            doctorName,
            drugName,
            dosage,
            instructions,
            // Additional fields like expiry, refill count would go here
        };

        const result = await savePrescriptionToFirestore(prescriptionData);
        
        if (result.success) {
            setMessage({ 
                type: 'success', 
                text: `Prescription created successfully! ID: ${result.id}. Data saved to your private collection.`
            });
            // Clear form fields after successful save
            setPatientName('');
            setDoctorName('');
            setDrugName('');
            setDosage('');
            setInstructions('');
        } else {
            setMessage({ type: 'error', text: `Failed to save: ${result.error || 'Check console.'}` });
        }
        setLoading(false);
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <header className="mb-8 flex items-center border-b pb-4">
                <FileText className="w-8 h-8 text-indigo-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-800">New Patient Prescription</h2>
            </header>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-2xl space-y-6">
                
                {/* --- Patient and Doctor Info --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center text-indigo-600 font-semibold mb-2 md:col-span-2">
                        <Users className="w-5 h-5 mr-2" /> Patient/Prescriber Details
                    </div>
                    <div>
                        <label htmlFor="patientName" className="block text-sm font-medium text-gray-700">Patient Full Name</label>
                        <input type="text" id="patientName" value={patientName} onChange={(e) => setPatientName(e.target.value)} required 
                            className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label htmlFor="doctorName" className="block text-sm font-medium text-gray-700">Prescribing Doctor Name</label>
                        <input type="text" id="doctorName" value={doctorName} onChange={(e) => setDoctorName(e.target.value)} required 
                            className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                </div>

                {/* --- Drug Details --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border rounded-lg bg-indigo-50">
                    <div className="flex items-center text-indigo-800 font-semibold mb-2 md:col-span-3">
                        <Pills className="w-5 h-5 mr-2" /> Medication Details
                    </div>
                    <div>
                        <label htmlFor="drugName" className="block text-sm font-medium text-gray-700">Drug Name (e.g., Amoxicillin)</label>
                        <input type="text" id="drugName" value={drugName} onChange={(e) => setDrugName(e.target.value)} required 
                            className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="dosage" className="block text-sm font-medium text-gray-700">Dosage / Form (e.g., 500mg Capsule)</label>
                        <input type="text" id="dosage" value={dosage} onChange={(e) => setDosage(e.target.value)} required 
                            className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div className="md:col-span-3">
                        <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">Patient Instructions (SIG)</label>
                        <textarea id="instructions" rows="3" value={instructions} onChange={(e) => setInstructions(e.target.value)} required 
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
                            <Save className="w-5 h-5 mr-2" />
                            Save New Prescription
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default CreatePrescriptionPage;