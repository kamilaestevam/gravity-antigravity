/**
 * Listener do Event Bus para invalidação de cache.
 *
 * Eventos consumidos (ADR-002 §7):
 *   OrganizacaoAtualizada       → cache.invalidateByOrganizacao(event.idOrganizacao)
 *   UsuarioRemocaoSolicitada    → cache.invalidateByUsuario(event.idUsuario)
 *   OrganizacaoProvisionada     → no-op no resolver (worker separado cria o schema)
 *
 * Sprint 1: graceful degradation — sem Redis, o cache expira por TTL.
 * Sprint 2: implementar worker BullMQ que consome fila Redis.
 */

import type { CacheOrganizacao } from './cache.js';
import { getLogger } from './observability.js';

export interface EventBusListener {
  /** Inicia a escuta de eventos. Idempotente. */
  start(): void;
  /** Para e libera recursos. Idempotente. */
  stop(): Promise<void>;
}

export interface OrganizacaoAtualizadaEvent {
  type: 'OrganizacaoAtualizada';
  idOrganizacao: string;
}

export interface UsuarioRemocaoSolicitadaEvent {
  type: 'UsuarioRemocaoSolicitada';
  idUsuario: string;
}

export type CacheInvalidationEvent =
  | OrganizacaoAtualizadaEvent
  | UsuarioRemocaoSolicitadaEvent;

/**
 * Cria um listener de event bus para invalidação de cache.
 *
 * @param cache     Instância do CacheOrganizacao a invalidar.
 * @param redisUrl  URL do Redis. Se ausente, retorna um no-op (Sprint 1).
 */
export function createEventBusListener(
  cache: CacheOrganizacao,
  redisUrl?: string,
): EventBusListener {
  const log = getLogger();

  if (!redisUrl) {
    // Sem Redis: cache invalida apenas por TTL. Aceitável para instâncias únicas.
    log.info(
      { redisUrl: null },
      'EventBusListener: Redis não configurado — invalidação de cache apenas por TTL',
    );

    return {
      start: () => { /* no-op */ },
      stop: async () => { /* no-op */ },
    };
  }

  // Sprint 2: conectar ao BullMQ para consumir OrganizacaoAtualizada + UsuarioRemocaoSolicitada.
  // Interface já definida para facilitar a implementação futura.
  // TODO(sprint2): import BullMQ, criar Worker, mapear eventos → cache.invalidate*
  log.warn(
    { redisUrl },
    'EventBusListener: BullMQ não implementado (Sprint 2) — usando no-op',
  );

  return {
    start: () => { /* no-op até Sprint 2 */ },
    stop: async () => { /* no-op */ },
  };
}

/**
 * Processa um evento de invalidação diretamente (sem bus).
 *
 * Útil para testes e para o caso de invalidação síncrona dentro do próprio
 * serviço (ex.: admin que altera tipos do usuário recebe o evento na mesma instância).
 */
export function processInvalidationEvent(
  cache: CacheOrganizacao,
  event: CacheInvalidationEvent,
): void {
  switch (event.type) {
    case 'OrganizacaoAtualizada':
      cache.invalidateByOrganizacao(event.idOrganizacao);
      break;
    case 'UsuarioRemocaoSolicitada':
      cache.invalidateByUsuario(event.idUsuario);
      break;
  }
}
