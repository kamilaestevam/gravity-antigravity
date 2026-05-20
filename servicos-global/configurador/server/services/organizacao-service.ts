// server/services/organizacao-service.ts
// Lógica de negócio para criação e gestão de organizações e workspaces
// Contrato de retorno em DDD puro (PT-BR) — sem mapeamento para chaves legadas em inglês.

import { createId } from '@paralleldrive/cuid2'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/appError.js'
import { logger } from '../lib/logger.js'
import { criarEmpresa, compensarEmpresa } from './cadastros-client.js'
import { securityAudit } from '../../../servicos-plataforma/historico-global/server/lib/securityAuditLogger.js'
import {
  aoHabilitarProdutoNoWorkspace,
  aoVincularUsuarioAoWorkspace,
} from './sincronizar-acesso-usuario-produtos-service.js'

const log = logger.child({ module: 'organizacao-service' })

/**
 * Limite de auto-vínculo síncrono no `createWorkspace` (F3 da feature 2026-05-05).
 * Acima disso, a operação loga warning e registra audit `auto_vinculo_pendente`
 * para reconciliação posterior — TODO[ARQ]: migrar para BullMQ job pós-commit.
 * Limite definido pelo Líder Técnico baseado em latência aceitável de UI.
 */
const LIMITE_AUTO_VINCULO_INLINE = 200

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
            status_organizacao: 'ATIVO',
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
   * SSOT — workspaces que o usuário pode ACESSAR dentro de uma organização.
   *
   * Substitui a duplicação que existia em /hub/init e
   * /api/v1/internal/usuarios/.../workspaces-habilitados (refactor D11).
   *
   * Regra (idêntica a /hub/init original):
   *   SUPER_ADMIN/ADMIN/MASTER → todos workspaces ATIVO da organização
   *   PADRAO/FORNECEDOR        → ATIVO AND UsuarioWorkspace.ativo_usuario_workspace=true
   *
   * Defesa em profundidade: `tipoUsuario` é lido do banco (Prisma), NÃO recebido
   * via parâmetro. Caller não pode mentir o tipo para burlar a regra (Mand. 01).
   *
   * Cross-org FORNECEDOR:
   *   Por padrão, `id_organizacaoSolicitada` deve bater com `usuario.id_organizacao`
   *   (defesa contra leak entre tenants). FORNECEDOR é exceção configurável via
   *   `permitirCrossTenantFornecedor: true` — único tipo que legitimamente pode
   *   estar vinculado a workspaces de outra org via UsuarioWorkspace (cenário:
   *   fornecedor de plataforma atendendo múltiplos clientes).
   *
   * Erros:
   *   - 404 USUARIO_NAO_ENCONTRADO          — id_usuario inexistente
   *   - 403 ORGANIZACAO_MISMATCH            — org diferente da do usuário
   *                                          (exceto FORNECEDOR com flag)
   *
   * @param input.idUsuario              ID do usuário consultado
   * @param input.idOrganizacaoSolicitada Org em que se busca workspaces acessíveis
   * @param input.permitirCrossTenantFornecedor (default false) — habilita exceção
   *
   * @returns `{ tipoUsuario, workspaces }` com a lista RICA (mesmo select que o
   *          `/hub/init` original retornava — id, nome, subdominio, cnpj, status,
   *          data_criacao, quantidade_usuarios, _count.vinculos). Callers projetam
   *          o que precisam via `.map()` (padrão "fat read, thin projection").
   */
  async workspacesAcessiveis(input: {
    idUsuario: string
    idOrganizacaoSolicitada: string
    permitirCrossTenantFornecedor?: boolean
  }): Promise<{
    tipoUsuario: 'SUPER_ADMIN' | 'ADMIN' | 'MASTER' | 'PADRAO' | 'FORNECEDOR'
    workspaces: Array<{
      id_workspace: string
      nome_workspace: string
      subdominio_workspace: string | null
      cnpj_workspace: string | null
      status_workspace: string
      data_criacao_workspace: Date
      quantidade_usuarios_workspace: number
      _count: { vinculos_workspace: number }
    }>
  }> {
    const { idUsuario, idOrganizacaoSolicitada } = input
    const permitirCrossTenantFornecedor = input.permitirCrossTenantFornecedor ?? false

    // 1) Carrega tipo_usuario do banco — fonte da verdade (Mand. 01).
    //    Caller NÃO passa tipo — service descobre sozinho.
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: idUsuario },
      select: { id_usuario: true, id_organizacao: true, tipo_usuario: true },
    })

    if (!usuario) {
      throw new AppError('Usuário não encontrado', 404, 'USUARIO_NAO_ENCONTRADO')
    }

    // 2) Validação cross-org com exceção FORNECEDOR opcional.
    const ehFornecedor = usuario.tipo_usuario === 'FORNECEDOR'
    const orgMatch = usuario.id_organizacao === idOrganizacaoSolicitada
    if (!orgMatch && !(ehFornecedor && permitirCrossTenantFornecedor)) {
      throw new AppError(
        'Usuário não pertence à organização informada',
        403,
        'ORGANIZACAO_MISMATCH',
      )
    }

    // 3) Query Prisma — mesma para todos, só muda o WHERE.
    const tipoUsuario = usuario.tipo_usuario as
      | 'SUPER_ADMIN' | 'ADMIN' | 'MASTER' | 'PADRAO' | 'FORNECEDOR'
    const ehAdminPlataforma =
      tipoUsuario === 'SUPER_ADMIN' ||
      tipoUsuario === 'ADMIN' ||
      tipoUsuario === 'MASTER'

    // Where clause — `status_workspace: 'ATIVO'` é o enum WorkspaceStatus do
    // Prisma. Usar `as const` para que TypeScript aceite o literal como o enum.
    // A mesma forma é a que o /hub/init original já usava em produção.
    const whereBase = {
      id_organizacao: idOrganizacaoSolicitada,
      status_workspace: 'ATIVO' as const,
    }
    const where = ehAdminPlataforma
      ? whereBase
      : {
          ...whereBase,
          memberships: {
            some: { id_usuario: idUsuario, ativo_usuario_workspace: true },
          },
        }

    const rows = await prisma.workspace.findMany({
      where,
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

    // Mesmo padrão de projeção do /hub/init original (renomeia _count para
    // _count.vinculos_workspace + expõe quantidade_usuarios_workspace).
    // PRESERVA subdominio_workspace === null (não converte para string vazia)
    // para manter contrato bilateral com Zod do frontend (api-client.ts usa
    // z.string().nullable()).
    const workspaces = rows.map((row) => {
      const { _count, ...rest } = row as typeof row & { _count: { memberships: number } }
      return {
        id_workspace: rest.id_workspace,
        nome_workspace: rest.nome_workspace,
        subdominio_workspace: rest.subdominio_workspace,
        cnpj_workspace: rest.cnpj_workspace,
        status_workspace: String(rest.status_workspace),
        data_criacao_workspace: rest.data_criacao_workspace,
        quantidade_usuarios_workspace: _count.memberships,
        _count: { vinculos_workspace: _count.memberships },
      }
    })

    return { tipoUsuario, workspaces }
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

        // ─── Auto-habilita produtos contratados no workspace recém-criado ──
        // Espelha decisão dono 2026-05-12 (commit 7297da46): "produto contratado
        // começa habilitado em todo workspace". Aqui aplicamos o lado simétrico:
        // workspace NOVO ganha automaticamente todas as assinaturas
        // ATIVA/EM_TESTE da organização como ProdutoGravityWorkspace { ativo:true }.
        //
        // Roda ANTES do auto-vínculo de usuários para que `aoVincularUsuarioAoWorkspace`
        // encontre os produtos já habilitados e propague as chaves Portão 3.
        //
        // Mand. 08: falhas logam alto e NÃO revertem o workspace (já comitado).
        await this._habilitarProdutosContratadosPosCommit(
          id_organizacao,
          workspace.id_workspace,
          workspace.nome_workspace,
        )

        // ─── F3 — Auto-vínculo de workspaces futuros (decisão arquitetural 2026-05-05) ─
        // Após o workspace estar persistido, busca usuários PADRAO/FORNECEDOR com
        // `acesso_workspaces_futuros=true` na organização e cria UsuarioWorkspace para
        // cada um. Mand. 04: MASTER/SUPER_ADMIN/ADMIN têm bypass — filtro `tipo_usuario IN`
        // garante que não recebem linhas redundantes.
        //
        // Estratégia (Líder Técnico aprovou):
        //   • ≤200 usuários: createMany inline + audit batch único
        //   • >200 usuários: log warn + audit "auto_vinculo_pendente" + TODO BullMQ
        //
        // Falhas são logadas mas NÃO impedem o retorno do workspace já criado
        // (Mand. 08: log alto, sem fallback silencioso).
        const auto_vinculo_count = await this._aplicarAutoVinculoPosCommit(
          id_organizacao,
          workspace.id_workspace,
          workspace.nome_workspace,
        )

        return {
          ...workspace,
          quantidade_usuarios_workspace: auto_vinculo_count,
          _count: { vinculos_workspace: auto_vinculo_count },
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
   * F3 — auto-vínculo pós-commit de workspace para usuários PADRAO/FORNECEDOR
   * com `acesso_workspaces_futuros=true`. Chamado APÓS o `workspace.create`
   * (commit já efetuado) — falhas aqui não revertem o workspace.
   *
   * Mand. 04: MASTER/SUPER_ADMIN/ADMIN têm bypass — filtro `tipo_usuario IN`
   * exclui esses tipos para evitar linhas redundantes em UsuarioWorkspace.
   *
   * Mand. 08: erros logam alto via `log.error` — não silenciam.
   *
   * Retorna a quantidade de usuários efetivamente auto-vinculados (0 se ninguém
   * com flag ou se acima do limite — neste caso fica para reconciliação).
   */
  async _aplicarAutoVinculoPosCommit(
    id_organizacao: string,
    id_workspace: string,
    nome_workspace: string,
  ): Promise<number> {
    try {
      const candidatos = await prisma.usuario.findMany({
        where: {
          id_organizacao,
          acesso_workspaces_futuros: true,
          tipo_usuario: { in: ['PADRAO', 'FORNECEDOR'] },
        },
        select: { id_usuario: true, tipo_usuario: true },
      })

      if (candidatos.length === 0) return 0

      // >200: TODO[ARQ] migrar para BullMQ. Por ora, log alto + audit pendente.
      // O workspace fica disponível para uso, mas o auto-vínculo precisa de
      // reconciliação manual (admin pode usar "Vincular aos atuais agora" da F5).
      if (candidatos.length > LIMITE_AUTO_VINCULO_INLINE) {
        log.warn('createWorkspace.auto_vinculo_acima_do_limite', {
          id_organizacao,
          id_workspace,
          candidatos_count: candidatos.length,
          limite: LIMITE_AUTO_VINCULO_INLINE,
          motivo: 'pendente_reconciliacao_bullmq',
        })
        // Audit batch com count e ids para rastreabilidade
        securityAudit.workspaceAutoLinkBatch(id_organizacao, 'system_auto_vinculo', {
          id_workspace_criado:           id_workspace,
          nome_workspace_criado:         nome_workspace,
          ids_usuarios_auto_vinculados:  [],
          motivo_auto_vinculo:           'WORKSPACE_CRIADO_ACESSO_FUTUROS',
        }).catch(() => {})
        return 0
      }

      // ≤200: createMany inline. Cada PADRAO/FORNECEDOR com flag=true recebe
      // UsuarioWorkspace ATIVO no novo workspace — herda tipo_usuario do próprio
      // usuário (espelho do convite com workspaces_alvo='all').
      const result = await prisma.usuarioWorkspace.createMany({
        data: candidatos.map((u) => ({
          id_organizacao,
          id_usuario: u.id_usuario,
          id_workspace,
          tipo_usuario_workspace: u.tipo_usuario as 'PADRAO' | 'FORNECEDOR',
          ativo_usuario_workspace: true,
        })),
        skipDuplicates: true,
      })

      // Audit em batch único (Líder Técnico exigiu — em vez de N eventos)
      securityAudit.workspaceAutoLinkBatch(id_organizacao, 'system_auto_vinculo', {
        id_workspace_criado:           id_workspace,
        nome_workspace_criado:         nome_workspace,
        ids_usuarios_auto_vinculados:  candidatos.map((u) => u.id_usuario),
        motivo_auto_vinculo:           'WORKSPACE_CRIADO_ACESSO_FUTUROS',
      }).catch(() => {})

      // PORTÃO 3 — para cada UsuarioWorkspace criado, propaga chaves de acesso
      // aos produtos JÁ habilitados no workspace (que acabaram de ser
      // habilitados em `_habilitarProdutosContratadosPosCommit`). Sem este
      // disparo, Standards/Fornecedores auto-vinculados veem o workspace mas
      // NÃO veem os produtos contratados — regressão silenciosa identificada
      // após o fix do auto-habilitar (12/05/2026, ponto cego do Líder Técnico).
      // Best-effort: falhas logam alto via warn no próprio helper.
      for (const u of candidatos) {
        aoVincularUsuarioAoWorkspace({
          id_organizacao,
          id_workspace,
          id_usuario: u.id_usuario,
        }).catch(() => { /* best-effort — warn já logado no helper */ })
      }

      return result.count
    } catch (err) {
      log.error('createWorkspace.auto_vinculo_falhou', {
        id_organizacao,
        id_workspace,
        causa: err instanceof Error ? err.message : String(err),
      })
      // NÃO propaga — workspace já foi criado, falha em vínculos é recuperável
      // via "Vincular aos atuais agora" da F5. Mand. 08: log alto, sem silenciar.
      return 0
    }
  },

  /**
   * Auto-habilita TODAS as assinaturas ATIVA/EM_TESTE da organização no
   * workspace recém-criado. Espelho simétrico do commit 7297da46 — onde
   * contratar um produto habilita em todos os workspaces existentes, criar
   * um workspace habilita todos os produtos já contratados.
   *
   * Idempotente via upsert. Best-effort: falhas logam alto (Mand. 08) e
   * NÃO revertem o workspace (já comitado). Após habilitar, dispara
   * `aoHabilitarProdutoNoWorkspace` para cada produto — propaga chaves
   * Portão 3 (CP6) aos Standards/Fornecedores ativos no workspace.
   *
   * Reportado por dono em 12/05/2026: workspaces novos ("TESTE 02 WORKSPACE
   * PRODUTO", "Teste Workspace Produtos Gravity") apareciam BLOQUEADO em
   * todos os produtos contratados — auto-habilitação não acontecia.
   */
  async _habilitarProdutosContratadosPosCommit(
    id_organizacao: string,
    id_workspace: string,
    nome_workspace: string,
  ): Promise<number> {
    try {
      // Produtos contratados pela org — inclui SUSPENSA (decisão dono 2026-05-12):
      // workspace novo recebe a linha ProdutoGravityWorkspace mesmo se o produto
      // está suspenso. Assim, quando o Master REATIVA, todos os workspaces já
      // têm a linha em ordem — sem precisar de auto-sync no PATCH de status.
      // CANCELADA é excluído: relação morta, não materializa.
      const assinaturas = await prisma.produtoGravityAssinatura.findMany({
        where: {
          id_organizacao,
          status_assinatura_produto_gravity: { in: ['ATIVA', 'EM_TESTE', 'SUSPENSA'] },
        },
        select: {
          id_produto_gravity: true,
          produto: { select: { slug_produto_gravity: true } },
        },
      })

      if (assinaturas.length === 0) return 0

      // Upsert idempotente — espelha o padrão do POST /assinar-produto.
      for (const a of assinaturas) {
        await prisma.produtoGravityWorkspace.upsert({
          where: {
            id_workspace_id_produto_gravity: {
              id_workspace,
              id_produto_gravity: a.id_produto_gravity,
            },
          },
          create: {
            id_organizacao,
            id_workspace,
            id_produto_gravity: a.id_produto_gravity,
            ativo_produto_gravity_workspace: true,
          },
          update: { ativo_produto_gravity_workspace: true },
        })
      }

      // Log alto de sucesso para rastreabilidade (não há audit batch dedicado).
      log.info('createWorkspace.auto_habilitar_produtos_ok', {
        id_organizacao,
        id_workspace,
        nome_workspace,
        produtos_habilitados: assinaturas.length,
        ids_produtos: assinaturas.map((a) => a.id_produto_gravity),
      })

      // PORTÃO 3 (CP6) — propaga chaves para Standards/Fornecedores já ativos
      // no workspace. Aqui é redundante para o caso comum (workspace acabou
      // de nascer e ainda não tem usuários), mas cobre cenário onde algum
      // membership tenha sido criado antes desta chamada por outra via.
      // Best-effort: o próprio helper já loga warn em falha.
      for (const a of assinaturas) {
        aoHabilitarProdutoNoWorkspace({
          id_organizacao,
          id_workspace,
          id_produto_gravity: a.id_produto_gravity,
          slug_produto: a.produto.slug_produto_gravity,
        }).catch(() => { /* best-effort — warn já logado no helper */ })
      }

      return assinaturas.length
    } catch (err) {
      log.error('createWorkspace.auto_habilitar_produtos_falhou', {
        id_organizacao,
        id_workspace,
        nome_workspace,
        causa: err instanceof Error ? err.message : String(err),
      })
      // Mand. 08: log alto, sem silenciar. NÃO propaga — workspace já comitado.
      return 0
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
