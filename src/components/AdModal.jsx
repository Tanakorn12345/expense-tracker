import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import ProUpgradeModal from './ProUpgradeModal';

export default function AdModal({ ad, onClose }) {
  const [timeLeft, setTimeLeft] = useState(20);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showProUpgrade, setShowProUpgrade] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Countdown Timer
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onClose(); // Auto close when timer hits 0
    }
  }, [timeLeft]); // Removed onClose to prevent timer resetting on parent re-renders

  useEffect(() => {
    // Carousel
    if (ad && ad.images && ad.images.length > 1) {
      const carouselTimer = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % ad.images.length);
      }, 3000); // Change image every 3 seconds
      return () => clearInterval(carouselTimer);
    }
  }, [ad]);

  if (!ad) return null;

  const handleUpgrade = () => {
    setShowProUpgrade(true);
  };

  if (showProUpgrade) {
    return <ProUpgradeModal isOpen={true} onClose={onClose} onSuccess={() => window.location.reload()} />;
  }

  const descLines = ad?.description ? ad.description.split('\n').filter(l => l.trim() !== '') : [];
  const title = descLines.length > 0 ? descLines[0] : '';
  const subtitle = descLines.length > 1 ? descLines[1] : '';
  const details = descLines.length > 2 ? descLines.slice(2).join('\n') : '';

  const modalContent = (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 999999,
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-card)', borderRadius: '24px',
        padding: '0', width: '90%', maxWidth: '500px',
        maxHeight: '90vh', overflowY: 'auto',
        textAlign: 'left', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        animation: 'pageFadeInUp 0.4s ease-out'
      }}>
        {/* Header / Timer */}
        <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-hover)' }}>
           <span style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Advertisement</span>
           <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '4px 12px', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 'bold' }}>
             Closes in {timeLeft}s
           </div>
        </div>
        
        <div style={{ padding: '1.5rem' }}>
          {/* Image */}
          {ad.images && ad.images.length > 0 && (
            <div style={{ position: 'relative', width: '100%', height: '280px', borderRadius: '16px', overflow: 'hidden', marginBottom: '1.5rem', backgroundColor: '#f8fafc', border: '1px solid var(--border)' }}>
              <img 
                src={ad.images[currentImageIndex]} 
                alt="ad" 
                style={{ width: '100%', height: '100%', objectFit: 'contain', transition: 'opacity 0.5s ease-in-out' }} 
              />
              {ad.images.length > 1 && (
                <div style={{ position: 'absolute', bottom: '12px', width: '100%', display: 'flex', justifyContent: 'center', gap: '6px' }}>
                  {ad.images.map((_, idx) => (
                    <div key={idx} style={{ 
                      width: '8px', height: '8px', borderRadius: '50%', 
                      backgroundColor: idx === currentImageIndex ? 'var(--primary-main)' : 'rgba(0,0,0,0.2)',
                      transition: 'background-color 0.3s'
                    }} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Text Content Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {descLines.length >= 3 ? (
              <>
                <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.4rem', fontWeight: 700, lineHeight: 1.3 }}>{title}</h2>
                <h4 style={{ margin: 0, color: 'var(--primary-main)', fontSize: '1.05rem', fontWeight: 600 }}>{subtitle}</h4>
                <div style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, background: 'var(--bg-hover)', padding: '1rem', borderRadius: '12px', whiteSpace: 'pre-line' }}>
                  {details}
                </div>
              </>
            ) : descLines.length > 0 ? (
              <div style={{ color: 'var(--text-main)', fontSize: '1.1rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {ad.description}
              </div>
            ) : null}
          </div>

          {/* Footer Info */}
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem', borderTop: '1px dashed var(--border)', paddingTop: '1rem' }}>
            <span style={{ display: 'inline-flex', padding: '4px 8px', background: 'var(--bg-hover)', borderRadius: '6px', fontWeight: 500 }}>Sponsored by</span>
            {ad.ownerEmail}
          </div>

          {/* Action Button */}
          <button 
            onClick={handleUpgrade}
            className="btn" 
            style={{ width: '100%', padding: '1rem', fontSize: '1.05rem', fontWeight: 'bold', background: 'linear-gradient(135deg, var(--warning), #F39C12)', color: '#000', border: 'none', borderRadius: '12px', boxShadow: '0 4px 12px rgba(243, 156, 18, 0.3)', cursor: 'pointer', transition: 'transform 0.1s' }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            ✨ สมัคร PRO สิ ถ้าอยากข้ามโฆษณา ✨
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
