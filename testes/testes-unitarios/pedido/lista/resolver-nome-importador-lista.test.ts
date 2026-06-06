// @vitest-environment node
import { describe, it, expect } from 'vitest'
import {
  resolverNomeImportadorLista,
  pareceIdInternoGravity,
} from '../../../../servicos-global/produto/pedido/shared/resolverNomeImportadorLista.js'
import { mapPedido } from '../../../../servicos-global/produto/processos-core/src/routes/pedidos.js'

const ID_WS = 'cmosr1zc70001v2hfp3bxax4s'

describe('resolverNomeImportadorLista', () => {
  it('rejeita CUID como nome em importação', () => {
    expect(
      resolverNomeImportadorLista({
        tipo_operacao_pedido: 'importacao',
        id_workspace: ID_WS,
        nomeDetalhes: ID_WS,
        nomeWorkspace: 'CDE EXPORTADOR',
      }),
    ).toBe('CDE EXPORTADOR')
  })

  it('rejeita CUID como nome em exportação', () => {
    expect(
      resolverNomeImportadorLista({
        tipo_operacao_pedido: 'exportacao',
        id_workspace: ID_WS,
        nomeDetalhes: ID_WS,
        nomeSnapshotImportador: 'Gravity Comercio Importacao Ltda',
      }),
    ).toBe('Gravity Comercio Importacao Ltda')
  })

  it('pareceIdInternoGravity detecta CUID', () => {
    expect(pareceIdInternoGravity(ID_WS)).toBe(true)
    expect(pareceIdInternoGravity('CDE EXPORTADOR')).toBe(false)
  })
})

describe('mapPedido — nome_importador corrompido (U-MAP-IMP)', () => {
  it('U-MAP-IMP-01: importação não expõe CUID de detalhes quando há snapshot legível', () => {
    const out = mapPedido({
      id_pedido: 'pedi_1',
      tipo_operacao_pedido: 'importacao',
      id_workspace: ID_WS,
      detalhes_operacionais_pedido: { nome_importador: ID_WS },
      snapshots_empresa_pedido: [{ papel: 'importador', nome_empresa: 'CDE EXPORTADOR' }],
      itens_pedido: [],
    })
    expect(out?.nome_importador).toBe('CDE EXPORTADOR')
  })

  it('U-MAP-IMP-02: importação retorna null se só há CUID (front resolve via workspace)', () => {
    const out = mapPedido({
      id_pedido: 'pedi_2',
      tipo_operacao_pedido: 'importacao',
      id_workspace: ID_WS,
      detalhes_operacionais_pedido: { nome_importador: ID_WS },
      itens_pedido: [],
    })
    expect(out?.nome_importador).toBeNull()
  })

  it('U-MAP-EXP-01: exportação prioriza snapshot fornecedor sobre workspace em detalhes', () => {
    const out = mapPedido({
      id_pedido: 'pedi_3',
      tipo_operacao_pedido: 'exportacao',
      id_workspace: ID_WS,
      detalhes_operacionais_pedido: { nome_importador: 'CDE EXPORTADOR' },
      snapshots_empresa_pedido: [{ papel: 'importador', nome_empresa: 'Gravity Comercio Importacao Ltda' }],
      itens_pedido: [],
    })
    expect(out?.nome_importador).toBe('Gravity Comercio Importacao Ltda')
  })
})
