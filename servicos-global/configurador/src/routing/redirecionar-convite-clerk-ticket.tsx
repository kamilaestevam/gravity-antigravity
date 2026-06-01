// redirecionar-convite-clerk-ticket.tsx
// Convite Clerk pode abrir /login ou / com __clerk_ticket — SSOT é /cadastro/continuar.

import type { ReactNode } from 'react'
import { Navigate, useLocation, useSearchParams } from 'react-router-dom'

export function deveRedirecionarConviteClerkTicket(
  pathname: string,
  ticket: string | null,
): boolean {
  return Boolean(ticket) && !pathname.startsWith('/cadastro/continuar')
}

export function RedirecionarConviteClerkTicket({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const ticket = searchParams.get('__clerk_ticket')

  if (deveRedirecionarConviteClerkTicket(location.pathname, ticket)) {
    return (
      <Navigate
        to={{ pathname: '/cadastro/continuar', search: location.search }}
        replace
      />
    )
  }

  return <>{children}</>
}
