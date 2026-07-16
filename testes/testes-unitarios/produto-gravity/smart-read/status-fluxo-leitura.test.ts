import { describe, expect, it } from 'vitest'
import {
  STATUS_FLUXO_CONCLUIDA_KPI,
  derivarStatusFluxoLeitura,
  ehStatusFluxoConcluidaKpi,
  statusFluxoPorPasso,
} from '../../../../servicos-global/produto/smart-read/shared/status-fluxo-leitura-smart-read'

describe('derivarStatusFluxoLeitura', () => {
  it('FAILED sempre vira FALHOU', () => {
    expect(
      derivarStatusFluxoLeitura({ status_leitura: 'FAILED', passo_atual_leitura: 4 }),
    ).toBe('FALHOU')
  })

  it('usa passo 1–4 quando presente', () => {
    expect(derivarStatusFluxoLeitura({ status_leitura: 'PROCESSING', passo_atual_leitura: 1 })).toBe(
      'ANEXAR_ARQUIVO',
    )
    expect(derivarStatusFluxoLeitura({ status_leitura: 'PROCESSING', passo_atual_leitura: 2 })).toBe(
      'ANALISE_ARQUIVO',
    )
    expect(derivarStatusFluxoLeitura({ status_leitura: 'COMPLETED', passo_atual_leitura: 3 })).toBe(
      'CONFERENCIA',
    )
    expect(derivarStatusFluxoLeitura({ status_leitura: 'COMPLETED', passo_atual_leitura: 4 })).toBe(
      'RESULTADO_LEITURAS',
    )
  })

  it('sem passo: mapeia DATI sem sobrescrever contrato DATI', () => {
    expect(derivarStatusFluxoLeitura({ status_leitura: 'PENDING' })).toBe('ANEXAR_ARQUIVO')
    expect(derivarStatusFluxoLeitura({ status_leitura: 'PROCESSING' })).toBe('ANALISE_ARQUIVO')
    expect(derivarStatusFluxoLeitura({ status_leitura: 'COMPLETED' })).toBe('RESULTADO_LEITURAS')
  })

  it('nunca atribui 05/06 nesta fase', () => {
    const status = derivarStatusFluxoLeitura({
      status_leitura: 'COMPLETED',
      passo_atual_leitura: 4,
    })
    expect(status).not.toBe('EM_INTEGRACAO')
    expect(status).not.toBe('INTEGRACAO_CONFIRMADA')
  })

  it('KPI concluída = 04 RESULTADO_LEITURAS', () => {
    expect(STATUS_FLUXO_CONCLUIDA_KPI).toBe('RESULTADO_LEITURAS')
    expect(ehStatusFluxoConcluidaKpi('RESULTADO_LEITURAS')).toBe(true)
    expect(ehStatusFluxoConcluidaKpi('EM_INTEGRACAO')).toBe(false)
  })

  it('statusFluxoPorPasso cobre 1–4', () => {
    expect(statusFluxoPorPasso(1)).toBe('ANEXAR_ARQUIVO')
    expect(statusFluxoPorPasso(2)).toBe('ANALISE_ARQUIVO')
    expect(statusFluxoPorPasso(3)).toBe('CONFERENCIA')
    expect(statusFluxoPorPasso(4)).toBe('RESULTADO_LEITURAS')
    expect(statusFluxoPorPasso(99)).toBe('RESULTADO_LEITURAS')
  })
})
