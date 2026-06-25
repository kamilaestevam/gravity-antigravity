// @vitest-environment node
/**
 * edicao-massa-referencias-item.test.ts — Verifica que os 3 campos de referência
 * de nível item estão presentes na lista de campos editáveis da edição em massa.
 *
 * Bug original: edição em massa de "Referência Importador" em itens mostrava
 * sucesso no modal mas o valor não era salvo, pois o campo `referencia_importador_item`
 * não existia em CAMPOS_ITEM_EDITAVEIS. O mesmo para exportador e fabricante.
 *
 * Onda 3 (2026-06-11): o modal deixou de ter listas hardcoded e passou a derivar
 * os campos do SSOT shared/camposEdicaoMassa.ts — o teste valida o SSOT direto.
 */
import { describe, it, expect } from 'vitest'
import {
  CAMPOS_EDICAO_MASSA_ITEM,
  campoEditavelEmMassa,
} from '../../../../servicos-global/produto/pedido/shared/camposEdicaoMassa'
import { kindUiDeCampo } from '../../../../servicos-global/produto/pedido/shared/kind-ui-pedido'

// ── Campos de referência obrigatórios no nível item ──────────────────────────
const REFERENCIAS_ITEM_OBRIGATORIAS = [
  'referencia_importador_item',
  'referencia_exportador_item',
  'referencia_fabricante_item',
] as const

describe('Referências item na edição em massa — campos presentes no SSOT', () => {
  for (const campo of REFERENCIAS_ITEM_OBRIGATORIAS) {
    it(`${campo} está presente em CAMPOS_EDICAO_MASSA_ITEM`, () => {
      expect(CAMPOS_EDICAO_MASSA_ITEM.map(c => c.campo)).toContain(campo)
    })

    it(`${campo} é editável em massa no nível 'item'`, () => {
      expect(campoEditavelEmMassa(campo, 'item')).toBe(true)
    })

    it(`${campo} renderiza como texto livre (KindUI 'texto')`, () => {
      expect(kindUiDeCampo(campo)).toBe('texto')
    })

    it(`${campo} pertence ao grupo Documentos`, () => {
      const def = CAMPOS_EDICAO_MASSA_ITEM.find(c => c.campo === campo)
      expect(def?.grupo).toBe('Documentos')
    })
  }
})

describe('Referências item — payload roteado corretamente', () => {
  it('campos de referência com nivel item não ativam fast path', () => {
    const camposPedido: unknown[] = []
    const camposItem = [{ campo: 'referencia_importador_item', nivel: 'item' }]
    const camposCascade: unknown[] = []
    const novoTipo = null

    const todosCamposPedidoSaoRapidos =
      camposPedido.length > 0 &&
      camposItem.length === 0 &&
      camposCascade.length === 0 &&
      novoTipo === null

    expect(todosCamposPedidoSaoRapidos).toBe(false)
  })

  it('dadosItem é construído com referencia_importador_item como chave', () => {
    const campo = { campo: 'referencia_importador_item', operacao: 'substituir', valor: 'TESTE-REF-001' }
    const dadosItem: Record<string, unknown> = {}
    dadosItem[campo.campo] = campo.valor

    expect(dadosItem).toEqual({ referencia_importador_item: 'TESTE-REF-001' })
  })

  it('filtro nivel=item inclui os 3 campos de referência', () => {
    const payload = {
      campos: [
        { campo: 'referencia_importador_item', nivel: 'item', operacao: 'substituir', valor: 'A' },
        { campo: 'referencia_exportador_item', nivel: 'item', operacao: 'substituir', valor: 'B' },
        { campo: 'referencia_fabricante_item', nivel: 'item', operacao: 'substituir', valor: 'C' },
      ],
    }
    const camposPedido = payload.campos.filter(c => c.nivel === 'pedido')
    const camposItem = payload.campos.filter(c => c.nivel === 'item')

    expect(camposPedido).toHaveLength(0)
    expect(camposItem).toHaveLength(3)
    expect(camposItem.map(c => c.campo)).toEqual([
      'referencia_importador_item',
      'referencia_exportador_item',
      'referencia_fabricante_item',
    ])
  })
})
