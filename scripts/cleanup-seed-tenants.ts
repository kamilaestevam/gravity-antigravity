/**
 * scripts/cleanup-seed-tenants.ts
 * Remove tenants de seed/demo do banco do Configurador.
 * Todos os dados relacionados (users, companies, subscriptions, etc.) são
 * deletados em cascata automaticamente.
 *
 * Uso:
 *   npx tsx scripts/cleanup-seed-tenants.ts
 */

import { PrismaClient } from '../servicos-global/configurador/node_modules/.prisma/client/index.js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Carrega .env do configurador
const envPath = resolve(process.cwd(), 'servicos-global/configurador/.env')
const envVars = Object.fromEntries(
  readFileSync(envPath, 'utf-8')
    .split('\n')
    .filter((line) => line.includes('=') && !line.startsWith('#'))
    .map((line) => {
      const idx = line.indexOf('=')
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()]
    })
)

const DB_URL = envVars['CONFIGURADOR_DATABASE_URL']
if (!DB_URL) throw new Error('CONFIGURADOR_DATABASE_URL não encontrado no .env')

const prisma = new PrismaClient({
  datasources: { db: { url: DB_URL } },
})

const SLUGS_TO_DELETE = [
  'demo-corp',
  'dmm-teste',
  'empresa-alpha',
  'beta-comercio',
  'gamma-import',
  'delta-logistica',
  'epsilon-export',
]

async function main() {
  console.log('🧹 Limpando tenants de seed...\n')

  for (const slug of SLUGS_TO_DELETE) {
    const tenant = await prisma.tenant.findUnique({ where: { slug } })

    if (!tenant) {
      console.log(`⚠  ${slug} — não encontrado, pulando`)
      continue
    }

    await prisma.tenant.delete({ where: { id: tenant.id } })
    console.log(`✓  ${slug} deletado (${tenant.id}) — cascade aplicado`)
  }

  console.log('\n✅ Limpeza concluída.')
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
