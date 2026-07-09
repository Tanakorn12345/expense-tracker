import React, { useState, useRef } from 'react';
import { X, Camera } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchWithAuth } from '../utils/api';
import Swal from 'sweetalert2';

const ProfileEditModal = ({ user, setUser, onClose }) => {
  const { language } = useLanguage();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profilePic, setProfilePic] = useState(user?.profilePic || null);
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

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
              setProfilePic(user.profilePic || null);
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: language === 'th' ? 'รูปภาพมีขนาดใหญ่เกินไป หรืออัปโหลดไม่สำเร็จ' : 'Image is too large or upload failed.'
              });
            }
          } catch (error) {
            console.error('Failed to update profile pic', error);
            setProfilePic(user.profilePic || null);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError('');

    if (!name.trim() || !email.trim()) {
      Swal.fire({
        icon: 'warning',
        title: language === 'th' ? 'กรอกข้อมูลไม่ครบ' : 'Missing Information',
        text: language === 'th' ? 'กรุณากรอกชื่อและอีเมล' : 'Please fill in name and email.'
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetchWithAuth('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ name, email })
      });

      const data = await res.json();

      if (res.status === 409) {
        setEmailError(data.message || 'ไม่สามารถใช้อีเมลนี้ได้ เนื่องจากผู้ใช้ท่านอื่นใช้แล้ว');
      } else if (res.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        Swal.fire({
          icon: 'success',
          title: language === 'th' ? 'บันทึกข้อมูลเรียบร้อย' : 'Profile Saved',
          showConfirmButton: false,
          timer: 1500
        });
        onClose();
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-content" style={{ maxWidth: '400px', padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)' }}>
            {language === 'th' ? 'แก้ไขโปรไฟล์' : 'Edit Profile'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
            <div 
              className="avatar-circle" 
              onClick={handleProfileClick}
              style={{ 
                width: '80px',
                height: '80px',
                fontSize: '2rem',
                cursor: user?.isPro ? 'pointer' : 'default', 
                backgroundImage: (user?.isPro && profilePic) ? `url(${profilePic})` : '', 
                backgroundSize: 'cover', 
                backgroundPosition: 'center', 
                position: 'relative',
                marginBottom: '12px'
              }}
            >
              {!(user?.isPro && profilePic) && (user?.name ? user.name.charAt(0).toUpperCase() : 'U')}
              
              {user?.isPro && (
                <div style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  background: 'var(--primary)',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  border: '2px solid var(--card-bg)'
                }}>
                  <Camera size={14} />
                </div>
              )}
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*" 
              onChange={handleProfileChange} 
            />
            
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {language === 'th' ? 'แตะรูปภาพเพื่อเปลี่ยน (เฉพาะ PRO)' : 'Tap image to change (PRO only)'}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--text-main)' }}>
              {language === 'th' ? 'ชื่อ' : 'Name'}
            </label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-control"
              style={{ width: '100%', boxSizing: 'border-box' }}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--text-main)' }}>
              {language === 'th' ? 'อีเมล' : 'Email'}
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError('');
              }}
              className="form-control"
              style={{ width: '100%', boxSizing: 'border-box', borderColor: emailError ? '#ef4444' : '' }}
              required
            />
            {emailError && (
              <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '6px', marginBottom: '0' }}>
                {emailError}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              type="button"
              className="btn btn-secondary" 
              onClick={onClose}
              style={{ flex: 1 }}
            >
              {language === 'th' ? 'ยกเลิก' : 'Cancel'}
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ flex: 1 }}
              disabled={isLoading}
            >
              {isLoading ? (language === 'th' ? 'กำลังบันทึก...' : 'Saving...') : (language === 'th' ? 'บันทึกข้อมูล' : 'Save Profile')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal;
