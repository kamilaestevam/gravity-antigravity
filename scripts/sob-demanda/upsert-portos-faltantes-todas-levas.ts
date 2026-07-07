/**
 * Upsert consolidado — portos ausentes de TODAS as levas (prints DATI).
 * Uso: npx tsx scripts/sob-demanda/upsert-portos-faltantes-todas-levas.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { PrismaClient } from '../../servicos-global/cadastros/generated/index.js'
import { PORTOS_UPSERT_TODAS_LEVAS } from './data/portos-upsert-todas-levas.js'

const envPath = resolve(import.meta.dirname, '../../.env.local')
for (const linha of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const m = linha.match(/^CADASTROS_DATABASE_URL=(.*)$/)
  if (m && !process.env.CADASTROS_DATABASE_URL) process.env.CADASTROS_DATABASE_URL = m[1]
}

const url = process.env.CADASTROS_DATABASE_URL
if (!url) {
  console.error('CADASTROS_DATABASE_URL ausente')
  process.exit(1)
}

const prisma = new PrismaClient({ datasources: { db: { url } } })

async function main() {
  const seen = new Set<string>()
  let upserted = 0
  let skipped = 0

  for (const p of PORTOS_UPSERT_TODAS_LEVAS) {
    if (seen.has(p.codigo_unlocode_porto)) continue
    seen.add(p.codigo_unlocode_porto)

    const existing = await prisma.porto.findUnique({
      where: { codigo_unlocode_porto: p.codigo_unlocode_porto },
      select: { ativo_porto: true, nome_porto: true },
    })
    if (existing?.ativo_porto) {
      skipped++
      continue
    }

    const codigo_local_porto = p.codigo_unlocode_porto.slice(2)
    await prisma.porto.upsert({
      where: { codigo_unlocode_porto: p.codigo_unlocode_porto },
      create: {
        codigo_unlocode_porto: p.codigo_unlocode_porto,
        codigo_pais_porto: p.codigo_pais_porto,
        codigo_local_porto,
        nome_porto: p.nome_porto,
        nome_ascii_porto: p.nome_ascii_porto,
        subdivisao_porto: p.subdivisao_porto ?? null,
        latitude_porto: p.latitude_porto ?? null,
        longitude_porto: p.longitude_porto ?? null,
        ativo_porto: true,
      },
      update: {
        nome_porto: p.nome_porto,
        nome_ascii_porto: p.nome_ascii_porto,
        subdivisao_porto: p.subdivisao_porto ?? null,
        latitude_porto: p.latitude_porto ?? null,
        longitude_porto: p.longitude_porto ?? null,
        ativo_porto: true,
      },
    })
    upserted++
    console.log(`[upsert] ${p.codigo_unlocode_porto} — ${p.nome_porto}`)
  }

  console.log(`\n[upsert-portos-todas-levas] ${upserted} upserted | ${skipped} já existiam ativos`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
