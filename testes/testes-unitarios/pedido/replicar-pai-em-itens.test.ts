/**
 * replicar-pai-em-itens.test.ts — Cobre a tradução pedido→item usada no
 * handler PATCH /:id/campo quando o usuário marca "Aplicar a todos os itens".
 *
 * O handler real é dentro de uma rota Express; aqui testamos as primitivas
 * que ele orquestra:
 *   - obterCampoItemPropagado(): tradução pedido DDD → item DDD
 *   - isPropagavel(): whitelist de campos elegíveis (aceita legado + DDD)
 *
 * Decisão UX 2026-05-13: replicação só dispara quando o usuário marca o
 * checkbox no popover do pai. Whitelist == 22 campos que existem em ambos
 * os models (Pedido + PedidoItem).
 */
import { describe, it, expect } from 'vitest'
import {
  obterCampoItemPropagado,
  isPropagavel,
  CAMPOS_PEDIDO_PROPAGAVEIS,
  MAPA_PROPAGACAO_PEDIDO_ITEM,
} from '../../../servicos-global/produto/pedido/shared/mapaPropagacaoPedidoItem'

describe('obterCampoItemPropagado — tradução pedido → item', () => {
  it('incoterm_pedido traduz para incoterm_item', () => {
    expect(obterCampoItemPropagado('incoterm_pedido')).toBe('incoterm_item')
  })

  it('moeda_pedido traduz para moeda_item', () => {
    expect(obterCampoItemPropagado('moeda_pedido')).toBe('moeda_item')
  })

  it('referencia_importador_pedido traduz para referencia_importador_item', () => {
    expect(obterCampoItemPropagado('referencia_importador_pedido')).toBe('referencia_importador_item')
  })

  it('data_emissao_pedido traduz para data_emissao_item', () => {
    expect(obterCampoItemPropagado('data_emissao_pedido')).toBe('data_emissao_item')
  })

  it('data_prevista_pedido_pronto traduz para data_prevista_item_pronto', () => {
    expect(obterCampoItemPropagado('data_prevista_pedido_pronto')).toBe('data_prevista_item_pronto')
  })

  it('campo pedido-only retorna null', () => {
    // numero_proforma_pedido existe no Pedido mas NÃO no item
    expect(obterCampoItemPropagado('numero_proforma_pedido')).toBeNull()
  })

  it('campo agregado (valor_total_pedido) retorna null', () => {
    expect(obterCampoItemPropagado('valor_total_pedido')).toBeNull()
  })

  it('campo inexistente retorna null', () => {
    expect(obterCampoItemPropagado('campo_que_nao_existe')).toBeNull()
  })

  it('id_pedido (chave) retorna null', () => {
    expect(obterCampoItemPropagado('id_pedido')).toBeNull()
  })
})

describe('isPropagavel — whitelist de campos elegíveis', () => {
  it('aceita nome DDD com sufixo _pedido', () => {
    expect(isPropagavel('incoterm_pedido')).toBe(true)
    expect(isPropagavel('moeda_pedido')).toBe(true)
    expect(isPropagavel('referencia_exportador_pedido')).toBe(true)
  })

  it('aceita nome legado curto via compatibilidade', () => {
    // O dicionário LEGADO_PARA_DDD_COMPAT no mesmo arquivo mapeia
    // 'incoterm' → 'incoterm_pedido' e similares
    expect(isPropagavel('incoterm')).toBe(true)
    expect(isPropagavel('condicao_pagamento')).toBe(true)
    expect(isPropagavel('referencia_importador')).toBe(true)
  })

  it('rejeita campos pedido-only', () => {
    expect(isPropagavel('numero_proforma_pedido')).toBe(false)
    expect(isPropagavel('numero_invoice_pedido')).toBe(false)
  })

  it('rejeita agregados calculados', () => {
    expect(isPropagavel('valor_total_pedido')).toBe(false)
    expect(isPropagavel('quantidade_total_pedido')).toBe(false)
    expect(isPropagavel('peso_liquido_total_pedido')).toBe(false)
  })

  it('rejeita IDs', () => {
    expect(isPropagavel('id_pedido')).toBe(false)
    expect(isPropagavel('id_organizacao')).toBe(false)
  })

  it('rejeita campos completamente fora do schema', () => {
    expect(isPropagavel('xpto_inexistente')).toBe(false)
    expect(isPropagavel('')).toBe(false)
  })
})

describe('CAMPOS_PEDIDO_PROPAGAVEIS — contrato', () => {
  it('contém exatamente os campos do MAPA_PROPAGACAO_PEDIDO_ITEM', () => {
    const keysMapa = new Set(Object.keys(MAPA_PROPAGACAO_PEDIDO_ITEM))
    expect(CAMPOS_PEDIDO_PROPAGAVEIS).toEqual(keysMapa)
  })

  it('todos os destinos do mapa terminam em _item ou _item_*', () => {
    for (const dest of Object.values(MAPA_PROPAGACAO_PEDIDO_ITEM)) {
      expect(dest).toMatch(/_item(_|$)/)
    }
  })

  it('nenhum destino do mapa contém _pedido (não pode replicar para pedido-only)', () => {
    for (const dest of Object.values(MAPA_PROPAGACAO_PEDIDO_ITEM)) {
      expect(dest).not.toMatch(/_pedido$/)
    }
  })

  it('cobre os 5 campos críticos de identidade comercial', () => {
    expect(CAMPOS_PEDIDO_PROPAGAVEIS.has('incoterm_pedido')).toBe(true)
    expect(CAMPOS_PEDIDO_PROPAGAVEIS.has('moeda_pedido')).toBe(true)
    expect(CAMPOS_PEDIDO_PROPAGAVEIS.has('condicao_pagamento_pedido')).toBe(true)
    expect(CAMPOS_PEDIDO_PROPAGAVEIS.has('data_emissao_pedido')).toBe(true)
    expect(CAMPOS_PEDIDO_PROPAGAVEIS.has('cobertura_cambial_pedido')).toBe(true)
  })

  it('cobre as 9 datas de milestone (pedido pronto + inspeção + coleta)', () => {
    const datas = [
      'data_prevista_pedido_pronto', 'data_confirmada_pedido_pronto', 'data_meta_pedido_pronto',
      'data_prevista_inspecao_pedido', 'data_confirmada_inspecao_pedido', 'data_meta_inspecao_pedido',
      'data_prevista_coleta_pedido', 'data_confirmada_coleta_pedido', 'data_meta_coleta_pedido',
    ]
    for (const campo of datas) {
      expect(CAMPOS_PEDIDO_PROPAGAVEIS.has(campo)).toBe(true)
    }
  })
})

describe('Cenários de replicação pai → itens (simulados)', () => {
  // Simula o que o handler PATCH faz: traduz e gera o objeto para updateMany.

  function simularReplicacao(campoLegado: string, valorNovo: unknown): { campoItem: string | null; payload: Record<string, unknown> | null } {
    // 1. Traduz legado → DDD pedido (mapeamento existe em ALIAS_LEGADO_PARA_PRISMA
    //    no handler — aqui replicamos pra teste)
    const aliasLegadoParaPedido: Record<string, string> = {
      incoterm: 'incoterm_pedido',
      condicao_pagamento: 'condicao_pagamento_pedido',
      referencia_importador: 'referencia_importador_pedido',
      referencia_exportador: 'referencia_exportador_pedido',
      referencia_fabricante: 'referencia_fabricante_pedido',
    }
    const campoPedido = aliasLegadoParaPedido[campoLegado] ?? campoLegado
    if (!isPropagavel(campoPedido)) return { campoItem: null, payload: null }
    const campoItem = obterCampoItemPropagado(campoPedido)
    if (!campoItem) return { campoItem: null, payload: null }
    return {
      campoItem,
      payload: { [campoItem]: valorNovo },
    }
  }

  it('replicar incoterm=FOB gera payload { incoterm_item: "FOB" }', () => {
    const r = simularReplicacao('incoterm', 'FOB')
    expect(r.campoItem).toBe('incoterm_item')
    expect(r.payload).toEqual({ incoterm_item: 'FOB' })
  })

  it('replicar condicao_pagamento gera campo correto', () => {
    const r = simularReplicacao('condicao_pagamento', '30/60 dias')
    expect(r.campoItem).toBe('condicao_pagamento_item')
    expect(r.payload).toEqual({ condicao_pagamento_item: '30/60 dias' })
  })

  it('replicar referencia_importador gera campo correto', () => {
    const r = simularReplicacao('referencia_importador', 'REF-IMP-0026')
    expect(r.campoItem).toBe('referencia_importador_item')
    expect(r.payload).toEqual({ referencia_importador_item: 'REF-IMP-0026' })
  })

  it('replicar campo NÃO propagável retorna null (handler vai lançar AppError 400)', () => {
    const r = simularReplicacao('numero_proforma', 'PI-001')
    expect(r.campoItem).toBeNull()
    expect(r.payload).toBeNull()
  })

  it('replicar valor null funciona (limpa o campo nos itens)', () => {
    const r = simularReplicacao('incoterm', null)
    expect(r.campoItem).toBe('incoterm_item')
    expect(r.payload).toEqual({ incoterm_item: null })
  })

  it('replicar data_emissao_pedido gera campo correto', () => {
    const r = simularReplicacao('data_emissao_pedido', '2026-05-13')
    expect(r.campoItem).toBe('data_emissao_item')
    expect(r.payload).toEqual({ data_emissao_item: '2026-05-13' })
  })
})
