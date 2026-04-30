import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [specialization, setSpecialization] = useState('');
  const [error, setError] = useState('');
  //const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { name, email, password, role, specialization: role === 'doctor' ? specialization : undefined };
      const res = await api.post('/auth/register', payload);
      localStorage.setItem('user', JSON.stringify(res.data));
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex justify-center items-center" style={{ minHeight: '70vh' }}>
      <div className="glass-panel" style={{ padding: '3rem', width: '100%', maxWidth: '450px' }}>
        <h2 className="text-gradient" style={{ textAlign: 'center', marginBottom: '2rem' }}>Create Account</h2>
        
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
        
        <form onSubmit={handleRegister} className="flex flex-col">
          <input
            type="text"
            placeholder="Full Name"
            className="input-field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email Address"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <select 
            className="input-field" 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            style={{ appearance: 'none', backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
          >
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
          </select>

          {role === 'doctor' && (
            <input
              type="text"
              placeholder="Specialization (e.g. Cardiologist)"
              className="input-field"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              required
            />
          )}
          
          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Register
          </button>
        </form>
        
        <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
