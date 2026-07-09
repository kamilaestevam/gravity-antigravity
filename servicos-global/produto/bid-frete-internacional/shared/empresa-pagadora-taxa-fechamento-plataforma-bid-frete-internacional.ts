import { z } from 'zod'

/** Quem paga a taxa de fechamento (success fee) quando o frete é fechado na plataforma. */
export const empresaPagadoraTaxaFechamentoPlataformaGravitySchema = z.enum([
  'CONTRATANTE_GRAVITY',
  'FORNECEDOR',
])

export type EmpresaPagadoraTaxaFechamentoPlataformaGravity = z.infer<
  typeof empresaPagadoraTaxaFechamentoPlataformaGravitySchema
>

export const EMPRESA_PAGADORA_TAXA_FECHAMENTO_PADRAO_BID_FRETE_INTERNACIONAL: EmpresaPagadoraTaxaFechamentoPlataformaGravity =
  'FORNECEDOR'

export const ROTULOS_EMPRESA_PAGADORA_TAXA_FECHAMENTO_PLATAFORMA_GRAVITY: Record<
  EmpresaPagadoraTaxaFechamentoPlataformaGravity,
  string
> = {
  CONTRATANTE_GRAVITY: 'Contratante Gravity',
  FORNECEDOR: 'Fornecedor',
}

export function normalizarEmpresaPagadoraTaxaFechamentoPlataformaGravity(
  valor: unknown,
): EmpresaPagadoraTaxaFechamentoPlataformaGravity {
  const parsed = empresaPagadoraTaxaFechamentoPlataformaGravitySchema.safeParse(valor)
  return parsed.success
    ? parsed.data
    : EMPRESA_PAGADORA_TAXA_FECHAMENTO_PADRAO_BID_FRETE_INTERNACIONAL
}

export function ehContratanteGravityPagadorTaxaFechamento(
  pagador: EmpresaPagadoraTaxaFechamentoPlataformaGravity | null | undefined,
): boolean {
  return pagador === 'CONTRATANTE_GRAVITY'
}

export function rotuloEmpresaPagadoraTaxaFechamentoPlataformaGravity(
  pagador: EmpresaPagadoraTaxaFechamentoPlataformaGravity | null | undefined,
): string {
  return ROTULOS_EMPRESA_PAGADORA_TAXA_FECHAMENTO_PLATAFORMA_GRAVITY[
    normalizarEmpresaPagadoraTaxaFechamentoPlataformaGravity(pagador)
  ]
}
