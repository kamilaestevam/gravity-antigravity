/**
 * DetalheFornecedor.tsx — Detalhe do fornecedor
 * Info, tabela de precos, avaliacoes, rating global
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fornecedoresApi, avaliacoesApi } from '../shared/api.js'
import type { Fornecedor, TabelaPreco, RatingFornecedor } from '../shared/types.js'

export default function DetalheFornecedor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [fornecedor, setFornecedor] = useState<Fornecedor | null>(null)
  const [tabela, setTabela] = useState<TabelaPreco[]>([])
  const [rating, setRating] = useState<RatingFornecedor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'info' | 'tabela' | 'avaliacoes'>('info')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      fornecedoresApi.detalhe(id),
      fornecedoresApi.listarTabela(id),
      avaliacoesApi.ratingFornecedor(id).catch(() => null),
    ]).then(([fornRes, tabRes, ratingRes]) => {
      setFornecedor(fornRes.fornecedor || fornRes)
      setTabela(tabRes.tabela || tabRes || [])
      if (ratingRes) setRating(ratingRes.rating || ratingRes)
    }).catch(err => {
      setError(err.message || 'Erro ao carregar fornecedor')
    }).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="p-8">Carregando fornecedor...</div>
  if (error) return <div className="p-8 text-red-600">{error}</div>
  if (!fornecedor) return <div className="p-8 text-gray-500">Fornecedor nao encontrado</div>

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate('/fornecedores')} className="text-sm text-blue-600 hover:underline mb-1 block">
            Voltar para fornecedores
          </button>
          <h1 className="text-2xl font-bold">{fornecedor.nome}</h1>
          {fornecedor.nome_fantasia && (
            <p className="text-sm text-gray-500">{fornecedor.nome_fantasia}</p>
          )}
        </div>
        <span className={`px-3 py-1 rounded text-sm font-medium ${
          fornecedor.status === 'ATIVO' ? 'bg-green-100 text-green-700' :
          fornecedor.status === 'BLOQUEADO' ? 'bg-red-100 text-red-700' :
          'bg-gray-100 text-gray-600'
        }`}>
          {fornecedor.status}
        </span>
      </div>

      {/* Rating Summary */}
      {rating && (
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white rounded-lg border p-4 text-center">
            <p className="text-sm text-gray-500">Rating Global</p>
            <p className="text-3xl font-bold text-yellow-500">{rating.rating_global.toFixed(1)}</p>
            <p className="text-xs text-gray-400">{rating.total_avaliacoes} avaliacao(oes)</p>
          </div>
          <div className="bg-white rounded-lg border p-4 text-center">
            <p className="text-sm text-gray-500">Taxa de Resposta</p>
            <p className="text-2xl font-bold">{(rating.taxa_resposta * 100).toFixed(0)}%</p>
          </div>
          <div className="bg-white rounded-lg border p-4 text-center">
            <p className="text-sm text-gray-500">Taxa de Aprovacao</p>
            <p className="text-2xl font-bold">{(rating.taxa_aprovacao * 100).toFixed(0)}%</p>
          </div>
          <div className="bg-white rounded-lg border p-4 text-center">
            <p className="text-sm text-gray-500">Tempo Medio Resposta</p>
            <p className="text-2xl font-bold">{rating.tempo_medio_resposta_horas.toFixed(0)}h</p>
          </div>
          <div className="bg-white rounded-lg border p-4 text-center">
            <p className="text-sm text-gray-500">Cotacoes Recebidas</p>
            <p className="text-2xl font-bold">{rating.total_cotacoes_recebidas}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {([
          { key: 'info', label: 'Informacoes' },
          { key: 'tabela', label: `Tabela de Precos (${tabela.length})` },
          { key: 'avaliacoes', label: 'Avaliacoes' },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-sm border-b-2 -mb-px ${
              activeTab === t.key ? 'border-blue-600 text-blue-700 font-medium' : 'border-transparent text-gray-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Info */}
      {activeTab === 'info' && (
        <div className="bg-white rounded-lg border p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Tipo</p>
              <p className="font-medium">{fornecedor.tipo}</p>
            </div>
            <div>
              <p className="text-gray-500">CNPJ</p>
              <p className="font-medium">{fornecedor.cnpj || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">Email</p>
              <p className="font-medium">{fornecedor.email}</p>
            </div>
            <div>
              <p className="text-gray-500">Telefone</p>
              <p className="font-medium">{fornecedor.telefone || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">WhatsApp</p>
              <p className="font-medium">{fornecedor.whatsapp || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">Website</p>
              <p className="font-medium">{fornecedor.website || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">Pais / Cidade</p>
              <p className="font-medium">{[fornecedor.cidade, fornecedor.pais].filter(Boolean).join(', ') || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">Cadastrado em</p>
              <p className="font-medium">{new Date(fornecedor.created_at).toLocaleDateString('pt-BR')}</p>
            </div>
            <div>
              <p className="text-gray-500">Aceita Cotacao Aberta</p>
              <p className="font-medium">{fornecedor.aceita_cotacao_aberta ? 'Sim' : 'Nao'}</p>
            </div>
            <div>
              <p className="text-gray-500">Cotacao Automatica</p>
              <p className="font-medium">{fornecedor.cotacao_automatica ? 'Sim' : 'Nao'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Tabela de Precos */}
      {activeTab === 'tabela' && (
        <div className="bg-white rounded-lg border">
          {tabela.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Nenhuma tabela de preco cadastrada.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-3 text-left">Origem</th>
                    <th className="p-3 text-left">Destino</th>
                    <th className="p-3 text-left">Modal</th>
                    <th className="p-3 text-right">Frete</th>
                    <th className="p-3 text-right">Taxas Origem</th>
                    <th className="p-3 text-right">Taxas Destino</th>
                    <th className="p-3 text-right">Total</th>
                    <th className="p-3 text-center">Transit</th>
                    <th className="p-3 text-center">Validade</th>
                    <th className="p-3 text-center">Ativa</th>
                  </tr>
                </thead>
                <tbody>
                  {tabela.map(t => (
                    <tr key={t.id} className="border-b">
                      <td className="p-3">{t.origem_nome} ({t.origem_codigo})</td>
                      <td className="p-3">{t.destino_nome} ({t.destino_codigo})</td>
                      <td className="p-3">{t.modal} / {t.modalidade}</td>
                      <td className="p-3 text-right">{t.moeda} {t.valor_frete.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="p-3 text-right">{t.taxas_origem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="p-3 text-right">{t.taxas_destino.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Avaliacoes */}
      {activeTab === 'avaliacoes' && rating && (
        <div className="bg-white rounded-lg border p-4 space-y-4">
          <h3 className="text-lg font-semibold">Detalhamento de Rating</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Frete / Preco', value: rating.media_frete },
              { label: 'Atendimento', value: rating.media_atendimento },
              { label: 'Tempo de Resposta', value: rating.media_resposta },
              { label: 'Confiabilidade', value: rating.media_confiabilidade },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-40">{item.label}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 rounded-full h-2"
                    style={{ width: `${(item.value / 5) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-8 text-right">{item.value.toFixed(1)}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-gray-500 text-sm">Respondidas</p>
              <p className="text-xl font-bold">{rating.total_cotacoes_respondidas}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500 text-sm">Aprovadas</p>
              <p className="text-xl font-bold text-green-600">{rating.total_cotacoes_aprovadas}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500 text-sm">Total de Avaliacoes</p>
              <p className="text-xl font-bold">{rating.total_avaliacoes}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
