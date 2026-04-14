/**
 * @nucleo/tabela-virtual-global — tipos
 * Tabela virtualizada com hierarquia 3 níveis: Processo → Pedido → Item.
 * Suporta até 1 milhão de linhas com TanStack Virtual.
 */

import type { ReactNode, MutableRefObject } from 'react'

// ─── Alinhamento ───────────────────────────────────────────────────────────────

export type GTAlign = 'left' | 'center' | 'right'

// ─── Tipo de dado (define modo de filtro) ─────────────────────────────────────

export type GTTipo = 'texto' | 'numero' | 'periodo' | 'badge' | 'custom' | 'moeda' | 'unidade'

// ─── Opção de unidade de medida ────────────────────────────────────────────────

/** String simples (legado) ou objeto com sigla + rótulo para exibição completa */
export type GTUnidadeOpcao = string | { sigla: string; rotulo: string }

// ─── Valores compostos ─────────────────────────────────────────────────────────

export interface GTValorMoeda {
  currency: string
  amount: number
}

export interface GTValorUnidade {
  unit: string
  quantity: number
}

// ─── Coluna ────────────────────────────────────────────────────────────────────

export interface GTColuna<T = unknown> {
  /** Identificador único da coluna (usado para sort, filtro, preferências) */
  key: string
  /** Rótulo exibido no cabeçalho */
  label: string
  /** Cor CSS do texto do rótulo no cabeçalho (ex: '#60a5fa') */
  labelColor?: string
  /** Tipo do dado — define o modo de filtro */
  tipo?: GTTipo
  align?: GTAlign
  tooltipTitulo?: string
  tooltipDescricao?: string
  /** Função de renderização customizada */
  render?: (valor: unknown, item: T) => ReactNode
  /** Coluna oculta por padrão */
  oculta?: boolean
  /** Impede que a coluna seja ocultada pelo usuário */
  naoOcultavel?: boolean
  /** Exibe ícone de filtro no cabeçalho */
  filtravel?: boolean
  /** Permite ordenação ao clicar no cabeçalho */
  sortavel?: boolean
  /** Permite edição inline (sobrepõe camposEditaveis da prop raiz). Função recebe a linha e retorna se editável — quando false, bloqueia mesmo que a coluna esteja em camposEditaveis */
  editavel?: boolean | ((item: T) => boolean)
  /** Tooltip exibido quando a célula está bloqueada (editavel retorna false ou coluna não editável) */
  tooltipBloqueado?: string | ((item: T) => string | undefined)
  /**
   * Opções de escolha para edição inline.
   * Quando definido, o popover exibe uma lista selecionável em vez de um input de texto.
   */
  opcoes?: { valor: string; label: string }[]
  /** Grupo de agrupamento exibido no gerenciador de colunas */
  grupo?: string
  /** Códigos ISO 4217 disponíveis no seletor (ativo quando tipo='moeda') */
  moedas?: GTUnidadeOpcao[]
  /** Unidades disponíveis no seletor (ativo quando tipo='unidade') */
  unidades?: GTUnidadeOpcao[]
  /** Casas decimais usadas no input de quantidade (ativo quando tipo='unidade') */
  casasDecimais?: number
  /**
   * Extrai o valor composto para edição inline (ex: { currency, amount }).
   * Quando omitido, usa item[col.key] diretamente.
   */
  getValorEditar?: (item: T) => unknown
  /**
   * Chave do campo para o ícone ✦ GABI no popover de edição inline.
   * Quando definido, exibe o ícone ao lado do label do campo no popover.
   */
  gabiCampo?: string
  /** Endpoint GABI para este campo (default: /api/v1/pedidos/gabi/field-help) */
  gabiEndpoint?: string
  /**
   * Converte o valor bruto para a string exibida na tela, usada pelo find-in-page.
   * Necessário quando `render` exibe um label diferente do valor bruto
   * (ex: badge que traduz 'importacao' → 'Importação').
   * Quando omitido, o scanner usa a conversão padrão por tipo.
   */
  findDisplay?: (item: T) => string
}

// ─── Ação de linha ─────────────────────────────────────────────────────────────

export interface GTAcao<T = unknown> {
  id: string
  tooltip?: string
  icone?: ReactNode
  /** Renderização completamente customizada do botão */
  renderCustom?: (item: T) => ReactNode
  /** Mostra apenas quando true */
  visivel?: (item: T) => boolean
  /** Variante de cor */
  variant?: 'default' | 'danger'
  onClick?: (item: T) => void
}

// ─── Ação de linha filho (menu de três pontos) ────────────────────────────────

export interface GTAcaoLinha {
  label: string
  icone?: ReactNode
  onClick: () => void
  perigo?: boolean
}

// ─── Ação em lote ──────────────────────────────────────────────────────────────

export interface GTAcaoLote<T = unknown> {
  id: string
  label: string
  icone?: ReactNode
  variant?: 'default' | 'danger'
  onClick: (itens: T[]) => void
}

// ─── Ação de exportação ────────────────────────────────────────────────────────

export interface GTAcaoExport {
  label: string
  icone?: ReactNode
  onClick: () => void
}

// ─── Configuração de filtro ────────────────────────────────────────────────────

export interface GTFiltroConfig<T = unknown> {
  campo: keyof T & string
  label: string
  tipo: GTTipo
  /** Valores disponíveis para filtros do tipo 'texto' ou 'badge' */
  opcoes?: string[]
}

// ─── Filtros ativos ────────────────────────────────────────────────────────────

export type GTFiltrosAtivos = Record<
  string,
  Set<string> | { min: string; max: string } | { inicio: string; fim: string }
>

// ─── Aba de status ─────────────────────────────────────────────────────────────

export interface GTAbaTipo {
  /** Valor passado para onMudarAba */
  valor: string
  /** Rótulo exibido */
  label: string
  /** Contagem opcional exibida como badge */
  contagem?: number
  /** Cor do badge */
  cor?: string
}

// ─── Preferências de colunas (salvas por usuário) ─────────────────────────────

export interface GTPreferencias {
  /** Keys das colunas visíveis, na ordem exibida */
  colunas_visiveis: string[]
}

// ─── Linha virtual interna ─────────────────────────────────────────────────────

export type GTLinhaVirtual<T, C> =
  | { tipo: 'pai'; item: T; profundidade: 0; id: string }
  | { tipo: 'filho'; item: C; paiId: string; profundidade: 1; id: string }

// ─── Mapa de colunas filho ─────────────────────────────────────────────────────

export interface GTMapaColunasFilho<C = unknown> {
  /** Renderiza o conteúdo da célula na linha filho */
  render: (item: C) => ReactNode
  /** Se true ou função que retorna true: a célula é editável inline no filho. Função tem prioridade sobre camposEditaveisFilhos */
  editavel?: boolean | ((item: C) => boolean)
  /** Tooltip exibido quando a célula filho está bloqueada */
  tooltipBloqueado?: string | ((item: C) => string | undefined)
  /** Campo do item filho usado no inline edit (default: usa o key da coluna pai) */
  campo?: string
  /** Transforma o item filho no valor inicial de edição (ex: GTValorMoeda para colunas moeda) */
  getValorEditar?: (item: C) => unknown
  /** Casas decimais usadas no input de quantidade (ativo quando tipo='unidade') */
  casasDecimais?: number
  /** Unidades disponíveis no seletor (ativo quando tipo='unidade') */
  unidades?: GTUnidadeOpcao[]
}

// ─── Handle imperativo ────────────────────────────────────────────────────────

/**
 * Ref imperativo exposto pelo TabelaVirtualGlobal.
 * Permite que o pai dispare ações programáticas na tabela.
 */
export interface GTVirtualHandle {
  /** Abre a edição inline na célula pai indicada */
  iniciarEdicao: (id: string, campo: string, valorAtual: unknown) => void
}

// ─── Props principais ──────────────────────────────────────────────────────────

export interface GTVirtualTableProps<T = unknown, C = never> {
  // ── Dados ──────────────────────────────────────────────────────────────────
  dados: T[]
  colunas: GTColuna<T>[]
  /** Extrai o id único de cada item pai (padrão: (item) => (item as Record<string,unknown>).id as string) */
  itemId?: (item: T) => string

  // ── Hierarquia (opcional) ──────────────────────────────────────────────────
  /** Definição das colunas das linhas filhas */
  colunasFilhas?: GTColuna<C>[]
  /**
   * Mapeia keys de colunas PAI → renderização nas linhas filho.
   * Quando fornecido, linhas filho usam as mesmas colunas (ordem/visibilidade) do pai.
   * Colunas sem mapeamento ficam vazias na linha filho.
   */
  mapaColunasFilho?: Record<string, GTMapaColunasFilho<C>>
  /** Carrega os filhos de um item pai sob demanda */
  onCarregarFilhos?: (item: T) => Promise<C[]>
  /** Chamado quando o número de linhas expandidas muda (0 = todas retraídas) */
  onExpandidosMudar?: (count: number) => void
  /** Extrai uma versão estável do pai (ex: timestamp do servidor).
   *  Quando fornecido, filhos só são recarregados se a versão mudar,
   *  evitando reload após atualizações puramente locais de estado. */
  itemVersion?: (item: T) => unknown
  /** Extrai o id único de cada filho */
  filhoId?: (filho: C) => string
  /** Ações de linha para filhos */
  acoesFilhas?: GTAcao<C>[]

  // ── Paginação ──────────────────────────────────────────────────────────────
  /** Itens por página no modo interno (padrão: 50). Ignorado no modo externo. */
  itensPorPagina?: number
  /**
   * Modo externo: total de itens no servidor.
   * Quando fornecido, o componente assume que `dados` já é a página atual
   * e delega o controle de página para `onMudarPagina`.
   */
  totalItens?: number
  /** Modo externo: página atual (1-based). */
  paginaAtual?: number
  /** Modo externo: chamado quando o usuário troca de página. */
  onMudarPagina?: (pagina: number) => void
  /**
   * Rótulo singular/plural para a linha pai no rodapé de paginação.
   * Ex: `['pedido', 'pedidos']`. Quando fornecido junto com `totalFilhos`,
   * o rodapé exibe "X pedidos Y itens · página N de N".
   */
  labelPai?: [string, string]
  /** Contagem de registros filhos (ex: total de itens de pedido) exibida no rodapé. */
  totalFilhos?: number

  // ── Abas de status ─────────────────────────────────────────────────────────
  abas?: GTAbaTipo[]
  abaAtiva?: string
  onMudarAba?: (aba: string) => void

  // ── Ações ──────────────────────────────────────────────────────────────────
  acoes?: GTAcao<T>[]
  acoesLote?: GTAcaoLote<T>[]
  acoesExportacao?: GTAcaoExport[]
  /** Slot livre no toolbar (ex: botão "Novo") */
  acoesBarra?: ReactNode
  /** Chamado sempre que a seleção muda — expõe os itens selecionados ao pai */
  onSelecaoMudar?: (selecionados: T[]) => void

  // ── Seleção e ações de itens filho ─────────────────────────────────────────
  /** Habilita checkbox nas linhas filho */
  selecionavelFilhos?: boolean
  /** Callback chamado quando seleção de filhos muda */
  onSelecaoFilho?: (itensSelecionados: C[]) => void
  /** Ações inline na linha filho (menu de três pontos ao hover) */
  acoesFilho?: (item: C) => GTAcaoLinha[]
  /** Conteúdo do conector hierárquico na expand cell do filho (padrão: └) */
  renderConectorFilho?: (item: C) => ReactNode

  // ── Busca, filtros e ordenação ─────────────────────────────────────────────
  onBuscar?: (termo: string) => void
  /**
   * Quando `true`, o campo de busca opera em modo find-in-page:
   * varre os dados carregados (sem chamar `onBuscar` durante digitação).
   * Padrão: `false` (comportamento legado — chama `onBuscar` a cada keystroke).
   */
  modoLocalizar?: boolean
  /**
   * Chamado quando findProximo atinge o último match da última linha e há
   * próxima página disponível. Quando ausente, o comportamento é wrap-around
   * dentro da página atual (comportamento original).
   */
  onFindProximaPagina?: () => void
  /**
   * Chamado quando findAnterior atinge o primeiro match e há página anterior
   * disponível. Quando ausente, o comportamento é wrap-around dentro da página
   * atual (comportamento original). Ao navegar para a página anterior, o foco
   * vai automaticamente para o último match da nova página.
   */
  onFindPaginaAnterior?: () => void
  /**
   * Chamado quando o termo de busca (find-in-page) muda.
   * O pai deve buscar o total de matches no servidor e retorná-lo via `findTotalExterno`.
   */
  onFindTermoChange?: (termo: string) => void
  /**
   * Total global de matches (todas as páginas) fornecido pelo pai após pré-scan.
   * Quando presente, substitui o contador local no find bar e no rodapé.
   */
  findTotalExterno?: number | null
  placeholderBusca?: string
  onFiltrar?: (filtros: GTFiltrosAtivos) => void
  onOrdenar?: (campo: string, dir: 'asc' | 'desc') => void
  /** Chamado quando o usuário clica no ícone de funil de uma coluna filtrável */
  onFiltroColuna?: (key: string, anchorEl: HTMLElement) => void
  /** Conjunto de keys de colunas com filtro ativo — exibe o funil preenchido */
  filtrosAtivosKeys?: Set<string>
  sortCampo?: string
  sortDir?: 'asc' | 'desc'

  // ── Edição inline (pai) ────────────────────────────────────────────────────
  /** Keys das colunas pai que permitem edição inline */
  camposEditaveis?: string[]
  /**
   * Chamado ao confirmar edição de linha pai. Deve retornar o item atualizado.
   * Em caso de conflito (409), lançar erro — o componente faz rollback.
   */
  onEditar?: (id: string, campo: string, valor: unknown) => Promise<T>

  // ── Edição inline (filho) ──────────────────────────────────────────────────
  /** Keys das colunas filho que permitem edição inline */
  camposEditaveisFilhos?: string[]
  /**
   * Chamado ao confirmar edição de linha filha. Deve retornar o filho atualizado.
   */
  onEditarFilho?: (id: string, campo: string, valor: unknown) => Promise<C>

  // ── Callbacks de feedback (pai + filho) ────────────────────────────────────
  /** Chamado após qualquer edição inline salva com sucesso */
  onSalvoComSucesso?: () => void
  /** Chamado após qualquer edição inline falhar — recebe a mensagem de erro */
  onErroAoSalvar?: (mensagem: string) => void

  // ── Preferências de colunas ────────────────────────────────────────────────
  preferencias?: GTPreferencias
  onSalvarPreferencias?: (prefs: GTPreferencias) => void
  /** Keys na sequência padrão — usadas pelo botão "Restaurar padrão" no gerenciador de colunas */
  colunasPadrao?: string[]

  // ── Handle imperativo ─────────────────────────────────────────────────────
  /**
   * Ref preenchida com o handle imperativo da tabela.
   * Permite ao pai chamar `iniciarEdicao(id, campo, valor)` para abrir
   * a edição inline programaticamente (ex: navegação via Kanban).
   */
  imperativeRef?: MutableRefObject<GTVirtualHandle | null>

  // ── Visual ─────────────────────────────────────────────────────────────────
  carregando?: boolean
  emptyIcon?: ReactNode
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: ReactNode

  // ── Acessibilidade ─────────────────────────────────────────────────────────
  ariaLabel?: string

  // ── Localização ────────────────────────────────────────────────────────────
  /**
   * Placeholder exibido no input de edição de colunas com tipo 'periodo'.
   * Padrão: 'DD/MM/AAAA'. Injetar o formato configurado pelo tenant para que
   * o input de data mostre o padrão correto (ex: 'MM/DD/AAAA' para tenants EUA).
   */
  placeholderData?: string
}
