import { describe, expect, it } from 'vitest'
import {
  converterLeituraParaPedido,
  REGRAS_ITEM,
  REGRAS_PEDIDO,
} from '../../../../servicos-global/produto/smart-read/shared/converter-leitura-para-pedido-smart-read.ts'
import {
  ALIAS_CAMPO_PEDIDO_CONVERSAO,
  CAMPOS_ITEM_CONVERSAO_PERMITIDOS,
  CAMPOS_PEDIDO_CONVERSAO_PERMITIDOS,
} from '../../../../servicos-global/produto/pedido/server/src/lib/montar-create-pedido-de-conversao-smart-read.ts'

const CAMPOS_PEDIDO_CONVERSAO = new Set<string>([
  ...CAMPOS_PEDIDO_CONVERSAO_PERMITIDOS,
  'numero_pedido',
])
const CAMPOS_ITEM_CONVERSAO = new Set<string>(CAMPOS_ITEM_CONVERSAO_PERMITIDOS)

describe('converter-leitura-para-pedido-smart-read', () => {
  it('REGRAS_PEDIDO e REGRAS_ITEM usam só campos da whitelist Prisma', () => {
    for (const regra of REGRAS_PEDIDO) {
      expect(
        CAMPOS_PEDIDO_CONVERSAO.has(regra.campo),
        `REGRAS_PEDIDO.campo fora da whitelist: ${regra.campo}`,
      ).toBe(true)
      expect(Object.keys(ALIAS_CAMPO_PEDIDO_CONVERSAO)).not.toContain(regra.campo)
    }
    for (const regra of REGRAS_ITEM) {
      expect(
        CAMPOS_ITEM_CONVERSAO.has(regra.campo),
        `REGRAS_ITEM.campo fora da whitelist: ${regra.campo}`,
      ).toBe(true)
    }
  })

  it('mapeia invoice com items para numero_pedido e part_number_item', () => {
    const resultado = converterLeituraParaPedido({
      id_leitura: 'abc123',
      arquivos: [
        {
          resultado_extracao: [
            {
              tipo_documento: 'INVOICE',
              dados: {
                document: { documentNumber: 'PO-9001', incoterm: 'FOB' },
                items: [
                  { partNumber: 'PN-001', quantity: 10, description: 'Widget A' },
                ],
              },
            },
          ],
        },
      ],
    })

    expect(resultado.erros_bloqueantes).toHaveLength(0)
    expect(resultado.grupos).toHaveLength(1)
    expect(resultado.grupos[0]?.numero_pedido).toBe('PO-9001')
    expect(resultado.grupos[0]?.itens[0]?.part_number_item).toBe('PN-001')
    expect(resultado.grupos[0]?.itens[0]?.quantidade_inicial_item).toBe(10)
    expect(resultado.detalhe_mapeamento.campos.some((c) => c.status_mapeamento === 'mapeado')).toBe(true)
  })

  it('agrupa documentos distintos em multiplos pedidos', () => {
    const resultado = converterLeituraParaPedido({
      id_leitura: 'multi-1',
      arquivos: [
        {
          resultado_extracao: [
            {
              tipo_documento: 'INVOICE',
              dados: {
                document: { documentNumber: 'PO-A' },
                items: [{ partNumber: 'PN-A', quantity: 1 }],
              },
            },
            {
              tipo_documento: 'INVOICE',
              dados: {
                document: { documentNumber: 'PO-B' },
                items: [{ partNumber: 'PN-B', quantity: 2 }],
              },
            },
          ],
        },
      ],
    })

    expect(resultado.grupos).toHaveLength(2)
    expect(resultado.grupos.map((g) => g.numero_pedido).sort()).toEqual(['PO-A', 'PO-B'])
  })
})
