/**
 * Estilos das abas de status na Lista BID Frete — paridade Pedido listaStatusAbaEstilo.
 */
import type { CSSProperties } from 'react'

export const LISTA_STATUS_CORES_DEFAULT_BID_FRETE: Record<string, string> = {
  RASCUNHO: '#94a3b8',
  ENVIADA_FORNECEDORES: '#60a5fa',
  EM_COTACAO: '#fbbf24',
  AGUARDANDO_APROVACAO: '#818cf8',
  APROVADA: '#10b981',
  REPROVADA: '#ef4444',
  CANCELADA: '#6b7280',
  FALTA_INFORMACAO: '#fb7185',
  EXPIRADA: '#d1d5db',
}

const COR_TODAS = '#818cf8'

export function resolverCorAbaStatusBidFrete(valor: string, corConfig?: string): string {
  if (valor === 'TODAS') return COR_TODAS
  if (corConfig?.trim()) return corConfig.trim()
  return LISTA_STATUS_CORES_DEFAULT_BID_FRETE[valor] ?? '#64748b'
}

export function resolverEstiloPillAbaStatusBidFrete(
  valor: string,
  corConfig: string | undefined,
  ativa: boolean,
): CSSProperties {
  const cor = resolverCorAbaStatusBidFrete(valor, corConfig)

  if (valor === 'TODAS') {
    return {
      color: ativa ? '#c7d2fe' : 'var(--gtv-muted, #94a3b8)',
      background: 'transparent',
      borderColor: 'transparent',
    }
  }

  if (ativa) {
    return {
      color: cor,
      background: `${cor}2e`,
      borderColor: `${cor}55`,
      boxShadow: `0 0 0 1px ${cor}22`,
    }
  }

  return {
    color: 'var(--gtv-muted, #94a3b8)',
    background: 'transparent',
    borderColor: 'transparent',
  }
}

export function resolverEstiloBadgeContagemBidFrete(
  valor: string,
  corConfig: string | undefined,
  ativa: boolean,
): CSSProperties {
  const cor = resolverCorAbaStatusBidFrete(valor, corConfig)
  if (ativa) {
    return { background: cor, color: '#fff' }
  }
  return { background: `${cor}22`, color: cor }
}
