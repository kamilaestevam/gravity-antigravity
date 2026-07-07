import React, { useLayoutEffect, useRef, useState } from 'react'
import {
  Bell,
  ChartBar,
  ChartPie,
  CurrencyDollar,
  Funnel,
  Globe,
  ListBullets,
  ThumbsUp,
  Trophy,
  Warning,
  type Icon,
} from '@phosphor-icons/react'
import { ManualInfograficoRichText } from './manual-infografico-rich-text'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

type BlocoInsightBidFrete = {
  num: number
  rotulo: string
  descricao: string
  icone: Icon
  cor: string
  borda: string
  fundo: string
}

const BLOCOS_UX10: BlocoInsightBidFrete[] = [
  {
    num: 1,
    rotulo: 'KPIs do topo',
    descricao:
      'Consulte **Aguardando aprovação**, **Aguardando resposta** e **Tempo médio** com volume na moeda e detalhes nos tooltips.',
    icone: Warning,
    cor: '#60a5fa',
    borda: 'rgba(96,165,250,.28)',
    fundo: 'rgba(96,165,250,.08)',
  },
  {
    num: 2,
    rotulo: 'Mapa global',
    descricao:
      'Cruze **rotas** e pins{{icone:pin-mapa-bid-frete}} e filtre pelo **Refinar mapa** para focar operações relevantes.',
    icone: Globe,
    cor: '#fbbf24',
    borda: 'rgba(251,191,36,.28)',
    fundo: 'rgba(251,191,36,.08)',
  },
  {
    num: 3,
    rotulo: 'Alertas do dia',
    descricao:
      'Monitore vencimentos, respostas pendentes, aprovações e novas cotações do dia.',
    icone: Bell,
    cor: '#f87171',
    borda: 'rgba(248,113,113,.28)',
    fundo: 'rgba(248,113,113,.08)',
  },
  {
    num: 4,
    rotulo: 'Funil por status',
    descricao:
      'Distribuição das **cotações ativas** separadas por cada etapa do workspace.',
    icone: Funnel,
    cor: '#818cf8',
    borda: 'rgba(129,140,248,.28)',
    fundo: 'rgba(99,102,241,.08)',
  },
  {
    num: 5,
    rotulo: 'Evolução mensal',
    descricao:
      'Histórico de volume dos últimos seis meses, comparando cotações **aprovadas**, **em andamento** e **recusadas**.',
    icone: ChartBar,
    cor: '#3b82f6',
    borda: 'rgba(59,130,246,.28)',
    fundo: 'rgba(59,130,246,.08)',
  },
  {
    num: 6,
    rotulo: 'Distribuição por modal',
    descricao:
      'Compare volume entre **Marítimo**, **Aéreo** e **Rodoviário**.',
    icone: ChartPie,
    cor: '#34d399',
    borda: 'rgba(52,211,153,.28)',
    fundo: 'rgba(52,211,153,.08)',
  },
  {
    num: 7,
    rotulo: 'Câmbio PTAX',
    descricao:
      'Taxas do **BACEN** (cenário **Atual**, **Histórico** e **Futuro**) e comparativo do **spread médio** aplicado em relação à PTAX.',
    icone: CurrencyDollar,
    cor: '#3b82f6',
    borda: 'rgba(59,130,246,.28)',
    fundo: 'rgba(59,130,246,.08)',
  },
  {
    num: 8,
    rotulo: 'Melhor cotação',
    descricao:
      'Operação com maior saving do mês: rota, transit time e valor economizado em USD.',
    icone: Trophy,
    cor: '#f59e0b',
    borda: 'rgba(245,158,11,.28)',
    fundo: 'rgba(245,158,11,.08)',
  },
  {
    num: 9,
    rotulo: 'Top Incoterms',
    descricao:
      'Ranking e percentual de utilização dos **Incoterms** nas suas cotações.',
    icone: ListBullets,
    cor: '#a78bfa',
    borda: 'rgba(167,139,250,.28)',
    fundo: 'rgba(139,92,246,.08)',
  },
  {
    num: 10,
    rotulo: 'Taxa de aprovação',
    descricao:
      'Desempenho do fluxo de aprovação, categorizando os prazos em **no tempo**, **atrasadas** e **sem resposta**.',
    icone: ThumbsUp,
    cor: '#34d399',
    borda: 'rgba(52,211,153,.28)',
    fundo: 'rgba(52,211,153,.08)',
  },
]

const BLOCOS_UX10_LINHA1 = BLOCOS_UX10.slice(0, 6)
const BLOCOS_UX10_LINHA2 = BLOCOS_UX10.slice(6)

const GRID_UX10_COLUNAS = 'repeat(6, minmax(0, 1fr))'

function CardBlocoInsightBidFrete({ bloco }: { bloco: BlocoInsightBidFrete }) {
  const Icone = bloco.icone
  return (
    <div
      style={{
        borderRadius: 12,
        padding: '12px 14px',
        background: bloco.fundo,
        border: `1px solid ${bloco.borda}`,
        boxSizing: 'border-box',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1 }}>
        <div
          style={{
            flexShrink: 0,
            width: 32,
            height: 32,
            borderRadius: 9,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(8,12,24,.35)',
            border: `1px solid ${bloco.borda}`,
          }}
        >
          <Icone size={17} weight="duotone" color={bloco.cor} />
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 800, fontSize: '.76rem', color: '#e2e8f0', lineHeight: 1.35 }}>
            <span style={{ color: '#818cf8', marginRight: 6, fontSize: '.68rem' }}>
              {String(bloco.num).padStart(2, '0')}
            </span>
            {bloco.rotulo}
          </p>
          <p style={{ margin: '6px 0 0', fontSize: '.72rem', lineHeight: 1.5, color: CORPO_70 }}>
            <ManualInfograficoRichText texto={bloco.descricao} />
          </p>
        </div>
      </div>
    </div>
  )
}

export function ManualInfograficoBidFreteInsights() {
  const linha1Ref = useRef<HTMLDivElement>(null)
  const [alturaLinha1Px, setAlturaLinha1Px] = useState<number | undefined>()

  useLayoutEffect(() => {
    const el = linha1Ref.current
    if (!el) return undefined

    const atualizar = () => setAlturaLinha1Px(el.offsetHeight)
    atualizar()

    const observer = new ResizeObserver(atualizar)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      style={{
        background:
          'linear-gradient(165deg, rgba(96,165,250,.06) 0%, rgba(148,163,184,.04) 48%, rgba(129,140,248,.05) 100%)',
        border: '1px solid rgba(148,163,184,.16)',
        borderRadius: 14,
        padding: '18px 18px 16px',
        marginTop: 20,
      }}
    >
      <p
        style={{
          fontSize: '.68rem',
          fontWeight: 700,
          letterSpacing: '.08em',
          textTransform: 'uppercase',
          color: '#94a3b8',
          margin: '0 0 6px',
        }}
      >
        Mapa de métricas
      </p>
      <p style={{ margin: '0 0 6px', fontSize: '.82rem', fontWeight: 700, color: '#e2e8f0' }}>
        Visão detalhada dos indicadores da tela Insights
      </p>
      <p style={{ margin: '0 0 16px', fontSize: '.72rem', lineHeight: 1.5, color: CORPO_70 }}>
        <ManualInfograficoRichText texto="Consulte cada indicador abaixo e avance nos subtópicos para **tooltips**, **mapa** e **Controle de Exibição do Mapa**." />
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div
          ref={linha1Ref}
          style={{
            display: 'grid',
            gridTemplateColumns: GRID_UX10_COLUNAS,
            gap: 10,
            alignItems: 'stretch',
          }}
        >
          {BLOCOS_UX10_LINHA1.map(bloco => (
            <CardBlocoInsightBidFrete key={bloco.num} bloco={bloco} />
          ))}
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: GRID_UX10_COLUNAS,
            gap: 10,
            alignItems: 'stretch',
            minHeight: alturaLinha1Px,
          }}
        >
          {BLOCOS_UX10_LINHA2.map(bloco => (
            <CardBlocoInsightBidFrete key={bloco.num} bloco={bloco} />
          ))}
        </div>
      </div>
    </div>
  )
}
