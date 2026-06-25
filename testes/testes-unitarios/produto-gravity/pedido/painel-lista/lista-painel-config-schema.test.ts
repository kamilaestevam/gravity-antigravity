import { describe, expect, it } from 'vitest'
import {
  configListaPainelPadraoV1,
  listaPainelConfigV1Schema,
  parsearConfigListaPainel,
  serializarConfigListaPainel,
} from '../../../../../servicos-global/produto/pedido/shared/listaPainelConfigSchema.js'

describe('listaPainelConfigV1Schema', () => {
  it('aceita payload v1 válido', () => {
    const config = configListaPainelPadraoV1({
      colunas_visiveis: ['numero_pedido', 'status'],
      aba_status_ativa: 'aberto',
      filtros_coluna: {
        status: { tipo: 'enum', valor: ['aberto'] },
      },
      ordenacao: { campo: 'data_emissao_pedido', direcao: 'desc' },
      busca: 'ABC',
    })
    const raw = serializarConfigListaPainel(config)
    expect(parsearConfigListaPainel(raw)).toEqual(config)
  })

  it('rejeita versao diferente de 1', () => {
    expect(() =>
      listaPainelConfigV1Schema.parse({
        versao: 2,
        colunas_visiveis: [],
        aba_status_ativa: 'todos',
        filtros_coluna: {},
        ordenacao: { campo: 'x', direcao: 'asc' },
      }),
    ).toThrow()
  })

  it('rejeita ids_workspaces_escopo no v1', () => {
    expect(() =>
      listaPainelConfigV1Schema.parse({
        versao: 1,
        colunas_visiveis: [],
        aba_status_ativa: 'todos',
        filtros_coluna: {},
        ordenacao: { campo: 'x', direcao: 'asc' },
        ids_workspaces_escopo: ['ws1'],
      }),
    ).toThrow()
  })
})
