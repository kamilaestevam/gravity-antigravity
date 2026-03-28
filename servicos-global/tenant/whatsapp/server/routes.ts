import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError } from './errorHandler'
import { handleWebhookInbound } from './services/webhook'
import { sseStreamHandlers } from './services/sse'

const router = Router()

// --- INBOUND WEBHOOK (Meta Cloud API) ---
// Endpoints públicos — Meta chama estes diretamente, sem autenticação interna.

// Verificação (GET) exigida pela Meta na configuração
router.get('/webhook', (req: Request, res: Response) => {
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('[WEBHOOK] Verified by Meta')
    res.status(200).send(challenge)
  } else {
    res.status(403).send('Forbidden')
  }
})

// Recebimento (POST)
router.post('/webhook', (req: Request, res: Response) => {
  // A Meta Cloud API envia os headers 'x-hub-signature-256'
  const signature = req.headers['x-hub-signature-256'] as string
  const rawBody = (req as any).rawBody || JSON.stringify(req.body) // depende de como o bodyparser foi injetado raw

  // Delegar ao service handleWebhookInbound
  // O Service já vai lidar com a resposta imediata 200 e setImmediate
  handleWebhookInbound(req.body, rawBody, signature, res)
})

// --- Auth middleware para rotas internas (send, stream) ---
// Requer x-tenant-id do gateway; rejeita se ausente.
const requireTenantAuth = (req: Request, res: Response, next: NextFunction) => {
  const tenantId = req.headers['x-tenant-id'] as string | undefined
  if (!tenantId) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'x-tenant-id obrigatório' } })
  }
  ;(req as any).tenant = tenantId
  ;(req as any).auth = { tenantId, userId: (req.headers['x-user-id'] as string) ?? '' }
  next()
}

// --- OUTBOUND ROUTES (Internal, autenticadas) ---

const sendSchema = z.object({
  phone_number: z.string(),
  text: z.string().min(1),
  product_id: z.string().optional(),
  user_id: z.string().optional()
})

router.post('/send', requireTenantAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = sendSchema.parse(req.body)
    const tenant = (req as any).tenant

    // TODO: chamar service sendTextMessage()
    // const message = await sendTextMessage(tenant, data.phone_number, data.text, data.user_id, data.product_id)

    res.json({ success: true /*, message */ })
  } catch (err) {
    next(err)
  }
})

// --- SSE STREAMING (Frontend, autenticada) ---
router.get('/stream', requireTenantAuth, (req: Request, res: Response) => {
  const tenant = (req as any).tenant
  sseStreamHandlers.addClient(tenant, req, res)
})

export const whatsappRoutes = router
