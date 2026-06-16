import type { GTPreferencias } from '@nucleo/tabela-virtual-global'
import { CHAVES_COLUNAS_LISTA_FORNECEDOR } from '../pages/visao-fornecedor-bid-frete-internacional/colunas-lista-visao-fornecedor-bid-frete-internacional'
import {
  CHAVES_COLUNAS_PADRAO_VISIVEIS_FORNECEDOR,
  normalizarColunasVisiveisListaFornecedorBidFrete,
  ORDEM_COLUNAS_LISTA_FORNECEDOR_BID_FRETE_INTERNACIONAL,
} from './ordem-colunas-lista-fornecedor-bid-frete-internacional'

/** Incrementar quando ordem/visibilidade padrão mudar — força realinhamento das prefs salvas. */
export const VERSAO_COLUNAS_LISTA_FORNECEDOR = 4
export const STORAGE_COLUNAS_VERSAO_FORNECEDOR = 'bid-frete-internacional:fornecedor:config:tabela_colunas_versao'
export const STORAGE_PREFS_TABELA_FORNECEDOR = 'bid-frete-internacional:fornecedor:config:tabela_preferencias'
export const STORAGE_PAINEL_ORDEM_COLUNAS_FORNECEDOR =
  'bid-frete-internacional:fornecedor:config:paineis_ordem_colunas_v'

export const COLUNAS_PADRAO_VISIVEIS_FORNECEDOR = [...CHAVES_COLUNAS_PADRAO_VISIVEIS_FORNECEDOR]

function migrarPreferenciasColunasFornecedorSeNecessario(): void {
  try {
    const versaoSalva = Number(localStorage.getItem(STORAGE_COLUNAS_VERSAO_FORNECEDOR) ?? '0')
    if (versaoSalva >= VERSAO_COLUNAS_LISTA_FORNECEDOR) return
    localStorage.removeItem(STORAGE_PREFS_TABELA_FORNECEDOR)
    localStorage.removeItem(STORAGE_PAINEL_ORDEM_COLUNAS_FORNECEDOR)
    localStorage.setItem(STORAGE_COLUNAS_VERSAO_FORNECEDOR, String(VERSAO_COLUNAS_LISTA_FORNECEDOR))
  } catch { /* storage indisponível */ }
}

export function lerPreferenciasTabelaFornecedor(): GTPreferencias | undefined {
  migrarPreferenciasColunasFornecedorSeNecessario()
  try {
    const raw = localStorage.getItem(STORAGE_PREFS_TABELA_FORNECEDOR)
    if (!raw) return undefined
    const parsed = JSON.parse(raw) as GTPreferencias
    if (!parsed || !Array.isArray(parsed.colunas_visiveis)) return undefined

    return {
      ...parsed,
      colunas_visiveis: normalizarColunasVisiveisListaFornecedorBidFrete(
        parsed.colunas_visiveis,
        ORDEM_COLUNAS_LISTA_FORNECEDOR_BID_FRETE_INTERNACIONAL,
        CHAVES_COLUNAS_PADRAO_VISIVEIS_FORNECEDOR,
      ),
    }
  } catch {
    return undefined
  }
}

export function salvarPreferenciasTabelaFornecedor(prefs: GTPreferencias): void {
  try {
    localStorage.setItem(STORAGE_COLUNAS_VERSAO_FORNECEDOR, String(VERSAO_COLUNAS_LISTA_FORNECEDOR))
    localStorage.setItem(STORAGE_PREFS_TABELA_FORNECEDOR, JSON.stringify(prefs))
  } catch { /* ignore */ }
}

export { CHAVES_COLUNAS_LISTA_FORNECEDOR as CHAVES_CATALOGO_COLUNAS_FORNECEDOR }
