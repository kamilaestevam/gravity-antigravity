import { describe, expect, it } from 'vitest'
import {
  resolverResponsavelAcertoDocumentoInsights,
  resolverTiposResponsaveisDocumentoInsights,
} from '../../../../servicos-global/produto/smart-read/client/src/pages/insights-smart-read/mapear-participante-insights-smart-read.ts'

describe('Smart Read — responsável pelo acerto (emissor do documento)', () => {
  it('Invoice e Packing atribuem acerto ao exportador', () => {
    expect(resolverTiposResponsaveisDocumentoInsights('invoice')).toEqual(['exportador'])
    expect(resolverTiposResponsaveisDocumentoInsights('packing_list')).toEqual(['exportador'])

    const responsavel = resolverResponsavelAcertoDocumentoInsights('invoice', {
      exportador: 'Shenzhen Export Co.',
      importador: 'Importadora Brasil SA',
      agente_carga: 'Maersk',
    })

    expect(responsavel).toEqual({ tipo: 'exportador', nome: 'Shenzhen Export Co.' })
  })

  it('BL e AWB atribuem acerto ao agente de carga — não ao shipper/exportador', () => {
    expect(resolverTiposResponsaveisDocumentoInsights('bl')).toEqual(['agente_carga'])
    expect(resolverTiposResponsaveisDocumentoInsights('awb')).toEqual(['agente_carga'])

    const responsavel = resolverResponsavelAcertoDocumentoInsights('bl', {
      exportador: 'Asia Shipping LTDA',
      importador: 'Importadora Brasil SA',
      agente_carga: 'Maersk Logistics BR',
    })

    expect(responsavel).toEqual({ tipo: 'agente_carga', nome: 'Maersk Logistics BR' })
  })

  it('Financeiro usa despachante, agente, transportadora ou armazém (primeiro encontrado)', () => {
    expect(resolverTiposResponsaveisDocumentoInsights('financeiro')).toEqual([
      'despachante_aduaneiro',
      'agente_carga',
      'transportadora_rodoviaria',
      'armazem_alfandegado',
    ])

    expect(
      resolverResponsavelAcertoDocumentoInsights('financeiro', {
        transportadora_rodoviaria: 'Rodoviária Express',
        despachante_aduaneiro: 'Despachos Sul ME',
      }),
    ).toEqual({ tipo: 'despachante_aduaneiro', nome: 'Despachos Sul ME' })

    expect(
      resolverResponsavelAcertoDocumentoInsights('financeiro', {
        transportadora_rodoviaria: 'Rodoviária Express',
        agente_carga: 'Kuehne+Nagel',
      }),
    ).toEqual({ tipo: 'agente_carga', nome: 'Kuehne+Nagel' })
  })
})
