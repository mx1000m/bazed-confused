// src/components/Button.jsx
import React from 'react';
import './Button.css';

export default function Button({ children, onClick, variant = 'primary', type = 'button', isSurpriseMe = false }) {
  // Determine the CSS class based on variant and whether it's a "Surprise me" button
  const buttonClass = `custom-button ${variant}${isSurpriseMe ? ' surprise-me' : ''}`;
  
  return (
    <button
      className={buttonClass}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
}