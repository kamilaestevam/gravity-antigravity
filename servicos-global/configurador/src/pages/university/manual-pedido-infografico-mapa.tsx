import React from 'react'
import {
  ArrowRight,
  CheckCircle,
  Eye,
  Globe,
  ListBullets,
  MapPin,
  Package,
  Sparkle,
  type Icon,
} from '@phosphor-icons/react'
import { ManualInfograficoRichText } from './manual-infografico-rich-text'
import {
  MANUAL_ESPACO_APOS_TITULO_INFOGRAFICO_GUIA_PX,
  MANUAL_ESPACO_PARAGRAFO_PX,
} from './manual-tipografia'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

export type ManualPilarMapaPedidoId = '01' | '02' | '03' | '04'

type PilarMapaPedido = {
  num: ManualPilarMapaPedidoId
  rotulo: string
  descricao: string
  icone: Icon
  cor: string
  borda: string
  fundo: string
}

export const MANUAL_PILARES_MAPA_PEDIDO: Record<
  ManualPilarMapaPedidoId,
  { icone: Icon; cor: string; borda: string; fundo: string }
> = {
  '01': { icone: MapPin, cor: '#f59e0b', borda: 'rgba(245,158,11,.32)', fundo: 'rgba(245,158,11,.08)' },
  '02': { icone: Eye, cor: '#34d399', borda: 'rgba(52,211,153,.32)', fundo: 'rgba(52,211,153,.08)' },
  '03': { icone: ListBullets, cor: '#60a5fa', borda: 'rgba(96,165,250,.32)', fundo: 'rgba(96,165,250,.08)' },
  '04': { icone: CheckCircle, cor: '#a78bfa', borda: 'rgba(167,139,250,.32)', fundo: 'rgba(139,92,246,.08)' },
}

const PILARES: PilarMapaPedido[] = [
  {
    num: '01',
    rotulo: 'Selecionar local no mapa',
    descricao: 'Passe o mouse sobre um **pin**{{icone:pin-mapa-pedido}} para ver o resumo do local (pedidos ativos, valor e participação).',
    icone: MapPin,
    cor: '#f59e0b',
    borda: 'rgba(245,158,11,.32)',
    fundo: 'rgba(245,158,11,.08)',
  },
  {
    num: '02',
    rotulo: 'Clique no pin',
    descricao: 'Clique no **pin** para abrir o **modal de pedidos** vinculados àquele local no mapa.',
    icone: Eye,
    cor: '#34d399',
    borda: 'rgba(52,211,153,.32)',
    fundo: 'rgba(52,211,153,.08)',
  },
  {
    num: '03',
    rotulo: 'Cards de pedido',
    descricao: 'Cada card traz **número do PO**, **status**, **fornecedor**, **valor** e **modal** do pedido.',
    icone: Package,
    cor: '#60a5fa',
    borda: 'rgba(96,165,250,.32)',
    fundo: 'rgba(96,165,250,.08)',
  },
  {
    num: '04',
    rotulo: 'Abrir na Lista',
    descricao: 'Use **Abrir PO-xxx**{{botao:abrir-pedido-lista-pedido}} para ir direto ao pedido na **Lista**, com o drawer aberto.',
    icone: ArrowRight,
    cor: '#a78bfa',
    borda: 'rgba(167,139,250,.32)',
    fundo: 'rgba(139,92,246,.08)',
  },
]

export function ManualPilaresMapaPedidoChips({ pilares }: { pilares: ManualPilarMapaPedidoId[] }) {
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
        const pilar = MANUAL_PILARES_MAPA_PEDIDO[num]
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

/** Manual Pedido § Insights — seleção de local no mapa global */
export function ManualInfograficoPedidoMapa() {
  return (
    <div style={{
      background: 'linear-gradient(165deg, rgba(245,158,11,.09) 0%, rgba(148,163,184,.04) 42%, rgba(129,140,248,.05) 100%)',
      border: '1px solid rgba(148,163,184,.18)',
      borderRadius: 14,
      padding: '16px 18px 18px',
      boxShadow: '0 10px 36px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.04)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: MANUAL_ESPACO_PARAGRAFO_PX,
        marginBottom: MANUAL_ESPACO_APOS_TITULO_INFOGRAFICO_GUIA_PX,
        flexWrap: 'wrap',
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: MANUAL_ESPACO_PARAGRAFO_PX }}>
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
              Mapa operacional · seleção de local
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
            <ManualInfograficoRichText texto="Selecione o **local** para abrir os pedidos do pin" />
          </p>
          <p style={{
            margin: `${MANUAL_ESPACO_PARAGRAFO_PX}px 0 0`,
            fontSize: '.74rem',
            lineHeight: 1.5,
            color: CORPO_70,
          }}>
            <ManualInfograficoRichText texto="Clique em um **pin**{{icone:pin-mapa-pedido}} para destacar o local e abrir o **modal com os POs** vinculados." />
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
          Selecionar pin = ponto de partida do modal de pedidos
        </p>
        <p style={{ margin: `${MANUAL_ESPACO_PARAGRAFO_PX}px 0 0` }}>
          <ManualInfograficoRichText texto="O atalho **Abrir PO-xxx** leva à **Lista** com o pedido em foco. O fluxo completo da Lista está no capítulo **Visão Lista**." />
        </p>
      </div>
    </div>
  )
}
