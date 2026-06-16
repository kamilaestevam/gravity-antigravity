import type { GTPreferencias } from '@nucleo/tabela-virtual-global'
import {
  CHAVES_COLUNAS_LISTA_FORNECEDOR,
  CHAVES_COLUNAS_PADRAO_VISIVEIS_FORNECEDOR,
} from '../pages/visao-fornecedor-bid-frete-internacional/colunas-lista-visao-fornecedor-bid-frete-internacional'

export const VERSAO_COLUNAS_LISTA_FORNECEDOR = 2
export const STORAGE_COLUNAS_VERSAO_FORNECEDOR = 'bid-frete-internacional:fornecedor:config:tabela_colunas_versao'
export const STORAGE_PREFS_TABELA_FORNECEDOR = 'bid-frete-internacional:fornecedor:config:tabela_preferencias'
export const STORAGE_PAINEL_ORDEM_COLUNAS_FORNECEDOR =
  'bid-frete-internacional:fornecedor:config:paineis_ordem_colunas_v'

export const COLUNAS_PADRAO_VISIVEIS_FORNECEDOR = CHAVES_COLUNAS_PADRAO_VISIVEIS_FORNECEDOR

function migrarPreferenciasColunasFornecedorSeNecessario(): void {
  try {
    const versaoSalva = Number(localStorage.getItem(STORAGE_COLUNAS_VERSAO_FORNECEDOR) ?? '0')
    if (versaoSalva >= VERSAO_COLUNAS_LISTA_FORNECEDOR) return
    localStorage.removeItem(STORAGE_PREFS_TABELA_FORNECEDOR)
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

    const colunasValidas = parsed.colunas_visiveis
      .filter(k => CHAVES_COLUNAS_LISTA_FORNECEDOR.includes(k))

    const hasCore = colunasValidas.includes('numero_cotacao_bid_frete_internacional')
    if (!hasCore || colunasValidas.length < 3) return undefined

    const visiveisSet = new Set([...colunasValidas])
    for (const padrao of CHAVES_COLUNAS_PADRAO_VISIVEIS_FORNECEDOR) {
      if (!visiveisSet.has(padrao)) visiveisSet.add(padrao)
    }
    const colunasVisiveis = CHAVES_COLUNAS_LISTA_FORNECEDOR.filter(k => visiveisSet.has(k))

    return { ...parsed, colunas_visiveis: colunasVisiveis }
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
