import { z } from 'zod'

/**
 * Resposta consolidada do endpoint /empresas/:suid/preview-impacto.
 * Cada produto consultado pode estar `ok` (respondeu), `indisponivel`
 * (URL não configurada / fora do ar) ou `erro` (timeout / 5xx).
 */
export const statusProdutoConsultado = z.enum(['ok', 'indisponivel', 'erro'])

export const impactoProdutoSchema = z.object({
  produto: z.enum(['pedido', 'lpco', 'nf_importacao']),
  ativos: z.number().int().nonnegative(),
  status: statusProdutoConsultado,
  mensagem: z.string().optional(),
})

export const previewImpactoSchema = z.object({
  suid_empresa: z.string(),
  total: z.number().int().nonnegative(),
  por_produto: z.array(impactoProdutoSchema),
})

export type ImpactoProduto = z.infer<typeof impactoProdutoSchema>
export type PreviewImpacto = z.infer<typeof previewImpactoSchema>
