// --- main.jsx Content ---

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
// If you used an index.css file, you would import it here:
// import './index.css'; 

// NOTE: This file assumes App.jsx is available in the same directory.

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);