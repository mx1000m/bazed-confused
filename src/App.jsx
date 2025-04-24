import React, { useState, useEffect, useRef } from 'react';
import { SignInButton } from '@farcaster/auth-kit';
import '@farcaster/auth-kit/styles.css';
import Button from './components/Button';
import TermModal from './components/TermModal';
import SearchBar from './components/SearchBar';
import SubmitForm from './components/SubmitForm';
import Footer from './components/Footer';
import { useProfile } from '@farcaster/auth-kit';
import { Buffer } from 'buffer';
window.Buffer = Buffer;

export default function App() {
  const { isAuthenticated, profile } = useProfile();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [terms, setTerms] = useState({});
  const [randomTerm, setRandomTerm] = useState(null);
  const [randomKey, setRandomKey] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [shouldShake, setShouldShake] = useState(false);

  const inputRef = useRef(null);

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

  return (
    <div style={{
      fontFamily: 'Inter, sans-serif',
      background: 'linear-gradient(120deg, #006eff, #0038c7)',
      color: 'white',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Centered content block */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>BAZED & CONFUSED</h1>
        <p style={{ marginTop: '0rem', marginBottom: '3rem', letterSpacing: '0.15px' }}>
          Look up any crypto term, or hit <b>“Surprise me”</b> to explore new ones.
        </p>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '2rem',
          maxWidth: '100%',
        }}>
          <div style={{ flexShrink: 1 }}>
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

          <div style={{ display: 'flex', gap: '1rem', flexShrink: 0, marginLeft: '2.1rem' }}>
            <Button variant="outline-white" onClick={openSearchTerm}>
              Get answer
            </Button>
            <Button variant="primary" onClick={showRandomTerm}>
              Surprise me
            </Button>
          </div>
        </div>

        {isModalOpen && <SubmitForm onClose={() => setIsModalOpen(false)} />}

        {randomTerm && (
          <TermModal
            termData={randomTerm}
            termKey={randomKey}
            onClose={() => setRandomTerm(null)}
            onSurpriseAgain={showRandomTerm}
            farcasterUser={profile?.username}
          />
        )}
      </div>

      {/* Footer always at the bottom */}
      <Footer onSubmitClick={() => setIsModalOpen(true)} />
    </div>
  );
}
