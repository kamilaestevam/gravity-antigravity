import React from 'react'
import {
  Airplane,
  ArrowsDownUp,
  CircleDashed,
  Flag,
  Funnel,
  MapPin,
  Sparkle,
  type Icon,
} from '@phosphor-icons/react'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

export type ManualPilarFiltrosMapaBidFreteId = '01' | '02' | '03' | '04' | '05'

type PilarFiltrosMapaBidFrete = {
  num: ManualPilarFiltrosMapaBidFreteId
  rotulo: string
  descricao: string
  icone: Icon
  cor: string
  borda: string
  fundo: string
}

export const MANUAL_PILARES_FILTROS_MAPA_BID_FRETE: Record<
  ManualPilarFiltrosMapaBidFreteId,
  { icone: Icon; cor: string; borda: string; fundo: string }
> = {
  '01': { icone: ArrowsDownUp, cor: '#f87171', borda: 'rgba(248,113,113,.32)', fundo: 'rgba(239,68,68,.08)' },
  '02': { icone: Airplane, cor: '#34d399', borda: 'rgba(52,211,153,.32)', fundo: 'rgba(52,211,153,.08)' },
  '03': { icone: MapPin, cor: '#60a5fa', borda: 'rgba(96,165,250,.32)', fundo: 'rgba(96,165,250,.08)' },
  '04': { icone: Flag, cor: '#a78bfa', borda: 'rgba(167,139,250,.32)', fundo: 'rgba(139,92,246,.08)' },
  '05': { icone: CircleDashed, cor: '#fbbf24', borda: 'rgba(251,191,36,.32)', fundo: 'rgba(251,191,36,.08)' },
}

const PILARES: PilarFiltrosMapaBidFrete[] = [
  {
    num: '01',
    rotulo: 'Tipo de Operação',
    descricao: 'Explore **Importação** e **Exportação** — opções que definem o fluxo operacional visível no mapa.',
    icone: ArrowsDownUp,
    cor: '#f87171',
    borda: 'rgba(248,113,113,.32)',
    fundo: 'rgba(239,68,68,.08)',
  },
  {
    num: '02',
    rotulo: 'Modal',
    descricao: 'Escolha o **modal de transporte** — marítimo, aéreo e demais opções configuradas no workspace.',
    icone: Airplane,
    cor: '#34d399',
    borda: 'rgba(52,211,153,.32)',
    fundo: 'rgba(52,211,153,.08)',
  },
  {
    num: '03',
    rotulo: 'Origem',
    descricao: 'Selecione **terminal** ou **região de saída** para focalizar rotas a partir desse ponto.',
    icone: MapPin,
    cor: '#60a5fa',
    borda: 'rgba(96,165,250,.32)',
    fundo: 'rgba(96,165,250,.08)',
  },
  {
    num: '04',
    rotulo: 'Destino',
    descricao: 'Aplique o mesmo critério na **chegada** — o mapa exibe só trechos compatíveis.',
    icone: Flag,
    cor: '#a78bfa',
    borda: 'rgba(167,139,250,.32)',
    fundo: 'rgba(139,92,246,.08)',
  },
  {
    num: '05',
    rotulo: 'Status',
    descricao: 'Filtre por **status** das cotações — e combine com as demais dimensões do painel.',
    icone: CircleDashed,
    cor: '#fbbf24',
    borda: 'rgba(251,191,36,.32)',
    fundo: 'rgba(251,191,36,.08)',
  },
]

function renderizarNegrito(texto: string) {
  return texto.split('**').map((parte, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: '#cbd5e1', fontWeight: 700 }}>{parte}</strong>
      : parte,
  )
}

function CardPilar({ pilar }: { pilar: PilarFiltrosMapaBidFrete }) {
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

export function ManualPilaresFiltrosMapaBidFreteChips({ pilares }: { pilares: ManualPilarFiltrosMapaBidFreteId[] }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: 6,
        flexShrink: 0,
        paddingTop: 2,
      }}
      aria-label={`Assuntos ${pilares.join(' e ')} dos filtros do mapa`}
    >
      {pilares.map((num) => {
        const pilar = MANUAL_PILARES_FILTROS_MAPA_BID_FRETE[num]
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

function RodapeCombinacoesFiltrosMapa() {
  const dimensoes: ManualPilarFiltrosMapaBidFreteId[] = ['01', '02', '03', '04', '05']

  return (
    <div style={{
      borderRadius: 10,
      padding: '10px 12px',
      background: 'rgba(8,12,24,.25)',
      border: '1px solid rgba(148,163,184,.12)',
      fontSize: '.68rem',
      lineHeight: 1.5,
      color: CORPO_70,
    }}>
      <p style={{ margin: 0, fontWeight: 800, color: '#c7d2fe', fontSize: '.72rem', lineHeight: 1.4 }}>
        Combinações múltiplas · mapa dinâmico
      </p>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 5,
          margin: '10px 0 8px',
        }}
        aria-hidden
      >
        {dimensoes.map((num, indice) => {
          const pilar = MANUAL_PILARES_FILTROS_MAPA_BID_FRETE[num]
          return (
            <React.Fragment key={num}>
              {indice > 0 ? (
                <span style={{ color: '#64748b', fontWeight: 800, fontSize: '.7rem', lineHeight: 1 }}>×</span>
              ) : null}
              <span
                title={PILARES[indice]?.rotulo}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 28,
                  height: 24,
                  padding: '0 7px',
                  borderRadius: 6,
                  border: `1px solid ${pilar.borda}`,
                  background: pilar.fundo,
                  color: pilar.cor,
                  fontSize: '.62rem',
                  fontWeight: 800,
                  letterSpacing: '.04em',
                }}
              >
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
          border: '1px solid rgba(129,140,248,.35)',
          background: 'rgba(129,140,248,.12)',
          color: '#c7d2fe',
          fontSize: '.62rem',
          fontWeight: 800,
          letterSpacing: '.04em',
          textTransform: 'uppercase',
        }}>
          Hub atualizado
        </span>
      </div>

      <p style={{ margin: 0 }}>
        Misture <strong style={{ color: '#cbd5e1' }}>Tipo de Operação</strong>, <strong style={{ color: '#cbd5e1' }}>Modal</strong>,{' '}
        <strong style={{ color: '#cbd5e1' }}>Origem</strong>, <strong style={{ color: '#cbd5e1' }}>Destino</strong> e{' '}
        <strong style={{ color: '#cbd5e1' }}>Status</strong> em qualquer ordem. Cada ajuste recalcula pins, rotas e cotações visíveis na hora.
      </p>
    </div>
  )
}

/** Manual BID Frete §03 — mapa dos cinco acordeões do painel Refinar mapa */
export function ManualInfograficoBidFreteFiltrosMapa() {
  return (
    <div style={{
      background: 'linear-gradient(165deg, rgba(129,140,248,.09) 0%, rgba(148,163,184,.04) 42%, rgba(251,191,36,.05) 100%)',
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
            <Funnel size={18} weight="duotone" color="#818cf8" />
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: '.62rem',
              fontWeight: 800,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              color: '#c7d2fe',
              background: 'rgba(129,140,248,.12)',
              border: '1px solid rgba(129,140,248,.32)',
              borderRadius: 999,
              padding: '4px 10px',
            }}>
              <Sparkle size={12} weight="fill" />
              Refinar mapa
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
            Refinar mapa: explore as opções
          </p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 12,
        marginBottom: 14,
      }}>
        {PILARES.map((pilar) => (
          <CardPilar key={pilar.num} pilar={pilar} />
        ))}
      </div>

      <RodapeCombinacoesFiltrosMapa />
    </div>
  )
}
