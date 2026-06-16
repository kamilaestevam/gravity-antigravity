/**
 * Oportunidades ocultas na lista do fornecedor (localStorage até rota dedicada no backend).
 */
const STORAGE_IDS_OCULTOS_FORNECEDOR =
  'bid-frete-internacional:fornecedor:lista:ids_oportunidades_ocultas'

export function lerIdsOportunidadesOcultasFornecedor(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_IDS_OCULTOS_FORNECEDOR)
    if (!raw) return new Set()
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return new Set()
    return new Set(parsed.filter((id): id is string => typeof id === 'string'))
  } catch {
    return new Set()
  }
}

export function ocultarOportunidadesFornecedor(ids: readonly string[]): void {
  if (ids.length === 0) return
  try {
    const set = lerIdsOportunidadesOcultasFornecedor()
    for (const id of ids) set.add(id)
    localStorage.setItem(STORAGE_IDS_OCULTOS_FORNECEDOR, JSON.stringify([...set]))
  } catch { /* storage indisponível */ }
}
