import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { ModalProvider } from './contexts/ModalContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ModalProvider>
        <App/>
      </ModalProvider>
    </AuthProvider>
  </StrictMode>,
)
