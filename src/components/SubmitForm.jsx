import React, { useState } from 'react';
import { SignInButton, useProfile } from '@farcaster/auth-kit';
import './SubmitForm.css';

export default function SubmitForm({ onClose }) {
  const { isAuthenticated, profile } = useProfile();
  const [fields, setFields] = useState({
    term: '',
    category: '',
    definition: '',
    explanation: '',
    examples: ''
  });

  const [errors, setErrors] = useState({});

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
          examples: fields.examples.split('\n').map(line => line.trim()).filter(line => line),
          submitted_by: `@${profile.username}`
        })
      });
  
      const result = await response.json();
  
      if (response.ok) {
        alert('✅ Term successfully submitted!');
        onClose();
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
  

  return (
    <div className="modal-overlay">
      <div className="submit-form">
        <button className="close-btn" onClick={onClose}>✕</button>


        <p style={{ fontWeight: '700', fontSize: '1.3rem', marginBottom: '-1.8rem' , marginTop: '-0.3rem' }}>
        Share your knowledge!</p>
        <p style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '-0.8rem' }}>
        Fill the form, connect Farcaster, and <br />contribute with a crypto term.</p>


        <p style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '-0.7rem', textAlign: 'left' }}>
  Crypto term
</p>


        <input
          name="term"
          placeholder="Enter crypto term"
          className={errors.term ? 'error shake' : ''}
          value={fields.term}
          onChange={handleChange}
        />


<p style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '-0.7rem', textAlign: 'left' , marginTop: ' 0rem' }}>
  Category
</p>
        <input
          name="category"
          placeholder="e.g., Culture, DeFi, Persona..."
          className={errors.category ? 'error shake' : ''}
          value={fields.category}
          onChange={handleChange}
        />

<p style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '-0.7rem', textAlign: 'left' , marginTop: ' 0rem' }}>
  Definition
</p>
        <textarea
          name="definition"
          placeholder="What does it mean?"
          className={errors.definition ? 'error shake' : ''}
          value={fields.definition}
          onChange={handleChange}
        />


<p style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '-0.7rem', textAlign: 'left' , marginTop: ' 0rem' }}>
  Explanation
</p>
        <textarea
          name="explanation"
          placeholder="What does it do?"
          className={errors.explanation ? 'error shake' : ''}
          value={fields.explanation}
          onChange={handleChange}
        />

<p style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '-0.7rem', textAlign: 'left' , marginTop: ' 0rem' }}>
  Examples
</p>
        <textarea
          name="examples"
          placeholder="Examples (one per line)"
          className={errors.examples ? 'error shake' : ''}
          value={fields.examples}
          onChange={handleChange}
        />

{!isAuthenticated ? (
  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' , marginTop: '0.5rem' }}>
    <SignInButton />
  </div>
) : (
  <p style={{ marginBottom: '1rem', textAlign: 'center' }}>
    Connected as @{profile.username}
  </p>
)}


        <button className="submit-term-btn" onClick={handleSubmit}>
          Submit Term
        </button>
      </div>
    </div>
  );
}
