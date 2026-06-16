/**
 * Preferências de colunas da Lista BID Frete — localStorage + migração de ordem canônica (v6).
 */
import type { GTPreferencias } from '@nucleo/tabela-virtual-global'
import {
  normalizarColunasVisiveisListaBidFrete,
  ORDEM_COLUNAS_LISTA_BID_FRETE_INTERNACIONAL,
  ordemColunasVisiveisDivergeDaCanonica,
} from './ordem-colunas-lista-bid-frete-internacional'

/** Incrementar quando ordem/visibilidade padrão mudar — força realinhamento das prefs salvas. */
export const VERSAO_COLUNAS_LISTA_BID_FRETE = 6

export const STORAGE_COLUNAS_VERSAO_BID_FRETE = 'bid-frete-internacional:config:tabela_colunas_versao'
export const STORAGE_PREFS_TABELA_BID_FRETE = 'bid-frete-internacional:config:tabela_preferencias'
export const STORAGE_PREFS_TABELA_BID_FRETE_LEGADO = 'bid-frete:config:tabela_preferencias'
export const STORAGE_PAINEL_ORDEM_COLUNAS_BID_FRETE = 'bid-frete-internacional:config:paineis_ordem_colunas_v'

function lerPaineisOrdemColunasMigrados(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_PAINEL_ORDEM_COLUNAS_BID_FRETE)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((id): id is string => typeof id === 'string')
  } catch {
    return []
  }
}

function marcarPainelOrdemColunasMigrado(idPainel: string): void {
  try {
    const ids = lerPaineisOrdemColunasMigrados()
    if (ids.includes(idPainel)) return
    localStorage.setItem(
      STORAGE_PAINEL_ORDEM_COLUNAS_BID_FRETE,
      JSON.stringify([...ids, idPainel]),
    )
  } catch { /* storage indisponível */ }
}

export function migrarPreferenciasColunasListaBidFreteSeNecessario(): boolean {
  try {
    const versaoSalva = Number(localStorage.getItem(STORAGE_COLUNAS_VERSAO_BID_FRETE) ?? '1')
    if (versaoSalva >= VERSAO_COLUNAS_LISTA_BID_FRETE) return false
    localStorage.removeItem(STORAGE_PREFS_TABELA_BID_FRETE)
    localStorage.removeItem(STORAGE_PREFS_TABELA_BID_FRETE_LEGADO)
    localStorage.removeItem(STORAGE_PAINEL_ORDEM_COLUNAS_BID_FRETE)
    localStorage.setItem(
      STORAGE_COLUNAS_VERSAO_BID_FRETE,
      String(VERSAO_COLUNAS_LISTA_BID_FRETE),
    )
    return true
  } catch {
    return false
  }
}

export function lerPreferenciasTabelaListaBidFrete(
  chavesCatalogo: readonly string[] = ORDEM_COLUNAS_LISTA_BID_FRETE_INTERNACIONAL,
): GTPreferencias | undefined {
  migrarPreferenciasColunasListaBidFreteSeNecessario()
  try {
    let raw = localStorage.getItem(STORAGE_PREFS_TABELA_BID_FRETE)
    if (!raw) {
      raw = localStorage.getItem(STORAGE_PREFS_TABELA_BID_FRETE_LEGADO)
    }
    if (!raw) return undefined
    const parsed = JSON.parse(raw) as GTPreferencias
    if (!parsed || !Array.isArray(parsed.colunas_visiveis)) {
      return undefined
    }
    return {
      ...parsed,
      colunas_visiveis: normalizarColunasVisiveisListaBidFrete(
        parsed.colunas_visiveis,
        chavesCatalogo,
      ),
    }
  } catch {
    return undefined
  }
}

/**
 * Realinha ordem das colunas salvas no painel (uma vez por painel após bump de versão).
 * Retorna colunas normalizadas se migração aplicada; null se painel já migrado ou ordem ok.
 */
function lerPaineisOrdemColunasMigradosComStorage(storageKey: string): string[] {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((id): id is string => typeof id === 'string')
  } catch {
    return []
  }
}

function marcarPainelOrdemColunasMigradoComStorage(storageKey: string, idPainel: string): void {
  try {
    const ids = lerPaineisOrdemColunasMigradosComStorage(storageKey)
    if (ids.includes(idPainel)) return
    localStorage.setItem(storageKey, JSON.stringify([...ids, idPainel]))
  } catch { /* storage indisponível */ }
}

export function migrarOrdemColunasPainelListaBidFrete(
  idPainel: string,
  colunasVisiveis: readonly string[],
  chavesCatalogo: readonly string[] = ORDEM_COLUNAS_LISTA_BID_FRETE_INTERNACIONAL,
  storagePainelOrdemColunas: string = STORAGE_PAINEL_ORDEM_COLUNAS_BID_FRETE,
): string[] | null {
  if (colunasVisiveis.length === 0) return null
  migrarPreferenciasColunasListaBidFreteSeNecessario()
  if (lerPaineisOrdemColunasMigradosComStorage(storagePainelOrdemColunas).includes(idPainel)) return null
  if (!ordemColunasVisiveisDivergeDaCanonica(colunasVisiveis, chavesCatalogo)) {
    marcarPainelOrdemColunasMigradoComStorage(storagePainelOrdemColunas, idPainel)
    return null
  }
  const normalizadas = normalizarColunasVisiveisListaBidFrete(colunasVisiveis, chavesCatalogo)
  marcarPainelOrdemColunasMigradoComStorage(storagePainelOrdemColunas, idPainel)
  return normalizadas
}
