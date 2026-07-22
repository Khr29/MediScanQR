import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// Eye Icons (SVG)
const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export default function DoctorPortal() {
  const [token, setToken] = useState(localStorage.getItem('doctorToken') || '');
  const [doctor, setDoctor] = useState(JSON.parse(localStorage.getItem('doctorInfo')) || null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Prescription Inputs
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [medicine, setMedicine] = useState({ name: '', dosage: '', frequency: '' });
  const [qrCode, setQrCode] = useState('');
  const [rxId, setRxId] = useState('');

  // 1. Doctor Login
  const handleLogin = async (e) => {
    e.preventDefault();
    const toastId = toast.loading('Authenticating...');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      const { token, doctor } = res.data;

      localStorage.setItem('doctorToken', token);
      localStorage.setItem('doctorInfo', JSON.stringify(doctor));
      setToken(token);
      setDoctor(doctor);

      toast.success(`Welcome back, Dr. ${doctor.name}!`, { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // 2. Doctor Registration
  const handleRegister = async (e) => {
    e.preventDefault();
    const toastId = toast.loading('Creating doctor account...');
    setLoading(true);

    try {
      await axios.post('http://localhost:5000/api/auth/register', { name, email, password });
      toast.success('Account created! Please log in.', { id: toastId });
      setIsRegistering(false);
      setPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // 3. Logout
  const handleLogout = () => {
    localStorage.removeItem('doctorToken');
    localStorage.removeItem('doctorInfo');
    setToken('');
    setDoctor(null);
    setQrCode('');
    toast('Logged out successfully', { icon: '🚪' });
  };

  // 4. Create Prescription
  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading('Generating signed QR prescription...');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/prescriptions/create', {
        patientName,
        patientAge: Number(patientAge),
        doctorName: doctor.name,
        medicines: [medicine]
      });

      setQrCode(response.data.qrCodeImage);
      setRxId(response.data.prescriptionId);
      toast.success('Prescription generated successfully! ⚡', { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating prescription', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // UNAUTHENTICATED SCREEN
  if (!token || !doctor) {
    return (
      <div className="auth-card">
        <div className="auth-header">
          <span style={{ fontSize: '26px' }}>🩺</span>
          <h2 className="auth-title">
            {isRegistering ? 'Doctor Sign Up' : 'Doctor Authentication'}
          </h2>
        </div>

        {isRegistering ? (
          <form onSubmit={handleRegister} autoComplete="off">
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input
                className="input-field"
                placeholder="Dr. Sarah House"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input
                type="email"
                className="input-field"
                placeholder="doctor@hospital.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-field-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  style={{ paddingRight: '48px' }}
                  required
                />
                <button
                  type="button"
                  className="eye-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide Password' : 'Show Password'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating Account...' : 'Register Account'}
            </button>

            <div className="auth-footer">
              Already registered?{' '}
              <span className="auth-footer-link" onClick={() => setIsRegistering(false)}>
                Log In
              </span>
            </div>
          </form>
        ) : (
          <form onSubmit={handleLogin} autoComplete="off">
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input
                type="email"
                className="input-field"
                placeholder="doctor@hospital.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-field-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  style={{ paddingRight: '48px' }}
                  required
                />
                <button
                  type="button"
                  className="eye-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide Password' : 'Show Password'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Logging in...' : 'Log In to Portal'}
            </button>

            <div className="auth-footer">
              New doctor?{' '}
              <span className="auth-footer-link" onClick={() => setIsRegistering(true)}>
                Create an Account
              </span>
            </div>
          </form>
        )}
      </div>
    );
  }

  // AUTHENTICATED DASHBOARD VIEW
  return (
    <div className="dashboard-card">
      <div className="dashboard-header">
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>🩺 Doctor Workspace</h2>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Create and sign digital prescriptions</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
            Dr. {doctor.name}
          </span>
          <button 
            onClick={handleLogout} 
            style={{ 
              background: '#f1f5f9', 
              border: '1px solid #cbd5e1', 
              padding: '8px 16px', 
              borderRadius: '8px', 
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '700'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <form onSubmit={handlePrescriptionSubmit}>
        <div className="form-grid-laptop">
          <div className="input-group">
            <label className="input-label">Prescribing Doctor</label>
            <input 
              className="input-field"
              value={`Dr. ${doctor.name}`}
              disabled
              style={{ background: '#f8fafc', color: '#64748b' }}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Patient Name</label>
            <input 
              className="input-field"
              placeholder="e.g. Alex Mercer" 
              value={patientName} 
              onChange={(e) => setPatientName(e.target.value)} 
              required 
            />
          </div>

          <div className="input-group">
            <label className="input-label">Patient Age</label>
            <input 
              type="number" 
              className="input-field"
              placeholder="e.g. 28" 
              value={patientAge} 
              onChange={(e) => setPatientAge(e.target.value)} 
              required 
            />
          </div>
        </div>

        <div className="section-subtitle">Prescribed Medication</div>

        <div className="form-grid-laptop">
          <div className="input-group">
            <label className="input-label">Medicine Name</label>
            <input 
              className="input-field"
              placeholder="e.g. Paracetamol" 
              value={medicine.name} 
              onChange={(e) => setMedicine({ ...medicine, name: e.target.value })} 
              required 
            />
          </div>

          <div className="input-group">
            <label className="input-label">Dosage</label>
            <input 
              className="input-field"
              placeholder="e.g. 500mg" 
              value={medicine.dosage} 
              onChange={(e) => setMedicine({ ...medicine, dosage: e.target.value })} 
              required 
            />
          </div>

          <div className="input-group">
            <label className="input-label">Frequency</label>
            <input 
              className="input-field"
              placeholder="e.g. 1-0-1 (After Meals)" 
              value={medicine.frequency} 
              onChange={(e) => setMedicine({ ...medicine, frequency: e.target.value })} 
              required 
            />
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ marginTop: '12px' }} disabled={loading}>
          {loading ? 'Creating Prescription...' : '⚡ Generate Digital QR Prescription'}
        </button>
      </form>

      {qrCode && (
        <div className="qr-preview">
          <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '800' }}>
            Prescription Active
          </span>
          <h3 style={{ margin: '12px 0 4px 0', color: '#0f172a' }}>ID: {rxId}</h3>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 16px 0' }}>Patient can present this QR code directly at partner pharmacies</p>
          <img src={qrCode} alt="Prescription QR Code" />
        </div>
      )}
    </div>
  );
}