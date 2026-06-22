/**
 * persistencia-preferencias-lista-smart-read.ts
 *
 * Persistência das preferências da lista do Smart Read (colunas visíveis, ordem,
 * largura e filtros por coluna). Hoje usa localStorage; a interface
 * `RepositorioPreferenciasLista` permite trocar por API de painel (Onda 3) sem
 * mexer na UI.
 */
import type { GTPreferencias } from '@nucleo/tabela-virtual-global'
import type { FiltroAtivo, FiltrosAtivosMap } from '@nucleo/tabela-virtual-global'

const CHAVE_STORAGE = 'smart-read:lista-preferencias-v1'

/** Filtro serializável (Set vira array — Set não é JSON-serializável). */
export type FiltroSerializado =
  | { tipo: 'texto'; valor: string }
  | { tipo: 'enum'; valor: string[] }
  | { tipo: 'numero'; valor: { min?: number; max?: number } }

export type PreferenciasListaSmartRead = {
  versao: 1
  colunas_visiveis: string[]
  colunas_largura?: Record<string, number>
  filtros_coluna: Record<string, FiltroSerializado>
}

export interface RepositorioPreferenciasLista {
  carregar: () => PreferenciasListaSmartRead | null
  salvar: (prefs: PreferenciasListaSmartRead) => void
}

export function serializarFiltros(filtros: FiltrosAtivosMap): Record<string, FiltroSerializado> {
  const saida: Record<string, FiltroSerializado> = {}
  for (const [campo, f] of Object.entries(filtros)) {
    if (f.tipo === 'enum') saida[campo] = { tipo: 'enum', valor: Array.from(f.valor) }
    else saida[campo] = f
  }
  return saida
}

export function desserializarFiltros(
  filtros: Record<string, FiltroSerializado> | undefined,
): FiltrosAtivosMap {
  const saida: FiltrosAtivosMap = {}
  if (!filtros) return saida
  for (const [campo, f] of Object.entries(filtros)) {
    if (f.tipo === 'enum') saida[campo] = { tipo: 'enum', valor: new Set(f.valor) } as FiltroAtivo
    else saida[campo] = f as FiltroAtivo
  }
  return saida
}

export function preferenciasParaGT(prefs: PreferenciasListaSmartRead | null): GTPreferencias | undefined {
  if (!prefs) return undefined
  return {
    colunas_visiveis: prefs.colunas_visiveis,
    colunas_largura: prefs.colunas_largura,
  }
}

/** Repositório baseado em localStorage (default atual). */
export function criarRepositorioPreferenciasListaLocal(): RepositorioPreferenciasLista {
  return {
    carregar() {
      if (typeof window === 'undefined') return null
      try {
        const bruto = window.localStorage.getItem(CHAVE_STORAGE)
        if (!bruto) return null
        const parsed = JSON.parse(bruto) as PreferenciasListaSmartRead
        if (parsed?.versao !== 1 || !Array.isArray(parsed.colunas_visiveis)) return null
        return {
          versao: 1,
          colunas_visiveis: parsed.colunas_visiveis,
          colunas_largura: parsed.colunas_largura ?? {},
          filtros_coluna: parsed.filtros_coluna ?? {},
        }
      } catch {
        return null
      }
    },
    salvar(prefs) {
      if (typeof window === 'undefined') return
      try {
        window.localStorage.setItem(CHAVE_STORAGE, JSON.stringify(prefs))
      } catch {
        // silencioso — preferência é melhoria, não bloqueia a lista
      }
    },
  }
}
