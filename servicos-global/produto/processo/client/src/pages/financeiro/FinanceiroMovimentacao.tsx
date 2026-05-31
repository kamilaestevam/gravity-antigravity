/**
 * FinanceiroMovimentacao — aba de lancamentos financeiros do processo.
 *
 * Schema fonte: FinanceiroLancamento (financeiro-comex/prisma/fragment.prisma).
 * Mock por enquanto — quando o back estiver pronto, trocar MOCK_LANCAMENTOS
 * por chamada filtrada por processo_id.
 */

import React, { useState, useMemo } from 'react'
import {
  CurrencyDollar, Plus, ClockCounterClockwise, CheckCircle, Warning,
  CalendarBlank, Buildings, MagnifyingGlass, X,
} from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { FinanceiroTabs } from './FinanceiroTabs'
import {
  MOCK_LANCAMENTOS, fmtMoeda, fmtData, calcularTotais,
  STATUS_LABEL, type Moeda,
} from './_mocks'
import './Financeiro.css'

export default function FinanceiroMovimentacao() {
  const [busca, setBusca] = useState('')
  const [moedaAtiva, setMoedaAtiva] = useState<Moeda>('BRL')

  const totais = useMemo(() => calcularTotais(MOCK_LANCAMENTOS), [])
  const totaisMoeda = totais[moedaAtiva]
  const totalGeral = totaisMoeda.total
  const pctAberto = totalGeral > 0 ? Math.round((totaisMoeda.aberto / totalGeral) * 100) : 0
  const corDonut = pctAberto > 0 ? '#fbbf24' : '#34d399'

  const buscaNorm = busca.trim().toLowerCase()
  const lancamentosFiltrados = useMemo(() => {
    if (!buscaNorm) return MOCK_LANCAMENTOS
    return MOCK_LANCAMENTOS.filter(l =>
      l.descricao.toLowerCase().includes(buscaNorm)
      || l.fornecedor.toLowerCase().includes(buscaNorm)
    )
  }, [buscaNorm])

  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<CurrencyDollar weight="duotone" size={22} />}
          titulo="Financeiro"
          subtitulo="Movimentações, numerário e rateios consolidados do processo"
        />
      }
    >
      <FinanceiroTabs />

      {/* Painel de Insights: total aberto + breakdown por status, com toggle de moeda */}
      <div className="fn-insights">
        <div className="fn-insights-titulo">Painel de Insights</div>
        <div className="fn-insights-corpo">
          <div className="fn-insights-toggle">
            {(['BRL', 'USD', 'EUR'] as Moeda[]).map(m => (
              <button
                key={m}
                type="button"
                className={`fn-insights-toggle-btn ${moedaAtiva === m ? 'fn-insights-toggle-btn--ativa' : ''}`}
                onClick={() => setMoedaAtiva(m)}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="fn-insights-cards">
            <div className="fn-insights-card fn-insights-card--hero">
              <div
                className="fn-insights-donut"
                style={{
                  background: `conic-gradient(${corDonut} 0% ${pctAberto}%, rgba(148,163,184,0.18) ${pctAberto}% 100%)`,
                }}
              >
                <div className="fn-insights-donut-inner">
                  <span>{pctAberto}%</span>
                </div>
              </div>
              <div className="fn-insights-card-corpo">
                <span className="fn-insights-rotulo">Total em aberto</span>
                <strong>{fmtMoeda(totaisMoeda.aberto, moedaAtiva)}</strong>
              </div>
            </div>

            <div className="fn-insights-card">
              <span className="fn-insights-rotulo"><CheckCircle weight="fill" size={12} color="#34d399" /> Pagos</span>
              <strong>{fmtMoeda(totaisMoeda.pago, moedaAtiva)}</strong>
            </div>
            <div className="fn-insights-card">
              <span className="fn-insights-rotulo"><CalendarBlank weight="duotone" size={12} color="#a78bfa" /> Agendados</span>
              <strong>{fmtMoeda(totaisMoeda.agendado, moedaAtiva)}</strong>
            </div>
            <div className="fn-insights-card">
              <span className="fn-insights-rotulo"><Warning weight="fill" size={12} color="#fbbf24" /> Pendentes</span>
              <strong>{fmtMoeda(totaisMoeda.aberto, moedaAtiva)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar: busca + acoes */}
      <div className="fn-toolbar">
        <div className="fn-busca">
          <MagnifyingGlass weight="duotone" size={14} className="fn-busca-icon" />
          <input
            type="text"
            placeholder="Buscar lançamento por descrição ou fornecedor…"
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
          {busca && (
            <button type="button" className="fn-busca-limpar" onClick={() => setBusca('')} title="Limpar">
              <X size={12} weight="bold" />
            </button>
          )}
        </div>
        <div className="fn-acoes">
          <button type="button" className="fn-btn fn-btn--primario">
            <Plus size={14} weight="bold" /> Novo Lançamento
          </button>
          <button type="button" className="fn-btn">
            <CheckCircle size={14} weight="duotone" /> Solicitar Aprovação
          </button>
          <button type="button" className="fn-btn">
            <ClockCounterClockwise size={14} weight="duotone" /> Histórico
          </button>
        </div>
      </div>

      {/* Lista de lancamentos */}
      <div className="fn-lista">
        {lancamentosFiltrados.length === 0 ? (
          <div className="fn-empty">
            <MagnifyingGlass weight="duotone" size={32} />
            <h3>Nenhum lançamento encontrado</h3>
            <p>Nenhum lançamento cuja descrição ou fornecedor contenha “{busca}”.</p>
          </div>
        ) : (
          lancamentosFiltrados.map(l => (
            <article key={l.id} className={`fn-lancamento fn-lancamento--${l.status}`}>
              <div className="fn-lancamento-status" aria-hidden />
              <div className="fn-lancamento-corpo">
                <header className="fn-lancamento-head">
                  <div className="fn-lancamento-titulo">
                    <strong>{l.descricao}</strong>
                    <span className={`fn-status fn-status--${l.status}`}>{STATUS_LABEL[l.status]}</span>
                  </div>
                  <div className="fn-lancamento-valor">
                    <strong>{fmtMoeda(l.valor, l.moeda)}</strong>
                    {l.moeda !== 'BRL' && <small>{fmtMoeda(l.valor_brl, 'BRL')}</small>}
                  </div>
                </header>
                <div className="fn-lancamento-meta">
                  <span className="fn-meta">
                    <Buildings weight="duotone" size={12} /> {l.fornecedor}
                  </span>
                  {l.data_vencimento && (
                    <span className="fn-meta">
                      <CalendarBlank weight="duotone" size={12} /> Vence em {fmtData(l.data_vencimento)}
                    </span>
                  )}
                  {l.data_pagamento && (
                    <span className="fn-meta fn-meta--ok">
                      <CheckCircle weight="fill" size={12} /> Pago em {fmtData(l.data_pagamento)}
                    </span>
                  )}
                  {l.moeda !== 'BRL' && <span className="fn-meta">Taxa {l.taxa.toFixed(4)}</span>}
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </PaginaGlobal>
  )
}
