import React, { useState, useEffect, useRef } from 'react';
import { SignInButton, useProfile } from '@farcaster/auth-kit';
import './SubmitForm.css';
import PointsCelebration from './PointsCelebration';

// Create a fallback filter in case the package fails to load
const createSimpleFilter = () => {
  // Default list of bad words to check
  const badWordsList = [
    'ass', 'asshole', 'bitch', 'bastard', 'cunt', 'dick', 'faggot', 
    'fag', 'nigger', 'nigga', 'piss', 'pussy', 'shit', 'slut', 'whore'
  ];
  
  // Remove these from the list (allowed words)
  const allowedWords = ['fuck', 'fucking'];
  
  // Filter out the allowed words
  const filteredList = badWordsList.filter(word => !allowedWords.includes(word));
  
  return {
    isProfane: (text) => {
      if (!text) return false;
      
      const lowerText = text.toLowerCase();
      // Check if any bad word is included in the text
      return filteredList.some(word => lowerText.includes(word));
    }
  };
};

export default function SubmitForm({ onClose, onTermSubmitted, terms }) {
  const { isAuthenticated, profile } = useProfile();
  const [isMobile, setIsMobile] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  
  // Ref to store debounce timer
  const debounceTimerRef = useRef(null);
  // State to track if term exists
  const [termExists, setTermExists] = useState(false);
  // State to track if fields contain banned words
  const [bannedWordsFields, setBannedWordsFields] = useState({
    term: false,
    category: false,
    definition: false,
    explanation: false,
    examples: false
  });
  // Ref for the profanity filter
  const filterRef = useRef(null);

  // Initialize the profanity filter
  useEffect(() => {
    // Use our simple filter implementation instead of the package
    filterRef.current = createSimpleFilter();
  }, []);

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
      if (!e.target.closest('.submit-form')) {
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

  // Character limits for each field
  const CHARACTER_LIMITS = {
    term: 40,
    category: 40,
    definition: 280,
    explanation: 280,
    examples: 280
  };

  const [fields, setFields] = useState({
    term: '',
    category: '',
    definition: '',
    explanation: '',
    examples: ''
  });

  const [errors, setErrors] = useState({});
  const [shakeKeys, setShakeKeys] = useState({});
  const [formShake, setFormShake] = useState(false);

  // Check if term exists in terms object
  const checkTermExists = (termValue) => {
    // Convert to lowercase for case-insensitive comparison
    const normalizedTerm = termValue.trim().toLowerCase();
    
    // If term is empty, don't check
    if (!normalizedTerm) {
      setTermExists(false);
      return false;
    }
    
    // Check if term exists (case-insensitive)
    const exists = Object.keys(terms || {}).some(term => 
      term.toLowerCase() === normalizedTerm
    );
    
    setTermExists(exists);
    return exists;
  };

  // Check if content contains banned words
  const checkBannedWords = (fieldName, value) => {
    if (!value || !filterRef.current) return false;
    
    try {
      // Check if the content is profane
      const isProfane = filterRef.current.isProfane(value);
      
      // Update the state for this specific field
      setBannedWordsFields(prev => ({
        ...prev,
        [fieldName]: isProfane
      }));
      
      return isProfane;
    } catch (error) {
      console.error(`Error checking banned words for ${fieldName}:`, error);
      return false;
    }
  };

  // Function to handle max length reached
  const handleMaxLength = (fieldName) => {
    // Create a new timestamp to ensure animation triggers every time
    setShakeKeys(prev => ({ ...prev, [fieldName]: Date.now() }));
    
    // Remove the shake class after animation completes to allow retriggering
    setTimeout(() => {
      setShakeKeys(prev => {
        const newState = { ...prev };
        delete newState[fieldName];
        return newState;
      });
    }, 300); // Animation duration is 0.2s, we give it a bit more time
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const limit = CHARACTER_LIMITS[name];
    
    // Only update if within limit
    if (value.length <= limit) {
      setFields({ ...fields, [name]: value });
      
      // Clear error for this field when user is typing
      if (errors[name]) {
        const newErrors = {...errors};
        delete newErrors[name];
        setErrors(newErrors);
      }
      
      // For the term field, check if it exists in the database
      if (name === 'term') {
        // Clear previous timer if it exists
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        
        // Set a new timer to check after user stops typing
        debounceTimerRef.current = setTimeout(() => {
          checkTermExists(value);
        }, 300); // Wait 300ms after typing stops
      }
      
      // For all fields, check for banned words
      // Clear previous timer if it exists for this specific check
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      // Set a new timer to check after user stops typing
      debounceTimerRef.current = setTimeout(() => {
        checkBannedWords(name, value);
      }, 300); // Wait 300ms after typing stops
    } else {
      // Truncate to max length
      setFields({ ...fields, [name]: value.slice(0, limit) });
      
      // Trigger shake animation if exceeding limit
      handleMaxLength(name);
    }
  };

  const validate = () => {
    const newErrors = {};
    const newShakeKeys = {}; // Create new shake state to trigger animation
    
    // Check each field and mark empty ones as errors
    for (const key in fields) {
      if (!fields[key].trim()) {
        newErrors[key] = true;
        newShakeKeys[key] = Date.now(); // Use timestamp to ensure it's always different
      }
    }
    
    // Add termExists as an error if true
    if (termExists) {
      newErrors.term = true;
      newShakeKeys.term = Date.now();
    }
    
    // Add banned words errors for all fields
    for (const key in bannedWordsFields) {
      if (bannedWordsFields[key]) {
        newErrors[key] = true;
        newShakeKeys[key] = Date.now();
      }
    }
    
    setErrors(newErrors);
    setShakeKeys(newShakeKeys);
    
    // Clear shake states after animation completes to allow for repeated shaking
    if (Object.keys(newErrors).length > 0) {
      // Trigger the form shake animation for the submit button
      setFormShake(true);
      setTimeout(() => setFormShake(false), 300);
      
      // Clear field shake states after animation to allow for repeated shaking
      setTimeout(() => {
        setShakeKeys({});
      }, 300);
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleClose = () => {
    // Trigger fade out
    setFadeIn(false);
    
    // Wait for fade out animation to complete before actually closing
    setTimeout(() => {
      onClose();
    }, 200); // Match the CSS transition time
  };

  const [showPointsCelebration, setShowPointsCelebration] = useState(false);

  const handleSubmit = async () => {
    // Run final validation on all fields
    Object.keys(fields).forEach(key => {
      if (fields[key].trim()) {
        checkBannedWords(key, fields[key]);
      }
    });
    
    // Always run validate and allow it to show errors with shake animation
    // even if it returns false
    const isValid = validate();
    
    if (!isValid) return;

    if (!isAuthenticated || !profile?.username) {
      alert('Please sign in with Farcaster first!');
      return;
    }

    // Prepare the term data
    const termData = {
      term: fields.term,
      category: fields.category,
      definition: fields.definition,
      explanation: fields.explanation,
      examples: fields.examples
        .split('\n')
        .map(line => line.trim())
        .filter(line => line),
      submitted_by: `@${profile.username}`
    };

    try {
      const response = await fetch('/.netlify/functions/submitTerm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(termData)
      });

      const result = await response.json();

      if (response.ok) {
        // Create the term structure as it would appear in the terms object
        const newTerm = {
          [fields.term]: {
            category: fields.category,
            definition: fields.definition,
            explanation: fields.explanation,
            examples: termData.examples,
            submitted_by: `@${profile.username}`
          }
        };
        
        // Call the callback function to update the parent state
        if (onTermSubmitted) {
          onTermSubmitted(newTerm);
        }
        
        alert('✅ Term successfully submitted!');
        // Show points celebration after alert is dismissed
        setShowPointsCelebration(true);
      } else if (response.status === 409) {
        alert(`⚠️ That term already exists: "${fields.term}". Try a different one!`);
      } else {
        console.error(result);
        alert(`❌ Submission failed: ${result.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error(err);
      alert('❌ Network or server error occurred.');
    }
  };

  // Import the points celebration component
  const handlePointsCelebrationComplete = () => {
    // Close the form after the celebration is complete
    handleClose();
  };

  if (!isVisible) return null;

  return (
    <div className={`modal-overlay ${isMobile ? 'mobile fullscreen' : ''} ${fadeIn ? 'fade-in' : ''}`}>
      <div className="submit-form-container">
        <div className={`submit-form ${fadeIn ? 'fade-in' : ''}`}>
          <button className="close-btn" onClick={handleClose}>✕</button>

          <h2 className="form-title">Share your knowledge!</h2>
          <p className="form-subtitle">
            Fill the form, connect Farcaster, and contribute with a crypto term.
          </p>

          <div className="form-fields">
            <div className="form-field">
              <label>
                Crypto term
                {termExists && <span className="term-exists-error"> this crypto term has already been submitted</span>}
                {bannedWordsFields.term && <span className="term-exists-error"> please avoid using inappropriate language</span>}
              </label>
              <div className="input-container">
                <input
                  name="term"
                  placeholder="Enter crypto term"
                  className={termExists || bannedWordsFields.term || errors.term ? 'error' : ''}
                  data-shake={shakeKeys.term || undefined}
                  value={fields.term}
                  onChange={handleChange}
                  onKeyPress={(e) => {
                    if (fields.term.length >= CHARACTER_LIMITS.term) {
                      handleMaxLength('term');
                      e.preventDefault();
                    }
                  }}
                  onBlur={() => {
                    checkTermExists(fields.term);
                    checkBannedWords('term', fields.term);
                  }}
                />
                <span className="char-counter">
                  {fields.term.length}/{CHARACTER_LIMITS.term}
                </span>
              </div>
            </div>

            <div className="form-field">
              <label>
                Category
                {bannedWordsFields.category && <span className="term-exists-error"> please avoid using inappropriate language</span>}
              </label>
              <div className="input-container">
                <input
                  name="category"
                  placeholder="e.g., Culture, DeFi, Persona..."
                  className={bannedWordsFields.category || errors.category ? 'error' : ''}
                  data-shake={shakeKeys.category || undefined}
                  value={fields.category}
                  onChange={handleChange}
                  onKeyPress={(e) => {
                    if (fields.category.length >= CHARACTER_LIMITS.category) {
                      handleMaxLength('category');
                      e.preventDefault();
                    }
                  }}
                  onBlur={() => checkBannedWords('category', fields.category)}
                />
                <span className="char-counter">
                  {fields.category.length}/{CHARACTER_LIMITS.category}
                </span>
              </div>
            </div>

            <div className="form-field">
              <label>
                Definition
                {bannedWordsFields.definition && <span className="term-exists-error"> please avoid using inappropriate language</span>}
              </label>
              <div className="input-container">
                <input
                  name="definition"
                  placeholder="What does it mean?"
                  className={bannedWordsFields.definition || errors.definition ? 'error' : ''}
                  data-shake={shakeKeys.definition || undefined}
                  value={fields.definition}
                  onChange={handleChange}
                  onKeyPress={(e) => {
                    if (fields.definition.length >= CHARACTER_LIMITS.definition) {
                      handleMaxLength('definition');
                      e.preventDefault();
                    }
                  }}
                  onBlur={() => checkBannedWords('definition', fields.definition)}
                />
                <span className="char-counter">
                  {fields.definition.length}/{CHARACTER_LIMITS.definition}
                </span>
              </div>
            </div>

            <div className="form-field">
              <label>
                Explanation
                {bannedWordsFields.explanation && <span className="term-exists-error"> please avoid using inappropriate language</span>}
              </label>
              <div className="input-container">
                <input
                  name="explanation"
                  placeholder="What does it do?"
                  className={bannedWordsFields.explanation || errors.explanation ? 'error' : ''}
                  data-shake={shakeKeys.explanation || undefined}
                  value={fields.explanation}
                  onChange={handleChange}
                  onKeyPress={(e) => {
                    if (fields.explanation.length >= CHARACTER_LIMITS.explanation) {
                      handleMaxLength('explanation');
                      e.preventDefault();
                    }
                  }}
                  onBlur={() => checkBannedWords('explanation', fields.explanation)}
                />
                <span className="char-counter">
                  {fields.explanation.length}/{CHARACTER_LIMITS.explanation}
                </span>
              </div>
            </div>

            <div className="form-field">
              <label>
                Examples
                {bannedWordsFields.examples && <span className="term-exists-error"> please avoid using inappropriate language</span>}
              </label>
              <div className="input-container">
                <textarea
                  name="examples"
                  placeholder="Examples (one per line)"
                  className={`examples-textarea ${bannedWordsFields.examples || errors.examples ? 'error' : ''}`}
                  data-shake={shakeKeys.examples || undefined}
                  value={fields.examples}
                  onChange={handleChange}
                  onKeyPress={(e) => {
                    if (fields.examples.length >= CHARACTER_LIMITS.examples) {
                      handleMaxLength('examples');
                      e.preventDefault();
                    }
                  }}
                  onBlur={() => checkBannedWords('examples', fields.examples)}
                  rows={3}
                />
                <span className="char-counter">
                  {fields.examples.length}/{CHARACTER_LIMITS.examples}
                </span>
              </div>
            </div>
          </div>

          <div className="auth-section">
            {!isAuthenticated ? (
              <SignInButton />
            ) : (
              <p className="user-connected">Connected as @{profile.username}</p>
            )}
          </div>

          <button 
            className="submit-term-btn" 
            onClick={handleSubmit}
            data-shake={formShake || undefined}
          >
            Submit Term
          </button>
        </div>
      </div>
      
      {/* Points celebration component */}
      {showPointsCelebration && (
        <PointsCelebration 
          show={showPointsCelebration} 
          onComplete={handlePointsCelebrationComplete} 
        />
      )}
    </div>
  );
}