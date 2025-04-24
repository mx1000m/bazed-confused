import React, { useState, useEffect } from 'react';
import { SignInButton, useProfile } from '@farcaster/auth-kit';
import './SubmitForm.css';

export default function SubmitForm({ onClose }) {
  const { isAuthenticated, profile } = useProfile();
  const [isMobile, setIsMobile] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

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

  const [fields, setFields] = useState({
    term: '',
    category: '',
    definition: '',
    explanation: '',
    examples: ''
  });

  const [errors, setErrors] = useState({});
  const [shakeKeys, setShakeKeys] = useState({});

  const handleChange = (e) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
    
    // Clear error for this field when user is typing
    if (errors[e.target.name]) {
      const newErrors = {...errors};
      delete newErrors[e.target.name];
      setErrors(newErrors);
    }
  };

  const validate = () => {
    const newErrors = {};
    const newShakeKeys = {}; // Create new shake state to trigger animation
    
    for (const key in fields) {
      if (!fields[key].trim()) {
        newErrors[key] = true;
        newShakeKeys[key] = Date.now(); // Use timestamp to ensure it's always different
      }
    }
    
    setErrors(newErrors);
    setShakeKeys(newShakeKeys);
    
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

  const handleSubmit = async () => {
    if (!validate()) return;

    if (!isAuthenticated || !profile?.username) {
      alert('Please sign in with Farcaster first!');
      return;
    }

    try {
      const response = await fetch('/.netlify/functions/submitTerm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          term: fields.term,
          category: fields.category,
          definition: fields.definition,
          explanation: fields.explanation,
          examples: fields.examples
            .split('\n')
            .map(line => line.trim())
            .filter(line => line),
          submitted_by: `@${profile.username}`
        })
      });

      const result = await response.json();

      if (response.ok) {
        alert('✅ Term successfully submitted!');
        handleClose();
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
              <label>Crypto term</label>
              <input
                name="term"
                placeholder="Enter crypto term"
                className={errors.term ? 'error' : ''}
                data-shake={shakeKeys.term || undefined}
                value={fields.term}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>Category</label>
              <input
                name="category"
                placeholder="e.g., Culture, DeFi, Persona..."
                className={errors.category ? 'error' : ''}
                data-shake={shakeKeys.category || undefined}
                value={fields.category}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>Definition</label>
              <input
                name="definition"
                placeholder="What does it mean?"
                className={errors.definition ? 'error' : ''}
                data-shake={shakeKeys.definition || undefined}
                value={fields.definition}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>Explanation</label>
              <input
                name="explanation"
                placeholder="What does it do?"
                className={errors.explanation ? 'error' : ''}
                data-shake={shakeKeys.explanation || undefined}
                value={fields.explanation}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>Examples</label>
              <textarea
                name="examples"
                placeholder="Examples (one per line)"
                className={`examples-textarea ${errors.examples ? 'error' : ''}`}
                data-shake={shakeKeys.examples || undefined}
                value={fields.examples}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </div>

          <div className="auth-section">
            {!isAuthenticated ? (
              <SignInButton />
            ) : (
              <p className="user-connected">Connected as @{profile.username}</p>
            )}
          </div>

          <button className="submit-term-btn" onClick={handleSubmit}>
            Submit Term
          </button>
        </div>
      </div>
    </div>
  );
}