import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

console.log('===========================================');
console.log('MAIN.TSX LOADING!!!', new Date().toISOString());
console.log('===========================================');

const rootEl = document.getElementById('root');
console.log('Root element found?', !!rootEl, rootEl);

if (!rootEl) {
  console.error('NO ROOT ELEMENT!');
  document.body.style.background = 'red';
  document.body.innerHTML = '<h1 style="color:white">NO ROOT ELEMENT FOUND!</h1>';
} else {
  console.log('Creating React root...');
  try {
    const root = ReactDOM.createRoot(rootEl);
    console.log('Root created, rendering App...');
    root.render(<App />);
    console.log('App rendered!');
  } catch (error) {
    console.error('RENDER ERROR:', error);
    document.body.style.background = 'orange';
    document.body.innerHTML = `<h1>React Error: ${error}</h1>`;
  }
}