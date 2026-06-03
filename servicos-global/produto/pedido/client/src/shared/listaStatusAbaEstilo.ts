/**
 * Estilos das abas de status na Lista — paridade com StatusBadgeGlobal da coluna status.
 */
import type { CSSProperties } from 'react'

/** Fallback alinhado a Pedidos.tsx STATUS_CORES_DEFAULT */
export const LISTA_STATUS_CORES_DEFAULT: Record<string, string> = {
  rascunho: '#94a3b8',
  aberto: '#f472b6',
  em_andamento: '#fb923c',
  aprovado: '#facc15',
  transferencia: '#2dd4bf',
  consolidado: '#a78bfa',
  cancelado: '#f87171',
}

const COR_TODOS = '#818cf8'

export function resolverCorAbaStatus(valor: string, corConfig?: string): string {
  if (valor === 'todos') return COR_TODOS
  if (corConfig?.trim()) return corConfig.trim()
  return LISTA_STATUS_CORES_DEFAULT[valor] ?? '#64748b'
}

/** Mesma lógica visual da célula: background `${cor}1e`, border `${cor}33` */
export function resolverEstiloPillAbaStatus(
  valor: string,
  corConfig: string | undefined,
  ativa: boolean,
): CSSProperties {
  const cor = resolverCorAbaStatus(valor, corConfig)

  /* "Todos" — sempre dot + texto, sem pill (igual aos demais inativos) */
  if (valor === 'todos') {
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

  /* Inativo: só bolinha colorida + texto — sem pill cheio */
  return {
    color: 'var(--gtv-muted, #94a3b8)',
    background: 'transparent',
    borderColor: 'transparent',
  }
}

export function resolverEstiloBadgeContagem(
  valor: string,
  corConfig: string | undefined,
  ativa: boolean,
): CSSProperties {
  const cor = resolverCorAbaStatus(valor, corConfig)
  if (ativa) {
    return { background: cor, color: '#fff' }
  }
  return { background: `${cor}22`, color: cor }
}
