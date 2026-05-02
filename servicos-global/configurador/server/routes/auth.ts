// server/routes/auth.ts
// Clerk webhooks — sincroniza eventos de usuário com o banco local
// POST /api/v1/webhooks/clerk
//
// ── CONFIGURAÇÃO NECESSÁRIA NO CLERK DASHBOARD ────────────────────────────────
// URL: https://dashboard.clerk.com → Webhooks → Endpoints
//
// Endpoint URL: https://<seu-dominio>/api/v1/webhooks/clerk
//
// Eventos que DEVEM estar habilitados:
//   Categoria "Usuario":
//     ✅ user.created
//     ✅ user.updated
//     ✅ user.deleted
//   Categoria "Session":
//     ✅ session.created   → gera log LOGIN no histórico
//     ✅ session.ended     → gera log LOGOUT no histórico
//     ✅ session.revoked   → gera log SESSION_REVOKED no histórico
//
// Sem os eventos de Session, login/logout NÃO aparecerão no histórico de auditoria.
// ─────────────────────────────────────────────────────────────────────────────

import { Router } from 'express'
import { z } from 'zod'
import { Webhook } from 'svix'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/appError.js'
import { auditLog } from '../../../servicos-plataforma/historico-global/src/audit-client.js'

export const authRouter = Router()

const ClerkUserEventSchema = z.object({
  type: z.string(),
  data: z.object({
    id: z.string(),
    // Campos de user events
    email_addresses: z.array(z.object({ email_address: z.string() })).optional(),
    first_name: z.string().nullable().optional(),
    last_name: z.string().nullable().optional(),
    public_metadata: z.record(z.unknown()).optional(),
    // Campos de session events
    user_id: z.string().optional(),
    client_id: z.string().optional(),
    status: z.string().optional(),
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
      const existing = await prisma.usuario.findFirst({
        where: { id_clerk_usuario: data.id },
      })
      if (!existing) {
        // Usuário criado no Clerk mas sem tenant ainda — será vinculado no onboarding
        console.log(`[webhook] Novo usuário Clerk registrado: ${data.id} <${primaryEmail}>`)
      }
    }

    if (type === 'user.updated' && primaryEmail) {
      await prisma.usuario.updateMany({
        where: { id_clerk_usuario: data.id },
        data: {
          email_usuario: primaryEmail,
          nome_usuario:  name || 'Sem nome',
        },
      })
    }

    if (type === 'user.deleted') {
      await prisma.usuario.deleteMany({
        where: { id_clerk_usuario: data.id },
      })
    }

    // Ponto Cego 5 — logar login e logout via eventos de sessão do Clerk
    if (type === 'session.created' && data.user_id) {
      setImmediate(async () => {
        try {
          const user = await prisma.usuario.findFirst({
            where: { id_clerk_usuario: data.user_id },
            select: { id_usuario: true, id_organizacao: true, email_usuario: true, nome_usuario: true },
          })
          if (user) {
            auditLog({
              tenant_id: user.id_organizacao,
              actor_type: 'USER',
              actor_id: user.id_usuario,
              actor_name: user.nome_usuario ?? user.email_usuario,
              module: 'auth',
              resource_type: 'Session',
              resource_id: data.id,
              action: 'LOGIN',
              action_detail: `Login realizado por ${user.nome_usuario ?? user.email_usuario}`,
              status: 'SUCCESS',
              user_id: user.id_usuario,
            })
          }
        } catch { /* fire-and-forget */ }
      })
    }

    if (type === 'session.ended' && data.user_id) {
      setImmediate(async () => {
        try {
          const user = await prisma.usuario.findFirst({
            where: { id_clerk_usuario: data.user_id },
            select: { id_usuario: true, id_organizacao: true, email_usuario: true, nome_usuario: true },
          })
          if (user) {
            auditLog({
              tenant_id: user.id_organizacao,
              actor_type: 'USER',
              actor_id: user.id_usuario,
              actor_name: user.nome_usuario ?? user.email_usuario,
              module: 'auth',
              resource_type: 'Session',
              resource_id: data.id,
              action: 'LOGOUT',
              action_detail: `Logout de ${user.nome_usuario ?? user.email_usuario}`,
              status: 'SUCCESS',
              user_id: user.id_usuario,
            })
          }
        } catch { /* fire-and-forget */ }
      })
    }

    if (type === 'session.revoked' && data.user_id) {
      setImmediate(async () => {
        try {
          const user = await prisma.usuario.findFirst({
            where: { id_clerk_usuario: data.user_id },
            select: { id_usuario: true, id_organizacao: true, email_usuario: true, nome_usuario: true },
          })
          if (user) {
            auditLog({
              tenant_id: user.id_organizacao,
              actor_type: 'USER',
              actor_id: user.id_usuario,
              actor_name: user.nome_usuario ?? user.email_usuario,
              module: 'auth',
              resource_type: 'Session',
              resource_id: data.id,
              action: 'SESSION_REVOKED',
              action_detail: `Sessão revogada de ${user.nome_usuario ?? user.email_usuario}`,
              status: 'PARTIAL',
              user_id: user.id_usuario,
            })
          }
        } catch { /* fire-and-forget */ }
      })
    }

    res.json({ received: true })
  } catch (err) {
    next(err)
  }
})
