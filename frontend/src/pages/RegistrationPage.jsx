import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/api'; 
import { useAuth } from '../hooks/useAuth';

const RegistrationPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user'); // Default to 'user' or specify 'doctor'/'pharmacist' based on requirements
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth(); // Optionally log in after registration

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const userData = { name, email, password, role };
            const res = await register(userData);
            
            // Assuming successful registration returns user data and token
            login(res.data.token); 
            setSuccess('Registration successful! Redirecting...');
            navigate('/', { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <h1>Register for MediScanQR</h1>
            <form onSubmit={handleSubmit}>
                {error && <p className="error-message">{error}</p>}
                {success && <p style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>{success}</p>}
                
                <div>
                    <label>Full Name:</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                    <label>Email:</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                    <label>Password:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                {/* Optional: Allow selection of role, but usually, this is restricted for 'doctor'/'pharmacist' */}
                {/* <div>
                    <label>Account Type:</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)} required>
                        <option value="user">Patient/User</option>
                        <option value="doctor">Doctor</option>
                        <option value="pharmacist">Pharmacist</option>
                    </select>
                </div> */}
                <button type="submit">Register</button>
                <p style={{ marginTop: '15px', color: '#ccc' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--color-primary)' }}>Login here</Link>
                </p>
            </form>
        </div>
    );
};

export default RegistrationPage;