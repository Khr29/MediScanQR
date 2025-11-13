import React, { useState, useRef } from "react";

/*
  Simple single-file app with two tabs:
  - Doctor: create prescription (POST /api/prescriptions) => shows QR
  - Pharmacist: scan QR with camera (html5-qrcode) and fetch /api/prescriptions/:token
*/

function DoctorTab() {
  const [patientName, setPatientName] = useState("");
  const [instructions, setInstructions] = useState(""); // <-- FIX 1: Added state for instructions
  const [items, setItems] = useState([
    // NOTE: In a real app, 'drugId' would replace 'name' here for the backend
    { drugId: "DRUG-123", name: "Paracetamol", dosage: "500mg", freq: "1-0-1" }
  ]);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  function updateItem(idx, key, val) {
    const newItems = [...items];
    newItems[idx][key] = val;
    setItems(newItems);
  }
  function addItem() {
    setItems([...items, { drugId: "", name: "", dosage: "", freq: "" }]);
  }
  function removeItem(i) {
    const arr = items.filter((_, idx) => idx !== i);
    setItems(arr);
  }

  async function createPrescription() {
    setLoading(true);
    setMsg(null);
    try {
      // 1. Prepare the payload to match backend contract
      const payload = {
        patientName,
        // The backend expects 'medication', not 'items'. This is FIX 2.
        medication: items, 
        instructions, // FIX 1: Included the new required field
      };

      const res = await fetch("http://localhost:5000/api/v1/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload) // Sent the corrected payload
      });

      if (!res.ok) {
        // Attempt to parse JSON error message if available, otherwise fall back to text
        let errorBody = await res.text();
        try {
            const errorJson = JSON.parse(errorBody);
            errorBody = errorJson.message || errorBody;
        } catch {}
        throw new Error(errorBody || res.statusText);
      }
      
      const json = await res.json();
      // The backend prescriptionController returns 'data', not 'qrDataUrl' and 'token' directly
      setQrDataUrl(json.data.qrCode);
      setToken(json.data._id); // Assuming the token is the prescription ID for this example
      setMsg("Prescription created. Show this QR to the patient.");
    } catch (e) {
      setMsg("Error: " + (e.message || "failed"));
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
          <div key={i} className="flex gap-2 items-center mb-2">
            {/* Added 'drugId' placeholder to reflect backend expectations */}
            <input placeholder="Drug ID (e.g., DRUG-123)" value={it.drugId} onChange={e => updateItem(i, "drugId", e.target.value)} className="border p-2 rounded flex-1" />
            <input placeholder="Dosage" value={it.dosage} onChange={e => updateItem(i, "dosage", e.target.value)} className="border p-2 rounded w-24" />
            <input placeholder="Frequency" value={it.freq} onChange={e => updateItem(i, "freq", e.target.value)} className="border p-2 rounded w-28" />
            <button onClick={() => removeItem(i)} className="p-2 bg-red-100 rounded text-red-600 font-bold">X</button>
          </div>
        ))}
        <button onClick={addItem} className="px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white transition duration-150">Add medicine</button>
      </div>
      
      {/* FIX 1: Added input for instructions */}
      <div className="mb-4">
        <label className="block text-sm font-medium">Instructions</label>
        <textarea className="border p-2 rounded w-full resize-none" rows="3" value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="e.g., Take with food. Do not operate heavy machinery."></textarea>
      </div>


      <div className="flex gap-2">
        <button onClick={createPrescription} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition duration-150" disabled={loading}>
          {loading ? "Creating..." : "Create prescription & QR"}
        </button>
      </div>

      {msg && <div className={`mt-3 text-sm ${msg.startsWith("Error") ? 'text-red-600' : 'text-green-600'}`}>{msg}</div>}

      {qrDataUrl && (
        <div className="mt-4 bg-gray-100 p-4 rounded shadow-lg flex items-center gap-4">
          <img src={qrDataUrl} alt="QR Code" className="w-32 h-32 object-contain bg-white p-1 border" />
          <div>
            <div className="mb-2 text-sm text-gray-700">Scan this code to verify the prescription details.</div>
            <div className="mb-2">Token (ID): <span className="font-mono text-indigo-700 font-semibold text-sm">{token}</span></div>
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

  async function fetchByToken(token) {
    setError(null);
    setPrescription(null);
    try {
      if (!token) throw new Error("Please enter a token.");
      
      // Update endpoint to match the ID/token lookup
      const res = await fetch(`http://localhost:5000/api/v1/prescriptions/${encodeURIComponent(token)}`); 
      
      if (!res.ok) {
        let errorBody = await res.text();
        try {
            const errorJson = JSON.parse(errorBody);
            errorBody = errorJson.message || errorBody;
        } catch {}
        throw new Error(errorBody || res.statusText);
      }
      
      const doc = await res.json();
      setPrescription(doc);
    } catch (e) {
      setError("Lookup Failed: " + (e.message || "Failed to fetch prescription."));
    }
  }

  // Start camera scanner using html5-qrcode
  function startScanner() {
    setError(null);
    setPrescription(null);
    const Html5Qrcode = window.Html5Qrcode;
    if (!Html5Qrcode) {
      setError("html5-qrcode script not loaded. Please ensure it's linked.");
      return;
    }
    const elementId = "reader";
    if (readerRef.current) {
      // already running
      return;
    }
    
    const html5QrCode = new Html5Qrcode(elementId);
    readerRef.current = html5QrCode;
    
    // Attempt to start the scanner
    html5QrCode.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      (decodedText) => {
        // stop then fetch data
        html5QrCode.stop().then(() => {
          readerRef.current = null;
        }).catch(()=>{ readerRef.current = null; });
        fetchByToken(decodedText);
      },
      (err) => {
        // ignore minor scan errors
      }
    ).catch(err => setError("Camera start failed: " + err));
  }

  function stopScanner() {
    if (readerRef.current) {
      readerRef.current.stop().catch(()=>{});
      readerRef.current = null;
    }
  }

  async function markDispensed() {
    // This route is hypothetical and not provided, but the function remains for completeness.
    if (!prescription || prescription.dispensed) return;
    setError(null);
    try {
      // Note: This endpoint is hypothetical; the actual backend doesn't show a dispense route.
      const res = await fetch(`http://localhost:5000/api/v1/prescriptions/${prescription._id}/dispense`, { method: "POST" });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || res.statusText);
      }
      const json = await res.json();
      setPrescription(json.data || json); // Adjust based on actual backend response format
      setError("Prescription marked as dispensed successfully!");
    } catch (e) {
      setError("Dispense failed: " + e.message);
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-3">Pharmacist — Scan QR or Lookup</h2>

      <div className="flex gap-3 mb-4">
        <button onClick={startScanner} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition duration-150">Start Camera</button>
        <button onClick={stopScanner} className="px-4 py-2 border border-gray-300 hover:bg-gray-100 rounded transition duration-150">Stop Camera</button>
      </div>

      <div id="reader" className="w-full mb-4 rounded-lg overflow-hidden border border-gray-300" style={{ minHeight: 300, background: "#f8f8f8" }}></div>

      <div className="mb-5 p-4 border rounded-lg bg-gray-50">
        <label className="block text-sm font-medium mb-1">Or enter prescription ID manually</label>
        <div className="flex gap-2">
            <input 
                type="text" 
                placeholder="Enter Prescription ID" 
                value={manualToken} 
                onChange={e => setManualToken(e.target.value)}
                className="border p-2 rounded flex-1" 
            />
            <button onClick={() => fetchByToken(manualToken)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded transition duration-150">Lookup</button>
        </div>
      </div>

      {error && <div className="text-red-600 bg-red-100 p-3 rounded mb-3">{error}</div>}

      {prescription ? (
        <div className="bg-green-50 p-4 rounded shadow-md border border-green-200">
          <h3 className="text-lg font-bold text-green-800 border-b pb-1 mb-2">Prescription Found</h3>
          <div className="mb-2"><strong>Patient:</strong> {prescription.patientName}</div>
          <div className="mb-3"><strong>Doctor ID:</strong> {prescription.doctor}</div>
          <div className="mb-3"><strong>Instructions:</strong> {prescription.instructions || 'N/A'}</div>

          <strong className="block mb-1">Medication List:</strong>
          <ul className="list-disc ml-5 bg-white p-3 rounded border">
            {/* The backend provides 'medication' which contains an array of objects */}
            {prescription.medication.map((item, idx) => (
                <li key={idx} className="text-sm">
                    {/* Assuming the populated drug name is available via item.drug.name */}
                    <strong>{item.drug?.name || 'Drug Not Populated'}</strong> 
                    <span className="text-gray-600 ml-2">({item.dosage} / {item.freq})</span>
                </li>
            ))}
          </ul>
          
          <div className="mt-4">
            <div className="text-lg font-semibold">Dispensed Status: <span className={`font-bold ${prescription.dispensed ? 'text-red-600' : 'text-green-600'}`}>{String(prescription.dispensed || false)}</span></div>
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

export default function App() {
  const [tab, setTab] = React.useState("doctor");

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <script src="https://unpkg.com/html5-qrcode"></script>
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-6">
        <header className="flex items-center justify-between mb-8 border-b pb-4">
          <h1 className="text-3xl font-extrabold text-indigo-700">MediScanQR - Digital Prescription Demo</h1>
          <div className="flex rounded-lg overflow-hidden border border-indigo-200">
            <button 
              className={`px-4 py-2 text-sm font-medium transition duration-150 ${tab === "doctor" ? "bg-indigo-600 text-white shadow-md" : "text-indigo-600 bg-white hover:bg-indigo-50"}`} 
              onClick={() => setTab("doctor")}
            >
              Doctor View
            </button>
            <button 
              className={`px-4 py-2 text-sm font-medium transition duration-150 ${tab === "pharm" ? "bg-indigo-600 text-white shadow-md" : "text-indigo-600 bg-white hover:bg-indigo-50"}`} 
              onClick={() => setTab("pharm")}
            >
              Pharmacist View
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