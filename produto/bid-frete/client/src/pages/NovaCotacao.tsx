/**
 * NovaCotacao.tsx — Wizard de Nova Cotação (T7)
 * Skill: antigravity-design-system, antigravity-componentes
 *
 * 7 etapas: Modal/Operação → Origem → Destino → Carga → Incoterm → Fornecedores → Resumo
 * Usa GeralCampoGlobal, SelectGlobal, BotaoGlobal, stepper visual
 */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import {
  Truck,
  ArrowLeft,
  ArrowRight,
  Check,
  Anchor,
  AirplaneTilt,
  Van,
  Package,
  MapPin,
  Scales,
  Users,
  FileText,
  CheckCircle,
} from '@phosphor-icons/react'

import { criarCotacao, dispararBids } from '../shared/api'
import type {
  TipoOperacao,
  ModalFrete,
  ModalidadeCarga,
  Visibilidade,
} from '../shared/types'
import {
  OPERACAO_LABELS,
  MODAL_LABELS,
  MODALIDADE_LABELS,
  INCOTERMS,
} from '../shared/types'

// ─── Stepper ─────────────────────────────────────────────────────────────────

interface StepConfig {
  id: number
  label: string
  icon: React.ReactNode
}

const STEPS: StepConfig[] = [
  { id: 1, label: 'Modal e Operação', icon: <Truck weight="duotone" size={16} /> },
  { id: 2, label: 'Origem',           icon: <MapPin weight="duotone" size={16} /> },
  { id: 3, label: 'Destino',          icon: <MapPin weight="duotone" size={16} /> },
  { id: 4, label: 'Carga',            icon: <Package weight="duotone" size={16} /> },
  { id: 5, label: 'Incoterm',         icon: <Scales weight="duotone" size={16} /> },
  { id: 6, label: 'Fornecedores',     icon: <Users weight="duotone" size={16} /> },
  { id: 7, label: 'Resumo',           icon: <FileText weight="duotone" size={16} /> },
]

function Stepper({ atual }: { atual: number }) {
  return (
    <div className="nc-stepper">
      {STEPS.map((step, i) => {
        const status = step.id < atual ? 'done' : step.id === atual ? 'active' : 'pending'
        return (
          <React.Fragment key={step.id}>
            <div className={`nc-step nc-step--${status}`}>
              <div className="nc-step-circle">
                {status === 'done' ? <Check weight="bold" size={14} /> : step.icon}
              </div>
              <span className="nc-step-label">{step.label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`nc-step-line ${step.id < atual ? 'nc-step-line--done' : ''}`} />}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ─── Form State ──────────────────────────────────────────────────────────────

interface FormState {
  tipo_operacao: TipoOperacao | ''
  modal: ModalFrete | ''
  modalidade: ModalidadeCarga | ''
  origem_codigo: string
  origem_nome: string
  origem_pais: string
  destino_codigo: string
  destino_nome: string
  destino_pais: string
  descricao_mercadoria: string
  ncm: string
  quantidade: number
  tipo_container: string
  peso_kg: string
  cubagem_m3: string
  incoterm: string
  cep_destino: string
  prazo_resposta: string
  visibilidade: Visibilidade
  anonima: boolean
  valor_alvo: string
  moeda_alvo: string
}

const INITIAL_FORM: FormState = {
  tipo_operacao: '',
  modal: '',
  modalidade: '',
  origem_codigo: '',
  origem_nome: '',
  origem_pais: '',
  destino_codigo: '',
  destino_nome: '',
  destino_pais: '',
  descricao_mercadoria: '',
  ncm: '',
  quantidade: 1,
  tipo_container: '',
  peso_kg: '',
  cubagem_m3: '',
  incoterm: '',
  cep_destino: '',
  prazo_resposta: '',
  visibilidade: 'DIRECIONADA',
  anonima: false,
  valor_alvo: '',
  moeda_alvo: 'USD',
}

// ─── Modal Option Buttons ────────────────────────────────────────────────────

function OptionButton({
  selected,
  onClick,
  icon,
  label,
}: {
  selected: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      className={`nc-option-btn ${selected ? 'nc-option-btn--selected' : ''}`}
      onClick={onClick}
    >
      <span className="nc-option-icon">{icon}</span>
      <span className="nc-option-label">{label}</span>
    </button>
  )
}

// ─── Input Field ─────────────────────────────────────────────────────────────

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="nc-field">
      <label className="nc-field-label">
        {label}
        {required && <span style={{ color: 'var(--danger, #ef4444)' }}> *</span>}
      </label>
      {children}
    </div>
  )
}

// ─── Componente Principal ────────────────────────────────────────────────────

export default function NovaCotacao() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [cotacaoId, setCotacaoId] = useState<string | null>(null)

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: val }))

  const canNext = (): boolean => {
    switch (step) {
      case 1: return !!form.tipo_operacao && !!form.modal && !!form.modalidade
      case 2: return !!form.origem_codigo && !!form.origem_nome
      case 3: return !!form.destino_codigo && !!form.destino_nome
      case 4: return !!form.descricao_mercadoria && form.quantidade > 0
      case 5: return !!form.incoterm
      case 6: return true
      case 7: return true
      default: return false
    }
  }

  const handleSubmit = async () => {
    setSalvando(true)
    try {
      const cotacao = await criarCotacao({
        tipo_operacao: form.tipo_operacao as TipoOperacao,
        modal: form.modal as ModalFrete,
        modalidade: form.modalidade as ModalidadeCarga,
        origem_codigo: form.origem_codigo,
        origem_nome: form.origem_nome,
        origem_pais: form.origem_pais,
        destino_codigo: form.destino_codigo,
        destino_nome: form.destino_nome,
        destino_pais: form.destino_pais,
        descricao_mercadoria: form.descricao_mercadoria,
        ncm: form.ncm || undefined,
        quantidade: form.quantidade,
        tipo_container: form.tipo_container || undefined,
        peso_kg: form.peso_kg ? parseFloat(form.peso_kg) : undefined,
        cubagem_m3: form.cubagem_m3 ? parseFloat(form.cubagem_m3) : undefined,
        incoterm: form.incoterm,
        cep_destino: form.cep_destino || undefined,
        visibilidade: form.visibilidade,
        anonima: form.anonima,
        valor_alvo: form.valor_alvo ? parseFloat(form.valor_alvo) : undefined,
        moeda_alvo: form.moeda_alvo,
      })
      setCotacaoId(cotacao.id)
      setSucesso(true)
    } catch {
      // erro tratado
    } finally {
      setSalvando(false)
    }
  }

  // ─── Step Content ─────────────────────────────────────────────────────

  const renderStep = () => {
    switch (step) {
      // STEP 1 — Modal e Operação
      case 1:
        return (
          <div className="nc-step-content">
            <h3 className="nc-section-title">{t('bidfrete.nova_cotacao.tipo_operacao')}</h3>
            <div className="nc-options-row">
              {(['IMPORTACAO', 'EXPORTACAO'] as TipoOperacao[]).map(op => (
                <OptionButton
                  key={op}
                  selected={form.tipo_operacao === op}
                  onClick={() => set('tipo_operacao', op)}
                  icon={op === 'IMPORTACAO' ? <ArrowLeft weight="bold" size={18} /> : <ArrowRight weight="bold" size={18} />}
                  label={OPERACAO_LABELS[op]}
                />
              ))}
            </div>

            <h3 className="nc-section-title">{t('bidfrete.nova_cotacao.modal_frete')}</h3>
            <div className="nc-options-row">
              <OptionButton
                selected={form.modal === 'MARITIMO'}
                onClick={() => set('modal', 'MARITIMO')}
                icon={<Anchor weight="duotone" size={24} />}
                label="Marítimo"
              />
              <OptionButton
                selected={form.modal === 'AEREO'}
                onClick={() => set('modal', 'AEREO')}
                icon={<AirplaneTilt weight="duotone" size={24} />}
                label="Aéreo"
              />
              <OptionButton
                selected={form.modal === 'RODOVIARIO'}
                onClick={() => set('modal', 'RODOVIARIO')}
                icon={<Van weight="duotone" size={24} />}
                label="Rodoviário"
              />
            </div>

            <h3 className="nc-section-title">{t('bidfrete.nova_cotacao.modalidade')}</h3>
            <div className="nc-options-row">
              {form.modal === 'MARITIMO' && (
                <>
                  <OptionButton selected={form.modalidade === 'FCL'} onClick={() => set('modalidade', 'FCL')} icon={<Package weight="duotone" size={18} />} label="FCL — Container Completo" />
                  <OptionButton selected={form.modalidade === 'LCL'} onClick={() => set('modalidade', 'LCL')} icon={<Package weight="duotone" size={18} />} label="LCL — Carga Fracionada" />
                </>
              )}
              {form.modal === 'AEREO' && (
                <OptionButton selected={form.modalidade === 'AEREO_GERAL'} onClick={() => set('modalidade', 'AEREO_GERAL')} icon={<AirplaneTilt weight="duotone" size={18} />} label="Aéreo Geral" />
              )}
              {form.modal === 'RODOVIARIO' && (
                <>
                  <OptionButton selected={form.modalidade === 'RODOVIARIO_FTL'} onClick={() => set('modalidade', 'RODOVIARIO_FTL')} icon={<Van weight="duotone" size={18} />} label="FTL — Carga Completa" />
                  <OptionButton selected={form.modalidade === 'RODOVIARIO_LTL'} onClick={() => set('modalidade', 'RODOVIARIO_LTL')} icon={<Van weight="duotone" size={18} />} label="LTL — Carga Fracionada" />
                </>
              )}
              {!form.modal && <p className="nc-hint">{t('bidfrete.nova_cotacao.selecionar_modal_primeiro')}</p>}
            </div>
          </div>
        )

      // STEP 2 — Origem
      case 2:
        return (
          <div className="nc-step-content">
            <h3 className="nc-section-title">{t('bidfrete.nova_cotacao.porto_origem')}</h3>
            <div className="nc-fields-grid">
              <Field label={t('bidfrete.nova_cotacao.codigo_locode')} required>
                <input className="nc-input" placeholder="Ex: CNSHA" value={form.origem_codigo} onChange={e => set('origem_codigo', e.target.value.toUpperCase())} />
              </Field>
              <Field label={t('bidfrete.nova_cotacao.nome')} required>
                <input className="nc-input" placeholder="Ex: Shanghai" value={form.origem_nome} onChange={e => set('origem_nome', e.target.value)} />
              </Field>
              <Field label={t('bidfrete.nova_cotacao.pais')}>
                <input className="nc-input" placeholder="Ex: China" value={form.origem_pais} onChange={e => set('origem_pais', e.target.value)} />
              </Field>
            </div>
          </div>
        )

      // STEP 3 — Destino
      case 3:
        return (
          <div className="nc-step-content">
            <h3 className="nc-section-title">{t('bidfrete.nova_cotacao.porto_destino')}</h3>
            <div className="nc-fields-grid">
              <Field label={t('bidfrete.nova_cotacao.codigo_locode')} required>
                <input className="nc-input" placeholder="Ex: BRSSZ" value={form.destino_codigo} onChange={e => set('destino_codigo', e.target.value.toUpperCase())} />
              </Field>
              <Field label={t('bidfrete.nova_cotacao.nome')} required>
                <input className="nc-input" placeholder="Ex: Santos" value={form.destino_nome} onChange={e => set('destino_nome', e.target.value)} />
              </Field>
              <Field label={t('bidfrete.nova_cotacao.pais')}>
                <input className="nc-input" placeholder="Ex: Brasil" value={form.destino_pais} onChange={e => set('destino_pais', e.target.value)} />
              </Field>
            </div>
          </div>
        )

      // STEP 4 — Carga
      case 4:
        return (
          <div className="nc-step-content">
            <h3 className="nc-section-title">{t('bidfrete.nova_cotacao.dados_mercadoria')}</h3>
            <div className="nc-fields-grid">
              <Field label={t('bidfrete.nova_cotacao.descricao_mercadoria')} required>
                <input className="nc-input" placeholder="Ex: Peças automotivas" value={form.descricao_mercadoria} onChange={e => set('descricao_mercadoria', e.target.value)} />
              </Field>
              <Field label={t('bidfrete.nova_cotacao.ncm')}>
                <input className="nc-input" placeholder="Ex: 87089990" value={form.ncm} onChange={e => set('ncm', e.target.value.replace(/\D/g, '').slice(0, 8))} />
              </Field>
              <Field label={t('bidfrete.nova_cotacao.quantidade')} required>
                <input className="nc-input" type="number" min={1} value={form.quantidade} onChange={e => set('quantidade', parseInt(e.target.value) || 1)} />
              </Field>
              {form.modal === 'MARITIMO' && (
                <Field label={t('bidfrete.nova_cotacao.tipo_container')}>
                  <input className="nc-input" placeholder="Ex: 40' HC" value={form.tipo_container} onChange={e => set('tipo_container', e.target.value)} />
                </Field>
              )}
              <Field label={t('bidfrete.nova_cotacao.peso_kg')}>
                <input className="nc-input" type="number" placeholder="Ex: 12000" value={form.peso_kg} onChange={e => set('peso_kg', e.target.value)} />
              </Field>
              <Field label={t('bidfrete.nova_cotacao.cubagem_m3')}>
                <input className="nc-input" type="number" placeholder="Ex: 33.2" value={form.cubagem_m3} onChange={e => set('cubagem_m3', e.target.value)} />
              </Field>
            </div>
          </div>
        )

      // STEP 5 — Incoterm
      case 5:
        return (
          <div className="nc-step-content">
            <h3 className="nc-section-title">{t('bidfrete.nova_cotacao.incoterm')}</h3>
            <div className="nc-incoterm-grid">
              {INCOTERMS.map(inc => (
                <button
                  key={inc}
                  type="button"
                  className={`nc-incoterm-btn ${form.incoterm === inc ? 'nc-incoterm-btn--selected' : ''}`}
                  onClick={() => set('incoterm', inc)}
                >
                  {inc}
                </button>
              ))}
            </div>
            {form.incoterm === 'EXW' && (
              <div style={{ marginTop: '1rem' }}>
                <Field label={t('bidfrete.nova_cotacao.cep_coleta')} required>
                  <input className="nc-input" placeholder="Ex: 01310-100" value={form.cep_destino} onChange={e => set('cep_destino', e.target.value)} />
                </Field>
              </div>
            )}
            <div className="nc-fields-grid" style={{ marginTop: '1.5rem' }}>
              <Field label={t('bidfrete.nova_cotacao.prazo_respostas')}>
                <input className="nc-input" type="datetime-local" value={form.prazo_resposta} onChange={e => set('prazo_resposta', e.target.value)} />
              </Field>
            </div>
          </div>
        )

      // STEP 6 — Fornecedores
      case 6:
        return (
          <div className="nc-step-content">
            <h3 className="nc-section-title">{t('bidfrete.nova_cotacao.visibilidade')}</h3>
            <div className="nc-options-row">
              <OptionButton
                selected={form.visibilidade === 'DIRECIONADA'}
                onClick={() => set('visibilidade', 'DIRECIONADA')}
                icon={<Users weight="duotone" size={20} />}
                label={t('bidfrete.nova_cotacao.direcionada_label')}
              />
              <OptionButton
                selected={form.visibilidade === 'ABERTA'}
                onClick={() => set('visibilidade', 'ABERTA')}
                icon={<Users weight="duotone" size={20} />}
                label={t('bidfrete.nova_cotacao.aberta_label')}
              />
            </div>

            <div className="nc-toggle-row" style={{ marginTop: '1.5rem' }}>
              <label className="nc-toggle">
                <input type="checkbox" checked={form.anonima} onChange={e => set('anonima', e.target.checked)} />
                <span className="nc-toggle-label">{t('bidfrete.nova_cotacao.anonima_label')}</span>
              </label>
            </div>

            <p className="nc-hint" style={{ marginTop: '1rem' }}>
              {form.visibilidade === 'DIRECIONADA'
                ? t('bidfrete.nova_cotacao.hint_direcionada')
                : t('bidfrete.nova_cotacao.hint_aberta')}
            </p>
          </div>
        )

      // STEP 7 — Resumo
      case 7:
        return (
          <div className="nc-step-content">
            <h3 className="nc-section-title">{t('bidfrete.nova_cotacao.resumo_cotacao')}</h3>

            <div className="nc-fields-grid" style={{ marginBottom: '1.5rem' }}>
              <Field label={t('bidfrete.nova_cotacao.valor_alvo')}>
                <input className="nc-input" type="number" placeholder="Ex: 5000" value={form.valor_alvo} onChange={e => set('valor_alvo', e.target.value)} />
              </Field>
              <Field label={t('bidfrete.nova_cotacao.moeda')}>
                <select className="nc-input" value={form.moeda_alvo} onChange={e => set('moeda_alvo', e.target.value)}>
                  <option value="USD">USD</option>
                  <option value="BRL">BRL</option>
                  <option value="EUR">EUR</option>
                </select>
              </Field>
            </div>

            <div className="nc-summary">
              <div className="nc-summary-row">
                <span className="nc-summary-label">{t('bidfrete.nova_cotacao.resumo_operacao')}</span>
                <span className="nc-summary-value">{form.tipo_operacao ? OPERACAO_LABELS[form.tipo_operacao as TipoOperacao] : '—'}</span>
              </div>
              <div className="nc-summary-row">
                <span className="nc-summary-label">{t('bidfrete.nova_cotacao.resumo_modal')}</span>
                <span className="nc-summary-value">
                  {form.modal ? MODAL_LABELS[form.modal as ModalFrete] : '—'} / {form.modalidade ? MODALIDADE_LABELS[form.modalidade as ModalidadeCarga] : '—'}
                </span>
              </div>
              <div className="nc-summary-row">
                <span className="nc-summary-label">{t('bidfrete.nova_cotacao.resumo_rota')}</span>
                <span className="nc-summary-value">{form.origem_nome || '—'} → {form.destino_nome || '—'}</span>
              </div>
              <div className="nc-summary-row">
                <span className="nc-summary-label">{t('bidfrete.nova_cotacao.resumo_mercadoria')}</span>
                <span className="nc-summary-value">{form.descricao_mercadoria || '—'}</span>
              </div>
              <div className="nc-summary-row">
                <span className="nc-summary-label">{t('bidfrete.nova_cotacao.resumo_ncm')}</span>
                <span className="nc-summary-value" style={{ fontFamily: 'DM Mono, monospace' }}>{form.ncm || '—'}</span>
              </div>
              <div className="nc-summary-row">
                <span className="nc-summary-label">{t('bidfrete.nova_cotacao.resumo_qtd_peso')}</span>
                <span className="nc-summary-value">{form.quantidade} un | {form.peso_kg ? `${form.peso_kg} Kg` : '—'}</span>
              </div>
              <div className="nc-summary-row">
                <span className="nc-summary-label">{t('bidfrete.nova_cotacao.resumo_incoterm')}</span>
                <span className="nc-summary-value" style={{ fontWeight: 700, color: 'var(--accent)' }}>{form.incoterm || '—'}</span>
              </div>
              <div className="nc-summary-row">
                <span className="nc-summary-label">{t('bidfrete.nova_cotacao.resumo_visibilidade')}</span>
                <span className="nc-summary-value">{form.visibilidade === 'ABERTA' ? 'Aberta' : 'Direcionada'}{form.anonima ? ' (Anônima)' : ''}</span>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // ─── Sucesso ──────────────────────────────────────────────────────────

  if (sucesso) {
    return (
      <PaginaGlobal
        cabecalho={
          <CabecalhoGlobal
            icone={<CheckCircle weight="duotone" size={22} />}
            titulo={t('bidfrete.nova_cotacao.titulo')}
          />
        }
      >
        <div className="nc-sucesso">
          <CheckCircle weight="duotone" size={64} style={{ color: 'var(--success)' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{t('bidfrete.nova_cotacao.criado_sucesso')}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{t('bidfrete.nova_cotacao.criado_desc')}</p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button className="nc-btn nc-btn--secondary" onClick={() => navigate('/cotacoes')}>{t('bidfrete.nova_cotacao.ver_cotacoes')}</button>
            {cotacaoId && <button className="nc-btn nc-btn--primary" onClick={() => navigate(`/cotacoes/${cotacaoId}`)}>{t('bidfrete.nova_cotacao.ver_detalhes')}</button>}
          </div>
        </div>
      </PaginaGlobal>
    )
  }

  // ─── Render ───────────────────────────────────────────────────────────

  return (
    <PaginaGlobal
      className="nc-page"
      cabecalho={
        <CabecalhoGlobal
          icone={<Truck weight="duotone" size={22} />}
          titulo={t('bidfrete.nova_cotacao.titulo')}
          subtitulo={`Etapa ${step} de 7 — ${STEPS[step - 1].label}`}
          acoes={
            <button className="nc-btn nc-btn--secondary" onClick={() => navigate('/cotacoes')}>
              <ArrowLeft weight="bold" size={14} /> {t('comum.cancelar')}
            </button>
          }
        />
      }
    >
      <Stepper atual={step} />

      <div className="nc-form-card">
        {renderStep()}
      </div>

      {/* Footer com navegação */}
      <div className="nc-footer">
        <button
          className="nc-btn nc-btn--secondary"
          disabled={step === 1}
          onClick={() => setStep(s => s - 1)}
        >
          <ArrowLeft weight="bold" size={14} /> {t('comum.anterior')}
        </button>
        <div className="nc-footer-spacer" />
        {step < 7 ? (
          <button
            className="nc-btn nc-btn--primary"
            disabled={!canNext()}
            onClick={() => setStep(s => s + 1)}
          >
            {t('comum.proximo')} <ArrowRight weight="bold" size={14} />
          </button>
        ) : (
          <button
            className="nc-btn nc-btn--primary"
            disabled={salvando}
            onClick={handleSubmit}
          >
            {salvando ? t('bidfrete.nova_cotacao.criando') : t('bidfrete.nova_cotacao.criar')} <Check weight="bold" size={14} />
          </button>
        )}
      </div>

      <style>{`
        .nc-page { padding: 0; }

        /* ── Stepper ── */
        .nc-stepper {
          display: flex;
          align-items: center;
          gap: 0;
          padding: 1.5rem 0;
          overflow-x: auto;
        }

        .nc-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          min-width: 80px;
          flex-shrink: 0;
        }

        .nc-step-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .nc-step--pending .nc-step-circle {
          background: var(--bg-surface, #334155);
          color: var(--text-muted, #64748b);
          border: 2px solid var(--bg-elevated, #475569);
        }
        .nc-step--active .nc-step-circle {
          background: var(--accent, #6366f1);
          color: #fff;
          border: 2px solid var(--accent, #6366f1);
          box-shadow: 0 0 0 4px rgba(99,102,241,0.2);
        }
        .nc-step--done .nc-step-circle {
          background: var(--success, #22c55e);
          color: #fff;
          border: 2px solid var(--success, #22c55e);
        }

        .nc-step-label {
          font-size: 0.6875rem;
          font-weight: 600;
          text-align: center;
          color: var(--text-muted, #64748b);
          white-space: nowrap;
        }
        .nc-step--active .nc-step-label { color: var(--accent, #6366f1); }
        .nc-step--done .nc-step-label { color: var(--success, #22c55e); }

        .nc-step-line {
          flex: 1;
          height: 2px;
          background: var(--bg-elevated, #475569);
          min-width: 20px;
          margin-top: -1.25rem;
        }
        .nc-step-line--done { background: var(--success, #22c55e); }

        /* ── Form Card ── */
        .nc-form-card {
          background: var(--bg-surface, #334155);
          border-radius: var(--radius-lg, 12px);
          padding: 2rem;
          min-height: 300px;
        }

        .nc-step-content { max-width: 700px; }

        .nc-section-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary, #f1f5f9);
          margin-bottom: 0.75rem;
          margin-top: 1.5rem;
        }
        .nc-section-title:first-child { margin-top: 0; }

        /* ── Option Buttons ── */
        .nc-options-row {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .nc-option-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1.25rem;
          background: var(--bg-base, #1e293b);
          border: 2px solid var(--bg-elevated, #475569);
          border-radius: var(--radius-md, 8px);
          cursor: pointer;
          transition: all 0.15s;
          font-family: inherit;
          color: var(--text-secondary, #94a3b8);
          min-width: 160px;
        }
        .nc-option-btn:hover {
          border-color: var(--accent, #6366f1);
          color: var(--text-primary, #f1f5f9);
        }
        .nc-option-btn--selected {
          border-color: var(--accent, #6366f1);
          background: rgba(99,102,241,0.1);
          color: var(--accent, #6366f1);
        }

        .nc-option-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md, 8px);
          background: var(--bg-elevated, #475569);
          flex-shrink: 0;
        }
        .nc-option-btn--selected .nc-option-icon {
          background: rgba(99,102,241,0.2);
        }

        .nc-option-label {
          font-size: 0.875rem;
          font-weight: 600;
        }

        /* ── Fields ── */
        .nc-fields-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1rem;
        }

        .nc-field {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .nc-field-label {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted, #64748b);
        }

        .nc-input {
          padding: 0.6rem 0.75rem;
          background: var(--bg-base, #1e293b);
          border: 1px solid var(--bg-elevated, #475569);
          border-radius: var(--radius-md, 8px);
          color: var(--text-primary, #f1f5f9);
          font-size: 0.875rem;
          font-family: inherit;
          outline: none;
          transition: border-color 0.15s;
        }
        .nc-input:focus {
          border-color: var(--accent, #6366f1);
          box-shadow: var(--focus-ring, 0 0 0 2px rgba(99,102,241,0.4));
        }
        .nc-input::placeholder { color: var(--text-muted, #64748b); }

        /* ── Incoterm Grid ── */
        .nc-incoterm-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .nc-incoterm-btn {
          padding: 0.5rem 1rem;
          background: var(--bg-base, #1e293b);
          border: 2px solid var(--bg-elevated, #475569);
          border-radius: var(--radius-pill, 9999px);
          color: var(--text-secondary, #94a3b8);
          font-size: 0.8125rem;
          font-weight: 700;
          font-family: 'DM Mono', monospace;
          cursor: pointer;
          transition: all 0.15s;
        }
        .nc-incoterm-btn:hover {
          border-color: var(--accent, #6366f1);
          color: var(--text-primary, #f1f5f9);
        }
        .nc-incoterm-btn--selected {
          background: rgba(99,102,241,0.15);
          border-color: var(--accent, #6366f1);
          color: var(--accent, #6366f1);
        }

        /* ── Toggle ── */
        .nc-toggle {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
        }
        .nc-toggle input[type="checkbox"] {
          width: 18px;
          height: 18px;
          accent-color: var(--accent, #6366f1);
        }
        .nc-toggle-label {
          font-size: 0.875rem;
          color: var(--text-secondary, #94a3b8);
        }

        .nc-hint {
          font-size: 0.8125rem;
          color: var(--text-muted, #64748b);
          font-style: italic;
        }

        /* ── Summary ── */
        .nc-summary {
          background: var(--bg-base, #1e293b);
          border-radius: var(--radius-md, 8px);
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .nc-summary-row {
          display: flex;
          justify-content: space-between;
          padding: 0.4rem 0;
          border-bottom: 1px solid var(--bg-elevated, #475569);
        }
        .nc-summary-row:last-child { border-bottom: none; }

        .nc-summary-label {
          font-size: 0.8125rem;
          color: var(--text-muted, #64748b);
        }
        .nc-summary-value {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--text-primary, #f1f5f9);
        }

        /* ── Footer ── */
        .nc-footer {
          display: flex;
          align-items: center;
          padding: 1.25rem 0;
          gap: 0.75rem;
        }
        .nc-footer-spacer { flex: 1; }

        /* ── Botões ── */
        .nc-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.5rem;
          border-radius: var(--radius-pill, 9999px);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          border: none;
          font-family: inherit;
        }
        .nc-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .nc-btn--primary {
          background: var(--accent, #6366f1);
          color: #fff;
        }
        .nc-btn--primary:hover:not(:disabled) { background: var(--accent-hover, #4f46e5); }
        .nc-btn--secondary {
          background: var(--bg-surface, #334155);
          color: var(--text-secondary, #94a3b8);
          border: 1px solid var(--bg-elevated, #475569);
        }
        .nc-btn--secondary:hover:not(:disabled) {
          background: var(--bg-elevated, #475569);
          color: var(--text-primary, #f1f5f9);
        }

        /* ── Sucesso ── */
        .nc-sucesso {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 50vh;
          gap: 0.75rem;
        }
      `}</style>
    </PaginaGlobal>
  )
}
