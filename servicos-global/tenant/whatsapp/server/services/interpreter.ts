import { prisma } from '../prisma'

export async function callGabiForConversation(tenant_id: string, conversation_id: string): Promise<string> {
  // 1. Busca histórico (últimas 10 mensagens)
  const history = await prisma.whatsAppMessage.findMany({
    where: { tenant_id, conversation_id },
    orderBy: { created_at: 'asc' },
    take: 10
  })

  // Constroi prompt contextual (Mock chamando Gemini)
  // Como proxy Gabi de tenant: chamariamos o internal gabi service ou llm framework
  // Simulando fallback chain:
  console.log(`[GABI] Generating reply for conversation ${conversation_id} with ${history.length} recent messages`)
  
  // Mock artificial:
  const lastUserMsg = history.reverse().find(m => m.direction === 'inbound')
  const intent = lastUserMsg?.content.toLowerCase() || ''

  if (intent.includes('ola') || intent.includes('oi')) return 'Olá! Sou a Gabi, assistente da empresa. Como posso ajudar?'
  if (intent.includes('preço') || intent.includes('valor')) return 'Para verificar preços, por favor informe o produto ou serviço desejado.'
  
  return 'Anotado! Em breve um de nossos consultores humanos irá responder.'
}

export async function analyzeConversationTemperature(tenant_id: string, conversation_id: string) {
  // Ao encerrar conversa
  // Placeholder para IA Sentiment Analysis
  console.log(`[GABI] Analyzing temperature for conversation ${conversation_id}...`)
  
  await prisma.whatsAppConversation.update({
    where: { id: conversation_id },
    data: {
      gabi_temperatura: 'Neutro',
      gabi_temperatura_score: 3,
      gabi_resumo: 'Conversa padrão analisada.',
      status: 'closed',
      closed_at: new Date()
    }
  })
}
