import { Router } from 'express'
import { z } from 'zod'
import { AppError } from './errorHandler'
import { handleWebhookInbound } from './services/webhook'
import { sseStreamHandlers } from './services/sse'
// import { requireInternalKey } from '@tenant/middleware/internal-auth'

const router = Router()

// --- OUTBOUND ROUTES (Internal) ---
// Estas rotas geralmente seriam protegidas pelo middleware `requireInternalKey` no index.ts
// Mas como já protegemos antes de montar ou aqui? 
// No index.ts: app.use('/api/v1/whatsapp', whatsappRoutes)
// Assumiremos q a proteção da rota de envio será feita com isolation.

const sendSchema = z.object({
  tenant_id: z.string(),
  phone_number: z.string(),
  text: z.string().min(1),
  product_id: z.string().optional(),
  user_id: z.string().optional()
})

router.post('/send', async (req, res, next) => {
  try {
    const data = sendSchema.parse(req.body)
    
    // Na arquitetura Gravity real, tenant_id vem do req.tenant após o middleware withTenantIsolation
    // Validando isolamento: se req.tenant !== data.tenant_id, throw
    const tenant = (req as any).tenant || data.tenant_id
    if (tenant !== data.tenant_id) {
       throw new AppError('Tenant mismatch', 403, 'FORBIDDEN')
    }

    // TODO: chamar service sendTextMessage()
    // const message = await sendTextMessage(tenant, data.phone_number, data.text, data.user_id, data.product_id)

    res.json({ success: true /*, message */ })
  } catch (err) {
    next(err)
  }
})

// --- INBOUND WEBHOOK (Meta Cloud API) ---
// Endpoint público, não passa por requireInternalKey nem withTenantIsolation nativamente

// Verificação (GET) exigida pela Meta na configuração
router.get('/webhook', (req, res) => {
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
router.post('/webhook', (req, res) => {
  // A Meta Cloud API envia os headers 'x-hub-signature-256'
  const signature = req.headers['x-hub-signature-256'] as string
  const rawBody = (req as any).rawBody || JSON.stringify(req.body) // depende de como o bodyparser foi injetado raw

  // Delegar ao service handleWebhookInbound
  // O Service já vai lidar com a resposta imediata 200 e setImmediate
  handleWebhookInbound(req.body, rawBody, signature, res)
})


// --- SSE STREAMING (Frontend) ---
router.get('/stream', (req, res) => {
  const tenant = (req as any).tenant
  if (!tenant) return res.status(401).send('Unauthorized')
    
  sseStreamHandlers.addClient(tenant, req, res)
})

export const whatsappRoutes = router
