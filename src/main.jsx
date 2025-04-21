import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

import '@farcaster/auth-kit/styles.css';

import { AuthKitProvider } from '@farcaster/auth-kit';

import { Buffer } from 'buffer';
window.Buffer = Buffer;


const config = {
  rpcUrl: 'https://mainnet.optimism.io',
  domain: import.meta.env.VITE_FARCASTER_DOMAIN,
  siweUri: import.meta.env.VITE_SIWE_URI
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthKitProvider config={config}>
      <App />
    </AuthKitProvider>
  </React.StrictMode>
);
