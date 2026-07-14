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

    const credencial = await prisma.apiCredencialOauth.create({
      data: {
        id_organizacao: parsed.data.id_organizacao,
        id_usuario: parsed.data.id_usuario ?? null,
        client_id_api_credencial_oauth: clientId,
        hash_client_secret_api_credencial_oauth: hashToken(clientSecret),
        ambiente_api_credencial_oauth: parsed.data.ambiente,
        escopo_api_credencial_oauth: parsed.data.escopo,
      },
    })

    res.status(201).json({
      id_api_credencial_oauth: credencial.id_api_credencial_oauth,
      client_id: clientId,
      client_secret: clientSecret,
      ambiente: credencial.ambiente_api_credencial_oauth,
      escopo: credencial.escopo_api_credencial_oauth,
    })
  } catch (err) {
    next(err)
  }
})

webhooksIntegracaoRouter.get('/credenciais-oauth', async (req, res, next) => {
  try {
    const idOrganizacao = z.string().min(1).parse(req.query.id_organizacao)
    const credenciais = await prisma.apiCredencialOauth.findMany({
      where: { id_organizacao: idOrganizacao, revogado_api_credencial_oauth: false },
      select: {
        id_api_credencial_oauth: true,
        client_id_api_credencial_oauth: true,
        ambiente_api_credencial_oauth: true,
        escopo_api_credencial_oauth: true,
        data_criacao_api_credencial_oauth: true,
      },
      orderBy: { data_criacao_api_credencial_oauth: 'desc' },
    })
    res.json({ credenciais })
  } catch (err) {
    next(err)
  }
})
