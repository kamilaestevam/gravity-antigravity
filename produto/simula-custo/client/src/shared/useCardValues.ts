/**
 * useCardValues — mapeia cardId → valor + tooltip a partir dos KPIs da API
 *
 * Única passagem: recebe os KPIs já calculados pelo servidor e distribui
 * para cada card sem re-iteração. O(1) por card, O(N) total na API.
 *
 * Retorna um Record<cardId, CardValor> que o dashboard consome diretamente.
 */

import React from 'react'
import type { EstimativasKpis } from './types'

const brl = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface CardValor {
  valor:    React.ReactNode
  subtexto?: React.ReactNode
  tooltip?: React.ReactNode
}

// ─── Função pura — O(1) por card ─────────────────────────────────────────────

export function computeCardValues(kpis: EstimativasKpis): Record<string, CardValor> {
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
      subtexto: total > 0
        ? `${Math.round((kpis.em_criacao / total) * 100)}% do total`
        : undefined,
      tooltip: React.createElement('p', { className: 'cg-tooltip__row' },
        React.createElement('span', null, 'Aguardando finalização'),
        React.createElement('strong', null, kpis.em_criacao)
      ),
    },

    criadas: {
      valor: kpis.criadas,
      subtexto: total > 0
        ? `${Math.round((kpis.criadas / total) * 100)}% do total`
        : undefined,
      tooltip: React.createElement('p', { className: 'cg-tooltip__row' },
        React.createElement('span', null, 'Finalizadas e aprovadas'),
        React.createElement('strong', null, kpis.criadas)
      ),
    },

    arquivadas: {
      valor: kpis.arquivadas,
      subtexto: total > 0
        ? `${Math.round((kpis.arquivadas / total) * 100)}% do total`
        : undefined,
      tooltip: React.createElement('p', { className: 'cg-tooltip__row' },
        React.createElement('span', null, 'Não ativas'),
        React.createElement('strong', null, kpis.arquivadas)
      ),
    },

    landed_cost_medio: {
      valor: kpis.landed_cost_medio > 0 ? brl(kpis.landed_cost_medio) : '—',
      subtexto: 'Média BRL por estimativa',
      tooltip: React.createElement('p', { className: 'cg-tooltip__row' },
        React.createElement('span', null, 'Inclui II · IPI · PIS · COFINS · ICMS'),
        React.createElement('strong', null, 'Landed Cost')
      ),
    },

    total_tributos_acum: {
      valor: kpis.total_tributos_acumulado > 0 ? brl(kpis.total_tributos_acumulado) : '—',
      subtexto: 'Soma de todas as estimativas',
      tooltip: React.createElement('p', { className: 'cg-tooltip__row' },
        React.createElement('span', null, 'II + IPI + PIS + COFINS + ICMS'),
        React.createElement('strong', null, brl(kpis.total_tributos_acumulado))
      ),
    },
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

import { useMemo } from 'react'

export function useCardValues(kpis: EstimativasKpis): Record<string, CardValor> {
  return useMemo(() => computeCardValues(kpis), [kpis])
}
