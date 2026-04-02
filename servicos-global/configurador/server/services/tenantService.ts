// server/services/tenantService.ts
// Lógica de negócio para criação e gestão de tenants e empresas filhas

import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/appError.js'
import { clerkClient } from '../lib/clerk.js'


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

    // Wrap all checks + creation in a serializable transaction to prevent race conditions
    const tenant = await prisma.$transaction(async (tx: typeof prisma) => {
      // Verifica se slug já existe
      const existingSlug = await tx.tenant.findUnique({ where: { slug } })
      if (existingSlug) {
        throw new AppError('Este slug já está em uso', 409, 'CONFLICT')
      }

      // Verifica se o clerk_user_id já tem tenant
      const existingUser = await tx.user.findFirst({
        where: { clerk_user_id: clerkUserId },
      })
      if (existingUser) {
        throw new AppError('Usuário já possui um tenant', 409, 'CONFLICT')
      }

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
          role: 'MASTER',
        },
      })

      // Cria assinatura em trial
      const TRIAL_DAYS = Number(process.env.TRIAL_DAYS ?? 14)
      await tx.subscription.create({
        data: {
          tenant_id: newTenant.id,
          status: 'TRIALING',
          trial_ends_at: new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000),
        },
      })

      // Cria primeira company automaticamente com o nome da organização
      await tx.company.create({
        data: {
          tenant_id: newTenant.id,
          name,
          status: 'ACTIVE',
        },
      })

      // Sincroniza role no Clerk para o frontend ler corretamente
      await clerkClient.users.updateUserMetadata(clerkUserId, {
        publicMetadata: { role: 'MASTER', tenantId: newTenant.id },
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
          select: { status: true, trial_ends_at: true },
        },
        _count: { select: { users: true, companies: true } },
      },
    })
  },

  /**
   * Atualiza dados cadastrais do tenant
   */
  async updateTenant(tenantId: string, data: {
    name?: string
    cnpj?: string
    state?: string
    city?: string
    segment?: string
    tipo_empresa?: string
  }) {
    return prisma.tenant.update({
      where: { id: tenantId },
      data,
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

  /**
   * Atualiza empresa filha (verifica que pertence ao tenant)
   */
  async updateCompany(tenantId: string, companyId: string, data: {
    name?: string
    subdomain?: string
    cnpj?: string
    status?: 'ACTIVE' | 'INACTIVE'
  }) {
    const company = await prisma.company.findFirst({
      where: { id: companyId, tenant_id: tenantId },
    })
    if (!company) {
      throw new AppError('Empresa não encontrada', 404, 'NOT_FOUND')
    }
    return prisma.company.update({
      where: { id: companyId },
      data,
    })
  },

  /**
   * Deleta empresa filha (verifica que pertence ao tenant)
   */
  async deleteCompany(tenantId: string, companyId: string) {
    const company = await prisma.company.findFirst({
      where: { id: companyId, tenant_id: tenantId },
    })
    if (!company) {
      throw new AppError('Empresa não encontrada', 404, 'NOT_FOUND')
    }
    await prisma.company.delete({ where: { id: companyId } })
  },
}
