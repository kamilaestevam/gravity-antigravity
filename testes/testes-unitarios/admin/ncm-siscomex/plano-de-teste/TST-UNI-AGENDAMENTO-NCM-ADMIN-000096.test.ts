// TST-UNI-AGENDAMENTO-NCM-ADMIN-000096
// Unitário — Agendamento NCM Admin (cron UI, Zod SaveSchedule, respostas GET/PUT).
import { describe, expect, it } from 'vitest'
import {
  agendamentoNcmGetResponseSchema,
  agendamentoNcmSaveResponseSchema,
  cronParaHoraMinuto,
  horaMinutoCron,
  notificadorNcmSchema,
  saveScheduleNcmSchema,
} from '@testes/infra/admin/agendamento-ncm-admin'

describe('TST-UNI-AGENDAMENTO-NCM-ADMIN-000096', () => {
  describe('cronParaHoraMinuto', () => {
    it('U1 — converte cron diário 02:00', () => {
      expect(cronParaHoraMinuto('00 02 * * *')).toEqual({
        hora: '02h',
        minuto: '00min',
        frequencia: 'Diario',
      })
    })

    it('U2 — detecta frequência semanal (dow != *)', () => {
      expect(cronParaHoraMinuto('30 14 * * 1').frequencia).toBe('Semanal')
    })

    it('U3 — cron inválido retorna fallback', () => {
      expect(cronParaHoraMinuto('x y z')).toEqual({
        hora: '02h',
        minuto: '00min',
        frequencia: 'Diario',
      })
    })
  })

  describe('horaMinutoCron', () => {
    it('U4 — monta cron diário', () => {
      expect(horaMinutoCron('Diario', '03h', '15min')).toBe('15 03 * * *')
    })

    it('U5 — monta cron semanal (segunda)', () => {
      expect(horaMinutoCron('Semanal', '02h', '00min')).toBe('00 02 * * 1')
    })
  })

  describe('saveScheduleNcmSchema', () => {
    it('U6 — aceita payload válido com notificadores vazios', () => {
      const parsed = saveScheduleNcmSchema.safeParse({
        ativo: true,
        cron_expressao: '00 02 * * *',
        notificadores: [],
      })
      expect(parsed.success).toBe(true)
    })

    it('U7 — rejeita cron_expressao curta (< 9 chars)', () => {
      const parsed = saveScheduleNcmSchema.safeParse({
        ativo: false,
        cron_expressao: '0 2 * *',
        notificadores: [],
      })
      expect(parsed.success).toBe(false)
    })

    it('U8 — rejeita notificador sem nome', () => {
      const parsed = notificadorNcmSchema.safeParse({
        id: '1',
        nome: '',
        contato: 'a@b.com',
        condicao: 'Apenas Erros',
        canal: 'E-mail',
      })
      expect(parsed.success).toBe(false)
    })
  })

  describe('respostas API', () => {
    it('U9 — valida GET /agendamento (defaults quando vazio)', () => {
      const parsed = agendamentoNcmGetResponseSchema.safeParse({
        ativo: false,
        cron_expressao: '0 2 * * *',
        notificadores: [],
        proxima_execucao: null,
        atualizado_em: null,
      })
      expect(parsed.success).toBe(true)
    })

    it('U10 — valida PUT /agendamento resposta de sucesso', () => {
      const parsed = agendamentoNcmSaveResponseSchema.safeParse({
        sucesso: true,
        ativo: true,
        cron_expressao: '00 02 * * *',
        notificadores: [],
        atualizado_em: '2026-06-11T12:00:00.000Z',
      })
      expect(parsed.success).toBe(true)
    })
  })
})
