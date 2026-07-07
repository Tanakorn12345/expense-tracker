import React, { useEffect, useState, useRef } from 'react';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { Search, Bell, Globe, Menu, X, CheckCircle, Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchWithAuth } from '../utils/api';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import NotificationSetupModal from './NotificationSetupModal';

const Layout = ({ children, searchQuery, setSearchQuery }) => {
  const { t, language, toggleLanguage } = useLanguage();
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);
  const location = useLocation();
  const fileInputRef = useRef(null);
  const [profilePic, setProfilePic] = useState(null);
  const [showNotifSetup, setShowNotifSetup] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (storedUser?.id) {
      if (storedUser.profilePic) {
        setProfilePic(storedUser.profilePic);
      } else {
        const localPic = localStorage.getItem(`profilePic_${storedUser.id}`);
        if (localPic) setProfilePic(localPic);
      }
      if (storedUser.hasSetPrefs === false) {
        setShowNotifSetup(true);
      }
    }
  }, []);

  const handleProfileClick = () => {
    if (user?.isPro) {
      fileInputRef.current?.click();
    } else {
      Swal.fire({
        icon: 'info',
        title: language === 'th' ? 'เฉพาะผู้ใช้ PRO' : 'PRO Users Only',
        text: language === 'th' ? 'อัปเกรดเป็น PRO เพื่อปรับแต่งรูปโปรไฟล์ของคุณ!' : 'Upgrade to PRO to customize your profile picture!',
        showConfirmButton: true,
        confirmButtonText: language === 'th' ? 'ตกลง' : 'OK'
      });
    }
  };

  const handleProfileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setProfilePic(compressedDataUrl);
          
          try {
            const res = await fetchWithAuth('/api/auth/profile-pic', {
              method: 'PUT',
              body: JSON.stringify({ profilePic: compressedDataUrl })
            });
            if (res.ok) {
              const data = await res.json();
              localStorage.setItem('user', JSON.stringify(data.user));
              setUser(data.user);
              Swal.fire({
                icon: 'success',
                title: language === 'th' ? 'อัปเดตโปรไฟล์แล้ว' : 'Profile Updated',
                showConfirmButton: false,
                timer: 1500
              });
            } else {
              // Revert state if failed
              const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
              setProfilePic(storedUser.profilePic || null);
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: language === 'th' ? 'รูปภาพมีขนาดใหญ่เกินไป หรืออัปโหลดไม่สำเร็จ' : 'Image is too large or upload failed.'
              });
            }
          } catch (error) {
            console.error('Failed to update profile pic', error);
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            setProfilePic(storedUser.profilePic || null);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: language === 'th' ? 'เกิดข้อผิดพลาดในการเชื่อมต่อ' : 'Connection error occurred.'
            });
          }
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const hour = new Date().getHours();
  let greetingTh = 'สวัสดี';
  let greetingEn = 'Hello';
  if (hour >= 5 && hour < 12) {
    greetingTh = 'สวัสดีตอนเช้า';
    greetingEn = 'Good morning';
  } else if (hour >= 12 && hour < 17) {
    greetingTh = 'สวัสดีตอนบ่าย';
    greetingEn = 'Good afternoon';
  } else if (hour >= 17 && hour < 22) {
    greetingTh = 'สวัสดีตอนเย็น';
    greetingEn = 'Good evening';
  }

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
        const lastClearKey = `notif_last_clear_${currentUser.id}`;
        const today = new Date().toLocaleDateString();
        const lastClearDate = localStorage.getItem(lastClearKey);

        if (lastClearDate !== today) {
          // It's a new day, clear notifications
          localStorage.removeItem(notifKey);
          localStorage.setItem(lastClearKey, today);
          setNotifications([]);
        } else {
          const storedNotifs = localStorage.getItem(notifKey);
          if (storedNotifs) {
            setNotifications(JSON.parse(storedNotifs));
          } else {
            setNotifications([]);
          }
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
              <div className="bell-icon" onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) markAllRead();
              }}>
                <Bell size={20} color="var(--text-muted)" />
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </div>

              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="dropdown-header">
                    <h4>{language === 'th' ? 'การแจ้งเตือน' : 'Notifications'}</h4>
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
            {user && (
              <div className="user-profile">
              <div className="user-info">
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                  {language === 'th' ? greetingTh : greetingEn},
                </div>
                <div style={{ fontWeight: 600, fontSize: '1rem' }}>{user?.name || 'User'}</div>
              </div>
              <div 
                className="avatar-circle" 
                onClick={handleProfileClick}
                style={{ 
                  cursor: user?.isPro ? 'pointer' : 'default', 
                  backgroundImage: (user?.isPro && profilePic) ? `url(${profilePic})` : '', 
                  backgroundSize: 'cover', 
                  backgroundPosition: 'center', 
                  position: 'relative',
                  overflow: 'visible' // allow badge to stick out
                }}
                title={user?.isPro 
                  ? (language === 'th' ? 'คลิกเพื่อเปลี่ยนรูปโปรไฟล์' : 'Click to change profile picture')
                  : (language === 'th' ? 'อัปเกรดเป็น PRO เพื่อเปลี่ยนรูปโปรไฟล์' : 'Upgrade to PRO to change profile picture')
                }
              >
                {!(user?.isPro && profilePic) && (user?.name ? user.name.charAt(0).toUpperCase() : 'U')}
                
                {/* PRO Badge */}
                {user?.isPro && (
                  <div style={{
                    position: 'absolute',
                    bottom: '-4px',
                    right: '-4px',
                    background: 'linear-gradient(135deg, #1D3557 0%, #028090 50%, #00A896 100%)',
                    color: '#fff',
                    fontSize: '0.4rem',
                    fontWeight: 'bold',
                    padding: '2px 6px',
                    borderRadius: '8px',
                    border: '2px solid #fff',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    zIndex: 2
                  }}>
                    PRO
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  accept="image/*" 
                  onChange={handleProfileChange} 
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="user-name" style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user.name}</span>
                <span 
                  onClick={() => setShowNotifSetup(true)}
                  style={{ fontSize: '0.75rem', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  {language === 'th' ? 'ตั้งค่าแจ้งเตือน' : 'Notification Settings'}
                </span>
              </div>
            </div>
          )}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 8rem)' }}>
          {children}
        </div>
      </main>

      <Footer />

      {showNotifSetup && (
        <NotificationSetupModal 
          user={user} 
          setUser={(updatedUser) => {
            setUser(updatedUser);
            setShowNotifSetup(false);
          }} 
          onClose={() => setShowNotifSetup(false)} 
        />
      )}
    </div>
  );
};

export default Layout;
