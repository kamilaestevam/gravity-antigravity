/**
 * apiObservability.ts — Middleware de observabilidade para todos os produtos Gravity
 *
 * Captura metricas de cada request API e envia para o servico api-cockpit.
 * Instalado APOS requireInternalKey e tenantIsolation nos servidores de produto.
 *
 * Dados capturados:
 *   - tenant_id, product_id, user_id
 *   - endpoint, method, status_code, latency_ms
 *   - correlation_id (para tracing distribuido)
 *
 * Envio: fire-and-forget via POST para api-cockpit (nao bloqueia a resposta)
 *
 * Uso nos produtos:
 *   import { apiObservability } from '../../../../servicos-global/tenant/middleware/apiObservability.js'
 *   app.use(apiObservability('bid-frete'))
 */

import { Request, Response, NextFunction } from 'express'
import { logger } from './logger.js'

const API_COCKPIT_URL = process.env.API_COCKPIT_URL || 'http://localhost:8016'
const INTERNAL_SERVICE_KEY = process.env.INTERNAL_SERVICE_KEY || ''
const OBSERVABILITY_ENABLED = process.env.OBSERVABILITY_ENABLED !== 'false'

/** Buffer de logs para envio em batch (reduz overhead de rede) */
const logBuffer: ObservabilityEntry[] = []
const FLUSH_INTERVAL_MS = 5_000
const MAX_BUFFER_SIZE = 50

interface ObservabilityEntry {
  id_organizacao:                   string
  id_produto_gravity:               string
  id_usuario:                       string | null
  endpoint_log_consumo:             string
  metodo_http_log_consumo:          string
  codigo_resposta_http_log_consumo: number
  latencia_ms_log_consumo:          number
  id_correlacao:                    string | null
  data_criacao_log_consumo:         string
}

/**
 * Flush do buffer — envia logs acumulados para o api-cockpit
 */
async function flushBuffer(): Promise<void> {
  if (logBuffer.length === 0) return

  const batch = logBuffer.splice(0, logBuffer.length)

  try {
    const response = await fetch(`${API_COCKPIT_URL}/api/v1/cockpit/monitoramento-api/ingestao`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-key': INTERNAL_SERVICE_KEY,
      },
      body: JSON.stringify({ entries: batch }),
      signal: AbortSignal.timeout(3_000),
    })

    if (!response.ok) {
      logger.warn('Falha ao enviar metricas para api-cockpit', {
        status: response.status,
        count: batch.length,
      })
    }
  } catch {
    // Fire-and-forget: nao bloqueia a aplicacao se cockpit estiver indisponivel
    logger.debug('api-cockpit indisponivel para metricas', { count: batch.length })
  }
}

// Timer de flush periodico
let flushTimer: ReturnType<typeof setInterval> | null = null

function ensureFlushTimer(): void {
  if (flushTimer) return
  flushTimer = setInterval(flushBuffer, FLUSH_INTERVAL_MS)
  // Nao impedir o processo de terminar
  if (flushTimer && typeof flushTimer === 'object' && 'unref' in flushTimer) {
    flushTimer.unref()
  }
}

/**
 * Middleware factory — retorna middleware configurado para o produto
 *
 * @param productId — ID do produto (ex: 'bid-frete', 'lpco', 'processo')
 */
export function apiObservability(productId: string) {
  if (OBSERVABILITY_ENABLED) {
    ensureFlushTimer()
  }

  return (req: Request, res: Response, next: NextFunction): void => {
    // Nao rastrear health checks
    if (req.path === '/health') return next()

    // Nao rastrear se desabilitado
    if (!OBSERVABILITY_ENABLED) return next()

    const startTime = Date.now()

    // Capturar no onFinish da response
    res.on('finish', () => {
      const latenciaMs = Date.now() - startTime
      const idOrganizacao = (req as { tenantId?: string }).tenantId
        || (req.headers['x-id-organizacao'] as string)
        || ''
      const idUsuario = (req.headers['x-id-usuario'] as string) || null
      const idCorrelacao = (req.headers['x-correlation-id'] as string) || null

      const entry: ObservabilityEntry = {
        id_organizacao:                   idOrganizacao,
        id_produto_gravity:               productId,
        id_usuario:                       idUsuario,
        endpoint_log_consumo:             req.path,
        metodo_http_log_consumo:          req.method,
        codigo_resposta_http_log_consumo: res.statusCode,
        latencia_ms_log_consumo:          latenciaMs,
        id_correlacao:                    idCorrelacao,
        data_criacao_log_consumo:         new Date().toISOString(),
      }

      logBuffer.push(entry)

      // Flush imediato se buffer cheio
      if (logBuffer.length >= MAX_BUFFER_SIZE) {
        flushBuffer()
      }
    })

    next()
  }
}
