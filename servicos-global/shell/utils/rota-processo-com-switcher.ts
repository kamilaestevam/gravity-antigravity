import { isRotaDetalheProcesso } from '../is-rota-detalhe-processo'

/** Rotas workspace de Processos (lista, kanban, insights, dashboard). */
export const ROTA_PROCESSO_COM_SWITCHER =
  /^\/(?:acesso-processos|processo)\/(?:lista|kanban|insights|dashboard)\/?$/

/** Shell padrão: seletor de produtos em workspace e detalhe do processo (mesmo padrão do Pedido). */
export function rotaTemSeletorProdutosProcesso(pathname: string): boolean {
  if (ROTA_PROCESSO_COM_SWITCHER.test(pathname)) return true
  return isRotaDetalheProcesso(pathname)
}
