import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import useGameStore from './engine/store';

if (typeof window !== 'undefined') {
  window.__useGameStore = useGameStore;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
