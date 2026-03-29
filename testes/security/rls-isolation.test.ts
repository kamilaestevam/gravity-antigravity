import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { withTenantContext } from '../../servicos-global/tenant/src/lib/prisma-tenant'
import { createIsolatedTenants, cleanupTenants } from './fixtures/tenants'
import { PrismaClient } from '../../../configurador/generated/index.js'

const prisma = new PrismaClient()

describe('🔴 Segurança Tier 1 — RLS Isolamento de Banco Multitenant', () => {

  let fixtures: Awaited<ReturnType<typeof createIsolatedTenants>>

  beforeAll(async () => {
    fixtures = await createIsolatedTenants()
  })

  afterAll(async () => {
    await cleanupTenants(fixtures)
  })

  it('ATAQUE NÍVEL 1: O Invasor Alpha não pode roubar dados do Vizinho Beta mesmo enviando um ID Válido', async () => {
    const { tenantA, companyA, secretDoc } = fixtures

    const resultado = await withTenantContext(
      { tenantId: tenantA.id, companyId: companyA.id },
      (tx) => tx.companyProduct.findUnique({
          where: { id: secretDoc.id }, // Ataque Direto por Enumeration/URL
      })
    )

    // A parede do banco rejeitou o hacker, devolvendo falso negativo.
    expect(resultado).toBeNull()
  })

  it('ATAQUE NÍVEL 2: O Invasor Alpha tentar buscar uma Lista GetAll não traz lixo relacional do Vizinho Beta', async () => {
    const { tenantA, companyA, secretDoc } = fixtures

    const resultados = await withTenantContext(
      { tenantId: tenantA.id, companyId: companyA.id },
      (tx) => tx.companyProduct.findMany() // Array Dump Sem WHERE
    )

    const idsVazados = resultados.map((d) => d.id)
    expect(idsVazados).not.toContain(secretDoc.id)
  })

  it('ATAQUE NÍVEL 3: Contêineres Isolados de Contagem Agregada (COUNT não dedura registros alheios)', async () => {
    const { tenantA, companyA } = fixtures

    const contagemMestra = await withTenantContext(
      { tenantId: tenantA.id, companyId: companyA.id },
      (tx) => tx.companyProduct.count()
    )

    // O Universo "A" não inseriu nenhum registro nessa tabela de teste. Portanto = 0
    expect(contagemMestra).toBe(0)
  })

  it('CHEQUE DE SEGURANÇA: O Invasor fracassou, mas o Vizinho Legítimo (Beta) consegue ver seus PRÓPRIOS dados', async () => {
    const { tenantB, companyB, secretDoc } = fixtures

    const resultadoLegitimo = await withTenantContext(
      { tenantId: tenantB.id, companyId: companyB.id },
      (tx) => tx.companyProduct.findUnique({
          where: { id: secretDoc.id },
      })
    )

    // Garantimos que o RLS está bloqueando Alpha, mas permitindo o dono ver a pasta.
    expect(resultadoLegitimo).not.toBeNull()
    expect(resultadoLegitimo?.id).toBe(secretDoc.id)
  })
})
