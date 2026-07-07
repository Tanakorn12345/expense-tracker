import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { fetchWithAuth } from '../utils/api';
import { useLanguage } from '../contexts/LanguageContext';

const NotificationSetupModal = ({ user, setUser, onClose }) => {
  const { language } = useLanguage();
  const [notifyEmail, setNotifyEmail] = useState(user?.notifyEmail ?? true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetchWithAuth('/api/auth/notification-settings', {
        method: 'PUT',
        body: JSON.stringify({
          notifyEmail
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
