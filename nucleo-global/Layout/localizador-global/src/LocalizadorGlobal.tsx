import React, { useState, useRef, useEffect, useCallback } from 'react'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import './localizador-global.css'
import type { EcosystemNode, LocalizadorEntry, LocalizadorGlobalProps } from './types'

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

// ── Sub-componente: nó 3D do ecossistema ─────────────────────────────────────

interface Node3DProps {
  node: EcosystemNode
  isCurrent: boolean
  isVisited: boolean
  isHovered: boolean
  positionStyle: React.CSSProperties
  onHover: (id: string | null) => void
  onClick: (node: EcosystemNode) => void
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

function Node3D({ node, isCurrent, isVisited, isHovered, positionStyle, onHover, onClick, size = 'md' }: Node3DProps) {
  const isLocked = node.status === 'locked'
  const sizeMap = { sm: 32, md: 44, lg: 56, xl: 72 }
  const dim = sizeMap[size]

  const shortLabel = node.label.length > 9 ? node.label.slice(0, 8) + '…' : node.label

  const baseOpacity = isLocked ? 0.3 : isCurrent ? 1 : isVisited ? 0.85 : isHovered ? 0.7 : 0.5
  const borderColor = isLocked
    ? 'rgba(71,85,105,0.3)'
    : isCurrent
      ? node.color
      : isVisited
        ? `${node.color}88`
        : `${node.color}33`

  const glowIntensity = isCurrent ? 16 : isVisited ? 8 : 0

  return (
    <div
      className={`lcg-node3d${isCurrent ? ' lcg-node3d--current' : ''}${isLocked ? ' lcg-node3d--locked' : ''}${isVisited ? ' lcg-node3d--visited' : ''}`}
      style={{
        ...positionStyle,
        width: dim,
        height: dim,
        '--node-color': node.color,
        '--node-glow': glowIntensity,
        opacity: baseOpacity,
      } as React.CSSProperties}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => !isLocked && onClick(node)}
    >
      {/* Pulse ring for current */}
      {isCurrent && <div className="lcg-node3d__pulse" style={{ borderColor: node.color }} />}

      {/* Main sphere */}
      <div
        className="lcg-node3d__sphere"
        style={{
          background: isLocked
            ? 'radial-gradient(circle at 35% 30%, #374151 0%, #111827 100%)'
            : `radial-gradient(circle at 35% 30%, ${node.color}ee 0%, ${node.color}55 60%, ${node.color}22 100%)`,
          border: `1.5px solid ${borderColor}`,
          boxShadow: glowIntensity > 0
            ? `0 0 ${glowIntensity}px ${node.color}88, inset 0 -4px 8px rgba(0,0,0,0.3)`
            : 'inset 0 -4px 8px rgba(0,0,0,0.3)',
          borderStyle: isLocked ? 'dashed' : 'solid',
        }}
      >
        {/* Inner label */}
        <span className="lcg-node3d__label" style={{
          color: isLocked ? '#6b7280' : '#fff',
          fontSize: size === 'xl' ? 11 : size === 'lg' ? 9.5 : size === 'md' ? 8 : 7,
          fontWeight: 800,
          letterSpacing: '0.04em',
        }}>
          {isLocked && node.id.startsWith('locked-') ? '+' : shortLabel.toUpperCase()}
        </span>
        <span className="lcg-node3d__sublabel" style={{
          color: isLocked ? '#4b5563' : `${node.color}cc`,
          fontSize: size === 'xl' ? 8.5 : size === 'lg' ? 7.5 : 6.5,
        }}>
          {isLocked && node.id.startsWith('locked-') ? 'breve' : node.sublabel}
        </span>
      </div>

      {/* Badge ✦ when current */}
      {isCurrent && (
        <div className="lcg-node3d__badge" style={{ background: '#0c0e16', borderColor: node.color }}>
          <span style={{ color: node.color, fontSize: 8, fontWeight: 900 }}>✦</span>
        </div>
      )}
    </div>
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

// ── Sub-componente: conexão 3D entre nós ─────────────────────────────────────

interface Connection3DProps {
  from: { x: number; y: number }
  to: { x: number; y: number }
  color: string
  dashed?: boolean
  intensity?: number
  animated?: boolean
}

function Connection3D({ from, to, color, dashed = false, intensity = 0.4, animated = false }: Connection3DProps) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const length = Math.sqrt(dx * dx + dy * dy)
  const angle = Math.atan2(dy, dx) * (180 / Math.PI)

  return (
    <div
      className={`lcg-connection3d${animated ? ' lcg-connection3d--animated' : ''}`}
      style={{
        position: 'absolute',
        left: from.x,
        top: from.y,
        width: length,
        height: 2,
        transform: `rotate(${angle}deg)`,
        transformOrigin: '0 50%',
        background: dashed
          ? `repeating-linear-gradient(90deg, ${color} 0, ${color} 5px, transparent 5px, transparent 10px)`
          : `linear-gradient(90deg, ${color}00 0%, ${color} 20%, ${color} 80%, ${color}00 100%)`,
        opacity: intensity,
      }}
    />
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
  const sceneRef = useRef<HTMLDivElement>(null)

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

  // Track mouse position for tooltip
  const handleSceneMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (panelRef.current) {
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
  const adminNode        = nodes.find(n => n.type === 'admin')
  const hubStoreNode     = nodes.find(n => n.type === 'hub-store')
  const produtoNodes     = nodes.filter(n => n.type === 'produto')
  const hoveredNode      = nodes.find(n => n.id === hoveredId) ?? null

  // Rastro de navegação — deriva visitados do histórico + visitedNodeIds explícitos
  const visited = new Set([
    ...visitedNodeIds,
    ...history.map(e => e.productId),
    currentProductId,
  ])

  // ── Layout 3D: posições (em %, relativo ao container) ──
  // HUB: centro-esquerda
  // CORE: centro
  // Produtos: arco orbital à direita do CORE
  // Config/Admin: canto superior esquerdo (isolado)
  // Store: abaixo do HUB

  // Posições absolutas dentro da cena
  const positions: Record<string, { x: number; y: number }> = {
    hub:           { x: 180, y: 160 },
    core:          { x: 360, y: 160 },
    configurador:  { x: 68,  y: 60  },
    admin:         { x: 68,  y: 145 },
    'hub-store':   { x: 120, y: 265 },
  }

  // Calcular posições dos produtos em arco orbital
  const productPositions: { x: number; y: number }[] = []
  const prodCount = Math.min(produtoNodes.length, 6)
  const arcCenter = { x: 560, y: 160 }
  const arcRadiusX = 130
  const arcRadiusY = 120
  const arcStart = -70 // degrees
  const arcEnd = 70
  for (let i = 0; i < 6; i++) {
    if (prodCount <= 1) {
      productPositions.push({ x: arcCenter.x, y: arcCenter.y })
    } else {
      const angle = (arcStart + (arcEnd - arcStart) * (i / (6 - 1))) * (Math.PI / 180)
      productPositions.push({
        x: arcCenter.x + Math.sin(angle) * arcRadiusX,
        y: arcCenter.y + Math.cos(angle) * arcRadiusY * 0.7,
      })
    }
  }

  // Helper: centra um nó (posição é centro, não top-left)
  function nodeStyle(x: number, y: number): React.CSSProperties {
    return {
      position: 'absolute',
      left: x,
      top: y,
      transform: 'translate(-50%, -50%)',
    }
  }

  // ── Conexões entre nós ──
  const connections: Connection3DProps[] = []
  const isCoreVisited = visited.has('core') && currentProductId !== 'core'

  // HUB → CORE
  connections.push({
    from: { x: positions.hub.x + 36, y: positions.hub.y },
    to: { x: positions.core.x - 24, y: positions.core.y },
    color: isCoreVisited ? '#818cf8' : '#4b5563',
    intensity: isCoreVisited ? 0.6 : 0.25,
    animated: currentProductId === 'core',
  })

  // CORE → Products
  produtoNodes.slice(0, 6).forEach((n, i) => {
    const pos = productPositions[i]
    const isProdVisited = visited.has(n.id)
    const isProdCurrent = n.id === currentProductId
    connections.push({
      from: { x: positions.core.x + 24, y: positions.core.y },
      to: { x: pos.x - 18, y: pos.y },
      color: isProdCurrent ? n.color : isProdVisited ? n.color : '#4b5563',
      intensity: isProdCurrent ? 0.7 : isProdVisited ? 0.45 : 0.15,
      dashed: n.status === 'locked',
    })
  })

  // HUB → Config (dashed isolado)
  if (configuradorNode) {
    connections.push({
      from: { x: positions.hub.x - 30, y: positions.hub.y - 30 },
      to: { x: positions.configurador.x + 16, y: positions.configurador.y + 16 },
      color: '#f472b6',
      dashed: true,
      intensity: visited.has('configurador') ? 0.5 : 0.2,
    })
  }

  // HUB → Admin (dashed isolado)
  if (adminNode) {
    connections.push({
      from: { x: positions.hub.x - 36, y: positions.hub.y - 8 },
      to: { x: positions.admin.x + 16, y: positions.admin.y + 4 },
      color: '#10b981',
      dashed: true,
      intensity: visited.has('admin') ? 0.5 : 0.2,
    })
  }

  // HUB → Store
  if (hubStoreNode) {
    connections.push({
      from: { x: positions.hub.x - 16, y: positions.hub.y + 36 },
      to: { x: positions['hub-store'].x + 8, y: positions['hub-store'].y - 16 },
      color: '#fbbf24',
      intensity: visited.has('hub-store') ? 0.5 : 0.2,
    })
  }

  // Placeholders para slots de produto não preenchidos
  const placeholders: EcosystemNode[] = []
  for (let i = produtoNodes.length; i < 6; i++) {
    placeholders.push({
      id: `locked-${i}`,
      label: '+',
      sublabel: 'em breve',
      color: '#374151',
      type: 'produto',
      status: 'locked',
    })
  }

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

          {/* ── TAB: MAPA 3D ── */}
          {activeTab === 'mapa' && (
            <div className="lcg-graph lcg-graph--3d">
              {/* 3D Scene */}
              <div className="lcg-scene" ref={sceneRef} onMouseMove={handleSceneMouseMove}>
                {/* Orbital ring background (decorative) */}
                <div className="lcg-orbital-ring lcg-orbital-ring--1" />
                <div className="lcg-orbital-ring lcg-orbital-ring--2" />
                <div className="lcg-orbital-ring lcg-orbital-ring--3" />

                {/* Ambient particles */}
                <div className="lcg-particle lcg-particle--1" />
                <div className="lcg-particle lcg-particle--2" />
                <div className="lcg-particle lcg-particle--3" />
                <div className="lcg-particle lcg-particle--4" />
                <div className="lcg-particle lcg-particle--5" />
                <div className="lcg-particle lcg-particle--6" />
                <div className="lcg-particle lcg-particle--7" />
                <div className="lcg-particle lcg-particle--8" />

                {/* Connections layer */}
                <div className="lcg-connections-layer">
                  {connections.map((conn, i) => (
                    <Connection3D key={`conn-${i}`} {...conn} />
                  ))}
                </div>

                {/* ── HUB node (largest, center-left) ── */}
                {hubNode && (
                  <Node3D
                    node={hubNode}
                    isCurrent={currentProductId === 'hub'}
                    isVisited={visited.has('hub')}
                    isHovered={hoveredId === 'hub'}
                    positionStyle={nodeStyle(positions.hub.x, positions.hub.y)}
                    onHover={setHoveredId}
                    onClick={handleNavigate}
                    size="xl"
                  />
                )}

                {/* ── CORE node (medium, center) ── */}
                {coreNode && (
                  <Node3D
                    node={coreNode}
                    isCurrent={currentProductId === 'core'}
                    isVisited={visited.has('core')}
                    isHovered={hoveredId === 'core'}
                    positionStyle={nodeStyle(positions.core.x, positions.core.y)}
                    onHover={setHoveredId}
                    onClick={handleNavigate}
                    size="lg"
                  />
                )}

                {/* ── CONFIGURADOR node (isolated, top-left) ── */}
                {configuradorNode && (
                  <Node3D
                    node={configuradorNode}
                    isCurrent={currentProductId === 'configurador'}
                    isVisited={visited.has('configurador')}
                    isHovered={hoveredId === 'configurador'}
                    positionStyle={nodeStyle(positions.configurador.x, positions.configurador.y)}
                    onHover={setHoveredId}
                    onClick={handleNavigate}
                    size="md"
                  />
                )}

                {/* ── ADMIN node (isolated, below config) ── */}
                {adminNode && (
                  <Node3D
                    node={adminNode}
                    isCurrent={currentProductId === 'admin'}
                    isVisited={visited.has('admin')}
                    isHovered={hoveredId === 'admin'}
                    positionStyle={nodeStyle(positions.admin.x, positions.admin.y)}
                    onHover={setHoveredId}
                    onClick={handleNavigate}
                    size="md"
                  />
                )}

                {/* ── HUB STORE node (below HUB) ── */}
                {hubStoreNode && (
                  <Node3D
                    node={hubStoreNode}
                    isCurrent={currentProductId === 'hub-store'}
                    isVisited={visited.has('hub-store')}
                    isHovered={hoveredId === 'hub-store'}
                    positionStyle={nodeStyle(positions['hub-store'].x, positions['hub-store'].y)}
                    onHover={setHoveredId}
                    onClick={handleNavigate}
                    size="md"
                  />
                )}

                {/* ── PRODUCT nodes (orbital arc, right side) ── */}
                {produtoNodes.slice(0, 6).map((pNode, i) => (
                  <Node3D
                    key={pNode.id}
                    node={pNode}
                    isCurrent={pNode.id === currentProductId}
                    isVisited={visited.has(pNode.id)}
                    isHovered={hoveredId === pNode.id}
                    positionStyle={nodeStyle(productPositions[i].x, productPositions[i].y)}
                    onHover={setHoveredId}
                    onClick={handleNavigate}
                    size="md"
                  />
                ))}

                {/* ── Placeholder nodes (locked slots) ── */}
                {placeholders.map((pNode, i) => {
                  const posIdx = produtoNodes.length + i
                  if (posIdx >= 6) return null
                  return (
                    <Node3D
                      key={pNode.id}
                      node={pNode}
                      isCurrent={false}
                      isVisited={false}
                      isHovered={false}
                      positionStyle={nodeStyle(productPositions[posIdx].x, productPositions[posIdx].y)}
                      onHover={setHoveredId}
                      onClick={handleNavigate}
                      size="sm"
                    />
                  )
                })}
              </div>

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
