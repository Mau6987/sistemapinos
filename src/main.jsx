

import './index.css'; // Importa los estilos principales (asegúrate de que este archivo exista)

import React from 'react';
import ReactDOM from 'react-dom/client'; // Import ReactDOM for rendering
import App from './App'; // Import your main App component
import { registerSW } from 'virtual:pwa-register'; // Import PWA registration

// Register the Service Worker
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('A new version is available. Please refresh the page.');
  },
  onOfflineReady() {
    console.log('App is ready for offline use.');
  },
});

// Render the React application
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
