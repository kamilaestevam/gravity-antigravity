import { Router } from 'express'
import { ingestLog, listLogs, getLogById } from './controllers/history.controller.js'
// Assume withTenantIsolation is available globally or adjust path.
// The actual import is relative to the `middleware` folder in `tenant` directory.
import { withTenantIsolation } from '../../middleware/withTenantIsolation.js'

export const historicoRouter = Router()

// POST with async ingestion
historicoRouter.post('/logs', ingestLog)

// GET with withTenantIsolation middleware shielding reads from DB
historicoRouter.get('/logs', withTenantIsolation, listLogs)
historicoRouter.get('/logs/:id', withTenantIsolation, getLogById)

// Backward compat for older root paths if needed (optional)
historicoRouter.post('/', ingestLog)
historicoRouter.get('/', withTenantIsolation, listLogs)
historicoRouter.get('/:id', withTenantIsolation, getLogById)
