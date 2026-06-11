/** Rotas workspace de Processos que exibem seletor de produtos no shell padrão. */
export const ROTA_PROCESSO_COM_SWITCHER =
  /^\/acesso-processos\/(?:lista|kanban|insights|dashboard)\/?$/

export function rotaTemSeletorProdutosProcesso(pathname: string): boolean {
  return ROTA_PROCESSO_COM_SWITCHER.test(pathname)
}
