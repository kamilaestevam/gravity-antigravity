import type { ReactNode } from 'react'
import { TooltipGlobal } from '@nucleo/tooltip-global'

export type ItemFiltroConsolidadoListaSimuladorPedido = {
  id: string
  rotulo: string
  valorResumo: string
  detalhe?: ReactNode
}

type Props = {
  itens: readonly ItemFiltroConsolidadoListaSimuladorPedido[]
  onLimparTodos?: () => void
  podeLimparTodos?: boolean
  dataTutorialAlvo?: string
}

export function FiltrosConsolidadosListaSimuladorPedido({
  itens,
  onLimparTodos,
  podeLimparTodos = false,
  dataTutorialAlvo,
}: Props) {
  if (itens.length === 0) return null

  const quantidade = itens.length
  const textoQuantidade = quantidade === 1 ? '1 selecionado' : `${quantidade} selecionados`

  const tooltip = (
    <ul className="pds-lista-filtros-consolidados-tooltip">
      {itens.map((item, indice) => (
        <li key={item.id} className="pds-lista-filtros-consolidados-tooltip-item">
          <div className="pds-lista-filtros-consolidados-tooltip-linha">
            <span className="pds-lista-filtros-consolidados-tooltip-num" aria-hidden="true">
              {indice + 1}.
            </span>
            <span className="pds-lista-filtros-consolidados-tooltip-rotulo">{item.rotulo}:</span>
            <span className="pds-lista-filtros-consolidados-tooltip-valor">{item.valorResumo}</span>
          </div>
          {item.detalhe ? (
            <div className="pds-lista-filtros-consolidados-tooltip-detalhe">{item.detalhe}</div>
          ) : null}
        </li>
      ))}
    </ul>
  )

  return (
    <div
      className="pds-lista-filtros-consolidados"
      role="status"
      aria-label="Filtros ativos"
      {...(dataTutorialAlvo ? { 'data-sds-tutorial-alvo': dataTutorialAlvo } : {})}
    >
      <TooltipGlobal
        titulo="Filtros ativos"
        descricao={tooltip}
        interativo
        posicaoPreferida="abaixo"
      >
        <span className="fc-chip fc-chip--escopo pds-lista-filtros-consolidados-chip">
          <span className="fc-chip-label">Filtros:</span>
          <span className="fc-chip-valor">{textoQuantidade}</span>
        </span>
      </TooltipGlobal>
      {podeLimparTodos && onLimparTodos ? (
        <button type="button" className="fc-limpar-todos" onClick={onLimparTodos}>
          Limpar filtros
        </button>
      ) : null}
    </div>
  )
}
