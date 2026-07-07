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
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md m-4 shadow-xl" style={{ border: '1px solid #e2e8f0' }}>
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {language === 'th' ? 'ตั้งค่าการแจ้งเตือน (Notification)' : 'Notification Settings'}
        </h2>
        
        <p className="text-gray-600 mb-6 text-sm">
          {language === 'th' 
            ? 'เลือกช่องทางที่คุณต้องการรับการแจ้งเตือน (เช่น สรุปยอดรายวัน, หรือเมื่อเพิ่มรายการ)' 
            : 'Choose how you want to receive notifications (e.g., daily summary, new transactions).'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="flex items-center space-x-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50">
            <input 
              type="checkbox" 
              checked={notifyEmail} 
              onChange={(e) => setNotifyEmail(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded"
            />
            <span className="font-medium text-gray-700">{language === 'th' ? 'แจ้งเตือนผ่าน Email' : 'Email Notifications'}</span>
          </label>

          <label className="flex items-center space-x-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50">
            <input 
              type="checkbox" 
              checked={notifyLine} 
              onChange={(e) => setNotifyLine(e.target.checked)}
              className="w-5 h-5 text-green-600 rounded"
            />
            <span className="font-medium text-gray-700">{language === 'th' ? 'แจ้งเตือนผ่าน LINE Notify' : 'LINE Notifications'}</span>
          </label>

          {notifyLine && (
            <div className="p-4 bg-green-50 rounded-xl mt-2 border border-green-100">
              <label className="block text-sm font-medium text-green-800 mb-2">
                LINE Notify Token
              </label>
              <input 
                type="text" 
                value={lineToken}
                onChange={(e) => setLineToken(e.target.value)}
                placeholder="Ex: abcd1234efgh5678..."
                className="w-full p-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-green-700 mt-2">
                {language === 'th' ? (
                  <>ยังไม่มี Token? <a href="https://notify-bot.line.me/my/" target="_blank" rel="noreferrer" className="underline font-semibold">ขอ Token ได้ที่นี่</a></>
                ) : (
                  <>No Token? <a href="https://notify-bot.line.me/my/" target="_blank" rel="noreferrer" className="underline font-semibold">Get it here</a></>
                )}
              </p>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            {onClose && (
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
              >
                {language === 'th' ? 'ยกเลิก' : 'Cancel'}
              </button>
            )}
            <button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium flex justify-center items-center"
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
