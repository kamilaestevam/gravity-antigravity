// server/routes/adminNcmIntegracao.ts
// Rotas de NCM Integração — sincronização da tabela NCM Siscomex
// Montado em /api/admin/ncm-integracao pelo index.ts
//
// GET    /                    — status geral (ultima sync, totais, erros)
// GET    /historico           — logs de sincronização com paginação
// POST   /sync/:tenantId     — dispara sync manual para um tenant
// GET    /schedule            — configuração do agendamento
// PUT    /schedule            — atualizar agendamento (cron, notificadores)
// POST   /schedule/execute   — executar agendamento manualmente (todos os tenants)

import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireGravityAdmin } from '../middleware/requireGravityAdmin.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/appError.js'
import { AuditService } from '../../../tenant/historico-global/server/services/audit.service.js'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

export const adminNcmIntegracaoRouter = Router()

// Auth chain
adminNcmIntegracaoRouter.use(requireAuth, requireGravityAdmin)

// ─── Tipos ──────────────────────────────────────────────────────────────────

interface NcmSyncLog {
  id:            string
  tenant_id:     string
  iniciado_em:   string
  concluido_em:  string | null
  status:        'RUNNING' | 'SUCCESS' | 'ERROR'
  total:         number
  adicionados:   number
  alterados:     number
  removidos:     number
  origem:        'JOB' | 'MANUAL'
  disparado_por: string | null
  erro_msg:      string | null
  created_at:    string
}

interface NcmScheduleConfig {
  ativo:            boolean
  cron_expressao:   string
  notificadores:    Array<{
    id:       string
    nome:     string
    contato:  string
    condicao: 'Apenas Erros' | 'Sempre'
    canal:    'E-mail' | 'WhatsApp' | 'Ambos'
  }>
  proxima_execucao: string | null
  atualizado_em:    string | null
}

// ─── Persistência em arquivo (até ter model Prisma) ─────────────────────────

const DATA_DIR = join(process.cwd(), 'data', 'ncm-integracao')

function ensureDataDir(): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
}

function loadLogs(): NcmSyncLog[] {
  const file = join(DATA_DIR, 'sync-logs.json')
  if (!existsSync(file)) return []
  return JSON.parse(readFileSync(file, 'utf-8'))
}

function saveLogs(logs: NcmSyncLog[]): void {
  ensureDataDir()
  writeFileSync(join(DATA_DIR, 'sync-logs.json'), JSON.stringify(logs, null, 2))
}

function loadSchedule(): NcmScheduleConfig {
  const file = join(DATA_DIR, 'schedule.json')
  if (!existsSync(file)) {
    return {
      ativo: false,
      cron_expressao: '0 3 * * *',
      notificadores: [],
      proxima_execucao: null,
      atualizado_em: null,
    }
  }
  return JSON.parse(readFileSync(file, 'utf-8'))
}

function saveSchedule(config: NcmScheduleConfig): void {
  ensureDataDir()
  writeFileSync(join(DATA_DIR, 'schedule.json'), JSON.stringify(config, null, 2))
}

// ─── GET / — Status geral ────────────────────────────────────────────────────

adminNcmIntegracaoRouter.get('/', async (req, res, next) => {
  try {
    const logs = loadLogs()
    const last = logs.length > 0 ? logs[logs.length - 1] : null

    // Contar tenants
    let totalTenants = 0
    try {
      totalTenants = await prisma.tenant.count()
    } catch { /* tabela não existe */ }

    // Erros nas últimas 48h
    const cutoff48h = Date.now() - 48 * 60 * 60 * 1000
    const erros48h = logs.filter(
      l => l.status === 'ERROR' && new Date(l.created_at).getTime() > cutoff48h,
    ).length

    // Total NCMs ativos (estimativa baseada no último sync)
    const totalAtivos = last?.total ?? 0

    // Desatualizado = última sync há mais de 25h
    const desatualizado = !last || (Date.now() - new Date(last.created_at).getTime() > 25 * 60 * 60 * 1000)

    res.json({
      ultima_sync:   last?.concluido_em ?? last?.iniciado_em ?? null,
      status:        last?.status ?? null,
      total_ativos:  totalAtivos,
      total_tenants: totalTenants,
      erros_48h:     erros48h,
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
    const allLogs = loadLogs().sort((a, b) => b.created_at.localeCompare(a.created_at))
    const total = allLogs.length
    const paginas = Math.ceil(total / por_page)
    const skip = (pagina - 1) * por_page
    const logs = allLogs.slice(skip, skip + por_page)

    res.json({
      logs,
      paginacao: { pagina, por_page, total, paginas },
    })
  } catch (err) {
    next(err)
  }
})

// ─── POST /sync/:tenantId — Sync manual de um tenant ────────────────────────

adminNcmIntegracaoRouter.post('/sync/:tenantId', async (req, res, next) => {
  try {
    if (req.auth.role !== 'SUPER_ADMIN') {
      throw new AppError('Apenas Super Admin pode disparar sync', 403, 'FORBIDDEN')
    }

    const tenantId = req.params.tenantId
    const startMs = Date.now()
    const logEntry: NcmSyncLog = {
      id:            `ncm-${Date.now()}`,
      tenant_id:     tenantId,
      iniciado_em:   new Date().toISOString(),
      concluido_em:  null,
      status:        'RUNNING',
      total:         0,
      adicionados:   0,
      alterados:     0,
      removidos:     0,
      origem:        'MANUAL',
      disparado_por: req.auth.userId,
      erro_msg:      null,
      created_at:    new Date().toISOString(),
    }

    const logs = loadLogs()
    logs.push(logEntry)
    saveLogs(logs)

    // Tenta chamar o serviço NCM externo (bid-cambio ou serviço dedicado)
    const ncmServiceUrl = process.env.NCM_SERVICE_URL ?? 'http://localhost:8025'
    try {
      const response = await fetch(`${ncmServiceUrl}/api/v1/ncm/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-key': process.env.INTERNAL_SERVICE_KEY ?? '',
        },
        body: JSON.stringify({ tenant_id: tenantId }),
        signal: AbortSignal.timeout(120_000), // 2 min timeout
      })

      if (!response.ok) {
        throw new Error(`NCM service retornou ${response.status}`)
      }

      const result = await response.json() as {
        total?: number
        adicionados?: number
        alterados?: number
        removidos?: number
      }

      logEntry.status = 'SUCCESS'
      logEntry.concluido_em = new Date().toISOString()
      logEntry.total = result.total ?? 0
      logEntry.adicionados = result.adicionados ?? 0
      logEntry.alterados = result.alterados ?? 0
      logEntry.removidos = result.removidos ?? 0
    } catch (syncErr) {
      logEntry.status = 'ERROR'
      logEntry.concluido_em = new Date().toISOString()
      logEntry.erro_msg = syncErr instanceof Error ? syncErr.message : 'Erro desconhecido'
    }

    // Atualiza log persistido
    const updatedLogs = loadLogs().map(l => l.id === logEntry.id ? logEntry : l)
    saveLogs(updatedLogs)

    const duracaoMs = Date.now() - startMs

    AuditService.log({
      tenant_id: req.auth.tenantId,
      actor_type: 'USER',
      actor_id: req.auth.userId,
      actor_name: req.auth.userId,
      actor_ip: req.ip,
      module: 'admin',
      resource_type: 'NcmSync',
      resource_id: logEntry.id,
      action: 'NCM_SYNC_MANUAL',
      action_detail: `Sync ${logEntry.status} para tenant ${tenantId} — ${logEntry.total} NCMs (${duracaoMs}ms)`,
      after: { tenant_id: tenantId, total: logEntry.total, adicionados: logEntry.adicionados, alterados: logEntry.alterados, removidos: logEntry.removidos },
      status: logEntry.status === 'SUCCESS' ? 'SUCCESS' : 'PARTIAL',
    }).catch(() => { /* fire-and-forget */ })

    res.json({
      sucesso:     logEntry.status === 'SUCCESS',
      total:       logEntry.total,
      adicionados: logEntry.adicionados,
      alterados:   logEntry.alterados,
      removidos:   logEntry.removidos,
      duracaoMs,
    })
  } catch (err) {
    next(err)
  }
})

// ─── GET /schedule — Configuração do agendamento ─────────────────────────────

adminNcmIntegracaoRouter.get('/schedule', async (_req, res, next) => {
  try {
    const schedule = loadSchedule()
    res.json(schedule)
  } catch (err) {
    next(err)
  }
})

// ─── PUT /schedule — Atualizar agendamento ───────────────────────────────────

const NotificadorSchema = z.object({
  id:       z.string(),
  nome:     z.string().min(1).max(200),
  contato:  z.string().min(1).max(200),
  condicao: z.enum(['Apenas Erros', 'Sempre']),
  canal:    z.enum(['E-mail', 'WhatsApp', 'Ambos']),
})

const SaveScheduleSchema = z.object({
  ativo:          z.boolean(),
  cron_expressao: z.string().min(5).max(100),
  notificadores:  z.array(NotificadorSchema).max(20),
})

adminNcmIntegracaoRouter.put('/schedule', async (req, res, next) => {
  try {
    if (req.auth.role !== 'SUPER_ADMIN') {
      throw new AppError('Apenas Super Admin pode editar agendamento', 403, 'FORBIDDEN')
    }

    const parsed = SaveScheduleSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Dados inválidos', 400, 'VALIDATION_ERROR')
    }

    const schedule: NcmScheduleConfig = {
      ...parsed.data,
      proxima_execucao: parsed.data.ativo ? calcNextRun(parsed.data.cron_expressao) : null,
      atualizado_em:    new Date().toISOString(),
    }

    saveSchedule(schedule)

    AuditService.log({
      tenant_id: req.auth.tenantId,
      actor_type: 'USER',
      actor_id: req.auth.userId,
      actor_name: req.auth.userId,
      actor_ip: req.ip,
      module: 'admin',
      resource_type: 'NcmSchedule',
      action: 'NCM_SCHEDULE_UPDATED',
      action_detail: `Agendamento ${parsed.data.ativo ? 'ativado' : 'desativado'} — cron: ${parsed.data.cron_expressao}`,
      after: schedule,
      status: 'SUCCESS',
    }).catch(() => { /* fire-and-forget */ })

    res.json(schedule)
  } catch (err) {
    next(err)
  }
})

// ─── POST /schedule/execute — Executar agendamento manualmente ───────────────

const ExecuteSchema = z.object({
  tenant_id: z.string().optional(),
})

adminNcmIntegracaoRouter.post('/schedule/execute', async (req, res, next) => {
  try {
    if (req.auth.role !== 'SUPER_ADMIN') {
      throw new AppError('Apenas Super Admin pode executar sync', 403, 'FORBIDDEN')
    }

    const parsed = ExecuteSchema.safeParse(req.body ?? {})
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Dados inválidos', 400, 'VALIDATION_ERROR')
    }

    // Se tenant_id específico, faz sync só dele
    if (parsed.data.tenant_id) {
      // Delega para POST /sync/:tenantId (reutiliza lógica)
      const ncmServiceUrl = process.env.NCM_SERVICE_URL ?? 'http://localhost:8025'
      try {
        const response = await fetch(`${ncmServiceUrl}/api/v1/ncm/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-internal-key': process.env.INTERNAL_SERVICE_KEY ?? '',
          },
          body: JSON.stringify({ tenant_id: parsed.data.tenant_id }),
          signal: AbortSignal.timeout(120_000),
        })
        const result = await response.json() as Record<string, unknown>
        res.json({ sucesso: response.ok, tenants_executados: 1, resultados: [{ tenant_id: parsed.data.tenant_id, sucesso: response.ok, ...result }] })
      } catch (err) {
        res.json({ sucesso: false, tenants_executados: 0, resultados: [{ tenant_id: parsed.data.tenant_id, sucesso: false, erro: err instanceof Error ? err.message : 'Erro' }] })
      }
      return
    }

    // Sync para todos os tenants
    let tenants: Array<{ id: string }> = []
    try {
      tenants = await prisma.tenant.findMany({ select: { id: true }, where: { status: 'ACTIVE' } })
    } catch {
      throw new AppError('Não foi possível listar tenants', 500, 'INTERNAL')
    }

    const resultados: Array<Record<string, unknown>> = []
    const ncmServiceUrl = process.env.NCM_SERVICE_URL ?? 'http://localhost:8025'

    for (const tenant of tenants) {
      try {
        const response = await fetch(`${ncmServiceUrl}/api/v1/ncm/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-internal-key': process.env.INTERNAL_SERVICE_KEY ?? '',
          },
          body: JSON.stringify({ tenant_id: tenant.id }),
          signal: AbortSignal.timeout(120_000),
        })
        const result = await response.json() as Record<string, unknown>
        resultados.push({ tenant_id: tenant.id, sucesso: response.ok, ...result })
      } catch (err) {
        resultados.push({ tenant_id: tenant.id, sucesso: false, erro: err instanceof Error ? err.message : 'Erro' })
      }
    }

    const sucessos = resultados.filter(r => r.sucesso).length
    res.json({
      sucesso: sucessos === tenants.length,
      tenants_executados: tenants.length,
      resultados,
      ...(sucessos < tenants.length ? { aviso: `${tenants.length - sucessos} tenant(s) falharam` } : {}),
    })
  } catch (err) {
    next(err)
  }
})

// ─── Helper: calcular próxima execução do cron ───────────────────────────────

function calcNextRun(cron: string): string {
  // Simplificado — retorna próxima hora cheia baseada no cron
  const parts = cron.split(/\s+/)
  if (parts.length < 2) return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  const minute = parts[0] === '*' ? 0 : parseInt(parts[0], 10)
  const hour = parts[1] === '*' ? new Date().getHours() + 1 : parseInt(parts[1], 10)

  const next = new Date()
  next.setHours(hour, minute, 0, 0)
  if (next.getTime() <= Date.now()) {
    next.setDate(next.getDate() + 1)
  }
  return next.toISOString()
}
