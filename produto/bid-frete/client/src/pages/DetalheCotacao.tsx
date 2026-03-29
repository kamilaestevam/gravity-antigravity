/**
 * DetalheCotacao.tsx — Detalhe de uma cotacao
 * Dados completos, BidRequests enviados, BidResponses recebidos, timeline de status
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { cotacoesApi, bidsApi } from '../shared/api.js'
import type { Cotacao, BidRequest, BidResponse, StatusCotacao } from '../shared/types.js'

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

const BID_STATUS_LABELS: Record<string, { label: string; cor: string }> = {
  PENDENTE: { label: 'Pendente', cor: 'bg-gray-100 text-gray-600' },
  ENVIADO: { label: 'Enviado', cor: 'bg-blue-100 text-blue-700' },
  VISUALIZADO: { label: 'Visualizado', cor: 'bg-indigo-100 text-indigo-700' },
  RESPONDIDO: { label: 'Respondido', cor: 'bg-green-100 text-green-700' },
  EXPIRADO: { label: 'Expirado', cor: 'bg-gray-100 text-gray-500' },
  ERRO_ENVIO: { label: 'Erro no envio', cor: 'bg-red-100 text-red-700' },
}

const TIMELINE_ORDER: StatusCotacao[] = [
  'RASCUNHO', 'ENVIADA_FORNECEDORES', 'EM_COTACAO', 'AGUARDANDO_APROVACAO', 'APROVADA',
]

export default function DetalheCotacao() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [cotacao, setCotacao] = useState<Cotacao | null>(null)
  const [bids, setBids] = useState<BidRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      cotacoesApi.detalhe(id),
      bidsApi.listarPorCotacao(id),
    ]).then(([cotRes, bidsRes]) => {
      setCotacao(cotRes.cotacao || cotRes)
      setBids(bidsRes.bid_requests || bidsRes || [])
    }).catch(err => {
      setError(err.message || 'Erro ao carregar cotacao')
    }).finally(() => setLoading(false))
  }, [id])

  async function mudarStatus(status: string) {
    if (!id) return
    setActionLoading(true)
    try {
      await cotacoesApi.mudarStatus(id, { status })
      const res = await cotacoesApi.detalhe(id)
      setCotacao(res.cotacao || res)
    } catch (err: any) {
      setError(err.message || 'Erro ao alterar status')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return <div className="p-8">Carregando cotacao...</div>
  if (error) return <div className="p-8 text-red-600">{error}</div>
  if (!cotacao) return <div className="p-8 text-gray-500">Cotacao nao encontrada</div>

  const responses: BidResponse[] = cotacao.bid_responses || bids.filter(b => b.response).map(b => b.response!)
  const currentStatusIdx = TIMELINE_ORDER.indexOf(cotacao.status)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate('/cotacoes')} className="text-sm text-blue-600 hover:underline mb-1 block">
            Voltar para cotacoes
          </button>
          <h1 className="text-2xl font-bold">Cotacao {cotacao.numero}</h1>
          {cotacao.referencia_interna && (
            <p className="text-sm text-gray-500">Ref: {cotacao.referencia_interna}</p>
          )}
        </div>
        <div className="flex gap-2">
          <span className={`px-3 py-1 rounded text-sm font-medium ${STATUS_LABELS[cotacao.status]?.cor || 'bg-gray-100'}`}>
            {STATUS_LABELS[cotacao.status]?.label || cotacao.status}
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg border p-4">
        <h2 className="text-sm font-semibold mb-3">Timeline</h2>
        <div className="flex items-center gap-1">
          {TIMELINE_ORDER.map((s, i) => {
            const isActive = i <= currentStatusIdx
            const isCurrent = s === cotacao.status
            return (
              <div key={s} className="flex items-center flex-1">
                <div className={`flex-1 h-2 rounded ${isActive ? 'bg-blue-500' : 'bg-gray-200'}`} />
                {isCurrent && (
                  <span className="text-xs font-medium ml-1 whitespace-nowrap">
                    {STATUS_LABELS[s]?.label}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Dados da Cotacao */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-4 space-y-3">
          <h2 className="text-lg font-semibold">Dados da Cotacao</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500">Tipo de Operacao</p>
              <p className="font-medium">{cotacao.tipo_operacao}</p>
            </div>
            <div>
              <p className="text-gray-500">Modal</p>
              <p className="font-medium">{cotacao.modal} / {cotacao.modalidade}</p>
            </div>
            <div>
              <p className="text-gray-500">Origem</p>
              <p className="font-medium">{cotacao.origem_nome} ({cotacao.origem_codigo})</p>
              <p className="text-xs text-gray-400">{cotacao.origem_pais}</p>
            </div>
            <div>
              <p className="text-gray-500">Destino</p>
              <p className="font-medium">{cotacao.destino_nome} ({cotacao.destino_codigo})</p>
              <p className="text-xs text-gray-400">{cotacao.destino_pais}</p>
            </div>
            <div>
              <p className="text-gray-500">Mercadoria</p>
              <p className="font-medium">{cotacao.descricao_mercadoria}</p>
              {cotacao.ncm && <p className="text-xs text-gray-400">NCM: {cotacao.ncm}</p>}
            </div>
            <div>
              <p className="text-gray-500">Incoterm</p>
              <p className="font-medium">{cotacao.incoterm}</p>
            </div>
            <div>
              <p className="text-gray-500">Quantidade</p>
              <p className="font-medium">{cotacao.quantidade} {cotacao.tipo_container || 'un'}</p>
            </div>
            <div>
              <p className="text-gray-500">Peso</p>
              <p className="font-medium">{cotacao.peso_kg ? `${cotacao.peso_kg.toLocaleString()} kg` : '-'}</p>
            </div>
            {cotacao.valor_target && (
              <div>
                <p className="text-gray-500">Valor Target</p>
                <p className="font-medium">{cotacao.moeda_target} {cotacao.valor_target.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            )}
            <div>
              <p className="text-gray-500">Data Limite</p>
              <p className="font-medium">{cotacao.data_limite_resposta ? new Date(cotacao.data_limite_resposta).toLocaleDateString('pt-BR') : '-'}</p>
            </div>
          </div>
        </div>

        {/* Acoes */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg border p-4">
            <h2 className="text-lg font-semibold mb-3">Acoes</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => navigate(`/comparativo/${cotacao.id}`)}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Ver Comparativo
              </button>
              {cotacao.status === 'AGUARDANDO_APROVACAO' && (
                <>
                  <button
                    onClick={() => mudarStatus('APROVADA')}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                  >
                    Aprovar
                  </button>
                  <button
                    onClick={() => mudarStatus('REPROVADA')}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
                  >
                    Reprovar
                  </button>
                </>
              )}
              {cotacao.status === 'RASCUNHO' && (
                <button
                  onClick={() => mudarStatus('CANCELADA')}
                  disabled={actionLoading}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded text-sm hover:bg-red-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>

          {/* Saving */}
          {cotacao.saving_valor != null && (
            <div className="bg-green-50 rounded-lg border border-green-200 p-4">
              <h3 className="text-sm font-semibold text-green-800">Saving</h3>
              <p className="text-2xl font-bold text-green-700">
                {cotacao.saving_percentual?.toFixed(1)}%
              </p>
              <p className="text-sm text-green-600">
                {cotacao.moeda_target || 'USD'} {cotacao.saving_valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* BidRequests enviados */}
      <div className="bg-white rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-3">BID Requests Enviados ({bids.length})</h2>
        {bids.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhum BID enviado ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-2 text-left">Fornecedor</th>
                  <th className="p-2 text-left">Canal</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Enviado em</th>
                  <th className="p-2 text-left">Respondido em</th>
                </tr>
              </thead>
              <tbody>
                {bids.map(b => (
                  <tr key={b.id} className="border-b">
                    <td className="p-2">{b.fornecedor?.nome || b.fornecedor_id}</td>
                    <td className="p-2">{b.canal}</td>
                    <td className="p-2">
                      <span className={`px-2 py-0.5 rounded text-xs ${BID_STATUS_LABELS[b.status]?.cor || 'bg-gray-100'}`}>
                        {BID_STATUS_LABELS[b.status]?.label || b.status}
                      </span>
                    </td>
                    <td className="p-2 text-xs">{b.enviado_em ? new Date(b.enviado_em).toLocaleString('pt-BR') : '-'}</td>
                    <td className="p-2 text-xs">{b.respondido_em ? new Date(b.respondido_em).toLocaleString('pt-BR') : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* BidResponses recebidos */}
      <div className="bg-white rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-3">Respostas Recebidas ({responses.length})</h2>
        {responses.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhuma resposta recebida ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-2 text-left">Fornecedor</th>
                  <th className="p-2 text-right">Frete</th>
                  <th className="p-2 text-right">Taxas Origem</th>
                  <th className="p-2 text-right">Taxas Destino</th>
                  <th className="p-2 text-right">Total</th>
                  <th className="p-2 text-center">Transit Time</th>
                  <th className="p-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {responses.map(r => (
                  <tr key={r.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{r.fornecedor?.nome || r.fornecedor_id}</td>
                    <td className="p-2 text-right">{r.moeda} {r.valor_frete.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="p-2 text-right">{r.taxas_origem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="p-2 text-right">{r.taxas_destino.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="p-2 text-right font-semibold">{r.moeda} {r.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="p-2 text-center">{r.transit_time_dias} dias</td>
                    <td className="p-2">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        r.status === 'APROVADA' ? 'bg-green-100 text-green-700' :
                        r.status === 'REPROVADA' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
