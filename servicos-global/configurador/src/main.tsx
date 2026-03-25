import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { ModalProvider } from '@nucleo/modal-global'
import App from './App'

const ptBR = {
  socialButtonsBlockButton: 'Continuar com {{provider|titleize}}',
  dividerText: 'ou',
  formFieldLabel: {
    firstName: 'Primeiro nome',
    lastName: 'Sobrenome',
    emailAddress: 'Endereço de e-mail',
    password: 'Senha',
  },
  formFieldInputPlaceholder: {
    emailAddress: 'Insira seu e-mail',
    password: 'Insira sua senha',
    firstName: 'Insira seu primeiro nome',
    lastName: 'Insira seu último nome',
  },
  formButtonPrimary: 'Continuar',
  formFieldHintText: {
    optional: 'Opcional',
  },
  signIn: {
    start: {
      actionText: 'Novo por aqui?',
      actionLink: 'Criar conta',
      title: 'Acessar a plataforma',
      subtitle: 'Para continuar a Gravity',
    }
  },
  signUp: {
    start: {
      actionText: 'Já tem uma conta?',
      actionLink: 'Entrar',
      title: 'Criar sua conta',
      subtitle: 'Para continuar a Gravity',
    }
  }
}

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
