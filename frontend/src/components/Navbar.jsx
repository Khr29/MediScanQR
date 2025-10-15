import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav>
      <Link to="/" className="logo">MediScanQR</Link>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {user ? (
          <>
            <span style={{ marginRight: '15px', fontSize: '14px', color: '#ccc' }}>
              Logged in as: {user.role.toUpperCase()}
            </span>
            
            {/* New link for Doctor to add drugs (manage store) */}
            {user.role === 'doctor' && (
              <Link to="/drugs/new" className="button btn-success" style={{ padding: '8px 15px', marginRight: '10px' }}>
                Add Drug
              </Link>
            )}

            {user.role === 'doctor' && (
              <Link to="/prescriptions/new" className="button btn-primary" style={{ padding: '8px 15px' }}>
                Create Rx
              </Link>
            )}
            
            {user.role === 'pharmacist' && (
              <Link to="/scan" className="button btn-success" style={{ padding: '8px 15px' }}>
                Scan QR
              </Link>
            )}

            <button onClick={logout} className="btn-danger" style={{ marginLeft: '10px' }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="button btn-primary" style={{ marginRight: '10px' }}>Login</Link>
            <Link to="/register" className="button" style={{ backgroundColor: '#555', color: 'white' }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;