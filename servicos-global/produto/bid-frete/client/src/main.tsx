/**
 * main.tsx — Entry Point do BID Frete
 *
 * Inicializa o React com StrictMode + ClerkProvider + BrowserRouter.
 * ClerkProvider é obrigatório para o Shell (useMeSync depende de useAuth/useUser).
 * basename espelha o prefixo de URL que o shell usa em produção.
 */

import '@nucleo/Utilidades/localization/i18n'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App'

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={CLERK_KEY}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ClerkProvider>
  </React.StrictMode>
)
