import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Lock, Loader2 } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const API_BASE_URL = import.meta.env.VITE_API_URL || '';
    const url = isLogin ? `${API_BASE_URL}/api/auth/login` : `${API_BASE_URL}/api/auth/register`;
    
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
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
              <Wallet size={32} />
            </div>
            <h2 className="brand-name">FinTrack</h2>
            <p className="brand-tagline">Wealth Management</p>
          </div>

          <div className="welcome-text">
            <h1>{isLogin ? 'Welcome back' : 'Create an account'}</h1>
            <p>Securely access your sophisticated financial overview and oversight dashboard.</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="form-group">
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            )}
            <div className="form-group">
              <input 
                type="email" 
                placeholder="Email address" 
                required 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="form-group">
              <input 
                type="password" 
                placeholder="Password" 
                required 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : (isLogin ? 'Sign In' : 'Sign Up')}
            </button>
          </form>

          <p className="toggle-mode">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span onClick={() => { setIsLogin(!isLogin); setError(''); }}>
              {isLogin ? 'Sign up' : 'Sign in'}
            </span>
          </p>

          <div className="security-note">
            <p><Lock size={12} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Enterprise-grade security</p>
            <p style={{ marginTop: '8px' }}>By signing in, you agree to our Terms of Service and Privacy Policy. Your data is encrypted and protected.</p>
          </div>
        </div>
      </div>

      <style>{`
        .login-page {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: radial-gradient(circle at top right, #f8fafc, #e2e8f0);
          padding: 1.5rem;
          width: 100%;
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
        .brand-name {
          font-size: 1.75rem;
          color: var(--primary-dark);
          margin-bottom: 0.25rem;
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
          font-size: 0.95rem;
          transition: all 0.2s;
        }
        .form-group input:focus {
          outline: none;
          border-color: var(--primary-dark);
          background: white;
          box-shadow: 0 0 0 3px rgba(10, 37, 64, 0.1);
        }
        .submit-btn {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 12px;
          background: var(--primary-dark);
          color: white;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .submit-btn:hover { background: #16365a; }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .error-message {
          color: #ef4444;
          background: #fef2f2;
          padding: 12px;
          border-radius: 8px;
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
          text-align: left;
        }
        .toggle-mode {
          font-size: 0.9rem;
          color: var(--text-muted);
          margin-bottom: 2rem;
        }
        .toggle-mode span {
          color: var(--primary-dark);
          font-weight: 600;
          cursor: pointer;
        }
        .toggle-mode span:hover { text-decoration: underline; }
        .security-note {
          margin-top: 2rem;
          font-size: 0.75rem;
          color: var(--text-muted);
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
};

export default Login;
