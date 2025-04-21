import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

import '@farcaster/auth-kit/styles.css';
import { AuthKitProvider } from '@farcaster/auth-kit';
import { Buffer } from 'buffer';
window.Buffer = Buffer;

// Get the actual domain from the window location
const domain = window.location.host; // This includes any port number
const isLocalhost = domain.includes('localhost') || domain.includes('127.0.0.1');

const config = {
  // Required params
  domain: isLocalhost ? 'localhost' : 'bazedandconfused.netlify.app',
  siweUri: isLocalhost 
    ? 'http://localhost:5173/login' 
    : 'https://bazedandconfused.netlify.app/login',
  
  // RPC URL is required to read onchain data
  rpcUrl: 'https://mainnet.optimism.io',
  
  // Additional recommended params
  relay: 'https://relay.farcaster.xyz',
  version: '1',
  
  // For debugging
  debug: true,
  
  // For better UX - persist the connection
  storage: localStorage
};

console.log("Auth Kit Config:", config);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthKitProvider config={config}>
      <App />
    </AuthKitProvider>
  </React.StrictMode>
);