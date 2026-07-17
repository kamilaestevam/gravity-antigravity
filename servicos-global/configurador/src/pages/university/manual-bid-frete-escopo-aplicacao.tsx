import React from 'react'
import {
  Airplane,
  ArrowDown,
  ArrowUp,
  Boat,
  TruckTrailer,
  type Icon,
} from '@phosphor-icons/react'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { MANUAL_ESPACO_ENTRE_PASSOS_PX, MANUAL_ESPACO_PARAGRAFO_PX } from './manual-tipografia'

/** Vão ícone ↔ rótulo na legenda de escopo (Nova cotação — §4.01). */
const LEGENDA_ESCOPO_GAP_ICONE_TEXTO_PX = 16

export type ManualBidFreteEscopoOperacaoId = 'importacao' | 'exportacao'
export type ManualBidFreteEscopoModalId = 'maritimo' | 'aereo' | 'rodoviario'

export type ManualBidFreteEscopoPreset =
  | 'universal'
  | 'inicio-comum'
  | 'maritimo'
  | 'aereo'
  | 'rodoviario'
  | 'ncm-comum'

export type ManualBidFreteEscopoLayout = 'icones' | 'completo' | 'compacto' | 'inline'

export type ManualBidFreteEscopoConfig = {
  preset?: ManualBidFreteEscopoPreset
  operacao?: ManualBidFreteEscopoOperacaoId[]
  modais?: ManualBidFreteEscopoModalId[]
  layout?: ManualBidFreteEscopoLayout
  /** Rótulo acima da matriz (modo completo — legado). */
  titulo?: string
}

type IconeEscopoDef<T extends string> = {
  id: T
  rotulo: string
  icone: Icon
  cor: string
  borda: string
  fundo: string
  tooltipTitulo: string
  tooltipAtivo: string
  tooltipInativo: string
  /** Texto curto na legenda do capítulo. */
  legenda: string
}

const ICONES_OPERACAO: IconeEscopoDef<ManualBidFreteEscopoOperacaoId>[] = [
  {
    id: 'importacao',
    rotulo: 'Importação',
    icone: ArrowDown,
    cor: '#2dd4bf',
    borda: 'rgba(45,212,191,.32)',
    fundo: 'rgba(45,212,191,.1)',
    tooltipTitulo: 'Importação',
    tooltipAtivo: 'Este tópico vale para cotações de entrada no país',
    tooltipInativo: 'Não se aplica a importação neste tópico',
    legenda: 'Operação de entrada — mercadoria chegando ao país',
  },
  {
    id: 'exportacao',
    rotulo: 'Exportação',
    icone: ArrowUp,
    cor: '#fbbf24',
    borda: 'rgba(251,191,36,.32)',
    fundo: 'rgba(245,158,11,.1)',
    tooltipTitulo: 'Exportação',
    tooltipAtivo: 'Este tópico vale para cotações de saída do país',
    tooltipInativo: 'Não se aplica a exportação neste tópico',
    legenda: 'Operação de saída — mercadoria saindo do país',
  },
]

const ICONES_MODAL: IconeEscopoDef<ManualBidFreteEscopoModalId>[] = [
  {
    id: 'maritimo',
    rotulo: 'Marítimo',
    icone: Boat,
    cor: '#38bdf8',
    borda: 'rgba(56,189,248,.32)',
    fundo: 'rgba(56,189,248,.1)',
    tooltipTitulo: 'Marítimo',
    tooltipAtivo: 'Conteúdo válido quando o modal marítimo está selecionado',
    tooltipInativo: 'Não se aplica ao modal marítimo neste tópico',
    legenda: 'Frete por navio — portos, FCL e LCL',
  },
  {
    id: 'aereo',
    rotulo: 'Aéreo',
    icone: Airplane,
    cor: '#a78bfa',
    borda: 'rgba(167,139,250,.32)',
    fundo: 'rgba(167,139,250,.1)',
    tooltipTitulo: 'Aéreo',
    tooltipAtivo: 'Conteúdo válido quando o modal aéreo está selecionado',
    tooltipInativo: 'Não se aplica ao modal aéreo neste tópico',
    legenda: 'Frete aéreo — aeroportos e volumes',
  },
  {
    id: 'rodoviario',
    rotulo: 'Rodoviário',
    icone: TruckTrailer,
    cor: '#fbbf24',
    borda: 'rgba(251,191,36,.32)',
    fundo: 'rgba(245,158,11,.1)',
    tooltipTitulo: 'Rodoviário',
    tooltipAtivo: 'Conteúdo válido quando o modal rodoviário está selecionado',
    tooltipInativo: 'Não se aplica ao modal rodoviário neste tópico',
    legenda: 'Frete terrestre — trechos door-to-door e volumes',
  },
]

const PRESETS: Record<
  ManualBidFreteEscopoPreset,
  { operacao: ManualBidFreteEscopoOperacaoId[]; modais: ManualBidFreteEscopoModalId[] }
> = {
  universal: {
    operacao: ['importacao', 'exportacao'],
    modais: ['maritimo', 'aereo', 'rodoviario'],
  },
  'inicio-comum': {
    operacao: ['importacao', 'exportacao'],
    modais: ['maritimo', 'aereo', 'rodoviario'],
  },
  maritimo: {
    operacao: ['importacao', 'exportacao'],
    modais: ['maritimo'],
  },
  aereo: {
    operacao: ['importacao', 'exportacao'],
    modais: ['aereo'],
  },
  rodoviario: {
    operacao: ['importacao', 'exportacao'],
    modais: ['rodoviario'],
  },
  'ncm-comum': {
    operacao: ['importacao', 'exportacao'],
    modais: ['maritimo', 'aereo', 'rodoviario'],
  },
}

export function resolverEscopoBidFrete(config: ManualBidFreteEscopoConfig) {
  const base = config.preset ? PRESETS[config.preset] : PRESETS.universal
  return {
    operacao: config.operacao ?? base.operacao,
    modais: config.modais ?? base.modais,
  }
}

function ManualBidFreteEscopoIcone<T extends string>({
  icone,
  ativo,
}: {
  icone: IconeEscopoDef<T>
  ativo: boolean
}) {
  const Icone = icone.icone
  return (
    <TooltipGlobal
      titulo={icone.tooltipTitulo}
      descricao={ativo ? icone.tooltipAtivo : icone.tooltipInativo}
      posicaoPreferida="abaixo"
    >
      <button
        type="button"
        aria-label={`${icone.rotulo}${ativo ? '' : ' — fora do escopo'}`}
        aria-pressed={ativo}
        style={{
          width: 26,
          height: 26,
          borderRadius: 8,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          cursor: 'default',
          flexShrink: 0,
          color: ativo ? icone.cor : 'rgba(148,163,184,.45)',
          background: ativo ? icone.fundo : 'rgba(148,163,184,.06)',
          border: ativo
            ? `1px solid ${icone.borda}`
            : '1px solid rgba(148,163,184,.14)',
          opacity: ativo ? 1 : 0.55,
          boxShadow: 'none',
        }}
      >
        <Icone size={14} weight={ativo ? 'duotone' : 'regular'} aria-hidden />
      </button>
    </TooltipGlobal>
  )
}

function ManualBidFreteEscopoIconesGrupo<T extends string>({
  icones,
  ativos,
}: {
  icones: IconeEscopoDef<T>[]
  ativos: T[]
}) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      {icones.map((icone) => (
        <ManualBidFreteEscopoIcone
          key={icone.id}
          icone={icone}
          ativo={ativos.includes(icone.id)}
        />
      ))}
    </div>
  )
}

/** Ícones discretos de escopo (Operação + Modal) com TooltipGlobal. */
export function ManualBidFreteIconesEscopo({ config }: { config: ManualBidFreteEscopoConfig }) {
  const escopo = resolverEscopoBidFrete(config)
  return (
    <div
      role="group"
      aria-label="Escopo: importação, exportação e modais de transporte"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        flexShrink: 0,
        opacity: 0.92,
      }}
    >
      <ManualBidFreteEscopoIconesGrupo icones={ICONES_OPERACAO} ativos={escopo.operacao} />
      <span
        aria-hidden
        style={{
          width: 1,
          height: 14,
          background: 'rgba(148,163,184,.22)',
          flexShrink: 0,
        }}
      />
      <ManualBidFreteEscopoIconesGrupo icones={ICONES_MODAL} ativos={escopo.modais} />
    </div>
  )
}

export function ManualBidFreteBarraEscopo({ config }: { config: ManualBidFreteEscopoConfig }) {
  const layout = config.layout ?? 'icones'
  return (
    <div style={{
      marginBottom: layout === 'inline' ? 0 : MANUAL_ESPACO_PARAGRAFO_PX,
      ...(layout === 'completo' ? { marginBottom: MANUAL_ESPACO_ENTRE_PASSOS_PX } : {}),
    }}>
      <ManualBidFreteIconesEscopo config={config} />
    </div>
  )
}

function ManualBidFreteLegendaEscopoIconePreview<T extends string>({
  icone,
  ativo,
}: {
  icone: IconeEscopoDef<T>
  ativo: boolean
}) {
  const Icone = icone.icone
  return (
    <span
      aria-hidden
      style={{
        width: 26,
        height: 26,
        borderRadius: 8,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        color: ativo ? icone.cor : 'rgba(148,163,184,.45)',
        background: ativo ? icone.fundo : 'rgba(148,163,184,.06)',
        border: ativo
          ? `1px solid ${icone.borda}`
          : '1px solid rgba(148,163,184,.14)',
        opacity: ativo ? 1 : 0.55,
      }}
    >
      <Icone size={14} weight={ativo ? 'duotone' : 'regular'} />
    </span>
  )
}

function ManualBidFreteLegendaEscopoLinha<T extends string>({
  icone,
}: {
  icone: IconeEscopoDef<T>
}) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '26px minmax(88px, 120px) minmax(0, 1fr)',
      columnGap: LEGENDA_ESCOPO_GAP_ICONE_TEXTO_PX,
      rowGap: 8,
      alignItems: 'center',
    }}>
      <ManualBidFreteLegendaEscopoIconePreview icone={icone} ativo />
      <span style={{
        fontSize: '.74rem',
        fontWeight: 700,
        color: icone.cor,
        lineHeight: 1.3,
      }}>
        {icone.rotulo}
      </span>
      <span style={{
        fontSize: '.74rem',
        lineHeight: 1.4,
        color: 'rgba(148,163,184,.9)',
      }}>
        {icone.legenda}
      </span>
    </div>
  )
}

/** Legenda fixa dos ícones de escopo — exibir uma vez no início do capítulo Nova cotação. */
export function ManualBidFreteInfograficoLegendaEscopoIcones() {
  return (
    <div
      role="region"
      aria-label="Legenda dos ícones de escopo do capítulo Nova cotação"
      style={{
        background: 'linear-gradient(165deg, rgba(99,102,241,.07) 0%, rgba(148,163,184,.04) 55%, rgba(45,212,191,.04) 100%)',
        border: '1px solid rgba(129,140,248,.18)',
        borderRadius: 14,
        padding: '16px 18px 14px',
        marginBottom: MANUAL_ESPACO_ENTRE_PASSOS_PX,
        boxShadow: '0 8px 28px rgba(0,0,0,.1), inset 0 1px 0 rgba(255,255,255,.03)',
      }}
    >
      <div style={{ marginBottom: MANUAL_ESPACO_ENTRE_PASSOS_PX }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          fontSize: '.62rem',
          fontWeight: 800,
          letterSpacing: '.08em',
          textTransform: 'uppercase',
          color: '#c4b5fd',
          background: 'rgba(129,140,248,.12)',
          border: '1px solid rgba(129,140,248,.28)',
          borderRadius: 999,
          padding: '4px 10px',
        }}>
          Legenda · ícones de escopo
        </span>
        <p style={{
          margin: `${MANUAL_ESPACO_PARAGRAFO_PX}px 0 0`,
          fontSize: '.78rem',
          lineHeight: 1.45,
          color: 'rgba(203,213,225,.88)',
        }}>
          Ao longo deste capítulo, estes ícones aparecem ao lado dos títulos. Passe o mouse para ver se o tópico vale
          para aquela operação ou modal.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '14px 20px',
      }}>
        <div>
          <p style={{
            margin: '0 0 8px',
            fontSize: '.62rem',
            fontWeight: 800,
            letterSpacing: '.06em',
            textTransform: 'uppercase',
            color: '#e2e8f0',
          }}>
            Operação
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ICONES_OPERACAO.map((icone) => (
              <ManualBidFreteLegendaEscopoLinha key={icone.id} icone={icone} />
            ))}
          </div>
        </div>
        <div>
          <p style={{
            margin: '0 0 8px',
            fontSize: '.62rem',
            fontWeight: 800,
            letterSpacing: '.06em',
            textTransform: 'uppercase',
            color: '#e2e8f0',
          }}>
            Modal
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ICONES_MODAL.map((icone) => (
              <ManualBidFreteLegendaEscopoLinha key={icone.id} icone={icone} />
            ))}
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '10px 14px',
        marginTop: MANUAL_ESPACO_ENTRE_PASSOS_PX,
        paddingTop: MANUAL_ESPACO_PARAGRAFO_PX,
        borderTop: '1px solid rgba(148,163,184,.12)',
      }}>
        <ManualBidFreteIconesEscopo config={{ preset: 'maritimo' }} />
        <span style={{ fontSize: '.72rem', lineHeight: 1.45, color: 'rgba(148,163,184,.88)' }}>
          <strong style={{ color: '#e2e8f0', fontWeight: 700 }}>Colorido</strong> = vale para este tópico
          <span style={{ margin: '0 8px', opacity: 0.45 }}>·</span>
          <strong style={{ color: '#94a3b8', fontWeight: 700 }}>Opaco</strong> = fora do escopo
        </span>
      </div>
    </div>
  )
}
