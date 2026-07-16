import React from 'react'
import {
  Anchor,
  ArrowCounterClockwise,
  ArrowRight,
  ArrowSquareOut,
  CaretDown,
  Eye,
  EyeSlash,
  Globe,
  MapTrifold,
  Minus,
  Package,
  Pause,
  Play,
  Plus,
  type Icon,
} from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { BotaoSalvar } from '@nucleo/botoes-salvar-global'

/** Pin importação do mapa Insights Pedido — paridade `bfd-map-pin__dot` laranja. */
export function ManualInfograficoPinMapaPedidoInline() {
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
        backgroundColor: '#f59e0b',
        boxShadow: '0 0 8px rgba(245, 158, 11, 0.6)',
      }}
    >
      <Package size={11} weight="bold" color="#000000" aria-hidden />
    </span>
  )
}

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

const ICONES_CONTROLE_MAPA_PEDIDO: Record<string, { icone: Icon; ariaLabel: string; trilhosOcultos?: boolean }> = {
  'globo-mapa-pedido': { icone: Globe, ariaLabel: 'Controle Globo do mapa' },
  'mapa-plano-pedido': { icone: MapTrifold, ariaLabel: 'Controle Mapa plano' },
  'zoom-in-pedido': { icone: Plus, ariaLabel: 'Controle Zoom in' },
  'zoom-out-pedido': { icone: Minus, ariaLabel: 'Controle Zoom out' },
  'restaurar-mapa-pedido': { icone: ArrowCounterClockwise, ariaLabel: 'Controle Restaurar mapa' },
  'ocultar-trilhos-pedido': { icone: Eye, ariaLabel: 'Controle Ocultar trilhos' },
  'exibir-trilhos-pedido': { icone: EyeSlash, ariaLabel: 'Controle Exibir trilhos', trilhosOcultos: true },
  'pausar-globo-pedido': { icone: Pause, ariaLabel: 'Controle Pausar rotação do globo' },
  'iniciar-globo-pedido': { icone: Play, ariaLabel: 'Controle Iniciar rotação do globo' },
}

export function isIconeControleMapaPedido(slug: string): slug is keyof typeof ICONES_CONTROLE_MAPA_PEDIDO {
  return slug in ICONES_CONTROLE_MAPA_PEDIDO
}

export function ManualInfograficoIconeControleMapaPedidoInline({ slug }: { slug: string }) {
  const config = ICONES_CONTROLE_MAPA_PEDIDO[slug]
  if (!config) return null
  return (
    <ManualIconeControleMapaBidFreteInlineCompact
      icone={config.icone}
      ariaLabel={config.ariaLabel}
      rotasOcultas={config.trilhosOcultos}
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
  if (slug === 'pin-mapa-pedido') {
    return <ManualInfograficoPinMapaPedidoInline />
  }
  if (slug === 'abrir-cotacao-lista-bid-frete') {
    return <ManualInfograficoIconeAbrirCotacaoListaBidFreteInline />
  }
  if (isIconeControleMapaPedido(slug)) {
    return <ManualInfograficoIconeControleMapaPedidoInline slug={slug} />
  }
  if (isIconeControleMapaBidFrete(slug)) {
    return <ManualInfograficoIconeControleMapaBidFreteInline slug={slug} />
  }
  return <>{`{{icone:${slug}}}`}</>
}

/** Botão «Abrir PO-xxx» no modal do mapa — paridade `bfd-pedido-card-btn-abrir`. */
export function ManualInfograficoBotaoAbrirPedidoListaPedidoInline() {
  return (
    <span
      role="img"
      aria-label="Abrir pedido na Lista"
      style={{
        display: 'inline-flex',
        verticalAlign: 'middle',
        marginLeft: 3,
        marginRight: -6,
        transform: 'scale(0.82)',
        transformOrigin: 'left center',
      }}
    >
      <BotaoGlobal
        variante="secundario"
        tamanho="pequeno"
        icone={<ArrowRight size={12} weight="bold" />}
        tabIndex={-1}
        aria-hidden
        style={{ pointerEvents: 'none', cursor: 'default', whiteSpace: 'nowrap' }}
      >
        Abrir PO-12345
      </BotaoGlobal>
    </span>
  )
}

/** Botão primário «Ir para cotação» — paridade modal de confirmação pós-wizard. */
export function ManualInfograficoBotaoIrParaCotacaoBidFreteInline() {
  return (
    <span
      role="img"
      aria-label="Ir para cotação"
      style={{
        display: 'inline-flex',
        verticalAlign: 'middle',
        marginLeft: 3,
        marginRight: -10,
        transform: 'scale(0.82)',
        transformOrigin: 'left center',
      }}
    >
      <BotaoGlobal
        variante="primario"
        tamanho="pequeno"
        tabIndex={-1}
        aria-hidden
        style={{ pointerEvents: 'none', cursor: 'default', whiteSpace: 'nowrap' }}
      >
        Ir para cotação
      </BotaoGlobal>
    </span>
  )
}

/** Ícone «Abrir cotação» na coluna Nº da cotação — paridade `bf-lista-numero-cotacao-abrir`. */
export function ManualInfograficoIconeAbrirCotacaoListaBidFreteInline() {
  return (
    <span
      role="img"
      aria-label="Abrir cotação na Lista"
      style={{
        display: 'inline-flex',
        verticalAlign: 'text-bottom',
        margin: '0 3px',
        alignItems: 'center',
        justifyContent: 'center',
        width: 20,
        height: 20,
        borderRadius: 4,
        color: '#60a5fa',
      }}
    >
      <ArrowSquareOut size={14} weight="bold" aria-hidden />
    </span>
  )
}

/** Botão + Nova do BID Frete — paridade `BotaoGlobal` + dropdown Insights/Lista. */
export function ManualInfograficoBotaoNovoBidFreteInline() {
  return (
    <span
      role="img"
      aria-label="Botão Nova"
      style={{
        display: 'inline-flex',
        verticalAlign: 'middle',
        marginLeft: 3,
        /* scale(0.8) mantém a caixa de layout larga — margem negativa aproxima o "." */
        marginRight: -14,
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
        Nova{' '}
        <CaretDown size={12} weight="bold" style={{ marginLeft: 2 }} />
      </BotaoGlobal>
    </span>
  )
}

/** Botão **Salvar** das Configurações — paridade `@nucleo/botoes-salvar-global` › `BotaoSalvar`. */
export function ManualInfograficoBotaoSalvarConfiguracoesInline() {
  return (
    <span
      role="img"
      aria-label="Salvar"
      style={{
        display: 'inline-flex',
        verticalAlign: 'middle',
        marginLeft: 3,
        marginRight: -8,
        transform: 'scale(0.82)',
        transformOrigin: 'left center',
        pointerEvents: 'none',
      }}
    >
      <BotaoSalvar dirty rotulo="Salvar" />
    </span>
  )
}

export function ManualInfograficoBotaoInline({ slug }: { slug: string }) {
  if (slug === 'novo-bid-frete') {
    return <ManualInfograficoBotaoNovoBidFreteInline />
  }
  if (slug === 'ir-para-cotacao-bid-frete') {
    return <ManualInfograficoBotaoIrParaCotacaoBidFreteInline />
  }
  if (slug === 'abrir-pedido-lista-pedido') {
    return <ManualInfograficoBotaoAbrirPedidoListaPedidoInline />
  }
  if (slug === 'salvar-configuracoes') {
    return <ManualInfograficoBotaoSalvarConfiguracoesInline />
  }
  return <>{`{{botao:${slug}}}`}</>
}

function renderizarMarkupManual(texto: string, keyPrefix: string) {
  const partes: React.ReactNode[] = []
  const re = /(\*\*([^*]+)\*\*|\*\_([^*]+)\_\*|\*([^*]+)\*)/g
  let ultimo = 0
  let match: RegExpExecArray | null
  let ki = 0
  while ((match = re.exec(texto)) !== null) {
    if (match.index > ultimo) {
      partes.push(texto.slice(ultimo, match.index))
    }
    if (match[2] !== undefined) {
      partes.push(
        <strong key={`${keyPrefix}-b-${ki++}`} style={{ color: '#cbd5e1', fontWeight: 700 }}>
          {match[2]}
        </strong>,
      )
    } else if (match[3] !== undefined) {
      partes.push(
        <em key={`${keyPrefix}-is-${ki++}`} style={{ color: '#cbd5e1', fontStyle: 'italic', fontWeight: 600 }}>
          {match[3]}
        </em>,
      )
    } else if (match[4] !== undefined) {
      partes.push(
        <em key={`${keyPrefix}-i-${ki++}`} style={{ color: '#cbd5e1', fontStyle: 'italic' }}>
          {match[4]}
        </em>,
      )
    }
    ultimo = re.lastIndex
  }
  if (ultimo < texto.length) partes.push(texto.slice(ultimo))
  return partes
}

/** @deprecated Use renderizarMarkupManual — mantido para chamadas legadas no arquivo */
function renderizarNegrito(texto: string, keyPrefix: string) {
  return renderizarMarkupManual(texto, keyPrefix)
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
