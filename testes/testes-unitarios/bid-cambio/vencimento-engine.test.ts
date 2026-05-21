/**
 * @vitest-environment node
 *
 * vencimento-engine.test.ts — Testes do motor de calculo de datas de vencimento.
 * Verifica calcularDataVencimento e recalcularVencimentosParcelas com nomes DDD.
 */
import { describe, it, expect } from 'vitest'
import {
  calcularDataVencimento,
  recalcularVencimentosParcelas,
} from '../../../servicos-global/produto/bid-cambio/server/src/services/vencimentoEngine'

// ============================================================
// Helpers
// ============================================================

function data(str: string): Date {
  return new Date(str)
}

function formatISO(d: Date | null): string | null {
  return d ? d.toISOString().split('T')[0] : null
}

// ============================================================
// 1. calcularDataVencimento
// ============================================================
describe('calcularDataVencimento', () => {
  const datasCompletas = {
    data_embarque_final: data('2026-01-10'),
    data_chegada_final: data('2026-02-05'),
    data_registro_di: data('2026-02-10'),
    data_desembaraco: data('2026-02-15'),
    data_entrega: data('2026-02-20'),
    data_carga_pronta: data('2026-01-05'),
    data_esperada_prontidao: data('2026-01-03'),
  }

  it('DATA_EMBARQUE: base + prazo', () => {
    const resultado = calcularDataVencimento('DATA_EMBARQUE', 30, datasCompletas)
    expect(formatISO(resultado)).toBe('2026-02-09')
  })

  it('DATA_CHEGADA: base + prazo', () => {
    const resultado = calcularDataVencimento('DATA_CHEGADA', 10, datasCompletas)
    expect(formatISO(resultado)).toBe('2026-02-15')
  })

  it('DATA_REGISTRO_DI: base + prazo', () => {
    const resultado = calcularDataVencimento('DATA_REGISTRO_DI', 5, datasCompletas)
    expect(formatISO(resultado)).toBe('2026-02-15')
  })

  it('DATA_DESEMBARACO: base + prazo', () => {
    const resultado = calcularDataVencimento('DATA_DESEMBARACO', 0, datasCompletas)
    expect(formatISO(resultado)).toBe('2026-02-15')
  })

  it('DATA_ENTREGA: base + prazo', () => {
    const resultado = calcularDataVencimento('DATA_ENTREGA', 7, datasCompletas)
    expect(formatISO(resultado)).toBe('2026-02-27')
  })

  it('PRONTIDAO_CARGA: usa data_carga_pronta quando disponivel (RN-107)', () => {
    const resultado = calcularDataVencimento('PRONTIDAO_CARGA', 15, datasCompletas)
    // data_carga_pronta = 2026-01-05 + 15 dias = 2026-01-20
    expect(formatISO(resultado)).toBe('2026-01-20')
  })

  it('PRONTIDAO_CARGA: fallback para data_esperada_prontidao quando carga_pronta ausente', () => {
    const datasSeCargas = {
      ...datasCompletas,
      data_carga_pronta: null,
    }
    const resultado = calcularDataVencimento('PRONTIDAO_CARGA', 15, datasSeCargas)
    // data_esperada_prontidao = 2026-01-03 + 15 dias = 2026-01-18
    expect(formatISO(resultado)).toBe('2026-01-18')
  })

  it('PRONTIDAO_CARGA: retorna null quando ambas datas ausentes', () => {
    const datasSemProntidao = {
      ...datasCompletas,
      data_carga_pronta: null,
      data_esperada_prontidao: null,
    }
    const resultado = calcularDataVencimento('PRONTIDAO_CARGA', 15, datasSemProntidao)
    expect(resultado).toBeNull()
  })

  it('DATA_FIXA: usa dataFixa parametro', () => {
    const dataFixaValor = data('2026-06-01')
    const resultado = calcularDataVencimento('DATA_FIXA', 0, datasCompletas, dataFixaValor)
    expect(formatISO(resultado)).toBe('2026-06-01')
  })

  it('DATA_FIXA: com prazo adicional', () => {
    const dataFixaValor = data('2026-06-01')
    const resultado = calcularDataVencimento('DATA_FIXA', 10, datasCompletas, dataFixaValor)
    expect(formatISO(resultado)).toBe('2026-06-11')
  })

  it('DATA_FIXA: retorna null quando dataFixa nao fornecida', () => {
    const resultado = calcularDataVencimento('DATA_FIXA', 10, datasCompletas)
    expect(resultado).toBeNull()
  })

  it('retorna null quando data base nao esta disponivel', () => {
    const datasVazias = {}
    expect(calcularDataVencimento('DATA_EMBARQUE', 30, datasVazias)).toBeNull()
    expect(calcularDataVencimento('DATA_CHEGADA', 30, datasVazias)).toBeNull()
    expect(calcularDataVencimento('DATA_REGISTRO_DI', 30, datasVazias)).toBeNull()
    expect(calcularDataVencimento('DATA_DESEMBARACO', 30, datasVazias)).toBeNull()
    expect(calcularDataVencimento('DATA_ENTREGA', 30, datasVazias)).toBeNull()
  })

  it('prazo zero retorna a propria data base', () => {
    const resultado = calcularDataVencimento('DATA_EMBARQUE', 0, datasCompletas)
    expect(formatISO(resultado)).toBe('2026-01-10')
  })

  it('prazo negativo subtrai dias', () => {
    const resultado = calcularDataVencimento('DATA_EMBARQUE', -5, datasCompletas)
    expect(formatISO(resultado)).toBe('2026-01-05')
  })
})

// ============================================================
// 2. recalcularVencimentosParcelas — usa nomes DDD
// ============================================================
describe('recalcularVencimentosParcelas', () => {
  const datas = {
    data_embarque_final: data('2026-03-01'),
    data_chegada_final: data('2026-03-20'),
  }

  it('recalcula parcelas PENDENTE com metodo e prazo definidos', () => {
    const parcelas = [
      {
        id_parcela_bid_cambio: 'p1',
        metodo_vencimento_parcela_bid_cambio: 'DATA_EMBARQUE' as const,
        prazo_dias_parcela_bid_cambio: 30,
        status_parcela_bid_cambio: 'PENDENTE',
      },
      {
        id_parcela_bid_cambio: 'p2',
        metodo_vencimento_parcela_bid_cambio: 'DATA_CHEGADA' as const,
        prazo_dias_parcela_bid_cambio: 10,
        status_parcela_bid_cambio: 'PENDENTE',
      },
    ]

    const resultado = recalcularVencimentosParcelas(parcelas, datas)

    expect(resultado).toHaveLength(2)
    expect(resultado[0].id_parcela_bid_cambio).toBe('p1')
    expect(formatISO(resultado[0].data_vencimento_parcela_bid_cambio)).toBe('2026-03-31')
    expect(resultado[1].id_parcela_bid_cambio).toBe('p2')
    expect(formatISO(resultado[1].data_vencimento_parcela_bid_cambio)).toBe('2026-03-30')
  })

  it('ignora parcelas com status diferente de PENDENTE', () => {
    const parcelas = [
      {
        id_parcela_bid_cambio: 'p1',
        metodo_vencimento_parcela_bid_cambio: 'DATA_EMBARQUE' as const,
        prazo_dias_parcela_bid_cambio: 30,
        status_parcela_bid_cambio: 'PAGO',
      },
      {
        id_parcela_bid_cambio: 'p2',
        metodo_vencimento_parcela_bid_cambio: 'DATA_CHEGADA' as const,
        prazo_dias_parcela_bid_cambio: 10,
        status_parcela_bid_cambio: 'AGENDADO',
      },
    ]

    const resultado = recalcularVencimentosParcelas(parcelas, datas)
    expect(resultado).toHaveLength(0)
  })

  it('ignora parcelas sem metodo de vencimento', () => {
    const parcelas = [
      {
        id_parcela_bid_cambio: 'p1',
        metodo_vencimento_parcela_bid_cambio: null,
        prazo_dias_parcela_bid_cambio: 30,
        status_parcela_bid_cambio: 'PENDENTE',
      },
    ]

    const resultado = recalcularVencimentosParcelas(parcelas, datas)
    expect(resultado).toHaveLength(0)
  })

  it('ignora parcelas sem prazo_dias', () => {
    const parcelas = [
      {
        id_parcela_bid_cambio: 'p1',
        metodo_vencimento_parcela_bid_cambio: 'DATA_EMBARQUE' as const,
        prazo_dias_parcela_bid_cambio: null,
        status_parcela_bid_cambio: 'PENDENTE',
      },
    ]

    const resultado = recalcularVencimentosParcelas(parcelas, datas)
    expect(resultado).toHaveLength(0)
  })

  it('retorna data null quando data base nao esta disponivel', () => {
    const parcelas = [
      {
        id_parcela_bid_cambio: 'p1',
        metodo_vencimento_parcela_bid_cambio: 'DATA_REGISTRO_DI' as const,
        prazo_dias_parcela_bid_cambio: 10,
        status_parcela_bid_cambio: 'PENDENTE',
      },
    ]

    const resultado = recalcularVencimentosParcelas(parcelas, datas)
    expect(resultado).toHaveLength(1)
    expect(resultado[0].data_vencimento_parcela_bid_cambio).toBeNull()
  })

  it('retorna array vazio quando nao ha parcelas', () => {
    const resultado = recalcularVencimentosParcelas([], datas)
    expect(resultado).toHaveLength(0)
  })

  it('resultado usa campos DDD: id_parcela_bid_cambio e data_vencimento_parcela_bid_cambio', () => {
    const parcelas = [
      {
        id_parcela_bid_cambio: 'parcela-abc',
        metodo_vencimento_parcela_bid_cambio: 'DATA_EMBARQUE' as const,
        prazo_dias_parcela_bid_cambio: 0,
        status_parcela_bid_cambio: 'PENDENTE',
      },
    ]

    const resultado = recalcularVencimentosParcelas(parcelas, datas)
    expect(resultado[0]).toHaveProperty('id_parcela_bid_cambio')
    expect(resultado[0]).toHaveProperty('data_vencimento_parcela_bid_cambio')
    // Garante que NAO possui nomes legados
    expect(resultado[0]).not.toHaveProperty('id')
    expect(resultado[0]).not.toHaveProperty('dueDate')
    expect(resultado[0]).not.toHaveProperty('installment_id')
  })
})
