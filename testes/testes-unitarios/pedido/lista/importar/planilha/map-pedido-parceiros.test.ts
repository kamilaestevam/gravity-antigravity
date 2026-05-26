// @vitest-environment node
// TST-UNIT-PEDIDO-IMPORTAR-PLANILHA — mapPedido + JSON extras (U-MAP)
import { describe, it, expect } from 'vitest'
import { mapPedido } from '../../../../../../servicos-global/produto/processos-core/src/routes/pedidos.js'
import { superficiarCamposJsonPedido } from '../../../../../../servicos-global/produto/pedido/shared/camposJsonPedidoLista.js'

describe('superficiarCamposJsonPedido (U-JSON)', () => {
  it('U-JSON-01: expõe fabricante e contatos do JSON importado', () => {
    const out = superficiarCamposJsonPedido(
      {
        nome_fabricante: 'KONGSBERG',
        pais_fabricante: 'NO',
        exportador_ou_fabricante: 'Fabricante',
        email_contato_exportador: 'buyer@example.com',
      },
      { codigo_ope: 'OPE-1' },
    )
    expect(out.nome_fabricante).toBe('KONGSBERG')
    expect(out.pais_fabricante).toBe('NO')
    expect(out.exportador_ou_fabricante).toBe('Fabricante')
    expect(out.email_contato_exportador).toBe('buyer@example.com')
    expect(out.codigo_ope).toBe('OPE-1')
  })
})

describe('mapPedido — parceiros pós Smart Import (U-MAP)', () => {
  it('U-MAP-01: expõe nome_fabricante de dados_extras_importacao_pedido', () => {
    const out = mapPedido({
      id_pedido: 'pedi_1',
      id_organizacao: 'org_1',
      dados_extras_importacao_pedido: {
        nome_fabricante: 'KONGSBERG',
        nome_exportador: 'DETROIT USA INTERNATIONAL LLC',
        exportador_ou_fabricante: 'Fabricante',
        relacao_exportador_fabricante: 'Independente',
      },
      itens_pedido: [],
    })
    expect(out?.nome_fabricante).toBe('KONGSBERG')
    expect(out?.nome_exportador).toBe('DETROIT USA INTERNATIONAL LLC')
    expect(out?.exportador_ou_fabricante).toBe('Fabricante')
    expect(out?.relacao_exportador_fabricante).toBe('Independente')
  })

  it('U-MAP-03: prioriza snapshot sobre extras', () => {
    const out = mapPedido({
      id_pedido: 'pedi_1',
      dados_extras_importacao_pedido: { nome_fabricante: 'KONGSBERG' },
      snapshots_empresa_pedido: [{ papel: 'fabricante', nome_empresa: 'KONGSBERG AS' }],
      itens_pedido: [],
    })
    expect(out?.nome_fabricante).toBe('KONGSBERG AS')
  })

  it('U-MAP-04: agrega fabricante único dos itens quando pai sem JSON', () => {
    const out = mapPedido({
      id_pedido: 'pedi_1',
      itens_pedido: [{
        id_item: 'pite_1',
        id_organizacao: 'org_1',
        id_workspace: 'ws_1',
        id_pedido: 'pedi_1',
        nome_fabricante_item: 'ROLLS ROYCE',
      }],
    })
    expect(out?.nome_fabricante).toBe('ROLLS ROYCE')
  })

  it('U-MAP-05: extras com primeiro fabricante quando itens divergem', () => {
    const out = mapPedido({
      id_pedido: 'pedi_1',
      dados_extras_importacao_pedido: { nome_fabricante: 'KONGSBERG' },
      itens_pedido: [
        {
          id_item: 'i1',
          id_organizacao: 'org_1',
          id_workspace: 'ws_1',
          id_pedido: 'pedi_1',
          nome_fabricante_item: 'KONGSBERG',
        },
        {
          id_item: 'i2',
          id_organizacao: 'org_1',
          id_workspace: 'ws_1',
          id_pedido: 'pedi_1',
          nome_fabricante_item: 'ROLLS ROYCE',
        },
      ],
    })
    expect(out?.nome_fabricante).toBe('KONGSBERG')
  })
})
