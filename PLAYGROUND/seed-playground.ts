import { PrismaClient } from '@prisma/client'

// Inicia as duas conexões (Configurador e Tenant)
const configurador = new PrismaClient({
  datasources: { db: { url: "postgresql://postgres:postgres@localhost:5432/configurador_test" } }
})

async function main() {
  console.log('🌱 Iniciando Injeção de Dados (Seed) no Playground...')

  // 1. Criar o Tenant de Teste (Empresa Lab 2026)
  const tenant = await configurador.tenant.upsert({
    where: { slug: 'empresa-lab-2026' },
    update: {},
    create: {
      name: 'Empresa Lab 2026',
      slug: 'empresa-lab-2026',
      status: 'ACTIVE',
      clerk_org_id: 'org_test_123',
    }
  })
  console.log(`✅ Tenant Criado: ${tenant.name} (${tenant.id})`)

  // 2. Criar o Usuário Administrativo (Dono do Lab)
  const user = await configurador.user.upsert({
    where: { clerk_user_id: 'user_test_admin_001' },
    update: {},
    create: {
      tenant_id: tenant.id,
      clerk_user_id: 'user_test_admin_001',
      email: 'admin@gravity-lab.com',
      name: 'Administrador do Lab',
      role: 'OWNER'
    }
  })
  console.log(`✅ Usuário Criado: ${user.name} (${user.id})`)

  // 3. Criar uma Assinatura Ativa (Plano Enterprise) se não existir
  const existingSub = await configurador.subscription.findFirst({
    where: { tenant_id: tenant.id }
  })

  if (!existingSub) {
    await configurador.subscription.create({
      data: {
        tenant_id: tenant.id,
        plan: 'ENTERPRISE',
        status: 'ACTIVE',
        stripe_subscription_id: 'sub_test_playground_001',
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    })
    console.log(`✅ Assinatura Enterprise Ativa criada vinculada ao Tenant.`)
  } else {
    console.log(`ℹ️ Assinatira já existente, pulando criação.`)
  }

  console.log('🎉 Playground Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro no Seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await configurador.$disconnect()
  })
