import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  ArrowsOut,
  CornersIn,
  DownloadSimple,
  UploadSimple,
  Globe,
  MapTrifold,
  Plus,
  Minus,
  ArrowCounterClockwise,
  Play,
  Pause,
  MapPin,
  Eye,
  EyeSlash,
} from '@phosphor-icons/react'
import { TooltipGlobal } from '../../../Feedback/tooltip-global/src/tooltip'
import {
  GLOBE_PIN_VISIVEL_MIN_RZ,
  getCartesian,
  isLand,
  projectGlobePoint,
} from './geo-terra-globo-simulador-pedido'
import {
  type MapaPedidoEmpresaSimulador,
  type PinMapaSimuladorPedido,
} from './dados-mapa-globo-simulador-pedido'
import {
  criarFiltrosRefinarMapaIniciais,
  filtrarMapaRefinarSimuladorPedido,
  prepararContextoRefinarMapaSimuladorPedido,
  type FiltrosRefinarMapaSimuladorPedido,
} from './dados-refinar-mapa-simulador-pedido'
import { RefinarMapaSimuladorPedido } from './refinar-mapa-simulador-pedido'
import type { PerfilEmpresaSimulador } from '../smart-doc/dados-cliente-maduro-simulador-smart-doc'
import './mapa-globo-simulador-pedido.css'
import './refinar-mapa-simulador-pedido.css'

function desenharSetaDirecionalRota(
  ctx: CanvasRenderingContext2D,
  operacao: 'importacao' | 'exportacao',
  destaque: boolean,
) {
  const cor = operacao === 'importacao' ? '#f59e0b' : '#c084fc'
  const glow = operacao === 'importacao' ? '#f59e0b' : '#a78bfa'
  const largura = destaque ? 6.5 : 5

  ctx.shadowBlur = destaque ? 16 : 11
  ctx.shadowColor = glow
  ctx.fillStyle = '#ffffff'
  ctx.strokeStyle = cor
  ctx.lineWidth = destaque ? 1.6 : 1.2
  ctx.lineJoin = 'round'

  ctx.beginPath()
  ctx.moveTo(largura + 1, 0)
  ctx.lineTo(-largura, -largura * 0.85)
  ctx.lineTo(-largura * 0.35, 0)
  ctx.lineTo(-largura, largura * 0.85)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  ctx.shadowBlur = 0
}

type PinProjetado = PinMapaSimuladorPedido & { px: number; py: number; opacity: number }

type Props = {
  empresasSelecionadas?: PerfilEmpresaSimulador[]
  mapaEscopoOverride?: MapaPedidoEmpresaSimulador
}

export function MapaGloboSimuladorPedido({ empresasSelecionadas = [], mapaEscopoOverride }: Props) {
  const contextoRefinar = useMemo(() => {
    const base = prepararContextoRefinarMapaSimuladorPedido(empresasSelecionadas)
    if (!mapaEscopoOverride) return base
    return { ...base, mapaBase: mapaEscopoOverride }
  }, [empresasSelecionadas, mapaEscopoOverride])

  const [filtrosRefinar, setFiltrosRefinar] = useState<FiltrosRefinarMapaSimuladorPedido | null>(null)

  const filtrosResolvidos = useMemo(
    () => filtrosRefinar ?? criarFiltrosRefinarMapaIniciais(contextoRefinar.opcoes),
    [filtrosRefinar, contextoRefinar.opcoes],
  )

  const mapaEscopo = useMemo(
    () =>
      filtrarMapaRefinarSimuladorPedido(
        contextoRefinar.mapaBase,
        contextoRefinar.metadados,
        filtrosResolvidos,
        contextoRefinar.opcoes,
      ),
    [contextoRefinar, filtrosResolvidos],
  )

  useEffect(() => {
    setFiltrosRefinar(criarFiltrosRefinarMapaIniciais(contextoRefinar.opcoes))
    setRotasVisiveis(false)
  }, [contextoRefinar])

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasWrapRef = useRef<HTMLDivElement>(null)
  const pinsRef = useRef(mapaEscopo.pins)
  const routesRef = useRef(mapaEscopo.rotas)

  const [hoveredPin, setHoveredPin] = useState<number | null>(null)
  const hoveredPinRef = useRef<number | null>(null)
  const [projectedPins, setProjectedPins] = useState<PinProjetado[]>([])
  const [vista, setVista] = useState<'globo' | 'mapa'>('mapa')
  const vistaRef = useRef<'globo' | 'mapa'>('globo')
  const [isAutoRotating, setIsAutoRotating] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [rotasVisiveis, setRotasVisiveis] = useState(false)
  const rotasVisiveisRef = useRef(false)
  const [telaCheia, setTelaCheia] = useState(false)

  useEffect(() => {
    if (!telaCheia) return undefined
    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const aoTecla = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') setTelaCheia(false)
    }
    window.addEventListener('keydown', aoTecla)
    return () => {
      document.body.style.overflow = overflowAnterior
      window.removeEventListener('keydown', aoTecla)
    }
  }, [telaCheia])

  const isDraggingRef = useRef(false)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const rotationRef = useRef({ x: 0.28, y: -1.25 })
  const velocityRef = useRef({ x: 0, y: 0 })
  const isRotationPausedRef = useRef(false)
  const zoomRef = useRef(1.0)
  const panRef = useRef({ x: 0, y: 0 })
  const isAutoRotatingRef = useRef(true)

  useEffect(() => {
    hoveredPinRef.current = hoveredPin
  }, [hoveredPin])

  useEffect(() => {
    vistaRef.current = vista
  }, [vista])

  useEffect(() => {
    isAutoRotatingRef.current = isAutoRotating
    isRotationPausedRef.current = !isAutoRotating
  }, [isAutoRotating])

  useEffect(() => {
    rotasVisiveisRef.current = rotasVisiveis
  }, [rotasVisiveis])

  useEffect(() => {
    pinsRef.current = mapaEscopo.pins
    routesRef.current = mapaEscopo.rotas
    setHoveredPin(null)
    setProjectedPins([])
  }, [mapaEscopo])

  const fibonacciPoints = useMemo(() => {
    const samples = 12000
    const pts: { x: number; y: number; z: number }[] = []
    const phi = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < samples; i++) {
      const y = 1 - (i / (samples - 1)) * 2
      const radius = Math.sqrt(1 - y * y)
      const theta = phi * i
      const x = Math.cos(theta) * radius
      const z = Math.sin(theta) * radius
      const lat = Math.asin(y) * (180 / Math.PI)
      const lng = Math.atan2(x, z) * (180 / Math.PI)
      if (isLand(lat, lng)) pts.push({ x, y, z })
    }
    return pts
  }, [])

  function syncCanvasSize() {
    const canvas = canvasRef.current
    const wrap = canvasWrapRef.current
    if (!canvas || !wrap) return { w: 0, h: 0 }

    const w = Math.max(1, Math.round(wrap.clientWidth))
    const h = Math.max(1, Math.round(wrap.clientHeight))
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
    const bitmapW = Math.round(w * dpr)
    const bitmapH = Math.round(h * dpr)

    if (canvas.width !== bitmapW || canvas.height !== bitmapH) {
      canvas.width = bitmapW
      canvas.height = bitmapH
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
    }

    return { w, h, dpr }
  }

  useEffect(() => {
    const wrap = canvasWrapRef.current
    if (!wrap || typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver(() => {
      syncCanvasSize()
    })
    observer.observe(wrap)
    syncCanvasSize()

    return () => observer.disconnect()
  }, [])

  function clampPan() {
    const wrap = canvasWrapRef.current
    if (!wrap) return
    const w = wrap.clientWidth
    const h = wrap.clientHeight
    const scale = zoomRef.current
    const worldW = w * scale
    const worldH = worldW / 2
    const maxX = worldW * 0.35
    const maxY = worldH * 0.35
    panRef.current.x = Math.max(-maxX, Math.min(maxX, panRef.current.x))
    panRef.current.y = Math.max(-maxY, Math.min(maxY, panRef.current.y))
  }

  useEffect(() => {
    let animId = 0

    const renderMapaPlano = (
      ctx: CanvasRenderingContext2D,
      w: number,
      h: number,
      cx: number,
      cy: number,
    ) => {
      const scale = zoomRef.current
      const worldW = w * scale
      const worldH = worldW / 2
      const originX = cx - worldW / 2 + panRef.current.x
      const originY = cy - worldH / 2 + panRef.current.y
      const project = (lat: number, lng: number) => ({
        sx: originX + ((lng + 180) / 360) * worldW,
        sy: originY + ((90 - lat) / 180) * worldH,
      })

      ctx.clearRect(0, 0, w, h)
      const bgGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.7)
      bgGlow.addColorStop(0, 'rgba(40, 28, 10, 0.4)')
      bgGlow.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = bgGlow
      ctx.fillRect(0, 0, w, h)

      ctx.fillStyle = 'rgba(23, 19, 12, 0.55)'
      ctx.fillRect(originX, originY, worldW, worldH)

      fibonacciPoints.forEach((p) => {
        const lat = Math.asin(p.y) * (180 / Math.PI)
        const lng = Math.atan2(p.x, p.z) * (180 / Math.PI)
        const { sx, sy } = project(lat, lng)
        ctx.fillStyle = 'rgba(245, 158, 11, 0.55)'
        ctx.beginPath()
        ctx.arc(sx, sy, 1.2, 0, Math.PI * 2)
        ctx.fill()
      })

      routesRef.current.forEach((route, routeIdx) => {
        if (!rotasVisiveisRef.current) return
        const fromPin = pinsRef.current.find((p) => p.id === route.fromId)
        const toPin = pinsRef.current.find((p) => p.id === route.toId)
        if (!fromPin || !toPin) return
        const a = project(fromPin.geoLat, fromPin.geoLng)
        const b = project(toPin.geoLat, toPin.geoLng)
        ctx.strokeStyle = route.color
        ctx.lineWidth = 1.5
        ctx.globalAlpha = 0.35
        ctx.beginPath()
        ctx.moveTo(a.sx, a.sy)
        ctx.lineTo(b.sx, b.sy)
        ctx.stroke()
        ctx.globalAlpha = 1
        ctx.setLineDash([5, 8])
        ctx.lineDashOffset = -(Date.now() / (route.mode === 'importacao' ? 320 : 32)) % 100
        ctx.beginPath()
        ctx.moveTo(a.sx, a.sy)
        ctx.lineTo(b.sx, b.sy)
        ctx.stroke()
        ctx.setLineDash([])
      })

      const offsetX = 0
      const offsetY = 0
      const tempPins = pinsRef.current.map((pin) => {
        const { sx, sy } = project(pin.geoLat, pin.geoLng)
        return { ...pin, px: sx + offsetX, py: sy + offsetY, opacity: 1 }
      })
      setProjectedPins(tempPins)
    }

    const renderFrame = () => {
      const canvas = canvasRef.current
      if (!canvas) {
        animId = requestAnimationFrame(renderFrame)
        return
      }

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        animId = requestAnimationFrame(renderFrame)
        return
      }

      const { w, h, dpr = 1 } = syncCanvasSize()
      if (w < 2 || h < 2) {
        animId = requestAnimationFrame(renderFrame)
        return
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const cx = w / 2
      const cy = h / 2
      const R = Math.min(w, h) * 0.42 * zoomRef.current
      const pulseTime = Date.now() / 2400

      if (vistaRef.current === 'mapa') {
        renderMapaPlano(ctx, w, h, cx, cy)
        animId = requestAnimationFrame(renderFrame)
        return
      }

      if (!isDraggingRef.current) {
        if (!isRotationPausedRef.current) {
          rotationRef.current.y += 0.0012
          rotationRef.current.x += (0.28 - rotationRef.current.x) * 0.03
        }
        rotationRef.current.y += velocityRef.current.y
        rotationRef.current.x += velocityRef.current.x
        velocityRef.current.y *= 0.95
        velocityRef.current.x *= 0.95
      } else {
        rotationRef.current.y += velocityRef.current.y
        rotationRef.current.x += velocityRef.current.x
        velocityRef.current.y *= 0.8
        velocityRef.current.x *= 0.8
      }

      rotationRef.current.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, rotationRef.current.x))

      const cosY = Math.cos(rotationRef.current.y)
      const sinY = Math.sin(rotationRef.current.y)
      const cosX = Math.cos(rotationRef.current.x)
      const sinX = Math.sin(rotationRef.current.x)

      ctx.clearRect(0, 0, w, h)

      const bgGlow = ctx.createRadialGradient(cx, cy, R * 0.8, cx, cy, R * 1.3)
      bgGlow.addColorStop(0, 'rgba(16, 28, 48, 0.45)')
      bgGlow.addColorStop(0.5, 'rgba(245, 158, 11, 0.03)')
      bgGlow.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = bgGlow
      ctx.beginPath()
      ctx.arc(cx, cy, R * 1.3, 0, Math.PI * 2)
      ctx.fill()

      ctx.lineWidth = 1
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)'
      const parallels = [-0.6, -0.3, 0, 0.3, 0.6]
      parallels.forEach((py) => {
        const radiusAtY = Math.sqrt(1 - py * py)
        ctx.beginPath()
        for (let th = 0; th <= Math.PI * 2; th += 0.1) {
          const px = Math.cos(th) * radiusAtY
          const pz = Math.sin(th) * radiusAtY
          const rx1 = px * cosY - pz * sinY
          const rz1 = px * sinY + pz * cosY
          const ry2 = py * cosX + rz1 * sinX
          const sx = cx + rx1 * R
          const sy = cy - ry2 * R
          if (th === 0) ctx.moveTo(sx, sy)
          else ctx.lineTo(sx, sy)
        }
        ctx.closePath()
        ctx.stroke()
      })

      fibonacciPoints.forEach((p) => {
        const rx1 = p.x * cosY - p.z * sinY
        const rz1 = p.x * sinY + p.z * cosY
        const ry2 = p.y * cosX + rz1 * sinX
        const rz2 = -p.y * sinX + rz1 * cosX
        const sx = cx + rx1 * R
        const sy = cy - ry2 * R
        if (rz2 < 0) {
          ctx.fillStyle = 'rgba(245, 158, 11, 0.12)'
          ctx.fillRect(sx - 0.5, sy - 0.5, 1, 1)
        } else {
          const normalizedDepth = Math.max(0, Math.min(1, rz2))
          ctx.fillStyle = `rgba(245, 158, 11, ${0.3 + normalizedDepth * 0.6})`
          ctx.beginPath()
          ctx.arc(sx, sy, 1.1 + normalizedDepth * 0.9, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      ctx.shadowBlur = 15
      ctx.shadowColor = 'rgba(245, 158, 11, 0.2)'
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.18)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.stroke()
      ctx.shadowBlur = 0

      ctx.strokeStyle = 'rgba(245, 158, 11, 0.12)'
      ctx.setLineDash([4, 15])
      ctx.beginPath()
      ctx.arc(cx, cy, R * 1.08, pulseTime * 0.15, pulseTime * 0.15 + Math.PI * 2)
      ctx.stroke()
      ctx.setLineDash([])

      routesRef.current.forEach((route, routeIdx) => {
        if (!rotasVisiveisRef.current) return
        const fromPin = pinsRef.current.find((p) => p.id === route.fromId)
        const toPin = pinsRef.current.find((p) => p.id === route.toId)
        if (!fromPin || !toPin) return

        const fromProj = projectGlobePoint(fromPin.geoLat, fromPin.geoLng, cosY, sinY, cosX, sinX, cx, cy, R)
        const toProj = projectGlobePoint(toPin.geoLat, toPin.geoLng, cosY, sinY, cosX, sinX, cx, cy, R)
        if (fromProj.rz2 < GLOBE_PIN_VISIVEL_MIN_RZ || toProj.rz2 < GLOBE_PIN_VISIVEL_MIN_RZ) return

        const p1 = getCartesian(fromPin.geoLat, fromPin.geoLng)
        const p2 = getCartesian(toPin.geoLat, toPin.geoLng)
        const segmentsCount = 36
        const pathPoints: { sx: number; sy: number; rz2: number }[] = []
        let avgDepth = 0

        for (let j = 0; j <= segmentsCount; j++) {
          const t = j / segmentsCount
          let px = p1.x * (1 - t) + p2.x * t
          let py = p1.y * (1 - t) + p2.y * t
          let pz = p1.z * (1 - t) + p2.z * t
          const len = Math.sqrt(px * px + py * py + pz * pz)
          px /= len
          py /= len
          pz /= len
          const hFactor = route.heightFactor ?? 0.16
          const height = 1 + hFactor * Math.sin(t * Math.PI)
          px *= height
          py *= height
          pz *= height
          const rx1 = px * cosY - pz * sinY
          const rz1 = px * sinY + pz * cosY
          const ry2 = py * cosX + rz1 * sinX
          const rz2 = -py * sinX + rz1 * cosX
          pathPoints.push({ sx: cx + rx1 * R, sy: cy - ry2 * R, rz2 })
          avgDepth += rz2
        }

        pathPoints[0] = { sx: fromProj.sx, sy: fromProj.sy, rz2: fromProj.rz2 }
        pathPoints[segmentsCount] = { sx: toProj.sx, sy: toProj.sy, rz2: toProj.rz2 }
        avgDepth /= segmentsCount

        const isBack = avgDepth < -0.05
        const currentHovered = hoveredPinRef.current
        const isRouteDirectSource =
          currentHovered !== null && (route.fromId === currentHovered || route.toId === currentHovered)

        ctx.strokeStyle = route.color
        if (currentHovered !== null) {
          ctx.lineWidth = isRouteDirectSource ? (isBack ? 1 : 3) : isBack ? 0.3 : 0.5
          ctx.globalAlpha = isRouteDirectSource ? (isBack ? 0.15 : 0.8) : isBack ? 0.01 : 0.05
        } else {
          ctx.lineWidth = isBack ? 0.75 : 1.5
          ctx.globalAlpha = isBack ? 0.08 : 0.25
        }

        ctx.beginPath()
        ctx.moveTo(pathPoints[0].sx, pathPoints[0].sy)
        for (let j = 1; j < pathPoints.length; j++) ctx.lineTo(pathPoints[j].sx, pathPoints[j].sy)
        ctx.stroke()
        ctx.globalAlpha = 1

        if (!isBack && (currentHovered === null || isRouteDirectSource)) {
          ctx.strokeStyle = route.color
          ctx.lineWidth = isRouteDirectSource ? 3.5 : 2
          ctx.setLineDash([5, 8])
          ctx.lineDashOffset = -(Date.now() / (route.mode === 'importacao' ? 320 : 32)) % 100
          ctx.beginPath()
          ctx.moveTo(pathPoints[0].sx, pathPoints[0].sy)
          for (let j = 1; j < pathPoints.length; j++) ctx.lineTo(pathPoints[j].sx, pathPoints[j].sy)
          ctx.stroke()
          ctx.setLineDash([])

          ;[0, 0.5].forEach((offset) => {
            const routePulseTime = Date.now() / (route.mode === 'importacao' ? 24000 : 2400)
            const tPulse = (routePulseTime + routeIdx * 0.22 + offset) % 1
            const rawIdx = tPulse * segmentsCount
            const trailLength = 8
            for (let k = trailLength - 1; k >= 0; k--) {
              const currentRawIdx = rawIdx - k * 0.6
              if (currentRawIdx < 0) continue
              const idx = Math.floor(currentRawIdx)
              const nextIdx = Math.min(segmentsCount, idx + 1)
              const interp = currentRawIdx - idx
              const pCurrent = pathPoints[idx]
              const pNext = pathPoints[nextIdx]
              if (!pCurrent || !pNext) continue
              const pulseSx = pCurrent.sx * (1 - interp) + pNext.sx * interp
              const pulseSy = pCurrent.sy * (1 - interp) + pNext.sy * interp
              const pulseDepth = pCurrent.rz2 * (1 - interp) + pNext.rz2 * interp
              if (pulseDepth < -0.15) continue
              const trailRatio = 1 - k / trailLength
              if (k === 0) {
                ctx.save()
                ctx.translate(pulseSx, pulseSy)
                ctx.rotate(Math.atan2(pNext.sy - pCurrent.sy, pNext.sx - pCurrent.sx))
                if (isRouteDirectSource) ctx.scale(1.35, 1.35)
                desenharSetaDirecionalRota(ctx, route.mode, isRouteDirectSource)
                ctx.restore()
              } else {
                ctx.beginPath()
                ctx.arc(pulseSx, pulseSy, 1.2 + trailRatio * 2.2, 0, Math.PI * 2)
                ctx.fillStyle = route.color
                ctx.globalAlpha = trailRatio * 0.85
                ctx.fill()
                ctx.globalAlpha = 1
              }
            }
          })
        }
      })

      const offsetX = 0
      const offsetY = 0
      const tempPins = pinsRef.current.map((pin) => {
        const projected = projectGlobePoint(pin.geoLat, pin.geoLng, cosY, sinY, cosX, sinX, cx, cy, R)
        const opacity =
          projected.rz2 < GLOBE_PIN_VISIVEL_MIN_RZ ? 0 : Math.max(0, Math.min(1, (projected.rz2 + 0.15) / 0.3))
        return { ...pin, px: projected.sx + offsetX, py: projected.sy + offsetY, opacity }
      })
      setProjectedPins(tempPins)

      animId = requestAnimationFrame(renderFrame)
    }

    animId = requestAnimationFrame(renderFrame)
    return () => cancelAnimationFrame(animId)
  }, [fibonacciPoints])

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true
    setIsDragging(true)
    dragStartRef.current = { x: e.clientX, y: e.clientY }
    velocityRef.current = { x: 0, y: 0 }
    isRotationPausedRef.current = true
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return
    const dx = e.clientX - dragStartRef.current.x
    const dy = e.clientY - dragStartRef.current.y
    if (vistaRef.current === 'mapa') {
      panRef.current.x += dx
      panRef.current.y += dy
      clampPan()
      dragStartRef.current = { x: e.clientX, y: e.clientY }
      return
    }
    rotationRef.current.y -= dx * 0.0055
    rotationRef.current.x += dy * 0.0055
    rotationRef.current.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, rotationRef.current.x))
    velocityRef.current.y = -dx * 0.0055
    velocityRef.current.x = dy * 0.0055
    dragStartRef.current = { x: e.clientX, y: e.clientY }
  }

  const handleMouseUp = () => {
    isDraggingRef.current = false
    setIsDragging(false)
    isRotationPausedRef.current = !isAutoRotatingRef.current
  }

  return (
    <>
      {telaCheia && typeof document !== 'undefined'
        ? createPortal(
            <button
              type="button"
              className="pds-mapa-globo__backdrop"
              aria-label="Fechar mapa expandido"
              onClick={() => setTelaCheia(false)}
            />,
            document.body,
          )
        : null}

      {telaCheia ? (
        <div
          className="pds-mapa-globo__placeholder"
          style={{ minHeight: 'var(--pds-insights-linha-altura, 360px)' }}
          aria-hidden
        />
      ) : null}

      <section
        className={`pds-mapa-globo pds-insights-card${telaCheia ? ' pds-mapa-globo--tela-cheia' : ''}`}
        aria-label="Visão geral global de pedidos"
        role={telaCheia ? 'dialog' : undefined}
        aria-modal={telaCheia ? true : undefined}
      >
        <div className="pds-mapa-globo__header">
          <div className="pds-mapa-globo__header-texto">
            <h3 className="pds-insights-card__titulo">Visão Geral Global de Pedidos</h3>
            <p className="pds-mapa-globo__subtitulo">
              Origens, destinos e volume por localização (arraste para girar)
            </p>
          </div>
          <TooltipGlobal descricao={telaCheia ? 'Recolher mapa' : 'Expandir mapa'}>
            <button
              type="button"
              className="pds-mapa-globo__expandir-btn"
              data-sds-tutorial-alvo="pedido-insights-mapa-expandir"
              aria-expanded={telaCheia}
              aria-label={telaCheia ? 'Recolher mapa' : 'Expandir mapa'}
              onClick={() => setTelaCheia((prev) => !prev)}
            >
              {telaCheia ? <CornersIn size={16} weight="bold" /> : <ArrowsOut size={16} weight="bold" />}
            </button>
          </TooltipGlobal>
        </div>

        <div className="pds-mapa-globo__split">
          <RefinarMapaSimuladorPedido
            mapaBase={contextoRefinar.mapaBase}
            mapaFiltrado={mapaEscopo}
            opcoes={contextoRefinar.opcoes}
            filtros={filtrosResolvidos}
            onFiltrosChange={setFiltrosRefinar}
            variantePainel={telaCheia ? 'tela-cheia' : 'card'}
          />

        <div
          ref={canvasWrapRef}
          className="pds-mapa-globo__canvas-wrap"
          data-sds-tutorial-alvo="pedido-insights-mapa-interacao"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
        <canvas ref={canvasRef} className="pds-mapa-globo__canvas" />

        <div className="pds-mapa-globo__legenda" data-sds-tutorial-alvo="pedido-insights-mapa-legenda">
          <span>
            <DownloadSimple size={14} weight="bold" style={{ color: '#f59e0b' }} />
            Importação
          </span>
          <span>
            <UploadSimple size={14} weight="bold" style={{ color: '#a78bfa' }} />
            Exportação
          </span>
        </div>

        <div className="pds-mapa-globo__controles" data-sds-tutorial-alvo="pedido-insights-mapa-controles">
          <button
            type="button"
            className="pds-mapa-globo__controle-btn"
            onClick={(e) => {
              e.stopPropagation()
              setVista((prev) => (prev === 'globo' ? 'mapa' : 'globo'))
            }}
            title={vista === 'globo' ? 'Ver como mapa' : 'Ver como globo'}
          >
            {vista === 'globo' ? <MapTrifold size={16} weight="bold" /> : <Globe size={16} weight="bold" />}
          </button>
          <button
            type="button"
            className="pds-mapa-globo__controle-btn"
            onClick={(e) => {
              e.stopPropagation()
              zoomRef.current = Math.min(2.5, zoomRef.current + 0.15)
            }}
          >
            <Plus size={16} weight="bold" />
          </button>
          <button
            type="button"
            className="pds-mapa-globo__controle-btn"
            onClick={(e) => {
              e.stopPropagation()
              zoomRef.current = Math.max(0.5, zoomRef.current - 0.15)
            }}
          >
            <Minus size={16} weight="bold" />
          </button>
          <button
            type="button"
            className={`pds-mapa-globo__controle-btn${rotasVisiveis ? '' : ' pds-mapa-globo__controle-btn--rotas-ocultas'}`}
            data-sds-tutorial-alvo="pedido-insights-mapa-linhas"
            onClick={(e) => {
              e.stopPropagation()
              setRotasVisiveis((prev) => !prev)
            }}
            aria-pressed={!rotasVisiveis}
            title={rotasVisiveis ? 'Ocultar linhas de rota' : 'Exibir linhas de rota'}
          >
            {rotasVisiveis ? <Eye size={16} weight="bold" /> : <EyeSlash size={16} weight="bold" />}
          </button>
          <button
            type="button"
            className="pds-mapa-globo__controle-btn"
            onClick={(e) => {
              e.stopPropagation()
              zoomRef.current = 1
              rotationRef.current = { x: 0.28, y: -1.25 }
              velocityRef.current = { x: 0, y: 0 }
              panRef.current = { x: 0, y: 0 }
            }}
          >
            <ArrowCounterClockwise size={16} weight="bold" />
          </button>
          {vista === 'globo' && (
            <button
              type="button"
              className="pds-mapa-globo__controle-btn"
              onClick={(e) => {
                e.stopPropagation()
                setIsAutoRotating((prev) => !prev)
              }}
            >
              {isAutoRotating ? <Pause size={16} weight="bold" /> : <Play size={16} weight="bold" />}
            </button>
          )}
        </div>

        <div
          className="pds-mapa-globo__pins-layer"
          data-sds-tutorial-alvo="pedido-insights-mapa-pins"
          aria-hidden={projectedPins.length === 0}
        >
        {projectedPins.map((pin) => {
          if (pin.opacity <= 0.05) return null
          const isHovered = hoveredPin === pin.id
          const isExportacao = pin.tipoOperacao === 'exportacao'
          return (
            <div
              key={pin.id}
              className={`pds-mapa-globo__pin${isHovered ? ' pds-mapa-globo__pin--ativo' : ''}`}
              style={{
                top: pin.py,
                left: pin.px,
                opacity: pin.opacity,
                pointerEvents: pin.opacity < 0.65 ? 'none' : 'auto',
              }}
              onMouseEnter={() => {
                setHoveredPin(pin.id)
                isRotationPausedRef.current = true
              }}
              onMouseLeave={() => {
                setHoveredPin(null)
                isRotationPausedRef.current = !isAutoRotatingRef.current
              }}
            >
              <div
                className="pds-mapa-globo__pin-glow"
                style={{ borderColor: isExportacao ? '#a78bfa' : '#f59e0b' }}
              />
              <div
                className="pds-mapa-globo__pin-dot"
                style={{
                  backgroundColor: isExportacao ? '#a78bfa' : '#f59e0b',
                  boxShadow: isExportacao
                    ? '0 0 10px rgba(167, 139, 250, 0.6)'
                    : '0 0 10px rgba(245, 158, 11, 0.6)',
                }}
              >
                <MapPin size={13} weight="fill" color="#0f172a" />
              </div>
              {isHovered && pin.opacity > 0.7 && (
                <div
                  className={`pds-mapa-globo__tooltip${pin.py < 150 ? ' pds-mapa-globo__tooltip--abaixo' : ''}`}
                >
                  <div className="pds-mapa-globo__tooltip-header">
                    <span className="pds-mapa-globo__tooltip-flag">{pin.flag}</span>
                    <div>
                      <strong>{pin.label}</strong>
                      <span>
                        {pin.portCode} • {pin.country}
                      </span>
                    </div>
                  </div>
                  <div className="pds-mapa-globo__tooltip-body">
                    <div className="pds-mapa-globo__tooltip-stat">
                      <span>Pedidos ativos</span>
                      <strong>{pin.pedidosCount}</strong>
                    </div>
                    <div className="pds-mapa-globo__tooltip-stat">
                      <span>Contratos câmbio</span>
                      <strong>{pin.contratosCambioCount}</strong>
                    </div>
                    <div className="pds-mapa-globo__tooltip-stat">
                      <span>Total a receber</span>
                      <strong style={{ color: '#34d399' }}>{pin.totalAReceber}</strong>
                    </div>
                    <div className="pds-mapa-globo__tooltip-stat">
                      <span>Total a pagar</span>
                      <strong style={{ color: '#f59e0b' }}>{pin.totalAPagar}</strong>
                    </div>
                  </div>
                  {pin.fornecedorPrincipal && (
                    <div className="pds-mapa-globo__tooltip-footer">
                      <span>
                        Parceiro: <strong>{pin.fornecedorPrincipal}</strong>
                      </span>
                      <span className="pds-mapa-globo__tooltip-hint">👉 Passe o mouse para ver rotas</span>
                    </div>
                  )}
                  <div className="pds-mapa-globo__tooltip-after" aria-hidden />
                </div>
              )}
            </div>
          )
        })}
        </div>
        </div>
      </div>
    </section>
    </>
  )
}
