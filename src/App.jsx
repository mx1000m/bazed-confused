import React, { useState, useEffect, useRef } from 'react';
import { SignInButton } from '@farcaster/auth-kit';
import '@farcaster/auth-kit/styles.css';
import Button from './components/Button';
import TermModal from './components/TermModal';
import SearchBar from './components/SearchBar';
import SubmitForm from './components/SubmitForm';
import Footer from './components/Footer';
import LoginButton from './components/LoginButton';
import ProfileCard from './components/ProfileCard';
import LearnMoreModal from './components/LearnMoreModal';
import { useProfile } from '@farcaster/auth-kit';
import { Buffer } from 'buffer';
window.Buffer = Buffer;

export default function App() {
  const { isAuthenticated, profile } = useProfile();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLearnMoreOpen, setIsLearnMoreOpen] = useState(false);
  const [terms, setTerms] = useState({});
  const [randomTerm, setRandomTerm] = useState(null);
  const [randomKey, setRandomKey] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [shouldShake, setShouldShake] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isCompactDesktop, setIsCompactDesktop] = useState(window.innerWidth < 900);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  const inputRef = useRef(null);

  useEffect(() => {
    fetch('/terms.json')
      .then(res => res.json())
      .then(data => setTerms(data))
      .catch(err => console.error('Error loading terms.json:', err));
    
    // Add responsive handler
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setIsMobile(width < 768);
      setIsCompactDesktop(width >= 768 && width < 900);
      setViewportHeight(height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Force a reflow/repaint to ensure correct height calculation
    setTimeout(handleResize, 100);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Effect to prevent scrolling on mobile only
  useEffect(() => {
    // Check if any modal is open
    const isAnyModalOpen = randomTerm || isModalOpen || isLearnMoreOpen;
    
    if (isMobile && !isAnyModalOpen) {
      // Only prevent scrolling on home page (when no modal is open)
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.height = '100%';
      document.body.style.height = '100%';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
      document.body.style.height = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
      document.body.style.height = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isMobile, randomTerm, isModalOpen, isLearnMoreOpen]);

  // Handler for when a new term is submitted
  const handleTermSubmitted = (newTerm) => {
    // Update the terms state with the new term
    setTerms(prevTerms => ({
      ...prevTerms,
      ...newTerm
    }));
  };

  const showRandomTerm = () => {
    const keys = Object.keys(terms);
    const random = keys[Math.floor(Math.random() * keys.length)];
    setRandomKey(random);
    setRandomTerm(terms[random]);
  };

  const openSearchTerm = () => {
    const key = Object.keys(terms).find(term =>
      term.toLowerCase() === searchTerm.trim().toLowerCase()
    );
    if (key) {
      setSelectedTerm(key);
      setRandomKey(key);
      setRandomTerm(terms[key]);
    } else {
      setShouldShake(true);
      setTimeout(() => setShouldShake(false), 500);
    }
  };

  const handleCloseModal = () => {
    setRandomTerm(null);
  };

  const handleSurpriseAgain = () => {
    // Get a new random term without closing the modal
    const keys = Object.keys(terms).filter(key => key !== randomKey);
    const random = keys[Math.floor(Math.random() * keys.length)];
    setRandomKey(random);
    setRandomTerm(terms[random]);
  };

  const handleSubmitFormClose = () => {
    setIsModalOpen(false);
  };

  // Different layouts for mobile and desktop
  const renderSearchInterface = () => {
    if (isMobile) {
      // Mobile layout - with search bar nudged right and buttons moved down
      return (
        <>
          {/* Search bar - centered with slight right adjustment */}
          <div style={{ 
            width: '100%', 
            maxWidth: '450px', 
            marginBottom: '-10px', // Reduced spacing between search bar and buttons
            margin: '0 auto',
            paddingLeft: '14px' // This nudges the search bar to the right
          }}>
            <SearchBar
              terms={terms}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onSelectTerm={(term) => {
                setSelectedTerm(term);
                setRandomTerm(terms[term]);
                setRandomKey(term);
              }}
              onSubmit={(term) => {
                setSelectedTerm(term);
                setRandomTerm(terms[term]);
                setRandomKey(term);
              }}
              shouldShake={shouldShake}
              inputRef={inputRef}
            />
          </div>
          
          {/* Buttons below the search bar with added spacing - centered */}
          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            justifyContent: 'center',
            margin: '0 auto',
            width: 'auto',
            marginTop: '40px',  // Increased margin to move buttons lower
            marginBottom: '10px' // Added explicit bottom margin to control space
          }}>
            <Button variant="outline-white" onClick={openSearchTerm}>
              Get answer
            </Button>
            <Button variant="primary" onClick={showRandomTerm} isSurpriseMe={true}>
              Surprise me
            </Button>
          </div>
        </>
      );
    } else {
      // Desktop layout - adjust based on window width
      return (
        <div style={{
          display: 'flex',
          flexDirection: isCompactDesktop ? 'column' : 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: isCompactDesktop ? '24px' : '32px',
          margin: '0 auto',
          maxWidth: '800px'
        }}>
          {/* Search bar with conditional styling */}
          <div style={{ 
            flex: isCompactDesktop ? 'initial' : '1', 
            width: isCompactDesktop ? '100%' : 'auto',
            minWidth: isCompactDesktop ? 'auto' : '300px', 
            maxWidth: '450px',
            paddingRight: isCompactDesktop ? '0' : '12px',
            margin: isCompactDesktop ? '0 auto' : '0',
            paddingLeft: isCompactDesktop ? '0px' : '0', // Apply the nudge to compact desktop too
            marginLeft: isCompactDesktop ? '-1rem' : '0'
          }}>
            <SearchBar
              terms={terms}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onSelectTerm={(term) => {
                setSelectedTerm(term);
                setRandomTerm(terms[term]);
                setRandomKey(term);
              }}
              onSubmit={(term) => {
                setSelectedTerm(term);
                setRandomTerm(terms[term]);
                setRandomKey(term);
              }}
              shouldShake={shouldShake}
              inputRef={inputRef}
            />
          </div>
          
          {/* Buttons with conditional styling // For desktop layout: */}       
          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            flexShrink: 0,
            marginLeft: isCompactDesktop ? '0' : '10px',
            justifyContent: isCompactDesktop ? 'center' : 'flex-start',
            width: isCompactDesktop ? 'auto' : 'initial',
            margin: isCompactDesktop ? '0 auto' : '0'
          }}>
            <Button variant="outline-white" onClick={openSearchTerm}>
              Get answer
            </Button>
            <Button variant="primary" onClick={showRandomTerm} isSurpriseMe={true}>
              Surprise me
            </Button>
          </div>
        </div>
      );
    }
  };

  // Render subtitle text with conditional line break based on mobile or desktop
  const renderSubtitleText = () => {
    if (isMobile) {
      return (
        <>
          Search any crypto term, hit <b>"Surprise me"</b><br />
          to discover a random one, or{' '}
          <span 
            className="submit-link"
            onClick={() => setIsModalOpen(true)}
            style={{
              color: '#fff',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            submit
          </span>{' '}
          your own.{' '}
          <span 
            className="learn-more-link"
            onClick={() => setIsLearnMoreOpen(true)}
            style={{
              color: '#fff',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Learn how it works
          </span>
        </>
      );
    } else {
      return (
        <>
          Search any crypto term, hit <b>"Surprise me"</b> to discover a random one, or{' '}
          <span 
            className="submit-link"
            onClick={() => setIsModalOpen(true)}
            style={{
              color: '#fff',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            submit
          </span>{' '}
          your own.{' '}
          <span 
            className="learn-more-link"
            onClick={() => setIsLearnMoreOpen(true)}
            style={{
              color: '#fff',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            <br />Learn how it works
          </span>
        </>
      );
    }
  };

  // Calculate dynamic spacing for mobile
  const calculateMobileSpacing = () => {
    // This is a calculation for spacing the elements evenly in the viewport
    // Adjust these values as needed
    const footerHeight = 50; // Estimated height of footer
    const topOffset = viewportHeight * 0.2; // Position title 20% from top
    
    return {
      marginTop: `${topOffset}px`,
      marginBottom: `${footerHeight + 20}px` // Add some buffer
    };
  };

  const mobileSpacing = isMobile ? calculateMobileSpacing() : {};

  // Check if any modal is open
  const isAnyModalOpen = randomTerm || isModalOpen || isLearnMoreOpen;
  
  // Show login button or profile card only when no modal is open
  const shouldShowAuthControls = !isAnyModalOpen;

  return (
    <div style={{
      fontFamily: 'Inter, sans-serif',
      background: 'linear-gradient(120deg, #006eff, #0038c7)',
      color: 'white',
      height: isMobile ? '100vh' : 'auto', // Force exact viewport height on mobile
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: isMobile ? 'hidden' : 'visible', // Prevent scrolling on mobile
      position: 'relative'
    }}>
      {/* Farcaster Authentication Components */}
      {shouldShowAuthControls && (
        <>
          <LoginButton />
          <ProfileCard terms={terms} />
        </>
      )}
      
      {/* Centered content block */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: isMobile ? 'flex-start' : 'center', // Center on desktop, but align at top on mobile
        textAlign: 'center',
        padding: isMobile ? '0 16px' : '16px', // Remove vertical padding on mobile
        overflow: isMobile ? 'hidden' : 'visible', // Prevent scrolling on mobile
        height: isMobile ? '100%' : 'auto',
        boxSizing: 'border-box',
        position: 'relative',
        ...mobileSpacing
      }}>
        <div style={{
          width: '100%',
          maxWidth: '800px',
          margin: '0 auto',
          marginBottom: isMobile ? '1.5rem' : '3rem',
          position: 'relative',  // Create positioning context
          textAlign: 'center'    // Ensure content is centered
        }}>
          {/* Title with BETA label - now using relative positioning */}
          <div style={{ 
            position: 'relative',
            display: 'inline-block', // This makes container only as wide as content
            maxWidth: '100%'         // Ensure it doesn't overflow parent
          }}>
            <h1 style={{ 
              fontSize: isMobile ? '3rem' : '3rem',
              marginTop: isMobile ? '0' : '-3rem',
              marginBottom: '0.5rem',
              fontWeight: '700',
              lineHeight: '1.1',
              textAlign: 'center',
              whiteSpace: isMobile ? 'normal' : 'nowrap' // Allow wrapping on mobile
            }}>
              BAZED & CONFUSED
            </h1>
          </div>
          
          {/* Subtitle */}
          <p style={{ 
            marginTop: '0', 
            marginBottom: isMobile ? '1.5rem' : '2rem',
            letterSpacing: '0.15px',
            lineHeight: '1.3',
            fontSize: isMobile ? '0.95rem' : '1rem'
          }}>
            {renderSubtitleText()}
          </p>
        </div>

        {renderSearchInterface()}

        {isModalOpen && (
          <SubmitForm 
            onClose={handleSubmitFormClose} 
            onTermSubmitted={handleTermSubmitted}
            terms={terms} // Pass terms to SubmitForm
          />
        )}

        {randomTerm && (
          <TermModal
            termData={randomTerm}
            termKey={randomKey}
            onClose={handleCloseModal}
            onSurpriseAgain={handleSurpriseAgain}
            farcasterUser={profile?.username}
          />
        )}

        {isLearnMoreOpen && (
          <LearnMoreModal 
            onClose={() => setIsLearnMoreOpen(false)} 
          />
        )}
      </div>

      {/* Footer always at the bottom - position fixed on mobile */}
      <div style={{
        position: isMobile ? 'fixed' : 'relative',
        bottom: 0,
        left: 0,
        width: '100%',
        zIndex: 10
      }}>
        <Footer onSubmitClick={() => setIsModalOpen(true)} />
      </div>
    </div>
  );
}
