import React, { useState, useEffect } from 'react';
import { SignInButton, useProfile } from '@farcaster/auth-kit';
import './LoginButton.css';

const LoginButton = () => {
  const { isAuthenticated } = useProfile();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="login-button-container" style={{ top: isMobile ? '12px' : '16px' }}>
      <SignInButton />
    </div>
  );
};

export default LoginButton;