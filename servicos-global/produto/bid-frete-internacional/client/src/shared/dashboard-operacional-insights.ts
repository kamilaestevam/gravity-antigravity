import type { DashboardKpis, GabiInsightItem } from './api'

const fmtNum = (n: number) => new Intl.NumberFormat('pt-BR').format(Math.round(n))
const fmtUSD = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
const fmtPct = (n: number) => `${n.toFixed(1)}%`

export function buildClientInsightsOperacional(kpis: DashboardKpis, prev?: DashboardKpis | null): GabiInsightItem[] {
  const items: GabiInsightItem[] = []

  const rascunhosCount = Number(kpis.cotacoes_status?.['RASCUNHO'] ?? 0)
  if (rascunhosCount > 0) {
    items.push({
      id: 'rascunhos_ativos',
      variante: 'warn',
      tag: 'Atenção · Rascunhos Pendentes',
      texto: `${rascunhosCount} cotação${rascunhosCount > 1 ? 's' : ''} em rascunho. Finalize e envie para negociação de frete.`,
      stat: { label: 'Em rascunho', valor: fmtNum(rascunhosCount) },
      textoLink: 'Ver cotações',
      rota: '/bid-frete/lista',
    })
  }

  if (kpis.cotacoes_andamento > 0) {
    items.push({
      id: 'cotacoes_andamento',
      variante: 'default',
      tag: 'Operacional · Em Cotação',
      texto: `${kpis.cotacoes_andamento} rodada${kpis.cotacoes_andamento > 1 ? 's' : ''} de cotação de frete ativa${kpis.cotacoes_andamento > 1 ? 's' : ''} no mercado.`,
      stat: kpis.valor_andamento_usd > 0
        ? { label: 'Valor em cotação', valor: fmtUSD(kpis.valor_andamento_usd) }
        : { label: 'Cotações ativas', valor: fmtNum(kpis.cotacoes_andamento) },
      textoLink: 'Acompanhar BIDs',
      rota: '/bid-frete/lista',
    })
  }

  if (kpis.saving_total > 0) {
    items.push({
      id: 'saving_total',
      variante: 'default',
      tag: 'Financeiro · Saving Acumulado',
      texto: `Economia gerada (saving) nas negociações de frete acumulada em ${fmtUSD(kpis.saving_total)}.`,
      stat: kpis.ganho_percentual_ganho_bid_frete_internacional > 0
        ? { label: 'Redução média', valor: fmtPct(kpis.ganho_percentual_ganho_bid_frete_internacional) }
        : { label: 'Total economizado', valor: fmtUSD(kpis.saving_total) },
      textoLink: 'Ver comparativos',
    })
  }

  if (kpis.valor_aprovado_usd > 0) {
    items.push({
      id: 'valor_aprovado',
      variante: 'default',
      tag: 'Financeiro · Adjudicado',
      texto: `Adjudicação de frete internacional totaliza ${fmtUSD(kpis.valor_aprovado_usd)} em propostas aprovadas.`,
      stat: kpis.valor_medio_ganho_bid_frete_internacional > 0
        ? { label: 'Ticket médio ganho', valor: fmtUSD(kpis.valor_medio_ganho_bid_frete_internacional) }
        : undefined,
      textoLink: 'Ver adjudicadas',
    })
  }

  if (prev && prev.cotacoes_passadas > 0 && kpis.cotacoes_passadas > 0) {
    const delta = kpis.cotacoes_passadas - prev.cotacoes_passadas
    const pct = Math.abs((delta / prev.cotacoes_passadas) * 100)
    if (Math.abs(delta) > 0) {
      const crescendo = delta > 0
      items.push({
        id: 'tendencia_volume',
        variante: 'default',
        tag: 'Tendência · BIDs Fechados',
        texto: `Volume de cotações adjudicadas ${crescendo ? 'cresceu' : 'caiu'} ${fmtPct(pct)} em relação ao período anterior.`,
        stat: { label: 'Período anterior', valor: fmtNum(prev.cotacoes_passadas) },
        textoLink: 'Explorar dados',
      })
    }
  }

  if (items.length === 0) {
    items.push({
      id: 'status_ok',
      variante: 'default',
      tag: 'Gabi AI · Tudo em dia',
      texto: 'Nenhuma pendência crítica ou anomalia operacional identificada no período selecionado.',
      stat: { label: 'Período', valor: kpis.period ?? '30d' },
      textoLink: 'Ver cotações',
      rota: '/bid-frete/lista',
    })
  }

  return items
}
