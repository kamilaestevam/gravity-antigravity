// server/services/organizacaoService.ts
// Lógica de negócio para criação e gestão de organizações e workspaces
// Contrato de retorno em DDD puro (PT-BR) — sem mapeamento para chaves legadas em inglês.

import { createId } from '@paralleldrive/cuid2'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/appError.js'
import { logger } from '../lib/logger.js'
import { criarEmpresa, compensarEmpresa } from './cadastrosClient.js'

const log = logger.child({ module: 'organizacao-service' })

interface CreateOrganizacaoInput {
  nome_organizacao: string
  subdominio_organizacao: string
  clerkUserId: string
  owner: { email: string; name: string }
  cnpj_organizacao?: string
  pais?: string
  correlationId: string
}

interface CreateWorkspaceInput {
  nome_workspace: string
  subdominio_workspace?: string
  cnpj_workspace?: string
}

interface UpdateWorkspaceInput {
  nome_workspace?: string
  subdominio_workspace?: string
  cnpj_workspace?: string
  status_workspace?: 'ATIVO' | 'INATIVO'
}

export const organizacaoService = {
  /**
   * Cria uma nova organização + usuário owner via saga Cadastros-primeiro.
   * Chamado no onboarding após checkout do provider de billing.
   *
   * Fluxo (saga com compensação):
   *   1. Pré-checks de unicidade (slug, clerk_user_id) — fail fast antes de tocar rede.
   *   2. Gera Organizacao.id_organizacao com cuid2 — precisamos do id ANTES de chamar
   *      Cadastros (Empresa.id_organizacao é REQUIRED no banco de Cadastros).
   *   3. POST /empresas em Cadastros → recebe SUID.
   *   4. Abre transação local ($transaction) e cria Organizacao (com id pré-gerado e
   *      suid_empresa preenchido) + Usuario + Assinatura + Workspace inicial.
   *   5. Se transação local falhar: chama compensarEmpresa(suid) para hard-delete a
   *      Empresa órfã em Cadastros. Falha dupla → log estruturado de dead-letter.
   */
  async createOrganizacao(input: CreateOrganizacaoInput) {
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
      where: { id_clerk_usuario: clerkUserId },
    })
    if (existingUser) {
      throw new AppError('Usuário já possui uma organização', 409, 'CONFLICT')
    }

    // 2. Gera id_organizacao para poder registrar id_organizacao em Cadastros
    const novoIdOrganizacao = createId()
    const cadastrosCtx = {
      id_organizacao: novoIdOrganizacao,
      correlation_id: correlationId,
    }

    log.info('saga.onboarding.start', {
      correlation_id: correlationId,
      id_organizacao: novoIdOrganizacao,
      subdominio_organizacao,
      pais,
    })

    // 3. Chamada inter-serviço (FORA do $transaction — não segurar conexão durante HTTP)
    const empresaCadastros = await criarEmpresa(
      {
        id_organizacao: novoIdOrganizacao,
        nome_empresa: nome_organizacao,
        cnpj_empresa: pais === 'BR' ? cnpj_organizacao ?? null : null,
        pais_empresa: pais,
        pode_ser_importador_empresa: true,
        pode_ser_exportador_empresa: false,
        pode_ser_fabricante_empresa: false,
        pode_ser_agente_empresa: false,
        pode_ser_despachante_empresa: false,
        pode_ser_armador_empresa: false,
        ativo_empresa: true,
      },
      cadastrosCtx,
    )
    const suid = empresaCadastros.suid_empresa

    // 4. Transação local — se falhar, compensamos a Empresa em Cadastros
    try {
      const organizacao = await prisma.$transaction(async (tx) => {
        const novaOrganizacao = await tx.organizacao.create({
          data: {
            id_organizacao: novoIdOrganizacao,
            nome_organizacao,
            subdominio_organizacao,
            status_organizacao: 'CONFIGURACAO_PENDENTE',
            suid_empresa_organizacao: suid,
            cnpj_organizacao: pais === 'BR' ? cnpj_organizacao ?? null : null,
          },
        })

        await tx.usuario.create({
          data: {
            id_organizacao: novaOrganizacao.id_organizacao,
            id_clerk_usuario: clerkUserId,
            email_usuario: owner.email,
            nome_usuario:  owner.name,
            tipo_usuario: 'MASTER',
          },
        })

        const TRIAL_DAYS = Number(process.env.TRIAL_DAYS ?? 14)
        await tx.produtoGravityAssinatura.create({
          data: {
            id_organizacao: novaOrganizacao.id_organizacao,
            status_assinatura_produto_gravity: 'EM_TESTE',
            data_fim_teste_assinatura_produto_gravity: new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000),
          },
        })

        // Workspace inicial — distinto da Empresa SUID em Cadastros.
        await tx.workspace.create({
          data: {
            id_organizacao: novaOrganizacao.id_organizacao,
            nome_workspace: nome_organizacao,
            status_workspace: 'ATIVO',
          },
        })

        return novaOrganizacao
      })

      log.info('saga.onboarding.success', {
        correlation_id: correlationId,
        id_organizacao: novoIdOrganizacao,
        suid_empresa_organizacao: suid,
      })
      return organizacao
    } catch (err) {
      const causa = err instanceof Error ? err.message : String(err)
      log.error('saga.onboarding.rollback', {
        correlation_id: correlationId,
        id_organizacao: novoIdOrganizacao,
        suid_empresa_organizacao: suid,
        causa,
      })
      // Compensação — não lança mesmo em falha (dead-letter no próprio método)
      await compensarEmpresa(suid, cadastrosCtx, causa)
      throw err
    }
  },

  /**
   * Busca organização por id. Inclui assinatura mais recente e contagens.
   * Retorno em DDD puro: relations Prisma `*_organizacao` mapeadas para nomes PT-BR
   * no DTO consumido pelas rotas (chaves: `assinaturas`, `_count.usuarios`,
   * `_count.workspaces`).
   */
  async getOrganizacaoById(id_organizacao: string) {
    const organizacao = await prisma.organizacao.findUnique({
      where: { id_organizacao },
      include: {
        subscriptions_organizacao: {
          orderBy: { data_criacao_assinatura_produto_gravity: 'desc' },
          take: 1,
          select: {
            status_assinatura_produto_gravity: true,
            data_fim_teste_assinatura_produto_gravity: true,
          },
        },
        _count: { select: { users_organizacao: true, companies_organizacao: true } },
      },
    })
    if (!organizacao) return null
    // Renomeia relations Prisma (em inglês — schema intocável, Mand. 02) para DDD PT-BR
    const { subscriptions_organizacao, _count, ...rest } = organizacao
    return {
      ...rest,
      assinaturas: subscriptions_organizacao,
      _count: {
        usuarios: _count.users_organizacao,
        workspaces: _count.companies_organizacao,
      },
    }
  },

  /**
   * Atualiza dados cadastrais da organização.
   */
  async updateOrganizacao(id_organizacao: string, data: {
    nome_organizacao?: string
    cnpj_organizacao?: string
    estado_organizacao?: string
    cidade_organizacao?: string
    segmento_organizacao?: string
    tipo_organizacao?: string
  }) {
    return prisma.organizacao.update({
      where: { id_organizacao },
      data,
    })
  },

  /**
   * Lista workspaces da organização. Retorno em DDD puro.
   * Renomeia a relation Prisma `memberships` (schema-locked, Mand. 02) para
   * `vinculos_workspace` no DTO e expõe `quantidade_usuarios_workspace`
   * derivado para uso direto na UI.
   */
  async getWorkspaces(id_organizacao: string) {
    const workspaces = await prisma.workspace.findMany({
      where: { id_organizacao },
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
    return workspaces.map(({ _count, ...rest }) => ({
      ...rest,
      quantidade_usuarios_workspace: _count.memberships,
      _count: { vinculos_workspace: _count.memberships },
    }))
  },

  /**
   * Cria workspace na organização.
   */
  async createWorkspace(id_organizacao: string, data: CreateWorkspaceInput) {
    const workspace = await prisma.workspace.create({
      data: {
        id_organizacao,
        nome_workspace: data.nome_workspace,
        subdominio_workspace: data.subdominio_workspace,
        cnpj_workspace: data.cnpj_workspace,
        status_workspace: 'ATIVO',
      },
      select: {
        id_workspace: true,
        id_organizacao: true,
        nome_workspace: true,
        subdominio_workspace: true,
        cnpj_workspace: true,
        status_workspace: true,
        data_criacao_workspace: true,
      },
    })
    return {
      ...workspace,
      quantidade_usuarios_workspace: 0,
      _count: { vinculos_workspace: 0 },
    }
  },

  /**
   * Atualiza workspace (verifica que pertence à organização).
   */
  async updateWorkspace(id_organizacao: string, id_workspace: string, data: UpdateWorkspaceInput) {
    const workspace = await prisma.workspace.findFirst({
      where: { id_workspace, id_organizacao },
    })
    if (!workspace) {
      throw new AppError('Workspace não encontrado', 404, 'NOT_FOUND')
    }
    const updated = await prisma.workspace.update({
      where: { id_workspace },
      data,
      select: {
        id_workspace: true,
        id_organizacao: true,
        nome_workspace: true,
        subdominio_workspace: true,
        cnpj_workspace: true,
        status_workspace: true,
        data_criacao_workspace: true,
        _count: { select: { memberships: true } },
      },
    })
    const { _count, ...rest } = updated
    return {
      ...rest,
      quantidade_usuarios_workspace: _count.memberships,
      _count: { vinculos_workspace: _count.memberships },
    }
  },

  /**
   * Deleta workspace (verifica que pertence à organização).
   */
  async deleteWorkspace(id_organizacao: string, id_workspace: string) {
    const workspace = await prisma.workspace.findFirst({
      where: { id_workspace, id_organizacao },
    })
    if (!workspace) {
      throw new AppError('Workspace não encontrado', 404, 'NOT_FOUND')
    }
    await prisma.workspace.delete({ where: { id_workspace } })
  },
}
