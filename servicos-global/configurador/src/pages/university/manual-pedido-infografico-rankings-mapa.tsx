import React from 'react'
import {
  Airplane,
  Funnel,
  Globe,
  List,
  MapPin,
  Sparkle,
  type Icon,
} from '@phosphor-icons/react'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

export type ManualPilarRankingsMapaPedidoId = '01' | '02' | '03'

type PilarRankingsMapaPedido = {
  num: ManualPilarRankingsMapaPedidoId
  rotulo: string
  descricao: string
  icone: Icon
  cor: string
  borda: string
  fundo: string
}

export const MANUAL_PILARES_RANKINGS_MAPA_PEDIDO: Record<
  ManualPilarRankingsMapaPedidoId,
  { icone: Icon; cor: string; borda: string; fundo: string }
> = {
  '01': { icone: Globe, cor: '#60a5fa', borda: 'rgba(96,165,250,.32)', fundo: 'rgba(96,165,250,.08)' },
  '02': { icone: MapPin, cor: '#a78bfa', borda: 'rgba(167,139,250,.32)', fundo: 'rgba(139,92,246,.08)' },
  '03': { icone: Airplane, cor: '#34d399', borda: 'rgba(52,211,153,.32)', fundo: 'rgba(52,211,153,.08)' },
}

const PILARES: PilarRankingsMapaPedido[] = [
  {
    num: '01',
    rotulo: 'Origens',
    descricao: 'Ranking dos **locais de origem** com mais pedidos ativos. Passe o mouse ou clique para destacar o pin no mapa.',
    icone: Globe,
    cor: '#60a5fa',
    borda: 'rgba(96,165,250,.32)',
    fundo: 'rgba(96,165,250,.08)',
  },
  {
    num: '02',
    rotulo: 'Destinos',
    descricao: 'Ranking dos **destinos** com maior volume. O mapa sincroniza o destaque com o pin correspondente.',
    icone: MapPin,
    cor: '#a78bfa',
    borda: 'rgba(167,139,250,.32)',
    fundo: 'rgba(139,92,246,.08)',
  },
  {
    num: '03',
    rotulo: 'Modais',
    descricao: 'Distribuição por **modal de transporte** (marítimo, aéreo, rodoviário). Cruze com origens e destinos para focar o escopo.',
    icone: List,
    cor: '#34d399',
    borda: 'rgba(52,211,153,.32)',
    fundo: 'rgba(52,211,153,.08)',
  },
]

function renderizarNegrito(texto: string) {
  return texto.split('**').map((parte, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: '#cbd5e1', fontWeight: 700 }}>{parte}</strong>
      : parte,
  )
}

function CardPilar({ pilar }: { pilar: PilarRankingsMapaPedido }) {
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

export function ManualPilaresRankingsMapaPedidoChips({ pilares }: { pilares: ManualPilarRankingsMapaPedidoId[] }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: 6,
        flexShrink: 0,
        paddingTop: 2,
      }}
      aria-label={`Assuntos ${pilares.join(' e ')} dos rankings do mapa`}
    >
      {pilares.map((num) => {
        const pilar = MANUAL_PILARES_RANKINGS_MAPA_PEDIDO[num]
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

function RodapeCombinacoesRankingsMapa() {
  const dimensoes: ManualPilarRankingsMapaPedidoId[] = ['01', '02', '03']

  return (
    <div style={{
      borderRadius: 10,
      padding: '12px 14px',
      background: 'rgba(8,12,24,.25)',
      border: '1px solid rgba(148,163,184,.12)',
      fontSize: '.68rem',
      lineHeight: 1.55,
      color: CORPO_70,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
        {dimensoes.map((num, i) => {
          const pilar = MANUAL_PILARES_RANKINGS_MAPA_PEDIDO[num]
          return (
            <React.Fragment key={num}>
              {i > 0 ? (
                <span style={{ color: '#64748b', fontWeight: 800, fontSize: '.7rem' }}>×</span>
              ) : null}
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 22,
                height: 22,
                borderRadius: 6,
                border: `1px solid ${pilar.borda}`,
                background: pilar.fundo,
                color: pilar.cor,
                fontSize: '.62rem',
                fontWeight: 800,
                letterSpacing: '.04em',
              }}>
                {num}
              </span>
            </React.Fragment>
          )
        })}
        <span style={{ color: '#64748b', fontWeight: 800, fontSize: '.75rem', lineHeight: 1, margin: '0 2px' }}>→</span>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '3px 9px',
          borderRadius: 999,
          border: '1px solid rgba(245,158,11,.35)',
          background: 'rgba(245,158,11,.12)',
          color: '#fde68a',
          fontSize: '.62rem',
          fontWeight: 800,
          letterSpacing: '.04em',
          textTransform: 'uppercase',
        }}>
          Mapa atualizado
        </span>
      </div>

      <p style={{ margin: 0 }}>
        Cruze <strong style={{ color: '#cbd5e1' }}>Origens</strong>,{' '}
        <strong style={{ color: '#cbd5e1' }}>Destinos</strong> e <strong style={{ color: '#cbd5e1' }}>Modais</strong>{' '}
        no painel <strong style={{ color: '#cbd5e1' }}>Rankings Globais</strong>. Cada interação destaca pins e trilhos
        no mapa em tempo real.
      </p>
    </div>
  )
}

/** Manual Pedido § Insights — abas do painel Rankings Globais (Live Feed) */
export function ManualInfograficoPedidoRankingsMapa() {
  return (
    <div style={{
      background: 'linear-gradient(165deg, rgba(245,158,11,.09) 0%, rgba(148,163,184,.04) 42%, rgba(129,140,248,.05) 100%)',
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
            <Funnel size={18} weight="duotone" color="#f59e0b" />
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: '.62rem',
              fontWeight: 800,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              color: '#fde68a',
              background: 'rgba(245,158,11,.12)',
              border: '1px solid rgba(245,158,11,.32)',
              borderRadius: 999,
              padding: '4px 10px',
            }}>
              <Sparkle size={12} weight="fill" />
              Rankings Globais · Live Feed
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
            Rankings Globais: combine abas
          </p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 12,
        marginBottom: 14,
      }}>
        {PILARES.map(pilar => <CardPilar key={pilar.num} pilar={pilar} />)}
      </div>

      <RodapeCombinacoesRankingsMapa />
    </div>
  )
}
