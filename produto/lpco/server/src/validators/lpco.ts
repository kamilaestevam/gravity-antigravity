/**
 * validators/lpco.ts — Schemas Zod para o produto LPCO
 * Skill: antigravity-lpco + antigravity-code-standards
 */

import { z } from 'zod'

// ── Enums ────────────────────────────────────────────────────────────────────

export const TipoOperacaoEnum = z.enum(['IMPORTACAO', 'EXPORTACAO'])
export const TipoLpcoEnum = z.enum(['POR_OPERACAO', 'FLEX', 'TAXA'])
export const CanalEntradaEnum = z.enum(['MANUAL', 'PLANILHA', 'PEDIDO', 'SMART_READ', 'DUPLICAR', 'API'])
export const LpcoStatusEnum = z.enum([
  'rascunho', 'para_analise', 'em_analise', 'em_exigencia',
  'resposta_exigencia', 'deferida', 'indeferida', 'cancelada',
])

// ── Atributo Dinamico ────────────────────────────────────────────────────────

export const LpcoAtributoSchema = z.object({
  codigo: z.string().min(1),
  nome: z.string().min(1),
  tipo: z.enum(['texto', 'numero', 'data', 'selecao', 'booleano', 'composto']),
  obrigatorio: z.boolean(),
  valor: z.union([z.string(), z.number(), z.boolean(), z.record(z.unknown())]),
  dependeDe: z.string().optional(),
})

// ── Item ─────────────────────────────────────────────────────────────────────

export const LpcoItemCreateSchema = z.object({
  ncm: z.string().regex(/^\d{8}$/, 'NCM deve ter 8 digitos'),
  catalogo_produto_id: z.string().optional(),
  descricao_produto: z.string().min(1).max(500),
  fabricante: z.string().max(200).optional(),
  exportador: z.string().max(200).optional(),
  quantidade_estatistica: z.number().positive(),
  unidade_medida: z.string().min(1).max(10),
  quantidade_comercial: z.number().positive().optional(),
  unidade_medida_comercial: z.string().max(10).optional(),
  peso_liquido: z.number().positive(),
  vmle: z.number().positive(),
  moeda: z.string().length(3),
  condicao_venda: z.string().max(10).optional(),
  atributos: z.array(LpcoAtributoSchema).optional(),
})

export const LpcoItemUpdateSchema = LpcoItemCreateSchema.partial()

// ── Exigencia ────────────────────────────────────────────────────────────────

export const LpcoExigenciaCreateSchema = z.object({
  numero_exigencia: z.number().int().positive(),
  descricao_exigencia: z.string().min(1).max(2000),
  data_exigencia: z.string().datetime(),
  prazo_resposta: z.string().datetime().optional(),
})

export const LpcoExigenciaRespostaSchema = z.object({
  resposta: z.string().min(1).max(5000),
})

// ── Vinculo ──────────────────────────────────────────────────────────────────

export const LpcoVinculoCreateSchema = z.object({
  processo_id: z.string().min(1),
  tipo_documento: z.enum(['DUIMP', 'DUE']),
  numero_documento: z.string().optional(),
  quantidade_vinculada: z.number().positive().optional(),
  unidade_medida: z.string().max(10).optional(),
})

// ── LPCO Principal ───────────────────────────────────────────────────────────

export const LpcoCreateSchema = z.object({
  tipo_operacao: TipoOperacaoEnum,
  tipo_lpco: TipoLpcoEnum,
  orgao_anuente: z.string().min(2).max(10),
  modelo_lpco: z.string().min(1).max(20),
  pais_procedencia: z.string().length(2),
  unidade_entrada: z.string().max(20).optional(),
  recinto_armazenamento: z.string().max(50).optional(),
  fundamento_legal: z.string().min(1).max(500),
  condicao_mercadoria: z.string().max(50).optional(),
  importacao_exportador_id: z.string().optional(),
  exportacao_importador_id: z.string().optional(),
  canal_entrada: CanalEntradaEnum.default('MANUAL'),
  pedido_origem_id: z.string().optional(),
  lpco_origem_id: z.string().optional(),
  itens: z.array(LpcoItemCreateSchema).optional(),
})

export const LpcoUpdateSchema = LpcoCreateSchema.partial()

export const LpcoRegistroSchema = z.object({
  tipo_operacao: TipoOperacaoEnum,
  tipo_lpco: TipoLpcoEnum,
  orgao_anuente: z.string().min(2).max(10),
  modelo_lpco: z.string().min(1),
  pais_procedencia: z.string().length(2),
  fundamento_legal: z.string().min(1),
  itens: z.array(LpcoItemCreateSchema).min(1, 'LPCO deve ter pelo menos 1 item'),
})

// ── Cancelamento ─────────────────────────────────────────────────────────────

export const LpcoCancelarSchema = z.object({
  motivo: z.string().min(1).max(1000),
})

// ── Atualizar Status (sync manual) ───────────────────────────────────────────

export const LpcoAtualizarStatusSchema = z.object({
  status: LpcoStatusEnum,
})

// ── Filtros de Listagem ──────────────────────────────────────────────────────

export const LpcoListaQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: LpcoStatusEnum.optional(),
  tipo_operacao: TipoOperacaoEnum.optional(),
  tipo_lpco: TipoLpcoEnum.optional(),
  orgao_anuente: z.string().optional(),
  canal_entrada: CanalEntradaEnum.optional(),
  busca: z.string().max(200).optional(),
  ordenar_por: z.enum(['created_at', 'updated_at', 'numero_portal', 'status']).default('created_at'),
  direcao: z.enum(['asc', 'desc']).default('desc'),
})
