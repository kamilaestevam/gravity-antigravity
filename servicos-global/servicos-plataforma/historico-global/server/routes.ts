import { Router } from 'express'
import {
  ingestLog, listLogs, getLogById,
  exportLogs, exportJobStatus, exportJobDownload,
} from './controllers/history.controller.js'
import {
  listAlerts, updateAlert,
  listRules, createRule, updateRule, deleteRule,
} from './controllers/alert.controller.js'
import { anonymizeActor } from './controllers/lgpd.controller.js'

export const historicoRouter = Router()

// ── LGPD ──────────────────────────────────────────────────────────
historicoRouter.post('/lgpd/anonymize', anonymizeActor)

// ── Logs ──────────────────────────────────────────────────────────
historicoRouter.post('/logs', ingestLog)
historicoRouter.get('/logs/export', exportLogs)
historicoRouter.get('/logs/export/:jobId/status', exportJobStatus)
historicoRouter.get('/logs/export/:jobId/download', exportJobDownload)
historicoRouter.get('/logs', listLogs)
historicoRouter.get('/logs/:id', getLogById)

// ── Alertas (eventos detectados) ─────────────────────────────────
historicoRouter.get('/alerts', listAlerts)
historicoRouter.patch('/alerts/:id', updateAlert)

// ── Regras de alerta (configuração) ──────────────────────────────
historicoRouter.get('/alert-rules', listRules)
historicoRouter.post('/alert-rules', createRule)
historicoRouter.put('/alert-rules/:id', updateRule)
historicoRouter.delete('/alert-rules/:id', deleteRule)

// ── Sub-router somente leitura ─────────────────────────────────────
// Para mounts não-admin (ex.: workspace page de Histórico). O controller
// já se autoescopa por id_organizacao via visibilityFilter; expomos apenas
// os endpoints de consulta para honrar o princípio de menor privilégio
// (ingestão/export/alertas continuam restritos ao mount admin).
export const historicoReadOnlyRouter = Router()
historicoReadOnlyRouter.get('/logs', listLogs)
historicoReadOnlyRouter.get('/logs/:id', getLogById)

// ── Super-servidor: router com prefixo absoluto ───────────────────────────────
const _serviceRouter = Router()
_serviceRouter.use('/api/v1/historico', historicoRouter)
export { _serviceRouter as historicoServiceRouter }
