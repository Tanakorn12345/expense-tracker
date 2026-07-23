import React, { useState, useEffect } from 'react';

const Logo = ({ size = 40, className = '' }) => {
  const [customLogoUrl, setCustomLogoUrl] = useState(null);

  useEffect(() => {
    const checkLogo = () => {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setCustomLogoUrl(user.customLogoUrl || null);
        } else {
          setCustomLogoUrl(null);
        }
      } catch (e) {
        console.error('Error reading user for logo', e);
      }
    };

    checkLogo();
    window.addEventListener('userUpdated', checkLogo);
    window.addEventListener('storage', checkLogo);

    return () => {
      window.removeEventListener('userUpdated', checkLogo);
      window.removeEventListener('storage', checkLogo);
    };
  }, []);

  if (customLogoUrl) {
    return (
      <img 
        src={customLogoUrl} 
        alt="Custom Logo" 
        width={size} 
        height={size} 
        className={className} 
        style={{ objectFit: 'contain', borderRadius: '12px' }} 
      />
    );
  }

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ filter: 'drop-shadow(0px 4px 6px rgba(0, 51, 102, 0.2))' }}
    >
      {/* Base rounded square */}
      <rect width="40" height="40" rx="12" fill="url(#logoGradient)" />
      
      {/* F letter stem and bars */}
      <path d="M12 11C12 10.4477 12.4477 10 13 10H26C26.5523 10 27 10.4477 27 11V14C27 14.5523 26.5523 15 26 15H17V19H23C23.5523 19 24 19.4477 24 20V23C24 23.5523 23.5523 24 23 24H17V29C17 29.5523 16.5523 30 16 30H13C12.4477 30 12 29.5523 12 29V11Z" fill="white" />
      
      {/* Upward trending arrow indicating growth/finance */}
      <path d="M22 21L30.5 12.5M30.5 12.5H24.5M30.5 12.5V18.5" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      
      <defs>
        <linearGradient id="logoGradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00509E" />
          <stop offset="1" stopColor="#002244" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default Logo;
