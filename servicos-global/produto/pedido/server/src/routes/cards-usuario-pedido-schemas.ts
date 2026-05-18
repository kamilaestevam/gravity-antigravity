import { z } from 'zod'

export const criarCardUsuarioSchema = z.object({
  nome: z.string().min(1).max(100),
  icone: z.string().min(1).max(50),
  cor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  formula_expressao: z.string().min(1).max(500),
  formula_dependencias: z.array(z.string()).optional(),
  ordem: z.number().int().min(0),
  ativo: z.boolean(),
})

export const atualizarCardUsuarioSchema = z.object({
  nome: z.string().min(1).max(100).optional(),
  icone: z.string().min(1).max(50).optional(),
  cor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  formula_expressao: z.string().min(1).max(500).optional(),
  formula_dependencias: z.array(z.string()).optional(),
  ordem: z.number().int().min(0).optional(),
  ativo: z.boolean().optional(),
})

export const reordenarCardsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
})

export const cardUsuarioResponseSchema = z.object({
  id: z.string(),
  tenant_id: z.string(),
  nome: z.string(),
  icone: z.string(),
  cor: z.string(),
  formula_expressao: z.string(),
  formula_dependencias: z.array(z.string()).optional(),
  ordem: z.number(),
  ativo: z.boolean(),
  created_by: z.string(),
  created_at: z.string(),
})
