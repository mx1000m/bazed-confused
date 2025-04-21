import React, { useState, useEffect } from 'react';
import { SignInButton, useSignIn } from '@farcaster/auth-kit';
import './SubmitForm.css';

export default function SubmitForm({ onClose }) {
  // Get complete sign-in context
  const signInContext = useSignIn();
  const { user, signIn, signOut, status } = signInContext;
  
  const [fields, setFields] = useState({
    term: '',
    category: '',
    definition: '',
    explanation: '',
    examples: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debug auth state changes
  useEffect(() => {
    console.log("Auth Status:", status);
    console.log("User:", user);
    console.log("Complete Auth Context:", signInContext);
  }, [user, status, signInContext]);

  const handleChange = (e) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: false });
  };

  const validate = () => {
    const newErrors = {};
    for (const key in fields) {
      if (!fields[key].trim()) newErrors[key] = true;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkAndSignIn = async () => {
    if (!user) {
      try {
        console.log("Attempting to sign in...");
        await signIn();
        return false; // Return false to indicate we need to wait for auth
      } catch (error) {
        console.error("Sign in error:", error);
        alert("Failed to sign in with Farcaster");
        return false;
      }
    }
    return true; // Already signed in
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    console.log("Submit pressed, checking auth...");
    
    // Set submitting state to prevent multiple clicks
    setIsSubmitting(true);
    
    // First, ensure we're signed in
    const isSignedIn = await checkAndSignIn();
    if (!isSignedIn) {
      setIsSubmitting(false);
      return;
    }
    
    // Double-check user object after sign in
    if (!user?.username) {
      console.error("No username after authentication");
      alert('Authentication incomplete. Please sign in with Farcaster!');
      setIsSubmitting(false);
      
      // Try signing out and back in
      try {
        await signOut();
        console.log("Signed out, try signing in again");
      } catch (e) {
        console.error("Sign out error:", e);
      }
      return;
    }

    try {
      console.log("Submitting with user:", user.username);
      
      const response = await fetch('/.netlify/functions/submitTerm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          term: fields.term,
          category: fields.category,
          definition: fields.definition,
          explanation: fields.explanation,
          examples: fields.examples.split('\n').map(line => line.trim()).filter(line => line),
          submitted_by: `@${user.username}`
        })
      });

      const result = await response.json();

      if (response.ok) {
        alert('✅ Term successfully submitted!');
        onClose();
      } else {
        console.error(result);
        alert(`❌ Submission failed: ${result.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error("Submission error:", err);
      alert('❌ Network or server error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="submit-form">
        <button className="close-btn" onClick={onClose}>✕</button>

        <input
          name="term"
          placeholder="Term"
          className={errors.term ? 'error shake' : ''}
          value={fields.term}
          onChange={handleChange}
        />
        <input
          name="category"
          placeholder="Category (e.g., Culture, DeFi)"
          className={errors.category ? 'error shake' : ''}
          value={fields.category}
          onChange={handleChange}
        />
        <textarea
          name="definition"
          placeholder="Definition"
          className={errors.definition ? 'error shake' : ''}
          value={fields.definition}
          onChange={handleChange}
        />
        <textarea
          name="explanation"
          placeholder="Explanation"
          className={errors.explanation ? 'error shake' : ''}
          value={fields.explanation}
          onChange={handleChange}
        />
        <textarea
          name="examples"
          placeholder="Examples (one per line)"
          className={errors.examples ? 'error shake' : ''}
          value={fields.examples}
          onChange={handleChange}
        />

        <div style={{ marginBottom: '1rem' }}>
          {status === 'loading' ? (
            <p>Loading authentication...</p>
          ) : !user?.username ? (
            <>
              <p style={{ marginBottom: '0.5rem' }}>Please sign in to submit:</p>
              <SignInButton />
            </>
          ) : (
            <div>
              <p>Connected as @{user.username}</p>
              <button 
                onClick={signOut} 
                style={{ 
                  background: 'transparent', 
                  border: '1px solid #ccc', 
                  padding: '0.3rem 0.5rem',
                  borderRadius: '4px',
                  marginTop: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>

        <button 
          className="submit-term-btn" 
          onClick={handleSubmit}
          disabled={isSubmitting || status === 'loading'}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Term'}
        </button>
      </div>
    </div>
  );
}