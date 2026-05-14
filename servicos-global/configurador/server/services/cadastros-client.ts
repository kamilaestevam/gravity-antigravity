/**
 * cadastrosClient.ts — Cliente HTTP para o serviço Cadastros.
 *
 * Este módulo é o ÚNICO ponto do Configurador que fala com Cadastros via REST.
 *
 * Contratos (Mandamento 09): importa `criarEmpresaSchema` e `empresaSchema`
 * diretamente de `servicos-global/tenant/cadastros/shared/schemas` — schema
 * bilateral, nunca duplicar.
 *
 * Autenticação: header `x-internal-key` (INTERNAL_SERVICE_KEY).
 * Tenant: header `x-organizacao-id` (id da Organizacao dona da Empresa).
 * Observabilidade: header `x-correlation-id` propagado para rastrear a saga
 * de ponta a ponta entre os dois serviços.
 *
 * Timeout: 5s (onboarding é síncrono, não deve segurar o usuário).
 *
 * Compensação de saga: `compensarEmpresa()` faz hard delete via rota dedicada
 * `DELETE /empresas/:suid/compensacao`. Se a compensação falhar, grava log
 * estruturado de dead-letter (conforme decisão da Fase 3 — sem tabela de DLQ).
 */

import {
  criarEmpresaSchema,
  empresaSchema,
  listaEmpresasSchema,
  type CriarEmpresaInput,
  type Empresa,
} from '../../../cadastros/shared/schemas/index.js'
import { AppError } from '../lib/appError.js'
import { logger } from '../lib/logger.js'

const log = logger.child({ module: 'cadastros-client' })

const FETCH_TIMEOUT_MS = 5_000

// Lazy getters — evita ESM top-level read antes de dotenv/--env-file (Mand. 08)
// NOTA: porta corrigida de 8030 (Pedido) para 8031 (Cadastros) — contracts.json
function getCadastrosUrl(): string {
  return process.env.CADASTROS_SERVICE_URL ?? 'http://localhost:8031'
}
function getChaveInterna(): string {
  const chave = process.env.CHAVE_INTERNA_SERVICO ?? process.env.INTERNAL_SERVICE_KEY
  if (!chave) console.warn('[cadastros-client] CHAVE_INTERNA_SERVICO ausente — chamadas ao Cadastros falharão')
  return chave ?? ''
}

export interface CadastrosRequestContext {
  id_organizacao: string
  correlation_id: string
}

function headersPadrao(ctx: CadastrosRequestContext): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'x-internal-key': getChaveInterna(),
    'x-organizacao-id': ctx.id_organizacao,
    'x-correlation-id': ctx.correlation_id,
  }
}

async function lerCorpoErro(response: Response): Promise<string> {
  try {
    const body = await response.text()
    return body.slice(0, 500)
  } catch {
    return '<corpo ilegível>'
  }
}

/**
 * Cria uma Empresa em Cadastros e retorna o registro persistido.
 *
 * - Valida o payload localmente com `criarEmpresaSchema` (fail-fast antes da rede)
 * - Valida a resposta com `empresaSchema` (contrato bilateral)
 * - Lança `AppError` preservando código/mensagem de origem nos 4xx; 5xx e
 *   falhas de rede viram 503 para o caller decidir retry/compensação
 */
export async function criarEmpresa(
  input: CriarEmpresaInput,
  ctx: CadastrosRequestContext,
): Promise<Empresa> {
  const payload = criarEmpresaSchema.parse(input)

  log.info('cadastros.criar_empresa.start', {
    correlation_id: ctx.correlation_id,
    id_organizacao: ctx.id_organizacao,
    pais: payload.pais_empresa,
  })

  let response: Response
  try {
    response = await fetch(`${getCadastrosUrl()}/empresas`, {
      method: 'POST',
      headers: headersPadrao(ctx),
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
  } catch (err) {
    log.error('cadastros.criar_empresa.network_failure', {
      correlation_id: ctx.correlation_id,
      id_organizacao: ctx.id_organizacao,
      error: err instanceof Error ? err.message : String(err),
    })
    throw new AppError(
      'Serviço Cadastros indisponível (rede/timeout)',
      503,
      'CADASTROS_INDISPONIVEL',
    )
  }

  if (!response.ok) {
    const corpo = await lerCorpoErro(response)
    log.warn('cadastros.criar_empresa.http_error', {
      correlation_id: ctx.correlation_id,
      id_organizacao: ctx.id_organizacao,
      status: response.status,
      body: corpo,
    })
    if (response.status >= 400 && response.status < 500) {
      throw new AppError(
        `Cadastros rejeitou a criação de Empresa: ${corpo}`,
        response.status,
        'CADASTROS_VALIDACAO',
      )
    }
    throw new AppError(
      `Cadastros falhou com status ${response.status}`,
      503,
      'CADASTROS_INDISPONIVEL',
    )
  }

  const raw = await response.json()
  const empresa = empresaSchema.parse(raw)
  log.info('cadastros.criar_empresa.success', {
    correlation_id: ctx.correlation_id,
    id_organizacao: ctx.id_organizacao,
    suid: empresa.suid_empresa,
  })
  return empresa
}

/**
 * Lista Empresas de uma Organizacao em Cadastros. Usado pelo backfill para
 * detectar Empresas criadas em tentativas anteriores (idempotência) antes de
 * decidir se chama `criarEmpresa` de novo.
 */
export async function listarEmpresasPorOrganizacao(
  ctx: CadastrosRequestContext,
): Promise<Empresa[]> {
  const response = await fetch(
    `${getCadastrosUrl()}/empresas?id_organizacao=${encodeURIComponent(ctx.id_organizacao)}&por_pagina=200`,
    {
      method: 'GET',
      headers: headersPadrao(ctx),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    },
  )
  if (!response.ok) {
    const corpo = await lerCorpoErro(response)
    throw new AppError(
      `Cadastros falhou ao listar empresas: ${response.status} ${corpo}`,
      response.status >= 500 ? 503 : response.status,
      'CADASTROS_LISTA_FALHOU',
    )
  }
  const raw = await response.json()
  const lista = listaEmpresasSchema.parse(raw)
  return lista.itens
}

/**
 * Compensação de saga: hard delete da Empresa criada em Cadastros quando a
 * criação da Organizacao no Configurador falhou depois.
 *
 * Se a compensação também falhar, grava log estruturado de dead-letter com
 * todos os dados necessários para reconciliação manual. NÃO lança — a saga
 * já está em estado de falha, o caller já vai propagar o erro original.
 */
export async function compensarEmpresa(
  suid: string,
  ctx: CadastrosRequestContext,
  causaOriginal: string,
): Promise<void> {
  log.warn('cadastros.compensar.start', {
    correlation_id: ctx.correlation_id,
    id_organizacao: ctx.id_organizacao,
    suid,
    causa_original: causaOriginal,
  })

  try {
    const response = await fetch(
      `${getCadastrosUrl()}/empresas/${encodeURIComponent(suid)}/compensacao`,
      {
        method: 'DELETE',
        headers: headersPadrao(ctx),
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      },
    )

    if (!response.ok) {
      const corpo = await lerCorpoErro(response)
      log.error('cadastros.compensar.dead_letter', {
        correlation_id: ctx.correlation_id,
        id_organizacao: ctx.id_organizacao,
        suid,
        status: response.status,
        body: corpo,
        causa_original: causaOriginal,
        acao_manual:
          'Remover fisicamente a Empresa do banco gravity-cadastros-* via DELETE direto ou script — registro órfão sem Organizacao correspondente.',
      })
      return
    }

    log.info('cadastros.compensar.success', {
      correlation_id: ctx.correlation_id,
      id_organizacao: ctx.id_organizacao,
      suid,
    })
  } catch (err) {
    log.error('cadastros.compensar.dead_letter', {
      correlation_id: ctx.correlation_id,
      id_organizacao: ctx.id_organizacao,
      suid,
      error: err instanceof Error ? err.message : String(err),
      causa_original: causaOriginal,
      acao_manual:
        'Remover fisicamente a Empresa do banco gravity-cadastros-* via DELETE direto ou script — registro órfão sem Organizacao correspondente.',
    })
  }
}
