/** SSOT — identificadores e metadados GTV das colunas de anexo na lista. */

export const CHAVES_COLUNA_ANEXO_PADRAO = [
  'anexo_pedido',
  'anexo_proforma',
  'anexo_invoice',
  'anexo_lpco',
] as const

export type ChaveColunaAnexoPadrao = (typeof CHAVES_COLUNA_ANEXO_PADRAO)[number]

export type VinculoAnexoLista = 'pedido' | 'item'

const CHAVES_ANEXO_VINCULO_ITEM = new Set<ChaveColunaAnexoPadrao>(['anexo_lpco'])

export function nivelVinculoAnexoColuna(chave: ChaveColunaAnexoPadrao): VinculoAnexoLista {
  return CHAVES_ANEXO_VINCULO_ITEM.has(chave) ? 'item' : 'pedido'
}

export function resolverIdVinculoAnexoLista(
  vinculo: VinculoAnexoLista,
  row: { id: string; pedido_id: string },
): string {
  if (vinculo === 'item') return row.id
  const pai = (row as { _p?: { id?: string } })._p?.id
  return pai ?? row.pedido_id
}

export function isChaveColunaAnexo(chave: string): boolean {
  return chave.startsWith('anexo_')
}

export function categoriaAnexoPorChaveColuna(chaveColuna: string): string {
  if (chaveColuna.startsWith('anexo_')) return chaveColuna.slice('anexo_'.length)
  return chaveColuna
}

export const METADADOS_COLUNA_ANEXO_LISTA = {
  editavel: false as const,
  celulaInterativa: true as const,
  tooltipInline: true as const,
  align: 'center' as const,
}
