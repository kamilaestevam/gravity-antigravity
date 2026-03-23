import crypto from 'crypto'
import { Response } from 'express'
import { processWebhookPayload } from './conversation'

export function validateWebhookSignature(rawBody: string, signature: string): boolean {
  if (!process.env.WHATSAPP_APP_SECRET || !signature) return false

  const expected = 'sha256=' +
    crypto.createHmac('sha256', process.env.WHATSAPP_APP_SECRET)
      .update(rawBody).digest('hex')
      
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
}

export function handleWebhookInbound(payload: any, rawBody: string, signature: string, res: Response) {
  // 1. Valida HMAC-SHA256 imediatamente
  if (!validateWebhookSignature(rawBody, signature)) {
    console.error('[WEBHOOK] Invalid signature')
    return res.status(401).send('Invalid signature')
  }

  // 2. Responde 200 OK imediatamente (obrigatório em < 5s)
  res.status(200).send('EVENT_RECEIVED')

  // 3. Processa assincronamente via setImmediate()
  // Meta envia: { object: 'whatsapp_business_account', entry: [{ id, changes: [{ value: { messages: [...] } }] }] }
  setImmediate(async () => {
    try {
      if (payload.object === 'whatsapp_business_account') {
        for (const entry of payload.entry) {
          for (const change of entry.changes) {
            if (change.value && change.value.messages) {
              await processWebhookPayload(change.value)
            }
          }
        }
      }
    } catch (err) {
      console.error('[WEBHOOK_PROCESS_ERROR]', err)
    }
  })
}
