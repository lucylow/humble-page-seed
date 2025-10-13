import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import App from './App';
import './index.css';

// Debug logging for Lovable deployment
console.log('🚀 BitMind app starting...');
console.log('Environment:', import.meta.env.MODE);
console.log('Base URL:', import.meta.env.BASE_URL);

// Global error handler for debugging
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Get root element with error handling
const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error('❌ Root element not found! Check your index.html');
  throw new Error('Root element #root not found');
}

console.log('✅ Root element found, rendering React app...');

try {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  console.log('✅ React app rendered successfully');
} catch (error) {
  console.error('❌ Error rendering React app:', error);
  throw error;
}
