/**
 * gabiLlmInsightsService.ts — Enriquecimento de insights via Gabi LLM (Fase 3)
 *
 * Responsabilidades:
 *  1. Receber insights gerados deterministicamente (Fases 1+2)
 *  2. Chamar o serviço Gabi para gerar texto contextual em linguagem natural
 *  3. Cachear resultados por tenant + user + date + insightId (TTL: 6h)
 *  4. Fallback automático ao texto determinístico se:
 *     - Gabi estiver offline
 *     - Timeout exceder 3s
 *     - Quota do tenant esgotada
 *     - Qualquer erro inesperado
 *
 * Regras:
 *  - Cache DEVE incluir tenant_id para isolamento
 *  - Nunca bloquear o endpoint de insights por falha do LLM
 *  - Máximo 3s de timeout por chamada Gabi
 */

import type { GabiInsight, KpiSnapshot, UserRole } from './gabiInsightsService.js'

// ── Cache in-memory ───────────────────────────────────────────────────────────

const TTL_MS = 6 * 60 * 60 * 1000  // 6 horas

interface CacheEntry {
  texto: string
  expiresAt: number
}

// Chave: `${tenantId}:${userId}:${dateKey}:${insightId}`
const cache = new Map<string, CacheEntry>()

function cacheKey(tenantId: string, userId: string, insightId: string): string {
  const dateKey = new Date().toISOString().slice(0, 10)  // YYYY-MM-DD
  return `${tenantId}:${userId}:${dateKey}:${insightId}`
}

function getCached(key: string): string | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) { cache.delete(key); return null }
  return entry.texto
}

function setCached(key: string, texto: string): void {
  cache.set(key, { texto, expiresAt: Date.now() + TTL_MS })
  // Limpeza preventiva: remove entradas expiradas quando cache passa de 500 entradas
  if (cache.size > 500) {
    const now = Date.now()
    for (const [k, v] of cache.entries()) {
      if (now > v.expiresAt) cache.delete(k)
    }
  }
}

// ── Prompt builder ────────────────────────────────────────────────────────────

function buildPrompt(insight: GabiInsight, kpis: KpiSnapshot, role: UserRole): string {
  return `Você é GABI, assistente de BI da plataforma Gravity. Reescreva o insight abaixo em linguagem natural concisa (máximo 2 frases), mantendo os números exatos. Adapte o tom para um usuário com papel "${role}".

Insight atual: "${insight.texto}"
Contexto adicional de KPIs:
- Total pedidos: ${kpis.total_pedidos}
- Atrasados: ${kpis.pedidos_atrasados}
- Sem exportador: ${kpis.pedidos_sem_exportador}
- Valor total: ${kpis.valor_total}
- Tipo: ${insight.variante === 'warn' ? 'ALERTA — usar tom urgente' : 'INFORMATIVO — usar tom analítico'}

Responda APENAS com o texto do insight, sem formatação, aspas ou explicações.`
}

// ── Chamada ao serviço Gabi ───────────────────────────────────────────────────

// Default alinhado com contracts.json — Gabi vive no super-server da plataforma (porta 3001).
const GABI_SERVICE_URL = process.env.GABI_SERVICE_URL ?? 'http://localhost:3001'
const GABI_TIMEOUT_MS  = 3_000  // 3s — não bloqueia o usuário além disso

async function callGabi(
  prompt: string,
  tenantId: string,
  userId: string,
): Promise<string | null> {
  try {
    const response = await fetch(`${GABI_SERVICE_URL}/api/v1/gabi/chats`, {
      method: 'POST',
      headers: {
        'Content-Type':   'application/json',
        'x-internal-key': process.env.INTERNAL_SERVICE_KEY ?? '',
        'x-id-organizacao':    tenantId,
        'x-id-usuario':      userId,
        'x-id-produto':   'pedido',
        'x-gabi-quota':   process.env.GABI_QUOTA_PEDIDO ?? '50000',
      },
      body: JSON.stringify({
        mensagem: prompt,
        historico: [],
        modo: 'analista',
      }),
      signal: AbortSignal.timeout(GABI_TIMEOUT_MS),
    })

    if (!response.ok) return null

    const data = await response.json() as { resposta?: string; texto?: string }
    return data.resposta ?? data.texto ?? null
  } catch {
    return null  // Timeout, offline, ou erro — fallback silencioso
  }
}

// ── Função principal ──────────────────────────────────────────────────────────

/**
 * Tenta enriquecer o texto dos insights via Gabi LLM.
 * Retorna os insights com texto original em caso de falha (fallback automático).
 *
 * @param insights      - Lista gerada pelas Fases 1+2
 * @param kpis          - Snapshot de KPIs para contexto do prompt
 * @param tenantId      - Isolamento de tenant (obrigatório no cache e na chamada)
 * @param userId        - Personalização por usuário
 * @param role          - Role para calibrar tom do texto
 */
export async function enhanceWithLlm(
  insights: GabiInsight[],
  kpis: KpiSnapshot,
  tenantId: string,
  userId: string,
  role: UserRole,
): Promise<GabiInsight[]> {
  // Gabi LLM desabilitada por variável de ambiente
  if (process.env.GABI_INSIGHTS_LLM !== 'true') return insights

  const enhanced = await Promise.all(
    insights.map(async (insight): Promise<GabiInsight> => {
      const key = cacheKey(tenantId, userId, insight.id)

      // Cache hit — retorna sem chamar LLM
      const cached = getCached(key)
      if (cached) return { ...insight, texto: cached }

      // Chama Gabi com timeout + fallback
      const prompt = buildPrompt(insight, kpis, role)
      const llmTexto = await callGabi(prompt, tenantId, userId)

      if (llmTexto) {
        setCached(key, llmTexto)
        return { ...insight, texto: llmTexto }
      }

      // Fallback: mantém texto determinístico original
      return insight
    }),
  )

  return enhanced
}
