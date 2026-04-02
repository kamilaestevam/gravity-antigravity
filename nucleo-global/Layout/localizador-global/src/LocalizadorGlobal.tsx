import React, { useState, useRef, useEffect, useCallback } from 'react'
import './localizador-global.css'
import type { EcosystemNode, LocalizadorEntry, LocalizadorGlobalProps } from './types'

// ── Posições fixas dos produtos na órbita (máx 6 slots) ─────────────────────
const PRODUCT_SLOTS = [
  { cx: 220, cy: 58  },
  { cx: 448, cy: 82  },
  { cx: 478, cy: 170 },
  { cx: 408, cy: 255 },
  { cx: 215, cy: 255 },
  { cx: 185, cy: 170 },
] as const

const GRAVITY_CX   = 330
const GRAVITY_CY   = 148
const CONFIG_CX    = 82
const CONFIG_CY    = 148
const PROCESSO_CX  = 330
const PROCESSO_CY  = 293

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function hex(color: string, alpha: string): string {
  return `${color}${alpha}`
}

// ── Sub-componente: nó de produto no SVG ─────────────────────────────────────

interface ProductNodeProps {
  node: EcosystemNode
  cx: number
  cy: number
  isCurrent: boolean
  isHovered: boolean
  onHover: (id: string | null) => void
  onClick: (node: EcosystemNode) => void
}

function ProductNode({ node, cx, cy, isCurrent, isHovered, onHover, onClick }: ProductNodeProps) {
  const r    = isCurrent ? 28 : node.status === 'locked' ? 18 : 23
  const fill = node.status === 'locked' ? 'url(#lcg-g-locked)' : `url(#lcg-g-${node.id})`
  const opacity = node.status === 'locked' ? 0.5 : isHovered ? 1 : 0.85

  const shortLabel = node.label.length > 8 ? node.label.slice(0, 7) + '…' : node.label

  return (
    <g
      className={`lcg-node ${node.status === 'locked' ? 'lcg-node--locked' : ''}`}
      data-id={node.id}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => node.status !== 'locked' && onClick(node)}
      style={{ cursor: node.status === 'locked' ? 'default' : 'pointer' }}
    >
      {/* Pulse ring for current */}
      {isCurrent && (
        <>
          <circle cx={cx} cy={cy} r={r + 6} fill="none" stroke={node.color} strokeWidth="1">
            <animate attributeName="r"       values={`${r+4};${r+14};${r+4}`} dur="2.8s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values=".6;0;.6"                  dur="2.8s" repeatCount="indefinite"/>
          </circle>
          <circle cx={cx} cy={cy} r={r + 2} fill="none" stroke={node.color} strokeWidth="1.5" opacity=".4"/>
        </>
      )}

      <circle
        cx={cx} cy={cy} r={r}
        fill={fill}
        filter={isCurrent ? 'url(#lcg-glow-strong)' : 'url(#lcg-glow-soft)'}
        opacity={opacity}
      />
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={node.status === 'locked' ? '#374151' : isCurrent ? node.color : `${node.color}44`}
        strokeWidth={isCurrent ? 2 : 1}
        strokeDasharray={node.status === 'locked' ? '3 3' : undefined}
      />

      {/* Current badge */}
      {isCurrent && (
        <>
          <circle cx={cx + r - 2} cy={cy - r + 2} r={6} fill="#0c0e16" stroke={node.color} strokeWidth="1.5"/>
          <text x={cx + r - 2} y={cy - r + 5.5} textAnchor="middle" fontSize="7" fontWeight="900" fill={node.color} fontFamily="Inter,system-ui">✦</text>
        </>
      )}

      {/* Label */}
      {node.status !== 'locked' ? (
        <>
          <text x={cx} y={cy - 3} textAnchor="middle" fontSize={isCurrent ? 8.5 : 8} fontWeight="800" fill="#fff" fontFamily="Inter,system-ui" letterSpacing=".02em">
            {shortLabel.toUpperCase()}
          </text>
          <text x={cx} y={cy + 8} textAnchor="middle" fontSize="7" fill={`${node.color}cc`} fontFamily="Inter,system-ui">
            {node.sublabel}
          </text>
        </>
      ) : (
        <>
          <text x={cx} y={cy - 2} textAnchor="middle" fontSize="8" fontWeight="700" fill="#4b5563" fontFamily="Inter,system-ui">+prod</text>
          <text x={cx} y={cy + 8} textAnchor="middle" fontSize="6.5" fill="#37415170" fontFamily="Inter,system-ui">breve</text>
        </>
      )}
    </g>
  )
}

// ── Sub-componente: tooltip ───────────────────────────────────────────────────

interface MapTooltipProps {
  node: EcosystemNode | null
  x: number
  y: number
}

function MapTooltip({ node, x, y }: MapTooltipProps) {
  if (!node) return null

  const badgeLabel =
    node.status === 'current'    ? 'Você está aqui'    :
    node.status === 'accessible' ? 'Clique para navegar' :
    'Em breve'

  const badgeCls =
    node.status === 'current'    ? 'lcg-badge--here' :
    node.status === 'accessible' ? 'lcg-badge--nav'  :
    'lcg-badge--lock'

  return (
    <div className="lcg-map-tooltip" style={{ left: x, top: y }}>
      <div className="lcg-map-tooltip__title" style={{ color: node.color }}>{node.label}</div>
      <div className="lcg-map-tooltip__sub">{node.sublabel}</div>
      <span className={`lcg-badge ${badgeCls}`}>{badgeLabel}</span>
    </div>
  )
}

// ── Sub-componente: linha do histórico ───────────────────────────────────────

interface HistoryItemProps {
  entry: LocalizadorEntry
  index: number
  total: number
  isCurrent: boolean
}

function HistoryItem({ entry, index, total, isCurrent }: HistoryItemProps) {
  return (
    <div className={`lcg-history-item ${isCurrent ? 'lcg-history-item--current' : ''}`}>
      <div className="lcg-history-item__line">
        {index < total - 1 && <div className="lcg-history-item__connector"/>}
      </div>
      <div className="lcg-history-item__dot" style={{ background: isCurrent ? entry.productColor : `${entry.productColor}60`, boxShadow: isCurrent ? `0 0 6px ${entry.productColor}` : 'none' }}/>
      <div className="lcg-history-item__content">
        <span className="lcg-history-item__product" style={{ color: isCurrent ? entry.productColor : undefined }}>
          {entry.productLabel}
        </span>
        <span className="lcg-history-item__sep">›</span>
        <span className="lcg-history-item__page">{entry.pageLabel}</span>
      </div>
      <div className="lcg-history-item__time">{formatTime(entry.timestamp)}</div>
    </div>
  )
}

// ── Componente principal ─────────────────────────────────────────────────────

export function LocalizadorGlobal({
  workspaceName,
  iconOnly = false,
  currentProductId,
  currentProductLabel,
  currentProductColor,
  currentPageLabel,
  history,
  nodes,
  onNavigate,
}: LocalizadorGlobalProps) {
  const [isOpen,      setIsOpen]     = useState(false)
  const [hoveredId,   setHoveredId]  = useState<string | null>(null)
  const [tooltipPos,  setTooltipPos] = useState({ x: 0, y: 0 })
  const [activeTab,   setActiveTab]  = useState<'mapa' | 'historico'>('mapa')

  const panelRef = useRef<HTMLDivElement>(null)
  const svgRef   = useRef<SVGSVGElement>(null)

  // Fechar ao clicar fora
  useEffect(() => {
    if (!isOpen) return
    function handle(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [isOpen])

  // Fechar com Esc
  useEffect(() => {
    if (!isOpen) return
    function handle(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [isOpen])

  const handleNodeHover = useCallback((id: string | null, e?: React.MouseEvent<SVGGElement>) => {
    setHoveredId(id)
    if (id && e && svgRef.current) {
      const svgRect = svgRef.current.getBoundingClientRect()
      const panelRect = panelRef.current?.getBoundingClientRect()
      if (panelRect) {
        setTooltipPos({
          x: e.clientX - panelRect.left,
          y: e.clientY - panelRect.top - 72,
        })
      }
    }
  }, [])

  const handleNavigate = useCallback((node: EcosystemNode) => {
    onNavigate(node)
    setIsOpen(false)
  }, [onNavigate])

  // Separar nós por tipo
  const produtoNodes    = nodes.filter(n => n.type === 'produto')
  const processoNode    = nodes.find(n => n.type === 'processo')
  const gravityNode     = nodes.find(n => n.type === 'gravity')
  const configuradorNode = nodes.find(n => n.type === 'configurador')
  const hoveredNode     = nodes.find(n => n.id === hoveredId) ?? null

  // Preencher slots com nós ou placeholders locked
  const productSlots: (EcosystemNode | null)[] = PRODUCT_SLOTS.map((_, i) =>
    produtoNodes[i] ?? null
  )

  // Gradientes dinâmicos para cada produto
  const gradientDefs = produtoNodes.map(n => (
    <radialGradient key={n.id} id={`lcg-g-${n.id}`} cx="50%" cy="30%" r="60%">
      <stop offset="0%"   stopColor={n.color} stopOpacity=".9"/>
      <stop offset="100%" stopColor={n.color} stopOpacity=".5"/>
    </radialGradient>
  ))

  return (
    <div className="lcg-wrap" ref={panelRef}>

      {/* ── Trigger button (vai no header superior direito) ── */}
      <button
        className={`lcg-trigger${isOpen ? ' lcg-trigger--active' : ''}${iconOnly ? ' lcg-trigger--icon' : ''}`}
        style={{ '--lcg-color': currentProductColor } as React.CSSProperties}
        onClick={() => setIsOpen((v: boolean) => !v)}
        aria-label="Onde estou — abrir mapa do ecossistema"
        title="Onde estou"
        aria-expanded={isOpen}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" opacity=".5"/>
        </svg>
        {!iconOnly && (
          <span className="lcg-trigger__label">
            {currentProductLabel} <span style={{ opacity: 0.4, fontWeight: 'normal', margin: '0 2px' }}>›</span> {currentPageLabel}
          </span>
        )}
        <span className="lcg-trigger__pulse"/>
      </button>

      {/* ── Panel overlay ── */}
      {isOpen && (
        <div className="lcg-panel" role="dialog" aria-label="Mapa do ecossistema Gravity">

          {/* Header */}
          <div className="lcg-panel__header">
            <div className="lcg-panel__header-left">
              <div className="lcg-panel__header-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="3" stroke={currentProductColor} strokeWidth="2"/>
                  <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke={currentProductColor} strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="12" r="9" stroke={`${currentProductColor}55`} strokeWidth="1.5" strokeDasharray="3 3"/>
                </svg>
              </div>
              <div>
                <div className="lcg-panel__title">Onde estou</div>
                <div className="lcg-panel__subtitle">Ecossistema Gravity</div>
              </div>
            </div>

            <div className="lcg-panel__header-right">
              <div className="lcg-breadcrumb">
                <span className="lcg-breadcrumb__item lcg-breadcrumb__item--current" style={{ color: currentProductColor }}>
                  {workspaceName}
                </span>
                <span className="lcg-breadcrumb__sep">›</span>
                <span className="lcg-breadcrumb__item lcg-breadcrumb__item--current" style={{ color: currentProductColor }}>
                  {currentProductLabel}
                </span>
                <span className="lcg-breadcrumb__sep">·</span>
                <span className="lcg-breadcrumb__page">{currentPageLabel}</span>
              </div>
              <button className="lcg-close" onClick={() => setIsOpen(false)} aria-label="Fechar">✕</button>
            </div>
          </div>

          {/* Tabs */}
          <div className="lcg-tabs">
            <button
              className={`lcg-tab ${activeTab === 'mapa' ? 'lcg-tab--active' : ''}`}
              style={activeTab === 'mapa' ? { color: currentProductColor, borderBottomColor: currentProductColor } : undefined}
              onClick={() => setActiveTab('mapa')}
            >
              Mapa do Ecossistema
            </button>
            <button
              className={`lcg-tab ${activeTab === 'historico' ? 'lcg-tab--active' : ''}`}
              style={activeTab === 'historico' ? { color: currentProductColor, borderBottomColor: currentProductColor } : undefined}
              onClick={() => setActiveTab('historico')}
            >
              Histórico de Navegação
              {history.length > 0 && (
                <span className="lcg-tab__badge">{history.length}</span>
              )}
            </button>
          </div>

          {/* ── TAB: MAPA ── */}
          {activeTab === 'mapa' && (
            <div className="lcg-graph">
              <svg
                ref={svgRef}
                width="100%"
                height="340"
                viewBox="0 0 760 320"
                style={{ display: 'block' }}
              >
                <defs>
                  {/* Static gradients */}
                  <radialGradient id="lcg-g-gravity" cx="50%" cy="30%" r="60%">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity=".95"/>
                    <stop offset="100%" stopColor="#312e81" stopOpacity=".9"/>
                  </radialGradient>
                  <radialGradient id="lcg-g-configurador" cx="50%" cy="30%" r="60%">
                    <stop offset="0%" stopColor="#f9a8d4" stopOpacity=".95"/>
                    <stop offset="100%" stopColor="#9d174d" stopOpacity=".9"/>
                  </radialGradient>
                  <radialGradient id="lcg-g-locked" cx="50%" cy="30%" r="60%">
                    <stop offset="0%" stopColor="#374151" stopOpacity=".8"/>
                    <stop offset="100%" stopColor="#111827" stopOpacity=".8"/>
                  </radialGradient>

                  {/* Dynamic gradients por produto */}
                  {gradientDefs}

                  {/* Filters */}
                  <filter id="lcg-glow-strong" x="-60%" y="-60%" width="220%" height="220%">
                    <feGaussianBlur stdDeviation="6" result="b"/>
                    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                  <filter id="lcg-glow-soft" x="-40%" y="-40%" width="180%" height="180%">
                    <feGaussianBlur stdDeviation="3" result="b"/>
                    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>

                {/* Órbita */}
                <ellipse cx={GRAVITY_CX} cy={GRAVITY_CY} rx="148" ry="118"
                  fill="none" stroke="#1e2538" strokeWidth="1" strokeDasharray="5 7" opacity=".6"/>

                {/* Arco do Processo */}
                <path d="M 118 262 Q 330 218 542 262"
                  fill="none" stroke="#facc1525" strokeWidth="1.5" strokeDasharray="5 5"/>

                {/* Conexões Gravity → Produtos */}
                {productSlots.map((node, i) => {
                  if (!node) return null
                  const pos = PRODUCT_SLOTS[i]
                  const isCurrent = node.id === currentProductId
                  return (
                    <line key={node.id}
                      x1={GRAVITY_CX} y1={GRAVITY_CY}
                      x2={pos.cx} y2={pos.cy}
                      stroke={isCurrent ? `${node.color}45` : `${node.color}18`}
                      strokeWidth={isCurrent ? 1.8 : 1.4}
                    />
                  )
                })}

                {/* Conexão Gravity → Configurador (isolada, tracejada) */}
                <line x1={GRAVITY_CX} y1={GRAVITY_CY} x2={CONFIG_CX} y2={CONFIG_CY}
                  stroke="#f472b628" strokeWidth="1.5" strokeDasharray="6 5"/>
                <circle cx={175} cy={CONFIG_CY} r={3}
                  fill="#0c0e16" stroke="#f472b630" strokeWidth="1.5"/>

                {/* Linhas Processo → cada produto (tracejadas) */}
                {productSlots.map((node, i) => {
                  if (!node || node.status === 'locked') return null
                  const pos = PRODUCT_SLOTS[i]
                  return (
                    <line key={`proc-${node.id}`}
                      x1={PROCESSO_CX} y1={PROCESSO_CY}
                      x2={pos.cx} y2={pos.cy}
                      stroke="#facc1512" strokeWidth="1.2" strokeDasharray="4 5"
                    />
                  )
                })}

                {/* ── GRAVITY (centro) ── */}
                {(() => {
                  const isGravityCurrent = currentProductId === 'gravity'
                  return (
                    <g
                      className="lcg-node"
                      data-id="gravity"
                      onMouseEnter={e => handleNodeHover('gravity', e)}
                      onMouseLeave={() => handleNodeHover(null)}
                      onClick={() => gravityNode && handleNavigate(gravityNode)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Pulse ring — aparece quando o usuário está no gravity (Core/Hub) */}
                      {isGravityCurrent && (
                        <>
                          <circle cx={GRAVITY_CX} cy={GRAVITY_CY} r={46} fill="none" stroke="#818cf8" strokeWidth="1">
                            <animate attributeName="r"       values="44;54;44" dur="2.8s" repeatCount="indefinite"/>
                            <animate attributeName="opacity" values=".5;0;.5"  dur="2.8s" repeatCount="indefinite"/>
                          </circle>
                          <circle cx={GRAVITY_CX} cy={GRAVITY_CY} r={43} fill="none" stroke="#818cf8" strokeWidth="1.5" opacity=".35"/>
                        </>
                      )}
                      <circle cx={GRAVITY_CX} cy={GRAVITY_CY} r={40}
                        fill="url(#lcg-g-gravity)"
                        filter="url(#lcg-glow-strong)" opacity=".92"/>
                      <circle cx={GRAVITY_CX} cy={GRAVITY_CY} r={40}
                        fill="none" stroke={isGravityCurrent ? '#818cf8' : '#818cf855'} strokeWidth={isGravityCurrent ? 2 : 1.5}/>
                      {/* Badge ✦ quando está aqui */}
                      {isGravityCurrent && (
                        <>
                          <circle cx={GRAVITY_CX + 38} cy={GRAVITY_CY - 38} r={7} fill="#0c0e16" stroke="#818cf8" strokeWidth="1.5"/>
                          <text x={GRAVITY_CX + 38} y={GRAVITY_CY - 34.5} textAnchor="middle" fontSize="8" fontWeight="900" fill="#818cf8" fontFamily="Inter,system-ui">✦</text>
                        </>
                      )}
                      <text x={GRAVITY_CX} y={GRAVITY_CY - 10} textAnchor="middle"
                        fontSize="11" fontWeight="900" fill="#fff" fontFamily="Inter,system-ui" letterSpacing=".03em">
                        GRAVITY
                      </text>
                      {/* Mostra onde o usuário está (Core / Hub / etc.) */}
                      <text x={GRAVITY_CX} y={GRAVITY_CY + 3} textAnchor="middle"
                        fontSize={isGravityCurrent ? 9 : 8.5} fontWeight={isGravityCurrent ? '700' : '400'} fill={isGravityCurrent ? '#c4b5fd' : '#c4b5fd90'} fontFamily="Inter,system-ui">
                        {isGravityCurrent ? currentPageLabel : workspaceName}
                      </text>
                      <text x={GRAVITY_CX} y={GRAVITY_CY + 15} textAnchor="middle"
                        fontSize="7.5" fill="#818cf860" fontFamily="Inter,system-ui">
                        {workspaceName}
                      </text>
                    </g>
                  )
                })()}

                {/* ── CONFIGURADOR (isolado, esquerda) ── */}
                <g
                  className="lcg-node"
                  data-id="configurador"
                  onMouseEnter={e => handleNodeHover('configurador', e)}
                  onMouseLeave={() => handleNodeHover(null)}
                  onClick={() => configuradorNode && handleNavigate(configuradorNode)}
                  style={{ cursor: 'pointer' }}
                >
                  <circle cx={CONFIG_CX} cy={CONFIG_CY} r={28}
                    fill="url(#lcg-g-configurador)"
                    filter="url(#lcg-glow-soft)" opacity=".85"/>
                  <circle cx={CONFIG_CX} cy={CONFIG_CY} r={28}
                    fill="none" stroke="#f472b640" strokeWidth="1.5" strokeDasharray="3 2"/>
                  <text x={CONFIG_CX} y={CONFIG_CY - 5} textAnchor="middle"
                    fontSize="8.5" fontWeight="800" fill="#fff" fontFamily="Inter,system-ui">
                    CONFIG
                  </text>
                  <text x={CONFIG_CX} y={CONFIG_CY + 7} textAnchor="middle"
                    fontSize="7" fill="#fce7f390" fontFamily="Inter,system-ui">
                    auth · billing
                  </text>
                  {/* Badge isolado */}
                  <rect x={CONFIG_CX - 24} y={CONFIG_CY - 44} width="48" height="13" rx="4"
                    fill="#0c0e16" stroke="#f472b630" strokeWidth="1"/>
                  <text x={CONFIG_CX} y={CONFIG_CY - 34} textAnchor="middle"
                    fontSize="7" fontWeight="700" fill="#f472b470" fontFamily="Inter,system-ui" letterSpacing=".05em">
                    ISOLADO
                  </text>
                </g>

                {/* ── PRODUTOS (órbita) ── */}
                {productSlots.map((node, i) => {
                  const pos = PRODUCT_SLOTS[i]
                  const placeholderId = `locked-slot-${i}`
                  const effectiveNode: EcosystemNode = node ?? {
                    id: placeholderId,
                    label: '+',
                    sublabel: 'em breve',
                    color: '#374151',
                    type: 'produto',
                    status: 'locked',
                  }
                  return (
                    <ProductNode
                      key={effectiveNode.id}
                      node={effectiveNode}
                      cx={pos.cx}
                      cy={pos.cy}
                      isCurrent={effectiveNode.id === currentProductId}
                      isHovered={hoveredId === effectiveNode.id}
                      onHover={(id) => setHoveredId(id)}
                      onClick={handleNavigate}
                    />
                  )
                })}

                {/* ── PROCESSO (pílula inferior) ── */}
                {processoNode && (
                  <g
                    className="lcg-node"
                    data-id="processo"
                    onMouseEnter={e => handleNodeHover('processo', e)}
                    onMouseLeave={() => handleNodeHover(null)}
                    onClick={() => processoNode && handleNavigate(processoNode)}
                    style={{ cursor: 'pointer' }}
                  >
                    <rect x={PROCESSO_CX - 72} y={PROCESSO_CY - 16} width="144" height="32"
                      rx="16" fill="#facc1508" stroke="#facc1530" strokeWidth="1.5" strokeDasharray="5 4"/>
                    <text x={PROCESSO_CX} y={PROCESSO_CY - 2} textAnchor="middle"
                      fontSize="9" fontWeight="800" fill="#fde68a" fontFamily="Inter,system-ui" letterSpacing=".06em">
                      PROCESSO
                    </text>
                    <text x={PROCESSO_CX} y={PROCESSO_CY + 10} textAnchor="middle"
                      fontSize="7.5" fill="#facc1570" fontFamily="Inter,system-ui">
                      {processoNode.sublabel}
                    </text>
                  </g>
                )}
              </svg>

              {/* Tooltip flutuante */}
              <MapTooltip node={hoveredNode} x={tooltipPos.x} y={tooltipPos.y}/>
            </div>
          )}

          {/* ── TAB: HISTÓRICO ── */}
          {activeTab === 'historico' && (
            <div className="lcg-history">
              {history.length === 0 ? (
                <div className="lcg-history__empty">
                  <span>Nenhuma navegação registrada nessa sessão</span>
                </div>
              ) : (
                <div className="lcg-history__list">
                  {history.map((entry, i) => (
                    <HistoryItem
                      key={`${entry.pagePath}-${entry.timestamp}`}
                      entry={entry}
                      index={i}
                      total={history.length}
                      isCurrent={i === history.length - 1}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="lcg-panel__footer">
            <div className="lcg-legend">
              <div className="lcg-legend__item">
                <div className="lcg-legend__dot" style={{ background: currentProductColor, boxShadow: `0 0 6px ${currentProductColor}` }}/>
                <span>Você está aqui</span>
              </div>
              <div className="lcg-legend__item">
                <div className="lcg-legend__dot" style={{ background: '#818cf8' }}/>
                <span>Acessível</span>
              </div>
              <div className="lcg-legend__item">
                <div className="lcg-legend__dot" style={{ background: '#f472b6' }}/>
                <span>Configurador (isolado)</span>
              </div>
              <div className="lcg-legend__item">
                <div className="lcg-legend__dash"/>
                <span>Em breve</span>
              </div>
            </div>
            <span className="lcg-panel__hint">Clique num nó para navegar</span>
          </div>
        </div>
      )}
    </div>
  )
}
