/**
 * CacheTTL — cache in-memory genérico (Map + TTL + max size).
 *
 * Quando o monorepo adotar Redis, trocar a implementação interna mantendo
 * a mesma API pública (`get` / `set` / `invalidate` / `clear`).
 *
 * Inspirado em `tenant/dashboard/server/lib/cache.ts`, generalizado e tipado.
 */

interface EntradaCache<T> {
  valor: T
  carimbo: number
}

export interface CacheTTLOptions {
  /** TTL em milissegundos. Default: 5 minutos. */
  ttlMs?: number
  /** Máximo de entradas. Default: 1000. */
  maxEntradas?: number
}

export class CacheTTL<T> {
  private readonly mapa = new Map<string, EntradaCache<T>>()
  private readonly ttlMs: number
  private readonly maxEntradas: number

  constructor(opts: CacheTTLOptions = {}) {
    this.ttlMs = opts.ttlMs ?? 5 * 60 * 1000
    this.maxEntradas = opts.maxEntradas ?? 1000
  }

  get(chave: string): T | null {
    this.expirarVencidas()
    const entrada = this.mapa.get(chave)
    if (!entrada) return null
    if (Date.now() - entrada.carimbo >= this.ttlMs) {
      this.mapa.delete(chave)
      return null
    }
    return entrada.valor
  }

  set(chave: string, valor: T): void {
    this.expirarVencidas()
    // Reinserção move pra frente da ordem (mais novo no fim).
    this.mapa.delete(chave)
    this.mapa.set(chave, { valor, carimbo: Date.now() })
    this.evictarExcesso()
  }

  invalidate(chave: string): void {
    this.mapa.delete(chave)
  }

  clear(): void {
    this.mapa.clear()
  }

  /** Número atual de entradas (útil em testes). */
  get tamanho(): number {
    return this.mapa.size
  }

  private expirarVencidas(): void {
    const agora = Date.now()
    for (const [chave, entrada] of this.mapa) {
      if (agora - entrada.carimbo >= this.ttlMs) {
        this.mapa.delete(chave)
      }
    }
  }

  private evictarExcesso(): void {
    if (this.mapa.size <= this.maxEntradas) return
    const excedente = this.mapa.size - this.maxEntradas
    let removidas = 0
    for (const chave of this.mapa.keys()) {
      if (removidas >= excedente) break
      this.mapa.delete(chave)
      removidas++
    }
  }
}
