/**
 * Verifica aeroportos leva África + América do Norte contra cadastros.aeroporto.
 * Uso: npx tsx scripts/sob-demanda/verificar-aeroportos-leva-africa-america-norte-cadastros.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { PrismaClient } from '../../servicos-global/cadastros/generated/index.js'
import { AEROPORTOS_LEVA_AFRICA_AMERICA_NORTE } from './data/aeroportos-leva-africa-america-norte.js'

const envPath = resolve(import.meta.dirname, '../../.env.local')
for (const linha of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const m = linha.match(/^CADASTROS_DATABASE_URL=(.*)$/)
  if (m && !process.env.CADASTROS_DATABASE_URL) process.env.CADASTROS_DATABASE_URL = m[1]
}

const prisma = new PrismaClient({ datasources: { db: { url: process.env.CADASTROS_DATABASE_URL! } } })

async function buscarPorIata(pais: string, iata: string) {
  return prisma.aeroporto.findMany({
    where: { codigo_iata_aeroporto: iata, codigo_pais_aeroporto: pais },
    select: {
      codigo_unlocode_aeroporto: true,
      codigo_iata_aeroporto: true,
      nome_aeroporto: true,
      ativo_aeroporto: true,
    },
  })
}

async function buscarPorTermos(pais: string, termos: string[]) {
  for (const termo of termos) {
    const hits = await prisma.aeroporto.findMany({
      where: {
        codigo_pais_aeroporto: pais,
        OR: [
          { nome_aeroporto: { contains: termo, mode: 'insensitive' } },
          { nome_ascii_aeroporto: { contains: termo, mode: 'insensitive' } },
        ],
      },
      select: {
        codigo_unlocode_aeroporto: true,
        codigo_iata_aeroporto: true,
        nome_aeroporto: true,
        ativo_aeroporto: true,
      },
      take: 8,
    })
    if (hits.length > 0) return hits
  }
  return []
}

async function main() {
  let ok = 0
  let amb = 0
  let miss = 0
  const faltando: string[] = []
  const ambiguos: string[] = []
  const porPais: Record<string, { ok: number; amb: number; miss: number }> = {}

  for (const item of AEROPORTOS_LEVA_AFRICA_AMERICA_NORTE) {
    porPais[item.pais] ??= { ok: 0, amb: 0, miss: 0 }
    let hits = await buscarPorIata(item.pais, item.iata)
    if (hits.length === 0 && item.termos?.length) {
      hits = await buscarPorTermos(item.pais, item.termos)
    }
    const ativos = hits.filter((h) => h.ativo_aeroporto)
    if (ativos.length === 1) {
      ok++
      porPais[item.pais].ok++
    } else if (hits.length === 0) {
      miss++
      porPais[item.pais].miss++
      faltando.push(`[${item.pais}] ${item.rotulo} (${item.iata})`)
    } else {
      amb++
      porPais[item.pais].amb++
      ambiguos.push(
        `[${item.pais}] ${item.rotulo} (${item.iata}) → ${ativos
          .slice(0, 3)
          .map((h) => `${h.codigo_iata_aeroporto ?? '?'}:${h.codigo_unlocode_aeroporto}`)
          .join(', ')}`,
      )
    }
  }

  console.log(
    `\n=== LEVA AÉREO ÁFRICA + AMÉRICA DO NORTE — ${AEROPORTOS_LEVA_AFRICA_AMERICA_NORTE.length} aeroportos ===`,
  )
  console.log(`OK: ${ok} | AMBÍGUO: ${amb} | FALTANDO: ${miss}\n`)
  console.log('Por país (ok/amb/falt):')
  for (const [p, s] of Object.entries(porPais).sort()) {
    console.log(`  ${p}: ${s.ok}/${s.amb}/${s.miss}`)
  }
  if (faltando.length) {
    console.log('\n--- FALTANDO ---')
    faltando.forEach((l) => console.log(l))
  }
  if (ambiguos.length) {
    console.log('\n--- AMBÍGUOS ---')
    ambiguos.forEach((l) => console.log(l))
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
