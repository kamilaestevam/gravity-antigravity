/**
 * persist-audit-event.ts — ponto único de gravação fire-and-forget
 *
 * 1. Com ORGANIZACAO_DATABASE_URL (Configurador embutido / mesmo processo):
 *    AuditService.log direto na fila pg-boss.
 * 2. Sem banco local: HTTP S2S para /api/v1/internal/historico/logs no Configurador.
 */

import type { AuditLogPayload } from './audit-types.js'
import type { AuditLogInput } from '../server/services/audit.service.js'
import { AcaoExecutadaPor, EventoStatus } from '../../generated/index.js'

const INTERNAL_KEY = process.env.CHAVE_INTERNA_SERVICO ?? ''

const MAX_RETRY_ATTEMPTS = 3
const RETRY_BASE_DELAY_MS = 300

function resolveHistoricoBaseUrl(): string {
  return (
    process.env.HISTORICO_URL ??
    process.env.CONFIGURADOR_BASE_URL ??
    process.env.CONFIGURADOR_URL ??
    'http://localhost:8005'
  )
}

function enriquecerPayload(payload: AuditLogPayload): AuditLogPayload {
  return {
    ...payload,
    id_usuario:
      payload.id_usuario ??
      (payload.tipo_ator_historico_log === 'USUARIO' ? payload.id_ator_historico_log : undefined),
  }
}

function paraAuditInput(payload: AuditLogPayload): AuditLogInput {
  return {
    id_organizacao: payload.id_organizacao,
    tipo_ator_historico_log: payload.tipo_ator_historico_log as AcaoExecutadaPor,
    id_ator_historico_log: payload.id_ator_historico_log,
    nome_ator_historico_log: payload.nome_ator_historico_log,
    ip_ator_historico_log: payload.ip_ator_historico_log,
    metadata_ator_historico_log: payload.metadata_ator_historico_log,
    modulo_historico_log: payload.modulo_historico_log,
    tipo_recurso_historico_log: payload.tipo_recurso_historico_log,
    id_recurso_historico_log: payload.id_recurso_historico_log,
    acao_historico_log: payload.acao_historico_log,
    detalhe_acao_historico_log: payload.detalhe_acao_historico_log,
    estado_anterior_historico_log: payload.estado_anterior_historico_log,
    estado_posterior_historico_log: payload.estado_posterior_historico_log,
    status_historico_log: payload.status_historico_log as EventoStatus | undefined,
    mensagem_erro_historico_log: payload.mensagem_erro_historico_log,
    id_produto_historico_log: payload.id_produto_historico_log,
    id_usuario: payload.id_usuario,
  }
}

async function fetchWithRetry(url: string, init: RequestInit, attempt = 0): Promise<void> {
  try {
    const res = await fetch(url, init)
    if (res.status >= 400 && res.status < 500) {
      console.error(`[audit-client] Payload inválido (${res.status}) — log descartado`)
      return
    }
    if (!res.ok && attempt < MAX_RETRY_ATTEMPTS - 1) {
      await new Promise((r) => setTimeout(r, RETRY_BASE_DELAY_MS * Math.pow(2, attempt)))
      return fetchWithRetry(url, init, attempt + 1)
    }
    if (!res.ok) {
      console.error(`[audit-client] FALHA_DEFINITIVA HTTP ${res.status} — log perdido`)
    }
  } catch {
    if (attempt < MAX_RETRY_ATTEMPTS - 1) {
      await new Promise((r) => setTimeout(r, RETRY_BASE_DELAY_MS * Math.pow(2, attempt)))
      return fetchWithRetry(url, init, attempt + 1)
    }
    console.error(`[audit-client] FALHA_DEFINITIVA após ${MAX_RETRY_ATTEMPTS} tentativas — log perdido`)
  }
}

function persistirViaHttp(payload: AuditLogPayload): void {
  const url = `${resolveHistoricoBaseUrl()}/api/v1/internal/historico/logs`
  const { id_organizacao, ...body } = payload

  void fetchWithRetry(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-id-organizacao': id_organizacao,
      'x-chave-interna-servico': INTERNAL_KEY,
    },
    body: JSON.stringify(body),
  })
}

/**
 * Enfileira audit log — nunca bloqueia a operação principal.
 */
export function persistAuditEvent(payload: AuditLogPayload): void {
  const enriquecido = enriquecerPayload(payload)

  if (process.env.ORGANIZACAO_DATABASE_URL) {
    void import('../server/services/audit.service.js')
      .then(({ AuditService }) =>
        AuditService.log(paraAuditInput(enriquecido)).catch((err: unknown) => {
          console.error('[persistAuditEvent] AuditService.log falhou', {
            id_organizacao: enriquecido.id_organizacao,
            acao_historico_log: enriquecido.acao_historico_log,
            erro: err instanceof Error ? err.message : String(err),
          })
        }),
      )
      .catch((err: unknown) => {
        console.error('[persistAuditEvent] import AuditService falhou', err)
        persistirViaHttp(enriquecido)
      })
    return
  }

  persistirViaHttp(enriquecido)
}
