import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { PrismaClient } from '../../servicos-global/cadastros/generated/index.js'

const envPath = resolve(import.meta.dirname, '../../.env.local')
for (const linha of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const m = linha.match(/^CADASTROS_DATABASE_URL=(.*)$/)
  if (m && !process.env.CADASTROS_DATABASE_URL) process.env.CADASTROS_DATABASE_URL = m[1]
}

const prisma = new PrismaClient({ datasources: { db: { url: process.env.CADASTROS_DATABASE_URL! } } })

async function q(label: string, where: object) {
  const hits = await prisma.porto.findMany({
    where,
    select: { codigo_unlocode_porto: true, nome_porto: true, codigo_pais_porto: true, ativo_porto: true },
    take: 15,
  })
  console.log('\n' + label + ':')
  hits.forEach((h) => console.log(`  ${h.codigo_unlocode_porto} | ${h.nome_porto} | ${h.codigo_pais_porto}`))
  if (!hits.length) console.log('  (nenhum)')
}

async function code(c: string) {
  const p = await prisma.porto.findUnique({
    where: { codigo_unlocode_porto: c },
    select: { codigo_unlocode_porto: true, nome_porto: true, codigo_pais_porto: true, ativo_porto: true },
  })
  console.log(c + ' -> ' + (p ? `${p.nome_porto} (${p.codigo_pais_porto})` : 'NOT FOUND'))
}

async function main() {
  await q('Khasab', { OR: [{ nome_porto: { contains: 'Khasab', mode: 'insensitive' } }] })
  await q('Abdullah KW', { codigo_pais_porto: 'KW', OR: [{ nome_porto: { contains: 'Abdullah', mode: 'insensitive' } }] })
  await q('Abu Flus', { OR: [{ nome_porto: { contains: 'Flus', mode: 'insensitive' } }, { nome_porto: { contains: 'Fao', mode: 'insensitive' } }] })
  await q('Mocha YE', { codigo_pais_porto: 'YE', OR: [{ nome_porto: { contains: 'Mocha', mode: 'insensitive' } }, { nome_porto: { contains: 'Mukha', mode: 'insensitive' } }] })
  await q('George Town KY', { OR: [{ nome_porto: { contains: 'George Town', mode: 'insensitive' } }, { codigo_pais_porto: 'KY' }] })
  await q('Charlotte Amalie', { OR: [{ nome_porto: { contains: 'Amalie', mode: 'insensitive' } }, { nome_porto: { contains: 'Charlotte', mode: 'insensitive' } }] })
  await q('Christiansted', { OR: [{ nome_porto: { contains: 'Christiansted', mode: 'insensitive' } }, { nome_porto: { contains: 'St Croix', mode: 'insensitive' } }] })
  await q('VI country', { codigo_pais_porto: 'VI' })
  await q('PR San Juan', { codigo_pais_porto: 'PR', nome_porto: { contains: 'San Juan', mode: 'insensitive' } })

  console.log('\n--- CODES ---')
  for (const c of [
    'IQALF', 'IQFAO', 'KWMIB', 'VISTT', 'VILIB', 'VIHOC', 'VIFRD', 'VICHA', 'VICTD',
    'KYGEO', 'KYGEC', 'OMKHS', 'YEMOK',
  ]) {
    await code(c)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
