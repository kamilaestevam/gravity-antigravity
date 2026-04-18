/**
 * Cache in-memory de `TenantContext`.
 *
 * - TTL passivo: entrada expira no próximo `get` após o prazo.
 * - Dual index: `byUser` (leitura rápida) + `tenantToUsers` (invalidação em massa).
 * - Thread-safe para Node.js single-thread: sem race conditions relevantes.
 *
 * v1.1 (roadmap): suporte a Redis distribuído — múltiplas instâncias compartilham o cache.
 * Por enquanto, cada instância mantém seu próprio estado in-memory.
 */

import type { TenantContext } from './types.js';

interface CacheEntry {
  ctx: TenantContext;
  expiresAt: number;
}

export interface TenantCacheOptions {
  /** TTL em ms. Default: 60_000 (1 minuto). */
  ttlMs?: number;
}

export class TenantCache {
  /** Índice primário: userId → entry. */
  private readonly byUser = new Map<string, CacheEntry>();
  /** Índice reverso: tenantId → Set<userId> para invalidação em massa. */
  private readonly tenantToUsers = new Map<string, Set<string>>();
  private readonly ttlMs: number;

  constructor(options: TenantCacheOptions = {}) {
    this.ttlMs = options.ttlMs ?? 60_000;
  }

  /**
   * Busca contexto pelo userId.
   * Retorna `null` se ausente ou expirado (evicção lazy).
   */
  get(userId: string): TenantContext | null {
    const entry = this.byUser.get(userId);
    if (entry === undefined) return null;

    if (Date.now() > entry.expiresAt) {
      this.evict(userId, entry.ctx.tenantId);
      return null;
    }

    return entry.ctx;
  }

  /**
   * Insere ou atualiza o contexto de um usuário.
   * Mantém o índice reverso `tenantToUsers` sincronizado para invalidação cruzada.
   */
  set(userId: string, ctx: TenantContext): void {
    // Se o usuário já estava cacheado para outro tenant (troca de workspace),
    // remove a entrada antiga do índice reverso do tenant anterior.
    const existing = this.byUser.get(userId);
    if (existing !== undefined && existing.ctx.tenantId !== ctx.tenantId) {
      this.removeFromReverseIndex(userId, existing.ctx.tenantId);
    }

    const expiresAt = Date.now() + this.ttlMs;
    this.byUser.set(userId, { ctx, expiresAt });

    // Atualiza índice reverso
    let users = this.tenantToUsers.get(ctx.tenantId);
    if (users === undefined) {
      users = new Set<string>();
      this.tenantToUsers.set(ctx.tenantId, users);
    }
    users.add(userId);
  }

  /**
   * Invalida TODAS as entradas de um tenant — disparado por evento `TenantUpdated`.
   */
  invalidateByTenant(tenantId: string): void {
    const users = this.tenantToUsers.get(tenantId);
    if (users === undefined) return;

    for (const userId of users) {
      this.byUser.delete(userId);
    }
    this.tenantToUsers.delete(tenantId);
  }

  /**
   * Invalida a entrada de um usuário — disparado por evento `UserDeletionRequested`.
   */
  invalidateByUser(userId: string): void {
    const entry = this.byUser.get(userId);
    if (entry === undefined) return;
    this.evict(userId, entry.ctx.tenantId);
  }

  /** Número de entradas no cache (inclui expiradas ainda não evictadas). */
  size(): number {
    return this.byUser.size;
  }

  /** Remove entrada e limpa índice reverso. */
  private evict(userId: string, tenantId: string): void {
    this.byUser.delete(userId);
    this.removeFromReverseIndex(userId, tenantId);
  }

  private removeFromReverseIndex(userId: string, tenantId: string): void {
    const users = this.tenantToUsers.get(tenantId);
    if (users === undefined) return;
    users.delete(userId);
    if (users.size === 0) {
      this.tenantToUsers.delete(tenantId);
    }
  }
}
