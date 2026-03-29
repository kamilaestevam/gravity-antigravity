/**
 * Comparativo.tsx — Tabela comparativa de respostas de uma cotacao
 * Ranking por preco, transit time e avaliacao. Botoes de aprovar e reprovar.
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { comparativoApi, cotacoesApi } from '../shared/api.js'
import type { Cotacao, BidResponse } from '../shared/types.js'

interface RankingItem extends BidResponse {
  score_preco?: number
  score_transit?: number
  score_avaliacao?: number
  score_total?: number
}

export default function Comparativo() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [cotacao, setCotacao] = useState<Cotacao | null>(null)
  const [ranking, setRanking] = useState<RankingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [motivoReprovar, setMotivoReprovar] = useState('')
  const [showReprovar, setShowReprovar] = useState(false)
  const [sortBy, setSortBy] = useState<'preco' | 'transit' | 'avaliacao' | 'total'>('total')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      comparativoApi.ranking(id),
      cotacoesApi.detalhe(id),
    ]).then(([rankRes, cotRes]) => {
      setRanking(rankRes.ranking || rankRes || [])
      setCotacao(cotRes.cotacao || cotRes)
    }).catch(err => {
      setError(err.message || 'Erro ao carregar comparativo')
    }).finally(() => setLoading(false))
  }, [id])

  const sorted = [...ranking].sort((a, b) => {
    if (sortBy === 'preco') return (a.valor_total ?? 0) - (b.valor_total ?? 0)
    if (sortBy === 'transit') return (a.transit_time_dias ?? 0) - (b.transit_time_dias ?? 0)
    if (sortBy === 'avaliacao') return (b.ranking_avaliacao ?? 0) - (a.ranking_avaliacao ?? 0)
    return (a.score_total ?? a.valor_total ?? 0) - (b.score_total ?? b.valor_total ?? 0)
  })

  async function aprovar(responseId: string) {
    if (!id) return
    setActionLoading(responseId)
    try {
      await comparativoApi.aprovar(id, responseId)
      const res = await cotacoesApi.detalhe(id)
      setCotacao(res.cotacao || res)
      navigate(`/cotacoes/${id}`)
    } catch (err: any) {
      setError(err.message || 'Erro ao aprovar')
    } finally {
      setActionLoading(null)
    }
  }

  async function reprovar() {
    if (!id) return
    setActionLoading('reprovar')
    try {
      await comparativoApi.reprovar(id, motivoReprovar || undefined)
      navigate(`/cotacoes/${id}`)
    } catch (err: any) {
      setError(err.message || 'Erro ao reprovar')
    } finally {
      setActionLoading(null)
      setShowReprovar(false)
    }
  }

  if (loading) return <div className="p-8">Carregando comparativo...</div>
  if (error && !ranking.length) return <div className="p-8 text-red-600">{error}</div>

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate(id ? `/cotacoes/${id}` : '/cotacoes')} className="text-sm text-blue-600 hover:underline mb-1 block">
            Voltar para cotacao
          </button>
          <h1 className="text-2xl font-bold">Comparativo de Propostas</h1>
          {cotacao && (
            <p className="text-sm text-gray-500">
              {cotacao.numero} | {cotacao.origem_nome} → {cotacao.destino_nome} | {cotacao.modal}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowReprovar(true)}
            className="px-4 py-2 border border-red-300 text-red-600 rounded text-sm hover:bg-red-50"
          >
            Reprovar Todas
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-sm">{error}</div>}

      {/* Sort controls */}
      <div className="flex gap-2 items-center">
        <span className="text-sm text-gray-500">Ordenar por:</span>
        {([
          { key: 'total', label: 'Score Total' },
          { key: 'preco', label: 'Menor Preco' },
          { key: 'transit', label: 'Menor Transit Time' },
          { key: 'avaliacao', label: 'Melhor Avaliacao' },
        ] as const).map(s => (
          <button
            key={s.key}
            onClick={() => setSortBy(s.key)}
            className={`px-3 py-1 text-sm rounded ${sortBy === s.key ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Ranking table */}
      {sorted.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center text-gray-500">
          Nenhuma resposta recebida para comparar.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm bg-white border rounded-lg">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Fornecedor</th>
                <th className="p-3 text-right">Frete</th>
                <th className="p-3 text-right">Taxas Origem</th>
                <th className="p-3 text-right">Taxas Destino</th>
                <th className="p-3 text-right">Total</th>
                <th className="p-3 text-center">Transit Time</th>
                <th className="p-3 text-center">Free Time</th>
                <th className="p-3 text-center">Transbordos</th>
                <th className="p-3 text-center">Rating</th>
                <th className="p-3 text-center">Validade</th>
                <th className="p-3 text-center">Acao</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, idx) => {
                const isBest = idx === 0
                return (
                  <tr key={r.id} className={`border-b hover:bg-gray-50 ${isBest ? 'bg-green-50' : ''}`}>
                    <td className="p-3">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        isBest ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>{idx + 1}</span>
                    </td>
                    <td className="p-3">
                      <p className="font-medium">{r.fornecedor?.nome || r.fornecedor_id}</p>
                      <p className="text-xs text-gray-400">{r.fornecedor?.tipo}</p>
                    </td>
                    <td className="p-3 text-right">{r.moeda} {r.valor_frete.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="p-3 text-right">{r.taxas_origem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="p-3 text-right">{r.taxas_destino.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="p-3 text-right font-semibold">
                      {r.moeda} {r.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-center">{r.transit_time_dias} dias</td>
                    <td className="p-3 text-center">{r.free_time_dias ?? '-'} dias</td>
                    <td className="p-3 text-center">{r.transbordos}</td>
                    <td className="p-3 text-center">
                      {r.ranking_avaliacao != null ? (
                        <span className="text-yellow-600 font-medium">{r.ranking_avaliacao.toFixed(1)}</span>
                      ) : '-'}
                    </td>
                    <td className="p-3 text-center text-xs">
                      {new Date(r.validade_cotacao).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => aprovar(r.id)}
                        disabled={actionLoading !== null}
                        className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
                      >
                        {actionLoading === r.id ? '...' : 'Aprovar'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Cost breakdown details */}
      {sorted.length > 0 && sorted[0].detalhes_taxas && sorted[0].detalhes_taxas.length > 0 && (
        <div className="bg-white rounded-lg border p-4">
          <h2 className="text-lg font-semibold mb-3">Detalhamento de Taxas - Melhor Proposta</h2>
          <div className="grid grid-cols-3 gap-4">
            {['frete', 'origem', 'destino'].map(tipo => {
              const taxas = sorted[0].detalhes_taxas!.filter(t => t.tipo === tipo)
              return (
                <div key={tipo} className="space-y-1">
                  <h3 className="text-sm font-medium capitalize">{tipo === 'frete' ? 'Frete' : tipo === 'origem' ? 'Taxas Origem' : 'Taxas Destino'}</h3>
                  {taxas.length === 0 ? (
                    <p className="text-xs text-gray-400">Sem detalhamento</p>
                  ) : (
                    taxas.map(t => (
                      <div key={t.id} className="flex justify-between text-xs">
                        <span>{t.nome}</span>
                        <span>{t.moeda} {t.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    ))
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Modal Reprovar */}
      {showReprovar && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold mb-3">Reprovar Cotacao</h3>
            <textarea
              value={motivoReprovar}
              onChange={e => setMotivoReprovar(e.target.value)}
              placeholder="Motivo da reprovacao (opcional)"
              className="w-full border rounded p-2 text-sm h-24"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowReprovar(false)} className="px-4 py-2 border rounded text-sm">
                Cancelar
              </button>
              <button
                onClick={reprovar}
                disabled={actionLoading !== null}
                className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading === 'reprovar' ? 'Reprovando...' : 'Confirmar Reprovacao'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
