/**
 * ResponderCotacao.tsx — Portal do Fornecedor: Formulario de Resposta
 * Detalhes read-only + form de proposta + submit
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { GravityLoader } from '@nucleo/gravity-loader-global'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import {
  PencilSimple,
  ArrowLeft,
  CheckCircle,
  Anchor,
  AirplaneTilt,
  Van,
  Package,
  MapPin,
  CurrencyDollar,
} from '@phosphor-icons/react'

import { getPortalPendentes, responderBid } from '../../shared/api'
import type { BidRequest, BidResponse, ModalFrete } from '../../shared/types'
import { MODAL_LABELS } from '../../shared/types'

// ─── Tipos locais ───────────────────────────────────────────────────────────

interface CotacaoInfo {
  numero: string
  origem_nome: string
  destino_nome: string
  modal: ModalFrete
  incoterm: string
  descricao_mercadoria: string
  quantidade: number
  peso_kg: number | null
  cubagem_m3: number | null
}

interface FormState {
  moeda: string
  valor_frete: string
  taxas_origem: string
  taxas_destino: string
  transit_time_dias: string
  free_time_dias: string
  validade: string
  transbordos: string
  escalas: string
  observacoes: string
}

const MOEDAS = ['USD', 'EUR', 'BRL', 'CNY', 'GBP']

const MODAL_ICONS: Record<ModalFrete, React.ReactNode> = {
  MARITIMO: <Anchor weight="duotone" size={18} />,
  AEREO: <AirplaneTilt weight="duotone" size={18} />,
  RODOVIARIO: <Van weight="duotone" size={18} />,
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function ResponderCotacao() {
  const { id_cotacao: bidRequestId } = useParams<{ id_cotacao: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [bid, setBid] = useState<BidRequest | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')

  const [form, setForm] = useState<FormState>({
    moeda: 'USD',
    valor_frete: '',
    taxas_origem: '',
    taxas_destino: '',
    transit_time_dias: '',
    free_time_dias: '',
    validade: '',
    transbordos: '0',
    escalas: '',
    observacoes: '',
  })

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const pendentes = await getPortalPendentes()
      const found = pendentes.find(b => b.id === bidRequestId)
      if (found) setBid(found)
    } catch {
      // silencioso
    } finally {
      setCarregando(false)
    }
  }, [bidRequestId])

  useEffect(() => { carregar() }, [carregar])

  const cotacao = bid ? (bid as unknown as { cotacao: CotacaoInfo }).cotacao : null

  const total = useMemo(() => {
    const frete = parseFloat(form.valor_frete) || 0
    const orig = parseFloat(form.taxas_origem) || 0
    const dest = parseFloat(form.taxas_destino) || 0
    return frete + orig + dest
  }, [form.valor_frete, form.taxas_origem, form.taxas_destino])

  const fmtTotal = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(total)

  function handleChange(field: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    setErro('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!bidRequestId) return

    if (!form.valor_frete || !form.transit_time_dias || !form.validade) {
      setErro(t('bidfrete.portal.publico.campos_obrigatorios'))
      return
    }

    setEnviando(true)
    setErro('')
    try {
      const payload: Partial<BidResponse> = {
        moeda: form.moeda,
        valor_frete: parseFloat(form.valor_frete),
        taxas_origem: parseFloat(form.taxas_origem) || 0,
        taxas_destino: parseFloat(form.taxas_destino) || 0,
        valor_total: total,
        transit_time_dias: parseInt(form.transit_time_dias, 10),
        free_time_dias: form.free_time_dias ? parseInt(form.free_time_dias, 10) : null,
        validade: form.validade,
        transbordos: parseInt(form.transbordos, 10) || 0,
        escalas: form.escalas || null,
        observacoes: form.observacoes || null,
      }
      await responderBid(bidRequestId, payload)
      setSucesso(true)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao enviar resposta')
    } finally {
      setEnviando(false)
    }
  }

  if (sucesso) {
    return (
      <PaginaGlobal
        cabecalho={
          <CabecalhoGlobal
            icone={<CheckCircle weight="duotone" size={22} />}
            titulo={t('bidfrete.portal.responder.titulo_enviada')}
          />
        }
      >
        <div className="rc-sucesso">
          <CheckCircle weight="duotone" size={64} style={{ color: 'var(--success, #22c55e)' }} />
          <h2 className="rc-sucesso-title">{t('bidfrete.portal.responder.sucesso')}</h2>
          <p className="rc-sucesso-desc">{t('bidfrete.portal.responder.sucesso_desc')}</p>
          <button className="rc-btn rc-btn--primary" onClick={() => navigate('/portal/pendentes')}>
            {t('bidfrete.portal.responder.voltar_pendentes')}
          </button>
        </div>
        <style>{rcStyles}</style>
      </PaginaGlobal>
    )
  }

  return (
    <PaginaGlobal
      className="rc-page"
      cabecalho={
        <CabecalhoGlobal
          icone={<PencilSimple weight="duotone" size={22} />}
          titulo={t('bidfrete.portal.responder.titulo')}
          acoes={
            <button className="rc-btn rc-btn--secondary" onClick={() => navigate('/portal/pendentes')}>
              <ArrowLeft weight="bold" size={14} /> {t('bidfrete.portal.responder.voltar')}
            </button>
          }
        />
      }
    >
      {carregando ? (
        <div className="rc-loading">
          <GravityLoader texto={t('comum.carregando')} tamanho="sm" />
        </div>
      ) : (
        <div className="rc-layout">
          {/* Detalhes Read-Only */}
          <div className="rc-details">
            <h3 className="rc-section-title">{t('bidfrete.portal.responder.detalhes')}</h3>
            <div className="rc-detail-grid">
              <div className="rc-detail-item">
                <span className="rc-detail-label">{t('bidfrete.portal.responder.campo_numero')}</span>
                <span className="rc-detail-value rc-mono">
                  {cotacao?.numero ?? bid?.cotacao_id.slice(0, 8).toUpperCase() ?? '—'}
                </span>
              </div>
              <div className="rc-detail-item">
                <span className="rc-detail-label">{t('bidfrete.portal.responder.campo_rota')}</span>
                <span className="rc-detail-value">
                  <MapPin weight="duotone" size={14} />
                  {cotacao?.origem_nome ?? '—'} &rarr; {cotacao?.destino_nome ?? '—'}
                </span>
              </div>
              <div className="rc-detail-item">
                <span className="rc-detail-label">{t('bidfrete.portal.responder.campo_modal')}</span>
                <span className="rc-detail-value">
                  {cotacao?.modal ? MODAL_ICONS[cotacao.modal] : null}
                  {cotacao?.modal ? MODAL_LABELS[cotacao.modal] : '—'}
                </span>
              </div>
              <div className="rc-detail-item">
                <span className="rc-detail-label">{t('bidfrete.portal.responder.campo_incoterm')}</span>
                <span className="rc-detail-value">{cotacao?.incoterm ?? '—'}</span>
              </div>
              <div className="rc-detail-item rc-detail-wide">
                <span className="rc-detail-label">{t('bidfrete.portal.responder.campo_carga')}</span>
                <span className="rc-detail-value">
                  <Package weight="duotone" size={14} />
                  {cotacao?.descricao_mercadoria ?? '—'}
                  {cotacao?.quantidade != null ? ` / ${cotacao.quantidade} un` : ''}
                  {cotacao?.peso_kg != null ? ` / ${cotacao.peso_kg.toLocaleString('pt-BR')} kg` : ''}
                  {cotacao?.cubagem_m3 != null ? ` / ${cotacao.cubagem_m3} m3` : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form className="rc-form" onSubmit={handleSubmit}>
            <h3 className="rc-section-title">{t('bidfrete.portal.responder.proposta')}</h3>

            <div className="rc-form-grid">
              <div className="rc-field">
                <label className="rc-label">{t('bidfrete.portal.responder.campo_moeda')}</label>
                <select
                  className="rc-input"
                  value={form.moeda}
                  onChange={e => handleChange('moeda', e.target.value)}
                >
                  {MOEDAS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div className="rc-field">
                <label className="rc-label">{t('bidfrete.portal.responder.campo_valor_frete')}</label>
                <input
                  className="rc-input rc-input--mono"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={form.valor_frete}
                  onChange={e => handleChange('valor_frete', e.target.value)}
                />
              </div>

              <div className="rc-field">
                <label className="rc-label">{t('bidfrete.portal.responder.campo_taxas_origem')}</label>
                <input
                  className="rc-input rc-input--mono"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={form.taxas_origem}
                  onChange={e => handleChange('taxas_origem', e.target.value)}
                />
              </div>

              <div className="rc-field">
                <label className="rc-label">{t('bidfrete.portal.responder.campo_taxas_destino')}</label>
                <input
                  className="rc-input rc-input--mono"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={form.taxas_destino}
                  onChange={e => handleChange('taxas_destino', e.target.value)}
                />
              </div>

              {/* Total auto-calculated */}
              <div className="rc-field rc-field--total">
                <label className="rc-label">{t('bidfrete.portal.responder.campo_total')}</label>
                <div className="rc-total-display">
                  <CurrencyDollar weight="duotone" size={18} />
                  <span className="rc-total-valor">{form.moeda} {fmtTotal}</span>
                </div>
              </div>

              <div className="rc-field">
                <label className="rc-label">{t('bidfrete.portal.responder.campo_transit')}</label>
                <input
                  className="rc-input rc-input--mono"
                  type="number"
                  min="1"
                  placeholder="0"
                  value={form.transit_time_dias}
                  onChange={e => handleChange('transit_time_dias', e.target.value)}
                />
              </div>

              <div className="rc-field">
                <label className="rc-label">{t('bidfrete.portal.responder.campo_free_time')}</label>
                <input
                  className="rc-input rc-input--mono"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.free_time_dias}
                  onChange={e => handleChange('free_time_dias', e.target.value)}
                />
              </div>

              <div className="rc-field">
                <label className="rc-label">{t('bidfrete.portal.responder.campo_validade')}</label>
                <input
                  className="rc-input"
                  type="date"
                  value={form.validade}
                  onChange={e => handleChange('validade', e.target.value)}
                />
              </div>

              <div className="rc-field">
                <label className="rc-label">{t('bidfrete.portal.responder.campo_transbordos')}</label>
                <input
                  className="rc-input rc-input--mono"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.transbordos}
                  onChange={e => handleChange('transbordos', e.target.value)}
                />
              </div>

              <div className="rc-field">
                <label className="rc-label">{t('bidfrete.portal.responder.campo_escalas')}</label>
                <input
                  className="rc-input"
                  type="text"
                  placeholder="Ex: Singapore, Colombo"
                  value={form.escalas}
                  onChange={e => handleChange('escalas', e.target.value)}
                />
              </div>

              <div className="rc-field rc-field--wide">
                <label className="rc-label">{t('bidfrete.portal.responder.campo_observacoes')}</label>
                <textarea
                  className="rc-input rc-textarea"
                  rows={3}
                  placeholder={t('bidfrete.portal.responder.campo_observacoes')}
                  value={form.observacoes}
                  onChange={e => handleChange('observacoes', e.target.value)}
                />
              </div>
            </div>

            {erro && <p className="rc-erro">{erro}</p>}

            <button
              className="rc-btn rc-btn--primary rc-btn--submit"
              type="submit"
              disabled={enviando}
            >
              {enviando ? t('bidfrete.portal.responder.enviando') : t('bidfrete.portal.responder.enviar')}
            </button>
          </form>
        </div>
      )}

      <style>{rcStyles}</style>
    </PaginaGlobal>
  )
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const rcStyles = `
  .rc-page { padding: 0; }

  .rc-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40vh;
    color: var(--text-muted, #64748b);
    font-size: 0.875rem;
  }

  .rc-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }
  @media (max-width: 900px) {
    .rc-layout { grid-template-columns: 1fr; }
  }

  .rc-section-title {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--text-primary, #f1f5f9);
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--bg-elevated, #475569);
  }

  /* Details */
  .rc-details {
    background: var(--bg-surface, #334155);
    border-radius: var(--radius-lg, 12px);
    padding: 1.5rem;
    align-self: start;
  }

  .rc-detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .rc-detail-wide {
    grid-column: 1 / -1;
  }

  .rc-detail-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .rc-detail-label {
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted, #64748b);
  }

  .rc-detail-value {
    font-size: 0.875rem;
    color: var(--text-primary, #f1f5f9);
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  .rc-mono {
    font-family: 'DM Mono', monospace;
    font-weight: 600;
  }

  /* Form */
  .rc-form {
    background: var(--bg-surface, #334155);
    border-radius: var(--radius-lg, 12px);
    padding: 1.5rem;
  }

  .rc-form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .rc-field--wide {
    grid-column: 1 / -1;
  }

  .rc-field--total {
    grid-column: 1 / -1;
  }

  .rc-field {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .rc-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-secondary, #94a3b8);
  }

  .rc-input {
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
  .rc-input:focus {
    border-color: var(--accent, #6366f1);
  }
  .rc-input--mono {
    font-family: 'DM Mono', monospace;
  }

  .rc-textarea {
    resize: vertical;
    min-height: 70px;
  }

  .rc-total-display {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(99,102,241,0.1);
    border: 1px solid rgba(99,102,241,0.25);
    border-radius: var(--radius-md, 8px);
    padding: 0.75rem 1rem;
    color: var(--accent, #6366f1);
  }

  .rc-total-valor {
    font-size: 1.25rem;
    font-weight: 700;
    font-family: 'DM Mono', monospace;
    color: var(--text-primary, #f1f5f9);
  }

  .rc-erro {
    margin-top: 0.75rem;
    font-size: 0.8125rem;
    color: var(--danger, #ef4444);
    background: rgba(239,68,68,0.1);
    padding: 0.5rem 0.75rem;
    border-radius: var(--radius-md, 8px);
  }

  /* Buttons */
  .rc-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1.25rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
    border: none;
    font-family: inherit;
  }

  .rc-btn--primary {
    background: var(--accent, #6366f1);
    color: #fff;
  }
  .rc-btn--primary:hover { background: var(--accent-hover, #4f46e5); }
  .rc-btn--primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .rc-btn--secondary {
    background: var(--bg-surface, #334155);
    color: var(--text-secondary, #94a3b8);
    border: 1px solid var(--bg-elevated, #475569);
  }
  .rc-btn--secondary:hover {
    background: var(--bg-elevated, #475569);
    color: var(--text-primary, #f1f5f9);
  }

  .rc-btn--submit {
    margin-top: 1.25rem;
    width: 100%;
    justify-content: center;
    padding: 0.75rem;
  }

  /* Sucesso */
  .rc-sucesso {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 50vh;
    gap: 1rem;
    text-align: center;
  }

  .rc-sucesso-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary, #f1f5f9);
  }

  .rc-sucesso-desc {
    font-size: 0.875rem;
    color: var(--text-secondary, #94a3b8);
    max-width: 400px;
  }
`
