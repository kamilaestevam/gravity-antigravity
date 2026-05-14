// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { criarPedidoSchema } from '../../../servicos-global/produto/processos-core/src/routes/pedidos.js'

const exemploPayloadModal = {
  tipo_operacao_pedido: 'importacao',
  numero_pedido: 'PO-2026-001',
  suid_importador: 'empresa_da_org_abc',
  suid_exportador: 'empresa_estrangeira_xyz',
  incoterm_pedido: 'FOB',
  data_emissao_pedido: '2026-04-04T00:00:00.000Z',
  itens: [
    {
      part_number_item: 'ABC-001',
      descricao_item: 'Produto exemplo',
      quantidade_inicial_item: 100,
    },
  ],
}

describe('Modal "Criar Pedido via API" — exemplo de payload', () => {
  it('payload de exemplo passa validação do criarPedidoSchema (contrato bilateral Mandamento 09)', () => {
    const result = criarPedidoSchema.safeParse(exemploPayloadModal)
    if (!result.success) {
      throw new Error(
        `Exemplo do modal falhou validação Zod:\n${JSON.stringify(result.error.issues, null, 2)}`
      )
    }
    expect(result.success).toBe(true)
  })

  it('todos os campos do exemplo existem no schema (nenhum campo fantasma)', () => {
    const keysExemplo = Object.keys(exemploPayloadModal).filter(k => k !== 'itens')
    const result = criarPedidoSchema.safeParse(exemploPayloadModal)
    expect(result.success).toBe(true)
    if (result.success) {
      const keysParsed = Object.keys(result.data).filter(k => k !== 'itens')
      for (const key of keysExemplo) {
        expect(keysParsed).toContain(key)
      }
    }
  })

  it('campos de item do exemplo existem no schema de item', () => {
    const itemExemplo = exemploPayloadModal.itens[0]
    const keysItem = Object.keys(itemExemplo)
    const result = criarPedidoSchema.safeParse(exemploPayloadModal)
    expect(result.success).toBe(true)
    if (result.success) {
      const parsedItem = result.data.itens[0]
      const keysParsedItem = Object.keys(parsedItem)
      for (const key of keysItem) {
        expect(keysParsedItem).toContain(key)
      }
    }
  })

  it('exemplo usa nomes DDD corretos — nenhum nome legado (Mandamento 03)', () => {
    const nomesLegados = [
      'tipo_operacao',
      'exportador_id',
      'importador_id',
      'incoterm',
      'part_number',
      'quantidade_inicial_pedido',
      'quantidade_inicial',
    ]
    const todasChaves = [
      ...Object.keys(exemploPayloadModal),
      ...Object.keys(exemploPayloadModal.itens[0]),
    ]
    for (const legado of nomesLegados) {
      expect(todasChaves).not.toContain(legado)
    }
  })
})
