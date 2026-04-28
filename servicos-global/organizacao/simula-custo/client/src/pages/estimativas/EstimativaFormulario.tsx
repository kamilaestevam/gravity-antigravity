/**
 * EstimativaFormulario.tsx — Formulario de Criacao / Edicao de Estimativa
 * Skill: antigravity-simulacusto
 *
 * Formulario completo de entrada + resultado do calculo fiscal (Landed Cost).
 * Alinhado com fragment.prisma — campos novos: operacao, tipo_operacao, incoterm, quantidade, referencia, documentos.
 * Design: Premium Dark Mode conforme UX 10 Gravity.
 */

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { Calculator, ArrowLeft, FloppyDisk, Play, Plus, Trash } from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { SeletorVisualizacaoGlobal, type ViewMode } from '@nucleo/view-toggle-global'
import { postSimulacao, getEstimativa, criarEstimativa, atualizarEstimativa } from '../../shared/api'
import type {
  SimulacaoInput,
  ResultadoFiscal,
  SimulaCustoTipoOperacao,
  SimulaCustoDetalheOperacao,
  DocumentoRef,
  SimulaCustoTipoDocumento,
} from '../../shared/types'
import {
  OPERACAO_LABELS,
  TIPO_OPERACAO_LABELS,
  DOCUMENTO_LABELS,
} from '../../shared/types'
import { ModalSimulacaoCusto } from './ModalSimulacaoCusto'

// ─── Formatacao ──────────────────────────────────────────────────────────────

const brl = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

const pct = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 2 }).format(val)

// ─── Valores Padrao ──────────────────────────────────────────────────────────

const FORM_DEFAULTS: SimulacaoInput = {
  ncm: '',
  paisOrigem: 'US',
  dataFatoGerador: new Date().toISOString().split('T')[0],
  operacao: 'IMPORTACAO',
  tipo_operacao: 'DIRETA',
  incoterm: 'FOB',
  quantidade: 1,
  referencia: '',
  valorProduto: 0,
  moedaProduto: 'USD',
  freteInter: 0,
  moedaFrete: 'USD',
  seguroInter: 0,
  moedaSeguro: 'USD',
  taxasOrigem: [],
  taxasDestino: [],
  ufDesembaraco: 'SP',
  aliquotaII: 0.16,
  aliquotaIPI: 0,
  aliquotaPIS: 0.021,
  aliquotaCOFINS: 0.0965,
  aliquotaICMS: 0.18,
  documentos: [],
}

const INCOTERMS = ['EXW', 'FCA', 'FAS', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP']
const MOEDAS = ['USD', 'EUR', 'GBP', 'CNY', 'JPY', 'BRL']

// ─── Componente ──────────────────────────────────────────────────────────────

export default function EstimativaFormulario() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id_estimativa: id } = useParams<{ id_estimativa: string }>()
  const isEdicao = Boolean(id)
  const [view, setView] = useState<ViewMode>('lista')
  const [form, setForm] = useState<SimulacaoInput>(FORM_DEFAULTS)
  const [resultado, setResultado] = useState<ResultadoFiscal | null>(null)
  const [loading, setLoading] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modalAberto, setModalAberto] = useState(false)

  const handleSimular = async (dados: SimulacaoInput) => {
    setLoading(true)
    setError(null)
    setResultado(null)
    try {
      const res = await postSimulacao(dados)
      setResultado(res)
      setModalAberto(false)
      setForm(dados) // Atualiza o form local com o que foi simulado
    } catch (_err: unknown) {
      const err = _err as any
      setError(err.message ?? 'Erro ao simular')
    } finally {
      setLoading(false)
    }
  }

  // Carregar estimativa existente em modo edicao
  useEffect(() => {
    if (!id) return
    getEstimativa(id).then(est => {
      setForm({
        ncm: est.ncm,
        paisOrigem: 'US',
        dataFatoGerador: est.data_geracao.split('T')[0],
        operacao: est.operacao,
        tipo_operacao: est.tipo_operacao,
        incoterm: est.incoterm,
        quantidade: est.quantidade,
        referencia: est.referencia ?? '',
        valorProduto: est.valor_produto,
        moedaProduto: est.moeda_produto,
        freteInter: est.valor_frete,
        moedaFrete: est.moeda_frete,
        seguroInter: est.valor_seguro,
        moedaSeguro: est.moeda_seguro,
        taxasOrigem: [],
        taxasDestino: [],
        ufDesembaraco: est.uf_desembaraco,
        aliquotaII: est.aliquota_ii,
        aliquotaIPI: est.aliquota_ipi,
        aliquotaPIS: est.aliquota_pis,
        aliquotaCOFINS: est.aliquota_cofins,
        aliquotaICMS: est.aliquota_icms,
        reducaoII: est.reducao_ii || undefined,
        documentos: [],
      })
    }).catch(() => setError('Estimativa nao encontrada'))
  }, [id])

  const update = <K extends keyof SimulacaoInput>(field: K, value: SimulacaoInput[K]) =>
    setForm(prev => ({ ...prev, [field]: value }))

  // ─── Documentos ───────────────────────────────────────────────────────────

  const addDocumento = () => {
    update('documentos', [...form.documentos, { tipo: 'INVOICE' as SimulaCustoTipoDocumento, numero: '' }])
  }

  const updateDocumento = (index: number, field: keyof DocumentoRef, value: string) => {
    const docs = [...form.documentos]
    docs[index] = { ...docs[index], [field]: value }
    update('documentos', docs)
  }

  const removeDocumento = (index: number) => {
    update('documentos', form.documentos.filter((_, i) => i !== index))
  }

  // ─── Simular (via form submit) ────────────────────────────────────────────

  const handleSimularForm = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResultado(null)
    try {
      const res = await postSimulacao(form)
      setResultado(res)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao simular'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // ─── Salvar ───────────────────────────────────────────────────────────────

  const handleSalvar = async () => {
    setSalvando(true)
    setError(null)
    try {
      if (isEdicao && id) {
        await atualizarEstimativa(id, form)
      } else {
        await criarEstimativa(form)
      }
      navigate('/estimativas')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar'
      setError(msg)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <PaginaGlobal
      className="sc-page"
      layout="formulario"
      cabecalho={
        <CabecalhoGlobal
          icone={<Calculator weight="duotone" size={22} color="#818cf8" />}
          titulo={isEdicao ? t('simulacusto.estimativas.editar_titulo') : t('simulacusto.estimativas.nova_titulo')}
          subtitulo={t('simulacusto.estimativas.nova_subtitulo')}
          acoes={
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="sc-btn sc-btn--ghost" onClick={() => navigate('/estimativas')}>
                <ArrowLeft weight="bold" size={16} /> {t('comum.voltar')}
              </button>
              <button className="sc-btn sc-btn--secondary" onClick={handleSalvar} disabled={salvando}>
                <FloppyDisk weight="duotone" size={16} /> {salvando ? t('botoes.salvando') : t('comum.salvar')}
              </button>
            </div>
          }
          viewToggle={
            <SeletorVisualizacaoGlobal
              view="lista"
              onChange={(v: ViewMode) => {
                if (v === 'dashboard') navigate('/dashboard')
              }}
            />
          }
        />
      }
    >
      <div className="sc-layout">
        {/* ─── Formulario ─────────────────────────────────── */}
        <form className="sc-form" onSubmit={handleSimularForm}>

          {/* Secao: Operacao */}
          <div className="sc-section-title">{t('simulacusto.formulario.operacao')}</div>
          <div className="sc-row sc-row--4">
            <div className="sc-field">
              <label>{t('simulacusto.formulario.operacao')}</label>
              <select value={form.operacao} onChange={e => update('operacao', e.target.value as SimulaCustoTipoOperacao)}>
                {(Object.keys(OPERACAO_LABELS) as SimulaCustoTipoOperacao[]).map(k => (
                  <option key={k} value={k}>{OPERACAO_LABELS[k]}</option>
                ))}
              </select>
            </div>
            <div className="sc-field">
              <label>{t('simulacusto.formulario.modalidade')}</label>
              <select value={form.tipo_operacao} onChange={e => update('tipo_operacao', e.target.value as SimulaCustoDetalheOperacao)}>
                {(Object.keys(TIPO_OPERACAO_LABELS) as SimulaCustoDetalheOperacao[]).map(k => (
                  <option key={k} value={k}>{TIPO_OPERACAO_LABELS[k]}</option>
                ))}
              </select>
            </div>
            <div className="sc-field">
              <label>Incoterm</label>
              <select value={form.incoterm} onChange={e => update('incoterm', e.target.value)}>
                {INCOTERMS.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div className="sc-field">
              <label>{t('simulacusto.formulario.referencia')}</label>
              <input
                type="text"
                maxLength={30}
                placeholder="REF-2026-001"
                value={form.referencia}
                onChange={e => update('referencia', e.target.value)}
              />
            </div>
          </div>

          {/* Secao: Produto */}
          <div className="sc-section-title">{t('simulacusto.formulario.produto_origem')}</div>
          <div className="sc-row sc-row--4">
            <div className="sc-field">
              <label>{t('simulacusto.formulario.ncm')}</label>
              <input
                type="text"
                maxLength={8}
                placeholder="84713019"
                value={form.ncm}
                onChange={e => update('ncm', e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>
            <div className="sc-field">
              <label>{t('simulacusto.formulario.pais_origem')}</label>
              <input
                type="text"
                maxLength={2}
                placeholder="US"
                value={form.paisOrigem}
                onChange={e => update('paisOrigem', e.target.value.toUpperCase())}
                required
              />
            </div>
            <div className="sc-field">
              <label>{t('simulacusto.formulario.uf_desembaraco')}</label>
              <input
                type="text"
                maxLength={2}
                placeholder="SP"
                value={form.ufDesembaraco}
                onChange={e => update('ufDesembaraco', e.target.value.toUpperCase())}
                required
              />
            </div>
            <div className="sc-field">
              <label>Quantidade</label>
              <input
                type="number"
                min={0}
                step="0.00001"
                placeholder="1"
                value={form.quantidade || ''}
                onChange={e => update('quantidade', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Secao: Valores */}
          <div className="sc-section-title">{t('simulacusto.formulario.valores')}</div>
          <div className="sc-row">
            <div className="sc-field">
              <label>{t('simulacusto.formulario.valor_produto')}</label>
              <div className="sc-input-group">
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="5925.00"
                  value={form.valorProduto || ''}
                  onChange={e => update('valorProduto', parseFloat(e.target.value) || 0)}
                  required
                />
                <select value={form.moedaProduto} onChange={e => update('moedaProduto', e.target.value)}>
                  {MOEDAS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div className="sc-field">
              <label>{t('simulacusto.formulario.frete_internacional')}</label>
              <div className="sc-input-group">
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  value={form.freteInter || ''}
                  onChange={e => update('freteInter', parseFloat(e.target.value) || 0)}
                />
                <select value={form.moedaFrete} onChange={e => update('moedaFrete', e.target.value)}>
                  {MOEDAS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div className="sc-field">
              <label>{t('simulacusto.formulario.seguro_internacional')}</label>
              <div className="sc-input-group">
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  value={form.seguroInter || ''}
                  onChange={e => update('seguroInter', parseFloat(e.target.value) || 0)}
                />
                <select value={form.moedaSeguro} onChange={e => update('moedaSeguro', e.target.value)}>
                  {MOEDAS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Secao: Aliquotas */}
          <div className="sc-section-title">{t('simulacusto.formulario.aliquotas')}</div>
          <div className="sc-row sc-row--4">
            <div className="sc-field">
              <label>II (%)</label>
              <input type="number" min={0} max={100} step="0.01" placeholder="16.00"
                value={(form.aliquotaII * 100) || ''}
                onChange={e => update('aliquotaII', (parseFloat(e.target.value) || 0) / 100)} />
            </div>
            <div className="sc-field">
              <label>IPI (%)</label>
              <input type="number" min={0} max={100} step="0.01" placeholder="0.00"
                value={(form.aliquotaIPI * 100) || ''}
                onChange={e => update('aliquotaIPI', (parseFloat(e.target.value) || 0) / 100)} />
            </div>
            <div className="sc-field">
              <label>PIS (%)</label>
              <input type="number" min={0} max={100} step="0.01" placeholder="2.10"
                value={(form.aliquotaPIS * 100) || ''}
                onChange={e => update('aliquotaPIS', (parseFloat(e.target.value) || 0) / 100)} />
            </div>
            <div className="sc-field">
              <label>COFINS (%)</label>
              <input type="number" min={0} max={100} step="0.01" placeholder="9.65"
                value={(form.aliquotaCOFINS * 100) || ''}
                onChange={e => update('aliquotaCOFINS', (parseFloat(e.target.value) || 0) / 100)} />
            </div>
          </div>

          <div className="sc-row sc-row--2">
            <div className="sc-field">
              <label>ICMS (%)</label>
              <input type="number" min={0} max={100} step="0.01" placeholder="18.00"
                value={(form.aliquotaICMS * 100) || ''}
                onChange={e => update('aliquotaICMS', (parseFloat(e.target.value) || 0) / 100)} />
            </div>
            <div className="sc-field">
              <label>{t('simulacusto.formulario.reducao_ii')}</label>
              <input type="number" min={0} max={100} step="0.01" placeholder="0.00"
                value={((form.reducaoII ?? 0) * 100) || ''}
                onChange={e => update('reducaoII', (parseFloat(e.target.value) || 0) / 100)} />
            </div>
          </div>

          {/* Secao: Documentos Vinculados */}
          <div className="sc-section-title">
            {t('simulacusto.formulario.documentos')}
            <button type="button" className="sc-btn-inline" onClick={addDocumento}>
              <Plus weight="bold" size={14} /> {t('acoes.adicionar')}
            </button>
          </div>
          {form.documentos.map((doc, i) => (
            <div key={i} className="sc-row sc-row--doc">
              <div className="sc-field">
                <label>Tipo</label>
                <select value={doc.tipo} onChange={e => updateDocumento(i, 'tipo', e.target.value)}>
                  {(Object.keys(DOCUMENTO_LABELS) as SimulaCustoTipoDocumento[]).map(k => (
                    <option key={k} value={k}>{DOCUMENTO_LABELS[k]}</option>
                  ))}
                </select>
              </div>
              <div className="sc-field">
                <label>Numero</label>
                <input
                  type="text"
                  maxLength={30}
                  placeholder="INV-2026-001"
                  value={doc.numero}
                  onChange={e => updateDocumento(i, 'numero', e.target.value)}
                />
              </div>
              <button type="button" className="sc-btn-remove" onClick={() => removeDocumento(i)}>
                <Trash weight="duotone" size={16} />
              </button>
            </div>
          ))}

          {error && <div className="sc-error">{error}</div>}

          <button type="submit" className="sc-btn-simular" disabled={loading}>
            <Play weight="fill" size={16} />
            {loading ? t('simulacusto.formulario.calculando') : t('simulacusto.formulario.simular_custo')}
          </button>
        </form>

        {/* ─── Area de Lista/Acoes ─────────────────────────── */}
        <div className="sc-list-area">
          <div className="sc-actions-bar">
            <button
              className="sc-btn-nova"
              onClick={() => setModalAberto(true)}
            >
              <Plus weight="bold" />
              {t('simulacusto.estimativas.nova')}
            </button>
          </div>

          <div className="sc-empty-state">
            <Calculator weight="duotone" size={48} />
            <h3>{t('simulacusto.estimativas.vazio')}</h3>
            <p>Clique no botao acima para iniciar um novo calculo de Landed Cost.</p>
          </div>
        </div>

        {/* ─── Resultado ──────────────────────────────────── */}
        {resultado && (
          <div className="sc-result">
            <div className="sc-result-header">
              <span className="sc-result-badge">
                {resultado.source === 'siscomex' ? t('simulacusto.formulario.portal_unico') : t('simulacusto.formulario.engine')}
              </span>
              <span className="sc-ptax">PTAX: R$ {resultado.ptaxUtilizada?.toFixed(4)}</span>
            </div>

            <div className="sc-landed-cost">
              <span className="sc-lc-label">{t('simulacusto.formulario.landed_cost')}</span>
              <span className="sc-lc-value">{brl(resultado.landedCostBRL)}</span>
            </div>

            <div className="sc-breakdown">
              <div className="sc-bk-row">
                <span>{t('simulacusto.formulario.valor_aduaneiro')}</span>
                <span>{brl(resultado.vAduaneiroBRL)}</span>
              </div>
              <div className="sc-bk-sep" />
              {Object.entries(resultado.tributos).map(([key, t]: [string, any]) => (
                <div key={key} className="sc-bk-row sc-bk-row--tributo">
                  <span>{key.toUpperCase()} <em>{pct(t.aliquota)}</em></span>
                  <span>{brl(t.valor)}</span>
                </div>
              ))}
              <div className="sc-bk-sep" />
              <div className="sc-bk-row sc-bk-row--total">
                <span>{t('simulacusto.formulario.total_tributos')}</span>
                <span>{brl(resultado.totalTributos)}</span>
              </div>
            </div>

            <button type="button" className="sc-btn-salvar" onClick={handleSalvar} disabled={salvando}>
              <FloppyDisk weight="duotone" size={16} />
              {salvando ? t('botoes.salvando') : t('simulacusto.formulario.salvar_estimativa')}
            </button>
          </div>
        )}
      </div>

      <ModalSimulacaoCusto
        aberto={modalAberto}
        aoFechar={() => setModalAberto(false)}
        aoSimular={handleSimular}
        loading={loading}
        dadosIniciais={form}
      />

      <style>{`
        .sc-page { font-family: 'Plus Jakarta Sans', sans-serif; color: var(--text-primary, #f1f5f9); }
        .sc-layout { display: grid; grid-template-columns: 1fr 400px; gap: 2rem; padding: 1.5rem 0; }
        @media (max-width: 1024px) { .sc-layout { grid-template-columns: 1fr; } }

        /* Form */
        .sc-form { background: var(--bg-surface, #334155); border-radius: var(--radius-lg, 12px); padding: 1.5rem; }
        .sc-section-title { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted, #64748b); margin: 1.25rem 0 0.75rem; display: flex; align-items: center; justify-content: space-between; }
        .sc-section-title:first-child { margin-top: 0; }
        .sc-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1rem; }
        .sc-row--4 { grid-template-columns: repeat(4, 1fr); }
        .sc-row--2 { grid-template-columns: repeat(2, 1fr); }
        .sc-row--doc { grid-template-columns: 200px 1fr auto; align-items: end; }
        @media (max-width: 768px) {
          .sc-row, .sc-row--4 { grid-template-columns: repeat(2, 1fr); }
          .sc-row--doc { grid-template-columns: 1fr 1fr auto; }
        }

        /* Fields */
        .sc-field label { display: block; font-size: 0.8125rem; font-weight: 600; color: var(--text-secondary, #94a3b8); margin-bottom: 0.375rem; }
        .sc-field input, .sc-field select { width: 100%; background: var(--bg-base, #1e293b); border: 1px solid var(--bg-elevated, #475569); border-radius: var(--radius-md, 8px); padding: 0.5rem 0.75rem; color: var(--text-primary, #f1f5f9); font-size: 0.875rem; font-family: inherit; outline: none; box-sizing: border-box; transition: border-color 0.15s; }
        .sc-field input:focus, .sc-field select:focus { border-color: var(--accent, #6366f1); box-shadow: var(--focus-ring, 0 0 0 2px rgba(99,102,241,0.4)); }
        .sc-input-group { display: flex; gap: 0.5rem; }
        .sc-input-group input { flex: 1; }
        .sc-input-group select { width: 80px; flex-shrink: 0; }

        /* Buttons */
        .sc-btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1.25rem; border-radius: var(--radius-pill, 9999px); font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.15s; border: none; font-family: inherit; }
        .sc-btn--ghost { background: transparent; color: var(--text-secondary, #94a3b8); }
        .sc-btn--ghost:hover { background: var(--bg-surface, #334155); color: var(--text-primary, #f1f5f9); }
        .sc-btn--secondary { background: var(--bg-surface, #334155); color: var(--text-primary, #f1f5f9); border: 1px solid var(--bg-elevated, #475569); }
        .sc-btn--secondary:hover { background: var(--bg-elevated, #475569); }
        .sc-btn--secondary:disabled { opacity: 0.5; cursor: not-allowed; }
        .sc-btn-inline { display: inline-flex; align-items: center; gap: 0.25rem; background: none; border: none; color: var(--accent, #6366f1); font-size: 0.75rem; font-weight: 600; cursor: pointer; font-family: inherit; }
        .sc-btn-inline:hover { text-decoration: underline; }
        .sc-btn-remove { background: none; border: none; color: var(--text-muted, #64748b); cursor: pointer; padding: 0.5rem; margin-bottom: 0.25rem; transition: color 0.15s; }
        .sc-btn-remove:hover { color: var(--danger, #ef4444); }

        /* List area (master) */
        .sc-list-area { display: flex; flex-direction: column; gap: 1.5rem; }
        .sc-actions-bar { display: flex; justify-content: flex-end; }
        .sc-btn-nova { display: flex; align-items: center; gap: 0.5rem; background: var(--ws-accent, #818cf8); color: #fff; border: none; border-radius: 8px; padding: 0.75rem 1.25rem; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .sc-btn-nova:hover { opacity: 0.9; transform: translateY(-1px); }

        .sc-empty-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--ws-surface, #1e293b); border: 2px dashed var(--ws-accent-border, rgba(129,140,248,0.20)); border-radius: 12px; padding: 4rem 2rem; color: var(--ws-muted, #94a3b8); text-align: center; }
        .sc-empty-state svg { color: var(--ws-accent, #818cf8); opacity: 0.5; margin-bottom: 1.5rem; }
        .sc-empty-state h3 { font-size: 1.125rem; font-weight: 600; color: var(--ws-text, #f1f5f9); margin: 0 0 0.5rem 0; }
        .sc-empty-state p { font-size: 0.875rem; max-width: 300px; margin: 0; }

        /* Error */
        .sc-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: var(--radius-md, 8px); padding: 0.75rem; font-size: 0.875rem; color: #f87171; margin-top: 1rem; }

        /* Simular button */
        .sc-btn-simular { width: 100%; margin-top: 1.5rem; padding: 0.875rem; background: var(--accent, #6366f1); color: #0f172a; border: none; border-radius: var(--radius-pill, 9999px); font-size: 0.9375rem; font-weight: 600; font-family: inherit; cursor: pointer; transition: opacity 0.15s, transform 0.1s; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; }
        .sc-btn-simular:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .sc-btn-simular:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Result panel */
        .sc-result { background: var(--ws-surface, #1e293b); border-radius: 12px; padding: 1.5rem; border: 1px solid var(--ws-accent-border, rgba(129,140,248,0.20)); height: fit-content; position: sticky; top: 1rem; }
        .sc-result-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
        .sc-result-badge { font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; background: rgba(129,140,248,0.15); color: var(--ws-accent, #818cf8); padding: 0.25rem 0.6rem; border-radius: 999px; border: 1px solid rgba(129,140,248,0.3); }
        .sc-ptax { font-size: 0.75rem; color: var(--ws-muted, #94a3b8); }
        .sc-landed-cost { text-align: center; padding: 1.25rem 0; border-bottom: 1px solid var(--ws-accent-border, rgba(129,140,248,0.20)); margin-bottom: 1.25rem; }
        .sc-lc-label { display: block; font-size: 0.75rem; font-weight: 600; color: var(--ws-muted, #94a3b8); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.5rem; }
        .sc-lc-value { font-size: 2rem; font-weight: 800; color: var(--success, #22c55e); }
        .sc-breakdown { display: flex; flex-direction: column; gap: 0.5rem; }
        .sc-bk-row { display: flex; justify-content: space-between; font-size: 0.875rem; color: var(--ws-text, #f1f5f9); }
        .sc-bk-row--tributo { color: var(--ws-muted, #94a3b8); }
        .sc-bk-row--tributo em { font-style: normal; font-size: 0.75rem; color: var(--ws-muted, #64748b); margin-left: 0.25rem; }
        .sc-bk-row--total { font-weight: 700; color: var(--ws-text, #f1f5f9); }
        .sc-bk-sep { height: 1px; background: var(--ws-accent-border, rgba(129,140,248,0.20)); margin: 0.5rem 0; }

        /* Salvar after result */
        .sc-btn-salvar { width: 100%; margin-top: 1.25rem; padding: 0.75rem; background: var(--success, #22c55e); color: #0f172a; border: none; border-radius: var(--radius-pill, 9999px); font-size: 0.875rem; font-weight: 600; font-family: inherit; cursor: pointer; transition: opacity 0.15s; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; }
        .sc-btn-salvar:hover:not(:disabled) { opacity: 0.9; }
        .sc-btn-salvar:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </PaginaGlobal>
  )
}
