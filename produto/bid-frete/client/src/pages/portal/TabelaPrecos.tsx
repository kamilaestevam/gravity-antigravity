/**
 * TabelaPrecos.tsx — Gestao da tabela de precos do fornecedor
 * CRUD de rotas com precos
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fornecedoresApi } from '../../shared/api.js'
import type { TabelaPreco, ModalFrete, ModalidadeCarga } from '../../shared/types.js'

interface FormData {
  origem_codigo: string
  origem_nome: string
  destino_codigo: string
  destino_nome: string
  modal: ModalFrete
  modalidade: ModalidadeCarga
  moeda: string
  valor_frete: number
  taxas_origem: number
  taxas_destino: number
  transit_time_dias: number
  free_time_dias: number | undefined
  validade_inicio: string
  validade_fim: string
}

const EMPTY_FORM: FormData = {
  origem_codigo: '', origem_nome: '',
  destino_codigo: '', destino_nome: '',
  modal: 'MARITIMO', modalidade: 'FCL',
  moeda: 'USD', valor_frete: 0, taxas_origem: 0, taxas_destino: 0,
  transit_time_dias: 0, free_time_dias: undefined,
  validade_inicio: '', validade_fim: '',
}

export default function TabelaPrecos() {
  const navigate = useNavigate()
  const [tabela, setTabela] = useState<TabelaPreco[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [fornecedorId, setFornecedorId] = useState<string>('')

  useEffect(() => {
    // Get fornecedor ID from portal context (stored in session)
    fetch('/api/v1/bid-frete/portal/me')
      .then(r => r.json())
      .then(data => {
        const fid = data.fornecedor_id || data.id
        setFornecedorId(fid)
        return fornecedoresApi.listarTabela(fid)
      })
      .then(res => setTabela(res.tabela || res || []))
      .catch(err => setError(err.message || 'Erro ao carregar tabela'))
      .finally(() => setLoading(false))
  }, [])

  const update = (fields: Partial<FormData>) => setForm(prev => ({ ...prev, ...fields }))

  function openNew() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(true)
  }

  function openEdit(item: TabelaPreco) {
    setForm({
      origem_codigo: item.origem_codigo,
      origem_nome: item.origem_nome,
      destino_codigo: item.destino_codigo,
      destino_nome: item.destino_nome,
      modal: item.modal,
      modalidade: item.modalidade,
      moeda: item.moeda,
      valor_frete: item.valor_frete,
      taxas_origem: item.taxas_origem,
      taxas_destino: item.taxas_destino,
      transit_time_dias: item.transit_time_dias,
      free_time_dias: item.free_time_dias,
      validade_inicio: item.validade_inicio.slice(0, 10),
      validade_fim: item.validade_fim.slice(0, 10),
    })
    setEditingId(item.id)
    setShowForm(true)
  }

  async function salvar() {
    if (!fornecedorId) return
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        valor_total: form.valor_frete + form.taxas_origem + form.taxas_destino,
      }
      if (editingId) {
        await fornecedoresApi.atualizarTabela(fornecedorId, editingId, payload)
      } else {
        await fornecedoresApi.adicionarTabela(fornecedorId, payload)
      }
      const res = await fornecedoresApi.listarTabela(fornecedorId)
      setTabela(res.tabela || res || [])
      setShowForm(false)
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  async function excluir(tpId: string) {
    if (!fornecedorId || !confirm('Excluir esta rota?')) return
    try {
      await fornecedoresApi.excluirTabela(fornecedorId, tpId)
      setTabela(prev => prev.filter(t => t.id !== tpId))
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir')
    }
  }

  if (loading) return <div className="p-8">Carregando tabela de precos...</div>

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tabela de Precos</h1>
        <div className="flex gap-2">
          <button onClick={() => navigate('/portal')} className="px-4 py-2 border rounded text-sm">
            Voltar
          </button>
          <button onClick={openNew} className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
            Nova Rota
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-sm">{error}</div>}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg border p-4 space-y-4">
          <h3 className="font-semibold">{editingId ? 'Editar Rota' : 'Nova Rota'}</h3>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Origem Codigo</label>
              <input value={form.origem_codigo} onChange={e => update({ origem_codigo: e.target.value })} className="w-full border rounded p-1.5 text-sm" placeholder="CNSHA" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Origem Nome</label>
              <input value={form.origem_nome} onChange={e => update({ origem_nome: e.target.value })} className="w-full border rounded p-1.5 text-sm" placeholder="Shanghai" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Destino Codigo</label>
              <input value={form.destino_codigo} onChange={e => update({ destino_codigo: e.target.value })} className="w-full border rounded p-1.5 text-sm" placeholder="BRSSZ" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Destino Nome</label>
              <input value={form.destino_nome} onChange={e => update({ destino_nome: e.target.value })} className="w-full border rounded p-1.5 text-sm" placeholder="Santos" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Modal</label>
              <select value={form.modal} onChange={e => update({ modal: e.target.value as ModalFrete })} className="w-full border rounded p-1.5 text-sm">
                <option value="MARITIMO">Maritimo</option>
                <option value="AEREO">Aereo</option>
                <option value="RODOVIARIO">Rodoviario</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Modalidade</label>
              <select value={form.modalidade} onChange={e => update({ modalidade: e.target.value as ModalidadeCarga })} className="w-full border rounded p-1.5 text-sm">
                <option value="FCL">FCL</option>
                <option value="LCL">LCL</option>
                <option value="AEREO_GERAL">Aereo Geral</option>
                <option value="RODOVIARIO_FTL">Rodoviario FTL</option>
                <option value="RODOVIARIO_LTL">Rodoviario LTL</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Moeda</label>
              <select value={form.moeda} onChange={e => update({ moeda: e.target.value })} className="w-full border rounded p-1.5 text-sm">
                <option value="USD">USD</option>
                <option value="BRL">BRL</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Transit Time (dias)</label>
              <input type="number" value={form.transit_time_dias} onChange={e => update({ transit_time_dias: Number(e.target.value) })} className="w-full border rounded p-1.5 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-5 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Valor Frete</label>
              <input type="number" step="0.01" value={form.valor_frete} onChange={e => update({ valor_frete: Number(e.target.value) })} className="w-full border rounded p-1.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Taxas Origem</label>
              <input type="number" step="0.01" value={form.taxas_origem} onChange={e => update({ taxas_origem: Number(e.target.value) })} className="w-full border rounded p-1.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Taxas Destino</label>
              <input type="number" step="0.01" value={form.taxas_destino} onChange={e => update({ taxas_destino: Number(e.target.value) })} className="w-full border rounded p-1.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Free Time (dias)</label>
              <input type="number" value={form.free_time_dias ?? ''} onChange={e => update({ free_time_dias: e.target.value ? Number(e.target.value) : undefined })} className="w-full border rounded p-1.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Total</label>
              <p className="p-1.5 text-sm font-semibold">
                {form.moeda} {(form.valor_frete + form.taxas_origem + form.taxas_destino).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Validade Inicio</label>
              <input type="date" value={form.validade_inicio} onChange={e => update({ validade_inicio: e.target.value })} className="w-full border rounded p-1.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Validade Fim</label>
              <input type="date" value={form.validade_fim} onChange={e => update({ validade_fim: e.target.value })} className="w-full border rounded p-1.5 text-sm" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border rounded text-sm">Cancelar</button>
            <button onClick={salvar} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {tabela.length === 0 && !showForm ? (
        <div className="bg-white rounded-lg border p-8 text-center text-gray-500">
          Nenhuma rota cadastrada. Clique em "Nova Rota" para adicionar.
        </div>
      ) : tabela.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm bg-white border rounded-lg">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-left">Origem</th>
                <th className="p-3 text-left">Destino</th>
                <th className="p-3 text-left">Modal</th>
                <th className="p-3 text-right">Frete</th>
                <th className="p-3 text-right">Total</th>
                <th className="p-3 text-center">Transit</th>
                <th className="p-3 text-center">Validade</th>
                <th className="p-3 text-center">Ativa</th>
                <th className="p-3 text-center">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {tabela.map(t => (
                <tr key={t.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{t.origem_nome} ({t.origem_codigo})</td>
                  <td className="p-3">{t.destino_nome} ({t.destino_codigo})</td>
                  <td className="p-3">{t.modal} / {t.modalidade}</td>
                  <td className="p-3 text-right">{t.moeda} {t.valor_frete.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="p-3 text-right font-semibold">{t.moeda} {t.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="p-3 text-center">{t.transit_time_dias}d</td>
                  <td className="p-3 text-center text-xs">
                    {new Date(t.validade_inicio).toLocaleDateString('pt-BR')} - {new Date(t.validade_fim).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-xs ${t.ativa ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {t.ativa ? 'Sim' : 'Nao'}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex gap-1 justify-center">
                      <button onClick={() => openEdit(t)} className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded">
                        Editar
                      </button>
                      <button onClick={() => excluir(t.id)} className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded">
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
