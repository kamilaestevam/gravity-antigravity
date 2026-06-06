import { describe, expect, it } from 'vitest'
import { resolverSegmentoDetalhe } from '../../../../servicos-global/produto/processo/client/src/pages/resolver-segmento-detalhe-processo'

describe('resolverSegmentoDetalhe', () => {
  it('resolve detalhe legado workflow', () => {
    expect(resolverSegmentoDetalhe('/processo/detalhe/workflow')).toEqual({
      slug: '',
      segmento: 'workflow',
      modo: 'legado',
    })
  })

  it('resolve detalhe legado pedidos/resumo', () => {
    expect(resolverSegmentoDetalhe('/processo/detalhe/pedidos/resumo')).toEqual({
      slug: '',
      segmento: 'pedidos/resumo',
      modo: 'legado',
    })
  })

  it('resolve lista por slug', () => {
    expect(resolverSegmentoDetalhe('/processo/lista/processo-0000126/dados-tecnicos')).toEqual({
      slug: 'processo-0000126',
      segmento: 'dados-tecnicos',
      modo: 'lista',
    })
  })

  it('resolve lista por slug em acesso-processos', () => {
    expect(resolverSegmentoDetalhe('/acesso-processos/lista/processo-imp20260150/workflow')).toEqual({
      slug: 'processo-imp20260150',
      segmento: 'workflow',
      modo: 'lista',
    })
  })
})
