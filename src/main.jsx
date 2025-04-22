import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthKitProvider } from '@farcaster/auth-kit';
import '@farcaster/auth-kit/styles.css';
import { Buffer } from 'buffer';
window.Buffer = Buffer;

const config = {
  rpcUrl: 'https://mainnet.optimism.io',
  domain: import.meta.env.VITE_FARCASTER_DOMAIN,
  siweUri: import.meta.env.VITE_SIWE_URI,
};


const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AuthKitProvider config={config}>
        <App />
      </AuthKitProvider>
    </React.StrictMode>
  );
} else {
  console.error("Root element not found!");
}




