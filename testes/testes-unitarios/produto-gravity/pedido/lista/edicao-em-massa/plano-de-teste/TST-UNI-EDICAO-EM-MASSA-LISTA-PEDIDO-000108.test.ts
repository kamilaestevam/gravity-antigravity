// TST-UNI-EDICAO-EM-MASSA-LISTA-PEDIDO-000108
// @vitest-environment node
import { describe, it, expect } from 'vitest'

function dateToIso(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

function aplicarOperacao(
  valorAtual: string | number | null,
  operacao: string,
  valorNovo: string | number,
): string | number {
  if (operacao === 'substituir') return valorNovo
  if (operacao === 'somar') return Number(valorAtual ?? 0) + Number(valorNovo)
  if (operacao === 'subtrair') return Number(valorAtual ?? 0) - Number(valorNovo)
  if (operacao === 'percentual') {
    const base = Number(valorAtual ?? 0)
    return base + (base * Number(valorNovo) / 100)
  }
  if (operacao === 'avancar_dias') {
    const d = new Date(String(valorAtual))
    d.setDate(d.getDate() + Number(valorNovo))
    return d.toISOString().split('T')[0]
  }
  if (operacao === 'recuar_dias') {
    const d = new Date(String(valorAtual))
    d.setDate(d.getDate() - Number(valorNovo))
    return d.toISOString().split('T')[0]
  }
  return valorNovo
}

const CAMPOS_UNIQUE_PEDIDO = new Set<string>(['numero_pedido'])

function validarUniqueEmMassa(pedidoIds: string[], campo: string, operacao: string): string | null {
  if (pedidoIds.length > 1 && CAMPOS_UNIQUE_PEDIDO.has(campo) && operacao === 'substituir') {
    return `O campo "Número do Pedido" não pode receber o mesmo valor em ${pedidoIds.length} pedidos`
  }
  return null
}

/** Espelha a lógica de pedidosAfetados do fast path em edicaoEmMassaService.ts */
function calcularPedidosAfetadosFastPath(opts: {
  pedidoIds: string[]
  pedidoIdsAlvo: string[]
  pedidoIdsComItensAlterados: string[]
  temUpdatePedido: boolean
  temUpdateItem: boolean
}): Set<string> {
  const pedidosAfetados = new Set<string>()
  if (opts.temUpdatePedido) {
    opts.pedidoIdsAlvo.forEach(id => pedidosAfetados.add(id))
  }
  if (opts.temUpdateItem) {
    opts.pedidoIdsComItensAlterados.forEach(id => pedidosAfetados.add(id))
  }
  return pedidosAfetados
}

function pedidosParaAudit(
  todosPedidoIds: string[],
  pedidosAfetados: Set<string>,
): string[] {
  return todosPedidoIds.filter(id => pedidosAfetados.has(id))
}

describe('TST-UNI-EDICAO-EM-MASSA-LISTA-PEDIDO-000108', () => {
  describe('ETAPA 1 — Operações', () => {
    it('U01: substituir texto, número, data e NCM', () => {
      expect(aplicarOperacao('CIF', 'substituir', 'FOB')).toBe('FOB')
      expect(aplicarOperacao(50, 'substituir', 100)).toBe(100)
      expect(aplicarOperacao('2026-01-01', 'substituir', '2026-06-01')).toBe('2026-06-01')
      expect(aplicarOperacao('8471.30.11', 'substituir', '8471.30.19')).toBe('8471.30.19')
    })

    it('U02: somar, subtrair e percentual', () => {
      expect(aplicarOperacao(100, 'somar', 50)).toBe(150)
      expect(aplicarOperacao(100, 'subtrair', 30)).toBe(70)
      expect(aplicarOperacao(200, 'percentual', 10)).toBe(220)
    })

    it('U03: avancar_dias e recuar_dias', () => {
      expect(aplicarOperacao('2026-06-01', 'avancar_dias', 5)).toBe('2026-06-06')
      expect(aplicarOperacao('2026-06-10', 'recuar_dias', 3)).toBe('2026-06-07')
    })
  })

  describe('ETAPA 2 — Unique', () => {
    it('U04: 1 pedido + substituir numero_pedido → permitido', () => {
      expect(validarUniqueEmMassa(['ped_001'], 'numero_pedido', 'substituir')).toBeNull()
    })

    it('U05: 2+ pedidos + substituir numero_pedido → bloqueado', () => {
      expect(validarUniqueEmMassa(['p1', 'p2'], 'numero_pedido', 'substituir')).toContain('2 pedidos')
    })

    it('U06: 2+ pedidos + somar numero_pedido → permitido', () => {
      expect(validarUniqueEmMassa(['p1', 'p2'], 'numero_pedido', 'somar')).toBeNull()
    })
  })

  describe('ETAPA 3 — dateToIso', () => {
    it('U07: dateToIso preserva dia civil local', () => {
      expect(dateToIso(new Date(2026, 6, 15))).toBe('2026-07-15')
    })

    it('U08: toISOString().split pode divergir à noite BRT', () => {
      const local = new Date(2026, 6, 15, 22, 0, 0)
      const antiPadrao = local.toISOString().split('T')[0]
      expect(dateToIso(local)).toBe('2026-07-15')
      if (antiPadrao !== '2026-07-15') {
        expect(dateToIso(local)).not.toBe(antiPadrao)
      }
    })
  })

  describe('ETAPA 4 — Fast path pedidosAfetados', () => {
    it('U09: só campos pedido → pedidoIdsAlvo', () => {
      const s = calcularPedidosAfetadosFastPath({
        pedidoIds: ['p1', 'p2', 'p3'],
        pedidoIdsAlvo: ['p1', 'p2'],
        pedidoIdsComItensAlterados: [],
        temUpdatePedido: true,
        temUpdateItem: false,
      })
      expect([...s]).toEqual(['p1', 'p2'])
    })

    it('U10: só campos item sem filtro → todos pedidoIds', () => {
      const s = calcularPedidosAfetadosFastPath({
        pedidoIds: ['p1', 'p2'],
        pedidoIdsAlvo: [],
        pedidoIdsComItensAlterados: ['p1', 'p2'],
        temUpdatePedido: false,
        temUpdateItem: true,
      })
      expect(s.size).toBe(2)
    })

    it('U11: filtroItemIds → pedidos dos itens', () => {
      const s = calcularPedidosAfetadosFastPath({
        pedidoIds: ['p1', 'p2', 'p3'],
        pedidoIdsAlvo: [],
        pedidoIdsComItensAlterados: ['p2'],
        temUpdatePedido: false,
        temUpdateItem: true,
      })
      expect([...s]).toEqual(['p2'])
    })

    it('U12: pedido + item → união', () => {
      const s = calcularPedidosAfetadosFastPath({
        pedidoIds: ['p1', 'p2', 'p3'],
        pedidoIdsAlvo: ['p1'],
        pedidoIdsComItensAlterados: ['p2'],
        temUpdatePedido: true,
        temUpdateItem: true,
      })
      expect([...s].sort()).toEqual(['p1', 'p2'])
    })

    it('U13: audit só pedidos afetados', () => {
      const afetados = new Set(['p1'])
      expect(pedidosParaAudit(['p1', 'p2', 'p3'], afetados)).toEqual(['p1'])
    })
  })
})
