/**
 * Ativa todos os portos do catálogo UN/LOCODE (ativo_porto = true).
 * Aprovado pelo dono em 05/07/2026 — o seed original ativou só BR + ~61 hubs,
 * deixando ~16.6k portos reais invisíveis nos dropdowns dos produtos.
 *
 * Uso: npx tsx servicos-global/cadastros/scripts/ativar-todos-portos.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { PrismaClient } from '../generated/index.js'

const envPath = resolve(import.meta.dirname, '../../../.env.local')
for (const linha of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const m = linha.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
}

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.CADASTROS_DATABASE_URL } },
})

async function main() {
  const antes = await prisma.porto.count({ where: { ativo_porto: true } })
  const total = await prisma.porto.count()
  console.log(`Antes: ${antes} ativos de ${total}`)

  const res = await prisma.porto.updateMany({
    where: { ativo_porto: false },
    data: { ativo_porto: true },
  })
  console.log(`Ativados: ${res.count}`)

  const depois = await prisma.porto.count({ where: { ativo_porto: true } })
  console.log(`Depois: ${depois} ativos de ${total}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
