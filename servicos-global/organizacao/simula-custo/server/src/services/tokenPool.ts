/**
 * tokenPool.ts — Token Pool Service
 * Mantém hCaptchaTokens resolvidos em background para evitar latência de 15–45s por requisição.
 * Skill: antigravity-simulacusto (Anti-Captcha Strategy)
 *
 * Estratégia:
 * - Pool de até 5 tokens válidos por 120 segundos
 * - Background solving a cada 30 segundos
 * - Fallback síncrono se pool estiver vazio
 * - Circuit breaker após 3 falhas consecutivas (suspende 60s)
 */

import { CapSolver } from '../connectors/capsolver.js'

interface ResolvedToken {
  token: string
  createdAt: number
}

const TOKEN_TTL_MS = 120_000       // 120 segundos (conforme PRD)
const POOL_MAX_SIZE = 5            // 5 tokens em reserva
const RESOLVE_INTERVAL_MS = 30_000 // checa o pool a cada 30s

export class TokenPoolService {
  private pool: ResolvedToken[] = []
  private solver = new CapSolver()
  private isResolving = false
  private consecutiveFailures = 0
  private circuitOpenUntil = 0

  start() {
    this.startBackgroundSolving()
    console.log('[TokenPool] Pool iniciado.')
  }

  /**
   * Pega um token do pool.
   * Se não houver, dispara resolução síncrona como fallback.
   */
  async getToken(): Promise<string> {
    this.cleanupExpiredTokens()

    if (this.pool.length > 0) {
      const { token } = this.pool.shift()!
      console.log(`[TokenPool] Token recuperado. (Restantes: ${this.pool.length})`)
      return token
    }

    // Fallback: Resolução síncrona
    console.log('[TokenPool] Pool vazio. Resolvendo síncronamente...')
    return this.solver.solve()
  }

  private cleanupExpiredTokens() {
    const now = Date.now()
    this.pool = this.pool.filter(t => (now - t.createdAt) < TOKEN_TTL_MS)
  }

  private startBackgroundSolving() {
    setInterval(async () => {
      this.cleanupExpiredTokens()

      // Circuit breaker aberto?
      if (Date.now() < this.circuitOpenUntil) return

      if (this.pool.length < POOL_MAX_SIZE && !this.isResolving) {
        this.isResolving = true
        try {
          console.log(`[TokenPool] Pool em ${this.pool.length}/${POOL_MAX_SIZE}. Resolvendo...`)
          const token = await this.solver.solve()
          this.pool.push({ token, createdAt: Date.now() })
          this.consecutiveFailures = 0
          console.log(`[TokenPool] Token resolvido. (Total: ${this.pool.length})`)
        } catch (e: unknown) {
          this.consecutiveFailures++
          const err = e as { message?: string }
          console.error('[TokenPool] Erro na resolução:', err.message)

          // Circuit breaker: após 3 falhas, suspende por 60s
          if (this.consecutiveFailures >= 3) {
            this.circuitOpenUntil = Date.now() + 60_000
            console.warn('[TokenPool] Circuit breaker ativado. Suspenso por 60s.')
          }
        } finally {
          this.isResolving = false
        }
      }
    }, RESOLVE_INTERVAL_MS)
  }
}

// Singleton
export const tokenPool = new TokenPoolService()
