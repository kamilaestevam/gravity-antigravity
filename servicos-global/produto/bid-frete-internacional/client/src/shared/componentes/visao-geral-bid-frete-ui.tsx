import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  CheckCircle,
  ClockCountdown,
  Funnel,
  Star,
  ArrowRight,
} from '@phosphor-icons/react'
import type {
  AlertaVisaoFornecedorBidFreteInternacional,
  EtapaFunilVisaoFornecedorBidFreteInternacional,
} from '../visao-fornecedor-bid-frete-internacional-schemas'

type SegmentoTaxa = { pct: number; cor: string; label: string }

export function BidFreteFunilBarras({
  etapas,
  rotuloEtapa,
}: {
  etapas: EtapaFunilVisaoFornecedorBidFreteInternacional[]
  rotuloEtapa: (rotulo: string) => string
}) {
  const total = etapas.reduce((s, e) => s + e.quantidade, 0)
  const maxCount = Math.max(...etapas.map((e) => e.quantidade), 1)

  return (
    <div className="bfd-funil">
      {etapas.map((etapa) => {
        const pct = total ? Math.round((etapa.quantidade / total) * 100) : 0
        const barW = maxCount ? (etapa.quantidade / maxCount) * 100 : 0
        return (
          <div key={etapa.codigo_status ?? etapa.rotulo} className="bfd-funil__row">
            <span className="bfd-funil__label">{rotuloEtapa(etapa.rotulo)}</span>
            <div className="bfd-funil__bar-wrap">
              <div
                className="bfd-funil__bar"
                style={{ width: `${barW}%`, background: etapa.cor }}
              />
            </div>
            <span className="bfd-funil__count">{etapa.quantidade}</span>
            <span className="bfd-funil__pct">{pct}%</span>
          </div>
        )
      })}
    </div>
  )
}

const ALERTA_ESTILO: Record<
  AlertaVisaoFornecedorBidFreteInternacional['tom'],
  { border: string; bg: string; glow: string; text: string }
> = {
  amber: {
    border: '#fbbf24',
    bg: 'rgba(251, 191, 36, 0.04)',
    glow: 'rgba(251, 191, 36, 0.15)',
    text: '#fbbf24',
  },
  blue: {
    border: '#60a5fa',
    bg: 'rgba(96, 165, 250, 0.04)',
    glow: 'rgba(96, 165, 250, 0.15)',
    text: '#60a5fa',
  },
  rose: {
    border: '#f87171',
    bg: 'rgba(248, 113, 113, 0.04)',
    glow: 'rgba(248, 113, 113, 0.15)',
    text: '#f87171',
  },
  emerald: {
    border: '#34d399',
    bg: 'rgba(52, 211, 153, 0.04)',
    glow: 'rgba(52, 211, 153, 0.15)',
    text: '#34d399',
  },
}

export function BidFreteAlertasFornecedor({
  alertas,
  rotuloAlerta,
  mensagemVazio,
}: {
  alertas: AlertaVisaoFornecedorBidFreteInternacional[]
  rotuloAlerta: (rotulo: string) => string
  mensagemVazio: string
}) {
  const navigate = useNavigate()

  if (alertas.length === 0) {
    return <p className="bfd-alertas__vazio">{mensagemVazio}</p>
  }

  return (
    <div className="bfd-alertas__grid">
      {alertas.map((alerta) => {
        const estilo = ALERTA_ESTILO[alerta.tom]
        return (
          <button
            key={alerta.rotulo}
            type="button"
            className="bfd-alertas__glow-card"
            style={{
              background: estilo.bg,
              borderLeft: `3px solid ${estilo.border}`,
            }}
            onClick={() => navigate(alerta.rota)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = `0 4px 12px ${estilo.glow}`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <div className="bfd-alertas__glow-card-top">
              <ClockCountdown size={16} weight="duotone" style={{ color: estilo.text }} />
              <span className="bfd-alertas__glow-count">{alerta.quantidade}</span>
            </div>
            <span className="bfd-alertas__glow-label">{rotuloAlerta(alerta.rotulo)}</span>
          </button>
        )
      })}
    </div>
  )
}

export function BidFreteTaxaAnel({
  percentualCentro,
  rotuloCentro,
  segmentos,
}: {
  percentualCentro: number
  rotuloCentro: string
  segmentos: SegmentoTaxa[]
}) {
  const cx = 55
  const cy = 55
  const r = 42
  const stroke = 10
  const circ = 2 * Math.PI * r
  let off = 0

  return (
    <div className="bfd-taxa">
      <div className="bfd-taxa__chart">
        <svg viewBox="0 0 110 110" className="bfd-taxa__chart-svg" aria-hidden>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
          {segmentos.map((s, i) => {
            const dashLen = (s.pct / 100) * circ
            const arc = (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={s.cor}
                strokeWidth={stroke}
                strokeDasharray={`${dashLen} ${circ - dashLen}`}
                strokeDashoffset={-off}
                style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }}
              />
            )
            off += dashLen
            return arc
          })}
        </svg>
        <div className="bfd-taxa__chart-centro">
          <span className="bfd-taxa__chart-pct">{percentualCentro.toFixed(1)}%</span>
          <span className="bfd-taxa__chart-rotulo">{rotuloCentro}</span>
        </div>
      </div>
      <div className="bfd-taxa__legend">
        {segmentos.map((s, i) => (
          <div key={i} className="bfd-taxa__legend-row">
            <span className="bfd-taxa__dot" style={{ background: s.cor }} />
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function BidFreteClassificacaoDestaque({
  nota,
  subtitulo,
}: {
  nota: number
  subtitulo: string
}) {
  const arredondada = Math.round(nota)
  return (
    <div className="bfd-classificacao">
      <span className="bfd-classificacao__nota">{nota.toFixed(1)}</span>
      <div className="bfd-classificacao__stars">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            weight={i <= arredondada ? 'fill' : 'duotone'}
            size={18}
            style={{ color: i <= arredondada ? '#fbbf24' : '#64748b' }}
          />
        ))}
      </div>
      <span className="bfd-classificacao__meta">{subtitulo}</span>
    </div>
  )
}

export function BidFreteSecaoCabecalho({
  icone,
  titulo,
}: {
  icone: React.ReactNode
  titulo: string
  corIcone?: string
}) {
  return (
    <div className="cg-card__header" style={{ marginBottom: '1.25rem' }}>
      <div className="cg-card__icon-wrap">{icone}</div>
      <p className="cg-card__label" style={{ margin: 0 }}>
        {titulo}
      </p>
    </div>
  )
}

export function BidFreteIconesSecao() {
  return {
    alertas: <Bell weight="duotone" size={16} style={{ color: '#f87171' }} />,
    funil: <Funnel weight="duotone" size={16} style={{ color: '#818cf8' }} />,
    aprovacao: <CheckCircle weight="duotone" size={16} style={{ color: '#34d399' }} />,
  }
}

export function BidFreteAcaoRapida({
  titulo,
  descricao,
  icone,
  corIcone,
  onClick,
}: {
  titulo: string
  descricao: string
  icone: React.ReactNode
  corIcone: string
  onClick: () => void
}) {
  return (
    <button type="button" className="bfd-card bfd-acao-card bfd-card--accent-amber" onClick={onClick}>
      <div className="bfd-acao-card__icon" style={{ color: corIcone }}>
        {icone}
      </div>
      <div className="bfd-acao-card__text">
        <span className="bfd-acao-card__titulo">{titulo}</span>
        <span className="bfd-acao-card__desc">{descricao}</span>
      </div>
      <ArrowRight weight="bold" size={18} className="bfd-acao-card__arrow" />
    </button>
  )
}
