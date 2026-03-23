// server/lib/retry.ts
// Retry com backoff exponencial para chamadas ERP.
//
// Sequência de espera:
//   Tentativa 1: 1s  (1000 ms)
//   Tentativa 2: 4s  (4000 ms)
//   Tentativa 3: 16s (16000 ms)
//
// Base configurável via RetryOptions.baseDelayMs (padrão: 1000 ms).
// Multiplicador: 4x por tentativa (base * 4^attempt).

import { AppError } from './app-error.js'

export interface RetryOptions {
  maxAttempts?: number    // default: 3
  baseDelayMs?: number    // default: 1000 (1s)
  multiplier?: number     // default: 4
  onRetry?: (attempt: number, delayMs: number, error: unknown) => void
}

/**
 * Calcula o delay em ms para a tentativa dada (0-indexed).
 * delay = baseDelayMs * multiplier^attempt
 *
 * Com padrões: 1000 * 4^0 = 1000, 1000 * 4^1 = 4000, 1000 * 4^2 = 16000
 */
export function calcDelay(attempt: number, baseDelayMs = 1000, multiplier = 4): number {
  return baseDelayMs * Math.pow(multiplier, attempt)
}

/**
 * Executa fn com retry e backoff exponencial.
 * Lança o último erro após esgotar todas as tentativas.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3
  const baseDelayMs = options.baseDelayMs ?? 1000
  const multiplier = options.multiplier ?? 4
  const onRetry = options.onRetry

  let lastError: unknown

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err

      // Não retentar em erros de configuração/auth
      if (err instanceof AppError) {
        const noRetry = ['CRYPTO_CONFIG_ERROR', 'UNAUTHORIZED', 'FORBIDDEN', 'NOT_FOUND']
        if (noRetry.includes(err.code)) throw err
      }

      if (attempt < maxAttempts - 1) {
        const delayMs = calcDelay(attempt, baseDelayMs, multiplier)
        onRetry?.(attempt + 1, delayMs, err)
        await sleep(delayMs)
      }
    }
  }

  throw lastError
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
