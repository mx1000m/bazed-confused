import React, { useState, useEffect } from 'react';
import './ProfileCardModal.css';

const ProfileCardModal = ({ 
  onClose, 
  profile, 
  score, 
  termsSubmitted,
  onCast = null
}) => {
  const [fadeIn, setFadeIn] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Messages for Farcaster cast
  const castMessages = [
    "🔵 BAZED & CONFUSED got {score} points for teaching normies crypto slang. 🧠 www.bazedandconfused.com",
    "🔵 Bagged {score} points just vibin' on BAZED & CONFUSED. 📚😤 Come learn crypto slang: www.bazedandconfused.com",
    "🔵 Teaching normies got me {score} points on BAZED & CONFUSED. 😂📚 www.bazedandconfused.com",
    "🔵 {score} points for dropping crypto slang on BAZED & CONFUSED : www.bazedandconfused.com",
    "🔵 Dropped alpha, stacked points. BAZED & CONFUSED things. 🧠 www.bazedandconfused.com"
  ];

  // Array of image paths (assuming they're in public/images folder)
  const imageOptions = [
    "/images/BazedAndConfused-1-LR.jpg",
    "/images/BazedAndConfused-2-LR.jpg",
    "/images/BazedAndConfused-3-LR.jpg",
    "/images/BazedAndConfused-4-LR.jpg",
    "/images/BazedAndConfused-5-LR.jpg",
    "/images/BazedAndConfused-6-LR.jpg",
    "/images/BazedAndConfused-7-LR.jpg",
    "/images/BazedAndConfused-8-LR.jpg"
  ];
  
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

  const handleCast = () => {
    // Select a random message and image
    const randomMessageIndex = Math.floor(Math.random() * castMessages.length);
    const randomImageIndex = Math.floor(Math.random() * imageOptions.length);
    
    const selectedMessage = castMessages[randomMessageIndex].replace('{score}', score);
    const selectedImage = imageOptions[randomImageIndex];
    
    // If onCast is provided, use it, otherwise use default alert
    if (onCast) {
      onCast(selectedMessage, selectedImage);
    } else {
      // Default behavior for development/testing
      alert(`Would cast to Farcaster with message: ${selectedMessage}\nand image: ${selectedImage}`);
    }
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
              <hr></hr>
              <span className="stat-label">SCORE:</span> <span className="score-value">{score} pts</span>
            </div>
            <div className="stat-item">
              <span className="stat-label2">TERMS SUBMITTED:</span> <span className="score-value">{termsSubmitted}</span>
              <hr></hr>
            </div>
          </div>

          <button 
            className="cast-button" 
            onClick={handleCast}
          >
            🎙️ CAST TO FARCASTER
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCardModal;