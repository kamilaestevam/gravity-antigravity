// server/routes/adminNcmIntegracao.ts
// Rotas de NCM Integração — chama ncm-sync engine diretamente (sem HTTP)
// Montado em /api/v1/admin/integracao-ncm pelo index.ts
//
// GET    /                              — status geral
// GET    /historico                     — logs de sincronização com paginação
// POST   /sincronizar/:id_organizacao   — dispara sync manual para uma organização
// GET    /agendamento                   — configuração do agendamento
// PUT    /agendamento                   — atualizar agendamento (cron, notificadores)
// POST   /agendamento/executar          — executar para todas as organizações (ou uma específica)

import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireGravityAdmin } from '../middleware/requireGravityAdmin.js'
import { prisma as configuradorPrisma } from '../lib/prisma.js'
import { prisma as tenantPrisma } from '../../../organizacao/server/lib/prisma.js'
import { AppError } from '../lib/appError.js'
import { executarSync } from '../../../organizacao/ncm-sync/server/services/ncmSyncEngine.js'
import { reagendarJob } from '../../../organizacao/ncm-sync/server/init.js'
import { AuditService } from '../../../servicos-plataforma/historico-global/server/services/audit.service.js'

export const adminNcmIntegracaoRouter = Router()

adminNcmIntegracaoRouter.use(requireAuth, requireGravityAdmin)

// ─── GET / — Status geral ────────────────────────────────────────────────────

adminNcmIntegracaoRouter.get('/', async (_req, res, next) => {
  try {
    const limite48h = new Date(Date.now() - 48 * 60 * 60 * 1000)

    const [ultimaSyncCompleta, emAndamento, totalAtivos, tenantsComNcm, erros48h, totalTenants] = await Promise.all([
      tenantPrisma.ncmSyncLog.findFirst({
        where:   { status: { in: ['SUCCESS', 'ERROR'] } },
        orderBy: { iniciado_em: 'desc' },
      }),
      tenantPrisma.ncmSyncLog.findFirst({ where: { status: 'RUNNING' }, orderBy: { iniciado_em: 'desc' } }),
      tenantPrisma.ncmItem.count({ where: { ativo: true } }),
      tenantPrisma.ncmItem.findMany({ select: { tenant_id: true }, distinct: ['tenant_id'] }),
      tenantPrisma.ncmSyncLog.count({ where: { status: 'ERROR', iniciado_em: { gte: limite48h } } }),
      configuradorPrisma.organizacao.count().catch(() => 0),
    ])

    const statusAtual = emAndamento ? 'RUNNING' : (ultimaSyncCompleta?.status ?? null)
    const desatualizado = emAndamento ? false : (ultimaSyncCompleta?.concluido_em
      ? (Date.now() - ultimaSyncCompleta.concluido_em.getTime()) > 26 * 60 * 60 * 1000
      : true)

    res.json({
      ultima_sync:     ultimaSyncCompleta?.concluido_em ?? null,
      status:          statusAtual,
      total_ativos:    totalAtivos,
      total_tenants:   totalTenants,
      tenants_com_ncm: tenantsComNcm.length,
      erros_48h:       erros48h,
      desatualizado,
    })
  } catch (err) {
    next(err)
  }
})

// ─── GET /historico — Logs de sincronização ──────────────────────────────────

const HistoricoQuerySchema = z.object({
  pagina:   z.coerce.number().int().min(1).default(1),
  por_page: z.coerce.number().int().min(1).max(100).default(20),
})

adminNcmIntegracaoRouter.get('/historico', async (req, res, next) => {
  try {
    const parsed = HistoricoQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Query inválida', 400, 'VALIDATION_ERROR')
    }

    const { pagina, por_page } = parsed.data
    const skip = (pagina - 1) * por_page

    const [logs, total] = await Promise.all([
      tenantPrisma.ncmSyncLog.findMany({ orderBy: { iniciado_em: 'desc' }, skip, take: por_page }),
      tenantPrisma.ncmSyncLog.count(),
    ])

    res.json({
      logs,
      paginacao: { pagina, por_page, total, paginas: Math.ceil(total / por_page) },
    })
  } catch (err) {
    next(err)
  }
})

// ─── POST /sincronizar/:id_organizacao — Sync manual de uma organização ─────

adminNcmIntegracaoRouter.post('/sincronizar/:id_organizacao', async (req, res, next) => {
  try {
    if (req.auth.tipo_usuario !== 'SUPER_ADMIN') {
      throw new AppError('Apenas Super Admin pode disparar sync', 403, 'FORBIDDEN')
    }

    const { id_organizacao } = req.params
    const startMs = Date.now()

    const DOIS_HORAS_ATRAS = new Date(Date.now() - 2 * 60 * 60 * 1000)
    await tenantPrisma.ncmSyncLog.updateMany({
      where: { tenant_id: id_organizacao, status: 'RUNNING', iniciado_em: { lt: DOIS_HORAS_ATRAS } },
      data: { status: 'ERROR', concluido_em: new Date(), erro_msg: 'Tempo limite excedido (2h) — processo presumido morto.' },
    })

    const emAndamento = await tenantPrisma.ncmSyncLog.findFirst({
      where: { tenant_id: id_organizacao, status: 'RUNNING' },
    })
    if (emAndamento) {
      throw new AppError('Já existe uma sincronização em andamento para este tenant.', 409, 'SYNC_ALREADY_RUNNING')
    }

    const result = await executarSync(tenantPrisma, id_organizacao, {
      origem:       'MANUAL',
      disparadoPor: req.auth.id_usuario,
    })

    AuditService.log({
      tenant_id:     req.auth.id_organizacao,
      actor_type:    'USUARIO',
      actor_id:      req.auth.id_usuario,
      actor_name:    req.auth.id_usuario,
      actor_ip:      req.ip,
      module:        'admin',
      resource_type: 'NcmSync',
      action:        'NCM_SYNC_MANUAL',
      action_detail: `Sync OK para tenant ${id_organizacao} — ${result.total} NCMs (${Date.now() - startMs}ms)`,
      after:         { id_organizacao, ...result },
      status:        'SUCESSO',
    }).catch(() => { /* fire-and-forget */ })

    res.json({ sucesso: true, ...result, duracaoMs: Date.now() - startMs })
  } catch (err) {
    next(err)
  }
})

// ─── GET /agendamento — Configuração do agendamento ─────────────────────────

adminNcmIntegracaoRouter.get('/agendamento', async (_req, res, next) => {
  try {
    const config = await tenantPrisma.ncmScheduleConfig.findUnique({ where: { id: 'default' } })

    res.json({
      ativo:           config?.ativo          ?? false,
      cron_expressao:  config?.cron_expressao ?? '0 2 * * *',
      notificadores:   config?.notificadores  ?? [],
      proxima_execucao: config?.ativo ? config.cron_expressao : null,
      atualizado_em:   config?.atualizado_em  ?? null,
    })
  } catch (err) {
    next(err)
  }
})

// ─── PUT /agendamento — Atualizar agendamento ───────────────────────────────

const NotificadorSchema = z.object({
  id:       z.string(),
  nome:     z.string().min(1).max(200),
  contato:  z.string().min(1).max(200),
  condicao: z.enum(['Apenas Erros', 'Sempre']),
  canal:    z.enum(['E-mail', 'WhatsApp', 'Ambos']),
})

const SaveScheduleSchema = z.object({
  ativo:          z.boolean(),
  cron_expressao: z.string().min(9).max(100),
  notificadores:  z.array(NotificadorSchema).max(20),
})

adminNcmIntegracaoRouter.put('/agendamento', async (req, res, next) => {
  try {
    if (req.auth.tipo_usuario !== 'SUPER_ADMIN') {
      throw new AppError('Apenas Super Admin pode editar agendamento', 403, 'FORBIDDEN')
    }

    const parsed = SaveScheduleSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Dados inválidos', 400, 'VALIDATION_ERROR')
    }

    const { ativo, cron_expressao, notificadores } = parsed.data

    const config = await tenantPrisma.ncmScheduleConfig.upsert({
      where:  { id: 'default' },
      create: { id: 'default', ativo, cron_expressao, notificadores: notificadores as object[] },
      update: { ativo, cron_expressao, notificadores: notificadores as object[] },
    })

    reagendarJob(cron_expressao, ativo)

    AuditService.log({
      tenant_id:     req.auth.id_organizacao,
      actor_type:    'USUARIO',
      actor_id:      req.auth.id_usuario,
      actor_name:    req.auth.id_usuario,
      actor_ip:      req.ip,
      module:        'admin',
      resource_type: 'NcmSchedule',
      action:        'NCM_SCHEDULE_UPDATED',
      action_detail: `Agendamento ${ativo ? 'ativado' : 'desativado'} — cron: ${cron_expressao}`,
      after:         config,
      status:        'SUCESSO',
    }).catch(() => { /* fire-and-forget */ })

    res.json({
      sucesso:        true,
      ativo:          config.ativo,
      cron_expressao: config.cron_expressao,
      notificadores:  config.notificadores,
      atualizado_em:  config.atualizado_em,
    })
  } catch (err) {
    next(err)
  }
})

// ─── POST /agendamento/executar — Executar para todas as organizações ──────

const ExecuteSchema = z.object({
  tenant_id: z.string().optional(),
})

adminNcmIntegracaoRouter.post('/agendamento/executar', async (req, res, next) => {
  try {
    if (req.auth.tipo_usuario !== 'SUPER_ADMIN') {
      throw new AppError('Apenas Super Admin pode executar sync', 403, 'FORBIDDEN')
    }

    const parsed = ExecuteSchema.safeParse(req.body ?? {})
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Dados inválidos', 400, 'VALIDATION_ERROR')
    }

    const { tenant_id } = parsed.data

    if (tenant_id) {
      const emAndamento = await tenantPrisma.ncmSyncLog.findFirst({
        where: { tenant_id, status: 'RUNNING' },
      })
      if (emAndamento) {
        throw new AppError('Já existe uma sincronização em andamento para este tenant.', 409, 'SYNC_ALREADY_RUNNING')
      }
      const result = await executarSync(tenantPrisma, tenant_id, { origem: 'MANUAL', disparadoPor: 'gravity-admin' })
      return res.json({ sucesso: true, tenants_executados: 1, resultados: [{ tenant_id, sucesso: true, ...result }] })
    }

    // Todos os tenants ativos
    const tenants = await configuradorPrisma.organizacao.findMany({
      select: { id_organizacao: true },
      where:  { status_organizacao: 'ATIVO' },
    })

    if (tenants.length === 0) {
      return res.json({ sucesso: true, tenants_executados: 0, resultados: [], aviso: 'Nenhum tenant ativo.' })
    }

    const resultados: Array<Record<string, unknown>> = []
    for (const { id_organizacao: tid } of tenants) {
      try {
        const r = await executarSync(tenantPrisma, tid, { origem: 'MANUAL', disparadoPor: 'gravity-admin' })
        resultados.push({ tenant_id: tid, sucesso: true, ...r })
      } catch (err) {
        resultados.push({ tenant_id: tid, sucesso: false, erro: err instanceof Error ? err.message : String(err) })
      }
    }

    res.json({
      sucesso:            true,
      tenants_executados: resultados.length,
      resultados,
    })
  } catch (err) {
    next(err)
  }
})
