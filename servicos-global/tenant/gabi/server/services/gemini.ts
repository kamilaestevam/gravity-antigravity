// server/services/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai'
import { AppError } from '../lib/errors.js'

const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) {
  console.warn('⚠️ GEMINI_API_KEY não definida no ambiente, chamadas falharão se não mockadas.')
}

const genAI = new GoogleGenerativeAI(apiKey || 'unconfigured')

const MODELS_CHAIN = [
  'gemini-1.5-pro',
  'gemini-1.5-flash',
  'gemini-1.0-pro',
  'gemini-1.0-flash',
  'gemini-1.0-pro-001'
]

export async function generateContentWithFallback(prompt: string, history: any[] = []) {
  let lastError: any
  
  for (const modelName of MODELS_CHAIN) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName })
      const chat = model.startChat({
        history: history.map(h => ({
          role: h.role === 'assistant' ? 'model' : 'user', // Gemini expects 'model' instead of 'assistant'
          parts: [{ text: h.content }]
        }))
      })
      
      const result = await chat.sendMessage(prompt)
      return {
        text: result.response.text(),
        modelUsed: modelName
      }
    } catch (error) {
      console.warn(`[GEMINI] Falha ao usar o modelo ${modelName}. Tentando fallback...`)
      lastError = error
      // Continua para o próximo modelo do chain
    }
  }

  throw new AppError(`Gabi: Todos os modelos do fallback chain falharam. Último erro: ${lastError?.message || 'Erro Desconhecido'}`, 502, 'LLM_UNAVAILABLE')
}
