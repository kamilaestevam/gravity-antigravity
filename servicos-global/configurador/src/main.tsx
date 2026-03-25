import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { ModalProvider } from '@nucleo/modal-global'
import App from './App'

import { ptBR } from './ptBR'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}

const root = document.getElementById('root')!
createRoot(root).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} localization={ptBR as any}>
      <BrowserRouter>
        <App />
        <ModalProvider />
      </BrowserRouter>
    </ClerkProvider>
  </StrictMode>
)
