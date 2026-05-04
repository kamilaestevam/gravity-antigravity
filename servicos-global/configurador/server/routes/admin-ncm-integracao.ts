// server/routes/adminNcmIntegracao.ts
// Proxy admin para o serviço Cadastros (porta 8031) — endpoints de sincronização NCM.
//
// Decisão arquitetural (2026-05-03): NCM Sync mora no Cadastros porque NCM é
// catálogo global da Receita Federal. O Configurador apenas valida JWT + role
// gravity_admin e repassa a chamada via REST com x-internal-key, conforme
// skill `seguranca/autenticacao-s2s/SKILL.md` (Caminho A — sem cross-import
// de Prisma entre serviços).
//
// Montado em /api/v1/admin/integracao-ncm pelo index.ts
//
// GET    /             — status geral
// GET    /historico    — logs de sincronização com paginação
// POST   /sincronizar  — dispara sync manual
// GET    /agendamento  — configuração do agendamento
// PUT    /agendamento  — atualizar agendamento (cron, notificadores)
// POST   /agendamento/executar — executar manualmente

import { Router, type Request, type Response, type NextFunction } from 'express'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireGravityAdmin } from '../middleware/requireGravityAdmin.js'
import { AppError } from '../lib/appError.js'
import { AuditService } from '../../../servicos-plataforma/historico-global/server/services/audit.service.js'

export const adminNcmIntegracaoRouter = Router()

adminNcmIntegracaoRouter.use(requireAuth, requireGravityAdmin)

const CADASTROS_URL =
  process.env.CADASTROS_SERVICE_URL ?? 'http://localhost:8031'

const INTERNAL_SERVICE_KEY = process.env.INTERNAL_SERVICE_KEY ?? ''

const FETCH_TIMEOUT_MS = 30_000  // sync pode demorar (download + diff de 12k NCMs)

// ─── Helper: encaminhar request para o cadastros ─────────────────────────────

async function chamarCadastros(
  metodo: 'GET' | 'POST' | 'PUT',
  caminho: string,
  body?: unknown,
): Promise<{ status: number; data: unknown }> {
  let response: Response
  try {
    response = await fetch(`${CADASTROS_URL}${caminho}`, {
      method:  metodo,
      headers: {
        'Content-Type':   'application/json',
        'x-internal-key': INTERNAL_SERVICE_KEY,
      },
      body:    body !== undefined ? JSON.stringify(body) : undefined,
      signal:  AbortSignal.timeout(FETCH_TIMEOUT_MS),
    }) as unknown as Response
  } catch {
    throw new AppError('Serviço Cadastros indisponível (rede/timeout)', 503, 'CADASTROS_UNAVAILABLE')
  }

  const data = await response.json().catch(() => ({}))
  return { status: response.status, data }
}

function repassar(res: Response, resultado: { status: number; data: unknown }): void {
  res.status(resultado.status).json(resultado.data)
}

// ─── GET / — Status geral ────────────────────────────────────────────────────

adminNcmIntegracaoRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    repassar(res, await chamarCadastros('GET', '/api/v1/cadastros/admin/ncm-sync'))
  } catch (err) { next(err) }
})

// ─── GET /historico ──────────────────────────────────────────────────────────

adminNcmIntegracaoRouter.get('/historico', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const qs = new URLSearchParams(req.query as Record<string, string>).toString()
    const caminho = `/api/v1/cadastros/admin/ncm-sync/historico${qs ? `?${qs}` : ''}`
    repassar(res, await chamarCadastros('GET', caminho))
  } catch (err) { next(err) }
})

// ─── POST /sincronizar — Sync manual ─────────────────────────────────────────

adminNcmIntegracaoRouter.post('/sincronizar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.auth.tipo_usuario !== 'SUPER_ADMIN') {
      throw new AppError('Apenas Super Admin pode disparar sync', 403, 'FORBIDDEN')
    }

    const startMs = Date.now()
    const resultado = await chamarCadastros('POST', '/api/v1/cadastros/admin/ncm-sync/sincronizar', {
      id_usuario: req.auth.id_usuario,
    })

    if (resultado.status >= 200 && resultado.status < 300) {
      const data = resultado.data as Record<string, unknown>
      AuditService.log({
        id_organizacao:                 req.auth.id_organizacao,
        tipo_ator_historico_log:        'USUARIO',
        id_ator_historico_log:          req.auth.id_usuario,
        nome_ator_historico_log:        req.auth.id_usuario,
        ip_ator_historico_log:          req.ip,
        modulo_historico_log:           'admin',
        tipo_recurso_historico_log:     'NcmSync',
        acao_historico_log:             'NCM_SYNC_MANUAL',
        detalhe_acao_historico_log:     `Sync OK — ${data.total ?? 0} NCMs (${Date.now() - startMs}ms)`,
        estado_posterior_historico_log: data,
        status_historico_log:           'SUCESSO',
      }).catch(() => { /* fire-and-forget */ })
    }

    repassar(res, resultado)
  } catch (err) { next(err) }
})

// ─── GET /agendamento ────────────────────────────────────────────────────────

adminNcmIntegracaoRouter.get('/agendamento', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    repassar(res, await chamarCadastros('GET', '/api/v1/cadastros/admin/ncm-sync/agendamento'))
  } catch (err) { next(err) }
})

// ─── PUT /agendamento ────────────────────────────────────────────────────────

adminNcmIntegracaoRouter.put('/agendamento', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.auth.tipo_usuario !== 'SUPER_ADMIN') {
      throw new AppError('Apenas Super Admin pode editar agendamento', 403, 'FORBIDDEN')
    }

    const resultado = await chamarCadastros('PUT', '/api/v1/cadastros/admin/ncm-sync/agendamento', req.body)

    if (resultado.status >= 200 && resultado.status < 300) {
      const ativo = (req.body as Record<string, unknown>).ativo
      const cron  = (req.body as Record<string, unknown>).cron_expressao
      AuditService.log({
        id_organizacao:                 req.auth.id_organizacao,
        tipo_ator_historico_log:        'USUARIO',
        id_ator_historico_log:          req.auth.id_usuario,
        nome_ator_historico_log:        req.auth.id_usuario,
        ip_ator_historico_log:          req.ip,
        modulo_historico_log:           'admin',
        tipo_recurso_historico_log:     'NcmSyncAgendamento',
        acao_historico_log:             'NCM_SYNC_SCHEDULE_UPDATED',
        detalhe_acao_historico_log:     `Agendamento ${ativo ? 'ativado' : 'desativado'} — cron: ${cron}`,
        estado_posterior_historico_log: resultado.data as Record<string, unknown>,
        status_historico_log:           'SUCESSO',
      }).catch(() => { /* fire-and-forget */ })
    }

    repassar(res, resultado)
  } catch (err) { next(err) }
})

// ─── POST /agendamento/executar ──────────────────────────────────────────────

adminNcmIntegracaoRouter.post('/agendamento/executar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.auth.tipo_usuario !== 'SUPER_ADMIN') {
      throw new AppError('Apenas Super Admin pode executar sync', 403, 'FORBIDDEN')
    }

    const resultado = await chamarCadastros('POST', '/api/v1/cadastros/admin/ncm-sync/agendamento/executar', {
      id_usuario: req.auth.id_usuario,
    })
    repassar(res, resultado)
  } catch (err) { next(err) }
})
