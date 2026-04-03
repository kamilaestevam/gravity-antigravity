// server/services/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai'
import { AppError } from '../lib/errors.js'
import { execTool, type ToolContext, type ActionRecord } from './execTool.js'
import { GABI_TOOLS } from './tools.js'

const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) {
  console.warn('⚠️ GEMINI_API_KEY nao definida no ambiente.')
}

const genAI = new GoogleGenerativeAI(apiKey || 'unconfigured')

// Modelos atualizados (marco 2026)
const MODELS_CHAIN = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.5-pro',
]

// Pricing per 1M tokens (USD)
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'gemini-2.5-flash':   { input: 0.15,   output: 0.60 },
  'gemini-2.0-flash':   { input: 0.075,  output: 0.30 },
  'gemini-2.5-pro':     { input: 1.25,   output: 10.0 },
}

export interface GeminiResult {
  text: string
  modelUsed: string
  tokensInput: number
  tokensOutput: number
  costUsd: number
}

function calculateCost(model: string, tokensIn: number, tokensOut: number): number {
  const pricing = MODEL_PRICING[model] ?? { input: 1.0, output: 3.0 }
  return (tokensIn * pricing.input + tokensOut * pricing.output) / 1_000_000
}

export interface GeminiWithToolsResult extends GeminiResult {
  actionsPerformed: ActionRecord[]
  dataChanged: boolean
}

// ── Geração com tool-use (Espelho do Usuário) ─────────────────────────────────
// Segue o padrão do Journey: loop até o modelo retornar texto puro (sem functionCalls)
export async function generateWithTools(
  systemPrompt: string,
  userMessage: string,
  history: any[],
  ctx: ToolContext,
): Promise<GeminiWithToolsResult> {
  let lastError: any

  for (const modelName of MODELS_CHAIN) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        tools: GABI_TOOLS as any,
        systemInstruction: systemPrompt,
      })

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
      const actionsPerformed: ActionRecord[] = []

      // Primeira mensagem do usuário
      let current = await chat.sendMessage(userMessage)
      totalInputTok  += current.response.usageMetadata?.promptTokenCount    ?? 0
      totalOutputTok += current.response.usageMetadata?.candidatesTokenCount ?? 0

      // Loop de tool-use — máx 50 iterações (mesmo padrão do Journey)
      for (let i = 0; i < 50; i++) {
        const funcCalls = current.response.functionCalls()

        // Sem function calls → resposta final em texto
        if (!funcCalls || funcCalls.length === 0) {
          const text = current.response.text()
          return {
            text,
            modelUsed: modelName,
            tokensInput: totalInputTok,
            tokensOutput: totalOutputTok,
            costUsd: calculateCost(modelName, totalInputTok, totalOutputTok),
            actionsPerformed,
            dataChanged: actionsPerformed.some(a => a.success),
          }
        }

        // Executa tools em paralelo (padrão Journey: Promise.all)
        const toolParts = await Promise.all(
          funcCalls.map(async (fc: { name: string; args: Record<string, unknown> }) => {
            let toolResult: any
            try {
              const { result, action } = await execTool(fc.name, fc.args ?? {}, ctx)
              toolResult = result
              if (action) actionsPerformed.push(action)
            } catch (err: any) {
              console.warn(`[GABI] Tool "${fc.name}" falhou: ${err.message}`)
              toolResult = { error: err.message }
            }
            return {
              functionResponse: {
                name: fc.name,
                response: toolResult,
              },
            }
          })
        )

        // Devolve resultados ao modelo e continua o loop
        current = await chat.sendMessage(toolParts as any)
        totalInputTok  += current.response.usageMetadata?.promptTokenCount    ?? 0
        totalOutputTok += current.response.usageMetadata?.candidatesTokenCount ?? 0
      }

      // Limite de iterações atingido — retorna o que o modelo tiver
      const fallbackText = current.response.text() || 'Desculpe, a tarefa foi muito complexa. Tente dividir em partes menores.'
      return {
        text: fallbackText,
        modelUsed: modelName,
        tokensInput: totalInputTok,
        tokensOutput: totalOutputTok,
        costUsd: calculateCost(modelName, totalInputTok, totalOutputTok),
        actionsPerformed,
        dataChanged: actionsPerformed.some(a => a.success),
      }

    } catch (error: any) {
      console.warn(`[GEMINI] Falha com ${modelName}: ${error.message?.slice(0, 120)}`)
      lastError = error
    }
  }

  throw new AppError(
    `Gabi: Todos os modelos falharam. Ultimo erro: ${lastError?.message || 'Desconhecido'}`,
    502,
    'LLM_UNAVAILABLE'
  )
}

// ── Geração simples sem tools ─────────────────────────────────────────────────
export async function generateContentWithFallback(prompt: string, history: any[] = []): Promise<GeminiResult> {
  let lastError: any

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
        costUsd: calculateCost(modelName, tokensIn, tokensOut),
      }
    } catch (error: any) {
      console.warn(`[GEMINI] Falha com ${modelName}: ${error.message?.slice(0, 120)}`)
      lastError = error
    }
  }

  throw new AppError(
    `Gabi: Todos os modelos falharam. Ultimo erro: ${lastError?.message || 'Desconhecido'}`,
    502,
    'LLM_UNAVAILABLE'
  )
}
