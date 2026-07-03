import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  LogOut,
  History as HistoryIcon,
  PiggyBank
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import Logo from './Logo';
import ProUpgradeModal from './ProUpgradeModal';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { t, language } = useLanguage();
  const [isProModalOpen, setIsProModalOpen] = React.useState(false);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isPro = user?.isPro || false;
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Logo size={32} />
        <h2 style={{ fontSize: '1.35rem', margin: 0, fontWeight: 700, letterSpacing: '0.5px' }}>FinTrack</h2>
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
        {isPro && (
          <li className="nav-item">
            <NavLink to="/savings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsOpen && setIsOpen(false)}>
              <PiggyBank size={20} />
              <span>{language === 'th' ? 'การออม' : 'Savings'}</span>
            </NavLink>
          </li>
        )}
      </ul>

      <div className="sidebar-footer">
        {!isPro ? (
          <div className="upgrade-card" style={{ cursor: 'pointer' }} onClick={() => setIsProModalOpen(true)}>
            <h4 style={{ marginBottom: '0.5rem' }}>{t('upgradePro')}</h4>
            <p style={{ opacity: 0.8, fontSize: '0.75rem' }}>{t('upgradeDesc')}</p>
          </div>
        ) : (
          <div className="upgrade-card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <h4 style={{ marginBottom: '0.5rem', color: '#fff' }}>Pro Member</h4>
            <p style={{ opacity: 0.9, fontSize: '0.75rem', color: '#fff' }}>
              {language === 'th' ? 'คุณเป็นสมาชิกระดับ Pro แล้ว' : 'You are a Pro member'}
            </p>
          </div>
        )}
        
        <NavLink to="/" className="nav-link" onClick={() => localStorage.removeItem('token')}>
          <LogOut size={20} />
          <span>{t('logout')}</span>
        </NavLink>
      </div>

      <ProUpgradeModal 
        isOpen={isProModalOpen} 
        onClose={() => setIsProModalOpen(false)} 
        onSuccess={() => window.location.reload()} 
      />
    </div>
  );
};

export default Sidebar;
