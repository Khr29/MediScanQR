import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getPrescriptions } from '../services/api';

const DashboardPage = () => {
  const { user, loading } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (user && !loading) {
      const fetchPrescriptions = async () => {
        try {
          const res = await getPrescriptions();
          setPrescriptions(res.data);
        } catch (error) {
          console.error("Error fetching prescriptions:", error);
        } finally {
          setDataLoading(false);
        }
      };
      fetchPrescriptions();
    }
  }, [user, loading]);

  if (loading || dataLoading) return <div>Loading Dashboard...</div>;
  if (!user) return null; 

  const roleTitle = user.role.charAt(0).toUpperCase() + user.role.slice(1);
  
  return (
    <div>
      <h1>{roleTitle} Dashboard</h1>
      
      {/* Action Buttons */}
      <div style={{ marginBottom: '30px' }}>
        {user.role === 'doctor' && (
          <Link to="/prescriptions/new" className="button btn-primary">
            + Create New Prescription
          </Link>
        )}

        {user.role === 'pharmacist' && (
          <Link to="/scan" className="button btn-success">
            Start QR Scan to Fulfill
          </Link>
        )}
      </div>

      {/* Prescription List */}
      <h2>Your Prescriptions ({prescriptions.length})</h2>
      {prescriptions.length === 0 ? (
        <p>No prescriptions found.</p>
      ) : (
        <ul>
          {prescriptions.map(p => (
            <li key={p._id}>
              <p><strong>Patient:</strong> {p.patientName}</p>
              <p><strong>Medication:</strong> {p.medication?.name || 'N/A'}</p>
              <p>
                <strong>Status:</strong> 
                <span className={`status-${p.status}`}>
                  &nbsp;{p.status.toUpperCase()}
                </span>
              </p>
              <Link to={`/prescriptions/${p._id}`} style={{ display: 'block', marginTop: '10px' }}>
                View Details
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DashboardPage;