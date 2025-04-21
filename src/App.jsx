import React, { useState, useEffect } from 'react';
import { SignInButton } from '@farcaster/auth-kit';
import '@farcaster/auth-kit/styles.css';
import Button from './components/Button';
import TermModal from './components/TermModal';
import SearchBar from './components/SearchBar';
import SubmitForm from './components/SubmitForm';


export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [terms, setTerms] = useState({});
  const [randomTerm, setRandomTerm] = useState(null);
  const [randomKey, setRandomKey] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');

  useEffect(() => {
    fetch('/terms.json')
      .then(res => res.json())
      .then(data => setTerms(data))
      .catch(err => console.error('Error loading terms.json:', err));
  }, []);

  const showRandomTerm = () => {
    const keys = Object.keys(terms);
    const random = keys[Math.floor(Math.random() * keys.length)];
    setRandomKey(random);
    setRandomTerm(terms[random]);
  };

  return (
    <div style={{
      fontFamily: 'Inter, sans-serif',
      background: 'linear-gradient(120deg, #006eff, #0038c7)',
      color: 'white',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <h1 style={{ fontSize: '3rem' }}>BAZED & CONFUSED</h1>
      <p style={{ marginTop: '0.5rem', marginBottom: '2rem' }}>
        Look up any crypto term, or hit “Surprise me” to explore new ones.
      </p>






{/* Search bar and buttons */}
<div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
    <SearchBar
      terms={terms}
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
    />
    <Button
      variant="secondary"
      onClick={() => {
        if (selectedTerm) {
          setRandomTerm(terms[selectedTerm]);
          setRandomKey(selectedTerm);
        }
      }}
    >
      Get answer
    </Button>
  </div>

  <Button variant="primary" onClick={showRandomTerm}>
    Surprise me
  </Button>
</div>







      {/* Submit a Term Button */}
      <button style={submitButtonStyle} onClick={() => setIsModalOpen(true)}>
        💡 Submit a Term
      </button>

      {/* Submit Modal */}
      {isModalOpen && (
  <SubmitForm onClose={() => setIsModalOpen(false)} />
)}


      {/* Modal to show random or searched term */}
      {randomTerm && (
        <TermModal
          termData={randomTerm}
          termKey={randomKey}
          onClose={() => setRandomTerm(null)}
          onSurpriseAgain={showRandomTerm}
        />
      )}
    </div>
  );
}

// Styles
const submitButtonStyle = {
  padding: '1rem 2rem',
  background: 'white',
  color: '#0038c7',
  borderRadius: '12px',
  fontSize: '1rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  marginTop: '1rem',
};

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
};

const modalStyle = {
  background: 'white',
  color: 'black',
  padding: '2rem',
  borderRadius: '16px',
  width: '400px',
  maxWidth: '90%',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  position: 'relative'
};

const closeButtonStyle = {
  position: 'absolute',
  top: '1rem',
  right: '1rem',
  background: 'transparent',
  border: 'none',
  fontSize: '1.5rem',
  cursor: 'pointer'
};

const inputStyle = {
  padding: '0.75rem',
  borderRadius: '8px',
  border: '1px solid #ccc',
  fontSize: '1rem'
};

const textareaStyle = {
  ...inputStyle,
  height: '80px'
};

const submitTermButtonStyle = {
  padding: '0.75rem',
  background: '#006eff',
  color: 'white',
  borderRadius: '8px',
  border: 'none',
  fontWeight: 'bold',
  cursor: 'pointer'
};
