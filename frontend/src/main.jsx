import React from 'react';
import ReactDOM from 'react-dom/client';
// 🚨 This imports your main application logic
import App from './PharmaManagerApp.jsx';
// 🚨 This imports your Tailwind CSS styles
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);