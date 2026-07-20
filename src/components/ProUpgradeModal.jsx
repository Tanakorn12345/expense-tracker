import React, { useState, useRef } from 'react';
import QRCode from 'react-qr-code';
import generatePayload from 'promptpay-qr';
import { X, UploadCloud, CheckCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchWithAuth } from '../utils/api';
import Swal from 'sweetalert2';
import { createPortal } from 'react-dom';

const ProUpgradeModal = ({ isOpen, onClose, onSuccess }) => {
  const { t, language } = useLanguage();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [step, setStep] = useState(user.proStatus === 'pending' ? 4 : 1); // 1: QR, 2: Uploading, 4: Pending
  const [showFeatures, setShowFeatures] = useState(false);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  
  // Example Phone Number for PromptPay
  const mobileNumber = '0832511456';
  const amount = 199.00; // Amount in THB
  const payload = generatePayload(mobileNumber, { amount });

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      handleUpload(selectedFile);
    }
  };

  const handleUpload = (uploadFile) => {
    const fileToUpload = uploadFile || file;
    if (!fileToUpload) return;
    setStep(2);
    
    const reader = new FileReader();
    reader.readAsDataURL(fileToUpload);
    reader.onload = async () => {
      const base64Image = reader.result;
      try {
        const res = await fetchWithAuth('/api/auth/upgrade', { 
          method: 'POST',
          body: JSON.stringify({ slipUrl: base64Image })
        });
        if (res.ok) {
          const data = await res.json();
          // Update local storage user
          localStorage.setItem('user', JSON.stringify(data.user));
          setStep(4);
        } else {
          Swal.fire('Error', 'Failed to submit request', 'error');
          setStep(1);
        }
      } catch (e) {
        Swal.fire('Error', 'Connection error', 'error');
        setStep(1);
      }
    };
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="modal-overlay" style={{ zIndex: 999999 }}>
      <div className="modal-content pro-modal">
        <button className="modal-close" onClick={onClose}><X size={20} /></button>
        
        {step === 1 && (
          <div className="pro-step-1">
            <h2 className="modal-title" style={{ color: 'var(--primary-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
             
              {language === 'th' ? 'อัปเกรดเป็น ' : 'Upgrade to '}
           <span className="pro-badge" style={{ padding: '4px 8px', borderRadius: '4px', backgroundImage: 'linear-gradient(135deg, #1D3557 0%, #028090 50%, #00A896 100%)', color: '#fff', fontSize: '1rem', display: 'inline-block', fontWeight: 'bold' }}>PRO</span>

            </h2>
            
            {showFeatures ? (
              <div style={{ padding: '1rem 0' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '1.5rem' }}>🇹</div>
                    <div>
                      <strong style={{ display: 'block', color: 'var(--text-main)', marginBottom: '0.25rem' }}>คำนวณราคาไทยช่วยไทย</strong>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.4' }}>คำนวณและหักยอด 60/40 อัตโนมัติเมื่อเพิ่มรายจ่าย (รัฐออก 60% สูงสุด 200 บ.)</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '1.5rem' }}></div>
                    <div>
                      <strong style={{ display: 'block', color: 'var(--text-main)', marginBottom: '0.25rem' }}>เป้าหมายการออม</strong>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.4' }}>ตั้งเป้าหมายและบันทึกเงินออมแยกส่วนได้อย่างอิสระ</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '1.5rem' }}></div>
                    <div>
                      <strong style={{ display: 'block', color: 'var(--text-main)', marginBottom: '0.25rem' }}>สถานะพิเศษ</strong>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.4' }}>รับแบดจ์ PRO ประจำโปรไฟล์และธีมสีพิเศษ พร้อมใช้งานแบบไม่มีโฆษณา</span>
                    </div>
                  </div>
                </div>
                <button className="btn btn-outline" style={{ width: '100%', padding: '12px' }} onClick={() => setShowFeatures(false)}>
                  {language === 'th' ? 'ย้อนกลับไปชำระเงิน' : 'Back to Payment'}
                </button>
              </div>
            ) : (
              <>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', textAlign: 'center', lineHeight: '1.6', padding : '10px' }}>
                {language === 'th' 
                  ? 'สามารถอัพเกรดฟีเจอร์ใหม่ๆ ได้แล้วที่นี่ เพียงจ่ายเพิ่ม 199 บาท ผ่าน QR code ด้านล่างนี้' 
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
                <div className="amount-display" style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '15px 0' , textAlign: 'center'}}>
                  199.00 THB
                </div>

                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  <button 
                    onClick={() => setShowFeatures(true)}
                    style={{ background: 'none', border: 'none', color: 'var(--primary-main)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    {language === 'th' ? 'ดูรายละเอียดฟีเจอร์ PRO' : 'View PRO Features Details'}
                  </button>
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
                    className="btn btn-primary upload-btn"
                    onClick={() => fileInputRef.current.click()}
                    style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <UploadCloud size={20} />
                    {language === 'th' ? 'อัปโหลดสลิปโอนเงิน' : 'Upload Payment Slip'}
                  </button>
                </div>
              </>
            )}
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
            <h3>{language === 'th' ? 'กำลังอัปโหลดสลิป...' : 'Uploading slip...'}</h3>
          </div>
        )}

        {step === 4 && (
          <div className="pro-step-4" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <Loader2 className="spinner" size={64} style={{ color: '#eab308', margin: '0 auto 20px', animation: 'spin 1s linear infinite' }} />
            <h3 style={{ color: '#eab308' }}>กำลังรอการอนุมัติจากบริษัท</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>
              โปรดรอสักครู่ครับ
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ProUpgradeModal;
