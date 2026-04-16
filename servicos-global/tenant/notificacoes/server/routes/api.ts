import { Router, type Request, type Response, type NextFunction } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { AppError } from '../lib/errors'

export const apiRoutes = Router()

// ─── SSE — registro de clientes com limite por tenant ───────────────────────
// Onda 3 item #11: antes era um Map<userId, Response> sem teto. Em produção,
// conexões zumbis (mobile/Wi-Fi ruim) que não chamam req.on('close') acumulam
// e viram memory leak. Limitamos conexões ativas por tenant.
const SSE_MAX_PER_TENANT = 100
const sseClients = new Map<string, Response>()
const sseClientsByTenant = new Map<string, Set<string>>()

function registerSseClient(tenantId: string, userId: string, res: Response): boolean {
  let tenantSet = sseClientsByTenant.get(tenantId)
  if (!tenantSet) {
    tenantSet = new Set()
    sseClientsByTenant.set(tenantId, tenantSet)
  }
  if (tenantSet.size >= SSE_MAX_PER_TENANT && !tenantSet.has(userId)) {
    return false
  }
  // Se já havia conexão para esse user, fecha a antiga
  const existing = sseClients.get(userId)
  if (existing) {
    try { existing.end() } catch { /* ignora */ }
  }
  sseClients.set(userId, res)
  tenantSet.add(userId)
  return true
}

function unregisterSseClient(tenantId: string, userId: string): void {
  sseClients.delete(userId)
  const tenantSet = sseClientsByTenant.get(tenantId)
  if (tenantSet) {
    tenantSet.delete(userId)
    if (tenantSet.size === 0) sseClientsByTenant.delete(tenantId)
  }
}

export function emitToUser(userId: string, event: string, data: Record<string, unknown>): void {
  const res = sseClients.get(userId)
  if (res) {
    try {
      res.write(`data: ${JSON.stringify({ type: event, ...data })}\n\n`)
    } catch {
      // Conexão morta — será limpa no req.on('close')
    }
  }
}

/**
 * Resolve o contexto de tenant/usuário a partir de:
 *   1. req.auth (populado pelo requireAuth do proxy do configurador, valida JWT Clerk)
 *   2. fallback: headers x-tenant-id / x-user-id apenas se NÃO houver req.auth
 *      (uso restrito a chamadas S2S internas com x-internal-key — nunca para tráfego de browser)
 *
 * Sem isso, qualquer cliente autenticado conseguia ler/escrever notificações de qualquer
 * tenant só mudando o header — vazamento cross-tenant identificado pelo Detetive de Tela
 * (Onda 1, item #2).
 */
function resolveAuthContext(req: Request): { tenant_id: string; user_id: string } | null {
  // Caminho preferencial: contexto validado pelo requireAuth (Clerk JWT cruzado com DB)
  if (req.auth?.tenantId && req.auth?.userId) {
    return { tenant_id: req.auth.tenantId, user_id: req.auth.userId }
  }

  // Caminho S2S: aceita headers SOMENTE se a chamada veio com x-internal-key validada
  // upstream. Se não houver, é cliente não autenticado — bloqueia.
  const internalKeyValidated = req.headers['x-internal-validated'] === '1'
  if (internalKeyValidated) {
    const tenantId = req.headers['x-tenant-id']
    const userId = req.headers['x-user-id']
    if (typeof tenantId === 'string' && typeof userId === 'string') {
      return { tenant_id: tenantId, user_id: userId }
    }
  }

  return null
}

const checkAuth = (req: Request, _res: Response, next: NextFunction) => {
  const ctx = resolveAuthContext(req)
  if (!ctx) {
    return next(new AppError('Contexto de autenticação ausente', 401))
  }
  req.tenant_id = ctx.tenant_id
  req.user_id = ctx.user_id
  next()
}

apiRoutes.use(checkAuth)

// ─── Schemas Zod ─────────────────────────────────────────────────────────────
const idParamSchema = z.object({ id: z.string().min(1) })
const listQuerySchema = z.object({
  cursor: z.string().optional(),
  take: z.coerce.number().int().min(1).max(100).optional(),
})
const createBodySchema = z.object({
  type: z.enum(['aviso', 'mencao', 'sistema', 'tarefa', 'compartilhamento', 'enviado']),
  title: z.string().min(1).max(120).optional(),
  message: z.string().min(1).max(2000),
  product_id: z.string().min(1).optional(),
  activity_id: z.string().min(1).optional(),
})

// ─── POST / — cria notificação para o próprio usuário no tenant atual ───────
// Onda 2 item #5: rota não existia antes; o frontend chamava POST e batia em
// 404 silencioso. O destinatário é sempre o próprio user_id resolvido pelo
// JWT — não aceita target_user_id no body para evitar que um usuário crie
// notificações para outro usuário sem passar por uma camada de permissão.
apiRoutes.post('/', async (req, res, next) => {
  try {
    const { tenant_id, user_id } = req
    const body = createBodySchema.parse(req.body)

    const created = await prisma.notification.create({
      data: {
        tenant_id,
        user_id,
        product_id: body.product_id ?? null,
        type: body.type,
        title: body.title ?? null,
        message: body.message,
        activity_id: body.activity_id ?? null,
      },
    })

    // Push em tempo real para o próprio usuário se houver SSE ativo
    emitToUser(user_id, 'new_notification', { id: created.id })

    res.status(201).json({ status: 'success', data: created })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(new AppError(`Body inválido: ${err.issues.map(i => i.message).join(', ')}`, 400))
    }
    next(err)
  }
})

// ─── GET / — lista notificações do usuário no tenant atual ───────────────────
apiRoutes.get('/', async (req, res, next) => {
  try {
    const { tenant_id, user_id } = req
    const { take = 50 } = listQuerySchema.parse(req.query)

    const [notifications, unread_count] = await Promise.all([
      prisma.notification.findMany({
        where: { tenant_id, user_id },
        orderBy: { created_at: 'desc' },
        take,
      }),
      prisma.notification.count({
        where: { tenant_id, user_id, read: false },
      }),
    ])

    res.json({ status: 'success', data: notifications, unread_count })
  } catch (err) {
    next(err)
  }
})

// ─── GET /stream — Server-Sent Events ────────────────────────────────────────
// SSE protegido pelo mesmo checkAuth: user_id vem do JWT validado, não da query.
// Onda 1 item #3: removido o fallback de credenciais via query string.
// Onda 3 item #11: limite por tenant + cleanup robusto + idle timeout.
const SSE_IDLE_TIMEOUT_MS = 10 * 60 * 1000 // 10 min sem heartbeat → fecha
apiRoutes.get('/stream', (req, res) => {
  const { tenant_id, user_id } = req

  if (!registerSseClient(tenant_id, user_id, res)) {
    res.status(429).json({ status: 'error', message: 'Limite de conexões SSE excedido para o tenant' })
    return
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  // Heartbeat — server manda ping a cada 30s
  const heartbeat = setInterval(() => {
    try {
      res.write(':\n\n')
    } catch {
      cleanup()
    }
  }, 30_000)

  // Idle timeout — fecha conexão se não houver atividade
  const idleTimeout = setTimeout(() => cleanup(), SSE_IDLE_TIMEOUT_MS)

  function cleanup() {
    clearInterval(heartbeat)
    clearTimeout(idleTimeout)
    unregisterSseClient(tenant_id, user_id)
    try { res.end() } catch { /* ignora */ }
  }

  req.on('close', cleanup)
  req.on('error', cleanup)
})

// ─── PUT /:id/read ───────────────────────────────────────────────────────────
apiRoutes.put('/:id/read', async (req, res, next) => {
  try {
    const { tenant_id, user_id } = req
    const { id } = idParamSchema.parse(req.params)
    const result = await prisma.notification.updateMany({
      where: { id, tenant_id, user_id },
      data: { read: true },
    })
    if (result.count === 0) {
      throw new AppError('Notificação não encontrada', 404)
    }
    res.json({ status: 'success' })
  } catch (err) {
    next(err)
  }
})

// ─── PUT /read-all ───────────────────────────────────────────────────────────
apiRoutes.put('/read-all', async (req, res, next) => {
  try {
    const { tenant_id, user_id } = req
    await prisma.notification.updateMany({
      where: { tenant_id, user_id, read: false },
      data: { read: true },
    })
    res.json({ status: 'success' })
  } catch (err) {
    next(err)
  }
})

// ─── POST /send — envia notificação a outro(s) usuário(s) do mesmo tenant ──
// Rota autenticada via JWT (browser). Diferente do POST / que só cria para o
// próprio usuário, esta aceita target_user_ids e cria para cada destinatário.
// O sender_name é enviado pelo frontend (vem do Clerk).
const sendBodySchema = z.object({
  user_ids: z.array(z.string().min(1)).min(1).max(20),
  message: z.string().min(1).max(2000),
  sender_name: z.string().min(1).max(120).optional(),
  recipient_names: z.array(z.string().max(120)).max(20).optional(),
  activity_id: z.string().min(1).max(2000).optional(),
  via_email: z.boolean().optional(),
  recipient_emails: z.array(z.string().email()).max(20).optional(),
})

// ─── URL interna do serviço de e-mail (mesma rede — S2S) ─────────────────────
const EMAIL_SERVICE_URL = process.env.TENANT_EMAIL_SERVICE_URL ?? 'http://localhost:8008'

/**
 * Envia notificação por e-mail via serviço de e-mail (S2S com x-internal-key).
 * Chamada fire-and-forget — não bloqueia a resposta da rota /send.
 */
async function dispararEmailNotificacao(opts: {
  tenantId: string
  userId: string
  senderName: string
  recipientEmails: string[]
  message: string
  link?: string
}): Promise<void> {
  const { tenantId, userId, senderName, recipientEmails, message, link } = opts
  const internalKey = process.env.INTERNAL_API_KEY ?? ''

  const linkHtml = link
    ? `<p style="margin-top:12px"><a href="${link}" style="color:#4f46e5;font-weight:600;">Ver contexto →</a></p>`
    : ''

  const html = `
<div style="font-family:'Plus Jakarta Sans',sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0f172a;color:#f1f5f9;border-radius:8px">
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:20px">
    <span style="font-size:20px">🔔</span>
    <span style="font-size:13px;font-weight:700;color:#818cf8;letter-spacing:.05em;text-transform:uppercase">Nova mensagem via Gravity</span>
  </div>
  <div style="background:#1e293b;border-left:3px solid #818cf8;padding:16px;border-radius:4px">
    <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em">De: ${senderName}</p>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#f1f5f9">${message.replace(/\n/g, '<br/>')}</p>
    ${linkHtml}
  </div>
  <hr style="border:none;border-top:1px solid #334155;margin:20px 0"/>
  <p style="font-size:11px;color:#475569;margin:0">Enviado pela plataforma Gravity · responda diretamente neste e-mail</p>
</div>`

  const text = `Nova mensagem de ${senderName}:\n\n${message}${link ? `\n\nVer contexto: ${link}` : ''}`

  try {
    const res = await fetch(`${EMAIL_SERVICE_URL}/api/v1/email/enviar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-key': internalKey,
        'x-tenant-id': tenantId,
        'x-user-id': userId,
      },
      body: JSON.stringify({
        to: recipientEmails,
        subject: `Mensagem de ${senderName} via Gravity`,
        body_html: html,
        body: text,
      }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      console.error('[NOTIFICACOES] Falha ao disparar e-mail S2S:', body)
    }
  } catch (err) {
    // Fire-and-forget — não falha a notificação in-app se o e-mail falhar
    console.error('[NOTIFICACOES] Erro ao chamar email service:', err)
  }
}

apiRoutes.post('/send', async (req, res, next) => {
  try {
    const { tenant_id, user_id } = req
    const body = sendBodySchema.parse(req.body)

    // Impede enviar para si mesmo (lista final sem o sender)
    const targets = body.user_ids.filter((uid) => uid !== user_id)
    if (targets.length === 0) {
      return next(new AppError('Nenhum destinatário válido (não é possível enviar para si mesmo)', 400))
    }

    const senderLabel = body.sender_name ?? 'Usuário'

    const created = await prisma.notification.createMany({
      data: targets.map((uid) => ({
        tenant_id,
        user_id: uid,
        product_id: null,
        type: 'compartilhamento' as const,
        title: senderLabel,
        message: body.message,
        activity_id: body.activity_id ?? null,
      })),
    })

    // Registro de "enviado" para o remetente — aparece no histórico dele
    const recipientLabel = body.recipient_names?.length
      ? body.recipient_names.join(', ')
      : `${targets.length} usuário(s)`
    await prisma.notification.create({
      data: {
        tenant_id,
        user_id,
        product_id: null,
        type: 'enviado' as const,
        title: `Enviado para ${recipientLabel}`,
        message: body.message,
        activity_id: body.activity_id ?? null,
        read: true, // já nasce lida — é registro, não alerta
      },
    })

    // Push SSE para cada destinatário online
    for (const uid of targets) {
      emitToUser(uid, 'new_notification', { type: 'compartilhamento' })
    }

    // Disparo de e-mail S2S — fire-and-forget (não bloqueia resposta)
    if (body.via_email && body.recipient_emails && body.recipient_emails.length > 0) {
      void dispararEmailNotificacao({
        tenantId: tenant_id,
        userId: user_id,
        senderName: senderLabel,
        recipientEmails: body.recipient_emails,
        message: body.message,
        link: body.activity_id,
      })
    }

    res.status(201).json({ status: 'success', count: created.count })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(new AppError(`Body inválido: ${err.issues.map((i) => i.message).join(', ')}`, 400))
    }
    next(err)
  }
})

// ─── DELETE /:id ─────────────────────────────────────────────────────────────
apiRoutes.delete('/:id', async (req, res, next) => {
  try {
    const { tenant_id, user_id } = req
    const { id } = idParamSchema.parse(req.params)

    const result = await prisma.notification.deleteMany({
      where: { id, tenant_id, user_id },
    })

    if (result.count === 0) {
      throw new AppError('Notificação não encontrada', 404)
    }

    res.json({ status: 'success' })
  } catch (err) {
    next(err)
  }
})
