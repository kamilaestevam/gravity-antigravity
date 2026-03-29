/**
 * ResponderPublico.tsx — Formulario publico para fornecedor responder via token (sem login)
 * Usa useParams para :token e portalPublicApi
 */

import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { portalPublicApi } from '../../shared/api.js'
import type { Cotacao } from '../../shared/types.js'

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

export default function ResponderPublico() {
  const { token } = useParams<{ token: string }>()
  const [cotacao, setCotacao] = useState<Cotacao | null>(null)
  const [form, setForm] = useState<RespostaForm>(EMPTY_FORM)
  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [tokenInvalido, setTokenInvalido] = useState(false)

  useEffect(() => {
    if (!token) return
    portalPublicApi.verCotacao(token)
      .then(res => setCotacao(res.cotacao || res))
      .catch(() => setTokenInvalido(true))
      .finally(() => setLoading(false))
  }, [token])

  const update = (fields: Partial<RespostaForm>) => setForm(prev => ({ ...prev, ...fields }))
  const valorTotal = form.valor_frete + form.taxas_origem + form.taxas_destino

  async function enviar() {
    if (!token) return
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
      await portalPublicApi.responder(token, {
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

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500">Carregando cotacao...</p>
    </div>
  )

  if (tokenInvalido) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
        <h2 className="text-xl font-bold text-red-600 mb-2">Link invalido ou expirado</h2>
        <p className="text-sm text-gray-500">
          Este link de cotacao nao e valido ou ja expirou. Entre em contato com o comprador para obter um novo link.
        </p>
      </div>
    </div>
  )

  if (sucesso) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
        <h2 className="text-xl font-bold text-green-800 mb-2">Resposta enviada com sucesso!</h2>
        <p className="text-sm text-green-600">
          Sua proposta foi registrada e sera analisada pelo comprador. Voce recebera uma notificacao com o resultado.
        </p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-1">Responder Cotacao de Frete</h1>
          <p className="text-sm text-gray-500">Preencha os dados da sua proposta abaixo</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-sm">{error}</div>}

        {/* Dados da cotacao */}
        {cotacao && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-sm font-semibold mb-3 text-gray-700">Detalhes da Cotacao</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Numero: </span>
                <span className="font-mono">{cotacao.numero}</span>
              </div>
              <div>
                <span className="text-gray-500">Rota: </span>
                <span>{cotacao.origem_nome} ({cotacao.origem_pais}) → {cotacao.destino_nome} ({cotacao.destino_pais})</span>
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
                  <span className={new Date(cotacao.data_limite_resposta) < new Date() ? 'text-red-600 font-medium' : ''}>
                    {new Date(cotacao.data_limite_resposta).toLocaleString('pt-BR')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Formulario */}
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
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
            <textarea value={form.observacoes} onChange={e => update({ observacoes: e.target.value })} className="w-full border rounded p-2 text-sm h-20" placeholder="Informacoes adicionais..." />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={enviar}
            disabled={enviando}
            className="px-6 py-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {enviando ? 'Enviando...' : 'Enviar Proposta'}
          </button>
        </div>
      </div>
    </div>
  )
}
