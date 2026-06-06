// server/index.ts
// Agente Configurador — Servidor Express
// Porta: 8005 | Banco: configurador-db | Auth: Clerk | Billing: Conta Azul

import dotenv from 'dotenv'
import { fileURLToPath } from 'node:url'
import { createReadStream, existsSync } from 'node:fs'
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
import { prestadoresFornecedorRouter } from './routes/prestadores-fornecedor.js'
import { billingRouter } from './routes/fatura-produto-gravity.js'
import { accessRouter } from './routes/acesso.js'
import { workspacesHabilitadosInternalRouter } from './routes/workspaces-habilitados-internal.js'
import { permissoesVerificarInternalRouter } from './routes/permissoes-verificar-internal.js'
import { adminRouter } from './routes/admin.js'
import { productsRouter } from './routes/produto-gravity.js'
import { assinaturaProdutoGravityRouter } from './routes/assinatura-produto-gravity.js'
import { negociacaoEspecialRouter } from './routes/negociacao-especial.js'
import { adminOrganizacaoProdutoGravityRouter } from './routes/admin-organizacao-produto-gravity.js'
import { companyProductsRouter } from './routes/produto-gravity-workspace.js'
import { serviceTokenRouter } from './routes/token-servico.js'
import { gabiInternalRouter } from './routes/gabi-internal.js'
import { adminProductsRouter } from './routes/admin-produto-gravity.js'
import { publicCatalogRouter } from './routes/catalogo-publico.js'
import { hubRouter } from './routes/hub-init.js'
import { meRouter } from './routes/me.js'
import { taxasMoedaRouter } from './routes/taxas-moeda.js'
import { previsaoTaxaFuturaMoedaRouter } from './routes/previsao-taxa-futura-moeda.js'
import { historicoOrganizacaoRouter } from './routes/historico-organizacao.js'
import { apiObservability } from '../../servicos-plataforma/middleware/apiObservability.js'
import { createProductAuditPlugin } from '../../servicos-plataforma/historico-global/src/product-audit-plugin.js'
import { prisma } from './lib/prisma.js'

export const app = express()
const PORT = Number(process.env.PORT ?? 8005)
const monorepoRoot = resolve(__dir, '../../..')

// ─── Trust proxy ────────────────────────────────────────────────────────────
// Necessário em produção (Railway / load balancer): faz Express ler IP real
// do cliente em `X-Forwarded-For` em vez de usar o IP do LB.
// Audit log forense (admin-empresas, etc.) depende disso.
app.set('trust proxy', true)

// ─── Canonical domain redirect ─────────────────────────────────────────────
// Força HTTPS e redireciona www → domínio canônico (usegravity.com.br)
if (process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT) {
  app.use((req, res, next) => {
    const host = req.hostname
    if (host === '127.0.0.1' || host === 'localhost') return next()
    const proto = req.headers['x-forwarded-proto'] ?? req.protocol
    if (proto === 'http' || host.startsWith('www.')) {
      const canonical = `https://usegravity.com.br${req.originalUrl}`
      res.redirect(301, canonical)
      return
    }
    next()
  })
}

// ─── Middlewares globais ────────────────────────────────────────────────────

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://*.clerk.accounts.dev", "https://clerk.usegravity.com.br", "https://*.clerk.com", "https://challenges.cloudflare.com"],
      scriptSrcElem: ["'self'", "'unsafe-inline'", "https://*.clerk.accounts.dev", "https://clerk.usegravity.com.br", "https://*.clerk.com", "https://challenges.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "https://*.clerk.com", "https://img.clerk.com"],
      connectSrc: ["'self'", "https://*.clerk.accounts.dev", "https://clerk.usegravity.com.br", "https://*.clerk.com", "https://challenges.cloudflare.com", "https://servicodados.ibge.gov.br", "ws://localhost:*"],
      frameSrc: ["'self'", "https://*.clerk.accounts.dev", "https://clerk.usegravity.com.br", "https://accounts.usegravity.com.br", "https://challenges.cloudflare.com"],
      workerSrc: ["'self'", "blob:"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}))

app.use(express.json({ limit: '60mb' }))
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

// ─── Dev: prints EMT locais (mesmo contrato do Vite /dev-emt-artifacts) ───────
if (process.env.NODE_ENV !== 'production' && !process.env.RAILWAY_ENVIRONMENT) {
  app.use('/dev-emt-artifacts', (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      next()
      return
    }
    const rel = decodeURIComponent((req.url ?? '').split('?')[0].replace(/^\//, '')).replace(/\\/g, '/')
    if (
      !rel.startsWith('testes/testes-em-tela/')
      || !rel.includes('/resultado-teste/')
      || !rel.endsWith('.png')
      || rel.includes('..')
    ) {
      res.status(403).end('Forbidden')
      return
    }
    const abs = resolve(monorepoRoot, rel)
    if (!abs.startsWith(resolve(monorepoRoot))) {
      res.status(403).end('Forbidden')
      return
    }
    if (!existsSync(abs)) {
      res.status(404).end('Not found')
      return
    }
    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Cache-Control', 'private, max-age=300')
    if (req.method === 'HEAD') {
      res.status(200).end()
      return
    }
    createReadStream(abs).pipe(res)
  })
}

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
app.use('/api/v1/faturas-produto-gravity', billingRouter)
app.use('/api/v1/admin', adminRouter)
app.use('/api/v1/produtos-gravity', productsRouter)
app.use('/api/v1/organizacoes/me/assinaturas-produto-gravity', assinaturaProdutoGravityRouter)
app.use('/api/v1/organizacoes/me/negociacao-especial', negociacaoEspecialRouter)
app.use('/api/v1/workspaces/:id_workspace/produtos-gravity', companyProductsRouter)
app.use('/api/v1/usuarios', usersRouter)
app.use('/api/v1/prestadores-fornecedor', prestadoresFornecedorRouter)
app.use('/api/v1/tokens-servico', serviceTokenRouter)

// ─── Rotas internas (x-chave-interna-servico obrigatória) ────────────────────────────

app.use('/api/v1/internal', accessRouter)
app.use('/api/v1/internal', serviceTokenRouter)
app.use('/api/v1/internal/usuarios', workspacesHabilitadosInternalRouter)
app.use('/api/v1/internal/permissoes', permissoesVerificarInternalRouter)
app.use('/api/v1/internal/gabi', gabiInternalRouter)

// Pendência #4 — audit log de override de organização. Endpoint S2S chamado
// pelo middleware do SDK `@gravity/resolver-organizacao` (fire-and-forget)
// sempre que SUPER_ADMIN/ADMIN ativa o header `x-organizacao-override`.
import { adminOrganizacaoOverrideAuditRouter } from './routes/admin-organizacao-override-audit.js'
app.use('/api/v1/internal/admin', adminOrganizacaoOverrideAuditRouter)

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
import { adminCertificadosRouter } from './routes/admin-certificados.js'
import { adminEmpresasRouter } from './routes/admin-empresas.js'
app.use('/api/v1/api-cockpit', apiCockpitRouter)             // workspace: observabilidade por organização
app.use('/api/v1/api-cockpit/admin', apiCockpitAdminRouter)       // admin: observabilidade global (gravity_admin only)
app.use('/api/v1/admin/integracao-ncm', adminNcmIntegracaoRouter) // admin: sincronização NCM Siscomex
app.use('/api/v1/admin/certificados', adminCertificadosRouter)    // admin: certificados digitais Siscomex (e-CNPJ)
app.use('/api/v1/admin/fornecedores', adminEmpresasRouter)       // admin: fornecedores cross-organização (audit logged)

// ─── Taxas de moeda (PTAX) — sem auth (dados públicos do BCB) ──────────────

app.use('/api/v1/taxas-moeda', taxasMoedaRouter)

// ─── Previsões de taxa futura (BACEN Focus) — GET público, POST com auth ────
// Projeções de mercado do Focus, irmã arquitetural das cotações PTAX.

app.use('/api/v1/previsoes-taxa-futura-moeda', previsaoTaxaFuturaMoedaRouter)

// ─── Histórico da organização — workspace page (requireAuth interno) ────────

app.use('/api/v1/historico-organizacao', historicoOrganizacaoRouter)

// ─── Catálogo público (sem auth — usado pelo Store/Marketplace) ─────────────

app.use('/api/v1/catalogo', publicCatalogRouter)

// ─── Proxy reverso: Pedido sidecar (porta 8030) ─────────────────────────────
// Em produção o Pedido roda como sidecar no mesmo processo (porta 8030).
// O frontend faz chamadas relativas `/api/v1/pedidos/*` que chegam neste
// Express. Este proxy encaminha para o sidecar via localhost.
// O proxy injeta x-chave-interna-servico pois o browser não envia essa header.
import { request as httpRequest } from 'node:http'

const _sidecarStatus: Record<string, { ok: boolean; error?: string }> = {}

app.get('/api/v1/internal/sidecar-status', requireAuth, requireGravityAdmin, (_req, res) => {
  res.json(_sidecarStatus)
})

function reescreverUrlApiBidFreteLegado(originalUrl: string): string {
  if (originalUrl.startsWith('/api/v1/bid-frete-internacional')) return originalUrl
  let destino = originalUrl.replace(/^\/api\/v1\/bid-frete/, '/api/v1/bid-frete-internacional')
  destino = destino.replace(
    '/bid-frete-internacional/insights-alertas',
    '/bid-frete-internacional/dashboard/insights-alertas',
  )
  destino = destino.replace(
    '/bid-frete-internacional/mapa-cotacoes',
    '/bid-frete-internacional/dashboard/mapa-cotacoes',
  )
  return destino
}

/** Sidecar BID Frete Internacional — mesmo processo que o Configurador (porta 8023). */
const BID_FRETE_SIDECAR_LOCAL_URL = 'http://127.0.0.1:8023'

/**
 * URL usada pelo proxy browser → sidecar.
 * Em site-usegravity (Railway) o BID roda como sidecar local; BID_FRETE_SERVICE_URL
 * externo (serviço Railway morto ou URL pública do próprio site) causa 502
 * "Application failed to respond" na UI de Insights.
 */
function resolverUrlProxyBidFreteInternacional(): string {
  if (process.env.RAILWAY_ENVIRONMENT) {
    return BID_FRETE_SIDECAR_LOCAL_URL
  }
  return process.env.BID_FRETE_SERVICE_URL || BID_FRETE_SIDECAR_LOCAL_URL
}

function proxyBidFreteInternacional(req: import('express').Request, res: import('express').Response, originalUrl: string) {
  const serviceUrl = resolverUrlProxyBidFreteInternacional()
  const targetUrl = `${serviceUrl}${originalUrl}`
  const host = serviceUrl.replace(/^https?:\/\//, '')
  const headers = { ...req.headers, host } as Record<string, any>
  const chaveInterna = process.env.CHAVE_INTERNA_SERVICO ?? 'gravity-dev-internal-key-2026'
  headers['x-chave-interna-servico'] = chaveInterna
  headers['x-internal-key'] = chaveInterna

  // Não mascarar identidade ausente com org_dev_default (404 fornecedor silencioso).
  // Browser autenticado deve enviar x-id-organizacao/x-id-usuario via shell (/me).

  let bodyBuf: Buffer | undefined
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    bodyBuf = Buffer.from(JSON.stringify(req.body))
    headers['content-length'] = String(bodyBuf.length)
  }

  const proxyReq = httpRequest(targetUrl, { method: req.method, headers }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers)
    proxyRes.pipe(res)
  })
  proxyReq.on('error', (err) => {
    console.error('[proxy-bid-frete-internacional] erro ao conectar', {
      code: (err as NodeJS.ErrnoException).code,
      message: err.message,
      method: req.method,
      url: req.originalUrl,
    })
    if (!res.headersSent) {
      res.status(502).json({
        error: 'BID Frete Internacional service unavailable',
        sidecar: _sidecarStatus['bid-frete'],
      })
    }
  })
  if (bodyBuf) {
    proxyReq.end(bodyBuf)
  } else {
    proxyReq.end()
  }
}

// ─── Proxy reverso: BID Frete Internacional sidecar (porta 8023) ─────────────
// Em produção o BID roda como sidecar no mesmo processo (porta 8023).
// O frontend chama `/api/v1/bid-frete-internacional/*` — proxy encaminha via localhost.
app.use('/api/v1/bid-frete-internacional', (req, res) => {
  proxyBidFreteInternacional(req, res, req.originalUrl)
})

// Compat: bundles antigos usavam /api/v1/bid-frete/* sem sufixo -internacional.
app.use('/api/v1/bid-frete', (req, res) => {
  proxyBidFreteInternacional(req, res, reescreverUrlApiBidFreteLegado(req.originalUrl))
})

app.use('/api/v1/pedidos', (req, res) => {
  const targetUrl = `http://127.0.0.1:8030${req.originalUrl}`
  const headers = { ...req.headers, host: '127.0.0.1:8030' }
  headers['x-chave-interna-servico'] = process.env.CHAVE_INTERNA_SERVICO!

  const ehImportacaoInteligente = req.originalUrl.includes('/importacoes-inteligentes/')
  const proxyTimeoutMs = ehImportacaoInteligente ? 900_000 : 60_000

  let bodyBuf: Buffer | undefined
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    bodyBuf = Buffer.from(JSON.stringify(req.body))
    headers['content-length'] = String(bodyBuf.length)
  }

  const proxyReq = httpRequest(targetUrl, { method: req.method, headers }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers)
    proxyRes.pipe(res)
  })
  proxyReq.setTimeout(proxyTimeoutMs, () => {
    proxyReq.destroy()
    if (!res.headersSent) {
      res.status(408).json({
        error: {
          code: 'HTTP_408',
          message: 'Tempo limite excedido ao processar a importacao. Tente novamente ou divida o arquivo em lotes menores.',
        },
      })
    }
  })
  proxyReq.on('error', (err) => {
    console.error('[proxy-pedido] erro ao conectar com sidecar', {
      code: (err as NodeJS.ErrnoException).code,
      message: err.message,
      method: req.method,
      url: req.originalUrl,
      headerKeys: Object.keys(req.headers),
    })
    if (!res.headersSent) res.status(502).json({ error: 'Pedido service unavailable', sidecar: _sidecarStatus['pedido'] })
  })
  if (bodyBuf) {
    proxyReq.end(bodyBuf)
  } else {
    req.pipe(proxyReq)
  }
})

// ─── Proxy reverso: Processo sidecar (porta 8026) ───────────────────────────
// Front Processo (embutido no Configurador) chama `/api/v1/processos/*`,
// `/api/v1/processo-status/*` e `/api/v1/documentos-processo/*`.
const _proxyProcesso = (req: express.Request, res: express.Response) => {
  const targetUrl = `http://127.0.0.1:8026${req.originalUrl}`
  const headers: Record<string, string | string[] | undefined> = { ...req.headers, host: '127.0.0.1:8026' }
  headers['x-internal-key'] = process.env.CHAVE_INTERNA_SERVICO!
  headers['x-chave-interna-servico'] = process.env.CHAVE_INTERNA_SERVICO!

  let bodyBuf: Buffer | undefined
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    bodyBuf = Buffer.from(JSON.stringify(req.body))
    headers['content-length'] = String(bodyBuf.length)
  }

  const proxyReq = httpRequest(targetUrl, { method: req.method, headers }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers)
    proxyRes.pipe(res)
  })
  proxyReq.on('error', (err) => {
    console.error('[proxy-processo] erro ao conectar com sidecar', {
      code: (err as NodeJS.ErrnoException).code,
      message: err.message,
      method: req.method,
      url: req.originalUrl,
    })
    if (!res.headersSent) {
      res.status(502).json({ error: 'Processo service unavailable', sidecar: _sidecarStatus['processo'] })
    }
  })
  if (bodyBuf) {
    proxyReq.end(bodyBuf)
  } else {
    req.pipe(proxyReq)
  }
}
app.use('/api/v1/processos', _proxyProcesso)
app.use('/api/v1/processo-status', _proxyProcesso)
app.use('/api/v1/documentos-processo', _proxyProcesso)

// ─── Proxy reverso: Cadastros sidecar (porta 8031) ──────────────────────────
// O sidecar Cadastros expõe `/api/v1/empresas` (1:1 org), `/api/v1/fornecedores` (parceiros) e `/api/v1/cadastros/*`
// (moedas, unidades, incoterms, ncm, operacoes-comex, paises...).
// Sem este proxy, as chamadas relativas do frontend caem no catch-all → 404.
const _proxyCadastros = (req: express.Request, res: express.Response) => {
  const cadastrosPath = req.originalUrl
  const targetUrl = `http://127.0.0.1:8031${cadastrosPath}`
  // Tipado explicitamente: o spread de req.headers (IncomingHttpHeaders) perde
  // o index signature, e atribuir chaves custom (x-internal-key) viraria TS7053.
  const headers: Record<string, string | string[] | undefined> = { ...req.headers, host: '127.0.0.1:8031' }
  // O serviço Cadastros valida a chave inter-serviço via `x-internal-key`.
  // Injetada server-side: a chave interna nunca deve depender do navegador.
  headers['x-internal-key'] = process.env.CHAVE_INTERNA_SERVICO!
  headers['x-chave-interna-servico'] = process.env.CHAVE_INTERNA_SERVICO!

  let bodyBuf: Buffer | undefined
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    bodyBuf = Buffer.from(JSON.stringify(req.body))
    headers['content-length'] = String(bodyBuf.length)
  }

  const proxyReq = httpRequest(targetUrl, { method: req.method, headers }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers)
    proxyRes.pipe(res)
  })
  proxyReq.on('error', (err) => {
    console.error('[proxy-cadastros] erro ao conectar com sidecar', {
      code: (err as NodeJS.ErrnoException).code,
      message: err.message,
      method: req.method,
      url: req.originalUrl,
    })
    if (!res.headersSent) res.status(502).json({ error: 'Cadastros service unavailable', sidecar: _sidecarStatus['cadastros'] })
  })
  if (bodyBuf) {
    proxyReq.end(bodyBuf)
  } else {
    proxyReq.end()
  }
}
app.use('/api/v1/fornecedores', _proxyCadastros)
app.use('/api/v1/empresas', _proxyCadastros)
app.use('/api/v1/cadastros', _proxyCadastros)

// ─── Servir frontend Vite em produção ────────────────────────────────────────
const clientDistDir = resolve(__dir, '../dist')

/** Assets com hash no nome — cache longo; index.html sempre revalidado (evita chunk/CSS stale pós-deploy). */
app.use(
  express.static(clientDistDir, {
    index: false,
    setHeaders(res, filePath) {
      const normalizado = filePath.replace(/\\/g, '/')
      if (normalizado.endsWith('/index.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
      } else if (normalizado.includes('/assets/')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
      }
    },
  }),
)

/**
 * Middleware de normalização de URL canônica
 * Ver: documentos-tecnicos/arquitetura/rotas-convencao.md §"Trailing slash e case"
 *
 * Aplica APENAS em GETs fora de /api e /health (rotas SPA). Ordem:
 *  1. Trailing slash → 301 versão sem barra (exceto a raiz `/`)
 *  2. Maiúsculas → 301 versão minúscula
 *  3. Path legacy (/workspace, /produto/{X}) → 301 canônica preservando sufixo
 *
 * O redirect é server-side (301) para que crawlers e bookmarks aprendam a URL
 * canônica. O fallback client-side via NavigateComPrefixo no App.tsx cobre
 * o caso de navegação interna pós-load.
 */
const REDIRECTS_PREFIXO_LEGACY: Array<{ de: string; para: string }> = [
  { de: '/workspace', para: '/configurador' },
  { de: '/produto/pedido', para: '/pedido' },
  { de: '/produto/simula-custo', para: '/simula-custo' },
  { de: '/produto/processo', para: '/processo' },
  { de: '/produto/bid-frete', para: '/bid-frete' },
  { de: '/produto/bid-frete-internacional', para: '/bid-frete' },
  { de: '/bid-frete/visao-geral', para: '/bid-frete/insights' },
  { de: '/bid-frete-internacional/visao-geral', para: '/bid-frete/insights' },
  { de: '/produto/bid-cambio', para: '/bid-cambio' },
]

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/health')) return next()

  const path = req.path
  const query = req.url.slice(req.path.length) // preserva ?... e #... (hash não chega no server)

  // 1. Trailing slash → 301 sem barra (exceto raiz)
  if (path.length > 1 && path.endsWith('/')) {
    return res.redirect(301, path.slice(0, -1) + query)
  }

  // 2. Case-sensitivity → 301 minúsculas
  if (path !== path.toLowerCase()) {
    return res.redirect(301, path.toLowerCase() + query)
  }

  // 3. Path legacy → 301 canônica preservando sufixo
  for (const { de, para } of REDIRECTS_PREFIXO_LEGACY) {
    if (path === de) return res.redirect(301, para + query)
    if (path.startsWith(de + '/')) {
      return res.redirect(301, para + path.slice(de.length) + query)
    }
  }

  // Chunk/CSS ausente — não devolver index.html (Vite interpreta como "Unable to preload CSS")
  if (path.startsWith('/assets/')) {
    return res.status(404).end()
  }

  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
  res.sendFile(resolve(clientDistDir, 'index.html'))
})

// ─── Handler de erros global ─────────────────────────────────────────────────

app.use(errorHandler)

// ─── Start (apenas quando executado diretamente, não em testes) ──────────────

if (process.env.NODE_ENV !== 'test') {
  // Sidecars — cada um roda em porta fixa interna.
  // Sequenciados para evitar race condition em process.env.PORT.
  const portaOriginal = process.env.PORT
  const dbOriginal = process.env.DATABASE_URL
  const listenPort = Number(portaOriginal ?? process.env.PORT ?? 8005)
  const configuradorLoopbackUrl = `http://127.0.0.1:${listenPort}`

  // Sidecar 1: Cadastros (porta 8031)
  process.env.PORT = '8031'
  process.env.CADASTROS_SIDECAR = '1'
  // CONFIGURADOR_BASE_URL é definido após app.listen (Cadastros chama o Configurador em runtime).
  try {
    await import('../../cadastros/server/src/index.js')
    _sidecarStatus['cadastros'] = { ok: true }
    console.log('[configurador] Sidecar Cadastros iniciado na porta 8031')
  } catch (err) {
    const msg = err instanceof Error ? err.stack ?? err.message : String(err)
    _sidecarStatus['cadastros'] = { ok: false, error: msg }
    console.error('[configurador] Falha ao iniciar sidecar Cadastros:', err)
  }

  // Sidecar 2: Pedido (porta 8030)
  // Migrations rodam em scripts/start-site.sh ANTES deste processo (Railway startCommand).
  // Protege contra process.exit() que o Pedido chama em validações de env —
  // em modo sidecar, exit() mataria o processo inteiro (Configurador incluso).
  if (process.env.PEDIDO_DATABASE_URL) {
    process.env.PORT = '8030'
    process.env.DATABASE_URL = process.env.PEDIDO_DATABASE_URL
    process.env.CONFIGURATOR_URL = configuradorLoopbackUrl
    if (!process.env.ALLOWED_ORIGINS) {
      process.env.ALLOWED_ORIGINS = process.env.CANONICAL_DOMAIN
        ? `https://${process.env.CANONICAL_DOMAIN}`
        : 'https://usegravity.com.br'
    }
    const _origExit = process.exit
    process.exit = ((code?: number) => {
      throw new Error(`[sidecar-guard] process.exit(${code}) bloqueado em modo sidecar`)
    }) as typeof process.exit
    try {
      await import('../../produto/pedido/server/src/index.js')
      _sidecarStatus['pedido'] = { ok: true }
      console.log('[configurador] Sidecar Pedido iniciado na porta 8030')
    } catch (err) {
      const msg = err instanceof Error ? err.stack ?? err.message : String(err)
      _sidecarStatus['pedido'] = { ok: false, error: msg }
      console.error('[configurador] Falha ao iniciar sidecar Pedido:', msg)
    } finally {
      process.exit = _origExit
    }
  } else {
    _sidecarStatus['pedido'] = { ok: false, error: 'PEDIDO_DATABASE_URL ausente' }
    console.warn('[configurador] PEDIDO_DATABASE_URL ausente — sidecar Pedido desativado')
  }

  // Sidecar 3: Processo (porta 8026)
  // Migrations rodam em build-site.sh / start-site.sh quando PROCESSO_DATABASE_URL está definida.
  if (process.env.PROCESSO_DATABASE_URL) {
    process.env.PORT = '8026'
    process.env.DATABASE_URL = process.env.PROCESSO_DATABASE_URL
    process.env.CONFIGURATOR_URL = configuradorLoopbackUrl
    process.env.PROCESSO_SIDECAR = '1'
    process.env.CLIENT_URL = process.env.CANONICAL_DOMAIN
      ? `https://${process.env.CANONICAL_DOMAIN}`
      : 'https://usegravity.com.br'
    const _origExitProcesso = process.exit
    process.exit = ((code?: number) => {
      throw new Error(`[sidecar-guard] process.exit(${code}) bloqueado em modo sidecar Processo`)
    }) as typeof process.exit
    try {
      await import('../../produto/processo/server/src/index.js')
      _sidecarStatus['processo'] = { ok: true }
      console.log('[configurador] Sidecar Processo iniciado na porta 8026')
    } catch (err) {
      const msg = err instanceof Error ? err.stack ?? err.message : String(err)
      _sidecarStatus['processo'] = { ok: false, error: msg }
      console.error('[configurador] Falha ao iniciar sidecar Processo:', msg)
    } finally {
      process.exit = _origExitProcesso
    }
  } else {
    _sidecarStatus['processo'] = { ok: false, error: 'PROCESSO_DATABASE_URL ausente' }
    console.warn('[configurador] PROCESSO_DATABASE_URL ausente — sidecar Processo desativado')
  }

  // Sidecar 4: API Cockpit (porta 8016)
  // Health checks, tokens, webhooks, logs de requisição, monitoramento.
  // Usa CONFIGURADOR_DATABASE_URL (mesmas tabelas — fragment composto).
  process.env.PORT = '8016'
  process.env.DATABASE_URL = dbOriginal
  process.env.API_COCKPIT_SIDECAR = '1'
  try {
    await import('../../servicos-plataforma/api-cockpit/server/src/index.js')
    console.log('[configurador] Sidecar API Cockpit iniciado na porta 8016')
  } catch (err) {
    console.error('[configurador] Falha ao iniciar sidecar API Cockpit:', err)
  }

  // Restaurar env vars originais
  process.env.PORT = portaOriginal
  process.env.DATABASE_URL = dbOriginal

  async function aplicarMigrationsBidFreteDev(): Promise<void> {
    if (process.env.NODE_ENV === 'production' || process.env.BID_SKIP_MIGRATIONS === '1') return
    try {
      const { execSync } = await import('node:child_process')
      const repoRoot = resolve(__dir, '../../..')
      console.log('[configurador] Dev — aplicando migrations BID Frete Internacional...')
      execSync('npx tsx scripts/ativamente/aplicar-migrations-bid-frete-internacional.ts', {
        cwd: repoRoot,
        stdio: 'inherit',
        env: process.env,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.warn('[configurador] Migrations BID dev falharam — sidecar sobe mesmo assim:', msg)
    }
  }

  async function iniciarSidecarBidFreteInternacional() {
    if (!process.env.BID_FRETE_INTERNATIONAL_DATABASE_URL) {
      _sidecarStatus['bid-frete'] = { ok: false, error: 'BID_FRETE_INTERNATIONAL_DATABASE_URL ausente' }
      console.warn('[configurador] BID_FRETE_INTERNATIONAL_DATABASE_URL ausente — sidecar BID Frete Internacional desativado')
      return
    }

    await aplicarMigrationsBidFreteDev()

    const plataformaBase = process.env.SERVIDOR_PLATAFORMA_URL ?? 'http://127.0.0.1:3001'
    process.env.PORT = '8023'
    process.env.DATABASE_URL = process.env.BID_FRETE_INTERNATIONAL_DATABASE_URL
    process.env.CONFIGURATOR_URL = configuradorLoopbackUrl
    process.env.CADASTROS_SERVICE_URL = 'http://127.0.0.1:8031'
    process.env.ATIVIDADES_SERVICE_URL = process.env.ATIVIDADES_SERVICE_URL ?? plataformaBase
    process.env.NOTIFICACOES_SERVICE_URL = process.env.NOTIFICACOES_SERVICE_URL ?? plataformaBase
    process.env.HISTORICO_SERVICE_URL = process.env.HISTORICO_SERVICE_URL ?? plataformaBase
    process.env.GABI_SERVICE_URL = process.env.GABI_SERVICE_URL ?? 'http://127.0.0.1:8009'
    process.env.CLIENT_URL = process.env.CANONICAL_DOMAIN
      ? `https://${process.env.CANONICAL_DOMAIN}`
      : 'https://usegravity.com.br'
    process.env.BID_FRETE_SIDECAR = '1'

    const _origExitBid = process.exit
    process.exit = ((code?: number) => {
      throw new Error(`[sidecar-guard] process.exit(${code}) bloqueado em modo sidecar BID Frete`)
    }) as typeof process.exit
    try {
      await import('../../produto/bid-frete-internacional/server/src/index.js')
      _sidecarStatus['bid-frete'] = { ok: true }
      console.log('[configurador] Sidecar BID Frete Internacional iniciado na porta 8023')
    } catch (err) {
      const msg = err instanceof Error ? err.stack ?? err.message : String(err)
      _sidecarStatus['bid-frete'] = { ok: false, error: msg }
      console.error('[configurador] Falha ao iniciar sidecar BID Frete Internacional:', msg)
    } finally {
      process.exit = _origExitBid
      if (portaOriginal !== undefined) process.env.PORT = portaOriginal
      process.env.DATABASE_URL =
        process.env.CONFIGURADOR_DATABASE_URL ?? dbOriginal ?? process.env.DATABASE_URL
    }
  }

  const server = app.listen(listenPort, async () => {
    console.log(`[configurador] Servidor rodando na porta ${listenPort}`)
    process.env.CONFIGURADOR_BASE_URL = configuradorLoopbackUrl

    void iniciarSidecarBidFreteInternacional().catch((err: unknown) => {
      const msg = err instanceof Error ? err.stack ?? err.message : String(err)
      _sidecarStatus['bid-frete'] = { ok: false, error: msg }
      console.error('[configurador] Sidecar BID (background) erro não tratado:', msg)
    })

    // Garantir produtos canônicos no catálogo (cria/atualiza nomes — nunca apaga cadastros do Admin)
    try {
      const { produtoGravityCatalogoServico } = await import('./services/produto-gravity-catalogo-service.js')
      await produtoGravityCatalogoServico.ensureMissingProducts()
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

        // Previsão Focus — sync semanal terça 22h BRT (quarta 01h UTC)
        const { startPrevisaoTaxaFuturaMoedaSyncWorker } = await import('./queue/previsao-taxa-futura-moeda-sync-worker.js')
        startPrevisaoTaxaFuturaMoedaSyncWorker()

        // NCM Siscomex — cron job diário roda no bootstrap do serviço Cadastros
        // (porta 8031). Configurador apenas proxya as chamadas admin via REST.
      } catch (err) {
        console.error('[configurador] Falha ao inicializar pg-boss/audit-worker:', err)
      }
    } else {
      console.warn('[configurador] ORGANIZACAO_DATABASE_URL ausente — audit logs desativados')
    }
  })
  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[configurador] Porta ${listenPort} já em uso. Execute: npm run dev:reset`)
      process.exit(1)
    }
    throw err
  })
}

export default app
