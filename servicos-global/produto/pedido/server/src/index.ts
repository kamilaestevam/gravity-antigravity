/**
 * index.ts — Pedido Express Server
 * Localização canônica: servicos-global/produto/pedido/server/
 * Porta: 8030
 * Skill: antigravity-criar-produto (Passo 7 — middlewares na ordem correta)
 *
 * Rotas CRUD (processos-core):
 *   /api/v1/pedidos                     — CRUD de Pedido e PedidoItem
 *   /api/v1/pedidos/config              — Status e colunas de configuração
 *   /api/v1/pedidos/importar            — Upload + parse + preview de arquivos
 *
 * Rotas de features (organizacao/pedido/server):
 *   /api/v1/pedidos/dashboard/widgets   — persistência de configuração de widgets
 *   /api/v1/pedidos/analytics/*         — integração Power BI (OData v4)
 *   /health                             — healthcheck
 */

import dotenv from 'dotenv'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dir = dirname(fileURLToPath(import.meta.url))
// Chaves globais (GEMINI_API_KEY, CHAVE_INTERNA_SERVICO) vêm do .env.local da raiz
dotenv.config({ path: resolve(__dir, '../../../../../.env.local') })
// Chaves específicas do serviço vêm do .env local
dotenv.config({ path: resolve(__dir, '../../.env') })

import express, { Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { requireInternalKey } from './middleware/requireInternalKey.js'
import { resolverOrganizacao, verificarAcessoProduto, resolveOrganizacaoById, AppError } from '@gravity/resolver-organizacao'
// Cadeia 2 granular — `exigirPermissao` e `exigirPorMetodo` instanciados
// uma única vez em `./permissoes.ts`. Routers que só fazem mutação aplicam
// `router.use(exigirPermissao('<secao>','editar'))` internamente (decisão
// Líder Técnico 2026-05-13 — evita bug de middleware chain).
import { exigirPermissao, exigirPorMetodo } from './permissoes.js'
import { analyticsRouter } from './routes/analytics-pedido.js'
import { dashboardWidgetsRouter } from './routes/dashboard-pedido-widgets.js'
import { dashboardDataRouter } from './routes/dashboard-pedido-dados.js'
import { dashboardPaineisRouter } from './routes/dashboard-pedido-paineis.js'
import { consolidarRouter } from './routes/consolidacoes-pedido.js'
import { transferirRouter, transferirHistoricoRouter } from './routes/transferencias-pedido.js'
import { edicaoEmMassaRouter } from './routes/edicoes-em-massa-pedido.js'
import { smartImportRouter, templateHandler } from './routes/importacoes-inteligentes-pedido.js'
import { duplicacoesPedidoRouter } from './routes/duplicacoes-pedido.js'
import { exclusoesPedidoRouter } from './routes/exclusoes-pedido.js'
import { colunasUsuarioRouter } from './routes/colunas-usuario-pedido.js'
import { gabiProxyRouter } from './routes/gabi-pedido.js'
import { behaviorTrackingRouter } from './routes/eventos-comportamento-pedido.js'
import { anexosRouter } from './routes/anexos-pedido.js'
import { templatePedidoRota } from './routes/template-pedido.js'
import { loteRouter } from './routes/alteracoes-status-lote-pedido.js'
import { kanbanPreferenciasRouter } from './routes/kanban-pedido-preferencias.js'
import { casasDecimaisRouter } from './routes/casas-decimais-pedido.js'
import { preferenciaUsuarioColunaPedidoRouter } from './routes/preferencia-usuario-coluna-pedido.js'
import { snapshotAtualizacaoPedidoRouter } from './routes/snapshot-atualizacao-pedido.js'
import { snapshotStatusPedidoRouter } from './routes/snapshot-status-pedido.js'
import { saldoFormulaRouter } from './routes/saldo-formula-pedido.js'
import { initRouter } from './routes/inicializacao-pedido.js'
import { internalCadastrosChangedRouter } from './routes/internal-cadastros-changed.js'
import { pedidosRouter } from '../../../../../servicos-global/produto/processos-core/src/routes/pedidos.js'
import { pedidosConfigRouter } from '../../../../../servicos-global/produto/processos-core/src/routes/pedidos-config.js'
import { importacaoRouter } from '../../../../../servicos-global/produto/processos-core/src/routes/importacao.js'
import { apiObservability } from '../../../../../servicos-global/servicos-plataforma/middleware/apiObservability.js'
import { openapiRouter } from './routes/openapi-pedido.js'
import { createProductAuditPlugin } from '../../../../../servicos-global/servicos-plataforma/historico-global/src/product-audit-plugin.js'

const app = express()
const PORT = process.env.PORT ?? 8030

// ── 0. Security Headers ──────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'"],
      connectSrc: ["'self'"],
      objectSrc:  ["'none'"],
      baseUri:    ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}))

// ── 1. CORS — apenas origens autorizadas ─────────────────────────────────────
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5179').split(',')

app.use(cors({
  origin: (origin, cb) => {
    // Permite requests sem origin (curl, Power BI service, etc.), localhost (dev) e origens na lista
    if (!origin || origin.startsWith('http://localhost:') || ALLOWED_ORIGINS.includes(origin)) return cb(null, true)
    cb(new Error(`Origin ${origin} not allowed`))
  },
  credentials: true,
}))

// ── 2. Body parsing ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }))

// ── 3. Healthcheck (sem auth) ────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'pedido', port: PORT, ts: new Date().toISOString() })
})

// ── 4. Internal key validation (antes do tenant isolation) ───────────────────
// Analytics tem sua própria autenticação via Bearer token (analyticsAuth middleware)
app.use(requireInternalKey)

// ── 5. Analytics — Power BI integration (auth própria dentro do router) ──────
app.use('/api/v1/pedidos/analytics', analyticsRouter)

// ── 5.0. Webhook interno Cadastros → Pedido (resolve org via idOrganizacao
//        no header, NÃO passa por resolverOrganizacao). FASE 06E frente 2.
app.use('/api/v1/internal', internalCadastrosChangedRouter)

// ── 5.0.1. Download de planilha modelo — link <a download> do frontend NÃO envia
//          JWT, então fica ANTES de resolverOrganizacao (que exige Authorization).
//          Auth real fica no requireInternalKey + whitelist + proxy injetando a chave.
app.get('/api/v1/pedidos/importacoes-inteligentes/template', templateHandler)

// ── 5.1. Taxa de câmbio — extraído para servicos-global/servicos-plataforma/taxas-cambio/
// (Gamma-3 leva 3). Consumers passaram a chamar o tenant service standalone.

// ── 6. Tenant resolver — Schema-per-Tenant (ADR-001/ADR-002) ─────────────────
// Wrapper: chamadas S2S via api-cockpit enviam x-id-organizacao sem JWT Clerk.
// Nesses casos, resolvemos o tenant pelo ID direto (mesma função que CRON/workers usam).
const _resolverOrg = resolverOrganizacao({
  chaveProduto:        'pedido',
  configuradorBaseUrl: process.env.CONFIGURATOR_URL!,
  chaveInterna:        process.env.CHAVE_INTERNA_SERVICO!,
})
app.use(async (req: Request, res: Response, next: NextFunction) => {
  const idOrg = req.headers['x-id-organizacao'] as string | undefined
  const hasJwt = !!req.headers['authorization']
  if (!hasJwt && idOrg) {
    try {
      req.organizacao = await resolveOrganizacaoById(idOrg)
      ;(req as Record<string, unknown>).externalApi = true
      return next()
    } catch (err) {
      return next(err)
    }
  }
  _resolverOrg(req, res, next)
})

// ── 6.1. Portão 3 — autorização granular usuário × produto Gravity ───────────
// Skill: seguranca/route-authorization. Master/SAdmin/Admin têm bypass (Mand. 04).
// Standard/Fornecedor exigem chave `pedido:acesso_usuario_produtos_gravity:permitido`
// em UsuarioPermissao do workspace (header x-id-workspace).
// External API calls (api-cockpit proxy) skip product access — token IS the auth.
const _verificarAcesso = verificarAcessoProduto({
  chaveProduto:        'pedido',
  configuradorBaseUrl: process.env.CONFIGURATOR_URL!,
  chaveInterna:        process.env.CHAVE_INTERNA_SERVICO!,
})
app.use((req: Request, res: Response, next: NextFunction) => {
  if ((req as Record<string, unknown>).externalApi) return next()
  _verificarAcesso(req, res, next)
})

// ── 6.2. Cadeia 2 granular — permissões `<slug>:<secao>:<acao>` ──────────────
// Skill: seguranca/permissoes (REGRA seção × ação). Master/SAdmin/Admin bypass.
// PADRAO/FORNECEDOR exigem chave em UsuarioPermissao. Decisão dono 2026-05-13.
//
// Feature flag PEDIDO_PERMISSOES_GRANULARES_ATIVO controla bloqueio:
//   - default (variável ausente ou !== 'false') → ATIVO, retorna 403 quando faltar
//   - 'false' → shadow audit (log "rotaria 403" mas libera) — útil pra roll-out
//
// `exigirPermissao` e `exigirPorMetodo` agora vivem em `./permissoes.ts` (singleton).
// Routers só-mutação (importacoes, duplicacoes, exclusoes) aplicam o gating
// internamente via `router.use(exigirPermissao('lista','editar'))` — evita bug
// de middleware chain do Express (decisão Líder Técnico 2026-05-13).

// ── 7. Observabilidade — captura métricas de uso por tenant/produto ───────────
app.use(apiObservability('pedido'))

// ── 7.1. Audit — registra mutações no histórico global ────────────────────────
// Alinhado ao DDD canonical (Mandamento 03) — chaves espelham o schema do
// `historico_log`. `nome_ator_historico_log` lido do header `x-user-name` que
// o Shell injeta a partir de `req.auth.nome_usuario` do Configurador.
app.use(createProductAuditPlugin({
  id_produto_historico_log: 'pedido',
  modulo_historico_log:     'pedido',
  getActorFromReq: (req) => {
    const ctx = (req as { organizacao?: { idOrganizacao?: string; idUsuario?: string } }).organizacao
    const id_organizacao        = ctx?.idOrganizacao
    const id_ator_historico_log = ctx?.idUsuario
    const nome_ator_historico_log = (req.headers['x-user-name'] as string | undefined) ?? id_ator_historico_log
    if (!id_organizacao || !id_ator_historico_log || !nome_ator_historico_log) return null
    return {
      id_organizacao,
      id_ator_historico_log,
      nome_ator_historico_log,
      tipo_ator_historico_log: 'USUARIO',
    }
  },
}))

// ── 8. Rotas de negócio ───────────────────────────────────────────────────────
// Ordem: rotas estáticas específicas ANTES das genéricas (evita conflitos com /:id)
//
// Gating Cadeia 2 (decisão dono 2026-05-13):
//   - openapi/inicializacao/gabi/behaviorTracking → SEM gating (out of scope ou telemetria)
//   - dashboard/* → secao 'dashboard' (ver/editar por método)
//   - kanban/*    → secao 'kanban'
//   - configuracoes/config/template → secao 'configuracao'
//   - colunas-usuario/edicoes/consolidacoes/importacoes/anexos/duplicacoes/exclusoes/
//     transferencias/alteracoes-status-lote/snapshot/importacao/pedidosRouter → secao 'lista'
app.use('/api/v1/pedidos/openapi.json',                openapiRouter)
app.use('/api/v1/pedidos/inicializacao',               exigirPermissao('lista', 'ver'), initRouter)
app.use('/api/v1/pedidos/dashboard/widgets',           exigirPorMetodo('dashboard'), dashboardWidgetsRouter)
app.use('/api/v1/pedidos/dashboard',                   exigirPermissao('dashboard', 'ver'), dashboardPaineisRouter)
app.use('/api/v1/pedidos/dashboard',                   exigirPermissao('dashboard', 'ver'), dashboardDataRouter)
app.use('/api/v1/pedidos/consolidacoes',               exigirPermissao('lista', 'editar'), consolidarRouter)
app.use('/api/v1/pedidos/edicoes-em-massa',            exigirPermissao('lista', 'editar'), edicaoEmMassaRouter)
// smartImportRouter aplica `exigirPermissao('lista','editar')` internamente.
app.use('/api/v1/pedidos/importacoes-inteligentes',    smartImportRouter)
app.use('/api/v1/pedidos/colunas-usuario',             exigirPorMetodo('lista'), colunasUsuarioRouter)
app.use(gabiProxyRouter)
app.use(behaviorTrackingRouter)
app.use('/api/v1/pedidos/anexos',                      exigirPorMetodo('lista'), anexosRouter)
app.use('/api/v1/pedidos/template-pedido',             exigirPermissao('configuracao', 'editar'), templatePedidoRota)
app.use('/api/v1/pedidos/alteracoes-status-lote',      exigirPermissao('lista', 'editar'), loteRouter)
app.use('/api/v1/pedidos/kanban',                      exigirPorMetodo('kanban'), kanbanPreferenciasRouter)
app.use('/api/v1/pedidos/configuracoes',               exigirPorMetodo('configuracao'), casasDecimaisRouter)
app.use('/api/v1/pedidos/config',                      exigirPorMetodo('lista'), preferenciaUsuarioColunaPedidoRouter)
app.use('/api/v1/pedidos/config',                      exigirPermissao('lista', 'editar'), snapshotAtualizacaoPedidoRouter)
app.use('/api/v1/pedidos',                             exigirPermissao('lista', 'ver'), snapshotStatusPedidoRouter)
app.use('/api/v1/pedidos/configuracoes',               exigirPorMetodo('configuracao'), saldoFormulaRouter)
app.use('/api/v1/pedidos/config',                      exigirPorMetodo('configuracao'), pedidosConfigRouter)
// ── Routers de mutação (duplicacoes/exclusoes/importacao) ─────────────────────
// Montados em sub-paths ESPECÍFICOS para evitar bug de middleware chain do
// Express: quando montado em `/api/v1/pedidos` (genérico), o
// `router.use(exigirPermissao('lista','editar'))` interno rodava para QUALQUER
// request matching `/api/v1/pedidos/*` — incluindo GET /api/v1/pedidos (listar),
// que só exige `lista:ver`. Resultado: Standard com `lista:ver` recebia 403.
app.use('/api/v1/pedidos/duplicacoes',                 duplicacoesPedidoRouter)
app.use('/api/v1/pedidos/exclusoes',                   exclusoesPedidoRouter)
// importacaoRouter (processos-core, compartilhado) — rotas: POST /importar,
// POST /importar/confirmar, POST /exportar. Não pode ser montado em sub-path
// porque as rotas internas já definem o path completo. Gating via app.post()
// (method-specific) — GET /api/v1/pedidos NÃO é afetado (.post ≠ .use).
app.post('/api/v1/pedidos/importar',                   exigirPermissao('lista', 'editar'))
app.post('/api/v1/pedidos/importar/confirmar',         exigirPermissao('lista', 'editar'))
app.post('/api/v1/pedidos/exportar',                   exigirPermissao('lista', 'editar'))
app.use('/api/v1/pedidos',                             importacaoRouter)
// CRUD principal — deve vir após os routers de sub-rotas estáticas
app.use('/api/v1/pedidos',                             exigirPorMetodo('lista'), pedidosRouter)
// Parâmetros dinâmicos após todos os estáticos
app.use('/api/v1/pedidos/:id_pedido/transferencias',   exigirPermissao('lista', 'editar'), transferirRouter)
app.use('/api/v1/pedidos/:id_pedido/transferencias',   exigirPermissao('lista', 'ver'), transferirHistoricoRouter)

// ── 9. 404 catch-all ─────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Rota nao encontrada', code: 'NOT_FOUND' })
})

// ── 10. Error handler global ─────────────────────────────────────────────────
app.use((err: Error & { statusCode?: number; code?: string }, _req: Request, res: Response, _next: NextFunction) => {
  // Traduzir erros conhecidos do Prisma para HTTP semântico
  const prismaCode = (err as unknown as { code?: string }).code
  if (prismaCode === 'P2002') {
    const target = ((err as unknown as { meta?: { target?: string[] } }).meta?.target ?? []) as string[]
    if (target.some(f => f.includes('coluna_usuario'))) {
      return res.status(409).json({ error: { message: 'Já existe uma coluna com este nome. Se você excluiu anteriormente, tente um nome diferente.', code: 'DUPLICATE_COLUNA' } })
    }
    return res.status(409).json({ error: { message: 'Já existe um pedido com este número neste workspace. Use um número diferente.', code: 'DUPLICATE_NUMERO_PEDIDO' } })
  }
  if (prismaCode === 'P2025') {
    // Record not found
    return res.status(404).json({ error: { message: 'Registro não encontrado.', code: 'NOT_FOUND' } })
  }

  const status = err.statusCode ?? 500
  const code   = err.code ?? (status === 500 ? 'INTERNAL_ERROR' : 'ERROR')
  // Garante message mesmo se err não for instância de Error
  const message = err.message || (err as unknown as { toString(): string }).toString?.() || 'Erro interno'
  if (status >= 500) console.error('[Pedido/Server]', message, err.stack)
  res.status(status).json({ error: { message, code } })
})

// ── Start ─────────────────────────────────────────────────────────────────────
// Validações de ambiente obrigatórias — falham antes de aceitar qualquer request
if (!process.env.CHAVE_INTERNA_SERVICO) {
  console.error('[Pedido] FATAL: CHAVE_INTERNA_SERVICO não configurada. Encerrando.')
  process.exit(1)
}

const server = app.listen(PORT, () => {
  console.log(`[Pedido] Servidor rodando na porta ${PORT}`)
  console.log(`[Pedido] Power BI endpoint: http://localhost:${PORT}/api/v1/pedidos/analytics`)
  console.log(`[Pedido] Health: http://localhost:${PORT}/health`)
})
server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[Pedido] Porta ${PORT} já em uso. Execute: npm run dev:reset`)
    process.exit(1)
  }
  throw err
})
