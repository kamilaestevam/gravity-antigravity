// FiltrosColuna/tipos.ts
//
// Tipos e props públicos do subsistema de filtros de coluna (chips + popover).
// Refactor D9 (2026-05-13): promovido de produtos/pedido para nucleo-global
// para reuso por outros produtos (LPCO, NF Importação, etc.).
//
// Política de exports: tipos aqui declarados viram CONTRATO público. Mudança
// breaking exige refactor de todos os consumers. Pensar 2x antes de alterar.

import type React from 'react'
import type { GTColuna } from '../tipos'

// ─── Estado de filtro ────────────────────────────────────────────────────────

/**
 * Filtro ativo de uma coluna. Discriminated union pelo campo `tipo`:
 *
 * - `'texto'`: filtro de texto livre (substring)
 * - `'enum'`: filtro de múltipla seleção (Set de valores)
 * - `'numero'`: filtro de intervalo (min/max opcionais)
 *
 * LIMITAÇÃO: `Set<string>` em `enum.valor` NÃO é JSON-serializável.
 * `JSON.stringify(new Set(['a']))` retorna `'{}'` (perde os valores).
 * Se algum consumer precisar persistir o filtro (localStorage, URL, sessionStorage),
 * deve converter para `Array` antes (`Array.from(set)`) e reconstruir o Set
 * ao ler. Esta limitação é aceita por ora — refatorar para `Array` só se
 * virar dor real (princípio YAGNI).
 */
export type FiltroAtivo =
  | { tipo: 'texto'; valor: string }
  | { tipo: 'enum'; valor: Set<string> }
  | { tipo: 'numero'; valor: { min?: number; max?: number } }

/**
 * Mapa coluna→filtro ativo. A chave é o `col.key` da coluna sendo filtrada.
 */
export type FiltrosAtivosMap = Record<string, FiltroAtivo>

// ─── Tipo de filtro detectado ────────────────────────────────────────────────

/**
 * 3 modos de input que o popover suporta. Decididos por `detectarTipoColuna`
 * a partir do `GTColuna.tipo` + overrides do consumer.
 */
export type FiltroTipo = 'texto' | 'numero' | 'enum'

// ─── Traduções i18n (opcional) ───────────────────────────────────────────────

/**
 * Strings traduzíveis usadas pelos componentes. Default em pt-BR.
 * Quando outro produto precisar en-US ou outro idioma, passar override via
 * prop `traducoes` em FiltroChips / FiltroPopoverColuna.
 *
 * Refactor futuro (quando i18n virar dor): trocar por hook `useTranslation()`
 * com namespace `nucleo.filtros-coluna`. Por ora, props mantêm independência
 * do react-i18next.
 */
export interface FiltroTraducoes {
  /** "Selecionar tudo" */
  selecionarTudo: string
  /** "Limpar seleção" */
  limparSelecao: string
  /** "× Limpar filtro" */
  limparFiltro: string
  /** "Limpar tudo" (limpar todos os filtros da toolbar) */
  limparTodos: string
  /** "Aplicar" */
  aplicar: string
  /** "Cresc." */
  ordenarAsc: string
  /** "Decresc." */
  ordenarDesc: string
  /** "Filtrar por" */
  filtrarPor: string
  /** "Buscar..." */
  buscar: string
  /** "Mín" */
  minimo: string
  /** "Máx" */
  maximo: string
  /** "(vazio)" — placeholder para valores vazios */
  vazio: string
  /** "(nenhum)" — placeholder no chip quando filtro enum tem Set vazio */
  nenhum: string
  /** "Nenhum valor encontrado" */
  nenhumValor: string
  /**
   * Texto de "N selecionados" no chip consolidado. Recebe `n` para interpolação.
   * Ex: `(n) => \`${n} selecionados\``
   */
  nSelecionados: (n: number) => string
}

export const FILTRO_TRADUCOES_PT_BR: FiltroTraducoes = {
  selecionarTudo: 'Selecionar tudo',
  limparSelecao: 'Limpar seleção',
  limparFiltro: '× Limpar filtro',
  limparTodos: 'Limpar tudo',
  aplicar: 'Aplicar',
  ordenarAsc: 'Cresc.',
  ordenarDesc: 'Decresc.',
  filtrarPor: 'FILTRAR POR',
  buscar: 'Buscar...',
  minimo: 'Mín',
  maximo: 'Máx',
  vazio: '(vazio)',
  nenhum: '(nenhum)',
  nenhumValor: 'Nenhum valor encontrado',
  nSelecionados: (n) => `${n} selecionados`,
}

// ─── Props do FiltroChips ────────────────────────────────────────────────────

/**
 * Props de `<FiltroChips>` — renderiza N chips na toolbar para cada filtro ativo.
 *
 * Genérico `<T,>` (com vírgula trailing) para evitar ambiguidade com tag JSX
 * em arquivos .tsx — padrão Gravity para componentes React genéricos.
 */
export interface FiltroChipsProps<T> {
  /** Lista de colunas (mesma estrutura passada ao TabelaVirtualGlobal) */
  colunas: ReadonlyArray<GTColuna<T>>
  /** Estado atual de filtros aplicados */
  filtrosAtivos: FiltrosAtivosMap
  /** Callback para limpar UM filtro específico (botão `×` do chip) */
  onLimparFiltro: (campo: string) => void
  /** Callback para limpar TODOS os filtros (botão "Limpar tudo" da toolbar) */
  onLimparTodos: () => void
  /**
   * Callback para abrir o popover do filtro ancorado no chip. Quando ausente,
   * o chip não é clicável (apenas read-only + botão de remover).
   */
  onEditarFiltro?: (key: string, anchor: HTMLElement) => void
  /**
   * Threshold de consolidação para enum. Quando o número de valores selecionados
   * passa deste limite, o chip mostra "N selecionados" em vez dos nomes.
   * Default: 2 (mostra 1-2 nomes, consolida a partir de 3).
   */
  thresholdConsolidar?: number
  /** Traduções opcionais (default pt-BR via `FILTRO_TRADUCOES_PT_BR`) */
  traducoes?: Partial<FiltroTraducoes>
  /**
   * Conteúdo opcional renderizado ANTES dos chips de filtro (ex: chip de busca
   * livre do produto Pedido). Permite composição sem que o nucleo-global
   * precise saber de busca.
   */
  prefixo?: React.ReactNode
}

// ─── Props do FiltroPopoverColuna ────────────────────────────────────────────

/**
 * Props de `<FiltroPopoverColuna>` — popover ancorado no header da coluna OU
 * no chip ativo, para edição/seleção do filtro de uma coluna específica.
 *
 * 10 props obrigatórias é verboso, mas mantém o contrato explícito. Coordenador
 * decidiu não agregar em controller único (YAGNI até virar dor real).
 */
export interface FiltroPopoverColunaProps {
  /** Chave da coluna sendo filtrada (`col.key`) */
  campo: string
  /** Rótulo amigável da coluna (já resolvido por `col.rotulo ?? col.label`) */
  label: string
  /** Tipo de input — decide o modo do popover */
  tipo: FiltroTipo
  /** Filtro atual aplicado (ou undefined se nenhum) */
  filtroAtual: FiltroAtivo | undefined
  /** Lista de valores distintos para o modo enum (vem do consumer) */
  valoresUnicos: ReadonlyArray<string>
  /** Aplica um filtro novo OU atualiza o existente */
  onAplicar: (campo: string, filtro: FiltroAtivo) => void
  /** Remove o filtro da coluna */
  onLimpar: (campo: string) => void
  /** Ordena a coluna (asc/desc) */
  onOrdenar: (campo: string, dir: 'asc' | 'desc') => void
  /** Fecha o popover (sem aplicar nada) */
  onFechar: () => void
  /** Ref do elemento âncora (header da coluna OU chip clicado) */
  anchorRef: React.RefObject<HTMLElement>
  /**
   * Mapa label→raw para inverter valores que o popover exibe com tradução
   * vs. os que o backend espera. Pedido usa para `tipo_operacao`
   * (`'Importação'` → `'importacao'`). Outros produtos podem omitir.
   */
  labelInverso?: Record<string, string>
  /** Traduções opcionais (default pt-BR via `FILTRO_TRADUCOES_PT_BR`) */
  traducoes?: Partial<FiltroTraducoes>
  /** Z-index do popover (default 9999) */
  zIndex?: number
}
