import React from 'react'
import {
  Article,
  Database,
  SlidersHorizontal,
  type Icon,
} from '@phosphor-icons/react'
import { MANUAL_TITULO_INFOGRAFICO_ESTILO } from './manual-tipografia'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

type CardExplicacao = {
  titulo: string
  paragrafos: string[]
  icone: Icon
  cor: string
  borda: string
  fundo: string
}

const CARDS: CardExplicacao[] = [
  {
    titulo: 'O que entra',
    paragrafos: [
      'A Gabi cruza indicadores de **Pedido**, **BID Frete**, **BID Câmbio**, **Simula Custo**, **LPCO**, **NF de Importação** e demais produtos **ativos** no seu workspace.',
    ],
    icone: Database,
    cor: '#c084fc',
    borda: 'rgba(192,132,252,.28)',
    fundo: 'rgba(192,132,252,.08)',
  },
  {
    titulo: 'Como navegar',
    paragrafos: [
      'Até **três cards** por página. Rotação automática **a cada 5 segundos**, passe o mouse para pausar. Use **setas** e **bolinhas** para mudar de página. O selo **AO VIVO** indica conteúdo atualizado.',
    ],
    icone: SlidersHorizontal,
    cor: '#60a5fa',
    borda: 'rgba(96,165,250,.28)',
    fundo: 'rgba(96,165,250,.08)',
  },
  {
    titulo: 'Como ler um card',
    paragrafos: [
      'Cada card traz o **produto de origem** (ex.: PEDIDO · Atrasos), a **mensagem** em linguagem clara, um **número de apoio** quando couber e um **atalho** para agir (ex.: Corrigir agora).',
      'Destaque **âmbar** = **pendência**. Demais cores = oportunidade ou dica de uso da plataforma.',
    ],
    icone: Article,
    cor: '#fbbf24',
    borda: 'rgba(251,191,36,.28)',
    fundo: 'rgba(251,191,36,.08)',
  },
]

function TextoRich({ texto }: { texto: string }) {
  return (
    <>
      {texto.split('**').map((parte, i) =>
        i % 2 === 1
          ? <strong key={i} style={{ color: '#cbd5e1', fontWeight: 700 }}>{parte}</strong>
          : parte,
      )}
    </>
  )
}

function CardExplicacaoGabi({ card }: { card: CardExplicacao }) {
  const Icone = card.icone
  return (
    <div style={{
      borderRadius: 12,
      padding: '14px 14px 12px',
      background: card.fundo,
      border: `1px solid ${card.borda}`,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{
          flexShrink: 0,
          width: 32,
          height: 32,
          borderRadius: 9,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(8,12,24,.35)',
          border: `1px solid ${card.borda}`,
        }}>
          <Icone size={17} weight="duotone" color={card.cor} />
        </div>
        <p style={{
          margin: 0,
          fontWeight: 800,
          fontSize: '.8rem',
          color: '#e2e8f0',
          lineHeight: 1.35,
        }}>
          {card.titulo}
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {card.paragrafos.map((paragrafo) => (
          <p
            key={paragrafo.slice(0, 24)}
            style={{
              margin: 0,
              fontSize: '.74rem',
              lineHeight: 1.55,
              color: CORPO_70,
            }}
          >
            <TextoRich texto={paragrafo} />
          </p>
        ))}
      </div>
    </div>
  )
}

/** Manual Hub § Gabi Insights — cards explicativos (O que entra, navegação, leitura). */
export function ManualInfograficoHubGabiInsightsExplicacoes() {
  return (
    <div style={{
      background: 'linear-gradient(165deg, rgba(192,132,252,.07) 0%, rgba(148,163,184,.04) 48%, rgba(96,165,250,.05) 100%)',
      border: '1px solid rgba(148,163,184,.16)',
      borderRadius: 14,
      padding: '16px 16px 14px',
    }}>
      <p style={MANUAL_TITULO_INFOGRAFICO_ESTILO}>
        Como usar o painel
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 12,
      }}>
        {CARDS.map((card) => (
          <CardExplicacaoGabi key={card.titulo} card={card} />
        ))}
      </div>
    </div>
  )
}
