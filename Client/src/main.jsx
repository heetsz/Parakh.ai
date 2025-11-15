import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
    <App />
)

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("/serviceworker.js")
            .then(reg => console.log("Service worker registered:", reg.scope))
            .catch(err => console.log("Service worker registration failed:", err));
    });
}
