/**
 * behaviorTrackingService.ts — Motor de rastreamento de comportamento do usuário
 *
 * Fase 2 do sistema de GABI Insights Personalizados.
 *
 * Responsabilidades:
 *  1. Registrar eventos de comportamento (rota visitada, filtro aplicado, insight clicado, etc.)
 *  2. Computar scores de relevância por insightId com base nos últimos 30 dias de eventos
 *  3. Retornar multiplicadores para o gabiInsightsService re-ranquear insights
 *
 * Regras:
 *  - Toda query filtra por tenant_id (isolamento obrigatório)
 *  - Falha silenciosa: se o banco não tiver a tabela ainda, retorna scores vazios
 *  - Eventos são armazenados sem dados sensíveis (sem valores de campo, apenas chave)
 */

import { z } from 'zod'

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type BehaviorEventType =
  | 'route_visited'
  | 'filter_applied'
  | 'widget_clicked'
  | 'column_viewed'
  | 'insight_clicked'

export const BehaviorEventSchema = z.object({
  event: z.enum(['route_visited', 'filter_applied', 'widget_clicked', 'column_viewed', 'insight_clicked']),
  payload: z.object({
    route:         z.string().max(200).optional(),
    filter_field:  z.string().max(100).optional(),
    filter_value:  z.string().max(100).optional(),
    widget_id:     z.string().max(100).optional(),
    column_key:    z.string().max(100).optional(),
    insight_id:    z.string().max(100).optional(),
  }),
})

export type BehaviorEventInput = z.infer<typeof BehaviorEventSchema>

// ── Mapeamento evento → insightId ─────────────────────────────────────────────
// Define quais insights ganham score quando certos eventos ocorrem

const EVENT_TO_INSIGHT_MAP: Record<string, Record<string, string>> = {
  route_visited: {
    '/pedidos/lista?status=atrasado':   'atrasados',
    '/pedidos/lista?status=aberto':     'abertos',
    '/pedidos/lista?status=cancelado':  'cancelados',
    '/pedidos/lista?sem_exportador=true': 'sem_exportador',
  },
  filter_applied: {
    'status:atrasado':      'atrasados',
    'status:aberto':        'abertos',
    'status:cancelado':     'cancelados',
    'sem_exportador:true':  'sem_exportador',
    'valor_total':          'financeiro',
    'moeda_pedido':         'financeiro',
    'tipo_operacao':        'distribuicao',
  },
  insight_clicked: {
    // insight_id → direto (1:1)
  },
}

function resolveInsightId(event: BehaviorEventType, payload: BehaviorEventInput['payload']): string | null {
  if (event === 'insight_clicked' && payload.insight_id) return payload.insight_id
  if (event === 'route_visited' && payload.route) {
    return EVENT_TO_INSIGHT_MAP.route_visited[payload.route] ?? null
  }
  if (event === 'filter_applied' && payload.filter_field) {
    const key = payload.filter_value
      ? `${payload.filter_field}:${payload.filter_value}`
      : payload.filter_field
    return EVENT_TO_INSIGHT_MAP.filter_applied[key] ?? null
  }
  if (event === 'widget_clicked' && payload.widget_id) {
    // Widgets de financeiro → boost no insight financeiro
    if (['kpi_valor_total', 'kpi_valor_itens', 'valor_total_trend'].includes(payload.widget_id)) return 'financeiro'
    if (['kpi_pedidos_atrasados'].includes(payload.widget_id)) return 'atrasados'
    if (['kpi_pedidos_abertos'].includes(payload.widget_id))   return 'abertos'
    if (['status_dist', 'tipo_operacao_dist'].includes(payload.widget_id)) return 'distribuicao'
  }
  return null
}

// ── Registrar evento ──────────────────────────────────────────────────────────

export async function trackBehaviorEvent(
  db: any,
  tenantId: string,
  userId: string,
  input: BehaviorEventInput,
): Promise<void> {
  try {
    await db.userBehaviorEvent.create({
      data: {
        tenant_id:  tenantId,
        product_id: 'pedido',
        user_id:    userId,
        event:      input.event,
        payload:    input.payload,
      },
    })
  } catch (err) {
    // Falha silenciosa — não bloqueia a experiência do usuário
    console.warn('[BehaviorTracking] Erro ao registrar evento (não crítico):', err)
  }
}

// ── Computar scores ───────────────────────────────────────────────────────────

/**
 * Retorna um mapa insightId → multiplicador de score (≥ 1.0).
 * Insights mais acessados pelo usuário recebem multiplicadores maiores.
 *
 * Escala:
 *   1-2 eventos   → 1.2×
 *   3-5 eventos   → 1.5×
 *   6-10 eventos  → 2.0×
 *   11+ eventos   → 2.5×
 */
export async function getUserBehaviorScores(
  db: any,
  tenantId: string,
  userId: string,
): Promise<Record<string, number>> {
  try {
    const since = new Date()
    since.setDate(since.getDate() - 30)

    const events = await db.userBehaviorEvent.findMany({
      where: {
        tenant_id:  tenantId,
        user_id:    userId,
        created_at: { gte: since },
      },
      select: { event: true, payload: true },
    })

    // Conta frequência por insightId
    const freq: Record<string, number> = {}
    for (const ev of events as Array<{ event: BehaviorEventType; payload: BehaviorEventInput['payload'] }>) {
      const insightId = resolveInsightId(ev.event, ev.payload)
      if (insightId) freq[insightId] = (freq[insightId] ?? 0) + 1
    }

    // Converte frequência para multiplicador
    const scores: Record<string, number> = {}
    for (const [id, count] of Object.entries(freq)) {
      if (count >= 11) scores[id] = 2.5
      else if (count >= 6) scores[id] = 2.0
      else if (count >= 3) scores[id] = 1.5
      else scores[id] = 1.2
    }

    return scores
  } catch {
    // Tabela pode não existir ainda (migração pendente) — retorna vazio
    return {}
  }
}
