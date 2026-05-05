// server/services/organizacao-service.ts
// Lógica de negócio para criação e gestão de organizações e workspaces
// Contrato de retorno em DDD puro (PT-BR) — sem mapeamento para chaves legadas em inglês.

import { createId } from '@paralleldrive/cuid2'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/appError.js'
import { logger } from '../lib/logger.js'
import { criarEmpresa, compensarEmpresa } from './cadastros-client.js'

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

// ─── Geração de subdomínio cross-tabela ─────────────────────────────────────
// Política de unicidade global (decisão 2026-05-03): subdomínio é único across
// `organizacao.subdominio_organizacao` E `workspace.subdominio_workspace`.
// O usuário não escolhe — o sistema gera a partir do nome via slugify e
// auto-suffix `-2`, `-3`, ... até atingir um candidato disponível em ambas as
// tabelas. Teto de 100 tentativas para evitar loop infinito em prefixos
// extremamente populares.

const TETO_TENTATIVAS_SUBDOMINIO = 100

function slugifySubdominio(v: string): string {
  return (v || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

/**
 * Gera próximo subdomínio disponível a partir de uma base.
 * Verifica colisão em AMBAS as tabelas (organizacao + workspace) — unicidade global.
 *
 * Race-safe: o create real captura P2002 e retenta com este helper. O probe
 * inicial é otimização (90% dos casos não há colisão); a autoridade final é o
 * `@unique` do Prisma.
 */
async function proximoSubdominioDisponivel(base: string): Promise<string> {
  const slugBase = slugifySubdominio(base)
  if (!slugBase) {
    throw new AppError('Nome inválido para gerar subdomínio', 400, 'VALIDATION_ERROR')
  }

  for (let i = 0; i < TETO_TENTATIVAS_SUBDOMINIO; i++) {
    const candidato = i === 0 ? slugBase : `${slugBase}-${i + 1}`
    const [colideOrg, colideWs] = await Promise.all([
      prisma.organizacao.findUnique({ where: { subdominio_organizacao: candidato }, select: { id_organizacao: true } }),
      prisma.workspace.findUnique({ where: { subdominio_workspace: candidato }, select: { id_workspace: true } }),
    ])
    if (!colideOrg && !colideWs) return candidato
  }

  throw new AppError('Não foi possível gerar subdomínio único — escolha outro nome', 409, 'CONFLICT')
}

export { proximoSubdominioDisponivel, slugifySubdominio }

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
      subdominio_organizacao: subdominio_solicitado_raw,
      clerkUserId,
      owner,
      cnpj_organizacao,
      pais = 'BR',
      correlationId,
    } = input

    // 1. Pré-checks fora da transação (fail fast)
    const existingUser = await prisma.usuario.findFirst({
      where: { id_clerk_usuario: clerkUserId },
    })
    if (existingUser) {
      throw new AppError('Usuário já possui uma organização', 409, 'CONFLICT')
    }

    // 1.b Resolve subdomínio via política central (cross-tabela + auto-suffix).
    // Usa `subdominio_solicitado_raw` (vindo do frontend após slugify) como base;
    // se não vier ou vier vazio, deriva do `nome_organizacao`.
    const baseSubdominio = subdominio_solicitado_raw?.trim() || nome_organizacao
    const subdominio_solicitado = slugifySubdominio(baseSubdominio)
    const subdominio_organizacao = await proximoSubdominioDisponivel(baseSubdominio)
    const subdominio_ajustado = subdominio_organizacao !== subdominio_solicitado

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
      subdominio_solicitado,
      subdominio_ajustado,
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
        pode_ser_cia_aerea_empresa: false,
        pode_ser_transportadora_rodoviaria_nacional_empresa: false,
        pode_ser_transportadora_rodoviaria_internacional_empresa: false,
        pode_ser_armazem_alfandegado_empresa: false,
        pode_ser_armazem_nacional_empresa: false,
        pode_ser_banco_empresa: false,
        pode_ser_seguradora_internacional_empresa: false,
        pode_ser_seguradora_corretora_cambio_empresa: false,
        ativo_empresa: true,
      },
      cadastrosCtx,
    )
    const suid = empresaCadastros.suid_empresa

    // 4. Transação local — se falhar, compensamos a Empresa em Cadastros.
    // Workspace inicial recebe seu próprio subdomínio cross-tabela único (probe
    // separado para evitar colisão com o subdomínio da própria organização).
    const subdominio_workspace_inicial = await proximoSubdominioDisponivel(nome_organizacao)
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

        // Organização nasce SEM assinatura guarda-chuva.
        // Cada produto contratado cria sua própria linha em assinatura_produto_gravity
        // via /workspace/assinaturas (rota assinatura-produto-gravity.ts), com
        // FK obrigatória id_produto_gravity (migration manual 2026-05-04).
        // EM_TESTE permanece como estado válido nesse fluxo, atribuído por admin
        // quando alguém testa um produto antes de fechar contrato.

        // Workspace inicial — distinto da Empresa SUID em Cadastros.
        await tx.workspace.create({
          data: {
            id_organizacao: novaOrganizacao.id_organizacao,
            nome_workspace: nome_organizacao,
            subdominio_workspace: subdominio_workspace_inicial,
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
      // Anota metadados de subdomínio para a rota expor ao frontend.
      return Object.assign(organizacao, {
        subdominio_solicitado,
        subdominio_ajustado,
      })
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
   * Subdomínio gerado pelo sistema (cross-tabela único). Usa o nome do
   * workspace como base; auto-suffix se houver colisão. Race-safe via captura
   * de P2002 no `@unique`.
   */
  async createWorkspace(id_organizacao: string, data: CreateWorkspaceInput) {
    const baseSub = data.subdominio_workspace?.trim() || data.nome_workspace
    const subdominio_solicitado = slugifySubdominio(baseSub)

    // Retry externo P2002: 2 tentativas. O helper interno já cobre 100
    // candidatos sequenciais; o retry externo só serve para race condition
    // rara (probe livre + outra request criou no mesmo nome entre probe e
    // create). Mais que isso é cenário patológico que merece 409.
    let tentativas = 0
    let ultimoErro: unknown = null
    while (tentativas < 2) {
      const candidato = await proximoSubdominioDisponivel(baseSub)
      try {
        const workspace = await prisma.workspace.create({
          data: {
            id_organizacao,
            nome_workspace: data.nome_workspace,
            subdominio_workspace: candidato,
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
          subdominio_solicitado,
          subdominio_ajustado: candidato !== subdominio_solicitado,
        }
      } catch (err) {
        ultimoErro = err
        // P2002 = unique constraint failed. Retenta com novo probe.
        if (err && typeof err === 'object' && 'code' in err && (err as { code?: string }).code === 'P2002') {
          tentativas++
          continue
        }
        throw err
      }
    }
    log.error('createWorkspace.colisao_persistente', {
      id_organizacao,
      base: baseSub,
      causa: ultimoErro instanceof Error ? ultimoErro.message : String(ultimoErro),
    })
    throw new AppError(
      'Não foi possível criar workspace — colisão de subdomínio após retentativas',
      409,
      'CONFLICT',
    )
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
