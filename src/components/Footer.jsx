import React from 'react';

export default function Footer({ onSubmitClick }) {
  return (
    <footer style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      width: '100%',
      background: '#2763ea',
      color: 'white',
      fontFamily: 'Inter, sans-serif',
      fontSize: '0.8rem',
      fontWeight: 500,
      zIndex: 1000
    }}>
      <div style={{
        maxWidth: '960px',
        margin: '0 auto',
        padding: '0.75rem 1rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '0.5rem',
        textAlign: 'center'
      }}>
        <span style={{ opacity: 0.9 }}>
          WANT TO PARTICIPATE IN ONBOARDING THE NEXT BILLION USERS?
        </span>
        <button
          onClick={onSubmitClick}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontWeight: 700,
            textDecoration: 'underline',
            cursor: 'pointer',
            padding: 0,
            fontSize: '0.8rem'
          }}
        >
          SUBMIT A TERM
        </button>
      </div>
    </footer>
  );
}
