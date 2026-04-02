/**
 * seed-test-user.ts
 * Cria dados de teste para o fluxo completo:
 * Tenant → Company (workspace) → User → ProductConfig → CompanyProduct
 *
 * Uso: npx tsx scripts/seed-test-user.ts
 */

import { PrismaClient } from '../configurador/generated/index.js'

const DB_URL = process.env.CONFIGURADOR_DATABASE_URL

const prisma = new PrismaClient({
  datasources: {
    db: { url: DB_URL },
  },
})

async function main() {
  console.log('Conectando ao banco...')

  // 1. Busca ou cria o tenant
  let tenant = await prisma.tenant.findFirst({
    where: { slug: 'dmm-teste' },
  })

  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: 'DMM Importação & Exportação',
        slug: 'dmm-teste',
        status: 'ACTIVE',
      },
    })
    console.log('Tenant criado:', tenant.id)
  } else {
    console.log('Tenant já existe:', tenant.id)
  }

  // 2. Busca ou cria o workspace (Company)
  let company = await prisma.company.findFirst({
    where: { tenant_id: tenant.id, name: 'DMM Workspace Principal' },
  })

  if (!company) {
    company = await prisma.company.create({
      data: {
        tenant_id: tenant.id,
        name: 'DMM Workspace Principal',
        subdomain: 'dmm-principal',
        cnpj: '12.345.678/0001-90',
        status: 'ACTIVE',
      },
    })
    console.log('Workspace criado:', company.id)
  } else {
    console.log('Workspace já existe:', company.id)
  }

  // 3. Busca ou cria o usuário
  // NOTA: O clerk_user_id precisa corresponder ao ID real do Clerk para daniel@dmm-ie.com.br
  // Se não souber, deixe como placeholder e atualize depois
  let user = await prisma.user.findFirst({
    where: { tenant_id: tenant.id, email: 'daniel@dmm-ie.com.br' },
  })

  if (!user) {
    // Tenta encontrar pelo email em qualquer tenant
    const existingUser = await prisma.user.findFirst({
      where: { email: 'daniel@dmm-ie.com.br' },
    })

    if (existingUser) {
      user = existingUser
      console.log('Usuário já existe em outro tenant:', user.id)
    } else {
      user = await prisma.user.create({
        data: {
          tenant_id: tenant.id,
          clerk_user_id: 'pending_clerk_sync',
          email: 'daniel@dmm-ie.com.br',
          name: 'Daniel',
          role: 'MASTER',
        },
      })
      console.log('Usuário criado:', user.id, '(ATENÇÃO: clerk_user_id precisa ser atualizado com o ID real do Clerk)')
    }
  } else {
    console.log('Usuário já existe:', user.id, 'clerk_user_id:', user.clerk_user_id)
  }

  // 4. Cria UserMembership (liga o user ao workspace)
  const membership = await prisma.userMembership.upsert({
    where: {
      tenant_id_user_id_company_id: {
        tenant_id: tenant.id,
        user_id: user.id,
        company_id: company.id,
      },
    },
    create: {
      tenant_id: tenant.id,
      user_id: user.id,
      company_id: company.id,
      role: 'MASTER',
      is_active: true,
    },
    update: { is_active: true },
  })
  console.log('Membership:', membership.id)

  // 5. Cria produto no catálogo (SimulaCusto)
  const simulaCusto = await prisma.globalProduct.upsert({
    where: { slug: 'simula-custo' },
    create: {
      name: 'SimulaCusto',
      slug: 'simula-custo',
      description: 'Simulador de custos de importação com cálculo automático de tributos, PTAX e landed cost.',
      status: 'Ativo',
      type_billing: 'Mensalidade',
      unit_price: 199,
      currency: 'BRL',
      backend_module: 'simula-custo',
      base_users: 5,
      help_desk_hours: 4,
    },
    update: { status: 'Ativo' },
  })
  console.log('Produto SimulaCusto:', simulaCusto.id)

  // 6. Cria ProductConfig (tenant contrata o produto)
  const productConfig = await prisma.productConfig.upsert({
    where: {
      tenant_id_product_key: {
        tenant_id: tenant.id,
        product_key: 'simula-custo',
      },
    },
    create: {
      tenant_id: tenant.id,
      product_key: 'simula-custo',
      config: {},
      is_active: true,
    },
    update: { is_active: true },
  })
  console.log('ProductConfig:', productConfig.id)

  // 7. Cria CompanyProduct (ativa no workspace)
  const companyProduct = await prisma.companyProduct.upsert({
    where: {
      company_id_product_key: {
        company_id: company.id,
        product_key: 'simula-custo',
      },
    },
    create: {
      tenant_id: tenant.id,
      company_id: company.id,
      product_key: 'simula-custo',
      is_active: true,
    },
    update: { is_active: true },
  })
  console.log('CompanyProduct:', companyProduct.id)

  // 8. Cria Subscription
  await prisma.subscription.upsert({
    where: { id: `sub_${tenant.id}` },
    create: {
      id: `sub_${tenant.id}`,
      tenant_id: tenant.id,
      status: 'ACTIVE',
    },
    update: { status: 'ACTIVE' },
  })
  console.log('Subscription criada')

  console.log('\n=== RESUMO ===')
  console.log(`Tenant:    ${tenant.name} (${tenant.id})`)
  console.log(`Workspace: ${company.name} (${company.id})`)
  console.log(`Usuário:   ${user.email} (${user.id}) — clerk: ${user.clerk_user_id}`)
  console.log(`Produto:   SimulaCusto — contratado e ativo no workspace`)
  console.log('\nSe o clerk_user_id estiver como "pending_clerk_sync", atualize com:')
  console.log(`  UPDATE "User" SET clerk_user_id = 'user_XXXX' WHERE id = '${user.id}';`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
