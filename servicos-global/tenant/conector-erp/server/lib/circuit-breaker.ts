// server/lib/circuit-breaker.ts
// Circuit breaker para conexões ERP.
//
// Estados:
//   CLOSED    → operação normal, falhas incrementam contador
//   OPEN      → bloqueado após 5 falhas, aguarda RECOVERY_TIMEOUT ms
//   HALF_OPEN → permite 1 tentativa de teste após o cooldown
//
// Configuração:
//   FAILURE_THRESHOLD = 5 falhas para abrir
//   RECOVERY_TIMEOUT  = 60s de espera antes de tentar recuperar

import { AppError } from './app-error.js'

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN'

export interface CircuitBreakerOptions {
  failureThreshold?: number
  recoveryTimeoutMs?: number
  name?: string
}

export class CircuitBreaker {
  private failures = 0
  private state: CircuitState = 'CLOSED'
  private openedAt: number | null = null

  readonly failureThreshold: number
  readonly recoveryTimeoutMs: number
  readonly name: string

  constructor(options: CircuitBreakerOptions = {}) {
    this.failureThreshold = options.failureThreshold ?? 5
    this.recoveryTimeoutMs = options.recoveryTimeoutMs ?? 60_000
    this.name = options.name ?? 'circuit'
  }

  get currentState(): CircuitState {
    return this.state
  }

  get failureCount(): number {
    return this.failures
  }

  /**
   * Verifica se o circuito permite a chamada.
   * Lança AppError se estiver OPEN e o cooldown ainda não passou.
   */
  allowRequest(): boolean {
    if (this.state === 'CLOSED') return true

    if (this.state === 'OPEN') {
      const now = Date.now()
      if (this.openedAt && now - this.openedAt >= this.recoveryTimeoutMs) {
        // Tenta recuperação
        this.state = 'HALF_OPEN'
        return true
      }
      const remainingMs =
        this.recoveryTimeoutMs - (Date.now() - (this.openedAt ?? 0))
      throw new AppError(
        `Circuit breaker aberto para "${this.name}" — aguarde ${Math.ceil(remainingMs / 1000)}s`,
        503,
        'CIRCUIT_OPEN'
      )
    }

    // HALF_OPEN: permite a tentativa
    return true
  }

  /**
   * Registra sucesso — reseta o circuito para CLOSED.
   */
  onSuccess(): void {
    this.failures = 0
    this.state = 'CLOSED'
    this.openedAt = null
  }

  /**
   * Registra falha — pode abrir o circuito.
   */
  onFailure(): void {
    this.failures++

    if (this.state === 'HALF_OPEN') {
      // Falhou na tentativa de recuperação → volta para OPEN
      this.state = 'OPEN'
      this.openedAt = Date.now()
      return
    }

    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN'
      this.openedAt = Date.now()
    }
  }

  /**
   * Executa a função com proteção do circuit breaker.
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.allowRequest()
    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (err) {
      this.onFailure()
      throw err
    }
  }

  /**
   * Serializa o estado para persistir no banco.
   */
  toJSON() {
    return {
      state: this.state,
      failures: this.failures,
      openedAt: this.openedAt ? new Date(this.openedAt) : null,
    }
  }

  /**
   * Restaura o estado a partir de dados persistidos.
   */
  static fromPersisted(
    data: { circuit_failures: number; circuit_open_at: Date | null; circuit_breaker_open: boolean },
    options?: CircuitBreakerOptions
  ): CircuitBreaker {
    const cb = new CircuitBreaker(options)
    cb.failures = data.circuit_failures

    if (data.circuit_breaker_open && data.circuit_open_at) {
      const openedAt = data.circuit_open_at.getTime()
      const elapsed = Date.now() - openedAt

      if (elapsed >= cb.recoveryTimeoutMs) {
        cb.state = 'HALF_OPEN'
      } else {
        cb.state = 'OPEN'
        cb.openedAt = openedAt
      }
    }
    return cb
  }
}

// Cache em memória de circuit breakers por conexão (tenant_id+product_id chave)
const circuitBreakerCache = new Map<string, CircuitBreaker>()

export function getCircuitBreaker(key: string, options?: CircuitBreakerOptions): CircuitBreaker {
  if (!circuitBreakerCache.has(key)) {
    circuitBreakerCache.set(key, new CircuitBreaker({ ...options, name: key }))
  }
  return circuitBreakerCache.get(key)!
}

export function resetCircuitBreaker(key: string): void {
  circuitBreakerCache.delete(key)
}
