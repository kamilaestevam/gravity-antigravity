/**
 * FinanceiroRateio — aba de arquivos XLSX de rateio das despesas do processo.
 * Schema fonte: FinanceiroRateio (financeiro-comex).
 */

import React from 'react'
import { CurrencyDollar, Plus, FileXls, FileArrowDown } from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { FinanceiroTabs } from './FinanceiroTabs'
import { MOCK_RATEIOS, fmtDataHora } from './_mocks'
import './Financeiro.css'

export default function FinanceiroRateio() {
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

      <div className="fn-insights">
        <div className="fn-insights-titulo">Painel de Insights</div>
        <div className="fn-insights-corpo">
          <div className="fn-insights-cards">
            <div className="fn-insights-card fn-insights-card--hero">
              <div className="fn-insights-card-corpo">
                <span className="fn-insights-rotulo">Rateios gerados</span>
                <strong>{MOCK_RATEIOS.length}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fn-toolbar fn-toolbar--acoes-direita">
        <div className="fn-acoes">
          <button type="button" className="fn-btn fn-btn--primario">
            <Plus size={14} weight="bold" /> Gerar Novo Rateio
          </button>
        </div>
      </div>

      <div className="fn-lista">
        {MOCK_RATEIOS.map(r => (
          <article key={r.id} className="fn-rateio">
            <span className="fn-rateio-icone"><FileXls weight="duotone" size={22} /></span>
            <div className="fn-rateio-corpo">
              <strong>{r.nome}</strong>
              <span>{fmtDataHora(r.data)}</span>
            </div>
            <button type="button" className="fn-btn fn-btn--ghost" title="Baixar">
              <FileArrowDown size={14} weight="duotone" />
            </button>
          </article>
        ))}
      </div>
    </PaginaGlobal>
  )
}
