// src/components/Button.jsx
import React from 'react';
import './Button.css';

export default function Button({ children, onClick, variant = 'primary', type = 'button' }) {
  return (
    <button
      className={`custom-button ${variant}`}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
}
