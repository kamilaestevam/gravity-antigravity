/** Preferências da aba Configurações → Colunas → Casas Decimais. */

export interface ColunaNumericaNativaBidFrete {
  campo: string
  label: string
  categoria: 'Frete' | 'Mercadoria'
  padrao: number
  itemHint?: string | null
}

export const COLUNAS_NUMERICAS_BID_FRETE: ColunaNumericaNativaBidFrete[] = [
  {
    campo: 'valor_frete_proposta_bid_frete_internacional',
    label: 'Valor do Frete',
    categoria: 'Frete',
    padrao: 2,
  },
  {
    campo: 'taxas_origem_proposta_bid_frete_internacional',
    label: 'Taxas de Origem',
    categoria: 'Frete',
    padrao: 2,
  },
  {
    campo: 'taxas_destino_proposta_bid_frete_internacional',
    label: 'Taxas de Destino',
    categoria: 'Frete',
    padrao: 2,
  },
  {
    campo: 'peso_kg_cotacao_bid_frete_internacional',
    label: 'Peso da Mercadoria (KG)',
    categoria: 'Mercadoria',
    padrao: 2,
  },
  {
    campo: 'cubagem_m3_cotacao_bid_frete_internacional',
    label: 'Cubagem (M³)',
    categoria: 'Mercadoria',
    padrao: 3,
  },
]

export const STORAGE_KEY_CASAS_BID_FRETE = 'bid-frete:config:casas-decimais'
export const SYNC_EVENT_CASAS_BID_FRETE = 'bid-frete:casas-updated'
export const CASAS_VERSION_BID_FRETE = 1
export const PADRAO_CASAS_COLUNA_PERSONALIZADA = 2

const GRUPOS_CASAS = ['Frete', 'Mercadoria'] as const

export const GRUPOS_CASAS_DECIMAIS_BID_FRETE = GRUPOS_CASAS

function defaultsCasasNativas(): Record<string, number> {
  return Object.fromEntries(COLUNAS_NUMERICAS_BID_FRETE.map(c => [c.campo, c.padrao]))
}

export function tipoColunaUsaCasasDecimais(tipo: string): boolean {
  return tipo === 'numero' || tipo === 'percentual' || tipo === 'formula'
}

export function carregarCasasDecimaisBidFrete(): Record<string, number> {
  const defaults = defaultsCasasNativas()
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CASAS_BID_FRETE)
    if (!raw) return defaults
    const parsed = JSON.parse(raw) as Record<string, number> & { _v?: number }
    if (parsed._v === CASAS_VERSION_BID_FRETE) {
      const { _v: _versao, ...values } = parsed
      return { ...defaults, ...values }
    }
    return { ...defaults, ...parsed }
  } catch {
    return defaults
  }
}

export function salvarCasasDecimaisBidFrete(config: Record<string, number>): void {
  localStorage.setItem(
    STORAGE_KEY_CASAS_BID_FRETE,
    JSON.stringify({ _v: CASAS_VERSION_BID_FRETE, ...config }),
  )
  window.dispatchEvent(new CustomEvent(SYNC_EVENT_CASAS_BID_FRETE))
}

export function getCasasDecimaisBidFrete(campo: string, padrao: number): number {
  const valor = carregarCasasDecimaisBidFrete()[campo]
  if (typeof valor !== 'number' || valor < 0 || valor > 8) return padrao
  return valor
}
