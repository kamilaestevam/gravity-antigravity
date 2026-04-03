/**
 * cardCatalog.ts — catálogo de métricas do Demo
 * Dados genéricos — sem vínculo com nenhum produto real.
 */

export interface CardDefinicao {
  id:        string
  label:     string
  descricao: string
  tipoAgg:   string
  origem:    string
}

export const CARDS_CATALOGO: CardDefinicao[] = [
  { id: 'total',       label: 'Total',        descricao: 'Total de registros',         tipoAgg: 'Contagem', origem: 'Demo' },
  { id: 'ativos',      label: 'Ativos',       descricao: 'Registros em estado ativo',  tipoAgg: 'Contagem', origem: 'Demo' },
  { id: 'andamento',   label: 'Em Andamento', descricao: 'Em processamento',           tipoAgg: 'Contagem', origem: 'Demo' },
  { id: 'concluidos',  label: 'Concluídos',   descricao: 'Finalizados com sucesso',    tipoAgg: 'Contagem', origem: 'Item' },
  { id: 'valor_total', label: 'Valor Total',  descricao: 'Soma acumulada dos valores', tipoAgg: 'Soma',     origem: 'Item' },
  { id: 'media',       label: 'Média',        descricao: 'Valor médio por registro',   tipoAgg: 'Média',    origem: 'Item' },
]

/** IDs exibidos por padrão na primeira vez */
export const CARDS_PADRAO = ['total', 'ativos', 'andamento', 'valor_total']
