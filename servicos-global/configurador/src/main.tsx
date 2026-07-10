import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, useNavigate } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { ModalProvider } from '@nucleo/modal-global'
import '@nucleo/Utilidades/localization/i18n'
import '../../shell/shell.css'
import App from './App'

import { ptBR } from './ptBR'
import { CHAVE_ATIVANDO_SESSAO_CONVITE, pathDestinoClerk } from './auth/clerk-sessao-convite'
import { registrarRecargaAutomaticaChunkDesatualizado } from './recarregar-se-chunk-desatualizado'

registrarRecargaAutomaticaChunkDesatualizado()

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}

function ClerkProviderComRouter({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      localization={ptBR as any}
      signUpFallbackRedirectUrl="/trial"
      signInFallbackRedirectUrl="/hub"
      signInUrl="/login"
      signUpUrl="/cadastro"
      routerPush={(to) => {
        const path = pathDestinoClerk(to)
        if (
          path === '/login'
          && sessionStorage.getItem(CHAVE_ATIVANDO_SESSAO_CONVITE) === '1'
        ) {
          return
        }
        navigate(to)
      }}
      routerReplace={(to) => {
        const path = pathDestinoClerk(to)
        if (
          path === '/login'
          && sessionStorage.getItem(CHAVE_ATIVANDO_SESSAO_CONVITE) === '1'
        ) {
          return
        }
        navigate(to, { replace: true })
      }}
    >
      {children}
    </ClerkProvider>
  )
}

const root = document.getElementById('root')!
createRoot(root).render(
  <StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ClerkProviderComRouter>
        <App />
        <ModalProvider />
      </ClerkProviderComRouter>
    </BrowserRouter>
  </StrictMode>
)
