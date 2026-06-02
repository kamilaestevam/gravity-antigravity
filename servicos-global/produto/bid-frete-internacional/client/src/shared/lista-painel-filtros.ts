/**
 * Serialização de filtros da Lista para config_json do painel.
 */
import type { FiltroAtivo, FiltrosAtivosMap } from '../components/lista/filtros'
import type { FiltroAtivoSerializado } from '../../../shared/listaPainelConfigSchema'

export function serializarFiltrosLista(filtros: FiltrosAtivosMap): Record<string, FiltroAtivoSerializado> {
  const out: Record<string, FiltroAtivoSerializado> = {}
  for (const [campo, filtro] of Object.entries(filtros)) {
    if (filtro.tipo === 'enum') {
      out[campo] = { tipo: 'enum', valor: Array.from(filtro.valor) }
    } else {
      out[campo] = filtro
    }
  }
  return out
}

export function deserializarFiltrosLista(
  raw: Record<string, FiltroAtivoSerializado>,
): FiltrosAtivosMap {
  const out: FiltrosAtivosMap = {}
  for (const [campo, filtro] of Object.entries(raw)) {
    if (filtro.tipo === 'enum') {
      out[campo] = { tipo: 'enum', valor: new Set(filtro.valor) }
    } else {
      out[campo] = filtro as FiltroAtivo
    }
  }
  return out
}
