/**
 * ResponderPublico.tsx — Formulario Publico de Resposta (sem login)
 * Standalone full-screen, token validation, same form as ResponderCotacao
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Truck,
  CheckCircle,
  WarningCircle,
  CurrencyDollar,
  Anchor,
  AirplaneTilt,
  Van,
  MapPin,
  Package,
} from '@phosphor-icons/react'

import { getPublicCotacao, responderPublico } from '../../shared/api'
import type { BidResponse, ModalFrete } from '../../shared/types'
import { MODAL_LABELS } from '../../shared/types'

// ─── Types ──────────────────────────────────────────────────────────────────

interface CotacaoPublica {
  numero_cotacao_bid_frete_internacional: string
  origem_nome_cotacao_bid_frete_internacional: string
  destino_nome_cotacao_bid_frete_internacional: string
  modal_cotacao_bid_frete_internacional: ModalFrete
  incoterm_cotacao_bid_frete_internacional: string
  descricao_mercadoria_cotacao_bid_frete_internacional: string
  quantidade_cotacao_bid_frete_internacional: number
  peso_kg_cotacao_bid_frete_internacional: number | null
  fornecedor_nome: string
}

interface FormState {
  moeda_ganho_bid_frete_internacional: string
  valor_frete_proposta_bid_frete_internacional: string
  taxas_origem_proposta_bid_frete_internacional: string
  taxas_destino_proposta_bid_frete_internacional: string
  dias_transito_proposta_bid_frete_internacional: string
  dias_free_time_proposta_bid_frete_internacional: string
  validade: string
  transbordos_proposta_bid_frete_internacional: string
  escalas_proposta_bid_frete_internacional: string
  observacoes_proposta_bid_frete_internacional: string
}

type PageState = 'loading' | 'invalid' | 'form' | 'success'

const MOEDAS = ['USD', 'EUR', 'BRL', 'CNY', 'GBP']

const MODAL_ICONS: Record<ModalFrete, React.ReactNode> = {
  MARITIMO: <Anchor weight="duotone" size={18} />,
  AEREO: <AirplaneTilt weight="duotone" size={18} />,
  RODOVIARIO: <Van weight="duotone" size={18} />,
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function ResponderPublico() {
  const { token_resposta_pedido_cotacao_bid_frete_internacional: token } = useParams<{ token_resposta_pedido_cotacao_bid_frete_internacional: string }>()
  const { t } = useTranslation()

  const [pageState, setPageState] = useState<PageState>('loading')
  const [cotacao, setCotacao] = useState<CotacaoPublica | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  const [form, setForm] = useState<FormState>({
    moeda_ganho_bid_frete_internacional: 'USD',
    valor_frete_proposta_bid_frete_internacional: '',
    taxas_origem_proposta_bid_frete_internacional: '',
    taxas_destino_proposta_bid_frete_internacional: '',
    dias_transito_proposta_bid_frete_internacional: '',
    dias_free_time_proposta_bid_frete_internacional: '',
    validade: '',
    transbordos_proposta_bid_frete_internacional: '0',
    escalas_proposta_bid_frete_internacional: '',
    observacoes_proposta_bid_frete_internacional: '',
  })

  const carregar = useCallback(async () => {
    if (!token) {
      setPageState('invalid')
      return
    }
    try {
      const data = await getPublicCotacao(token)
      if (!data || Object.keys(data).length === 0) {
        setPageState('invalid')
        return
      }
      setCotacao(data as unknown as CotacaoPublica)
      setPageState('form')
    } catch {
      setPageState('invalid')
    }
  }, [token])

  useEffect(() => { carregar() }, [carregar])

  const total = useMemo(() => {
    const frete = parseFloat(form.valor_frete_proposta_bid_frete_internacional) || 0
    const orig = parseFloat(form.taxas_origem_proposta_bid_frete_internacional) || 0
    const dest = parseFloat(form.taxas_destino_proposta_bid_frete_internacional) || 0
    return frete + orig + dest
  }, [form.valor_frete_proposta_bid_frete_internacional, form.taxas_origem_proposta_bid_frete_internacional, form.taxas_destino_proposta_bid_frete_internacional])

  const fmtTotal = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(total)

  function handleChange(field: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    setErro('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return

    if (!form.valor_frete_proposta_bid_frete_internacional || !form.dias_transito_proposta_bid_frete_internacional || !form.validade) {
      setErro(t('bidfrete.portal.publico.campos_obrigatorios'))
      return
    }

    setEnviando(true)
    setErro('')
    try {
      const payload: Partial<BidResponse> = {
        moeda_ganho_bid_frete_internacional: form.moeda_ganho_bid_frete_internacional,
        valor_frete_proposta_bid_frete_internacional: parseFloat(form.valor_frete_proposta_bid_frete_internacional),
        taxas_origem_proposta_bid_frete_internacional: parseFloat(form.taxas_origem_proposta_bid_frete_internacional) || 0,
        taxas_destino_proposta_bid_frete_internacional: parseFloat(form.taxas_destino_proposta_bid_frete_internacional) || 0,
        valor_total_proposta_bid_frete_internacional: total,
        dias_transito_proposta_bid_frete_internacional: parseInt(form.dias_transito_proposta_bid_frete_internacional, 10),
        dias_free_time_proposta_bid_frete_internacional: form.dias_free_time_proposta_bid_frete_internacional ? parseInt(form.dias_free_time_proposta_bid_frete_internacional, 10) : null,
        validade: form.validade,
        transbordos_proposta_bid_frete_internacional: parseInt(form.transbordos_proposta_bid_frete_internacional, 10) || 0,
        escalas_proposta_bid_frete_internacional: form.escalas_proposta_bid_frete_internacional || null,
        observacoes_proposta_bid_frete_internacional: form.observacoes_proposta_bid_frete_internacional || null,
      }
      await responderPublico(token, payload)
      setPageState('success')
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao enviar resposta')
    } finally {
      setEnviando(false)
    }
  }

  // ─── Render States ──────────────────────────────────────────────────────

  if (pageState === 'loading') {
    return (
      <div className="rp-fullscreen">
        <div className="rp-card rp-card--center">
          <Truck weight="duotone" size={48} style={{ color: 'var(--accent, #6366f1)', opacity: 0.5 }} />
          <p className="rp-text-muted">{t('bidfrete.portal.publico.carregando')}</p>
        </div>
        <style>{rpStyles}</style>
      </div>
    )
  }

  if (pageState === 'invalid') {
    return (
      <div className="rp-fullscreen">
        <div className="rp-card rp-card--center">
          <WarningCircle weight="duotone" size={64} style={{ color: 'var(--danger, #ef4444)' }} />
          <h2 className="rp-title">{t('bidfrete.portal.publico.invalido_titulo')}</h2>
          <p className="rp-text-muted">{t('bidfrete.portal.publico.invalido_desc')}</p>
          <p className="rp-text-muted">{t('bidfrete.portal.publico.invalido_contato')}</p>
        </div>
        <style>{rpStyles}</style>
      </div>
    )
  }

  if (pageState === 'success') {
    return (
      <div className="rp-fullscreen">
        <div className="rp-card rp-card--center">
          <CheckCircle weight="duotone" size={64} style={{ color: 'var(--success, #22c55e)' }} />
          <h2 className="rp-title">{t('bidfrete.portal.publico.obrigado_titulo')}</h2>
          <p className="rp-text-muted">{t('bidfrete.portal.publico.obrigado_desc')}</p>
        </div>
        <style>{rpStyles}</style>
      </div>
    )
  }

  // ─── Form State ─────────────────────────────────────────────────────────

  return (
    <div className="rp-fullscreen">
      <div className="rp-card rp-card--form">
        {/* Header */}
        <div className="rp-header">
          <Truck weight="duotone" size={32} style={{ color: 'var(--accent, #6366f1)' }} />
          <div>
            <h1 className="rp-title">BID Frete — {t('bidfrete.portal.responder.titulo')}</h1>
            {cotacao?.fornecedor_nome && (
              <p className="rp-text-muted">{cotacao.fornecedor_nome}</p>
            )}
          </div>
        </div>

        {/* Quote Details */}
        <div className="rp-details">
          <h3 className="rp-section-title">{t('bidfrete.portal.responder.detalhes')}</h3>
          <div className="rp-detail-grid">
            <div className="rp-detail-item">
              <span className="rp-detail-label">{t('bidfrete.portal.responder.campo_numero')}</span>
              <span className="rp-detail-value rp-mono">{cotacao?.numero_cotacao_bid_frete_internacional ?? '—'}</span>
            </div>
            <div className="rp-detail-item">
              <span className="rp-detail-label">{t('bidfrete.portal.responder.campo_rota')}</span>
              <span className="rp-detail-value">
                <MapPin weight="duotone" size={14} />
                {cotacao?.origem_nome_cotacao_bid_frete_internacional ?? '—'} &rarr; {cotacao?.destino_nome_cotacao_bid_frete_internacional ?? '—'}
              </span>
            </div>
            <div className="rp-detail-item">
              <span className="rp-detail-label">{t('bidfrete.portal.responder.campo_modal')}</span>
              <span className="rp-detail-value">
                {cotacao?.modal_cotacao_bid_frete_internacional ? MODAL_ICONS[cotacao.modal_cotacao_bid_frete_internacional] : null}
                {cotacao?.modal_cotacao_bid_frete_internacional ? MODAL_LABELS[cotacao.modal_cotacao_bid_frete_internacional] : '—'}
              </span>
            </div>
            <div className="rp-detail-item">
              <span className="rp-detail-label">{t('bidfrete.portal.responder.campo_incoterm')}</span>
              <span className="rp-detail-value">{cotacao?.incoterm_cotacao_bid_frete_internacional ?? '—'}</span>
            </div>
            <div className="rp-detail-item rp-detail-wide">
              <span className="rp-detail-label">{t('bidfrete.portal.responder.campo_carga')}</span>
              <span className="rp-detail-value">
                <Package weight="duotone" size={14} />
                {cotacao?.descricao_mercadoria_cotacao_bid_frete_internacional ?? '—'}
                {cotacao?.quantidade_cotacao_bid_frete_internacional != null ? ` / ${cotacao.quantidade_cotacao_bid_frete_internacional} un` : ''}
                {cotacao?.peso_kg_cotacao_bid_frete_internacional != null ? ` / ${cotacao.peso_kg_cotacao_bid_frete_internacional.toLocaleString('pt-BR')} kg` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Response Form */}
        <form className="rp-form" onSubmit={handleSubmit}>
          <h3 className="rp-section-title">{t('bidfrete.portal.responder.proposta')}</h3>
          <div className="rp-form-grid">
            <div className="rp-field">
              <label className="rp-label">{t('bidfrete.portal.responder.campo_moeda')}</label>
              <select className="rp-input" value={form.moeda_ganho_bid_frete_internacional} onChange={e => handleChange('moeda_ganho_bid_frete_internacional', e.target.value)}>
                {MOEDAS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="rp-field">
              <label className="rp-label">{t('bidfrete.portal.responder.campo_valor_frete')}</label>
              <input
                className="rp-input rp-input--mono"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={form.valor_frete_proposta_bid_frete_internacional}
                onChange={e => handleChange('valor_frete_proposta_bid_frete_internacional', e.target.value)}
              />
            </div>
            <div className="rp-field">
              <label className="rp-label">{t('bidfrete.portal.responder.campo_taxas_origem')}</label>
              <input
                className="rp-input rp-input--mono"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={form.taxas_origem_proposta_bid_frete_internacional}
                onChange={e => handleChange('taxas_origem_proposta_bid_frete_internacional', e.target.value)}
              />
            </div>
            <div className="rp-field">
              <label className="rp-label">{t('bidfrete.portal.responder.campo_taxas_destino')}</label>
              <input
                className="rp-input rp-input--mono"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={form.taxas_destino_proposta_bid_frete_internacional}
                onChange={e => handleChange('taxas_destino_proposta_bid_frete_internacional', e.target.value)}
              />
            </div>

            <div className="rp-field rp-field--wide">
              <label className="rp-label">{t('bidfrete.portal.responder.campo_total')}</label>
              <div className="rp-total-display">
                <CurrencyDollar weight="duotone" size={18} />
                <span className="rp-total-valor">{form.moeda_ganho_bid_frete_internacional} {fmtTotal}</span>
              </div>
            </div>

            <div className="rp-field">
              <label className="rp-label">{t('bidfrete.portal.responder.campo_transit')}</label>
              <input
                className="rp-input rp-input--mono"
                type="number"
                min="1"
                placeholder="0"
                value={form.dias_transito_proposta_bid_frete_internacional}
                onChange={e => handleChange('dias_transito_proposta_bid_frete_internacional', e.target.value)}
              />
            </div>
            <div className="rp-field">
              <label className="rp-label">{t('bidfrete.portal.responder.campo_free_time')}</label>
              <input
                className="rp-input rp-input--mono"
                type="number"
                min="0"
                placeholder="0"
                value={form.dias_free_time_proposta_bid_frete_internacional}
                onChange={e => handleChange('dias_free_time_proposta_bid_frete_internacional', e.target.value)}
              />
            </div>
            <div className="rp-field">
              <label className="rp-label">{t('bidfrete.portal.responder.campo_validade')}</label>
              <input
                className="rp-input"
                type="date"
                value={form.validade}
                onChange={e => handleChange('validade', e.target.value)}
              />
            </div>
            <div className="rp-field">
              <label className="rp-label">{t('bidfrete.portal.responder.campo_transbordos')}</label>
              <input
                className="rp-input rp-input--mono"
                type="number"
                min="0"
                placeholder="0"
                value={form.transbordos_proposta_bid_frete_internacional}
                onChange={e => handleChange('transbordos_proposta_bid_frete_internacional', e.target.value)}
              />
            </div>
            <div className="rp-field">
              <label className="rp-label">{t('bidfrete.portal.responder.campo_escalas')}</label>
              <input
                className="rp-input"
                type="text"
                placeholder="Ex: Singapore, Colombo"
                value={form.escalas_proposta_bid_frete_internacional}
                onChange={e => handleChange('escalas_proposta_bid_frete_internacional', e.target.value)}
              />
            </div>
            <div className="rp-field rp-field--wide">
              <label className="rp-label">{t('bidfrete.portal.responder.campo_observacoes')}</label>
              <textarea
                className="rp-input rp-textarea"
                rows={3}
                placeholder="Informacoes adicionais..."
                value={form.observacoes_proposta_bid_frete_internacional}
                onChange={e => handleChange('observacoes_proposta_bid_frete_internacional', e.target.value)}
              />
            </div>
          </div>

          {erro && <p className="rp-erro">{erro}</p>}

          <button className="rp-btn-submit" type="submit" disabled={enviando}>
            {enviando ? t('bidfrete.portal.responder.enviando') : t('bidfrete.portal.responder.enviar')}
          </button>
        </form>
      </div>

      <style>{rpStyles}</style>
    </div>
  )
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const rpStyles = `
  .rp-fullscreen {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-body-dark, #0f172a);
    font-family: 'Plus Jakarta Sans', sans-serif;
    padding: 2rem;
  }

  .rp-card {
    background: var(--bg-surface, #334155);
    border-radius: var(--radius-lg, 12px);
    max-width: 700px;
    width: 100%;
  }

  .rp-card--center {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 3rem;
    gap: 0.75rem;
  }

  .rp-card--form {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .rp-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary, #f1f5f9);
    margin: 0;
  }

  .rp-text-muted {
    font-size: 0.875rem;
    color: var(--text-secondary, #94a3b8);
    margin: 0;
    max-width: 400px;
    line-height: 1.5;
  }

  /* Header */
  .rp-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--bg-elevated, #475569);
  }

  /* Details */
  .rp-details {
    padding-bottom: 0.5rem;
  }

  .rp-section-title {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--text-primary, #f1f5f9);
    margin: 0 0 0.75rem;
  }

  .rp-detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }
  .rp-detail-wide { grid-column: 1 / -1; }

  .rp-detail-item {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .rp-detail-label {
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted, #64748b);
  }

  .rp-detail-value {
    font-size: 0.875rem;
    color: var(--text-primary, #f1f5f9);
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  .rp-mono { font-family: 'DM Mono', monospace; font-weight: 600; }

  /* Form */
  .rp-form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }
  .rp-field--wide { grid-column: 1 / -1; }

  .rp-field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .rp-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-secondary, #94a3b8);
  }

  .rp-input {
    background: var(--bg-elevated, #475569);
    border: 1px solid transparent;
    border-radius: var(--radius-md, 8px);
    padding: 0.6rem 0.75rem;
    font-size: 0.875rem;
    color: var(--text-primary, #f1f5f9);
    font-family: inherit;
    outline: none;
    transition: border-color 0.15s;
  }
  .rp-input:focus { border-color: var(--accent, #6366f1); }
  .rp-input--mono { font-family: 'DM Mono', monospace; }
  .rp-textarea { resize: vertical; min-height: 70px; }

  .rp-total-display {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(99,102,241,0.1);
    border: 1px solid rgba(99,102,241,0.25);
    border-radius: var(--radius-md, 8px);
    padding: 0.75rem 1rem;
    color: var(--accent, #6366f1);
  }

  .rp-total-valor {
    font-size: 1.25rem;
    font-weight: 700;
    font-family: 'DM Mono', monospace;
    color: var(--text-primary, #f1f5f9);
  }

  .rp-erro {
    margin-top: 0.5rem;
    font-size: 0.8125rem;
    color: var(--danger, #ef4444);
    background: rgba(239,68,68,0.1);
    padding: 0.5rem 0.75rem;
    border-radius: var(--radius-md, 8px);
  }

  .rp-btn-submit {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 0.75rem;
    border-radius: 9999px;
    font-size: 0.9375rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
    border: none;
    font-family: inherit;
    background: var(--accent, #6366f1);
    color: #fff;
    margin-top: 0.75rem;
  }
  .rp-btn-submit:hover { background: var(--accent-hover, #4f46e5); }
  .rp-btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
`
