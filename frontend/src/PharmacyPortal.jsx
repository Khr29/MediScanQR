import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function PharmacyPortal() {
  const [rxId, setRxId] = useState('');
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  // Smart Parser: Extracts clean ID whether QR is JSON, URL, or plain text
  const extractPrescriptionId = (text) => {
    if (!text) return '';
    let cleanText = text.trim();

    // 1. If QR contains a JSON object
    if (cleanText.startsWith('{') && cleanText.endsWith('}')) {
      try {
        const parsed = JSON.parse(cleanText);
        return parsed.prescriptionId || parsed.rxId || parsed._id || parsed.id || cleanText;
      } catch (e) {
        // Fallback if JSON parse fails
      }
    }

    // 2. If QR contains a full Web URL (e.g., http://localhost:5173/verify/RX-984210)
    if (cleanText.includes('/verify/')) {
      const parts = cleanText.split('/verify/');
      return parts[parts.length - 1].split('?')[0].split('#')[0].trim();
    }

    // 3. Plain ID
    return cleanText;
  };

  // Core Verification API Call
  const verifyRxId = async (idToVerify) => {
    const targetId = idToVerify || rxId;
    if (!targetId || !targetId.trim()) {
      return toast.error('Please enter or scan a valid Prescription ID');
    }

    const toastId = toast.loading(`Verifying ID: ${targetId}...`);
    setLoading(true);

    try {
      const res = await axios.get(`http://localhost:5000/api/prescriptions/verify/${encodeURIComponent(targetId.trim())}`);
      setPrescription(res.data);
      toast.success('Prescription verified!', { id: toastId });
    } catch (err) {
      setPrescription(null);
      toast.error(err.response?.data?.message || 'Invalid or non-existent prescription', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleManualVerify = (e) => {
    e.preventDefault();
    verifyRxId(rxId);
  };

  // Camera Reader Hook
  useEffect(() => {
    if (!showScanner) return;

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 220, height: 220 } },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        console.log('RAW SCANNED QR:', decodedText);
        
        const cleanId = extractPrescriptionId(decodedText);
        setRxId(cleanId);
        setShowScanner(false);
        
        scanner.clear().catch((err) => console.error("Scanner clear error:", err));
        
        toast.success(`Scanned: ${cleanId}`);
        verifyRxId(cleanId);
      },
      (error) => {
        // Ignore frame scan errors
      }
    );

    return () => {
      scanner.clear().catch((err) => console.error("Cleanup error:", err));
    };
  }, [showScanner]);

// Mark Prescription as Dispensed
  const handleDispense = async () => {
    // 💡 Fix: Safely get the ID from the active prescription object
    const targetId = prescription?.prescriptionId || prescription?._id || rxId;

    if (!targetId) {
      return toast.error('No valid prescription ID found to dispense.');
    }

    const toastId = toast.loading('Locking prescription & dispensing...');
    setLoading(true);

    try {
      const res = await axios.post(`http://localhost:5000/api/prescriptions/dispense/${encodeURIComponent(targetId)}`);
      
      // Update state with the returned updated prescription object
      const updatedPrescription = res.data.prescription || res.data;
      setPrescription(updatedPrescription);

      toast.success('Medication dispensed & QR locked against reuse! 🔒', { id: toastId });
    } catch (err) {
      console.error('Dispense error:', err);
      toast.error(err.response?.data?.message || 'Dispense failed on server', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-card" style={{ maxWidth: '580px', margin: '0 auto' }}>
      <div className="dashboard-header">
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>💊 Pharmacy Scanner</h2>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Scan QR or input Rx Token to verify</p>
        </div>
        <button
          type="button"
          onClick={() => setShowScanner(!showScanner)}
          style={{
            background: showScanner ? '#fee2e2' : '#eff6ff',
            color: showScanner ? '#b91c1c' : '#2563eb',
            border: `1px solid ${showScanner ? '#fca5a5' : '#bfdbfe'}`,
            padding: '8px 14px',
            borderRadius: '10px',
            fontWeight: '700',
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          {showScanner ? '❌ Close Camera' : '📷 Open Camera'}
        </button>
      </div>

      {/* Camera View Area */}
      {showScanner && (
        <div style={{ marginBottom: '24px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
          <div id="qr-reader" style={{ width: '100%' }}></div>
        </div>
      )}

      {/* Manual Input Form */}
      <form onSubmit={handleManualVerify} style={{ marginBottom: '24px' }}>
        <div className="input-group">
          <label className="input-label">Prescription ID / QR Data</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              className="input-field"
              placeholder="e.g. RX-984210"
              value={rxId}
              onChange={(e) => setRxId(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary" style={{ width: '130px', marginTop: 0 }} disabled={loading}>
              {loading ? 'Scanning...' : 'Verify RX'}
            </button>
          </div>
        </div>
      </form>

      {/* Verified Prescription Info Card */}
      {prescription && (
        <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#64748b' }}>STATUS</span>
            {prescription.status === 'DISPENSED' ? (
              <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '800' }}>
                🛑 ALREADY DISPENSED
              </span>
            ) : (
              <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '800' }}>
                ✅ VALID / PENDING
              </span>
            )}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}><strong>Patient:</strong> {prescription.patientName} ({prescription.patientAge} yrs)</p>
            <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}><strong>Doctor:</strong> Dr. {prescription.doctorName}</p>
          </div>

          <div style={{ background: '#ffffff', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748b' }}>MEDICATION</span>
            {prescription.medicines?.map((m, idx) => (
              <div key={idx} style={{ marginTop: '6px', fontWeight: '700', fontSize: '15px' }}>
                • {m.name} - {m.dosage} ({m.frequency})
              </div>
            ))}
          </div>

          {prescription.status !== 'DISPENSED' ? (
            <button onClick={handleDispense} className="btn-primary" style={{ background: '#16a34a' }} disabled={loading}>
              🔒 Dispense Medicine & Lock Token
            </button>
          ) : (
            <div style={{ textAlign: 'center', color: '#b91c1c', fontSize: '13px', fontWeight: '700' }}>
              ⚠️ Warning: This prescription has already been fulfilled and cannot be reused.
            </div>
          )}
        </div>
      )}
    </div>
  );
}