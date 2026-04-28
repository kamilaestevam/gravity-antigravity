/**
 * RateioPage.tsx — Lista de arquivos de rateio gerados + geração
 */

import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { rateio as rateioApi } from '../../shared/api'
import type { FinanceiroRateio } from '../../shared/types'
import './RateioPage.css'

export default function RateioPage() {
  const { processoId } = useParams<{ processoId: string }>()
  const navigate = useNavigate()
  const pid = processoId ?? 'demo'

  const [rateios, setRateios] = useState<FinanceiroRateio[]>([])
  const [loading, setLoading] = useState(true)
  const [gerando, setGerando] = useState(false)
  const [erro, setErro] = useState('')

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const res = await rateioApi.listar(pid)
      setRateios(res.data)
    } finally {
      setLoading(false)
    }
  }, [pid])

  useEffect(() => { carregar() }, [carregar])

  async function gerarNovo() {
    setGerando(true)
    setErro('')
    try {
      const { blob, nome } = await rateioApi.gerar(pid)
      downloadBlob(blob, nome)
      await carregar()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao gerar rateio')
    } finally {
      setGerando(false)
    }
  }

  async function baixar(r: FinanceiroRateio) {
    try {
      const { blob, nome } = await rateioApi.download(pid, r.id)
      downloadBlob(blob, nome)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao baixar arquivo')
    }
  }

  function downloadBlob(blob: Blob, nome: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = nome
    a.click()
    URL.revokeObjectURL(url)
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <div className="fincom-page">
      <div className="fincom-tabs">
        <button className="fincom-tab" onClick={() => navigate(`/financeiro-comex/movimentacao/${pid}`)}>Movimentacao</button>
        <button className="fincom-tab" onClick={() => navigate(`/financeiro-comex/numerario/${pid}`)}>Numerario</button>
        <button className="fincom-tab fincom-tab--active">Rateio</button>
      </div>

      <div className="fincom-rateio-header">
        <button
          className="fincom-btn fincom-btn--primary"
          onClick={gerarNovo}
          disabled={gerando}
        >
          {gerando ? '⏳ Gerando planilha de rateio...' : 'Gerar Novo'}
        </button>
      </div>

      {erro && <p className="fincom-erro-msg">{erro}</p>}

      {loading ? (
        <div className="fincom-skeleton fincom-skeleton--table" />
      ) : rateios.length === 0 ? (
        <div className="fincom-empty">
          <p>Nenhum rateio gerado ainda.</p>
          <button className="fincom-btn fincom-btn--primary" onClick={gerarNovo} disabled={gerando}>Gerar Novo</button>
        </div>
      ) : (
        <div className="fincom-rateio-lista">
          {rateios.map(r => (
            <button
              key={r.id}
              className="fincom-rateio-item"
              onClick={() => baixar(r)}
            >
              <span className="fincom-rateio-item__icon">📊</span>
              <span className="fincom-rateio-item__nome">{r.nome_arquivo}</span>
              <span className="fincom-rateio-item__data">{formatDate(r.gerado_em)}</span>
              <span className="fincom-rateio-item__dl">⬇</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
