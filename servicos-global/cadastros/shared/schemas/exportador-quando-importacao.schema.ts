import { z } from 'zod'

/**
 * Schema Zod — ExportadorQuandoImportacao (contraparte estrangeira / fornecedor).
 *
 * Contrato BILATERAL (Mandamento 09): fonte única para backend (rotas Express)
 * e frontend/SDK (cliente). Divergencia aqui = commit incompleto.
 *
 * Entidade per-tenant + per-workspace (NAO e catalogo global).
 * Filtro obrigatorio por id_organizacao + id_workspace em toda query.
 */

const isoPaisRegex = /^[A-Z]{2}$/

// ── Schema de criacao ─────────────────────────────────────────────────────────

export const criarExportadorQuandoImportacaoSchema = z.object({
  id_organizacao: z.string().min(1, 'id_organizacao e obrigatorio'),
  id_workspace: z.string().min(1, 'id_workspace e obrigatorio'),
  nome_exportador: z.string().min(2, 'nome_exportador precisa ter pelo menos 2 caracteres'),
  endereco_exportador: z.string().nullable().optional(),
  cidade_exportador: z.string().nullable().optional(),
  estado_provincia_exportador: z.string().nullable().optional(),
  pais_exportador: z.string().regex(isoPaisRegex, 'pais_exportador precisa ser codigo ISO-2 (ex: US, CN, DE)'),
  zipcode_exportador: z.string().nullable().optional(),
})

// ── Schema de atualizacao (parcial — todos opcionais exceto id) ───────────────

export const atualizarExportadorQuandoImportacaoSchema = z.object({
  nome_exportador: z.string().min(2).optional(),
  endereco_exportador: z.string().nullable().optional(),
  cidade_exportador: z.string().nullable().optional(),
  estado_provincia_exportador: z.string().nullable().optional(),
  pais_exportador: z.string().regex(isoPaisRegex).optional(),
  zipcode_exportador: z.string().nullable().optional(),
})

// ── Schema de resposta (contrato do GET) ──────────────────────────────────────

export const exportadorQuandoImportacaoSchema = z.object({
  id_exportador_quando_importacao: z.string(),
  id_organizacao: z.string(),
  id_workspace: z.string(),
  nome_exportador: z.string(),
  endereco_exportador: z.string().nullable(),
  cidade_exportador: z.string().nullable(),
  estado_provincia_exportador: z.string().nullable(),
  pais_exportador: z.string(),
  zipcode_exportador: z.string().nullable(),
  criado_em_exportador: z.string(),
  atualizado_em_exportador: z.string(),
})

export type ExportadorQuandoImportacao = z.infer<typeof exportadorQuandoImportacaoSchema>

export const listaExportadoresQuandoImportacaoSchema = z.object({
  itens: z.array(exportadorQuandoImportacaoSchema),
  total: z.number(),
  pagina: z.number(),
  por_pagina: z.number(),
})
