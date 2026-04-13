import React, { useState, useRef, useEffect, useCallback } from 'react'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import './localizador-global.css'
import type { EcosystemNode, LocalizadorEntry, LocalizadorGlobalProps } from './types'

// ── Coordenadas do novo layout ────────────────────────────────────────────────
//
//  [Configurador]
//      ↑ (dashed)
//  [HUB] ──────── [CORE] ──→ [Produto A]
//    ↓                    ↘  [Produto B]
//  [HUB Store]                [Produto C...]
//
const HUB_CX    = 248
const HUB_CY    = 155
const CORE_CX   = 430
const CORE_CY   = 155
const CONFIG_CX = 88
const CONFIG_CY = 82
const STORE_CX  = 158
const STORE_CY  = 255

// Slots de produtos — fan-out à direita do CORE (máx 6)
const PRODUCT_SLOTS = [
  { cx: 598, cy: 58  },
  { cx: 668, cy: 103 },
  { cx: 688, cy: 155 },
  { cx: 668, cy: 207 },
  { cx: 598, cy: 255 },
  { cx: 522, cy: 272 },
] as const

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

// ── Sub-componente: nó de produto ─────────────────────────────────────────────

interface ProductNodeProps {
  node: EcosystemNode
  cx: number
  cy: number
  isCurrent: boolean
  isVisited: boolean
  isHovered: boolean
  onHover: (id: string | null) => void
  onClick: (node: EcosystemNode) => void
}

function ProductNode({ node, cx, cy, isCurrent, isVisited, isHovered, onHover, onClick }: ProductNodeProps) {
  const isLocked = node.status === 'locked'
  const r        = isCurrent ? 27 : isLocked ? 16 : 22
  const fill     = isLocked ? 'url(#lcg-g-locked)' : `url(#lcg-g-${node.id})`
  const opacity  = isLocked ? 0.4 : isCurrent ? 1 : isVisited ? 0.9 : isHovered ? 0.85 : 0.65

  const shortLabel = node.label.length > 8 ? node.label.slice(0, 7) + '…' : node.label

  return (
    <g
      className={`lcg-node ${isLocked ? 'lcg-node--locked' : ''}`}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => !isLocked && onClick(node)}
      style={{ cursor: isLocked ? 'default' : 'pointer' }}
    >
      {/* Pulse ring para nó atual */}
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
        filter={isCurrent ? 'url(#lcg-glow-strong)' : isVisited ? 'url(#lcg-glow-soft)' : 'none'}
        opacity={opacity}
      />
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={
          isLocked   ? '#94a3b855'         :
          isCurrent  ? node.color          :
          isVisited  ? `${node.color}70`   :
          `${node.color}28`
        }
        strokeWidth={isCurrent ? 2 : 1}
        strokeDasharray={isLocked ? '3 3' : undefined}
      />

      {/* Badge ✦ quando está aqui */}
      {isCurrent && (
        <>
          <circle cx={cx + r - 2} cy={cy - r + 2} r={6} fill="#0c0e16" stroke={node.color} strokeWidth="1.5"/>
          <text x={cx + r - 2} y={cy - r + 5.5} textAnchor="middle" fontSize="7" fontWeight="900" fill={node.color} fontFamily="Inter,system-ui">✦</text>
        </>
      )}

      {/* Label — placeholder vazio mostra "+prod", produto real sempre mostra o nome */}
      {node.id.startsWith('locked-') ? (
        <>
          <text x={cx} y={cy - 2} textAnchor="middle" fontSize="8" fontWeight="700" fill="#94a3b8" fontFamily="Inter,system-ui">+prod</text>
          <text x={cx} y={cy + 8} textAnchor="middle" fontSize="6.5" fill="#94a3b899" fontFamily="Inter,system-ui">breve</text>
        </>
      ) : (
        <>
          <text x={cx} y={cy - 2} textAnchor="middle" fontSize={isCurrent ? 8.5 : 8} fontWeight="800"
            fill={isLocked ? '#6b7280' : isVisited ? '#fff' : '#94a3b8'}
            fontFamily="Inter,system-ui" letterSpacing=".02em">
            {shortLabel.toUpperCase()}
          </text>
          <text x={cx} y={cy + 9} textAnchor="middle" fontSize="7"
            fill={isLocked ? '#37415199' : isVisited ? `${node.color}cc` : '#47556980'}
            fontFamily="Inter,system-ui">
            {node.sublabel}
          </text>
        </>
      )}
    </g>
  )
}

// ── Sub-componente: tooltip flutuante ────────────────────────────────────────

interface MapTooltipProps {
  node: EcosystemNode | null
  x: number
  y: number
  isVisited: boolean
}

function MapTooltip({ node, x, y, isVisited }: MapTooltipProps) {
  if (!node) return null

  const badgeLabel =
    node.status === 'current'    ? 'Você está aqui'                            :
    node.status === 'accessible' ? (isVisited ? 'Visitado · Clique para ir' : 'Clique para navegar') :
    'Não contratado'

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
      <div className="lcg-history-item__dot" style={{
        background: isCurrent ? entry.productColor : `${entry.productColor}60`,
        boxShadow: isCurrent ? `0 0 6px ${entry.productColor}` : 'none',
      }}/>
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
  visitedNodeIds = [],
  onNavigate,
}: LocalizadorGlobalProps) {
  const [isOpen,     setIsOpen]    = useState(false)
  const [hoveredId,  setHoveredId] = useState<string | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const [activeTab,  setActiveTab] = useState<'mapa' | 'historico'>('mapa')

  const panelRef = useRef<HTMLDivElement>(null)
  const svgRef   = useRef<SVGSVGElement>(null)

  // Fechar ao clicar fora
  useEffect(() => {
    if (!isOpen) return
    function handle(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [isOpen])

  // Fechar com Esc
  useEffect(() => {
    if (!isOpen) return
    function handle(e: KeyboardEvent) { if (e.key === 'Escape') setIsOpen(false) }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [isOpen])

  const handleNodeHover = useCallback((id: string | null, e?: React.MouseEvent<SVGGElement>) => {
    setHoveredId(id)
    if (id && e && panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect()
      setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top - 72 })
    }
  }, [])

  const handleNavigate = useCallback((node: EcosystemNode) => {
    onNavigate(node)
    setIsOpen(false)
  }, [onNavigate])

  // Separar nós por tipo
  const hubNode          = nodes.find(n => n.type === 'hub')
  const coreNode         = nodes.find(n => n.type === 'core')
  const configuradorNode = nodes.find(n => n.type === 'configurador')
  const hubStoreNode     = nodes.find(n => n.type === 'hub-store')
  const produtoNodes     = nodes.filter(n => n.type === 'produto')
  const hoveredNode      = nodes.find(n => n.id === hoveredId) ?? null

  // Rastro de navegação
  const visited        = new Set([...visitedNodeIds, currentProductId])
  const isCoreVisited  = visited.has('core')
  const isStoreVisited = visited.has('hub-store')

  // Atalho: produto atual sem ter passado pelo CORE
  const currentProdSlotIdx = produtoNodes.findIndex(n => n.id === currentProductId)
  const usedShortcut = currentProdSlotIdx >= 0 && !isCoreVisited

  // Slots preenchidos
  const productSlots: (EcosystemNode | null)[] = PRODUCT_SLOTS.map((_, i) => produtoNodes[i] ?? null)

  // Gradientes dinâmicos por produto
  const gradientDefs = produtoNodes.map(n => (
    <radialGradient key={n.id} id={`lcg-g-${n.id}`} cx="50%" cy="30%" r="60%">
      <stop offset="0%"   stopColor={n.color} stopOpacity=".9"/>
      <stop offset="100%" stopColor={n.color} stopOpacity=".5"/>
    </radialGradient>
  ))

  return (
    <div className="lcg-wrap" ref={panelRef}>

      {/* ── Trigger ── */}
      <TooltipGlobal descricao="Onde estou — abrir mapa do ecossistema">
        <button
          className={`lcg-trigger${isOpen ? ' lcg-trigger--active' : ''}${iconOnly ? ' lcg-trigger--icon' : ''}`}
          style={{ '--lcg-color': currentProductColor } as React.CSSProperties}
          onClick={() => setIsOpen(v => !v)}
          aria-label="Onde estou — abrir mapa do ecossistema"
          aria-expanded={isOpen}
        >
          <div className="lcg-trigger__icon-wrap">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.9"/>
              <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
            </svg>
            <span className="lcg-trigger__orbit"/>
          </div>
          {!iconOnly && (
            <span className="lcg-trigger__label">
              {currentProductLabel}
              <span style={{ opacity: 0.4, fontWeight: 'normal', margin: '0 2px' }}>›</span>
              {currentPageLabel}
            </span>
          )}
        </button>
      </TooltipGlobal>

      {/* ── Painel ── */}
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
              {history.length > 0 && <span className="lcg-tab__badge">{history.length}</span>}
            </button>
          </div>

          {/* ── TAB: MAPA ── */}
          {activeTab === 'mapa' && (
            <div className="lcg-graph">
              <svg
                ref={svgRef}
                width="100%"
                height="330"
                viewBox="0 0 760 310"
                style={{ display: 'block' }}
              >
                <defs>
                  {/* Gradientes estáticos */}
                  <radialGradient id="lcg-g-hub" cx="50%" cy="30%" r="60%">
                    <stop offset="0%"   stopColor="#818cf8" stopOpacity=".95"/>
                    <stop offset="100%" stopColor="#312e81" stopOpacity=".9"/>
                  </radialGradient>
                  <radialGradient id="lcg-g-core" cx="50%" cy="30%" r="60%">
                    <stop offset="0%"   stopColor="#a78bfa" stopOpacity=".95"/>
                    <stop offset="100%" stopColor="#4c1d95" stopOpacity=".9"/>
                  </radialGradient>
                  <radialGradient id="lcg-g-core-dim" cx="50%" cy="30%" r="60%">
                    <stop offset="0%"   stopColor="#2d3748" stopOpacity=".9"/>
                    <stop offset="100%" stopColor="#1a202c" stopOpacity=".9"/>
                  </radialGradient>
                  <radialGradient id="lcg-g-configurador" cx="50%" cy="30%" r="60%">
                    <stop offset="0%"   stopColor="#f9a8d4" stopOpacity=".95"/>
                    <stop offset="100%" stopColor="#9d174d" stopOpacity=".9"/>
                  </radialGradient>
                  <radialGradient id="lcg-g-hub-store" cx="50%" cy="30%" r="60%">
                    <stop offset="0%"   stopColor="#fbbf24" stopOpacity=".9"/>
                    <stop offset="100%" stopColor="#92400e" stopOpacity=".85"/>
                  </radialGradient>
                  <radialGradient id="lcg-g-locked" cx="50%" cy="30%" r="60%">
                    <stop offset="0%"   stopColor="#374151" stopOpacity=".8"/>
                    <stop offset="100%" stopColor="#111827" stopOpacity=".8"/>
                  </radialGradient>

                  {/* Gradientes dinâmicos por produto */}
                  {gradientDefs}

                  {/* Filtros */}
                  <filter id="lcg-glow-strong" x="-60%" y="-60%" width="220%" height="220%">
                    <feGaussianBlur stdDeviation="6" result="b"/>
                    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                  <filter id="lcg-glow-soft" x="-40%" y="-40%" width="180%" height="180%">
                    <feGaussianBlur stdDeviation="3" result="b"/>
                    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>

                {/* ── Espinha principal: HUB → CORE ── */}
                <line
                  x1={HUB_CX} y1={HUB_CY}
                  x2={CORE_CX} y2={CORE_CY}
                  stroke={isCoreVisited ? '#818cf840' : '#1e253870'}
                  strokeWidth={isCoreVisited ? 2.5 : 1.5}
                />
                {/* Seta direcional na linha HUB→CORE */}
                <polygon
                  points={`${CORE_CX - 52},${CORE_CY - 5} ${CORE_CX - 42},${CORE_CY} ${CORE_CX - 52},${CORE_CY + 5}`}
                  fill={isCoreVisited ? '#818cf840' : '#1e253870'}
                />

                {/* ── Atalho direto: HUB → produto atual (se pulou o CORE) ── */}
                {usedShortcut && currentProdSlotIdx < PRODUCT_SLOTS.length && (() => {
                  const slot     = PRODUCT_SLOTS[currentProdSlotIdx]
                  const prodNode = produtoNodes[currentProdSlotIdx]
                  if (!prodNode) return null
                  const mx = (HUB_CX + slot.cx) / 2
                  const my = Math.min(HUB_CY, slot.cy) - 45
                  return (
                    <path
                      d={`M ${HUB_CX + 28} ${HUB_CY - 18} Q ${mx} ${my} ${slot.cx - 18} ${slot.cy - 10}`}
                      fill="none"
                      stroke={`${prodNode.color}50`}
                      strokeWidth="1.5"
                      strokeDasharray="5 4"
                    >
                      <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="1.5s" repeatCount="indefinite"/>
                    </path>
                  )
                })()}

                {/* ── HUB → Configurador (dashed, isolado) ── */}
                <line
                  x1={HUB_CX - 32} y1={HUB_CY - 28}
                  x2={CONFIG_CX + 22} y2={CONFIG_CY + 12}
                  stroke="#f472b628" strokeWidth="1.5" strokeDasharray="6 5"
                />

                {/* ── HUB → HUB Store ── */}
                <line
                  x1={HUB_CX - 18} y1={HUB_CY + 40}
                  x2={STORE_CX + 8} y2={STORE_CY - 22}
                  stroke={isStoreVisited ? '#fbbf2440' : '#1e253870'}
                  strokeWidth={isStoreVisited ? 2 : 1.5}
                  strokeDasharray={isStoreVisited ? undefined : '5 4'}
                />

                {/* ── CORE → Produtos ── */}
                {productSlots.map((node, i) => {
                  if (!node) return null
                  const pos       = PRODUCT_SLOTS[i]
                  const isCurrent = node.id === currentProductId
                  const isVis     = visited.has(node.id)
                  const isLocked  = node.status === 'locked'
                  return (
                    <line key={`conn-${node.id}`}
                      x1={CORE_CX} y1={CORE_CY}
                      x2={pos.cx}  y2={pos.cy}
                      stroke={
                        isLocked   ? '#1e253850'         :
                        isCurrent  ? `${node.color}50`   :
                        isVis      ? `${node.color}30`   :
                        `${node.color}14`
                      }
                      strokeWidth={isCurrent ? 1.8 : 1.2}
                      strokeDasharray={isLocked ? '4 4' : undefined}
                    />
                  )
                })}

                {/* ── CONFIGURADOR (isolado, topo esquerdo) ── */}
                <g
                  className="lcg-node"
                  onMouseEnter={e => handleNodeHover('configurador', e)}
                  onMouseLeave={() => handleNodeHover(null)}
                  onClick={() => configuradorNode && handleNavigate(configuradorNode)}
                  style={{ cursor: 'pointer' }}
                >
                  <circle cx={CONFIG_CX} cy={CONFIG_CY} r={26}
                    fill="url(#lcg-g-configurador)" filter="url(#lcg-glow-soft)" opacity=".8"/>
                  <circle cx={CONFIG_CX} cy={CONFIG_CY} r={26}
                    fill="none" stroke="#f472b640" strokeWidth="1.5" strokeDasharray="3 2"/>
                  <text x={CONFIG_CX} y={CONFIG_CY - 4} textAnchor="middle" fontSize="8" fontWeight="800" fill="#fff" fontFamily="Inter,system-ui">CONFIG</text>
                  <text x={CONFIG_CX} y={CONFIG_CY + 7} textAnchor="middle" fontSize="6.5" fill="#fce7f390" fontFamily="Inter,system-ui">auth · billing</text>
                  <rect x={CONFIG_CX - 22} y={CONFIG_CY - 43} width="44" height="12" rx="4" fill="#0c0e16" stroke="#f472b630" strokeWidth="1"/>
                  <text x={CONFIG_CX} y={CONFIG_CY - 34} textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#f472b470" fontFamily="Inter,system-ui" letterSpacing=".05em">ISOLADO</text>
                </g>

                {/* ── HUB STORE (abaixo do HUB) ── */}
                {hubStoreNode && (
                  <g
                    className="lcg-node"
                    onMouseEnter={e => handleNodeHover('hub-store', e)}
                    onMouseLeave={() => handleNodeHover(null)}
                    onClick={() => handleNavigate(hubStoreNode)}
                    style={{ cursor: 'pointer' }}
                  >
                    {isStoreVisited && (
                      <circle cx={STORE_CX} cy={STORE_CY} r={22} fill="none" stroke="#fbbf2430" strokeWidth="1">
                        <animate attributeName="r"       values="20;30;20" dur="3s" repeatCount="indefinite"/>
                        <animate attributeName="opacity" values=".5;0;.5"  dur="3s" repeatCount="indefinite"/>
                      </circle>
                    )}
                    <circle cx={STORE_CX} cy={STORE_CY} r={22}
                      fill="url(#lcg-g-hub-store)"
                      filter={isStoreVisited ? 'url(#lcg-glow-soft)' : 'none'}
                      opacity={isStoreVisited ? 0.9 : 0.5}
                    />
                    <circle cx={STORE_CX} cy={STORE_CY} r={22}
                      fill="none"
                      stroke={
                        currentProductId === 'hub-store' ? '#fbbf24'    :
                        isStoreVisited                   ? '#fbbf2450'  :
                        '#374151'
                      }
                      strokeWidth="1.5"
                    />
                    {currentProductId === 'hub-store' && (
                      <>
                        <circle cx={STORE_CX + 20} cy={STORE_CY - 20} r={5} fill="#0c0e16" stroke="#fbbf24" strokeWidth="1.5"/>
                        <text x={STORE_CX + 20} y={STORE_CY - 17} textAnchor="middle" fontSize="6" fontWeight="900" fill="#fbbf24" fontFamily="Inter,system-ui">✦</text>
                      </>
                    )}
                    <text x={STORE_CX} y={STORE_CY - 3} textAnchor="middle" fontSize="8.5" fontWeight="800"
                      fill={isStoreVisited ? '#fff' : '#6b7280'} fontFamily="Inter,system-ui">STORE</text>
                    <text x={STORE_CX} y={STORE_CY + 8} textAnchor="middle" fontSize="7"
                      fill={isStoreVisited ? '#fbbf2490' : '#47556960'} fontFamily="Inter,system-ui">marketplace</text>
                  </g>
                )}

                {/* ── PRODUTOS (fan-out à direita) ── */}
                {productSlots.map((node, i) => {
                  const pos = PRODUCT_SLOTS[i]
                  const placeholder: EcosystemNode = {
                    id: `locked-${i}`, label: '+', sublabel: 'em breve',
                    color: '#374151', type: 'produto', status: 'locked',
                  }
                  const effectiveNode = node ?? placeholder
                  return (
                    <ProductNode
                      key={effectiveNode.id}
                      node={effectiveNode}
                      cx={pos.cx}
                      cy={pos.cy}
                      isCurrent={effectiveNode.id === currentProductId}
                      isVisited={visited.has(effectiveNode.id)}
                      isHovered={hoveredId === effectiveNode.id}
                      onHover={setHoveredId}
                      onClick={handleNavigate}
                    />
                  )
                })}

                {/* ── CORE (nó intermediário) ── */}
                {(() => {
                  const isCoreCurrent = currentProductId === 'core'
                  const coreColor     = '#a78bfa'
                  return (
                    <g
                      className="lcg-node"
                      onMouseEnter={e => handleNodeHover('core', e)}
                      onMouseLeave={() => handleNodeHover(null)}
                      onClick={() => coreNode && handleNavigate(coreNode)}
                      style={{ cursor: 'pointer' }}
                    >
                      {isCoreCurrent && (
                        <>
                          <circle cx={CORE_CX} cy={CORE_CY} r={36} fill="none" stroke={coreColor} strokeWidth="1">
                            <animate attributeName="r"       values="34;44;34" dur="2.8s" repeatCount="indefinite"/>
                            <animate attributeName="opacity" values=".5;0;.5"  dur="2.8s" repeatCount="indefinite"/>
                          </circle>
                          <circle cx={CORE_CX} cy={CORE_CY} r={33} fill="none" stroke={coreColor} strokeWidth="1.5" opacity=".3"/>
                        </>
                      )}
                      <circle cx={CORE_CX} cy={CORE_CY} r={30}
                        fill={isCoreVisited ? 'url(#lcg-g-core)' : 'url(#lcg-g-core-dim)'}
                        filter={isCoreVisited ? 'url(#lcg-glow-soft)' : 'none'}
                        opacity={isCoreVisited ? 0.92 : 0.5}
                      />
                      <circle cx={CORE_CX} cy={CORE_CY} r={30}
                        fill="none"
                        stroke={
                          isCoreCurrent ? coreColor           :
                          isCoreVisited ? `${coreColor}55`    :
                          '#94a3b850'
                        }
                        strokeWidth={isCoreCurrent ? 2 : 1.5}
                        strokeDasharray={!isCoreVisited && !isCoreCurrent ? '4 3' : undefined}
                      />
                      {isCoreCurrent && (
                        <>
                          <circle cx={CORE_CX + 28} cy={CORE_CY - 28} r={6} fill="#0c0e16" stroke={coreColor} strokeWidth="1.5"/>
                          <text x={CORE_CX + 28} y={CORE_CY - 24.5} textAnchor="middle" fontSize="7" fontWeight="900" fill={coreColor} fontFamily="Inter,system-ui">✦</text>
                        </>
                      )}
                      <text x={CORE_CX} y={CORE_CY - 4} textAnchor="middle" fontSize="11" fontWeight="900"
                        fill={isCoreVisited ? '#fff' : '#94a3b8'} fontFamily="Inter,system-ui" letterSpacing=".04em">CORE</text>
                      <text x={CORE_CX} y={CORE_CY + 9} textAnchor="middle" fontSize="7.5"
                        fill={isCoreVisited ? `${coreColor}90` : '#94a3b870'} fontFamily="Inter,system-ui">
                        {isCoreCurrent ? currentPageLabel : 'dashboard'}
                      </text>
                    </g>
                  )
                })()}

                {/* ── HUB (centro — origem de toda navegação) ── */}
                {(() => {
                  const isHubCurrent = currentProductId === 'hub'
                  const hubColor     = '#818cf8'
                  return (
                    <g
                      className="lcg-node"
                      onMouseEnter={e => handleNodeHover('hub', e)}
                      onMouseLeave={() => handleNodeHover(null)}
                      onClick={() => hubNode && handleNavigate(hubNode)}
                      style={{ cursor: 'pointer' }}
                    >
                      {isHubCurrent && (
                        <>
                          <circle cx={HUB_CX} cy={HUB_CY} r={48} fill="none" stroke={hubColor} strokeWidth="1">
                            <animate attributeName="r"       values="46;58;46" dur="2.8s" repeatCount="indefinite"/>
                            <animate attributeName="opacity" values=".5;0;.5"  dur="2.8s" repeatCount="indefinite"/>
                          </circle>
                          <circle cx={HUB_CX} cy={HUB_CY} r={45} fill="none" stroke={hubColor} strokeWidth="1.5" opacity=".3"/>
                        </>
                      )}
                      <circle cx={HUB_CX} cy={HUB_CY} r={42}
                        fill="url(#lcg-g-hub)"
                        filter="url(#lcg-glow-strong)" opacity=".93"/>
                      <circle cx={HUB_CX} cy={HUB_CY} r={42}
                        fill="none"
                        stroke={isHubCurrent ? hubColor : `${hubColor}55`}
                        strokeWidth={isHubCurrent ? 2 : 1.5}
                      />
                      {isHubCurrent && (
                        <>
                          <circle cx={HUB_CX + 40} cy={HUB_CY - 40} r={7} fill="#0c0e16" stroke={hubColor} strokeWidth="1.5"/>
                          <text x={HUB_CX + 40} y={HUB_CY - 36.5} textAnchor="middle" fontSize="8" fontWeight="900" fill={hubColor} fontFamily="Inter,system-ui">✦</text>
                        </>
                      )}
                      <text x={HUB_CX} y={HUB_CY - 9} textAnchor="middle"
                        fontSize="14" fontWeight="900" fill="#fff" fontFamily="Inter,system-ui" letterSpacing=".05em">
                        HUB
                      </text>
                      <text x={HUB_CX} y={HUB_CY + 5} textAnchor="middle"
                        fontSize={isHubCurrent ? 9 : 8.5} fontWeight={isHubCurrent ? '700' : '400'}
                        fill={isHubCurrent ? '#c4b5fd' : '#c4b5fd70'} fontFamily="Inter,system-ui">
                        {isHubCurrent ? currentPageLabel : workspaceName}
                      </text>
                      <text x={HUB_CX} y={HUB_CY + 17} textAnchor="middle"
                        fontSize="7.5" fill="#818cf850" fontFamily="Inter,system-ui">
                        {workspaceName}
                      </text>
                    </g>
                  )
                })()}

              </svg>

              {/* Tooltip flutuante */}
              <MapTooltip
                node={hoveredNode}
                x={tooltipPos.x}
                y={tooltipPos.y}
                isVisited={hoveredNode ? visited.has(hoveredNode.id) : false}
              />
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
                <span>Visitado</span>
              </div>
              <div className="lcg-legend__item">
                <div className="lcg-legend__dot" style={{ background: '#4b5563' }}/>
                <span>Disponível</span>
              </div>
              <div className="lcg-legend__item">
                <div className="lcg-legend__dot" style={{ background: '#f472b6' }}/>
                <span>Configurador (isolado)</span>
              </div>
              <div className="lcg-legend__item">
                <div className="lcg-legend__dash"/>
                <span>Não contratado</span>
              </div>
            </div>
            <span className="lcg-panel__hint">Clique num nó para navegar</span>
          </div>
        </div>
      )}
    </div>
  )
}
