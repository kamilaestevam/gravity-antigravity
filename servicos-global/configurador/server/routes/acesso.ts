// server/routes/acesso.ts
// Verificação de permissões entre serviços (S2S) — montado em /api/v1/internal
// GET  /api/v1/internal/permissoes-acesso/verificar             — verificar permissão
// GET  /api/v1/internal/permissoes-acesso/produtos-permitidos   — produtos permitidos
// GET  /api/v1/internal/organizacao-produtos                    — listar produtos da organização
// POST /api/v1/internal/organizacao-produtos/ativar             — ativar produto S2S
// POST /api/v1/internal/organizacao-produtos/desativar          — desativar produto S2S
// PATCH /api/v1/internal/produtos-gravity/:id_produto_gravity/status — toggle status

import { Router } from 'express'
import { z } from 'zod'
import { requireInternalKey } from '../middleware/requireInternalKey.js'
import { prisma } from '../lib/prisma.js'
import { productConfigService } from '../services/produto-gravity-configuracao-service.js'
import {
  servicoPermissaoUsuario,
  SECOES_PRODUTO,
  ACOES_PRODUTO,
  type SecaoProduto,
  type AcaoProduto,
} from '../services/permissao-usuario-servico.js'
import { AppError } from '../lib/appError.js'

export const accessRouter = Router()

// Aplica x-internal-key em todas as rotas deste roteador
accessRouter.use(requireInternalKey)

const CheckAccessSchema = z.object({
  tenantId: z.string(),
  userId: z.string(),
  /** id_workspace onde a ação está sendo executada (obrigatório para checagem granular) */
  companyId: z.string().optional(),
  /** slug do produto — ex: 'pedido' */
  productKey: z.string(),
  /** seção dentro do produto — convenção <slug>:<secao>:<acao> (Mandamento 06) */
  secao: z.enum(SECOES_PRODUTO).optional(),
  /** ação solicitada */
  acao: z.enum(ACOES_PRODUTO).optional(),
})

const ProductPermissionsSchema = z.object({
  tenantId: z.string(),
  productKey: z.string(),
})

/**
 * GET /api/v1/internal/permissoes-acesso/verificar
 * Chamado por produtos para verificar se a organização tem acesso a um produto
 * e se o usuário tem permissão para uma ação específica (opcional)
 * Requer: x-internal-key no header
 */
accessRouter.get('/permissoes-acesso/verificar', async (req, res, next) => {
  try {
    const parsed = CheckAccessSchema.safeParse(req.query)
    if (!parsed.success) {
      throw new AppError(
        parsed.error.errors[0]?.message ?? 'Parâmetros inválidos',
        400,
        'VALIDATION_ERROR'
      )
    }

    const { tenantId: id_organizacao, userId: id_usuario, companyId: id_workspace, productKey: slug_produto, secao, acao } = parsed.data

    // 1. Verifica se a organização está ativa
    const tenant = await prisma.organizacao.findUnique({
      where: { id_organizacao },
      select: { status_organizacao: true },
    })
    if (!tenant || tenant.status_organizacao !== 'ATIVO') {
      res.json({ allowed: false, reason: 'TENANT_INACTIVE' })
      return
    }

    // 2. Verifica se o produto está habilitado para a organização
    const productConfig = await productConfigService.getConfig(id_organizacao, slug_produto)
    if (!productConfig?.ativo_configuracao_produto_gravity) {
      res.json({ allowed: false, reason: 'PRODUCT_NOT_ENABLED' })
      return
    }

    // 3. Verifica permissão granular (se solicitado)
    if (secao && acao) {
      if (!id_workspace) {
        throw new AppError(
          'companyId (id_workspace) é obrigatório para checagem granular',
          400,
          'WORKSPACE_REQUIRED',
        )
      }
      const hasPermission = await servicoPermissaoUsuario.verificarPermissao({
        id_organizacao,
        id_usuario,
        slug_produto,
        secao: secao as SecaoProduto,
        acao: acao as AcaoProduto,
        id_workspace,
      })
      if (!hasPermission) {
        res.json({ allowed: false, reason: 'PERMISSION_DENIED' })
        return
      }
    }

    res.json({
      allowed: true,
      productConfig: productConfig.configuracao_config_produto_gravity,
    })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/v1/internal/organizacao-produtos
 * Retorna TODOS os produtos habilitados para uma organização.
 * Usado pelo Shell para filtrar o sidebar dinamicamente.
 */
accessRouter.get('/organizacao-produtos', async (req, res, next) => {
  try {
    const id_organizacao = req.query.idOrganizacao as string
    if (!id_organizacao) {
      throw new AppError('idOrganizacao é obrigatório', 400, 'VALIDATION_ERROR')
    }

    const products = await productConfigService.listActiveProducts(id_organizacao)

    // Retorna também os inativos para que o Shell saiba o que esconder
    const allConfigs = await prisma.produtoGravityConfiguracao.findMany({
      where: { id_organizacao_configuracao_produto_gravity: id_organizacao },
      select: {
        chave_produto_configuracao_produto_gravity: true,
        ativo_configuracao_produto_gravity: true,
        configuracao_config_produto_gravity: true,
        data_atualizacao_configuracao_produto_gravity: true,
      },
    })

    res.json({ id_organizacao, products: allConfigs })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/v1/internal/organizacao-produtos/ativar
 * Ativa um produto para uma organização via S2S (sem Clerk auth)
 * Usado por testes E2E e serviços internos
 */
accessRouter.post('/organizacao-produtos/ativar', async (req, res, next) => {
  try {
    const { tenantId: id_organizacao, productKey, config: productConfig } = req.body
    if (!id_organizacao || !productKey) {
      throw new AppError('tenantId e productKey são obrigatórios', 400, 'VALIDATION_ERROR')
    }

    const result = await productConfigService.upsertConfig(
      id_organizacao,
      productKey,
      productConfig ?? {},
      true
    )

    res.json({ product_key: productKey, active: true, config: result })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/v1/internal/organizacao-produtos/desativar
 * Desativa um produto para uma organização via S2S (sem Clerk auth)
 */
accessRouter.post('/organizacao-produtos/desativar', async (req, res, next) => {
  try {
    const { tenantId: id_organizacao, productKey } = req.body
    if (!id_organizacao || !productKey) {
      throw new AppError('tenantId e productKey são obrigatórios', 400, 'VALIDATION_ERROR')
    }

    await productConfigService.disableProduct(id_organizacao, productKey)

    res.json({ product_key: productKey, active: false })
  } catch (err) {
    next(err)
  }
})

/**
 * PATCH /api/v1/internal/produtos-gravity/:id_produto_gravity/status
 * Toggle status de um produto no catálogo via S2S
 * Usado por testes E2E
 */
accessRouter.patch('/produtos-gravity/:id_produto_gravity/status', async (req, res, next) => {
  try {
    const { status } = req.body
    const validStatuses = ['ATIVO', 'SUSPENSO', 'EM_BREVE', 'LEGADO', 'INATIVO']
    if (!status || !validStatuses.includes(status)) {
      throw new AppError(`Status inválido. Use: ${validStatuses.join(', ')}`, 400, 'VALIDATION_ERROR')
    }

    const product = await prisma.produtoGravity.findFirst({
      where: { slug_produto_gravity: req.params.id_produto_gravity },
    })
    if (!product) {
      throw new AppError('Produto não encontrado', 404, 'NOT_FOUND')
    }

    const updated = await prisma.produtoGravity.update({
      where: { id_produto_gravity: product.id_produto_gravity },
      data: { status_produto_gravity: status },
    })

    res.json({
      id: updated.id_produto_gravity,
      slug: updated.slug_produto_gravity,
      status: updated.status_produto_gravity,
    })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/v1/internal/permissoes-acesso/produtos-permitidos
 * Busca definições de permissão configuradas para um produto na organização
 */
accessRouter.get('/permissoes-acesso/produtos-permitidos', async (req, res, next) => {
  try {
    const parsed = ProductPermissionsSchema.safeParse(req.query)
    if (!parsed.success) {
      throw new AppError('Parâmetros inválidos', 400, 'VALIDATION_ERROR')
    }

    const config = await productConfigService.getConfig(
      parsed.data.tenantId,
      parsed.data.productKey
    )

    if (!config) {
      res.json({
        error: 'Permissões deste produto ainda não foram configuradas.',
        canEdit: false,
      })
      return
    }

    // DTO: ConfiguracaoProduto rename → contrato legado
    res.json({
      config: config.configuracao_config_produto_gravity,
      is_active: config.ativo_configuracao_produto_gravity,
    })
  } catch (err) {
    next(err)
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// SDK @gravity/resolver-organizacao — endpoints de resolucao de contexto
//
// Consumidos pelo middleware HTTP dos produtos (pedido, futuros) que usam o
// SDK para mapear (Clerk JWT sub) → (id_organizacao + tipo_usuario + workspace).
//
// Contrato: ver packages/resolver-organizacao/src/configurador-client.ts:36
// Resposta em camelCase para casar com OrganizacaoByUsuarioSchema/OrganizacaoByIdSchema
// do SDK (sem refactor do consumidor downstream em req.organizacao.idOrganizacao).
//
// Mapping status: PG OrganizacaoStatus → SDK enum
//   ATIVO                 → active
//   SUSPENSO              → suspended
//   CANCELADO             → deleted
//   CONFIGURACAO_PENDENTE → suspended (usuario nao deve operar ate concluir setup)
// ─────────────────────────────────────────────────────────────────────────────

const StatusSdkMap: Record<string, 'active' | 'suspended' | 'deleted'> = {
  ATIVO: 'active',
  SUSPENSO: 'suspended',
  CANCELADO: 'deleted',
  CONFIGURACAO_PENDENTE: 'suspended',
}

/**
 * GET /api/v1/internal/usuarios/:id_clerk_usuario
 * Resolve organizacao + contexto a partir do Clerk sub (payload.sub do JWT).
 * O parametro NAO e o id_usuario do banco (CUID) — e o id_clerk_usuario.
 */
accessRouter.get('/usuarios/:id_clerk_usuario', async (req, res, next) => {
  try {
    const { id_clerk_usuario } = req.params

    const usuario = await prisma.usuario.findUnique({
      where: { id_clerk_usuario },
      select: {
        id_usuario: true,
        tipo_usuario: true,
        id_organizacao: true,
        id_workspace_preferido_usuario: true,
        tenant: { select: { status_organizacao: true } },
      },
    })

    if (!usuario || !usuario.tenant) {
      throw new AppError('Usuário ou organização não encontrada', 404, 'NOT_FOUND')
    }

    res.json({
      idOrganizacao: usuario.id_organizacao,
      status: StatusSdkMap[usuario.tenant.status_organizacao] ?? 'suspended',
      idUsuario: usuario.id_usuario,
      tiposUsuario: [usuario.tipo_usuario],
      idWorkspace: usuario.id_workspace_preferido_usuario,
    })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/v1/internal/organizacoes
 * Lista todas as organizacoes ATIVAS para uso S2S (workers, admin cross-org views).
 *
 * Filtra por padrao status_organizacao = 'ATIVO' — orgs suspensas ou canceladas
 * nao deveriam ser iteradas em rotinas operacionais (workers de cobranca,
 * paineis admin, agregacoes globais). Para incluir todos os status, passar
 * ?incluirInativas=true.
 *
 * Resposta: minimal payload (apenas id_organizacao + status) — chamadores
 * que precisam de mais campos podem buscar org por org via /organizacoes/:id.
 *
 * Consumido por: GABI /admin/uso-global, futuros workers cross-org.
 */
accessRouter.get('/organizacoes', async (req, res, next) => {
  try {
    const incluirInativas = req.query.incluirInativas === 'true'
    const where = incluirInativas ? {} : { status_organizacao: 'ATIVO' as const }

    const organizacoes = await prisma.organizacao.findMany({
      where,
      select: {
        id_organizacao:     true,
        status_organizacao: true,
      },
      orderBy: { data_criacao_organizacao: 'asc' },
    })

    res.json({ organizacoes })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/v1/internal/organizacoes/:id_organizacao
 * Resolve organizacao por ID — usado por background jobs/CRON via SDK
 * (sem usuario no contexto, idUsuario e tiposUsuario sao default no SDK).
 */
accessRouter.get('/organizacoes/:id_organizacao', async (req, res, next) => {
  try {
    const { id_organizacao } = req.params

    const organizacao = await prisma.organizacao.findUnique({
      where: { id_organizacao },
      select: {
        id_organizacao: true,
        nome_organizacao: true,
        status_organizacao: true,
        suid_empresa_organizacao: true, // link 1:1 para Empresa no Cadastros
      },
    })

    if (!organizacao) {
      throw new AppError('Organização não encontrada', 404, 'NOT_FOUND')
    }

    res.json({
      id: organizacao.id_organizacao,
      nome: organizacao.nome_organizacao,
      status: StatusSdkMap[organizacao.status_organizacao] ?? 'suspended',
      suid_empresa_organizacao: organizacao.suid_empresa_organizacao, // pode ser null se onboarding incompleto
      idWorkspace: null,
    })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/v1/internal/gabi/limites-globais
 *
 * Lista limites monetarios GLOBAIS da GABI (cross-organizacao).
 * Consumido pelo servico GABI (limiteMonetarioService) — nao podemos
 * importar o Prisma do Configurador no GABI direto (regra de isolamento
 * inter-servicos), entao expomos via S2S.
 *
 * Filtros opcionais:
 *   ?modelo=gpt-4o-mini  — limite especifico de modelo (modelo IS NOT NULL e =)
 *   ?ativo=true|false    — default todos
 *
 * Resposta: { limites: GabiLimiteMonetarioGlobal[] }
 *   Decimal serializado como string (precisao mantida); o consumidor
 *   converte com Number() ja que JS nao tem Decimal nativo.
 */
accessRouter.get('/gabi/limites-globais', async (req, res, next) => {
  try {
    const modelo = typeof req.query.modelo === 'string' ? req.query.modelo : undefined
    const ativoFiltro =
      req.query.ativo === 'true'  ? true  :
      req.query.ativo === 'false' ? false : undefined

    const limites = await prisma.gabiLimiteMonetarioGlobal.findMany({
      where: {
        ...(ativoFiltro !== undefined && { ativo_gabi_limite_monetario_global: ativoFiltro }),
        ...(modelo !== undefined && { modelo_gabi_limite_monetario_global: modelo }),
      },
      orderBy: { data_criacao_gabi_limite_monetario_global: 'asc' },
    })

    res.json({
      limites: limites.map(serializarLimiteGlobal),
    })
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// CRUD de limites GLOBAIS — F2-F.bis
//
// Espelha o CRUD per-org do GABI (gabi/server/routes/admin-limites.ts) mas
// para escopo GLOBAL (cross-organizacao). Decimal serializado como string
// na resposta — Prisma aceita Decimal via string ou number na entrada.
// ---------------------------------------------------------------------------

const VALOR_USD_REGEX = /^\d{1,10}(\.\d{1,2})?$/  // alinhado ao Decimal(12,2)

const criarLimiteGlobalSchema = z.object({
  modelo:              z.string().min(1).max(100).nullable().optional(),
  limite_aviso_usd:    z.string().regex(VALOR_USD_REGEX, 'valor USD invalido'),
  limite_bloqueio_usd: z.string().regex(VALOR_USD_REGEX, 'valor USD invalido'),
  destinatarios_email: z.array(z.string().email('e-mail invalido')).min(1).max(20),
  ativo:               z.boolean().optional().default(true),
}).refine(
  (d) => Number(d.limite_aviso_usd) <= Number(d.limite_bloqueio_usd),
  { message: 'limite_aviso_usd deve ser <= limite_bloqueio_usd' },
)

const atualizarLimiteGlobalSchema = z.object({
  modelo:              z.string().min(1).max(100).nullable().optional(),
  limite_aviso_usd:    z.string().regex(VALOR_USD_REGEX).optional(),
  limite_bloqueio_usd: z.string().regex(VALOR_USD_REGEX).optional(),
  destinatarios_email: z.array(z.string().email()).min(1).max(20).optional(),
  ativo:               z.boolean().optional(),
})

function serializarLimiteGlobal(l: {
  id_gabi_limite_monetario_global:                  string
  modelo_gabi_limite_monetario_global:              string | null
  limite_aviso_usd_gabi_limite_monetario_global:    { toString(): string }
  limite_bloqueio_usd_gabi_limite_monetario_global: { toString(): string }
  destinatarios_email_gabi_limite_monetario_global: string[]
  ativo_gabi_limite_monetario_global:               boolean
  data_criacao_gabi_limite_monetario_global:        Date
  data_atualizacao_gabi_limite_monetario_global:    Date
}) {
  return {
    id_gabi_limite_monetario_global:                  l.id_gabi_limite_monetario_global,
    modelo_gabi_limite_monetario_global:              l.modelo_gabi_limite_monetario_global,
    limite_aviso_usd_gabi_limite_monetario_global:    l.limite_aviso_usd_gabi_limite_monetario_global.toString(),
    limite_bloqueio_usd_gabi_limite_monetario_global: l.limite_bloqueio_usd_gabi_limite_monetario_global.toString(),
    destinatarios_email_gabi_limite_monetario_global: l.destinatarios_email_gabi_limite_monetario_global,
    ativo_gabi_limite_monetario_global:               l.ativo_gabi_limite_monetario_global,
    data_criacao_gabi_limite_monetario_global:        l.data_criacao_gabi_limite_monetario_global.toISOString(),
    data_atualizacao_gabi_limite_monetario_global:    l.data_atualizacao_gabi_limite_monetario_global.toISOString(),
  }
}

/**
 * POST /api/v1/internal/gabi/limites-globais
 * Cria limite GLOBAL. Constraint UNIQUE COALESCE(modelo,'__ALL__') previne
 * duplicacao entre limite "todos os modelos" e limite especifico do mesmo modelo.
 */
accessRouter.post('/gabi/limites-globais', async (req, res, next) => {
  try {
    const parse = criarLimiteGlobalSchema.safeParse(req.body)
    if (!parse.success) {
      throw new AppError(parse.error.issues[0]?.message ?? 'invalido', 400, 'VALIDATION_ERROR')
    }
    const dados = parse.data

    const linha = await prisma.gabiLimiteMonetarioGlobal.create({
      data: {
        modelo_gabi_limite_monetario_global:              dados.modelo ?? null,
        limite_aviso_usd_gabi_limite_monetario_global:    dados.limite_aviso_usd,
        limite_bloqueio_usd_gabi_limite_monetario_global: dados.limite_bloqueio_usd,
        destinatarios_email_gabi_limite_monetario_global: dados.destinatarios_email,
        ativo_gabi_limite_monetario_global:               dados.ativo,
      },
    })

    res.status(201).json({ limite: serializarLimiteGlobal(linha) })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('gabi_limite_monetario_global_unq_modelo') || msg.includes('Unique constraint')) {
      return next(new AppError('Ja existe limite GLOBAL para esse modelo', 409, 'CONFLICT'))
    }
    next(err)
  }
})

/**
 * PUT /api/v1/internal/gabi/limites-globais/:id
 */
accessRouter.put('/gabi/limites-globais/:id', async (req, res, next) => {
  try {
    const id = req.params.id
    const parse = atualizarLimiteGlobalSchema.safeParse(req.body)
    if (!parse.success) {
      throw new AppError(parse.error.issues[0]?.message ?? 'invalido', 400, 'VALIDATION_ERROR')
    }
    const dados = parse.data
    if (
      dados.limite_aviso_usd !== undefined &&
      dados.limite_bloqueio_usd !== undefined &&
      Number(dados.limite_aviso_usd) > Number(dados.limite_bloqueio_usd)
    ) {
      throw new AppError('limite_aviso_usd deve ser <= limite_bloqueio_usd', 400, 'VALIDATION_ERROR')
    }

    const linha = await prisma.gabiLimiteMonetarioGlobal.update({
      where: { id_gabi_limite_monetario_global: id },
      data: {
        ...(dados.modelo              !== undefined && { modelo_gabi_limite_monetario_global:              dados.modelo }),
        ...(dados.limite_aviso_usd    !== undefined && { limite_aviso_usd_gabi_limite_monetario_global:    dados.limite_aviso_usd }),
        ...(dados.limite_bloqueio_usd !== undefined && { limite_bloqueio_usd_gabi_limite_monetario_global: dados.limite_bloqueio_usd }),
        ...(dados.destinatarios_email !== undefined && { destinatarios_email_gabi_limite_monetario_global: dados.destinatarios_email }),
        ...(dados.ativo               !== undefined && { ativo_gabi_limite_monetario_global:               dados.ativo }),
      },
    })

    res.json({ limite: serializarLimiteGlobal(linha) })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('Record to update not found')) {
      return next(new AppError('limite GLOBAL nao encontrado', 404, 'NOT_FOUND'))
    }
    if (msg.includes('gabi_limite_monetario_global_unq_modelo') || msg.includes('Unique constraint')) {
      return next(new AppError('conflito de modelo', 409, 'CONFLICT'))
    }
    next(err)
  }
})

/**
 * DELETE /api/v1/internal/gabi/limites-globais/:id
 * Apaga em cascata os alertas emitidos relacionados (FK logico, sem @relation).
 */
accessRouter.delete('/gabi/limites-globais/:id', async (req, res, next) => {
  try {
    const id = req.params.id

    await prisma.$transaction(async (tx) => {
      await tx.gabiAlertaEmitidoGlobal.deleteMany({
        where: { id_limite_gabi_alerta_emitido_global: id },
      })
      await tx.gabiLimiteMonetarioGlobal.delete({
        where: { id_gabi_limite_monetario_global: id },
      })
    })

    res.status(204).end()
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('Record to delete does not exist') || msg.includes('not found')) {
      return next(new AppError('limite GLOBAL nao encontrado', 404, 'NOT_FOUND'))
    }
    next(err)
  }
})
