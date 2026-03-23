// server/services/tenantService.ts
// Lógica de negócio para criação e gestão de tenants e empresas filhas

import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/appError.js'


interface CreateTenantInput {
  name: string
  slug: string
  clerkUserId: string
  owner: { email: string; name: string }
}

interface CreateCompanyInput {
  name: string
  subdomain?: string
  cnpj?: string
}

export const tenantService = {
  /**
   * Cria um novo tenant + usuário owner
   * Chamado no onboarding após checkout do Stripe
   */
  async createTenant(input: CreateTenantInput) {
    const { name, slug, clerkUserId, owner } = input

    // Verifica se slug já existe
    const existingSlug = await prisma.tenant.findUnique({ where: { slug } })
    if (existingSlug) {
      throw new AppError('Este slug já está em uso', 409, 'CONFLICT')
    }

    // Verifica se o clerk_user_id já tem tenant
    const existingUser = await prisma.user.findFirst({
      where: { clerk_user_id: clerkUserId },
    })
    if (existingUser) {
      throw new AppError('Usuário já possui um tenant', 409, 'CONFLICT')
    }

    // Cria tenant + owner em transação
    const tenant = await prisma.$transaction(async (tx: typeof prisma) => {
      const newTenant = await tx.tenant.create({
        data: {
          name,
          slug,
          status: 'PENDING_SETUP',
        },
      })

      await tx.user.create({
        data: {
          tenant_id: newTenant.id,
          clerk_user_id: clerkUserId,
          email: owner.email,
          name: owner.name,
          role: 'OWNER',
        },
      })

      // Cria assinatura em trial
      await tx.subscription.create({
        data: {
          tenant_id: newTenant.id,
          plan: 'STARTER',
          status: 'TRIALING',
          trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 dias
        },
      })

      return newTenant
    })

    return tenant
  },

  /**
   * Busca tenant por ID
   */
  async getTenantById(tenantId: string) {
    return prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        subscriptions: {
          orderBy: { created_at: 'desc' },
          take: 1,
          select: { plan: true, status: true, trial_ends_at: true },
        },
        _count: { select: { users: true, companies: true } },
      },
    })
  },

  /**
   * Lista empresas filhas do tenant
   */
  async getCompanies(tenantId: string) {
    return prisma.company.findMany({
      where: { tenant_id: tenantId },
      select: {
        id: true,
        name: true,
        subdomain: true,
        cnpj: true,
        status: true,
        created_at: true,
        _count: { select: { memberships: true } },
      },
      orderBy: { created_at: 'desc' },
    })
  },

  /**
   * Cria empresa filha no tenant
   */
  async createCompany(tenantId: string, data: CreateCompanyInput) {
    // Verifica limite de empresas filhas por plano
    const count = await prisma.company.count({ where: { tenant_id: tenantId } })
    const subscription = await prisma.subscription.findFirst({
      where: { tenant_id: tenantId },
      orderBy: { created_at: 'desc' },
    })

    const limits = { STARTER: 2, PROFESSIONAL: 20, ENTERPRISE: 50 }
    const plan = subscription?.plan ?? 'STARTER'
    const limit = limits[plan as keyof typeof limits] ?? 2

    if (count >= limit) {
      throw new AppError(
        `Seu plano ${plan} permite no máximo ${limit} empresas filhas`,
        403,
        'PLAN_LIMIT_EXCEEDED'
      )
    }

    return prisma.company.create({
      data: {
        tenant_id: tenantId,
        name: data.name,
        subdomain: data.subdomain,
        cnpj: data.cnpj,
        status: 'ACTIVE',
      },
    })
  },
}
