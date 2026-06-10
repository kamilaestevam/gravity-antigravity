/**
 * SSOT — migração de chaves legadas de campo do Pedido para nomes DDD (Prisma).
 *
 * Usado na leitura de preferências salvas, painéis, importação e APIs que ainda
 * podem receber payloads com nomes antigos durante rollout ou dados históricos.
 */

/** Chave legada → nome canônico (coluna Prisma / contrato DDD). */
export const CHAVES_CAMPO_PEDIDO_LEGADO_PARA_DDD: Readonly<Record<string, string>> = Object.freeze({
  quantidade_pronta_total_item_pedido: 'quantidade_pronta_item',
  quantidade_pronta_total_item:        'quantidade_pronta_item',
  quantidade_pronta_pedido:            'quantidade_pronta_item',
})

export function normalizarChaveCampoPedido(chave: string): string {
  return CHAVES_CAMPO_PEDIDO_LEGADO_PARA_DDD[chave] ?? chave
}

/** Lista de chaves com deduplicação (mantém a primeira ocorrência após normalizar). */
export function migrarListaChavesCampoPedido(chaves: readonly string[]): string[] {
  const visto = new Set<string>()
  const resultado: string[] = []
  for (const chave of chaves) {
    const normalizada = normalizarChaveCampoPedido(chave)
    if (visto.has(normalizada)) continue
    visto.add(normalizada)
    resultado.push(normalizada)
  }
  return resultado
}

/** Record com chaves de coluna/campo — mescla legado + canônico (canônico prevalece). */
export function migrarRecordChavesCampoPedido<T>(
  registro: Readonly<Record<string, T>>,
): Record<string, T> {
  const resultado: Record<string, T> = {}
  for (const [chave, valor] of Object.entries(registro)) {
    const normalizada = normalizarChaveCampoPedido(chave)
    if (!(normalizada in resultado)) {
      resultado[normalizada] = valor
    }
  }
  return resultado
}
