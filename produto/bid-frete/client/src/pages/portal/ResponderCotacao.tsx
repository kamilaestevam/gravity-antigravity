/**
 * ResponderCotacao.tsx — Formulario para fornecedor responder cotacao (via portal login)
 * Usa useParams para :bidRequestId e portalApi.responder()
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { portalApi } from '../../shared/api.js'
import type { Cotacao, BidRequest } from '../../shared/types.js'

interface RespostaForm {
  moeda: string
  valor_frete: number
  taxas_origem: number
  taxas_destino: number
  transit_time_dias: number
  free_time_dias: number | undefined
  validade_cotacao: string
  transbordos: number
  escalas: string
  observacoes: string
}

const EMPTY_FORM: RespostaForm = {
  moeda: 'USD',
  valor_frete: 0,
  taxas_origem: 0,
  taxas_destino: 0,
  transit_time_dias: 0,
  free_time_dias: undefined,
  validade_cotacao: '',
  transbordos: 0,
  escalas: '',
  observacoes: '',
}

export default function ResponderCotacao() {
  const { bidRequestId } = useParams<{ bidRequestId: string }>()
  const navigate = useNavigate()
  const [cotacao, setCotacao] = useState<Cotacao | null>(null)
  const [bidRequest, setBidRequest] = useState<BidRequest | null>(null)
  const [form, setForm] = useState<RespostaForm>(EMPTY_FORM)
  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [sucesso, setSucesso] = useState(false)

  useEffect(() => {
    if (!bidRequestId) return
    // Load bid request details and cotacao info
    portalApi.cotacoesPendentes()
      .then(res => {
        const pendentes = res.pendentes || res || []
        const found = pendentes.find((p: any) => p.bid_request.id === bidRequestId || p.bid_request?.id === bidRequestId)
        if (found) {
          setCotacao(found.cotacao)
          setBidRequest(found.bid_request)
        } else {
          setError('Cotacao nao encontrada ou ja respondida')
        }
      })
      .catch(err => setError(err.message || 'Erro ao carregar cotacao'))
      .finally(() => setLoading(false))
  }, [bidRequestId])

  const update = (fields: Partial<RespostaForm>) => setForm(prev => ({ ...prev, ...fields }))
  const valorTotal = form.valor_frete + form.taxas_origem + form.taxas_destino

  async function enviar() {
    if (!bidRequestId) return
    if (form.valor_frete <= 0) {
      setError('Valor do frete deve ser maior que zero')
      return
    }
    if (!form.validade_cotacao) {
      setError('Validade da cotacao e obrigatoria')
      return
    }
    setEnviando(true)
    setError('')
    try {
      await portalApi.responder(bidRequestId, {
        ...form,
        valor_total: valorTotal,
      })
      setSucesso(true)
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar resposta')
    } finally {
      setEnviando(false)
    }
  }

  if (loading) return <div className="p-8">Carregando cotacao...</div>

  if (sucesso) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <h2 className="text-xl font-bold text-green-800 mb-2">Resposta enviada com sucesso!</h2>
          <p className="text-sm text-green-600 mb-4">Sua proposta foi registrada e sera analisada pelo comprador.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/portal/cotacoes-pendentes')} className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
              Ver Pendentes
            </button>
            <button onClick={() => navigate('/portal/minhas-respostas')} className="px-4 py-2 border rounded text-sm">
              Minhas Respostas
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <button onClick={() => navigate('/portal/cotacoes-pendentes')} className="text-sm text-blue-600 hover:underline mb-1 block">
          Voltar para pendentes
        </button>
        <h1 className="text-2xl font-bold">Responder Cotacao</h1>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-sm">{error}</div>}

      {/* Dados da cotacao */}
      {cotacao && (
        <div className="bg-gray-50 rounded-lg border p-4">
          <h2 className="text-sm font-semibold mb-2">Dados da Cotacao</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Numero: </span>
              <span className="font-mono">{cotacao.numero}</span>
            </div>
            <div>
              <span className="text-gray-500">Rota: </span>
              <span>{cotacao.origem_nome} → {cotacao.destino_nome}</span>
            </div>
            <div>
              <span className="text-gray-500">Modal: </span>
              <span>{cotacao.modal} / {cotacao.modalidade}</span>
            </div>
            <div>
              <span className="text-gray-500">Incoterm: </span>
              <span>{cotacao.incoterm}</span>
            </div>
            <div>
              <span className="text-gray-500">Mercadoria: </span>
              <span>{cotacao.descricao_mercadoria}</span>
            </div>
            <div>
              <span className="text-gray-500">Quantidade: </span>
              <span>{cotacao.quantidade} {cotacao.tipo_container || 'un'}</span>
            </div>
            {cotacao.peso_kg && (
              <div>
                <span className="text-gray-500">Peso: </span>
                <span>{cotacao.peso_kg.toLocaleString()} kg</span>
              </div>
            )}
            {cotacao.data_limite_resposta && (
              <div>
                <span className="text-gray-500">Prazo: </span>
                <span>{new Date(cotacao.data_limite_resposta).toLocaleString('pt-BR')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Formulario de resposta */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Sua Proposta</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Moeda</label>
            <select value={form.moeda} onChange={e => update({ moeda: e.target.value })} className="w-full border rounded p-2 text-sm">
              <option value="USD">USD</option>
              <option value="BRL">BRL</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Valor do Frete</label>
            <input type="number" step="0.01" value={form.valor_frete || ''} onChange={e => update({ valor_frete: Number(e.target.value) })} className="w-full border rounded p-2 text-sm" placeholder="0.00" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Taxas de Origem</label>
            <input type="number" step="0.01" value={form.taxas_origem || ''} onChange={e => update({ taxas_origem: Number(e.target.value) })} className="w-full border rounded p-2 text-sm" placeholder="0.00" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Taxas de Destino</label>
            <input type="number" step="0.01" value={form.taxas_destino || ''} onChange={e => update({ taxas_destino: Number(e.target.value) })} className="w-full border rounded p-2 text-sm" placeholder="0.00" />
          </div>
        </div>

        <div className="bg-blue-50 rounded p-3 flex justify-between items-center">
          <span className="text-sm font-medium">Valor Total</span>
          <span className="text-lg font-bold">{form.moeda} {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Transit Time (dias)</label>
            <input type="number" value={form.transit_time_dias || ''} onChange={e => update({ transit_time_dias: Number(e.target.value) })} className="w-full border rounded p-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Free Time (dias)</label>
            <input type="number" value={form.free_time_dias ?? ''} onChange={e => update({ free_time_dias: e.target.value ? Number(e.target.value) : undefined })} className="w-full border rounded p-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Transbordos</label>
            <input type="number" value={form.transbordos} onChange={e => update({ transbordos: Number(e.target.value) })} className="w-full border rounded p-2 text-sm" min={0} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Validade da Cotacao</label>
          <input type="date" value={form.validade_cotacao} onChange={e => update({ validade_cotacao: e.target.value })} className="w-full border rounded p-2 text-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Escalas</label>
          <input value={form.escalas} onChange={e => update({ escalas: e.target.value })} className="w-full border rounded p-2 text-sm" placeholder="ex: Singapore, Colombo" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Observacoes</label>
          <textarea value={form.observacoes} onChange={e => update({ observacoes: e.target.value })} className="w-full border rounded p-2 text-sm h-20" placeholder="Informacoes adicionais sobre sua proposta..." />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={() => navigate('/portal/cotacoes-pendentes')} className="px-4 py-2 border rounded text-sm">
          Cancelar
        </button>
        <button
          onClick={enviar}
          disabled={enviando}
          className="px-6 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
        >
          {enviando ? 'Enviando...' : 'Enviar Proposta'}
        </button>
      </div>
    </div>
  )
}
