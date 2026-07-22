import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';
import Footer from '../components/Footer';
import Logo from '../components/Logo';
import Swal from 'sweetalert2';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    const API_BASE_URL = import.meta.env.VITE_API_URL || '';
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to send reset link');
      }

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Password reset link has been sent to your email. Please check your inbox.',
        confirmButtonColor: 'var(--primary-main)'
      });
      navigate('/login');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message,
        confirmButtonColor: 'var(--primary-main)'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* Left Side: Animated Blurred Graphic */}
      <div className="auth-left">
        <div className="auth-bg-image"></div>
        <div className="auth-left-overlay"></div>
        <div className="auth-left-content">
          <h1>Secure Recovery</h1>
          <p>Get back to your intelligent wealth management dashboard quickly and safely.</p>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <Logo size={36} />
            </div>
            <h2 className="auth-title">Forgot Password</h2>
            <p className="auth-subtitle">Enter your email and we'll send a reset link.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="auth-form-group">
              <div className="auth-input-wrapper">
                <Mail size={20} className="auth-icon" />
                <input 
                  type="email" 
                  className="auth-input"
                  placeholder="Email address" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="auth-btn" disabled={isLoading}>
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Send Reset Link'}
            </button>
          </form>

          <div style={{ marginTop: '2rem' }}>
            <button 
              onClick={() => navigate('/login')}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', fontSize: '0.95rem' }}
              className="auth-link"
            >
              <ArrowLeft size={16} /> Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
