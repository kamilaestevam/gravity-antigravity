/**
 * Testes unitarios — BID Cambio / vencimentoEngine.ts
 * Testa os 7 metodos de calculo de data de vencimento (RN-107)
 */

import { describe, it, expect } from 'vitest'
import {
  calcularDataVencimento,
  recalcularVencimentosParcelas,
} from '../../../produto/bid-cambio/server/src/services/vencimentoEngine'

describe('calcularDataVencimento', () => {
  const datas = {
    data_carga_pronta: new Date('2026-04-01'),
    data_esperada_prontidao: new Date('2026-03-25'),
    data_embarque_final: new Date('2026-04-05'),
    data_chegada_final: new Date('2026-04-20'),
    data_registro_di: new Date('2026-04-22'),
    data_desembaraco: new Date('2026-04-25'),
    data_entrega: new Date('2026-04-28'),
  }

  it('deve calcular vencimento por DATA_EMBARQUE + prazo', () => {
    const result = calcularDataVencimento('DATA_EMBARQUE', 30, datas)
    expect(result).not.toBeNull()
    const expected = new Date('2026-04-05')
    expected.setDate(expected.getDate() + 30)
    expect(result!.toISOString().split('T')[0]).toBe(expected.toISOString().split('T')[0])
  })

  it('deve calcular vencimento por DATA_CHEGADA + prazo', () => {
    const result = calcularDataVencimento('DATA_CHEGADA', 10, datas)
    expect(result).not.toBeNull()
    const expected = new Date('2026-04-20')
    expected.setDate(expected.getDate() + 10)
    expect(result!.toISOString().split('T')[0]).toBe(expected.toISOString().split('T')[0])
  })

  it('deve calcular vencimento por DATA_REGISTRO_DI', () => {
    const result = calcularDataVencimento('DATA_REGISTRO_DI', 5, datas)
    expect(result).not.toBeNull()
    const expected = new Date('2026-04-22')
    expected.setDate(expected.getDate() + 5)
    expect(result!.toISOString().split('T')[0]).toBe(expected.toISOString().split('T')[0])
  })

  it('deve calcular vencimento por DATA_DESEMBARACO', () => {
    const result = calcularDataVencimento('DATA_DESEMBARACO', 7, datas)
    expect(result).not.toBeNull()
    const expected = new Date('2026-04-25')
    expected.setDate(expected.getDate() + 7)
    expect(result!.toISOString().split('T')[0]).toBe(expected.toISOString().split('T')[0])
  })

  it('deve calcular vencimento por DATA_ENTREGA', () => {
    const result = calcularDataVencimento('DATA_ENTREGA', 15, datas)
    expect(result).not.toBeNull()
    const expected = new Date('2026-04-28')
    expected.setDate(expected.getDate() + 15)
    expect(result!.toISOString().split('T')[0]).toBe(expected.toISOString().split('T')[0])
  })

  it('RN-107: PRONTIDAO_CARGA usa data_carga_pronta quando disponivel', () => {
    const result = calcularDataVencimento('PRONTIDAO_CARGA', 10, datas)
    expect(result).not.toBeNull()
    const expected = new Date('2026-04-01') // data_carga_pronta
    expected.setDate(expected.getDate() + 10)
    expect(result!.toISOString().split('T')[0]).toBe(expected.toISOString().split('T')[0])
  })

  it('RN-107: PRONTIDAO_CARGA usa fallback data_esperada_prontidao quando carga_pronta null', () => {
    const datasComFallback = {
      ...datas,
      data_carga_pronta: null,
    }
    const result = calcularDataVencimento('PRONTIDAO_CARGA', 10, datasComFallback)
    expect(result).not.toBeNull()
    const expected = new Date('2026-03-25') // data_esperada_prontidao
    expected.setDate(expected.getDate() + 10)
    expect(result!.toISOString().split('T')[0]).toBe(expected.toISOString().split('T')[0])
  })

  it('RN-107: PRONTIDAO_CARGA retorna null quando ambas datas null', () => {
    const datasVazias = {
      ...datas,
      data_carga_pronta: null,
      data_esperada_prontidao: null,
    }
    const result = calcularDataVencimento('PRONTIDAO_CARGA', 10, datasVazias)
    expect(result).toBeNull()
  })

  it('deve calcular vencimento por DATA_FIXA', () => {
    const dataFixa = new Date('2026-06-15')
    const result = calcularDataVencimento('DATA_FIXA', 0, datas, dataFixa)
    expect(result).not.toBeNull()
    expect(result!.toISOString().split('T')[0]).toBe('2026-06-15')
  })

  it('DATA_FIXA com prazo adicional', () => {
    const dataFixa = new Date('2026-06-15')
    const result = calcularDataVencimento('DATA_FIXA', 5, datas, dataFixa)
    expect(result).not.toBeNull()
    expect(result!.toISOString().split('T')[0]).toBe('2026-06-20')
  })

  it('retorna null quando data-base nao esta disponivel', () => {
    const datasVazias = {
      data_carga_pronta: null,
      data_esperada_prontidao: null,
      data_embarque_final: null,
      data_chegada_final: null,
      data_registro_di: null,
      data_desembaraco: null,
      data_entrega: null,
    }
    expect(calcularDataVencimento('DATA_EMBARQUE', 30, datasVazias)).toBeNull()
    expect(calcularDataVencimento('DATA_CHEGADA', 30, datasVazias)).toBeNull()
    expect(calcularDataVencimento('DATA_REGISTRO_DI', 30, datasVazias)).toBeNull()
    expect(calcularDataVencimento('DATA_DESEMBARACO', 30, datasVazias)).toBeNull()
    expect(calcularDataVencimento('DATA_ENTREGA', 30, datasVazias)).toBeNull()
  })

  it('funciona com prazo zero', () => {
    const result = calcularDataVencimento('DATA_EMBARQUE', 0, datas)
    expect(result).not.toBeNull()
    expect(result!.toISOString().split('T')[0]).toBe('2026-04-05')
  })
})

describe('recalcularVencimentosParcelas', () => {
  const datas = {
    data_embarque_final: new Date('2026-05-01'),
    data_carga_pronta: null,
    data_esperada_prontidao: null,
    data_chegada_final: null,
    data_registro_di: null,
    data_desembaraco: null,
    data_entrega: null,
  }

  it('recalcula vencimentos apenas de parcelas PENDENTE', () => {
    const parcelas = [
      { id: 'p1', metodo_vencimento: 'DATA_EMBARQUE' as const, prazo_dias: 30, status: 'PENDENTE' },
      { id: 'p2', metodo_vencimento: 'DATA_EMBARQUE' as const, prazo_dias: 60, status: 'PENDENTE' },
      { id: 'p3', metodo_vencimento: 'DATA_EMBARQUE' as const, prazo_dias: 90, status: 'PAGO' },
    ]

    const result = recalcularVencimentosParcelas(parcelas, datas)
    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('p1')
    expect(result[1].id).toBe('p2')
  })

  it('ignora parcelas sem metodo_vencimento', () => {
    const parcelas = [
      { id: 'p1', metodo_vencimento: null, prazo_dias: 30, status: 'PENDENTE' },
      { id: 'p2', metodo_vencimento: 'DATA_EMBARQUE' as const, prazo_dias: null, status: 'PENDENTE' },
    ]

    const result = recalcularVencimentosParcelas(parcelas, datas)
    expect(result).toHaveLength(0)
  })

  it('retorna data_vencimento null quando data-base indisponivel', () => {
    const datasVazias = {
      data_carga_pronta: null,
      data_esperada_prontidao: null,
      data_embarque_final: null,
      data_chegada_final: null,
      data_registro_di: null,
      data_desembaraco: null,
      data_entrega: null,
    }

    const parcelas = [
      { id: 'p1', metodo_vencimento: 'DATA_EMBARQUE' as const, prazo_dias: 30, status: 'PENDENTE' },
    ]

    const result = recalcularVencimentosParcelas(parcelas, datasVazias)
    expect(result).toHaveLength(1)
    expect(result[0].data_vencimento).toBeNull()
  })
})
