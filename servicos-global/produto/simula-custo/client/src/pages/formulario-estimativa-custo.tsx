/**
 * formulario-estimativa-custo.tsx — Criação / edição de Estimativa de Custo.
 * Entrada completa + resultado do cálculo fiscal (custo nacionalizado).
 * NCM valida ao vivo no Cadastros (alíquotas TEC pré-preenchidas no blur).
 */
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, FloppyDisk, Play, Plus, Trash } from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { SelectNcmGlobal } from '@nucleo/campo-ncm-global'
import {
  simularEstimativaCusto,
  obterEstimativaCusto,
  criarEstimativaCusto,
  atualizarEstimativaCusto,
  validarNcmEstimativaCusto,
  listarUfsEstimativaCusto,
} from '../shared/api'
import type {
  EntradaEstimativaCusto,
  ResultadoSimulacaoEstimativaCusto,
  TipoOperacaoEstimativaCusto,
  DetalheOperacaoEstimativaCusto,
  TipoDocumentoEstimativaCusto,
} from '../shared/schemas-estimativa-custo'
import { OPERACAO_LABELS, DETALHE_OPERACAO_LABELS, DOCUMENTO_LABELS } from '../shared/types'
import { rotaSimulaCusto } from '../shared/rotas-estimativa-custo'
import './formulario-estimativa-custo.css'

const brl = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

const pct = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 2 }).format(val)

const FORM_DEFAULTS: EntradaEstimativaCusto = {
  referencia_estimativa_custo: '',
  tipo_operacao_estimativa_custo: 'IMPORTACAO',
  detalhe_operacao_estimativa_custo: 'DIRETA',
  ncm_estimativa_custo: '',
  incoterm_estimativa_custo: 'FOB',
  quantidade_estimativa_custo: 1,
  moeda_produto_estimativa_custo: 'USD',
  valor_produto_estimativa_custo: 0,
  moeda_frete_estimativa_custo: 'USD',
  valor_frete_estimativa_custo: 0,
  moeda_seguro_estimativa_custo: 'USD',
  valor_seguro_estimativa_custo: 0,
  uf_desembaraco_estimativa_custo: 'SP',
  aliquota_icms_estimativa_custo: 0.18,
  aliquota_ii_estimativa_custo: 0.16,
  aliquota_ipi_estimativa_custo: 0,
  aliquota_pis_estimativa_custo: 0.021,
  aliquota_cofins_estimativa_custo: 0.0965,
  reducao_ii_estimativa_custo: 0,
  taxas_origem: [],
  taxas_destino: [],
  documentos: [],
}

const INCOTERMS = ['EXW', 'FCA', 'FAS', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP']
const MOEDAS = ['USD', 'EUR', 'GBP', 'CNY', 'JPY', 'BRL']

export default function FormularioEstimativaCusto() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id_estimativa_custo: id } = useParams<{ id_estimativa_custo: string }>()
  const isEdicao = Boolean(id)

  const [form, setForm] = useState<EntradaEstimativaCusto>(FORM_DEFAULTS)
  const [resultado, setResultado] = useState<ResultadoSimulacaoEstimativaCusto | null>(null)
  const [ufs, setUfs] = useState<Array<{ uf: string; nome: string; icms: number }>>([])
  const [loading, setLoading] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listarUfsEstimativaCusto().then(setUfs).catch(() => setUfs([]))
  }, [])

  // Carregar estimativa existente em modo edição
  useEffect(() => {
    if (!id) return
    obterEstimativaCusto(id).then(est => {
      setForm({
        referencia_estimativa_custo: est.referencia_estimativa_custo ?? '',
        tipo_operacao_estimativa_custo: est.tipo_operacao_estimativa_custo,
        detalhe_operacao_estimativa_custo: est.detalhe_operacao_estimativa_custo,
        ncm_estimativa_custo: est.ncm_estimativa_custo,
        descricao_ncm_estimativa_custo: est.descricao_ncm_estimativa_custo ?? undefined,
        incoterm_estimativa_custo: est.incoterm_estimativa_custo,
        quantidade_estimativa_custo: est.quantidade_estimativa_custo ?? 1,
        moeda_produto_estimativa_custo: est.moeda_produto_estimativa_custo,
        valor_produto_estimativa_custo: est.valor_produto_estimativa_custo ?? 0,
        moeda_frete_estimativa_custo: est.moeda_frete_estimativa_custo,
        valor_frete_estimativa_custo: est.valor_frete_estimativa_custo ?? 0,
        moeda_seguro_estimativa_custo: est.moeda_seguro_estimativa_custo,
        valor_seguro_estimativa_custo: est.valor_seguro_estimativa_custo ?? 0,
        uf_desembaraco_estimativa_custo: est.uf_desembaraco_estimativa_custo,
        aliquota_icms_estimativa_custo: est.aliquota_icms_estimativa_custo,
        aliquota_ii_estimativa_custo: est.aliquota_ii_estimativa_custo,
        aliquota_ipi_estimativa_custo: est.aliquota_ipi_estimativa_custo,
        aliquota_pis_estimativa_custo: est.aliquota_pis_estimativa_custo,
        aliquota_cofins_estimativa_custo: est.aliquota_cofins_estimativa_custo,
        reducao_ii_estimativa_custo: est.reducao_ii_estimativa_custo,
        usa_beneficio_estimativa_custo: est.usa_beneficio_estimativa_custo,
        taxas_origem: est.taxas_origem.map(tx => ({
          id_taxa_origem_destino: tx.id_taxa_origem_destino,
          nome: tx.nome_taxa_origem_estimativa_custo,
          moeda: tx.moeda_taxa_origem_estimativa_custo,
          tipo_cobranca: tx.tipo_cobranca_taxa_origem_estimativa_custo,
          valor_minimo: tx.valor_minimo_taxa_origem_estimativa_custo,
          valor_total: tx.valor_total_taxa_origem_estimativa_custo,
        })),
        taxas_destino: est.taxas_destino.map(tx => ({
          id_taxa_origem_destino: tx.id_taxa_origem_destino,
          nome: tx.nome_taxa_destino_estimativa_custo,
          moeda: tx.moeda_taxa_destino_estimativa_custo,
          tipo_cobranca: tx.tipo_cobranca_taxa_destino_estimativa_custo,
          valor_minimo: tx.valor_minimo_taxa_destino_estimativa_custo,
          valor_total: tx.valor_total_taxa_destino_estimativa_custo,
        })),
        documentos: est.documentos.map(d => ({
          tipo_documento_estimativa_custo: d.tipo_documento_estimativa_custo,
          numero_documento_estimativa_custo: d.numero_documento_estimativa_custo,
        })),
      })
    }).catch(() => setError(t('simulacusto.formulario.nao_encontrada', 'Estimativa não encontrada')))
  }, [id, t])

  const update = <K extends keyof EntradaEstimativaCusto>(campo: K, valor: EntradaEstimativaCusto[K]) =>
    setForm(prev => ({ ...prev, [campo]: valor }))

  // Pré-preenche alíquotas TEC do Cadastros quando o NCM completa 8 dígitos.
  // A validação visual (badge verde/amarelo) é do próprio SelectNcmGlobal.
  const aplicarAliquotasNcm = async (codigo: string) => {
    if (!/^\d{8}$/.test(codigo)) return
    try {
      const v = await validarNcmEstimativaCusto(codigo)
      if (v.valido) {
        setForm(prev => ({
          ...prev,
          descricao_ncm_estimativa_custo: v.descricao ?? prev.descricao_ncm_estimativa_custo,
          ...(v.ii != null ? { aliquota_ii_estimativa_custo: v.ii / 100 } : {}),
          ...(v.ipi != null ? { aliquota_ipi_estimativa_custo: v.ipi / 100 } : {}),
          ...(v.pis != null ? { aliquota_pis_estimativa_custo: v.pis / 100 } : {}),
          ...(v.cofins != null ? { aliquota_cofins_estimativa_custo: v.cofins / 100 } : {}),
        }))
      }
    } catch { /* Cadastros indisponível — usuário informa alíquotas manualmente */ }
  }

  // onChange do SelectNcmGlobal — digitação ou seleção no modal Buscar NCM
  const handleNcmChange = (codigo: string, descricao?: string) => {
    setForm(prev => ({
      ...prev,
      ncm_estimativa_custo: codigo,
      ...(descricao ? { descricao_ncm_estimativa_custo: descricao } : {}),
    }))
    if (codigo.length === 8) void aplicarAliquotasNcm(codigo)
  }

  // ─── Documentos ───────────────────────────────────────────────────────────
  const addDocumento = () =>
    update('documentos', [...form.documentos, { tipo_documento_estimativa_custo: 'INVOICE', numero_documento_estimativa_custo: '' }])

  const updateDocumento = (index: number, campo: 'tipo_documento_estimativa_custo' | 'numero_documento_estimativa_custo', valor: string) => {
    const docs = [...form.documentos]
    docs[index] = { ...docs[index], [campo]: valor }
    update('documentos', docs)
  }

  const removeDocumento = (index: number) =>
    update('documentos', form.documentos.filter((_, i) => i !== index))

  // ─── Taxas ────────────────────────────────────────────────────────────────
  const addTaxa = (lado: 'taxas_origem' | 'taxas_destino') =>
    update(lado, [...form[lado], { nome: '', moeda: 'USD', tipo_cobranca: 'PROCESSO', valor_minimo: 0, valor_total: 0 }])

  const updateTaxa = (lado: 'taxas_origem' | 'taxas_destino', index: number, campo: 'nome' | 'moeda' | 'valor_total', valor: string | number) => {
    const taxas = [...form[lado]]
    taxas[index] = { ...taxas[index], [campo]: valor }
    update(lado, taxas)
  }

  const removeTaxa = (lado: 'taxas_origem' | 'taxas_destino', index: number) =>
    update(lado, form[lado].filter((_, i) => i !== index))

  // ─── Simular (preview, sem persistir) ─────────────────────────────────────
  const handleSimular = async (e: React.FormEvent) => {
    e.preventDefault()
    // O campo NCM (SelectNcmGlobal) não usa `required` nativo — validar aqui
    if (!/^\d{8}$/.test(form.ncm_estimativa_custo)) {
      setError(t('simulacusto.formulario.ncm_obrigatorio', 'Informe um NCM de 8 dígitos para simular.'))
      return
    }
    setLoading(true)
    setError(null)
    setResultado(null)
    try {
      const res = await simularEstimativaCusto({
        ncm_estimativa_custo: form.ncm_estimativa_custo,
        valor_produto_estimativa_custo: form.valor_produto_estimativa_custo,
        moeda_produto_estimativa_custo: form.moeda_produto_estimativa_custo,
        valor_frete_estimativa_custo: form.valor_frete_estimativa_custo,
        moeda_frete_estimativa_custo: form.moeda_frete_estimativa_custo,
        valor_seguro_estimativa_custo: form.valor_seguro_estimativa_custo,
        moeda_seguro_estimativa_custo: form.moeda_seguro_estimativa_custo,
        taxas_origem: form.taxas_origem.map(tx => ({ nome: tx.nome, valor: tx.valor_total, moeda: tx.moeda })),
        taxas_destino: form.taxas_destino.map(tx => ({ nome: tx.nome, valor: tx.valor_total, moeda: tx.moeda })),
        uf_desembaraco_estimativa_custo: form.uf_desembaraco_estimativa_custo,
        aliquota_ii_estimativa_custo: form.aliquota_ii_estimativa_custo,
        aliquota_ipi_estimativa_custo: form.aliquota_ipi_estimativa_custo,
        aliquota_pis_estimativa_custo: form.aliquota_pis_estimativa_custo,
        aliquota_cofins_estimativa_custo: form.aliquota_cofins_estimativa_custo,
        aliquota_icms_estimativa_custo: form.aliquota_icms_estimativa_custo,
        reducao_ii_estimativa_custo: form.reducao_ii_estimativa_custo,
      })
      setResultado(res)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('simulacusto.formulario.erro_simular', 'Erro ao simular'))
    } finally {
      setLoading(false)
    }
  }

  // ─── Salvar ───────────────────────────────────────────────────────────────
  const handleSalvar = async () => {
    setSalvando(true)
    setError(null)
    try {
      const payload: EntradaEstimativaCusto = {
        ...form,
        referencia_estimativa_custo: form.referencia_estimativa_custo?.trim() || undefined,
      }
      if (isEdicao && id) {
        await atualizarEstimativaCusto(id, payload)
      } else {
        await criarEstimativaCusto(payload)
      }
      navigate(rotaSimulaCusto('lista'))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('simulacusto.formulario.erro_salvar', 'Erro ao salvar'))
    } finally {
      setSalvando(false)
    }
  }

  const renderTaxas = (lado: 'taxas_origem' | 'taxas_destino', titulo: string) => (
    <>
      <div className="sc-section-title">
        {titulo}
        <button type="button" className="sc-btn-inline" onClick={() => addTaxa(lado)}>
          <Plus weight="bold" size={14} /> {t('acoes.adicionar', 'Adicionar')}
        </button>
      </div>
      {form[lado].map((taxa, i) => (
        <div key={i} className="sc-row sc-row--doc">
          <div className="sc-field">
            <label>{t('simulacusto.formulario.taxa_nome', 'Nome da taxa')}</label>
            <input
              type="text"
              maxLength={100}
              placeholder="THC"
              value={taxa.nome}
              onChange={e => updateTaxa(lado, i, 'nome', e.target.value)}
            />
          </div>
          <div className="sc-field">
            <label>{t('simulacusto.formulario.taxa_valor', 'Valor')}</label>
            <div className="sc-input-group">
              <input
                type="number"
                min={0}
                step="0.01"
                value={taxa.valor_total || ''}
                onChange={e => updateTaxa(lado, i, 'valor_total', parseFloat(e.target.value) || 0)}
              />
              <select value={taxa.moeda} onChange={e => updateTaxa(lado, i, 'moeda', e.target.value)}>
                {MOEDAS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <button type="button" className="sc-btn-remove" onClick={() => removeTaxa(lado, i)}>
            <Trash weight="duotone" size={16} />
          </button>
        </div>
      ))}
    </>
  )

  return (
    <PaginaGlobal
      className="sc-page"
      layout="formulario"
    >
      {/* Título/subtítulo vêm do MenuTopoGlobal (page-meta) — sem cabeçalho duplicado */}
      <div className="sc-form-toolbar">
        <button className="sc-btn sc-btn--ghost" onClick={() => navigate(rotaSimulaCusto('lista'))}>
          <ArrowLeft weight="bold" size={16} /> {t('comum.voltar', 'Voltar')}
        </button>
        <button className="sc-btn sc-btn--secondary" onClick={handleSalvar} disabled={salvando}>
          <FloppyDisk weight="duotone" size={16} /> {salvando ? t('botoes.salvando', 'Salvando…') : t('comum.salvar', 'Salvar')}
        </button>
      </div>
      <div className="sc-layout">
        <form className="sc-form" onSubmit={handleSimular}>

          {/* Seção: Operação */}
          <div className="sc-section-title">{t('simulacusto.formulario.operacao', 'Operação')}</div>
          <div className="sc-row sc-row--4">
            <div className="sc-field">
              <label>{t('simulacusto.formulario.operacao', 'Operação')}</label>
              <select
                value={form.tipo_operacao_estimativa_custo}
                onChange={e => update('tipo_operacao_estimativa_custo', e.target.value as TipoOperacaoEstimativaCusto)}
              >
                {(Object.keys(OPERACAO_LABELS) as TipoOperacaoEstimativaCusto[]).map(k => (
                  <option key={k} value={k}>{OPERACAO_LABELS[k]}</option>
                ))}
              </select>
            </div>
            <div className="sc-field">
              <label>{t('simulacusto.formulario.modalidade', 'Modalidade')}</label>
              <select
                value={form.detalhe_operacao_estimativa_custo}
                onChange={e => update('detalhe_operacao_estimativa_custo', e.target.value as DetalheOperacaoEstimativaCusto)}
              >
                {(Object.keys(DETALHE_OPERACAO_LABELS) as DetalheOperacaoEstimativaCusto[]).map(k => (
                  <option key={k} value={k}>{DETALHE_OPERACAO_LABELS[k]}</option>
                ))}
              </select>
            </div>
            <div className="sc-field">
              <label>Incoterm</label>
              <select
                value={form.incoterm_estimativa_custo}
                onChange={e => update('incoterm_estimativa_custo', e.target.value)}
              >
                {INCOTERMS.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div className="sc-field">
              <label>{t('simulacusto.formulario.referencia', 'Referência')}</label>
              <input
                type="text"
                maxLength={30}
                placeholder="REF-2026-001"
                value={form.referencia_estimativa_custo ?? ''}
                onChange={e => update('referencia_estimativa_custo', e.target.value)}
              />
            </div>
          </div>

          {/* Seção: Produto */}
          <div className="sc-section-title">{t('simulacusto.formulario.produto_origem', 'Produto e Origem')}</div>
          <div className="sc-row sc-row--4">
            <div className="sc-field sc-campo-ncm">
              <label>{t('simulacusto.formulario.ncm', 'NCM (8 dígitos)')}</label>
              <SelectNcmGlobal
                className="sc-campo-ncm__inner"
                label=""
                value={form.ncm_estimativa_custo}
                onChange={handleNcmChange}
              />
            </div>
            <div className="sc-field">
              <label>{t('simulacusto.formulario.uf_desembaraco', 'UF de Desembaraço')}</label>
              <select
                value={form.uf_desembaraco_estimativa_custo}
                onChange={e => {
                  const uf = e.target.value
                  const info = ufs.find(u => u.uf === uf)
                  setForm(prev => ({
                    ...prev,
                    uf_desembaraco_estimativa_custo: uf,
                    ...(info ? { aliquota_icms_estimativa_custo: info.icms } : {}),
                  }))
                }}
              >
                {(ufs.length > 0 ? ufs : [{ uf: 'SP', nome: 'São Paulo', icms: 0.18 }]).map(u => (
                  <option key={u.uf} value={u.uf}>{u.uf} — {u.nome}</option>
                ))}
              </select>
            </div>
            <div className="sc-field">
              <label>{t('simulacusto.formulario.quantidade', 'Quantidade')}</label>
              <input
                type="number"
                min={0}
                step="0.00001"
                placeholder="1"
                value={form.quantidade_estimativa_custo || ''}
                onChange={e => update('quantidade_estimativa_custo', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="sc-field">
              <label>{t('simulacusto.formulario.numero_manual', 'Número manual (opcional)')}</label>
              <input
                type="text"
                maxLength={30}
                placeholder="Automático"
                value={form.numero_manual_estimativa_custo ?? ''}
                onChange={e => update('numero_manual_estimativa_custo', e.target.value)}
                disabled={isEdicao}
              />
            </div>
          </div>

          {/* Seção: Valores */}
          <div className="sc-section-title">{t('simulacusto.formulario.valores', 'Valores')}</div>
          <div className="sc-row">
            <div className="sc-field">
              <label>{t('simulacusto.formulario.valor_produto', 'Valor do Produto')}</label>
              <div className="sc-input-group">
                <input
                  type="number" min={0} step="0.01" placeholder="5925.00" required
                  value={form.valor_produto_estimativa_custo || ''}
                  onChange={e => update('valor_produto_estimativa_custo', parseFloat(e.target.value) || 0)}
                />
                <select
                  value={form.moeda_produto_estimativa_custo}
                  onChange={e => update('moeda_produto_estimativa_custo', e.target.value)}
                >
                  {MOEDAS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div className="sc-field">
              <label>{t('simulacusto.formulario.frete_internacional', 'Frete Internacional')}</label>
              <div className="sc-input-group">
                <input
                  type="number" min={0} step="0.01" placeholder="0.00"
                  value={form.valor_frete_estimativa_custo || ''}
                  onChange={e => update('valor_frete_estimativa_custo', parseFloat(e.target.value) || 0)}
                />
                <select
                  value={form.moeda_frete_estimativa_custo}
                  onChange={e => update('moeda_frete_estimativa_custo', e.target.value)}
                >
                  {MOEDAS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div className="sc-field">
              <label>{t('simulacusto.formulario.seguro_internacional', 'Seguro Internacional')}</label>
              <div className="sc-input-group">
                <input
                  type="number" min={0} step="0.01" placeholder="0.00"
                  value={form.valor_seguro_estimativa_custo || ''}
                  onChange={e => update('valor_seguro_estimativa_custo', parseFloat(e.target.value) || 0)}
                />
                <select
                  value={form.moeda_seguro_estimativa_custo}
                  onChange={e => update('moeda_seguro_estimativa_custo', e.target.value)}
                >
                  {MOEDAS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Seção: Alíquotas */}
          <div className="sc-section-title">{t('simulacusto.formulario.aliquotas', 'Alíquotas')}</div>
          <div className="sc-row sc-row--4">
            <div className="sc-field">
              <label>II (%)</label>
              <input type="number" min={0} max={100} step="0.01" placeholder="16.00"
                value={(form.aliquota_ii_estimativa_custo * 100) || ''}
                onChange={e => update('aliquota_ii_estimativa_custo', (parseFloat(e.target.value) || 0) / 100)} />
            </div>
            <div className="sc-field">
              <label>IPI (%)</label>
              <input type="number" min={0} max={100} step="0.01" placeholder="0.00"
                value={(form.aliquota_ipi_estimativa_custo * 100) || ''}
                onChange={e => update('aliquota_ipi_estimativa_custo', (parseFloat(e.target.value) || 0) / 100)} />
            </div>
            <div className="sc-field">
              <label>PIS (%)</label>
              <input type="number" min={0} max={100} step="0.01" placeholder="2.10"
                value={(form.aliquota_pis_estimativa_custo * 100) || ''}
                onChange={e => update('aliquota_pis_estimativa_custo', (parseFloat(e.target.value) || 0) / 100)} />
            </div>
            <div className="sc-field">
              <label>COFINS (%)</label>
              <input type="number" min={0} max={100} step="0.01" placeholder="9.65"
                value={(form.aliquota_cofins_estimativa_custo * 100) || ''}
                onChange={e => update('aliquota_cofins_estimativa_custo', (parseFloat(e.target.value) || 0) / 100)} />
            </div>
          </div>
          <div className="sc-row sc-row--2">
            <div className="sc-field">
              <label>ICMS (%)</label>
              <input type="number" min={0} max={100} step="0.01" placeholder="18.00"
                value={(form.aliquota_icms_estimativa_custo * 100) || ''}
                onChange={e => update('aliquota_icms_estimativa_custo', (parseFloat(e.target.value) || 0) / 100)} />
            </div>
            <div className="sc-field">
              <label>{t('simulacusto.formulario.reducao_ii', 'Redução II (%)')}</label>
              <input type="number" min={0} max={100} step="0.01" placeholder="0.00"
                value={((form.reducao_ii_estimativa_custo ?? 0) * 100) || ''}
                onChange={e => update('reducao_ii_estimativa_custo', (parseFloat(e.target.value) || 0) / 100)} />
            </div>
          </div>

          {/* Taxas de origem/destino */}
          {renderTaxas('taxas_origem', t('simulacusto.formulario.taxas_origem', 'Taxas de Origem'))}
          {renderTaxas('taxas_destino', t('simulacusto.formulario.taxas_destino', 'Taxas de Destino'))}

          {/* Documentos vinculados */}
          <div className="sc-section-title">
            {t('simulacusto.formulario.documentos', 'Documentos Vinculados')}
            <button type="button" className="sc-btn-inline" onClick={addDocumento}>
              <Plus weight="bold" size={14} /> {t('acoes.adicionar', 'Adicionar')}
            </button>
          </div>
          {form.documentos.map((doc, i) => (
            <div key={i} className="sc-row sc-row--doc">
              <div className="sc-field">
                <label>{t('simulacusto.formulario.documento_tipo', 'Tipo')}</label>
                <select
                  value={doc.tipo_documento_estimativa_custo}
                  onChange={e => updateDocumento(i, 'tipo_documento_estimativa_custo', e.target.value)}
                >
                  {(Object.keys(DOCUMENTO_LABELS) as TipoDocumentoEstimativaCusto[]).map(k => (
                    <option key={k} value={k}>{DOCUMENTO_LABELS[k]}</option>
                  ))}
                </select>
              </div>
              <div className="sc-field">
                <label>{t('simulacusto.formulario.documento_numero', 'Número')}</label>
                <input
                  type="text"
                  maxLength={30}
                  placeholder="INV-2026-001"
                  value={doc.numero_documento_estimativa_custo}
                  onChange={e => updateDocumento(i, 'numero_documento_estimativa_custo', e.target.value)}
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
            {loading
              ? t('simulacusto.formulario.calculando', 'Calculando…')
              : t('simulacusto.formulario.simular_custo', 'Simular Custo')}
          </button>
        </form>

        {/* Resultado */}
        {resultado && (
          <div className="sc-result">
            <div className="sc-result-header">
              <span className="sc-result-badge">
                {resultado.fonte_calculo_estimativa_custo === 'siscomex'
                  ? t('simulacusto.formulario.portal_unico', 'Portal Único')
                  : t('simulacusto.formulario.engine', 'Gravity Engine')}
              </span>
              <span className="sc-ptax">PTAX: R$ {resultado.ptax_utilizada_estimativa_custo.toFixed(4)}</span>
            </div>

            <div className="sc-landed-cost">
              <span className="sc-lc-label">{t('simulacusto.formulario.custo_nacionalizado', 'Custo Nacionalizado')}</span>
              <span className="sc-lc-value">{brl(resultado.resultado.custo_nacionalizado_brl)}</span>
            </div>

            <div className="sc-breakdown">
              <div className="sc-bk-row">
                <span>{t('simulacusto.formulario.valor_aduaneiro', 'Valor Aduaneiro')}</span>
                <span>{brl(resultado.resultado.valor_aduaneiro_brl)}</span>
              </div>
              <div className="sc-bk-sep" />
              {(['ii', 'ipi', 'pis', 'cofins', 'icms'] as const).map(tipo => {
                const trib = resultado.resultado.tributos[tipo]
                return (
                  <div key={tipo} className="sc-bk-row sc-bk-row--tributo">
                    <span>{tipo.toUpperCase()} <em>{pct(trib.aliquota)}</em></span>
                    <span>{brl(trib.valor)}</span>
                  </div>
                )
              })}
              <div className="sc-bk-sep" />
              <div className="sc-bk-row sc-bk-row--total">
                <span>{t('simulacusto.formulario.total_tributos', 'Total Tributos')}</span>
                <span>{brl(resultado.resultado.total_tributos_brl)}</span>
              </div>
            </div>

            <button type="button" className="sc-btn-salvar" onClick={handleSalvar} disabled={salvando}>
              <FloppyDisk weight="duotone" size={16} />
              {salvando
                ? t('botoes.salvando', 'Salvando…')
                : t('simulacusto.formulario.salvar_estimativa', 'Salvar Estimativa')}
            </button>
          </div>
        )}
      </div>
    </PaginaGlobal>
  )
}
