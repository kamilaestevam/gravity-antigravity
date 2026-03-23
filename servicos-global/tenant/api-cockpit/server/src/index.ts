import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

import { tokensRouter } from './routes/tokens'
import { webhooksRouter } from './routes/webhooks'
import { erpRouter } from './routes/erp'
import { docsRouter } from './routes/docs'

const app = express()
const prisma = new PrismaClient()

app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'api-cockpit', version: '1.0.0' })
})

// Routes
app.use('/api/v1/cockpit/tokens', tokensRouter)
app.use('/api/v1/cockpit/webhooks', webhooksRouter)
app.use('/api/v1/erp', erpRouter)
app.use('/api/v1/cockpit/docs', docsRouter)

// Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err)
  if (err instanceof z.ZodError) {
    return res.status(400).json({ error: 'Validation Error', issues: err.issues })
  }
  return res.status(err.statusCode || 500).json({
    error: err.message || 'Internal Server Error'
  })
})

const PORT = 8016

app.listen(PORT, () => {
  console.log(`🚀 API Cockpit Service running on port ${PORT}`)
})
