// server/services/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai'
import { AppError } from '../lib/errors.js'

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
