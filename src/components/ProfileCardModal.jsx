import React, { useState, useEffect } from 'react';
import './ProfileCardModal.css';

const ProfileCardModal = ({ 
  onClose, 
  profile, 
  score, 
  termsSubmitted,
  onCast = () => alert("Cast to Farcaster!") 
}) => {
  const [fadeIn, setFadeIn] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Check on mount
    checkMobile();
    
    // Check on resize
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    // For iOS Safari, we need a different approach
    // We'll keep the body scrollable but prevent touch events
    const preventTouchMove = (e) => {
      // Only if the modal itself isn't scrolling
      if (!e.target.closest('.profile-modal-container')) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('touchmove', preventTouchMove, { passive: false });
    
    // Store the original body style
    const originalOverflow = document.body.style.overflow;
    
    return () => {
      document.removeEventListener('touchmove', preventTouchMove);
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Add fade-in effect on mount
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      setFadeIn(true);
    }, 10);
    
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    // Trigger fade out
    setFadeIn(false);
    
    // Wait for fade out animation to complete before actually closing
    setTimeout(() => {
      onClose();
    }, 200); // Match the CSS transition time
  };

  // Get pfpUrl from profile - handle both pfp.url and pfpUrl formats
  const getProfileImageUrl = () => {
    if (profile.pfp && profile.pfp.url) {
      return profile.pfp.url;
    } else if (profile.pfpUrl) {
      return profile.pfpUrl;
    } else if (profile.displayName && profile.displayName.pfpUrl) {
      return profile.displayName.pfpUrl;
    }
    // Default placeholder if no image is found
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";
  };

  return (
    <div className={`modal-overlay ${isMobile ? 'mobile fullscreen' : ''} ${fadeIn ? 'fade-in' : ''}`}>
      <div className="profile-modal-container">
        <div className={`profile-modal ${fadeIn ? 'fade-in' : ''}`}>
          <button className="close-btn" onClick={handleClose}>✕</button>

          <h2 className="modal-title">BAZED & CONFUSED</h2>
          <p className="modal-subtitle">
            Helping normies speak onchain fluently
          </p>

          <div className="avatar-container">
            <img
              src={getProfileImageUrl()}
              alt={`@${profile.username}`}
              className="avatar-image"
            />
          </div>

          <p className="username">@{profile.username}</p>

          <div className="stats-container">
            <div className="stat-item">
              <span className="stat-label">Score:</span> {score} pts
            </div>
            <div className="stat-item">
              <span className="stat-label">Terms Submitted:</span> {termsSubmitted}
            </div>
          </div>

          <button 
            className="cast-button" 
            onClick={onCast}
          >
            🎙️ CAST TO FARCASTER
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCardModal;