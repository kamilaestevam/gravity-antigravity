import 'dotenv/config'

// Fail-fast: validar env vars criticas
if (!process.env.CHAVE_INTERNA_SERVICO) {
  throw new Error('[API-Cockpit] Variavel de ambiente obrigatoria ausente: CHAVE_INTERNA_SERVICO')
}
if (!process.env.ENCRYPTION_KEY) {
  throw new Error('[API-Cockpit] Variavel de ambiente obrigatoria ausente: ENCRYPTION_KEY')
}

import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

// TODO Fase 8: erp ainda usa middleware (requireAuth, tenantIsolation) de um path
// que nunca foi implementado. Refatorar para padrao S2S como tokens.ts/webhooks.ts.
// import { erpRouter } from './routes/erp'
import { documentacaoApiRouter } from './routes/documentacao-api'
import { monitoramentoApiRouter } from './routes/monitoramento-api'
import { tokensRouter } from './routes/tokens'
import { webhooksRouter } from './routes/webhooks'
import { proxyProdutosRouter } from './routes/proxy-produtos'
import { requireInternalKey } from './middleware/requireInternalKey'
import { rateLimitPresets } from '../../../middleware/rateLimiter'
import { iniciarWorkerRetencao, pararWorkerRetencao } from './workers/retencao-log-requisicao-api'

const app = express()
const prisma = new PrismaClient()

app.use(helmet())
app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'api-cockpit', version: '1.0.0' })
})

// Rate Limiting
app.use(rateLimitPresets.internal())

// Routes — S2S internas (Configurador → api-cockpit)
// app.use('/api/v1/cockpit/erp', erpRouter)
app.use('/api/v1/cockpit/api-tokens',         tokensRouter)
app.use('/api/v1/cockpit/webhooks',           webhooksRouter)
app.use('/api/v1/cockpit/documentacao-api',   requireInternalKey, documentacaoApiRouter)
app.use('/api/v1/cockpit/monitoramento-api',  monitoramentoApiRouter)

// Routes — Proxy externo (cliente API → produto)
// NÃO usa requireInternalKey — auth é via Bearer token do cliente.
app.use('/api/v1/cockpit',                    proxyProdutosRouter)

// Error Handler
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  if (err instanceof z.ZodError) {
    return res.status(400).json({ error: 'Validation Error', issues: err.issues })
  }
  const e = err as { statusCode?: number; message?: string }
  return res.status(e.statusCode ?? 500).json({
    error: e.message ?? 'Internal Server Error'
  })
})

const PORT = 8016

const server = app.listen(PORT, () => {
  console.log(`[api-cockpit] Servidor rodando na porta ${PORT}`)
  iniciarWorkerRetencao()
})
server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[api-cockpit] Porta ${PORT} já em uso. Execute: npm run dev:reset`)
    process.exit(1)
  }
  throw err
})

// Graceful shutdown — Railway envia SIGTERM em deploy/restart.
// Sem isso, setTimeout do worker pode disparar com prisma desconectado.
const shutdown = (sinal: string) => {
  console.log(`[api-cockpit] recebido ${sinal}, encerrando...`)
  pararWorkerRetencao()
  void prisma.$disconnect()
  server.close(() => {
    console.log('[api-cockpit] servidor encerrado')
    process.exit(0)
  })
  // Forca saida apos 10s se close demorar
  setTimeout(() => {
    console.warn('[api-cockpit] forcando saida (close timeout 10s)')
    process.exit(1)
  }, 10_000).unref()
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT',  () => shutdown('SIGINT'))
