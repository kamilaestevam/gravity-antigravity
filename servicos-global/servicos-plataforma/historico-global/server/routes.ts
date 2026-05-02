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

// ── Super-servidor: router com prefixo absoluto ───────────────────────────────
const _serviceRouter = Router()
_serviceRouter.use('/api/v1/historico', historicoRouter)
export { _serviceRouter as historicoServiceRouter }
