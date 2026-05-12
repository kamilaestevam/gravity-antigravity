// server/services/gemini.ts
import { GoogleGenerativeAI, type CachedContent, type Tool, type FunctionResponsePart } from '@google/generative-ai'
import { GoogleAICacheManager } from '@google/generative-ai/server'
import { AppError } from '../lib/errors.js'
import { execTool, type ToolContext, type ActionRecord } from './execTool.js'
import { GABI_TOOLS } from './tools.js'
import type { UsageMetadataWithCache } from '../lib/gemini-types.js'

const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) {
  console.warn('⚠️ GEMINI_API_KEY nao definida no ambiente.')
}

const genAI = new GoogleGenerativeAI(apiKey || 'unconfigured')
const cacheManager = new GoogleAICacheManager(apiKey || 'unconfigured')

const MODELS_CHAIN = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.5-pro',
]

// Pricing per 1M tokens (USD) — cached input tem desconto
const MODEL_PRICING: Record<string, { input: number; inputCached: number; output: number }> = {
  'gemini-2.5-flash': { input: 0.15,  inputCached: 0.0375, output: 0.60 },
  'gemini-2.0-flash': { input: 0.075, inputCached: 0.01875, output: 0.30 },
  'gemini-2.5-pro':   { input: 1.25,  inputCached: 0.3125,  output: 10.0 },
}

export interface GeminiResult {
  text: string
  modelUsed: string
  tokensInput: number
  tokensOutput: number
  costUsd: number
  cachedTokens: number
}

function calculateCost(model: string, tokensIn: number, tokensOut: number, cachedTokens: number): number {
  const pricing = MODEL_PRICING[model] ?? { input: 1.0, inputCached: 0.25, output: 3.0 }
  const freshTokens = Math.max(0, tokensIn - cachedTokens)
  return (
    freshTokens * pricing.input +
    cachedTokens * pricing.inputCached +
    tokensOut * pricing.output
  ) / 1_000_000
}

// ── Cache de System Prompt ──────────────────────────────────────────────────
// Cacheia o system prompt (que inclui a KB inteira) por modelo.
// TTL 30 min — renovado automaticamente quando expira.

interface CacheEntry {
  cache: CachedContent
  promptHash: string
  expiresAt: number
}

const promptCacheMap = new Map<string, CacheEntry>()
const CACHE_TTL_SECONDS = 1800 // 30 min

async function getOrCreateCachedModel(modelName: string, systemPrompt: string) {
  const promptHash = simpleHash(systemPrompt)
  const cacheKey = `${modelName}:${promptHash}`
  const existing = promptCacheMap.get(cacheKey)

  if (existing && existing.expiresAt > Date.now()) {
    return genAI.getGenerativeModelFromCachedContent(existing.cache, {
      tools: GABI_TOOLS as Tool[],
    })
  }

  try {
    const cache = await cacheManager.create({
      model: `models/${modelName}`,
      systemInstruction: systemPrompt,
      contents: [],
      ttlSeconds: CACHE_TTL_SECONDS,
      displayName: `gabi-kb-${modelName}-${promptHash}`,
    })

    promptCacheMap.set(cacheKey, {
      cache,
      promptHash,
      expiresAt: Date.now() + (CACHE_TTL_SECONDS - 60) * 1000,
    })

    console.log(`[GEMINI] Cache criado para ${modelName} (TTL ${CACHE_TTL_SECONDS}s)`)

    return genAI.getGenerativeModelFromCachedContent(cache, {
      tools: GABI_TOOLS as Tool[],
    })
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message.slice(0, 100) : String(err)
    console.warn(`[GEMINI] Cache falhou para ${modelName}, usando sem cache: ${errMsg}`)
    return genAI.getGenerativeModel({
      model: modelName,
      tools: GABI_TOOLS as Tool[],
      systemInstruction: systemPrompt,
    })
  }
}

function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return hash.toString(36)
}

export interface GeminiWithToolsResult extends GeminiResult {
  actionsPerformed: ActionRecord[]
  dataChanged: boolean
}

// ── Geracao com tool-use (Espelho do Usuario) ────────────────────────────────
export async function generateWithTools(
  systemPrompt: string,
  userMessage: string,
  history: Array<{ role: string; content: string }>,
  ctx: ToolContext,
): Promise<GeminiWithToolsResult> {
  let lastError: unknown

  for (const modelName of MODELS_CHAIN) {
    try {
      const model = await getOrCreateCachedModel(modelName, systemPrompt)

      const chat = model.startChat({
        history: history
          .filter(h => h.role !== 'system')
          .map(h => ({
            role: h.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: h.content }],
          })),
      })

      let totalInputTok  = 0
      let totalOutputTok = 0
      let totalCachedTok = 0
      const actionsPerformed: ActionRecord[] = []

      let current = await chat.sendMessage(userMessage)
      totalInputTok  += current.response.usageMetadata?.promptTokenCount    ?? 0
      totalOutputTok += current.response.usageMetadata?.candidatesTokenCount ?? 0
      totalCachedTok += (current.response.usageMetadata as UsageMetadataWithCache | undefined)?.cachedContentTokenCount ?? 0

      for (let i = 0; i < 50; i++) {
        const funcCalls = current.response.functionCalls()

        if (!funcCalls || funcCalls.length === 0) {
          const text = current.response.text()
          return {
            text,
            modelUsed: modelName,
            tokensInput: totalInputTok,
            tokensOutput: totalOutputTok,
            cachedTokens: totalCachedTok,
            costUsd: calculateCost(modelName, totalInputTok, totalOutputTok, totalCachedTok),
            actionsPerformed,
            dataChanged: actionsPerformed.some(a => a.success),
          }
        }

        const toolParts = await Promise.all(
          funcCalls.map(async (fc) => {
            let toolResult: unknown
            try {
              const { result, action } = await execTool(fc.name, (fc.args ?? {}) as Record<string, unknown>, ctx)
              toolResult = result
              if (action) actionsPerformed.push(action)
            } catch (err: unknown) {
              const errMsg = err instanceof Error ? err.message : String(err)
              console.warn(`[GABI] Tool "${fc.name}" falhou: ${errMsg}`)
              toolResult = { error: errMsg }
            }
            return {
              functionResponse: {
                name: fc.name,
                response: toolResult,
              },
            }
          })
        )

        current = await chat.sendMessage(toolParts as FunctionResponsePart[])
        totalInputTok  += current.response.usageMetadata?.promptTokenCount    ?? 0
        totalOutputTok += current.response.usageMetadata?.candidatesTokenCount ?? 0
        totalCachedTok += (current.response.usageMetadata as UsageMetadataWithCache | undefined)?.cachedContentTokenCount ?? 0
      }

      const fallbackText = current.response.text() || 'Desculpe, a tarefa foi muito complexa. Tente dividir em partes menores.'
      return {
        text: fallbackText,
        modelUsed: modelName,
        tokensInput: totalInputTok,
        tokensOutput: totalOutputTok,
        cachedTokens: totalCachedTok,
        costUsd: calculateCost(modelName, totalInputTok, totalOutputTok, totalCachedTok),
        actionsPerformed,
        dataChanged: actionsPerformed.some(a => a.success),
      }

    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message.slice(0, 120) : String(error)
      console.warn(`[GEMINI] Falha com ${modelName}: ${errMsg}`)
      lastError = error
    }
  }

  throw new AppError(
    `Gabi: Todos os modelos falharam. Ultimo erro: ${lastError instanceof Error ? lastError.message : 'Desconhecido'}`,
    502,
    'LLM_UNAVAILABLE'
  )
}

// ── Geracao simples sem tools ────────────────────────────────────────────────
export async function generateContentWithFallback(prompt: string, history: Array<{ role: string; content: string }> = []): Promise<GeminiResult> {
  let lastError: unknown

  for (const modelName of MODELS_CHAIN) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName })
      const chat = model.startChat({
        history: history
          .filter(h => h.role !== 'system')
          .map(h => ({
            role: h.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: h.content }],
          })),
      })

      const result = await chat.sendMessage(prompt)
      const usage = result.response.usageMetadata

      const tokensIn = usage?.promptTokenCount ?? 0
      const tokensOut = usage?.candidatesTokenCount ?? 0

      return {
        text: result.response.text(),
        modelUsed: modelName,
        tokensInput: tokensIn,
        tokensOutput: tokensOut,
        cachedTokens: 0,
        costUsd: calculateCost(modelName, tokensIn, tokensOut, 0),
      }
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message.slice(0, 120) : String(error)
      console.warn(`[GEMINI] Falha com ${modelName}: ${errMsg}`)
      lastError = error
    }
  }

  throw new AppError(
    `Gabi: Todos os modelos falharam. Ultimo erro: ${lastError instanceof Error ? lastError.message : 'Desconhecido'}`,
    502,
    'LLM_UNAVAILABLE'
  )
}
