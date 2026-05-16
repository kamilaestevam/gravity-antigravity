/**
 * @nucleo/botao-global — tipos
 * Definições de tipos do componente BotaoGlobal.
 */

/** Variante visual do botão */
export type BotaoVariante =
  | 'primario'    // fundo accent (azul sky) — ação principal
  | 'secundario'  // borda + transparente — ação secundária
  | 'perigo'      // vermelho — ação destrutiva
  | 'fantasma'    // sem fundo, texto muted — ação discreta

/** Tamanho do botão */
export type BotaoTamanho = 'padrao' | 'pequeno' | 'grande'

/** Resultado visual pós-ação */
export type ResultadoAcao = 'sucesso' | 'erro' | null

/** Props do BotaoGlobal */
export interface BotaoProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Variante visual. Padrão: 'primario' */
  variante?: BotaoVariante
  /** Tamanho. Padrão: 'padrao' */
  tamanho?: BotaoTamanho
  /** Ícone antes do label (qualquer ReactNode, ex: <Plus size={15} />) */
  icone?: React.ReactNode
  /** Ícone após o label */
  iconeDireita?: React.ReactNode
  /** Largura 100% do container */
  blocoCompleto?: boolean
  /** Centraliza o conteúdo (útil com blocoCompleto) */
  centralizado?: boolean
  /** Exibe ícone orbital Gravity no badge + shimmer na superfície. Auto-desabilita o botão */
  carregando?: boolean
  /** Texto exibido durante carregamento (ex: "Excluindo...", "Salvando..."). Se omitido, mantém o children */
  textoCarregando?: string
  /** Flash visual pós-ação: check verde (sucesso) ou X vermelho (erro) */
  resultadoAcao?: ResultadoAcao
}
