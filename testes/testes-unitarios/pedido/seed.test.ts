/**
 * seed.test.ts — Testes unitários do gerador do seed do Pedido
 *
 * Valida invariantes críticos do `gerarPedido` em
 *   produto/pedido/server/prisma/seed.ts
 *
 * REGRESSÃO CRÍTICA: a fórmula canônica de saldo é
 *   saldo_item = max(0, quantidade_inicial - cancelada - transferida)
 * A `quantidade_pronta_total_item_pedido` NÃO entra no saldo.
 *
 * Dependência: `gerarPedido` precisa estar exportado no seed.ts.
 */

import { describe, it, expect } from 'vitest'
import { gerarPedido } from '../../../produto/pedido/server/prisma/seed'

const TENANT_ID = 'tenant-test-seed'
const ANO = 2026

const PERFIL_PEQ = {
  nome: 'pequeno',
  minItens: 1,
  maxItens: 3,
  valorMinItem: 200,
  valorMaxItem: 20_000,
} as const
const PERFIL_MED = {
  nome: 'medio',
  minItens: 4,
  maxItens: 15,
  valorMinItem: 500,
  valorMaxItem: 50_000,
} as const
const PERFIL_GRD = {
  nome: 'grande',
  minItens: 16,
  maxItens: 50,
  valorMinItem: 1_000,
  valorMaxItem: 200_000,
} as const

const PERFIS = [PERFIL_PEQ, PERFIL_MED, PERFIL_GRD] as const

// Dicionários esperados (espelham o seed)
const MOEDAS_OK = ['USD', 'EUR', 'CNY', 'JPY', 'GBP', 'BRL']
const UNIDADES_OK = ['UNID', 'KG', 'TON', 'M', 'M2', 'M3', 'LT', 'PARES', 'DUZIA', 'JOGO']
const INCOTERMS_OK = ['FOB', 'CIF', 'EXW', 'CFR', 'FCA', 'DDP', 'DAP', 'CPT', 'CIP', 'DPU', 'FAS']
const STATUS_OK = ['draft', 'aberto', 'em_andamento', 'aprovado', 'transferencia', 'consolidado', 'cancelado']
const TIPO_OK = ['importacao', 'exportacao']

// Helpers
function gerar(perfil: typeof PERFIL_PEQ | typeof PERFIL_MED | typeof PERFIL_GRD, index = 1) {
  return gerarPedido({ tenantId: TENANT_ID, perfil: perfil as any, index, ano: ANO })
}

function gerarLote(perfil: typeof PERFIL_PEQ | typeof PERFIL_MED | typeof PERFIL_GRD, n: number) {
  return Array.from({ length: n }, (_, i) => gerar(perfil, i + 1))
}

// ─── Grupo: invariantes estruturais ──────────────────────────────────────────

describe('seed/gerarPedido — invariantes estruturais', () => {
  it('retorna objeto { pedido, itens } com tipos corretos', () => {
    const r = gerar(PERFIL_PEQ)
    expect(r).toHaveProperty('pedido')
    expect(r).toHaveProperty('itens')
    expect(Array.isArray(r.itens)).toBe(true)
    expect(typeof r.pedido).toBe('object')
  })

  it('pedido.id segue padrão pedi_<perfil>_<tenantHash6>_\\d{7}', () => {
    for (const perfil of PERFIS) {
      const { pedido } = gerar(perfil, 42)
      // Format: pedi_<perfil3>_<md5_6chars>_<seq7>
      expect(pedido.id).toMatch(/^pedi_(peq|med|gra|grd)_[0-9a-f]{6}_\d{7}$/)
    }
  })

  it('pedido.tenant_id === TENANT_ID', () => {
    for (let i = 0; i < 10; i++) {
      const { pedido } = gerar(PERFIL_PEQ, i + 1)
      expect(pedido.tenant_id).toBe(TENANT_ID)
    }
  })

  it('itens.length está dentro do [minItens, maxItens] do perfil', () => {
    for (const perfil of PERFIS) {
      for (let i = 0; i < 20; i++) {
        const { itens } = gerar(perfil, i + 1)
        expect(itens.length).toBeGreaterThanOrEqual(perfil.minItens)
        expect(itens.length).toBeLessThanOrEqual(perfil.maxItens)
      }
    }
  })

  it('consistência intra-pedido: tenant_id, pedido_id, moeda, unidade iguais em todos itens', () => {
    for (let i = 0; i < 30; i++) {
      const { pedido, itens } = gerar(PERFIL_MED, i + 1)
      for (const it of itens) {
        expect(it.tenant_id).toBe(TENANT_ID)
        expect(it.pedido_id).toBe(pedido.id)
        expect(it.moeda_item).toBe(pedido.moeda_pedido)
        expect(it.unidade_comercializada_item).toBe(pedido.unidade_comercializada_pedido)
      }
    }
  })

  it('numero_pedido segue (PO|SO)-\\d{4}-\\d{5} conforme tipo_operacao', () => {
    for (let i = 0; i < 50; i++) {
      const { pedido } = gerar(PERFIL_PEQ, i + 1)
      expect(pedido.numero_pedido).toMatch(/^(PO|SO)-\d{4}-\d{5}$/)
      const prefix = pedido.tipo_operacao === 'importacao' ? 'PO' : 'SO'
      expect(pedido.numero_pedido.startsWith(prefix + '-')).toBe(true)
    }
  })

  it('tipo_operacao sempre importacao ou exportacao', () => {
    for (let i = 0; i < 50; i++) {
      const { pedido } = gerar(PERFIL_PEQ, i + 1)
      expect(TIPO_OK).toContain(pedido.tipo_operacao)
    }
  })

  it('status sempre dentro do enum', () => {
    for (let i = 0; i < 100; i++) {
      const { pedido } = gerar(PERFIL_PEQ, i + 1)
      expect(STATUS_OK).toContain(pedido.status)
    }
  })
})

// ─── Grupo: invariantes de saldo (REGRESSÃO CRÍTICA) ─────────────────────────

describe('seed/gerarPedido — invariantes de saldo (REGRESSÃO CRÍTICA)', () => {
  it('fórmula canônica: saldo = max(0, inicial - cancelada - transferida) em 100 pedidos', () => {
    const pedidos = [
      ...gerarLote(PERFIL_PEQ, 34),
      ...gerarLote(PERFIL_MED, 33),
      ...gerarLote(PERFIL_GRD, 33),
    ]
    for (const { itens } of pedidos) {
      for (const it of itens) {
        const esperado = Math.max(
          0,
          Number(it.quantidade_inicial_item_pedido) -
            Number(it.quantidade_cancelada_item_pedido) -
            Number(it.quantidade_transferida_item_pedido),
        )
        // tolerância por conta do toFixed(2) em ambos os lados
        expect(Number(it.saldo_item_pedido)).toBeCloseTo(Number(esperado.toFixed(2)), 2)
      }
    }
  })

  it('saldo nunca é negativo', () => {
    const pedidos = gerarLote(PERFIL_MED, 60)
    for (const { itens } of pedidos) {
      for (const it of itens) {
        expect(Number(it.saldo_item_pedido)).toBeGreaterThanOrEqual(0)
      }
    }
  })

  it('cancelada <= inicial em todos itens', () => {
    const pedidos = gerarLote(PERFIL_MED, 60)
    for (const { itens } of pedidos) {
      for (const it of itens) {
        expect(Number(it.quantidade_cancelada_item_pedido)).toBeLessThanOrEqual(
          Number(it.quantidade_inicial_item_pedido) + 1e-6,
        )
      }
    }
  })

  it('transferida <= inicial em todos itens', () => {
    const pedidos = gerarLote(PERFIL_MED, 60)
    for (const { itens } of pedidos) {
      for (const it of itens) {
        expect(Number(it.quantidade_transferida_item_pedido)).toBeLessThanOrEqual(
          Number(it.quantidade_inicial_item_pedido) + 1e-6,
        )
      }
    }
  })

  it('cancelada + transferida <= inicial (não pode efetivar mais do que tem)', () => {
    const pedidos = gerarLote(PERFIL_MED, 80)
    for (const { itens } of pedidos) {
      for (const it of itens) {
        const efetivada =
          Number(it.quantidade_cancelada_item_pedido) +
          Number(it.quantidade_transferida_item_pedido)
        expect(efetivada).toBeLessThanOrEqual(Number(it.quantidade_inicial_item_pedido) + 1e-6)
      }
    }
  })

  it('quantidade_pronta NÃO afeta o saldo (fórmula ignora pronta)', () => {
    // Gera e valida que, dado os campos existentes, se eu recalcular o saldo
    // IGNORANDO a quantidade pronta, obtenho o mesmo valor. Essa é a definição
    // operacional de "pronta não entra no saldo".
    const pedidos = gerarLote(PERFIL_PEQ, 50)
    for (const { itens } of pedidos) {
      for (const it of itens) {
        const saldoSemPronta = Math.max(
          0,
          Number(it.quantidade_inicial_item_pedido) -
            Number(it.quantidade_cancelada_item_pedido) -
            Number(it.quantidade_transferida_item_pedido),
        )
        expect(Number(it.saldo_item_pedido)).toBeCloseTo(Number(saldoSemPronta.toFixed(2)), 2)
      }
    }
  })
})

// ─── Grupo: dicionários ──────────────────────────────────────────────────────

describe('seed/gerarPedido — dicionários', () => {
  const LOTE = 200

  it('todas as moedas usadas estão no dicionário', () => {
    for (let i = 0; i < LOTE; i++) {
      const { pedido, itens } = gerar(PERFIL_PEQ, i + 1)
      expect(MOEDAS_OK).toContain(pedido.moeda_pedido)
      for (const it of itens) expect(MOEDAS_OK).toContain(it.moeda_item)
    }
  })

  it('todas as unidades usadas estão no dicionário', () => {
    for (let i = 0; i < LOTE; i++) {
      const { pedido, itens } = gerar(PERFIL_PEQ, i + 1)
      expect(UNIDADES_OK).toContain(pedido.unidade_comercializada_pedido)
      for (const it of itens) expect(UNIDADES_OK).toContain(it.unidade_comercializada_item)
    }
  })

  it('todos os incoterms usados estão no dicionário', () => {
    for (let i = 0; i < LOTE; i++) {
      const { pedido, itens } = gerar(PERFIL_PEQ, i + 1)
      expect(INCOTERMS_OK).toContain(pedido.incoterm)
      for (const it of itens) expect(INCOTERMS_OK).toContain(it.incoterm)
    }
  })

  it('todos os NCMs gerados batem regex \\d{4}\\.\\d{2}\\.\\d{2}', () => {
    for (let i = 0; i < LOTE; i++) {
      const { itens } = gerar(PERFIL_PEQ, i + 1)
      for (const it of itens) expect(it.ncm).toMatch(/^\d{4}\.\d{2}\.\d{2}$/)
    }
  })

  it('todos os part_numbers batem PN-\\d{5}-\\d{3}', () => {
    for (let i = 0; i < LOTE; i++) {
      const { itens } = gerar(PERFIL_PEQ, i + 1)
      for (const it of itens) expect(it.part_number).toMatch(/^PN-\d{5}-\d{3}$/)
    }
  })
})

// ─── Grupo: agregações coerentes ─────────────────────────────────────────────

describe('seed/gerarPedido — agregações coerentes', () => {
  const TOL_VALOR = 0.05
  const TOL_QTD = 0.05
  const TOL_PESO = 0.05

  it('valor_total_pedido === soma(itens.valor_total_itens)', () => {
    for (let i = 0; i < 40; i++) {
      const { pedido, itens } = gerar(PERFIL_MED, i + 1)
      const soma = itens.reduce((s: number, it: { valor_total_itens?: number | null }) => s + Number(it.valor_total_itens ?? 0), 0)
      expect(Math.abs(Number(pedido.valor_total_pedido) - soma)).toBeLessThanOrEqual(TOL_VALOR)
    }
  })

  it('quantidade_total_inicial_pedido === soma(itens.quantidade_inicial)', () => {
    for (let i = 0; i < 40; i++) {
      const { pedido, itens } = gerar(PERFIL_MED, i + 1)
      const soma = itens.reduce(
        (s: number, it: { quantidade_inicial_item_pedido: number }) => s + Number(it.quantidade_inicial_item_pedido),
        0,
      )
      expect(Math.abs(Number(pedido.quantidade_total_inicial_pedido) - soma)).toBeLessThanOrEqual(
        TOL_QTD,
      )
    }
  })

  it('peso_liquido_total_pedido === soma(peso_liquido_unit × qtd_inicial)', () => {
    for (let i = 0; i < 40; i++) {
      const { pedido, itens } = gerar(PERFIL_MED, i + 1)
      const soma = itens.reduce(
        (s: number, it: { peso_liquido_unitario_item?: number | null; quantidade_inicial_item_pedido: number }) =>
          s +
          Number(it.peso_liquido_unitario_item ?? 0) *
            Number(it.quantidade_inicial_item_pedido),
        0,
      )
      expect(Math.abs(Number(pedido.peso_liquido_total_pedido) - soma)).toBeLessThanOrEqual(
        TOL_PESO,
      )
    }
  })

  it('peso_bruto_total_pedido === soma(peso_bruto_unit × qtd_inicial)', () => {
    for (let i = 0; i < 40; i++) {
      const { pedido, itens } = gerar(PERFIL_MED, i + 1)
      const soma = itens.reduce(
        (s: number, it: { peso_bruto_unitario_item?: number | null; quantidade_inicial_item_pedido: number }) =>
          s +
          Number(it.peso_bruto_unitario_item ?? 0) *
            Number(it.quantidade_inicial_item_pedido),
        0,
      )
      expect(Math.abs(Number(pedido.peso_bruto_total_pedido) - soma)).toBeLessThanOrEqual(
        TOL_PESO,
      )
    }
  })
})

// ─── Grupo: tipo_operacao implications ───────────────────────────────────────

describe('seed/gerarPedido — tipo_operacao implications', () => {
  it('importacao: nome_exportador preenchido, nome_importador null em items', () => {
    let verificados = 0
    for (let i = 0; i < 300 && verificados < 30; i++) {
      const { pedido, itens } = gerar(PERFIL_PEQ, i + 1)
      if (pedido.tipo_operacao !== 'importacao') continue
      verificados++
      for (const it of itens) {
        expect(it.nome_exportador).toBeTruthy()
        expect(it.nome_importador).toBeNull()
      }
    }
    expect(verificados).toBeGreaterThan(0)
  })

  it('exportacao: nome_importador preenchido, nome_exportador null em items', () => {
    let verificados = 0
    for (let i = 0; i < 300 && verificados < 30; i++) {
      const { pedido, itens } = gerar(PERFIL_PEQ, i + 1)
      if (pedido.tipo_operacao !== 'exportacao') continue
      verificados++
      for (const it of itens) {
        expect(it.nome_importador).toBeTruthy()
        expect(it.nome_exportador).toBeNull()
      }
    }
    expect(verificados).toBeGreaterThan(0)
  })

  it('nome_fabricante SEMPRE preenchido (independe do tipo)', () => {
    for (let i = 0; i < 80; i++) {
      const { itens } = gerar(PERFIL_PEQ, i + 1)
      for (const it of itens) {
        expect(it.nome_fabricante).toBeTruthy()
        expect(typeof it.nome_fabricante).toBe('string')
      }
    }
  })
})

// ─── Grupo: refs ─────────────────────────────────────────────────────────────

describe('seed/gerarPedido — referências', () => {
  it('referencia_importador / exportador / fabricante batem REF-(IMP|EXP|FAB)-\\d{4}', () => {
    for (let i = 0; i < 50; i++) {
      const { pedido, itens } = gerar(PERFIL_PEQ, i + 1)
      expect(pedido.referencia_importador).toMatch(/^REF-IMP-\d{4}$/)
      expect(pedido.referencia_exportador).toMatch(/^REF-EXP-\d{4}$/)
      expect(pedido.referencia_fabricante).toMatch(/^REF-FAB-\d{4}$/)
      for (const it of itens) {
        expect(it.referencia_importador).toMatch(/^REF-IMP-\d{4}$/)
        expect(it.referencia_exportador).toMatch(/^REF-EXP-\d{4}$/)
        expect(it.referencia_fabricante).toMatch(/^REF-FAB-\d{4}$/)
      }
    }
  })

  it('numero_proforma segue PI-\\d{4}-\\d{5}', () => {
    for (let i = 0; i < 50; i++) {
      const { pedido } = gerar(PERFIL_PEQ, i + 1)
      expect(pedido.numero_proforma).toMatch(/^PI-\d{4}-\d{5}$/)
    }
  })

  it('numero_invoice segue CI-\\d{4}-\\d{5}', () => {
    for (let i = 0; i < 50; i++) {
      const { pedido } = gerar(PERFIL_PEQ, i + 1)
      expect(pedido.numero_invoice).toMatch(/^CI-\d{4}-\d{5}$/)
    }
  })
})

// ─── Grupo: range de valores por perfil ──────────────────────────────────────

describe('seed/gerarPedido — range de valores por perfil', () => {
  // Tolerância de ±5% por conta do randFloat que divide/multiplica por quantidade
  // com arredondamento em múltiplas etapas.
  const tol = 0.05

  it('perfil pequeno: cada item entre 200 e 20_000 (±5%)', () => {
    for (let i = 0; i < 60; i++) {
      const { itens } = gerar(PERFIL_PEQ, i + 1)
      for (const it of itens) {
        const v = Number(it.valor_total_itens)
        expect(v).toBeGreaterThanOrEqual(PERFIL_PEQ.valorMinItem * (1 - tol))
        expect(v).toBeLessThanOrEqual(PERFIL_PEQ.valorMaxItem * (1 + tol))
      }
    }
  })

  it('perfil médio: cada item entre 500 e 50_000 (±5%)', () => {
    for (let i = 0; i < 60; i++) {
      const { itens } = gerar(PERFIL_MED, i + 1)
      for (const it of itens) {
        const v = Number(it.valor_total_itens)
        expect(v).toBeGreaterThanOrEqual(PERFIL_MED.valorMinItem * (1 - tol))
        expect(v).toBeLessThanOrEqual(PERFIL_MED.valorMaxItem * (1 + tol))
      }
    }
  })

  it('perfil grande: cada item entre 1_000 e 200_000 (±5%)', () => {
    for (let i = 0; i < 40; i++) {
      const { itens } = gerar(PERFIL_GRD, i + 1)
      for (const it of itens) {
        const v = Number(it.valor_total_itens)
        expect(v).toBeGreaterThanOrEqual(PERFIL_GRD.valorMinItem * (1 - tol))
        expect(v).toBeLessThanOrEqual(PERFIL_GRD.valorMaxItem * (1 + tol))
      }
    }
  })
})
