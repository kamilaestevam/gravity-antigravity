import dotenv from 'dotenv'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dir = dirname(fileURLToPath(import.meta.url))
// Mesmo padrão do Configurador — PM2/tsx watch pode reiniciar sem re-aplicar --env-file
dotenv.config({ path: resolve(__dir, '../../../../../.env.local') })
dotenv.config({ path: resolve(__dir, '../../.env') })

// Detectar se estamos rodando como sidecar do Configurador
const API_COCKPIT_SIDECAR = process.env.API_COCKPIT_SIDECAR === '1'

// Fail-fast: validar env vars criticas (como sidecar, apenas warn — o Configurador decide)
if (!process.env.CHAVE_INTERNA_SERVICO) {
  if (API_COCKPIT_SIDECAR) {
    console.warn('[API-Cockpit] CHAVE_INTERNA_SERVICO ausente — sidecar pode falhar em rotas S2S')
  } else {
    throw new Error('[API-Cockpit] Variavel de ambiente obrigatoria ausente: CHAVE_INTERNA_SERVICO')
  }
}
if (!process.env.ENCRYPTION_KEY) {
  const emDev = process.env.NODE_ENV !== 'production'
  if (API_COCKPIT_SIDECAR || emDev) {
    console.warn('[API-Cockpit] ENCRYPTION_KEY ausente — rotas de criptografia (criar token) falharão')
  } else {
    throw new Error('[API-Cockpit] Variavel de ambiente obrigatoria ausente: ENCRYPTION_KEY')
  }
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
import { oauthTokenRouter } from './routes/oauth-token'
import { webhooksIntegracaoRouter } from './routes/webhooks-integracao'
import { requireInternalKey } from './middleware/requireInternalKey'
import { rateLimitPresets } from '../../../middleware/rateLimiter'
import { iniciarWorkerRetencao, pararWorkerRetencao } from './workers/retencao-log-requisicao-api'
import {
  iniciarWorkerWebhookDispatcher,
  pararWorkerWebhookDispatcher,
} from './workers/webhook-dispatcher'
import {
  criarSidecarListenReady,
  registrarErroListenSidecar,
} from '../../../middleware/sidecar-listen-ready.js'
import { PrismaModeloNaoProvisionadoError } from './lib/assert-prisma-delegate.js'

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
app.use('/api/v1/cockpit/webhooks-integracao', requireInternalKey, webhooksIntegracaoRouter)
app.use('/api/v1/cockpit/oauth',              oauthTokenRouter)
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
  if (err instanceof PrismaModeloNaoProvisionadoError) {
    return res.status(503).json({ error: err.message, code: err.code })
  }
  const e = err as { statusCode?: number; message?: string }
  return res.status(e.statusCode ?? 500).json({
    error: e.message ?? 'Internal Server Error'
  })
})

const PORT = 8016

const listenHandles = criarSidecarListenReady(API_COCKPIT_SIDECAR, PORT, 'api-cockpit')
export const sidecarListenReady = listenHandles.sidecarListenReady

const server = app.listen(PORT, () => {
  console.log(`[api-cockpit] Servidor rodando na porta ${PORT}`)
  iniciarWorkerRetencao()
  iniciarWorkerWebhookDispatcher()
  listenHandles.aoSubirListen()
})
registrarErroListenSidecar(server, listenHandles, API_COCKPIT_SIDECAR, PORT, 'api-cockpit')

// Graceful shutdown — Railway envia SIGTERM em deploy/restart.
// Sem isso, setTimeout do worker pode disparar com prisma desconectado.
// Como sidecar, NÃO registra shutdown handlers — o processo do Configurador
// é quem gerencia o lifecycle. process.exit() mataria o Configurador inteiro.
if (!API_COCKPIT_SIDECAR) {
  const shutdown = (sinal: string) => {
    console.log(`[api-cockpit] recebido ${sinal}, encerrando...`)
    pararWorkerRetencao()
    pararWorkerWebhookDispatcher()
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
}
