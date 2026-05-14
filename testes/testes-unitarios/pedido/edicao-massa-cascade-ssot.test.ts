// @vitest-environment node
/**
 * edicao-massa-cascade-ssot.test.ts — Verifica que a composição do cascade
 * na edição em massa é um superset correto do SSOT + 4 exclusivos.
 *
 * O PARES_CASCADE_PEDIDO_ITEM é interno ao edicaoEmMassaService.ts (não exportado).
 * Aqui testamos o contrato: SSOT (57) + 4 exclusivos = 61, e os 4 exclusivos
 * não colidem com o SSOT.
 */
import { describe, it, expect } from 'vitest'
import { MAPA_PROPAGACAO_PEDIDO_ITEM } from '../../../servicos-global/produto/pedido/shared/mapaPropagacaoPedidoItem'

const EXCLUSIVOS_EDICAO_MASSA: Record<string, string> = {
  tipo_operacao_pedido: 'tipo_operacao_item',
  nome_exportador:      'nome_exportador_item',
  nome_importador:      'nome_importador_item',
  nome_fabricante:       'nome_fabricante_item',
}

describe('Cascade composição — SSOT + exclusivos edição em massa', () => {
  it('SSOT contém exatamente 57 pares', () => {
    expect(Object.keys(MAPA_PROPAGACAO_PEDIDO_ITEM).length).toBe(57)
  })

  it('os 4 campos exclusivos da edição em massa NÃO existem no SSOT', () => {
    for (const campo of Object.keys(EXCLUSIVOS_EDICAO_MASSA)) {
      expect(MAPA_PROPAGACAO_PEDIDO_ITEM).not.toHaveProperty(campo)
    }
  })

  it('composição SSOT + exclusivos resulta em 61 pares sem colisão', () => {
    const composto = { ...MAPA_PROPAGACAO_PEDIDO_ITEM, ...EXCLUSIVOS_EDICAO_MASSA }
    expect(Object.keys(composto).length).toBe(61)
  })

  it('tipo_operacao_pedido mapeia para tipo_operacao_item (exclusivo massa, não propaga em create/patch)', () => {
    expect(EXCLUSIVOS_EDICAO_MASSA.tipo_operacao_pedido).toBe('tipo_operacao_item')
    expect(MAPA_PROPAGACAO_PEDIDO_ITEM).not.toHaveProperty('tipo_operacao_pedido')
  })

  it('nome_exportador/importador/fabricante são derivativos JSON→coluna (exclusivos massa)', () => {
    expect(EXCLUSIVOS_EDICAO_MASSA.nome_exportador).toBe('nome_exportador_item')
    expect(EXCLUSIVOS_EDICAO_MASSA.nome_importador).toBe('nome_importador_item')
    expect(EXCLUSIVOS_EDICAO_MASSA.nome_fabricante).toBe('nome_fabricante_item')
  })

  it('nenhum destino dos exclusivos colide com destinos do SSOT', () => {
    const destinosSSOT = new Set(Object.values(MAPA_PROPAGACAO_PEDIDO_ITEM))
    for (const destino of Object.values(EXCLUSIVOS_EDICAO_MASSA)) {
      expect(destinosSSOT.has(destino)).toBe(false)
    }
  })

  it('cobertura_cambial_pedido está no SSOT (ausente no antigo mapa local de 25 pares)', () => {
    expect(MAPA_PROPAGACAO_PEDIDO_ITEM).toHaveProperty('cobertura_cambial_pedido')
    expect(MAPA_PROPAGACAO_PEDIDO_ITEM['cobertura_cambial_pedido']).toBe('cobertura_cambial_item')
  })

  it('35 datas adicionais (rascunho/proforma/invoice) estão no SSOT', () => {
    const datasAdicionais = Object.keys(MAPA_PROPAGACAO_PEDIDO_ITEM).filter(k =>
      k.includes('rascunho') || k.includes('proforma') || k.includes('invoice') ||
      k === 'data_documento_pedido' || k === 'data_consolidacao_pedido' || k === 'data_transferencia_saldo_pedido',
    )
    expect(datasAdicionais.length).toBe(35)
  })
})
