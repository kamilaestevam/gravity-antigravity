/**
 * camposLogisticaPedido.ts — Campos logísticos do Pedido (nível pedido, não item).
 *
 * SSOT para validação, edição inline e UI (sem replicação para PedidoItem —
 * colunas existem só no model Pedido; ver fragment.prisma).
 */

export const CAMPOS_LOGISTICA_PEDIDO = [
  'porto_origem',
  'porto_destino',
  'local_de_origem',
  'local_de_destino',
  'aeroporto_origem',
  'aeroporto_destino',
] as const

export type CampoLogisticaPedido = (typeof CAMPOS_LOGISTICA_PEDIDO)[number]

const SET_LOGISTICA = new Set<string>(CAMPOS_LOGISTICA_PEDIDO)

export function isCampoLogisticaPedido(campo: string): campo is CampoLogisticaPedido {
  return SET_LOGISTICA.has(campo)
}

/** Códigos UN/LOCODE, ISO alpha-2 e IATA — normaliza para maiúsculas antes de persistir/validar. */
export function normalizarCodigoLogisticaPedido(valor: unknown): unknown {
  if (valor == null || valor === '') return null
  if (typeof valor !== 'string') return valor
  const trimmed = valor.trim()
  return trimmed === '' ? null : trimmed.toUpperCase()
}
