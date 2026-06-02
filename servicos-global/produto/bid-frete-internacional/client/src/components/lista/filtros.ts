/** Tipos de filtro da lista — espelho do Pedido (sem dependência cross-produto). */
export type FiltroTexto  = { tipo: 'texto';  valor: string }
export type FiltroEnum   = { tipo: 'enum';   valor: Set<string> }
export type FiltroNumero = { tipo: 'numero'; valor: { min?: number; max?: number } }
export type FiltroAtivo  = FiltroTexto | FiltroEnum | FiltroNumero
export type FiltrosAtivosMap = Record<string, FiltroAtivo>
