/**
 * Infra de testes — Agendamento NCM Admin (modal Integração NCM Siscomex).
 * SSOT para helpers puros e contratos Zod espelhando:
 *   - servicos-global/configurador/src/pages/admin/ModalNcmAgendamentoSincronizacao.tsx
 *   - servicos-global/cadastros/server/src/routes/adminNcmSync.ts
 */
import { z } from 'zod'

export const notificadorNcmSchema = z.object({
  id:       z.string(),
  nome:     z.string().min(1).max(200),
  contato:  z.string().min(1).max(200),
  condicao: z.enum(['Apenas Erros', 'Sempre']),
  canal:    z.enum(['E-mail', 'WhatsApp', 'Ambos']),
})

export const saveScheduleNcmSchema = z.object({
  ativo:          z.boolean(),
  cron_expressao: z.string().min(9).max(100),
  notificadores:  z.array(notificadorNcmSchema).max(20),
})

export type NotificadorNcm = z.infer<typeof notificadorNcmSchema>
export type SaveScheduleNcm = z.infer<typeof saveScheduleNcmSchema>

const CRON_FALLBACK = { hora: '02h', minuto: '00min', frequencia: 'Diario' as const }

/** Converte expressão cron (5 campos) para UI hora/minuto/frequência. */
export function cronParaHoraMinuto(cron: string): { hora: string; minuto: string; frequencia: string } {
  const partes = cron.trim().split(/\s+/)
  if (partes.length < 5) return CRON_FALLBACK
  const minNum  = parseInt(partes[0], 10)
  const horaNum = parseInt(partes[1], 10)
  if (isNaN(minNum) || isNaN(horaNum) || minNum < 0 || minNum > 59 || horaNum < 0 || horaNum > 23) return CRON_FALLBACK
  const dow  = partes[4]
  const freq = dow !== '*' ? 'Semanal' : 'Diario'
  return {
    hora:   `${String(horaNum).padStart(2, '0')}h`,
    minuto: `${String(minNum).padStart(2, '0')}min`,
    frequencia: freq,
  }
}

/** Converte UI hora/minuto/frequência para expressão cron (America/Sao_Paulo no job). */
export function horaMinutoCron(frequencia: string, hora: string, minuto: string): string {
  const h = hora.replace('h', '').padStart(2, '0')
  const m = minuto.replace('min', '').padStart(2, '0')
  if (frequencia === 'Semanal') return `${m} ${h} * * 1`
  return `${m} ${h} * * *`
}

/** Resposta GET /agendamento (proxy configurador ← cadastros). */
export const agendamentoNcmGetResponseSchema = z.object({
  ativo:            z.boolean(),
  cron_expressao:   z.string(),
  notificadores:    z.array(notificadorNcmSchema).or(z.array(z.unknown())),
  proxima_execucao: z.string().nullable().optional(),
  atualizado_em:    z.string().nullable().optional(),
})

/** Resposta PUT /agendamento após persistência. */
export const agendamentoNcmSaveResponseSchema = z.object({
  sucesso:        z.boolean(),
  ativo:          z.boolean(),
  cron_expressao: z.string(),
  notificadores:  z.array(z.unknown()),
  atualizado_em:  z.union([z.string(), z.date()]).optional(),
})
