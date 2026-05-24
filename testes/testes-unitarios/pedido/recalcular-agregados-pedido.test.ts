// TST-UNIT-PEDIDO-AGREGADOS-001 — recalcularAgregadosPedido (helper canônico)
// Cobre:
//   - Soma correta dos 5 agregados (valor, qty, peso_liq, peso_br, cubagem)
//   - Fórmula peso/cubagem = unitário × quantidade_inicial_item (NÃO somar só unitário)
//   - Aplicação de casas decimais por pedido (com defaults quando NULL)
//   - Itens vazios → todos os agregados zerados
//   - Pedido inexistente → AppError 404
//   - Lock pessimista FOR UPDATE chamado antes do UPDATE
//   - campoItemAfetaAgregado() distingue campos relevantes de irrelevantes
/// <reference types="vitest/globals" />

import {
  recalcularAgregadosPedido,
  campoItemAfetaAgregado,
  CAMPOS_ITEM_QUE_AFETAM_AGREGADO,
} from '../../../servicos-global/produto/processos-core/src/services/recalcularAgregadosPedido.js'
import { AppError } from '../../../servicos-global/produto/processos-core/src/services/saldo-pedido.js'

// ── Mock factory ──────────────────────────────────────────────────────────────
// Constrói um `tx` Prisma falso registrando chamadas de $queryRaw,
// pedidoItem.findMany e pedido.update — permite asserts de ordem e payload.

interface PedidoMock {
  id_pedido: string
  id_organizacao: string
  casas_decimais_valor_pedido:      number | null
  casas_decimais_quantidade_pedido: number | null
  casas_decimais_peso_pedido:       number | null
  casas_decimais_cubagem_pedido:    number | null
}

interface ItemMock {
  valor_total_item:                number | null
  quantidade_inicial_item:         number
  peso_liquido_unitario_item:      number | null
  peso_bruto_unitario_item:        number | null
  cubagem_unitaria_item:           number | null
  // Onda A8: novos campos para detectar homogeneidade.
  // Default 'USD' / 'PCS' nos testes antigos para preservar comportamento.
  moeda_item?:                     string | null
  unidade_comercializada_item?:    string | null
}

// Helper: aplica defaults de moeda/unidade aos testes que não especificam.
// Mantém compat com os 14 testes anteriores (que pré-A8 não tinham essa info).
function comDefaults(itens: ItemMock[]): ItemMock[] {
  return itens.map((it) => ({
    ...it,
    moeda_item:                  it.moeda_item                  ?? 'USD',
    unidade_comercializada_item: it.unidade_comercializada_item ?? 'PCS',
  }))
}

function fabricarTx(opts: {
  pedido: PedidoMock | null
  itens: ItemMock[]
}) {
  const queryRawCalls: unknown[][] = []
  const updateCalls: unknown[] = []

  const tx = {
    $queryRaw: vi.fn(async (...args: unknown[]) => {
      queryRawCalls.push(args)
      if (queryRawCalls.length === 1) {
        return opts.pedido ? [opts.pedido] : []
      }
      return comDefaults(opts.itens)
    }),
    pedido: {
      update: vi.fn(async (arg: unknown) => {
        updateCalls.push(arg)
        return {}
      }),
    },
  }

  return { tx, queryRawCalls, updateCalls }
}

const ORG = 'org_test_001'
const PEDIDO_ID = 'pedi_test_001'

const PEDIDO_PADRAO: PedidoMock = {
  id_pedido: PEDIDO_ID,
  id_organizacao: ORG,
  casas_decimais_valor_pedido: 2,
  casas_decimais_quantidade_pedido: 2,
  casas_decimais_peso_pedido: 3,
  casas_decimais_cubagem_pedido: 4,
}

// ─── Testes ───────────────────────────────────────────────────────────────────

describe('recalcularAgregadosPedido — soma básica dos 5 agregados', () => {
  it('soma corretamente com 1 item simples', async () => {
    const { tx, updateCalls } = fabricarTx({
      pedido: PEDIDO_PADRAO,
      itens: [
        {
          valor_total_item: 100,
          quantidade_inicial_item: 10,
          peso_liquido_unitario_item: 0.5,
          peso_bruto_unitario_item: 0.7,
          cubagem_unitaria_item: 0.01,
        },
      ],
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await recalcularAgregadosPedido(tx as any, PEDIDO_ID, ORG)

    expect(updateCalls).toHaveLength(1)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (updateCalls[0] as any).data
    expect(data.valor_total_pedido).toBe(100)
    expect(data.quantidade_total_pedido).toBe(10)
    expect(data.peso_liquido_total_pedido).toBe(5)    // 0.5 × 10
    expect(data.peso_bruto_total_pedido).toBe(7)      // 0.7 × 10
    expect(data.cubagem_total_pedido).toBe(0.1)       // 0.01 × 10
  })

  it('soma corretamente com múltiplos itens', async () => {
    const { tx, updateCalls } = fabricarTx({
      pedido: PEDIDO_PADRAO,
      itens: [
        { valor_total_item: 100, quantidade_inicial_item: 10, peso_liquido_unitario_item: 1,   peso_bruto_unitario_item: 1.2, cubagem_unitaria_item: 0.05 },
        { valor_total_item: 250, quantidade_inicial_item: 5,  peso_liquido_unitario_item: 2,   peso_bruto_unitario_item: 2.5, cubagem_unitaria_item: 0.1 },
        { valor_total_item: 75,  quantidade_inicial_item: 3,  peso_liquido_unitario_item: 0.5, peso_bruto_unitario_item: 0.6, cubagem_unitaria_item: 0.02 },
      ],
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await recalcularAgregadosPedido(tx as any, PEDIDO_ID, ORG)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (updateCalls[0] as any).data
    expect(data.valor_total_pedido).toBe(425)         // 100 + 250 + 75
    expect(data.quantidade_total_pedido).toBe(18)     // 10 + 5 + 3
    expect(data.peso_liquido_total_pedido).toBe(21.5) // 10 + 10 + 1.5
    expect(data.peso_bruto_total_pedido).toBe(26.3)   // 12 + 12.5 + 1.8
    expect(data.cubagem_total_pedido).toBe(1.06)      // 0.5 + 0.5 + 0.06
  })

  it('zera todos agregados quando não há itens', async () => {
    const { tx, updateCalls } = fabricarTx({
      pedido: PEDIDO_PADRAO,
      itens: [],
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await recalcularAgregadosPedido(tx as any, PEDIDO_ID, ORG)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (updateCalls[0] as any).data
    expect(data.valor_total_pedido).toBe(0)
    expect(data.quantidade_total_pedido).toBe(0)
    expect(data.peso_liquido_total_pedido).toBe(0)
    expect(data.peso_bruto_total_pedido).toBe(0)
    expect(data.cubagem_total_pedido).toBe(0)
  })

  it('trata campos null como 0 (não quebra com NaN)', async () => {
    const { tx, updateCalls } = fabricarTx({
      pedido: PEDIDO_PADRAO,
      itens: [
        {
          valor_total_item: null,           // null vira 0
          quantidade_inicial_item: 10,
          peso_liquido_unitario_item: null, // null vira 0
          peso_bruto_unitario_item: 1,
          cubagem_unitaria_item: null,
        },
      ],
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await recalcularAgregadosPedido(tx as any, PEDIDO_ID, ORG)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (updateCalls[0] as any).data
    expect(data.valor_total_pedido).toBe(0)
    expect(data.quantidade_total_pedido).toBe(10)
    expect(data.peso_liquido_total_pedido).toBe(0)
    expect(data.peso_bruto_total_pedido).toBe(10)   // 1 × 10
    expect(data.cubagem_total_pedido).toBe(0)
  })
})

describe('recalcularAgregadosPedido — fórmula peso/cubagem com qty', () => {
  it('multiplica peso unitário pela quantidade (não soma só unitário)', async () => {
    // Bug histórico: pedidos.ts:1348 somava só `peso_liquido_unitario_item`
    // sem multiplicar por qty. Este teste garante a correção.
    const { tx, updateCalls } = fabricarTx({
      pedido: PEDIDO_PADRAO,
      itens: [
        { valor_total_item: 0, quantidade_inicial_item: 100, peso_liquido_unitario_item: 2.5, peso_bruto_unitario_item: 3, cubagem_unitaria_item: 0.001 },
      ],
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await recalcularAgregadosPedido(tx as any, PEDIDO_ID, ORG)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (updateCalls[0] as any).data
    // Bug antigo daria 2.5; correto é 250 (2.5 × 100)
    expect(data.peso_liquido_total_pedido).toBe(250)
    expect(data.peso_bruto_total_pedido).toBe(300)
    expect(data.cubagem_total_pedido).toBe(0.1)
  })
})

describe('recalcularAgregadosPedido — casas decimais', () => {
  it('aplica casas decimais customizadas do pedido', async () => {
    const { tx, updateCalls } = fabricarTx({
      pedido: {
        ...PEDIDO_PADRAO,
        casas_decimais_valor_pedido: 4,      // override 2 → 4
        casas_decimais_quantidade_pedido: 0, // override 2 → 0 (inteiro)
      },
      itens: [
        { valor_total_item: 100.123456, quantidade_inicial_item: 10.99, peso_liquido_unitario_item: 0, peso_bruto_unitario_item: 0, cubagem_unitaria_item: 0 },
      ],
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await recalcularAgregadosPedido(tx as any, PEDIDO_ID, ORG)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (updateCalls[0] as any).data
    expect(data.valor_total_pedido).toBe(100.1235)   // 4 casas
    expect(data.quantidade_total_pedido).toBe(11)    // 0 casas (arredondado)
  })

  it('usa defaults seguros quando casas_decimais_*_pedido é NULL', async () => {
    const { tx, updateCalls } = fabricarTx({
      pedido: {
        ...PEDIDO_PADRAO,
        casas_decimais_valor_pedido: null,
        casas_decimais_quantidade_pedido: null,
        casas_decimais_peso_pedido: null,
        casas_decimais_cubagem_pedido: null,
      },
      itens: [
        { valor_total_item: 99.999, quantidade_inicial_item: 5.5, peso_liquido_unitario_item: 1.2345, peso_bruto_unitario_item: 1.2345, cubagem_unitaria_item: 0.12345 },
      ],
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await recalcularAgregadosPedido(tx as any, PEDIDO_ID, ORG)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (updateCalls[0] as any).data
    // Defaults: valor=2, qty=2, peso=3, cubagem=3
    expect(data.valor_total_pedido).toBe(100)         // 99.999 → 2 casas → 100.00
    expect(data.quantidade_total_pedido).toBe(5.5)    // 2 casas
    expect(data.peso_liquido_total_pedido).toBe(6.79) // 1.2345 × 5.5 = 6.78975 → 3 casas → 6.790
    expect(data.cubagem_total_pedido).toBe(0.679)     // 0.12345 × 5.5 = 0.679 → 3 casas
  })
})

describe('recalcularAgregadosPedido — falhas (Mandamento 08)', () => {
  it('lança AppError(404) quando pedido não existe', async () => {
    const { tx } = fabricarTx({
      pedido: null, // simula SELECT FOR UPDATE retornando vazio
      itens: [],
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await expect(recalcularAgregadosPedido(tx as any, PEDIDO_ID, ORG))
      .rejects.toThrow(AppError)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await expect(recalcularAgregadosPedido(tx as any, PEDIDO_ID, ORG))
      .rejects.toMatchObject({ statusCode: 404 })
  })

  it('NÃO chama pedido.update quando pedido não existe', async () => {
    const { tx, updateCalls } = fabricarTx({
      pedido: null,
      itens: [],
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await recalcularAgregadosPedido(tx as any, PEDIDO_ID, ORG).catch(() => {})
    expect(updateCalls).toHaveLength(0)
  })
})

describe('recalcularAgregadosPedido — ordem de operações', () => {
  it('chama lock ($queryRaw) ANTES da leitura de itens ($queryRaw) e update', async () => {
    const ordem: string[] = []
    let queryRawCount = 0
    const tx = {
      $queryRaw: vi.fn(async () => {
        queryRawCount += 1
        ordem.push(queryRawCount === 1 ? 'queryRawLock' : 'queryRawItens')
        return queryRawCount === 1 ? [PEDIDO_PADRAO] : []
      }),
      pedido: {
        update: vi.fn(async () => {
          ordem.push('update')
          return {}
        }),
      },
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await recalcularAgregadosPedido(tx as any, PEDIDO_ID, ORG)

    expect(ordem).toEqual(['queryRawLock', 'queryRawItens', 'update'])
  })

  it('consulta itens via segundo $queryRaw (public.pedido_item)', async () => {
    const { tx, queryRawCalls } = fabricarTx({
      pedido: PEDIDO_PADRAO,
      itens: [],
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await recalcularAgregadosPedido(tx as any, PEDIDO_ID, ORG)

    expect(queryRawCalls).toHaveLength(2)
  })
})

// ─── Onda A8 — Homogeneidade de moeda/unidade ───────────────────────────────

describe('recalcularAgregadosPedido — homogeneidade (Onda A8)', () => {
  it('moedas iguais entre itens → soma normal de valor_total_pedido', async () => {
    const { tx, updateCalls } = fabricarTx({
      pedido: PEDIDO_PADRAO,
      itens: [
        { valor_total_item: 100, quantidade_inicial_item: 10, peso_liquido_unitario_item: 1, peso_bruto_unitario_item: 1, cubagem_unitaria_item: 0.01, moeda_item: 'USD', unidade_comercializada_item: 'PCS' },
        { valor_total_item: 250, quantidade_inicial_item: 5,  peso_liquido_unitario_item: 2, peso_bruto_unitario_item: 2, cubagem_unitaria_item: 0.02, moeda_item: 'USD', unidade_comercializada_item: 'PCS' },
      ],
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await recalcularAgregadosPedido(tx as any, PEDIDO_ID, ORG)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (updateCalls[0] as any).data
    expect(data.valor_total_pedido).toBe(350)        // moedas iguais → soma
    expect(data.quantidade_total_pedido).toBe(15)    // unidades iguais → soma
  })

  it('moedas mistas entre itens com valor → valor_total_pedido = null', async () => {
    // Exatamente o cenário do screenshot: itens em EUR, CNY, USD misturados.
    // Sem checagem de homogeneidade, a soma matemática daria USD 920k (errado).
    // Com a checagem, valor_total_pedido vai a null e o front mostra
    // "⚠ Moedas divergentes entre itens" via flag _divergente.
    const { tx, updateCalls } = fabricarTx({
      pedido: PEDIDO_PADRAO,
      itens: [
        { valor_total_item: 33574.40,  quantidade_inicial_item: 100, peso_liquido_unitario_item: 1, peso_bruto_unitario_item: 1, cubagem_unitaria_item: 0.01, moeda_item: 'EUR', unidade_comercializada_item: 'PCS' },
        { valor_total_item: 112849.44, quantidade_inicial_item: 200, peso_liquido_unitario_item: 1, peso_bruto_unitario_item: 1, cubagem_unitaria_item: 0.01, moeda_item: 'CNY', unidade_comercializada_item: 'PCS' },
        { valor_total_item: 124973.64, quantidade_inicial_item: 300, peso_liquido_unitario_item: 1, peso_bruto_unitario_item: 1, cubagem_unitaria_item: 0.01, moeda_item: 'USD', unidade_comercializada_item: 'PCS' },
      ],
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await recalcularAgregadosPedido(tx as any, PEDIDO_ID, ORG)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (updateCalls[0] as any).data
    expect(data.valor_total_pedido).toBeNull()       // moedas mistas → null
    expect(data.quantidade_total_pedido).toBe(600)   // unidades iguais → soma OK
  })

  it('unidades mistas entre itens com qty → quantidade_total_pedido = null', async () => {
    const { tx, updateCalls } = fabricarTx({
      pedido: PEDIDO_PADRAO,
      itens: [
        { valor_total_item: 100, quantidade_inicial_item: 10, peso_liquido_unitario_item: 1, peso_bruto_unitario_item: 1, cubagem_unitaria_item: 0.01, moeda_item: 'USD', unidade_comercializada_item: 'PCS' },
        { valor_total_item: 200, quantidade_inicial_item: 50, peso_liquido_unitario_item: 1, peso_bruto_unitario_item: 1, cubagem_unitaria_item: 0.01, moeda_item: 'USD', unidade_comercializada_item: 'M2'  },
        { valor_total_item: 300, quantidade_inicial_item: 5,  peso_liquido_unitario_item: 1, peso_bruto_unitario_item: 1, cubagem_unitaria_item: 0.01, moeda_item: 'USD', unidade_comercializada_item: 'KG'  },
      ],
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await recalcularAgregadosPedido(tx as any, PEDIDO_ID, ORG)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (updateCalls[0] as any).data
    expect(data.valor_total_pedido).toBe(600)        // moedas iguais → soma OK
    expect(data.quantidade_total_pedido).toBeNull()  // unidades mistas → null
  })

  it('peso/cubagem sempre somam mesmo com moedas mistas (unidade física é homogênea)', async () => {
    const { tx, updateCalls } = fabricarTx({
      pedido: PEDIDO_PADRAO,
      itens: [
        { valor_total_item: 100, quantidade_inicial_item: 10, peso_liquido_unitario_item: 0.5, peso_bruto_unitario_item: 0.7, cubagem_unitaria_item: 0.01, moeda_item: 'EUR', unidade_comercializada_item: 'PCS' },
        { valor_total_item: 200, quantidade_inicial_item: 20, peso_liquido_unitario_item: 1,   peso_bruto_unitario_item: 1.2, cubagem_unitaria_item: 0.02, moeda_item: 'USD', unidade_comercializada_item: 'PCS' },
      ],
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await recalcularAgregadosPedido(tx as any, PEDIDO_ID, ORG)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (updateCalls[0] as any).data
    expect(data.valor_total_pedido).toBeNull()                   // moedas mistas
    expect(data.peso_liquido_total_pedido).toBe(25)              // 0.5×10 + 1×20 = 25
    expect(data.peso_bruto_total_pedido).toBe(31)                // 0.7×10 + 1.2×20 = 31
    expect(data.cubagem_total_pedido).toBe(0.5)                  // 0.01×10 + 0.02×20 = 0.5
  })

  it('itens sem valor (valor_total_item = 0) não contam para set de moedas', async () => {
    // Cenário: 1 item em EUR mas com valor zero (legado/rascunho).
    // Outros itens em USD com valores reais. Resultado: moeda USD homogênea,
    // soma OK. O item zero não polui a detecção.
    const { tx, updateCalls } = fabricarTx({
      pedido: PEDIDO_PADRAO,
      itens: [
        { valor_total_item: 0,   quantidade_inicial_item: 10, peso_liquido_unitario_item: 1, peso_bruto_unitario_item: 1, cubagem_unitaria_item: 0.01, moeda_item: 'EUR', unidade_comercializada_item: 'PCS' },
        { valor_total_item: 250, quantidade_inicial_item: 5,  peso_liquido_unitario_item: 1, peso_bruto_unitario_item: 1, cubagem_unitaria_item: 0.01, moeda_item: 'USD', unidade_comercializada_item: 'PCS' },
      ],
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await recalcularAgregadosPedido(tx as any, PEDIDO_ID, ORG)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (updateCalls[0] as any).data
    expect(data.valor_total_pedido).toBe(250)        // só USD contribui → soma
  })
})

// ─── campoItemAfetaAgregado ──────────────────────────────────────────────────

describe('campoItemAfetaAgregado — set de campos relevantes', () => {
  it('reconhece campos numéricos que afetam algum agregado', () => {
    expect(campoItemAfetaAgregado('valor_total_item')).toBe(true)
    expect(campoItemAfetaAgregado('valor_por_unidade_item')).toBe(true)
    expect(campoItemAfetaAgregado('quantidade_inicial_item')).toBe(true)
    expect(campoItemAfetaAgregado('quantidade_inicial_pedido')).toBe(true) // alias público
    expect(campoItemAfetaAgregado('peso_liquido_unitario_item')).toBe(true)
    expect(campoItemAfetaAgregado('peso_bruto_unitario_item')).toBe(true)
    expect(campoItemAfetaAgregado('cubagem_unitaria_item')).toBe(true)
  })

  it('rejeita campos textuais/enum que NÃO afetam agregados', () => {
    expect(campoItemAfetaAgregado('descricao_item')).toBe(false)
    expect(campoItemAfetaAgregado('part_number_item')).toBe(false)
    expect(campoItemAfetaAgregado('ncm_item')).toBe(false)
    expect(campoItemAfetaAgregado('incoterm_item')).toBe(false)
    expect(campoItemAfetaAgregado('referencia_importador_item')).toBe(false)
    expect(campoItemAfetaAgregado('moeda_item')).toBe(false)
    expect(campoItemAfetaAgregado('cobertura_cambial_item')).toBe(false)
  })

  it('expõe set imutável CAMPOS_ITEM_QUE_AFETAM_AGREGADO', () => {
    expect(CAMPOS_ITEM_QUE_AFETAM_AGREGADO).toBeInstanceOf(Set)
    expect(CAMPOS_ITEM_QUE_AFETAM_AGREGADO.size).toBeGreaterThanOrEqual(7)
  })
})
