/**
 * cadastrosClient.ts — Cliente HTTP para o serviço Cadastros.
 *
 * Contratos (Mandamento 09):
 * - Empresa (1:1 org): cadastros/shared/schemas/empresa.schema.ts
 * - Fornecedor (parceiros): cadastros/shared/schemas/fornecedor.schema.ts
 */

import {
  criarEmpresaSchema,
  empresaSchema,
  type CriarEmpresaInput,
  type Empresa,
} from '../../../cadastros/shared/schemas/empresa.schema.js'
import {
  criarFornecedorSchema,
  fornecedorSchema,
  listaFornecedoresSchema,
  type CriarFornecedorInput,
  type Fornecedor,
} from '../../../cadastros/shared/schemas/fornecedor.schema.js'
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
    id_empresa: empresa.id_empresa,
  })
  return empresa
}

export async function obterEmpresaDaOrganizacao(
  ctx: CadastrosRequestContext,
): Promise<Empresa | null> {
  const response = await fetch(`${getCadastrosUrl()}/empresas/da-organizacao`, {
    method: 'GET',
    headers: headersPadrao(ctx),
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  })
  if (response.status === 404) return null
  if (!response.ok) {
    const corpo = await lerCorpoErro(response)
    throw new AppError(
      `Cadastros falhou ao obter Empresa da org: ${response.status} ${corpo}`,
      response.status >= 500 ? 503 : response.status,
      'CADASTROS_EMPRESA_FALHOU',
    )
  }
  const raw = await response.json()
  return empresaSchema.parse(raw)
}

export async function compensarEmpresa(
  idEmpresa: string,
  ctx: CadastrosRequestContext,
  causaOriginal: string,
): Promise<void> {
  log.warn('cadastros.compensar_empresa.start', {
    correlation_id: ctx.correlation_id,
    id_organizacao: ctx.id_organizacao,
    id_empresa: idEmpresa,
    causa_original: causaOriginal,
  })

  try {
    const response = await fetch(
      `${getCadastrosUrl()}/empresas/${encodeURIComponent(idEmpresa)}/compensacao`,
      {
        method: 'DELETE',
        headers: headersPadrao(ctx),
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      },
    )

    if (!response.ok) {
      const corpo = await lerCorpoErro(response)
      log.error('cadastros.compensar_empresa.dead_letter', {
        correlation_id: ctx.correlation_id,
        id_organizacao: ctx.id_organizacao,
        id_empresa: idEmpresa,
        status: response.status,
        body: corpo,
        causa_original: causaOriginal,
        acao_manual:
          'Remover fisicamente a Empresa do banco gravity-cadastros-* — registro órfão sem Organizacao correspondente.',
      })
      return
    }

    log.info('cadastros.compensar_empresa.success', {
      correlation_id: ctx.correlation_id,
      id_organizacao: ctx.id_organizacao,
      id_empresa: idEmpresa,
    })
  } catch (err) {
    log.error('cadastros.compensar_empresa.dead_letter', {
      correlation_id: ctx.correlation_id,
      id_organizacao: ctx.id_organizacao,
      id_empresa: idEmpresa,
      error: err instanceof Error ? err.message : String(err),
      causa_original: causaOriginal,
    })
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
  escopo?: 'parceiros',
): Promise<Fornecedor[]> {
  const params = new URLSearchParams({
    id_organizacao: ctx.id_organizacao,
    por_pagina: '200',
  })
  if (escopo) params.set('escopo', escopo)

  const response = await fetch(`${getCadastrosUrl()}/fornecedores?${params.toString()}`, {
    method: 'GET',
    headers: headersPadrao(ctx),
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  })
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
