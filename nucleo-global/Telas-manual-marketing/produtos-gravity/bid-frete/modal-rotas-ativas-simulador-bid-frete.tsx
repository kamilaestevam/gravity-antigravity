/**
 * Modal "Rotas Ativas" — paridade visual com visao-geral-mapa-bid-frete (produto real).
 */

import ReactDOM from 'react-dom'
import { AirplaneTilt, Anchor, ArrowRight, Eye } from '@phosphor-icons/react'
import type { PinMapaSimuladorPedido } from '../pedido/dados-mapa-globo-simulador-pedido'
import {
  formatarTerminalMapaBidFreteSimulador,
  formatarUsdSimuladorBidFrete,
  type CotacaoSimuladorBidFrete,
  type RotaDetalheSimuladorBidFrete,
} from './dados-simulador-bid-frete'
import './modal-rotas-ativas-simulador-bid-frete.css'

const DURACAO_ANIM_SVG_AEREO_S = '6.5s'
const DURACAO_ANIM_SVG_MARITIMO_S = `${(6.5 / 0.2).toFixed(1)}s`

type Props = {
  aberto: boolean
  pin: PinMapaSimuladorPedido | null
  rotas: RotaDetalheSimuladorBidFrete[]
  onFechar: () => void
  onAbrirCotacao?: (cotacao: CotacaoSimuladorBidFrete) => void
}

function formatarTerminalPin(pin: PinMapaSimuladorPedido): string {
  return formatarTerminalMapaBidFreteSimulador({
    codigo: pin.portCode,
    cidade: pin.label,
    pais: pin.country,
    flag: pin.flag,
    lat: pin.geoLat,
    lng: pin.geoLng,
  })
}

export function ModalRotasAtivasSimuladorBidFrete({
  aberto,
  pin,
  rotas,
  onFechar,
  onAbrirCotacao,
}: Props) {
  if (!aberto || !pin || typeof document === 'undefined') return null

  const tituloTerminal = formatarTerminalPin(pin)

  const modal = (
    <div
      className="dialogo-cotacao-resumida-bid-frete-internacional-overlay"
      onClick={onFechar}
    >
      <div
        className="dialogo-cotacao-resumida-bid-frete-internacional-card"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="dialogo-cotacao-resumida-bid-frete-internacional-header">
          <div className="dialogo-cotacao-resumida-bid-frete-internacional-title-group">
            <span className="dialogo-cotacao-resumida-bid-frete-internacional-flag-large">{pin.flag}</span>
            <div>
              <h2 className="dialogo-cotacao-resumida-bid-frete-internacional-title">
                Rotas Ativas: {tituloTerminal}
              </h2>
              <span className="dialogo-cotacao-resumida-bid-frete-internacional-subtitle">
                {pin.portCode} • {pin.country}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="dialogo-cotacao-resumida-bid-frete-internacional-close-btn"
            onClick={onFechar}
            aria-label="Fechar"
          >
            ✕
          </button>
        </header>

        <div className="dialogo-cotacao-resumida-bid-frete-internacional-body">
          {rotas.length === 0 ? (
            <div className="bfs-modal-rotas__vazio">
              Nenhuma rota ativa cadastrada para este terminal.
            </div>
          ) : (
            rotas.map((route) => (
              <CartaoRotaSimuladorBidFrete
                key={`${route.fromPort}|${route.toPort}|${route.mode}`}
                route={route}
                onAbrirCotacao={(cotacao) => {
                  onFechar()
                  onAbrirCotacao?.(cotacao)
                }}
              />
            ))
          )}
        </div>

        <footer className="dialogo-cotacao-resumida-bid-frete-internacional-footer">
          <button
            type="button"
            className="dialogo-cotacao-resumida-bid-frete-internacional-close-action"
            onClick={onFechar}
          >
            Fechar
          </button>
        </footer>
      </div>
    </div>
  )

  return ReactDOM.createPortal(modal, document.body)
}

function CartaoRotaSimuladorBidFrete({
  route,
  onAbrirCotacao,
}: {
  route: RotaDetalheSimuladorBidFrete
  onAbrirCotacao: (cotacao: CotacaoSimuladorBidFrete) => void
}) {
  const isAir = route.mode === 'AEREO'
  const modeColor = isAir ? '#a78bfa' : '#34d399'
  const modeIcon = isAir ? <AirplaneTilt size={14} weight="bold" /> : <Anchor size={14} weight="bold" />
  const badgeClass = isAir
    ? 'bfd-route-badge bfd-route-badge--aereo'
    : 'bfd-route-badge bfd-route-badge--maritimo'
  const cardClass = isAir
    ? 'bfd-route-card bfd-route-card--aereo'
    : 'bfd-route-card bfd-route-card--maritimo'
  const rotuloRespostas =
    route.quantidadeCotacoes === 1
      ? '1 cotação'
      : `${route.quantidadeCotacoes} cotações`
  const rotuloPreco =
    route.melhorPrecoUsd != null
      ? formatarUsdSimuladorBidFrete(route.melhorPrecoUsd)
      : 'Nenhuma resposta'
  const rotuloBotao = route.numeroCotacao ? `Abrir ${route.numeroCotacao}` : 'Ver cotação completa'
  const pathD = 'M 10,15 Q 120,-5 230,15'
  const speed = isAir ? DURACAO_ANIM_SVG_AEREO_S : DURACAO_ANIM_SVG_MARITIMO_S
  const tEmpresa = route.transitTimeDias ?? 0
  const tMercado = route.marketTransitTimeDias
  const temBenchmark = tMercado != null && tMercado > 0 && tEmpresa > 0

  return (
    <div className={cardClass}>
      <div className="bfd-route-header">
        <div className="bfd-route-ports">
          <span className="bfd-route-port-flag">{route.fromFlag}</span>
          <span className="bfd-route-port-name">{route.fromPort}</span>
          <span className="bfd-route-arrow-icon">➔</span>
          <span className="bfd-route-port-flag">{route.toFlag}</span>
          <span className="bfd-route-port-name">{route.toPort}</span>
        </div>
        <span className={badgeClass} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {modeIcon} {route.mode === 'RODOVIARIO' ? 'RODOVIÁRIO' : route.mode}
        </span>
      </div>

      <div className="bfd-route-svg-container">
        <svg width="100%" height="30" viewBox="0 0 240 30" style={{ overflow: 'visible' }}>
          <path
            d={pathD}
            fill="none"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="2"
            strokeDasharray="4,4"
          />
          <path
            d={pathD}
            fill="none"
            stroke={modeColor}
            strokeWidth="1.5"
            strokeDasharray="20, 220"
            opacity="0.8"
          >
            <animate attributeName="stroke-dashoffset" values="240;0" dur={speed} repeatCount="indefinite" />
          </path>
          <g>
            {isAir ? (
              <path
                d="M-7,-2 L-2,-2 L1,-6 L3,-6 L2,-2 L6,-1 L8,0 L6,1 L2,2 L3,6 L1,6 L-2,2 L-7,2 Z"
                fill="#a78bfa"
                style={{ filter: 'drop-shadow(0 0 3px rgba(167, 139, 250, 0.6))' }}
              />
            ) : (
              <path
                d="M-8,-2 L4,-2 L8,0 L4,2 L-8,2 Z M-5,-2 L-5,-4 L-2,-4 L-2,-2 Z"
                fill="#34d399"
                style={{ filter: 'drop-shadow(0 0 3px rgba(52, 211, 153, 0.6))' }}
              />
            )}
            <animateMotion path={pathD} dur={speed} repeatCount="indefinite" rotate="auto" />
          </g>
        </svg>
      </div>

      <div className="bfd-route-stats">
        <div className="bfd-route-stat-item">
          <span className="bfd-route-stat-label">Respostas</span>
          <span className="bfd-route-stat-value">{rotuloRespostas}</span>
        </div>
        <div className="bfd-route-stat-item">
          <span className="bfd-route-stat-label">Melhor Preço</span>
          <span className="bfd-route-stat-value">{rotuloPreco}</span>
        </div>
        <div className="bfd-route-stat-item">
          <span className="bfd-route-stat-label">Saving</span>
          <span className="bfd-route-stat-value" style={{ color: modeColor }}>
            +{route.savingPct}%
          </span>
        </div>
        <div className="bfd-route-stat-item">
          <span className="bfd-route-stat-label">Transit Time</span>
          <span className="bfd-route-stat-value">{tEmpresa > 0 ? `${tEmpresa} dias` : '0 dias'}</span>
        </div>
      </div>

      {temBenchmark ? (
        <BenchmarkTransitTime tEmpresa={tEmpresa} tMercado={tMercado!} modeColor={modeColor} />
      ) : (
        <p className="bfs-modal-rotas__benchmark-indisponivel">
          Benchmark de trânsito indisponível — aguardando propostas na rota.
        </p>
      )}

      <div className="bfs-modal-rotas__rodape-cotacao">
        <span>{route.numeroCotacao ? <strong>{route.numeroCotacao}</strong> : null}</span>
        {route.cotacao ? (
          <button
            type="button"
            className="bfs-modal-rotas__btn-abrir"
            style={{
              borderColor: isAir ? 'rgba(167, 139, 250, 0.25)' : 'rgba(52, 211, 153, 0.25)',
              color: isAir ? '#c084fc' : '#34d399',
              background: isAir ? 'rgba(167, 139, 250, 0.12)' : 'rgba(52, 211, 153, 0.12)',
            }}
            onClick={(e) => {
              e.stopPropagation()
              onAbrirCotacao(route.cotacao!)
            }}
          >
            <Eye size={12} weight="bold" />
            <span>{rotuloBotao}</span>
            <ArrowRight size={10} weight="bold" />
          </button>
        ) : null}
      </div>
    </div>
  )
}

function BenchmarkTransitTime({
  tEmpresa,
  tMercado,
  modeColor,
}: {
  tEmpresa: number
  tMercado: number
  modeColor: string
}) {
  const diff = tMercado - tEmpresa
  const pct = Math.round((diff / tMercado) * 100)
  const pctBarra = Math.min(100, Math.max(0, 50 + pct / 2))

  return (
    <div className="bfs-modal-rotas__benchmark">
      <span className="bfs-modal-rotas__benchmark-titulo">Benchmarking Transit Time</span>
      <div className="bfs-modal-rotas__benchmark-barra">
        <span style={{ width: `${pctBarra}%`, background: modeColor }} />
      </div>
      <p className="bfs-modal-rotas__benchmark-legenda">
        Sua Empresa: {tEmpresa}d vs Mercado: {tMercado}d
      </p>
      <p className="bfs-modal-rotas__benchmark-sub">
        {diff > 0
          ? 'mais rápido que a média das propostas na rota'
          : diff < 0
            ? 'mais lento que a média das propostas na rota'
            : 'igual à média das propostas na rota'}
      </p>
    </div>
  )
}
