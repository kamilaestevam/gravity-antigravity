import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { PrismaClient } from '../../servicos-global/cadastros/generated/index.js'
import { PORTOS_CANONICOS_LEVA_AMERICAS } from './data/portos-canonicos-leva-americas.js'
import { PORTOS_LEVA_AMERICAS } from './data/portos-leva-americas.js'

const envPath = resolve(import.meta.dirname, '../../.env.local')
for (const linha of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const m = linha.match(/^CADASTROS_DATABASE_URL=(.*)$/)
  if (m && !process.env.CADASTROS_DATABASE_URL) process.env.CADASTROS_DATABASE_URL = m[1]
}

const prisma = new PrismaClient({ datasources: { db: { url: process.env.CADASTROS_DATABASE_URL! } } })

async function buscarPorto(pais: string, termos: string[]) {
  for (const termo of termos) {
    const hits = await prisma.porto.findMany({
      where: {
        codigo_pais_porto: pais,
        OR: [
          { nome_porto: { contains: termo, mode: 'insensitive' } },
          { nome_ascii_porto: { contains: termo, mode: 'insensitive' } },
        ],
      },
      select: { codigo_unlocode_porto: true, nome_porto: true, ativo_porto: true },
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

  for (const item of PORTOS_LEVA_AMERICAS) {
    porPais[item.pais] ??= { ok: 0, amb: 0, miss: 0 }
    const codigoCanonico = PORTOS_CANONICOS_LEVA_AMERICAS[`${item.pais}:${item.rotulo}`]
    if (codigoCanonico) {
      const canonico = await prisma.porto.findUnique({
        where: { codigo_unlocode_porto: codigoCanonico },
        select: { codigo_unlocode_porto: true, nome_porto: true, ativo_porto: true, codigo_pais_porto: true },
      })
      if (canonico?.ativo_porto && canonico.codigo_pais_porto === item.pais) {
        ok++
        porPais[item.pais].ok++
        continue
      }
      if (!canonico) {
        miss++
        porPais[item.pais].miss++
        faltando.push(`[${item.pais}] ${item.rotulo} (canônico ${codigoCanonico} ausente)`)
        continue
      }
      miss++
      porPais[item.pais].miss++
      faltando.push(`[${item.pais}] ${item.rotulo} (canônico ${codigoCanonico} inativo ou país diverso)`)
      continue
    }

    const hits = await buscarPorto(item.pais, item.termos)
    const ativos = hits.filter((h) => h.ativo_porto)
    if (ativos.length === 1) {
      ok++
      porPais[item.pais].ok++
    } else if (hits.length === 0) {
      miss++
      porPais[item.pais].miss++
      faltando.push(`[${item.pais}] ${item.rotulo}`)
    } else {
      amb++
      porPais[item.pais].amb++
      ambiguos.push(`[${item.pais}] ${item.rotulo} → ${ativos.slice(0, 3).map((h) => h.codigo_unlocode_porto).join(', ')}`)
    }
  }

  console.log(`\n=== LEVA AMÉRICAS + BR — ${PORTOS_LEVA_AMERICAS.length} portos ===`)
  console.log(`OK: ${ok} | AMBÍGUO: ${amb} | FALTANDO: ${miss}\n`)
  console.log('Por país (ok/amb/falt):')
  for (const [p, s] of Object.entries(porPais).sort()) {
    console.log(`  ${p}: ${s.ok}/${s.amb}/${s.miss}`)
  }
  if (faltando.length) {
    console.log('\n--- FALTANDO ---')
    faltando.forEach((l) => console.log(l))
  }
  if (ambiguos.length > 50) {
    console.log(`\n--- AMBÍGUOS (${ambiguos.length} total, primeiros 40) ---`)
    ambiguos.slice(0, 40).forEach((l) => console.log(l))
  } else if (ambiguos.length) {
    console.log('\n--- AMBÍGUOS ---')
    ambiguos.forEach((l) => console.log(l))
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
