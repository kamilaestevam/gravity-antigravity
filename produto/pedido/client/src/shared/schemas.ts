/**
 * schemas.ts — Schemas Zod centralizados do produto Pedido
 *
 * Fonte única de verdade para:
 *   - Tipos de formulário (PedidoForm, ItemForm)
 *   - Validação frontend com safeParse()
 *   - Contrato compartilhado entre ModalNovoPedido e DrawerPedido
 *
 * Regra: nunca redefinir PedidoForm ou ItemForm fora deste arquivo.
 */

import { z } from 'zod'

// ── Schema base de Pedido (criação — campos mínimos) ──────────────────────────

export const pedidoFormSchema = z.object({
  tipo_operacao: z.enum(['importacao', 'exportacao']),
  numero_pedido: z.string().min(1, 'Número do pedido é obrigatório'),
  importacao_exportador_id: z.string().default(''),
  fabricante_id: z.string().default(''),
  incoterm: z.string().default('FOB'),
  moeda_pedido: z.string().default('USD'),
  condicao_pagamento_pedido: z.string().default(''),
  numero_proforma: z.string().default(''),
  numero_invoice: z.string().default(''),
  referencia_importador: z.string().default(''),
  referencia_exportador: z.string().default(''),
  referencia_fabricante: z.string().default(''),
  data_emissao_pedido: z
    .string()
    .refine(
      val => !val || !isNaN(new Date(`${val}T00:00:00.000Z`).getTime()),
      { message: 'Data de emissão inválida — use o formato AAAA-MM-DD.' }
    )
    .default(() => new Date().toISOString().split('T')[0]),
})

export type PedidoForm = z.infer<typeof pedidoFormSchema>

// ── Schema de Item (criação) ───────────────────────────────────────────────────

export const itemFormSchema = z.object({
  key: z.string(),
  part_number: z.string().default(''),
  ncm: z.string().default(''),
  descricao_item: z.string().default(''),
  quantidade_inicial_item_pedido: z.string().default(''),
  unidade_comercializada_item: z.string().default('UN'),
  valor_unitario_item: z.string().default(''),
})

export type ItemForm = z.infer<typeof itemFormSchema>

// ── Valores iniciais ───────────────────────────────────────────────────────────

export const PEDIDO_FORM_VAZIO: PedidoForm = {
  tipo_operacao: 'importacao',
  numero_pedido: '',
  importacao_exportador_id: '',
  fabricante_id: '',
  incoterm: 'FOB',
  moeda_pedido: 'USD',
  condicao_pagamento_pedido: '',
  numero_proforma: '',
  numero_invoice: '',
  referencia_importador: '',
  referencia_exportador: '',
  referencia_fabricante: '',
  data_emissao_pedido: new Date().toISOString().split('T')[0],
}

export const ITEM_FORM_VAZIO = (): ItemForm => ({
  key: crypto.randomUUID(),
  part_number: '',
  ncm: '',
  descricao_item: '',
  quantidade_inicial_item_pedido: '',
  unidade_comercializada_item: 'UN',
  valor_unitario_item: '',
})

// ── Validação de formulário ────────────────────────────────────────────────────

export interface ErrosValidacao {
  geral?: string
  numero_pedido?: string
}

/**
 * Valida o passo 1 do wizard de criação de pedido.
 * Retorna { success: true } ou { success: false, erros: ErrosValidacao }.
 */
export function validarPasso1Pedido(form: PedidoForm): ErrosValidacao {
  const result = pedidoFormSchema.safeParse(form)
  if (result.success) return {}

  const erros: ErrosValidacao = {}
  for (const issue of result.error.issues) {
    const campo = issue.path[0]
    if (campo === 'numero_pedido') erros.numero_pedido = issue.message
    if (campo === 'data_emissao_pedido') erros.geral = issue.message
  }
  return erros
}

/**
 * Valida o passo 2 — itens do pedido.
 * Campos de item são opcionais no frontend; o backend valida o necessário.
 */
export function validarPasso2Itens(_itens: ItemForm[]): ErrosValidacao {
  return {}
}
