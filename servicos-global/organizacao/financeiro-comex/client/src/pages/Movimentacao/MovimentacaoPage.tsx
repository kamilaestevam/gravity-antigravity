/**
 * MovimentacaoPage.tsx — Lista principal de lançamentos financeiros
 * KPIs: Saldo, Adiantado, Pagos, Agendados, Pendente
 * Tabela: TabelaGlobal com colunas conforme HANDOFF.md
 */

import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { dashboard, lancamentos as lancamentosApi } from '../../shared/api'
import type { FinanceiroProcesso, FinanceiroLancamento } from '../../shared/types'
import { STATUS_LABEL } from '../../shared/types'
import ModalNovoLancamentoFinanceiro from './ModalFinanceiroNovoLancamento'
import ModalImportarLancamentos from './ModalFinanceiroImportarLancamentos'
import ModalHistoricoProcesso from './ModalProcessoHistorico'
import './MovimentacaoPage.css'

export default function MovimentacaoPage() {
  const { processoId } = useParams<{ processoId: string }>()
  const navigate = useNavigate()

  const [financeiro, setFinanceiro] = useState<FinanceiroProcesso | null>(null)
  const [itens, setItens] = useState<FinanceiroLancamento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showNovo, setShowNovo] = useState(false)
  const [showImportar, setShowImportar] = useState(false)
  const [showHistorico, setShowHistorico] = useState(false)
  const [editando, setEditando] = useState<FinanceiroLancamento | null>(null)

  const pid = processoId ?? 'demo'

  const carregar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [dashRes, listaRes] = await Promise.all([
        dashboard.get(pid),
        lancamentosApi.listar(pid, { limit: 100 }),
      ])
      setFinanceiro(dashRes.data)
      setItens(listaRes.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [pid])

  useEffect(() => { carregar() }, [carregar])

  async function excluir(id: string) {
    if (!confirm('Excluir este lancamento?')) return
    try {
      await lancamentosApi.excluir(pid, id)
      await carregar()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao excluir')
    }
  }

  function formatBRL(v: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
  }

  function formatDate(d?: string) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('pt-BR')
  }

  function isVencida(d?: string) {
    if (!d) return false
    return new Date(d) < new Date()
  }

  if (loading) return (
    <div className="fincom-page">
      <div className="fincom-skeleton fincom-skeleton--title" />
      <div className="fincom-kpi-row">
        {[0,1,2,3,4].map(i => <div key={i} className="fincom-skeleton fincom-skeleton--kpi" />)}
      </div>
      <div className="fincom-skeleton fincom-skeleton--table" />
    </div>
  )

  if (error) return (
    <div className="fincom-page fincom-error">
      <p>Erro ao carregar lancamentos</p>
      <button className="fincom-btn fincom-btn--primary" onClick={carregar}>Tentar novamente</button>
    </div>
  )

  const saldoNegativo = financeiro && financeiro.saldo < 0

  return (
    <div className="fincom-page">
      {/* Tabs */}
      <div className="fincom-tabs">
        <button className="fincom-tab fincom-tab--active">Movimentacao</button>
        <button className="fincom-tab" onClick={() => navigate(`/financeiro-comex/numerario/${pid}`)}>Numerario</button>
        <button className="fincom-tab" onClick={() => navigate(`/financeiro-comex/rateio/${pid}`)}>Rateio</button>
      </div>

      {/* Totais multi-moeda */}
      {financeiro && (
        <div className="fincom-totais">
          {financeiro.total_brl > 0 && (
            <span className="fincom-badge-moeda">BRL {formatBRL(financeiro.total_brl)}</span>
          )}
          {financeiro.total_usd > 0 && (
            <span className="fincom-badge-moeda">USD {financeiro.total_usd.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          )}
          {financeiro.total_eur > 0 && (
            <span className="fincom-badge-moeda">EUR {financeiro.total_eur.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          )}
        </div>
      )}

      {/* KPIs */}
      {financeiro && (
        <div className="fincom-kpi-row">
          <div className={`fincom-kpi ${saldoNegativo ? 'fincom-kpi--negativo' : ''}`}>
            <span className="fincom-kpi__label">Saldo</span>
            <span className="fincom-kpi__valor">{formatBRL(financeiro.saldo)}</span>
          </div>
          <div className="fincom-kpi">
            <span className="fincom-kpi__label">Adiantado</span>
            <span className="fincom-kpi__valor">{formatBRL(financeiro.adiantado)}</span>
          </div>
          <div className="fincom-kpi fincom-kpi--pago">
            <span className="fincom-kpi__label">Pagos</span>
            <span className="fincom-kpi__valor">{formatBRL(financeiro.pagos)}</span>
          </div>
          <div className="fincom-kpi fincom-kpi--agendado">
            <span className="fincom-kpi__label">Agendados</span>
            <span className="fincom-kpi__valor">{formatBRL(financeiro.agendados)}</span>
          </div>
          <div className="fincom-kpi fincom-kpi--pendente">
            <span className="fincom-kpi__label">Pendente</span>
            <span className="fincom-kpi__valor">{formatBRL(financeiro.pendente)}</span>
          </div>
        </div>
      )}

      {/* Ações */}
      <div className="fincom-acoes">
        <button className="fincom-btn fincom-btn--ghost" onClick={() => setShowHistorico(true)}>
          Historico de Alteracoes
        </button>
        <div className="fincom-acoes-right">
          <div className="fincom-dropdown">
            <button className="fincom-btn fincom-btn--secondary" onClick={() => setShowImportar(true)}>
              ↓ Importar
            </button>
          </div>
          <button className="fincom-btn fincom-btn--primary" onClick={() => setShowNovo(true)}>
            + Novo
          </button>
        </div>
      </div>

      {/* Tabela */}
      {itens.length === 0 ? (
        <div className="fincom-empty">
          <p>Nenhum lancamento. Adicione o primeiro custo do processo.</p>
          <button className="fincom-btn fincom-btn--primary" onClick={() => setShowNovo(true)}>+ Novo</button>
        </div>
      ) : (
        <div className="fincom-table-wrapper">
          <table className="fincom-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Descricao</th>
                <th>Cond. Pgto</th>
                <th>Fornecedor</th>
                <th>Moeda</th>
                <th>Taxa</th>
                <th>Valor</th>
                <th>Valor R$</th>
                <th>Dt. Pgto</th>
                <th>Dt. Venc</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {itens.map(item => (
                <tr
                  key={item.id}
                  className="fincom-table__row"
                  onClick={() => setEditando(item)}
                >
                  <td>{formatDate(item.created_at)}</td>
                  <td>{item.categoria_nome}</td>
                  <td>{item.condicao_descricao ?? '—'}</td>
                  <td>{item.fornecedor_nome ?? '—'}</td>
                  <td><span className="fincom-badge-moeda fincom-badge-moeda--sm">{item.moeda}</span></td>
                  <td className="fincom-monospace">{Number(item.taxa_cambio).toFixed(7)}</td>
                  <td className="fincom-monospace">{Number(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="fincom-monospace fincom-bold">{formatBRL(Number(item.valor_brl))}</td>
                  <td>{formatDate(item.data_pagamento)}</td>
                  <td className={isVencida(item.data_vencimento) ? 'fincom-vencida' : ''}>{formatDate(item.data_vencimento)}</td>
                  <td>
                    <span className={`fincom-status fincom-status--${item.status_pagamento.toLowerCase()}`}>
                      {STATUS_LABEL[item.status_pagamento]}
                    </span>
                  </td>
                  <td>
                    <button
                      className="fincom-btn-icon"
                      onClick={e => { e.stopPropagation(); excluir(item.id) }}
                      title="Excluir"
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modais */}
      {(showNovo || editando) && (
        <ModalNovoLancamentoFinanceiro
          processoId={pid}
          lancamento={editando ?? undefined}
          tipoOperacao={financeiro?.tipo_operacao ?? 'IMPORTACAO'}
          onClose={() => { setShowNovo(false); setEditando(null) }}
          onSalvo={() => { setShowNovo(false); setEditando(null); carregar() }}
        />
      )}

      {showImportar && (
        <ModalImportarLancamentos
          processoId={pid}
          onClose={() => setShowImportar(false)}
          onImportado={() => { setShowImportar(false); carregar() }}
        />
      )}

      {showHistorico && (
        <ModalHistoricoProcesso
          processoId={pid}
          onClose={() => setShowHistorico(false)}
        />
      )}
    </div>
  )
}
