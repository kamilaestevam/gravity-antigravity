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
}
