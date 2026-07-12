import React from 'react'
import {
  CheckCircle,
  FileText,
  Globe,
  ListBullets,
  MapPin,
  Sparkle,
  type Icon,
} from '@phosphor-icons/react'
import { ManualInfograficoRichText } from './manual-infografico-rich-text'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

export type ManualPilarMapaBidFreteId = '01' | '02' | '03' | '04'

type PilarMapaBidFrete = {
  num: ManualPilarMapaBidFreteId
  rotulo: string
  descricao: string
  icone: Icon
  cor: string
  borda: string
  fundo: string
}

export const MANUAL_PILARES_MAPA_BID_FRETE: Record<
  ManualPilarMapaBidFreteId,
  { icone: Icon; cor: string; borda: string; fundo: string }
> = {
  '01': { icone: MapPin, cor: '#f87171', borda: 'rgba(248,113,113,.32)', fundo: 'rgba(239,68,68,.08)' },
  '02': { icone: ListBullets, cor: '#34d399', borda: 'rgba(52,211,153,.32)', fundo: 'rgba(52,211,153,.08)' },
  '03': { icone: FileText, cor: '#60a5fa', borda: 'rgba(96,165,250,.32)', fundo: 'rgba(96,165,250,.08)' },
  '04': { icone: CheckCircle, cor: '#a78bfa', borda: 'rgba(167,139,250,.32)', fundo: 'rgba(139,92,246,.08)' },
}

const PILARES: PilarMapaBidFrete[] = [
  {
    num: '01',
    rotulo: 'Selecionar rota no mapa',
    descricao: 'Selecione uma **rota** ou pin{{icone:pin-mapa-bid-frete}} e abra as **cotações** do trecho em tempo real.',
    icone: MapPin,
    cor: '#f87171',
    borda: 'rgba(248,113,113,.32)',
    fundo: 'rgba(239,68,68,.08)',
  },
  {
    num: '02',
    rotulo: 'Modal de cotações e visão geral',
    descricao: 'Consulte **status**, **melhor proposta** e atalhos de cada cotação vinculada à rota selecionada.',
    icone: ListBullets,
    cor: '#34d399',
    borda: 'rgba(52,211,153,.32)',
    fundo: 'rgba(52,211,153,.08)',
  },
  {
    num: '03',
    rotulo: 'Detalhamento no modal',
    descricao: 'Compare a **melhor oferta** no resumo expandido e avance para a **cotação completa** quando precisar.',
    icone: FileText,
    cor: '#60a5fa',
    borda: 'rgba(96,165,250,.32)',
    fundo: 'rgba(96,165,250,.08)',
  },
  {
    num: '04',
    rotulo: 'Lista e ações no modal',
    descricao: 'Gerencie aprovações, recusas e navegação sem sair da tela **Insights**.',
    icone: CheckCircle,
    cor: '#a78bfa',
    borda: 'rgba(167,139,250,.32)',
    fundo: 'rgba(139,92,246,.08)',
  },
]

function renderizarNegrito(texto: string) {
  return <ManualInfograficoRichText texto={texto} />
}

function CardPilar({ pilar }: { pilar: PilarMapaBidFrete }) {
  const Icone = pilar.icone
  return (
    <div style={{
      borderRadius: 12,
      padding: '14px 14px 13px',
      background: pilar.fundo,
      border: `1px solid ${pilar.borda}`,
      height: '100%',
      display: 'flex',
      gap: 12,
      alignItems: 'flex-start',
    }}>
      <div style={{
        flexShrink: 0,
        width: 34,
        height: 34,
        borderRadius: 9,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(8,12,24,.35)',
        border: `1px solid ${pilar.borda}`,
      }}>
        <Icone size={18} weight="duotone" color={pilar.cor} />
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{
          margin: 0,
          fontSize: '.68rem',
          fontWeight: 800,
          letterSpacing: '.06em',
          color: pilar.cor,
        }}>
          {pilar.num}
        </p>
        <p style={{
          margin: '4px 0 0',
          fontSize: '.78rem',
          fontWeight: 800,
          color: '#e2e8f0',
          lineHeight: 1.35,
        }}>
          {pilar.rotulo}
        </p>
        <p style={{
          margin: '7px 0 0',
          fontSize: '.72rem',
          lineHeight: 1.5,
          color: CORPO_70,
        }}>
          {renderizarNegrito(pilar.descricao)}
        </p>
      </div>
    </div>
  )
}

export function ManualPilaresMapaBidFreteChips({ pilares }: { pilares: ManualPilarMapaBidFreteId[] }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: 6,
        flexShrink: 0,
        paddingTop: 2,
      }}
      aria-label={`Assuntos ${pilares.join(' e ')} do mapa global`}
    >
      {pilares.map((num) => {
        const pilar = MANUAL_PILARES_MAPA_BID_FRETE[num]
        const Icone = pilar.icone
        return (
          <div
            key={num}
            title={`Assunto ${num}`}
            style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              border: `1px solid ${pilar.borda}`,
              background: pilar.fundo,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 800, color: pilar.cor, lineHeight: 1, letterSpacing: '.04em' }}>
              {num}
            </span>
            <Icone size={13} weight="duotone" color={pilar.cor} aria-hidden />
          </div>
        )
      })}
    </div>
  )
}

/** Manual BID Frete §05 Insights — seleção de rota no mapa global */
export function ManualInfograficoBidFreteMapa() {
  return (
    <div style={{
      background: 'linear-gradient(165deg, rgba(251,191,36,.09) 0%, rgba(148,163,184,.04) 42%, rgba(129,140,248,.05) 100%)',
      border: '1px solid rgba(148,163,184,.18)',
      borderRadius: 14,
      padding: '18px 18px 16px',
      marginTop: 20,
      boxShadow: '0 10px 36px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.04)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 14,
        marginBottom: 16,
        flexWrap: 'wrap',
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Globe size={18} weight="duotone" color="#fbbf24" />
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: '.62rem',
              fontWeight: 800,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              color: '#fde68a',
              background: 'rgba(251,191,36,.12)',
              border: '1px solid rgba(251,191,36,.32)',
              borderRadius: 999,
              padding: '4px 10px',
            }}>
              <Sparkle size={12} weight="fill" />
              Mapa operacional · seleção de rota
            </span>
          </div>
          <p style={{
            margin: 0,
            fontSize: '.9rem',
            fontWeight: 800,
            color: '#f1f5f9',
            lineHeight: 1.35,
            letterSpacing: '-.01em',
          }}>
            <ManualInfograficoRichText texto="Selecione a **rota** para abrir o Painel da Cotação" />
          </p>
          <p style={{
            margin: '8px 0 0',
            fontSize: '.74rem',
            lineHeight: 1.5,
            color: CORPO_70,
          }}>
            <ManualInfograficoRichText texto="Clique em uma **rota** ou pin{{icone:pin-mapa-bid-frete}} para destacar o trecho e abrir as **cotações vinculadas**." />
          </p>
        </div>
      </div>

      <div style={{
        borderRadius: 10,
        padding: '10px 12px',
        background: 'rgba(8,12,24,.25)',
        border: '1px solid rgba(148,163,184,.12)',
        fontSize: '.68rem',
        lineHeight: 1.5,
        color: CORPO_70,
      }}>
        <p style={{ margin: 0, fontWeight: 800, color: '#fde68a', fontSize: '.72rem', lineHeight: 1.4 }}>
          Selecionar rota = ponto de partida do Painel da Cotação
        </p>
        <p style={{ margin: '6px 0 0' }}>
          <ManualInfograficoRichText texto="O fluxo completo do painel está no capítulo **Painel da cotação**." />
        </p>
      </div>
    </div>
  )
}
