// SsoCallbackPage.tsx
// Intercepta retorno OAuth (Google) após authenticateWithRedirect.
// Clerk exige #clerk-captcha quando bot protection está ativa; sem continueSignUpUrl,
// usuários novos ou com missing_requirements ficam em tela branca no callback.

import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react'
import { GravityLoader } from '@nucleo/gravity-loader-global'

type Props = {
  /** Quando OAuth no login vira sign-up (conta nova ou campos faltando). */
  continueSignUpUrl?: string
  signInFallbackRedirectUrl?: string
  signUpFallbackRedirectUrl?: string
}

export function SsoCallbackPage({
  continueSignUpUrl,
  signInFallbackRedirectUrl = '/hub',
  signUpFallbackRedirectUrl = '/trial',
}: Props) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-body-dark)',
      }}
    >
      <GravityLoader texto="Autenticando" tamanho="lg" />
      <AuthenticateWithRedirectCallback
        continueSignUpUrl={continueSignUpUrl}
        signInFallbackRedirectUrl={signInFallbackRedirectUrl}
        signUpFallbackRedirectUrl={signUpFallbackRedirectUrl}
      />
      {/* Obrigatório para fluxos OAuth que viram sign-up (proteção anti-bot Clerk). */}
      <div id="clerk-captcha" />
    </div>
  )
}
