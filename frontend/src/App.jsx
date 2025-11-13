import React, { useState, useRef, useEffect } from "react";

// Renamed to be more generic, as this token is required for both POST (Doctor) and GET (Pharmacist)
const FAKE_AUTH_TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MDU2NDU4YjAxZGUwZDgxYjdkYmVhYiIsInJvbGUiOiJkb2N0b3IiLCJpYXQiOjE3NjMwMjYzNjAsImV4cCI6MTc2NTYxODM2MH0.d4wmKslYLYF8BfvsTKbeilQCBne6SDcpoGdW_5oeTvM"; 
const API_BASE_URL = "http://localhost:5000/api/v1/prescriptions";

// --- MOCK DRUG DATABASE (In a real app, this would be fetched from /api/v1/drugs) ---
const MOCK_DRUG_DATABASE = [
    { id: "69056523b01de0d81b7dbeb3", name: "Paracetamol (500mg)" },
    { id: "69056523b01de0d81b7dbeb4", name: "Amoxicillin (250mg)" },
    { id: "69056523b01de0d81b7dbeb5", name: "Lisinopril (10mg)" },
    { id: "69056523b01de0d81b7dbeb6", name: "Insulin Glargine" },
];

/**
 * Component to handle drug selection via name, but internally manage the ID.
 * @param {object} props - { selectedId, onSelect }
 */
const DrugSelector = ({ selectedId, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState(selectedId ? MOCK_DRUG_DATABASE.find(d => d.id === selectedId)?.name : "");
    const [isSearching, setIsSearching] = useState(false);
    const wrapperRef = useRef(null);

    // Filter drugs based on search term
    const filteredDrugs = MOCK_DRUG_DATABASE.filter(drug => 
        drug.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (drug) => {
        setSearchTerm(drug.name);
        onSelect(drug.id, drug.name);
        setIsSearching(false);
    };
    
    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsSearching(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);


    return (
        <div className="relative flex-1" ref={wrapperRef}>
            <input
                className="border p-2 rounded w-full focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Search for Drug Name (e.g., Paracetamol)"
                value={searchTerm}
                onFocus={() => setIsSearching(true)}
                onChange={e => {
                    const newTerm = e.target.value;
                    setSearchTerm(newTerm);
                    // Clear the selected ID if the user starts typing something that doesn't match the current selection
                    const currentlySelectedName = MOCK_DRUG_DATABASE.find(d => d.id === selectedId)?.name;
                    if (currentlySelectedName && newTerm.toLowerCase() !== currentlySelectedName.toLowerCase()) {
                         onSelect("", "");
                    } else if (!currentlySelectedName && newTerm.length > 0) {
                         onSelect("", "");
                    }
                }}
                onBlur={() => {
                    // This blur handles closing, but we use the useEffect hook for external clicks
                    // For better UX, let's keep the focus/blur management simple here
                }}
            />
            {isSearching && filteredDrugs.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-b-md max-h-48 overflow-y-auto shadow-lg top-full mt-1">
                    {filteredDrugs.slice(0, 5).map(drug => (
                        <div
                            key={drug.id}
                            className="p-2 hover:bg-indigo-100 cursor-pointer text-sm"
                            onMouseDown={(e) => { // Use onMouseDown to prevent blur event from firing before click
                                e.preventDefault();
                                handleSelect(drug);
                            }}
                        >
                            {drug.name}
                        </div>
                    ))}
                    {filteredDrugs.length > 5 && <div className="p-2 text-xs text-gray-500">...and {filteredDrugs.length - 5} more</div>}
                </div>
            )}
        </div>
    );
};
// --- END DrugSelector Component ---


function DoctorTab() {
    const [patientName, setPatientName] = useState("Jane Smith");
    const [instructions, setInstructions] = useState("Take after meals and avoid driving.");
    
    // State now stores both the ID (for API) and Name (for UI)
    const [items, setItems] = useState([
        { 
            drug: MOCK_DRUG_DATABASE[0].id, 
            drugName: MOCK_DRUG_DATABASE[0].name, 
            dosage: "500mg twice a day", 
            quantity: 10 
        }
    ]);
    
    const [qrDataUrl, setQrDataUrl] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState(null);

    /**
     * Updates a specific field (dosage, quantity) in the medication list.
     */
    function updateItem(idx, key, val) {
        const newItems = [...items];
        let valueToStore = val;
        
        if (key === 'quantity') {
            // Ensure quantity is stored as a number
            valueToStore = parseInt(val, 10) || 0;
        }
        
        newItems[idx][key] = valueToStore;
        setItems(newItems);
    }

    /**
     * Updates the drug ID and name for a selected item.
     */
    function updateDrugSelection(idx, drugId, drugName) {
        const newItems = [...items];
        newItems[idx].drug = drugId;
        newItems[idx].drugName = drugName;
        setItems(newItems);
    }
    
    function addItem() {
        setItems([...items, { drug: "", drugName: "", dosage: "", quantity: 0 }]);
    }
    
    function removeItem(i) {
        const arr = items.filter((_, idx) => idx !== i);
        setItems(arr);
    }

    async function createPrescription() {
        setLoading(true);
        setMsg(null);
        setQrDataUrl(null);
        setToken(null);
        
        // Improved validation: checking for valid name and valid drug IDs
        if (!patientName || patientName.trim() === "") {
            setMsg("Error: Patient name is required.");
            setLoading(false);
            return;
        }
        if (items.some(item => !item.drug || !item.dosage || item.quantity <= 0)) {
            setMsg("Error: All medication items must have a selected drug, dosage, and a quantity greater than zero.");
            setLoading(false);
            return;
        }

        try {
          // The payload uses the 'drug' ID (not the 'drugName')
          const payload = {
            patientName,
            medication: items.map(item => ({
                drug: item.drug, // This is the Mongoose ID
                dosage: item.dosage,
                quantity: item.quantity,
            })),
            instructions, 
          };

          const res = await fetch(API_BASE_URL, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                // Doctor creating a prescription MUST be authorized
                "Authorization": FAKE_AUTH_TOKEN, 
            },
            body: JSON.stringify(payload)
          });

          if (!res.ok) {
            let errorBody = await res.text();
            try {
                const errorJson = JSON.parse(errorBody);
                errorBody = errorJson.message || errorBody;
            } catch {}
            throw new Error(`Server responded with ${res.status}: ${errorBody || res.statusText}`);
          }
          
          const json = await res.json();
          setQrDataUrl(json.data.qrCode);
          setToken(json.data._id);
          setMsg("Prescription created successfully! ID: " + json.data._id);
        } catch (e) {
          setMsg("Error: " + (e.message || "Failed to create prescription."));
        } finally {
          setLoading(false);
        }
    }

    return (
        <div>
            <h2 className="text-xl font-semibold mb-5 text-indigo-700">Doctor — Create Prescription</h2>

            <div className="mb-4 p-4 border rounded-lg bg-indigo-50/50">
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
                <input className="border p-2 rounded w-full focus:ring-indigo-500 focus:border-indigo-500" value={patientName} onChange={e => setPatientName(e.target.value)} />
            </div>

            <div className="mb-5">
                <label className="block text-lg font-medium text-gray-700 mb-3">Medicines</label>
                {items.map((it, i) => (
                    <div key={i} className="flex flex-wrap sm:flex-nowrap gap-3 items-start mb-4 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                        
                        <div className="w-full sm:w-auto sm:flex-1">
                            <label className="block text-xs text-gray-500 mb-1">Drug</label>
                            <DrugSelector 
                                selectedId={it.drug}
                                onSelect={(id, name) => updateDrugSelection(i, id, name)}
                            />
                        </div>

                        <div className="w-full sm:w-auto">
                            <label className="block text-xs text-gray-500 mb-1">Dosage</label>
                            <input placeholder="e.g., 500mg twice daily" value={it.dosage} onChange={e => updateItem(i, "dosage", e.target.value)} className="border p-2 rounded w-full sm:w-40 focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        
                        <div className="w-1/2 sm:w-24">
                            <label className="block text-xs text-gray-500 mb-1">Quantity</label>
                            <input 
                                placeholder="Qty" 
                                type="number" 
                                value={it.quantity} 
                                onChange={e => updateItem(i, "quantity", e.target.value)} 
                                className="border p-2 rounded w-full text-center focus:ring-indigo-500 focus:border-indigo-500" 
                                min="1"
                            />
                        </div>
                        <div className="w-1/2 sm:w-auto mt-6 sm:mt-0 pt-1 flex justify-end items-center">
                            <button onClick={() => removeItem(i)} className="p-2 bg-red-100 rounded-full text-red-600 font-bold hover:bg-red-200 transition">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                            </button>
                        </div>
                    </div>
                ))}
                <button onClick={addItem} className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white transition duration-150 flex items-center gap-1 text-sm font-medium shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg> Add medicine
                </button>
            </div>
            
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                <textarea className="border p-2 rounded w-full resize-none focus:ring-indigo-500 focus:border-indigo-500" rows="3" value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="e.g., Take with food. Do not operate heavy machinery."></textarea>
            </div>


            <div className="flex gap-2">
                <button onClick={createPrescription} className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition duration-150 shadow-lg font-semibold" disabled={loading}>
                    {loading ? "Creating..." : "Create Prescription & QR"}
                </button>
            </div>

            {msg && <div className={`mt-4 text-sm font-semibold p-3 rounded-xl ${msg.startsWith("Error") ? 'text-red-800 bg-red-100' : 'text-green-800 bg-green-100'}`}>{msg}</div>}

            {qrDataUrl && (
                <div className="mt-6 bg-gray-50 p-6 rounded-xl shadow-inner flex flex-col sm:flex-row items-center gap-6 border border-gray-200">
                    <img src={qrDataUrl} alt="QR Code" className="w-36 h-36 object-contain bg-white p-2 border-4 border-indigo-500 rounded-lg shadow-md" />
                    <div>
                        <div className="mb-3 text-lg text-indigo-700 font-bold">Prescription QR Code Generated</div>
                        <div className="mb-2 text-sm text-gray-700 font-medium">Scan this code with the Pharmacist View.</div>
                        <div className="mb-3">Token (ID): <span className="font-mono text-indigo-700 font-semibold text-sm select-all break-all bg-indigo-100 p-1 rounded">{token}</span></div>
                        <a download={`${token}.png`} href={qrDataUrl} className="inline-block px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm transition duration-150 font-medium shadow">Download QR</a>
                    </div>
                </div>
            )}
        </div>
    );
}

function PharmacistTab() {
    const [prescription, setPrescription] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false); // For manual lookup and dispense
    const [cameraActive, setCameraActive] = useState(false); // NEW STATE
    const readerRef = useRef(null);
    const [manualToken, setManualToken] = useState('');

    useEffect(() => {
        return () => {
            stopScanner();
        };
    }, []);

    async function fetchByToken(token) {
        setError(null);
        setPrescription(null);
        setLoading(true);
        try {
            if (!token) throw new Error("Please enter a token.");
            
            const res = await fetch(`${API_BASE_URL}/${encodeURIComponent(token)}`, {
                method: "GET",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": FAKE_AUTH_TOKEN, 
                },
            }); 
            
            if (!res.ok) {
                let errorBody = await res.text();
                try {
                    const errorJson = JSON.parse(errorBody);
                    errorBody = errorJson.message || errorBody;
                } catch {}
                throw new Error(errorBody || res.statusText);
            }
            
            const doc = await res.json();
            setPrescription(doc.data || doc);
        } catch (e) {
            setError("Lookup Failed: " + (e.message || "Failed to fetch prescription."));
        } finally {
            setLoading(false);
        }
    }

    function startScanner() {
        if (readerRef.current) return;
        setError(null);
        setPrescription(null);
        setCameraActive(true); // Set active immediately

        const Html5Qrcode = window.Html5Qrcode;
        if (!Html5Qrcode) {
            setError("html5-qrcode script not loaded. Please ensure it's linked.");
            setCameraActive(false);
            return;
        }
        
        const elementId = "reader";
        const html5QrCode = new Html5Qrcode(elementId);
        readerRef.current = html5QrCode;
        
        html5QrCode.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: 250 },
            (decodedText) => {
                // On success
                html5QrCode.stop().then(() => {
                    readerRef.current = null;
                    setCameraActive(false); 
                    fetchByToken(decodedText);
                }).catch(()=>{ 
                    readerRef.current = null; 
                    setCameraActive(false); 
                    fetchByToken(decodedText); 
                });
            },
            (err) => {} // Suppress continuous logging of scanning attempts
        ).catch(err => {
            // Camera initialization failure (the error you are seeing on mobile)
            const errorMessage = (err.message || String(err)).toLowerCase().includes("permission") || (err.message || String(err)).toLowerCase().includes("not allowed")
                ? "Camera access failed: This is often caused by missing **HTTPS** (secure connection) or browser restrictions on mobile. Please ensure your site is running on HTTPS or use the **Manual Lookup** feature below."
                : "Camera access failed: " + (err.message || err);

            setError(errorMessage);
            readerRef.current = null;
            setCameraActive(false);
        });
    }

    function stopScanner() {
        if (readerRef.current) {
            // Check if the stop method is defined and call it
            if (typeof readerRef.current.stop === 'function') {
                readerRef.current.stop().catch(()=>{});
            }
            readerRef.current = null;
        }
        setCameraActive(false); // Always set to false when stopping
    }

    async function markDispensed() {
        if (!prescription || prescription.dispensed) return;
        setError(null);
        setLoading(true);
        try {
            // This endpoint still uses the token for authorization
            const res = await fetch(`${API_BASE_URL}/${prescription._id}/dispense`, { 
                method: "POST",
                headers: { "Authorization": FAKE_AUTH_TOKEN } // Assuming same token allows dispensing for the demo
            });
            if (!res.ok) {
                const txt = await res.text();
                throw new Error(txt || res.statusText);
            }
            const json = await res.json();
            // Update prescription state with the newly dispensed status
            setPrescription(json.data || json); 
            setError("Prescription marked as dispensed successfully!");
        } catch (e) {
            setError("Dispense failed: " + e.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="p-2">
            <h2 className="text-xl font-semibold mb-5 text-indigo-700">Pharmacist — Scan QR or Lookup</h2>

            <div className="flex gap-3 mb-4">
                <button 
                    onClick={startScanner} 
                    className={`px-4 py-2 rounded-lg transition duration-150 shadow-md ${cameraActive ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                    disabled={cameraActive}
                >
                    {cameraActive ? 'Camera Active' : 'Start Camera Scan'}
                </button>
                <button 
                    onClick={stopScanner} 
                    className="px-4 py-2 border border-gray-300 hover:bg-gray-100 rounded-lg transition duration-150"
                    disabled={!cameraActive}
                >
                    Stop Camera
                </button>
            </div>

            {/* NEW: Conditional rendering/styling for the reader area */}
            <div 
                id="reader" 
                className={`w-full mb-4 rounded-xl overflow-hidden border-4 transition-all duration-300 ${cameraActive ? 'border-indigo-400' : 'border-dashed border-gray-300'}`} 
                style={{ height: cameraActive ? 300 : 0, background: "#f8f8f8" }}
            >
                {/* The html5-qrcode library will populate this div when active */}
            </div>
            
            {!cameraActive && (
                <div className="p-4 mb-4 text-center text-sm text-gray-500 bg-gray-100 rounded-xl">
                    Camera Scanner Inactive. Click 'Start Camera Scan' above or use manual lookup below.
                </div>
            )}


            <div className="mb-6 p-4 border rounded-xl bg-gray-50 shadow-sm">
                <label className="block text-sm font-medium mb-2 text-gray-700">Or enter prescription ID manually</label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Enter Prescription ID (e.g., 65f6c...)" 
                        value={manualToken} 
                        onChange={e => setManualToken(e.target.value)}
                        className="border p-2 rounded-lg flex-1 font-mono text-sm focus:ring-indigo-500 focus:border-indigo-500" 
                    />
                    <button 
                        onClick={() => fetchByToken(manualToken)} 
                        className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition duration-150 shadow-md"
                        disabled={loading}
                    >
                        {loading ? 'Fetching...' : 'Lookup'}
                    </button>
                </div>
            </div>

            {/* ERROR DISPLAY: Made more prominent */}
            {error && <div className="text-red-800 bg-red-100 p-4 rounded-xl mb-5 font-medium whitespace-pre-line border border-red-200 shadow-md">{error}</div>}

            {prescription ? (
                <div className="bg-green-50 p-6 rounded-xl shadow-2xl border border-green-200">
                    <h3 className="text-xl font-bold text-green-800 border-b pb-2 mb-3">Prescription Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 text-sm">
                            <div className="bg-white p-2 rounded-lg shadow-inner"><strong>Patient:</strong> <span className="text-gray-700">{prescription.patientName}</span></div>
                            <div className="bg-white p-2 rounded-lg shadow-inner"><strong>Date Issued:</strong> <span className="text-gray-700">{new Date(prescription.createdAt).toLocaleDateString()}</span></div>
                            <div className="col-span-2 bg-white p-2 rounded-lg shadow-inner"><strong>Doctor ID:</strong> <span className="font-mono text-xs text-gray-600 break-all">{prescription.doctor}</span></div>
                    </div>
                    
                    <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                            <strong className="block text-md mb-1 text-indigo-700">Instructions:</strong> <p className="text-gray-700 italic">{prescription.instructions || 'No special instructions provided.'}</p>
                    </div>

                    <strong className="block mb-2 mt-5 text-gray-700 text-lg">Medication List:</strong>
                    <ul className="bg-white p-4 rounded-xl border border-gray-200 shadow-inner">
                        {prescription.medication.map((item, idx) => (
                            <li key={idx} className="text-base py-2 px-3 border-b last:border-b-0 flex justify-between items-center hover:bg-gray-50 rounded-md">
                                <div className="font-semibold text-gray-800">{item.drug?.name || `Drug ID: ${item.drug}`}</div> 
                                <div className="text-gray-600 text-sm flex-shrink-0">
                                    <span className="font-medium bg-indigo-100 px-2 py-0.5 rounded-full">Dose: {item.dosage}</span>
                                    <span className="font-medium bg-indigo-100 px-2 py-0.5 rounded-full ml-2">Qty: {item.quantity}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                    
                    <div className="mt-5 p-4 bg-white rounded-xl border border-gray-300 shadow-md">
                        <div className="text-xl font-bold flex justify-between items-center">
                            Status: 
                            <span className={`px-3 py-1 rounded-full text-white font-extrabold text-lg ${prescription.dispensed ? 'bg-red-600' : 'bg-green-600'}`}>
                                {prescription.dispensed ? 'DISPENSED' : 'PENDING'}
                            </span>
                        </div>
                        {!prescription.dispensed && 
                            <button 
                                onClick={markDispensed} 
                                className="mt-4 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg transition duration-150 font-semibold"
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Mark as Dispensed (Hypothetical Route)'}
                            </button>
                        }
                    </div>
                </div>
            ) : (
                <div className="text-md text-gray-500 p-4 bg-white rounded-xl border border-gray-200 text-center">No prescription loaded. Scan a QR code or enter an ID above.</div>
            )}
        </div>
    );
}

// Main App Component
export default function App() {
    const [tab, setTab] = React.useState("doctor");

    return (
        <div className="min-h-screen p-4 sm:p-6 bg-gray-100 font-sans">
            {/* Load QR Code Scanner Library */}
            <script src="https://unpkg.com/html5-qrcode"></script> 
            
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-200">
                <header className="flex flex-col sm:flex-row items-center justify-between mb-8 border-b pb-4">
                    <h1 className="text-3xl font-extrabold text-indigo-700 mb-4 sm:mb-0">MediScanQR</h1>
                    <div className="flex rounded-xl overflow-hidden border border-indigo-200 shadow-lg">
                        <button 
                            className={`px-5 py-3 text-sm font-bold transition duration-150 ${tab === "doctor" ? "bg-indigo-600 text-white shadow-xl" : "text-indigo-600 bg-white hover:bg-indigo-50"}`} 
                            onClick={() => setTab("doctor")}
                        >
                            <span className="hidden sm:inline">Doctor View</span>
                            <span className="sm:hidden">Doctor</span>
                        </button>
                        <button 
                            className={`px-5 py-3 text-sm font-bold transition duration-150 ${tab === "pharm" ? "bg-indigo-600 text-white shadow-xl" : "text-indigo-600 bg-white hover:bg-indigo-50"}`} 
                            onClick={() => setTab("pharm")}
                        >
                            <span className="hidden sm:inline">Pharmacist View</span>
                            <span className="sm:hidden">Pharm</span>
                        </button>
                    </div>
                </header>

                <main>
                    {tab === "doctor" ? <DoctorTab /> : <PharmacistTab />}
                </main>
            </div>
        </div>
    );
}