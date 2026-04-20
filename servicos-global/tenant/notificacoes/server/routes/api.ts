import { Router, type Request, type Response, type NextFunction } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { AppError } from '../lib/errors'
import { getBoss } from '../queue/pg-boss'

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
  target_entity: z.string().min(1).optional(),
  target_id: z.string().min(1).optional(),
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

    const created = await prisma.notificacoesTituloCorpo.create({
      data: {
        tenant_id,
        user_id,
        product_id: body.product_id ?? null,
        type: body.type,
        title: body.title ?? null,
        message: body.message,
        target_entity: body.target_entity ?? null,
        target_id: body.target_id ?? null,
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
      prisma.notificacoesTituloCorpo.findMany({
        where: { tenant_id, user_id },
        orderBy: { created_at: 'desc' },
        take,
      }),
      prisma.notificacoesTituloCorpo.count({
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
    const result = await prisma.notificacoesTituloCorpo.updateMany({
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
    await prisma.notificacoesTituloCorpo.updateMany({
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
  target_entity: z.string().max(50).optional(),   // "PEDIDO" | "ITEM" | etc.
  target_id: z.string().max(200).optional(),       // ID da entidade
  via_email: z.boolean().optional(),
  recipient_emails: z.array(z.string().email()).max(20).optional(),
})

apiRoutes.post('/send', async (req, res, next) => {
  try {
    const { tenant_id, user_id } = req
    const body = sendBodySchema.parse(req.body)

    // Remove o próprio remetente da lista de notificações in-app
    const targets = body.user_ids.filter((uid) => uid !== user_id)

    // Se não há destinatários in-app mas via_email está ativo, ainda envia o email
    const hasEmailOnly = targets.length === 0 && body.via_email && body.recipient_emails && body.recipient_emails.length > 0
    if (targets.length === 0 && !hasEmailOnly) {
      return next(new AppError('Nenhum destinatário válido (não é possível enviar para si mesmo)', 400))
    }

    const senderLabel = body.sender_name ?? 'Usuário'

    let created = { count: 0 }
    if (targets.length > 0) {
      created = await prisma.notificacoesTituloCorpo.createMany({
        data: targets.map((uid) => ({
          tenant_id,
          user_id: uid,
          product_id: null,
          type: 'compartilhamento' as const,
          title: senderLabel,
          message: body.message,
          target_entity: body.target_entity ?? null,
          target_id: body.target_id ?? null,
          delivery_status: 'pending',
        })),
      })
    }

    // Registro de "enviado" para o remetente
    const recipientLabel = body.recipient_names?.length
      ? body.recipient_names.join(', ')
      : targets.length > 0 ? `${targets.length} usuário(s)` : 'via e-mail'
    await prisma.notificacoesTituloCorpo.create({
      data: {
        tenant_id,
        user_id,
        product_id: null,
        type: 'enviado' as const,
        title: `Enviado para ${recipientLabel}`,
        message: body.message,
        target_entity: body.target_entity ?? null,
        target_id: body.target_id ?? null,
        delivery_status: 'sent',
        read: true,
      },
    })

    // Push SSE para cada destinatário online
    for (const uid of targets) {
      emitToUser(uid, 'new_notification', { type: 'compartilhamento' })
    }

    // Enfileirar job de email assíncrono via pg-boss
    if (body.via_email && body.recipient_emails && body.recipient_emails.length > 0) {
      try {
        const boss = getBoss()
        await boss.send('send-notification', {
          tenantId: tenant_id,
          userId: user_id,
          senderName: senderLabel,
          recipientEmails: body.recipient_emails,
          message: body.message,
          targetEntity: body.target_entity,
          targetId: body.target_id,
        })
      } catch (queueErr) {
        // Fila indisponível — não bloqueia resposta, mas loga
        console.error('[NOTIFICACOES] Falha ao enfileirar job de email:', queueErr)
      }
    }

    res.status(201).json({
      status: 'queued',
      count: created.count,
    })
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

    const result = await prisma.notificacoesTituloCorpo.deleteMany({
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

// ════════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO DE CANAIS
// GET  /config — lê config do tenant (autenticado)
// PATCH /config — atualiza (apenas MASTER)
// ════════════════════════════════════════════════════════════════════════════

apiRoutes.get('/config', async (req, res, next) => {
  try {
    const { tenant_id } = req
    const config = await prisma.configuracaoCanalTenant.findUnique({
      where: { tenant_id },
    })
    res.json({
      status: 'success',
      data: {
        email_enabled: config?.email_enabled ?? true,
        whatsapp_enabled: config?.whatsapp_enabled ?? false,
      },
    })
  } catch (err) {
    next(err)
  }
})

const channelConfigBodySchema = z.object({
  email_enabled: z.boolean().optional(),
  whatsapp_enabled: z.boolean().optional(),
})

apiRoutes.patch('/config', async (req, res, next) => {
  try {
    const { tenant_id, user_id } = req
    if ((req as Request & { auth?: { role?: string } }).auth?.role !== 'MASTER') {
      throw new AppError('Apenas usuários MASTER podem alterar a configuração de canais', 403)
    }
    const body = channelConfigBodySchema.parse(req.body)
    const updated = await prisma.configuracaoCanalTenant.upsert({
      where: { tenant_id },
      create: {
        tenant_id,
        email_enabled: body.email_enabled ?? true,
        whatsapp_enabled: body.whatsapp_enabled ?? false,
        updated_by: user_id,
      },
      update: {
        ...(body.email_enabled !== undefined && { email_enabled: body.email_enabled }),
        ...(body.whatsapp_enabled !== undefined && { whatsapp_enabled: body.whatsapp_enabled }),
        updated_by: user_id,
      },
    })
    res.json({ status: 'success', data: updated })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(new AppError(`Body inválido: ${err.issues.map(i => i.message).join(', ')}`, 400))
    }
    next(err)
  }
})

// ════════════════════════════════════════════════════════════════════════════
// CONTATOS EXTERNOS (agenda de email / WhatsApp)
// GET    /contacts           — lista contatos do tenant
// POST   /contacts           — cria contato
// PATCH  /contacts/:id       — atualiza contato
// DELETE /contacts/:id       — remove contato
// ════════════════════════════════════════════════════════════════════════════

const contactBodySchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(255).optional().or(z.literal('')),
  whatsapp_phone: z.string().regex(/^\+[1-9]\d{7,14}$/, 'Use formato E.164: +5511999999999').optional().or(z.literal('')),
  whatsapp_opt_in: z.boolean().optional(),
  notes: z.string().max(500).optional(),
})

apiRoutes.get('/contacts', async (req, res, next) => {
  try {
    const { tenant_id } = req
    const contacts = await prisma.contatoExterno.findMany({
      where: { tenant_id },
      orderBy: { name: 'asc' },
      select: {
        id: true, name: true, email: true,
        whatsapp_phone: true, whatsapp_opt_in_at: true,
        notes: true, created_at: true,
      },
    })
    res.json({ status: 'success', data: contacts })
  } catch (err) {
    next(err)
  }
})

apiRoutes.post('/contacts', async (req, res, next) => {
  try {
    const { tenant_id, user_id } = req
    const body = contactBodySchema.parse(req.body)
    const created = await prisma.contatoExterno.create({
      data: {
        tenant_id,
        created_by: user_id,
        name: body.name,
        email: body.email || null,
        whatsapp_phone: body.whatsapp_phone || null,
        whatsapp_opt_in_at: body.whatsapp_opt_in ? new Date() : null,
        notes: body.notes || null,
      },
    })
    res.status(201).json({ status: 'success', data: created })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(new AppError(`Body inválido: ${err.issues.map(i => i.message).join(', ')}`, 400))
    }
    next(err)
  }
})

apiRoutes.patch('/contacts/:id', async (req, res, next) => {
  try {
    const { tenant_id } = req
    const { id } = idParamSchema.parse(req.params)
    const body = contactBodySchema.partial().parse(req.body)
    const existing = await prisma.contatoExterno.findFirst({ where: { id, tenant_id } })
    if (!existing) throw new AppError('Contato não encontrado', 404)
    const updated = await prisma.contatoExterno.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.email !== undefined && { email: body.email || null }),
        ...(body.whatsapp_phone !== undefined && { whatsapp_phone: body.whatsapp_phone || null }),
        ...(body.whatsapp_opt_in === true && { whatsapp_opt_in_at: new Date() }),
        ...(body.whatsapp_opt_in === false && { whatsapp_opt_in_at: null }),
        ...(body.notes !== undefined && { notes: body.notes || null }),
      },
    })
    res.json({ status: 'success', data: updated })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(new AppError(`Body inválido: ${err.issues.map(i => i.message).join(', ')}`, 400))
    }
    next(err)
  }
})

apiRoutes.delete('/contacts/:id', async (req, res, next) => {
  try {
    const { tenant_id } = req
    const { id } = idParamSchema.parse(req.params)
    const result = await prisma.contatoExterno.deleteMany({ where: { id, tenant_id } })
    if (result.count === 0) throw new AppError('Contato não encontrado', 404)
    res.json({ status: 'success' })
  } catch (err) {
    next(err)
  }
})
