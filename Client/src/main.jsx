import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(<App />);

// Register service worker for PWA capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/sw.js')
            .then(reg => {
                console.log('SW registered:', reg.scope);
                // Optionally check for updates periodically
                setInterval(() => {
                    reg.update().catch(() => {});
                }, 1000 * 60 * 30); // every 30 minutes
            })
            .catch(err => console.warn('SW registration failed:', err));
    });
}
