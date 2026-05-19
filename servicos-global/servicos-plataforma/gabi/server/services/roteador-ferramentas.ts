// server/services/roteador-ferramentas.ts
// Roteador de ferramentas — substitui o switch de execTool.ts
// Usa o catalogo declarativo + circuit breaker para executar tools.

import { buscarTool, type ToolDefinition } from './catalogo-ferramentas.js'
import {
  processarChamadaTool,
  registrarExecucaoTool,
  resetarContadorTurno,
  type CircuitBreakerContexto,
  type EmitSSE,
  type ResultadoCircuitBreaker,
  type ResultadoExecucao,
} from './servico-circuit-breaker.js'
import { AppError } from '../lib/errors.js'

// ── Portas dos servicos ─────────────────────────────────────────────────────

const INTERNAL_KEY = process.env.INTERNAL_API_KEY || 'gravity-internal'
const TIMEOUT_MS = 10_000

const SERVICE_URLS: Record<string, string> = {
  pedido:        process.env.PEDIDO_SERVICE_URL        || 'http://localhost:8026',
  configurador:  process.env.CONFIGURADOR_SERVICE_URL  || 'http://localhost:8025',
  admin:         process.env.CONFIGURADOR_SERVICE_URL  || 'http://localhost:8025',
  hub:           process.env.CONFIGURADOR_SERVICE_URL  || 'http://localhost:8025',
  store:         process.env.STORE_SERVICE_URL         || 'http://localhost:5181',
  gabi:          process.env.GABI_SERVICE_URL          || 'http://localhost:8009',
}

// ── Contexto completo para execucao ─────────────────────────────────────────

export interface ContextoExecucao extends CircuitBreakerContexto {
  tipo_usuario: string
}

// ── Resolver endpoint path params ───────────────────────────────────────────

function resolverEndpoint(endpoint: string, parametros: Record<string, unknown>): string {
  return endpoint.replace(/:(\w+)/g, (_, nome) => {
    const valor = parametros[nome]
    if (typeof valor === 'string') return encodeURIComponent(valor)
    if (typeof valor === 'number') return String(valor)
    return ''
  })
}

function extrairQueryParams(
  tool: ToolDefinition,
  parametros: Record<string, unknown>,
): Record<string, string> | undefined {
  if (tool.metodo !== 'GET') return undefined

  const pathParams = new Set(
    (tool.endpoint.match(/:(\w+)/g) || []).map((p) => p.slice(1)),
  )

  const query: Record<string, string> = {}
  for (const [k, v] of Object.entries(parametros)) {
    if (pathParams.has(k)) continue
    if (v === undefined || v === null) continue
    query[k] = String(v)
  }

  return Object.keys(query).length > 0 ? query : undefined
}

function construirBody(
  tool: ToolDefinition,
  parametros: Record<string, unknown>,
): object | undefined {
  if (tool.metodo === 'GET') return undefined

  const pathParams = new Set(
    (tool.endpoint.match(/:(\w+)/g) || []).map((p) => p.slice(1)),
  )

  const body: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(parametros)) {
    if (pathParams.has(k)) continue
    body[k] = v
  }

  return Object.keys(body).length > 0 ? body : undefined
}

// ── HTTP Client base ────────────────────────────────────────────────────────

async function chamarServico(
  tool: ToolDefinition,
  parametros: Record<string, unknown>,
  ctx: ContextoExecucao,
): Promise<ResultadoExecucao> {
  const baseUrl = SERVICE_URLS[tool.produto]
  if (!baseUrl) {
    return { sucesso: false, status: 500, erro: `Servico desconhecido: ${tool.produto}` }
  }

  const path = resolverEndpoint(tool.endpoint, parametros)
  const query = extrairQueryParams(tool, parametros)
  const body = construirBody(tool, parametros)

  let url = `${baseUrl}${path}`
  if (query) {
    const qs = Object.entries(query)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&')
    url += `?${qs}`
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-chave-interna-servico': INTERNAL_KEY,
    'x-id-organizacao': ctx.id_organizacao,
    'x-id-usuario': ctx.id_usuario,
    'x-tipo-usuario': ctx.tipo_usuario,
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(url, {
      method: tool.metodo,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })
    clearTimeout(timer)

    const texto = await res.text()
    let dados: unknown
    try {
      dados = JSON.parse(texto)
    } catch {
      dados = texto.slice(0, 2000)
    }

    if (!res.ok) {
      return {
        sucesso: false,
        status: res.status,
        erro: typeof dados === 'object' && dados !== null
          ? (dados as Record<string, unknown>).message as string ?? texto.slice(0, 200)
          : texto.slice(0, 200),
        dados,
      }
    }

    return { sucesso: true, status: res.status, dados }
  } catch (err: unknown) {
    clearTimeout(timer)
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('abort')) {
      return { sucesso: false, status: 504, erro: `Timeout ao chamar ${tool.produto}${path}` }
    }
    return { sucesso: false, status: 502, erro: msg }
  }
}

// ── Executor (usado pelo circuit breaker) ───────────────────────────────────

function criarExecutor(ctx: ContextoExecucao) {
  return async (
    tool_id: string,
    parametros: Record<string, unknown>,
    _ctx: CircuitBreakerContexto,
  ): Promise<ResultadoExecucao> => {
    const tool = buscarTool(tool_id)
    if (!tool) {
      return { sucesso: false, status: 400, erro: `Tool desconhecida: ${tool_id}` }
    }
    return chamarServico(tool, parametros, ctx)
  }
}

// ── Interface publica ───────────────────────────────────────────────────────

export interface ResultadoRoteamento {
  tipo: 'executado' | 'aguardando_confirmacao' | 'erro'
  dados?: unknown
  confirmacao?: {
    nonce: string
    descricao_acao: string
    classe: string
    expira_em: Date
  }
  erro?: string
  duracao_ms: number
}

export async function rotearFerramenta(
  tool_id: string,
  parametros: Record<string, unknown>,
  ctx: ContextoExecucao,
  opcoes?: { nonce?: string; emitSse?: EmitSSE },
): Promise<ResultadoRoteamento> {
  const inicio = Date.now()

  // Validar que a tool existe
  const tool = buscarTool(tool_id)
  if (!tool) {
    return { tipo: 'erro', erro: `Tool desconhecida: ${tool_id}`, duracao_ms: Date.now() - inicio }
  }

  // Validar parametros com Zod
  const validacao = tool.schema_params.safeParse(parametros)
  if (!validacao.success) {
    const erros = validacao.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
    return { tipo: 'erro', erro: `Parametros invalidos: ${erros}`, duracao_ms: Date.now() - inicio }
  }

  const parametrosValidados = validacao.data as Record<string, unknown>

  // Delegar ao circuit breaker
  const resultado: ResultadoCircuitBreaker = await processarChamadaTool({
    tool_id,
    parametros: parametrosValidados,
    ctx,
    nonce: opcoes?.nonce,
    executor: criarExecutor(ctx),
    emitSse: opcoes?.emitSse,
  })

  const duracao_ms = Date.now() - inicio

  // Registrar execucao (fire-and-forget para nao bloquear)
  if (resultado.tipo === 'executado' || resultado.tipo === 'erro') {
    registrarExecucaoTool(
      ctx,
      tool_id,
      parametrosValidados,
      {
        sucesso: resultado.tipo === 'executado',
        status: resultado.tipo === 'executado' ? 200 : 500,
        dados: resultado.dados,
        erro: resultado.erro,
      },
      duracao_ms,
      !!opcoes?.nonce,
    ).catch(() => {})
  }

  // Mapear resultado
  if (resultado.tipo === 'aguardando_confirmacao' && resultado.confirmacao) {
    return {
      tipo: 'aguardando_confirmacao',
      confirmacao: {
        nonce: resultado.confirmacao.nonce,
        descricao_acao: resultado.confirmacao.descricao_acao,
        classe: resultado.confirmacao.classe,
        expira_em: resultado.confirmacao.expira_em,
      },
      duracao_ms,
    }
  }

  return {
    tipo: resultado.tipo,
    dados: resultado.dados,
    erro: resultado.erro,
    duracao_ms,
  }
}

// ── Resetar turno (chamar no inicio de cada turno do usuario) ───────────────

export { resetarContadorTurno }

// ── Sanitizacao de resultado (Barreira 8 do doc) ────────────────────────────

const CAMPOS_SENSIVEIS = new Set([
  'id_clerk_usuario',
  'email_usuario',
  'senha',
  'password',
  'token',
  'api_key',
  'secret',
  'chave_api',
  'refresh_token',
  'access_token',
])

export function sanitizarResultado(dados: unknown, maxTokens = 4000): unknown {
  if (dados === null || dados === undefined) return dados
  if (typeof dados !== 'object') return dados

  const json = JSON.stringify(dados)
  if (json.length > maxTokens * 4) {
    if (Array.isArray(dados)) {
      const truncado = dados.slice(0, 20)
      return {
        _truncado: true,
        total: dados.length,
        exibidos: truncado.length,
        dados: sanitizarObjeto(truncado),
      }
    }
  }

  return sanitizarObjeto(dados)
}

function sanitizarObjeto(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj
  if (typeof obj !== 'object') return obj

  if (Array.isArray(obj)) {
    return obj.map(sanitizarObjeto)
  }

  const resultado: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (CAMPOS_SENSIVEIS.has(k)) {
      resultado[k] = '[REDACTED]'
    } else if (typeof v === 'object' && v !== null) {
      resultado[k] = sanitizarObjeto(v)
    } else {
      resultado[k] = v
    }
  }
  return resultado
}
