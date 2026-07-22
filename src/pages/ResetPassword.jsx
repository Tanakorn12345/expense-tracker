import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Lock, Loader2, ArrowLeft } from 'lucide-react';
import Footer from '../components/Footer';
import Logo from '../components/Logo';
import Swal from 'sweetalert2';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'transparent', width: '0%' };
    
    const hasLower = /[a-z]/.test(pass);
    const hasUpper = /[A-Z]/.test(pass);
    const hasNumber = /\d/.test(pass);
    const hasLength = pass.length >= 4;
    
    // Check minimum requirements
    if (!hasLower || !hasUpper || !hasNumber || !hasLength) {
      return { score: 1, label: 'Weak (Requires 4+ chars, A-Z, a-z, 0-9)', color: '#ef4444', width: '33%' };
    }
    
    if (pass.length >= 8) {
      return { score: 3, label: 'Strong', color: '#22c55e', width: '100%' };
    }
    
    return { score: 2, label: 'Medium', color: '#eab308', width: '66%' };
  };

  const strength = getPasswordStrength(newPassword);
  const isPasswordValid = strength.score >= 2;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isPasswordValid) {
      Swal.fire({
        icon: 'warning',
        title: 'Weak Password',
        text: 'Please meet the minimum password requirements.',
        confirmButtonColor: 'var(--primary-main)'
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Passwords do not match',
        confirmButtonColor: 'var(--primary-main)'
      });
      return;
    }

    setIsLoading(true);
    const API_BASE_URL = import.meta.env.VITE_API_URL || '';
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });
      
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Password has been reset successfully. You can now login.',
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
            <h2 className="auth-title">Reset Password</h2>
            <p className="auth-subtitle">Enter your new password below.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="auth-form-group">
              <div className="auth-input-wrapper">
                <Lock size={20} className="auth-icon" />
                <input 
                  type="password" 
                  className="auth-input"
                  placeholder="New Password" 
                  required 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              {newPassword && (
                <div className="auth-strength-container">
                  <div className="auth-strength-bar">
                    <div 
                      className="auth-strength-fill" 
                      style={{ width: strength.width, backgroundColor: strength.color }} 
                    ></div>
                  </div>
                  <div className="auth-strength-label" style={{ color: strength.color }}>
                    {strength.label}
                  </div>
                </div>
              )}
            </div>
            
            <div className="auth-form-group">
              <div className="auth-input-wrapper">
                <Lock size={20} className="auth-icon" />
                <input 
                  type="password" 
                  className="auth-input"
                  placeholder="Confirm New Password" 
                  required 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="auth-btn" disabled={isLoading}>
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Reset Password'}
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

export default ResetPassword;
