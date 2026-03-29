/**
 * logger.ts — Logger estruturado para todos os servicos Gravity
 *
 * Substitui console.log com formato JSON estruturado em producao.
 * Em desenvolvimento, usa formato legivel com cores.
 *
 * Uso:
 *   import { logger } from '@tenant/middleware/logger'
 *   logger.info('Operacao concluida', { tenantId, userId, action: 'create' })
 *   logger.error('Falha na query', { error: err.message, correlationId })
 *   logger.warn('Rate limit proximo', { ip, count: 95, max: 100 })
 *
 * Em producao, a saida JSON e compativel com:
 *   - Railway Logs (JSON auto-parsed)
 *   - Sentry (via @sentry/node, quando integrado)
 *   - DataDog (via dd-trace, quando integrado)
 *   - ELK Stack (via Filebeat JSON input)
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  service: string
  timestamp: string
  correlationId?: string
  tenantId?: string
  userId?: string
  [key: string]: unknown
}

const SERVICE_NAME = process.env.SERVICE_NAME || 'gravity'
const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const LOG_LEVEL = (process.env.LOG_LEVEL || (IS_PRODUCTION ? 'info' : 'debug')) as LogLevel

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

function shouldLog(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[LOG_LEVEL]
}

function formatLog(entry: LogEntry): string {
  if (IS_PRODUCTION) {
    // JSON estruturado para parsing automatico
    return JSON.stringify(entry)
  }

  // Formato legivel para desenvolvimento
  const { level, message, service, timestamp, ...rest } = entry
  const meta = Object.keys(rest).length > 0 ? ` ${JSON.stringify(rest)}` : ''
  return `[${timestamp.split('T')[1]?.slice(0, 8) || timestamp}] [${level.toUpperCase()}] [${service}] ${message}${meta}`
}

function log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  if (!shouldLog(level)) return

  const entry: LogEntry = {
    level,
    message,
    service: SERVICE_NAME,
    timestamp: new Date().toISOString(),
    ...meta,
  }

  const formatted = formatLog(entry)

  switch (level) {
    case 'error':
      console.error(formatted)
      break
    case 'warn':
      console.warn(formatted)
      break
    default:
      console.log(formatted)
  }
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => log('debug', message, meta),
  info: (message: string, meta?: Record<string, unknown>) => log('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log('error', message, meta),

  /** Cria um child logger com contexto fixo (tenant, user, correlation) */
  child(context: Record<string, unknown>) {
    return {
      debug: (message: string, meta?: Record<string, unknown>) => log('debug', message, { ...context, ...meta }),
      info: (message: string, meta?: Record<string, unknown>) => log('info', message, { ...context, ...meta }),
      warn: (message: string, meta?: Record<string, unknown>) => log('warn', message, { ...context, ...meta }),
      error: (message: string, meta?: Record<string, unknown>) => log('error', message, { ...context, ...meta }),
    }
  },
}
