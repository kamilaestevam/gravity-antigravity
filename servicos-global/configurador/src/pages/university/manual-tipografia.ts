/**
 * SSOT — ritmo vertical e alinhamento dos manuais University Gravity (Login, Hub, Configurador…).
 *
 * Guia Gravity — modelo `/modelo-espacamento-guia`:
 * - H1 → linha roxa: 24px (`MANUAL_ESPACO_TITULO_LINHA_GUIA_PX` + ::after)
 * - linha roxa → 1º parágrafo: 18px (`MANUAL_ESPACO_APOS_LINHA_TITULO_GUIA_PX`)
 * - parágrafo / intro → primeiro passo / blocos padrão: 12px
 * - fim de um passo (tela) → próximo passo: 32px (`MANUAL_ESPACO_ENTRE_PASSOS_GUIA_PX`)
 * - bloco anterior → título de fluxo H2/H3: 32px (`MANUAL_ESPACO_ANTES_TITULO_FLUXO_GUIA_PX`)
 * - rótulo do infográfico ↔ primeiro card: 18px (`MANUAL_ESPACO_APOS_TITULO_INFOGRAFICO_GUIA_PX`)
 * - screenshot ↔ infográfico (mapa mental): 32px (`MANUAL_ESPACO_ANTES_TITULO_FLUXO_GUIA_PX`)
 * PlayerAula calcula o espaçamento externo dos blocos; componentes internos sem margin externa.
 */
export const MANUAL_ESPACO_PARAGRAFO_PX = 12

/** Guia Gravity — parágrafo ↔ parágrafo. (teste: alinhado a 12px) */
export const MANUAL_ESPACO_ENTRE_PARAGRAFOS_GUIA_PX = 12

/** Guia Gravity — título H1 ↔ linha sob o título. */
export const MANUAL_ESPACO_TITULO_LINHA_GUIA_PX = 24

/** Guia Gravity — após a linha do título ↔ primeiro parágrafo. */
export const MANUAL_ESPACO_APOS_LINHA_TITULO_GUIA_PX = 18

/** Guia Gravity — fim de um passo (screenshot) ↔ início do próximo passo. */
export const MANUAL_ESPACO_ENTRE_PASSOS_GUIA_PX = 32

/** Guia Gravity — callout / visual / texto ↔ título de fluxo (H2/H3, não passo). */
export const MANUAL_ESPACO_ANTES_TITULO_FLUXO_GUIA_PX = 32

/** Guia Gravity — rótulo superior do infográfico («Mapa mental…») ↔ primeiro card do diagrama. */
export const MANUAL_ESPACO_APOS_TITULO_INFOGRAFICO_GUIA_PX = MANUAL_ESPACO_APOS_LINHA_TITULO_GUIA_PX

/** Estilo SSOT do rótulo superior dos infográficos (mapa mental, diagramas). */
export const MANUAL_TITULO_INFOGRAFICO_ESTILO = {
  fontSize: '.68rem',
  fontWeight: 700,
  letterSpacing: '.08em',
  textTransform: 'uppercase' as const,
  color: 'var(--ws-muted,#94a3b8)',
  margin: 0,
  paddingBottom: MANUAL_ESPACO_APOS_TITULO_INFOGRAFICO_GUIA_PX,
}

/** Guia Gravity — recuo do texto do passo (padding à direita da linha vertical). */
export const MANUAL_PASSO_GUIA_RECUO_TEXTO_PX = 18

/** Guia Gravity — espessura da linha vertical do passo. */
export const MANUAL_PASSO_GUIA_BORDA_PX = 3

/**
 * Guia Gravity — título de bloco dentro de um fluxo (ex.: H2 «Tokens» → `rotuloPasso` «Cards do token»).
 * Use `rotuloPasso` no passo visual em vez de «Passo NN» quando o bloco é um assunto nomeado
 * (tela, cards, etapa temática), não uma sequência operacional numerada.
 * Layout: rótulo roxo maiúsculo + parágrafos com borda lateral indigo (`.uni-player-aula__passo-corpo`)
 * — a borda não envolve galeria/screenshot; estes ficam em `.uni-player-aula__passo-galeria` abaixo.
 * A borda lateral vale só no bloco de **Passo NN** ou **título** (`rotuloPasso`); instruções
 * operacionais (ex.: «Escolha 7 dias…» em `paragrafoAntes` sem `**NN.**`) ficam em texto simples, sem borda.
 *
 * Abas principais (ex.: **Cards**, **Tabela**) são **H2 de fluxo** no corpo — não usam `rotuloPasso`.
 *
 * Seção crítica no Guia: `destaqueRotuloPassoGuia` no passo visual aplica
 * `.uni-player-aula__passo-corpo--destaque` (brilho indigo) — usar só onde o conteúdo marcar.
 *
 * Sequência texto + screenshot no mesmo título (`figurasAposParagrafo`):
 * - texto → screenshot na mesma etapa: 12px (`MANUAL_ESPACO_PARAGRAFO_PX`)
 * - fim da screenshot → próxima instrução: 32px (`MANUAL_ESPACO_ENTRE_PASSOS_GUIA_PX`)
 */

/**
 * Guia Gravity — margem esquerda do screenshot/galeria/dica no passo.
 * 0 = alinhados à linha vertical (sem recuo extra). CSS: `.uni-player-aula__bloco-passo > …`
 */
export const MANUAL_PASSO_GUIA_MARGEM_ESQUERDA_IMAGEM_PX = 0

/** Guia Gravity — margem esquerda de callout no passo (igual à imagem). */
export const MANUAL_PASSO_GUIA_MARGEM_ESQUERDA_CALLOUT_PX =
  MANUAL_PASSO_GUIA_MARGEM_ESQUERDA_IMAGEM_PX

/** Marcação rich text — ver MANUAL-GRAVITY-ONBOARDING.md §9.7 e skill manual-markdown-rich-text */
export const MANUAL_MARKUP_NEGRITO_BOTAO = '**'
/** Frase literal da UI (link, checkbox, placeholder, modal) — itálico semi-negrito no render */
export const MANUAL_MARKUP_ITALICO_LITERAL_UI = '*_'

/** Guia PlayerAula — menu lateral de tópicos (paridade com `.uni-player-aula__article`). */
export const MANUAL_GUIA_NAV_LARGURA_PX = 280
export const MANUAL_GUIA_NAV_PADDING_TOP_PX = 32
export const MANUAL_GUIA_NAV_PADDING_HORIZONTAL_PX = 24
export const MANUAL_GUIA_NAV_GAP_ITENS_PX = MANUAL_ESPACO_PARAGRAFO_PX
export const MANUAL_GUIA_NAV_VOLTAR_MARGEM_INFERIOR_PX = MANUAL_ESPACO_PARAGRAFO_PX
export const MANUAL_GUIA_NAV_CABECALHO_AULA_PADDING_INFERIOR_PX = MANUAL_ESPACO_PARAGRAFO_PX

/** Parágrafos dentro de subtópico em acordeão — respiro extra para leitura confortável. */
export const MANUAL_ESPACO_PARAGRAFO_ACORDEAO_PX = 16

/** Espaço entre o cabeçalho clicável do subtópico e o primeiro parágrafo/conteúdo. */
export const MANUAL_ESPACO_APOS_CABECALHO_ACORDEAO_PX = 16

/** Espaço entre bloco de texto e screenshot em subtópico recolhível. */
export const MANUAL_ESPACO_ANTES_IMAGEM_ACORDEAO_PX = 6

/**
 * REGRA ÚNICA — vão (margem medida) entre uma frase introdutória e a imagem/figura
 * que ela apresenta. Fonte da verdade para todo par «frase → print/infográfico».
 * Não usar valores ad hoc; sempre referenciar esta constante.
 */
export const MANUAL_ESPACO_FRASE_IMAGEM_PX = 4

/**
 * REGRA ÚNICA — vão (margem medida) entre o fim de uma imagem/figura e o próximo texto.
 * Complementa `MANUAL_ESPACO_FRASE_IMAGEM_PX` (sentido inverso). Não usar valores ad hoc.
 */
export const MANUAL_ESPACO_IMAGEM_FRASE_PX = 12

/** Subtópico acordeão — sem recuo lateral (alinhado a infográficos e galerias). */
export const MANUAL_ACORDEON_CORPO_PADDING_LATERAL_PX = 0

/** Raio de chips/badges nos manuais (igual aos cards Versão · Produto · URL). */
export const MANUAL_RAIO_CHIP = 10

/** Alinhamento do corpo narrativo (parágrafos e callouts) em todos os manuais descritivos. */
export const MANUAL_ALINHAMENTO_CORPO = 'justify' as const

/** Tipografia base do corpo (sem cor — aplicar MANUAL_CORPO_70 no componente). */
export const MANUAL_CORPO_TIPOGRAFIA = {
  fontSize: '.9rem',
  lineHeight: 1.8,
  textAlign: MANUAL_ALINHAMENTO_CORPO,
  textJustify: 'inter-word',
} as const

/** Tipografia do Guia Gravity — mesma do manual (corpo justificado, SSOT §9.1.2). */
export const MANUAL_GUIA_CORPO_TIPOGRAFIA = {
  fontSize: MANUAL_CORPO_TIPOGRAFIA.fontSize,
  lineHeight: MANUAL_CORPO_TIPOGRAFIA.lineHeight,
  textAlign: MANUAL_ALINHAMENTO_CORPO,
  textJustify: 'inter-word' as const,
} as const

/** Grid 50/50 texto + screenshot nas intros laterais (evita coluna estreita que impede justificar). */
export const MANUAL_GRID_TEXTO_IMAGEM = 'minmax(300px, 1fr) minmax(300px, 1fr)' as const

/** Altura fixa da legenda chip+texto em grades 3 colunas (Igual/Divergente/Vazio alinhados). */
export const MANUAL_ALTURA_LEGENDA_CHIP_GRADE_PX = 96

/** Edição em massa passo 1 — legendas mais curtas (nível Pedido/Item/Combinado). */
export const MANUAL_ALTURA_LEGENDA_CHIP_EDICAO_MASSA_NIVEL_PX = 48

/** Edição em massa passo 1 — legendas com texto em duas linhas (texto/select/+ campo). */
export const MANUAL_ALTURA_LEGENDA_CHIP_EDICAO_MASSA_CAMPO_PX = 72

/** Espaço entre o fim de um passo visual e a linha divisória do passo seguinte (≈ paddingTop do passo). */
export const MANUAL_ESPACO_ENTRE_PASSOS_PX = 22

/** Parágrafo → infográfico/card full-width em subtópico acordeão (paridade margem inferior do card). */
export const MANUAL_ESPACO_ANTES_INFOGRAFICO_ACORDEAO_PX = MANUAL_ESPACO_ENTRE_PASSOS_PX

/** Gap horizontal entre colunas em galerias PASSO (prints lado a lado). */
export const MANUAL_ESPACO_GRADE_GALERIA_PX = 24

/** Gap entre cards de capítulo no acordeão (doc-sec-N) e entre subtópicos de 1º nível (ex.: 4.01, 4.02). */
export const MANUAL_ACORDEON_SECAO_GAP_PX = MANUAL_ESPACO_ENTRE_PASSOS_PX

/** Hierarquia visual — subtópicos aninhados no acordeão (ex.: Cotação avulsa → Manual → Marítimo). */
export const MANUAL_ACORDEON_SUBTOPICO_RECUO_NIVEL_PX = 22
export const MANUAL_ACORDEON_SUBTOPICO_PADDING_ESQUERDA_PX = 20
export const MANUAL_ACORDEON_SUBTOPICO_MARGEM_TOPO_PX = 28
export const MANUAL_ACORDEON_SUBTOPICO_GAP_PX = MANUAL_ESPACO_ENTRE_PASSOS_PX
export const MANUAL_ACORDEON_SUBTOPICO_COR_LINHA = 'rgba(129,140,248,.38)'
export const MANUAL_ACORDEON_SUBTOPICO_BORDA_ESQUERDA = `2px dotted ${MANUAL_ACORDEON_SUBTOPICO_COR_LINHA}`

/** Sumário — árvore de subcapítulos (paridade visual com acordeão aninhado). */
export const MANUAL_SUMARIO_SUBTOPICO_RECUO_PX = 18
export const MANUAL_SUMARIO_SUBTOPICO_GAP_PX = MANUAL_ESPACO_ENTRE_PASSOS_PX
export const MANUAL_SUMARIO_SUBTOPICO_GAP_ANINHADO_PX = 8
export const MANUAL_SUMARIO_SUBTOPICO_MARGEM_GRUPO_PX = 14
export const MANUAL_SUMARIO_SUBTOPICO_MARGEM_FILHO_PX = 6

/** Retorna margin-bottom: 12px entre parágrafos, 0 no último de cada bloco. */
export function manualMargemParagrafo(indice: number, total: number): number {
  return indice < total - 1 ? MANUAL_ESPACO_PARAGRAFO_PX : 0
}

/** Parágrafo seguido de callout no mesmo índice: sem margin-bottom (o callout define o respiro). */
export function manualMargemParagrafoAntesCallout(
  indice: number,
  total: number,
  indiceCallout?: number,
): number {
  if (indiceCallout === indice) return 0
  return manualMargemParagrafo(indice, total)
}

/** Callout entre parágrafos: 12px acima e abaixo quando há parágrafo depois. */
export function manualMargemCalloutAposParagrafo(indiceCallout: number, totalParagrafos: number): {
  marginTop: number
  marginBottom: number
} {
  return {
    marginTop: MANUAL_ESPACO_PARAGRAFO_PX,
    marginBottom: indiceCallout < totalParagrafos - 1 ? MANUAL_ESPACO_PARAGRAFO_PX : 0,
  }
}
