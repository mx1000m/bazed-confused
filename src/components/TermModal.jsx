import React, { useState, useEffect } from 'react';
import { useProfile } from '@farcaster/auth-kit';
import Button from './Button';
import './TermModal.css';

const TermModal = ({ termData, termKey, onClose, onSurpriseAgain }) => {
  const { isAuthenticated, profile } = useProfile();
  const [fadeInOverlay, setFadeInOverlay] = useState(false);
  const [fadeInModal, setFadeInModal] = useState(false);
  const [fadeInContent, setFadeInContent] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [voteStatus, setVoteStatus] = useState(null); // null, 'upvote', or 'downvote'
  const [voteCounts, setVoteCounts] = useState({ upvotes: 0, downvotes: 0 });
  const [voteLoading, setVoteLoading] = useState(false);
  
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

  // Reset vote state when term changes
  useEffect(() => {
    if (termKey) {
      // Reset vote status when term changes
      setVoteStatus(null);
      setVoteCounts({ upvotes: 0, downvotes: 0 });
      
      // Load term votes
      const fetchTermVotes = async () => {
        try {
          const response = await fetch(`/.netlify/functions/getTermVotes?termKey=${encodeURIComponent(termKey)}`);
          if (response.ok) {
            const data = await response.json();
            setVoteCounts({
              upvotes: data.upvotes || 0,
              downvotes: data.downvotes || 0
            });
          }
        } catch (error) {
          console.error("Error fetching term votes:", error);
        }
      };
      
      fetchTermVotes();
      
      // Load user's vote if authenticated
      if (isAuthenticated && profile) {
        const fetchUserVote = async () => {
          try {
            const response = await fetch(`/.netlify/functions/getUserVote?termKey=${encodeURIComponent(termKey)}&username=${encodeURIComponent(profile.username)}`);
            if (response.ok) {
              const data = await response.json();
              setVoteStatus(data.voteType);
            }
          } catch (error) {
            console.error("Error fetching user vote:", error);
          }
        };
        
        fetchUserVote();
      }
    }
  }, [termKey, isAuthenticated, profile]);

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

  // Handle vote
  const handleVote = async (voteType) => {
    if (!isAuthenticated) {
      alert("Please sign in with Farcaster to vote!");
      return;
    }

    if (voteLoading) return;
    setVoteLoading(true);

    try {
      const newVoteType = voteStatus === voteType ? null : voteType;
      
      // Update local state optimistically
      const oldVoteStatus = voteStatus;
      setVoteStatus(newVoteType);
      
      // Calculate new vote counts
      const newVoteCounts = { ...voteCounts };
      
      // Remove old vote if exists
      if (oldVoteStatus === 'upvote') newVoteCounts.upvotes = Math.max(0, newVoteCounts.upvotes - 1);
      if (oldVoteStatus === 'downvote') newVoteCounts.downvotes = Math.max(0, newVoteCounts.downvotes - 1);
      
      // Add new vote if not removing
      if (newVoteType === 'upvote') newVoteCounts.upvotes++;
      if (newVoteType === 'downvote') newVoteCounts.downvotes++;
      
      setVoteCounts(newVoteCounts);

      // Send vote to server
      const response = await fetch('/.netlify/functions/submitVote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          termKey,
          username: profile.username,
          voteType: newVoteType
        })
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        // Revert state if server request failed
        setVoteStatus(oldVoteStatus);
        setVoteCounts(voteCounts);
        console.error("Vote submission failed", responseData);
        alert("Unable to register your vote. Please try again.");
      } else {
        console.log("Vote submitted successfully", responseData);
        // Update with server counts to ensure consistency
        if (responseData.upvotes !== undefined && responseData.downvotes !== undefined) {
          setVoteCounts({
            upvotes: responseData.upvotes,
            downvotes: responseData.downvotes
          });
        }
      }
    } catch (error) {
      console.error("Error submitting vote:", error);
      alert("Error submitting vote. Please try again.");
    } finally {
      setVoteLoading(false);
    }
  };

  if (!termData) return null;

  const { definition, explanation, examples, submitted_by } = termData;

  return (
    <div className={`term-modal-overlay ${fadeInOverlay ? 'fade-in' : ''} ${isMobile ? 'mobile' : ''}`}>
      <div className="term-modal-container">
        <div className={`term-modal ${fadeInModal ? 'fade-in' : ''}`}>
          <Button onClick={handleClose} variant="close-circle">✕</Button>

          <div className={`term-modal-content ${fadeInContent ? 'fade-in' : ''}`}>
            <div className="term-header">
              <h2>{termKey}</h2>
              
              <div className="term-votes">
                <button 
                  className={`vote-button upvote ${voteStatus === 'upvote' ? 'active' : ''}`} 
                  onClick={() => handleVote('upvote')}
                  disabled={voteLoading}
                  title="Upvote this term"
                >
                  <span className="vote-icon">👍</span>
                  <span className="vote-count">{voteCounts.upvotes}</span>
                </button>
                
                <button 
                  className={`vote-button downvote ${voteStatus === 'downvote' ? 'active' : ''}`} 
                  onClick={() => handleVote('downvote')}
                  disabled={voteLoading}
                  title="Downvote this term"
                >
                  <span className="vote-icon">👎</span>
                  <span className="vote-count">{voteCounts.downvotes}</span>
                </button>
              </div>
            </div>
            
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
            <Button variant="primary" onClick={handleSurpriseAgain} isSurpriseMe={true}>Surprise me again</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermModal;