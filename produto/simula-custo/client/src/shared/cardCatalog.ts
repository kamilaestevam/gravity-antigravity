/**
 * cardCatalog.ts — Catálogo de cards do SimulaCusto
 *
 * Cada entrada representa uma métrica que pode virar card na tela principal.
 * Derivado dos campos KPI da API + colunas da tabela de estimativas.
 *
 * tipoAgg: como o valor é calculado (exibido no catálogo de configurações)
 * variante: cor padrão do card (pode ser sobrescrita no dashboard)
 */

export type TipoAgg = 'Contagem' | 'Soma' | 'Média' | 'Mais Recente'
export type CardVarianteCatalog = 'padrao' | 'sucesso' | 'aviso' | 'perigo'

export interface CardDefinicao {
  id:        string
  label:     string
  descricao: string
  iconeKey:  string
  cor:       string
  tipoAgg:   TipoAgg
  variante:  CardVarianteCatalog
}

// ─── Catálogo completo ────────────────────────────────────────────────────────
// Ordem = ordem padrão no catálogo de configurações

export const CARDS_CATALOGO: CardDefinicao[] = [
  {
    id:        'total',
    label:     'Total',
    descricao: 'Número total de estimativas criadas',
    iconeKey:  'calculator',
    cor:       'var(--ws-accent, #818cf8)',
    tipoAgg:   'Contagem',
    variante:  'padrao',
  },
  {
    id:        'em_criacao',
    label:     'Em Criação',
    descricao: 'Estimativas ainda em elaboração',
    iconeKey:  'trend-up',
    cor:       '#fbbf24',
    tipoAgg:   'Contagem',
    variante:  'aviso',
  },
  {
    id:        'criadas',
    label:     'Criadas',
    descricao: 'Estimativas finalizadas e aprovadas',
    iconeKey:  'check-circle',
    cor:       '#34d399',
    tipoAgg:   'Contagem',
    variante:  'sucesso',
  },
  {
    id:        'arquivadas',
    label:     'Arquivadas',
    descricao: 'Estimativas arquivadas (não ativas)',
    iconeKey:  'archive',
    cor:       '#94a3b8',
    tipoAgg:   'Contagem',
    variante:  'padrao',
  },
  {
    id:        'landed_cost_medio',
    label:     'Landed Cost Médio',
    descricao: 'Média do custo total de importação (BRL)',
    iconeKey:  'currency-dollar',
    cor:       '#34d399',
    tipoAgg:   'Média',
    variante:  'sucesso',
  },
  {
    id:        'total_tributos_acum',
    label:     'Total Tributos',
    descricao: 'Soma acumulada de todos os tributos (II, IPI, PIS, COFINS, ICMS)',
    iconeKey:  'scales',
    cor:       '#f59e0b',
    tipoAgg:   'Soma',
    variante:  'aviso',
  },
]

// ─── Padrão para novos usuários ───────────────────────────────────────────────

export const CARDS_PADRAO: string[] = [
  'total',
  'em_criacao',
  'criadas',
  'landed_cost_medio',
]
