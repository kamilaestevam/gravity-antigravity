import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { PrismaClient } from '../../servicos-global/cadastros/generated/index.js'

const envPath = resolve(import.meta.dirname, '../../.env.local')
for (const linha of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const m = linha.match(/^CADASTROS_DATABASE_URL=(.*)$/)
  if (m && !process.env.CADASTROS_DATABASE_URL) process.env.CADASTROS_DATABASE_URL = m[1]
}

const prisma = new PrismaClient({ datasources: { db: { url: process.env.CADASTROS_DATABASE_URL! } } })

const queries = [
  { label: 'Chibatao BR', q: { codigo_pais_porto: 'BR', OR: [{ nome_porto: { contains: 'Chib', mode: 'insensitive' as const } }] } },
  { label: 'Super Terminais BR', q: { codigo_pais_porto: 'BR', OR: [{ nome_porto: { contains: 'Super', mode: 'insensitive' as const } }] } },
  { label: 'Inacio Barbosa BR', q: { codigo_pais_porto: 'BR', OR: [{ nome_porto: { contains: 'Barbosa', mode: 'insensitive' as const } }, { nome_porto: { contains: 'Inacio', mode: 'insensitive' as const } }] } },
  { label: 'Saint John CA', q: { codigo_pais_porto: 'CA', OR: [{ nome_porto: { contains: 'Saint John', mode: 'insensitive' as const } }, { nome_porto: { contains: 'St John', mode: 'insensitive' as const } }] } },
  { label: 'Freeport BS', q: { codigo_pais_porto: 'BS', OR: [{ nome_porto: { contains: 'Freeport', mode: 'insensitive' as const } }] } },
  { label: 'Port of Spain TT', q: { codigo_pais_porto: 'TT', OR: [{ nome_porto: { contains: 'Spain', mode: 'insensitive' as const } }, { nome_porto: { contains: 'Port-of-Spain', mode: 'insensitive' as const } }] } },
  { label: 'St Georges GD', q: { codigo_pais_porto: 'GD', OR: [{ nome_porto: { contains: 'George', mode: 'insensitive' as const } }] } },
  { label: 'Basseterre KN', q: { codigo_pais_porto: 'KN', OR: [{ nome_porto: { contains: 'Basseterre', mode: 'insensitive' as const } }] } },
  { label: 'Dock Sud AR', q: { codigo_pais_porto: 'AR', OR: [{ nome_porto: { contains: 'Dock', mode: 'insensitive' as const } }, { nome_porto: { contains: 'Sud', mode: 'insensitive' as const } }] } },
  { label: 'Puerto Aguirre BO', q: { codigo_pais_porto: 'BO', OR: [{ nome_porto: { contains: 'Aguirre', mode: 'insensitive' as const } }] } },
  { label: 'Gravetal BO', q: { codigo_pais_porto: 'BO', OR: [{ nome_porto: { contains: 'Gravetal', mode: 'insensitive' as const } }] } },
]

async function main() {
  for (const { label, q } of queries) {
    const hits = await prisma.porto.findMany({
      where: q,
      select: { codigo_unlocode_porto: true, nome_porto: true, ativo_porto: true },
      take: 10,
    })
    console.log('\n' + label + ':')
    hits.forEach((h) => console.log('  ' + h.codigo_unlocode_porto + ' | ' + h.nome_porto + ' | ativo=' + h.ativo_porto))
    if (!hits.length) console.log('  (nenhum)')
  }

  const codes = [
    'BRMAN', 'BRMAO', 'BRIQI', 'BRITQ', 'BRVIX', 'BRPRM', 'BRSVP', 'BRACX', 'BRIGU', 'BRPRU', 'BRSSB', 'BRSSO',
    'USNYC', 'USSAV', 'USCHS', 'USBAL', 'USJAX', 'USMIA', 'USHOU', 'USFPO', 'USPDX', 'USCHI', 'USDET', 'USCLE',
    'CAMTR', 'CAVAN', 'MXZLO', 'COCTG', 'ARRFO', 'VEBJV', 'CASJB', 'TTPOS', 'GDSTG', 'KNBAS', 'ARDSU', 'BOPAQ', 'BOPSR', 'BOGVT', 'BSFPO',
  ]
  console.log('\n--- CANONICAL CODES ---')
  for (const c of codes) {
    const p = await prisma.porto.findUnique({
      where: { codigo_unlocode_porto: c },
      select: { codigo_unlocode_porto: true, nome_porto: true, codigo_pais_porto: true, ativo_porto: true },
    })
    if (p) console.log(c + ' -> ' + p.nome_porto + ' (' + p.codigo_pais_porto + ') ativo=' + p.ativo_porto)
    else console.log(c + ' -> NOT FOUND')
  }

  const extraQueries = [
    { label: 'Manaus all BR', q: { codigo_pais_porto: 'BR', nome_porto: { contains: 'Manaus', mode: 'insensitive' as const } } },
    { label: 'Sergipe/Barbosa BR', q: { codigo_pais_porto: 'BR', OR: [{ subdivisao_porto: 'SE' }, { nome_porto: { contains: 'Barra dos Coqueiros', mode: 'insensitive' as const } }] } },
    { label: 'KN all', q: { codigo_pais_porto: 'KN' } },
    { label: 'BS all', q: { codigo_pais_porto: 'BS' } },
    { label: 'BO all', q: { codigo_pais_porto: 'BO' } },
    { label: 'AR Dock/Sud', q: { codigo_pais_porto: 'AR', OR: [{ nome_porto: { contains: 'Dock', mode: 'insensitive' as const } }, { nome_porto: { contains: 'Sud', mode: 'insensitive' as const } }, { nome_porto: { contains: 'Sur', mode: 'insensitive' as const } }] } },
  ]
  console.log('\n--- EXTRA ---')
  for (const { label, q } of extraQueries) {
    const hits = await prisma.porto.findMany({
      where: q,
      select: { codigo_unlocode_porto: true, nome_porto: true, subdivisao_porto: true, ativo_porto: true },
      take: 20,
    })
    console.log('\n' + label + ':')
    hits.forEach((h) => console.log('  ' + h.codigo_unlocode_porto + ' | ' + h.nome_porto + ' | ' + (h.subdivisao_porto ?? '')))
    if (!hits.length) console.log('  (nenhum)')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
