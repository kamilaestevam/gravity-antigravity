import { describe, it, expect } from 'vitest'
import { parseNumeroBr, parseNumeroBrOpcional } from '../../../servicos-global/produto/pedido/shared/formatadores.js'
import {
  SmartImportService,
  calcularPrimeiraLinhaPorNumeroPedido,
  dataEmissaoPorOrdemPlanilha,
} from '../../../servicos-global/produto/pedido/server/src/services/smartImportService.js'

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

describe('SmartImportService.montarDadosItem — sequencia do arquivo', () => {
  const service = new SmartImportService({})

  function montarDadosItem(dados: Record<string, unknown>, seqPadrao: number) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (service as any).montarDadosItem(dados, 'org_test', 'ws_test', undefined, seqPadrao) as {
      sequencia_item_pedido: number
      part_number_item: string
    }
  }

  it('ignora sequencia_item_pedido da planilha e usa ordem do arquivo (seqPadrao)', () => {
    const item = montarDadosItem(
      {
        sequencia_item_pedido: '174,00',
        part_number_item: '5241800067',
        quantidade_inicial_item: '1,00',
      },
      1,
    )
    expect(item.sequencia_item_pedido).toBe(1)
    expect(item.part_number_item).toBe('5241800067')
  })

  it('atribui sequencias 1, 2, 3 conforme ordem das linhas importadas', () => {
    const item1 = montarDadosItem({ sequencia_item_pedido: '174,00', part_number_item: '5241800067' }, 1)
    const item2 = montarDadosItem({ sequencia_item_pedido: '175,00', part_number_item: 'B00E50200271' }, 2)
    const item3 = montarDadosItem({ sequencia_item_pedido: '176,00', part_number_item: 'B00E50207350/S0001' }, 3)
    expect(item1.sequencia_item_pedido).toBe(1)
    expect(item2.sequencia_item_pedido).toBe(2)
    expect(item3.sequencia_item_pedido).toBe(3)
  })
})

describe('Smart Import — ordem dos pedidos na planilha', () => {
  it('calcularPrimeiraLinhaPorNumeroPedido usa a 1a linha de cada numero (Detroit)', () => {
    const linhas = [
      { linha_arquivo: 7, numero_pedido: 'D-1382', dados: { tipo_linha: 'PEDIDO' } },
      { linha_arquivo: 8, numero_pedido: 'D-1105', dados: { tipo_linha: 'ITEM' } },
      { linha_arquivo: 23, numero_pedido: 'D-1375/01', dados: { tipo_linha: 'ITEM' } },
      { linha_arquivo: 26, numero_pedido: 'D-1375/02', dados: { tipo_linha: 'ITEM' } },
      { linha_arquivo: 29, numero_pedido: 'D-1375/01', dados: { tipo_linha: 'ITEM' } },
    ]
    const map = calcularPrimeiraLinhaPorNumeroPedido(linhas)
    expect(map.get('D-1382')).toBe(7)
    expect(map.get('D-1105')).toBe(8)
    expect(map.get('D-1375/01')).toBe(23)
    expect(map.get('D-1375/02')).toBe(26)
  })

  it('dataEmissaoPorOrdemPlanilha coloca pedido anterior da planilha com timestamp maior (sort DESC)', () => {
    const anchor = 1_700_000_000_000
    const d1382 = new Date(dataEmissaoPorOrdemPlanilha(7, anchor)).getTime()
    const d1105 = new Date(dataEmissaoPorOrdemPlanilha(8, anchor)).getTime()
    const d1375 = new Date(dataEmissaoPorOrdemPlanilha(23, anchor)).getTime()
    expect(d1382).toBeGreaterThan(d1105)
    expect(d1105).toBeGreaterThan(d1375)
  })
})
