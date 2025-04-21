import React, { useState } from 'react';
import { SignInButton, useSignIn } from '@farcaster/auth-kit';
import './SubmitForm.css';
import { useViewer } from '@farcaster/auth-kit';


export default function SubmitForm({ onClose }) {
  const { isAuthenticated, user } = useSignIn();
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

    if (!isAuthenticated || !user?.username) {
      alert('Please sign in with Farcaster first!');
      return;
    }

    const newEntry = {
      [fields.term.toLowerCase()]: {
        category: fields.category,
        definition: fields.definition,
        explanation: fields.explanation,
        examples: fields.examples.split('\n').map(line => line.trim()).filter(line => line),
        submitted_by: `@${user.username}`
      }
    };

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
      console.error(err);
      alert('❌ Network or server error occurred.');
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

        {!isAuthenticated ? (
          <SignInButton />
        ) : (
          <p style={{ marginBottom: '1rem' }}>Connected as @{user.username}</p>
        )}

        <button className="submit-term-btn" onClick={handleSubmit}>
          Submit Term
        </button>
      </div>
    </div>
  );
}
