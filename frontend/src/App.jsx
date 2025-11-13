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

    // Filter drugs based on search term
    const filteredDrugs = MOCK_DRUG_DATABASE.filter(drug => 
        drug.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (drug) => {
        setSearchTerm(drug.name);
        onSelect(drug.id, drug.name);
        setIsSearching(false);
    };

    return (
        <div className="relative flex-1">
            <input
                className="border p-2 rounded w-full"
                placeholder="Search for Drug Name (e.g., Paracetamol)"
                value={searchTerm}
                onFocus={() => setIsSearching(true)}
                onChange={e => {
                    setSearchTerm(e.target.value);
                    // Clear the selected ID if the user starts typing
                    if (e.target.value.toLowerCase() !== MOCK_DRUG_DATABASE.find(d => d.id === selectedId)?.name.toLowerCase()) {
                         onSelect("", "");
                    }
                }}
            />
            {isSearching && filteredDrugs.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-b-md max-h-48 overflow-y-auto shadow-lg">
                    {filteredDrugs.slice(0, 5).map(drug => (
                        <div
                            key={drug.id}
                            className="p-2 hover:bg-indigo-100 cursor-pointer text-sm"
                            onClick={() => handleSelect(drug)}
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
            <h2 className="text-xl font-semibold mb-3">Doctor — Create Prescription</h2>

            <div className="mb-2">
                <label className="block text-sm font-medium">Patient Name</label>
                <input className="border p-2 rounded w-full" value={patientName} onChange={e => setPatientName(e.target.value)} />
            </div>

            <div className="mb-3">
                <label className="block text-sm font-medium">Medicines</label>
                {items.map((it, i) => (
                    <div key={i} className="flex gap-2 items-start mb-4 p-2 bg-gray-50 rounded-lg border">
                        {/* DrugSelector component */}
                        <DrugSelector 
                            selectedId={it.drug}
                            onSelect={(id, name) => updateDrugSelection(i, id, name)}
                        />

                        <input placeholder="Dosage (e.g., 500mg twice daily)" value={it.dosage} onChange={e => updateItem(i, "dosage", e.target.value)} className="border p-2 rounded w-40" />
                        
                        <input 
                            placeholder="Quantity" 
                            type="number" 
                            value={it.quantity} 
                            onChange={e => updateItem(i, "quantity", e.target.value)} 
                            className="border p-2 rounded w-24 text-center" 
                            min="1"
                        />
                        <button onClick={() => removeItem(i)} className="p-2 bg-red-100 rounded text-red-600 font-bold hover:bg-red-200 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                        </button>
                    </div>
                ))}
                <button onClick={addItem} className="px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white transition duration-150 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg> Add medicine
                </button>
            </div>
            
            <div className="mb-4">
                <label className="block text-sm font-medium">Instructions</label>
                <textarea className="border p-2 rounded w-full resize-none" rows="3" value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="e.g., Take with food. Do not operate heavy machinery."></textarea>
            </div>


            <div className="flex gap-2">
                <button onClick={createPrescription} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition duration-150 shadow-md" disabled={loading}>
                    {loading ? "Creating..." : "Create Prescription & QR"}
                </button>
            </div>

            {msg && <div className={`mt-3 text-sm font-semibold ${msg.startsWith("Error") ? 'text-red-600 bg-red-100 p-2 rounded' : 'text-green-600'}`}>{msg}</div>}

            {qrDataUrl && (
                <div className="mt-4 bg-gray-100 p-4 rounded shadow-lg flex items-center gap-4">
                    <img src={qrDataUrl} alt="QR Code" className="w-32 h-32 object-contain bg-white p-1 border rounded-md" />
                    <div>
                        <div className="mb-2 text-sm text-gray-700 font-medium">Scan this code to verify the prescription details.</div>
                        <div className="mb-2">Token (ID): <span className="font-mono text-indigo-700 font-semibold text-sm select-all">{token}</span></div>
                        <a download={`${token}.png`} href={qrDataUrl} className="inline-block px-3 py-1 bg-gray-300 hover:bg-gray-400 rounded text-sm transition duration-150">Download QR</a>
                    </div>
                </div>
            )}
        </div>
    );
}

function PharmacistTab() {
    const [prescription, setPrescription] = useState(null);
    const [error, setError] = useState(null);
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
        try {
            if (!token) throw new Error("Please enter a token.");
            
            // FIX: Re-adding the Authorization header based on your successful curl command.
            // This confirms your backend requires a token for GET requests on this endpoint.
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
        }
    }

    function startScanner() {
        setError(null);
        setPrescription(null);
        const Html5Qrcode = window.Html5Qrcode;
        if (!Html5Qrcode) {
            setError("html5-qrcode script not loaded. Please ensure it's linked.");
            return;
        }
        
        if (readerRef.current) return;
        
        const elementId = "reader";
        const html5QrCode = new Html5Qrcode(elementId);
        readerRef.current = html5QrCode;
        
        html5QrCode.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: 250 },
            (decodedText) => {
                html5QrCode.stop().then(() => {
                    readerRef.current = null;
                    fetchByToken(decodedText);
                }).catch(()=>{ readerRef.current = null; fetchByToken(decodedText); });
            },
            (err) => {}
        ).catch(err => {
            // Refined error message to guide the user on common issues
            const errorMessage = (err.message || String(err)).includes("not supported")
                ? "Camera access failed: This is often caused by missing **HTTPS** (secure connection) or browser restrictions on mobile. Please use the **Manual Lookup** feature below."
                : "Camera access failed: " + (err.message || err);

            setError(errorMessage);
            readerRef.current = null;
        });
    }

    function stopScanner() {
        if (readerRef.current) {
            if (typeof readerRef.current.stop === 'function') {
                readerRef.current.stop().catch(()=>{});
            }
            readerRef.current = null;
        }
    }

    async function markDispensed() {
        if (!prescription || prescription.dispensed) return;
        setError(null);
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
            setPrescription(json.data || json); 
            setError("Prescription marked as dispensed successfully!");
        } catch (e) {
            setError("Dispense failed: " + e.message);
        }
    }

    return (
        <div className="p-2">
            <h2 className="text-xl font-semibold mb-3">Pharmacist — Scan QR or Lookup</h2>

            <div className="flex gap-3 mb-4">
                <button onClick={startScanner} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition duration-150 shadow-md">Start Camera Scan</button>
                <button onClick={stopScanner} className="px-4 py-2 border border-gray-300 hover:bg-gray-100 rounded transition duration-150">Stop Camera</button>
            </div>

            <div id="reader" className="w-full mb-4 rounded-lg overflow-hidden border-4 border-dashed border-gray-300" style={{ height: 300, background: "#f8f8f8" }}></div>

            <div className="mb-5 p-4 border rounded-lg bg-gray-50">
                <label className="block text-sm font-medium mb-1">Or enter prescription ID manually</label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Enter Prescription ID" 
                        value={manualToken} 
                        onChange={e => setManualToken(e.target.value)}
                        className="border p-2 rounded flex-1 font-mono text-sm" 
                    />
                    <button onClick={() => fetchByToken(manualToken)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded transition duration-150">Lookup</button>
                </div>
            </div>

            {error && <div className="text-red-600 bg-red-100 p-3 rounded mb-3 whitespace-pre-line">{error}</div>}

            {prescription ? (
                <div className="bg-green-50 p-4 rounded shadow-md border border-green-200">
                    <h3 className="text-lg font-bold text-green-800 border-b pb-1 mb-2">Prescription Found (ID: {prescription._id})</h3>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                         <div><strong>Patient:</strong> {prescription.patientName}</div>
                         <div><strong>Date:</strong> {new Date(prescription.createdAt).toLocaleDateString()}</div>
                         <div className="col-span-2"><strong>Doctor ID:</strong> <span className="font-mono text-xs">{prescription.doctor}</span></div>
                    </div>
                    <div className="mt-3 p-3 bg-white rounded border">
                         <strong>Instructions:</strong> <p className="mt-1 text-gray-700">{prescription.instructions || 'No special instructions provided.'}</p>
                    </div>

                    <strong className="block mb-1 mt-4 text-gray-700">Medication List:</strong>
                    <ul className="list-disc ml-5 bg-white p-3 rounded border">
                        {prescription.medication.map((item, idx) => (
                            <li key={idx} className="text-sm border-b last:border-b-0 py-1">
                                
                                <strong>{item.drug?.name || `Drug ID: ${item.drug}`}</strong> 
                                <div className="text-gray-600 ml-2">
                                     <span className="font-medium">Dose:</span> {item.dosage} | 
                                     <span className="font-medium"> Qty:</span> {item.quantity}
                                </div>
                            </li>
                        ))}
                    </ul>
                    
                    <div className="mt-4 p-3 bg-white rounded border">
                        <div className="text-lg font-semibold flex justify-between items-center">
                            Dispensed Status: 
                            <span className={`font-bold text-2xl ${prescription.dispensed ? 'text-red-600' : 'text-green-600'}`}>
                                {prescription.dispensed ? 'DISPENSED' : 'PENDING'}
                            </span>
                        </div>
                        {!prescription.dispensed && 
                            <button onClick={markDispensed} className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded shadow transition duration-150">
                                Mark as Dispensed (Hypothetical Route)
                            </button>
                        }
                    </div>
                </div>
            ) : (
                <div className="text-sm text-gray-500 p-3 bg-white rounded border">No prescription loaded. Scan a QR code or enter an ID.</div>
            )}
        </div>
    );
}

// Main App Component
export default function App() {
    const [tab, setTab] = React.useState("doctor");

    return (
        <div className="min-h-screen p-6 bg-gray-100 font-sans">
            <script src="https://unpkg.com/html5-qrcode"></script> 
            
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-6">
                <header className="flex items-center justify-between mb-8 border-b pb-4">
                    <h1 className="text-3xl font-extrabold text-indigo-700">MediScanQR</h1>
                    <div className="flex rounded-lg overflow-hidden border border-indigo-200 shadow-inner">
                        <button 
                            className={`px-4 py-2 text-sm font-medium transition duration-150 ${tab === "doctor" ? "bg-indigo-600 text-white shadow-md" : "text-indigo-600 bg-white hover:bg-indigo-50"}`} 
                            onClick={() => setTab("doctor")}
                        >
                            <span className="hidden sm:inline">Doctor View</span>
                            <span className="sm:hidden">Doctor</span>
                        </button>
                        <button 
                            className={`px-4 py-2 text-sm font-medium transition duration-150 ${tab === "pharm" ? "bg-indigo-600 text-white shadow-md" : "text-indigo-600 bg-white hover:bg-indigo-50"}`} 
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