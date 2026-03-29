/**
 * PortalDashboard.tsx — Dashboard do portal do fornecedor
 * Metricas: pendentes, respondidas, aprovadas, taxa_resposta, rating
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { portalApi } from '../../shared/api.js'

interface PortalMetricas {
  pendentes: number
  respondidas: number
  aprovadas: number
  taxa_resposta: number
  rating: number
  total_cotacoes: number
  valor_total_aprovado: number
  moeda: string
}

export default function PortalDashboard() {
  const navigate = useNavigate()
  const [metricas, setMetricas] = useState<PortalMetricas | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    portalApi.dashboard()
      .then(res => setMetricas(res.metricas || res))
      .catch(err => setError(err.message || 'Erro ao carregar dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8">Carregando dashboard...</div>
  if (error) return <div className="p-8 text-red-600">{error}</div>

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Portal do Fornecedor</h1>

      {/* KPIs */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Cotacoes Pendentes</p>
          <p className="text-3xl font-bold text-yellow-600">{metricas?.pendentes ?? 0}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Respondidas</p>
          <p className="text-3xl font-bold text-blue-600">{metricas?.respondidas ?? 0}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Aprovadas</p>
          <p className="text-3xl font-bold text-green-600">{metricas?.aprovadas ?? 0}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Taxa de Resposta</p>
          <p className="text-3xl font-bold">{((metricas?.taxa_resposta ?? 0) * 100).toFixed(0)}%</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Rating</p>
          <p className="text-3xl font-bold text-yellow-500">{(metricas?.rating ?? 0).toFixed(1)}</p>
          <p className="text-xs text-gray-400">de 5.0</p>
        </div>
      </div>

      {/* Valor aprovado */}
      {metricas?.valor_total_aprovado != null && metricas.valor_total_aprovado > 0 && (
        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <p className="text-sm text-green-700">Valor total aprovado</p>
          <p className="text-2xl font-bold text-green-800">
            {metricas.moeda || 'USD'} {metricas.valor_total_aprovado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      )}

      {/* Acoes rapidas */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/portal/cotacoes-pendentes')}
          className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow text-left"
        >
          <h3 className="font-semibold text-lg">Cotacoes Pendentes</h3>
          <p className="text-sm text-gray-500 mt-1">Ver e responder cotacoes aguardando sua proposta</p>
          <p className="text-blue-600 text-sm mt-2">Ver cotacoes pendentes</p>
        </button>
        <button
          onClick={() => navigate('/portal/minhas-respostas')}
          className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow text-left"
        >
          <h3 className="font-semibold text-lg">Minhas Respostas</h3>
          <p className="text-sm text-gray-500 mt-1">Historico de propostas enviadas e seus status</p>
          <p className="text-blue-600 text-sm mt-2">Ver historico</p>
        </button>
        <button
          onClick={() => navigate('/portal/meu-desempenho')}
          className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow text-left"
        >
          <h3 className="font-semibold text-lg">Meu Desempenho</h3>
          <p className="text-sm text-gray-500 mt-1">Avaliacoes, metricas e ranking</p>
          <p className="text-blue-600 text-sm mt-2">Ver desempenho</p>
        </button>
      </div>
    </div>
  )
}
