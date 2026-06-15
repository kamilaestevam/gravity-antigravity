/**
 * gabi-insights-bid-frete-internacional.ts — Motor determinístico GABI Fase 1 (Dashboard operacional)
 *
 * Templates por role — insights ranqueados a partir de KPIs agregados.
 * Paridade conceitual com servicos-global/produto/pedido/server/src/services/gabiInsightsService.ts
 */

import type { KpisDashboardBidFretePayload } from '../lib/agregar-kpis-dashboard-bid-frete-internacional.js'

export type UserRoleBidFrete = 'operador' | 'gerente' | 'diretor' | 'admin' | 'default'

export type KpiSnapshotBidFrete = {
  period: string
  cotacoes_andamento: number
  cotacoes_passadas: number
  rascunhos: number
  aguardando_aprovacao: number
  saving_total: number
  saving_pct: number
  valor_andamento_usd: number
  valor_aprovado_usd: number
  valor_medio_ganho: number
  tempo_medio_resposta_dias: number | null
  cotacoes_aprovadas: number
  pct_aprovacao_em_tempo: number
}

export type GabiInsightBidFrete = {
  id: string
  variante: 'default' | 'warn'
  tag: string
  texto: string
  stat?: { label: string; valor: string }
  textoLink?: string
  rota?: string
  score: number
}

export type GabiInsightBidFreteResposta = Omit<GabiInsightBidFrete, 'score'>

const ROLE_WEIGHTS: Record<UserRoleBidFrete, Record<string, number>> = {
  operador: {
    rascunhos_ativos: 100,
    aguardando_aprovacao: 95,
    cotacoes_andamento: 90,
    tempo_resposta: 75,
    aprovacao_prazo: 70,
    saving_total: 40,
    valor_aprovado: 35,
    tendencia_volume: 50,
    status_ok: 10,
  },
  gerente: {
    saving_total: 100,
    valor_aprovado: 95,
    tendencia_volume: 85,
    aprovacao_prazo: 80,
    cotacoes_andamento: 70,
    aguardando_aprovacao: 75,
    rascunhos_ativos: 60,
    tempo_resposta: 55,
    status_ok: 10,
  },
  diretor: {
    saving_total: 100,
    valor_aprovado: 100,
    tendencia_volume: 90,
    valor_andamento: 85,
    aprovacao_prazo: 70,
    cotacoes_andamento: 50,
    aguardando_aprovacao: 55,
    rascunhos_ativos: 40,
    tempo_resposta: 45,
    status_ok: 10,
  },
  admin: {
    rascunhos_ativos: 100,
    aguardando_aprovacao: 100,
    cotacoes_andamento: 100,
    saving_total: 100,
    valor_aprovado: 100,
    tendencia_volume: 100,
    tempo_resposta: 100,
    aprovacao_prazo: 100,
    status_ok: 10,
  },
  default: {
    rascunhos_ativos: 80,
    aguardando_aprovacao: 75,
    cotacoes_andamento: 70,
    saving_total: 65,
    valor_aprovado: 60,
    tendencia_volume: 55,
    tempo_resposta: 50,
    aprovacao_prazo: 50,
    status_ok: 10,
  },
}

const fmtNum = (n: number) => new Intl.NumberFormat('pt-BR').format(Math.round(n))
const fmtUSD = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
const fmtPct = (n: number) => `${n.toFixed(1)}%`

const FALLBACK_INSIGHTS: GabiInsightBidFrete[] = [
  {
    id: 'status_ok',
    variante: 'default',
    tag: 'Gabi AI · Tudo em dia',
    texto: 'Nenhuma pendência crítica ou anomalia operacional identificada no período selecionado.',
    score: 1,
  },
  {
    id: 'dica_periodo',
    variante: 'default',
    tag: 'Dica · Período',
    texto: 'Use o filtro de período para explorar tendências históricas das suas cotações de frete.',
    textoLink: 'Explorar dados',
    rota: '/bid-frete/dashboard',
    score: 0,
  },
]

export function toKpiSnapshotBidFrete(
  period: string,
  raw: KpisDashboardBidFretePayload,
): KpiSnapshotBidFrete {
  const funilMap = Object.fromEntries(raw.funil.map(f => [f.status, f.count]))
  const totalAprovadasClassificacao =
    raw.savings?.total_cotacoes_aprovadas_classificacao_bid_frete_internacional ?? 0

  return {
    period,
    cotacoes_andamento: raw.cotacoes_andamento,
    cotacoes_passadas: raw.cotacoes_passadas,
    rascunhos: funilMap.RASCUNHO ?? 0,
    aguardando_aprovacao: funilMap.AGUARDANDO_APROVACAO ?? 0,
    saving_total: raw.savings?.total_saving_vs_target ?? 0,
    saving_pct: raw.savings?.media_saving_percentual ?? 0,
    valor_andamento_usd: raw.valor_andamento_usd,
    valor_aprovado_usd: raw.valor_aprovado_usd,
    valor_medio_ganho:
      totalAprovadasClassificacao > 0
        ? (raw.savings?.total_valor_aprovado ?? 0) / totalAprovadasClassificacao
        : 0,
    tempo_medio_resposta_dias: raw.tempo_medio_resposta_dias,
    cotacoes_aprovadas: raw.cotacoes_aprovadas,
    pct_aprovacao_em_tempo: parseFloat(raw.aprovacao.percentual_em_tempo) || 0,
  }
}

function buildCandidates(
  kpis: KpiSnapshotBidFrete,
  prev: KpiSnapshotBidFrete | null | undefined,
  role: UserRoleBidFrete,
): GabiInsightBidFrete[] {
  const weights = ROLE_WEIGHTS[role] ?? ROLE_WEIGHTS.default
  const candidates: GabiInsightBidFrete[] = []

  if (kpis.rascunhos > 0) {
    candidates.push({
      id: 'rascunhos_ativos',
      variante: 'warn',
      tag: 'Atenção · Rascunhos Pendentes',
      texto: `${kpis.rascunhos} cotação${kpis.rascunhos > 1 ? 's' : ''} em rascunho. Finalize e envie para negociação de frete.`,
      stat: { label: 'Em rascunho', valor: fmtNum(kpis.rascunhos) },
      textoLink: 'Ver cotações',
      rota: '/bid-frete/lista',
      score: weights.rascunhos_ativos ?? 0,
    })
  }

  if (kpis.aguardando_aprovacao > 0) {
    candidates.push({
      id: 'aguardando_aprovacao',
      variante: 'warn',
      tag: 'Atenção · Aguardando Aprovação',
      texto: `${kpis.aguardando_aprovacao} ${kpis.aguardando_aprovacao > 1 ? 'cotações' : 'cotação'} aguardando aprovação interna.`,
      stat: { label: 'Pendentes', valor: fmtNum(kpis.aguardando_aprovacao) },
      textoLink: 'Revisar BIDs',
      rota: '/bid-frete/lista',
      score: weights.aguardando_aprovacao ?? 0,
    })
  }

  if (kpis.cotacoes_andamento > 0) {
    candidates.push({
      id: 'cotacoes_andamento',
      variante: 'default',
      tag: 'Operacional · Em Cotação',
      texto: `${kpis.cotacoes_andamento} rodada${kpis.cotacoes_andamento > 1 ? 's' : ''} de cotação de frete ativa${kpis.cotacoes_andamento > 1 ? 's' : ''} no mercado.`,
      stat: kpis.valor_andamento_usd > 0
        ? { label: 'Valor em cotação', valor: fmtUSD(kpis.valor_andamento_usd) }
        : { label: 'Cotações ativas', valor: fmtNum(kpis.cotacoes_andamento) },
      textoLink: 'Acompanhar BIDs',
      rota: '/bid-frete/lista',
      score: weights.cotacoes_andamento ?? 0,
    })
  }

  if (kpis.saving_total > 0) {
    candidates.push({
      id: 'saving_total',
      variante: 'default',
      tag: 'Financeiro · Saving Acumulado',
      texto: `Economia gerada (saving) nas negociações de frete acumulada em ${fmtUSD(kpis.saving_total)}.`,
      stat: kpis.saving_pct > 0
        ? { label: 'Redução média', valor: fmtPct(kpis.saving_pct) }
        : { label: 'Total economizado', valor: fmtUSD(kpis.saving_total) },
      textoLink: 'Ver comparativos',
      score: weights.saving_total ?? 0,
    })
  }

  if (kpis.valor_aprovado_usd > 0) {
    candidates.push({
      id: 'valor_aprovado',
      variante: 'default',
      tag: 'Financeiro · Adjudicado',
      texto: `Adjudicação de frete internacional totaliza ${fmtUSD(kpis.valor_aprovado_usd)} em propostas aprovadas.`,
      stat: kpis.valor_medio_ganho > 0
        ? { label: 'Ticket médio ganho', valor: fmtUSD(kpis.valor_medio_ganho) }
        : undefined,
      textoLink: 'Ver adjudicadas',
      score: weights.valor_aprovado ?? 0,
    })
  }

  if (kpis.valor_andamento_usd > 0 && role === 'diretor') {
    candidates.push({
      id: 'valor_andamento',
      variante: 'default',
      tag: 'Financeiro · Pipeline',
      texto: `Pipeline de frete em negociação soma ${fmtUSD(kpis.valor_andamento_usd)} em propostas ativas.`,
      stat: { label: 'Cotações ativas', valor: fmtNum(kpis.cotacoes_andamento) },
      textoLink: 'Ver pipeline',
      rota: '/bid-frete/lista',
      score: weights.valor_andamento ?? 0,
    })
  }

  if (prev && prev.cotacoes_passadas > 0 && kpis.cotacoes_passadas > 0) {
    const delta = kpis.cotacoes_passadas - prev.cotacoes_passadas
    const pct = Math.abs((delta / prev.cotacoes_passadas) * 100)
    if (Math.abs(delta) > 0) {
      const crescendo = delta > 0
      candidates.push({
        id: 'tendencia_volume',
        variante: 'default',
        tag: 'Tendência · BIDs Fechados',
        texto: `Volume de cotações adjudicadas ${crescendo ? 'cresceu' : 'caiu'} ${fmtPct(pct)} em relação ao período anterior.`,
        stat: { label: 'Período anterior', valor: fmtNum(prev.cotacoes_passadas) },
        textoLink: 'Explorar dados',
        score: weights.tendencia_volume ?? 0,
      })
    }
  }

  if (kpis.tempo_medio_resposta_dias !== null && kpis.tempo_medio_resposta_dias > 3) {
    candidates.push({
      id: 'tempo_resposta',
      variante: kpis.tempo_medio_resposta_dias > 7 ? 'warn' : 'default',
      tag: 'Operacional · Tempo de Resposta',
      texto: `Fornecedores respondem em média em ${fmtNum(kpis.tempo_medio_resposta_dias)} dias — acima do ideal para frete internacional.`,
      stat: { label: 'Média (dias)', valor: fmtNum(kpis.tempo_medio_resposta_dias) },
      textoLink: 'Ver cotações',
      rota: '/bid-frete/lista',
      score: weights.tempo_resposta ?? 0,
    })
  }

  if (kpis.cotacoes_aprovadas > 0 && kpis.pct_aprovacao_em_tempo < 80) {
    candidates.push({
      id: 'aprovacao_prazo',
      variante: 'warn',
      tag: 'Atenção · Aprovação no Prazo',
      texto: `Apenas ${fmtPct(kpis.pct_aprovacao_em_tempo)} das cotações aprovadas foram decididas dentro do prazo de resposta.`,
      stat: { label: 'Aprovadas no período', valor: fmtNum(kpis.cotacoes_aprovadas) },
      textoLink: 'Analisar prazos',
      rota: '/bid-frete/lista',
      score: weights.aprovacao_prazo ?? 0,
    })
  }

  return candidates
}

export function normalizeRoleBidFrete(raw: string | undefined): UserRoleBidFrete {
  if (!raw) return 'default'
  const lower = raw.toLowerCase()
  if (lower.includes('diretor') || lower.includes('director')) return 'diretor'
  if (lower.includes('gerente') || lower.includes('manager')) return 'gerente'
  if (lower.includes('admin')) return 'admin'
  if (lower.includes('operador') || lower.includes('operator')) return 'operador'
  return 'default'
}

/**
 * Gera insights ranqueados para o carrossel GABI (mínimo 2).
 */
export function generateInsightsBidFreteInternacional(
  kpis: KpiSnapshotBidFrete,
  role: UserRoleBidFrete = 'default',
  prev?: KpiSnapshotBidFrete | null,
): GabiInsightBidFreteResposta[] {
  const scored = buildCandidates(kpis, prev, role)
    .map(ins => ({
      ...ins,
      score: ins.score * (ins.variante === 'warn' ? 1.1 : 1),
    }))
    .sort((a, b) => b.score - a.score)

  const MIN = 2
  const MAX = 8
  let result = scored.slice(0, MAX)

  if (result.length === 0) {
    result = [{
      ...FALLBACK_INSIGHTS[0]!,
      stat: { label: 'Período', valor: kpis.period },
      textoLink: 'Ver cotações',
      rota: '/bid-frete/lista',
    }]
  }

  if (result.length < MIN) {
    const extras = FALLBACK_INSIGHTS
      .filter(f => !result.find(r => r.id === f.id))
      .slice(0, MIN - result.length)
    result = [...result, ...extras]
  }

  return result.map(({ score: _score, ...rest }) => rest)
}
