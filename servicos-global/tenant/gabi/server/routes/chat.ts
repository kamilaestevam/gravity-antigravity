// server/routes/chat.ts
import { Router } from 'express'
import { z } from 'zod'
import { getConversationContext, buildSystemPrompt } from '../services/chat.js'
import { generateContentWithFallback } from '../services/gemini.js'
import { AppError } from '../lib/errors.js'

export const chatRouter = Router()

const chatSchema = z.object({
  conversationId: z.string(),
  message: z.string().min(1)
})

// SSE Streaming
chatRouter.get('/api/v1/gabi/chat/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  const { tenantId, userId } = req.query as any
  const conversationId = req.query.conversationId as string
  const message = req.query.message as string

  if (!tenantId || !userId || !conversationId || !message) {
    res.write(`data: ${JSON.stringify({ error: 'Faltam parâmetros requiridos (tenantId, userId, conversationId, message)' })}\n\n`)
    res.end()
    return
  }

  // Indicador ... obrigatório antes do 1o token
  res.write(`data: ${JSON.stringify({ type: 'indicator', content: '. . .' })}\n\n`)

  try {
    const history = await getConversationContext(conversationId)
    // Insere o prompt de sistema como primeira mensagem do histórico pro LLM
    const sysPrompt = buildSystemPrompt({
      userName: userId,
      userRole: 'admin',
      tenantName: 'Tenant Atual',
      activeServices: ['Serviço1']
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
  } catch (err: any) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`)
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
