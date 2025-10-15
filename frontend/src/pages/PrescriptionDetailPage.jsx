import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPrescriptionById, fulfillPrescription } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const PrescriptionDetailPage = () => {
  const { id } = useParams();
  const { userRole } = useAuth();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPrescription = async () => {
    try {
      const res = await getPrescriptionById(id);
      setPrescription(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load prescription details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescription();
  }, [id]);

  const handleFulfill = async () => {
    if (!window.confirm('Are you sure you want to fulfill this prescription? This action cannot be undone.')) {
      return;
    }
    try {
      setLoading(true);
      await fulfillPrescription(id); 
      // Re-fetch to update the status on the page
      await fetchPrescription(); 
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fulfill prescription.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading prescription...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!prescription) return <div>Prescription not found.</div>;
  
  const statusClass = `status-${prescription.status}`;

  return (
    <div style={{ maxWidth: '600px', margin: '30px auto', padding: '20px', backgroundColor: '#1e1e1e', borderRadius: '10px' }}>
      <h1>Prescription Details</h1>
      
      <p style={{ fontSize: '1.2em', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
        Status: <span className={statusClass}>{prescription.status.toUpperCase()}</span>
      </p>

      <div style={{ padding: '15px', backgroundColor: '#2a2a2a', borderRadius: '8px' }}>
        <p><strong>ID:</strong> {prescription._id}</p>
        <p><strong>Patient Name:</strong> {prescription.patientName}</p>
        <p><strong>Medication:</strong> {prescription.medication?.name || 'N/A'}</p>
        <p><strong>Dosage:</strong> {prescription.dosage}</p>
        <p><strong>Doctor:</strong> {prescription.doctor.name}</p>
      </div>

      {/* Pharmacist Fulfill Action */}
      {userRole === 'pharmacist' && prescription.status === 'active' && (
        <button 
          onClick={handleFulfill} 
          disabled={loading}
          className="btn-success"
          style={{ marginTop: '20px', width: '100%' }} 
        >
          {loading ? 'Fulfilling...' : 'Fulfill Prescription'}
        </button>
      )}
      
      {userRole === 'pharmacist' && prescription.status === 'fulfilled' && (
        <p style={{ color: 'var(--color-success)', fontWeight: 'bold', marginTop: '20px', textAlign: 'center' }}>
          ✅ This prescription has been successfully fulfilled.
        </p>
      )}
    </div>
  );
};

export default PrescriptionDetailPage;