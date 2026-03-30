/**
 * ResponderCotacao.tsx — Portal da Corretora: Formulario de resposta autenticado
 * Header com detalhes da cotacao + form com taxa, spread, IOF, validade
 * Countdown timer para referencia PTAX
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  PenLine,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  DollarSign,
  Clock,
  Calculator,
  Settings,
} from 'lucide-react'
import type {
  MoedaCambio,
  TipoOperacaoCambio,
  LiquidacaoCambio,
  CotacaoCambio,
} from '../../shared/types'
import {
  MOEDA_CAMBIO_LABELS,
  OPERACAO_CAMBIO_LABELS,
  LIQUIDACAO_LABELS,
} from '../../shared/types'

// ─── Types ──────────────────────────────────────────────────────────────────

interface CotacaoDetalhes {
  id: string
  cotacao_id: string
  moeda: MoedaCambio
  valor_moeda_estrangeira: number
  tipo_operacao: TipoOperacaoCambio
  liquidacao: LiquidacaoCambio
  prazo_resposta: string | null
  taxa_ptax_referencia: number | null
  cotacao?: Partial<CotacaoCambio>
}

interface FormState {
  taxa_oferecida: string
  iof_percentual: string
  validade_minutos: string
  liquidacao_proposta: LiquidacaoCambio
  observacoes: string
}

type PageState = 'loading' | 'error' | 'empty' | 'filled' | 'disabled'

// ─── Formatacao ─────────────────────────────────────────────────────────────

const fmtValor2 = (val: number): string =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val)

const fmtTaxa4 = (val: number): string =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(val)

const fmtBRL = (val: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

// ─── Styles ─────────────────────────────────────────────────────────────────

const st = {
  page: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    minHeight: '100vh',
    background: 'var(--bg-body-dark, #0f172a)',
    padding: '2rem',
  } as React.CSSProperties,
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  } as React.CSSProperties,
  headerIcon: {
    width: 44,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-surface, #1e293b)',
    borderRadius: 12,
    color: 'var(--accent, #6366f1)',
  } as React.CSSProperties,
  title: {
    fontSize: '1.375rem',
    fontWeight: 700,
    color: 'var(--text-primary, #f1f5f9)',
    margin: 0,
  } as React.CSSProperties,
  subtitle: {
    fontSize: '0.8125rem',
    color: 'var(--text-secondary, #94a3b8)',
    margin: 0,
  } as React.CSSProperties,
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.4rem 1rem',
    borderRadius: 9999,
    fontSize: '0.8125rem',
    fontWeight: 600,
    cursor: 'pointer',
    border: '1px solid var(--bg-base, #334155)',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    background: 'var(--bg-surface, #1e293b)',
    color: 'var(--text-secondary, #94a3b8)',
    transition: 'all 0.15s ease',
    marginLeft: 'auto',
  } as React.CSSProperties,
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
  } as React.CSSProperties,
  detailsCard: {
    background: 'var(--bg-surface, #1e293b)',
    borderRadius: 12,
    padding: '1.5rem',
    alignSelf: 'start' as const,
  } as React.CSSProperties,
  formCard: {
    background: 'var(--bg-surface, #1e293b)',
    borderRadius: 12,
    padding: '1.5rem',
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: '0.9375rem',
    fontWeight: 600,
    color: 'var(--text-primary, #f1f5f9)',
    marginBottom: '1rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid var(--bg-base, #334155)',
    margin: 0,
    marginTop: 0,
  } as React.CSSProperties,
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginTop: '1rem',
  } as React.CSSProperties,
  detailLabel: {
    fontSize: '0.6875rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    color: 'var(--text-muted, #64748b)',
  } as React.CSSProperties,
  detailValue: {
    fontSize: '0.875rem',
    color: 'var(--text-primary, #f1f5f9)',
    fontWeight: 500,
  } as React.CSSProperties,
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginTop: '1rem',
  } as React.CSSProperties,
  field: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.3rem',
  } as React.CSSProperties,
  fieldWide: {
    gridColumn: '1 / -1',
  } as React.CSSProperties,
  label: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--text-secondary, #94a3b8)',
  } as React.CSSProperties,
  input: {
    background: 'var(--bg-base, #334155)',
    border: '1px solid transparent',
    borderRadius: 8,
    padding: '0.6rem 0.75rem',
    fontSize: '0.875rem',
    color: 'var(--text-primary, #f1f5f9)',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    outline: 'none',
    transition: 'border-color 0.15s',
  } as React.CSSProperties,
  inputReadonly: {
    background: 'rgba(99,102,241,0.08)',
    border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: 8,
    padding: '0.6rem 0.75rem',
    fontSize: '0.875rem',
    color: 'var(--text-primary, #f1f5f9)',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: 600,
  } as React.CSSProperties,
  textarea: {
    background: 'var(--bg-base, #334155)',
    border: '1px solid transparent',
    borderRadius: 8,
    padding: '0.6rem 0.75rem',
    fontSize: '0.875rem',
    color: 'var(--text-primary, #f1f5f9)',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    outline: 'none',
    resize: 'vertical' as const,
    minHeight: 70,
    transition: 'border-color 0.15s',
  } as React.CSSProperties,
  select: {
    background: 'var(--bg-base, #334155)',
    border: '1px solid transparent',
    borderRadius: 8,
    padding: '0.6rem 0.75rem',
    fontSize: '0.875rem',
    color: 'var(--text-primary, #f1f5f9)',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    outline: 'none',
    cursor: 'pointer',
  } as React.CSSProperties,
  countdown: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    background: 'rgba(245,158,11,0.1)',
    border: '1px solid rgba(245,158,11,0.2)',
    borderRadius: 8,
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: 'var(--warning, #f59e0b)',
    marginTop: '1rem',
  } as React.CSSProperties,
  submitBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.75rem',
    borderRadius: 9999,
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    background: 'var(--accent, #6366f1)',
    color: '#fff',
    width: '100%',
    marginTop: '1.25rem',
    transition: 'all 0.15s ease',
  } as React.CSSProperties,
  error: {
    marginTop: '0.75rem',
    fontSize: '0.8125rem',
    color: 'var(--danger, #ef4444)',
    background: 'rgba(239,68,68,0.1)',
    padding: '0.5rem 0.75rem',
    borderRadius: 8,
  } as React.CSSProperties,
  center: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '50vh',
    gap: '1rem',
    color: 'var(--text-muted, #64748b)',
    fontSize: '0.875rem',
  } as React.CSSProperties,
  successWrap: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '50vh',
    gap: '1rem',
    textAlign: 'center' as const,
  } as React.CSSProperties,
} as const

// ─── Component ──────────────────────────────────────────────────────────────

interface ResponderCotacaoProps {
  bidRequestId?: string
  disabled?: boolean
  onVoltar?: () => void
}

export default function ResponderCotacao({ bidRequestId, disabled = false, onVoltar }: ResponderCotacaoProps) {
  const [detalhes, setDetalhes] = useState<CotacaoDetalhes | null>(null)
  const [pageState, setPageState] = useState<PageState>('loading')
  const [enviando, setEnviando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')
  const [ptaxCountdown, setPtaxCountdown] = useState('')

  const [form, setForm] = useState<FormState>({
    taxa_oferecida: '',
    iof_percentual: '0.38',
    validade_minutos: '10',
    liquidacao_proposta: 'D1',
    observacoes: '',
  })

  const carregar = useCallback(async () => {
    if (disabled) {
      setPageState('disabled')
      return
    }
    if (!bidRequestId) {
      setPageState('empty')
      return
    }
    setPageState('loading')
    try {
      const { getPortalBidRequestDetalhes } = await import('../../shared/api')
      const data = await getPortalBidRequestDetalhes(bidRequestId)
      const d = data as unknown as CotacaoDetalhes
      setDetalhes(d)
      setPageState('filled')
    } catch {
      setPageState('error')
    }
  }, [bidRequestId, disabled])

  useEffect(() => {
    carregar()
  }, [carregar])

  // PTAX countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const endOfDay = new Date(now)
      endOfDay.setHours(17, 0, 0, 0) // PTAX reference typically closes at 17h
      const diff = endOfDay.getTime() - now.getTime()
      if (diff <= 0) {
        setPtaxCountdown('PTAX do dia encerrada')
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60))
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const sec = Math.floor((diff % (1000 * 60)) / 1000)
        setPtaxCountdown(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErro('')
  }

  const taxaOferecida = parseFloat(form.taxa_oferecida) || 0
  const ptaxRef = detalhes?.taxa_ptax_referencia ?? 0
  const valorME = detalhes?.valor_moeda_estrangeira ?? 0
  const iofPct = parseFloat(form.iof_percentual) || 0

  const spreadVsPtax = useMemo(() => {
    if (ptaxRef === 0 || taxaOferecida === 0) return 0
    return ((taxaOferecida - ptaxRef) / ptaxRef) * 100
  }, [taxaOferecida, ptaxRef])

  const valorTotalBRL = useMemo(() => {
    const base = valorME * taxaOferecida
    const iof = base * (iofPct / 100)
    return base + iof
  }, [valorME, taxaOferecida, iofPct])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!bidRequestId) return

    if (!form.taxa_oferecida || taxaOferecida <= 0) {
      setErro('Informe uma taxa valida')
      return
    }
    if (!form.validade_minutos || parseInt(form.validade_minutos, 10) <= 0) {
      setErro('Informe a validade em minutos')
      return
    }

    setEnviando(true)
    setErro('')
    try {
      const { enviarRespostaCorretora } = await import('../../shared/api')
      await enviarRespostaCorretora(bidRequestId, {
        taxa_cambio: taxaOferecida,
        spread: spreadVsPtax,
        valor_brl: valorTotalBRL,
        iof_percentual: iofPct,
        iof_valor: valorME * taxaOferecida * (iofPct / 100),
        tarifa_bancaria: 0,
        valor_total_brl: valorTotalBRL,
        prazo_liquidacao: form.liquidacao_proposta,
        validade_minutos: parseInt(form.validade_minutos, 10),
        observacoes: form.observacoes || null,
      })
      setSucesso(true)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao enviar proposta')
    } finally {
      setEnviando(false)
    }
  }

  // ─── Success State ──────────────────────────────────────────────────────

  if (sucesso) {
    return (
      <div style={st.page}>
        <div style={st.successWrap}>
          <CheckCircle size={64} style={{ color: 'var(--success, #22c55e)' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary, #f1f5f9)', margin: 0 }}>
            Proposta enviada com sucesso
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #94a3b8)', maxWidth: 400 }}>
            Sua proposta foi registrada e sera analisada pelo comprador.
          </p>
          <button onClick={onVoltar} style={st.submitBtn}>Voltar para Pendentes</button>
        </div>
      </div>
    )
  }

  // ─── Other States ───────────────────────────────────────────────────────

  if (pageState === 'loading') {
    return (
      <div style={st.page}>
        <div style={st.header}>
          <div style={st.headerIcon}><PenLine size={22} /></div>
          <div><h1 style={st.title}>Responder Cotacao</h1></div>
        </div>
        <div style={st.center}>
          <Loader2 size={48} style={{ opacity: 0.3, animation: 'spin 1s linear infinite' }} />
          <p>Carregando cotacao...</p>
        </div>
      </div>
    )
  }

  if (pageState === 'error') {
    return (
      <div style={st.page}>
        <div style={st.header}>
          <div style={st.headerIcon}><PenLine size={22} /></div>
          <div><h1 style={st.title}>Responder Cotacao</h1></div>
        </div>
        <div style={st.center}>
          <AlertCircle size={48} style={{ color: 'var(--danger, #ef4444)', opacity: 0.6 }} />
          <p style={{ color: 'var(--danger, #ef4444)' }}>Erro ao carregar cotacao.</p>
          <button onClick={carregar} style={st.submitBtn}>Tentar novamente</button>
        </div>
      </div>
    )
  }

  if (pageState === 'empty') {
    return (
      <div style={st.page}>
        <div style={st.header}>
          <div style={st.headerIcon}><PenLine size={22} /></div>
          <div><h1 style={st.title}>Responder Cotacao</h1></div>
        </div>
        <div style={st.center}>
          <AlertCircle size={48} style={{ opacity: 0.3 }} />
          <p>Cotacao nao encontrada ou expirada.</p>
        </div>
      </div>
    )
  }

  if (pageState === 'disabled') {
    return (
      <div style={{ ...st.page, opacity: 0.5, pointerEvents: 'none' }}>
        <div style={st.header}>
          <div style={st.headerIcon}><PenLine size={22} /></div>
          <div><h1 style={st.title}>Responder Cotacao</h1><p style={st.subtitle}>Desabilitado</p></div>
        </div>
        <div style={st.center}>
          <Settings size={48} style={{ opacity: 0.3 }} />
          <p>Funcionalidade desabilitada.</p>
        </div>
      </div>
    )
  }

  // ─── Filled State ───────────────────────────────────────────────────────

  return (
    <div style={st.page}>
      <div style={st.header}>
        <div style={st.headerIcon}><PenLine size={22} /></div>
        <div>
          <h1 style={st.title}>Responder Cotacao</h1>
          <p style={st.subtitle}>Envie sua proposta de cambio</p>
        </div>
        {onVoltar && (
          <button style={st.backBtn} onClick={onVoltar}>
            <ArrowLeft size={14} /> Voltar
          </button>
        )}
      </div>

      <div style={st.layout}>
        {/* Left: Quotation Details */}
        <div style={st.detailsCard}>
          <h3 style={st.sectionTitle}>Detalhes da Cotacao</h3>
          <div style={st.detailGrid}>
            <div>
              <div style={st.detailLabel}>Moeda</div>
              <div style={st.detailValue}>
                {detalhes?.moeda ? `${MOEDA_CAMBIO_LABELS[detalhes.moeda]} (${detalhes.moeda})` : '—'}
              </div>
            </div>
            <div>
              <div style={st.detailLabel}>Valor</div>
              <div style={{ ...st.detailValue, fontWeight: 700 }}>
                {detalhes?.moeda ?? ''} {fmtValor2(detalhes?.valor_moeda_estrangeira ?? 0)}
              </div>
            </div>
            <div>
              <div style={st.detailLabel}>Tipo Operacao</div>
              <div style={st.detailValue}>
                {detalhes?.tipo_operacao ? OPERACAO_CAMBIO_LABELS[detalhes.tipo_operacao] : '—'}
              </div>
            </div>
            <div>
              <div style={st.detailLabel}>Liquidacao</div>
              <div style={st.detailValue}>
                {detalhes?.liquidacao ? LIQUIDACAO_LABELS[detalhes.liquidacao] : '—'}
              </div>
            </div>
            <div>
              <div style={st.detailLabel}>PTAX Referencia</div>
              <div style={{ ...st.detailValue, fontWeight: 700, color: 'var(--accent, #6366f1)' }}>
                {ptaxRef > 0 ? fmtTaxa4(ptaxRef) : '—'}
              </div>
            </div>
          </div>

          {/* PTAX Countdown */}
          <div style={st.countdown}>
            <Clock size={16} />
            <span>PTAX referencia: {ptaxCountdown}</span>
          </div>
        </div>

        {/* Right: Form */}
        <form style={st.formCard} onSubmit={handleSubmit}>
          <h3 style={st.sectionTitle}>Sua Proposta</h3>
          <div style={st.formGrid}>
            <div style={st.field}>
              <label style={st.label}>Taxa Oferecida (4 decimais) *</label>
              <input
                style={st.input}
                type="number"
                step="0.0001"
                min="0"
                placeholder="0.0000"
                value={form.taxa_oferecida}
                onChange={(e) => handleChange('taxa_oferecida', e.target.value)}
              />
            </div>

            <div style={st.field}>
              <label style={st.label}>
                <Calculator size={12} style={{ marginRight: 4 }} />
                Spread vs PTAX
              </label>
              <div style={st.inputReadonly}>
                {spreadVsPtax !== 0 ? `${spreadVsPtax >= 0 ? '+' : ''}${fmtValor2(spreadVsPtax)}%` : '—'}
              </div>
            </div>

            <div style={{ ...st.field, ...st.fieldWide }}>
              <label style={st.label}>
                <DollarSign size={12} style={{ marginRight: 4 }} />
                Valor Total em BRL (auto-calculado)
              </label>
              <div style={st.inputReadonly}>
                {valorTotalBRL > 0 ? fmtBRL(valorTotalBRL) : '—'}
              </div>
            </div>

            <div style={st.field}>
              <label style={st.label}>IOF % *</label>
              <input
                style={st.input}
                type="number"
                step="0.01"
                min="0"
                max="25"
                value={form.iof_percentual}
                onChange={(e) => handleChange('iof_percentual', e.target.value)}
              />
            </div>

            <div style={st.field}>
              <label style={st.label}>Validade em minutos *</label>
              <input
                style={st.input}
                type="number"
                min="1"
                value={form.validade_minutos}
                onChange={(e) => handleChange('validade_minutos', e.target.value)}
              />
            </div>

            <div style={st.field}>
              <label style={st.label}>Liquidacao Proposta *</label>
              <select
                style={st.select}
                value={form.liquidacao_proposta}
                onChange={(e) => handleChange('liquidacao_proposta', e.target.value)}
              >
                <option value="D0">D+0</option>
                <option value="D1">D+1</option>
                <option value="D2">D+2</option>
              </select>
            </div>

            <div style={{ ...st.field, ...st.fieldWide }}>
              <label style={st.label}>Condicoes / Observacoes</label>
              <textarea
                style={st.textarea}
                rows={3}
                placeholder="Informacoes adicionais sobre a proposta..."
                value={form.observacoes}
                onChange={(e) => handleChange('observacoes', e.target.value)}
              />
            </div>
          </div>

          {erro && <p style={st.error}>{erro}</p>}

          <button
            type="submit"
            style={{
              ...st.submitBtn,
              opacity: enviando ? 0.6 : 1,
              cursor: enviando ? 'not-allowed' : 'pointer',
            }}
            disabled={enviando}
          >
            {enviando ? 'Enviando...' : 'Enviar Proposta'}
          </button>
        </form>
      </div>
    </div>
  )
}
