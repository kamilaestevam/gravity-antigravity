/**
 * index.ts — Smart Read Express Server (BFF/adapter para o Smart Read legado)
 * Localização canônica: servicos-global/produto/smart-read/server/
 * Porta: 8033
 * Banco Gravity (progresso wizard, preferências) + legado dati (leituras/extração).
 */

import dotenv from 'dotenv'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, join } from 'node:path'

const __dir = dirname(fileURLToPath(import.meta.url))
// Chaves globais (CHAVE_INTERNA_SERVICO) vêm do .env.local da raiz
dotenv.config({ path: resolve(__dir, '../../../../../.env.local') })
// Chaves específicas do serviço vêm do .env local
dotenv.config({ path: resolve(__dir, '../../.env') })

import express, { Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import rateLimit, { ipKeyGenerator } from 'express-rate-limit'
import { requireInternalKey } from './middleware/require-internal-key.js'
import { leiturasSmartReadRouter } from './routes/leituras-smart-read.js'
import { listaPaineisSmartReadRouter } from './routes/lista-paineis-smart-read.js'
import { isolamentoOrganizacaoSmartReadMiddleware } from './middleware/isolamento-organizacao-smart-read.js'
import { createProductAuditPlugin } from '../../../../servicos-plataforma/historico-global/src/product-audit-plugin.js'

const app = express()
const PORT = process.env.PORT ?? 8033

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'", 'ws://localhost:*'],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
)

app.use(express.json({ limit: '1mb' }))

app.use((req: Request, res: Response, next: NextFunction) => {
  const origensPermitidas = [
    'http://localhost:5185',
    process.env.CLIENT_URL ?? '',
    process.env.CONFIGURATOR_URL ?? '',
  ].filter(Boolean)

  const origem = req.headers.origin ?? ''
  if (origensPermitidas.includes(origem)) {
    res.setHeader('Access-Control-Allow-Origin', origem)
  }
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, x-internal-key, x-chave-interna-servico, x-id-organizacao, x-id-usuario, x-id-workspace, x-correlation-id',
  )
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

app.use(express.static(join(__dir, '..', '..', 'client', 'dist')))

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'smart-read', port: PORT })
})

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  skip: () => process.env.NODE_ENV !== 'production',
  keyGenerator: (req) =>
    (req.headers['x-id-organizacao'] as string) || (req.ip ? ipKeyGenerator(req.ip) : 'unknown'),
  message: { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Muitas requisicoes' } },
})
app.use('/api/', apiLimiter)

app.use('/api/', requireInternalKey)
app.use('/api/', isolamentoOrganizacaoSmartReadMiddleware)

app.use(
  createProductAuditPlugin({
    product_id: 'smart-read',
    module: 'smart-read',
    getActorFromReq: (req) => {
      const tenant_id = req.headers['x-id-organizacao'] as string | undefined
      const actor_id = req.headers['x-id-usuario'] as string | undefined
      if (!tenant_id || !actor_id) return null
      return { tenant_id, actor_id, actor_name: actor_id, actor_type: 'USER' }
    },
  }),
)

app.use('/api/v1/smart-read/leituras', leiturasSmartReadRouter)
app.use('/api/v1/smart-read/lista/paineis', listaPaineisSmartReadRouter)

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(`[Smart-Read Error] ${err.message}`)
  const statusCode = (err as { statusCode?: number }).statusCode || 500
  const code = (err as { code?: string }).code || 'INTERNAL_ERROR'
  res.status(statusCode).json({
    error: {
      code,
      message: err.message || 'Erro interno do servidor',
    },
  })
})

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`smart-read server on :${PORT}`))
}

export { app }
