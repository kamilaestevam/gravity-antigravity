/**
 * Contrato bilateral — config_json dos painéis da Lista (Pedido v1).
 */
import { z } from 'zod'
import {
  migrarListaChavesCampoPedido,
  migrarRecordChavesCampoPedido,
  normalizarChaveCampoPedido,
} from './migracaoChavesCampoPedido.js'

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
  /**
   * Chaves de colunas manuais (criadas pelo usuário) que já foram apresentadas ao
   * usuário ao menos uma vez. Distingue "coluna nova nunca vista" (auto-exibir) de
   * "coluna que o usuário ocultou de propósito" (manter oculta entre sessões).
   */
  colunas_manuais_conhecidas: z.array(z.string()).optional(),
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
    ordenacao: { campo: 'data_atualizacao_pedido', direcao: 'desc' },
    ...overrides,
  }
}

export function serializarConfigListaPainel(config: ListaPainelConfigV1): string {
  return JSON.stringify(listaPainelConfigV1Schema.parse(config))
}

export function migrarChavesConfigListaPainel(config: ListaPainelConfigV1): ListaPainelConfigV1 {
  return {
    ...config,
    colunas_visiveis: migrarListaChavesCampoPedido(config.colunas_visiveis),
    colunas_manuais_conhecidas: config.colunas_manuais_conhecidas
      ? migrarListaChavesCampoPedido(config.colunas_manuais_conhecidas)
      : undefined,
    colunas_largura: config.colunas_largura
      ? migrarRecordChavesCampoPedido(config.colunas_largura)
      : undefined,
    filtros_coluna: migrarRecordChavesCampoPedido(config.filtros_coluna),
    ordenacao: {
      campo: normalizarChaveCampoPedido(config.ordenacao.campo),
      direcao: config.ordenacao.direcao,
    },
  }
}

export function parsearConfigListaPainel(raw: string): ListaPainelConfigV1 {
  const json: unknown = JSON.parse(raw)
  return migrarChavesConfigListaPainel(listaPainelConfigV1Schema.parse(json))
}

export function parsearConfigListaPainelSeguro(
  raw: string,
  fallback: ListaPainelConfigV1,
  contexto?: { id_painel?: string; origem?: string },
): ListaPainelConfigV1 {
  try {
    return parsearConfigListaPainel(raw)
  } catch (err) {
    console.warn(
      '[listaPainel] config_json inválido — usando fallback',
      contexto?.origem ?? 'desconhecido',
      contexto?.id_painel ?? '',
      err,
    )
    return fallback
  }
}
