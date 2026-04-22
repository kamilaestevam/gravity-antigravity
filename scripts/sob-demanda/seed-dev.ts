/**
 * seed-dev.ts — Padrão Ouro de ambiente de testes
 *
 * Cria a estrutura mínima completa seguindo a arquitetura Schema-per-Tenant:
 *   Tenant → Company (workspace) → User (SUPER_ADMIN) → UserMembership → Subscription
 *
 * Regras invioláveis:
 *   - ZERO IDs hardcoded — Prisma gera todos os CUIDs via @default(cuid())
 *   - Idempotente — seguro re-executar (upsert em todas as entidades)
 *   - clerk_user_id usa o formato real do Clerk para testes E2E
 *
 * Uso:
 *   CONFIGURADOR_DATABASE_URL=<url> npx tsx scripts/sob-demanda/seed-dev.ts
 *
 * Nota sobre is_active:
 *   O model User não possui campo is_active. A flag fica em UserMembership,
 *   que controla o acesso do usuário ao workspace específico.
 */

import { PrismaClient, UserRole, UserMembershipRole, TenantStatus, CompanyStatus } from '../configurador/generated/index.js'

const DB_URL = process.env.CONFIGURADOR_DATABASE_URL

if (!DB_URL) {
  console.error('❌  CONFIGURADOR_DATABASE_URL não definida.')
  process.exit(1)
}

const prisma = new PrismaClient({
  datasources: { db: { url: DB_URL } },
  log: [],
})

async function main(): Promise<void> {
  console.log('\n🌱  seed-dev — Padrão Ouro de Ambiente de Testes')
  console.log('   Banco:', DB_URL!.split('@')[1]?.split('/')[0] ?? DB_URL)
  console.log()

  // ─────────────────────────────────────────────────────────────────────────
  // 1. TENANT
  //    CUID gerado pelo Prisma — zero ID hardcoded.
  //    Upsert em `slug` (campo @unique no schema).
  // ─────────────────────────────────────────────────────────────────────────
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'gravity-dev-teste' },
    update: { status: TenantStatus.ACTIVE },
    create: {
      name: 'Gravity Dev Teste',
      slug: 'gravity-dev-teste',
      status: TenantStatus.ACTIVE,
      cnpj: '00.000.000/0001-00',
      segment: 'Tecnologia',
    },
  })

  console.log(`✅  Tenant     id=${tenant.id}  slug=${tenant.slug}`)

  // ─────────────────────────────────────────────────────────────────────────
  // 2. COMPANY (workspace principal)
  //    CUID gerado pelo Prisma.
  //    Upsert em `subdomain` (@unique no schema).
  // ─────────────────────────────────────────────────────────────────────────
  const company = await prisma.company.upsert({
    where: { subdomain: 'dev-workspace-principal' },
    update: { status: CompanyStatus.ACTIVE },
    create: {
      tenant_id: tenant.id,
      name: 'Workspace Principal',
      subdomain: 'dev-workspace-principal',
      status: CompanyStatus.ACTIVE,
    },
  })

  console.log(`✅  Company    id=${company.id}  name="${company.name}"`)

  // ─────────────────────────────────────────────────────────────────────────
  // 3. USER
  //    CUID gerado pelo Prisma para `id`.
  //    clerk_user_id fixo para testes E2E — simula ID real do Clerk.
  //    preferred_company_id aponta para a Company criada acima.
  //
  //    Nota: User.is_active não existe no schema (ver UserMembership abaixo).
  // ─────────────────────────────────────────────────────────────────────────
  const user = await prisma.user.upsert({
    where: { clerk_user_id: 'user_test_dev123' },
    update: {
      tenant_id: tenant.id,
      role: UserRole.SUPER_ADMIN,
      preferred_company_id: company.id,
    },
    create: {
      tenant_id: tenant.id,
      clerk_user_id: 'user_test_dev123',
      email: 'dev@gravity-teste.internal',
      name: 'Dev Super Admin',
      role: UserRole.SUPER_ADMIN,
      preferred_company_id: company.id,
    },
  })

  console.log(`✅  User       id=${user.id}  clerk=${user.clerk_user_id}  role=${user.role}`)
  console.log(`              preferred_company_id=${user.preferred_company_id}`)

  // ─────────────────────────────────────────────────────────────────────────
  // 4. USER MEMBERSHIP
  //    Habilita o usuário no workspace com role MASTER e is_active = true.
  //    is_active mora aqui — não em User.
  // ─────────────────────────────────────────────────────────────────────────
  const membership = await prisma.userMembership.upsert({
    where: {
      tenant_id_user_id_company_id: {
        tenant_id: tenant.id,
        user_id: user.id,
        company_id: company.id,
      },
    },
    update: { role: UserMembershipRole.MASTER, is_active: true },
    create: {
      tenant_id: tenant.id,
      user_id: user.id,
      company_id: company.id,
      role: UserMembershipRole.MASTER,
      is_active: true,
    },
  })

  console.log(`✅  Membership id=${membership.id}  role=${membership.role}  is_active=${membership.is_active}`)

  // ─────────────────────────────────────────────────────────────────────────
  // 5. SUBSCRIPTION
  //    CUID gerado pelo Prisma — sem ID hardcoded.
  //    Upsert por tenant_id (findFirst + create = evita duplicata).
  // ─────────────────────────────────────────────────────────────────────────
  let subscription = await prisma.subscription.findFirst({
    where: { tenant_id: tenant.id },
  })

  if (!subscription) {
    subscription = await prisma.subscription.create({
      data: {
        tenant_id: tenant.id,
        status: 'ACTIVE',
      },
    })
    console.log(`✅  Subscription  id=${subscription.id}  status=${subscription.status}  [criada]`)
  } else {
    console.log(`⏭   Subscription  id=${subscription.id}  status=${subscription.status}  [já existia]`)
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Resumo final
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n─────────────────────────────────────────────')
  console.log('📊  RESUMO — IDs gerados pelo Prisma (CUIDs)')
  console.log('─────────────────────────────────────────────')
  console.log(`  tenant.id              = ${tenant.id}`)
  console.log(`  company.id             = ${company.id}`)
  console.log(`  user.id                = ${user.id}`)
  console.log(`  user.preferred_company = ${user.preferred_company_id}`)
  console.log(`  membership.id          = ${membership.id}`)
  console.log(`  subscription.id        = ${subscription.id}`)
  console.log()
  console.log('  clerk_user_id de teste = user_test_dev123')
  console.log('  role                   = SUPER_ADMIN')
  console.log('  membership.is_active   = true  (campo correto — User não tem is_active)')
  console.log()
  console.log('✅  Seed concluído. Banco pronto para testes.')
}

main()
  .catch(err => {
    console.error('❌  Erro fatal:', err instanceof Error ? err.message : err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
