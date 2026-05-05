// schemas/faturaProdutoGravity.ts
// Contratos Zod para as rotas /api/v1/faturas* — espelho do payload DDD-PT
// devolvido pelo backend ([servicos-global/configurador/server/routes/fatura-produto-gravity.ts]).
//
// Segue Mandamentos 06 + 09: validação obrigatória + bilateralidade. Qualquer
// rename no backend exige rename aqui no MESMO commit.

import { z } from 'zod'

// ─── Enum de status ──────────────────────────────────────────────────────────
// Valores idênticos ao enum Prisma `StatusFaturaProdutoGravity`. Tradução PT-BR
// para UI vai pelo i18n (workspace.financial.status.*).

export const statusFaturaProdutoGravitySchema = z.enum([
  'RASCUNHO',
  'EMITIDA',
  'ENVIADA',
  'PAGA',
  'EM_ATRASO',
  'ANULADA',
  'INCOBRAVEL',
])

export type StatusFaturaProdutoGravity = z.infer<typeof statusFaturaProdutoGravitySchema>

// ─── Documento (boleto, NF-e, recibo) ────────────────────────────────────────

export const documentoFaturaProdutoGravitySchema = z.object({
  tipo_documento_fatura_produto_gravity:    z.enum(['boleto', 'nfe', 'receipt', 'pdf', 'other']),
  nome_documento_fatura_produto_gravity:    z.string(),
  url_documento_fatura_produto_gravity:     z.string(),
  tamanho_documento_fatura_produto_gravity: z.number().nullable(),
})

export type DocumentoFaturaProdutoGravity = z.infer<typeof documentoFaturaProdutoGravitySchema>

// ─── Fatura ──────────────────────────────────────────────────────────────────

export const faturaProdutoGravitySchema = z.object({
  id_fatura_produto_gravity:                z.string(),
  numero_fatura_produto_gravity:            z.string().nullable(),
  status_fatura_produto_gravity:            statusFaturaProdutoGravitySchema,
  id_organizacao:                           z.string(),
  nome_organizacao_fatura_produto_gravity:  z.string(),
  email_organizacao_fatura_produto_gravity: z.string().nullable(),
  valor_total_fatura_produto_gravity:       z.number(),
  valor_pago_fatura_produto_gravity:        z.number(),
  moeda_fatura_produto_gravity:             z.string(),
  data_vencimento_fatura_produto_gravity:   z.string().nullable(),
  competencia_fatura_produto_gravity:       z.string().nullable(),
  descricao_fatura_produto_gravity:         z.string(),
  url_externa_fatura_produto_gravity:       z.string().nullable(),
  data_criacao_fatura_produto_gravity:      z.string(),
  documentos_fatura_produto_gravity:        z.array(documentoFaturaProdutoGravitySchema),
  provider_fatura_produto_gravity:          z.string(),
})

export type FaturaProdutoGravity = z.infer<typeof faturaProdutoGravitySchema>

// ─── Resposta GET /api/v1/faturas ────────────────────────────────────────────

export const listaFaturasProdutoGravitySchema = z.object({
  faturas:  z.array(faturaProdutoGravitySchema),
  provider: z.string(),
  paginacao: z.object({
    cursor_proxima_fatura_produto_gravity: z.string().nullable(),
    existem_mais_faturas_produto_gravity:  z.boolean(),
  }),
})

export type ListaFaturasProdutoGravity = z.infer<typeof listaFaturasProdutoGravitySchema>

// ─── Item da fatura (composição) ─────────────────────────────────────────────

export const faturaItemProdutoGravitySchema = z.object({
  id_fatura_item_produto_gravity:             z.string().optional(),
  posicao_fatura_item_produto_gravity:        z.number(),
  id_produto_gravity:                         z.string().nullable().optional(),
  descricao_fatura_item_produto_gravity:      z.string(),
  quantidade_fatura_item_produto_gravity:     z.number(),
  valor_unitario_fatura_item_produto_gravity: z.number(),
  valor_total_fatura_item_produto_gravity:    z.number(),
  moeda_fatura_item_produto_gravity:          z.string(),
})

export type FaturaItemProdutoGravity = z.infer<typeof faturaItemProdutoGravitySchema>

// ─── Resposta GET /api/v1/faturas/:id/itens ──────────────────────────────────

export const itensFaturaProdutoGravitySchema = z.object({
  itens_fatura_produto_gravity: z.array(faturaItemProdutoGravitySchema),
})

export type ItensFaturaProdutoGravity = z.infer<typeof itensFaturaProdutoGravitySchema>

// ─── Tipo de documento (anexo de fatura) ─────────────────────────────────────
// Valores idênticos ao enum Prisma `TipoDocumentoFaturaProdutoGravity`.

export const tipoDocumentoFaturaProdutoGravitySchema = z.enum([
  'BOLETO',
  'NFE',
  'RECIBO',
  'PDF_GENERICO',
  'OUTRO',
])

export type TipoDocumentoFaturaProdutoGravity = z.infer<typeof tipoDocumentoFaturaProdutoGravitySchema>

// ─── Documento persistido (anexo) ────────────────────────────────────────────

export const documentoAnexoFaturaProdutoGravitySchema = z.object({
  id_documento_fatura_produto_gravity:           z.string(),
  tipo_documento_fatura_produto_gravity:         tipoDocumentoFaturaProdutoGravitySchema,
  nome_documento_fatura_produto_gravity:         z.string(),
  url_documento_fatura_produto_gravity:          z.string(),
  tamanho_documento_fatura_produto_gravity:      z.number().nullable(),
  mime_documento_fatura_produto_gravity:         z.string().nullable(),
  data_criacao_documento_fatura_produto_gravity: z.string(),
})

export type DocumentoAnexoFaturaProdutoGravity = z.infer<typeof documentoAnexoFaturaProdutoGravitySchema>

export const listaDocumentosFaturaProdutoGravitySchema = z.object({
  documentos_fatura_produto_gravity: z.array(documentoAnexoFaturaProdutoGravitySchema),
})

// ─── Request PATCH /api/v1/faturas/:id ───────────────────────────────────────

export const atualizarFaturaProdutoGravitySchema = z.object({
  competencia_fatura_produto_gravity:       z.string().nullable().optional(),
  data_vencimento_fatura_produto_gravity:   z.string().datetime().nullable().optional(),
  email_organizacao_fatura_produto_gravity: z.string().email().nullable().optional(),
  moeda_fatura_produto_gravity:             z.string().optional(),
  itens_fatura_produto_gravity: z.array(z.object({
    id_fatura_item_produto_gravity:             z.string().optional(),
    id_produto_gravity:                         z.string().nullable().optional(),
    descricao_fatura_item_produto_gravity:      z.string().min(1),
    quantidade_fatura_item_produto_gravity:     z.number().positive(),
    valor_unitario_fatura_item_produto_gravity: z.number().nonnegative(),
    moeda_fatura_item_produto_gravity:          z.string().optional(),
  })).optional(),
})

export type AtualizarFaturaProdutoGravity = z.infer<typeof atualizarFaturaProdutoGravitySchema>
