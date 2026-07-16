import React from 'react'
import {
  ArrowCounterClockwise,
  Eye,
  EyeSlash,
  Globe,
  MagnifyingGlassMinus,
  MagnifyingGlassPlus,
  MapTrifold,
  Pause,
  Play,
  SlidersHorizontal,
  type Icon,
} from '@phosphor-icons/react'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

type ItemControleMapa = {
  icone: Icon
  rotulo: string
  ativo?: boolean
}

type GrupoControlesMapa = {
  rotulo: string
  cor: string
  borda: string
  fundo: string
  itens: ItemControleMapa[]
}

export type ManualPilarControlesMapaBidFreteId = 'vista' | 'zoom' | 'restaurar' | 'linhas' | 'rotacao'

export const MANUAL_PILARES_CONTROLES_MAPA_BID_FRETE: Record<
  ManualPilarControlesMapaBidFreteId,
  { icone: Icon; cor: string; borda: string; fundo: string }
> = {
  vista: { icone: Globe, cor: '#60a5fa', borda: 'rgba(96,165,250,.32)', fundo: 'rgba(96,165,250,.08)' },
  zoom: { icone: MagnifyingGlassPlus, cor: '#34d399', borda: 'rgba(52,211,153,.32)', fundo: 'rgba(52,211,153,.08)' },
  restaurar: { icone: ArrowCounterClockwise, cor: '#fbbf24', borda: 'rgba(251,191,36,.32)', fundo: 'rgba(251,191,36,.08)' },
  linhas: { icone: Eye, cor: '#a78bfa', borda: 'rgba(167,139,250,.32)', fundo: 'rgba(139,92,246,.08)' },
  rotacao: { icone: Pause, cor: '#f472b6', borda: 'rgba(244,114,182,.32)', fundo: 'rgba(244,114,182,.08)' },
}

export function ManualPilaresControlesMapaBidFreteChips({ pilares }: { pilares: ManualPilarControlesMapaBidFreteId[] }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: 6,
        flexShrink: 0,
        paddingTop: 2,
      }}
      aria-label={`Controles ${pilares.join(' e ')} do mapa`}
    >
      {pilares.map((id) => {
        const pilar = MANUAL_PILARES_CONTROLES_MAPA_BID_FRETE[id]
        const Icone = pilar.icone
        return (
          <div
            key={id}
            title={id}
            style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              border: `1px solid ${pilar.borda}`,
              background: pilar.fundo,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icone size={18} weight="duotone" color={pilar.cor} aria-hidden />
          </div>
        )
      })}
    </div>
  )
}

const GRUPOS_CONTROLES: GrupoControlesMapa[] = [
  {
    rotulo: 'Vista',
    cor: '#60a5fa',
    borda: 'rgba(96,165,250,.32)',
    fundo: 'rgba(96,165,250,.08)',
    itens: [
      { icone: Globe, rotulo: 'Globo', ativo: true },
      { icone: MapTrifold, rotulo: 'Mapa plano' },
    ],
  },
  {
    rotulo: 'Zoom',
    cor: '#34d399',
    borda: 'rgba(52,211,153,.32)',
    fundo: 'rgba(52,211,153,.08)',
    itens: [
      { icone: MagnifyingGlassPlus, rotulo: 'Zoom in' },
      { icone: MagnifyingGlassMinus, rotulo: 'Zoom out' },
    ],
  },
  {
    rotulo: 'Restaurar',
    cor: '#fbbf24',
    borda: 'rgba(251,191,36,.32)',
    fundo: 'rgba(251,191,36,.08)',
    itens: [{ icone: ArrowCounterClockwise, rotulo: 'Voltar vista' }],
  },
  {
    rotulo: 'Linhas',
    cor: '#a78bfa',
    borda: 'rgba(167,139,250,.32)',
    fundo: 'rgba(139,92,246,.08)',
    itens: [
      { icone: EyeSlash, rotulo: 'Ocultar' },
      { icone: Eye, rotulo: 'Exibir' },
    ],
  },
  {
    rotulo: 'Rotação',
    cor: '#f472b6',
    borda: 'rgba(244,114,182,.32)',
    fundo: 'rgba(244,114,182,.08)',
    itens: [
      { icone: Pause, rotulo: 'Pausar' },
      { icone: Play, rotulo: 'Iniciar' },
    ],
  },
]

function BotaoToolbar({
  icone: Icone,
  rotulo,
  ativo = false,
  cor,
  borda,
}: {
  icone: Icon
  rotulo: string
  ativo?: boolean
  cor: string
  borda: string
}) {
  return (
    <div
      title={rotulo}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 5,
        minWidth: 52,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: ativo ? 'rgba(99,102,241,.22)' : 'rgba(8,12,24,.45)',
          border: ativo ? '1px solid rgba(129,140,248,.55)' : `1px solid ${borda}`,
          boxShadow: ativo ? '0 0 0 1px rgba(129,140,248,.18)' : undefined,
        }}
      >
        <Icone size={17} weight="duotone" color={ativo ? '#a5b4fc' : cor} />
      </div>
      <span
        style={{
          fontSize: '.58rem',
          fontWeight: 700,
          color: CORPO_70,
          letterSpacing: '.02em',
          lineHeight: 1.2,
          textAlign: 'center',
        }}
      >
        {rotulo}
      </span>
    </div>
  )
}

function GrupoToolbar({ grupo }: { grupo: GrupoControlesMapa }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: '10px 12px',
        borderRadius: 10,
        background: grupo.fundo,
        border: `1px solid ${grupo.borda}`,
        minWidth: 0,
      }}
    >
      <span
        style={{
          fontSize: '.58rem',
          fontWeight: 800,
          letterSpacing: '.08em',
          textTransform: 'uppercase',
          color: grupo.cor,
        }}
      >
        {grupo.rotulo}
      </span>
      <div style={{
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
      }}>
        {grupo.itens.map(item => (
          <BotaoToolbar
            key={item.rotulo}
            icone={item.icone}
            rotulo={item.rotulo}
            ativo={item.ativo}
            cor={grupo.cor}
            borda={grupo.borda}
          />
        ))}
      </div>
    </div>
  )
}

/** Manual BID Frete § Controles do mapa — barra de ícones (layout distinto dos pilares numerados). */
export function ManualInfograficoBidFreteControlesMapa() {
  return (
    <div
      style={{
        background:
          'linear-gradient(180deg, rgba(15,23,42,.55) 0%, rgba(30,41,59,.35) 100%)',
        border: '1px solid rgba(148,163,184,.18)',
        borderRadius: 14,
        padding: '18px 18px 16px',
        boxShadow: '0 10px 36px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.04)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 14,
          marginBottom: 14,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <SlidersHorizontal size={18} weight="duotone" color="#94a3b8" />
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: '.62rem',
                fontWeight: 800,
                letterSpacing: '.08em',
                textTransform: 'uppercase',
                color: '#cbd5e1',
                background: 'rgba(148,163,184,.1)',
                border: '1px solid rgba(148,163,184,.22)',
                borderRadius: 999,
                padding: '4px 10px',
              }}
            >
              Barra superior do mapa
            </span>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: '.9rem',
              fontWeight: 800,
              color: '#f1f5f9',
              lineHeight: 1.35,
              letterSpacing: '-.01em',
            }}
          >
            Controles rápidos do mapa
          </p>
          <p style={{ margin: '8px 0 0', fontSize: '.74rem', lineHeight: 1.5, color: CORPO_70 }}>
            Utilize os atalhos para personalizar a sua experiência de navegação e facilitar a leitura dos dados espaciais.
          </p>
        </div>
      </div>

      <div
        style={{
          borderRadius: 12,
          padding: '12px 14px',
          background: 'rgba(8,12,24,.42)',
          border: '1px solid rgba(148,163,184,.14)',
          marginBottom: 12,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 10,
            alignItems: 'stretch',
          }}
        >
          {GRUPOS_CONTROLES.map(grupo => (
            <GrupoToolbar key={grupo.rotulo} grupo={grupo} />
          ))}
        </div>
      </div>

      <div
        style={{
          borderRadius: 10,
          padding: '10px 12px',
          background: 'rgba(8,12,24,.25)',
          border: '1px solid rgba(148,163,184,.12)',
          fontSize: '.68rem',
          lineHeight: 1.5,
          color: CORPO_70,
        }}
      >
        <p style={{ margin: 0, fontWeight: 800, color: '#cbd5e1', fontSize: '.72rem', lineHeight: 1.4 }}>
          Vista, Zoom, Restaurar, Linhas e Rotação
        </p>
        <p style={{ margin: '6px 0 0' }}>
          Acompanhe a seguir a demonstração visual de cada controle aplicado diretamente na interface.
        </p>
      </div>
    </div>
  )
}
