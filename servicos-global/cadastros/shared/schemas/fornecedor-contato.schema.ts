import { z } from 'zod'

const e164Regex = /^\+[1-9]\d{1,14}$/

export const tipoCanalFornecedorContatoSchema = z.enum(['EMAIL', 'WHATSAPP', 'TELEFONE'])

const fornecedorContatoBaseSchema = z.object({
  tipo_canal_fornecedor_contato: tipoCanalFornecedorContatoSchema,
  valor_fornecedor_contato: z.string().min(1),
  principal_fornecedor_contato: z.boolean().default(false),
  ordem_fornecedor_contato: z.number().int().nonnegative().default(0),
})

function validarValorContato(
  data: z.infer<typeof fornecedorContatoBaseSchema>,
  ctx: z.RefinementCtx,
): void {
  const valor = data.valor_fornecedor_contato.trim()
  if (data.tipo_canal_fornecedor_contato === 'EMAIL') {
    const parsed = z.string().email().safeParse(valor)
    if (!parsed.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['valor_fornecedor_contato'],
        message: 'valor_fornecedor_contato inválido para canal EMAIL',
      })
    }
  }
  if (data.tipo_canal_fornecedor_contato === 'WHATSAPP' && !e164Regex.test(valor)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['valor_fornecedor_contato'],
      message: 'whatsapp precisa estar no formato E.164 (+5511999999999)',
    })
  }
}

export const fornecedorContatoInputSchema = fornecedorContatoBaseSchema.superRefine(validarValorContato)

export const fornecedorContatoSchema = fornecedorContatoBaseSchema.extend({
  id_fornecedor_contato: z.string(),
  id_fornecedor: z.string(),
}).superRefine(validarValorContato)

export type FornecedorContatoInput = z.infer<typeof fornecedorContatoInputSchema>
export type FornecedorContato = z.infer<typeof fornecedorContatoSchema>

/** Converte listas do formulário (chips) para payload de contatos. */
export function montarContatosFornecedorPayload(input: {
  emails: string[]
  telefones: string[]
  whatsapps: string[]
}): FornecedorContatoInput[] {
  const contatos: FornecedorContatoInput[] = []
  input.emails.forEach((raw, idx) => {
    const valor = raw.trim()
    if (!valor) return
    contatos.push({
      tipo_canal_fornecedor_contato: 'EMAIL',
      valor_fornecedor_contato: valor,
      principal_fornecedor_contato: idx === 0,
      ordem_fornecedor_contato: idx,
    })
  })
  input.telefones.forEach((raw, idx) => {
    const valor = raw.trim()
    if (!valor) return
    contatos.push({
      tipo_canal_fornecedor_contato: 'TELEFONE',
      valor_fornecedor_contato: valor,
      principal_fornecedor_contato: idx === 0,
      ordem_fornecedor_contato: idx,
    })
  })
  input.whatsapps.forEach((raw, idx) => {
    const valor = raw.trim()
    if (!valor) return
    contatos.push({
      tipo_canal_fornecedor_contato: 'WHATSAPP',
      valor_fornecedor_contato: valor,
      principal_fornecedor_contato: idx === 0,
      ordem_fornecedor_contato: idx,
    })
  })
  return contatos
}

/** Agrupa contatos da API para estado do formulário (chips). */
export function contatosFornecedorParaListas(contatos: FornecedorContatoInput[] | undefined, fallback: {
  email_fornecedor?: string | null
  telefone_fornecedor?: string | null
  whatsapp_fornecedor?: string | null
}): { emails: string[]; telefones: string[]; whatsapps: string[] } {
  if (!contatos || contatos.length === 0) {
    return {
      emails: fallback.email_fornecedor?.trim() ? [fallback.email_fornecedor.trim()] : [],
      telefones: fallback.telefone_fornecedor?.trim() ? [fallback.telefone_fornecedor.trim()] : [],
      whatsapps: fallback.whatsapp_fornecedor?.trim() ? [fallback.whatsapp_fornecedor.trim()] : [],
    }
  }
  const ordenar = (tipo: FornecedorContatoInput['tipo_canal_fornecedor_contato']) =>
    contatos
      .filter((c) => c.tipo_canal_fornecedor_contato === tipo)
      .sort((a, b) => a.ordem_fornecedor_contato - b.ordem_fornecedor_contato)
      .map((c) => c.valor_fornecedor_contato.trim())
      .filter(Boolean)

  return {
    emails: ordenar('EMAIL'),
    telefones: ordenar('TELEFONE'),
    whatsapps: ordenar('WHATSAPP'),
  }
}

/** E-mail principal para espelho BID / rating global. */
export function resolverEmailPrincipalFornecedor(
  contatos: FornecedorContatoInput[] | undefined,
  email_fornecedor: string | null | undefined,
): string | null {
  const emails = (contatos ?? [])
    .filter((c) => c.tipo_canal_fornecedor_contato === 'EMAIL')
    .sort((a, b) => {
      if (a.principal_fornecedor_contato !== b.principal_fornecedor_contato) {
        return a.principal_fornecedor_contato ? -1 : 1
      }
      return a.ordem_fornecedor_contato - b.ordem_fornecedor_contato
    })
  const principal = emails[0]?.valor_fornecedor_contato?.trim()
  if (principal) return principal
  const legado = email_fornecedor?.trim()
  return legado || null
}
