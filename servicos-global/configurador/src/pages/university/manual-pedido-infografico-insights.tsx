import React from 'react'
import {
  Bell,
  ChartBar,
  ChartPie,
  CurrencyDollar,
  Funnel,
  Gauge,
  Globe,
  ListBullets,
  SquaresFour,
  ThumbsUp,
  Trophy,
  type Icon,
} from '@phosphor-icons/react'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

type BlocoInsightPedido = {
  num: number
  rotulo: string
  descricao: string
  icone: Icon
  cor: string
  borda: string
  fundo: string
}

const BLOCOS_UX10: BlocoInsightPedido[] = [
  { num: 1, rotulo: 'KPIs do topo', descricao: 'Quatro cards fixos por **status** configurável (ex.: rascunho, aberto, em andamento, consolidado), com contagem, tendência e valor agregado.', icone: SquaresFour, cor: '#f59e0b', borda: 'rgba(245,158,11,.28)', fundo: 'rgba(245,158,11,.08)' },
  { num: 2, rotulo: 'Mapa global', descricao: 'Globo ou mapa plano com **rotas** importação/exportação, pins clicáveis, zoom e painel **Live Feed** (origens, destinos e modais).', icone: Globe, cor: '#fbbf24', borda: 'rgba(251,191,36,.28)', fundo: 'rgba(251,191,36,.08)' },
  { num: 3, rotulo: 'Alertas do dia', descricao: 'Cards de atenção (prazos, pendências, aprovações) com contagem. Clique abre modal com a **lista de pedidos** do alerta.', icone: Bell, cor: '#f87171', borda: 'rgba(248,113,113,.28)', fundo: 'rgba(248,113,113,.08)' },
  { num: 4, rotulo: 'Funil por status', descricao: 'Barras horizontais mostram a distribuição dos pedidos **ativos** em cada status do workspace.', icone: Funnel, cor: '#818cf8', borda: 'rgba(129,140,248,.28)', fundo: 'rgba(99,102,241,.08)' },
  { num: 5, rotulo: 'Evolução mensal', descricao: 'Gráfico de barras por mês: pedidos **aprovados**, **em andamento** e **recusados** no período.', icone: ChartBar, cor: '#3b82f6', borda: 'rgba(59,130,246,.28)', fundo: 'rgba(59,130,246,.08)' },
  { num: 6, rotulo: 'Tipo de operação', descricao: 'Donut com a divisão **importação × exportação** e legenda com contagem e percentual.', icone: ChartPie, cor: '#34d399', borda: 'rgba(52,211,153,.28)', fundo: 'rgba(52,211,153,.08)' },
  { num: 7, rotulo: 'Moedas dos pedidos', descricao: 'Lista das moedas usadas nos POs, quantidade de pedidos por código e **participação percentual**.', icone: CurrencyDollar, cor: '#fbbf24', borda: 'rgba(251,191,36,.28)', fundo: 'rgba(251,191,36,.08)' },
  { num: 8, rotulo: 'Maior pedido', descricao: 'Destaque do PO de **maior valor** do workspace, com número, moeda e valor formatado.', icone: Trophy, cor: '#f59e0b', borda: 'rgba(245,158,11,.28)', fundo: 'rgba(245,158,11,.08)' },
  { num: 9, rotulo: 'Top Incoterms', descricao: 'Ranking dos **Incoterms** mais usados, com barra de progresso e percentual por termo.', icone: ListBullets, cor: '#a78bfa', borda: 'rgba(167,139,250,.28)', fundo: 'rgba(139,92,246,.08)' },
  { num: 10, rotulo: 'Taxa de aprovação', descricao: 'Donut de prazos: pedidos **em tempo**, **atrasados** e **sem resposta** no fluxo de aprovação.', icone: ThumbsUp, cor: '#34d399', borda: 'rgba(52,211,153,.28)', fundo: 'rgba(52,211,153,.08)' },
]

function CardBlocoInsightPedido({ bloco }: { bloco: BlocoInsightPedido }) {
  const Icone = bloco.icone
  return (
    <div style={{ borderRadius: 12, padding: '12px 14px', background: bloco.fundo, border: `1px solid ${bloco.borda}`, height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(8,12,24,.35)', border: `1px solid ${bloco.borda}` }}>
          <Icone size={17} weight="duotone" color={bloco.cor} />
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 800, fontSize: '.76rem', color: '#e2e8f0', lineHeight: 1.35 }}>
            <span style={{ color: '#818cf8', marginRight: 6, fontSize: '.68rem' }}>{String(bloco.num).padStart(2, '0')}</span>
            {bloco.rotulo}
          </p>
          <p style={{ margin: '6px 0 0', fontSize: '.72rem', lineHeight: 1.5, color: CORPO_70 }}>
            {bloco.descricao.split('**').map((parte, i) => i % 2 === 1 ? <strong key={i} style={{ color: '#cbd5e1', fontWeight: 700 }}>{parte}</strong> : parte)}
          </p>
        </div>
      </div>
    </div>
  )
}

export function ManualInfograficoPedidoInsights() {
  return (
    <div style={{ background: 'linear-gradient(165deg, rgba(245,158,11,.06) 0%, rgba(148,163,184,.04) 48%, rgba(129,140,248,.05) 100%)', border: '1px solid rgba(148,163,184,.16)', borderRadius: 14, padding: '18px 18px 16px', marginTop: 20 }}>
      <p style={{ fontSize: '.68rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#94a3b8', margin: '0 0 6px' }}>Mapa das métricas · UX 10</p>
      <p style={{ margin: '0 0 16px', fontSize: '.82rem', fontWeight: 700, color: '#e2e8f0' }}>O que cada bloco da tela Insights mostra</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
        {BLOCOS_UX10.map((bloco) => <CardBlocoInsightPedido key={bloco.num} bloco={bloco} />)}
      </div>
    </div>
  )
}
