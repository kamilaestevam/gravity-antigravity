/**
 * index.ts — Simula Custo Express Server (produto simula-custo)
 * Localização canônica: servicos-global/produto/simula-custo/server/
 * Porta: 8020
 * Skill: antigravity-criar-produto (middlewares na ordem correta)
 */

import dotenv from 'dotenv'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, join } from 'node:path'

const __dir = dirname(fileURLToPath(import.meta.url))
// .env do produto PRIMEIRO (dotenv não sobrescreve): garante que DATABASE_URL
// seja o banco do Simula Custo, não o do Configurador vindo do .env.local.
dotenv.config({ path: resolve(__dir, '../../.env') })
// Chaves globais (CHAVE_INTERNA_SERVICO etc.) vêm do .env.local da raiz
dotenv.config({ path: resolve(__dir, '../../../../../.env.local') })

import express, { Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import { simulasCustoRouter } from './routes/simulas-custo.js'
import { simularSimulaCustoRouter } from './routes/simular-simula-custo.js'
import { masterDataSimulaCustoRouter } from './routes/master-data-simula-custo.js'
import { dashboardSimulaCustoRouter } from './routes/dashboard-simula-custo.js'
import { configStatusSimulaCustoRouter } from './routes/config-status-simula-custo.js'
import { anexosDocumentoSimulaCustoRouter } from './routes/anexos-documento-simula-custo.js'
import { validarChaveInterna } from './middleware/validar-chave-interna.js'
import { tenantIsolationMiddleware, prisma } from './middleware/isolamento-tenant.js'
import { AppError } from './lib/erros.js'
import { tokenPool } from './services/pool-tokens-siscomex.js'
import { apiObservability } from '../../../../servicos-plataforma/middleware/apiObservability.js'
import { createProductAuditPlugin } from '../../../../servicos-plataforma/historico-global/src/product-audit-plugin.js'

const app = express()
const PORT = process.env.PORT ?? 8020

// ─── 0. Security Headers ──────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'", "ws://localhost:*"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}))

// ─── 1. Body Parser ────────────────────────────────────────────────────────────
app.use(express.json())

// ─── 2. CORS (Configurador, Shell Gravity) ────────────────────────────────────
app.use((_req: Request, res: Response, next: NextFunction) => {
  const allowedOrigins = [
    'http://localhost:8001', // client dev
    'http://localhost:8000', // configurador
    'http://localhost:8004', // preview worktree simula-custo
    process.env.CLIENT_URL ?? '',
  ].filter(Boolean)

  const origin = _req.headers.origin ?? ''
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-internal-key, x-id-organizacao, x-id-workspace, x-id-usuario')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  if (_req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

// ─── 3. Arquivos Estáticos (client build) ─────────────────────────────────────
app.use(express.static(join(__dir, '..', '..', 'client', 'dist')))

// ─── 4. Health Check — SEM autenticação (UptimeRobot) ─────────────────────────
app.get('/health', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok', service: 'simula-custo', port: PORT, db: 'connected' })
  } catch {
    res.status(503).json({ status: 'down', service: 'simula-custo', db: 'disconnected' })
  }
})

// ─── 5. Master Data — SEM autenticação (NCM via Cadastros, UFs são dados públicos)
app.use('/api/v1/simula-custo', masterDataSimulaCustoRouter)

// ─── 6. validarChaveInterna — protege todas as rotas abaixo ───────────────────
//    Skill: antigravity-autenticacao-s2s
app.use(validarChaveInterna)

// ─── 7. Tenant Isolation — injeta req.prisma com filtro por id_organizacao ───
//    id_organizacao vem do header x-id-organizacao propagado pelo Gateway (JWT)
//    NUNCA vem do body da requisição
app.use(tenantIsolationMiddleware)

// ─── 7.1. Observabilidade — captura métricas para API Cockpit ─────────────────
app.use(apiObservability('simula-custo'))

// ─── 7.2. Audit — registra mutações no histórico global ───────────────────────
app.use(createProductAuditPlugin({
  id_produto_historico_log: 'simula-custo',
  modulo_historico_log: 'simula-custo',
  getActorFromReq: (req) => {
    const id_organizacao = req.headers['x-id-organizacao'] as string | undefined
    const id_usuario     = req.headers['x-id-usuario']     as string | undefined
    if (!id_organizacao || !id_usuario) return null
    return {
      id_ator_historico_log: id_usuario,
      nome_ator_historico_log: (req.headers['x-nome-usuario'] as string | undefined) ?? id_usuario,
      tipo_ator_historico_log: 'USUARIO',
      id_organizacao,
    }
  },
  // Master data pública é servida antes do plugin (sem tenant) — ignorar por rota.
  ignoreRoutes: [
    '/api/v1/simula-custo/unidades-federativas',
    '/api/v1/simula-custo/opcoes-icms',
    '/api/v1/simula-custo/ncm/buscar',
  ],
}))

// ─── 8. Rotas do Produto ───────────────────────────────────────────────────────
app.use('/api/v1/simula-custo', simularSimulaCustoRouter)
app.use('/api/v1/simula-custo/simulas-custo', simulasCustoRouter)
app.use('/api/v1/simula-custo/anexos-documento', anexosDocumentoSimulaCustoRouter)
app.use('/api/v1/simula-custo/dashboard', dashboardSimulaCustoRouter)
app.use('/api/v1/simula-custo/config-status-simula-custo', configStatusSimulaCustoRouter)

// ─── 9. SPA Fallback (serve o client React para qualquer rota não-API) ─────────
app.get('*', (_req: Request, res: Response) => {
  const indexPath = join(__dir, '..', '..', 'client', 'dist', 'index.html')
  res.sendFile(indexPath, (err) => {
    if (err) res.status(404).json({ error: 'Client build não encontrado. Execute npm run build no /client.' })
  })
})

// ─── 10. Error Handler Global ─────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message, code: err.code })
  }
  console.error('[SimulaCusto] Erro não tratado:', err.message)
  res.status(500).json({ error: err.message || 'Erro interno' })
})

// ─── 11. Inicialização ────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    console.log(`[SimulaCusto] Servidor rodando na porta ${PORT}`)
    tokenPool.start()
  })
  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[SimulaCusto] Porta ${PORT} já em uso. Execute: npm run dev:reset`)
      process.exit(1)
    }
    throw err
  })
}

export { app }
