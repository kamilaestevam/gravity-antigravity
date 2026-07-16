import React from 'react'
import {
  Bell,
  ChartBar,
  ChartPie,
  CurrencyDollar,
  Funnel,
  Globe,
  ListBullets,
  SquaresFour,
  ThumbsUp,
  Trophy,
  type Icon,
} from '@phosphor-icons/react'
import { ManualInfograficoRichText } from './manual-infografico-rich-text'
import {
  MANUAL_ESPACO_GRADE_GALERIA_PX,
  MANUAL_TITULO_INFOGRAFICO_ESTILO,
} from './manual-tipografia'

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
  {
    num: 1,
    rotulo: 'KPIs do topo',
    descricao: 'Quatro cards por **status** do workspace: contagem, tendência e valor agregado.',
    icone: SquaresFour,
    cor: '#f59e0b',
    borda: 'rgba(245,158,11,.28)',
    fundo: 'rgba(245,158,11,.08)',
  },
  {
    num: 2,
    rotulo: 'Mapa global',
    descricao:
      '**Trilhos**, pins{{icone:pin-mapa-pedido}} e **Rankings Globais** em globo ou mapa plano.',
    icone: Globe,
    cor: '#fbbf24',
    borda: 'rgba(251,191,36,.28)',
    fundo: 'rgba(251,191,36,.08)',
  },
  {
    num: 3,
    rotulo: 'Alertas do dia',
    descricao: 'Prazos, pendências e aprovações com contagem. Clique abre a **lista de pedidos**.',
    icone: Bell,
    cor: '#f87171',
    borda: 'rgba(248,113,113,.28)',
    fundo: 'rgba(248,113,113,.08)',
  },
  {
    num: 4,
    rotulo: 'Funil por status',
    descricao: 'Barras horizontais com a distribuição dos pedidos **ativos** por status.',
    icone: Funnel,
    cor: '#818cf8',
    borda: 'rgba(129,140,248,.28)',
    fundo: 'rgba(99,102,241,.08)',
  },
  {
    num: 5,
    rotulo: 'Evolução mensal',
    descricao: 'Barras mensais: pedidos **aprovados**, **em andamento** e **recusados**.',
    icone: ChartBar,
    cor: '#3b82f6',
    borda: 'rgba(59,130,246,.28)',
    fundo: 'rgba(59,130,246,.08)',
  },
  {
    num: 6,
    rotulo: 'Tipo de operação',
    descricao: 'Donut **importação × exportação** com contagem e percentual na legenda.',
    icone: ChartPie,
    cor: '#34d399',
    borda: 'rgba(52,211,153,.28)',
    fundo: 'rgba(52,211,153,.08)',
  },
  {
    num: 7,
    rotulo: 'Moedas dos pedidos',
    descricao: 'Moedas dos POs com quantidade por código e **participação percentual**.',
    icone: CurrencyDollar,
    cor: '#fbbf24',
    borda: 'rgba(251,191,36,.28)',
    fundo: 'rgba(251,191,36,.08)',
  },
  {
    num: 8,
    rotulo: 'Maior pedido',
    descricao: 'PO de **maior valor** do workspace: número, moeda e valor formatado.',
    icone: Trophy,
    cor: '#f59e0b',
    borda: 'rgba(245,158,11,.28)',
    fundo: 'rgba(245,158,11,.08)',
  },
  {
    num: 9,
    rotulo: 'Top Incoterms',
    descricao: 'Ranking dos **Incoterms** mais usados, com barra e percentual por termo.',
    icone: ListBullets,
    cor: '#a78bfa',
    borda: 'rgba(167,139,250,.28)',
    fundo: 'rgba(139,92,246,.08)',
  },
  {
    num: 10,
    rotulo: 'Taxa de aprovação',
    descricao: 'Donut de prazos: pedidos **em tempo**, **atrasados** e **sem resposta**.',
    icone: ThumbsUp,
    cor: '#34d399',
    borda: 'rgba(52,211,153,.28)',
    fundo: 'rgba(52,211,153,.08)',
  },
]

const GRID_UX10_COLUNAS = 'repeat(3, minmax(0, 1fr))'

function CardBlocoInsightPedido({ bloco, compacto = true }: { bloco: BlocoInsightPedido; compacto?: boolean }) {
  const Icone = bloco.icone
  return (
    <div
      style={{
        borderRadius: 12,
        padding: '14px 14px 13px',
        background: bloco.fundo,
        border: `1px solid ${bloco.borda}`,
        boxSizing: 'border-box',
        height: compacto ? '100%' : undefined,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            flexShrink: 0,
            width: 34,
            height: 34,
            borderRadius: 9,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(8,12,24,.35)',
            border: `1px solid ${bloco.borda}`,
          }}
        >
          <Icone size={18} weight="duotone" color={bloco.cor} />
        </div>
        <p style={{ margin: 0, fontWeight: 800, fontSize: '.78rem', color: '#e2e8f0', lineHeight: 1.35 }}>
          <span style={{ color: '#818cf8', marginRight: 6, fontSize: '.7rem' }}>
            {String(bloco.num).padStart(2, '0')}
          </span>
          {bloco.rotulo}
        </p>
      </div>
      <p
        style={{
          margin: 0,
          fontSize: '.73rem',
          lineHeight: 1.45,
          color: CORPO_70,
          flex: compacto ? 1 : undefined,
          ...(compacto
            ? {
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }
            : {}),
        }}
      >
        <ManualInfograficoRichText texto={bloco.descricao} />
      </p>
    </div>
  )
}

export function blocoInsightPedidoPorNum(num: number): BlocoInsightPedido | undefined {
  return BLOCOS_UX10.find(bloco => bloco.num === num)
}

export { CardBlocoInsightPedido }

export function ManualInfograficoPedidoInsights() {
  return (
    <div
      style={{
        background:
          'linear-gradient(165deg, rgba(245,158,11,.06) 0%, rgba(148,163,184,.04) 48%, rgba(129,140,248,.05) 100%)',
        border: '1px solid rgba(148,163,184,.16)',
        borderRadius: 14,
        padding: '16px 18px 18px',
      }}
    >
      <p style={MANUAL_TITULO_INFOGRAFICO_ESTILO}>
        Mapa de métricas
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: GRID_UX10_COLUNAS,
          gap: MANUAL_ESPACO_GRADE_GALERIA_PX,
          alignItems: 'stretch',
        }}
      >
        {BLOCOS_UX10.map(bloco => (
          <CardBlocoInsightPedido key={bloco.num} bloco={bloco} />
        ))}
      </div>
    </div>
  )
}
