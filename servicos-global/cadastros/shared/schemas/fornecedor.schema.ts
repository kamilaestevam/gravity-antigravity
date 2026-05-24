import { z } from 'zod'

/**
 * Validações do Fornecedor (cartório COMEX) — contrato bilateral (Mandamento 09).
 *
 * Regras:
 * - nome_fornecedor: obrigatório, mínimo 2 caracteres
 * - pais_fornecedor: obrigatório, ISO-2
 * - cnpj_fornecedor: opcional; só quando pais_fornecedor = BR
 * - tin_fornecedor: opcional, estrangeiros
 * - pelo menos uma flag pode_ser_* true
 */

const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/
const isoPaisRegex = /^[A-Z]{2}$/
const e164Regex = /^\+[1-9]\d{1,14}$/

const fornecedorBaseSchema = z.object({
  id_fornecedor: z.string().min(1).optional(),
  id_organizacao: z.string().min(1),
  nome_fornecedor: z.string().min(2, 'nome_fornecedor precisa ter pelo menos 2 caracteres'),
  cnpj_fornecedor: z.string().regex(cnpjRegex, 'cnpj_fornecedor precisa estar no formato XX.XXX.XXX/XXXX-XX').nullable().optional(),
  tin_fornecedor: z.string().min(1).nullable().optional(),
  pais_fornecedor: z.string().regex(isoPaisRegex, 'pais_fornecedor precisa ser código ISO-2 (ex: BR, US, CN)'),
  estado_provincia_fornecedor: z.string().nullable().optional(),
  cidade_fornecedor: z.string().nullable().optional(),
  endereco_fornecedor: z.string().nullable().optional(),
  cep_zipcode_fornecedor: z.string().nullable().optional(),
  email_principal_fornecedor: z.string().email('email_principal_fornecedor inválido').nullable().optional(),
  telefone_principal_fornecedor: z.string().nullable().optional(),
  whatsapp_principal_fornecedor: z.string().regex(e164Regex, 'whatsapp_principal_fornecedor precisa estar no formato E.164').nullable().optional(),
  pode_ser_importador_fornecedor: z.boolean().default(false),
  pode_ser_exportador_fornecedor: z.boolean().default(false),
  pode_ser_fabricante_fornecedor: z.boolean().default(false),
  pode_ser_agente_fornecedor: z.boolean().default(false),
  pode_ser_despachante_fornecedor: z.boolean().default(false),
  pode_ser_armador_fornecedor: z.boolean().default(false),
  pode_ser_cia_aerea_fornecedor: z.boolean().default(false),
  pode_ser_transportadora_rodoviaria_nacional_fornecedor: z.boolean().default(false),
  pode_ser_transportadora_rodoviaria_internacional_fornecedor: z.boolean().default(false),
  pode_ser_armazem_alfandegado_fornecedor: z.boolean().default(false),
  pode_ser_armazem_nacional_fornecedor: z.boolean().default(false),
  pode_ser_banco_fornecedor: z.boolean().default(false),
  pode_ser_seguradora_internacional_fornecedor: z.boolean().default(false),
  pode_ser_seguradora_corretora_cambio_fornecedor: z.boolean().default(false),
  ativo_fornecedor: z.boolean().default(true),
})

function aplicarRegrasCondicionais(
  data: z.infer<typeof fornecedorBaseSchema>,
  ctx: z.RefinementCtx,
): void {
  if (data.pais_fornecedor !== 'BR' && data.cnpj_fornecedor) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['cnpj_fornecedor'],
      message: 'cnpj_fornecedor só pode ser preenchido quando pais_fornecedor = BR; use tin_fornecedor para estrangeiros',
    })
  }

  const algumaFlagAtiva =
    data.pode_ser_importador_fornecedor ||
    data.pode_ser_exportador_fornecedor ||
    data.pode_ser_fabricante_fornecedor ||
    data.pode_ser_agente_fornecedor ||
    data.pode_ser_despachante_fornecedor ||
    data.pode_ser_armador_fornecedor ||
    data.pode_ser_cia_aerea_fornecedor ||
    data.pode_ser_transportadora_rodoviaria_nacional_fornecedor ||
    data.pode_ser_transportadora_rodoviaria_internacional_fornecedor ||
    data.pode_ser_armazem_alfandegado_fornecedor ||
    data.pode_ser_armazem_nacional_fornecedor ||
    data.pode_ser_banco_fornecedor ||
    data.pode_ser_seguradora_internacional_fornecedor ||
    data.pode_ser_seguradora_corretora_cambio_fornecedor

  if (!algumaFlagAtiva) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['pode_ser_importador_fornecedor'],
      message: 'pelo menos uma flag pode_ser_* precisa estar marcada como true',
    })
  }
}

export const criarFornecedorSchema = fornecedorBaseSchema.superRefine(aplicarRegrasCondicionais)

const fornecedorAtualizacaoBaseSchema = fornecedorBaseSchema.partial().omit({ id_organizacao: true, id_fornecedor: true })

export const atualizarFornecedorSchema = fornecedorAtualizacaoBaseSchema.superRefine((data, ctx) => {
  if (data.pais_fornecedor && data.pais_fornecedor !== 'BR' && data.cnpj_fornecedor) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['cnpj_fornecedor'],
      message: 'cnpj_fornecedor só pode existir quando pais_fornecedor = BR',
    })
  }
})

export const fornecedorSchema = z.object({
  id_fornecedor: z.string(),
  id_organizacao: z.string(),
  nome_fornecedor: z.string(),
  cnpj_fornecedor: z.string().nullable(),
  tin_fornecedor: z.string().nullable(),
  pais_fornecedor: z.string(),
  estado_provincia_fornecedor: z.string().nullable(),
  cidade_fornecedor: z.string().nullable(),
  endereco_fornecedor: z.string().nullable(),
  cep_zipcode_fornecedor: z.string().nullable(),
  email_principal_fornecedor: z.string().nullable(),
  telefone_principal_fornecedor: z.string().nullable(),
  whatsapp_principal_fornecedor: z.string().nullable(),
  pode_ser_importador_fornecedor: z.boolean(),
  pode_ser_exportador_fornecedor: z.boolean(),
  pode_ser_fabricante_fornecedor: z.boolean(),
  pode_ser_agente_fornecedor: z.boolean(),
  pode_ser_despachante_fornecedor: z.boolean(),
  pode_ser_armador_fornecedor: z.boolean(),
  pode_ser_cia_aerea_fornecedor: z.boolean(),
  pode_ser_transportadora_rodoviaria_nacional_fornecedor: z.boolean(),
  pode_ser_transportadora_rodoviaria_internacional_fornecedor: z.boolean(),
  pode_ser_armazem_alfandegado_fornecedor: z.boolean(),
  pode_ser_armazem_nacional_fornecedor: z.boolean(),
  pode_ser_banco_fornecedor: z.boolean(),
  pode_ser_seguradora_internacional_fornecedor: z.boolean(),
  pode_ser_seguradora_corretora_cambio_fornecedor: z.boolean(),
  ativo_fornecedor: z.boolean(),
  criado_em_fornecedor: z.string(),
  atualizado_em_fornecedor: z.string(),
})

export const listaFornecedoresSchema = z.object({
  itens: z.array(fornecedorSchema),
  total: z.number().int().nonnegative(),
  pagina: z.number().int().positive(),
  por_pagina: z.number().int().positive(),
})

export const fornecedorAdminSchema = fornecedorSchema.extend({
  nome_organizacao: z.string(),
})

export const listaFornecedoresAdminSchema = z.object({
  itens: z.array(fornecedorAdminSchema),
  total: z.number().int().nonnegative(),
  pagina: z.number().int().positive(),
  por_pagina: z.number().int().positive().max(200),
  alerta_volume: z.boolean().optional(),
})

export type Fornecedor = z.infer<typeof fornecedorSchema>
export type FornecedorAdmin = z.infer<typeof fornecedorAdminSchema>
export type CriarFornecedorInput = z.infer<typeof criarFornecedorSchema>
export type AtualizarFornecedorInput = z.infer<typeof atualizarFornecedorSchema>
export type ListaFornecedores = z.infer<typeof listaFornecedoresSchema>
export type ListaFornecedoresAdmin = z.infer<typeof listaFornecedoresAdminSchema>
