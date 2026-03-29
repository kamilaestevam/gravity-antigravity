/**
 * MeuDesempenho.tsx — Pagina de desempenho do fornecedor no portal
 * Rating, metricas, avaliacoes recentes
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { portalApi } from '../../shared/api.js'
import type { RatingFornecedor } from '../../shared/types.js'

interface Avaliacao {
  id: string
  cotacao_numero: string
  nota_frete: number
  nota_atendimento: number
  nota_resposta: number
  nota_confiabilidade: number
  comentario?: string
  created_at: string
}

interface DesempenhoData {
  rating: RatingFornecedor
  avaliacoes_recentes: Avaliacao[]
}

export default function MeuDesempenho() {
  const navigate = useNavigate()
  const [data, setData] = useState<DesempenhoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    portalApi.meuDesempenho()
      .then(res => setData(res))
      .catch(err => setError(err.message || 'Erro ao carregar desempenho'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8">Carregando desempenho...</div>
  if (error) return <div className="p-8 text-red-600">{error}</div>
  if (!data) return <div className="p-8 text-gray-500">Dados de desempenho nao disponiveis</div>

  const { rating, avaliacoes_recentes } = data

  function renderStars(value: number) {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <span key={i} className={`text-lg ${i <= Math.round(value) ? 'text-yellow-400' : 'text-gray-300'}`}>
            *
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Meu Desempenho</h1>
        <button onClick={() => navigate('/portal')} className="px-4 py-2 border rounded text-sm">
          Voltar ao Dashboard
        </button>
      </div>

      {/* Rating Global */}
      <div className="bg-white rounded-lg border p-6 text-center">
        <p className="text-sm text-gray-500 mb-2">Rating Global</p>
        <p className="text-5xl font-bold text-yellow-500">{rating.rating_global.toFixed(1)}</p>
        <p className="text-sm text-gray-400 mt-1">{rating.total_avaliacoes} avaliacao(oes)</p>
      </div>

      {/* Metricas detalhadas */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Cotacoes Recebidas</p>
          <p className="text-2xl font-bold">{rating.total_cotacoes_recebidas}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Respondidas</p>
          <p className="text-2xl font-bold">{rating.total_cotacoes_respondidas}</p>
          <p className="text-xs text-gray-400">Taxa: {(rating.taxa_resposta * 100).toFixed(0)}%</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Aprovadas</p>
          <p className="text-2xl font-bold text-green-600">{rating.total_cotacoes_aprovadas}</p>
          <p className="text-xs text-gray-400">Taxa: {(rating.taxa_aprovacao * 100).toFixed(0)}%</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Tempo Medio Resposta</p>
          <p className="text-2xl font-bold">{rating.tempo_medio_resposta_horas.toFixed(0)}h</p>
        </div>
      </div>

      {/* Rating por categoria */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Avaliacao por Categoria</h2>
        <div className="space-y-4">
          {[
            { label: 'Frete / Preco', value: rating.media_frete },
            { label: 'Atendimento', value: rating.media_atendimento },
            { label: 'Tempo de Resposta', value: rating.media_resposta },
            { label: 'Confiabilidade', value: rating.media_confiabilidade },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-4">
              <span className="text-sm text-gray-600 w-44">{item.label}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div
                  className="bg-yellow-400 rounded-full h-3 transition-all"
                  style={{ width: `${(item.value / 5) * 100}%` }}
                />
              </div>
              <span className="text-sm font-bold w-10 text-right">{item.value.toFixed(1)}</span>
              {renderStars(item.value)}
            </div>
          ))}
        </div>
      </div>

      {/* Avaliacoes recentes */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Avaliacoes Recentes</h2>
        {avaliacoes_recentes.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhuma avaliacao recebida.</p>
        ) : (
          <div className="space-y-4">
            {avaliacoes_recentes.map(av => (
              <div key={av.id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-gray-400">Cotacao: {av.cotacao_numero}</span>
                  <span className="text-xs text-gray-400">{new Date(av.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs mb-2">
                  <div>
                    <span className="text-gray-500">Frete: </span>
                    <span className="font-medium">{av.nota_frete.toFixed(1)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Atendimento: </span>
                    <span className="font-medium">{av.nota_atendimento.toFixed(1)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Resposta: </span>
                    <span className="font-medium">{av.nota_resposta.toFixed(1)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Confiabilidade: </span>
                    <span className="font-medium">{av.nota_confiabilidade.toFixed(1)}</span>
                  </div>
                </div>
                {av.comentario && (
                  <p className="text-sm text-gray-600 italic">"{av.comentario}"</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
