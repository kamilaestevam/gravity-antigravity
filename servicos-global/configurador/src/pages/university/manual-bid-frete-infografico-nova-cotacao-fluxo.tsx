import React from 'react'
import {
  Cube,
  FileText,
  MapPin,
  Package,
  Truck,
  UsersThree,
  type Icon,
} from '@phosphor-icons/react'

type EscopoPassoWizard = 'comum' | 'modal' | 'tipo' | 'misto'

type PassoWizardBidFrete = {
  num: string
  rotulo: string
  icone: Icon
  escopo: EscopoPassoWizard
}

const ESCOPO_ESTILO: Record<
  EscopoPassoWizard,
  { cor: string; borda: string; fundo: string }
> = {
  comum: {
    cor: '#34d399',
    borda: 'rgba(52,211,153,.35)',
    fundo: 'rgba(52,211,153,.1)',
  },
  modal: {
    cor: '#38bdf8',
    borda: 'rgba(56,189,248,.35)',
    fundo: 'rgba(56,189,248,.1)',
  },
  tipo: {
    cor: '#a78bfa',
    borda: 'rgba(167,139,250,.35)',
    fundo: 'rgba(167,139,250,.1)',
  },
  misto: {
    cor: '#fbbf24',
    borda: 'rgba(251,191,36,.35)',
    fundo: 'rgba(245,158,11,.1)',
  },
}

const PASSOS_WIZARD: PassoWizardBidFrete[] = [
  { num: '1', rotulo: 'Modal e Operação', icone: Truck, escopo: 'comum' },
  { num: '2', rotulo: 'Origem e Destino', icone: MapPin, escopo: 'modal' },
  { num: '3', rotulo: 'Carga e Incoterm', icone: Cube, escopo: 'misto' },
  { num: '4', rotulo: 'Fornecedores', icone: UsersThree, escopo: 'comum' },
  { num: '5', rotulo: 'Resumo', icone: FileText, escopo: 'comum' },
]

function PassoStepper({ passo, ultimo }: { passo: PassoWizardBidFrete; ultimo: boolean }) {
  const Icone = passo.icone
  const estilo = ESCOPO_ESTILO[passo.escopo]
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', flex: ultimo ? '0 0 auto' : '1 1 0', minWidth: 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 72, maxWidth: 110 }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: estilo.fundo,
          border: `2px solid ${estilo.borda}`,
          boxShadow: passo.num === '1' ? `0 0 0 3px ${estilo.fundo}` : undefined,
        }}>
          <Icone size={18} weight="duotone" color={estilo.cor} aria-hidden />
        </div>
        <p style={{
          margin: '8px 0 0',
          fontSize: '.62rem',
          fontWeight: 700,
          color: estilo.cor,
          textAlign: 'center',
          lineHeight: 1.3,
        }}>
          {passo.rotulo}
        </p>
      </div>
      {!ultimo ? (
        <div style={{
          flex: '1 1 auto',
          height: 2,
          marginTop: 20,
          marginLeft: 4,
          marginRight: 4,
          background: 'rgba(148,163,184,.25)',
          borderRadius: 1,
        }} aria-hidden />
      ) : null}
    </div>
  )
}

/** Manual BID Frete § Nova cotação — 5 passos do wizard: comum vs por modal vs por tipo. */
export function ManualInfograficoBidFreteNovaCotacaoFluxo() {
  return (
    <div
      role="group"
      aria-label="Passos do wizard Nova cotação avulsa manual"
      style={{
        background: 'linear-gradient(165deg, rgba(56,189,248,.09) 0%, rgba(148,163,184,.04) 42%, rgba(52,211,153,.05) 100%)',
        border: '1px solid rgba(148,163,184,.18)',
        borderRadius: 14,
        padding: '18px 18px 16px',
        boxShadow: '0 10px 36px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.04)',
      }}
    >
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Package size={16} weight="duotone" color="#38bdf8" aria-hidden />
          <span style={{
            fontSize: '.62rem',
            fontWeight: 800,
            letterSpacing: '.08em',
            textTransform: 'uppercase',
            color: '#bae6fd',
            background: 'rgba(56,189,248,.12)',
            border: '1px solid rgba(56,189,248,.32)',
            borderRadius: 999,
            padding: '4px 10px',
          }}>
            importação e exportação · marítimo, aéreo e rodoviário
          </span>
        </div>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        overflowX: 'auto',
        paddingBottom: 4,
      }}>
        {PASSOS_WIZARD.map((passo, idx) => (
          <PassoStepper key={passo.num} passo={passo} ultimo={idx === PASSOS_WIZARD.length - 1} />
        ))}
      </div>
    </div>
  )
}
