// server/routes/chat.ts
import { Router } from 'express'
import { z } from 'zod'
import { getConversationContext, buildSystemPrompt } from '../services/chat.js'
import { generateContentWithFallback } from '../services/gemini.js'
import { AppError } from '../lib/errors.js'

export const chatRouter = Router()

const MAX_MESSAGE_LENGTH = 10_000

const chatSchema = z.object({
  conversationId: z.string().max(255),
  message: z.string().min(1).max(MAX_MESSAGE_LENGTH)
})

const streamQuerySchema = z.object({
  conversationId: z.string().max(255),
  message: z.string().min(1).max(MAX_MESSAGE_LENGTH),
})

function sanitizeUserInput(input: string): string {
  return input
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim()
}

// SSE Streaming
chatRouter.get('/api/v1/gabi/chat/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  // tenant/user DEVEM vir do JWT autenticado (req.auth), não dos headers/query
  const tenantId = (req as any).auth?.tenantId
  const userId = (req as any).auth?.userId

  if (!tenantId || !userId) {
    res.write(`data: ${JSON.stringify({ error: 'Autenticação necessária' })}\n\n`)
    res.end()
    return
  }

  const parsed = streamQuerySchema.safeParse({
    conversationId: req.query.conversationId,
    message: req.query.message,
  })

  if (!parsed.success) {
    res.write(`data: ${JSON.stringify({ error: 'Parâmetros inválidos', details: parsed.error.flatten() })}\n\n`)
    res.end()
    return
  }

  const { conversationId, message: rawMessage } = parsed.data
  const message = sanitizeUserInput(rawMessage)

  // Indicador ... obrigatório antes do 1o token
  res.write(`data: ${JSON.stringify({ type: 'indicator', content: '. . .' })}\n\n`)

  try {
    const history = await getConversationContext(conversationId)
    // Insere o prompt de sistema como primeira mensagem do histórico pro LLM
    const sysPrompt = buildSystemPrompt({
      userName: userId,
      userRole: (req as any).auth?.role ?? 'user',
      tenantName: tenantId,
      activeServices: []
    })
    
    // Na vida real isso seria consumido com stream pelo SDK do Gemini:
    // const resultStream = await chat.sendMessageStream(message)
    // for await (const chunk of resultStream) { res.write... }
    
    // Como usar o fallback chain complexifica com streaming (cada erro tenta o prox model), 
    // simularemos a quebra da resposta do generateContentWithFallback para efeito didático:
    
    // ... Aqui poderia ter uma checagem se é ação destrutiva via classificação simples pré-envio
    
    res.write(`data: ${JSON.stringify({ type: 'transparency', content: '📝 Processando sua solicitação (auditoria em background)' })}\n\n`)
    
    const result = await generateContentWithFallback(message, history)
    
    res.write(`data: ${JSON.stringify({ type: 'message', content: result.text })}\n\n`)
    res.write(`data: [DONE]\n\n`)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno'
    res.write(`data: ${JSON.stringify({ error: message })}\n\n`)
  } finally {
    res.end()
  }
})

// Requisição síncrona alternativa
chatRouter.post('/api/v1/gabi/chat', async (req, res, next) => {
  try {
    const { conversationId, message } = chatSchema.parse(req.body)
    const history = await getConversationContext(conversationId)
    const result = await generateContentWithFallback(message, history)
    res.json({ response: result.text })
  } catch (error) {
    next(error)
  }
})
