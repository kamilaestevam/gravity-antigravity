// server/index.ts
// Agente Configurador — Servidor Express
// Porta: 8005 | Banco: configurador-db | Auth: Clerk | Billing: Conta Azul

import dotenv from 'dotenv'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dir = dirname(fileURLToPath(import.meta.url))
// Chaves globais (GEMINI_API_KEY, CHAVE_INTERNA_SERVICO) vêm do .env.local da raiz
dotenv.config({ path: resolve(__dir, '../../../.env.local') })
// Chaves específicas do serviço vêm do .env na raiz do pacote (configurador/)
// ATENÇÃO: __dir aponta para server/ — por isso '../.env' e não '.env'
dotenv.config({ path: resolve(__dir, '../.env') })

// Fail-fast: validar env vars criticas antes de qualquer import
const requiredEnvVars = ['CONFIGURADOR_DATABASE_URL', 'CLERK_SECRET_KEY', 'CHAVE_INTERNA_SERVICO'] as const
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`[Configurador] Variavel de ambiente obrigatoria ausente: ${envVar}`)
  }
}

import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { correlationMiddleware } from './middleware/correlationId.js'
import { rateLimitPresets } from './middleware/rateLimiter.js'
import { errorHandler } from './middleware/errorHandler.js'
import { requireAuth } from './middleware/requireAuth.js'
import { requireGravityAdmin } from './middleware/requireGravityAdmin.js'
import { authRouter } from './routes/auth.js'
import { organizacoesRouter } from './routes/organizacao.js'
import { usersRouter } from './routes/usuario.js'
import { billingRouter } from './routes/fatura-produto-gravity.js'
import { accessRouter } from './routes/acesso.js'
import { adminRouter } from './routes/admin.js'
import { productsRouter } from './routes/produto-gravity.js'
import { assinaturaProdutoGravityRouter } from './routes/assinatura-produto-gravity.js'
import { adminOrganizacaoProdutoGravityRouter } from './routes/admin-organizacao-produto-gravity.js'
import { companyProductsRouter } from './routes/produto-gravity-workspace.js'
import { serviceTokenRouter } from './routes/token-servico.js'
import { adminProductsRouter } from './routes/admin-produto-gravity.js'
import { publicCatalogRouter } from './routes/catalogo-publico.js'
import { hubRouter } from './routes/hub-init.js'
import { meRouter } from './routes/me.js'
import { taxasMoedaRouter } from './routes/taxas-moeda.js'
import { historicoOrganizacaoRouter } from './routes/historico-organizacao.js'
import { apiObservability } from '../../servicos-plataforma/middleware/apiObservability.js'
import { createProductAuditPlugin } from '../../servicos-plataforma/historico-global/src/product-audit-plugin.js'
import { prisma } from './lib/prisma.js'

export const app = express()
const PORT = Number(process.env.PORT ?? 8005)

// ─── Middlewares globais ────────────────────────────────────────────────────

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://*.clerk.accounts.dev"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://*.clerk.com", "https://img.clerk.com"],
      connectSrc: ["'self'", "https://*.clerk.accounts.dev", "ws://localhost:*"],
      frameSrc: ["'self'", "https://*.clerk.accounts.dev"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}))

app.use(express.json())
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:8000', 'http://localhost:8001', 'http://localhost:8002', 'http://localhost:8003', 'http://localhost:5000'],
  credentials: true
}))
app.use(correlationMiddleware)
app.use(apiObservability('configurador'))

// ─── Health check ───────────────────────────────────────────────────────────

app.get('/health', async (_req, res) => {
  let dbStatus: 'ok' | 'error' = 'ok'
  try {
    await prisma.$queryRaw`SELECT 1`
  } catch {
    dbStatus = 'error'
  }

  const httpStatus = dbStatus === 'ok' ? 200 : 503
  res.status(httpStatus).json({
    status: dbStatus === 'ok' ? 'ok' : 'degraded',
    service: 'configurador',
    port: PORT,
    db: dbStatus,
    timestamp: new Date().toISOString(),
  })
})

// ─── Rate Limiting (endpoints publicos e webhooks) ─────────────────────────
app.use('/api/v1/webhooks', rateLimitPresets.webhook())
app.use('/api/v1/catalogo', rateLimitPresets.public())
app.use('/api/v1/admin', rateLimitPresets.admin())

// ─── Audit plugin universal — captura mutações nao cobertas por manual ─────
// Cobre POST/PUT/PATCH/DELETE em todos os mounts da API. Paths que ja tem log
// manual humanizado em handlers (me.ts, auth.ts, organizacao.ts PATCH /me,
// admin.ts via auditMiddleware) sao ignorados para nao duplicar — ver ignoreRoutes.
// Garante o requisito B do dono ("novo produto/aba entra automatico no historico"):
// qualquer nova rota mutavel num router montado vai logar mesmo sem o handler
// chamar AuditService.log().
const configuradorAuditPlugin = createProductAuditPlugin({
  id_produto_historico_log: 'configurador',
  modulo_historico_log: 'configurador',
  getActorFromReq: (req) => {
    const auth = (req as any).auth
    if (!auth?.id_usuario) return null
    return {
      id_ator_historico_log: auth.id_usuario,
      nome_ator_historico_log: auth.nome_usuario ?? auth.id_usuario,
      tipo_ator_historico_log: 'USUARIO',
      id_organizacao: auth.id_organizacao,
    }
  },
  ignoreRoutes: [
    // Paths com log manual humanizado (evita duplicacao):
    /^\/api\/v1\/me\/workspaces(\/|$)/,        // me.ts: CRIAR/ATUALIZAR/EXCLUIR Workspace
    /^\/api\/v1\/organizacoes\/me(\/|$)/,      // organizacao.ts: ATUALIZAR Organizacao
    /^\/api\/v1\/auth(\/|$)/,                  // auth.ts: ENTRAR/SAIR/REVOGAR_SESSAO
    /^\/api\/v1\/admin(\/|$)/,                 // adminRouter: auditMiddleware proprio
    // Paths nao-acao-de-usuario:
    /^\/api\/v1\/webhooks(\/|$)/,
    /^\/api\/v1\/internal(\/|$)/,
    /^\/api\/v1\/historico/,                   // self-referential
    /^\/api\/v1\/notificacoes(\/|$)/,
    /^\/api\/tenant\/preferencias(\/|$)/,      // preferencias-usuario tem audit interno
  ],
})
app.use(configuradorAuditPlugin)

// ─── Rotas públicas / protegidas por Clerk ──────────────────────────────────

app.use('/api/v1/webhooks', authRouter)
app.use('/api/v1/me', meRouter)
app.use('/api/v1/hub', hubRouter)
app.use('/api/v1/organizacoes', organizacoesRouter)
app.use('/api/v1/faturas', billingRouter)
app.use('/api/v1/admin', adminRouter)
app.use('/api/v1/produtos', productsRouter)
app.use('/api/v1/organizacoes/me/assinaturas', assinaturaProdutoGravityRouter)
app.use('/api/v1/workspaces/:id_workspace/produtos', companyProductsRouter)
app.use('/api/v1/usuarios', usersRouter)
app.use('/api/v1/tokens-servico', serviceTokenRouter)

// ─── Rotas internas (x-chave-interna-servico obrigatória) ────────────────────────────

app.use('/api/v1/internal', accessRouter)
app.use('/api/v1/internal', serviceTokenRouter)

// ─── Rotas admin (gravity_admin only) ───────────────────────────────────────

import { historicoRouter, historicoReadOnlyRouter } from '../../servicos-plataforma/historico-global/server/routes.js'
import { historicoGlobalAdminRouter } from './routes/historico-global-admin.js'
// Middleware obrigatório: rate limit + auth Clerk + role check (SUPER_ADMIN/ADMIN)
// Sem isso, /api/tenant/historico-global/* ficou exposto publicamente — todas as 12 rotas
// do histórico (incluindo POST /logs de ingestão) eram chamáveis sem token.
//
// O `historicoGlobalAdminRouter` é montado PRIMEIRO e intercepta APENAS
// `GET /logs` para enriquecer cada item com `email_ator_historico_log` (lookup
// batch em `prisma.usuario`). Demais rotas (`/logs/:id`, `/logs/export`,
// `/alerts`, `/alert-rules`, `/lgpd`) caem no `historicoRouter` original
// pelo segundo mount — Express avança para o próximo handler quando o path
// não casa nenhuma rota do primeiro router.
app.use('/api/v1/admin/historico-global', rateLimitPresets.admin(), requireAuth, requireGravityAdmin, historicoGlobalAdminRouter)
app.use('/api/v1/admin/historico-global', rateLimitPresets.admin(), requireAuth, requireGravityAdmin, historicoRouter)

// Mount não-admin (somente leitura): qualquer usuário autenticado consulta o
// histórico da própria organização. O controller se autoescopa via
// visibilityFilter + Ponto Cego 3 (cross-tenant). Admins Gravity recebem
// visão global pelo próprio buildVisibilityFilter (Mandamento 04).
app.use('/api/v1/historico-global', rateLimitPresets.read(), requireAuth, historicoReadOnlyRouter)

import { apiRoutes as notificacoesRouter } from '../../servicos-plataforma/notificacoes/server/routes/api.js'
// Middleware obrigatório: rate limit + auth Clerk. O router interno tem seu
// próprio `checkAuth` que valida x-id-organizacao/x-id-usuario (passados pelo Shell),
// mas sem requireAuth as rotas ficam públicas — qualquer caller anônimo
// podia spammar o endpoint e receber 401 ruidoso que aparecia como 500 na UI.
app.use('/api/v1/notificacoes', rateLimitPresets.internal(), requireAuth, notificacoesRouter)

import { apiRoutes as preferenciasRouter } from '../../servicos-plataforma/preferencias-usuario/server/routes/api.js'
// Middleware obrigatório: rate limit + auth Clerk. O router interno tem seu
// próprio `checkAuth` que valida x-id-organizacao/x-id-usuario headers, mas sem
// requireAuth externo as rotas ficavam públicas — mesmo padrão do histórico
// global e notificacoes. Auditoria da sessão do detetive api-cockpit encontrou.
app.use('/api/tenant/preferencias', rateLimitPresets.internal(), requireAuth, preferenciasRouter)

app.use('/api/v1/admin/produtos-gravity', adminProductsRouter)       // CRUD catálogo (auth chain interna)
app.use('/api/v1/admin/organizacoes', adminOrganizacaoProdutoGravityRouter)  // ativação por organização (auth chain interna)

import { adminSecurityRouter, adminSecurityInternalRouter } from './routes/admin-seguranca.js'
app.use('/api/v1/admin/eventos-seguranca', adminSecurityRouter)        // painel de seguranca (gravity_admin only)
// Rota interna S2S para ingestão de eventos de segurança (chamada pelo
// securityAuditLogger do historico-global). Antes: POST /admin/security/events
// estava atrás de requireAuth+requireGravityAdmin mas o caller usava
// x-chave-interna-servico, resultando em 401 silencioso — audit trail quebrado.
app.use('/api/v1/internal/eventos-seguranca', adminSecurityInternalRouter)

// Ponto Cego 2 — captura 401/403 que ocorrem antes dos route handlers
import { authErrorLogger } from '../../servicos-plataforma/historico-global/server/middleware/auth-error-logger.js'
app.use(authErrorLogger)

import { apiCockpitRouter, apiCockpitAdminRouter } from './routes/api-cockpit.js'
import { adminNcmIntegracaoRouter } from './routes/admin-ncm-integracao.js'
app.use('/api/v1/api-cockpit', apiCockpitRouter)             // workspace: observabilidade por organização
app.use('/api/v1/api-cockpit/admin', apiCockpitAdminRouter)       // admin: observabilidade global (gravity_admin only)
app.use('/api/v1/admin/integracao-ncm', adminNcmIntegracaoRouter) // admin: sincronização NCM Siscomex

// ─── Taxas de moeda (PTAX) — sem auth (dados públicos do BCB) ──────────────

app.use('/api/v1/taxas-moeda', taxasMoedaRouter)

// ─── Histórico da organização — workspace page (requireAuth interno) ────────

app.use('/api/v1/historico-organizacao', historicoOrganizacaoRouter)

// ─── Catálogo público (sem auth — usado pelo Store/Marketplace) ─────────────

app.use('/api/v1/catalogo', publicCatalogRouter)

// ─── Handler de erros global ─────────────────────────────────────────────────

app.use(errorHandler)

// ─── Start (apenas quando executado diretamente, não em testes) ──────────────

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, async () => {
    console.log(`[configurador] Servidor rodando na porta ${PORT}`)

    // Sincronizar catálogo de produtos com a lista canônica a cada startup
    try {
      const { productCatalogService } = await import('./services/produto-gravity-catalogo-service.js')
      await productCatalogService.ensureMissingProducts()
      console.log('[configurador] Catálogo de produtos sincronizado')
    } catch (err) {
      console.error('[configurador] Falha ao sincronizar catálogo de produtos:', err)
    }

    // Inicializar pg-boss e worker de audit logs
    const tenantDbUrl = process.env.ORGANIZACAO_DATABASE_URL
    if (tenantDbUrl) {
      try {
        const { initPgBoss } = await import('../../servicos-plataforma/historico-global/server/queue/pg-boss.js')
        const { startAuditWorker } = await import('../../servicos-plataforma/historico-global/server/queue/audit-worker.js')
        const { startExportWorker } = await import('../../servicos-plataforma/historico-global/server/queue/export-worker.js')
        const { startIntegrityCheckWorker } = await import('../../servicos-plataforma/historico-global/server/queue/integrity-check-worker.js')
        const { startPartitionWorker } = await import('../../servicos-plataforma/historico-global/server/queue/partition-worker.js')
        const { startGabiQuotaResetWorker } = await import('./queue/gabiQuotaResetWorker.js')
        await initPgBoss(tenantDbUrl)
        await startAuditWorker()
        await startExportWorker()
        await startIntegrityCheckWorker()
        await startPartitionWorker()
        await startGabiQuotaResetWorker()

        // Taxas de moeda — sync automático 4x/dia (10h / 11h / 12h / 13h BRT)
        const { startTaxasMoedaSyncWorker } = await import('./queue/taxasMoedaSyncWorker.js')
        startTaxasMoedaSyncWorker()

        // NCM Siscomex — cron job diário roda no bootstrap do serviço Cadastros
        // (porta 8031). Configurador apenas proxya as chamadas admin via REST.
      } catch (err) {
        console.error('[configurador] Falha ao inicializar pg-boss/audit-worker:', err)
      }
    } else {
      console.warn('[configurador] ORGANIZACAO_DATABASE_URL ausente — audit logs desativados')
    }
  })
}

export default app
