import { Router } from 'express'
import { ingestLog, listLogs, getLogById } from './controllers/history.controller.js'

export const historicoRouter = Router()

// POST with async ingestion
historicoRouter.post('/logs', ingestLog)

// GET with internal shielding reads from DB
historicoRouter.get('/logs', listLogs)
historicoRouter.get('/logs/:id', getLogById)

// Backward compat for older root paths if needed (optional)
historicoRouter.post('/', ingestLog)
historicoRouter.get('/', listLogs)
historicoRouter.get('/:id', getLogById)
