import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { fetchWithAuth } from '../utils/api';
import { useLanguage } from '../contexts/LanguageContext';

const NotificationSetupModal = ({ user, setUser, onClose }) => {
  const { language } = useLanguage();
  const [notifyEmail, setNotifyEmail] = useState(user?.notifyEmail ?? true);
  const [notifyLine, setNotifyLine] = useState(user?.notifyLine ?? false);
  const [lineToken, setLineToken] = useState(user?.lineNotifyToken || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (notifyLine && !lineToken.trim()) {
      Swal.fire({
        icon: 'warning',
        title: language === 'th' ? 'กรุณากรอก Token' : 'Token Required',
        text: language === 'th' ? 'คุณเลือกการแจ้งเตือนผ่าน LINE กรุณาใส่ LINE Notify Token' : 'You selected LINE notifications. Please enter the token.'
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetchWithAuth('/api/auth/notification-settings', {
        method: 'PUT',
        body: JSON.stringify({
          notifyEmail,
          notifyLine,
          lineNotifyToken: notifyLine ? lineToken.trim() : null
        })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        Swal.fire({
          icon: 'success',
          title: language === 'th' ? 'บันทึกการตั้งค่าแล้ว' : 'Settings Saved',
          showConfirmButton: false,
          timer: 1500
        });
        if (onClose) onClose();
      } else {
        throw new Error('Failed to update');
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: language === 'th' ? 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' : 'Error saving preferences.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ padding: '24px', maxWidth: '400px', width: '90%', borderRadius: '16px' }}>
        <h2 className="modal-title" style={{ marginBottom: '16px', fontSize: '1.25rem', color: 'var(--text-main)' }}>
          {language === 'th' ? 'ตั้งค่าการแจ้งเตือน (Notification)' : 'Notification Settings'}
        </h2>
        
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem', lineHeight: '1.5' }}>
          {language === 'th' 
            ? 'เลือกช่องทางที่คุณต้องการรับการแจ้งเตือน (เช่น สรุปยอดรายวัน, หรือเมื่อเพิ่มรายการ)' 
            : 'Choose how you want to receive notifications (e.g., daily summary, new transactions).'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid var(--border-light)', borderRadius: '12px', cursor: 'pointer', background: 'var(--card-bg)' }}>
            <input 
              type="checkbox" 
              checked={notifyEmail} 
              onChange={(e) => setNotifyEmail(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
            />
            <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{language === 'th' ? 'แจ้งเตือนผ่าน Email' : 'Email Notifications'}</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid var(--border-light)', borderRadius: '12px', cursor: 'pointer', background: 'var(--card-bg)' }}>
            <input 
              type="checkbox" 
              checked={notifyLine} 
              onChange={(e) => setNotifyLine(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: '#00B900' }}
            />
            <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{language === 'th' ? 'แจ้งเตือนผ่าน LINE Notify' : 'LINE Notifications'}</span>
          </label>

          {notifyLine && (
            <div style={{ padding: '16px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0', marginTop: '8px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#166534', marginBottom: '8px' }}>
                LINE Notify Token
              </label>
              <input 
                type="text" 
                value={lineToken}
                onChange={(e) => setLineToken(e.target.value)}
                placeholder="Ex: abcd1234efgh5678..."
                className="form-control"
                style={{ width: '100%', borderColor: '#bbf7d0', outline: 'none' }}
              />
              <p style={{ fontSize: '0.8rem', color: '#15803d', marginTop: '8px' }}>
                {language === 'th' ? (
                  <>ยังไม่มี Token? <a href="https://notify-bot.line.me/my/" target="_blank" rel="noreferrer" style={{ fontWeight: 600, textDecoration: 'underline' }}>ขอ Token ได้ที่นี่</a></>
                ) : (
                  <>No Token? <a href="https://notify-bot.line.me/my/" target="_blank" rel="noreferrer" style={{ fontWeight: 600, textDecoration: 'underline' }}>Get it here</a></>
                )}
              </p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            {onClose && (
              <button 
                type="button" 
                onClick={onClose}
                className="btn btn-outline"
                style={{ flex: 1, padding: '10px' }}
              >
                {language === 'th' ? 'ยกเลิก' : 'Cancel'}
              </button>
            )}
            <button 
              type="submit" 
              disabled={isLoading}
              className="btn btn-primary"
              style={{ flex: 1, padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              {isLoading ? '...' : (language === 'th' ? 'บันทึก' : 'Save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotificationSetupModal;
