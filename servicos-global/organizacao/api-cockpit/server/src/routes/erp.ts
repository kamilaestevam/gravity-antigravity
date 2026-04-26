import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { encryptAES, decryptAES } from '../crypto'
import { requireAuth, tenantIsolation } from '../../../middleware/src'

export const erpRouter = Router()
const prisma = new PrismaClient()

const saveCredentialsSchema = z.object({
  protocol: z.enum(['ODATA', 'SAP_HANA', 'REST', 'JDBC']),
  baseUrl: z.string().url(),
  username: z.string(),
  password: z.string()
})

const odataQuerySchema = z.object({
  query: z.string().min(1)
})

erpRouter.use(requireAuth)
erpRouter.use(tenantIsolation)

erpRouter.get('/connection', async (req, res, next) => {
  try {
    const tenantId = (req as any).tenantId
    const connection = await prisma.erpConnection.findUnique({
      where: { tenant_id: tenantId }
    })

    if (!connection) {
      return res.status(404).json({ error: 'No connection configured' })
    }

    res.json({
      id: connection.id,
      protocol: connection.protocol,
      configured: true,
      updated_at: connection.updated_at
    })
  } catch (error) {
    next(error)
  }
})

erpRouter.post('/connection', async (req, res, next) => {
  try {
    const tenantId = (req as any).tenantId
    const data = saveCredentialsSchema.parse(req.body)

    const key = process.env.ENCRYPTION_KEY
    if (!key) {
      throw new Error('Server misconfiguration: ENCRYPTION_KEY is missing')
    }

    const payloadStr = JSON.stringify({
      baseUrl: data.baseUrl,
      username: data.username,
      password: data.password
    })

    const encrypted = encryptAES(payloadStr, key)

    const updated = await prisma.erpConnection.upsert({
      where: { tenant_id: tenantId },
      update: {
        protocol: data.protocol,
        credentials_encrypted: encrypted
      },
      create: {
        tenant_id: tenantId,
        protocol: data.protocol,
        credentials_encrypted: encrypted
      }
    })

    res.status(200).json({
      id: updated.id,
      protocol: updated.protocol,
      success: true
    })
  } catch (error) {
    next(error)
  }
})

erpRouter.post('/connection/test', async (req, res, next) => {
  try {
    const tenantId = (req as any).tenantId
    const connection = await prisma.erpConnection.findUnique({
      where: { tenant_id: tenantId }
    })

    if (!connection) {
      return res.status(404).json({ error: 'No connection configured' })
    }

    const key = process.env.ENCRYPTION_KEY
    if (!key) throw new Error('ENCRYPTION_KEY is missing')

    const credsStr = decryptAES(connection.credentials_encrypted, key)
    const creds = JSON.parse(credsStr)

    // Fake a ping to check auth. Real-world would hit the actual system.
    let status = 0
    let message = ''
    try {
      const response = await fetch(`${creds.baseUrl}/health-or-ping`, {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${creds.username}:${creds.password}`).toString('base64')
        }
      })
      status = response.status
      message = 'Connected'
    } catch (e: any) {
      status = 500
      message = e.message
    }

    res.json({ success: true, fakePingStatus: status })
  } catch (error) {
    next(error)
  }
})

erpRouter.post('/query', async (req, res, next) => {
  try {
    const tenantId = (req as any).tenantId
    const { query } = odataQuerySchema.parse(req.body)
    
    const connection = await prisma.erpConnection.findUnique({
      where: { tenant_id: tenantId }
    })

    if (!connection) {
      return res.status(404).json({ error: 'No connection configured' })
    }

    const key = process.env.ENCRYPTION_KEY
    if (!key) throw new Error('ENCRYPTION_KEY is missing')

    const credsStr = decryptAES(connection.credentials_encrypted, key)
    const creds = JSON.parse(credsStr)

    // Execute exactly like Gabi dictates
    // GET /sap/opu/odata/sap/... ?$filter=...
    const separator = creds.baseUrl.endsWith('/') || query.startsWith('/') ? '' : '/'
    const targetUrl = `${creds.baseUrl}${separator}${query}`

    try {
      const resp = await fetch(targetUrl, {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${creds.username}:${creds.password}`).toString('base64'),
          'Accept': 'application/json'
        }
      })
      
      const responseData = await resp.json().catch(() => ({}))
      res.json({
        status: resp.status,
        data: responseData
      })
    } catch (e: any) {
      res.status(502).json({ error: 'Failed communicating with ERP', details: e.message })
    }
  } catch (error) {
    next(error)
  }
})
