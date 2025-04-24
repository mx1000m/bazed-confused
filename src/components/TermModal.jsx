import React, { useState, useEffect } from 'react';
import Button from './Button';
import './TermModal.css';

const TermModal = ({ termData, termKey, onClose, onSurpriseAgain, farcasterUser }) => {
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
      if (!e.target.closest('.term-modal')) {
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

  // Handle "Surprise me again" with fade effect for content only
  const handleSurpriseAgain = () => {
    // Only fade out the content, keep modal and overlay visible
    setFadeInContent(false);
    
    setTimeout(() => {
      onSurpriseAgain();
      // Quickly fade in the new content
      setTimeout(() => {
        setFadeInContent(true);
      }, 10);
    }, 150); // Faster transition
  };

  if (!termData) return null;

  const { definition, explanation, examples, submitted_by } = termData;

  return (
    <div className={`term-modal-overlay ${fadeInOverlay ? 'fade-in' : ''} ${isMobile ? 'mobile' : ''}`}>
      <div className="term-modal-container">
        <div className={`term-modal ${fadeInModal ? 'fade-in' : ''}`}>
          <Button onClick={handleClose} variant="close-circle">✕</Button>

          <div className={`term-modal-content ${fadeInContent ? 'fade-in' : ''}`}>
            <h2>{termKey}</h2>
            <hr className="term-divider" />

            <div className="term-section">
              <p className="term-section-title">Definition:</p>
              <p className="term-section-content">{definition}</p>
            </div>
            <hr className="term-divider" />

            <div className="term-section">
              <p className="term-section-title">Explanation:</p>
              <p className="term-section-content">{explanation}</p>
            </div>
            <hr className="term-divider" />

            <div className="term-section">
              <p className="term-section-title">Examples:</p>
              {examples.map((ex, i) => (
                <p key={i} className="term-example">
                  {ex}
                </p>
              ))}
            </div>
            <hr className="term-divider" />

            <div className="term-submitted-by">
              Submitted by:{' '}
              <a
                href={`https://warpcast.com/${submitted_by.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="term-submitter-link"
              >
                {submitted_by}
              </a>
            </div>
          </div>

          <div className="term-actions">
            <Button variant="secondary" onClick={handleClose}>Close</Button>
            <Button variant="primary" onClick={handleSurpriseAgain}>Surprise me again</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermModal;