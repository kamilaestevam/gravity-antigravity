/**
 * slowQueryLogger.ts — Middleware Prisma de slow query detection
 *
 * Detecta queries que ultrapassam o threshold (default: 500ms) e emite
 * um warning estruturado compatível com Railway Logs / DataDog.
 *
 * Uso:
 *   import { withSlowQueryLogger } from '@tenant/middleware/slowQueryLogger'
 *   const prisma = withSlowQueryLogger(new PrismaClient())
 *
 * Threshold configurável via variável de ambiente SLOW_QUERY_MS (default: 500).
 * Em produção, queries > 500ms indicam ausência de índice ou N+1 não tratado.
 *
 * Referência SLA: p95 ≤ 200ms por request — queries devem ficar abaixo de 100ms.
 */

import { PrismaClient } from '@prisma/client'
import { logger } from './logger.js'

const SLOW_QUERY_THRESHOLD_MS = Number(process.env.SLOW_QUERY_MS ?? 500)

/**
 * Envolve uma instância do PrismaClient com detecção de slow queries.
 * Usa $use (Prisma middleware) para interceptar todas as operações.
 *
 * @param prisma — instância base do PrismaClient
 * @param thresholdMs — limiar em ms (default: SLOW_QUERY_MS env ou 500ms)
 * @returns a mesma instância, com middleware registrado (mutação in-place)
 */
export function withSlowQueryLogger(
  prisma: PrismaClient,
  thresholdMs = SLOW_QUERY_THRESHOLD_MS,
): PrismaClient {
  prisma.$use(async (params, next) => {
    const start = Date.now()
    const result = await next(params)
    const durationMs = Date.now() - start

    if (durationMs > thresholdMs) {
      logger.warn('[slow-query] Query acima do threshold', {
        model: params.model ?? 'unknown',
        action: params.action,
        durationMs,
        thresholdMs,
      })
    }

    return result
  })

  return prisma
}
