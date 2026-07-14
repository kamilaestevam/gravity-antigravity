import React from 'react'
import {
  SquaresFour,
  PuzzlePiece,
  ChartLineUp,
  ShoppingBag,
  Sparkle,
  ArrowDown,
} from '@phosphor-icons/react'
import { AcademyLinkGuia } from './guia-academy-link'
import { MANUAL_TITULO_INFOGRAFICO_ESTILO } from './manual-tipografia'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'
const LINK_STYLE: React.CSSProperties = {
  color: '#818cf8',
  textDecoration: 'underline',
  textUnderlineOffset: 2,
}

const RAMOS = [
  {
    icone: PuzzlePiece,
    cor: '#34d399',
    borda: 'rgba(52,211,153,.25)',
    fundo: 'rgba(52,211,153,.08)',
    titulo: 'Seus Produtos Gravity',
    descricao: 'Clique no ícone para abrir o produto',
  },
  {
    icone: ChartLineUp,
    cor: '#60a5fa',
    borda: 'rgba(96,165,250,.25)',
    fundo: 'rgba(96,165,250,.08)',
    titulo: 'Aguardando ação',
    descricao: 'Resumos e pendências do seu dia',
  },
  {
    icone: ShoppingBag,
    cor: '#fbbf24',
    borda: 'rgba(251,191,36,.25)',
    fundo: 'rgba(251,191,36,.08)',
    titulo: 'Gravity Store',
    descricao: 'Descubra e contrate novos produtos',
    href: '/university-gravity/docs/store',
  },
  {
    icone: Sparkle,
    cor: '#c084fc',
    borda: 'rgba(192,132,252,.25)',
    fundo: 'rgba(192,132,252,.08)',
    titulo: 'Gabi Insights',
    descricao: 'Dicas e insights sobre a operação',
  },
] as const

/** Mapa mental reduzido — seção 01 do manual Hub */
export function ManualInfograficoHubTelas() {
  return (
    <div style={{
      background: 'rgba(148,163,184,.04)',
      border: '1px solid rgba(148,163,184,.14)',
      borderRadius: 14,
      padding: '16px 18px 18px',
    }}>
      <p style={MANUAL_TITULO_INFOGRAFICO_ESTILO}>
        Mapa mental — o que você encontra no Hub
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{
          borderRadius: 12,
          padding: '10px 18px',
          textAlign: 'center',
          background: 'rgba(99,102,241,.12)',
          border: '1px solid rgba(129,140,248,.35)',
          color: '#e0e7ff',
          fontWeight: 800,
          fontSize: '.8rem',
          minWidth: 200,
        }}>
          <SquaresFour size={18} weight="duotone" style={{ marginBottom: 4, color: '#818cf8' }} />
          <div>Hub — tela principal</div>
          <div style={{ fontSize: '.65rem', fontWeight: 500, opacity: .85, marginTop: 2 }}>
            Painel central: produtos, Store e Gabi Insights
          </div>
        </div>

        <ArrowDown size={16} weight="bold" color="#64748b" />

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 10,
          width: '100%',
        }}>
          {RAMOS.map((ramo) => {
            const Icone = ramo.icone
            const titulo = 'href' in ramo && ramo.href
              ? <AcademyLinkGuia href={ramo.href} rotulo={ramo.titulo} />
              : ramo.titulo
            return (
              <div
                key={ramo.titulo}
                style={{
                  borderRadius: 10,
                  padding: '10px 12px',
                  background: ramo.fundo,
                  border: `1px solid ${ramo.borda}`,
                  textAlign: 'center',
                }}
              >
                <Icone size={15} weight="duotone" style={{ marginBottom: 4, color: ramo.cor }} />
                <div style={{ fontWeight: 700, fontSize: '.72rem', color: '#e2e8f0', lineHeight: 1.3 }}>
                  {titulo}
                </div>
                <div style={{ fontSize: '.64rem', color: CORPO_70, marginTop: 4, lineHeight: 1.4 }}>
                  {ramo.descricao}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
