// server/routes/chat.ts
import { Router } from 'express'
import { z } from 'zod'
import { getConversationContext, buildSystemPrompt } from '../services/chat.js'
import { generateContentWithFallback } from '../services/gemini.js'

export const chatRouter = Router()

const MAX_MESSAGE_LENGTH = 10_000

const chatSchema = z.object({
  conversationId: z.string().max(255),
  message: z.string().min(1).max(MAX_MESSAGE_LENGTH),
  page: z.string().max(255).optional(),
})

// Requisicao sincrona (usada pelo widget)
chatRouter.post('/api/v1/gabi/chat', async (req, res, next) => {
  try {
    const { conversationId, message: rawMessage, page } = chatSchema.parse(req.body)
    const message = sanitizeUserInput(rawMessage)

    // tenant/user DEVEM vir do JWT autenticado (req.auth), não dos headers/query
    const tenantId = (req as any).auth?.tenantId || (req.headers['x-tenant-id'] as string) || 'default'
    const userId = (req as any).auth?.userId || (req.headers['x-user-id'] as string) || 'anonymous'

    const history = conversationId !== 'new'
      ? await getConversationContext(conversationId)
      : []

    const sysPrompt = buildSystemPrompt({
      userName: userId,
      userRole: (req as any).auth?.role ?? 'user',
      tenantName: tenantId,
      activeServices: ['Gabi IA'],
      currentPage: page,
    })

    const result = await generateContentWithFallback(
      `${sysPrompt}\n\nPergunta do usuario: ${message}`,
      history
    )

    const { cleanText, suggestions } = extractSuggestions(result.text)

    res.json({
      response: cleanText,
      suggestions,
      model: result.modelUsed,
      tokens: { input: result.tokensInput, output: result.tokensOutput },
      cost_usd: result.costUsd,
    })
  } catch (error) {
    next(error)
  }
})

const streamQuerySchema = z.object({
  conversationId: z.string().max(255),
  message: z.string().min(1).max(MAX_MESSAGE_LENGTH),
  page: z.string().max(255).optional(),
})

function sanitizeUserInput(input: string): string {
  return input
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim()
}

function extractSuggestions(text: string): { cleanText: string; suggestions: string[] } {
  const match = text.match(/<!--FOLLOW_UP:\[(.+?)\]-->/)
  if (!match) return { cleanText: text.trim(), suggestions: [] }
  try {
    const suggestions: string[] = JSON.parse(`[${match[1]}]`)
    const cleanText = text.replace(/<!--FOLLOW_UP:\[.+?\]-->/, '').trim()
    return { cleanText, suggestions }
  } catch {
    return { cleanText: text.trim(), suggestions: [] }
  }
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
    page: req.query.page,
  })

  if (!parsed.success) {
    res.write(`data: ${JSON.stringify({ error: 'Parâmetros inválidos', details: parsed.error.flatten() })}\n\n`)
    res.end()
    return
  }

  const { conversationId, message: rawMessage, page } = parsed.data
  const message = sanitizeUserInput(rawMessage)

  // Indicador ... obrigatório antes do 1o token
  res.write(`data: ${JSON.stringify({ type: 'indicator', content: '. . .' })}\n\n`)

  try {
    const history = conversationId !== 'new'
      ? await getConversationContext(conversationId)
      : []

    const sysPrompt = buildSystemPrompt({
      userName: userId,
      userRole: (req as any).auth?.role ?? 'user',
      tenantName: tenantId,
      activeServices: ['Gabi IA'],
      currentPage: page,
    })

    const result = await generateContentWithFallback(
      `${sysPrompt}\n\nPergunta do usuario: ${message}`,
      history
    )

    const { cleanText: streamClean, suggestions: streamSuggestions } = extractSuggestions(result.text)
    res.write(`data: ${JSON.stringify({ type: 'message', content: streamClean, suggestions: streamSuggestions, model: result.modelUsed, cost: result.costUsd })}\n\n`)
    res.write(`data: [DONE]\n\n`)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno'
    res.write(`data: ${JSON.stringify({ error: message })}\n\n`)
  } finally {
    res.end()
  }
})
