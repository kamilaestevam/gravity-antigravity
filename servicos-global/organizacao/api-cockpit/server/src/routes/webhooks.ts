import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { generateWebhookSecret, generateHMACSignature } from '../crypto'
import { requireAuth, tenantIsolation } from '../../../middleware/src'

export const webhooksRouter = Router()
const prisma = new PrismaClient()

const createWebhookSchema = z.object({
  url: z.string().url(),
  events: z.array(z.string()).min(1),
  is_active: z.boolean().optional()
})

const updateWebhookSchema = z.object({
  url: z.string().url().optional(),
  events: z.array(z.string()).min(1).optional(),
  is_active: z.boolean().optional()
})

webhooksRouter.use(requireAuth)
webhooksRouter.use(tenantIsolation)

webhooksRouter.get('/', async (req, res, next) => {
  try {
    const tenantId = (req as any).tenantId
    const webhooks = await prisma.webhookConfig.findMany({
      where: { tenant_id: tenantId }
    })
    res.json(webhooks)
  } catch (error) {
    next(error)
  }
})

webhooksRouter.post('/', async (req, res, next) => {
  try {
    const tenantId = (req as any).tenantId
    const data = createWebhookSchema.parse(req.body)
    const secret = generateWebhookSecret()

    const webhook = await prisma.webhookConfig.create({
      data: {
        tenant_id: tenantId,
        url: data.url,
        events: data.events,
        secret,
        is_active: data.is_active ?? true
      }
    })

    res.status(201).json(webhook)
  } catch (error) {
    next(error)
  }
})

webhooksRouter.put('/:id_webhook', async (req, res, next) => {
  try {
    const tenantId = (req as any).tenantId
    const { id_webhook } = req.params
    const data = updateWebhookSchema.parse(req.body)

    const webhook = await prisma.webhookConfig.findFirst({
      where: { id: id_webhook, tenant_id: tenantId }
    })

    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' })
    }

    const updated = await prisma.webhookConfig.update({
      where: { id: id_webhook },
      data
    })

    res.json(updated)
  } catch (error) {
    next(error)
  }
})

webhooksRouter.post('/:id_webhook/testar', async (req, res, next) => {
  try {
    const tenantId = (req as any).tenantId
    const { id_webhook } = req.params

    const webhook = await prisma.webhookConfig.findFirst({
      where: { id: id_webhook, tenant_id: tenantId }
    })

    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' })
    }

    const payload = JSON.stringify({
      event: 'test.event',
      timestamp: new Date().toISOString(),
      data: { message: 'This is a test webhook from API Cockpit' }
    })

    const signature = generateHMACSignature(payload, webhook.secret)

    // Fire the test webhook
    const start = Date.now()
    let status = 0
    let errorMsg = null

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Gravity-Signature': signature
        },
        body: payload
      })
      status = response.status
    } catch (e: unknown) {
      status = 500
      errorMsg = e instanceof Error ? e.message : String(e)
    }

    const latency_ms = Date.now() - start

    // Log it
    await prisma.webhookLog.create({
      data: {
        tenant_id: tenantId,
        webhook_id: webhook.id,
        event: 'test.event',
        status,
        latency_ms,
        attempts: 1,
        payload: JSON.parse(payload),
        error: errorMsg
      }
    })

    res.json({
      success: status >= 200 && status < 300,
      status,
      latency_ms,
      error: errorMsg
    })
  } catch (error) {
    next(error)
  }
})

webhooksRouter.delete('/:id_webhook', async (req, res, next) => {
  try {
    const tenantId = (req as any).tenantId
    const { id_webhook } = req.params

    const webhook = await prisma.webhookConfig.findFirst({
      where: { id: id_webhook, tenant_id: tenantId }
    })

    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' })
    }

    await prisma.webhookConfig.delete({
      where: { id: id_webhook }
    })

    res.status(204).send()
  } catch (error) {
    next(error)
  }
})
