// TST-UNIT-NOTIF-001 — webhook-resend: validação de assinatura Svix
//
// Testa a segurança e a lógica de mapeamento de eventos da rota
// POST /api/webhooks/resend (Pilar 3 da refatoração de mensageria).
//
// Prisma é mockado via vi.hoisted() (evita problemas com conexão real ao banco).
// O Svix real é usado para garantir que a verificação de HMAC funciona de verdade.

// Sem import de 'vitest' — globals injetados pelo runner (vi, describe, it, expect)
// para evitar resolução para a versão 4.x do root do monorepo.
/// <reference types="vitest/globals" />
import express, { type Request, type Response, type NextFunction } from 'express'
import request from 'supertest'
import { Webhook } from 'svix'

// ── Mock de prisma — deve vir antes de qualquer import do módulo testado ──────
// vi.hoisted() garante que mockUpdateMany seja acessível dentro da factory de
// vi.mock(), que é hoistada para o topo pelo compilador do vitest.
const { mockUpdateMany } = vi.hoisted(() => ({
  mockUpdateMany: vi.fn().mockResolvedValue({ count: 1 }),
}))

vi.mock(
  '../../../../servicos-global/tenant/notificacoes/server/lib/prisma.js',
  () => ({
    prisma: {
      notification: {
        updateMany: mockUpdateMany,
      },
    },
  })
)

// Imports após os mocks (vitest garante a ordem)
import { webhookResendRoutes } from '../../../../servicos-global/organizacao/notificacoes/server/routes/webhook-resend.js'

// ── Constantes de teste ────────────────────────────────────────────────────────
// Secret no formato whsec_<base64> — mesmo valor configurado no vitest.config.ts
// 'gravity-test-secret-for-vitest!!' = 32 bytes → base64 = Z3Jhdml0eS10ZXN0LXNlY3JldC1mb3Itdml0ZXN0ISE=
const TEST_SECRET = 'whsec_Z3Jhdml0eS10ZXN0LXNlY3JldC1mb3Itdml0ZXN0ISE='

// ── Tipos auxiliares ──────────────────────────────────────────────────────────
interface RouteError extends Error {
  statusCode?: number
}

// ── App de teste mínimo ───────────────────────────────────────────────────────
// Cada teste pode controlar o secret via process.env antes de chamar buildApp().
function buildApp() {
  const app = express()
  app.use('/api/v1/notificacoes/webhook-resend', webhookResendRoutes)
  app.use((err: RouteError, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.statusCode ?? 500).json({ error: err.message })
  })
  return app
}

// ── Helper: gera payload + headers completos para o teste ─────────────────────
// svix 1.90+ — wh.sign() retorna apenas a string da assinatura (valor do header
// svix-signature). O objeto de headers completo precisa ser montado manualmente.
function signPayload(
  wh: Webhook,
  type: string,
  emailId: string,
  ts: Date = new Date()
): { payload: string; headers: Record<string, string> } {
  const payload  = JSON.stringify({ type, data: { email_id: emailId } })
  const msgId    = `msg-${Date.now()}-${Math.round(Math.random() * 1e6)}`
  const signature = wh.sign(msgId, ts, payload)
  return {
    payload,
    headers: {
      'svix-id':        msgId,
      'svix-timestamp': String(Math.floor(ts.getTime() / 1000)),
      'svix-signature': signature,
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────

describe('webhook-resend — Fase 1: testes unitários', () => {
  const wh = new Webhook(TEST_SECRET)

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.RESEND_WEBHOOK_SECRET = TEST_SECRET
  })

  // ── BLOCO 1: Rejeição de payloads inválidos (segurança) ───────────────────
  describe('Bloco 1 — rejeição de assinaturas inválidas', () => {
    it('retorna 401 quando não há headers svix (payload forjado sem assinatura)', async () => {
      const app = buildApp()
      const res = await request(app)
        .post('/api/v1/notificacoes/webhook-resend')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({ type: 'email.delivered', data: { email_id: 'forge-001' } }))

      expect(res.status).toBe(401)
      expect(res.body.error).toBe('Assinatura inválida')
      expect(mockUpdateMany).not.toHaveBeenCalled()
    })

    it('retorna 401 com assinatura forjada (HMAC inválido)', async () => {
      const app = buildApp()
      const res = await request(app)
        .post('/api/v1/notificacoes/webhook-resend')
        .set('Content-Type', 'application/json')
        .set('svix-id', 'msg-forged-001')
        .set('svix-timestamp', String(Math.floor(Date.now() / 1000)))
        .set('svix-signature', 'v1,dGhpc2lzZmFrZXNpZ25hdHVyZWhlcmU=')
        .send(JSON.stringify({ type: 'email.delivered', data: { email_id: 'forge-002' } }))

      expect(res.status).toBe(401)
      expect(mockUpdateMany).not.toHaveBeenCalled()
    })

    it('retorna 401 com timestamp expirado — replay attack (10 min atrás)', async () => {
      const app = buildApp()
      const oldTimestamp = new Date(Date.now() - 10 * 60 * 1000)
      const { payload, headers } = signPayload(wh, 'email.delivered', 'replay-001', oldTimestamp)

      const res = await request(app)
        .post('/api/v1/notificacoes/webhook-resend')
        .set('Content-Type', 'application/json')
        .set(headers)
        .send(payload)

      expect(res.status).toBe(401)
      expect(mockUpdateMany).not.toHaveBeenCalled()
    })

    it('retorna 401 quando assinatura é gerada com secret diferente', async () => {
      const app = buildApp()
      const wrongSecret = 'whsec_' + Buffer.from('wrong-secret-completely-different!!').toString('base64')
      const wrongWh    = new Webhook(wrongSecret)
      // Assina com o secret ERRADO mas envia ao servidor que usa TEST_SECRET
      const { payload, headers } = signPayload(wrongWh, 'email.delivered', 'wrong-secret-001')

      const res = await request(app)
        .post('/api/v1/notificacoes/webhook-resend')
        .set('Content-Type', 'application/json')
        .set(headers)
        .send(payload)

      expect(res.status).toBe(401)
      expect(mockUpdateMany).not.toHaveBeenCalled()
    })
  })

  // ── BLOCO 2: Mapeamento de eventos → delivery_status ─────────────────────
  describe('Bloco 2 — mapeamento correto de eventos (caminho feliz)', () => {
    it('email.delivered → delivery_status = "delivered"', async () => {
      const app = buildApp()
      const { payload, headers } = signPayload(wh, 'email.delivered', 'ok-email-001')

      const res = await request(app)
        .post('/api/v1/notificacoes/webhook-resend')
        .set('Content-Type', 'application/json')
        .set(headers)
        .send(payload)

      expect(res.status).toBe(200)
      expect(res.body.received).toBe(true)
      expect(mockUpdateMany).toHaveBeenCalledWith({
        where: { external_id: 'ok-email-001' },
        data:  { delivery_status: 'delivered' },
      })
    })

    it('email.bounced → delivery_status = "bounced"', async () => {
      const app = buildApp()
      const { payload, headers } = signPayload(wh, 'email.bounced', 'ok-email-002')

      const res = await request(app)
        .post('/api/v1/notificacoes/webhook-resend')
        .set('Content-Type', 'application/json')
        .set(headers)
        .send(payload)

      expect(res.status).toBe(200)
      expect(mockUpdateMany).toHaveBeenCalledWith({
        where: { external_id: 'ok-email-002' },
        data:  { delivery_status: 'bounced' },
      })
    })

    it('email.complained (spam) → delivery_status = "bounced" (tratado como bounce)', async () => {
      const app = buildApp()
      const { payload, headers } = signPayload(wh, 'email.complained', 'ok-email-003')

      const res = await request(app)
        .post('/api/v1/notificacoes/webhook-resend')
        .set('Content-Type', 'application/json')
        .set(headers)
        .send(payload)

      expect(res.status).toBe(200)
      expect(mockUpdateMany).toHaveBeenCalledWith({
        where: { external_id: 'ok-email-003' },
        data:  { delivery_status: 'bounced' },
      })
    })

    it('email.failed → delivery_status = "failed"', async () => {
      const app = buildApp()
      const { payload, headers } = signPayload(wh, 'email.failed', 'ok-email-004')

      const res = await request(app)
        .post('/api/v1/notificacoes/webhook-resend')
        .set('Content-Type', 'application/json')
        .set(headers)
        .send(payload)

      expect(res.status).toBe(200)
      expect(mockUpdateMany).toHaveBeenCalledWith({
        where: { external_id: 'ok-email-004' },
        data:  { delivery_status: 'failed' },
      })
    })

    it('email.delivery_delayed → delivery_status = "sent" (ainda em trânsito)', async () => {
      const app = buildApp()
      const { payload, headers } = signPayload(wh, 'email.delivery_delayed', 'ok-email-005')

      const res = await request(app)
        .post('/api/v1/notificacoes/webhook-resend')
        .set('Content-Type', 'application/json')
        .set(headers)
        .send(payload)

      expect(res.status).toBe(200)
      expect(mockUpdateMany).toHaveBeenCalledWith({
        where: { external_id: 'ok-email-005' },
        data:  { delivery_status: 'sent' },
      })
    })

    it('email.sent → delivery_status = "sent"', async () => {
      const app = buildApp()
      const { payload, headers } = signPayload(wh, 'email.sent', 'ok-email-006')

      const res = await request(app)
        .post('/api/v1/notificacoes/webhook-resend')
        .set('Content-Type', 'application/json')
        .set(headers)
        .send(payload)

      expect(res.status).toBe(200)
      expect(mockUpdateMany).toHaveBeenCalledWith({
        where: { external_id: 'ok-email-006' },
        data:  { delivery_status: 'sent' },
      })
    })
  })

  // ── BLOCO 3: Resiliência — não quebrar em cenários adversos ──────────────
  describe('Bloco 3 — resiliência (sem crash em cenários adversos)', () => {
    it('external_id não encontrado (count=0) → 200 sem crash', async () => {
      mockUpdateMany.mockResolvedValueOnce({ count: 0 })
      const app = buildApp()
      const { payload, headers } = signPayload(wh, 'email.delivered', 'inexistente-001')

      const res = await request(app)
        .post('/api/v1/notificacoes/webhook-resend')
        .set('Content-Type', 'application/json')
        .set(headers)
        .send(payload)

      expect(res.status).toBe(200)
      expect(res.body.received).toBe(true)
    })

    it('evento futuro/desconhecido → 200, prisma NÃO é chamado', async () => {
      const app        = buildApp()
      const rawPayload = JSON.stringify({ type: 'email.future_event_v2', data: { email_id: 'fut-001' } })
      const msgId      = `msg-future-${Date.now()}`
      const ts         = new Date()
      const headers    = {
        'svix-id':        msgId,
        'svix-timestamp': String(Math.floor(ts.getTime() / 1000)),
        'svix-signature': wh.sign(msgId, ts, rawPayload),
      }

      const res = await request(app)
        .post('/api/v1/notificacoes/webhook-resend')
        .set('Content-Type', 'application/json')
        .set(headers)
        .send(rawPayload)

      expect(res.status).toBe(200)
      expect(mockUpdateMany).not.toHaveBeenCalled()
    })

    it('erro de banco no updateMany → 200 (evita retry loop infinito do Resend)', async () => {
      mockUpdateMany.mockRejectedValueOnce(new Error('Connection timeout'))
      const app = buildApp()
      const { payload, headers } = signPayload(wh, 'email.delivered', 'db-fail-001')

      const res = await request(app)
        .post('/api/v1/notificacoes/webhook-resend')
        .set('Content-Type', 'application/json')
        .set(headers)
        .send(payload)

      expect(res.status).toBe(200)
      expect(res.body.received).toBe(true)
    })

    it('RESEND_WEBHOOK_SECRET ausente → 500 (configuração inválida)', async () => {
      process.env.RESEND_WEBHOOK_SECRET = ''
      const app = buildApp()
      const { payload, headers } = signPayload(wh, 'email.delivered', 'no-secret-001')

      const res = await request(app)
        .post('/api/v1/notificacoes/webhook-resend')
        .set('Content-Type', 'application/json')
        .set(headers)
        .send(payload)

      expect(res.status).toBe(500)
    })

    it('payload sem email_id no data → 200 sem chamar prisma', async () => {
      const app        = buildApp()
      const rawPayload = JSON.stringify({ type: 'email.delivered', data: {} })
      const msgId      = `msg-no-id-${Date.now()}`
      const ts         = new Date()
      const headers    = {
        'svix-id':        msgId,
        'svix-timestamp': String(Math.floor(ts.getTime() / 1000)),
        'svix-signature': wh.sign(msgId, ts, rawPayload),
      }

      const res = await request(app)
        .post('/api/v1/notificacoes/webhook-resend')
        .set('Content-Type', 'application/json')
        .set(headers)
        .send(rawPayload)

      expect(res.status).toBe(200)
      expect(mockUpdateMany).not.toHaveBeenCalled()
    })
  })
})
