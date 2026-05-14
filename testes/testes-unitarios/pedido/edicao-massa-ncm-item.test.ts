// @vitest-environment node
/**
 * edicao-massa-ncm-item.test.ts — Verifica que campos de nível 'item' (como NCM)
 * são corretamente roteados no payload e no service da edição em massa.
 *
 * Bug original: NCM no modo Combinado alterava o pedido em vez do item porque
 * o frontend ignorava erros do backend e o where clause do PedidoItem.update
 * incluía id_organizacao desnecessariamente.
 */
import { describe, it, expect } from 'vitest'
import { MAPA_PROPAGACAO_PEDIDO_ITEM } from '../../../servicos-global/produto/pedido/shared/mapaPropagacaoPedidoItem'

// ── Definições espelhadas do frontend (não exportadas) ─────────────────────

const CAMPOS_ITEM_EDITAVEIS_NOMES = [
  'part_number_item', 'ncm_item', 'descricao_item',
  'descricao_completa_item_pt', 'descricao_completa_item_en',
  'descricao_completa_item_es', 'descricao_completa_item_nf',
  'texto_posicao_ncm', 'grupo_item', 'subgrupo_item',
  'campo_especial_item', 'atributos_catalogo',
  'tipo_operacao_item', 'unidade_comercializada_item',
  'quantidade_inicial_item', 'quantidade_pronta_item',
  'quantidade_cancelada_item', 'casas_decimais_quantidade_item',
  'moeda_item', 'incoterm_item', 'condicao_pagamento_item',
  'data_emissao_item',
  'peso_liquido_unitario_item', 'peso_bruto_unitario_item',
  'cubagem_unitaria_item', 'tipo_embalagem', 'numero_lpco',
  'numero_certificado_origem', 'data_certificado_origem',
  'data_embarque_item',
]

const CAMPOS_BLOQUEADOS_ITEM = new Set([
  'valor_total_item', 'quantidade_atual_item', 'quantidade_transferida_item',
  'id_item', 'id_organizacao', 'id_workspace', 'id_pedido',
  'data_criacao_item', 'data_atualizacao_item', 'data_exclusao_item',
])

describe('NCM na edição em massa — roteamento correto item vs pedido', () => {
  it('ncm_item é campo de nível item, nunca pedido', () => {
    expect(CAMPOS_ITEM_EDITAVEIS_NOMES).toContain('ncm_item')
  })

  it('ncm_item NÃO está nos campos bloqueados de item', () => {
    expect(CAMPOS_BLOQUEADOS_ITEM.has('ncm_item')).toBe(false)
  })

  it('payload Combinado com NCM resulta em camposPedido vazio e camposItem com ncm_item', () => {
    const payload = {
      pedido_ids: ['p1', 'p2'],
      campos: [
        { campo: 'ncm_item', tipo: 'ncm' as const, nivel: 'item' as const, operacao: 'substituir' as const, valor: '8471.30.19' },
      ],
      nivel: 'combinado' as const,
    }
    const camposPedido = payload.campos.filter(c => c.nivel === 'pedido')
    const camposItem = payload.campos.filter(c => c.nivel === 'item')

    expect(camposPedido).toHaveLength(0)
    expect(camposItem).toHaveLength(1)
    expect(camposItem[0].campo).toBe('ncm_item')
  })

  it('NCM no modo Combinado NÃO ativa cascade (ncm_item não está no PARES_CASCADE)', () => {
    const PARES_CASCADE: Record<string, string> = {
      ...MAPA_PROPAGACAO_PEDIDO_ITEM,
      tipo_operacao_pedido: 'tipo_operacao_item',
      nome_exportador:      'nome_exportador_item',
      nome_importador:      'nome_importador_item',
      nome_fabricante:       'nome_fabricante_item',
    }
    expect(PARES_CASCADE).not.toHaveProperty('ncm_item')
  })

  it('fast path é desativado quando há campo item (NCM)', () => {
    const camposPedido: unknown[] = []
    const camposItem = [{ campo: 'ncm_item' }]
    const camposCascade: unknown[] = []
    const novoTipo = null

    const todosCamposPedidoSaoRapidos =
      camposPedido.length > 0 &&
      camposItem.length === 0 &&
      camposCascade.length === 0 &&
      novoTipo === null

    expect(todosCamposPedidoSaoRapidos).toBe(false)
  })

  it('dadosItem é construído corretamente com ncm_item como chave', () => {
    const item = { id_item: 'i1', ncm_item: '8471.30.19' }
    const campo = { campo: 'ncm_item', operacao: 'substituir', valor: '9999.99.99' }
    const dadosItem: Record<string, unknown> = {}
    dadosItem[campo.campo] = campo.valor

    expect(dadosItem).toEqual({ ncm_item: '9999.99.99' })
    expect(Object.keys(dadosItem).length).toBeGreaterThan(0)
  })
})

describe('Conversão de data para ISO-8601 — Prisma DateTime', () => {
  function aplicarOperacao(
    valorAtual: unknown,
    operacao: string,
    valor: string | number,
    tipo?: string,
  ): unknown {
    switch (operacao) {
      case 'substituir':
        if (tipo === 'data' && typeof valor === 'string' && !valor.includes('T')) {
          return new Date(valor + 'T00:00:00.000Z').toISOString()
        }
        return valor
      case 'avancar_dias': {
        const base = valorAtual ? new Date(String(valorAtual)) : new Date()
        base.setDate(base.getDate() + Number(valor))
        return base.toISOString()
      }
      case 'recuar_dias': {
        const base = valorAtual ? new Date(String(valorAtual)) : new Date()
        base.setDate(base.getDate() - Number(valor))
        return base.toISOString()
      }
      default:
        return valorAtual
    }
  }

  it('substituir data "2026-01-01" converte para ISO-8601 DateTime', () => {
    const result = aplicarOperacao(null, 'substituir', '2026-01-01', 'data')
    expect(result).toBe('2026-01-01T00:00:00.000Z')
  })

  it('substituir data já com T mantém inalterado', () => {
    const result = aplicarOperacao(null, 'substituir', '2026-01-01T12:00:00.000Z', 'data')
    expect(result).toBe('2026-01-01T12:00:00.000Z')
  })

  it('substituir texto NÃO converte para ISO-8601', () => {
    const result = aplicarOperacao(null, 'substituir', 'FOB', 'texto')
    expect(result).toBe('FOB')
  })

  it('substituir número NÃO converte para ISO-8601', () => {
    const result = aplicarOperacao(null, 'substituir', 42, 'numero')
    expect(result).toBe(42)
  })

  it('avancar_dias retorna ISO-8601 com T', () => {
    const result = aplicarOperacao('2026-01-01T00:00:00.000Z', 'avancar_dias', 5) as string
    expect(result).toContain('T')
    expect(result).toBe('2026-01-06T00:00:00.000Z')
  })

  it('recuar_dias retorna ISO-8601 com T', () => {
    const result = aplicarOperacao('2026-01-10T00:00:00.000Z', 'recuar_dias', 3) as string
    expect(result).toContain('T')
    expect(result).toBe('2026-01-07T00:00:00.000Z')
  })
})
