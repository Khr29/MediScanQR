import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import DoctorPortal from './DoctorPortal';
import PharmacyPortal from './PharmacyPortal';

function Layout() {
  return (
    <div>
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 3500,
          style: {
            background: '#0f172a',
            color: '#ffffff',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '600',
            padding: '12px 18px',
          },
        }} 
      />

      {/* Top Navigation with Real Web Links */}
      <div className="navbar-wrapper">
        <div className="container-nav">
          <NavLink to="/doctor" className="brand-logo">
            🏥 MediScan<span>QR</span>
          </NavLink>

          <div className="portal-switch-pill">
            <NavLink 
              to="/doctor" 
              className={({ isActive }) => `pill-btn ${isActive ? 'active' : ''}`}
            >
              🩺 Doctor Portal
            </NavLink>
            <NavLink 
              to="/pharmacy" 
              className={({ isActive }) => `pill-btn ${isActive ? 'active' : ''}`}
            >
              💊 Pharmacy Portal
            </NavLink>
          </div>
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="laptop-workspace">
        <div className="laptop-grid">
          
          <div className="hero-left">
            <div className="hero-tag">
              ⚡ Digital Prescription Network
            </div>
            <h1 className="hero-heading">
              Secure prescription verification for healthcare
            </h1>
            <p className="hero-desc">
              Prevent fraud, eliminate paper prescriptions, and ensure single-dispense accuracy with instant QR verification.
            </p>

            <div className="trust-list">
              <div className="trust-item">
                <div className="check-icon">✓</div>
                <span>Encrypted doctor authentication & digital signatures</span>
              </div>
              <div className="trust-item">
                <div className="check-icon">✓</div>
                <span>Real-time pharmacy QR scanning & instant validation</span>
              </div>
              <div className="trust-item">
                <div className="check-icon">✓</div>
                <span>Anti-fraud protocol prevents duplicate medicine dispensing</span>
              </div>
            </div>
          </div>

          <div className="hero-right">
            <Routes>
              <Route path="/" element={<Navigate to="/doctor" replace />} />
              <Route path="/doctor" element={<DoctorPortal />} />
              <Route path="/pharmacy" element={<PharmacyPortal />} />
            </Routes>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}