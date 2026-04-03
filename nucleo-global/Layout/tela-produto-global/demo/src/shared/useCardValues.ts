/**
 * useCardValues — mapeia cardId → valor de exibição (dados mock para o Demo)
 * Sem API — valores fixos para demonstrar o padrão visual.
 */

import React, { useMemo } from 'react'

export interface CardValor {
  valor:     React.ReactNode
  subtexto?: React.ReactNode
  tooltip?:  React.ReactNode
}

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

/** Dados mock — representam qualquer domínio de produto */
const MOCK = {
  total:       248,
  ativos:      187,
  andamento:    43,
  concluidos:  156,
  valor_total: 1_480_320.5,
  media:       5_969.84,
}

export function computeCardValues(): Record<string, CardValor> {
  const total = MOCK.total

  return {
    total: {
      valor: total,
      subtexto: `${MOCK.ativos} ativos · ${MOCK.andamento} em andamento`,
      tooltip: React.createElement(React.Fragment, null,
        React.createElement('p', { className: 'cg-tooltip__row' },
          React.createElement('span', null, 'Ativos'),
          React.createElement('strong', null, MOCK.ativos),
        ),
        React.createElement('p', { className: 'cg-tooltip__row' },
          React.createElement('span', null, 'Em Andamento'),
          React.createElement('strong', null, MOCK.andamento),
        ),
        React.createElement('p', { className: 'cg-tooltip__row' },
          React.createElement('span', null, 'Concluídos'),
          React.createElement('strong', null, MOCK.concluidos),
        ),
      ),
    },

    ativos: {
      valor: MOCK.ativos,
      subtexto: `${Math.round((MOCK.ativos / total) * 100)}% do total`,
      tooltip: React.createElement('p', { className: 'cg-tooltip__row' },
        React.createElement('span', null, 'Registros em estado ativo'),
        React.createElement('strong', null, MOCK.ativos),
      ),
    },

    andamento: {
      valor: MOCK.andamento,
      subtexto: `${Math.round((MOCK.andamento / total) * 100)}% do total`,
      tooltip: React.createElement('p', { className: 'cg-tooltip__row' },
        React.createElement('span', null, 'Aguardando processamento'),
        React.createElement('strong', null, MOCK.andamento),
      ),
    },

    concluidos: {
      valor: MOCK.concluidos,
      subtexto: `${Math.round((MOCK.concluidos / total) * 100)}% do total`,
      tooltip: React.createElement('p', { className: 'cg-tooltip__row' },
        React.createElement('span', null, 'Finalizados com sucesso'),
        React.createElement('strong', null, MOCK.concluidos),
      ),
    },

    valor_total: {
      valor: brl(MOCK.valor_total),
      subtexto: 'Soma de todos os registros',
      tooltip: React.createElement('p', { className: 'cg-tooltip__row' },
        React.createElement('span', null, 'Valor acumulado'),
        React.createElement('strong', null, brl(MOCK.valor_total)),
      ),
    },

    media: {
      valor: brl(MOCK.media),
      subtexto: 'Média por registro',
      tooltip: React.createElement('p', { className: 'cg-tooltip__row' },
        React.createElement('span', null, 'Valor médio'),
        React.createElement('strong', null, brl(MOCK.media)),
      ),
    },
  }
}

export function useCardValues(): Record<string, CardValor> {
  return useMemo(() => computeCardValues(), [])
}
