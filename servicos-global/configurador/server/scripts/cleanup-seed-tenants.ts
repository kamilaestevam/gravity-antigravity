/**
 * cleanup-seed-tenants.ts
 * Remove tenants de seed/demo do banco do Configurador.
 * Todos os dados relacionados são deletados em cascata automaticamente.
 *
 * Uso:
 *   cd servicos-global/configurador
 *   npx tsx server/scripts/cleanup-seed-tenants.ts
 */

import 'dotenv/config'
import { PrismaClient } from '../../../../configurador/generated/index.js'

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.CONFIGURADOR_DATABASE_URL } },
})

const SLUGS_TO_DELETE = [
  'dmm-ie',
  'dmm-trading',
]

async function main() {
  console.log('🧹 Limpando tenants de seed...\n')

  for (const slug of SLUGS_TO_DELETE) {
    const tenant = await prisma.organizacao.findUnique({ where: { subdominio_organizacao: slug } })

    if (!tenant) {
      console.log(`⚠  ${slug} — não encontrado, pulando`)
      continue
    }

    await prisma.organizacao.delete({ where: { id_organizacao: tenant.id_organizacao } })
    console.log(`✓  ${slug} deletado (${tenant.id_organizacao})`)
  }

  console.log('\n✅ Limpeza concluída.')
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
