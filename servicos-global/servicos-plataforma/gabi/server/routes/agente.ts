// server/routes/agente.ts
// Rota V2 do chat GABI — usa orquestrador com function calling,
// memoria persistente, diagnostico e circuit breaker.

import { Router } from 'express'
import { z } from 'zod'
import { AppError } from '../lib/errors.js'
import { getConversationContext, buildSystemPromptV2 } from '../services/chat.js'
import { executarAgente, confirmarAcaoPendente } from '../services/orquestrador-agente.js'
import { carregarMemorias, formatarMemoriasParaPrompt, salvarMemoria } from '../services/servico-memoria.js'
import { consultarErrosRecentes, diagnosticarProblema } from '../services/servico-diagnostico.js'
import { avaliarLimite, invalidarCacheGastoMtd } from '../services/limiteMonetarioService.js'
import { auditGabiAction } from '../services/audit.js'
import { filtrarToolsPorPermissao } from '../services/catalogo-ferramentas.js'
import {
  garantirIdConversaGabi,
  persistirTurnoConversa,
} from '../services/servico-persistencia-conversa.js'

export const agenteRouter = Router()

const MAX_MESSAGE_LENGTH = 10_000

// ── Schemas Zod ────────────────────────────────────────────────────────────

const agenteSchema = z.object({
  conversationId: z.string().max(255),
  message: z.string().min(1).max(MAX_MESSAGE_LENGTH),
  page: z.string().max(255).optional(),
})

const confirmarSchema = z.object({
  nonce: z.string().min(1).max(128),
  tool_id: z.string().min(1).max(128),
  parametros: z.record(z.unknown()).optional().default({}),
})

const feedbackSchema = z.object({
  id_conversa: z.string().max(255),
  id_mensagem: z.string().max(255).optional(),
  tipo: z.enum(['positivo', 'negativo']),
  comentario: z.string().max(500).optional(),
})

// ── POST /api/v1/gabi/agente/chat — Chat V2 com SSE ───────────────────────

agenteRouter.post('/api/v1/gabi/agente/chat', async (req, res, next) => {
  try {
    const { conversationId, message: rawMessage, page } = agenteSchema.parse(req.body)
    const message = sanitizeUserInput(rawMessage)

    const tenantId = req.auth.id_organizacao
    const userId = req.auth.id_usuario
    const tipoUsuario = (req.headers['x-tipo-usuario'] as string) ?? 'PADRAO'

    const limite = await avaliarLimite(tenantId, '__pre__')
    if (limite.status === 'bloqueio') {
      return res.status(429).json({
        error: {
          code: 'LLM_USAGE_LIMIT_REACHED',
          message: 'Limite de gasto USD atingido. Contate o admin.',
          escopo: limite.origem_limite,
          gasto_mtd_usd: limite.gasto_mtd_usd,
          limite_usd: limite.limite_bloqueio_usd,
        },
      })
    }

    const conversationIdEfetivo = await garantirIdConversaGabi(
      conversationId,
      tenantId,
      userId,
      message,
    )

    const [history, memorias, errosRecentes] = await Promise.all([
      getConversationContext(conversationIdEfetivo).catch(() => []),
      carregarMemorias({ id_organizacao: tenantId, id_usuario: userId }).catch(() => []),
      consultarErrosRecentes(tenantId, userId, 3, 1).catch(() => []),
    ])

    const toolsPermitidas = filtrarToolsPorPermissao(tipoUsuario)
    const toolsDisponiveis = toolsPermitidas.map((t) => t.id)

    const sysPrompt = buildSystemPromptV2({
      userName: userId,
      userRole: tipoUsuario,
      tenantName: tenantId,
      activeServices: ['Gabi IA'],
      currentPage: page,
      knowledgeContent: '',
      isRag: false,
      tipoUsuario,
      memorias: formatarMemoriasParaPrompt(memorias),
      toolsDisponiveis,
    })

    const emitSse = criarEmitSse(res, false)

    const resultado = await executarAgente(
      sysPrompt,
      message,
      history,
      {
        id_organizacao: tenantId,
        id_usuario: userId,
        id_conversa: conversationIdEfetivo,
        tipo_usuario: tipoUsuario,
      },
      emitSse,
    )

    void auditGabiAction(userId, tenantId, 'agente_chat', message, undefined, {
      modelo: resultado.modelo_usado,
      tokensInput: resultado.tokens_input,
      tokensOutput: resultado.tokens_output,
      custoUsd: resultado.custo_usd,
    }).catch((e) =>
      console.warn('[agente] falha registrando uso LLM', (e as Error).message),
    )

    void invalidarCacheGastoMtd(tenantId).catch(() => {})

    // Inferir memorias de contexto (fire-and-forget)
    if (page) {
      void salvarMemoria(
        { id_organizacao: tenantId, id_usuario: userId },
        'contexto',
        'ultima_pagina',
        page,
        'inferido',
      ).catch(() => {})
    }

    const { cleanText, suggestions } = extractSuggestions(resultado.texto)

    await persistirTurnoConversa({
      conversationId: conversationIdEfetivo,
      id_organizacao: tenantId,
      id_usuario: userId,
      mensagem_usuario: message,
      resposta_assistente: cleanText,
      metadados_assistente: {
        modelo: resultado.modelo_usado,
        custo_usd: resultado.custo_usd,
        tokens: {
          input: resultado.tokens_input,
          output: resultado.tokens_output,
          cached: resultado.tokens_cached,
        },
        tools_chamadas: resultado.tools_chamadas,
      },
    })

    res.json({
      conversationId: conversationIdEfetivo,
      response: cleanText,
      suggestions,
      modelo: resultado.modelo_usado,
      tokens: {
        input: resultado.tokens_input,
        output: resultado.tokens_output,
        cached: resultado.tokens_cached,
      },
      custo_usd: resultado.custo_usd,
      tools_chamadas: resultado.tools_chamadas,
      dados_alterados: resultado.dados_alterados,
      confirmacoes_pendentes: resultado.confirmacoes_pendentes.map((c) => ({
        nonce: c.nonce,
        tool_id: c.tool_id,
        descricao_acao: c.descricao_acao,
        classe: c.classe,
        expira_em: c.expira_em.toISOString(),
      })),
      erros_recentes: errosRecentes.length,
    })
  } catch (error) {
    next(error)
  }
})

// ── GET /api/v1/gabi/agente/chat/stream — Chat V2 com SSE streaming ───────

agenteRouter.get('/api/v1/gabi/agente/chat/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  const tenantId = req.auth?.id_organizacao
  const userId = req.auth?.id_usuario

  if (!tenantId || !userId) {
    res.write(`data: ${JSON.stringify({ error: 'Autenticacao necessaria' })}\n\n`)
    res.end()
    return
  }

  const tipoUsuario = (req.headers['x-tipo-usuario'] as string) ?? 'PADRAO'

  const parsed = agenteSchema.safeParse({
    conversationId: req.query.conversationId,
    message: req.query.message,
    page: req.query.page,
  })

  if (!parsed.success) {
    res.write(`data: ${JSON.stringify({ error: 'Parametros invalidos', details: parsed.error.flatten() })}\n\n`)
    res.end()
    return
  }

  const { conversationId, message: rawMessage, page } = parsed.data
  const message = sanitizeUserInput(rawMessage)

  res.write(`data: ${JSON.stringify({ type: 'indicator', content: '. . .' })}\n\n`)

  try {
    const [history, memorias] = await Promise.all([
      conversationId !== 'new' ? getConversationContext(conversationId) : Promise.resolve([]),
      carregarMemorias({ id_organizacao: tenantId, id_usuario: userId }),
    ])

    const toolsPermitidas = filtrarToolsPorPermissao(tipoUsuario)
    const toolsDisponiveis = toolsPermitidas.map((t) => t.id)

    const sysPrompt = buildSystemPromptV2({
      userName: userId,
      userRole: tipoUsuario,
      tenantName: tenantId,
      activeServices: ['Gabi IA'],
      currentPage: page,
      knowledgeContent: '',
      isRag: false,
      tipoUsuario,
      memorias: formatarMemoriasParaPrompt(memorias),
      toolsDisponiveis,
    })

    const emitSse = criarEmitSse(res, true)

    const resultado = await executarAgente(
      sysPrompt,
      message,
      history,
      {
        id_organizacao: tenantId,
        id_usuario: userId,
        id_conversa: conversationId,
        tipo_usuario: tipoUsuario,
      },
      emitSse,
    )

    void auditGabiAction(userId, tenantId, 'agente_chat_stream', message, undefined, {
      modelo: resultado.modelo_usado,
      tokensInput: resultado.tokens_input,
      tokensOutput: resultado.tokens_output,
      custoUsd: resultado.custo_usd,
    }).catch(() => {})

    void invalidarCacheGastoMtd(tenantId).catch(() => {})

    const { cleanText: streamClean, suggestions: streamSuggestions } = extractSuggestions(resultado.texto)

    const streamEvent = {
      type: 'message',
      content: streamClean,
      suggestions: streamSuggestions,
      modelo: resultado.modelo_usado,
      custo_usd: resultado.custo_usd,
      tools_chamadas: resultado.tools_chamadas,
      dados_alterados: resultado.dados_alterados,
      confirmacoes_pendentes: resultado.confirmacoes_pendentes.map((c) => ({
        nonce: c.nonce,
        tool_id: c.tool_id,
        descricao_acao: c.descricao_acao,
        classe: c.classe,
        expira_em: c.expira_em.toISOString(),
      })),
    }

    res.write(`data: ${JSON.stringify(streamEvent)}\n\n`)
    res.write(`data: [DONE]\n\n`)
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Erro interno'
    res.write(`data: ${JSON.stringify({ error: errMsg })}\n\n`)
  } finally {
    res.end()
  }
})

// ── POST /api/v1/gabi/agente/confirmar — Confirmar acao pendente ──────────

agenteRouter.post('/api/v1/gabi/agente/confirmar', async (req, res, next) => {
  try {
    const { nonce, tool_id, parametros } = confirmarSchema.parse(req.body)
    const tenantId = req.auth.id_organizacao
    const userId = req.auth.id_usuario
    const tipoUsuario = (req.headers['x-tipo-usuario'] as string) ?? 'PADRAO'

    const resultado = await confirmarAcaoPendente(
      nonce,
      tool_id,
      parametros,
      {
        id_organizacao: tenantId,
        id_usuario: userId,
        id_conversa: '',
        tipo_usuario: tipoUsuario,
      },
    )

    if (!resultado.sucesso) {
      return res.status(400).json({
        error: {
          code: 'CONFIRMATION_FAILED',
          message: resultado.erro ?? 'Falha ao confirmar acao',
        },
      })
    }

    void auditGabiAction(userId, tenantId, 'agente_confirmar', `tool=${tool_id} nonce=${nonce}`).catch(() => {})

    res.json({
      sucesso: true,
      dados: resultado.dados,
    })
  } catch (error) {
    next(error)
  }
})

// ── POST /api/v1/gabi/agente/feedback — Feedback do usuario ──────────────

agenteRouter.post('/api/v1/gabi/agente/feedback', async (req, res, next) => {
  try {
    const { id_conversa, id_mensagem, tipo, comentario } = feedbackSchema.parse(req.body)
    const tenantId = req.auth.id_organizacao
    const userId = req.auth.id_usuario

    void salvarMemoria(
      { id_organizacao: tenantId, id_usuario: userId },
      'feedback',
      `feedback_${id_conversa}_${Date.now()}`,
      `${tipo}${comentario ? `: ${comentario}` : ''}`,
      'explicito',
    ).catch(() => {})

    void auditGabiAction(
      userId,
      tenantId,
      'agente_feedback',
      `conversa=${id_conversa} tipo=${tipo}${id_mensagem ? ` msg=${id_mensagem}` : ''}`,
    ).catch(() => {})

    res.json({ registrado: true })
  } catch (error) {
    next(error)
  }
})

// ── Helpers ────────────────────────────────────────────────────────────────

function sanitizeUserInput(input: string): string {
  return input
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim()
}

function criarEmitSse(res: import('express').Response, isStream: boolean) {
  if (!isStream) return undefined
  return (evento: string, dados: unknown) => {
    try {
      res.write(`data: ${JSON.stringify({ type: evento, ...((dados && typeof dados === 'object') ? dados : { content: dados }) })}\n\n`)
    } catch {
      // Conexao pode ter sido fechada
    }
  }
}

function extractSuggestions(text: string): { cleanText: string; suggestions: string[] } {
  const match = text.match(/<!--FOLLOW_UP:\[([\s\S]+?)\]-->/s)
  if (!match) {
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
