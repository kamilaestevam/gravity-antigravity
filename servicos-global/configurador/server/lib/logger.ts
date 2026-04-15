// server/lib/logger.ts
// Logger estruturado mínimo para o Configurador.
// Emite JSON por linha no stdout — pronto para ser ingerido por Railway/Datadog.
// Nunca loga dados sensíveis (tokens, senhas). Usa correlation ID quando disponível.

type Level = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  module?: string
  correlation_id?: string
  actor_id?: string
  action?: string
  resource_id?: string
  [key: string]: unknown
}

const LEVEL_ORDER: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 }
const MIN_LEVEL: Level = (process.env.LOG_LEVEL as Level | undefined) ?? 'info'

function emit(level: Level, message: string, context: LogContext = {}): void {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[MIN_LEVEL]) return

  const payload = {
    ts: new Date().toISOString(),
    level,
    message,
    ...context,
  }

  // JSON por linha — parseável por qualquer agregador
  const line = JSON.stringify(payload)
  if (level === 'error' || level === 'warn') {
    process.stderr.write(line + '\n')
  } else {
    process.stdout.write(line + '\n')
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => emit('debug', message, context),
  info: (message: string, context?: LogContext) => emit('info', message, context),
  warn: (message: string, context?: LogContext) => emit('warn', message, context),
  error: (message: string, context?: LogContext) => emit('error', message, context),

  /** Cria um logger filho com contexto fixo (útil por módulo) */
  child(baseContext: LogContext) {
    return {
      debug: (message: string, context?: LogContext) => emit('debug', message, { ...baseContext, ...context }),
      info: (message: string, context?: LogContext) => emit('info', message, { ...baseContext, ...context }),
      warn: (message: string, context?: LogContext) => emit('warn', message, { ...baseContext, ...context }),
      error: (message: string, context?: LogContext) => emit('error', message, { ...baseContext, ...context }),
    }
  },
}
