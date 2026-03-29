/**
 * Fornecedores.tsx — Lista de fornecedores com busca, filtro por tipo
 * Nome, tipo, email, rating, stats. Botao para adicionar novo.
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fornecedoresApi } from '../shared/api.js'
import type { Fornecedor, TipoFornecedor } from '../shared/types.js'

const TIPO_LABELS: Record<TipoFornecedor, string> = {
  AGENTE_CARGA: 'Agente de Carga',
  ARMADOR: 'Armador',
  CIA_AEREA: 'Cia Aerea',
  TRANSPORTADORA: 'Transportadora',
}

const STATUS_COR: Record<string, string> = {
  ATIVO: 'bg-green-100 text-green-700',
  INATIVO: 'bg-gray-100 text-gray-500',
  PENDENTE_APROVACAO: 'bg-yellow-100 text-yellow-700',
  BLOQUEADO: 'bg-red-100 text-red-700',
}

export default function Fornecedores() {
  const navigate = useNavigate()
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busca, setBusca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<string>('')
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 })

  useEffect(() => {
    carregarFornecedores()
  }, [filtroTipo])

  async function carregarFornecedores() {
    setLoading(true)
    setError('')
    try {
      const params: Record<string, any> = { page: pagination.page, limit: 20 }
      if (filtroTipo) params.tipo = filtroTipo
      if (busca) params.busca = busca
      const res = await fornecedoresApi.listar(params)
      setFornecedores(res.fornecedores || res || [])
      if (res.pagination) setPagination(res.pagination)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar fornecedores')
    } finally {
      setLoading(false)
    }
  }

  function handleBusca(e: React.FormEvent) {
    e.preventDefault()
    carregarFornecedores()
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Fornecedores</h1>
        <button
          onClick={() => navigate('/fornecedores/novo')}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          Novo Fornecedor
        </button>
      </div>

      {/* Busca e Filtros */}
      <div className="flex gap-3 items-center">
        <form onSubmit={handleBusca} className="flex gap-2 flex-1">
          <input
            type="text"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome, email..."
            className="flex-1 border rounded p-2 text-sm"
          />
          <button type="submit" className="px-4 py-2 bg-gray-100 rounded text-sm hover:bg-gray-200">
            Buscar
          </button>
        </form>
        <select
          value={filtroTipo}
          onChange={e => setFiltroTipo(e.target.value)}
          className="border rounded p-2 text-sm"
        >
          <option value="">Todos os tipos</option>
          {(Object.keys(TIPO_LABELS) as TipoFornecedor[]).map(t => (
            <option key={t} value={t}>{TIPO_LABELS[t]}</option>
          ))}
        </select>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-sm">{error}</div>}

      {loading ? (
        <p className="text-gray-500">Carregando...</p>
      ) : fornecedores.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center text-gray-500">
          Nenhum fornecedor encontrado.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm bg-white border rounded-lg">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-left">Nome</th>
                <th className="p-3 text-left">Tipo</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Telefone</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Cotacoes</th>
                <th className="p-3 text-center">Respostas</th>
                <th className="p-3 text-center">Avaliacoes</th>
              </tr>
            </thead>
            <tbody>
              {fornecedores.map(f => (
                <tr
                  key={f.id}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/fornecedores/${f.id}`)}
                >
                  <td className="p-3">
                    <p className="font-medium">{f.nome}</p>
                    {f.nome_fantasia && <p className="text-xs text-gray-400">{f.nome_fantasia}</p>}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                      {TIPO_LABELS[f.tipo] || f.tipo}
                    </span>
                  </td>
                  <td className="p-3">{f.email}</td>
                  <td className="p-3">{f.telefone || '-'}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-xs ${STATUS_COR[f.status] || 'bg-gray-100'}`}>
                      {f.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">{f._count?.bid_requests ?? '-'}</td>
                  <td className="p-3 text-center">{f._count?.bid_responses ?? '-'}</td>
                  <td className="p-3 text-center">{f._count?.avaliacoes ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginacao */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => { setPagination(prev => ({ ...prev, page: p })); carregarFornecedores() }}
              className={`px-3 py-1 rounded text-sm ${p === pagination.page ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
