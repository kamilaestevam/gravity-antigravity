/**
 * webhooks.ts — Rotas CRUD para webhooks (model WebhookConfiguracao + WebhookLog)
 *
 * Padrao S2S — chamado SOMENTE pelo proxy do Configurador via x-chave-interna-servico.
 * Configurador valida JWT do usuario e injeta id_organizacao no body/query.
 *
 * GET    /api/v1/cockpit/webhooks                                      — listar
 * POST   /api/v1/cockpit/webhooks                                      — criar (retorna segredo UMA vez)
 * PUT    /api/v1/cockpit/webhooks/:id_webhook_configuracao             — atualizar
 * POST   /api/v1/cockpit/webhooks/:id_webhook_configuracao/disparar-evento-teste — testar disparo
 * GET    /api/v1/cockpit/webhooks/:id_webhook_configuracao/historico   — logs de entrega
 * DELETE /api/v1/cockpit/webhooks/:id_webhook_configuracao             — excluir
 *
 * NOMENCLATURA DDD:
 *   - id_organizacao, id_produto_gravity, id_usuario  FKs canonicas (REGRA 3/4)
 *   - url_webhook_configuracao, segredo_webhook_configuracao, eventos_webhook_configuracao
 *   - ativo_webhook_configuracao (REGRA 5: sem prefixo is_)
 *   - data_criacao_webhook_configuracao, data_atualizacao_webhook_configuracao
 */

import { Router, Request, Response, NextFunction } from 'express'
import { PrismaClient } from '../../../../generated/index.js'
import { z } from 'zod'
import { generateWebhookSecret, generateHMACSignature } from '../crypto'
import { requireInternalKey } from '../middleware/requireInternalKey'

export const webhooksRouter = Router()
const prisma = new PrismaClient()

webhooksRouter.use(requireInternalKey)

// ─── Schemas Zod (Mandamento 06) ─────────────────────────────────────────

const listarWebhooksQuerySchema = z.object({
  id_organizacao: z.string().min(1, 'id_organizacao obrigatorio'),
})

const criarWebhookSchema = z.object({
  id_organizacao:               z.string().min(1, 'id_organizacao obrigatorio'),
  id_produto_gravity:           z.string().optional(),
  id_usuario:                   z.string().optional(),
  url_webhook_configuracao:     z.string().url('URL invalida'),
  eventos_webhook_configuracao: z.array(z.string()).min(1, 'Pelo menos 1 evento obrigatorio'),
  ativo_webhook_configuracao:   z.boolean().optional(),
})

const atualizarWebhookSchema = z.object({
  id_organizacao:               z.string().min(1, 'id_organizacao obrigatorio'),
  url_webhook_configuracao:     z.string().url('URL invalida').optional(),
  eventos_webhook_configuracao: z.array(z.string()).min(1).optional(),
  ativo_webhook_configuracao:   z.boolean().optional(),
})

const webhookParamsSchema = z.object({
  id_webhook_configuracao: z.string().min(1),
})

const dispararTesteBodySchema = z.object({
  id_organizacao: z.string().min(1, 'id_organizacao obrigatorio'),
})

// ─── GET / — listar webhooks da organizacao ──────────────────────────────

webhooksRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = listarWebhooksQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      return res.status(400).json({ erro: 'Query invalida', issues: parsed.error.issues })
    }

    const webhooks = await prisma.webhookConfiguracao.findMany({
      where: { id_organizacao: parsed.data.id_organizacao },
      orderBy: { data_criacao_webhook_configuracao: 'desc' },
    })

    res.json({ webhooks })
  } catch (error) {
    next(error)
  }
})

// ─── POST / — criar webhook ─────────────────────────────────────────────

webhooksRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = criarWebhookSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ erro: 'Body invalido', issues: parsed.error.issues })
    }

    const segredo = generateWebhookSecret()

    const webhook = await prisma.webhookConfiguracao.create({
      data: {
        id_organizacao:               parsed.data.id_organizacao,
        id_produto_gravity:           parsed.data.id_produto_gravity ?? null,
        id_usuario:                   parsed.data.id_usuario ?? null,
        url_webhook_configuracao:     parsed.data.url_webhook_configuracao,
        segredo_webhook_configuracao: segredo,
        eventos_webhook_configuracao: parsed.data.eventos_webhook_configuracao,
        ativo_webhook_configuracao:   parsed.data.ativo_webhook_configuracao ?? true,
      },
    })

    res.status(201).json({
      ...webhook,
      segredo_webhook_configuracao: segredo,
    })
  } catch (error) {
    next(error)
  }
})

// ─── PUT /:id_webhook_configuracao — atualizar webhook ──────────────────

webhooksRouter.put('/:id_webhook_configuracao', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = webhookParamsSchema.safeParse(req.params)
    if (!params.success) {
      return res.status(400).json({ erro: 'Params invalidos', issues: params.error.issues })
    }

    const parsed = atualizarWebhookSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ erro: 'Body invalido', issues: parsed.error.issues })
    }

    const existente = await prisma.webhookConfiguracao.findFirst({
      where: {
        id_webhook_configuracao: params.data.id_webhook_configuracao,
        id_organizacao:          parsed.data.id_organizacao,
      },
    })

    if (!existente) {
      return res.status(404).json({ erro: 'Webhook nao encontrado' })
    }

    const { id_organizacao: _, ...dadosAtualizacao } = parsed.data
    const atualizado = await prisma.webhookConfiguracao.update({
      where: { id_webhook_configuracao: params.data.id_webhook_configuracao },
      data: dadosAtualizacao,
    })

    res.json(atualizado)
  } catch (error) {
    next(error)
  }
})

// ─── POST /:id_webhook_configuracao/disparar-evento-teste — testar ──────

webhooksRouter.post('/:id_webhook_configuracao/disparar-evento-teste', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = webhookParamsSchema.safeParse(req.params)
    if (!params.success) {
      return res.status(400).json({ erro: 'Params invalidos', issues: params.error.issues })
    }

    const parsed = dispararTesteBodySchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ erro: 'Body invalido', issues: parsed.error.issues })
    }

    const webhook = await prisma.webhookConfiguracao.findFirst({
      where: {
        id_webhook_configuracao: params.data.id_webhook_configuracao,
        id_organizacao:          parsed.data.id_organizacao,
      },
    })

    if (!webhook) {
      return res.status(404).json({ erro: 'Webhook nao encontrado' })
    }

    const payload = JSON.stringify({
      evento: 'teste.evento',
      timestamp: new Date().toISOString(),
      data: { mensagem: 'Disparo de teste do API Cockpit Gravity' },
    })

    const assinatura = generateHMACSignature(payload, webhook.segredo_webhook_configuracao)

    const inicio = Date.now()
    let codigoResposta = 0
    let erroMsg: string | null = null

    try {
      const response = await fetch(webhook.url_webhook_configuracao, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Gravity-Signature': assinatura,
        },
        body: payload,
        signal: AbortSignal.timeout(10_000),
      })
      codigoResposta = response.status
    } catch (e: unknown) {
      codigoResposta = 500
      erroMsg = e instanceof Error ? e.message : String(e)
    }

    const latenciaMs = Date.now() - inicio

    await prisma.webhookLog.create({
      data: {
        id_organizacao:                    parsed.data.id_organizacao,
        id_webhook_configuracao:           webhook.id_webhook_configuracao,
        evento_webhook_log:                'teste.evento',
        codigo_resposta_http_webhook_log:  codigoResposta,
        latencia_ms_webhook_log:           latenciaMs,
        quantidade_tentativas_webhook_log: 1,
        payload_webhook_log:               JSON.parse(payload),
        erro_webhook_log:                  erroMsg,
      },
    })

    res.json({
      sucesso:                          codigoResposta >= 200 && codigoResposta < 300,
      codigo_resposta_http_webhook_log: codigoResposta,
      latencia_ms_webhook_log:          latenciaMs,
      erro_webhook_log:                 erroMsg,
    })
  } catch (error) {
    next(error)
  }
})

// ─── GET /:id_webhook_configuracao/historico — logs de entrega ───────────

webhooksRouter.get('/:id_webhook_configuracao/historico', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = webhookParamsSchema.safeParse(req.params)
    if (!params.success) {
      return res.status(400).json({ erro: 'Params invalidos', issues: params.error.issues })
    }

    const queryParsed = listarWebhooksQuerySchema.safeParse(req.query)
    if (!queryParsed.success) {
      return res.status(400).json({ erro: 'Query invalida', issues: queryParsed.error.issues })
    }

    const historico = await prisma.webhookLog.findMany({
      where: {
        id_webhook_configuracao: params.data.id_webhook_configuracao,
        id_organizacao:          queryParsed.data.id_organizacao,
      },
      orderBy: { data_criacao_webhook_log: 'desc' },
      take: 100,
    })

    res.json({ historico })
  } catch (error) {
    next(error)
  }
})

// ─── DELETE /:id_webhook_configuracao — excluir webhook ─────────────────

webhooksRouter.delete('/:id_webhook_configuracao', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = webhookParamsSchema.safeParse(req.params)
    if (!params.success) {
      return res.status(400).json({ erro: 'Params invalidos', issues: params.error.issues })
    }

    const bodyParsed = dispararTesteBodySchema.safeParse(req.body)
    if (!bodyParsed.success) {
      return res.status(400).json({ erro: 'Body invalido — id_organizacao obrigatorio', issues: bodyParsed.error.issues })
    }

    const existente = await prisma.webhookConfiguracao.findFirst({
      where: {
        id_webhook_configuracao: params.data.id_webhook_configuracao,
        id_organizacao:          bodyParsed.data.id_organizacao,
      },
    })

    if (!existente) {
      return res.status(404).json({ erro: 'Webhook nao encontrado' })
    }

    await prisma.webhookConfiguracao.delete({
      where: { id_webhook_configuracao: params.data.id_webhook_configuracao },
    })

    res.status(204).send()
  } catch (error) {
    next(error)
  }
})
