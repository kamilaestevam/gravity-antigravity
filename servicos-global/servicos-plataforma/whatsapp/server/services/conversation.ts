import { prisma } from '../prisma'
import { sseStreamHandlers } from './sse'
import { callGabiForConversation } from './interpreter'
import { sendTextMessage } from './whatsapp'

interface MetaWebhookContact {
  wa_id?: string
  profile?: { name?: string }
}

interface MetaWebhookMessage {
  id: string
  from: string
  type: string
  text?: { body?: string }
}

interface MetaWebhookValue {
  metadata?: { phone_number_id?: string }
  messages?: MetaWebhookMessage[]
  contacts?: MetaWebhookContact[]
}

export async function processWebhookPayload(value: Record<string, unknown>) {
  const v = value as unknown as MetaWebhookValue
  const messages = v.messages ?? []
  const contacts = v.contacts ?? []

  // Resolver tenant_id a partir do phone_number_id da Meta.
  // Cada deploy/serviço WhatsApp é configurado para um tenant específico via env.
  // O WHATSAPP_PHONE_NUMBER_ID identifica o business e o WHATSAPP_TENANT_ID mapeia ao tenant.
  const phone_number_id = v.metadata?.phone_number_id
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
    const exists = await prisma.whatsappMensagem.findUnique({
      where: { id_wa_mensagem_whatsapp_mensagem: wa_message_id },
    })
    if (exists) continue

    // Achar ou Criar Conversa
    let conversation = await prisma.whatsappConversa.findFirst({
      where: {
        id_organizacao_whatsapp_conversa: tenant_id,
        telefone_wa_whatsapp_conversa: wa_phone_number,
        status_whatsapp_conversa: 'open',
      },
    })

    if (!conversation) {
      conversation = await prisma.whatsappConversa.create({
        data: {
          id_organizacao_whatsapp_conversa: tenant_id,
          telefone_wa_whatsapp_conversa: wa_phone_number,
          nome_contato_whatsapp_conversa: contact_nome,
          status_whatsapp_conversa: 'open',
          ia_habilitada_whatsapp_conversa: false,
        },
      })
    }

    let content = ''
    const content_type = msg.type || 'text'

    if (msg.type === 'text') content = msg.text?.body || ''
    else content = `[${msg.type} não suportado para exibição]`

    const savedMessage = await prisma.whatsappMensagem.create({
      data: {
        id_organizacao_whatsapp_mensagem: tenant_id,
        id_conversa_whatsapp_mensagem: conversation.id_whatsapp_conversa,
        id_wa_mensagem_whatsapp_mensagem: wa_message_id,
        direcao_whatsapp_mensagem: 'inbound',
        tipo_conteudo_whatsapp_mensagem: content_type,
        conteudo_whatsapp_mensagem: content,
        origem_whatsapp_mensagem: 'contact',
        status_whatsapp_mensagem: 'received',
      },
    })

    // Emite via SSE
    sseStreamHandlers.emit(tenant_id, 'new_message', { conversation, message: savedMessage })

    // Se ai_enabled -> Gabi
    if (conversation.ia_habilitada_whatsapp_conversa) {
      await replyWithGabi(conversation.id_whatsapp_conversa, tenant_id, wa_phone_number)
    }
  }
}

async function replyWithGabi(conversation_id: string, tenant_id: string, to_phone: string) {
  try {
    const replyText = await callGabiForConversation(tenant_id, conversation_id)
    if (!replyText) return

    const { messageId } = await sendTextMessage(tenant_id, to_phone, replyText)

    const savedReply = await prisma.whatsappMensagem.create({
      data: {
        id_organizacao_whatsapp_mensagem: tenant_id,
        id_conversa_whatsapp_mensagem: conversation_id,
        id_wa_mensagem_whatsapp_mensagem: messageId,
        direcao_whatsapp_mensagem: 'outbound',
        tipo_conteudo_whatsapp_mensagem: 'text',
        conteudo_whatsapp_mensagem: replyText,
        origem_whatsapp_mensagem: 'gabi',
        status_whatsapp_mensagem: 'sent',
      },
    })

    sseStreamHandlers.emit(tenant_id, 'new_message', { message: savedReply })
  } catch (err) {
    console.error('[GABI_REPLY_ERROR]', err)
  }
}
