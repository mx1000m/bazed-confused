import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

import '@farcaster/auth-kit/styles.css';

import { AuthKitProvider } from '@farcaster/auth-kit';

const config = {
  rpcUrl: 'https://mainnet.optimism.io',
  domain: 'localhost',
  siweUri: 'http://localhost:5173/login',
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthKitProvider config={config}>
      <App />
    </AuthKitProvider>
  </React.StrictMode>
);
