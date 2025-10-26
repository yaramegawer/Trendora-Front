import React, { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
const App = lazy(() => import('./src/App.marketingAgency.jsx'))
import KombaiWrapper from './KombaiWrapper'
import ErrorBoundary from '@kombai/react-error-boundary'
import './src/index.css'

// Global error handler to suppress Google Translate and other non-critical errors
window.addEventListener('error', (event) => {
  // Suppress Google Translate errors
  if (event.message && event.message.includes('translate.googleapis.com')) {
    event.preventDefault();
    return false;
  }
  
  // Suppress blocked by client errors (usually from ad blockers)
  if (event.message && event.message.includes('ERR_BLOCKED_BY_CLIENT')) {
    event.preventDefault();
    return false;
  }
});

// Suppress unhandled promise rejections for Google Translate
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message && event.reason.message.includes('translate.googleapis.com')) {
    event.preventDefault();
    return false;
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <KombaiWrapper>
        <Suspense fallback={null}>
          <App />
        </Suspense>
      </KombaiWrapper>
    </ErrorBoundary>
  </StrictMode>,
)