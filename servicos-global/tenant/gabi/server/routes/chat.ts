// server/routes/chat.ts
import { Router } from 'express'
import { z } from 'zod'
import { getConversationContext, buildSystemPrompt } from '../services/chat.js'
import { generateContentWithFallback } from '../services/gemini.js'

export const chatRouter = Router()

const chatSchema = z.object({
  conversationId: z.string(),
  message: z.string().min(1),
})

// Requisicao sincrona (usada pelo widget)
chatRouter.post('/api/v1/gabi/chat', async (req, res, next) => {
  try {
    const { conversationId, message } = chatSchema.parse(req.body)
    const tenantId = (req.headers['x-tenant-id'] as string) || 'default'
    const userId = (req.headers['x-user-id'] as string) || 'anonymous'

    const history = conversationId !== 'new'
      ? await getConversationContext(conversationId)
      : []

    const sysPrompt = buildSystemPrompt({
      userName: userId,
      userRole: 'user',
      tenantName: tenantId,
      activeServices: ['Gabi IA'],
    })

    const result = await generateContentWithFallback(
      `${sysPrompt}\n\nPergunta do usuario: ${message}`,
      history
    )

    res.json({
      response: result.text,
      model: result.modelUsed,
      tokens: { input: result.tokensInput, output: result.tokensOutput },
      cost_usd: result.costUsd,
    })
  } catch (error) {
    next(error)
  }
})

// SSE Streaming
chatRouter.get('/api/v1/gabi/chat/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  const tenantId = (req.query.tenantId as string) || 'default'
  const userId = (req.query.userId as string) || 'anonymous'
  const conversationId = req.query.conversationId as string
  const message = req.query.message as string

  if (!conversationId || !message) {
    res.write(`data: ${JSON.stringify({ error: 'Faltam parametros (conversationId, message)' })}\n\n`)
    res.end()
    return
  }

  res.write(`data: ${JSON.stringify({ type: 'indicator', content: '. . .' })}\n\n`)

  try {
    const history = conversationId !== 'new'
      ? await getConversationContext(conversationId)
      : []

    const sysPrompt = buildSystemPrompt({
      userName: userId,
      userRole: 'user',
      tenantName: tenantId,
      activeServices: ['Gabi IA'],
    })

    const result = await generateContentWithFallback(
      `${sysPrompt}\n\nPergunta do usuario: ${message}`,
      history
    )

    res.write(`data: ${JSON.stringify({ type: 'message', content: result.text, model: result.modelUsed, cost: result.costUsd })}\n\n`)
    res.write(`data: [DONE]\n\n`)
  } catch (err: any) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`)
  } finally {
    res.end()
  }
})
