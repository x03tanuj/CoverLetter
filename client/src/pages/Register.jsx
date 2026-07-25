import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, User, Mail, Lock, AlertCircle } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', backgroundColor: 'var(--bg-main)' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div className="neo-badge neo-badge-teal" style={{ marginBottom: '0.75rem' }}>
            <Sparkles size={14} style={{ marginRight: '4px' }} /> CoverCraft AI
          </div>
          <h1 style={{ fontSize: '2rem', margin: '0.25rem 0' }}>Join CoverCraft</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Generate tailor-made cover letters that get interviews.
          </p>
        </div>

        {/* Card Form */}
        <div className="neo-card-lg">
          <h2 style={{ fontSize: '1.4rem', marginBottom: '1.25rem' }}>Create Account</h2>

          {error && (
            <div style={{
              backgroundColor: '#FDE8E8',
              border: '2px solid var(--border-dark)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              color: '#9B1C1C',
              fontSize: '0.85rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label className="neo-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="neo-input"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label className="neo-label">Email Address</label>
              <input
                type="email"
                className="neo-input"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="neo-label">Password</label>
              <input
                type="password"
                className="neo-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="neo-btn neo-btn-yellow"
              disabled={isSubmitting}
              style={{ width: '100%', padding: '0.8rem', fontSize: '1rem' }}
            >
              {isSubmitting ? 'Creating Account...' : (
                <>Get Started <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '2px dashed #DDD', paddingTop: '1rem', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Already have an account? </span>
            <Link to="/login" style={{ color: 'var(--text-main)', fontWeight: '700', textDecoration: 'underline' }}>
              Sign In
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;
