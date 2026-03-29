/**
 * MinhasRespostas.tsx — Historico de respostas do fornecedor
 * Mostra status (aprovada, reprovada, pendente)
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { portalApi } from '../../shared/api.js'
import type { BidResponse, Cotacao } from '../../shared/types.js'

interface RespostaHistorico {
  response: BidResponse
  cotacao: Pick<Cotacao, 'id' | 'numero' | 'origem_nome' | 'destino_nome' | 'modal' | 'modalidade'>
}

const STATUS_COR: Record<string, string> = {
  APROVADA: 'bg-green-100 text-green-700',
  REPROVADA: 'bg-red-100 text-red-700',
  PENDENTE: 'bg-yellow-100 text-yellow-700',
  ENVIADA: 'bg-blue-100 text-blue-700',
}

export default function MinhasRespostas() {
  const navigate = useNavigate()
  const [respostas, setRespostas] = useState<RespostaHistorico[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')

  useEffect(() => {
    carregarRespostas()
  }, [filtroStatus])

  async function carregarRespostas() {
    setLoading(true)
    setError('')
    try {
      const params: Record<string, any> = {}
      if (filtroStatus) params.status = filtroStatus
      const res = await portalApi.minhasRespostas(params)
      setRespostas(res.respostas || res || [])
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar respostas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Minhas Respostas</h1>
        <button onClick={() => navigate('/portal')} className="px-4 py-2 border rounded text-sm">
          Voltar ao Dashboard
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 border-b pb-2">
        {[
          { key: '', label: 'Todas' },
          { key: 'PENDENTE', label: 'Pendentes' },
          { key: 'APROVADA', label: 'Aprovadas' },
          { key: 'REPROVADA', label: 'Reprovadas' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFiltroStatus(f.key)}
            className={`px-3 py-1 text-sm rounded ${filtroStatus === f.key ? 'bg-blue-100 text-blue-700' : ''}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-sm">{error}</div>}

      {loading ? (
        <p className="text-gray-500">Carregando...</p>
      ) : respostas.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center text-gray-500">
          Nenhuma resposta encontrada.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm bg-white border rounded-lg">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-left">Cotacao</th>
                <th className="p-3 text-left">Rota</th>
                <th className="p-3 text-left">Modal</th>
                <th className="p-3 text-right">Valor Total</th>
                <th className="p-3 text-center">Transit Time</th>
                <th className="p-3 text-center">Validade</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {respostas.map(item => {
                const r = item.response
                const c = item.cotacao
                return (
                  <tr key={r.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-mono text-xs">{c.numero}</td>
                    <td className="p-3">{c.origem_nome} → {c.destino_nome}</td>
                    <td className="p-3">{c.modal} / {c.modalidade}</td>
                    <td className="p-3 text-right font-semibold">
                      {r.moeda} {r.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-center">{r.transit_time_dias} dias</td>
                    <td className="p-3 text-center text-xs">
                      {new Date(r.validade_cotacao).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs ${STATUS_COR[r.status] || 'bg-gray-100 text-gray-600'}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
