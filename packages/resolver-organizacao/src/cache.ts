/**
 * Cache in-memory de `ContextoOrganizacao`.
 *
 * - TTL passivo: entrada expira no próximo `get` após o prazo.
 * - Dual index: `byUsuario` (leitura rápida) + `organizacaoToUsuarios` (invalidação em massa).
 * - Thread-safe para Node.js single-thread: sem race conditions relevantes.
 *
 * v1.1 (roadmap): suporte a Redis distribuído — múltiplas instâncias compartilham o cache.
 * Por enquanto, cada instância mantém seu próprio estado in-memory.
 */

import type { ContextoOrganizacao } from './types.js';

interface CacheEntry {
  ctx: ContextoOrganizacao;
  expiresAt: number;
}

export interface CacheOrganizacaoOptions {
  /** TTL em ms. Default: 60_000 (1 minuto). */
  ttlMs?: number;
}

export class CacheOrganizacao {
  /** Índice primário: idUsuario → entry. */
  private readonly byUsuario = new Map<string, CacheEntry>();
  /** Índice reverso: idOrganizacao → Set<idUsuario> para invalidação em massa. */
  private readonly organizacaoToUsuarios = new Map<string, Set<string>>();
  private readonly ttlMs: number;

  constructor(options: CacheOrganizacaoOptions = {}) {
    this.ttlMs = options.ttlMs ?? 60_000;
  }

  /**
   * Busca contexto pelo idUsuario.
   * Retorna `null` se ausente ou expirado (evicção lazy).
   */
  get(idUsuario: string): ContextoOrganizacao | null {
    const entry = this.byUsuario.get(idUsuario);
    if (entry === undefined) return null;

    if (Date.now() > entry.expiresAt) {
      this.evict(idUsuario, entry.ctx.idOrganizacao);
      return null;
    }

    return entry.ctx;
  }

  /**
   * Insere ou atualiza o contexto de um usuário.
   * Mantém o índice reverso `organizacaoToUsuarios` sincronizado para invalidação cruzada.
   */
  set(idUsuario: string, ctx: ContextoOrganizacao): void {
    // Se o usuário já estava cacheado para outra organização (troca de workspace),
    // remove a entrada antiga do índice reverso da organização anterior.
    const existing = this.byUsuario.get(idUsuario);
    if (existing !== undefined && existing.ctx.idOrganizacao !== ctx.idOrganizacao) {
      this.removeFromReverseIndex(idUsuario, existing.ctx.idOrganizacao);
    }

    const expiresAt = Date.now() + this.ttlMs;
    this.byUsuario.set(idUsuario, { ctx, expiresAt });

    // Atualiza índice reverso
    let usuarios = this.organizacaoToUsuarios.get(ctx.idOrganizacao);
    if (usuarios === undefined) {
      usuarios = new Set<string>();
      this.organizacaoToUsuarios.set(ctx.idOrganizacao, usuarios);
    }
    usuarios.add(idUsuario);
  }

  /**
   * Invalida TODAS as entradas de uma organização — disparado por evento `OrganizacaoAtualizada`.
   */
  invalidateByOrganizacao(idOrganizacao: string): void {
    const usuarios = this.organizacaoToUsuarios.get(idOrganizacao);
    if (usuarios === undefined) return;

    for (const idUsuario of usuarios) {
      this.byUsuario.delete(idUsuario);
    }
    this.organizacaoToUsuarios.delete(idOrganizacao);
  }

  /**
   * Invalida a entrada de um usuário — disparado por evento `UsuarioRemocaoSolicitada`.
   */
  invalidateByUsuario(idUsuario: string): void {
    const entry = this.byUsuario.get(idUsuario);
    if (entry === undefined) return;
    this.evict(idUsuario, entry.ctx.idOrganizacao);
  }

  /** Número de entradas no cache (inclui expiradas ainda não evictadas). */
  size(): number {
    return this.byUsuario.size;
  }

  /** Remove entrada e limpa índice reverso. */
  private evict(idUsuario: string, idOrganizacao: string): void {
    this.byUsuario.delete(idUsuario);
    this.removeFromReverseIndex(idUsuario, idOrganizacao);
  }

  private removeFromReverseIndex(idUsuario: string, idOrganizacao: string): void {
    const usuarios = this.organizacaoToUsuarios.get(idOrganizacao);
    if (usuarios === undefined) return;
    usuarios.delete(idUsuario);
    if (usuarios.size === 0) {
      this.organizacaoToUsuarios.delete(idOrganizacao);
    }
  }
}
