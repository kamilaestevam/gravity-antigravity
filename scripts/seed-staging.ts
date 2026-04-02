/**
 * scripts/seed-staging.ts
 * Seed de dados realistas para o ambiente T26000001 (Staging).
 *
 * Cria 5 tenants fictícios com dados representativos para exercitar
 * todos os índices e detectar problemas de performance antes de produção.
 *
 * Executar após as migrations:
 *   npx ts-node scripts/seed-staging.ts
 */

import { PrismaClient as ConfiguradorPrisma } from '../configurador/generated'
import { PrismaClient as TenantPrisma } from '../servicos-global/tenant/generated'

const configuradorDb = new ConfiguradorPrisma({
  datasources: { db: { url: process.env.CONFIGURADOR_DATABASE_URL } }
})

const tenantDb = new TenantPrisma({
  datasources: { db: { url: process.env.TENANT_DATABASE_URL } }
})

// ----------------------------------------------------------------
// Dados de seed
// ----------------------------------------------------------------

const TENANTS = [
  { name: 'Empresa Alpha Ltda',   slug: 'empresa-alpha'   },
  { name: 'Beta Comércio S/A',    slug: 'beta-comercio'   },
  { name: 'Gamma Importações',    slug: 'gamma-import'    },
  { name: 'Delta Logística',      slug: 'delta-logistica' },
  { name: 'Épsilon Exportações',  slug: 'epsilon-export'  },
]

// ----------------------------------------------------------------
// Seed principal
// ----------------------------------------------------------------

async function main() {
  console.log('🌱 Iniciando seed de staging (T26000001)...\n')

  await configuradorDb.$connect()
  await tenantDb.$connect()

  for (const tenantData of TENANTS) {
    // 1. Criar Tenant no Configurador DB
    const tenant = await configuradorDb.tenant.upsert({
      where: { slug: tenantData.slug },
      update: {},
      create: {
        name: tenantData.name,
        slug: tenantData.slug,
        status: 'ACTIVE',
      }
    })

    console.log(`✅ Tenant criado: ${tenant.name} (${tenant.id})`)

    // 2. Criar Company (Workspace) para o Tenant
    const company = await configuradorDb.company.upsert({
      where: { subdomain: `${tenantData.slug}-workspace` },
      update: {},
      create: {
        tenant_id: tenant.id,
        name: `${tenantData.name} — Escritório Central`,
        subdomain: `${tenantData.slug}-workspace`,
        status: 'ACTIVE',
      }
    })

    // 3. Criar Subscription
    await configuradorDb.subscription.upsert({
      where: { id: `sub-${tenant.id}` },
      update: {},
      create: {
        id: `sub-${tenant.id}`,
        tenant_id: tenant.id,
        status: 'ACTIVE',
      }
    })

    // 4. Seed no Tenant DB — 100 registros por tabela crítica
    const activities = Array.from({ length: 100 }, (_, i) => ({
      tenant_id: tenant.id,
      product_id: 'staging-product',
      user_id: `user-staging-${i % 5}`,
      titulo: `Atividade ${i + 1} — ${tenantData.name}`,
      tipo: 'TAREFA' as any,
      status: ['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA'][i % 3] as any,
      prioridade: ['BAIXA', 'MEDIA', 'ALTA'][i % 3] as any,
    }))

    await tenantDb.atividade.createMany({ data: activities, skipDuplicates: true })

    const historyLogs = Array.from({ length: 100 }, (_, i) => ({
      tenant_id: tenant.id,
      actor_id: `user-staging-${i % 5}`,
      actor_type: 'USER' as any,
      action: ['CRIAÇÃO', 'ALTERAÇÃO', 'EXCLUSÃO'][i % 3],
      product_id: 'staging-product',
      user_id: `user-staging-${i % 5}`,
      metadata: { item: `Record ${i}`, timestamp: new Date().toISOString() },
    }))

    await tenantDb.historyLog.createMany({ data: historyLogs, skipDuplicates: true })

    console.log(`   📝 100 Atividades + 100 HistoryLogs criados para ${tenantData.name}`)
  }

  console.log('\n✅ Seed de staging concluído!')
  console.log(`   5 Tenants | 5 Companies | 5 Subscriptions`)
  console.log(`   500 Atividades | 500 HistoryLogs no Tenant DB`)
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await configuradorDb.$disconnect()
    await tenantDb.$disconnect()
  })
