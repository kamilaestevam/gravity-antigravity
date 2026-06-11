/**
 * validar-paridade-ssot-pedido.ts — Verificação pontual (Onda 1, 2026-06-11)
 * Confere duplicatas no SSOT campos-pedido-ddd.ts e paridade com fragment.prisma.
 * Uso: npx tsx scripts/sob-demanda/validar-paridade-ssot-pedido.ts
 */
import { readFileSync } from 'fs'
import {
  CAMPOS_PEDIDO_DDD_TODOS,
  CAMPOS_PEDIDO_DDD,
  CAMPOS_ITEM_DDD,
} from '../../servicos-global/produto/pedido/shared/campos-pedido-ddd'

const prisma = readFileSync('servicos-global/produto/pedido/prisma/fragment.prisma', 'utf8')

const seen = new Set<string>()
const dups: string[] = []
for (const c of CAMPOS_PEDIDO_DDD_TODOS) {
  const k = `${c.nivel}:${c.campo}`
  if (seen.has(k)) dups.push(k)
  seen.add(k)
}
console.log(`total: ${CAMPOS_PEDIDO_DDD_TODOS.length} (pedido ${CAMPOS_PEDIDO_DDD.length} / item ${CAMPOS_ITEM_DDD.length})`)
console.log(`duplicados: ${dups.length ? dups.join(', ') : 'nenhum'}`)

const semColuna = CAMPOS_PEDIDO_DDD_TODOS
  .filter(c => !new RegExp(`\\b${c.campo}\\b`).test(prisma))
  .map(c => `${c.nivel}:${c.campo}`)
console.log(`sem coluna Prisma (${semColuna.length}):`)
console.log(semColuna.join('\n'))
