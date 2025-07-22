
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import * as Sentry from '@sentry/react';

import posthog from 'posthog-js';
const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
if (posthogKey && posthogKey !== 'your_posthog_project_api_key') {
  posthog.init(posthogKey, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
    capture_pageview: true,
  });
}

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: import.meta.env.MODE || 'development',
});


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <Sentry.ErrorBoundary fallback={<p>Došlo k neočekávané chybě. Tým byl informován.</p>} showDialog>
        <App />
      </Sentry.ErrorBoundary>
    </AuthProvider>
  </React.StrictMode>
);

// Registrace service workeru pro PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js');
  });
}
