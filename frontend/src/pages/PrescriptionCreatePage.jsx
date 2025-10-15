import React, { useState, useEffect } from 'react';
import { createPrescription, getDrugs } from '../services/api';
import QRCodeViewer from '../components/QRCodeViewer';

const PrescriptionCreatePage = () => {
  const [patientName, setPatientName] = useState('');
  const [selectedDrug, setSelectedDrug] = useState('');
  const [dosage, setDosage] = useState('');
  const [drugs, setDrugs] = useState([]);
  const [qrCode, setQrCode] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDrugs = async () => {
      try {
        const res = await getDrugs();
        setDrugs(res.data);
      } catch (err) {
        // Use the CSS class for error messages here if needed, or stick to the component state
        setError('Failed to fetch drug list.');
      }
    };
    fetchDrugs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setQrCode(null);

    const prescriptionData = {
      patientName,
      medication: selectedDrug,
      dosage,
    };

    try {
      const res = await createPrescription(prescriptionData); 
      
      if (res.data.qrCode) {
        setQrCode(res.data.qrCode);
      } else {
        alert('Prescription created, but QR code was not returned.');
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create prescription.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setQrCode(null);
    setPatientName('');
    setSelectedDrug('');
    setDosage('');
  };

  return (
    <div>
      <h1>Create New Prescription</h1>
      {error && <p className="error-message">{error}</p>}
      
      {qrCode && (
        <div style={{ textAlign: 'center' }}>
          <h2>✅ Prescription Created!</h2>
          <QRCodeViewer base64String={qrCode} />
          {/* FIX: Removed the incorrect inline style 'var(--color-primary)'.
            The global text color will be used, or you can add a class here
            if you want a specific style. We'll use a hardcoded bright text.
          */}
          <p style={{ color: '#00bcd4' }}>Patient must present this QR code to the pharmacist.</p> 

          <button onClick={handleReset} className="btn-primary" style={{ marginTop: '30px' }}>
            Create Another Prescription
          </button>
        </div>
      )}

      {!qrCode && (
        <form onSubmit={handleSubmit}>
          <div>
            <label>Patient Name:</label>
            <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} required />
          </div>
          <div>
            <label>Medication:</label>
            <select value={selectedDrug} onChange={(e) => setSelectedDrug(e.target.value)} required>
              <option value="">Select a Drug</option>
              {drugs.map(drug => (
                <option key={drug._id} value={drug._id}>
                  {drug.name} ({drug.manufacturer})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Dosage/Instructions:</label>
            <textarea value={dosage} onChange={(e) => setDosage(e.target.value)} required />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : 'Generate Prescription & QR Code'}
          </button>
        </form>
      )}
    </div>
  );
};

export default PrescriptionCreatePage;