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

  const modalContent = (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 999999,
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-card)', borderRadius: '16px',
        padding: '2rem', width: '90%', maxWidth: '600px',
        maxHeight: '90vh', overflowY: 'auto',
        textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        animation: 'pageFadeInUp 0.5s ease-out'
      }}>
        <div style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Advertisement closes in <strong style={{ color: 'var(--danger)', fontSize: '1.2rem' }}>{timeLeft}</strong> seconds
        </div>
        
        {ad.images && ad.images.length > 0 && (
          <div style={{ position: 'relative', width: '100%', height: '300px', borderRadius: '12px', overflow: 'hidden', marginBottom: '1rem', backgroundColor: '#000' }}>
            <img 
              src={ad.images[currentImageIndex]} 
              alt="ad" 
              style={{ width: '100%', height: '100%', objectFit: 'contain', transition: 'opacity 0.5s ease-in-out' }} 
            />
            {ad.images.length > 1 && (
              <div style={{ position: 'absolute', bottom: '10px', width: '100%', display: 'flex', justifyContent: 'center', gap: '5px' }}>
                {ad.images.map((_, idx) => (
                  <div key={idx} style={{ 
                    width: '8px', height: '8px', borderRadius: '50%', 
                    backgroundColor: idx === currentImageIndex ? 'white' : 'rgba(255,255,255,0.5)' 
                  }} />
                ))}
              </div>
            )}
          </div>
        )}

        <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-main)' }}>{ad.description}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Sponsored by: {ad.ownerEmail}
        </p>

        <button 
          onClick={handleUpgrade}
          className="btn btn-primary" 
          style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', fontWeight: 'bold', background: 'linear-gradient(135deg, var(--warning), #F39C12)', color: '#000', border: 'none' }}
        >
          ✨ สมัคร PRO สิ ถ้าอยากข้ามโฆษณา ✨
        </button>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
