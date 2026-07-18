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
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="brand-logo">
            <div className="logo-box">
              <Logo color="white" />
            </div>
            <div className="brand-tagline">Secure Reset</div>
          </div>
          
          <div className="welcome-text">
            <h1>Forgot Password</h1>
            <p>Enter your email address and we'll send you a link to reset your password.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <input 
                type="email" 
                placeholder="Email address" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Send Reset Link'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem' }}>
            <button 
              onClick={() => navigate('/login')}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%' }}
            >
              <ArrowLeft size={16} /> Back to Login
            </button>
          </div>
        </div>
      </div>
      <Footer />

      <style>{`
        .login-page {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: radial-gradient(circle at top right, #f8fafc, #e2e8f0);
          padding: 1.5rem;
          width: 100%;
          gap: 1.5rem;
        }
        .login-container {
          width: 100%;
          max-width: 440px;
          animation: fadeIn 0.6s ease-out;
        }
        .login-card {
          background: white;
          padding: 3rem 2.5rem;
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08);
          text-align: center;
          border: 1px solid var(--border);
        }
        .brand-logo {
          margin-bottom: 2rem;
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        .logo-box {
          width: 56px;
          height: 56px;
          background: var(--primary-dark);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin-bottom: 0.5rem;
        }
        .brand-tagline {
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          font-weight: 600;
        }
        .welcome-text h1 { font-size: 1.5rem; margin-bottom: 0.75rem; }
        .welcome-text p {
          color: var(--text-muted);
          font-size: 0.95rem;
          line-height: 1.6;
          margin-bottom: 2rem;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .form-group input {
          width: 100%;
          padding: 14px;
          border: 1px solid var(--border);
          border-radius: 12px;
          background: #f8fafc;
          font-family: inherit;
          transition: all 0.3s;
        }
        .form-group input:focus {
          outline: none;
          border-color: var(--primary-main);
          background: white;
          box-shadow: 0 0 0 4px rgba(0, 168, 232, 0.1);
        }
        .submit-btn {
          background: var(--primary-main);
          color: white;
          border: none;
          padding: 14px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .submit-btn:hover {
          background: var(--primary-dark);
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -10px var(--primary-main);
        }
        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;
