/**
 * Preferências de colunas da lista Processo — localStorage até API dedicada (Onda 7).
 */
import type { GTPreferencias } from '@nucleo/tabela-virtual-global'
import { COLUNAS_PADRAO_VISIVEIS } from './processoListaColunasConfig'

const STORAGE_KEY = 'processo:lista:preferencias_colunas'

export function carregarPreferenciasColunasProcesso(): GTPreferencias {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as GTPreferencias
      if (Array.isArray(parsed.colunas_visiveis) && parsed.colunas_visiveis.length > 0) {
        return parsed
      }
    }
  } catch { /* usa padrão */ }
  return { colunas_visiveis: [...COLUNAS_PADRAO_VISIVEIS] }
}

export function salvarPreferenciasColunasProcesso(prefs: GTPreferencias): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch { /* silent */ }
}
