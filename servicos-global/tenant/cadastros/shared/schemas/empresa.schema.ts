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
 * - pais: obrigatório, ISO-2
 * - if (pais === 'BR') { cnpj obrigatório, formato XX.XXX.XXX/XXXX-XX }
 * - if (pais !== 'BR') { cnpj deve ser null; tin opcional }
 * - pelo menos uma flag pode_ser_* deve ser true
 * - email: se preenchido, formato válido
 * - whatsapp: se preenchido, formato E.164
 */

const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/
const isoPaisRegex = /^[A-Z]{2}$/
const e164Regex = /^\+[1-9]\d{1,14}$/

const empresaBaseSchema = z.object({
  suid: z.string().min(1).optional(), // gerado pelo backend se ausente
  id_organizacao: z.string().min(1),
  nome_empresa: z.string().min(2, 'nome_empresa precisa ter pelo menos 2 caracteres'),
  cnpj: z.string().regex(cnpjRegex, 'cnpj precisa estar no formato XX.XXX.XXX/XXXX-XX').nullable().optional(),
  tin: z.string().min(1).nullable().optional(),
  pais: z.string().regex(isoPaisRegex, 'pais precisa ser código ISO-2 (ex: BR, US, CN)'),
  estado: z.string().nullable().optional(),
  cidade: z.string().nullable().optional(),
  endereco: z.string().nullable().optional(),
  zipcode: z.string().nullable().optional(),
  email: z.string().email('email inválido').nullable().optional(),
  telefone: z.string().nullable().optional(),
  whatsapp: z.string().regex(e164Regex, 'whatsapp precisa estar no formato E.164 (ex: +5511999999999)').nullable().optional(),
  pode_ser_importador: z.boolean().default(false),
  pode_ser_exportador: z.boolean().default(false),
  pode_ser_fabricante: z.boolean().default(false),
  pode_ser_agente: z.boolean().default(false),
  pode_ser_despachante: z.boolean().default(false),
  pode_ser_armador: z.boolean().default(false),
  ativo: z.boolean().default(true),
})

/**
 * Regras condicionais cross-field:
 * - país BR -> cnpj obrigatório, tin proibido
 * - país != BR -> cnpj proibido (não tem semântica fora do Brasil)
 * - pelo menos um pode_ser_* true
 */
function aplicarRegrasCondicionais(
  data: z.infer<typeof empresaBaseSchema>,
  ctx: z.RefinementCtx,
): void {
  if (data.pais === 'BR') {
    if (!data.cnpj) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['cnpj'],
        message: 'cnpj é obrigatório quando pais = BR',
      })
    }
  } else if (data.cnpj) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['cnpj'],
      message: 'cnpj só pode ser preenchido quando pais = BR; use tin para empresas estrangeiras',
    })
  }

  const algumaFlagAtiva =
    data.pode_ser_importador ||
    data.pode_ser_exportador ||
    data.pode_ser_fabricante ||
    data.pode_ser_agente ||
    data.pode_ser_despachante ||
    data.pode_ser_armador

  if (!algumaFlagAtiva) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['pode_ser_importador'],
      message: 'pelo menos uma flag pode_ser_* precisa estar marcada como true',
    })
  }
}

export const criarEmpresaSchema = empresaBaseSchema.superRefine(aplicarRegrasCondicionais)

// Update aceita parciais; mas se cnpj/pais vierem juntos, ainda valida coerência.
const empresaAtualizacaoBaseSchema = empresaBaseSchema.partial().omit({ id_organizacao: true, suid: true })

export const atualizarEmpresaSchema = empresaAtualizacaoBaseSchema.superRefine((data, ctx) => {
  if (data.pais === 'BR' && data.cnpj === null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['cnpj'],
      message: 'cnpj não pode ser nulo quando pais = BR',
    })
  }
  if (data.pais && data.pais !== 'BR' && data.cnpj) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['cnpj'],
      message: 'cnpj só pode existir quando pais = BR',
    })
  }
})

/**
 * Schema da resposta da API (Empresa persistida). Datas chegam como string ISO
 * via JSON; convertemos para Date opcionalmente no consumidor.
 */
export const empresaSchema = z.object({
  suid: z.string(),
  id_organizacao: z.string(),
  nome_empresa: z.string(),
  cnpj: z.string().nullable(),
  tin: z.string().nullable(),
  pais: z.string(),
  estado: z.string().nullable(),
  cidade: z.string().nullable(),
  endereco: z.string().nullable(),
  zipcode: z.string().nullable(),
  email: z.string().nullable(),
  telefone: z.string().nullable(),
  whatsapp: z.string().nullable(),
  pode_ser_importador: z.boolean(),
  pode_ser_exportador: z.boolean(),
  pode_ser_fabricante: z.boolean(),
  pode_ser_agente: z.boolean(),
  pode_ser_despachante: z.boolean(),
  pode_ser_armador: z.boolean(),
  ativo: z.boolean(),
  criado_em: z.string(),
  atualizado_em: z.string(),
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
