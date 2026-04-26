import { prisma } from '../prisma'

export async function callGabiForConversation(tenant_id: string, conversation_id: string): Promise<string> {
  // 1. Busca histórico (últimas 10 mensagens)
  const history = await prisma.whatsappMensagem.findMany({
    where: {
      id_organizacao_whatsapp_mensagem: tenant_id,
      id_conversa_whatsapp_mensagem: conversation_id,
    },
    orderBy: { data_criacao_whatsapp_mensagem: 'asc' },
    take: 10,
  })

  // Constroi prompt contextual (Mock chamando Gemini)
  // Como proxy Gabi de tenant: chamariamos o internal gabi service ou llm framework
  // Simulando fallback chain:
  console.log(`[GABI] Generating reply for conversation ${conversation_id} with ${history.length} recent messages`)

  // Mock artificial:
  const lastUserMsg = history.reverse().find((m) => m.direcao_whatsapp_mensagem === 'inbound')
  const intent = lastUserMsg?.conteudo_whatsapp_mensagem.toLowerCase() || ''

  if (intent.includes('ola') || intent.includes('oi')) return 'Olá! Sou a Gabi, assistente da empresa. Como posso ajudar?'
  if (intent.includes('preço') || intent.includes('valor')) return 'Para verificar preços, por favor informe o produto ou serviço desejado.'

  return 'Anotado! Em breve um de nossos consultores humanos irá responder.'
}

export async function analyzeConversationTemperature(tenant_id: string, conversation_id: string) {
  // Ao encerrar conversa
  // Placeholder para IA Sentiment Analysis
  console.log(`[GABI] Analyzing temperature for conversation ${conversation_id}...`)

  await prisma.whatsappConversa.update({
    where: { id_whatsapp_conversa: conversation_id },
    data: {
      gabi_temperatura_whatsapp_conversa: 'Neutro',
      gabi_temperatura_score_whatsapp_conversa: 3,
      gabi_resumo_whatsapp_conversa: 'Conversa padrão analisada.',
      status_whatsapp_conversa: 'closed',
      fechada_em_whatsapp_conversa: new Date(),
    },
  })
}
