/**
 * Cotacoes.tsx — Lista/Kanban de Cotacoes
 * Baseado nos prints "bid frete modelo 1.png" e "bid frete modelo 4.png"
 * Visao em lista com filtros + alternancia para Kanban
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { cotacoesApi } from '../shared/api.js'
import type { Cotacao, StatusCotacao } from '../shared/types.js'

const STATUS_LABELS: Record<string, { label: string; cor: string }> = {
  RASCUNHO: { label: 'Rascunho', cor: 'bg-gray-100 text-gray-700' },
  ENVIADA_FORNECEDORES: { label: 'Enviada ao fornecedor', cor: 'bg-blue-100 text-blue-700' },
  EM_COTACAO: { label: 'Em cotacao', cor: 'bg-indigo-100 text-indigo-700' },
  AGUARDANDO_APROVACAO: { label: 'Aprovacao pendente', cor: 'bg-yellow-100 text-yellow-700' },
  APROVADA: { label: 'Aprovada', cor: 'bg-green-100 text-green-700' },
  REPROVADA: { label: 'Reprovada', cor: 'bg-red-100 text-red-700' },
  CANCELADA: { label: 'Cancelada', cor: 'bg-gray-100 text-gray-500' },
  FALTA_INFORMACAO: { label: 'Falta de informacao', cor: 'bg-orange-100 text-orange-700' },
  EXPIRADA: { label: 'Expirada', cor: 'bg-gray-100 text-gray-500' },
}

const KANBAN_COLUNAS: StatusCotacao[] = [
  'ENVIADA_FORNECEDORES', 'AGUARDANDO_APROVACAO', 'FALTA_INFORMACAO',
  'EM_COTACAO', 'APROVADA', 'REPROVADA',
]

export default function Cotacoes() {
  const navigate = useNavigate()
  const [cotacoes, setCotacoes] = useState<Cotacao[]>([])
  const [loading, setLoading] = useState(true)
  const [visao, setVisao] = useState<'lista' | 'kanban'>('lista')
  const [filtroStatus, setFiltroStatus] = useState<string>('')
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 })

  useEffect(() => {
    carregarCotacoes()
  }, [filtroStatus])

  async function carregarCotacoes() {
    setLoading(true)
    try {
      const params: any = { page: pagination.page, limit: 20 }
      if (filtroStatus) params.status = filtroStatus
      const res = await cotacoesApi.listar(params)
      setCotacoes(res.cotacoes)
      setPagination(res.pagination)
    } finally {
      setLoading(false)
    }
  }

  // --- Visao Lista ---
  const ListaView = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="p-3 text-left">Numero</th>
            <th className="p-3 text-left">Referencia</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Data</th>
            <th className="p-3 text-left">Origem</th>
            <th className="p-3 text-left">Destino</th>
            <th className="p-3 text-left">Modal</th>
            <th className="p-3 text-left">Modalidade</th>
            <th className="p-3 text-left">Peso (Kg)</th>
          </tr>
        </thead>
        <tbody>
          {cotacoes.map(c => (
            <tr
              key={c.id}
              className="border-b hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate(`/cotacoes/${c.id}`)}
            >
              <td className="p-3 font-mono text-xs">{c.numero}</td>
              <td className="p-3">{c.referencia_interna ?? '-'}</td>
              <td className="p-3">
                <span className={`px-2 py-0.5 rounded text-xs ${STATUS_LABELS[c.status]?.cor}`}>
                  {STATUS_LABELS[c.status]?.label}
                </span>
              </td>
              <td className="p-3 text-xs">{new Date(c.created_at).toLocaleDateString('pt-BR')}</td>
              <td className="p-3">{c.origem_nome}</td>
              <td className="p-3">{c.destino_nome}</td>
              <td className="p-3">{c.modal}</td>
              <td className="p-3">{c.modalidade}</td>
              <td className="p-3">{c.peso_kg?.toLocaleString() ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  // --- Visao Kanban ---
  const KanbanView = () => (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {KANBAN_COLUNAS.map(status => {
        const cards = cotacoes.filter(c => c.status === status)
        return (
          <div key={status} className="min-w-[280px] flex-shrink-0">
            <div className={`p-2 rounded-t font-medium text-sm ${STATUS_LABELS[status]?.cor}`}>
              {STATUS_LABELS[status]?.label} ({cards.length})
            </div>
            <div className="bg-gray-50 rounded-b p-2 space-y-2 min-h-[200px]">
              {cards.map(c => (
                <div
                  key={c.id}
                  className="bg-white rounded p-3 shadow-sm border cursor-pointer hover:shadow"
                  onClick={() => navigate(`/cotacoes/${c.id}`)}
                >
                  <p className="font-mono text-xs text-gray-500">{c.numero}</p>
                  <p className="text-sm font-medium">{c.origem_nome} → {c.destino_nome}</p>
                  <p className="text-xs text-gray-500">{c.modal} | {c.modalidade}</p>
                  {c.bid_responses && c.bid_responses.length > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      {c.bid_responses.length} resposta(s)
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cotacoes em andamento</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setVisao('lista')}
            className={`px-3 py-1.5 rounded text-sm ${visao === 'lista' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >Lista</button>
          <button
            onClick={() => setVisao('kanban')}
            className={`px-3 py-1.5 rounded text-sm ${visao === 'kanban' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >Kanban</button>
          <button
            onClick={() => navigate('/cotacoes/nova')}
            className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >Buscar frete</button>
        </div>
      </div>

      {/* Filtros por aba */}
      <div className="flex gap-2 border-b pb-2">
        <button onClick={() => setFiltroStatus('')} className={`px-3 py-1 text-sm rounded ${!filtroStatus ? 'bg-blue-100 text-blue-700' : ''}`}>
          Todas as cotacoes ({pagination.total})
        </button>
        <button onClick={() => setFiltroStatus('AGUARDANDO_APROVACAO')} className={`px-3 py-1 text-sm rounded ${filtroStatus === 'AGUARDANDO_APROVACAO' ? 'bg-yellow-100 text-yellow-700' : ''}`}>
          Aprovacao pendente
        </button>
        <button onClick={() => setFiltroStatus('FALTA_INFORMACAO')} className={`px-3 py-1 text-sm rounded ${filtroStatus === 'FALTA_INFORMACAO' ? 'bg-orange-100 text-orange-700' : ''}`}>
          Falta de informacao
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Carregando...</p>
      ) : visao === 'lista' ? (
        <ListaView />
      ) : (
        <KanbanView />
      )}
    </div>
  )
}
