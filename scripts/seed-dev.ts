/**
 * Seed de desenvolvimento — popula o banco com tenant + user + company
 * Uso: npx tsx scripts/seed-dev.ts
 */
import { PrismaClient } from '../configurador/generated/index.js'

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.CONFIGURADOR_DATABASE_URL } },
})

async function main() {
  console.log('Seeding banco de desenvolvimento...\n')

  // 1. Tenant
  const tenant = await prisma.tenant.upsert({
    where: { id: 'tenant-dev-001' },
    update: {},
    create: {
      id: 'tenant-dev-001',
      name: 'Gravity Dev',
      slug: 'gravity-dev',
      status: 'ACTIVE',
    },
  })
  console.log('✅ Tenant:', tenant.name)

  // 2. User (vinculado ao Clerk)
  const user = await prisma.user.upsert({
    where: { clerk_user_id: 'user_3BMaKkAZrO5AXkR53oXYbQl9wWo' },
    update: { tenant_id: tenant.id },
    create: {
      tenant_id: tenant.id,
      clerk_user_id: 'user_3BMaKkAZrO5AXkR53oXYbQl9wWo',
      email: 'admin@gravity.dev',
      name: 'Admin Gravity',
      role: 'SUPER_ADMIN',
    },
  })
  console.log('✅ User:', user.name, `(${user.role})`)

  // 3. Company (workspace)
  const company = await prisma.company.upsert({
    where: { id: 'company-dev-001' },
    update: {},
    create: {
      id: 'company-dev-001',
      tenant_id: tenant.id,
      name: 'TESTE ABC',
      status: 'ACTIVE',
    },
  })
  console.log('✅ Company:', company.name)

  // 4. Membership
  await prisma.userMembership.upsert({
    where: {
      tenant_id_user_id_company_id: { tenant_id: tenant.id, user_id: user.id, company_id: company.id },
    },
    update: {},
    create: {
      tenant_id: tenant.id,
      user_id: user.id,
      company_id: company.id,
      role: 'MASTER',
    },
  })
  console.log('✅ Membership: Admin → TESTE ABC')

  console.log('\n🎉 Seed completo! Reinicie o dev server.')
}

main()
  .catch(e => { console.error('❌ Erro:', e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
