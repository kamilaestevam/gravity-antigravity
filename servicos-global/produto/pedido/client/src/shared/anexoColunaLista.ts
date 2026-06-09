/** SSOT — identificadores e metadados GTV das colunas de anexo na lista. */

export const CHAVES_COLUNA_ANEXO_PADRAO = [
  'anexo_pedido',
  'anexo_proforma',
  'anexo_invoice',
  'anexo_lpco',
] as const

export type ChaveColunaAnexoPadrao = (typeof CHAVES_COLUNA_ANEXO_PADRAO)[number]

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
