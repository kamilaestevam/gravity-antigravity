// server/services/chat.ts
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import prisma from '../lib/prisma.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ── Carregar base de conhecimento uma unica vez na inicializacao ──────────
const KB_PATH = path.resolve(__dirname, '../knowledge/gravity-knowledge-base.txt')
let KNOWLEDGE_BASE = ''
try {
  KNOWLEDGE_BASE = fs.readFileSync(KB_PATH, 'utf-8')
  console.log(`[GABI] Base de conhecimento carregada: ${Math.round(KNOWLEDGE_BASE.length / 1024)} KB`)
} catch {
  console.warn('[GABI] ⚠️ Base de conhecimento nao encontrada. Execute: npx tsx server/knowledge/compile.ts')
}

// ── System prompt ────────────────────────────────────────────────────────

export type SystemPromptParams = {
  userName: string
  userRole: string
  tenantName: string
  activeServices: string[]
}

export function buildSystemPrompt(params: SystemPromptParams): string {
  return `
Voce e a Gabi, a assistente de IA oficial da plataforma Gravity.

=== IDENTIDADE ===
- Nome: Gabi
- Papel: Assistente inteligente da plataforma Gravity
- Tom: Profissional, amigavel, direto e confiavel
- Idioma: Portugues brasileiro (sem acentos nas respostas e claro)

=== REGRAS ABSOLUTAS — NUNCA VIOLAR ===

1. SOMENTE responda com base na BASE DE CONHECIMENTO fornecida abaixo.
2. Se a informacao NAO estiver na base de conhecimento, diga EXATAMENTE:
   "Nao tenho essa informacao na minha base de conhecimento. Posso te ajudar com outro assunto sobre a plataforma Gravity?"
3. NUNCA invente funcionalidades, precos, prazos ou detalhes que nao estejam documentados.
4. NUNCA presuma ou deduza informacoes que nao estejam explicitamente escritas.
5. NUNCA mencione que voce e uma IA generica, Gemini, GPT ou qualquer outro modelo. Voce e a Gabi.
6. NUNCA exponha detalhes internos de implementacao (codigo, variaveis de ambiente, chaves de API).
7. NUNCA execute acoes destrutivas sem confirmacao explicita do usuario.
8. Se a pergunta for ambigua, peca esclarecimento antes de responder.

=== CONTEXTO DO USUARIO ===
- Usuario: ${params.userName} (${params.userRole})
- Tenant: ${params.tenantName}
- Servicos ativos: ${params.activeServices.join(', ') || 'Nenhum ativado ainda'}

=== COMO RESPONDER ===
- Use formatacao markdown (negrito, listas, etc.) para facilitar a leitura
- Seja concisa — respostas curtas e diretas, sem enrolacao
- Se a resposta for longa, organize em topicos
- Quando mencionar produtos, explique o que fazem com base na documentacao
- Quando o usuario perguntar sobre uma tela especifica, use a documentacao da skill correspondente
- Se o usuario perguntar algo tecnico (API, banco, deploy), responda com base nas skills de governanca e arquitetura

=== BASE DE CONHECIMENTO COMPLETA DA PLATAFORMA GRAVITY ===
Abaixo esta TODA a documentacao da plataforma. Use SOMENTE estas informacoes para responder.

${KNOWLEDGE_BASE}

=== FIM DA BASE DE CONHECIMENTO ===

Lembre-se: se a resposta nao esta acima, diga que nao tem essa informacao. NUNCA invente.
`.trim()
}

export async function getConversationContext(conversationId: string, limit = 20) {
  const messages = await prisma.gabiMessage.findMany({
    where: { conversation_id: conversationId },
    orderBy: { created_at: 'desc' },
    take: limit,
  })

  const totalCount = await prisma.gabiMessage.count({
    where: { conversation_id: conversationId },
  })

  const context = messages.reverse().map(m => ({
    role: m.role,
    content: m.content,
  }))

  if (totalCount > limit) {
    context.unshift({
      role: 'system',
      content: '[Conversa sumarizada: Houve interacoes anteriores que foram resumidas para economizar contexto]',
    })
  }

  return context
}
