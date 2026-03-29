import { PrismaClient } from '../../../configurador/generated/index.js'
import { withTenantContext } from '../../../servicos-global/tenant/src/lib/prisma-tenant'

const prisma = new PrismaClient()

/**
 * Cria dois universos empresariais completamente isolados (Alpha e Beta)
 * para a bateria de detecção de vazamentos RLS.
 */
export async function createIsolatedTenants() {
  // 1. Limpeza Ativa
  await prisma.company.deleteMany({
    where: { OR: [{ tenant_id: 'tenant_alpha' }, { tenant_id: 'tenant_beta' }] }
  })
  await prisma.tenant.deleteMany({
    where: { OR: [{ id: 'tenant_alpha' }, { id: 'tenant_beta' }] }
  })

  // 2. Universo Alpha
  const tenantA = await prisma.tenant.create({
    data: { id: 'tenant_alpha', slug: 'empresa-alpha', name: 'Empresa Alpha' },
  })
  const companyA = await prisma.company.create({
    data: { id: 'company_alpha', name: 'Alpha HQ', tenant_id: tenantA.id },
  })

  // 3. Universo Beta
  const tenantB = await prisma.tenant.create({
    data: { id: 'tenant_beta', slug: 'empresa-beta', name: 'Empresa Beta' },
  })
  const companyB = await prisma.company.create({
    data: { id: 'company_beta', name: 'Beta HQ', tenant_id: tenantB.id },
  })

  // 4. Inserção do Super Segredo da Beta
  // É testado via RLS (Usando nossa infra de Processo/CompanyProduct simulados)
  const secretDoc = await withTenantContext(
    { tenantId: tenantB.id, companyId: companyB.id },
    (tx) =>
      tx.companyProduct.create({
        data: {
          tenant_id: tenantB.id,
          company_id: companyB.id,
          product_key: 'DUIMP_SECRET_007',
          is_active: true
        },
      })
  )

  return { tenantA, tenantB, companyA, companyB, secretDoc }
}

export async function cleanupTenants(fixtures: Awaited<ReturnType<typeof createIsolatedTenants>>) {
  const { tenantA, tenantB } = fixtures;
  await prisma.tenant.deleteMany({
    where: { OR: [{ id: tenantA.id }, { id: tenantB.id }] }
  })
}
