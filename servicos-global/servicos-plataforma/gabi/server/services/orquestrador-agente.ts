// server/services/orquestrador-agente.ts
// Orquestrador do agente GABI — wiring entre Gemini function calling,
// catalogo de ferramentas, circuit breaker e permissoes.

import {
  GoogleGenerativeAI,
  type Tool,
  type FunctionResponsePart,
} from '@google/generative-ai'
import { GoogleAICacheManager } from '@google/generative-ai/server'
import { AppError } from '../lib/errors.js'
import {
  gerarGeminiDeclarations,
  filtrarToolsPorPermissao,
  buscarTool,
  geminiNameToToolId,
} from './catalogo-ferramentas.js'
import {
  rotearFerramenta,
  sanitizarResultado,
  resetarContadorTurno,
  type ContextoExecucao,
} from './roteador-ferramentas.js'
import { verificarPermissaoCompleta } from './permission.js'
import type { UsageMetadataWithCache } from '../lib/gemini-types.js'

// ── Config ──────────────────────────────────────────────────────────────────

// Lazy initialization — evita ESM hoisting ler process.env antes do dotenv.config()
let _apiKey: string | undefined
let _genAI: GoogleGenerativeAI | undefined
let _cacheManager: GoogleAICacheManager | undefined

function getApiKey(): string {
  if (!_apiKey) {
    _apiKey = process.env.GEMINI_API_KEY
    if (!_apiKey) _apiKey = 'unconfigured'
  }
  return _apiKey
}

function getGenAI(): GoogleGenerativeAI {
  if (!_genAI) _genAI = new GoogleGenerativeAI(getApiKey())
  return _genAI
}

function getCacheManager(): GoogleAICacheManager {
  if (!_cacheManager) _cacheManager = new GoogleAICacheManager(getApiKey())
  return _cacheManager
}

const MODELS_CHAIN = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.5-pro',
]

const MODEL_PRICING: Record<string, { input: number; inputCached: number; output: number }> = {
  'gemini-2.5-flash': { input: 0.15,  inputCached: 0.0375, output: 0.60 },
  'gemini-2.0-flash': { input: 0.075, inputCached: 0.01875, output: 0.30 },
  'gemini-2.5-pro':   { input: 1.25,  inputCached: 0.3125,  output: 10.0 },
}

const MAX_TOOL_ITERATIONS = 10
const CACHE_TTL_SECONDS = 1800

function calcularCusto(model: string, tokensIn: number, tokensOut: number, cachedTokens: number): number {
  const pricing = MODEL_PRICING[model] ?? { input: 1.0, inputCached: 0.25, output: 3.0 }
  const freshTokens = Math.max(0, tokensIn - cachedTokens)
  return (
    freshTokens * pricing.input +
    cachedTokens * pricing.inputCached +
    tokensOut * pricing.output
  ) / 1_000_000
}

// ── Cache de system prompt ──────────────────────────────────────────────────

interface CacheEntry {
  cache: import('@google/generative-ai').CachedContent
  promptHash: string
  expiresAt: number
}

const promptCacheMap = new Map<string, CacheEntry>()

function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return hash.toString(36)
}

// ── Tipos de resultado ──────────────────────────────────────────────────────

export interface ToolCallLog {
  tool_id: string
  sucesso: boolean
  duracao_ms: number
  aguardando_confirmacao?: boolean
  nonce?: string
  descricao_acao?: string
}

export interface ResultadoAgente {
  texto: string
  modelo_usado: string
  tokens_input: number
  tokens_output: number
  tokens_cached: number
  custo_usd: number
  tools_chamadas: ToolCallLog[]
  dados_alterados: boolean
  confirmacoes_pendentes: Array<{
    nonce: string
    tool_id: string
    descricao_acao: string
    classe: string
    expira_em: Date
  }>
}

export type EmitSSEAgente = (evento: string, dados: unknown) => void

export interface ContextoAgente extends ContextoExecucao {
  tipo_usuario: string
}

// ── Selecao de tools por contexto ──────────────────────────────────────────
// Gemini 2.5 Flash falha com > ~30 tool declarations (retorna resposta vazia).
// Priorizamos: pedido (core) + config (essencial) + READ tools de outros.

const PRIORIDADE_PREFIXO: string[] = [
  'pedido.',     // core product
  'config.',     // configuracao essencial
  'core.',       // dashboard/processos
  'admin.',      // admin (se SUPER_ADMIN)
  'hub.',        // onboarding
  'store.',      // catalogo
]

function selecionarToolsPorContexto(toolIds: string[], max: number): string[] {
  const selecionadas: string[] = []
  const restantes: string[] = []

  // Primeiro: tools dos prefixos prioritarios (pedido + config)
  for (const id of toolIds) {
    const prioritario = PRIORIDADE_PREFIXO.some((p) => id.startsWith(p))
    if (prioritario) {
      selecionadas.push(id)
    } else {
      restantes.push(id)
    }
  }

  // Se ja passou do limite, cortar as menos prioritarias
  if (selecionadas.length > max) {
    return selecionadas.slice(0, max)
  }

  // Preencher com restantes ate o limite
  const vagas = max - selecionadas.length
  return [...selecionadas, ...restantes.slice(0, vagas)]
}

// ── Orquestrador principal ──────────────────────────────────────────────────

export async function executarAgente(
  systemPrompt: string,
  mensagemUsuario: string,
  historico: Array<{ role: string; content: string }>,
  ctx: ContextoAgente,
  emitSse?: EmitSSEAgente,
): Promise<ResultadoAgente> {
  // Resetar contador de tools por turno
  resetarContadorTurno(ctx.id_conversa)

  // Filtrar tools por permissao do usuario
  const toolsPermitidas = filtrarToolsPorPermissao(ctx.tipo_usuario)
  const toolIds = toolsPermitidas.map((t) => t.id)

  // Gemini 2.5 Flash suporta ~25 tools; com 56 retorna resposta vazia.
  // Selecionamos as tools mais relevantes por produto principal (pedido + config),
  // mais tools gerais (admin, hub, core, store) em segundo plano.
  const MAX_TOOLS = 28
  const toolIdsFiltradas = selecionarToolsPorContexto(toolIds, MAX_TOOLS)
  const geminiTools = gerarGeminiDeclarations(toolIdsFiltradas)

  let lastError: unknown

  console.log(`[GABI/Agente] Iniciando — tools=${toolIdsFiltradas.length}/${toolIds.length} modelos=${MODELS_CHAIN.join(',')}`)

  for (const modelName of MODELS_CHAIN) {
    try {
      console.log(`[GABI/Agente] Tentando modelo ${modelName}...`)
      const model = await obterModeloComCache(modelName, systemPrompt, geminiTools as Tool[])

      const chat = model.startChat({
        history: historico
          .filter((h) => h.role !== 'system')
          .map((h) => ({
            role: h.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: h.content }],
          })),
      })

      let totalInputTok = 0
      let totalOutputTok = 0
      let totalCachedTok = 0
      const toolsChamadas: ToolCallLog[] = []
      const confirmacoesPendentes: ResultadoAgente['confirmacoes_pendentes'] = []

      emitSse?.('transparency', { message: 'Processando sua mensagem...' })

      console.log(`[GABI/Agente] Enviando mensagem ao Gemini...`)
      let current = await chat.sendMessage(mensagemUsuario)
      totalInputTok += current.response.usageMetadata?.promptTokenCount ?? 0
      totalOutputTok += current.response.usageMetadata?.candidatesTokenCount ?? 0
      totalCachedTok += (current.response.usageMetadata as UsageMetadataWithCache | undefined)?.cachedContentTokenCount ?? 0

      const _dbgFc = current.response.functionCalls?.() ?? []
      const _dbgTxt = current.response.text?.() ?? ''
      const _dbgCandidates = current.response.candidates
      console.log(`[GABI/Agente] Resposta: fc=${_dbgFc.length} fcNames=${_dbgFc.map((f: { name: string }) => f.name).join(',')} text=${_dbgTxt.slice(0, 80)}`)
      console.log(`[GABI/Agente] Candidates: ${JSON.stringify(_dbgCandidates?.map(c => ({ finishReason: c.finishReason, partsCount: c.content?.parts?.length })))}`)

      for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
        const funcCalls = current.response.functionCalls()
        if (!funcCalls || funcCalls.length === 0) break

        const toolParts = await Promise.all(
          funcCalls.map(async (fc) => {
            const toolId = geminiNameToToolId(fc.name)
            const parametros = (fc.args ?? {}) as Record<string, unknown>
            const inicio = Date.now()

            let toolResult: unknown

            try {
              // Verificar permissao antes de executar
              await verificarPermissaoCompleta(
                ctx.id_organizacao,
                ctx.id_usuario,
                ctx.tipo_usuario,
                toolId,
              )

              emitSse?.('transparency', { message: `Executando ${toolId}...` })

              const resultado = await rotearFerramenta(toolId, parametros, ctx, { emitSse })

              if (resultado.tipo === 'aguardando_confirmacao' && resultado.confirmacao) {
                confirmacoesPendentes.push({
                  nonce: resultado.confirmacao.nonce,
                  tool_id: toolId,
                  descricao_acao: resultado.confirmacao.descricao_acao,
                  classe: resultado.confirmacao.classe,
                  expira_em: resultado.confirmacao.expira_em,
                })

                toolsChamadas.push({
                  tool_id: toolId,
                  sucesso: true,
                  duracao_ms: Date.now() - inicio,
                  aguardando_confirmacao: true,
                  nonce: resultado.confirmacao.nonce,
                  descricao_acao: resultado.confirmacao.descricao_acao,
                })

                toolResult = {
                  aguardando_confirmacao: true,
                  descricao_acao: resultado.confirmacao.descricao_acao,
                  classe: resultado.confirmacao.classe,
                  mensagem: 'Acao requer confirmacao do usuario antes de executar.',
                }
              } else if (resultado.tipo === 'erro') {
                toolsChamadas.push({
                  tool_id: toolId,
                  sucesso: false,
                  duracao_ms: resultado.duracao_ms,
                })
                toolResult = { error: resultado.erro }
              } else {
                toolsChamadas.push({
                  tool_id: toolId,
                  sucesso: true,
                  duracao_ms: resultado.duracao_ms,
                })
                toolResult = sanitizarResultado(resultado.dados)
              }
            } catch (err: unknown) {
              const errMsg = err instanceof Error ? err.message : String(err)
              console.warn(`[GABI/Agente] Tool "${toolId}" falhou: ${errMsg}`)
              toolsChamadas.push({
                tool_id: toolId,
                sucesso: false,
                duracao_ms: Date.now() - inicio,
              })
              toolResult = { error: errMsg }
            }

            return {
              functionResponse: {
                name: fc.name,
                response: toolResult,
              },
            }
          }),
        )

        current = await chat.sendMessage(toolParts as FunctionResponsePart[])
        totalInputTok += current.response.usageMetadata?.promptTokenCount ?? 0
        totalOutputTok += current.response.usageMetadata?.candidatesTokenCount ?? 0
        totalCachedTok += (current.response.usageMetadata as UsageMetadataWithCache | undefined)?.cachedContentTokenCount ?? 0
      }

      const texto = current.response.text()
        || 'Desculpe, a tarefa foi muito complexa. Tente dividir em partes menores.'

      return {
        texto,
        modelo_usado: modelName,
        tokens_input: totalInputTok,
        tokens_output: totalOutputTok,
        tokens_cached: totalCachedTok,
        custo_usd: calcularCusto(modelName, totalInputTok, totalOutputTok, totalCachedTok),
        tools_chamadas: toolsChamadas,
        dados_alterados: toolsChamadas.some((t) => t.sucesso && !t.aguardando_confirmacao && buscarTool(t.tool_id)?.classe !== 'READ'),
        confirmacoes_pendentes: confirmacoesPendentes,
      }

    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message.slice(0, 120) : String(error)
      console.warn(`[GABI/Agente] Falha com ${modelName}: ${errMsg}`)
      lastError = error
    }
  }

  throw new AppError(
    `Gabi: Todos os modelos falharam. Ultimo erro: ${lastError instanceof Error ? lastError.message : 'Desconhecido'}`,
    502,
    'LLM_UNAVAILABLE',
  )
}

// ── Modelo com cache ────────────────────────────────────────────────────────

async function obterModeloComCache(modelName: string, systemPrompt: string, tools: Tool[]) {
  const toolConfig = { functionCallingConfig: { mode: 'AUTO' as const } }

  return getGenAI().getGenerativeModel({
    model: modelName,
    tools,
    toolConfig,
    systemInstruction: systemPrompt,
  })
}

// ── Confirmar acao pendente ─────────────────────────────────────────────────

export async function confirmarAcaoPendente(
  nonce: string,
  tool_id: string,
  parametros: Record<string, unknown>,
  ctx: ContextoAgente,
  emitSse?: EmitSSEAgente,
): Promise<{ sucesso: boolean; dados?: unknown; erro?: string }> {
  try {
    const resultado = await rotearFerramenta(tool_id, parametros, ctx, { nonce, emitSse })

    if (resultado.tipo === 'executado') {
      return { sucesso: true, dados: sanitizarResultado(resultado.dados) }
    }

    return { sucesso: false, erro: resultado.erro ?? 'Falha na execucao' }
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err)
    return { sucesso: false, erro: errMsg }
  }
}
