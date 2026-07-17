/**
 * Valores das colunas personalizadas por leitura (localStorage até API Onda 3).
 */

export const STORAGE_KEY_VALORES_COLUNAS_PERSONALIZADAS_SMART_READ =
  'smart-read:colunas-personalizadas-valores-v1'

export type ValoresColunasPersonalizadasPorLeitura = Record<
  string,
  Record<string, string>
>

function carregarStore(): ValoresColunasPersonalizadasPorLeitura {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VALORES_COLUNAS_PERSONALIZADAS_SMART_READ)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (typeof parsed !== 'object' || parsed == null) return {}
    return parsed as ValoresColunasPersonalizadasPorLeitura
  } catch {
    return {}
  }
}

function gravarStore(store: ValoresColunasPersonalizadasPorLeitura): void {
  try {
    localStorage.setItem(STORAGE_KEY_VALORES_COLUNAS_PERSONALIZADAS_SMART_READ, JSON.stringify(store))
  } catch {
    /* quota / modo privado */
  }
}

export function lerValoresColunasPersonalizadasLeitura(
  idLeitura: string,
): Record<string, string> {
  return { ...(carregarStore()[idLeitura] ?? {}) }
}

export function salvarValorColunaPersonalizadaLeitura(
  idLeitura: string,
  colId: string,
  valor: string,
): Record<string, string> {
  const store = carregarStore()
  const atual = { ...(store[idLeitura] ?? {}) }
  const limpo = valor.trim()
  if (limpo) atual[colId] = limpo
  else delete atual[colId]
  store[idLeitura] = atual
  gravarStore(store)
  return atual
}

export function enriquecerComColunasPersonalizadas<T extends { id_leitura: string }>(
  item: T,
): T & { _colunas_personalizadas: Record<string, string> } {
  return {
    ...item,
    _colunas_personalizadas: lerValoresColunasPersonalizadasLeitura(item.id_leitura),
  }
}

export function enriquecerListaComColunasPersonalizadas<T extends { id_leitura: string }>(
  itens: T[],
): Array<T & { _colunas_personalizadas: Record<string, string> }> {
  return itens.map(enriquecerComColunasPersonalizadas)
}
