import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; 

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth(); 

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      navigate('/', { replace: true }); 
    } catch (err) {
      // Catch error from API (status 401 usually)
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    }
  };

  if (isAuthenticated) return null; 

  return (
    // TEMPORARY: Removed inline styling to force visibility
    <div> 
      <h1>Login to MediScanQR</h1>
      <form onSubmit={handleSubmit}>
        {/* The error message will show up if the backend is running and rejects the login */}
        {error && <p style={{color: 'red', fontWeight: 'bold'}}>{error}</p>} 
        <div>
          <label style={{color: 'white'}}>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label style={{color: 'white'}}>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Login</button>
        
        <p style={{ marginTop: '15px' }}>
            Don't have an account? <Link to="/register" style={{ color: 'lightblue' }}>Register here</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;