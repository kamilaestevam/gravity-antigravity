/**
 * cadastrosClient.ts — Cliente HTTP do Pedido para o serviço Cadastros.
 *
 * Fase 4 do PASSO 06 DDD (greenfield): toda criação de Pedido busca as
 * Empresas envolvidas pelo SUID e grava um PedidoSnapshotEmpresa por papel
 * (importador/exportador/fabricante). Sem FK física — SUID é referência lógica.
 *
 * Contratos bilaterais (Mandamento 09): `empresaSchema` importado de
 * `tenant/cadastros/shared/schemas`. Nunca duplicar o schema Zod aqui.
 *
 * Autenticação: `x-internal-key` (CHAVE_INTERNA_SERVICO).
 * Tenant context: `x-organizacao-id` (id da Organizacao dona do Pedido).
 * Observabilidade: `x-correlation-id` propagado entre serviços.
 *
 * Timeout: 5s — o POST /pedidos é síncrono, não pode segurar o usuário.
 */

import {
  empresaSchema,
  incotermSchema,
  moedaSchema,
  ncmSchema,
  opeSchema,
  unidadeSchema,
  type Empresa,
  type Incoterm,
  type Moeda,
  type NCM,
  type OPE,
  type Unidade,
} from '../../../../cadastros/shared/schemas/index.js'
import { AppError } from './saldo-pedido.js'

const FETCH_TIMEOUT_MS = 5_000

// Lê env vars no momento da chamada (NÃO no top-level): em ES modules todos
// os `import` são içados e executam antes de `dotenv.config()`. Capturar
// `process.env.X` em const top-level resulta em valor undefined/'' mesmo
// que o .env defina X corretamente. Mandamento 08: falha alto se faltar
// CHAVE_INTERNA_SERVICO ao invés de mandar header vazio que volta 401.
function getCadastrosUrl(): string {
  return process.env.CADASTROS_SERVICE_URL ?? 'http://localhost:8031'
}

function getInternalServiceKey(): string {
  const key = process.env.CHAVE_INTERNA_SERVICO
  if (!key || !key.trim()) {
    throw new AppError(
      500,
      'CHAVE_INTERNA_SERVICO ausente — pedido server não pode chamar Cadastros (S2S quebrado).',
    )
  }
  return key
}

export interface CadastrosRequestContext {
  id_organizacao: string
  correlation_id: string
}

function headersPadrao(ctx: CadastrosRequestContext): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'x-internal-key': getInternalServiceKey(),
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
 * Busca uma Empresa no Cadastros pelo SUID.
 *
 * - 404 → erro de contrato do chamador (SUID inválido): `AppError(400)`
 * - 5xx / rede / timeout → `AppError(503)` para o caller decidir retry
 * - 2xx → valida resposta com `empresaSchema` (contrato bilateral)
 */
export async function buscarEmpresaPorSuid(
  suid: string,
  ctx: CadastrosRequestContext,
): Promise<Empresa> {
  let response: Response
  try {
    response = await fetch(
      `${getCadastrosUrl()}/api/v1/fornecedores/${encodeURIComponent(suid)}`,
      {
        method: 'GET',
        headers: headersPadrao(ctx),
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      },
    )
  } catch {
    throw new AppError(503, 'Serviço Cadastros indisponível (rede/timeout)')
  }

  if (response.status === 404) {
    throw new AppError(400, `Empresa nao encontrada no Cadastros (suid=${suid})`)
  }

  if (!response.ok) {
    const corpo = await lerCorpoErro(response)
    if (response.status >= 400 && response.status < 500) {
      throw new AppError(response.status, `Cadastros rejeitou busca de Empresa: ${corpo}`)
    }
    throw new AppError(503, `Cadastros falhou com status ${response.status}`)
  }

  const raw = await response.json()
  return empresaSchema.parse(raw)
}

/**
 * Busca várias Empresas em paralelo. SUIDs duplicados são deduplicados antes
 * de chamar a rede. Retorna um mapa { suid → Empresa } para o caller indexar
 * por papel sem amarrar ordem.
 *
 * IMPORTANTE: chamar SEMPRE fora de `$transaction` — I/O de rede não deve
 * segurar conexão Prisma.
 */
export async function buscarEmpresasPorSuids(
  suids: readonly string[],
  ctx: CadastrosRequestContext,
): Promise<Map<string, Empresa>> {
  const unicos = Array.from(new Set(suids.filter((s) => s.length > 0)))
  if (unicos.length === 0) return new Map()

  const resultados = await Promise.all(
    unicos.map(async (suid) => [suid, await buscarEmpresaPorSuid(suid, ctx)] as const),
  )
  return new Map(resultados)
}

// ────────────────────────────────────────────────────────────────────────────
// FASE 06E — Frente 1 (Agente 4): Snapshot inicial das demais 4 entidades
// (OPE/NCM/Moeda/Unidade) durante a criação do Pedido.
//
// Diferença de contrato em relação a `buscarEmpresaPorSuid`:
//   - 404 retorna `null` (best-effort: snapshot inicial não bloqueia o POST
//     /pedidos; o re-snapshot via webhook corrige depois).
//   - 5xx / rede / timeout continuam lançando AppError(503) para o caller
//     decidir tratamento (no fluxo do Pedido isso vai virar warning + segue).
// ────────────────────────────────────────────────────────────────────────────

/**
 * Busca uma OPE no Cadastros pelo SUID.
 *
 * Endpoint: GET {CADASTROS_URL}/api/v1/cadastros/operacoes-comex/:suid
 * (router montado em `/api/v1/cadastros/operacoes-comex` no serviço Cadastros)
 */
export async function buscarOpePorSuid(
  suidOpe: string,
  ctx: CadastrosRequestContext,
): Promise<OPE | null> {
  let response: Response
  try {
    response = await fetch(
      `${getCadastrosUrl()}/api/v1/cadastros/operacoes-comex/${encodeURIComponent(suidOpe)}`,
      {
        method: 'GET',
        headers: headersPadrao(ctx),
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      },
    )
  } catch {
    throw new AppError(503, 'Serviço Cadastros indisponível (rede/timeout)')
  }

  if (response.status === 404) return null

  if (!response.ok) {
    const corpo = await lerCorpoErro(response)
    if (response.status >= 400 && response.status < 500) {
      throw new AppError(response.status, `Cadastros rejeitou busca de OPE: ${corpo}`)
    }
    throw new AppError(503, `Cadastros falhou com status ${response.status}`)
  }

  const raw = await response.json()
  return opeSchema.parse(raw)
}

/**
 * Busca um NCM no Cadastros pelo código.
 *
 * Endpoint: GET {CADASTROS_URL}/api/v1/cadastros/ncm/:codigo
 * (router montado em `/api/v1/cadastros/ncm` no serviço Cadastros)
 */
export async function buscarNcmPorCodigo(
  codigoNcm: string,
  ctx: CadastrosRequestContext,
): Promise<NCM | null> {
  let response: Response
  try {
    response = await fetch(
      `${getCadastrosUrl()}/api/v1/cadastros/ncm/${encodeURIComponent(codigoNcm)}`,
      {
        method: 'GET',
        headers: headersPadrao(ctx),
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      },
    )
  } catch {
    throw new AppError(503, 'Serviço Cadastros indisponível (rede/timeout)')
  }

  if (response.status === 404) return null

  if (!response.ok) {
    const corpo = await lerCorpoErro(response)
    if (response.status >= 400 && response.status < 500) {
      throw new AppError(response.status, `Cadastros rejeitou busca de NCM: ${corpo}`)
    }
    throw new AppError(503, `Cadastros falhou com status ${response.status}`)
  }

  const raw = await response.json()
  return ncmSchema.parse(raw)
}

/**
 * Busca uma Moeda no Cadastros pelo código.
 *
 * Endpoint: GET {CADASTROS_URL}/api/v1/cadastros/moedas/:codigo
 * (router montado em `/api/v1/cadastros/moedas` no serviço Cadastros)
 */
export async function buscarMoedaPorCodigo(
  codigoMoeda: string,
  ctx: CadastrosRequestContext,
): Promise<Moeda | null> {
  let response: Response
  try {
    response = await fetch(
      `${getCadastrosUrl()}/api/v1/cadastros/moedas/${encodeURIComponent(codigoMoeda)}`,
      {
        method: 'GET',
        headers: headersPadrao(ctx),
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      },
    )
  } catch {
    throw new AppError(503, 'Serviço Cadastros indisponível (rede/timeout)')
  }

  if (response.status === 404) return null

  if (!response.ok) {
    const corpo = await lerCorpoErro(response)
    if (response.status >= 400 && response.status < 500) {
      throw new AppError(response.status, `Cadastros rejeitou busca de Moeda: ${corpo}`)
    }
    throw new AppError(503, `Cadastros falhou com status ${response.status}`)
  }

  const raw = await response.json()
  return moedaSchema.parse(raw)
}

/**
 * Busca uma Unidade no Cadastros pelo código.
 *
 * Endpoint: GET {CADASTROS_URL}/api/v1/cadastros/unidades/:codigo
 * (router montado em `/api/v1/cadastros/unidades` no serviço Cadastros)
 */
export async function buscarUnidadePorCodigo(
  codigoUnidade: string,
  ctx: CadastrosRequestContext,
): Promise<Unidade | null> {
  let response: Response
  try {
    response = await fetch(
      `${getCadastrosUrl()}/api/v1/cadastros/unidades/${encodeURIComponent(codigoUnidade)}`,
      {
        method: 'GET',
        headers: headersPadrao(ctx),
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      },
    )
  } catch {
    throw new AppError(503, 'Serviço Cadastros indisponível (rede/timeout)')
  }

  if (response.status === 404) return null

  if (!response.ok) {
    const corpo = await lerCorpoErro(response)
    if (response.status >= 400 && response.status < 500) {
      throw new AppError(response.status, `Cadastros rejeitou busca de Unidade: ${corpo}`)
    }
    throw new AppError(503, `Cadastros falhou com status ${response.status}`)
  }

  const raw = await response.json()
  return unidadeSchema.parse(raw)
}

/**
 * Busca um Incoterm no Cadastros pelo código (sigla — FOB, CIF, EXW, etc.).
 *
 * Endpoint: GET {CADASTROS_URL}/api/v1/cadastros/incoterms/:codigo
 * Usado por `validarIncotermPedidoItem` na rota PUT do Pedido/Item.
 * Retorna null em 404 (sigla não cadastrada) — falha alta nos demais erros.
 */
export async function buscarIncotermPorCodigo(
  codigoIncoterm: string,
  ctx: CadastrosRequestContext,
): Promise<Incoterm | null> {
  let response: Response
  try {
    response = await fetch(
      `${getCadastrosUrl()}/api/v1/cadastros/incoterms/${encodeURIComponent(codigoIncoterm)}`,
      {
        method: 'GET',
        headers: headersPadrao(ctx),
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      },
    )
  } catch {
    throw new AppError(503, 'Serviço Cadastros indisponível (rede/timeout)')
  }

  if (response.status === 404) return null

  if (!response.ok) {
    const corpo = await lerCorpoErro(response)
    if (response.status >= 400 && response.status < 500) {
      throw new AppError(response.status, `Cadastros rejeitou busca de Incoterm: ${corpo}`)
    }
    throw new AppError(503, `Cadastros falhou com status ${response.status}`)
  }

  const raw = await response.json()
  return incotermSchema.parse(raw)
}

async function buscarCadastroPorCodigo(
  url: string,
  ctx: CadastrosRequestContext,
  rotulo: string,
): Promise<Record<string, unknown> | null> {
  let response: Response
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: headersPadrao(ctx),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
  } catch {
    throw new AppError(503, 'Serviço Cadastros indisponível (rede/timeout)')
  }

  if (response.status === 404) return null

  if (!response.ok) {
    const corpo = await lerCorpoErro(response)
    if (response.status >= 400 && response.status < 500) {
      throw new AppError(response.status, `Cadastros rejeitou busca de ${rotulo}: ${corpo}`)
    }
    throw new AppError(503, `Cadastros falhou com status ${response.status}`)
  }

  const raw = await response.json()
  return typeof raw === 'object' && raw !== null ? raw as Record<string, unknown> : null
}

export async function buscarPaisPorCodigo(
  codigoPais: string,
  ctx: CadastrosRequestContext,
): Promise<Record<string, unknown> | null> {
  return buscarCadastroPorCodigo(
    `${getCadastrosUrl()}/api/v1/cadastros/paises/${encodeURIComponent(codigoPais)}`,
    ctx,
    'País',
  )
}

export async function buscarPortoPorUnlocode(
  codigoUnlocode: string,
  ctx: CadastrosRequestContext,
): Promise<Record<string, unknown> | null> {
  return buscarCadastroPorCodigo(
    `${getCadastrosUrl()}/api/v1/cadastros/portos/${encodeURIComponent(codigoUnlocode)}`,
    ctx,
    'Porto',
  )
}

export async function buscarAeroportoPorCodigo(
  codigoAeroporto: string,
  ctx: CadastrosRequestContext,
): Promise<Record<string, unknown> | null> {
  return buscarCadastroPorCodigo(
    `${getCadastrosUrl()}/api/v1/cadastros/aeroportos/${encodeURIComponent(codigoAeroporto)}`,
    ctx,
    'Aeroporto',
  )
}
