import type { GTAbaTipo, GTFiltroStatusToolbar } from '../tipos.js'

export type { GTFiltroStatusToolbar }

/**
 * Resolve chip de status ativo a partir das abas da faixa de navegação.
 * Retorna `undefined` quando a aba "todos/todas" está selecionada.
 */
export function resolverFiltroStatusToolbar(
  abas: ReadonlyArray<GTAbaTipo>,
  abaAtiva: string,
  valorTodos: string,
  onMudarAba: (valor: string) => void,
  rotuloCampo = 'Status',
): GTFiltroStatusToolbar | undefined {
  if (!abaAtiva || abaAtiva === valorTodos) return undefined

  const aba = abas.find((item) => item.valor === abaAtiva)
  if (!aba) return undefined

  return {
    rotuloCampo,
    rotuloValor: aba.label,
    onRemover: () => onMudarAba(valorTodos),
    ariaLabelRemover: `Remover filtro ${rotuloCampo}`,
  }
}
