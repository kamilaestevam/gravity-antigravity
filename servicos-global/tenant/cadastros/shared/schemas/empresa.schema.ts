import { z } from 'zod'

/**
 * Validações da Empresa — seção 5 do documento técnico
 * `documentos-tecnicos/banco-dados/cadastros-arquitetura.md`.
 *
 * Schema-contrato BILATERAL (Mandamento 09): mesma fonte para backend (rotas
 * Express) e frontend/SDK (cliente). Não duplicar — importar daqui.
 *
 * Regras:
 * - nome_empresa: obrigatório, mínimo 2 caracteres
 * - pais_empresa: obrigatório, ISO-2
 * - if (pais_empresa === 'BR') { cnpj_empresa obrigatório, formato XX.XXX.XXX/XXXX-XX }
 * - if (pais_empresa !== 'BR') { cnpj_empresa deve ser null; tin_empresa opcional }
 * - pelo menos uma flag pode_ser_* deve ser true
 * - email_empresa: se preenchido, formato válido
 * - whatsapp_empresa: se preenchido, formato E.164
 */

const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/
const isoPaisRegex = /^[A-Z]{2}$/
const e164Regex = /^\+[1-9]\d{1,14}$/

const empresaBaseSchema = z.object({
  suid_empresa: z.string().min(1).optional(), // gerado pelo backend se ausente
  id_organizacao: z.string().min(1),
  nome_empresa: z.string().min(2, 'nome_empresa precisa ter pelo menos 2 caracteres'),
  cnpj_empresa: z.string().regex(cnpjRegex, 'cnpj_empresa precisa estar no formato XX.XXX.XXX/XXXX-XX').nullable().optional(),
  tin_empresa: z.string().min(1).nullable().optional(),
  pais_empresa: z.string().regex(isoPaisRegex, 'pais_empresa precisa ser código ISO-2 (ex: BR, US, CN)'),
  estado_empresa: z.string().nullable().optional(),
  cidade_empresa: z.string().nullable().optional(),
  endereco_empresa: z.string().nullable().optional(),
  zipcode_empresa: z.string().nullable().optional(),
  email_empresa: z.string().email('email_empresa inválido').nullable().optional(),
  telefone_empresa: z.string().nullable().optional(),
  whatsapp_empresa: z.string().regex(e164Regex, 'whatsapp_empresa precisa estar no formato E.164 (ex: +5511999999999)').nullable().optional(),
  pode_ser_importador_empresa: z.boolean().default(false),
  pode_ser_exportador_empresa: z.boolean().default(false),
  pode_ser_fabricante_empresa: z.boolean().default(false),
  pode_ser_agente_empresa: z.boolean().default(false),
  pode_ser_despachante_empresa: z.boolean().default(false),
  pode_ser_armador_empresa: z.boolean().default(false),
  ativo_empresa: z.boolean().default(true),
})

/**
 * Regras condicionais cross-field:
 * - país BR -> cnpj_empresa obrigatório, tin_empresa proibido
 * - país != BR -> cnpj_empresa proibido (não tem semântica fora do Brasil)
 * - pelo menos um pode_ser_* true
 */
function aplicarRegrasCondicionais(
  data: z.infer<typeof empresaBaseSchema>,
  ctx: z.RefinementCtx,
): void {
  if (data.pais_empresa === 'BR') {
    if (!data.cnpj_empresa) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['cnpj_empresa'],
        message: 'cnpj_empresa é obrigatório quando pais_empresa = BR',
      })
    }
  } else if (data.cnpj_empresa) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['cnpj_empresa'],
      message: 'cnpj_empresa só pode ser preenchido quando pais_empresa = BR; use tin_empresa para empresas estrangeiras',
    })
  }

  const algumaFlagAtiva =
    data.pode_ser_importador_empresa ||
    data.pode_ser_exportador_empresa ||
    data.pode_ser_fabricante_empresa ||
    data.pode_ser_agente_empresa ||
    data.pode_ser_despachante_empresa ||
    data.pode_ser_armador_empresa

  if (!algumaFlagAtiva) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['pode_ser_importador_empresa'],
      message: 'pelo menos uma flag pode_ser_* precisa estar marcada como true',
    })
  }
}

export const criarEmpresaSchema = empresaBaseSchema.superRefine(aplicarRegrasCondicionais)

// Update aceita parciais; mas se cnpj/pais vierem juntos, ainda valida coerência.
const empresaAtualizacaoBaseSchema = empresaBaseSchema.partial().omit({ id_organizacao: true, suid_empresa: true })

export const atualizarEmpresaSchema = empresaAtualizacaoBaseSchema.superRefine((data, ctx) => {
  if (data.pais_empresa === 'BR' && data.cnpj_empresa === null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['cnpj_empresa'],
      message: 'cnpj_empresa não pode ser nulo quando pais_empresa = BR',
    })
  }
  if (data.pais_empresa && data.pais_empresa !== 'BR' && data.cnpj_empresa) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['cnpj_empresa'],
      message: 'cnpj_empresa só pode existir quando pais_empresa = BR',
    })
  }
})

/**
 * Schema da resposta da API (Empresa persistida). Datas chegam como string ISO
 * via JSON; convertemos para Date opcionalmente no consumidor.
 */
export const empresaSchema = z.object({
  suid_empresa: z.string(),
  id_organizacao: z.string(),
  nome_empresa: z.string(),
  cnpj_empresa: z.string().nullable(),
  tin_empresa: z.string().nullable(),
  pais_empresa: z.string(),
  estado_empresa: z.string().nullable(),
  cidade_empresa: z.string().nullable(),
  endereco_empresa: z.string().nullable(),
  zipcode_empresa: z.string().nullable(),
  email_empresa: z.string().nullable(),
  telefone_empresa: z.string().nullable(),
  whatsapp_empresa: z.string().nullable(),
  pode_ser_importador_empresa: z.boolean(),
  pode_ser_exportador_empresa: z.boolean(),
  pode_ser_fabricante_empresa: z.boolean(),
  pode_ser_agente_empresa: z.boolean(),
  pode_ser_despachante_empresa: z.boolean(),
  pode_ser_armador_empresa: z.boolean(),
  ativo_empresa: z.boolean(),
  criado_em_empresa: z.string(),
  atualizado_em_empresa: z.string(),
})

export const listaEmpresasSchema = z.object({
  itens: z.array(empresaSchema),
  total: z.number().int().nonnegative(),
  pagina: z.number().int().positive(),
  por_pagina: z.number().int().positive(),
})

export type Empresa = z.infer<typeof empresaSchema>
export type CriarEmpresaInput = z.infer<typeof criarEmpresaSchema>
export type AtualizarEmpresaInput = z.infer<typeof atualizarEmpresaSchema>
export type ListaEmpresas = z.infer<typeof listaEmpresasSchema>
