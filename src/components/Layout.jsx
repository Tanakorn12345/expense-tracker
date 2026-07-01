import React, { useEffect, useState, useRef } from 'react';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { Search, Bell, Globe, Menu, X, CheckCircle, Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useLocation } from 'react-router-dom';

const Layout = ({ children, searchQuery, setSearchQuery }) => {
  const { t, language, toggleLanguage } = useLanguage();
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);
  const location = useLocation();

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      let currentUser = null;
      if (storedUser) {
        currentUser = JSON.parse(storedUser);
        setUser(currentUser);
      }
      
      if (currentUser) {
        // Load mock notifications specific to user
        const notifKey = `notifications_${currentUser.id}`;
        const storedNotifs = localStorage.getItem(notifKey);
        if (storedNotifs) {
          setNotifications(JSON.parse(storedNotifs));
        } else {
          // Initial mock notifications
          const initial = [
            { id: 1, type: 'summary', text: 'สรุปยอดเงินคงเหลือประจำเดือนพร้อมใช้งานแล้ว', time: new Date().toISOString(), read: false },
          ];
          setNotifications(initial);
          localStorage.setItem(notifKey, JSON.stringify(initial));
        }
      } else {
        setNotifications([]);
      }
    } catch (e) {
      console.error(e);
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleUpdate = () => {
      if (user) {
        const storedNotifs = localStorage.getItem(`notifications_${user.id}`);
        if (storedNotifs) {
          setNotifications(JSON.parse(storedNotifs));
        }
      }
    };
    window.addEventListener('notifications_updated', handleUpdate);
    return () => window.removeEventListener('notifications_updated', handleUpdate);
  }, [user]);

  // Handle click outside to close notifications
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    if (user) {
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updated));
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className={`app-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div className="mobile-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}
      
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <main className="main-content">
        <div className="top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
            <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <Menu size={24} color="var(--text-main)" />
            </button>
            <div className="search-box" style={{ flex: 1, maxWidth: '360px', minWidth: 0 }}>
              <div style={{ position: 'relative' }}>
                <Search 
                  size={16} 
                  style={{ 
                    position: 'absolute', 
                    left: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: 'var(--text-muted)',
                    pointerEvents: 'none'
                  }} 
                />
                <input 
                  type="text" 
                  placeholder={t('search')} 
                  className="form-control search-input" 
                  style={{ paddingLeft: '36px', width: '100%' }}
                  value={searchQuery || ''}
                  onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="top-bar-actions">
            {/* Theme-matched Language Toggle */}
            <div className="lang-toggle-wrapper" onClick={toggleLanguage}>
              <span className={`lang-label ${language === 'th' ? 'active' : ''}`}>TH</span>
              <div className={`toggle-switch ${language === 'en' ? 'switched' : ''}`}>
                <div className="toggle-knob"><Globe size={12} color="var(--primary-dark)" /></div>
              </div>
              <span className={`lang-label ${language === 'en' ? 'active' : ''}`}>EN</span>
            </div>

            {/* Notifications */}
            <div className="notification-wrapper" ref={notifRef}>
              <div className="bell-icon" onClick={() => setShowNotifications(!showNotifications)}>
                <Bell size={20} color="var(--text-muted)" />
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </div>

              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="dropdown-header">
                    <h4>{language === 'th' ? 'การแจ้งเตือน' : 'Notifications'}</h4>
                    <button onClick={markAllRead} style={{ fontSize: '0.8rem', color: 'var(--primary-main)', background: 'none', border: 'none', cursor: 'pointer' }}>
                      {language === 'th' ? 'อ่านทั้งหมด' : 'Mark all as read'}
                    </button>
                  </div>
                  <div className="dropdown-body">
                    {notifications.length === 0 ? (
                      <p className="no-notifs">{language === 'th' ? 'ไม่มีการแจ้งเตือน' : 'No notifications'}</p>
                    ) : (
                      notifications.slice().reverse().map(n => (
                        <div key={n.id} className={`notification-item ${!n.read ? 'unread' : ''}`}>
                          <div className="notif-icon">
                            {n.type === 'summary' ? <Info size={16} color="#3b82f6" /> : <CheckCircle size={16} color="#10b981" />}
                          </div>
                          <div className="notif-content">
                            <p>{n.text}</p>
                            <span className="notif-time">{new Date(n.time).toLocaleString(language === 'th' ? 'th-TH' : 'en-US', { dateStyle: 'short', timeStyle: 'short' })}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="user-profile">
              <div className="user-info">
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.name || 'User'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('premiumMember')}</div>
              </div>
              <div className="avatar-circle">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 8rem)' }}>
          {children}
          <Footer />
        </div>
      </main>
    </div>
  );
};

export default Layout;
