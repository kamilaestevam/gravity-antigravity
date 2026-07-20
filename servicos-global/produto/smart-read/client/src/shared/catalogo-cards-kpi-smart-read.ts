/**
 * catalogo-cards-kpi-smart-read.ts — SSOT dos KPI cards (Configurações + Lista + Insights).
 */

export type CardKpiSmartReadId =
  | 'total_leituras'
  | 'concluidas'
  | 'processando'
  | 'falhas'
  | 'taxa_sucesso'
  | 'campos_extraidos'
  | 'documentos'
  /** Legado da Lista antes da unificação com Configurações */
  | 'leituras_realizadas'
  | 'performance_acertos'
  | 'recursos_reduzidos'

export type CardDefinicaoKpiSmartRead = {
  id: CardKpiSmartReadId
  titulo: string
  descricao: string
}

export type CardPreferenciaKpiSmartRead = {
  id: string
  visible: boolean
}

export const CARDS_CATALOGO_KPI_SMART_READ: CardDefinicaoKpiSmartRead[] = [
  {
    id: 'total_leituras',
    titulo: 'Total de Leituras',
    descricao: 'Total de leituras no período selecionado',
  },
  {
    id: 'concluidas',
    titulo: 'Concluídas',
    descricao: 'Leituras com resultado publicado (fluxo concluído)',
  },
  {
    id: 'processando',
    titulo: 'Em Processamento',
    descricao: 'Leituras em análise ou conferência',
  },
  {
    id: 'falhas',
    titulo: 'Falhas',
    descricao: 'Leituras que falharam no processamento',
  },
  {
    id: 'taxa_sucesso',
    titulo: 'Taxa de Sucesso',
    descricao: 'Média de acertos das leituras visíveis',
  },
  {
    id: 'campos_extraidos',
    titulo: 'Campos Extraídos',
    descricao: 'Soma de campos extraídos nas leituras visíveis',
  },
  {
    id: 'documentos',
    titulo: 'Documentos',
    descricao: 'Soma de documentos nas leituras visíveis',
  },
  {
    id: 'recursos_reduzidos',
    titulo: 'Recursos reduzidos',
    descricao: 'Saving total (digitação + erros) das leituras visíveis',
  },
]

export const IDS_CARDS_KPI_SMART_READ = CARDS_CATALOGO_KPI_SMART_READ.map((c) => c.id)

/** Cards expostos em Configurações (exclui legado `recursos_reduzidos`, só Lista). */
export const IDS_CARDS_CONFIGURACAO_SMART_READ = CARDS_CATALOGO_KPI_SMART_READ.filter(
  (c) => c.id !== 'recursos_reduzidos',
).map((c) => c.id)

/** Padrão: os 7 cards de Configurações, todos ativos e visíveis. */
export const CARDS_PADRAO_KPI_SMART_READ: CardPreferenciaKpiSmartRead[] =
  IDS_CARDS_CONFIGURACAO_SMART_READ.map((id) => ({ id, visible: true }))

const LEGACY_ID_MAP: Record<string, CardKpiSmartReadId> = {
  leituras_realizadas: 'total_leituras',
  performance_acertos: 'taxa_sucesso',
  recursos_reduzidos: 'recursos_reduzidos',
}

export function normalizarIdCardKpiSmartRead(id: string): string {
  return LEGACY_ID_MAP[id] ?? id
}

export function definicaoCardKpiSmartRead(id: string): CardDefinicaoKpiSmartRead | undefined {
  const normalizado = normalizarIdCardKpiSmartRead(id)
  return CARDS_CATALOGO_KPI_SMART_READ.find((c) => c.id === normalizado)
}

export function ordenarPreferenciasCardsKpi(
  prefs: CardPreferenciaKpiSmartRead[],
): CardPreferenciaKpiSmartRead[] {
  const ordem = new Map(prefs.map((p, index) => [normalizarIdCardKpiSmartRead(p.id), index]))
  return [...prefs].sort(
    (a, b) =>
      (ordem.get(normalizarIdCardKpiSmartRead(a.id)) ?? Number.MAX_SAFE_INTEGER)
      - (ordem.get(normalizarIdCardKpiSmartRead(b.id)) ?? Number.MAX_SAFE_INTEGER),
  )
}

export function normalizarPreferenciasCardsKpi(
  raw: unknown,
  fallback = CARDS_PADRAO_KPI_SMART_READ,
): CardPreferenciaKpiSmartRead[] {
  if (!Array.isArray(raw)) return fallback.map((c) => ({ ...c }))
  const idsValidos = new Set(IDS_CARDS_KPI_SMART_READ)
  const vistos = new Set<string>()
  const normalizadas: CardPreferenciaKpiSmartRead[] = []

  for (const item of raw) {
    if (typeof item !== 'object' || item == null) continue
    const id = normalizarIdCardKpiSmartRead(String((item as CardPreferenciaKpiSmartRead).id))
    if (!idsValidos.has(id as CardKpiSmartReadId) || vistos.has(id)) continue
    vistos.add(id)
    normalizadas.push({
      id,
      visible: Boolean((item as CardPreferenciaKpiSmartRead).visible),
    })
  }

  if (normalizadas.length === 0) return fallback.map((c) => ({ ...c }))
  return ordenarPreferenciasCardsKpi(normalizadas)
}

/** Migra storage legado `smart-read:config:cards-v1` para o formato unificado. */
export function carregarPreferenciasCardsLegadoSmartRead(): CardPreferenciaKpiSmartRead[] | null {
  try {
    const raw = localStorage.getItem('smart-read:config:cards-v1')
    if (!raw) return null
    const salvas = JSON.parse(raw) as unknown
    if (!Array.isArray(salvas)) return null
    return normalizarPreferenciasCardsKpi(salvas)
  } catch {
    return null
  }
}
