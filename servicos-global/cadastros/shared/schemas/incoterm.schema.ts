import { z } from 'zod'

/**
 * Validação Incoterm — catálogo global Incoterms 2020 da ICC.
 *
 * SSOT em `cadastros.incoterm` (decisão 2026-05-13). Produtos consomem via
 * REST API (`GET /api/v1/cadastros/incoterms`) — sem snapshot porque a
 * sigla nunca muda de significado dentro de uma versão da ICC.
 *
 * 11 termos canônicos:
 *   - Marítimos (porto): FAS, FOB, CFR, CIF
 *   - Multimodais:       EXW, FCA, CPT, CIP, DAP, DPU, DDP
 *
 * `modal_transporte` enum vive aqui (Zod) — schema.prisma define String
 * sem enum, então o banco aceita qualquer string e a validação é no
 * boundary de API.
 */
export const modalTransporteEnum = z.enum([
  'maritimo',  // FAS, FOB, CFR, CIF
  'qualquer',  // EXW, FCA, CPT, CIP, DAP, DPU, DDP
])

export const incotermSchema = z.object({
  codigo_incoterm:    z.string().min(2, 'codigo_incoterm obrigatório').max(4, 'codigo_incoterm tem no máximo 4 caracteres'),
  nome_incoterm:      z.string().min(1, 'nome_incoterm obrigatório'),
  descricao_incoterm: z.string().nullable().optional(),
  modal_transporte:   modalTransporteEnum,
  versao_incoterm:    z.string().min(4),
  ativo_incoterm:     z.boolean(),
})

export const listaIncotermsSchema = z.object({
  itens: z.array(incotermSchema),
  total: z.number(),
})

export type Incoterm = z.infer<typeof incotermSchema>
export type ModalTransporte = z.infer<typeof modalTransporteEnum>
