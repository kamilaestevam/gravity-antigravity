import { z } from 'zod'

/**
 * Contrato bilateral — vínculo fornecedor ↔ organização cliente (Cadastros SSOT).
 * Sem snapshot: nome/CNPJ vêm de empresa (cartório) via enrich na API.
 *
 * Usuario FORNECEDOR: Configurador.usuario.id_usuario referenciado em id_usuario.
 * Não existe id_fornecedor na tabela usuario.
 */

export const tipoFornecedorOrganizacaoEnum = z.enum([
  'AGENTE_CARGA',
  'DESPACHANTE_ADUANEIRO',
  'ARMADOR',
  'CIA_AEREA',
  'TRANSPORTADORA_RODOVIARIA_NACIONAL',
  'TRANSPORTADORA_RODOVIARIA_INTERNACIONAL',
  'ARMAZEM_ALFANDEGADO',
  'ARMAZEM_NACIONAL',
  'BANCO',
  'SEGURADORA_INTERNACIONAL',
  'CORRETORA_CAMBIO',
  'FABRICANTE',
])

export const statusFornecedorOrganizacaoEnum = z.enum([
  'ATIVO',
  'INATIVO',
  'PENDENTE_APROVACAO',
])

const fornecedorOrganizacaoBaseSchema = z.object({
  id_fornecedor: z.string().min(1),
  id_organizacao: z.string().min(1),
  tipo_fornecedor_organizacao: tipoFornecedorOrganizacaoEnum,
  status_fornecedor_organizacao: statusFornecedorOrganizacaoEnum.default('ATIVO'),
  id_usuario: z.string().min(1).nullable().optional(),
})

export const criarFornecedorOrganizacaoSchema = fornecedorOrganizacaoBaseSchema

export const atualizarFornecedorOrganizacaoSchema = fornecedorOrganizacaoBaseSchema
  .partial()
  .omit({ id_fornecedor: true, id_organizacao: true })

/** Dados vivos do cartório (empresa) — enrich opcional na listagem */
export const fornecedorCartorioEnrichSchema = z.object({
  nome_fornecedor: z.string(),
  cnpj_fornecedor: z.string().nullable(),
  tin_fornecedor: z.string().nullable(),
  pais_fornecedor: z.string(),
  cidade_fornecedor: z.string().nullable(),
  estado_provincia_fornecedor: z.string().nullable(),
  ativo_fornecedor: z.boolean(),
})

export const fornecedorOrganizacaoSchema = z.object({
  id_fornecedor_organizacao: z.string(),
  id_fornecedor: z.string(),
  id_organizacao: z.string(),
  tipo_fornecedor_organizacao: tipoFornecedorOrganizacaoEnum,
  status_fornecedor_organizacao: statusFornecedorOrganizacaoEnum,
  id_usuario: z.string().nullable(),
  data_criacao_fornecedor_organizacao: z.string(),
  data_atualizacao_fornecedor_organizacao: z.string(),
  fornecedor: fornecedorCartorioEnrichSchema.optional(),
})

export const listaFornecedorOrganizacaoSchema = z.object({
  itens: z.array(fornecedorOrganizacaoSchema),
  total: z.number().int().nonnegative(),
  pagina: z.number().int().positive(),
  por_pagina: z.number().int().positive(),
})

export type FornecedorOrganizacao = z.infer<typeof fornecedorOrganizacaoSchema>
export type CriarFornecedorOrganizacaoInput = z.infer<typeof criarFornecedorOrganizacaoSchema>
export type AtualizarFornecedorOrganizacaoInput = z.infer<typeof atualizarFornecedorOrganizacaoSchema>
