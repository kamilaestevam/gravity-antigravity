/**
 * useCardValues — mapeia cardId → valor + tooltip a partir dos KPIs da API
 *
 * Única passagem: recebe os KPIs já calculados pelo servidor e distribui
 * para cada card sem re-iteração. O(1) por card, O(N) total na API.
 */
import React, { useMemo } from 'react'
import type { KpisEstimativaCusto } from './schemas-estimativa-custo'

const brl = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

export interface CardValor {
  valor: React.ReactNode
  subtexto?: React.ReactNode
  tooltip?: React.ReactNode
}

export function computeCardValues(kpis: KpisEstimativaCusto): Record<string, CardValor> {
  const total = kpis.total || 0

  return {
    total: {
      valor: total,
      subtexto: `${kpis.em_criacao} em elaboração`,
      tooltip: React.createElement(React.Fragment, null,
        React.createElement('p', { className: 'cg-tooltip__row' },
          React.createElement('span', null, 'Em Criação'),
          React.createElement('strong', null, kpis.em_criacao)
        ),
        React.createElement('p', { className: 'cg-tooltip__row' },
          React.createElement('span', null, 'Criadas'),
          React.createElement('strong', null, kpis.criadas)
        ),
        React.createElement('p', { className: 'cg-tooltip__row' },
          React.createElement('span', null, 'Arquivadas'),
          React.createElement('strong', null, kpis.arquivadas)
        ),
      ),
    },

    em_criacao: {
      valor: kpis.em_criacao,
      subtexto: total > 0 ? `${Math.round((kpis.em_criacao / total) * 100)}% do total` : undefined,
      tooltip: React.createElement('p', { className: 'cg-tooltip__row' },
        React.createElement('span', null, 'Aguardando finalização'),
        React.createElement('strong', null, kpis.em_criacao)
      ),
    },

    criadas: {
      valor: kpis.criadas,
      subtexto: total > 0 ? `${Math.round((kpis.criadas / total) * 100)}% do total` : undefined,
      tooltip: React.createElement('p', { className: 'cg-tooltip__row' },
        React.createElement('span', null, 'Finalizadas e aprovadas'),
        React.createElement('strong', null, kpis.criadas)
      ),
    },

    arquivadas: {
      valor: kpis.arquivadas,
      subtexto: total > 0 ? `${Math.round((kpis.arquivadas / total) * 100)}% do total` : undefined,
      tooltip: React.createElement('p', { className: 'cg-tooltip__row' },
        React.createElement('span', null, 'Não ativas'),
        React.createElement('strong', null, kpis.arquivadas)
      ),
    },

    custo_nacionalizado_medio: {
      valor: kpis.custo_nacionalizado_medio_brl > 0 ? brl(kpis.custo_nacionalizado_medio_brl) : '—',
      subtexto: 'Média BRL por estimativa',
      tooltip: React.createElement('p', { className: 'cg-tooltip__row' },
        React.createElement('span', null, 'Inclui II · IPI · PIS · COFINS · ICMS'),
        React.createElement('strong', null, 'Custo Nacionalizado')
      ),
    },

    total_tributos_acumulado: {
      valor: kpis.total_tributos_acumulado_brl > 0 ? brl(kpis.total_tributos_acumulado_brl) : '—',
      subtexto: 'Soma de todas as estimativas',
      tooltip: React.createElement('p', { className: 'cg-tooltip__row' },
        React.createElement('span', null, 'II + IPI + PIS + COFINS + ICMS'),
        React.createElement('strong', null, brl(kpis.total_tributos_acumulado_brl))
      ),
    },
  }
}

export function useCardValues(kpis: KpisEstimativaCusto): Record<string, CardValor> {
  return useMemo(() => computeCardValues(kpis), [kpis])
}
