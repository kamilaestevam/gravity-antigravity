/**
 * ResponderPublico.tsx — Portal da Corretora: Resposta via token publico (sem auth)
 * Pagina standalone para corretoras que recebem link por email
 * URL parameter: token
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  DollarSign,
  Clock,
  Calculator,
  ShieldAlert,
  Send,
} from 'lucide-react'
import type {
  BidCambioMoeda,
  BidCambioTipoOperacao,
  BidCambioLiquidacao,
} from '../../shared/types'
import {
  MOEDA_CAMBIO_LABELS,
  OPERACAO_CAMBIO_LABELS,
  LIQUIDACAO_LABELS,
} from '../../shared/types'

// ─── Types ──────────────────────────────────────────────────────────────────

interface CotacaoPublica {
  id: string
  cotacao_id: string
  moeda: BidCambioMoeda
  valor_moeda_estrangeira: number
  tipo_operacao: BidCambioTipoOperacao
  liquidacao: BidCambioLiquidacao
  prazo_resposta: string | null
  taxa_ptax_referencia: number | null
  corretora_nome: string
}

interface FormState {
  taxa_oferecida: string
  iof_percentual: string
  validade_minutos: string
  liquidacao_proposta: BidCambioLiquidacao
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
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '2rem',
  } as React.CSSProperties,
  container: {
    width: '100%',
    maxWidth: 720,
  } as React.CSSProperties,
  logo: {
    textAlign: 'center' as const,
    marginBottom: '2rem',
  } as React.CSSProperties,
  logoText: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--accent, #6366f1)',
    margin: 0,
  } as React.CSSProperties,
  logoSub: {
    fontSize: '0.8125rem',
    color: 'var(--text-muted, #64748b)',
    margin: '0.25rem 0 0',
  } as React.CSSProperties,
  card: {
    background: 'var(--bg-surface, #1e293b)',
    borderRadius: 12,
    padding: '1.5rem',
    marginBottom: '1rem',
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: '0.9375rem',
    fontWeight: 600,
    color: 'var(--text-primary, #f1f5f9)',
    marginBottom: '1rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid var(--bg-base, #334155)',
    margin: 0,
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
  selectInput: {
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
  errorMsg: {
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
    textAlign: 'center' as const,
  } as React.CSSProperties,
} as const

// ─── Component ──────────────────────────────────────────────────────────────

interface ResponderPublicoProps {
  token?: string
  disabled?: boolean
}

export default function ResponderPublico({ token, disabled = false }: ResponderPublicoProps) {
  const { t } = useTranslation()
  const [detalhes, setDetalhes] = useState<CotacaoPublica | null>(null)
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
    if (!token) {
      setPageState('empty')
      return
    }
    setPageState('loading')
    try {
      const { getPublicCotacaoByToken } = await import('../../shared/api')
      const data = await getPublicCotacaoByToken(token)
      const d = data as unknown as CotacaoPublica
      setDetalhes(d)
      setPageState('filled')
    } catch {
      setPageState('error')
    }
  }, [token, disabled])

  useEffect(() => {
    carregar()
  }, [carregar])

  // PTAX countdown
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const end = new Date(now)
      end.setHours(17, 0, 0, 0)
      const diff = end.getTime() - now.getTime()
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
    if (!token) return

    if (!form.taxa_oferecida || taxaOferecida <= 0) {
      setErro(t('bidcambio.portal.responder.erro_taxa'))
      return
    }
    if (!form.validade_minutos || parseInt(form.validade_minutos, 10) <= 0) {
      setErro(t('bidcambio.portal.responder.erro_validade'))
      return
    }

    setEnviando(true)
    setErro('')
    try {
      const { enviarRespostaPublica } = await import('../../shared/api')
      await enviarRespostaPublica(token, {
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
        <div style={st.container}>
          <div style={st.center}>
            <CheckCircle size={80} style={{ color: 'var(--success, #22c55e)' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary, #f1f5f9)', margin: 0 }}>
              {t('bidcambio.portal.publico.sucesso_titulo')}
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #94a3b8)', maxWidth: 400 }}>
              {t('bidcambio.portal.publico.sucesso_desc')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ─── Loading / Error / Empty / Disabled ─────────────────────────────────

  if (pageState === 'loading') {
    return (
      <div style={st.page}>
        <div style={st.container}>
          <div style={st.logo}>
            <h1 style={st.logoText}>{t('bidcambio.portal.publico.titulo')}</h1>
            <p style={st.logoSub}>{t('bidcambio.portal.publico.proposta_label')}</p>
          </div>
          <div style={st.center}>
            <Loader2 size={48} style={{ opacity: 0.3, animation: 'spin 1s linear infinite' }} />
            <p>{t('bidcambio.portal.publico.carregando')}</p>
          </div>
        </div>
      </div>
    )
  }

  if (pageState === 'error') {
    return (
      <div style={st.page}>
        <div style={st.container}>
          <div style={st.logo}>
            <h1 style={st.logoText}>{t('bidcambio.portal.publico.titulo')}</h1>
          </div>
          <div style={st.center}>
            <ShieldAlert size={48} style={{ color: 'var(--danger, #ef4444)', opacity: 0.6 }} />
            <p style={{ color: 'var(--danger, #ef4444)' }}>
              {t('bidcambio.portal.publico.token_invalido')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (pageState === 'empty') {
    return (
      <div style={st.page}>
        <div style={st.container}>
          <div style={st.logo}>
            <h1 style={st.logoText}>{t('bidcambio.portal.publico.titulo')}</h1>
          </div>
          <div style={st.center}>
            <AlertCircle size={48} style={{ opacity: 0.3 }} />
            <p>{t('bidcambio.portal.publico.token_nao_informado')}</p>
          </div>
        </div>
      </div>
    )
  }

  if (pageState === 'disabled') {
    return (
      <div style={{ ...st.page, opacity: 0.5 }}>
        <div style={st.container}>
          <div style={st.logo}>
            <h1 style={st.logoText}>{t('bidcambio.portal.publico.titulo')}</h1>
            <p style={st.logoSub}>{t('bidcambio.portal.config.desabilitado')}</p>
          </div>
        </div>
      </div>
    )
  }

  // ─── Filled State ───────────────────────────────────────────────────────

  return (
    <div style={st.page}>
      <div style={st.container}>
        <div style={st.logo}>
          <h1 style={st.logoText}>{t('bidcambio.portal.publico.titulo')}</h1>
          <p style={st.logoSub}>
            Proposta de Cambio{detalhes?.corretora_nome ? ` — ${detalhes.corretora_nome}` : ''}
          </p>
        </div>

        {/* Quotation Details */}
        <div style={st.card}>
          <h3 style={st.sectionTitle}>{t('bidcambio.portal.responder.detalhes_cotacao')}</h3>
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
          <div style={st.countdown}>
            <Clock size={16} />
            <span>PTAX referencia: {ptaxCountdown}</span>
          </div>
        </div>

        {/* Form */}
        <form style={st.card} onSubmit={handleSubmit}>
          <h3 style={st.sectionTitle}>{t('bidcambio.portal.responder.sua_proposta')}</h3>
          <div style={st.formGrid}>
            <div style={st.field}>
              <label style={st.label}>{t('bidcambio.portal.responder.taxa_oferecida')}</label>
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
              <label style={st.label}>{t('bidcambio.portal.responder.iof')}</label>
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
              <label style={st.label}>{t('bidcambio.portal.responder.validade_minutos')}</label>
              <input
                style={st.input}
                type="number"
                min="1"
                value={form.validade_minutos}
                onChange={(e) => handleChange('validade_minutos', e.target.value)}
              />
            </div>
            <div style={st.field}>
              <label style={st.label}>{t('bidcambio.portal.responder.liquidacao_proposta')}</label>
              <select
                style={st.selectInput}
                value={form.liquidacao_proposta}
                onChange={(e) => handleChange('liquidacao_proposta', e.target.value)}
              >
                <option value="D0">D+0</option>
                <option value="D1">D+1</option>
                <option value="D2">D+2</option>
              </select>
            </div>
            <div style={{ ...st.field, ...st.fieldWide }}>
              <label style={st.label}>{t('bidcambio.portal.responder.observacoes')}</label>
              <textarea
                style={st.textarea}
                rows={3}
                placeholder="Informacoes adicionais sobre a proposta..."
                value={form.observacoes}
                onChange={(e) => handleChange('observacoes', e.target.value)}
              />
            </div>
          </div>

          {erro && <p style={st.errorMsg}>{erro}</p>}

          <button
            type="submit"
            style={{
              ...st.submitBtn,
              opacity: enviando ? 0.6 : 1,
              cursor: enviando ? 'not-allowed' : 'pointer',
            }}
            disabled={enviando}
          >
            <Send size={16} />
            {enviando ? t('bidcambio.portal.responder.enviando') : t('bidcambio.portal.responder.enviar')}
          </button>
        </form>
      </div>
    </div>
  )
}
