/**
 * sentry.ts — Wrapper de observabilidade para o serviço de histórico.
 *
 * Abstrai Sentry para que o código não quebre se o pacote não estiver instalado.
 * Em produção: instalar `@sentry/node` e definir SENTRY_DSN no ambiente.
 *
 * Uso:
 *   import { captureException, captureMessage } from '../lib/sentry.js'
 *   captureMessage('DLQ_ALERT', 'error', { count: 3 })
 *   captureException(err, { module: 'audit' })
 */

type SentryLevel = 'fatal' | 'error' | 'warning' | 'info' | 'debug'
type SentryExtra = Record<string, unknown>

let _sentry: {
  captureException: (err: unknown, extra?: SentryExtra) => void
  captureMessage: (msg: string, level?: SentryLevel, extra?: SentryExtra) => void
} | null = null

// Tenta carregar @sentry/node dinamicamente — não falha se ausente
async function loadSentry() {
  if (_sentry !== null) return
  try {
    const Sentry = await import('@sentry/node' as string)
    const dsn = process.env.SENTRY_DSN
    if (dsn) {
      Sentry.init({ dsn, environment: process.env.NODE_ENV ?? 'development' })
      _sentry = {
        captureException: (err, extra) =>
          Sentry.withScope((scope: any) => {
            if (extra) scope.setExtras(extra)
            Sentry.captureException(err)
          }),
        captureMessage: (msg, level = 'error', extra) =>
          Sentry.withScope((scope: any) => {
            if (extra) scope.setExtras(extra)
            scope.setLevel(level)
            Sentry.captureMessage(msg)
          }),
      }
    }
  } catch {
    // @sentry/node não instalado — modo degradado
    _sentry = {
      captureException: () => {},
      captureMessage: () => {},
    }
  }
}

// Inicializa em background no startup
loadSentry()

export function captureException(err: unknown, extra?: SentryExtra): void {
  if (_sentry) {
    _sentry.captureException(err, extra)
  }
  // Log estruturado sempre (Sentry é complementar)
  console.error('[sentry]', extra ?? {}, err)
}

export function captureMessage(
  msg: string,
  level: SentryLevel = 'error',
  extra?: SentryExtra
): void {
  if (_sentry) {
    _sentry.captureMessage(msg, level, extra)
  }
  const logFn = level === 'info' || level === 'debug' ? console.info : console.error
  logFn(`[sentry:${level}] ${msg}`, extra ?? {})
}
