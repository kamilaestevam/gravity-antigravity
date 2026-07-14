/**
 * oauth-token.ts — POST /api/v1/cockpit/oauth/token (client_credentials)
 */

import { Router, Request, Response, NextFunction } from 'express'
import { PrismaClient } from '../../../../generated/index.js'
import { z } from 'zod'
import { hashToken } from '../crypto'
import { emitirTokenOAuthAcesso } from '../lib/sessao-oauth-api'

export const oauthTokenRouter = Router()
const prisma = new PrismaClient()

const tokenBodySchema = z.object({
  grant_type: z.literal('client_credentials'),
  client_id: z.string().min(1),
  client_secret: z.string().min(1),
})

oauthTokenRouter.post('/token', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body =
      typeof req.body?.grant_type === 'string'
        ? req.body
        : {
            grant_type: req.body?.grant_type ?? 'client_credentials',
            client_id: req.body?.client_id,
            client_secret: req.body?.client_secret,
          }

    const parsed = tokenBodySchema.safeParse(body)
    if (!parsed.success) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'grant_type client_credentials com client_id e client_secret obrigatorios',
        issues: parsed.error.issues,
      })
    }

    const credencial = await prisma.apiCredencialOauth.findFirst({
      where: {
        client_id_api_credencial_oauth: parsed.data.client_id,
        revogado_api_credencial_oauth: false,
      },
    })

    if (!credencial) {
      return res.status(401).json({ error: 'invalid_client' })
    }

    const hashSecret = hashToken(parsed.data.client_secret)
    if (hashSecret !== credencial.hash_client_secret_api_credencial_oauth) {
      return res.status(401).json({ error: 'invalid_client' })
    }

    const { access_token, expires_in } = emitirTokenOAuthAcesso(
      credencial.id_organizacao,
      credencial.escopo_api_credencial_oauth,
    )

    res.status(200).json({
      access_token,
      token_type: 'Bearer',
      expires_in,
      escopo: credencial.escopo_api_credencial_oauth,
    })
  } catch (err) {
    next(err)
  }
})
