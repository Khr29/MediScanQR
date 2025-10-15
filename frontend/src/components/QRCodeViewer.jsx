import React from 'react';

const QRCodeViewer = ({ base64String }) => {
  if (!base64String) {
    return <p>No QR Code data available.</p>;
  }

  const imageUrl = `data:image/png;base64,${base64String}`;

  return (
    <div className="qr-container">
      <h3>Prescription QR Code</h3>
      <img 
        src={imageUrl} 
        alt="QR Code for Prescription" 
        style={{ width: '180px', height: '180px', margin: '15px 0' }}
      />
      <p style={{ fontSize: '0.9em', color: '#aaa' }}>
        Scan this code at the pharmacy to fulfill the prescription.
      </p>
    </div>
  );
};

export default QRCodeViewer;