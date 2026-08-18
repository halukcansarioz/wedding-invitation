import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import './i18n/config'
import { Providers } from './context/Providers' 
import { ErrorBoundary } from './components/common/ErrorBoundary' // DÜZELTME: Eklendi

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <Providers>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Providers>
    </ErrorBoundary>
  </StrictMode>,
)