/**
 * Testes unitários — KanbanPedidos.tsx
 *
 * Testa as funções helper do Kanban do Pedido (isoláveis sem DOM):
 *   - dataCritica(): menor data prevista + urgência
 *   - saldoPct: cálculo da barra de saldo
 *   - KANBAN_PADRAO: estrutura e limites
 *   - KANBAN_CAMPOS_DISPONIVEIS: categorias de campos
 */

import { describe, it, expect } from 'vitest'

// ── Helpers replicados para teste (lógica pura de KanbanPedidos.tsx) ─────────

function dataCritica(p: {
  data_prevista_pedido_pronto?: string | null
  data_prevista_inspecao_pedido?: string | null
  data_prevista_coleta_pedido?: string | null
}): { label: string; urgencia: 'ok' | 'alerta' | 'urgente' } | null {
  const candidatas = [
    p.data_prevista_pedido_pronto,
    p.data_prevista_inspecao_pedido,
    p.data_prevista_coleta_pedido,
  ].filter(Boolean) as string[]

  if (candidatas.length === 0) return null

  const datas = candidatas.map(d => new Date(d)).sort((a, b) => a.getTime() - b.getTime())
  const menor = datas[0]
  const hoje = new Date()
  const diffDias = Math.ceil((menor.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))

  let urgencia: 'ok' | 'alerta' | 'urgente' = 'ok'
  if (diffDias <= 1) urgencia = 'urgente'
  else if (diffDias <= 7) urgencia = 'alerta'

  const label = menor.toLocaleDateString('pt-BR')
  return { label, urgencia }
}

function saldoPct(saldoTotal: number | null | undefined, qtdInicial: number | null | undefined): number | null {
  if (saldoTotal != null && qtdInicial != null && qtdInicial > 0) {
    return Math.max(0, Math.min(100, (saldoTotal / qtdInicial) * 100))
  }
  return null
}

function diasParaData(dias: number): string {
  const d = new Date()
  d.setDate(d.getDate() + dias)
  return d.toISOString()
}

// ── dataCritica ──────────────────────────────────────────────────────────────

describe('dataCritica()', () => {
  it('retorna null quando não há datas previstas', () => {
    const result = dataCritica({
      data_prevista_pedido_pronto: null,
      data_prevista_inspecao_pedido: null,
      data_prevista_coleta_pedido: null,
    })
    expect(result).toBeNull()
  })

  it('retorna null quando todas as datas são undefined', () => {
    const result = dataCritica({})
    expect(result).toBeNull()
  })

  it('escolhe a menor data entre as três previstas', () => {
    const mais_cedo  = diasParaData(30)
    const mais_tarde = diasParaData(60)
    const meio       = diasParaData(45)

    const result = dataCritica({
      data_prevista_pedido_pronto:  mais_tarde,
      data_prevista_inspecao_pedido: mais_cedo,
      data_prevista_coleta_pedido:  meio,
    })

    expect(result).not.toBeNull()
    const esperado = new Date(mais_cedo).toLocaleDateString('pt-BR')
    expect(result!.label).toBe(esperado)
  })

  it('urgencia = ok quando faltam > 7 dias', () => {
    const result = dataCritica({ data_prevista_pedido_pronto: diasParaData(10) })
    expect(result?.urgencia).toBe('ok')
  })

  it('urgencia = alerta quando faltam 2–7 dias', () => {
    const result = dataCritica({ data_prevista_pedido_pronto: diasParaData(5) })
    expect(result?.urgencia).toBe('alerta')
  })

  it('urgencia = urgente quando falta 1 dia', () => {
    const result = dataCritica({ data_prevista_pedido_pronto: diasParaData(1) })
    expect(result?.urgencia).toBe('urgente')
  })

  it('urgencia = urgente quando data já passou (0 ou negativo)', () => {
    const result = dataCritica({ data_prevista_pedido_pronto: diasParaData(-1) })
    expect(result?.urgencia).toBe('urgente')
  })

  it('funciona com apenas uma data definida', () => {
    const d = diasParaData(20)
    const result = dataCritica({ data_prevista_coleta_pedido: d })
    expect(result).not.toBeNull()
    expect(result!.label).toBe(new Date(d).toLocaleDateString('pt-BR'))
  })

  it('ignora campos null misturados com data válida', () => {
    const d = diasParaData(3)
    const result = dataCritica({
      data_prevista_pedido_pronto:   null,
      data_prevista_inspecao_pedido: d,
      data_prevista_coleta_pedido:   null,
    })
    expect(result?.urgencia).toBe('alerta')
  })
})

// ── saldoPct ─────────────────────────────────────────────────────────────────

describe('saldoPct()', () => {
  it('calcula 100% quando saldo = inicial', () => {
    expect(saldoPct(500, 500)).toBe(100)
  })

  it('calcula 50% quando saldo = metade do inicial', () => {
    expect(saldoPct(250, 500)).toBe(50)
  })

  it('calcula 0% quando saldo é 0', () => {
    expect(saldoPct(0, 500)).toBe(0)
  })

  it('não ultrapassa 100% (saldo > inicial)', () => {
    expect(saldoPct(600, 500)).toBe(100)
  })

  it('não vai abaixo de 0%', () => {
    expect(saldoPct(-100, 500)).toBe(0)
  })

  it('retorna null quando qtdInicial é null', () => {
    expect(saldoPct(100, null)).toBeNull()
  })

  it('retorna null quando saldoTotal é null', () => {
    expect(saldoPct(null, 500)).toBeNull()
  })

  it('retorna null quando qtdInicial é 0 (divisão por zero)', () => {
    expect(saldoPct(0, 0)).toBeNull()
  })

  it('retorna null quando ambos são undefined', () => {
    expect(saldoPct(undefined, undefined)).toBeNull()
  })
})

// ── KANBAN_PADRAO — estrutura e limites ───────────────────────────────────────

import { KANBAN_PADRAO, KANBAN_LIMITES, KANBAN_CAMPOS_DISPONIVEIS } from '../../../produto/pedido/client/src/shared/types'

describe('KANBAN_PADRAO', () => {
  it('possui exatamente 3 abas configuráveis', () => {
    expect(KANBAN_PADRAO.abas).toHaveLength(3)
  })

  it('abas são: pedido, quantidades, datas', () => {
    const nomes = KANBAN_PADRAO.abas.map(a => a.aba)
    expect(nomes).toContain('pedido')
    expect(nomes).toContain('quantidades')
    expect(nomes).toContain('datas')
  })

  it('aba pedido não excede o limite', () => {
    const aba = KANBAN_PADRAO.abas.find(a => a.aba === 'pedido')!
    expect(aba.campos.length).toBeLessThanOrEqual(KANBAN_LIMITES.pedido)
  })

  it('aba quantidades não excede o limite', () => {
    const aba = KANBAN_PADRAO.abas.find(a => a.aba === 'quantidades')!
    expect(aba.campos.length).toBeLessThanOrEqual(KANBAN_LIMITES.quantidades)
  })

  it('aba datas não excede o limite', () => {
    const aba = KANBAN_PADRAO.abas.find(a => a.aba === 'datas')!
    expect(aba.campos.length).toBeLessThanOrEqual(KANBAN_LIMITES.datas)
  })

  it('todos os campos têm visivel = true por padrão', () => {
    for (const aba of KANBAN_PADRAO.abas) {
      for (const campo of aba.campos) {
        expect(campo.visivel).toBe(true)
      }
    }
  })

  it('todos os campos têm ordem >= 0', () => {
    for (const aba of KANBAN_PADRAO.abas) {
      for (const campo of aba.campos) {
        expect(campo.ordem).toBeGreaterThanOrEqual(0)
      }
    }
  })
})

// ── KANBAN_CAMPOS_DISPONIVEIS ────────────────────────────────────────────────

describe('KANBAN_CAMPOS_DISPONIVEIS', () => {
  it('lista campos disponíveis para seleção', () => {
    expect(Array.isArray(KANBAN_CAMPOS_DISPONIVEIS)).toBe(true)
    expect(KANBAN_CAMPOS_DISPONIVEIS.length).toBeGreaterThan(0)
  })

  it('cada campo tem propriedades obrigatórias: campo, label, categoria', () => {
    for (const c of KANBAN_CAMPOS_DISPONIVEIS) {
      expect(c).toHaveProperty('campo')
      expect(c).toHaveProperty('label')
      expect(c).toHaveProperty('categoria')
      expect(['pedido', 'quantidades', 'datas']).toContain(c.categoria)
    }
  })

  it('campos de data estão na categoria datas', () => {
    const dataCampos = KANBAN_CAMPOS_DISPONIVEIS.filter(c => c.campo.startsWith('data_'))
    for (const c of dataCampos) {
      expect(c.categoria).toBe('datas')
    }
  })

  it('campos de quantidade estão na categoria quantidades', () => {
    const qtdCampos = KANBAN_CAMPOS_DISPONIVEIS.filter(
      c => c.campo.startsWith('quantidade_') || c.campo.startsWith('saldo_')
    )
    for (const c of qtdCampos) {
      expect(c.categoria).toBe('quantidades')
    }
  })

  it('não há campos duplicados', () => {
    const campos = KANBAN_CAMPOS_DISPONIVEIS.map(c => c.campo)
    const unicos = new Set(campos)
    expect(unicos.size).toBe(campos.length)
  })
})

// ── KANBAN_LIMITES ───────────────────────────────────────────────────────────

describe('KANBAN_LIMITES', () => {
  it('define limite para aba pedido', () => {
    expect(typeof KANBAN_LIMITES.pedido).toBe('number')
    expect(KANBAN_LIMITES.pedido).toBeGreaterThan(0)
  })

  it('define limite para aba quantidades', () => {
    expect(typeof KANBAN_LIMITES.quantidades).toBe('number')
    expect(KANBAN_LIMITES.quantidades).toBeGreaterThan(0)
  })

  it('define limite para aba datas', () => {
    expect(typeof KANBAN_LIMITES.datas).toBe('number')
    expect(KANBAN_LIMITES.datas).toBeGreaterThan(0)
  })
})
