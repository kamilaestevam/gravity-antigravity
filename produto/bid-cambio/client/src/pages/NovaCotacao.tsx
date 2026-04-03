/**
 * NovaCotacao.tsx — Formulario de nova cotacao de cambio
 * Moeda, valor, tipo, modalidade, liquidacao, corretoras, disparo
 *
 * Design System: Solid Slate, Plus Jakarta Sans, Lucide React icons
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeftRight,
  Send,
  Building2,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  Plus,
  X,
} from 'lucide-react'

import { criarCotacao, dispararBids, listarCorretoras } from '../shared/api'
import type {
  Corretora,
  TipoOperacaoCambio,
  ModalidadeCambio,
  LiquidacaoCambio,
  MoedaCambio,
  CotacaoCambio,
} from '../shared/types'
import {
  OPERACAO_CAMBIO_LABELS,
  MODALIDADE_CAMBIO_LABELS,
  LIQUIDACAO_LABELS,
  MOEDA_CAMBIO_LABELS,
  STATUS_CORRETORA_LABELS,
} from '../shared/types'

// ─── Styles ────────────────────────────────────────────────────────────────

const containerStyle: React.CSSProperties = {
  padding: '1.5rem',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  color: 'var(--text-primary, #f1f5f9)',
  maxWidth: 720,
}

const cardStyle: React.CSSProperties = {
  background: 'var(--bg-surface, #334155)',
  borderRadius: 12,
  padding: '1.5rem',
  marginBottom: '1.25rem',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.75rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--text-muted, #64748b)',
  marginBottom: '0.35rem',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.6rem 0.75rem',
  borderRadius: 8,
  border: '1px solid var(--bg-elevated, #475569)',
  background: 'var(--bg-base, #1e293b)',
  color: 'var(--text-primary, #f1f5f9)',
  fontSize: '0.875rem',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
}

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 0.75rem center',
  paddingRight: '2rem',
}

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
  padding: '0.6rem 1.5rem', borderRadius: 9999,
  fontSize: '0.875rem', fontWeight: 600,
  background: 'var(--accent, #6366f1)', color: '#fff',
  border: 'none', cursor: 'pointer', fontFamily: 'inherit',
}

const btnSecondary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
  padding: '0.5rem 1.25rem', borderRadius: 9999,
  fontSize: '0.875rem', fontWeight: 600,
  background: 'var(--bg-surface, #334155)', color: 'var(--text-secondary, #94a3b8)',
  border: '1px solid var(--bg-elevated, #475569)', cursor: 'pointer', fontFamily: 'inherit',
}

const gridRow: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem',
}

const gridRow3: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem',
}

// ─── Componente Principal ──────────────────────────────────────────────────

export default function NovaCotacao() {
  const { t } = useTranslation()
  // ── Form state ──
  const [moeda, setMoeda] = useState<MoedaCambio>('USD')
  const [valor, setValor] = useState<string>('')
  const [tipoOperacao, setTipoOperacao] = useState<TipoOperacaoCambio>('IMPORTACAO')
  const [modalidade, setModalidade] = useState<ModalidadeCambio>('PRONTO')
  const [liquidacao, setLiquidacao] = useState<LiquidacaoCambio>('D0')
  const [referenciaProcesso, setReferenciaProcesso] = useState('')
  const [numeroPedido, setNumeroPedido] = useState('')
  const [exportador, setExportador] = useState('')
  const [descricao, setDescricao] = useState('')
  const [prazoResposta, setPrazoResposta] = useState('')
  const [totalParcelas, setTotalParcelas] = useState(1)

  // ── Corretoras ──
  const [corretoras, setCorretoras] = useState<Corretora[]>([])
  const [loadingCorretoras, setLoadingCorretoras] = useState(true)
  const [selectedCorretoras, setSelectedCorretoras] = useState<Set<string>>(new Set())

  // ── Submit state ──
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [createdCotacao, setCreatedCotacao] = useState<CotacaoCambio | null>(null)
  const [disabled, setDisabled] = useState(false)

  // ── Load corretoras ──
  const loadCorretoras = useCallback(async () => {
    setLoadingCorretoras(true)
    try {
      const res = await listarCorretoras({ status: 'ATIVO' })
      setCorretoras(res.corretoras)
    } catch {
      setCorretoras([])
    } finally {
      setLoadingCorretoras(false)
    }
  }, [])

  useEffect(() => { loadCorretoras() }, [loadCorretoras])

  // ── Toggle corretora ──
  const toggleCorretora = useCallback((id: string) => {
    setSelectedCorretoras((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  // ── Submit ──
  const handleSubmit = useCallback(async () => {
    setError(null)
    if (!valor || Number(valor) <= 0) {
      setError(t('bidcambio.nova_cotacao.erro_valor'))
      return
    }
    if (selectedCorretoras.size === 0) {
      setError(t('bidcambio.nova_cotacao.erro_corretora'))
      return
    }

    setSubmitting(true)
    try {
      const cotacao = await criarCotacao({
        moeda,
        valor_moeda_estrangeira: Number(valor),
        tipo_operacao: tipoOperacao,
        modalidade,
        liquidacao,
        processo_id: referenciaProcesso || undefined,
        invoice_numero: numeroPedido || undefined,
        descricao: descricao || undefined,
        prazo_resposta: prazoResposta || undefined,
        total_parcelas: totalParcelas,
      })

      await dispararCotacao(cotacao.id, Array.from(selectedCorretoras), ['EMAIL'])

      setCreatedCotacao(cotacao)
      setSuccess(true)
      setDisabled(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar cotacao')
    } finally {
      setSubmitting(false)
    }
  }, [moeda, valor, tipoOperacao, modalidade, liquidacao, referenciaProcesso, numeroPedido, descricao, prazoResposta, totalParcelas, selectedCorretoras])

  // ─── Success State ─────────────────────────────────────────────────────

  if (success && createdCotacao) {
    return (
      <div style={containerStyle}>
        <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem 2rem' }}>
          <CheckCircle2 size={48} style={{ color: 'var(--success, #22c55e)', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
            {t('bidcambio.nova_cotacao.sucesso')}
          </h2>
          <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.875rem', margin: '0 0 0.5rem' }}>
            Numero: <strong style={{ color: 'var(--accent, #6366f1)', fontFamily: "'DM Mono', monospace" }}>{createdCotacao.numero}</strong>
          </p>
          <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.875rem', margin: '0 0 1.5rem' }}>
            {t('bidcambio.nova_cotacao.sucesso_corretoras', { count: selectedCorretoras.size })}
          </p>
          <button
            onClick={() => {
              setSuccess(false)
              setDisabled(false)
              setCreatedCotacao(null)
              setValor('')
              setSelectedCorretoras(new Set())
              setError(null)
            }}
            style={btnSecondary}
          >
            <Plus size={14} /> {t('bidcambio.nova_cotacao.nova')}
          </button>
        </div>
      </div>
    )
  }

  // ─── Form ──────────────────────────────────────────────────────────────

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <ArrowLeftRight size={22} style={{ color: 'var(--accent, #6366f1)' }} />
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{t('bidcambio.nova_cotacao.titulo')}</h1>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem',
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
        }}>
          <AlertTriangle size={16} style={{ color: 'var(--danger, #ef4444)' }} />
          <span style={{ fontSize: '0.875rem', color: 'var(--danger, #ef4444)' }}>{error}</span>
        </div>
      )}

      {/* Dados Principais */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, margin: '0 0 1rem', color: 'var(--text-primary, #f1f5f9)' }}>
          {t('bidcambio.nova_cotacao.dados_operacao')}
        </h3>

        <div style={gridRow}>
          <div>
            <label style={labelStyle}>{t('bidcambio.nova_cotacao.moeda')}</label>
            <select
              value={moeda}
              onChange={(e) => setMoeda(e.target.value as MoedaCambio)}
              style={selectStyle}
              disabled={disabled}
            >
              {(Object.entries(MOEDA_CAMBIO_LABELS) as [MoedaCambio, string][]).map(([key, label]) => (
                <option key={key} value={key}>{key} - {label}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>{t('bidcambio.nova_cotacao.valor')}</label>
            <input
              type="number"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0.00"
              min={0}
              step={0.01}
              style={{ ...inputStyle, fontFamily: "'DM Mono', monospace" }}
              disabled={disabled}
            />
          </div>
        </div>

        <div style={gridRow3}>
          <div>
            <label style={labelStyle}>{t('bidcambio.nova_cotacao.tipo_operacao')}</label>
            <select
              value={tipoOperacao}
              onChange={(e) => setTipoOperacao(e.target.value as TipoOperacaoCambio)}
              style={selectStyle}
              disabled={disabled}
            >
              {(Object.entries(OPERACAO_CAMBIO_LABELS) as [TipoOperacaoCambio, string][]).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>{t('bidcambio.nova_cotacao.modalidade')}</label>
            <select
              value={modalidade}
              onChange={(e) => setModalidade(e.target.value as ModalidadeCambio)}
              style={selectStyle}
              disabled={disabled}
            >
              {(Object.entries(MODALIDADE_CAMBIO_LABELS) as [ModalidadeCambio, string][]).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>{t('bidcambio.nova_cotacao.liquidacao')}</label>
            <select
              value={liquidacao}
              onChange={(e) => setLiquidacao(e.target.value as LiquidacaoCambio)}
              style={selectStyle}
              disabled={disabled}
            >
              {(Object.entries(LIQUIDACAO_LABELS) as [LiquidacaoCambio, string][]).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={gridRow}>
          <div>
            <label style={labelStyle}>{t('bidcambio.nova_cotacao.prazo_resposta')}</label>
            <input
              type="datetime-local"
              value={prazoResposta}
              onChange={(e) => setPrazoResposta(e.target.value)}
              style={inputStyle}
              disabled={disabled}
            />
          </div>
          <div>
            <label style={labelStyle}>{t('bidcambio.nova_cotacao.total_parcelas')}</label>
            <input
              type="number"
              value={totalParcelas}
              onChange={(e) => setTotalParcelas(Math.max(1, Number(e.target.value)))}
              min={1}
              max={60}
              style={{ ...inputStyle, fontFamily: "'DM Mono', monospace" }}
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      {/* Referencia */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, margin: '0 0 1rem', color: 'var(--text-primary, #f1f5f9)' }}>
          {t('bidcambio.nova_cotacao.referencias')}
        </h3>
        <div style={gridRow3}>
          <div>
            <label style={labelStyle}>{t('bidcambio.nova_cotacao.ref_processo')}</label>
            <input
              type="text"
              value={referenciaProcesso}
              onChange={(e) => setReferenciaProcesso(e.target.value)}
              placeholder="Opcional"
              style={inputStyle}
              disabled={disabled}
            />
          </div>
          <div>
            <label style={labelStyle}>{t('bidcambio.nova_cotacao.num_pedido')}</label>
            <input
              type="text"
              value={numeroPedido}
              onChange={(e) => setNumeroPedido(e.target.value)}
              placeholder="Opcional"
              style={inputStyle}
              disabled={disabled}
            />
          </div>
          <div>
            <label style={labelStyle}>{t('bidcambio.nova_cotacao.exportador')}</label>
            <input
              type="text"
              value={exportador}
              onChange={(e) => setExportador(e.target.value)}
              placeholder="Opcional"
              style={inputStyle}
              disabled={disabled}
            />
          </div>
        </div>
        <div>
          <label style={labelStyle}>{t('bidcambio.nova_cotacao.descricao')}</label>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Observacoes adicionais..."
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Corretoras */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Building2 size={16} style={{ color: 'var(--accent, #6366f1)' }} />
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>
            Selecionar Corretoras ({selectedCorretoras.size} selecionada{selectedCorretoras.size !== 1 ? 's' : ''})
          </h3>
        </div>

        {loadingCorretoras ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted, #64748b)' }}>
            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: '0.875rem' }}>{t('bidcambio.nova_cotacao.carregando_corretoras')}</span>
          </div>
        ) : corretoras.length === 0 ? (
          <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.875rem', margin: 0 }}>
            {t('bidcambio.nova_cotacao.nenhuma_corretora')}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {corretoras.map((c) => (
              <label
                key={c.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.65rem 0.75rem', borderRadius: 8,
                  background: selectedCorretoras.has(c.id) ? 'rgba(99,102,241,0.1)' : 'var(--bg-base, #1e293b)',
                  border: `1px solid ${selectedCorretoras.has(c.id) ? 'var(--accent, #6366f1)' : 'var(--bg-elevated, #475569)'}`,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.5 : 1,
                  transition: 'all 0.15s',
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedCorretoras.has(c.id)}
                  onChange={() => toggleCorretora(c.id)}
                  disabled={disabled}
                  style={{ accentColor: 'var(--accent, #6366f1)' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary, #f1f5f9)' }}>
                    {c.nome}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', display: 'flex', gap: '0.75rem' }}>
                    <span>{c.tipo}</span>
                    <span>{c.email}</span>
                    {c.rating_global != null && <span>Rating: {c.rating_global.toFixed(1)}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                  {c.moedas_atendidas.slice(0, 4).map((m) => (
                    <span key={m} style={{
                      fontSize: '0.625rem', fontWeight: 700, color: 'var(--accent, #6366f1)',
                      background: 'rgba(99,102,241,0.15)', padding: '0.05rem 0.35rem', borderRadius: 9999,
                    }}>
                      {m}
                    </span>
                  ))}
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
        <button
          onClick={handleSubmit}
          disabled={submitting || disabled}
          style={{
            ...btnPrimary,
            opacity: (submitting || disabled) ? 0.5 : 1,
            cursor: (submitting || disabled) ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
          {submitting ? t('bidcambio.nova_cotacao.disparando') : t('bidcambio.nova_cotacao.disparar')}
        </button>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
