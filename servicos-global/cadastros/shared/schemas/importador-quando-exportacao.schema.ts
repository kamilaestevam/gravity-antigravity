import { z } from 'zod'

/**
 * Schema Zod — ImportadorQuandoExportacao (contraparte estrangeira / comprador).
 *
 * Contrato BILATERAL (Mandamento 09): fonte unica para backend (rotas Express)
 * e frontend/SDK (cliente). Divergencia aqui = commit incompleto.
 *
 * Entidade per-tenant + per-workspace (NAO e catalogo global).
 * Filtro obrigatorio por id_organizacao + id_workspace em toda query.
 */

const isoPaisRegex = /^[A-Z]{2}$/

// ── Schema de criacao ─────────────────────────────────────────────────────────

export const criarImportadorQuandoExportacaoSchema = z.object({
  id_organizacao: z.string().min(1, 'id_organizacao e obrigatorio'),
  id_workspace: z.string().min(1, 'id_workspace e obrigatorio'),
  nome_importador: z.string().min(2, 'nome_importador precisa ter pelo menos 2 caracteres'),
  endereco_importador: z.string().nullable().optional(),
  cidade_importador: z.string().nullable().optional(),
  estado_provincia_importador: z.string().nullable().optional(),
  pais_importador: z.string().regex(isoPaisRegex, 'pais_importador precisa ser codigo ISO-2 (ex: US, CN, DE)'),
  zipcode_importador: z.string().nullable().optional(),
})

// ── Schema de atualizacao (parcial — todos opcionais exceto id) ───────────────

export const atualizarImportadorQuandoExportacaoSchema = z.object({
  nome_importador: z.string().min(2).optional(),
  endereco_importador: z.string().nullable().optional(),
  cidade_importador: z.string().nullable().optional(),
  estado_provincia_importador: z.string().nullable().optional(),
  pais_importador: z.string().regex(isoPaisRegex).optional(),
  zipcode_importador: z.string().nullable().optional(),
})

// ── Schema de resposta (contrato do GET) ──────────────────────────────────────

export const importadorQuandoExportacaoSchema = z.object({
  id_importador_quando_exportacao: z.string(),
  id_organizacao: z.string(),
  id_workspace: z.string(),
  nome_importador: z.string(),
  endereco_importador: z.string().nullable(),
  cidade_importador: z.string().nullable(),
  estado_provincia_importador: z.string().nullable(),
  pais_importador: z.string(),
  zipcode_importador: z.string().nullable(),
  criado_em_importador: z.string(),
  atualizado_em_importador: z.string(),
})

export type ImportadorQuandoExportacao = z.infer<typeof importadorQuandoExportacaoSchema>

export const listaImportadoresQuandoExportacaoSchema = z.object({
  itens: z.array(importadorQuandoExportacaoSchema),
  total: z.number(),
  pagina: z.number(),
  por_pagina: z.number(),
})
