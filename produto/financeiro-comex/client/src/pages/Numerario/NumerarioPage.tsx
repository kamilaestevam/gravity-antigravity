/**
 * NumerarioPage.tsx — Lista de numerários (adiantamentos ao despachante)
 */

import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { numerario as numerarioApi } from '../../shared/api'
import type { FinanceiroNumerario } from '../../shared/types'
import ModalInserirNumerario from './ModalInserirNumerario'
import ModalExibirAnexo from './ModalExibirAnexo'
import './NumerarioPage.css'

export default function NumerarioPage() {
  const { processoId } = useParams<{ processoId: string }>()
  const navigate = useNavigate()
  const pid = processoId ?? 'demo'

  const [numerarios, setNumerarios] = useState<FinanceiroNumerario[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [expandido, setExpandido] = useState<string | null>(null)
  const [showNovo, setShowNovo] = useState(false)
  const [editando, setEditando] = useState<FinanceiroNumerario | null>(null)
  const [anexoUrl, setAnexoUrl] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const res = await numerarioApi.listar(pid)
      setNumerarios(res.data)
      setTotal(res.total)
    } finally {
      setLoading(false)
    }
  }, [pid])

  useEffect(() => { carregar() }, [carregar])

  async function excluir(id: string) {
    if (!confirm('Excluir este numerario?')) return
    await numerarioApi.excluir(pid, id)
    carregar()
  }

  function formatBRL(v: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('pt-BR')
  }

  return (
    <div className="fincom-page">
      <div className="fincom-tabs">
        <button className="fincom-tab" onClick={() => navigate(`/financeiro-comex/movimentacao/${pid}`)}>Movimentacao</button>
        <button className="fincom-tab fincom-tab--active">Numerario</button>
        <button className="fincom-tab" onClick={() => navigate(`/financeiro-comex/rateio/${pid}`)}>Rateio</button>
      </div>

      <div className="fincom-num-header">
        <span className="fincom-num-total">Total: {formatBRL(total)}</span>
        <button className="fincom-btn fincom-btn--primary" onClick={() => setShowNovo(true)}>
          + Numerario Complementar
        </button>
      </div>

      {loading ? (
        <div className="fincom-skeleton fincom-skeleton--table" />
      ) : numerarios.length === 0 ? (
        <div className="fincom-empty">
          <p>Nenhum numerario registrado.</p>
          <button className="fincom-btn fincom-btn--primary" onClick={() => setShowNovo(true)}>+ Adicionar</button>
        </div>
      ) : (
        <div className="fincom-num-lista">
          {numerarios.map(n => (
            <div key={n.id} className="fincom-num-item">
              <div className="fincom-num-item__header" onClick={() => setExpandido(expandido === n.id ? null : n.id)}>
                <span className={`fincom-num-avatar ${n.is_principal ? 'fincom-num-avatar--principal' : 'fincom-num-avatar--complementar'}`}>
                  {n.is_principal ? 'NP' : 'NC'}
                </span>
                <span className="fincom-num-item__desc">{n.descricao}</span>
                <span className="fincom-num-item__data">{formatDate(n.data)}</span>
                <span className="fincom-num-item__valor">{formatBRL(Number(n.valor_total))}</span>
                <div className="fincom-num-item__acoes">
                  <button className="fincom-btn fincom-btn--ghost" onClick={e => { e.stopPropagation(); setEditando(n) }}>Editar</button>
                  {n.documento_storage_key && (
                    <button className="fincom-btn fincom-btn--ghost" onClick={e => { e.stopPropagation(); setAnexoUrl(n.documento_storage_key!) }}>Anexo</button>
                  )}
                  <button className="fincom-btn fincom-btn--ghost fincom-btn--danger" onClick={e => { e.stopPropagation(); excluir(n.id) }}>Excluir</button>
                </div>
              </div>

              {expandido === n.id && n.despesas.length > 0 && (
                <div className="fincom-num-despesas">
                  <table className="fincom-table">
                    <thead>
                      <tr><th>Descricao</th><th>Moeda</th><th>Taxa</th><th>Valor</th><th>Valor R$</th><th>Responsavel</th></tr>
                    </thead>
                    <tbody>
                      {n.despesas.map(d => (
                        <tr key={d.id}>
                          <td>{d.descricao}</td>
                          <td>{d.moeda}</td>
                          <td className="fincom-monospace">{Number(d.taxa_cambio).toFixed(7)}</td>
                          <td className="fincom-monospace">{Number(d.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          <td className="fincom-monospace fincom-bold">{formatBRL(Number(d.valor_brl))}</td>
                          <td>{d.responsavel ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {(showNovo || editando) && (
        <ModalInserirNumerario
          processoId={pid}
          numerario={editando ?? undefined}
          onClose={() => { setShowNovo(false); setEditando(null) }}
          onSalvo={() => { setShowNovo(false); setEditando(null); carregar() }}
        />
      )}

      {anexoUrl && (
        <ModalExibirAnexo url={anexoUrl} onClose={() => setAnexoUrl(null)} />
      )}
    </div>
  )
}
