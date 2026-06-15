/**
 * Persistência de agendamento PTAX / Focus — tabela taxa_moeda_sync_agendamento (Configurador DB).
 * Dois registros fixos: id_taxa_moeda_sync_agendamento = 'ptax' | 'focus'.
 */

import type { Prisma } from '../../../../configurador/generated/index.js'
import { prisma } from './prisma.js'
import { z } from 'zod'

export const TIPOS_AGENDAMENTO_TAXA_MOEDA = ['ptax', 'focus'] as const
export type TipoAgendamentoTaxaMoeda = typeof TIPOS_AGENDAMENTO_TAXA_MOEDA[number]

export const PTAX_HORARIOS_BRT = [10, 11, 12, 13] as const
export const PTAX_MINUTO_BRT = 3

const alertaSchema = z.object({
  id: z.string(),
  nome: z.string().min(1).max(200),
  contato: z.string().min(1).max(200),
  condicao: z.string().max(50),
  canal: z.string().max(50),
})

const frequenciaSchema = z.enum(['Manual', 'Diario', 'Semanal'])

export const taxaMoedaAgendamentoConfigSchema = z.object({
  ativo: z.boolean(),
  frequencia: frequenciaSchema,
  hora: z.number().int().min(0).max(23),
  minuto: z.number().int().min(0).max(59),
  alertas: z.array(alertaSchema).default([]),
  ultima_execucao: z.string().datetime().nullable().default(null),
  atualizado_em: z.string().datetime(),
})

export type TaxaMoedaAgendamentoConfig = z.infer<typeof taxaMoedaAgendamentoConfigSchema>

export const saveTaxaMoedaAgendamentoSchema = z.object({
  ativo: z.boolean(),
  frequencia: frequenciaSchema,
  hora: z.coerce.number().int().min(0).max(23).default(0),
  minuto: z.coerce.number().int().min(0).max(59).default(0),
  alertas: z.array(alertaSchema).default([]),
})

export type SaveTaxaMoedaAgendamentoInput = z.infer<typeof saveTaxaMoedaAgendamentoSchema>

function agoraIso(): string {
  return new Date().toISOString()
}

function defaultsPorTipo(tipo: TipoAgendamentoTaxaMoeda): SaveTaxaMoedaAgendamentoInput {
  if (tipo === 'ptax') {
    return {
      ativo: true,
      frequencia: 'Diario',
      hora: 10,
      minuto: PTAX_MINUTO_BRT,
      alertas: [],
    }
  }
  return {
    ativo: true,
    frequencia: 'Semanal',
    hora: 22,
    minuto: 0,
    alertas: [],
  }
}

function parseAlertasJson(valor: Prisma.JsonValue): z.infer<typeof alertaSchema>[] {
  const parsed = z.array(alertaSchema).safeParse(valor)
  return parsed.success ? parsed.data : []
}

function rowToConfig(row: {
  ativo_taxa_moeda_sync_agendamento: boolean
  frequencia_taxa_moeda_sync_agendamento: string
  hora_taxa_moeda_sync_agendamento: number
  minuto_taxa_moeda_sync_agendamento: number
  alertas_taxa_moeda_sync_agendamento: Prisma.JsonValue
  ultima_execucao_taxa_moeda_sync_agendamento: Date | null
  data_atualizacao_taxa_moeda_sync_agendamento: Date
}): TaxaMoedaAgendamentoConfig {
  const frequenciaParsed = frequenciaSchema.safeParse(row.frequencia_taxa_moeda_sync_agendamento)
  if (!frequenciaParsed.success) {
    throw new Error(`frequencia_taxa_moeda_sync_agendamento inválida: ${row.frequencia_taxa_moeda_sync_agendamento}`)
  }

  return taxaMoedaAgendamentoConfigSchema.parse({
    ativo: row.ativo_taxa_moeda_sync_agendamento,
    frequencia: frequenciaParsed.data,
    hora: row.hora_taxa_moeda_sync_agendamento,
    minuto: row.minuto_taxa_moeda_sync_agendamento,
    alertas: parseAlertasJson(row.alertas_taxa_moeda_sync_agendamento),
    ultima_execucao: row.ultima_execucao_taxa_moeda_sync_agendamento?.toISOString() ?? null,
    atualizado_em: row.data_atualizacao_taxa_moeda_sync_agendamento.toISOString(),
  })
}

async function garantirRegistroAgendamento(tipo: TipoAgendamentoTaxaMoeda) {
  const defaults = defaultsPorTipo(tipo)
  return prisma.taxaMoedaSyncAgendamento.upsert({
    where: { id_taxa_moeda_sync_agendamento: tipo },
    create: {
      id_taxa_moeda_sync_agendamento: tipo,
      ativo_taxa_moeda_sync_agendamento: defaults.ativo,
      frequencia_taxa_moeda_sync_agendamento: defaults.frequencia,
      hora_taxa_moeda_sync_agendamento: defaults.hora,
      minuto_taxa_moeda_sync_agendamento: defaults.minuto,
      alertas_taxa_moeda_sync_agendamento: defaults.alertas,
    },
    update: {},
  })
}

export async function lerAgendamentoTaxaMoeda(tipo: TipoAgendamentoTaxaMoeda): Promise<TaxaMoedaAgendamentoConfig> {
  const row = await prisma.taxaMoedaSyncAgendamento.findUnique({
    where: { id_taxa_moeda_sync_agendamento: tipo },
  })
  const resolved = row ?? await garantirRegistroAgendamento(tipo)
  return rowToConfig(resolved)
}

export async function salvarAgendamentoTaxaMoeda(
  tipo: TipoAgendamentoTaxaMoeda,
  input: SaveTaxaMoedaAgendamentoInput,
): Promise<TaxaMoedaAgendamentoConfig> {
  const inputNormalizado: SaveTaxaMoedaAgendamentoInput = tipo === 'ptax'
    ? { ...input, hora: 10, minuto: PTAX_MINUTO_BRT }
    : input

  const atual = await lerAgendamentoTaxaMoeda(tipo)

  const row = await prisma.taxaMoedaSyncAgendamento.update({
    where: { id_taxa_moeda_sync_agendamento: tipo },
    data: {
      ativo_taxa_moeda_sync_agendamento: inputNormalizado.ativo,
      frequencia_taxa_moeda_sync_agendamento: inputNormalizado.frequencia,
      hora_taxa_moeda_sync_agendamento: inputNormalizado.hora,
      minuto_taxa_moeda_sync_agendamento: inputNormalizado.minuto,
      alertas_taxa_moeda_sync_agendamento: inputNormalizado.alertas,
      ultima_execucao_taxa_moeda_sync_agendamento: atual.ultima_execucao
        ? new Date(atual.ultima_execucao)
        : null,
    },
  })

  return rowToConfig(row)
}

export async function registrarExecucaoAgendamentoTaxaMoeda(tipo: TipoAgendamentoTaxaMoeda): Promise<void> {
  await garantirRegistroAgendamento(tipo)
  await prisma.taxaMoedaSyncAgendamento.update({
    where: { id_taxa_moeda_sync_agendamento: tipo },
    data: {
      ultima_execucao_taxa_moeda_sync_agendamento: new Date(),
    },
  })
}

export interface PartesDataHoraBrt {
  weekday: number
  hour: number
  minute: number
}

/** Partes de data/hora no fuso America/Sao_Paulo (weekday 0=dom … 6=sáb). */
export function partesDataHoraBrt(now: Date): PartesDataHoraBrt {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const parts = fmt.formatToParts(now)
  const weekdayStr = parts.find(p => p.type === 'weekday')?.value ?? 'Mon'
  const hourStr = parts.find(p => p.type === 'hour')?.value ?? '0'
  const minuteStr = parts.find(p => p.type === 'minute')?.value ?? '0'

  const weekdayMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  }

  return {
    weekday: weekdayMap[weekdayStr] ?? 1,
    hour: parseInt(hourStr, 10),
    minute: parseInt(minuteStr, 10),
  }
}

export function deveExecutarAgendamentoPtax(now: Date, config: TaxaMoedaAgendamentoConfig): boolean {
  if (!config.ativo || config.frequencia === 'Manual') return false
  const brt = partesDataHoraBrt(now)
  if (brt.weekday === 0 || brt.weekday === 6) return false
  if (brt.minute !== PTAX_MINUTO_BRT) return false
  return PTAX_HORARIOS_BRT.includes(brt.hour as typeof PTAX_HORARIOS_BRT[number])
}

export function deveExecutarAgendamentoFocus(now: Date, config: TaxaMoedaAgendamentoConfig): boolean {
  if (!config.ativo || config.frequencia === 'Manual') return false
  const brt = partesDataHoraBrt(now)
  if (brt.hour !== config.hora || brt.minute !== config.minuto) return false
  if (config.frequencia === 'Semanal') return brt.weekday === 2
  if (config.frequencia === 'Diario') return true
  return false
}

export const taxaMoedaAgendamentoResponseSchema = z.object({
  tipo: z.enum(TIPOS_AGENDAMENTO_TAXA_MOEDA),
  ativo: z.boolean(),
  frequencia: z.enum(['Manual', 'Diario', 'Semanal']),
  hora: z.number(),
  minuto: z.number(),
  alertas: z.array(alertaSchema),
  ultima_execucao: z.string().nullable(),
  atualizado_em: z.string(),
  horarios_ptax_brt: z.array(z.number()).optional(),
})

export type TaxaMoedaAgendamentoResponse = z.infer<typeof taxaMoedaAgendamentoResponseSchema>

export function montarRespostaAgendamento(
  tipo: TipoAgendamentoTaxaMoeda,
  config: TaxaMoedaAgendamentoConfig,
): TaxaMoedaAgendamentoResponse {
  const base = {
    tipo,
    ativo: config.ativo,
    frequencia: config.frequencia,
    hora: config.hora,
    minuto: config.minuto,
    alertas: config.alertas,
    ultima_execucao: config.ultima_execucao,
    atualizado_em: config.atualizado_em,
  }
  if (tipo === 'ptax') {
    return taxaMoedaAgendamentoResponseSchema.parse({
      ...base,
      horarios_ptax_brt: [...PTAX_HORARIOS_BRT],
    })
  }
  return taxaMoedaAgendamentoResponseSchema.parse(base)
}
