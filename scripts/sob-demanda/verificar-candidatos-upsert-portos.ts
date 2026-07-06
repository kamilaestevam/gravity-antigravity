import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { PrismaClient } from '../../servicos-global/cadastros/generated/index.js'
import { PORTOS_UPSERT_TODAS_LEVAS } from './data/portos-upsert-todas-levas.js'

const envPath = resolve(import.meta.dirname, '../../.env.local')
for (const linha of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const m = linha.match(/^CADASTROS_DATABASE_URL=(.*)$/)
  if (m && !process.env.CADASTROS_DATABASE_URL) process.env.CADASTROS_DATABASE_URL = m[1]
}

const prisma = new PrismaClient({ datasources: { db: { url: process.env.CADASTROS_DATABASE_URL! } } })

async function main() {
  console.log('=== Candidatos upsert — status no banco ===\n')
  let needUpsert = 0
  let exists = 0
  for (const p of PORTOS_UPSERT_TODAS_LEVAS) {
    const hit = await prisma.porto.findUnique({
      where: { codigo_unlocode_porto: p.codigo_unlocode_porto },
      select: { codigo_unlocode_porto: true, nome_porto: true, ativo_porto: true },
    })
    if (hit?.ativo_porto) {
      exists++
      console.log(`EXISTS  ${p.codigo_unlocode_porto} | ${hit.nome_porto}`)
    } else if (hit) {
      needUpsert++
      console.log(`INATIVO ${p.codigo_unlocode_porto} | ${hit.nome_porto} → reativar`)
    } else {
      needUpsert++
      console.log(`MISSING ${p.codigo_unlocode_porto} | ${p.nome_porto}`)
    }
  }
  console.log(`\nTotal: ${PORTOS_UPSERT_TODAS_LEVAS.length} | exists=${exists} | need=${needUpsert}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
