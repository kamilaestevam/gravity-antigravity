/**
 * CotacoesPendentes.tsx — Lista de cotacoes pendentes para o fornecedor responder
 * Detalhes da cotacao e botao "Responder"
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { portalApi } from '../../shared/api.js'
import type { Cotacao, BidRequest } from '../../shared/types.js'

interface CotacaoPendente {
  bid_request: BidRequest
  cotacao: Cotacao
}

export default function CotacoesPendentes() {
  const navigate = useNavigate()
  const [pendentes, setPendentes] = useState<CotacaoPendente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    portalApi.cotacoesPendentes()
      .then(res => setPendentes(res.pendentes || res || []))
      .catch(err => setError(err.message || 'Erro ao carregar cotacoes pendentes'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8">Carregando cotacoes pendentes...</div>
  if (error) return <div className="p-8 text-red-600">{error}</div>

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cotacoes Pendentes</h1>
        <button onClick={() => navigate('/portal')} className="px-4 py-2 border rounded text-sm">
          Voltar ao Dashboard
        </button>
      </div>

      {pendentes.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center text-gray-500">
          Nenhuma cotacao pendente no momento.
        </div>
      ) : (
        <div className="space-y-4">
          {pendentes.map(item => {
            const c = item.cotacao
            const br = item.bid_request
            const expirada = c.data_limite_resposta && new Date(c.data_limite_resposta) < new Date()
            return (
              <div key={br.id} className="bg-white rounded-lg border p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-gray-400">{c.numero}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        br.status === 'ENVIADO' ? 'bg-blue-100 text-blue-700' :
                        br.status === 'VISUALIZADO' ? 'bg-indigo-100 text-indigo-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>{br.status}</span>
                      {expirada && (
                        <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-700">Expirada</span>
                      )}
                    </div>
                    <p className="text-sm font-medium">
                      {c.origem_nome} ({c.origem_pais}) → {c.destino_nome} ({c.destino_pais})
                    </p>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>{c.tipo_operacao}</span>
                      <span>{c.modal} / {c.modalidade}</span>
                      <span>Incoterm: {c.incoterm}</span>
                      <span>{c.quantidade} {c.tipo_container || 'un'}</span>
                      {c.peso_kg && <span>{c.peso_kg.toLocaleString()} kg</span>}
                    </div>
                    <p className="text-xs text-gray-500">
                      Mercadoria: {c.descricao_mercadoria}
                      {c.ncm && ` (NCM: ${c.ncm})`}
                    </p>
                    {c.data_limite_resposta && (
                      <p className={`text-xs ${expirada ? 'text-red-600' : 'text-gray-400'}`}>
                        Prazo: {new Date(c.data_limite_resposta).toLocaleString('pt-BR')}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      Canal: {br.canal} | Enviado em: {br.enviado_em ? new Date(br.enviado_em).toLocaleString('pt-BR') : '-'}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/portal/responder/${br.id}`)}
                    disabled={!!expirada}
                    className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
                  >
                    Responder
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
