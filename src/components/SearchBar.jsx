import React, { useState } from 'react';

export default function SearchBar({ terms, onSelectTerm, onSubmit }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      const key = Object.keys(terms).find(term =>
        term.toLowerCase() === searchTerm.trim().toLowerCase()
      );
      if (key) {
        onSubmit(key);
      }
    }
  };

  const handleSelect = (term) => {
    setSearchTerm(term);
    onSelectTerm(term);
  };

  const filtered = Object.keys(terms).filter(term =>
    term.toLowerCase().startsWith(searchTerm.toLowerCase())
  );

  return (
    <div style={{ position: 'relative', width: '300px' }}>
      <input
        type="text"
        placeholder="Enter crypto term"
        value={searchTerm}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        style={{
          padding: '0.75rem 1rem',
          borderRadius: '12px',
          border: 'none',
          width: '100%',
          fontSize: '1rem',
          color: '#000'
        }}
      />

      {searchTerm && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          color: 'black',
          borderRadius: '10px',
          marginTop: '0.5rem',
          boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
          zIndex: 10,
          overflow: 'hidden'
        }}>
          {filtered.length > 0 ? (
            filtered.map(term => (
              <div
                key={term}
                onClick={() => handleSelect(term)}
                style={{
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid #eee',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {term.charAt(0).toUpperCase() + term.slice(1)}
              </div>
            ))
          ) : (
            <div style={{
              padding: '0.75rem 1rem',
              fontWeight: 'bold',
              color: '#666'
            }}>
              No matching terms found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
