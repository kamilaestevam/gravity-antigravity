import { prisma } from '../prisma'
import { sseStreamHandlers } from './sse'
import { callGabiForConversation } from './interpreter'
import { sendTextMessage } from './whatsapp'

export async function processWebhookPayload(value: any) {
  const metadata = value.metadata
  const messages = value.messages
  const contacts = value.contacts || []

  // Resolver tenant_id a partir do phone_number_id da Meta.
  // Cada deploy/serviço WhatsApp é configurado para um tenant específico via env.
  // O WHATSAPP_PHONE_NUMBER_ID identifica o business e o WHATSAPP_TENANT_ID mapeia ao tenant.
  const phone_number_id = metadata?.phone_number_id
  const expected_phone_id = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!phone_number_id || !expected_phone_id || phone_number_id !== expected_phone_id) {
    console.error('[WEBHOOK] phone_number_id não reconhecido:', phone_number_id)
    return
  }

  const tenant_id = process.env.WHATSAPP_TENANT_ID
  if (!tenant_id) {
    console.error('[WEBHOOK] WHATSAPP_TENANT_ID não configurado')
    return
  }

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i]
    const contact = contacts[i] || contacts[0] // fallback de array

    const wa_phone_number = contact?.wa_id || msg.from
    const wa_message_id = msg.id
    const contact_nome = contact?.profile?.name || 'Desconhecido'

    // Evitar duplicate messages
    const exists = await prisma.whatsAppMessage.findUnique({ where: { wa_message_id } })
    if (exists) continue

    // Achar ou Criar Conversa
    let conversation = await prisma.whatsAppConversation.findFirst({
      where: {
        tenant_id,
        wa_phone_number,
        status: 'open'
      }
    })

    if (!conversation) {
      conversation = await prisma.whatsAppConversation.create({
        data: {
          tenant_id,
          wa_phone_number,
          contact_nome,
          status: 'open',
          ai_enabled: false
        }
      })
    }

    let content = ''
    let content_type = msg.type || 'text'

    if (msg.type === 'text') content = msg.text?.body || ''
    else content = `[${msg.type} não suportado para exibição]`

    const savedMessage = await prisma.whatsAppMessage.create({
      data: {
        tenant_id,
        conversation_id: conversation.id,
        wa_message_id,
        direction: 'inbound',
        content_type,
        content,
        origin: 'contact',
        status: 'received'
      }
    })

    // Emite via SSE
    sseStreamHandlers.emit(tenant_id, 'new_message', { conversation, message: savedMessage })

    // Se ai_enabled -> Gabi
    if (conversation.ai_enabled) {
       await replyWithGabi(conversation.id, tenant_id, wa_phone_number)
    }
  }
}

async function replyWithGabi(conversation_id: string, tenant_id: string, to_phone: string) {
  try {
    const replyText = await callGabiForConversation(tenant_id, conversation_id)
    if (!replyText) return

    const { messageId } = await sendTextMessage(tenant_id, to_phone, replyText)

    const savedReply = await prisma.whatsAppMessage.create({
      data: {
        tenant_id,
        conversation_id,
        wa_message_id: messageId,
        direction: 'outbound',
        content_type: 'text',
        content: replyText,
        origin: 'gabi',
        status: 'sent'
      }
    })

    sseStreamHandlers.emit(tenant_id, 'new_message', { message: savedReply })
  } catch (err) {
    console.error('[GABI_REPLY_ERROR]', err)
  }
}
