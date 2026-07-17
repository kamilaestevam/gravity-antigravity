import React from 'react'
import {
  ChartBar,
  ChartPie,
  CurrencyDollar,
  Files,
  SquaresFour,
  UsersThree,
  type Icon,
} from '@phosphor-icons/react'
import { ManualInfograficoRichText } from './manual-infografico-rich-text'
import {
  MANUAL_ESPACO_GRADE_GALERIA_PX,
  MANUAL_TITULO_INFOGRAFICO_ESTILO,
} from './manual-tipografia'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

type BlocoInsightSmartDocs = {
  num: number
  rotulo: string
  descricao: string
  icone: Icon
  cor: string
  borda: string
  fundo: string
}

const BLOCOS: BlocoInsightSmartDocs[] = [
  {
    num: 1,
    rotulo: 'KPIs do topo',
    descricao:
      'Quatro cards: **documentos lidos**, **campos lidos**, **saving digitação** e **saving em erros** do workspace.',
    icone: SquaresFour,
    cor: '#818cf8',
    borda: 'rgba(129,140,248,.28)',
    fundo: 'rgba(99,102,241,.08)',
  },
  {
    num: 2,
    rotulo: 'Evolução diária',
    descricao:
      'Barras por dia: verde = acertos, vermelho = erros editados. Filtros de **7**, **30**, **60** ou **90** dias.',
    icone: ChartBar,
    cor: '#3b82f6',
    borda: 'rgba(59,130,246,.28)',
    fundo: 'rgba(59,130,246,.08)',
  },
  {
    num: 3,
    rotulo: 'Campos corretos × errados',
    descricao:
      'Donut e taxa de acerto. **Acerto** = campo não editado na conferência; **erro** = campo alterado.',
    icone: ChartPie,
    cor: '#34d399',
    borda: 'rgba(52,211,153,.28)',
    fundo: 'rgba(52,211,153,.08)',
  },
  {
    num: 4,
    rotulo: 'Tipos de documento',
    descricao:
      'Barras horizontais com volume e **%** por tipo (Invoice, BL, AWB, etc.) na amostra.',
    icone: Files,
    cor: '#a78bfa',
    borda: 'rgba(167,139,250,.28)',
    fundo: 'rgba(139,92,246,.08)',
  },
  {
    num: 5,
    rotulo: 'Economia estimada',
    descricao:
      'Detalha digitação evitada e correção de erros. **Base de cálculo →** abre a metodologia na tela.',
    icone: CurrencyDollar,
    cor: '#fbbf24',
    borda: 'rgba(251,191,36,.28)',
    fundo: 'rgba(251,191,36,.08)',
  },
  {
    num: 6,
    rotulo: 'Ranking por emissor',
    descricao:
      'Top 5 de acertos e erros por **tipo de fornecedor** (exportador, agente de carga, etc.).',
    icone: UsersThree,
    cor: '#f59e0b',
    borda: 'rgba(245,158,11,.28)',
    fundo: 'rgba(245,158,11,.08)',
  },
]

const GRID_COLUNAS = 'repeat(3, minmax(0, 1fr))'

function CardBlocoInsightSmartDocs({
  bloco,
  compacto = true,
}: {
  bloco: BlocoInsightSmartDocs
  compacto?: boolean
}) {
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

export function blocoInsightSmartDocsPorNum(num: number): BlocoInsightSmartDocs | undefined {
  return BLOCOS.find(bloco => bloco.num === num)
}

export { CardBlocoInsightSmartDocs }

/** Manual Smart Docs § Insights — mapa das métricas da tela (paridade Pedido § Insights). */
export function ManualInfograficoSmartDocsInsights() {
  return (
    <div
      style={{
        background:
          'linear-gradient(165deg, rgba(99,102,241,.06) 0%, rgba(148,163,184,.04) 48%, rgba(52,211,153,.05) 100%)',
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
          gridTemplateColumns: GRID_COLUNAS,
          gap: MANUAL_ESPACO_GRADE_GALERIA_PX,
          alignItems: 'stretch',
        }}
      >
        {BLOCOS.map(bloco => (
          <CardBlocoInsightSmartDocs key={bloco.num} bloco={bloco} />
        ))}
      </div>
    </div>
  )
}
