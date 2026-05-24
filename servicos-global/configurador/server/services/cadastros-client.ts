/**
 * cadastrosClient.ts — Cliente HTTP para o serviço Cadastros.
 *
 * Contratos (Mandamento 09): schemas em cadastros/shared/schemas/fornecedor.schema.ts
 */

import {
  criarFornecedorSchema,
  fornecedorSchema,
  listaFornecedoresSchema,
  type CriarFornecedorInput,
  type Fornecedor,
} from '../../../cadastros/shared/schemas/index.js'
import { AppError } from '../lib/appError.js'
import { logger } from '../lib/logger.js'

const log = logger.child({ module: 'cadastros-client' })

const FETCH_TIMEOUT_MS = 5_000

function getCadastrosUrl(): string {
  const base = process.env.CADASTROS_SERVICE_URL ?? 'http://localhost:8031'
  return `${base}/api/v1`
}
function getChaveInterna(): string {
  const chave = process.env.CHAVE_INTERNA_SERVICO
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

export async function criarFornecedor(
  input: CriarFornecedorInput,
  ctx: CadastrosRequestContext,
): Promise<Fornecedor> {
  const payload = criarFornecedorSchema.parse(input)

  log.info('cadastros.criar_fornecedor.start', {
    correlation_id: ctx.correlation_id,
    id_organizacao: ctx.id_organizacao,
    pais: payload.pais_fornecedor,
  })

  let response: Response
  try {
    response = await fetch(`${getCadastrosUrl()}/fornecedores`, {
      method: 'POST',
      headers: headersPadrao(ctx),
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
  } catch (err) {
    log.error('cadastros.criar_fornecedor.network_failure', {
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
    log.warn('cadastros.criar_fornecedor.http_error', {
      correlation_id: ctx.correlation_id,
      id_organizacao: ctx.id_organizacao,
      status: response.status,
      body: corpo,
    })
    if (response.status >= 400 && response.status < 500) {
      throw new AppError(
        `Cadastros rejeitou a criação de Fornecedor: ${corpo}`,
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
  const fornecedor = fornecedorSchema.parse(raw)
  log.info('cadastros.criar_fornecedor.success', {
    correlation_id: ctx.correlation_id,
    id_organizacao: ctx.id_organizacao,
    id_fornecedor: fornecedor.id_fornecedor,
  })
  return fornecedor
}

export async function listarFornecedoresPorOrganizacao(
  ctx: CadastrosRequestContext,
): Promise<Fornecedor[]> {
  const response = await fetch(
    `${getCadastrosUrl()}/fornecedores?id_organizacao=${encodeURIComponent(ctx.id_organizacao)}&por_pagina=200`,
    {
      method: 'GET',
      headers: headersPadrao(ctx),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    },
  )
  if (!response.ok) {
    const corpo = await lerCorpoErro(response)
    throw new AppError(
      `Cadastros falhou ao listar fornecedores: ${response.status} ${corpo}`,
      response.status >= 500 ? 503 : response.status,
      'CADASTROS_LISTA_FALHOU',
    )
  }
  const raw = await response.json()
  const lista = listaFornecedoresSchema.parse(raw)
  return lista.itens
}

export async function compensarFornecedor(
  idFornecedor: string,
  ctx: CadastrosRequestContext,
  causaOriginal: string,
): Promise<void> {
  log.warn('cadastros.compensar.start', {
    correlation_id: ctx.correlation_id,
    id_organizacao: ctx.id_organizacao,
    id_fornecedor: idFornecedor,
    causa_original: causaOriginal,
  })

  try {
    const response = await fetch(
      `${getCadastrosUrl()}/fornecedores/${encodeURIComponent(idFornecedor)}/compensacao`,
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
        id_fornecedor: idFornecedor,
        status: response.status,
        body: corpo,
        causa_original: causaOriginal,
        acao_manual:
          'Remover fisicamente o Fornecedor do banco gravity-cadastros-* — registro órfão sem Organizacao correspondente.',
      })
      return
    }

    log.info('cadastros.compensar.success', {
      correlation_id: ctx.correlation_id,
      id_organizacao: ctx.id_organizacao,
      id_fornecedor: idFornecedor,
    })
  } catch (err) {
    log.error('cadastros.compensar.dead_letter', {
      correlation_id: ctx.correlation_id,
      id_organizacao: ctx.id_organizacao,
      id_fornecedor: idFornecedor,
      error: err instanceof Error ? err.message : String(err),
      causa_original: causaOriginal,
    })
  }
}

/** @deprecated Use criarFornecedor */
export const criarEmpresa = criarFornecedor
/** @deprecated Use listarFornecedoresPorOrganizacao */
export const listarEmpresasPorOrganizacao = listarFornecedoresPorOrganizacao
/** @deprecated Use compensarFornecedor */
export const compensarEmpresa = compensarFornecedor
