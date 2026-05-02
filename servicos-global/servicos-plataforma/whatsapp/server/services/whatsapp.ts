// 554888480707 → 5548988480707
export function normalizePhoneForSend(phone: string): string {
  const clean = phone.replace(/\D/g, '')
  if (clean.length === 12 && clean.startsWith('55')) {
    return clean.slice(0, 4) + '9' + clean.slice(4)
  }
  return clean
}

export async function sendTextMessage(
  tenant_id: string,
  to_phone: string,
  text: string
): Promise<{ messageId: string }> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!accessToken || !phoneNumberId) {
    throw new Error('WhatsApp API configuration is missing (tokens).')
  }

  const normalizedPhone = normalizePhoneForSend(to_phone)

  const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: normalizedPhone,
      type: 'text',
      text: {
        body: text
      }
    })
  })

  const data = await response.json()

  if (!response.ok) {
    console.error('[META_API_ERROR]', JSON.stringify(data, null, 2))
    throw new Error(`Failed to send message: ${data.error?.message || 'Unknown meta error'}`)
  }

  const messageId = data.messages?.[0]?.id
  if (!messageId) {
    throw new Error('Message deployed but Meta provided no message ID')
  }

  return { messageId }
}
