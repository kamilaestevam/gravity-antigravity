export interface LogoGlobalProps {
  /**
   * Classe CSS opcional para envolver o logo
   */
  className?: string;
  /**
   * Se verdadeiro, renderiza apenas o ícone. Caso contrário, renderiza ícone e escrita.
   * O padrão é false.
   */
  iconOnly?: boolean;
  /**
   * Tamanho do ícone (largura/altura) em pixels. O padrão é 28.
   */
  iconSize?: number;
  /**
   * Cor do ícone CSS (HEX, RGBA, ou var). Se omitido, usa a cor do contexto ou herda (currentColor).
   */
  iconColor?: string;
  /**
   * Se deve ocultar a escrita visualmente.
   */
  hideText?: boolean;
}
