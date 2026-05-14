/**
 * ModalCambioPagamento.tsx — Modal de pagamento de cambio em 3 etapas
 * Step 1: Selecionar parcelas + valor
 * Step 2: Contrato, banco/corretora, taxa, valor em R$
 * Step 3: Upload comprovante
 *
 * Design System: Solid Slate, Plus Jakarta Sans, Phosphor Icons
 */

import React, { useState, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CreditCard,
  X,
  CaretRight,
  CaretLeft,
  UploadSimple,
  FileText,
  CheckCircle,
  CircleNotch,
  Warning,
  Buildings,
  CurrencyDollar,
} from '@phosphor-icons/react'

import type { CambioParcelas, CambioMoeda } from '../shared/types'
import { STATUS_PARCELA_LABELS } from '../shared/types'

// ─── Formatacao ────────────────────────────────────────────────────────────

const fmtMoney = (val: number) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val)

const fmtRate = (val: number) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(val)

const dataBR = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'

// ─── Props ─────────────────────────────────────────────────────────────────

interface ModalPagamentoCambioProps {
  open: boolean
  onClose: () => void
  parcelas: CambioParcelas[]
  moeda: CambioMoeda
  onSave: (data: PagamentoData) => Promise<void>
  disabled?: boolean
}

export interface PagamentoData {
  parcela_ids: string[]
  valor_a_pagar: number
  contrato_cambio: string
  banco_corretora: string
  taxa_fechamento: number
  valor_brl: number
  comprovante_file: File | null
  comprovante_nome: string
}

// ─── Componente Principal ──────────────────────────────────────────────────

export default function ModalPagamentoCambio({ open, onClose, parcelas, moeda, onSave, disabled = false }: ModalPagamentoCambioProps) {
  const { t } = useTranslation()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Step 1
  const [selectedParcelas, setSelectedParcelas] = useState<Set<string>>(new Set())
  const [valoresEditados, setValoresEditados] = useState<Record<string, string>>({})

  // Step 2
  const [contratoCambio, setContratoCambio] = useState('')
  const [bancoCorretora, setBancoCorretora] = useState('')
  const [taxaFechamento, setTaxaFechamento] = useState('')
  const [valorBrl, setValorBrl] = useState('')

  // Step 3
  const [comprovanteFile, setComprovanteFile] = useState<File | null>(null)
  const [comprovanteNome, setComprovanteNome] = useState('')

  // ── Computed ───────────────────────────────────────────────────────────

  const parcelasDisponiveis = useMemo(() =>
    parcelas.filter(p => p.status === 'PENDENTE' || p.status === 'AGENDADA'),
    [parcelas]
  )

  const totalSelecionado = useMemo(() => {
    return parcelasDisponiveis
      .filter(p => selectedParcelas.has(p.id))
      .reduce((sum, p) => {
        const editado = valoresEditados[p.id]
        return sum + (editado != null ? Number(editado) || 0 : p.valor_moeda_estrangeira)
      }, 0)
  }, [parcelasDisponiveis, selectedParcelas, valoresEditados])

  // ── Handlers ───────────────────────────────────────────────────────────

  const toggleParcela = useCallback((id: string) => {
    setSelectedParcelas(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleValorEdit = useCallback((id: string, valor: string, limiteMax: number) => {
    const num = Number(valor)
    if (valor === '' || (num >= 0 && num <= limiteMax)) {
      setValoresEditados(prev => ({ ...prev, [id]: valor }))
    }
  }, [])

  const canGoStep2 = selectedParcelas.size > 0 && totalSelecionado > 0
  const canGoStep3 = contratoCambio.trim() !== '' && bancoCorretora.trim() !== '' && Number(taxaFechamento) > 0 && Number(valorBrl) > 0

  const handleSave = useCallback(async () => {
    setError(null)
    setSaving(true)
    try {
      await onSave({
        parcela_ids: Array.from(selectedParcelas),
        valor_a_pagar: totalSelecionado,
        contrato_cambio: contratoCambio,
        banco_corretora: bancoCorretora,
        taxa_fechamento: Number(taxaFechamento),
        valor_brl: Number(valorBrl),
        comprovante_file: comprovanteFile,
        comprovante_nome: comprovanteNome || comprovanteFile?.name || '',
      })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('comum.erro_salvar'))
    } finally {
      setSaving(false)
    }
  }, [selectedParcelas, totalSelecionado, contratoCambio, bancoCorretora, taxaFechamento, valorBrl, comprovanteFile, comprovanteNome, onSave])

  const reset = useCallback(() => {
    setStep(1)
    setSelectedParcelas(new Set())
    setValoresEditados({})
    setContratoCambio('')
    setBancoCorretora('')
    setTaxaFechamento('')
    setValorBrl('')
    setComprovanteFile(null)
    setComprovanteNome('')
    setError(null)
    setSuccess(false)
  }, [])

  // ── Styles ─────────────────────────────────────────────────────────────

  if (!open) return null

  const overlayStyle: React.CSSProperties = {
    position: 'fixed', inset: 0, zIndex: 200,
    background: 'rgba(0,0,0,0.65)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  }

  const modalStyle: React.CSSProperties = {
    background: 'var(--bg-surface, #334155)',
    borderRadius: 16, padding: '1.5rem',
    width: 520, maxHeight: '85vh', overflowY: 'auto',
    border: '1px solid var(--bg-elevated, #475569)',
    color: 'var(--text-primary, #f1f5f9)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.75rem', fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '0.05em',
    color: 'var(--text-muted, #64748b)', marginBottom: '0.35rem',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.6rem 0.75rem', borderRadius: 8,
    border: '1px solid var(--bg-elevated, #475569)',
    background: 'var(--bg-base, #1e293b)', color: 'var(--text-primary, #f1f5f9)',
    fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  }

  const btnPrimary: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.5rem 1.25rem', borderRadius: 9999,
    fontSize: '0.875rem', fontWeight: 600, border: 'none',
    background: 'var(--accent, #6366f1)', color: '#fff',
    cursor: 'pointer', fontFamily: 'inherit',
  }

  const btnSecondary: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.5rem 1.25rem', borderRadius: 9999,
    fontSize: '0.875rem', fontWeight: 600,
    border: '1px solid var(--bg-elevated, #475569)', background: 'transparent',
    color: 'var(--text-secondary, #94a3b8)', cursor: 'pointer', fontFamily: 'inherit',
  }

  // ── Step Indicator ─────────────────────────────────────────────────────

  const stepIndicator = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
      {[1, 2, 3].map((s) => (
        <React.Fragment key={s}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: 700,
            background: step >= s ? 'var(--accent, #6366f1)' : 'var(--bg-elevated, #475569)',
            color: step >= s ? '#fff' : 'var(--text-muted, #64748b)',
            transition: 'all 0.2s',
          }}>
            {s}
          </div>
          {s < 3 && (
            <div style={{
              width: 32, height: 2,
              background: step > s ? 'var(--accent, #6366f1)' : 'var(--bg-elevated, #475569)',
              transition: 'background 0.2s',
            }} />
          )}
        </React.Fragment>
      ))}
    </div>
  )

  // ─── Success ───────────────────────────────────────────────────────────

  if (success) {
    return (
      <div style={overlayStyle} onClick={onClose}>
        <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <CheckCircle size={48} weight="duotone" style={{ color: 'var(--success, #22c55e)', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0 0 0.5rem' }}>{t('bidcambio.modal_pagamento.sucesso')}</h3>
            <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.875rem', margin: '0 0 1.5rem' }}>
              {t('bidcambio.modal_pagamento.parcelas_pagas', { count: selectedParcelas.size })}
            </p>
            <button onClick={() => { reset(); onClose() }} style={btnPrimary}>{t('acoes.fechar')}</button>
          </div>
        </div>
      </div>
    )
  }

  // ─── Modal Content ─────────────────────────────────────────────────────

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', paddingBottom: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--bg-elevated, #475569)', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={20} weight="duotone" style={{ color: 'var(--ws-accent, #818cf8)', flexShrink: 0 }} />
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.25rem', fontWeight: 700, margin: 0, lineHeight: 1.2, color: 'var(--text-primary, #f1f5f9)' }}>
                {t('bidcambio.modal_pagamento.titulo')}
              </h3>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)', margin: 0, lineHeight: 1.4 }}>
              Selecione parcelas, informe dados do câmbio e anexe o comprovante
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted, #64748b)', cursor: 'pointer', padding: '2px', flexShrink: 0 }}>
            <X size={18} weight="bold" />
          </button>
        </div>

        {stepIndicator}

        {/* Error */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.65rem 0.75rem', borderRadius: 8, marginBottom: '1rem',
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          }}>
            <Warning size={14} style={{ color: 'var(--danger, #ef4444)' }} />
            <span style={{ fontSize: '0.8125rem', color: 'var(--danger, #ef4444)' }}>{error}</span>
          </div>
        )}

        {/* Step 1: Selecionar Parcelas */}
        {step === 1 && (
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, margin: '0 0 0.75rem' }}>
              {t('bidcambio.modal_pagamento.selecionar_parcelas')}
            </h4>

            {parcelasDisponiveis.length === 0 ? (
              <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.875rem' }}>
                {t('bidcambio.modal_pagamento.nenhuma_parcela')}
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                {parcelasDisponiveis.map((p) => {
                  const selected = selectedParcelas.has(p.id)
                  const editedVal = valoresEditados[p.id]
                  return (
                    <div
                      key={p.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        padding: '0.65rem 0.75rem', borderRadius: 8,
                        background: selected ? 'rgba(99,102,241,0.1)' : 'var(--bg-base, #1e293b)',
                        border: `1px solid ${selected ? 'var(--accent, #6366f1)' : 'var(--bg-elevated, #475569)'}`,
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        opacity: disabled ? 0.5 : 1,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleParcela(p.id)}
                        disabled={disabled}
                        style={{ accentColor: 'var(--accent, #6366f1)' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                          {t('bidcambio.modal_pagamento.parcela_num', { num: p.numero_parcela })} — {t('bidcambio.modal_pagamento.vencimento')}: {dataBR(p.data_vencimento)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>
                          {STATUS_PARCELA_LABELS[p.status]} — {moeda} {fmtMoney(p.valor_moeda_estrangeira)}
                        </div>
                      </div>
                      {selected && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #64748b)' }}>{moeda}</span>
                          <input
                            type="number"
                            value={editedVal ?? String(p.valor_moeda_estrangeira)}
                            onChange={(e) => handleValorEdit(p.id, e.target.value, p.valor_moeda_estrangeira)}
                            step={0.01}
                            min={0}
                            max={p.valor_moeda_estrangeira}
                            disabled={disabled}
                            style={{
                              width: 100, padding: '0.3rem 0.5rem', borderRadius: 6,
                              border: '1px solid var(--bg-elevated, #475569)',
                              background: 'var(--bg-surface, #334155)',
                              color: 'var(--text-primary, #f1f5f9)',
                              fontFamily: "'DM Mono', monospace", fontSize: '0.8125rem',
                              textAlign: 'right', outline: 'none',
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {selectedParcelas.size > 0 && (
              <div style={{
                padding: '0.75rem', borderRadius: 8,
                background: 'var(--bg-base, #1e293b)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '1rem',
              }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)' }}>
                  {t('bidcambio.modal_pagamento.parcelas_selecionadas', { count: selectedParcelas.size })}
                </span>
                <span style={{ fontSize: '1rem', fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>
                  {moeda} {fmtMoney(totalSelecionado)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Dados do Pagamento */}
        {step === 2 && (
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, margin: '0 0 0.75rem' }}>
              {t('bidcambio.modal_pagamento.dados_contrato')}
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>{t('bidcambio.modal_pagamento.contrato')}</label>
                <input
                  type="text"
                  value={contratoCambio}
                  onChange={(e) => setContratoCambio(e.target.value)}
                  placeholder="Numero do contrato"
                  style={inputStyle}
                  disabled={disabled}
                />
              </div>
              <div>
                <label style={labelStyle}>{t('bidcambio.modal_pagamento.banco_corretora')}</label>
                <input
                  type="text"
                  value={bancoCorretora}
                  onChange={(e) => setBancoCorretora(e.target.value)}
                  placeholder="Nome do banco ou corretora"
                  style={inputStyle}
                  disabled={disabled}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>{t('bidcambio.modal_pagamento.taxa_fechamento')}</label>
                <input
                  type="number"
                  value={taxaFechamento}
                  onChange={(e) => setTaxaFechamento(e.target.value)}
                  placeholder="0.0000"
                  step={0.0001}
                  min={0}
                  style={{ ...inputStyle, fontFamily: "'DM Mono', monospace" }}
                  disabled={disabled}
                />
              </div>
              <div>
                <label style={labelStyle}>{t('bidcambio.modal_pagamento.valor_brl')}</label>
                <input
                  type="number"
                  value={valorBrl}
                  onChange={(e) => setValorBrl(e.target.value)}
                  placeholder="0.00"
                  step={0.01}
                  min={0}
                  style={{ ...inputStyle, fontFamily: "'DM Mono', monospace" }}
                  disabled={disabled}
                />
              </div>
            </div>

            {/* Summary */}
            <div style={{
              padding: '0.75rem', borderRadius: 8,
              background: 'var(--bg-base, #1e293b)',
              marginBottom: '1rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #64748b)' }}>{t('bidcambio.modal_pagamento.valor_me')}</span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>{moeda} {fmtMoney(totalSelecionado)}</span>
              </div>
              {Number(taxaFechamento) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #64748b)' }}>{t('bidcambio.detalhe_cotacao.taxa')}</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>{fmtRate(Number(taxaFechamento))}</span>
                </div>
              )}
              {Number(valorBrl) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #64748b)' }}>{t('bidcambio.modal_pagamento.valor_brl_label')}</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, color: 'var(--accent, #6366f1)' }}>R$ {fmtMoney(Number(valorBrl))}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Upload */}
        {step === 3 && (
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, margin: '0 0 0.75rem' }}>
              {t('bidcambio.modal_pagamento.comprovante')}
            </h4>

            <div
              style={{
                border: '2px dashed var(--bg-elevated, #475569)',
                borderRadius: 12, padding: '2rem', textAlign: 'center',
                marginBottom: '1rem', cursor: 'pointer',
                background: comprovanteFile ? 'rgba(99,102,241,0.05)' : undefined,
              }}
              onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = '.pdf,.jpg,.jpeg,.png'
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0]
                  if (file) {
                    setComprovanteFile(file)
                    setComprovanteNome(file.name)
                  }
                }
                input.click()
              }}
            >
              {comprovanteFile ? (
                <>
                  <FileText size={28} weight="duotone" style={{ color: 'var(--accent, #6366f1)', marginBottom: '0.5rem' }} />
                  <p style={{ fontWeight: 600, margin: '0 0 0.25rem', fontSize: '0.875rem' }}>{comprovanteFile.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', margin: 0 }}>
                    {(comprovanteFile.size / 1024).toFixed(0)} KB — {t('bidcambio.modal_pagamento.clique_trocar')}
                  </p>
                </>
              ) : (
                <>
                  <UploadSimple size={28} weight="duotone" style={{ color: 'var(--text-muted, #64748b)', marginBottom: '0.5rem' }} />
                  <p style={{ fontWeight: 600, margin: '0 0 0.25rem', fontSize: '0.875rem' }}>
                    {t('bidcambio.modal_pagamento.clique_enviar')}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', margin: 0 }}>
                    {t('bidcambio.modal_pagamento.formatos')}
                  </p>
                </>
              )}
            </div>

            {comprovanteFile && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>{t('bidcambio.modal_pagamento.nome_arquivo')}</label>
                <input
                  type="text"
                  value={comprovanteNome}
                  onChange={(e) => setComprovanteNome(e.target.value)}
                  placeholder={comprovanteFile.name}
                  style={inputStyle}
                  disabled={disabled}
                />
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--bg-elevated, #475569)' }}>
          <div>
            {step > 1 && (
              <button
                onClick={() => setStep(s => s - 1)}
                style={btnSecondary}
                disabled={disabled || saving}
              >
                <CaretLeft size={14} weight="bold" /> {t('acoes.voltar')}
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={onClose} style={btnSecondary} disabled={saving}>
              {t('acoes.cancelar')}
            </button>
            {step < 3 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={disabled || (step === 1 && !canGoStep2) || (step === 2 && !canGoStep3)}
                style={{
                  ...btnPrimary,
                  opacity: (step === 1 && !canGoStep2) || (step === 2 && !canGoStep3) ? 0.5 : 1,
                  cursor: (step === 1 && !canGoStep2) || (step === 2 && !canGoStep3) ? 'not-allowed' : 'pointer',
                }}
              >
                {t('acoes.proximo')} <CaretRight size={14} weight="bold" />
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={disabled || saving}
                style={{
                  ...btnPrimary,
                  background: 'var(--success, #22c55e)',
                  opacity: (disabled || saving) ? 0.5 : 1,
                  cursor: (disabled || saving) ? 'not-allowed' : 'pointer',
                }}
              >
                {saving ? <CircleNotch size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle size={14} />}
                {saving ? t('comum.salvando') : t('bidcambio.modal_pagamento.salvar')}
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
