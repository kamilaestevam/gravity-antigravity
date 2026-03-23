/**
 * Testes unitários — SimulaCusto / calculator.ts
 * Cobre: calcularBreakdown, aplicarDesconto, gerarAlertas, executarSimulacao
 */

import { describe, it, expect } from 'vitest'
import {
  calcularBreakdown,
  aplicarDesconto,
  gerarAlertas,
  executarSimulacao,
  SimulacaoInput,
  ItemCategoria,
} from '../../../servicos-global/produto/simula-custo/server/lib/calculator'

// ─────────────────────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────────────────────

const itensPadroes: ItemCategoria[] = [
  {
    categoria: 'infraestrutura',
    descricao: 'Servidor Cloud',
    quantidade: 2,
    precoUnitario: 500,
  },
  {
    categoria: 'licenca',
    descricao: 'Licença Software',
    quantidade: 5,
    precoUnitario: 100,
  },
  {
    categoria: 'suporte',
    descricao: 'Suporte Técnico',
    quantidade: 1,
    precoUnitario: 300,
  },
]

const inputPadrao: SimulacaoInput = {
  tenantId: 'tenant-001',
  nomeServico: 'ERP Cloud',
  itens: itensPadroes,
}

// ─────────────────────────────────────────────────────────────
// calcularBreakdown
// ─────────────────────────────────────────────────────────────

describe('calcularBreakdown', () => {
  it('deve retornar subtotais corretos por categoria', () => {
    const mapa = calcularBreakdown(itensPadroes)

    expect(mapa.get('infraestrutura')).toBe(1000) // 2 * 500
    expect(mapa.get('licenca')).toBe(500)          // 5 * 100
    expect(mapa.get('suporte')).toBe(300)           // 1 * 300
  })

  it('deve acumular itens da mesma categoria', () => {
    const itens: ItemCategoria[] = [
      { categoria: 'licenca', descricao: 'Lic A', quantidade: 2, precoUnitario: 100 },
      { categoria: 'licenca', descricao: 'Lic B', quantidade: 3, precoUnitario: 200 },
    ]

    const mapa = calcularBreakdown(itens)
    expect(mapa.get('licenca')).toBe(800) // (2*100) + (3*200)
  })

  it('deve retornar mapa vazio para lista vazia', () => {
    const mapa = calcularBreakdown([])
    expect(mapa.size).toBe(0)
  })

  it('deve suportar todas as 5 categorias', () => {
    const itens: ItemCategoria[] = [
      { categoria: 'infraestrutura', descricao: 'I', quantidade: 1, precoUnitario: 10 },
      { categoria: 'suporte', descricao: 'S', quantidade: 1, precoUnitario: 20 },
      { categoria: 'licenca', descricao: 'L', quantidade: 1, precoUnitario: 30 },
      { categoria: 'integracao', descricao: 'In', quantidade: 1, precoUnitario: 40 },
      { categoria: 'customizacao', descricao: 'C', quantidade: 1, precoUnitario: 50 },
    ]
    const mapa = calcularBreakdown(itens)

    expect(mapa.size).toBe(5)
    expect(mapa.get('integracao')).toBe(40)
    expect(mapa.get('customizacao')).toBe(50)
  })
})

// ─────────────────────────────────────────────────────────────
// aplicarDesconto
// ─────────────────────────────────────────────────────────────

describe('aplicarDesconto', () => {
  it('deve calcular 10% de desconto corretamente', () => {
    expect(aplicarDesconto(1000, 10)).toBe(100)
  })

  it('deve retornar 0 para desconto 0%', () => {
    expect(aplicarDesconto(500, 0)).toBe(0)
  })

  it('deve retornar o valor total para desconto 100%', () => {
    expect(aplicarDesconto(750, 100)).toBe(750)
  })

  it('deve calcular desconto fracionado', () => {
    expect(aplicarDesconto(200, 15.5)).toBeCloseTo(31, 1)
  })

  it('deve lançar RangeError para desconto negativo', () => {
    expect(() => aplicarDesconto(1000, -1)).toThrow(RangeError)
  })

  it('deve lançar RangeError para desconto acima de 100', () => {
    expect(() => aplicarDesconto(1000, 101)).toThrow(RangeError)
  })

  it('deve incluir o valor inválido na mensagem de erro', () => {
    expect(() => aplicarDesconto(1000, 150)).toThrow('150')
  })
})

// ─────────────────────────────────────────────────────────────
// gerarAlertas
// ─────────────────────────────────────────────────────────────

describe('gerarAlertas', () => {
  it('deve retornar lista vazia quando sem condições de alerta', () => {
    const alertas = gerarAlertas(inputPadrao, 1800)
    expect(alertas).toEqual([])
  })

  it('deve alertar sobre alto volume de usuários ativos (>1000)', () => {
    const input: SimulacaoInput = {
      ...inputPadrao,
      metricasDashboard: { usuariosAtivos: 1500 },
    }
    const alertas = gerarAlertas(input, 1800)
    expect(alertas.some((a) => a.includes('Enterprise'))).toBe(true)
  })

  it('NÃO deve alertar para 999 usuários ativos', () => {
    const input: SimulacaoInput = {
      ...inputPadrao,
      metricasDashboard: { usuariosAtivos: 999 },
    }
    const alertas = gerarAlertas(input, 1800)
    expect(alertas.some((a) => a.includes('Enterprise'))).toBe(false)
  })

  it('deve alertar sobre alto volume de transações (>50000)', () => {
    const input: SimulacaoInput = {
      ...inputPadrao,
      metricasDashboard: { volumeTransacoes: 60000 },
    }
    const alertas = gerarAlertas(input, 1800)
    expect(alertas.some((a) => a.includes('API'))).toBe(true)
  })

  it('deve alertar quando custo simulado >20% acima da média histórica', () => {
    const input: SimulacaoInput = {
      ...inputPadrao,
      historicoRelatorio: { mediaGastoMensal: 1000 },
    }
    // 1300 é 30% acima de 1000
    const alertas = gerarAlertas(input, 1300)
    expect(alertas.some((a) => a.includes('acima da média'))).toBe(true)
  })

  it('deve alertar quando custo simulado <-10% abaixo da média histórica', () => {
    const input: SimulacaoInput = {
      ...inputPadrao,
      historicoRelatorio: { mediaGastoMensal: 1000 },
    }
    // 850 é 15% abaixo de 1000
    const alertas = gerarAlertas(input, 850)
    expect(alertas.some((a) => a.includes('abaixo da média'))).toBe(true)
  })

  it('não deve alertar histórico quando variação está dentro do range', () => {
    const input: SimulacaoInput = {
      ...inputPadrao,
      historicoRelatorio: { mediaGastoMensal: 1000 },
    }
    // 1050 é apenas 5% acima — dentro do range
    const alertas = gerarAlertas(input, 1050)
    expect(alertas.some((a) => a.includes('média'))).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────
// executarSimulacao
// ─────────────────────────────────────────────────────────────

describe('executarSimulacao', () => {
  it('deve calcular totais corretos sem desconto', () => {
    const result = executarSimulacao(inputPadrao)

    // 2*500 + 5*100 + 1*300 = 1800
    expect(result.subtotalBruto).toBe(1800)
    expect(result.descontoValor).toBe(0)
    expect(result.totalFinal).toBe(1800)
  })

  it('deve aplicar desconto corretamente', () => {
    const input: SimulacaoInput = {
      ...inputPadrao,
      descontoPercentual: 10,
    }
    const result = executarSimulacao(input)

    expect(result.subtotalBruto).toBe(1800)
    expect(result.descontoValor).toBe(180)
    expect(result.totalFinal).toBe(1620)
  })

  it('deve retornar breakdown com todas as categorias presentes', () => {
    const result = executarSimulacao(inputPadrao)

    const categorias = result.breakdown.map((b) => b.categoria)
    expect(categorias).toContain('infraestrutura')
    expect(categorias).toContain('licenca')
    expect(categorias).toContain('suporte')
  })

  it('deve retornar percentuais que somam aproximadamente 100', () => {
    const result = executarSimulacao(inputPadrao)
    const soma = result.breakdown.reduce((acc, b) => acc + b.percentualDoTotal, 0)
    // soma pode ter arredondamento pequeno
    expect(soma).toBeGreaterThan(98)
    expect(soma).toBeLessThanOrEqual(101)
  })

  it('deve incluir tenantId e nomeServico no resultado', () => {
    const result = executarSimulacao(inputPadrao)
    expect(result.tenantId).toBe('tenant-001')
    expect(result.nomeServico).toBe('ERP Cloud')
  })

  it('deve retornar criadoEm como ISO string válida', () => {
    const result = executarSimulacao(inputPadrao)
    const data = new Date(result.criadoEm)
    expect(data.getTime()).not.toBeNaN()
  })

  it('deve lançar erro quando itens estiver vazio', () => {
    const input: SimulacaoInput = {
      ...inputPadrao,
      itens: [],
    }
    expect(() => executarSimulacao(input)).toThrow()
  })

  it('deve processar único item corretamente', () => {
    const input: SimulacaoInput = {
      tenantId: 'tenant-x',
      nomeServico: 'Serviço Simples',
      itens: [
        { categoria: 'licenca', descricao: 'Lic Única', quantidade: 3, precoUnitario: 250 },
      ],
    }
    const result = executarSimulacao(input)
    expect(result.subtotalBruto).toBe(750)
    expect(result.totalFinal).toBe(750)
    expect(result.breakdown).toHaveLength(1)
  })

  it('deve gerar alertas quando métricas ultrapassam limites', () => {
    const input: SimulacaoInput = {
      ...inputPadrao,
      metricasDashboard: { usuariosAtivos: 2000, volumeTransacoes: 100000 },
    }
    const result = executarSimulacao(input)
    expect(result.alertas.length).toBeGreaterThanOrEqual(2)
  })

  it('deve retornar alertas vazios em cenário normal', () => {
    const result = executarSimulacao(inputPadrao)
    expect(result.alertas).toEqual([])
  })
})
