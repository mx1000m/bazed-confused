import React, { useState, useEffect } from 'react';
import { SignInButton, useSignIn } from '@farcaster/auth-kit';
import '@farcaster/auth-kit/styles.css';
import Button from './components/Button';
import TermModal from './components/TermModal';
import SearchBar from './components/SearchBar';
import SubmitForm from './components/SubmitForm';
import { Buffer } from 'buffer';
window.Buffer = Buffer;

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [terms, setTerms] = useState({});
  const [randomTerm, setRandomTerm] = useState(null);
  const [randomKey, setRandomKey] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [debugVisible, setDebugVisible] = useState(false);
  
  // For debugging authentication
  const authState = useSignIn();
  const { user, status } = authState;
  
  useEffect(() => {
    console.log("App Auth Status:", status);
    console.log("App User:", user);
    console.log("Full Auth State:", authState);
  }, [user, status, authState]);

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
        Look up any crypto term, or hit "Surprise me" to explore new ones.
      </p>

      {/* Debug toggle button (hidden in production) */}
      <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
        <button 
          onClick={() => setDebugVisible(!debugVisible)}
          style={{ 
            padding: '5px 10px', 
            background: 'rgba(255,255,255,0.2)', 
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          Debug
        </button>
      </div>

      {/* Debug info panel */}
      {debugVisible && (
        <div style={{
          position: 'fixed',
          top: '50px',
          right: '10px',
          background: 'rgba(0,0,0,0.8)',
          padding: '10px',
          borderRadius: '8px',
          zIndex: 1000,
          maxWidth: '300px',
          textAlign: 'left',
          fontSize: '12px'
        }}>
          <p><strong>Auth Status:</strong> {status}</p>
          <p><strong>User:</strong> {user ? `@${user.username}` : 'Not signed in'}</p>
          <p><strong>Domain:</strong> {window.location.host}</p>
          {user && (
            <button
              onClick={() => authState.signOut()}
              style={{
                background: '#ff3b30',
                border: 'none',
                padding: '5px',
                borderRadius: '4px',
                color: 'white',
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              Sign Out
            </button>
          )}
        </div>
      )}

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

      {/* Authentication status display */}
      <div style={{ marginBottom: '1rem' }}>
        {!user?.username ? (
          <SignInButton />
        ) : (
          <p>Connected as @{user.username}</p>
        )}
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