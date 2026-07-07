import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { PrismaClient } from '../../servicos-global/cadastros/generated/index.js'
import { PORTOS_CHINA_HUB_COMERCIO } from '../../servicos-global/cadastros/prisma/data/portos-china-hub-comercio.js'

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
  const codigos = PORTOS_CHINA_HUB_COMERCIO.map((p) => p.codigo_unlocode_porto)
  const found = await prisma.porto.findMany({
    where: { codigo_unlocode_porto: { in: codigos } },
    select: {
      codigo_unlocode_porto: true,
      nome_porto: true,
      codigo_pais_porto: true,
      ativo_porto: true,
    },
    orderBy: { codigo_unlocode_porto: 'asc' },
  })

  const foundSet = new Set(found.map((p) => p.codigo_unlocode_porto))
  const missing = codigos.filter((c) => !foundSet.has(c))
  const inativos = found.filter((p) => !p.ativo_porto)

  console.log(`Esperados: ${codigos.length}`)
  console.log(`No banco: ${found.length}`)
  console.log(`Faltando (${missing.length}):`, missing.length ? missing.join(', ') : 'nenhum')
  console.log(`Inativos (${inativos.length}):`, inativos.length ? inativos.map((p) => p.codigo_unlocode_porto).join(', ') : 'nenhum')

  if (found.length) {
    console.log('\nRegistros encontrados:')
    for (const p of found) {
      console.log(`${p.codigo_unlocode_porto} | ${p.nome_porto} | ${p.codigo_pais_porto} | ativo=${p.ativo_porto}`)
    }
  }

  const nomesFaltantes = [
    'Dalian',
    'Qinhuangdao',
    'Yantai',
    'Yangshan',
    'Suzhou',
    'Nanjing',
    'Fuzhou',
    'Shantou',
    'Chiwan',
    'Zhanjiang',
    'Haikou',
    'Yangpu',
    'Sanya',
    'Wuhan',
  ]
  console.log('\nBusca por nome (faltantes):')
  for (const n of nomesFaltantes) {
    const hits = await prisma.porto.findMany({
      where: {
        codigo_pais_porto: 'CN',
        OR: [
          { nome_porto: { contains: n, mode: 'insensitive' } },
          { nome_ascii_porto: { contains: n, mode: 'insensitive' } },
        ],
      },
      select: { codigo_unlocode_porto: true, nome_porto: true, ativo_porto: true },
      take: 5,
    })
    const linha =
      hits.length > 0
        ? hits.map((h) => `${h.codigo_unlocode_porto} (${h.nome_porto}, ativo=${h.ativo_porto})`).join(' | ')
        : 'NAO ENCONTRADO'
    console.log(`${n}: ${linha}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
