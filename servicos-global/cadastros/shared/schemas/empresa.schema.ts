import { z } from 'zod'

/**
 * Empresa — identidade 1:1 da organização (Cadastros §4.1).
 * Contrato bilateral (Mandamento 09). Separado de fornecedor.schema.ts (parceiros).
 */

const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/
const isoPaisRegex = /^[A-Z]{2}$/
const e164Regex = /^\+[1-9]\d{1,14}$/

const empresaBaseSchema = z.object({
  id_empresa: z.string().min(1).optional(),
  id_organizacao: z.string().min(1),
  nome_empresa: z.string().min(2, 'nome_empresa precisa ter pelo menos 2 caracteres'),
  cnpj_empresa: z.string().regex(cnpjRegex, 'cnpj_empresa precisa estar no formato XX.XXX.XXX/XXXX-XX').nullable().optional(),
  tin_empresa: z.string().min(1).nullable().optional(),
  pais_empresa: z.string().regex(isoPaisRegex, 'pais_empresa precisa ser código ISO-2'),
  estado_provincia_empresa: z.string().nullable().optional(),
  cidade_empresa: z.string().nullable().optional(),
  endereco_empresa: z.string().nullable().optional(),
  cep_zipcode_empresa: z.string().nullable().optional(),
  email_principal_empresa: z.string().email('email_principal_empresa inválido').nullable().optional(),
  telefone_principal_empresa: z.string().nullable().optional(),
  whatsapp_principal_empresa: z.string().regex(e164Regex, 'whatsapp_principal_empresa precisa E.164').nullable().optional(),
  pode_ser_importador_empresa: z.boolean().default(false),
  pode_ser_exportador_empresa: z.boolean().default(false),
  pode_ser_fabricante_empresa: z.boolean().default(false),
  pode_ser_agente_empresa: z.boolean().default(false),
  pode_ser_despachante_empresa: z.boolean().default(false),
  pode_ser_armador_empresa: z.boolean().default(false),
  pode_ser_cia_aerea_empresa: z.boolean().default(false),
  pode_ser_transportadora_rodoviaria_nacional_empresa: z.boolean().default(false),
  pode_ser_transportadora_rodoviaria_internacional_empresa: z.boolean().default(false),
  pode_ser_armazem_alfandegado_empresa: z.boolean().default(false),
  pode_ser_armazem_nacional_empresa: z.boolean().default(false),
  pode_ser_banco_empresa: z.boolean().default(false),
  pode_ser_seguradora_internacional_empresa: z.boolean().default(false),
  pode_ser_seguradora_corretora_cambio_empresa: z.boolean().default(false),
  ativo_empresa: z.boolean().default(true),
})

function aplicarRegrasEmpresa(
  data: z.infer<typeof empresaBaseSchema>,
  ctx: z.RefinementCtx,
): void {
  if (data.pais_empresa !== 'BR' && data.cnpj_empresa) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['cnpj_empresa'],
      message: 'cnpj_empresa só quando pais_empresa = BR',
    })
  }
  const algumaFlag =
    data.pode_ser_importador_empresa ||
    data.pode_ser_exportador_empresa ||
    data.pode_ser_fabricante_empresa ||
    data.pode_ser_agente_empresa ||
    data.pode_ser_despachante_empresa ||
    data.pode_ser_armador_empresa ||
    data.pode_ser_cia_aerea_empresa ||
    data.pode_ser_transportadora_rodoviaria_nacional_empresa ||
    data.pode_ser_transportadora_rodoviaria_internacional_empresa ||
    data.pode_ser_armazem_alfandegado_empresa ||
    data.pode_ser_armazem_nacional_empresa ||
    data.pode_ser_banco_empresa ||
    data.pode_ser_seguradora_internacional_empresa ||
    data.pode_ser_seguradora_corretora_cambio_empresa
  if (!algumaFlag) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['pode_ser_importador_empresa'],
      message: 'pelo menos uma flag pode_ser_* precisa ser true',
    })
  }
}

export const criarEmpresaSchema = empresaBaseSchema.superRefine(aplicarRegrasEmpresa)

export const atualizarEmpresaSchema = empresaBaseSchema
  .partial()
  .omit({ id_organizacao: true, id_empresa: true })
  .superRefine((data, ctx) => {
    if (data.pais_empresa && data.pais_empresa !== 'BR' && data.cnpj_empresa) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['cnpj_empresa'],
        message: 'cnpj_empresa só quando pais_empresa = BR',
      })
    }
  })

export const empresaSchema = z.object({
  id_empresa: z.string().min(1),
  id_organizacao: z.string().min(1),
  nome_empresa: z.string().min(2),
  cnpj_empresa: z.string().nullable(),
  tin_empresa: z.string().nullable(),
  pais_empresa: z.string(),
  estado_provincia_empresa: z.string().nullable(),
  cidade_empresa: z.string().nullable(),
  endereco_empresa: z.string().nullable(),
  cep_zipcode_empresa: z.string().nullable(),
  email_principal_empresa: z.string().nullable(),
  telefone_principal_empresa: z.string().nullable(),
  whatsapp_principal_empresa: z.string().nullable(),
  pode_ser_importador_empresa: z.boolean(),
  pode_ser_exportador_empresa: z.boolean(),
  pode_ser_fabricante_empresa: z.boolean(),
  pode_ser_agente_empresa: z.boolean(),
  pode_ser_despachante_empresa: z.boolean(),
  pode_ser_armador_empresa: z.boolean(),
  pode_ser_cia_aerea_empresa: z.boolean(),
  pode_ser_transportadora_rodoviaria_nacional_empresa: z.boolean(),
  pode_ser_transportadora_rodoviaria_internacional_empresa: z.boolean(),
  pode_ser_armazem_alfandegado_empresa: z.boolean(),
  pode_ser_armazem_nacional_empresa: z.boolean(),
  pode_ser_banco_empresa: z.boolean(),
  pode_ser_seguradora_internacional_empresa: z.boolean(),
  pode_ser_seguradora_corretora_cambio_empresa: z.boolean(),
  ativo_empresa: z.boolean(),
  criado_em_empresa: z.string().datetime(),
  atualizado_em_empresa: z.string().datetime(),
})

export type Empresa = z.infer<typeof empresaSchema>
export type CriarEmpresaInput = z.infer<typeof criarEmpresaSchema>
export type AtualizarEmpresaInput = z.infer<typeof atualizarEmpresaSchema>
