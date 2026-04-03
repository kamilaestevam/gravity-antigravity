import { Router } from 'express'
import { ingestLog, listLogs, getLogById, exportLogs } from './controllers/history.controller.js'
import {
  listAlerts, updateAlert,
  listRules, createRule, updateRule, deleteRule,
} from './controllers/alert.controller.js'

export const historicoRouter = Router()

// ── Logs ──────────────────────────────────────────────────────────
historicoRouter.post('/logs', ingestLog)
historicoRouter.get('/logs/export', exportLogs)
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
