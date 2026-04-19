// TST-FUNC-NOTIF-001 — Testes funcionais do serviço notificacoes
//
// Cobre três fluxos integrados:
//   Suite 1 — POST /send: criação de notificações + enfileiramento pg-boss
//   Suite 2 — Worker dispatchEmail: envio HTTP ao serviço de email
//   Suite 3 — Webhook delivery flow: atualização de delivery_status via Resend
//
// Prisma e pg-boss são mockados (sem banco real). fetch é stubado na Suite 2.
// O Svix real é usado na Suite 3 para assinar os webhooks (HMAC verdadeiro).

/// <reference types="vitest/globals" />
import express, { type Request, type Response, type NextFunction } from 'express'
import request from 'supertest'
import { Webhook } from 'svix'

// ── Mocks centralizados (hoisted antes de qualquer import de módulo testado) ──
const { mockCreateMany, mockCreate, mockUpdateMany, mockBossSend } = vi.hoisted(() => ({
  mockCreateMany: vi.fn().mockResolvedValue({ count: 2 }),
  mockCreate:     vi.fn().mockResolvedValue({ id: 'notif-created-001', tenant_id: 'tenant-test' }),
  mockUpdateMany: vi.fn().mockResolvedValue({ count: 1 }),
  mockBossSend:   vi.fn().mockResolvedValue('job-id-test-001'),
}))

vi.mock(
  '../../../../servicos-global/tenant/notificacoes/server/lib/prisma.js',
  () => ({
    prisma: {
      notification: {
        createMany: mockCreateMany,
        create:     mockCreate,
        updateMany: mockUpdateMany,
      },
    },
  })
)

vi.mock(
  '../../../../servicos-global/tenant/notificacoes/server/queue/pg-boss.js',
  () => ({
    getBoss: () => ({ send: mockBossSend }),
  })
)

// Imports dos módulos testados (após os mocks)
import { apiRoutes }           from '../../../../servicos-global/tenant/notificacoes/server/routes/api.js'
import { webhookResendRoutes } from '../../../../servicos-global/tenant/notificacoes/server/routes/webhook-resend.js'
import { dispatchEmail }       from '../../../../servicos-global/tenant/notificacoes/server/queue/worker.js'
import { errorHandler }        from '../../../../servicos-global/tenant/notificacoes/server/middleware/error-handler.js'
import type { EmailJobPayload } from '../../../../servicos-global/tenant/notificacoes/server/queue/worker.js'

// ── Constantes compartilhadas ─────────────────────────────────────────────────
const TEST_SECRET = 'whsec_Z3Jhdml0eS10ZXN0LXNlY3JldC1mb3Itdml0ZXN0ISE='
const TENANT_ID   = 'tenant-gravity-test'
const USER_SENDER = 'user-sender-001'
const USER_A      = 'user-recip-001'
const USER_B      = 'user-recip-002'
const USER_C      = 'user-recip-003'

// ── Builders de app ───────────────────────────────────────────────────────────
// App completo com a ordem correta de middlewares (espelha index.ts)
function buildFullApp() {
  const app = express()
  app.use('/api/webhooks/resend', webhookResendRoutes) // express.raw() interno — antes do json()
  app.use(express.json())
  app.use('/api/v1/notificacoes', apiRoutes)
  app.use(errorHandler)
  return app
}

// Headers de autenticação S2S (bypass de JWT — x-internal-validated aceito por resolveAuthContext)
function internalHeaders(tenantId = TENANT_ID, userId = USER_SENDER) {
  return {
    'x-internal-validated': '1',
    'x-tenant-id':          tenantId,
    'x-user-id':            userId,
  }
}

// Helper: assina payload para o webhook (svix 1.90+ sign() retorna string)
function signWebhookPayload(
  wh: Webhook,
  type: string,
  emailId: string,
  ts: Date = new Date()
): { payload: string; headers: Record<string, string> } {
  const payload = JSON.stringify({ type, data: { email_id: emailId } })
  const msgId   = `msg-func-${Date.now()}-${Math.round(Math.random() * 1e6)}`
  return {
    payload,
    headers: {
      'svix-id':        msgId,
      'svix-timestamp': String(Math.floor(ts.getTime() / 1000)),
      'svix-signature': wh.sign(msgId, ts, payload),
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────

describe('notificacoes — Fase 2: testes funcionais', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.RESEND_WEBHOOK_SECRET = TEST_SECRET
  })

  // ══════════════════════════════════════════════════════════════════════════
  // Suite 1 — POST /send: criação de notificações + enfileiramento
  // ══════════════════════════════════════════════════════════════════════════
  describe('Suite 1 — POST /send: criação de notificações e enfileiramento de email', () => {
    it('nota pessoal (1 destinatário, sem email) → 201, createMany chamado, pg-boss NÃO chamado', async () => {
      mockCreateMany.mockResolvedValueOnce({ count: 1 })
      const app = buildFullApp()

      const res = await request(app)
        .post('/api/v1/notificacoes/send')
        .set('Content-Type', 'application/json')
        .set(internalHeaders())
        .send({
          user_ids:    [USER_A],
          message:     'Revisão do pedido PED-2024-089 concluída.',
          sender_name: 'Daniel',
        })

      expect(res.status).toBe(201)
      expect(res.body.status).toBe('queued')
      expect(res.body.count).toBe(1)
      expect(mockCreateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({ user_id: USER_A, tenant_id: TENANT_ID }),
          ]),
        })
      )
      // Registro "enviado" para o remetente também é criado
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ user_id: USER_SENDER, type: 'enviado' }),
        })
      )
      expect(mockBossSend).not.toHaveBeenCalled()
    })

    it('mensagem com email (via_email=true + recipient_emails) → 201, pg-boss.send chamado com args corretos', async () => {
      mockCreateMany.mockResolvedValueOnce({ count: 1 })
      const app = buildFullApp()

      const res = await request(app)
        .post('/api/v1/notificacoes/send')
        .set('Content-Type', 'application/json')
        .set(internalHeaders())
        .send({
          user_ids:         [USER_A],
          message:          'Custo atualizado no SimulaCusto.',
          sender_name:      'Daniel',
          via_email:        true,
          recipient_emails: ['alice@example.com'],
        })

      expect(res.status).toBe(201)
      expect(mockBossSend).toHaveBeenCalledOnce()
      expect(mockBossSend).toHaveBeenCalledWith(
        'send-notification',
        expect.objectContaining({
          tenantId:        TENANT_ID,
          userId:          USER_SENDER,
          senderName:      'Daniel',
          recipientEmails: ['alice@example.com'],
          message:         'Custo atualizado no SimulaCusto.',
        })
      )
    })

    it('multi-destinatários (3 usuários distintos do remetente) → 201, createMany com 3 entradas', async () => {
      mockCreateMany.mockResolvedValueOnce({ count: 3 })
      const app = buildFullApp()

      const res = await request(app)
        .post('/api/v1/notificacoes/send')
        .set('Content-Type', 'application/json')
        .set(internalHeaders())
        .send({
          user_ids:    [USER_A, USER_B, USER_C],
          message:     'Nova versão do relatório disponível.',
          sender_name: 'Daniel',
        })

      expect(res.status).toBe(201)
      expect(res.body.count).toBe(3)
      const calledData = mockCreateMany.mock.calls[0][0].data as Array<{ user_id: string }>
      expect(calledData).toHaveLength(3)
      expect(calledData.map((d) => d.user_id)).toEqual(
        expect.arrayContaining([USER_A, USER_B, USER_C])
      )
      // Remetente não deve estar na lista de destinatários in-app
      expect(calledData.map((d) => d.user_id)).not.toContain(USER_SENDER)
    })

    it('destinatário = si mesmo (único user_id = user_id do remetente) → 400 sem chamar prisma', async () => {
      const app = buildFullApp()

      const res = await request(app)
        .post('/api/v1/notificacoes/send')
        .set('Content-Type', 'application/json')
        .set(internalHeaders())
        .send({
          user_ids:    [USER_SENDER], // mesmo que x-user-id
          message:     'Mensagem para mim mesmo.',
          sender_name: 'Daniel',
        })

      expect(res.status).toBe(400)
      expect(res.body.message).toMatch(/destinatário válido/)
      expect(mockCreateMany).not.toHaveBeenCalled()
      expect(mockBossSend).not.toHaveBeenCalled()
    })

    it('body inválido (message ausente) → 400 com mensagem de validação', async () => {
      const app = buildFullApp()

      const res = await request(app)
        .post('/api/v1/notificacoes/send')
        .set('Content-Type', 'application/json')
        .set(internalHeaders())
        .send({ user_ids: [USER_A] }) // message ausente

      expect(res.status).toBe(400)
      expect(mockCreateMany).not.toHaveBeenCalled()
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // Suite 2 — Worker dispatchEmail: envio HTTP ao serviço de email
  // ══════════════════════════════════════════════════════════════════════════
  describe('Suite 2 — Worker dispatchEmail: chamadas HTTP ao email service', () => {
    const basePayload: EmailJobPayload = {
      tenantId:        TENANT_ID,
      userId:          USER_SENDER,
      senderName:      'Daniel',
      recipientEmails: ['alice@example.com', 'bob@example.com'],
      message:         'Alerta de estoque mínimo atingido.',
    }

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('sucesso (HTTP 200 do email service) → resolve sem jogar erro', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValueOnce(
          new Response(JSON.stringify({ id: 'resend-email-id-001' }), { status: 200 })
        )
      )

      await expect(dispatchEmail(basePayload)).resolves.toBeUndefined()

      const fetchMock = fetch as ReturnType<typeof vi.fn>
      expect(fetchMock).toHaveBeenCalledOnce()
      const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit]
      expect(url).toContain('/api/v1/email/enviar')
      expect((options.headers as Record<string, string>)['x-internal-key']).toBe('test-internal-key')
      expect((options.headers as Record<string, string>)['x-tenant-id']).toBe(TENANT_ID)
    })

    it('email service retorna HTTP 500 → lança Error (pg-boss fará retry)', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValueOnce(
          new Response(JSON.stringify({ error: { message: 'internal error' } }), { status: 500 })
        )
      )

      await expect(dispatchEmail(basePayload)).rejects.toThrow(/Email service HTTP 500/)
    })

    it('timeout (fetch abortado pelo AbortController) → lança erro propagado para pg-boss', async () => {
      const abortError = Object.assign(new Error('The operation was aborted'), { name: 'AbortError' })
      vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(abortError))

      await expect(dispatchEmail(basePayload)).rejects.toThrow('The operation was aborted')
    })

    it('corpo do email contém nome do remetente e mensagem', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValueOnce(
          new Response('{}', { status: 200 })
        )
      )

      await dispatchEmail({ ...basePayload, message: 'Revisão urgente no processo PROC-42.' })

      const fetchMock = fetch as ReturnType<typeof vi.fn>
      const [, options] = fetchMock.mock.calls[0] as [string, RequestInit]
      const body = JSON.parse(options.body as string) as { subject: string; body: string }
      expect(body.subject).toContain('Daniel')
      expect(body.body).toContain('Revisão urgente no processo PROC-42.')
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // Suite 3 — Webhook delivery flow: fluxo completo Resend → DB
  // ══════════════════════════════════════════════════════════════════════════
  describe('Suite 3 — Webhook delivery flow: atualização de delivery_status', () => {
    const wh = new Webhook(TEST_SECRET)

    it('email.delivered com external_id existente → updateMany chamado → 200', async () => {
      const externalId = 'resend-email-flow-001'
      const app = buildFullApp()
      const { payload, headers } = signWebhookPayload(wh, 'email.delivered', externalId)

      const res = await request(app)
        .post('/api/webhooks/resend')
        .set('Content-Type', 'application/json')
        .set(headers)
        .send(payload)

      expect(res.status).toBe(200)
      expect(res.body.received).toBe(true)
      expect(mockUpdateMany).toHaveBeenCalledWith({
        where: { external_id: externalId },
        data:  { delivery_status: 'delivered' },
      })
    })

    it('email.bounced → delivery_status = "bounced" persistido no banco', async () => {
      const externalId = 'resend-email-flow-002'
      const app = buildFullApp()
      const { payload, headers } = signWebhookPayload(wh, 'email.bounced', externalId)

      const res = await request(app)
        .post('/api/webhooks/resend')
        .set('Content-Type', 'application/json')
        .set(headers)
        .send(payload)

      expect(res.status).toBe(200)
      expect(mockUpdateMany).toHaveBeenCalledWith({
        where: { external_id: externalId },
        data:  { delivery_status: 'bounced' },
      })
    })

    it('external_id inexistente (count=0) → 200 sem crash (evita retry loop do Resend)', async () => {
      mockUpdateMany.mockResolvedValueOnce({ count: 0 })
      const app = buildFullApp()
      const { payload, headers } = signWebhookPayload(wh, 'email.delivered', 'id-que-nao-existe')

      const res = await request(app)
        .post('/api/webhooks/resend')
        .set('Content-Type', 'application/json')
        .set(headers)
        .send(payload)

      expect(res.status).toBe(200)
      expect(res.body.received).toBe(true)
      expect(mockUpdateMany).toHaveBeenCalledOnce()
    })

    it('payload sem assinatura (não vem do Resend) → 401, updateMany nunca chamado', async () => {
      const app = buildFullApp()

      const res = await request(app)
        .post('/api/webhooks/resend')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({ type: 'email.delivered', data: { email_id: 'forged' } }))

      expect(res.status).toBe(401)
      expect(mockUpdateMany).not.toHaveBeenCalled()
    })

    it('fluxo completo: /send cria notificação → webhook atualiza delivery_status', async () => {
      // Etapa 1 — simula criação via /send com external_id gerado pelo Resend
      mockCreateMany.mockResolvedValueOnce({ count: 1 })
      const externalId = 'resend-lifecycle-email-001'
      const app = buildFullApp()

      const sendRes = await request(app)
        .post('/api/v1/notificacoes/send')
        .set('Content-Type', 'application/json')
        .set(internalHeaders())
        .send({
          user_ids:         [USER_A],
          message:          'Notificação enviada por email.',
          sender_name:      'Daniel',
          via_email:        true,
          recipient_emails: ['alice@example.com'],
        })
      expect(sendRes.status).toBe(201)
      expect(mockBossSend).toHaveBeenCalledOnce()

      // Etapa 2 — Resend confirma entrega via webhook com o external_id do email
      const { payload, headers } = signWebhookPayload(wh, 'email.delivered', externalId)
      const webhookRes = await request(app)
        .post('/api/webhooks/resend')
        .set('Content-Type', 'application/json')
        .set(headers)
        .send(payload)

      expect(webhookRes.status).toBe(200)
      expect(mockUpdateMany).toHaveBeenCalledWith({
        where: { external_id: externalId },
        data:  { delivery_status: 'delivered' },
      })
    })
  })
})
