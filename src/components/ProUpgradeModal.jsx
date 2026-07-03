import React, { useState, useRef } from 'react';
import QRCode from 'react-qr-code';
import generatePayload from 'promptpay-qr';
import { X, UploadCloud, CheckCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchWithAuth } from '../utils/api';
import Swal from 'sweetalert2';

const ProUpgradeModal = ({ isOpen, onClose, onSuccess }) => {
  const { t, language } = useLanguage();
  const [step, setStep] = useState(1); // 1: QR, 2: Uploading/Verifying, 3: Success
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  
  // Example Phone Number for PromptPay
  const mobileNumber = '0832511456';
  const amount = 10;
  const payload = generatePayload(mobileNumber, { amount });

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      handleUpload();
    }
  };

  const handleUpload = () => {
    setStep(2);
    // Simulate API call for slip verification
    setTimeout(async () => {
      try {
        const res = await fetchWithAuth('/api/auth/upgrade', { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          // Update local storage user
          localStorage.setItem('user', JSON.stringify(data.user));
          setStep(3);
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 2000);
        } else {
          Swal.fire('Error', 'Failed to upgrade to Pro', 'error');
          setStep(1);
        }
      } catch (e) {
        Swal.fire('Error', 'Connection error', 'error');
        setStep(1);
      }
    }, 2500); // Fake delay for verifying
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content pro-modal">
        <button className="modal-close" onClick={onClose}><X size={20} /></button>
        
        {step === 1 && (
          <div className="pro-step-1">
            <h2 className="modal-title" style={{ color: 'var(--primary-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
             
              {language === 'th' ? 'อัปเกรดเป็น ' : 'Upgrade to '}
           <span className="pro-badge" style={{ padding: '4px 8px', borderRadius: '4px', backgroundImage: 'linear-gradient(135deg, #1D3557 0%, #028090 50%, #00A896 100%)', color: '#fff', fontSize: '1rem', display: 'inline-block', fontWeight: 'bold' }}>PRO</span>



            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', textAlign: 'center', lineHeight: '1.6', padding : '10px' }}>
            {language === 'th' 
              ? 'สามารถอัพเกรดฟีเจอร์ใหม่ๆ ได้แล้วที่นี่ เพียงจ่ายเพิ่ม 10 บาท ผ่าน QR code ด้านล่างนี้' 
              : 'Upgrade to get new features here! Just pay 10 THB via the QR code below.'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/2/28/Thai_QR_Logo.svg" 
              alt="Thai QR Payment" 
              style={{ height: '30px', marginBottom: '1rem' }}
            />
            <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', display: 'inline-block' }}>
              <QRCode value={payload} size={180} />
            </div>
          </div>  
            <div className="amount-display" style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '15px 0' }}>
              10.00 THB
            </div>

            <div className="upload-section" style={{ marginTop: '10px' }}>
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
              />
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px' , margin: '10px'}}
                onClick={() => fileInputRef.current.click()}
              >
                <UploadCloud size={20} style={{ marginRight: '10px' }} />
                {language === 'th' ? 'อัปโหลดสลิปโอนเงิน' : 'Upload Transfer Slip'}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="pro-step-2" style={{ textAlign: 'center', padding: '20px' }}>
            {previewUrl && (
              <div style={{ marginBottom: '20px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', display: 'inline-block' }}>
                <img src={previewUrl} alt="Slip Preview" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', display: 'block' }} />
              </div>
            )}
            <Loader2 className="spinner" size={48} style={{ color: 'var(--primary-main)', margin: '0 auto 20px', animation: 'spin 1s linear infinite' }} />
            <h3>{language === 'th' ? 'กำลังตรวจสอบสลิปโอนเงิน...' : 'Verifying slip...'}</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>
              {language === 'th' ? 'กรุณารอสักครู่ ระบบกำลังใช้ AI วิเคราะห์ข้อมูลบนสลิป' : 'Please wait, our AI is analyzing the slip.'}
            </p>
          </div>
        )}

        {step === 3 && (
          <div className="pro-step-3" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <CheckCircle size={64} style={{ color: '#10b981', margin: '0 auto 20px' }} />
            <h3 style={{ color: '#10b981' }}>{language === 'th' ? 'การชำระเงินสำเร็จ!' : 'Payment Successful!'}</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>
              {language === 'th' ? 'ยินดีต้อนรับสู่ FinTrack Pro' : 'Welcome to FinTrack Pro'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProUpgradeModal;
