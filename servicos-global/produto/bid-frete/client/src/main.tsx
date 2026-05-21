/**
 * main.tsx — Entry Point do BID Frete
 * Skill: antigravity-criar-produto (Passo 6)
 *
 * Inicializa o React com StrictMode + BrowserRouter.
 * Não usa ClerkProvider diretamente — o Shell lida com autenticação via Configurador.
 */

/**
 * main.tsx — Entry Point do BID Frete
 * Skill: antigravity-criar-produto (Passo 6)
 *
 * Inicializa o React com StrictMode + ClerkProvider + BrowserRouter.
 * ClerkProvider é obrigatório para o Shell (useMeSync depende de useAuth/useUser).
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
