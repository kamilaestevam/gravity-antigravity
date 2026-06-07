import { Navigate, useLocation } from 'react-router-dom'

/** Redireciona /processo/{segmento}/… → /processo/detalhe/{segmento}/… mantendo query. */
export function RedirecionarRotaLegado({ segmento }: { segmento: string }) {
  const { pathname, search } = useLocation()
  const prefixo = pathname.includes('/acesso-processos/') ? '/acesso-processos' : '/processo'
  const baseLegado = `${prefixo}/${segmento}`
  const resto = pathname.startsWith(baseLegado)
    ? pathname.slice(baseLegado.length).replace(/^\//, '')
    : ''
  const destino = resto ? `detalhe/${segmento}/${resto}` : `detalhe/${segmento}`
  return <Navigate to={`${destino}${search}`} replace />
}
