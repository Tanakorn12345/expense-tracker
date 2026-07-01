import React from 'react';
import Logo from './Logo';
import { useLanguage } from '../contexts/LanguageContext';

const Footer = () => {
  const { language } = useLanguage();

  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <Logo size={28} />
          <div className="footer-brand-text">
            <strong>FinTrack</strong>
            <p>{language === 'th' ? 'จัดการการเงินส่วนบุคคลอย่างชาญฉลาด' : 'Smart personal finance'}</p>
          </div>
        </div>

        <div className="footer-meta">
          <span>© {new Date().getFullYear()} FinTrack. {language === 'th' ? 'สงวนลิขสิทธิ์.' : 'All rights reserved.'}</span>
          <div className="footer-links">
            <a href="#">Privacy</a>
            <span>•</span>
            <a href="#">Terms</a>
          </div>
        </div>
      </div>

      <style>{`
        .site-footer {
          margin-top: 3rem;
          padding: 1.5rem 0;
          background: transparent;
          border-top: 1px solid var(--border);
        }
        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          flex-wrap: wrap;
          color: var(--text-muted);
          font-size: 0.85rem;
        }
        .footer-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .footer-brand-text strong {
          display: block;
          font-size: 0.95rem;
          color: var(--text-main);
          font-weight: 600;
          letter-spacing: 0.5px;
          margin-bottom: 0.1rem;
        }
        .footer-brand-text p {
          margin: 0;
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .footer-meta {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }
        .footer-links {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .footer-links a {
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .footer-links a:hover {
          color: var(--primary-main);
        }
        @media (max-width: 640px) {
          .footer-content {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          .footer-brand {
            flex-direction: column;
            gap: 0.5rem;
          }
          .footer-meta {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;