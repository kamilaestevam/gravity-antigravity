// server/services/tenantService.ts
// Lógica de negócio para criação e gestão de tenants e empresas filhas

import { createId } from '@paralleldrive/cuid2'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/appError.js'
import { logger } from '../lib/logger.js'
import { criarEmpresa, compensarEmpresa } from './cadastrosClient.js'

const log = logger.child({ module: 'tenant-service' })

interface CreateTenantInput {
  name: string
  slug: string
  clerkUserId: string
  owner: { email: string; name: string }
  cnpj?: string
  pais?: string
  correlationId: string
}

interface CreateCompanyInput {
  name: string
  subdomain?: string
  cnpj?: string
}

export const tenantService = {
  /**
   * Cria um novo tenant + usuário owner via saga Cadastros-primeiro.
   * Chamado no onboarding após checkout do Stripe.
   *
   * Fluxo (saga com compensação):
   *   1. Pré-checks de unicidade (slug, clerk_user_id) — fail fast antes de tocar rede.
   *   2. Gera Organizacao.id com cuid2 — precisamos do id ANTES de chamar Cadastros
   *      (Empresa.id_organizacao é REQUIRED no banco de Cadastros).
   *   3. POST /empresas em Cadastros → recebe SUID.
   *   4. Abre transação local ($transaction) e cria Organizacao (com id pré-gerado
   *      e suid_empresa preenchido) + Usuario + Assinatura + Empresa-local.
   *   5. Se transação local falhar: chama compensarEmpresa(suid) para hard-delete
   *      a Empresa órfã em Cadastros. Falha dupla → log estruturado de dead-letter.
   *
   * Cadastros recebe:
   *   - nome_empresa = name do tenant
   *   - cnpj = input.cnpj (somente se pais=BR, validado antes via Zod)
   *   - pais = input.pais (default 'BR', já aplicado pelo Zod)
   *   - pode_ser_importador = true (default pragmático — usuário configura depois)
   *   - demais flags = false
   */
  async createTenant(input: CreateTenantInput) {
    const {
      name,
      slug,
      clerkUserId,
      owner,
      cnpj,
      pais = 'BR',
      correlationId,
    } = input

    // 1. Pré-checks fora da transação (fail fast)
    const existingSlug = await prisma.organizacao.findUnique({ where: { slug } })
    if (existingSlug) {
      throw new AppError('Este slug já está em uso', 409, 'CONFLICT')
    }
    const existingUser = await prisma.usuario.findFirst({
      where: { clerk_user_id: clerkUserId },
    })
    if (existingUser) {
      throw new AppError('Usuário já possui um tenant', 409, 'CONFLICT')
    }

    // 2. Gera id da Organizacao para poder registrar id_organizacao em Cadastros
    const newOrgId = createId()
    const cadastrosCtx = {
      id_organizacao: newOrgId,
      correlation_id: correlationId,
    }

    log.info('saga.onboarding.start', {
      correlation_id: correlationId,
      id_organizacao: newOrgId,
      slug,
      pais,
    })

    // 3. Chamada inter-serviço (FORA do $transaction — não segurar conexão durante HTTP)
    const empresaCadastros = await criarEmpresa(
      {
        id_organizacao: newOrgId,
        nome_empresa: name,
        cnpj: pais === 'BR' ? cnpj ?? null : null,
        pais,
        pode_ser_importador: true,
        pode_ser_exportador: false,
        pode_ser_fabricante: false,
        pode_ser_agente: false,
        pode_ser_despachante: false,
        pode_ser_armador: false,
        ativo: true,
      },
      cadastrosCtx,
    )
    const suid = empresaCadastros.suid

    // 4. Transação local — se falhar, compensamos a Empresa em Cadastros
    try {
      const tenant = await prisma.$transaction(async (tx: typeof prisma) => {
        const newTenant = await tx.organizacao.create({
          data: {
            id: newOrgId,
            name,
            slug,
            status: 'CONFIGURACAO_PENDENTE',
            suid_empresa: suid,
            cnpj: pais === 'BR' ? cnpj ?? null : null,
          },
        })

        await tx.usuario.create({
          data: {
            tenant_id: newTenant.id,
            clerk_user_id: clerkUserId,
            email: owner.email,
            name: owner.name,
            role: 'MASTER',
          },
        })

        const TRIAL_DAYS = Number(process.env.TRIAL_DAYS ?? 14)
        await tx.assinaturaProdutoGravity.create({
          data: {
            tenant_id: newTenant.id,
            status: 'EM_TESTE',
            trial_ends_at: new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000),
          },
        })

        // Empresa-local (child workspace legado do Configurador — distinto da Empresa SUID em Cadastros).
        await tx.empresa.create({
          data: {
            tenant_id: newTenant.id,
            name,
            status: 'ATIVO',
          },
        })

        return newTenant
      })

      log.info('saga.onboarding.success', {
        correlation_id: correlationId,
        id_organizacao: newOrgId,
        suid_empresa: suid,
      })
      return tenant
    } catch (err) {
      const causa = err instanceof Error ? err.message : String(err)
      log.error('saga.onboarding.rollback', {
        correlation_id: correlationId,
        id_organizacao: newOrgId,
        suid_empresa: suid,
        causa,
      })
      // Compensação — não lança mesmo em falha (dead-letter no próprio método)
      await compensarEmpresa(suid, cadastrosCtx, causa)
      throw err
    }
  },

  /**
   * Busca tenant por ID
   */
  async getTenantById(tenantId: string) {
    return prisma.organizacao.findUnique({
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
    return prisma.organizacao.update({
      where: { id: tenantId },
      data,
    })
  },

  /**
   * Lista empresas filhas do tenant
   */
  async getCompanies(tenantId: string) {
    return prisma.empresa.findMany({
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
    return prisma.empresa.create({
      data: {
        tenant_id: tenantId,
        name: data.name,
        subdomain: data.subdomain,
        cnpj: data.cnpj,
        status: 'ATIVO',
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
    status?: 'ATIVO' | 'INATIVO'
  }) {
    const company = await prisma.empresa.findFirst({
      where: { id: companyId, tenant_id: tenantId },
    })
    if (!company) {
      throw new AppError('Empresa não encontrada', 404, 'NOT_FOUND')
    }
    return prisma.empresa.update({
      where: { id: companyId },
      data,
    })
  },

  /**
   * Deleta empresa filha (verifica que pertence ao tenant)
   */
  async deleteCompany(tenantId: string, companyId: string) {
    const company = await prisma.empresa.findFirst({
      where: { id: companyId, tenant_id: tenantId },
    })
    if (!company) {
      throw new AppError('Empresa não encontrada', 404, 'NOT_FOUND')
    }
    await prisma.empresa.delete({ where: { id: companyId } })
  },
}
