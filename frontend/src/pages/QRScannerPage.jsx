import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scanner } from '@yudiel/react-qr-scanner'; 

const QRScannerPage = () => {
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState('Awaiting scan...');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleScan = (result) => {
    if (result) {
      setScanning(false);
      
      const prescriptionId = result.text;
      setResult(`QR Code Scanned! ID: ${prescriptionId}`);
      
      // Navigate to the detail page to view and fulfill
      navigate(`/prescriptions/${prescriptionId}`); 
    }
  };

  const handleError = (err) => {
    console.error(err);
    setError('Error accessing camera or scanning.');
  };

  return (
    <div style={{ textAlign: 'center', padding: '30px' }}>
      <h1>Scan Prescription QR Code</h1>
      <p style={{ color: '#aaa', marginBottom: '20px' }}>Hold the QR code steady in front of your camera.</p>
      
      {error && <p className="error-message">{error}</p>}

      <div style={{ maxWidth: '400px', margin: '20px auto', border: '3px solid var(--color-primary)', borderRadius: '10px', overflow: 'hidden' }}>
        {scanning ? (
          <Scanner
            onResult={handleScan}
            onError={handleError}
            constraints={{ facingMode: 'environment' }} 
            styles={{ 
                container: { width: '100%', height: 'auto' }, 
                video: { width: '100%', height: 'auto' } 
            }}
          />
        ) : (
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#333' }}>
              <p>Scanning stopped.</p>
          </div>
        )}
      </div>
      
      <p style={{ marginTop: '15px' }}>Status: {result}</p>
      
      <button onClick={() => setScanning(!scanning)} className="btn-primary" style={{ marginTop: '20px' }}>
        {scanning ? 'Stop Scanning' : 'Start/Restart Scanning'}
      </button>
    </div>
  );
};

export default QRScannerPage;