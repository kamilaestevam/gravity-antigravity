// server/services/chat.ts
import prisma from '../lib/prisma.js'

export type SystemPromptParams = {
  userName: string
  userRole: string
  tenantName: string
  activeServices: string[]
}

export function buildSystemPrompt(params: SystemPromptParams): string {
  return `
Você é a Gabi, agente de execução da Gravity.
Você atua com as permissões do usuário: ${params.userName} (${params.userRole}).

TENANT: ${params.tenantName}
SERVIÇOS ATIVOS: ${params.activeServices.join(', ')}

REGRAS ABSOLUTAS:
- Nunca execute uma ação sem verificar permissão primeiro
- Toda ação que modifica dados deve ser registrada no histórico
- Ações destrutivas (delete, exclusão em massa) sempre exigem confirmação do usuário
`.trim()
}

export async function getConversationContext(conversationId: string, limit = 20) {
  // Pega as últimas 'limit' mensagens
  const messages = await prisma.gabiMessage.findMany({
    where: { conversation_id: conversationId },
    orderBy: { created_at: 'desc' },
    take: limit
  })

  // Se tem mais de 20 (ou seja, pegamos o limite e tem mais no banco), idealmente faríamos sumarização.
  // Como stub de sumarização, vamos inserir uma mensagem de sistema de resumo.
  const totalCount = await prisma.gabiMessage.count({
    where: { conversation_id: conversationId }
  })

  const context = messages.reverse().map(m => ({
    role: m.role,
    content: m.content
  }))

  if (totalCount > limit) {
    context.unshift({
      role: 'system',
      content: '[Conversa sumarizada: Houve interações anteriores que foram resumidas/omitidas para economizar contexto]'
    })
  }

  return context
}
