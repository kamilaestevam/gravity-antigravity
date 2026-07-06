import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { PrismaClient } from '../../servicos-global/cadastros/generated/index.js'

const envPath = resolve(import.meta.dirname, '../../.env.local')
for (const linha of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const m = linha.match(/^CADASTROS_DATABASE_URL=(.*)$/)
  if (m && !process.env.CADASTROS_DATABASE_URL) process.env.CADASTROS_DATABASE_URL = m[1]
}

const prisma = new PrismaClient({ datasources: { db: { url: process.env.CADASTROS_DATABASE_URL! } } })

async function code(c: string) {
  const p = await prisma.porto.findUnique({
    where: { codigo_unlocode_porto: c },
    select: { codigo_unlocode_porto: true, nome_porto: true, codigo_pais_porto: true, ativo_porto: true },
  })
  console.log(c + ' -> ' + (p ? `${p.nome_porto} (${p.codigo_pais_porto}) ativo=${p.ativo_porto}` : 'NOT FOUND'))
}

async function main() {
  for (const c of [
    'SOBSA', 'SOBBO', 'EGAAC', 'EGAAC', 'HKTMT', 'HKTUN', 'HKMTR', 'VNLHP', 'VNHPH',
    'MYBTU', 'MYKCH', 'MYBKI', 'IDBLW', 'IDDUM', 'IDBIT', 'SGSIN', 'SGBNI',
    'PHMNL', 'PHMNN', 'PHMNS',
  ]) {
    await code(c)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
