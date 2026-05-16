/**
 * LpcoNovo — Wizard de criacao de LPCO (4 steps)
 * Step 0: Escolha de canal de entrada
 * Step 1: Dados gerais (orgao, modelo, pais, fundamento legal)
 * Step 2: Itens NCM (quantidades, valores)
 * Step 3: Revisao + registrar
 */

import { useState, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { BotaoGlobal } from '@nucleo/botao-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { StepperPassoPassoGlobal } from '@nucleo/modal-passo-passo-global'
import type { PassoConfig } from '@nucleo/modal-passo-passo-global'
import {
  ArrowLeft,
  ArrowRight,
  PencilLine,
  FileArrowUp,
  ShoppingCart,
  Scan,
  Copy,
  CloudArrowUp,
  CheckCircle,
  Plus,
  Trash,
  PaperPlaneTilt,
} from '@phosphor-icons/react'
import { lpcoApi } from '../../shared/api'
import type { CanalEntrada, TipoOperacao, TipoLpco, LpcoItem } from '../../shared/types'
import { ORGAOS_ANUENTES, CANAL_ENTRADA_LABELS } from '../../shared/types'

// ── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  canal_entrada: CanalEntrada
  tipo_operacao: TipoOperacao
  tipo_lpco: TipoLpco
  orgao_anuente: string
  modelo_lpco: string
  pais_procedencia: string
  fundamento_legal: string
  itens: ItemForm[]
}

interface ItemForm {
  ncm: string
  descricao_produto: string
  fabricante: string
  quantidade_estatistica: string
  unidade_medida: string
  peso_liquido: string
  vmle: string
  moeda: string
}

const EMPTY_ITEM: ItemForm = {
  ncm: '', descricao_produto: '', fabricante: '',
  quantidade_estatistica: '', unidade_medida: 'UN',
  peso_liquido: '', vmle: '', moeda: 'USD',
}

// ── Estilos ──────────────────────────────────────────────────────────────────

const fieldStyle: React.CSSProperties = {
  width: '100%', padding: '0.625rem 0.75rem', fontSize: '0.875rem',
  background: 'var(--ws-bg-body, #0f172a)', border: '1px solid rgba(99,102,241,0.18)',
  borderRadius: '6px', color: 'var(--ws-text, #f1f5f9)', outline: 'none',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.6875rem', fontWeight: 600,
  color: 'var(--ws-muted, #94a3b8)', marginBottom: '0.25rem',
  textTransform: 'uppercase', letterSpacing: '0.04em',
}

const cardStyle: React.CSSProperties = {
  background: 'var(--ws-surface, #1e293b)', borderRadius: '10px',
  border: '1px solid rgba(99,102,241,0.15)', padding: '1rem',
}

// ── Componente ──────────────────────────────────────────────────────────────

export default function LpcoNovo() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { step: stepParam } = useParams<{ step?: string }>()
  const [step, setStep] = useState(Number(stepParam) || 0)
  const [submitting, setSubmitting] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const [form, setForm] = useState<FormData>({
    canal_entrada: 'MANUAL',
    tipo_operacao: 'IMPORTACAO',
    tipo_lpco: 'POR_OPERACAO',
    orgao_anuente: '',
    modelo_lpco: '',
    pais_procedencia: '',
    fundamento_legal: '',
    itens: [{ ...EMPTY_ITEM }],
  })

  const updateField = useCallback(<K extends keyof FormData>(key: K, val: FormData[K]) => {
    setForm(prev => ({ ...prev, [key]: val }))
    setErro(null)
  }, [])

  const updateItem = useCallback((index: number, field: keyof ItemForm, val: string) => {
    setForm(prev => {
      const itens = [...prev.itens]
      itens[index] = { ...itens[index], [field]: val }
      return { ...prev, itens }
    })
  }, [])

  const addItem = useCallback(() => {
    setForm(prev => ({ ...prev, itens: [...prev.itens, { ...EMPTY_ITEM }] }))
  }, [])

  const removeItem = useCallback((index: number) => {
    setForm(prev => ({ ...prev, itens: prev.itens.filter((_, i) => i !== index) }))
  }, [])

  const canNext = useCallback((): boolean => {
    if (step === 0) return true
    if (step === 1) return !!(form.orgao_anuente && form.modelo_lpco && form.pais_procedencia && form.fundamento_legal)
    if (step === 2) return form.itens.length > 0 && form.itens.every(i => i.ncm.length === 8 && i.descricao_produto && Number(i.quantidade_estatistica) > 0)
    return true
  }, [step, form])

  const handleSubmit = useCallback(async () => {
    setSubmitting(true)
    setErro(null)
    try {
      const lpco = await lpcoApi.criar({
        tipo_operacao: form.tipo_operacao,
        tipo_lpco: form.tipo_lpco,
        orgao_anuente: form.orgao_anuente,
        modelo_lpco: form.modelo_lpco,
        pais_procedencia: form.pais_procedencia,
        fundamento_legal: form.fundamento_legal,
        canal_entrada: form.canal_entrada,
      } as Partial<import('../../shared/types').Lpco>)
      navigate(`/lpco/${lpco.id}`)
    } catch {
      setErro(t('lpco.erro_criar'))
      navigate('/lpco')
    } finally {
      setSubmitting(false)
    }
  }, [form, navigate])

  const PASSOS_LPCO: PassoConfig[] = useMemo(() => [
    { id: 0, label: t('lpco.steps.canal') },
    { id: 1, label: t('lpco.steps.dados_gerais') },
    { id: 2, label: t('lpco.steps.itens') },
    { id: 3, label: t('lpco.steps.revisao') },
  ], [t])

  // ── Canal de Entrada Icons ─────────────────────────────────────────────────

  const canais: Array<{ id: CanalEntrada; icon: React.ReactNode; desc: string }> = [
    { id: 'MANUAL', icon: <PencilLine weight="duotone" size={28} />, desc: t('lpco.canal.manual_desc') },
    { id: 'PLANILHA', icon: <FileArrowUp weight="duotone" size={28} />, desc: t('lpco.canal.planilha_desc') },
    { id: 'PEDIDO', icon: <ShoppingCart weight="duotone" size={28} />, desc: t('lpco.canal.pedido_desc') },
    { id: 'SMART_READ', icon: <Scan weight="duotone" size={28} />, desc: t('lpco.canal.smart_read_desc') },
    { id: 'DUPLICAR', icon: <Copy weight="duotone" size={28} />, desc: t('lpco.canal.duplicar_desc') },
    { id: 'API', icon: <CloudArrowUp weight="duotone" size={28} />, desc: t('lpco.canal.api_desc') },
  ]

  return (
    <div style={{ padding: '1.5rem', maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => step > 0 ? setStep(step - 1) : navigate('/lpco')}
          type="button"
          style={{ background: 'none', border: 'none', color: 'var(--ws-muted, #94a3b8)', cursor: 'pointer', display: 'flex', padding: '0.25rem' }}
        >
          <ArrowLeft weight="bold" size={20} />
        </button>
        <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--ws-text, #f1f5f9)' }}>
          {t('lpco.novo_titulo')}
        </h1>
      </div>

      {/* Step Indicator — Design System § 12 */}
      <div style={{ marginBottom: '1.5rem' }}>
        <StepperPassoPassoGlobal passos={PASSOS_LPCO} passoAtual={step} />
      </div>

      {/* Step 0: Canal */}
      {step === 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem' }}>
          {canais.map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => updateField('canal_entrada', c.id)}
              style={{
                ...cardStyle,
                cursor: 'pointer',
                borderColor: form.canal_entrada === c.id ? '#6366f1' : 'rgba(99,102,241,0.15)',
                background: form.canal_entrada === c.id ? 'rgba(99,102,241,0.08)' : cardStyle.background,
                textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.5rem',
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              <div style={{ color: form.canal_entrada === c.id ? '#6366f1' : 'var(--ws-muted, #94a3b8)' }}>
                {c.icon}
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ws-text, #f1f5f9)' }}>
                {CANAL_ENTRADA_LABELS[c.id]}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--ws-muted, #94a3b8)' }}>
                {c.desc}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Step 1: Dados Gerais */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={labelStyle}>{t('lpco.dados.tipo_operacao')}</label>
              <select value={form.tipo_operacao} onChange={e => updateField('tipo_operacao', e.target.value as TipoOperacao)} style={fieldStyle}>
                <option value="IMPORTACAO">{t('lpco.importacao')}</option>
                <option value="EXPORTACAO">{t('lpco.exportacao')}</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>{t('lpco.dados.tipo_lpco')}</label>
              <select value={form.tipo_lpco} onChange={e => updateField('tipo_lpco', e.target.value as TipoLpco)} style={fieldStyle}>
                <option value="POR_OPERACAO">Por Operacao</option>
                <option value="FLEX">Flex (Guarda-chuva)</option>
                <option value="TAXA">Taxa</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={labelStyle}>{t('lpco.dados.orgao_anuente_obr')}</label>
              <select value={form.orgao_anuente} onChange={e => updateField('orgao_anuente', e.target.value)} style={fieldStyle}>
                <option value="">Selecionar...</option>
                {ORGAOS_ANUENTES.map(o => (
                  <option key={o.sigla} value={o.sigla}>{o.sigla} — {o.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>{t('lpco.dados.modelo_obr')}</label>
              <input
                value={form.modelo_lpco}
                onChange={e => updateField('modelo_lpco', e.target.value)}
                placeholder="Ex: I00004"
                style={fieldStyle}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
            <div>
              <label style={labelStyle}>{t('lpco.dados.pais_procedencia_obr')}</label>
              <input
                value={form.pais_procedencia}
                onChange={e => updateField('pais_procedencia', e.target.value.toUpperCase().slice(0, 2))}
                placeholder="Ex: CN"
                maxLength={2}
                style={{ ...fieldStyle, textTransform: 'uppercase' }}
              />
            </div>
            <div>
              <label style={labelStyle}>{t('lpco.dados.fundamento_legal_obr')}</label>
              <input
                value={form.fundamento_legal}
                onChange={e => updateField('fundamento_legal', e.target.value)}
                placeholder="Ex: RDC 81/2008"
                style={fieldStyle}
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Itens */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {form.itens.map((item, i) => (
            <div key={i} style={{ ...cardStyle, position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#6366f1' }}>{t('lpco.item.item_numero', { numero: i + 1 })}</span>
                {form.itens.length > 1 && (
                  <button onClick={() => removeItem(i)} type="button" style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', display: 'flex' }}>
                    <Trash weight="bold" size={16} />
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div>
                  <label style={labelStyle}>{t('lpco.item.ncm_label')}</label>
                  <input
                    value={item.ncm}
                    onChange={e => updateItem(i, 'ncm', e.target.value.replace(/\D/g, '').slice(0, 8))}
                    placeholder="8 digitos"
                    maxLength={8}
                    style={{ ...fieldStyle, fontFamily: 'monospace' }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>{t('lpco.item.descricao_label')}</label>
                  <input
                    value={item.descricao_produto}
                    onChange={e => updateItem(i, 'descricao_produto', e.target.value)}
                    placeholder="Nome/descricao do produto"
                    style={fieldStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 100px 80px', gap: '0.5rem' }}>
                <div>
                  <label style={labelStyle}>{t('lpco.item.fabricante')}</label>
                  <input value={item.fabricante} onChange={e => updateItem(i, 'fabricante', e.target.value)} style={fieldStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{t('lpco.item.qtd_label')}</label>
                  <input value={item.quantidade_estatistica} onChange={e => updateItem(i, 'quantidade_estatistica', e.target.value)} type="number" min="0" style={fieldStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{t('lpco.item.peso_liq_label')}</label>
                  <input value={item.peso_liquido} onChange={e => updateItem(i, 'peso_liquido', e.target.value)} type="number" min="0" style={fieldStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{t('lpco.item.vmle_label')}</label>
                  <input value={item.vmle} onChange={e => updateItem(i, 'vmle', e.target.value)} type="number" min="0" style={fieldStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{t('lpco.item.moeda_label')}</label>
                  <select value={item.moeda} onChange={e => updateItem(i, 'moeda', e.target.value)} style={fieldStyle}>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="BRL">BRL</option>
                    <option value="GBP">GBP</option>
                    <option value="CNY">CNY</option>
                  </select>
                </div>
              </div>
            </div>
          ))}

          <button onClick={addItem} type="button" style={{
            ...cardStyle, cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '0.5rem', color: '#6366f1', fontWeight: 600,
            fontSize: '0.875rem', borderStyle: 'dashed',
          }}>
            <Plus weight="bold" size={16} />
            {t('lpco.adicionar_item')}
          </button>
        </div>
      )}

      {/* Step 3: Revisao */}
      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.8125rem', fontWeight: 600, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t('lpco.revisao.resumo')}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1.5rem', fontSize: '0.875rem' }}>
              <div><span style={{ color: 'var(--ws-muted, #94a3b8)' }}>{t('lpco.revisao.canal')}</span> <strong style={{ color: 'var(--ws-text, #f1f5f9)' }}>{CANAL_ENTRADA_LABELS[form.canal_entrada]}</strong></div>
              <div><span style={{ color: 'var(--ws-muted, #94a3b8)' }}>{t('lpco.revisao.tipo_operacao')}</span> <strong style={{ color: 'var(--ws-text, #f1f5f9)' }}>{form.tipo_operacao}</strong></div>
              <div><span style={{ color: 'var(--ws-muted, #94a3b8)' }}>{t('lpco.revisao.tipo')}</span> <strong style={{ color: 'var(--ws-text, #f1f5f9)' }}>{form.tipo_lpco}</strong></div>
              <div><span style={{ color: 'var(--ws-muted, #94a3b8)' }}>{t('lpco.revisao.orgao')}</span> <strong style={{ color: 'var(--ws-text, #f1f5f9)' }}>{form.orgao_anuente || '—'}</strong></div>
              <div><span style={{ color: 'var(--ws-muted, #94a3b8)' }}>{t('lpco.revisao.modelo')}</span> <strong style={{ color: 'var(--ws-text, #f1f5f9)' }}>{form.modelo_lpco || '—'}</strong></div>
              <div><span style={{ color: 'var(--ws-muted, #94a3b8)' }}>{t('lpco.revisao.pais')}</span> <strong style={{ color: 'var(--ws-text, #f1f5f9)' }}>{form.pais_procedencia || '—'}</strong></div>
              <div style={{ gridColumn: '1 / -1' }}><span style={{ color: 'var(--ws-muted, #94a3b8)' }}>{t('lpco.revisao.fund_legal')}</span> <strong style={{ color: 'var(--ws-text, #f1f5f9)' }}>{form.fundamento_legal || '—'}</strong></div>
            </div>
          </div>

          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.8125rem', fontWeight: 600, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {t('lpco.revisao.itens_count', { count: form.itens.length })}
            </h3>
            {form.itens.map((item, i) => (
              <div key={i} style={{
                padding: '0.5rem 0',
                borderBottom: i < form.itens.length - 1 ? '1px solid rgba(99,102,241,0.06)' : 'none',
                fontSize: '0.8125rem',
              }}>
                <span style={{ fontFamily: 'monospace', color: '#6366f1' }}>{item.ncm || '________'}</span>
                {' — '}
                <span style={{ color: 'var(--ws-text, #f1f5f9)' }}>{item.descricao_produto || t('lpco.sem_descricao')}</span>
                <span style={{ color: 'var(--ws-muted, #64748b)', marginLeft: '0.5rem' }}>
                  {t('lpco.revisao.qtd_vmle', { qtd: item.quantidade_estatistica || '0', vmle: item.vmle || '0', moeda: item.moeda })}
                </span>
              </div>
            ))}
          </div>

          {erro && (
            <div style={{
              padding: '0.625rem 1rem', borderRadius: '8px',
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#f87171', fontSize: '0.875rem',
            }}>
              {erro}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(99,102,241,0.08)' }}>
        <BotaoGlobal
          variante="fantasma"
          tamanho="medio"
          onClick={() => step > 0 ? setStep(step - 1) : navigate('/lpco')}
        >
          <ArrowLeft weight="bold" size={14} />
          {step > 0 ? t('comum.voltar') : t('lpco.cancelar')}
        </BotaoGlobal>

        {step < 3 ? (
          <BotaoGlobal
            variante="primario"
            tamanho="medio"
            onClick={() => setStep(step + 1)}
            disabled={!canNext()}
          >
            {t('lpco.proximo')}
            <ArrowRight weight="bold" size={14} />
          </BotaoGlobal>
        ) : (
          <BotaoGlobal
            variante="primario"
            tamanho="medio"
            onClick={handleSubmit}
            disabled={submitting}
          >
            <PaperPlaneTilt weight="bold" size={14} />
            {submitting ? t('lpco.criando') : t('lpco.criar_lpco')}
          </BotaoGlobal>
        )}
      </div>
    </div>
  )
}
