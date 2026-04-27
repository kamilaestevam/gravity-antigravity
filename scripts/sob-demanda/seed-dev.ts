/**
 * seed-dev.ts — Padrão Ouro de ambiente de testes
 *
 * Cria a estrutura mínima completa seguindo a arquitetura Schema-per-Organizacao:
 *   Organizacao → Empresa (workspace) → Usuario (SUPER_ADMIN) → UsuarioWorkspace → AssinaturaProdutoGravity
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
 *   O model Usuario não possui campo is_active. A flag fica em UsuarioWorkspace,
 *   que controla o acesso do usuário ao workspace específico.
 */

import { PrismaClient, UsuarioTipo, TipoUsuarioEmpresa, OrganizacaoStatus, EmpresaStatus } from '../configurador/generated/index.js'

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
  // 1. ORGANIZACAO
  //    CUID gerado pelo Prisma — zero ID hardcoded.
  //    Upsert em `slug` (campo @unique no schema).
  // ─────────────────────────────────────────────────────────────────────────
  const tenant = await prisma.organizacao.upsert({
    where: { slug: 'gravity-dev-teste' },
    update: { status: OrganizacaoStatus.ATIVO },
    create: {
      name: 'Gravity Dev Teste',
      slug: 'gravity-dev-teste',
      status: OrganizacaoStatus.ATIVO,
      cnpj: '00.000.000/0001-00',
      segment: 'Tecnologia',
    },
  })

  console.log(`✅  Organizacao id=${tenant.id}  slug=${tenant.slug}`)

  // ─────────────────────────────────────────────────────────────────────────
  // 2. EMPRESA (workspace principal)
  //    CUID gerado pelo Prisma.
  //    Upsert em `subdomain` (@unique no schema).
  // ─────────────────────────────────────────────────────────────────────────
  const company = await prisma.workspace.upsert({
    where: { subdomain: 'dev-workspace-principal' },
    update: { status: EmpresaStatus.ATIVO },
    create: {
      tenant_id: tenant.id,
      name: 'Workspace Principal',
      subdomain: 'dev-workspace-principal',
      status: EmpresaStatus.ATIVO,
    },
  })

  console.log(`✅  Empresa    id=${company.id}  name="${company.name}"`)

  // ─────────────────────────────────────────────────────────────────────────
  // 3. USUARIO
  //    CUID gerado pelo Prisma para `id`.
  //    clerk_user_id fixo para testes E2E — simula ID real do Clerk.
  //    preferred_company_id aponta para a Empresa criada acima.
  //
  //    Nota: Usuario.is_active não existe no schema (ver UsuarioWorkspace abaixo).
  // ─────────────────────────────────────────────────────────────────────────
  const user = await prisma.usuario.upsert({
    where: { clerk_user_id: 'user_test_dev123' },
    update: {
      tenant_id: tenant.id,
      role: UsuarioTipo.SUPER_ADMIN,
      preferred_company_id: company.id,
    },
    create: {
      tenant_id: tenant.id,
      clerk_user_id: 'user_test_dev123',
      email: 'dev@gravity-teste.internal',
      name: 'Dev Super Admin',
      role: UsuarioTipo.SUPER_ADMIN,
      preferred_company_id: company.id,
    },
  })

  console.log(`✅  Usuario    id=${user.id}  clerk=${user.clerk_user_id}  role=${user.role}`)
  console.log(`              preferred_company_id=${user.preferred_company_id}`)

  // ─────────────────────────────────────────────────────────────────────────
  // 4. USUARIO WORKSPACE
  //    Habilita o usuário no workspace com role MASTER e is_active = true.
  //    is_active mora aqui — não em Usuario.
  // ─────────────────────────────────────────────────────────────────────────
  const membership = await prisma.usuarioWorkspace.upsert({
    where: {
      tenant_id_user_id_company_id: {
        tenant_id: tenant.id,
        user_id: user.id,
        company_id: company.id,
      },
    },
    update: { role: TipoUsuarioEmpresa.MASTER, is_active: true },
    create: {
      tenant_id: tenant.id,
      user_id: user.id,
      company_id: company.id,
      role: TipoUsuarioEmpresa.MASTER,
      is_active: true,
    },
  })

  console.log(`✅  Membership id=${membership.id}  role=${membership.role}  is_active=${membership.is_active}`)

  // ─────────────────────────────────────────────────────────────────────────
  // 5. ASSINATURA
  //    CUID gerado pelo Prisma — sem ID hardcoded.
  //    Upsert por tenant_id (findFirst + create = evita duplicata).
  // ─────────────────────────────────────────────────────────────────────────
  let subscription = await prisma.produtoGravityAssinatura.findFirst({
    where: { tenant_id: tenant.id },
  })

  if (!subscription) {
    subscription = await prisma.produtoGravityAssinatura.create({
      data: {
        tenant_id: tenant.id,
        status: 'ATIVA',
      },
    })
    console.log(`✅  Assinatura id=${subscription.id}  status=${subscription.status}  [criada]`)
  } else {
    console.log(`⏭   Assinatura id=${subscription.id}  status=${subscription.status}  [já existia]`)
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Resumo final
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n─────────────────────────────────────────────')
  console.log('📊  RESUMO — IDs gerados pelo Prisma (CUIDs)')
  console.log('─────────────────────────────────────────────')
  console.log(`  organizacao.id          = ${tenant.id}`)
  console.log(`  empresa.id              = ${company.id}`)
  console.log(`  usuario.id              = ${user.id}`)
  console.log(`  usuario.preferred       = ${user.preferred_company_id}`)
  console.log(`  membership.id           = ${membership.id}`)
  console.log(`  assinatura.id           = ${subscription.id}`)
  console.log()
  console.log('  clerk_user_id de teste = user_test_dev123')
  console.log('  role                   = SUPER_ADMIN')
  console.log('  membership.is_active   = true  (campo correto — Usuario não tem is_active)')
  console.log()
  console.log('✅  Seed concluído. Banco pronto para testes.')
}

main()
  .catch(err => {
    console.error('❌  Erro fatal:', err instanceof Error ? err.message : err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
