import { describe, it, expect } from 'vitest'
import { parseNumeroBr, parseNumeroBrOpcional } from '../../../servicos-global/produto/pedido/shared/formatadores.js'
import { SmartImportService } from '../../../servicos-global/produto/pedido/server/src/services/smartImportService.js'

describe('parseNumeroBr (Smart Import / planilha template)', () => {
  it('converte valores tipicos da planilha Detroit', () => {
    expect(parseNumeroBr('848,30')).toBe(848.3)
    expect(parseNumeroBr('1,00')).toBe(1)
    expect(parseNumeroBr('32,00')).toBe(32)
    expect(parseNumeroBr('46146,33')).toBe(46146.33)
    expect(parseNumeroBr('174,00')).toBe(174)
  })

  it('converte milhar BR', () => {
    expect(parseNumeroBr('1.234,56')).toBe(1234.56)
  })

  it('parseNumeroBrOpcional rejeita texto', () => {
    expect(parseNumeroBrOpcional('abc')).toBeNull()
    expect(parseNumeroBrOpcional('')).toBeNull()
  })
})

describe('SmartImportService.validarLinha — numeros BR', () => {
  const service = new SmartImportService({})

  function validarLinha(dados: Record<string, unknown>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (service as any).validarLinha(dados) as Array<{ campo: string; nivel: string }>
  }

  it('nao marca quantidade 1,00 como erro', () => {
    const alertas = validarLinha({
      tipo_linha: 'ITEM',
      numero_pedido: 'D-1105',
      part_number_item: '5241800067',
      quantidade_inicial_item: '1,00',
      valor_por_unidade_item: '848,30',
    })
    const errosQty = alertas.filter(a => a.campo === 'quantidade_inicial_item' && a.nivel === 'erro')
    expect(errosQty).toHaveLength(0)
  })

  it('validarNumerosParaGravar bloqueia quantidade invalida antes do Prisma', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const msg = (service as any).validarNumerosParaGravar(
      { quantidade_inicial_item: 'abc', part_number_item: 'X' },
      'ITEM',
    ) as string | null
    expect(msg).toMatch(/Quantidade invalida/i)
  })
})
