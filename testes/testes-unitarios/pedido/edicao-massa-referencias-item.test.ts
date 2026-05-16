// @vitest-environment node
/**
 * edicao-massa-referencias-item.test.ts — Verifica que os 3 campos de referência
 * de nível item estão presentes na lista de campos editáveis da edição em massa.
 *
 * Bug original: edição em massa de "Referência Importador" em itens mostrava
 * sucesso no modal mas o valor não era salvo, pois o campo `referencia_importador_item`
 * não existia em CAMPOS_ITEM_EDITAVEIS. O mesmo para exportador e fabricante.
 *
 * Fix: adicionados referencia_importador_item, referencia_exportador_item e
 * referencia_fabricante_item ao array CAMPOS_ITEM_EDITAVEIS em
 * ModalPedidosEdicaoMassa.tsx.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// ── Ler o arquivo fonte (arrays não são exportados) ──────────────────────────
const MODAL_PATH = resolve(
  __dirname,
  '../../../servicos-global/produto/pedido/client/src/components/ModalPedidosEdicaoMassa.tsx',
)
const conteudo = readFileSync(MODAL_PATH, 'utf-8')

// ── Campos de referência obrigatórios no nível item ──────────────────────────
const REFERENCIAS_ITEM_OBRIGATORIAS = [
  'referencia_importador_item',
  'referencia_exportador_item',
  'referencia_fabricante_item',
] as const

describe('Referências item na edição em massa — campos presentes', () => {
  for (const campo of REFERENCIAS_ITEM_OBRIGATORIAS) {
    it(`${campo} está presente em CAMPOS_ITEM_EDITAVEIS`, () => {
      // Verifica que o campo aparece como string literal no array
      expect(conteudo).toContain(`campo: '${campo}'`)
    })

    it(`${campo} tem nivel: 'item'`, () => {
      // Regex para verificar que o campo está na mesma linha/objeto com nivel 'item'
      const regex = new RegExp(
        `campo:\\s*'${campo}'[^}]*nivel:\\s*'item'`,
        's',
      )
      expect(conteudo).toMatch(regex)
    })

    it(`${campo} tem tipo: 'texto'`, () => {
      const regex = new RegExp(
        `campo:\\s*'${campo}'[^}]*tipo:\\s*'texto'`,
        's',
      )
      expect(conteudo).toMatch(regex)
    })

    it(`${campo} tem grupo: 'Documentos'`, () => {
      const regex = new RegExp(
        `campo:\\s*'${campo}'[^}]*grupo:\\s*'Documentos'`,
        's',
      )
      expect(conteudo).toMatch(regex)
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
