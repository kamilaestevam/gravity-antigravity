import { describe, expect, it } from 'vitest'
import {
  calcularPercentuaisEmt,
  classificarLinhasLogEmt,
  resolverEstadoEmtUi,
} from '../../../servicos-global/configurador/src/utils/emt-log-parser'

const ROW_OK =
  'EMT_ROW|Produção|Pedido|Lista|PORTO DE ORIGEM|Editar pedido|Aprovado'
const ROW_FAIL =
  'EMT_ROW|Produção|Pedido|Lista|AEROPORTO DE ORIGEM|33 — item|Reprovado'

describe('emt-log-parser — alinhamento banner × coluna %', () => {
  it('run reprovado só com ✓ no log → 1 reprovado sintético e banner reprovado', () => {
    const log = [
      `✓ ${ROW_OK}`,
      'Resultado final: FALHOU',
      'Falhas: 1',
    ].join('\n')

    const estado = resolverEstadoEmtUi({
      tipo: 'EMT',
      erroLog: log,
      resultado: 'REPROVADO',
    })

    expect(estado?.aprovado).toBe(false)
    expect(estado?.reprovados).toBeGreaterThanOrEqual(1)
    expect(estado?.falhaNaoDetalhada).toBe(true)

    const pct = calcularPercentuaisEmt({
      tipo: 'EMT',
      erroLog: log,
      resultado: 'REPROVADO',
    })
    expect(pct.pctReprovado).toBeGreaterThan(0)
    expect(pct.pctAprovado).toBeLessThan(100)
  })

  it('run aprovado com passos ✓ → 100% e aprovado true', () => {
    const log = `✓ ${ROW_OK}\nResultado final: PASSOU`
    const estado = resolverEstadoEmtUi({
      tipo: 'EMT',
      successLog: log,
      resultado: 'APROVADO',
    })
    expect(estado?.aprovado).toBe(true)
    expect(calcularPercentuaisEmt({ tipo: 'EMT', successLog: log, resultado: 'APROVADO' })).toEqual({
      pctAprovado: 100,
      pctReprovado: 0,
    })
  })

  it('✗ EMT_ROW reprovado entra na tabela de reprovados', () => {
    const { tabelaReprovadas, tabelaAprovadas } = classificarLinhasLogEmt([`✗ ${ROW_FAIL}`])
    expect(tabelaReprovadas).toHaveLength(1)
    expect(tabelaAprovadas).toHaveLength(0)
  })

  it('EMT_ROW com |Reprovado| em linha ✓ vai para reprovados', () => {
    const { tabelaReprovadas, tabelaAprovadas } = classificarLinhasLogEmt([`✓ ${ROW_FAIL}`])
    expect(tabelaReprovadas).toHaveLength(1)
    expect(tabelaAprovadas).toHaveLength(0)
  })

  it('banner e % concordam com falha explícita no log', () => {
    const log = [`✓ ${ROW_OK}`, `✗ ${ROW_FAIL}`].join('\n')
    const item = { tipo: 'EMT', erroLog: log, resultado: 'REPROVADO' as const }
    const estado = resolverEstadoEmtUi(item)
    const pct = calcularPercentuaisEmt(item)
    expect(estado?.aprovado).toBe(false)
    expect(estado?.falhaNaoDetalhada).toBe(false)
    expect(pct.pctReprovado).toBeGreaterThan(0)
  })
})
