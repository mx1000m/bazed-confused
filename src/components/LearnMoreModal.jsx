import React, { useState, useEffect } from 'react';
import Button from './Button';
import './LearnMoreModal.css';

const LearnMoreModal = ({ onClose }) => {
  const [fadeInOverlay, setFadeInOverlay] = useState(false);
  const [fadeInModal, setFadeInModal] = useState(false);
  const [fadeInContent, setFadeInContent] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
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
      if (!e.target.closest('.learn-more-modal')) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('touchmove', preventTouchMove, { passive: false });
    
    // Store the original body style
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalWidth = document.body.style.width;
    const originalHeight = document.body.style.height;
    const originalDocumentOverflow = document.documentElement.style.overflow;
    const originalDocumentHeight = document.documentElement.style.height;
    
    // Apply styles to prevent background scrolling
    if (isMobile) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.height = '100%';
      document.body.style.height = '100%';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    }
    
    return () => {
      document.removeEventListener('touchmove', preventTouchMove);
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.width = originalWidth;
      document.body.style.height = originalHeight;
      document.documentElement.style.overflow = originalDocumentOverflow;
      document.documentElement.style.height = originalDocumentHeight;
    };
  }, [isMobile]);
  
  // Fade in on mount
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      setFadeInOverlay(true);
      setFadeInModal(true);
      setFadeInContent(true);
    }, 10);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle complete close (overlay + modal)
  const handleClose = () => {
    setFadeInOverlay(false);
    setFadeInModal(false);
    
    setTimeout(() => {
      onClose();
    }, 150); // Slightly faster fade-out
  };

  return (
    <div className={`learn-more-modal-overlay ${fadeInOverlay ? 'fade-in' : ''} ${isMobile ? 'mobile' : ''}`}>
      <div className="learn-more-modal-container">
        <div className={`learn-more-modal ${fadeInModal ? 'fade-in' : ''}`}>
          <Button onClick={handleClose} variant="close-circle">✕</Button>

          <div className={`learn-more-modal-content ${fadeInContent ? 'fade-in' : ''}`}>
            <h2>Bazed & Confused?</h2>
            
            <div className="learn-more-section">
              <p className="learn-more-heading">
                <strong>Tired of explaining what GM GM or WAGMI means for the 100th time?</strong>
              </p>
              <p>
                Just send them to <strong>Bazed & Confused</strong> — the community built crypto slang Bible by MX1000. 
                You add the terms, the community votes, and everyone gets less confused, hopefully.
              </p>
              
              <ul className="learn-more-list">
                <li>
                  <span className="learn-more-icon">✍️</span>
                  <span>Drop a term? You earn 10pts.</span>
                </li>
                <li>
                  <span className="learn-more-icon">❌</span>
                  <span>Post a cringe one? 15 downvotes and it's gone — and so are your points 😬</span>
                </li>
              </ul>
              
              <p className="learn-more-tagline">
                It's like Urban Dictionary, but onchain vibes.
              </p>
            </div>

          </div>

          <div className="learn-more-actions">
            <Button variant="secondary" onClick={handleClose}>Close</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnMoreModal;