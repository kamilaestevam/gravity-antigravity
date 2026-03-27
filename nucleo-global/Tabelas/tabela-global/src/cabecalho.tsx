/**
 * @nucleo/tabela-global — cabecalho
 * CabeçalhoTabela: células de th com controle de ordenação.
 * CSS variables do design system Solid Slate.
 */

import React from 'react'
import { useTranslation } from 'react-i18next'
import type { Coluna, EstadoOrdenacao, DirecaoOrdenacao, RegistroTabela } from './tipos.js'

interface CabecalhoTabelaProps<T extends RegistroTabela> {
  colunas: Coluna<T>[]
  ordenacao: EstadoOrdenacao | null
  aoOrdenar: (coluna: string, direcao: DirecaoOrdenacao) => void
  selecao?: boolean
  todosSelecionados: boolean
  aoSelecionarTodos: (selecionado: boolean) => void
  temAcoesLinha?: boolean
}


export function CabecalhoTabela<T extends RegistroTabela>({
  colunas,
  ordenacao,
  aoOrdenar,
  selecao,
  todosSelecionados,
  aoSelecionarTodos,
  temAcoesLinha,
}: CabecalhoTabelaProps<T>) {
  const { t } = useTranslation()
  const handleOrdenar = (key: string, ordenavel: boolean | undefined) => {
    if (!ordenavel) return
    if (ordenacao?.coluna === key) {
      aoOrdenar(key, ordenacao.direcao === 'asc' ? 'desc' : 'asc')
    } else {
      aoOrdenar(key, 'asc')
    }
  }

  return (
    <thead className="tg-cabecalho">
      <tr>
        {selecao && (
          <th className="tg-th tg-th--checkbox">
            <input
              type="checkbox"
              className="tg-checkbox"
              checked={todosSelecionados}
              onChange={(e) => aoSelecionarTodos(e.target.checked)}
              aria-label={t('tabela.selecionar_todos')}
            />
          </th>
        )}
        {colunas.filter((c) => !c.oculta).map((coluna) => {
          const ativa = ordenacao?.coluna === coluna.key
          return (
            <th
              key={coluna.key}
              className={`tg-th ${coluna.ordenavel ? 'tg-th--ordenavel' : ''} ${ativa ? 'tg-th--ativa' : ''}`}
              style={{
                textAlign: coluna.alinhamento ?? 'left',
                minWidth: coluna.larguraMin ? `${coluna.larguraMin}px` : undefined,
                width: coluna.largura,
              }}
              onClick={() => handleOrdenar(coluna.key, coluna.ordenavel)}
              aria-sort={ativa ? (ordenacao?.direcao === 'asc' ? 'ascending' : 'descending') : undefined}
            >
              <span className="tg-th-conteudo">
                {coluna.label}
              </span>
            </th>
          )
        })}
        {temAcoesLinha && (
          <th className="tg-th tg-th--acoes">
            <span className="sr-only">{t('tabela.acoes')}</span>
          </th>
        )}
      </tr>
    </thead>
  )
}
