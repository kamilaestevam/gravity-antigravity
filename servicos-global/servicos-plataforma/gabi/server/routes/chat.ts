// server/routes/chat.ts
import { Router } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { getConversationContext, buildSystemPrompt, selectKnowledge } from '../services/chat.js'
import { generateContentWithFallback, generateWithTools } from '../services/gemini.js'
import { avaliarLimite, invalidarCacheGastoMtd } from '../services/limiteMonetarioService.js'
import { auditGabiAction } from '../services/audit.js'
import type { GabiChatResponse, GabiChatStreamEvent } from '../lib/schemas.js'

export const chatRouter = Router()

const MAX_MESSAGE_LENGTH = 10_000

const chatSchema = z.object({
  conversationId: z.string().max(255),
  message: z.string().min(1).max(MAX_MESSAGE_LENGTH),
  page: z.string().max(255).optional(),
})

// Requisicao sincrona (usada pelo widget)
chatRouter.post('/api/v1/gabi/chats', async (req, res, next) => {
  try {
    const { conversationId, message: rawMessage, page } = chatSchema.parse(req.body)
    const message = sanitizeUserInput(rawMessage)

    // tenant/user DEVEM vir do JWT autenticado (req.auth), não dos headers/query
    const tenantId = (req as any).auth?.id_organizacao
    const userId = (req as any).auth?.id_usuario

    if (!tenantId || !userId) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Autenticação necessária' } })
    }

    const limite = await avaliarLimite(tenantId, '__pre__')
    if (limite.status === 'bloqueio') {
      return res.status(429).json({
        error: {
          code:    'LLM_USAGE_LIMIT_REACHED',
          message: 'Limite de gasto USD atingido para este escopo. Contate o admin.',
          escopo:        limite.origem_limite,
          gasto_mtd_usd: limite.gasto_mtd_usd,
          limite_usd:    limite.limite_bloqueio_usd,
        },
      })
    }

    const history = conversationId !== 'new'
      ? await getConversationContext(conversationId)
      : []

    const { knowledge, ragMeta } = await selectKnowledge(message, page)

    const sysPrompt = buildSystemPrompt({
      userName: userId,
      userRole: (req as any).auth?.role ?? 'user',
      tenantName: tenantId,
      activeServices: ['Gabi IA'],
      currentPage: page,
      knowledgeContent: knowledge,
      isRag: ragMeta !== null,
    })

    const toolCtx = {
      tenantId: tenantId,
      userId: userId,
      userRole: (req as any).auth?.role ?? 'user',
    }

    const result = await generateWithTools(sysPrompt, message, history, toolCtx)

    const { cleanText, suggestions } = extractSuggestions(result.text)

    // Persistir mensagens para manter contexto da conversa
    if (conversationId !== 'new') {
      void (async () => {
        try {
          // Garantir que a conversa existe (upsert)
          await prisma.gabiConversaCompleta.upsert({
            where: { id_gabi_conversa: conversationId },
            update: { data_atualizacao_gabi_conversa: new Date() },
            create: {
              id_gabi_conversa: conversationId,
              id_organizacao_gabi_conversa: tenantId,
              id_usuario_gabi_conversa: userId,
              titulo_gabi_conversa: message.slice(0, 80),
            },
          })
          // Salvar mensagem do usuario
          await prisma.gabiMensagemIndividual.create({
            data: {
              id_organizacao_gabi_mensagem: tenantId,
              id_usuario_gabi_mensagem: userId,
              id_conversa_gabi_mensagem: conversationId,
              papel_gabi_mensagem: 'user',
              conteudo_gabi_mensagem: message,
            },
          })
          // Salvar resposta do assistente (depois para garantir ordem)
          await prisma.gabiMensagemIndividual.create({
            data: {
              id_organizacao_gabi_mensagem: tenantId,
              id_usuario_gabi_mensagem: userId,
              id_conversa_gabi_mensagem: conversationId,
              papel_gabi_mensagem: 'assistant',
              conteudo_gabi_mensagem: cleanText,
            },
          })
        } catch (e) {
          console.warn('[chat] falha persistindo mensagens', (e as Error).message)
        }
      })()
    }

    void auditGabiAction(userId, tenantId, 'chat', message, undefined, {
      modelo: result.modelUsed,
      tokensInput: result.tokensInput,
      tokensOutput: result.tokensOutput,
      custoUsd: result.costUsd,
    }, ragMeta ?? undefined).catch((e) =>
      console.warn('[chat] falha registrando uso LLM', (e as Error).message),
    )

    void invalidarCacheGastoMtd(tenantId).catch((e) =>
      console.warn('[chat] falha invalidando cache de gasto MTD', (e as Error).message),
    )

    const payload: GabiChatResponse = {
      response: cleanText,
      suggestions,
      model: result.modelUsed,
      tokens: { input: result.tokensInput, output: result.tokensOutput, cached: result.cachedTokens },
      cost_usd: result.costUsd,
      actions_performed: result.actionsPerformed,
      data_changed: result.dataChanged,
    }
    res.json(payload)
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
  // Regex com flag 's' (dotAll) para capturar newlines dentro do tag
  const match = text.match(/<!--FOLLOW_UP:\[([\s\S]+?)\]-->/s)
  if (!match) {
    // Fallback: limpar qualquer HTML comment residual
    const cleanText = text.replace(/<!--[\s\S]*?-->/g, '').trim()
    return { cleanText, suggestions: [] }
  }
  try {
    const suggestions: string[] = JSON.parse(`[${match[1]}]`)
    const cleanText = text.replace(/<!--FOLLOW_UP:\[[\s\S]+?\]-->/s, '').trim()
    return { cleanText, suggestions }
  } catch {
    return { cleanText: text.trim(), suggestions: [] }
  }
}

// SSE Streaming
chatRouter.get('/api/v1/gabi/chats/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  // tenant/user DEVEM vir do JWT autenticado (req.auth), não dos headers/query
  const tenantId = (req as any).auth?.id_organizacao
  const userId = (req as any).auth?.id_usuario

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

    const { knowledge: streamKnowledge, ragMeta: streamRagMeta } = await selectKnowledge(message, page)

    const sysPrompt = buildSystemPrompt({
      userName: userId,
      userRole: (req as any).auth?.role ?? 'user',
      tenantName: tenantId,
      activeServices: ['Gabi IA'],
      currentPage: page,
      knowledgeContent: streamKnowledge,
      isRag: streamRagMeta !== null,
    })

    const streamToolCtx = {
      tenantId: tenantId,
      userId: userId,
      userRole: (req as any).auth?.role ?? 'user',
    }

    const result = await generateWithTools(sysPrompt, message, history, streamToolCtx)

    void auditGabiAction(userId, tenantId, 'chat_stream', message, undefined, {
      modelo: result.modelUsed,
      tokensInput: result.tokensInput,
      tokensOutput: result.tokensOutput,
      custoUsd: result.costUsd,
    }, streamRagMeta ?? undefined).catch((e) =>
      console.warn('[chat/stream] falha registrando uso LLM', (e as Error).message),
    )

    void invalidarCacheGastoMtd(tenantId).catch((e) =>
      console.warn('[chat/stream] falha invalidando cache de gasto MTD', (e as Error).message),
    )

    const { cleanText: streamClean, suggestions: streamSuggestions } = extractSuggestions(result.text)
    const streamEvent: GabiChatStreamEvent = {
      type: 'message',
      content: streamClean,
      suggestions: streamSuggestions,
      model: result.modelUsed,
      cost: result.costUsd,
      cached_tokens: result.cachedTokens,
      actions_performed: result.actionsPerformed,
      data_changed: result.dataChanged,
    }
    res.write(`data: ${JSON.stringify(streamEvent)}\n\n`)
    res.write(`data: [DONE]\n\n`)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno'
    res.write(`data: ${JSON.stringify({ error: message })}\n\n`)
  } finally {
    res.end()
  }
})
