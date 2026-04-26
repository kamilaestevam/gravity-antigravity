/**
 * notificacoes/server/routes/api.ts
 *
 * Onda 37 — DDD Servicos: campos físicos com sufixo _notificacoes_titulo_corpo /
 * _contato_externo / _configuracao_canal_tenant. DTO/ACL preserva o contrato
 * público consumido pelo sininho do shell e por integrações externas.
 */

import { Router, type Request, type Response, type NextFunction } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { AppError } from '../lib/errors'
import { getBoss } from '../queue/pg-boss'

export const apiRoutes = Router()

// ─── ACL/DTO — preservam contratos públicos ───────────────────────────────────

interface NotificacaoRow {
  id_notificacoes_titulo_corpo:               string
  id_organizacao_notificacoes_titulo_corpo:   string
  id_produto_notificacoes_titulo_corpo:       string | null
  id_usuario_notificacoes_titulo_corpo:       string
  tipo_notificacoes_titulo_corpo:             string
  titulo_notificacoes_titulo_corpo:           string | null
  mensagem_notificacoes_titulo_corpo:         string
  lida_notificacoes_titulo_corpo:             boolean
  entidade_alvo_notificacoes_titulo_corpo:    string | null
  id_alvo_notificacoes_titulo_corpo:          string | null
  status_entrega_notificacoes_titulo_corpo:   string
  id_externo_notificacoes_titulo_corpo:       string | null
  data_criacao_notificacoes_titulo_corpo:     Date
  data_atualizacao_notificacoes_titulo_corpo: Date
}

function toNotificacaoDto(n: NotificacaoRow) {
  return {
    id:              n.id_notificacoes_titulo_corpo,
    tenant_id:       n.id_organizacao_notificacoes_titulo_corpo,
    product_id:      n.id_produto_notificacoes_titulo_corpo,
    user_id:         n.id_usuario_notificacoes_titulo_corpo,
    type:            n.tipo_notificacoes_titulo_corpo,
    title:           n.titulo_notificacoes_titulo_corpo,
    message:         n.mensagem_notificacoes_titulo_corpo,
    read:            n.lida_notificacoes_titulo_corpo,
    target_entity:   n.entidade_alvo_notificacoes_titulo_corpo,
    target_id:       n.id_alvo_notificacoes_titulo_corpo,
    delivery_status: n.status_entrega_notificacoes_titulo_corpo,
    external_id:     n.id_externo_notificacoes_titulo_corpo,
    created_at:      n.data_criacao_notificacoes_titulo_corpo,
    updated_at:      n.data_atualizacao_notificacoes_titulo_corpo,
  }
}

interface ContatoRow {
  id_contato_externo:                 string
  nome_contato_externo:               string
  email_contato_externo:              string | null
  whatsapp_telefone_contato_externo:  string | null
  whatsapp_opt_in_em_contato_externo: Date | null
  observacoes_contato_externo:        string | null
  data_criacao_contato_externo:       Date
}

function toContatoDto(c: ContatoRow) {
  return {
    id:                 c.id_contato_externo,
    name:               c.nome_contato_externo,
    email:              c.email_contato_externo,
    whatsapp_phone:     c.whatsapp_telefone_contato_externo,
    whatsapp_opt_in_at: c.whatsapp_opt_in_em_contato_externo,
    notes:              c.observacoes_contato_externo,
    created_at:         c.data_criacao_contato_externo,
  }
}

// ─── SSE — registro de clientes com limite por tenant ───────────────────────
// Onda 3 item #11: limite por tenant + cleanup robusto + idle timeout.
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
 */
function resolveAuthContext(req: Request): { tenant_id: string; user_id: string } | null {
  if (req.auth?.tenantId && req.auth?.userId) {
    return { tenant_id: req.auth.tenantId, user_id: req.auth.userId }
  }

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
apiRoutes.post('/', async (req, res, next) => {
  try {
    const { tenant_id, user_id } = req
    const body = createBodySchema.parse(req.body)

    const created = await prisma.notificacoesTituloCorpo.create({
      data: {
        id_organizacao_notificacoes_titulo_corpo: tenant_id,
        id_usuario_notificacoes_titulo_corpo:     user_id,
        id_produto_notificacoes_titulo_corpo:     body.product_id ?? null,
        tipo_notificacoes_titulo_corpo:           body.type,
        titulo_notificacoes_titulo_corpo:         body.title ?? null,
        mensagem_notificacoes_titulo_corpo:       body.message,
        entidade_alvo_notificacoes_titulo_corpo:  body.target_entity ?? null,
        id_alvo_notificacoes_titulo_corpo:        body.target_id ?? null,
      },
    })

    emitToUser(user_id, 'new_notification', { id: created.id_notificacoes_titulo_corpo })

    res.status(201).json({ status: 'success', data: toNotificacaoDto(created) })
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
        where: {
          id_organizacao_notificacoes_titulo_corpo: tenant_id,
          id_usuario_notificacoes_titulo_corpo:     user_id,
        },
        orderBy: { data_criacao_notificacoes_titulo_corpo: 'desc' },
        take,
      }),
      prisma.notificacoesTituloCorpo.count({
        where: {
          id_organizacao_notificacoes_titulo_corpo: tenant_id,
          id_usuario_notificacoes_titulo_corpo:     user_id,
          lida_notificacoes_titulo_corpo:           false,
        },
      }),
    ])

    res.json({ status: 'success', data: notifications.map(toNotificacaoDto), unread_count })
  } catch (err) {
    next(err)
  }
})

// ─── GET /stream — Server-Sent Events ────────────────────────────────────────
const SSE_IDLE_TIMEOUT_MS = 10 * 60 * 1000
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

  const heartbeat = setInterval(() => {
    try {
      res.write(':\n\n')
    } catch {
      cleanup()
    }
  }, 30_000)

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
      where: {
        id_notificacoes_titulo_corpo:             id,
        id_organizacao_notificacoes_titulo_corpo: tenant_id,
        id_usuario_notificacoes_titulo_corpo:     user_id,
      },
      data: { lida_notificacoes_titulo_corpo: true },
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
      where: {
        id_organizacao_notificacoes_titulo_corpo: tenant_id,
        id_usuario_notificacoes_titulo_corpo:     user_id,
        lida_notificacoes_titulo_corpo:           false,
      },
      data: { lida_notificacoes_titulo_corpo: true },
    })
    res.json({ status: 'success' })
  } catch (err) {
    next(err)
  }
})

// ─── POST /send ─────────────────────────────────────────────────────────────
const sendBodySchema = z.object({
  user_ids: z.array(z.string().min(1)).min(1).max(20),
  message: z.string().min(1).max(2000),
  sender_name: z.string().min(1).max(120).optional(),
  recipient_names: z.array(z.string().max(120)).max(20).optional(),
  target_entity: z.string().max(50).optional(),
  target_id: z.string().max(200).optional(),
  via_email: z.boolean().optional(),
  recipient_emails: z.array(z.string().email()).max(20).optional(),
})

apiRoutes.post('/send', async (req, res, next) => {
  try {
    const { tenant_id, user_id } = req
    const body = sendBodySchema.parse(req.body)

    const targets = body.user_ids.filter((uid) => uid !== user_id)

    const hasEmailOnly = targets.length === 0 && body.via_email && body.recipient_emails && body.recipient_emails.length > 0
    if (targets.length === 0 && !hasEmailOnly) {
      return next(new AppError('Nenhum destinatário válido (não é possível enviar para si mesmo)', 400))
    }

    const senderLabel = body.sender_name ?? 'Usuário'

    let created = { count: 0 }
    if (targets.length > 0) {
      created = await prisma.notificacoesTituloCorpo.createMany({
        data: targets.map((uid) => ({
          id_organizacao_notificacoes_titulo_corpo: tenant_id,
          id_usuario_notificacoes_titulo_corpo:     uid,
          id_produto_notificacoes_titulo_corpo:     null,
          tipo_notificacoes_titulo_corpo:           'compartilhamento',
          titulo_notificacoes_titulo_corpo:         senderLabel,
          mensagem_notificacoes_titulo_corpo:       body.message,
          entidade_alvo_notificacoes_titulo_corpo:  body.target_entity ?? null,
          id_alvo_notificacoes_titulo_corpo:        body.target_id ?? null,
          status_entrega_notificacoes_titulo_corpo: 'pending',
        })),
      })
    }

    const recipientLabel = body.recipient_names?.length
      ? body.recipient_names.join(', ')
      : targets.length > 0 ? `${targets.length} usuário(s)` : 'via e-mail'
    await prisma.notificacoesTituloCorpo.create({
      data: {
        id_organizacao_notificacoes_titulo_corpo: tenant_id,
        id_usuario_notificacoes_titulo_corpo:     user_id,
        id_produto_notificacoes_titulo_corpo:     null,
        tipo_notificacoes_titulo_corpo:           'enviado',
        titulo_notificacoes_titulo_corpo:         `Enviado para ${recipientLabel}`,
        mensagem_notificacoes_titulo_corpo:       body.message,
        entidade_alvo_notificacoes_titulo_corpo:  body.target_entity ?? null,
        id_alvo_notificacoes_titulo_corpo:        body.target_id ?? null,
        status_entrega_notificacoes_titulo_corpo: 'sent',
        lida_notificacoes_titulo_corpo:           true,
      },
    })

    for (const uid of targets) {
      emitToUser(uid, 'new_notification', { type: 'compartilhamento' })
    }

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
      where: {
        id_notificacoes_titulo_corpo:             id,
        id_organizacao_notificacoes_titulo_corpo: tenant_id,
        id_usuario_notificacoes_titulo_corpo:     user_id,
      },
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
// ════════════════════════════════════════════════════════════════════════════

apiRoutes.get('/config', async (req, res, next) => {
  try {
    const { tenant_id } = req
    const config = await prisma.configuracaoCanalTenant.findUnique({
      where: { id_organizacao_configuracao_canal_tenant: tenant_id },
    })
    res.json({
      status: 'success',
      data: {
        email_enabled:    config?.email_habilitado_configuracao_canal_tenant    ?? true,
        whatsapp_enabled: config?.whatsapp_habilitado_configuracao_canal_tenant ?? false,
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
      where: { id_organizacao_configuracao_canal_tenant: tenant_id },
      create: {
        id_organizacao_configuracao_canal_tenant:      tenant_id,
        email_habilitado_configuracao_canal_tenant:    body.email_enabled    ?? true,
        whatsapp_habilitado_configuracao_canal_tenant: body.whatsapp_enabled ?? false,
        id_usuario_configuracao_canal_tenant:          user_id,
      },
      update: {
        ...(body.email_enabled    !== undefined && { email_habilitado_configuracao_canal_tenant:    body.email_enabled }),
        ...(body.whatsapp_enabled !== undefined && { whatsapp_habilitado_configuracao_canal_tenant: body.whatsapp_enabled }),
        id_usuario_configuracao_canal_tenant: user_id,
      },
    })
    res.json({
      status: 'success',
      data: {
        id:               updated.id_configuracao_canal_tenant,
        tenant_id:        updated.id_organizacao_configuracao_canal_tenant,
        email_enabled:    updated.email_habilitado_configuracao_canal_tenant,
        whatsapp_enabled: updated.whatsapp_habilitado_configuracao_canal_tenant,
        updated_by:       updated.id_usuario_configuracao_canal_tenant,
        created_at:       updated.data_criacao_configuracao_canal_tenant,
        updated_at:       updated.data_atualizacao_configuracao_canal_tenant,
      },
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(new AppError(`Body inválido: ${err.issues.map(i => i.message).join(', ')}`, 400))
    }
    next(err)
  }
})

// ════════════════════════════════════════════════════════════════════════════
// CONTATOS EXTERNOS
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
      where: { id_organizacao_contato_externo: tenant_id },
      orderBy: { nome_contato_externo: 'asc' },
      select: {
        id_contato_externo:                 true,
        nome_contato_externo:               true,
        email_contato_externo:              true,
        whatsapp_telefone_contato_externo:  true,
        whatsapp_opt_in_em_contato_externo: true,
        observacoes_contato_externo:        true,
        data_criacao_contato_externo:       true,
      },
    })
    res.json({ status: 'success', data: contacts.map(toContatoDto) })
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
        id_organizacao_contato_externo:     tenant_id,
        id_usuario_contato_externo:         user_id,
        nome_contato_externo:               body.name,
        email_contato_externo:              body.email          || null,
        whatsapp_telefone_contato_externo:  body.whatsapp_phone || null,
        whatsapp_opt_in_em_contato_externo: body.whatsapp_opt_in ? new Date() : null,
        observacoes_contato_externo:        body.notes          || null,
      },
    })
    res.status(201).json({ status: 'success', data: toContatoDto(created) })
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
    const existing = await prisma.contatoExterno.findFirst({
      where: { id_contato_externo: id, id_organizacao_contato_externo: tenant_id },
    })
    if (!existing) throw new AppError('Contato não encontrado', 404)
    const updated = await prisma.contatoExterno.update({
      where: { id_contato_externo: id },
      data: {
        ...(body.name           !== undefined && { nome_contato_externo:              body.name }),
        ...(body.email          !== undefined && { email_contato_externo:             body.email          || null }),
        ...(body.whatsapp_phone !== undefined && { whatsapp_telefone_contato_externo: body.whatsapp_phone || null }),
        ...(body.whatsapp_opt_in === true     && { whatsapp_opt_in_em_contato_externo: new Date() }),
        ...(body.whatsapp_opt_in === false    && { whatsapp_opt_in_em_contato_externo: null }),
        ...(body.notes          !== undefined && { observacoes_contato_externo:       body.notes          || null }),
      },
    })
    res.json({ status: 'success', data: toContatoDto(updated) })
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
    const result = await prisma.contatoExterno.deleteMany({
      where: { id_contato_externo: id, id_organizacao_contato_externo: tenant_id },
    })
    if (result.count === 0) throw new AppError('Contato não encontrado', 404)
    res.json({ status: 'success' })
  } catch (err) {
    next(err)
  }
})
