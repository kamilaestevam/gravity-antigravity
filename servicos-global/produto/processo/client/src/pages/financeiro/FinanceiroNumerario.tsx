/**
 * FinanceiroNumerario — aba de numerarios (adiantamentos ao despachante).
 * Schema fonte: FinanceiroNumerario (financeiro-comex).
 */

import React from 'react'
import {
  CurrencyDollar, Plus, ArrowsClockwise, ClockCounterClockwise,
} from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { FinanceiroTabs } from './FinanceiroTabs'
import { MOCK_NUMERARIOS, fmtMoeda, fmtData } from './_mocks'
import './Financeiro.css'

export default function FinanceiroNumerario() {
  const totalSolicitado = MOCK_NUMERARIOS.reduce((acc, n) => acc + n.valor_total, 0)

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

      {/* Painel: total solicitado */}
      <div className="fn-insights">
        <div className="fn-insights-corpo">
          <div className="fn-insights-cards">
            <div className="fn-insights-card fn-insights-card--hero">
              <div className="fn-insights-card-corpo">
                <span className="fn-insights-rotulo">Total solicitado</span>
                <strong>{fmtMoeda(totalSolicitado, 'BRL')}</strong>
              </div>
            </div>
            <div className="fn-insights-card">
              <span className="fn-insights-rotulo">Numerários</span>
              <strong>{MOCK_NUMERARIOS.length}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="fn-toolbar fn-toolbar--acoes-direita">
        <div className="fn-acoes">
          <button type="button" className="fn-btn fn-btn--primario">
            <Plus size={14} weight="bold" /> Numerário Complementar
          </button>
          <button type="button" className="fn-btn">
            <ArrowsClockwise size={14} weight="duotone" /> Recriar solicitação
          </button>
          <button type="button" className="fn-btn">
            <ClockCounterClockwise size={14} weight="duotone" /> Histórico
          </button>
        </div>
      </div>

      <div className="fn-lista">
        {MOCK_NUMERARIOS.map(n => (
          <article key={n.id} className="fn-numerario">
            <div className="fn-numerario-corpo">
              <div className="fn-numerario-head">
                <strong>{n.descricao}</strong>
                {n.is_principal && <span className="fn-tag">Principal</span>}
              </div>
              <div className="fn-numerario-valor">
                <strong>{fmtMoeda(n.valor_total, 'BRL')}</strong>
                <span>solicitado em {fmtData(n.data)}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </PaginaGlobal>
  )
}
