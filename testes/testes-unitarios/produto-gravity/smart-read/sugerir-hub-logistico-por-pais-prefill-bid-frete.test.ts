import { describe, expect, it } from 'vitest'
import {
  normalizarCodigoPaisIso2Prefill,
  sugerirHubLogisticoPorPaisPrefillBidFrete,
} from '../../../../servicos-global/produto/smart-read/shared/sugerir-hub-logistico-por-pais-prefill-bid-frete'

describe('sugerir-hub-logistico-por-pais-prefill-bid-frete', () => {
  it('normaliza Hong Kong por nome completo para HK', () => {
    expect(normalizarCodigoPaisIso2Prefill('Hong Kong')).toBe('HK')
    expect(normalizarCodigoPaisIso2Prefill('HONG KONG')).toBe('HK')
  })

  it('sugere porto/aeroporto de Hong Kong quando o documento não trouxe hub', () => {
    const hub = sugerirHubLogisticoPorPaisPrefillBidFrete('Hong Kong')
    expect(hub?.porto_unlocode).toBe('HKHKG')
    expect(hub?.aeroporto_iata).toBe('HKG')
  })

  it('mantém Brasil → Santos', () => {
    expect(sugerirHubLogisticoPorPaisPrefillBidFrete('BR')?.porto_unlocode).toBe('BRSSZ')
    expect(sugerirHubLogisticoPorPaisPrefillBidFrete('Brasil')?.porto_unlocode).toBe('BRSSZ')
  })
})
