/**
 * webhooks-integracao.ts — S2S: enfileirar eventos + CRUD credencial OAuth (portal).
 */

import { Router, Request, Response, NextFunction } from 'express'
import { PrismaClient } from '../../../../generated/index.js'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { requireInternalKey } from '../middleware/requireInternalKey'
import { hashToken } from '../crypto'
import { eventoWebhookIntegracaoValido } from '../lib/catalogo-eventos-webhook'

export const webhooksIntegracaoRouter = Router()
const prisma = new PrismaClient()

webhooksIntegracaoRouter.use(requireInternalKey)

const enfileirarEventoSchema = z.object({
  id_organizacao: z.string().min(1),
  id_produto_gravity: z.string().optional().nullable(),
  tipo_evento: z.string().min(1),
  payload: z.record(z.unknown()),
  id_evento: z.string().uuid().optional(),
})

const criarCredencialOAuthSchema = z.object({
  id_organizacao: z.string().min(1),
  id_usuario: z.string().optional().nullable(),
  ambiente: z.enum(['SANDBOX', 'PRODUCAO']).default('SANDBOX'),
  escopo: z.enum(['LEITURA', 'ESCRITA', 'EXCLUSAO']).default('LEITURA'),
})

webhooksIntegracaoRouter.post('/enfileirar-evento-integracao', async (req, res, next) => {
  try {
    const parsed = enfileirarEventoSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ erro: 'Body invalido', issues: parsed.error.issues })
    }

    if (!eventoWebhookIntegracaoValido(parsed.data.tipo_evento)) {
      return res.status(400).json({ erro: 'tipo_evento nao catalogado', tipo_evento: parsed.data.tipo_evento })
    }

    const idEvento = parsed.data.id_evento ?? randomUUID()

    const existente = await prisma.webhookEventoEnfileirado.findUnique({
      where: { id_evento_webhook_enfileirado: idEvento },
    })
    if (existente) {
      return res.status(200).json({ id_evento: idEvento, status: existente.status_webhook_evento_enfileirado })
    }

    const enfileirado = await prisma.webhookEventoEnfileirado.create({
      data: {
        id_organizacao: parsed.data.id_organizacao,
        id_produto_gravity: parsed.data.id_produto_gravity ?? null,
        id_evento_webhook_enfileirado: idEvento,
        tipo_evento_webhook_enfileirado: parsed.data.tipo_evento,
        payload_evento_webhook_enfileirado: parsed.data.payload as object,
      },
    })

    res.status(202).json({
      id_evento: enfileirado.id_evento_webhook_enfileirado,
      status: enfileirado.status_webhook_evento_enfileirado,
    })
  } catch (err) {
    next(err)
  }
})

webhooksIntegracaoRouter.post('/credenciais-oauth', async (req, res, next) => {
  try {
    const parsed = criarCredencialOAuthSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ erro: 'Body invalido', issues: parsed.error.issues })
    }

    const clientId = `gravity_oauth_${randomUUID().replace(/-/g, '').slice(0, 16)}`
    const clientSecret = `gravity_oauth_secret_${randomUUID().replace(/-/g, '')}`

    const credencial = await prisma.credencialOAuthApi.create({
      data: {
        id_organizacao: parsed.data.id_organizacao,
        id_usuario: parsed.data.id_usuario ?? null,
        client_id_credencial_oauth_api: clientId,
        hash_client_secret_credencial_oauth_api: hashToken(clientSecret),
        ambiente_credencial_oauth_api: parsed.data.ambiente,
        escopo_credencial_oauth_api: parsed.data.escopo,
      },
    })

    res.status(201).json({
      id_credencial_oauth_api: credencial.id_credencial_oauth_api,
      client_id: clientId,
      client_secret: clientSecret,
      ambiente: credencial.ambiente_credencial_oauth_api,
      escopo: credencial.escopo_credencial_oauth_api,
    })
  } catch (err) {
    next(err)
  }
})

webhooksIntegracaoRouter.get('/credenciais-oauth', async (req, res, next) => {
  try {
    const idOrganizacao = z.string().min(1).parse(req.query.id_organizacao)
    const credenciais = await prisma.credencialOAuthApi.findMany({
      where: { id_organizacao: idOrganizacao, revogado_credencial_oauth_api: false },
      select: {
        id_credencial_oauth_api: true,
        client_id_credencial_oauth_api: true,
        ambiente_credencial_oauth_api: true,
        escopo_credencial_oauth_api: true,
        data_criacao_credencial_oauth_api: true,
      },
      orderBy: { data_criacao_credencial_oauth_api: 'desc' },
    })
    res.json({ credenciais })
  } catch (err) {
    next(err)
  }
})
