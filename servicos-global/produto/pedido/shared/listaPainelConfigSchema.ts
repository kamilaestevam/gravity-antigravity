/**
 * Contrato bilateral — config_json dos painéis da Lista (Pedido v1).
 */
import { z } from 'zod'

export const ID_PRODUTO_GRAVITY_PEDIDO = 'pedido' as const

const filtroTextoSchema = z.object({
  tipo: z.literal('texto'),
  valor: z.string(),
})

const filtroEnumSchema = z.object({
  tipo: z.literal('enum'),
  valor: z.array(z.string()),
})

const filtroNumeroSchema = z.object({
  tipo: z.literal('numero'),
  valor: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }),
})

export const filtroAtivoSerializadoSchema = z.discriminatedUnion('tipo', [
  filtroTextoSchema,
  filtroEnumSchema,
  filtroNumeroSchema,
])

export const listaPainelConfigV1Schema = z.object({
  versao: z.literal(1),
  colunas_visiveis: z.array(z.string()),
  colunas_largura: z.record(z.string(), z.number()).optional(),
  aba_status_ativa: z.string(),
  filtros_coluna: z.record(z.string(), filtroAtivoSerializadoSchema),
  ordenacao: z.object({
    campo: z.string(),
    direcao: z.enum(['asc', 'desc']),
  }),
  busca: z.string().optional(),
  cards_topo: z.object({
    ids_visiveis: z.array(z.string()),
    periodo: z.string().optional(),
  }).optional(),
}).strict()

export type ListaPainelConfigV1 = z.infer<typeof listaPainelConfigV1Schema>
export type FiltroAtivoSerializado = z.infer<typeof filtroAtivoSerializadoSchema>

export function configListaPainelPadraoV1(
  overrides?: Partial<ListaPainelConfigV1>,
): ListaPainelConfigV1 {
  return {
    versao: 1,
    colunas_visiveis: [],
    aba_status_ativa: 'todos',
    filtros_coluna: {},
    ordenacao: { campo: 'data_emissao_pedido', direcao: 'desc' },
    ...overrides,
  }
}

export function serializarConfigListaPainel(config: ListaPainelConfigV1): string {
  return JSON.stringify(listaPainelConfigV1Schema.parse(config))
}

export function parsearConfigListaPainel(raw: string): ListaPainelConfigV1 {
  const json: unknown = JSON.parse(raw)
  return listaPainelConfigV1Schema.parse(json)
}

export function parsearConfigListaPainelSeguro(
  raw: string,
  fallback: ListaPainelConfigV1,
): ListaPainelConfigV1 {
  try {
    return parsearConfigListaPainel(raw)
  } catch {
    return fallback
  }
}
