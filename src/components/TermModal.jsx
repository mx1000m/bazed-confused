import React from 'react';
import Button from './Button';

const TermModal = ({ termData, termKey, onClose, onSurpriseAgain }) => {
  if (!termData) return null;

  const { definition, explanation, examples, submitted_by } = termData;

  return (
    <div style={overlay}>
      <div style={modal}>
        <button onClick={onClose} style={close}>✕</button>
        <h2>{termKey}</h2>

        <div>
          <strong>Definition:</strong>
          <p>{definition}</p>
        </div>

        <div>
          <strong>Explanation:</strong>
          <p>{explanation}</p>
        </div>

        <div>
          <strong>Examples:</strong>
          {examples.map((ex, i) => (
            <p key={i} style={{ fontStyle: 'italic', color: '#0038c7', fontWeight: 500 }}>
              {ex}
            </p>
          ))}
        </div>

        <div style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
          <em>Submitted by: {submitted_by}</em>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
          <Button variant="primary" onClick={onSurpriseAgain}>Surprise me again</Button>
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

export default TermModal;

const overlay = {
  position: 'fixed',
  top: 0, left: 0, width: '100vw', height: '100vh',
  background: 'rgba(0, 0, 0, 0.5)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000
};

const modal = {
  background: 'white',
  color: 'black',
  padding: '2rem',
  borderRadius: '16px',
  width: '90%',
  maxWidth: '500px',
  position: 'relative',
  textAlign: 'left',
};

const close = {
  position: 'absolute',
  top: '1rem',
  right: '1rem',
  background: 'transparent',
  border: 'none',
  fontSize: '1.5rem',
  cursor: 'pointer'
};
