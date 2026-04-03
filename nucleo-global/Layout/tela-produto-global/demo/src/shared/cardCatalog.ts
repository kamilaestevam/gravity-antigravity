/**
 * cardCatalog.ts — catálogo de métricas do Demo
 * Dados genéricos — sem vínculo com nenhum produto real.
 */

export interface CardDefinicao {
  id:        string
  label:     string
  descricao: string
  tipoAgg:   string
}

export const CARDS_CATALOGO: CardDefinicao[] = [
  { id: 'total',       label: 'Total',         descricao: 'Total de registros',          tipoAgg: 'Contagem' },
  { id: 'ativos',      label: 'Ativos',         descricao: 'Registros em estado ativo',   tipoAgg: 'Contagem' },
  { id: 'andamento',   label: 'Em Andamento',   descricao: 'Em processamento',            tipoAgg: 'Contagem' },
  { id: 'concluidos',  label: 'Concluídos',     descricao: 'Finalizados com sucesso',     tipoAgg: 'Contagem' },
  { id: 'valor_total', label: 'Valor Total',    descricao: 'Soma acumulada dos valores',  tipoAgg: 'Soma'     },
  { id: 'media',       label: 'Média',          descricao: 'Valor médio por registro',    tipoAgg: 'Média'    },
]

/** IDs exibidos por padrão na primeira vez */
export const CARDS_PADRAO = ['total', 'ativos', 'andamento', 'valor_total']
