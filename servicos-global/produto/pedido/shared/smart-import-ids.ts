/**
 * smart-import-ids.ts — Geração de PKs no Smart Import (SSOT)
 *
 * Usa randomUUID — Math.random() colide em lotes de ~1000 linhas (P2002 id_item).
 */

import { randomUUID } from 'node:crypto'

export function gerarIdImportacao(prefixo: string): string {
  const ano = String(new Date().getFullYear()).slice(-2)
  const sufixo = randomUUID().replace(/-/g, '').slice(0, 13)
  return `${prefixo}_id_${sufixo}/${ano}`
}
