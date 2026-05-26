// NavigateDestinoPosAutenticacao.tsx
// Redireciona usuário autenticado para /trial ou /hub conforme GET /api/v1/me.

import { Navigate } from 'react-router-dom'
import { GravityLoader } from '@nucleo/gravity-loader-global'
import { useDestinoPosAutenticacao } from '../hooks/use-destino-pos-autenticacao.js'
import { ROTAS } from './destino-pos-autenticacao.js'

function TelaCarregandoPorteiro() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg-body)',
      }}
    >
      <GravityLoader texto="Carregando" tamanho="lg" />
    </div>
  )
}

type Props = {
  replace?: boolean
}

/**
 * Porteiro SSOT — usar em RootRedirect e PublicRoute quando `isSignedIn`.
 * Enquanto /me não responde, exibe loader (evita flash em /hub).
 */
export function NavigateDestinoPosAutenticacao({ replace = true }: Props) {
  const { destino, pronto } = useDestinoPosAutenticacao()

  if (!pronto) {
    return <TelaCarregandoPorteiro />
  }

  if (destino === 'trial') {
    return <Navigate to={ROTAS.trial} replace={replace} />
  }

  return <Navigate to={ROTAS.hub} replace={replace} />
}

export { TelaCarregandoPorteiro }
