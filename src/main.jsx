import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

import '@farcaster/auth-kit/styles.css';

import { AuthKitProvider } from '@farcaster/auth-kit';

import { Buffer } from 'buffer';
window.Buffer = Buffer;

// Determine if we're in production or development
const isDevelopment = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';

const config = {
  rpcUrl: 'https://mainnet.optimism.io',
  domain: isDevelopment ? 'localhost' : 'bazedandconfused.netlify.app',
  siweUri: isDevelopment 
    ? 'http://localhost:5173/login' 
    : 'https://bazedandconfused.netlify.app/login',
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthKitProvider config={config}>
      <App />
    </AuthKitProvider>
  </React.StrictMode>
);