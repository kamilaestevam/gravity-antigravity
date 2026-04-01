/**
 * ModalNovoLancamento.tsx — Criar/Editar lançamento financeiro
 * Campos: Descrição (categoria), Moeda, Taxa, Valor, Fornecedor,
 *         Condição de Pgto, Datas, Status, Tipo Doc, Número Doc, 3 toggles
 */

import { useState, useEffect } from 'react'
import { lancamentos as lancamentosApi, categorias as categoriasApi, condicoes as condicoesApi } from '../../shared/api'
import type { FinanceiroLancamento, FinanceiroCategorias, FinanceiroCondicaoPagamento, TipoOperacao } from '../../shared/types'
import { MOEDA_LABEL, STATUS_LABEL, TIPO_DOCUMENTO_LABEL, TIPO_FORNECEDOR_LABEL } from '../../shared/types'

interface Props {
  processoId: string
  lancamento?: FinanceiroLancamento
  tipoOperacao: TipoOperacao
  onClose: () => void
  onSalvo: () => void
}

export default function ModalNovoLancamento({ processoId, lancamento, tipoOperacao, onClose, onSalvo }: Props) {
  const isEdicao = !!lancamento

  const [categoriasList, setCategoriasList] = useState<FinanceiroCategorias[]>([])
  const [condicoesList, setCondicoesList] = useState<FinanceiroCondicaoPagamento[]>([])

  const [categoria_id, setCategoriaId] = useState(lancamento?.categoria_id ?? '')
  const [moeda, setMoeda] = useState(lancamento?.moeda ?? 'BRL')
  const [taxa_cambio, setTaxaCambio] = useState(String(lancamento?.taxa_cambio ?? '1.0000000'))
  const [valor, setValor] = useState(String(lancamento?.valor ?? ''))
  const [fornecedor_nome, setFornecedorNome] = useState(lancamento?.fornecedor_nome ?? '')
  const [tipo_fornecedor, setTipoFornecedor] = useState(lancamento?.tipo_fornecedor ?? '')
  const [condicao_id, setCondicaoId] = useState(lancamento?.condicao_id ?? '')
  const [data_pagamento, setDataPagamento] = useState(lancamento?.data_pagamento?.slice(0, 10) ?? '')
  const [data_vencimento, setDataVencimento] = useState(lancamento?.data_vencimento?.slice(0, 10) ?? '')
  const [status_pagamento, setStatusPagamento] = useState(lancamento?.status_pagamento ?? 'PENDENTE')
  const [observacao, setObservacao] = useState(lancamento?.observacao ?? '')
  const [tipo_documento, setTipoDocumento] = useState(lancamento?.tipo_documento ?? '')
  const [numero_documento, setNumeroDocumento] = useState(lancamento?.numero_documento ?? '')
  const [despesa_aduaneira, setDespesaAduaneira] = useState(lancamento?.despesa_aduaneira ?? false)
  const [despesa_nf, setDespesaNf] = useState(lancamento?.despesa_nf ?? false)
  const [espelho_nf, setEspelhoNf] = useState(lancamento?.espelho_nf ?? true)

  const [erros, setErros] = useState<Record<string, string>>({})
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    Promise.all([
      categoriasApi.listar({ tipo_operacao: tipoOperacao }),
      condicoesApi.listar(),
    ]).then(([cRes, condRes]) => {
      setCategoriasList(cRes.data)
      setCondicoesList(condRes.data)
    })
  }, [tipoOperacao])

  // Taxa default BRL
  useEffect(() => {
    if (moeda === 'BRL') setTaxaCambio('1.0000000')
  }, [moeda])

  const valorBRL = (() => {
    const v = parseFloat(valor.replace(',', '.'))
    const t = parseFloat(taxa_cambio.replace(',', '.'))
    if (isNaN(v) || isNaN(t) || t <= 0) return null
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v * t)
  })()

  function validar() {
    const e: Record<string, string> = {}
    if (!categoria_id) e.categoria_id = 'Selecione uma categoria'
    if (!moeda) e.moeda = 'Selecione a moeda'
    const t = parseFloat(taxa_cambio.replace(',', '.'))
    if (isNaN(t) || t <= 0) e.taxa_cambio = 'Taxa deve ser maior que zero'
    const v = parseFloat(valor.replace(',', '.'))
    if (isNaN(v) || v <= 0) e.valor = 'Valor deve ser maior que zero'
    setErros(e)
    return Object.keys(e).length === 0
  }

  async function salvar() {
    if (!validar()) return
    setSalvando(true)
    try {
      const payload = {
        financeiro_id: processoId,
        categoria_id,
        moeda,
        taxa_cambio: parseFloat(taxa_cambio.replace(',', '.')),
        valor: parseFloat(valor.replace(',', '.')),
        fornecedor_nome: fornecedor_nome || undefined,
        tipo_fornecedor: tipo_fornecedor || undefined,
        condicao_id: condicao_id || undefined,
        condicao_descricao: condicoesList.find(c => c.id === condicao_id)?.descricao,
        data_pagamento: data_pagamento ? new Date(data_pagamento).toISOString() : undefined,
        data_vencimento: data_vencimento ? new Date(data_vencimento).toISOString() : undefined,
        status_pagamento,
        observacao: observacao || undefined,
        tipo_documento: tipo_documento || undefined,
        numero_documento: numero_documento || undefined,
        despesa_aduaneira,
        despesa_nf,
        espelho_nf,
      }

      if (isEdicao && lancamento) {
        await lancamentosApi.editar(processoId, lancamento.id, payload)
      } else {
        await lancamentosApi.criar(processoId, payload)
      }
      onSalvo()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="fincom-modal-overlay" onClick={onClose}>
      <div className="fincom-modal" onClick={e => e.stopPropagation()}>
        <div className="fincom-modal__header">
          <h2>{isEdicao ? 'Editar Lancamento' : 'Novo Lancamento'}</h2>
          <button className="fincom-modal__close" onClick={onClose}>×</button>
        </div>

        <div className="fincom-modal__body">
          <div className="fincom-form-row">
            <label className="fincom-label">
              Descricao (Categoria) *
              <select
                className={`fincom-select ${erros.categoria_id ? 'fincom-input--erro' : ''}`}
                value={categoria_id}
                onChange={e => setCategoriaId(e.target.value)}
              >
                <option value="">Selecione uma categoria...</option>
                {categoriasList.filter(c => c.ativo).map(c => (
                  <option key={c.id} value={c.id}>{c.codigo} - {c.nome}</option>
                ))}
              </select>
              {erros.categoria_id && <span className="fincom-erro">{erros.categoria_id}</span>}
            </label>
          </div>

          <div className="fincom-form-cols">
            <label className="fincom-label">
              Moeda *
              <select
                className={`fincom-select ${erros.moeda ? 'fincom-input--erro' : ''}`}
                value={moeda}
                onChange={e => setMoeda(e.target.value as typeof moeda)}
              >
                {Object.entries(MOEDA_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </label>

            <label className="fincom-label">
              Taxa de Cambio *
              <input
                type="number"
                className={`fincom-input ${erros.taxa_cambio ? 'fincom-input--erro' : ''}`}
                value={taxa_cambio}
                step="0.0000001"
                min="0.0000001"
                onChange={e => setTaxaCambio(e.target.value)}
                disabled={moeda === 'BRL'}
              />
              {erros.taxa_cambio && <span className="fincom-erro">{erros.taxa_cambio}</span>}
            </label>
          </div>

          <div className="fincom-form-cols">
            <label className="fincom-label">
              Valor *
              <input
                type="number"
                className={`fincom-input ${erros.valor ? 'fincom-input--erro' : ''}`}
                value={valor}
                step="0.0001"
                min="0.0001"
                placeholder="0,00"
                onChange={e => setValor(e.target.value)}
              />
              {erros.valor && <span className="fincom-erro">{erros.valor}</span>}
              {valorBRL && <span className="fincom-calc">= {valorBRL}</span>}
            </label>

            <label className="fincom-label">
              Status *
              <select
                className="fincom-select"
                value={status_pagamento}
                onChange={e => setStatusPagamento(e.target.value as typeof status_pagamento)}
              >
                {Object.entries(STATUS_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="fincom-form-cols">
            <label className="fincom-label">
              Fornecedor
              <input
                type="text"
                className="fincom-input"
                value={fornecedor_nome}
                placeholder="Nome do fornecedor"
                onChange={e => setFornecedorNome(e.target.value)}
              />
            </label>
            <label className="fincom-label">
              Tipo de Fornecedor
              <select
                className="fincom-select"
                value={tipo_fornecedor}
                onChange={e => setTipoFornecedor(e.target.value)}
              >
                <option value="">—</option>
                {Object.entries(TIPO_FORNECEDOR_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="fincom-label">
            Condicao de Pagamento
            <select
              className="fincom-select"
              value={condicao_id}
              onChange={e => setCondicaoId(e.target.value)}
            >
              <option value="">—</option>
              {condicoesList.filter(c => c.ativo).map(c => (
                <option key={c.id} value={c.id}>{c.descricao}</option>
              ))}
            </select>
          </label>

          <div className="fincom-form-cols">
            <label className="fincom-label">
              Data de Pagamento
              <input type="date" className="fincom-input" value={data_pagamento} onChange={e => setDataPagamento(e.target.value)} />
            </label>
            <label className="fincom-label">
              Data de Vencimento
              <input type="date" className="fincom-input" value={data_vencimento} onChange={e => setDataVencimento(e.target.value)} />
            </label>
          </div>

          <div className="fincom-form-cols">
            <label className="fincom-label">
              Tipo de Documento
              <select className="fincom-select" value={tipo_documento} onChange={e => setTipoDocumento(e.target.value)}>
                <option value="">—</option>
                {Object.entries(TIPO_DOCUMENTO_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </label>
            <label className="fincom-label">
              Numero do Documento
              <input type="text" className="fincom-input" value={numero_documento} placeholder="Ex: NF 001234" onChange={e => setNumeroDocumento(e.target.value)} />
            </label>
          </div>

          <label className="fincom-label">
            Observacao
            <textarea className="fincom-input fincom-textarea" value={observacao} maxLength={500} placeholder="Observacoes opcionais..." onChange={e => setObservacao(e.target.value)} />
          </label>

          <div className="fincom-toggles">
            <label className="fincom-toggle-label">
              <input type="checkbox" checked={despesa_aduaneira} onChange={e => setDespesaAduaneira(e.target.checked)} />
              <span>Despesa Aduaneira</span>
            </label>
            <label className="fincom-toggle-label">
              <input type="checkbox" checked={despesa_nf} onChange={e => setDespesaNf(e.target.checked)} />
              <span>Despesa NF</span>
            </label>
            <label className="fincom-toggle-label">
              <input type="checkbox" checked={espelho_nf} onChange={e => setEspelhoNf(e.target.checked)} />
              <span>Apresentar no Espelho de NF</span>
            </label>
          </div>
        </div>

        <div className="fincom-modal__footer">
          <button className="fincom-btn fincom-btn--secondary" onClick={onClose}>Cancelar</button>
          <button className="fincom-btn fincom-btn--primary" onClick={salvar} disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}
