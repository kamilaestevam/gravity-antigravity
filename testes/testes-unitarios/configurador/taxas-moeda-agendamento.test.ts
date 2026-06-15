import { describe, it, expect } from 'vitest'
import {
  deveExecutarAgendamentoPtax,
  deveExecutarAgendamentoFocus,
  partesDataHoraBrt,
  type TaxaMoedaAgendamentoConfig,
} from '../../../servicos-global/configurador/server/lib/taxas-moeda-agendamento-store.js'

const configBase = (overrides: Partial<TaxaMoedaAgendamentoConfig>): TaxaMoedaAgendamentoConfig => ({
  ativo: true,
  frequencia: 'Diario',
  hora: 10,
  minuto: 3,
  alertas: [],
  ultima_execucao: null,
  atualizado_em: new Date().toISOString(),
  ...overrides,
})

describe('taxas-moeda-agendamento-store', () => {
  describe('deveExecutarAgendamentoPtax', () => {
    it('dispara em dia útil no horário 11h03 BRT quando ativo', () => {
      const config = configBase({ frequencia: 'Diario' })
      const now = new Date('2026-06-15T14:03:00.000Z')
      expect(deveExecutarAgendamentoPtax(now, config)).toBe(true)
    })

    it('não dispara quando inativo', () => {
      const config = configBase({ ativo: false })
      const now = new Date('2026-06-15T14:03:00.000Z')
      expect(deveExecutarAgendamentoPtax(now, config)).toBe(false)
    })

    it('não dispara em frequencia Manual', () => {
      const config = configBase({ frequencia: 'Manual' })
      const now = new Date('2026-06-15T14:03:00.000Z')
      expect(deveExecutarAgendamentoPtax(now, config)).toBe(false)
    })

    it('não dispara no fim de semana', () => {
      const config = configBase({ frequencia: 'Diario' })
      const now = new Date('2026-06-14T13:03:00.000Z')
      expect(deveExecutarAgendamentoPtax(now, config)).toBe(false)
    })
  })

  describe('deveExecutarAgendamentoFocus', () => {
    it('dispara terça 22h00 BRT quando semanal ativo', () => {
      const config = configBase({ frequencia: 'Semanal', hora: 22, minuto: 0 })
      const now = new Date('2026-06-17T01:00:00.000Z')
      expect(deveExecutarAgendamentoFocus(now, config)).toBe(true)
    })

    it('não dispara em dia errado da semana', () => {
      const config = configBase({ frequencia: 'Semanal', hora: 22, minuto: 0 })
      const now = new Date('2026-06-18T01:00:00.000Z')
      expect(deveExecutarAgendamentoFocus(now, config)).toBe(false)
    })
  })

  describe('partesDataHoraBrt', () => {
    it('converte UTC para BRT corretamente', () => {
      const brt = partesDataHoraBrt(new Date('2026-06-15T14:03:00.000Z'))
      expect(brt.hour).toBe(11)
      expect(brt.minute).toBe(3)
      expect(brt.weekday).toBeGreaterThanOrEqual(1)
      expect(brt.weekday).toBeLessThanOrEqual(5)
    })
  })
})
