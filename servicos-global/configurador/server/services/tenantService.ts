// server/services/tenantService.ts
// Lógica de negócio para criação e gestão de tenants e empresas filhas

import { createId } from '@paralleldrive/cuid2'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/appError.js'
import { logger } from '../lib/logger.js'
import { criarEmpresa, compensarEmpresa } from './cadastrosClient.js'

const log = logger.child({ module: 'tenant-service' })

interface CreateTenantInput {
  nome_organizacao: string
  subdominio_organizacao: string
  clerkUserId: string
  owner: { email: string; name: string }
  cnpj_organizacao?: string
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
      nome_organizacao,
      subdominio_organizacao,
      clerkUserId,
      owner,
      cnpj_organizacao,
      pais = 'BR',
      correlationId,
    } = input

    // 1. Pré-checks fora da transação (fail fast)
    const existingSlug = await prisma.organizacao.findUnique({ where: { subdominio_organizacao } })
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
      subdominio_organizacao,
      pais,
    })

    // 3. Chamada inter-serviço (FORA do $transaction — não segurar conexão durante HTTP)
    const empresaCadastros = await criarEmpresa(
      {
        id_organizacao: newOrgId,
        nome_empresa: nome_organizacao,
        cnpj: pais === 'BR' ? cnpj_organizacao ?? null : null,
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
            id_organizacao: newOrgId,
            nome_organizacao,
            subdominio_organizacao,
            status_organizacao: 'CONFIGURACAO_PENDENTE',
            suid_empresa_organizacao: suid,
            cnpj_organizacao: pais === 'BR' ? cnpj_organizacao ?? null : null,
          },
        })

        await tx.usuario.create({
          data: {
            id_organizacao_usuario: newTenant.id_organizacao,
            clerk_user_id: clerkUserId,
            email_usuario: owner.email,
            nome_usuario:  owner.name,
            tipo_usuario: 'MASTER',
          },
        })

        const TRIAL_DAYS = Number(process.env.TRIAL_DAYS ?? 14)
        await tx.assinaturaProdutoGravity.create({
          data: {
            tenant_id: newTenant.id_organizacao,
            status: 'EM_TESTE',
            trial_ends_at: new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000),
          },
        })

        // Empresa-local (child workspace legado do Configurador — distinto da Empresa SUID em Cadastros).
        await tx.empresa.create({
          data: {
            id_organizacao_workspace: newTenant.id_organizacao,
            nome_workspace: nome_organizacao,
            status_workspace: 'ATIVO',
          },
        })

        return newTenant
      })

      log.info('saga.onboarding.success', {
        correlation_id: correlationId,
        id_organizacao: newOrgId,
        suid_empresa_organizacao: suid,
      })
      return tenant
    } catch (err) {
      const causa = err instanceof Error ? err.message : String(err)
      log.error('saga.onboarding.rollback', {
        correlation_id: correlationId,
        id_organizacao: newOrgId,
        suid_empresa_organizacao: suid,
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
      where: { id_organizacao: tenantId },
      include: {
        subscriptions_organizacao: {
          orderBy: { created_at: 'desc' },
          take: 1,
          select: { status: true, trial_ends_at: true },
        },
        _count: { select: { users_organizacao: true, companies_organizacao: true } },
      },
    })
  },

  /**
   * Atualiza dados cadastrais do tenant
   */
  async updateTenant(tenantId: string, data: {
    nome_organizacao?: string
    cnpj_organizacao?: string
    estado_organizacao?: string
    cidade_organizacao?: string
    segmento_organizacao?: string
    tipo_empresa_organizacao?: string
  }) {
    return prisma.organizacao.update({
      where: { id_organizacao: tenantId },
      data,
    })
  },

  /**
   * Lista empresas filhas do tenant
   */
  async getCompanies(tenantId: string) {
    const empresas = await prisma.empresa.findMany({
      where: { id_organizacao_workspace: tenantId },
      select: {
        id_workspace: true,
        nome_workspace: true,
        subdominio_workspace: true,
        cnpj_workspace: true,
        status_workspace: true,
        data_criacao_workspace: true,
        _count: { select: { memberships: true } },
      },
      orderBy: { data_criacao_workspace: 'desc' },
    })
    // DTO: nomes Prisma `*_workspace` → chaves legadas do contrato (`id`, `name`, etc.)
    return empresas.map(({ id_workspace, nome_workspace, subdominio_workspace, cnpj_workspace, status_workspace, data_criacao_workspace, ...e }) => ({
      ...e,
      id: id_workspace,
      name: nome_workspace,
      subdomain: subdominio_workspace,
      cnpj: cnpj_workspace,
      status: status_workspace,
      created_at: data_criacao_workspace,
    }))
  },

  /**
   * Cria empresa filha no tenant
   */
  async createCompany(tenantId: string, data: CreateCompanyInput) {
    const created = await prisma.empresa.create({
      data: {
        id_organizacao_workspace: tenantId,
        nome_workspace: data.name,
        subdominio_workspace: data.subdomain,
        cnpj_workspace: data.cnpj,
        status_workspace: 'ATIVO',
      },
    })
    // DTO: mapeia `*_workspace` → contrato legado
    const { id_workspace, nome_workspace, subdominio_workspace, cnpj_workspace, status_workspace, data_criacao_workspace, id_organizacao_workspace, ...c } = created
    return {
      ...c,
      id: id_workspace,
      name: nome_workspace,
      subdomain: subdominio_workspace,
      cnpj: cnpj_workspace,
      status: status_workspace,
      created_at: data_criacao_workspace,
      tenant_id: id_organizacao_workspace,
    }
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
      where: { id_workspace: companyId, id_organizacao_workspace: tenantId },
    })
    if (!company) {
      throw new AppError('Empresa não encontrada', 404, 'NOT_FOUND')
    }
    // Mapeia chaves do contrato externo (name/subdomain/cnpj/status) → Prisma (`*_workspace`)
    const updated = await prisma.empresa.update({
      where: { id_workspace: companyId },
      data: {
        ...(data.name !== undefined && { nome_workspace: data.name }),
        ...(data.subdomain !== undefined && { subdominio_workspace: data.subdomain }),
        ...(data.cnpj !== undefined && { cnpj_workspace: data.cnpj }),
        ...(data.status !== undefined && { status_workspace: data.status }),
      },
    })
    const { id_workspace, nome_workspace, subdominio_workspace, cnpj_workspace, status_workspace, data_criacao_workspace, id_organizacao_workspace, ...c } = updated
    return {
      ...c,
      id: id_workspace,
      name: nome_workspace,
      subdomain: subdominio_workspace,
      cnpj: cnpj_workspace,
      status: status_workspace,
      created_at: data_criacao_workspace,
      tenant_id: id_organizacao_workspace,
    }
  },

  /**
   * Deleta empresa filha (verifica que pertence ao tenant)
   */
  async deleteCompany(tenantId: string, companyId: string) {
    const company = await prisma.empresa.findFirst({
      where: { id_workspace: companyId, id_organizacao_workspace: tenantId },
    })
    if (!company) {
      throw new AppError('Empresa não encontrada', 404, 'NOT_FOUND')
    }
    await prisma.empresa.delete({ where: { id_workspace: companyId } })
  },
}
