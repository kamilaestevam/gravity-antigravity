// server/routes/auth.ts
// Clerk webhooks — sincroniza eventos de usuário com o banco local
// POST /api/v1/webhooks/clerk

import { Router } from 'express'
import { z } from 'zod'
import { Webhook } from 'svix'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/appError.js'

export const authRouter = Router()

const ClerkUserEventSchema = z.object({
  type: z.string(),
  data: z.object({
    id: z.string(),
    email_addresses: z
      .array(z.object({ email_address: z.string() }))
      .optional(),
    first_name: z.string().nullable().optional(),
    last_name: z.string().nullable().optional(),
    public_metadata: z
      .record(z.unknown())
      .optional(),
  }),
})

/**
 * POST /api/v1/webhooks/clerk
 * Recebe eventos do Clerk (user.created, user.updated, user.deleted)
 * Assinatura verificada via svix antes de processar qualquer evento
 */
authRouter.post('/clerk', async (req, res, next) => {
  try {
    // Verify webhook signature using svix
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET
    if (!webhookSecret) {
      throw new AppError('CLERK_WEBHOOK_SECRET não configurada', 500, 'CONFIG_ERROR')
    }

    const svixId = req.headers['svix-id'] as string | undefined
    const svixTimestamp = req.headers['svix-timestamp'] as string | undefined
    const svixSignature = req.headers['svix-signature'] as string | undefined

    if (!svixId || !svixTimestamp || !svixSignature) {
      throw new AppError('Cabeçalhos de assinatura svix ausentes', 401, 'UNAUTHORIZED')
    }

    const wh = new Webhook(webhookSecret)
    try {
      wh.verify(JSON.stringify(req.body), {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      })
    } catch {
      throw new AppError('Assinatura do webhook inválida', 401, 'UNAUTHORIZED')
    }

    const parsed = ClerkUserEventSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError('Payload do webhook inválido', 400, 'VALIDATION_ERROR')
    }

    const { type, data } = parsed.data
    const primaryEmail = data.email_addresses?.[0]?.email_address ?? ''
    const name = [data.first_name, data.last_name].filter(Boolean).join(' ')

    if (type === 'user.created') {
      // Verifica se o usuário já existe (idempotência)
      const existing = await prisma.user.findFirst({
        where: { clerk_user_id: data.id },
      })
      if (!existing) {
        // Usuário criado no Clerk mas sem tenant ainda — será vinculado no onboarding
        console.log(`[webhook] Novo usuário Clerk registrado: ${data.id} <${primaryEmail}>`)
      }
    }

    if (type === 'user.updated' && primaryEmail) {
      await prisma.user.updateMany({
        where: { clerk_user_id: data.id },
        data: {
          email: primaryEmail,
          name: name || 'Sem nome',
          updated_at: new Date(),
        },
      })
    }

    if (type === 'user.deleted') {
      await prisma.user.deleteMany({
        where: { clerk_user_id: data.id },
      })
    }

    res.json({ received: true })
  } catch (err) {
    next(err)
  }
})
