import React from 'react';

export default function SearchBar({
  terms,
  searchTerm,
  setSearchTerm,
  onSelectTerm,
  onSubmit,
  shouldShake,
  inputRef
}) {
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

  const clearSearch = () => {
    setSearchTerm('');
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div style={{ position: 'relative', width: '300px' }}>
      <div style={{ position: 'relative' }}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Enter crypto term"
        value={searchTerm}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        className={shouldShake ? 'shake' : ''}
        style={{
          padding: '0.75rem 1rem',
          borderRadius: '12px',
          border: 'none',
          width: '100%',
          fontSize: '1rem',
          color: '#000',
          backgroundColor: '#fff', // Explicitly set background color
          colorScheme: 'light', // Force light mode for this element
          transition: 'transform 0.2s ease'
        }}
      />

     {/* X button here */}
     {searchTerm && (
        <button
          type="button"
          onClick={clearSearch}
          style={{
            position: 'absolute',
            right: '-25px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '5px',
            color: 'rgba(0, 0, 0, 0.4)', // Light grey X
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Clear search"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
    </div>

    {searchTerm && (
  <div style={{
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    color: 'black',
    borderRadius: '12px',
    marginTop: '0.5rem',
    boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
    zIndex: 10,
    overflow: 'hidden',
    maxHeight: '10rem',
    display: 'flex',
    flexDirection: 'column',
    colorScheme: 'light' // Add this to force light mode
  }}>
    <div style={{ 
      overflowY: 'auto', 
      maxHeight: '10rem',
      backgroundColor: 'white',
      colorScheme: 'light' // Add this to force light mode for scrollbar
    }}>
            {filtered.length > 0 ? (
              filtered.map(term => (
                <div
                  key={term}
                  onClick={() => handleSelect(term)}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f2f5ff'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  style={{
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid #eee',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    backgroundColor: 'white', // Explicitly set background color
                    color: 'black', // Explicitly set text color
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  {term.charAt(0).toUpperCase() + term.slice(1)}
                </div>
              ))
            ) : (
              <div style={{
                padding: '0.75rem 1rem',
                fontWeight: 'bold',
                color: '#666',
                backgroundColor: 'white' // Explicitly set background color
              }}>
                No matching terms found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
