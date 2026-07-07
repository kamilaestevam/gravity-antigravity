import React from 'react'
import {
  Anchor,
  ArrowCounterClockwise,
  CaretDown,
  Eye,
  EyeSlash,
  Globe,
  MapTrifold,
  Minus,
  Pause,
  Play,
  Plus,
  type Icon,
} from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'

/** Pin marítimo do mapa Insights — paridade `bfd-map-pin__dot`. */
export function ManualInfograficoPinMapaBidFreteInline() {
  return (
    <span
      role="img"
      aria-label="Pin do mapa"
      style={{
        display: 'inline-flex',
        verticalAlign: 'text-bottom',
        marginLeft: 3,
        marginRight: 2,
        alignItems: 'center',
        justifyContent: 'center',
        width: 18,
        height: 18,
        borderRadius: '50%',
        backgroundColor: '#34d399',
        boxShadow: '0 0 8px rgba(52, 211, 153, 0.6)',
      }}
    >
      <Anchor size={11} weight="bold" color="#000000" aria-hidden />
    </span>
  )
}

/** Botão compacto inline — paridade `bfd-map-control-btn`, com contraste sobre callout escuro. */
export function ManualIconeControleMapaBidFreteInlineCompact({
  icone: Icone,
  ariaLabel,
  rotasOcultas = false,
}: {
  icone: Icon
  ariaLabel: string
  rotasOcultas?: boolean
}) {
  return (
    <span
      role="img"
      aria-label={ariaLabel}
      style={{
        display: 'inline-flex',
        verticalAlign: 'middle',
        margin: '0 2px',
        alignItems: 'center',
        justifyContent: 'center',
        width: 20,
        height: 20,
        borderRadius: 5,
        border: rotasOcultas
          ? '1px solid rgba(251, 191, 36, 0.35)'
          : '1px solid rgba(96, 165, 250, 0.42)',
        background: rotasOcultas
          ? 'rgba(251, 191, 36, 0.12)'
          : 'rgba(8, 12, 24, 0.92)',
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        color: rotasOcultas ? '#fbbf24' : '#ffffff',
        flexShrink: 0,
      }}
    >
      <Icone size={11} weight="bold" aria-hidden />
    </span>
  )
}

/** Globo compacto inline — paridade `bfd-map-control-btn`, com contraste sobre callout escuro. */
export function ManualIconeGloboMapaBidFreteInlineCompact() {
  return (
    <ManualIconeControleMapaBidFreteInlineCompact
      icone={Globe}
      ariaLabel="Controle Globo do mapa"
    />
  )
}

const ICONES_CONTROLE_MAPA_BID_FRETE: Record<string, { icone: Icon; ariaLabel: string; rotasOcultas?: boolean }> = {
  'globo-mapa-bid-frete': { icone: Globe, ariaLabel: 'Controle Globo do mapa' },
  'mapa-plano-bid-frete': { icone: MapTrifold, ariaLabel: 'Controle Mapa plano' },
  'zoom-in-bid-frete': { icone: Plus, ariaLabel: 'Controle Zoom in' },
  'zoom-out-bid-frete': { icone: Minus, ariaLabel: 'Controle Zoom out' },
  'restaurar-mapa-bid-frete': { icone: ArrowCounterClockwise, ariaLabel: 'Controle Restaurar mapa' },
  'ocultar-linhas-bid-frete': { icone: Eye, ariaLabel: 'Controle Ocultar linhas de rota' },
  'exibir-linhas-bid-frete': { icone: EyeSlash, ariaLabel: 'Controle Exibir linhas de rota', rotasOcultas: true },
  'pausar-globo-bid-frete': { icone: Pause, ariaLabel: 'Controle Pausar rotação do globo' },
  'iniciar-globo-bid-frete': { icone: Play, ariaLabel: 'Controle Iniciar rotação do globo' },
}

export function isIconeControleMapaBidFrete(slug: string): slug is keyof typeof ICONES_CONTROLE_MAPA_BID_FRETE {
  return slug in ICONES_CONTROLE_MAPA_BID_FRETE
}

export function ManualInfograficoIconeControleMapaBidFreteInline({ slug }: { slug: string }) {
  const config = ICONES_CONTROLE_MAPA_BID_FRETE[slug]
  if (!config) return null
  return (
    <ManualIconeControleMapaBidFreteInlineCompact
      icone={config.icone}
      ariaLabel={config.ariaLabel}
      rotasOcultas={config.rotasOcultas}
    />
  )
}

function ManualInfograficoIconeInline({ slug }: { slug: string }) {
  if (slug === 'pin-mapa-bid-frete') {
    return <ManualInfograficoPinMapaBidFreteInline />
  }
  if (isIconeControleMapaBidFrete(slug)) {
    return <ManualInfograficoIconeControleMapaBidFreteInline slug={slug} />
  }
  return <>{`{{icone:${slug}}}`}</>
}

/** Botão + Novo do BID Frete — paridade `BotaoGlobal` + dropdown Insights/Lista. */
export function ManualInfograficoBotaoNovoBidFreteInline() {
  return (
    <span
      role="img"
      aria-label="Botão Novo"
      style={{
        display: 'inline-flex',
        verticalAlign: 'middle',
        margin: '0 3px',
        transform: 'scale(0.8)',
        transformOrigin: 'left center',
      }}
    >
      <BotaoGlobal
        variante="primario"
        tamanho="pequeno"
        icone={<Plus size={14} weight="bold" />}
        tabIndex={-1}
        aria-hidden
        style={{ pointerEvents: 'none', cursor: 'default' }}
      >
        Novo{' '}
        <CaretDown size={12} weight="bold" style={{ marginLeft: 2 }} />
      </BotaoGlobal>
    </span>
  )
}

export function ManualInfograficoBotaoInline({ slug }: { slug: string }) {
  if (slug === 'novo-bid-frete') {
    return <ManualInfograficoBotaoNovoBidFreteInline />
  }
  return <>{`{{botao:${slug}}}`}</>
}

function renderizarNegrito(texto: string, keyPrefix: string) {
  return texto.split('**').map((parte, i) =>
    i % 2 === 1 ? (
      <strong key={`${keyPrefix}-b-${i}`} style={{ color: '#cbd5e1', fontWeight: 700 }}>
        {parte}
      </strong>
    ) : (
      parte
    ),
  )
}

/** Texto de infográfico com `**negrito**`, `{{icone:…}}` e `{{botao:…}}`. */
export function ManualInfograficoRichText({ texto }: { texto: string }) {
  const partes: React.ReactNode[] = []
  const re = /(\{\{icone:([a-z0-9-]+)\}\}|\{\{botao:([a-z0-9-]+)\}\})/g
  let ultimo = 0
  let match: RegExpExecArray | null
  let ki = 0
  while ((match = re.exec(texto)) !== null) {
    if (match.index > ultimo) {
      partes.push(...[renderizarNegrito(texto.slice(ultimo, match.index), `t-${ki}`)])
    }
    if (match[2] !== undefined) {
      partes.push(<ManualInfograficoIconeInline key={`i-${ki++}`} slug={match[2]} />)
    } else if (match[3] !== undefined) {
      partes.push(<ManualInfograficoBotaoInline key={`b-${ki++}`} slug={match[3]} />)
    }
    ultimo = re.lastIndex
  }
  if (ultimo < texto.length) {
    partes.push(...[renderizarNegrito(texto.slice(ultimo), `t-${ki}`)])
  }
  return <>{partes}</>
}
