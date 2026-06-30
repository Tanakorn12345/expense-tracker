import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  LogOut,
  Wallet,
  History as HistoryIcon
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { t } = useLanguage();
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Wallet size={20} color="white" />
        </div>
        <h2 style={{ fontSize: '1.25rem' }}>FinTrack</h2>
      </div>
      
      <ul className="nav-links">
        <li className="nav-item">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsOpen && setIsOpen(false)}>
            <LayoutDashboard size={20} />
            <span>{t('dashboard')}</span>
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/add-transaction" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsOpen && setIsOpen(false)}>
            <ArrowRightLeft size={20} />
            <span>{t('transactions')}</span>
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/history" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsOpen && setIsOpen(false)}>
            <HistoryIcon size={20} />
            <span>{t('history')}</span>
          </NavLink>
        </li>
      </ul>

      <div className="sidebar-footer">
        <div className="upgrade-card">
          <h4 style={{ marginBottom: '0.5rem' }}>{t('upgradePro')}</h4>
          <p style={{ opacity: 0.8, fontSize: '0.75rem' }}>{t('upgradeDesc')}</p>
        </div>
        
        <NavLink to="/" className="nav-link" onClick={() => localStorage.removeItem('token')}>
          <LogOut size={20} />
          <span>{t('logout')}</span>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
