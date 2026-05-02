/**
 * pedidos.ts — Rotas CRUD de Pedido e PedidoItem
 *
 * Endpoint base: /api/v1/pedidos
 * Protegido por: requireInternalKey + tenantIsolation
 * Validacao: Zod em toda rota
 *
 * Rotas:
 *   GET    /                    Listar pedidos (offset ou cursor pagination)
 *   GET    /localizar           Contar total de matches find-in-page (pedidos + itens)
 *   GET    /:id                 Detalhe do pedido
 *   GET    /:id/itens            Listar itens de um pedido (row expand)
 *   POST   /                    Criar pedido com itens
 *   PUT    /:id                 Atualizar pedido (Draft/Aberto)
 *   DELETE /:id                 Deletar pedido (Draft)
 *   PATCH  /:id/status          Transicao de status
 *   PATCH  /:id/campo           Editar campo inline (cell editing)
 *   POST   /:id/duplicar        Duplicar pedido
 *   POST   /:id/itens           Adicionar item
 *   PUT    /:id/itens/:itemId   Atualizar item
 *   DELETE /:id/itens/:itemId   Remover item
 *   PATCH  /:id/itens/:itemId/cancelar  Cancelar quantidade
 *   PATCH  /:id/itens/:itemId/pronta    Atualizar quantidade pronta
 */

import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import type { PrismaClient } from '@prisma/client'
import { withOrganizacao, type ContextoOrganizacao } from '@gravity/resolver-organizacao'
import { saldoEngine, AppError } from '../services/saldoEngine.js'
import {
  parsearFormula,
  avaliarFormula,
  buildContextoItem,
  SALDO_FORMULA_PADRAO,
} from '../services/formulaEngine.js'
import { isPropagavel } from '../../../pedido/shared/columnPropagationConfig.js'
import {
  buscarEmpresasPorSuids,
  buscarMoedaPorCodigo,
  buscarNcmPorCodigo,
  buscarUnidadePorCodigo,
  type CadastrosRequestContext,
} from '../services/cadastrosClient.js'
import {
  montarSnapshotEmpresa,
  montarSnapshotOpe,
  montarSnapshotNcm,
  montarSnapshotMoeda,
  montarSnapshotUnidade,
  type PapelEmpresa,
  type SnapshotMoedaData,
  type SnapshotNcmData,
  type SnapshotOpeData,
  type SnapshotUnidadeData,
} from '../services/pedidoSnapshots.js'
// FASE 06E (Frente 1, Agente 4): OPE não vem no payload de criação do Pedido
// (não há `suid_ope` em criarPedidoSchema), então `montarSnapshotOpe` fica
// referenciado para futuras frentes que injetarem OPE no fluxo. NCM/Moeda/
// Unidade são plugados abaixo a partir dos campos do pedido e dos itens.
void montarSnapshotOpe; void SnapshotOpeData;
import { randomUUID } from 'node:crypto'

export const pedidosRouter = Router()

// ── Schemas Zod ───────────────────────────────────────────────────────────────

const criarItemSchema = z.object({
  part_number: z.string().optional().nullable().default(''),
  ncm: z.string().optional().nullable().default(''),
  descricao_item: z.string().optional().nullable().default(''),
  quantidade_inicial_pedido: z.number().min(0).optional().default(0),
  unidade_comercializada_item: z.string().optional().nullable(),
  moeda_item: z.string().default('USD'),
  valor_por_unidade_item: z.number().optional().nullable(),
  valor_total_item: z.number().optional().nullable(),
  casas_decimais_quantidade_item: z.number().int().default(2),
  casas_decimais_valor_item: z.number().int().default(2),
  sequencia_item: z.number().int().optional().nullable(),
})

const criarPedidoObjectSchema = z.object({
  tipo_operacao: z.enum(['importacao', 'exportacao']),
  numero_pedido: z.string().min(1).max(100),
  // Fase 4 DDD: SUIDs referenciam Empresas no serviço Cadastros — usados para
  // gravar PedidoSnapshotEmpresa. Os campos *_id legados (importacao_exportador_id
  // etc.) nao sao mais aceitos no payload; snapshots sao a fonte da verdade.
  suid_importador:          z.string().min(1).optional().nullable(),
  suid_exportador:          z.string().min(1).optional().nullable(),
  suid_fabricante:          z.string().min(1).optional().nullable(),
  numero_proforma:          z.string().optional().nullable(),
  numero_invoice:           z.string().optional().nullable(),
  referencia_importador:    z.string().optional().nullable(),
  referencia_exportador:    z.string().optional().nullable(),
  referencia_fabricante:    z.string().optional().nullable(),
  incoterm: z.string().optional().nullable(),
  moeda_pedido: z.string().default('USD'),
  valor_total_pedido: z.number().optional().nullable(),
  casas_decimais_valor_pedido: z.number().int().default(2),
  quantidade_total_inicial_pedido: z.number().optional().nullable(),
  casas_decimais_quantidade_pedido: z.number().int().default(2),
  unidade_comercializada_pedido: z.string().optional().nullable(),
  condicao_pagamento: z.string().optional().nullable(),
  data_emissao_pedido: z.string().datetime().optional(),
  detalhes_operacionais: z.any().optional().nullable(),
  itens: z.array(criarItemSchema).optional().default([]),
})

/**
 * Regra cross-field Fase 4:
 *   - importacao → exige suid_exportador (quem vende ao nosso importador)
 *   - exportacao → exige suid_importador (quem compra do nosso exportador)
 * suid_fabricante permanece opcional nos dois tipos.
 */
export const criarPedidoSchema = criarPedidoObjectSchema.superRefine((data, ctx) => {
  if (data.tipo_operacao === 'importacao' && !data.suid_exportador) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['suid_exportador'],
      message: 'suid_exportador e obrigatorio quando tipo_operacao = importacao',
    })
  }
  if (data.tipo_operacao === 'exportacao' && !data.suid_importador) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['suid_importador'],
      message: 'suid_importador e obrigatorio quando tipo_operacao = exportacao',
    })
  }
})

const atualizarPedidoSchema = criarPedidoObjectSchema.partial().omit({ itens: true })

const atualizarItemSchema = z.object({
  part_number: z.string().min(1).optional(),
  ncm: z.string().min(1).optional(),
  descricao_item: z.string().min(1).optional(),
  unidade_comercializada_item: z.string().optional().nullable(),
  moeda_item: z.string().optional(),
  valor_por_unidade_item: z.number().optional().nullable(),
  valor_total_item: z.number().optional().nullable(),
  quantidade_inicial_pedido: z.number().min(0).optional(),
  cobertura_cambial: z.string().optional(),
  nome_exportador: z.string().optional().nullable(),
  nome_importador: z.string().optional().nullable(),
  nome_fabricante: z.string().optional().nullable(),
  referencia_importador: z.string().optional().nullable(),
  referencia_exportador: z.string().optional().nullable(),
  referencia_fabricante: z.string().optional().nullable(),
  incoterm: z.string().optional().nullable(),
  condicao_pagamento: z.string().optional().nullable(),
  data_emissao_pedido: z.string().optional().nullable(),
  // Dados físicos unitários
  peso_liquido_unitario: z.number().optional().nullable(),
  peso_liquido_unidade_item:  z.string().optional().nullable(),
  peso_bruto_unitario:   z.number().optional().nullable(),
  peso_bruto_unidade_item:    z.string().optional().nullable(),
  cubagem_unitaria:      z.number().optional().nullable(),
})

const cancelarQuantidadeSchema = z.object({
  quantidade: z.number().positive(),
})

const atualizarProntaSchema = z.object({
  quantidade_pronta_pedido: z.number().min(0),
})

const statusTransicaoSchema = z.object({
  status: z.enum(['draft', 'aberto', 'em_andamento', 'aprovado', 'transferencia', 'consolidado', 'cancelado']),
})

// ── Helpers ───────────────────────────────────────────────────────────────────

function gerarId(prefixo: string): string {
  const seq = String(Math.floor(Math.random() * 9999999)).padStart(7, '0')
  const ano = String(new Date().getFullYear()).slice(-2)
  return `${prefixo}_id_${seq}-${ano}`
}

/**
 * mapItem — ACL (Anti-Corruption Layer) entre a row crua do Prisma (colunas DDD com
 * sufixo `_pedido_item`) e o contrato JSON público consumido pelo frontend (nomes
 * estáveis sem sufixo). Faz também conversão Decimal → number.
 *
 * Contrato JSON público: nomes preservados (quantidade_inicial_pedido, part_number, …).
 * Lado Prisma (DDD Onda 3): quantidade_inicial_item, part_number_item, …
 */
type PedidoItemRaw = Record<string, unknown>
type PedidoRaw = Record<string, unknown> & { itens?: PedidoItemRaw[]; detalhes_operacionais?: unknown }

export function mapItem(item: PedidoItemRaw): PedidoItemRaw {
  const num = (v: unknown, fallback: number | null = 0) =>
    v != null ? Number(v) : fallback
  return {
    // Identidade e FKs (contrato preserva nomes antigos)
    id:         item.id_item,
    tenant_id:  item.id_organizacao,
    company_id: item.id_workspace,
    pedido_id:  item.id_pedido,

    sequencia_item:              item.sequencia_item_pedido,
    part_number:                 item.part_number_item,
    ncm:                         item.ncm_item,
    descricao_item:              item.descricao_item,
    unidade_comercializada_item: item.unidade_comercializada_item,

    // Decimal → number (quantidades)
    quantidade_inicial_pedido:     num(item.quantidade_inicial_item),
    quantidade_atual_pedido:       num(item.quantidade_atual_item),
    quantidade_pronta_pedido:      num(item.quantidade_pronta_item),
    quantidade_transferida_pedido: num(item.quantidade_transferida_item),
    quantidade_cancelada_pedido:   num(item.quantidade_cancelada_item),

    casas_decimais_quantidade_item: item.casas_decimais_quantidade_item,
    moeda_item:                     item.moeda_item,

    // Decimal → number (valores)
    valor_total_item:       num(item.valor_total_item, null),
    valor_por_unidade_item: num(item.valor_por_unidade_item, null),

    casas_decimais_valor_item: item.casas_decimais_valor_item,
    cobertura_cambial:         item.cobertura_cambial_item,
    nome_exportador:           item.nome_exportador_item,
    nome_importador:           item.nome_importador_item,
    nome_fabricante:           item.nome_fabricante_item,
    referencia_importador:     item.referencia_importador_item,
    referencia_exportador:     item.referencia_exportador_item,
    referencia_fabricante:     item.referencia_fabricante_item,
    incoterm:                  item.incoterm_item,
    condicao_pagamento_pedido: item.condicao_pagamento_item,
    data_emissao_pedido:       item.data_emissao_item,

    // Decimal → number (dados físicos unitários)
    peso_liquido_unitario: num(item.peso_liquido_unitario_item, null),
    peso_bruto_unitario:   num(item.peso_bruto_unitario_item, null),
    cubagem_unitaria:      num(item.cubagem_unitaria_item, null),

    casas_decimais_peso_item:    item.casas_decimais_peso_item,
    casas_decimais_cubagem_item: item.casas_decimais_cubagem_item,
    campos_custom:               item.dados_extras_importacao_item,
    created_at:                  item.data_criacao_item,
    updated_at:                  item.data_atualizacao_item,
  }
}

/**
 * mapPedido — ACL Pedido DDD → contrato JSON público.
 *
 * Após Onda 3 Tabela 7, as colunas físicas do model Pedido seguem DDD
 * (id_pedido, id_organizacao, status_pedido, ...). O contrato JSON público
 * preserva os nomes legados (id, tenant_id, status, ...) para não quebrar
 * o frontend. Esta função traduz uma única vez no boundary.
 *
 * Relations Prisma (`itens`, `transferencias`, `snapshots_empresa`, `snapshots_ope`) seguem
 * com seus nomes originais — apenas colunas físicas foram renomeadas (escopo da planilha).
 */
export function mapPedido(pedido: PedidoRaw | null | undefined): PedidoRaw | null | undefined {
  if (!pedido) return pedido
  const rawItens = pedido.itens_pedido as PedidoItemRaw[] | undefined
  const itens = Array.isArray(rawItens) ? rawItens.map(mapItem) : rawItens
  const det = (pedido.detalhes_operacionais_pedido as Record<string, unknown> | null)
    ?? (pedido.detalhes_operacionais as Record<string, unknown> | null)
    ?? {}
  return {
    ...pedido,
    // Identidade / isolamento — contrato legado
    id:                       pedido.id_pedido            ?? pedido.id,
    tenant_id:                pedido.id_organizacao       ?? pedido.tenant_id,
    company_id:               pedido.id_workspace         ?? pedido.company_id,
    tipo_operacao:            pedido.tipo_operacao_pedido ?? pedido.tipo_operacao,
    status:                   pedido.status_pedido        ?? pedido.status,
    status_id:                pedido.id_status_pedido            ?? pedido.id_status            ?? pedido.status_id,
    importacao_exportador_id: pedido.id_importacao_exportador_pedido ?? pedido.id_importacao_exportador ?? pedido.importacao_exportador_id,
    exportacao_importador_id: pedido.id_exportacao_importador_pedido ?? pedido.id_exportacao_importador ?? pedido.exportacao_importador_id,
    fabricante_id:            pedido.id_fabricante_pedido        ?? pedido.id_fabricante        ?? pedido.fabricante_id,
    incoterm:                 pedido.incoterm_pedido      ?? pedido.incoterm,
    condicao_pagamento:       pedido.condicao_pagamento_pedido ?? pedido.condicao_pagamento,
    numero_proforma:          pedido.numero_proforma_pedido    ?? pedido.numero_proforma,
    numero_invoice:           pedido.numero_invoice_pedido     ?? pedido.numero_invoice,
    referencia_importador:    pedido.referencia_importador_pedido ?? pedido.referencia_importador,
    referencia_exportador:    pedido.referencia_exportador_pedido ?? pedido.referencia_exportador,
    referencia_fabricante:    pedido.referencia_fabricante_pedido ?? pedido.referencia_fabricante,
    taxa_cambio_estimada:     pedido.taxa_cambio_estimada_pedido  ?? pedido.taxa_cambio_estimada,
    detalhes_operacionais:    pedido.detalhes_operacionais_pedido ?? pedido.detalhes_operacionais,
    campos_custom:            pedido.dados_extras_importacao_pedido ?? pedido.campos_custom_pedido         ?? pedido.campos_custom,
    pedidos_origem_id:        pedido.ids_origem_consolidacao_pedido ?? pedido.id_pedidos_origem            ?? pedido.pedidos_origem_id,
    cnpj_importador:          pedido.cnpj_importador_pedido       ?? pedido.cnpj_importador,
    deleted_at:               pedido.data_exclusao_pedido         ?? pedido.deleted_at,
    created_at:               pedido.data_criacao_pedido          ?? pedido.created_at,
    updated_at:               pedido.data_atualizacao_pedido      ?? pedido.updated_at,
    data_documento_proforma:  pedido.data_documento_proforma_pedido ?? pedido.data_documento_proforma,
    data_documento_invoice:   pedido.data_documento_invoice_pedido  ?? pedido.data_documento_invoice,
    data_prevista_pedido_pronto:   pedido.data_prevista_pedido_pronto,
    data_confirmada_pedido_pronto: pedido.data_confirmada_pedido_pronto,
    data_meta_pedido_pronto:       pedido.data_meta_pedido_pronto,
    data_prev_recebimento_draft_pedido:      pedido.data_previsao_recebimento_draft_pedido,
    data_conf_recebimento_draft_pedido:      pedido.data_confirmacao_recebimento_draft_pedido,
    data_meta_recebimento_draft_pedido:      pedido.data_meta_recebimento_draft_pedido,
    data_prev_aprovacao_draft_pedido:        pedido.data_previsao_aprovacao_draft_pedido,
    data_conf_aprovacao_draft_pedido:        pedido.data_confirmacao_aprovacao_draft_pedido,
    data_meta_aprovacao_draft_pedido:        pedido.data_meta_aprovacao_draft_pedido,
    data_prev_recebimento_draft_proforma:    pedido.data_previsao_recebimento_draft_proforma_pedido    ?? pedido.data_prev_recebimento_draft_proforma,
    data_conf_recebimento_draft_proforma:    pedido.data_confirmacao_recebimento_draft_proforma_pedido ?? pedido.data_conf_recebimento_draft_proforma,
    data_meta_recebimento_draft_proforma:    pedido.data_meta_recebimento_draft_proforma_pedido        ?? pedido.data_meta_recebimento_draft_proforma,
    data_prev_aprovacao_draft_proforma:      pedido.data_previsao_aprovacao_draft_proforma_pedido      ?? pedido.data_prev_aprovacao_draft_proforma,
    data_conf_aprovacao_draft_proforma:      pedido.data_confirmacao_aprovacao_draft_proforma_pedido   ?? pedido.data_conf_aprovacao_draft_proforma,
    data_meta_aprovacao_draft_proforma:      pedido.data_meta_aprovacao_draft_proforma_pedido          ?? pedido.data_meta_aprovacao_draft_proforma,
    data_prev_envio_original_proforma:       pedido.data_previsao_envio_original_proforma_pedido       ?? pedido.data_prev_envio_original_proforma,
    data_conf_envio_original_proforma:       pedido.data_confirmacao_envio_original_proforma_pedido    ?? pedido.data_conf_envio_original_proforma,
    data_meta_envio_original_proforma:       pedido.data_meta_envio_original_proforma_pedido           ?? pedido.data_meta_envio_original_proforma,
    data_prev_recebimento_original_proforma: pedido.data_previsao_recebimento_original_proforma_pedido    ?? pedido.data_prev_recebimento_original_proforma,
    data_conf_recebimento_original_proforma: pedido.data_confirmacao_recebimento_original_proforma_pedido ?? pedido.data_conf_recebimento_original_proforma,
    data_meta_recebimento_original_proforma: pedido.data_meta_recebimento_original_proforma_pedido        ?? pedido.data_meta_recebimento_original_proforma,
    data_prev_recebimento_draft_invoice:     pedido.data_previsao_recebimento_draft_invoice_pedido     ?? pedido.data_prev_recebimento_draft_invoice,
    data_conf_recebimento_draft_invoice:     pedido.data_confirmacao_recebimento_draft_invoice_pedido  ?? pedido.data_conf_recebimento_draft_invoice,
    data_meta_recebimento_draft_invoice:     pedido.data_meta_recebimento_draft_invoice_pedido         ?? pedido.data_meta_recebimento_draft_invoice,
    data_prev_aprovacao_draft_invoice:       pedido.data_previsao_aprovacao_draft_invoice_pedido       ?? pedido.data_prev_aprovacao_draft_invoice,
    data_conf_aprovacao_draft_invoice:       pedido.data_confirmacao_aprovacao_draft_invoice_pedido    ?? pedido.data_conf_aprovacao_draft_invoice,
    data_meta_aprovacao_draft_invoice:       pedido.data_meta_aprovacao_draft_invoice_pedido           ?? pedido.data_meta_aprovacao_draft_invoice,
    data_prev_envio_original_invoice:        pedido.data_previsao_envio_original_invoice_pedido        ?? pedido.data_prev_envio_original_invoice,
    data_conf_envio_original_invoice:        pedido.data_confirmacao_envio_original_invoice_pedido     ?? pedido.data_conf_envio_original_invoice,
    data_meta_envio_original_invoice:        pedido.data_meta_envio_original_invoice_pedido            ?? pedido.data_meta_envio_original_invoice,
    data_prev_recebimento_original_invoice:  pedido.data_previsao_recebimento_original_invoice_pedido     ?? pedido.data_prev_recebimento_original_invoice,
    data_conf_recebimento_original_invoice:  pedido.data_confirmacao_recebimento_original_invoice_pedido  ?? pedido.data_conf_recebimento_original_invoice,
    data_meta_recebimento_original_invoice:  pedido.data_meta_recebimento_original_invoice_pedido         ?? pedido.data_meta_recebimento_original_invoice,
    itens,
    // Campos armazenados em detalhes_operacionais → surfaçados como top-level
    nome_exportador: (det.nome_exportador as string | null | undefined) ?? null,
    nome_importador: (det.nome_importador as string | null | undefined) ?? null,
    nome_fabricante: (det.nome_fabricante as string | null | undefined) ?? null,
    // Virtual: somatório de quantidade_pronta dos itens (não persistido no Pedido)
    quantidade_pronta_itens_pedido_total: Array.isArray(itens)
      ? itens.reduce((s: number, i: PedidoItemRaw) => s + Number(i.quantidade_pronta_pedido ?? 0), 0)
      : (pedido.quantidade_pronta_itens_pedido_total ?? null),
    // Virtual: somatório de quantidade_cancelada dos itens (não persistido no Pedido)
    quantidade_cancelada_total_pedido: Array.isArray(itens)
      ? itens.reduce((s: number, i: PedidoItemRaw) => s + Number(i.quantidade_cancelada_pedido ?? 0), 0)
      : (pedido.quantidade_cancelada_total_pedido ?? null),
    // Virtual: contagem de NCMs distintos nos itens do pedido
    ncms_distintos_count: Array.isArray(itens)
      ? new Set(itens.map((i: PedidoItemRaw) => i.ncm).filter(Boolean)).size
      : (pedido.ncms_distintos_count ?? null),
  }
}

// ── Helper: injeta _colunas_usuario nos pedidos retornados ───────────────────
// Faz um único batch query para buscar todos os valores de colunas personalizadas
// dos pedidos na página, evitando N+1 queries.
async function injetarValoresColunasUsuario<T extends { id: string }>(
  prisma: PrismaClient,
  registros: T[],
  tenant_id: string
): Promise<(T & { _colunas_usuario: Record<string, string> })[]> {
  if (registros.length === 0) return []
  const ids = registros.map(r => r.id)
  const valores: { id_vinculo_valor_coluna_usuario_pedido: string; id_coluna_usuario_pedido: string; valor_coluna_usuario_pedido: string }[] =
    await prisma.pedidoValorColunaUsuario.findMany({
      where: { id_organizacao: tenant_id, id_vinculo_valor_coluna_usuario_pedido: { in: ids } },
      select: { id_vinculo_valor_coluna_usuario_pedido: true, id_coluna_usuario_pedido: true, valor_coluna_usuario_pedido: true },
    })
  const mapa: Record<string, Record<string, string>> = {}
  for (const v of valores) {
    const vinculoId = v.id_vinculo_valor_coluna_usuario_pedido
    if (!mapa[vinculoId]) mapa[vinculoId] = {}
    mapa[vinculoId][v.id_coluna_usuario_pedido] = v.valor_coluna_usuario_pedido
  }
  return registros.map(r => ({ ...r, _colunas_usuario: mapa[r.id] ?? {} }))
}

// ── Cursor pagination helpers ─────────────────────────────────────────────────

// Campos suportados como sort key no cursor pagination
export const CURSOR_SORT_FIELDS = ['data_emissao_pedido', 'numero_pedido', 'valor_total_pedido', 'created_at', 'updated_at'] as const
export type CursorSortField = typeof CURSOR_SORT_FIELDS[number]

export interface CursorPayload {
  sort_field: CursorSortField
  sort_value: unknown
  sort_dir: 'asc' | 'desc'
  id: string
}

export function encodeCursor(payload: CursorPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString('base64url')
}

function decodeCursor(encoded: string): CursorPayload | null {
  try {
    const decoded = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8')) as unknown
    if (
      typeof decoded !== 'object' || decoded === null ||
      !('sort_field' in decoded) || !('sort_value' in decoded) ||
      !('sort_dir' in decoded) || !('id' in decoded)
    ) {
      return null
    }
    const payload = decoded as CursorPayload
    if (!CURSOR_SORT_FIELDS.includes(payload.sort_field)) return null
    if (!['asc', 'desc'].includes(payload.sort_dir)) return null
    return payload
  } catch {
    return null
  }
}

// ── GET / — Listar pedidos ────────────────────────────────────────────────────
// Suporta dois modos de paginação:
//   - Cursor: ?cursor=<base64>&sort=data_emissao_pedido&dir=desc&limit=50
//   - Offset: ?page=1&limit=20 (backward compat)

pedidosRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const ctx      = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const tenant_id  = ctx.idOrganizacao
      const company_id = (req.headers['x-id-workspace'] as string | undefined) ?? tenant_id

      const { status, tipo_operacao, busca, cursor, page, limit, sort, dir } = req.query

      const where: Record<string, unknown> = { tenant_id, company_id, deleted_at: null }
      if (status) {
        const statusList = (status as string).split(',').map(s => s.trim()).filter(Boolean)
        where.status = statusList.length > 1 ? { in: statusList } : statusList[0]
      }
      if (tipo_operacao) where.tipo_operacao = tipo_operacao
      if (busca) {
        where.numero_pedido = { contains: busca as string, mode: 'insensitive' }
      }

      // ── Cursor pagination ──
      if (cursor !== undefined) {
        const sortField = (CURSOR_SORT_FIELDS.includes(sort as CursorSortField) ? sort : 'data_emissao_pedido') as CursorSortField
        const sortDir = dir === 'asc' ? 'asc' : 'desc'
        const limitNum = Math.min(Math.max(Number(limit ?? 50), 1), 200)

        // Montar condição de keyset se cursor presente
        if (typeof cursor === 'string' && cursor.length > 0) {
          const payload = decodeCursor(cursor)
          if (!payload) {
            return res.status(400).json({ error: { message: 'Cursor invalido' } })
          }

          // WHERE (sort_field < last_val) OR (sort_field = last_val AND id < last_id)
          // Para sortDir=asc, usa-se > e para desc, usa-se <
          const op = payload.sort_dir === 'desc' ? 'lt' : 'gt'

          where.OR = [
            { [payload.sort_field]: { [op]: payload.sort_value } },
            {
              [payload.sort_field]: payload.sort_value,
              id: { [op]: payload.id },
            },
          ]
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await db.pedido.findMany({
          where,
          include: { itens_pedido: { orderBy: { sequencia_item: 'asc' } } },
          orderBy: [
            { [sortField]: sortDir },
            { id: sortDir },
          ],
          take: limitNum + 1, // busca +1 para saber se tem mais
        }) as any[]

        const tem_mais = data.length > limitNum
        const registros = tem_mais ? data.slice(0, limitNum) : data

        let cursor_proximo: string | null = null
        if (tem_mais && registros.length > 0) {
          const ultimo = registros[registros.length - 1]
          cursor_proximo = encodeCursor({
            sort_field: sortField,
            sort_value: (ultimo as Record<string, unknown>)[sortField],
            sort_dir: sortDir,
            id: ultimo.id,
          })
        }

        const registrosComColunas = await injetarValoresColunasUsuario(db, registros, tenant_id)
        return res.json({ data: registrosComColunas.map(mapPedido), nextCursor: cursor_proximo, hasMore: tem_mais })
      }

      // ── Offset pagination (backward compat) ──
      const pageNum = Number(page ?? 1)
      const limitNum = Number(limit ?? 20)
      const skip = (pageNum - 1) * limitNum

      const [dataRaw, total, totalItens] = await Promise.all([
        db.pedido.findMany({
          where,
          include: { itens_pedido: { orderBy: { sequencia_item_pedido: 'asc' } } },
          orderBy: { data_emissao_pedido: 'desc' },
          skip,
          take: limitNum,
        }),
        db.pedido.count({ where }),
        db.pedidoItem.count({ where: { pedido_item: where } }),
      ])

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = dataRaw as any[]
      const dataComColunas = await injetarValoresColunasUsuario(db, data, tenant_id)
      res.json({ data: dataComColunas.map(mapPedido), total, totalItens, page: pageNum, limit: limitNum })
    })
  } catch (err) {
    next(err)
  }
})

// ── GET /localizar — Contar total de matches find-in-page (pedidos + itens) ───
// Deve ficar ANTES de /:id para que Express não interprete "localizar" como param.

pedidosRouter.get('/localizar', async (req: Request, res: Response, next: NextFunction) => {
  const localizarSchema = z.object({
    termo:         z.string().min(1).max(200),
    status:        z.string().optional(),
    tipo_operacao: z.string().optional(),
    busca:         z.string().optional(),
  })
  const result = localizarSchema.safeParse(req.query)
  if (!result.success) {
    return res.status(400).json({ error: { message: 'Parametros invalidos', details: result.error.flatten() } })
  }

  const { termo, status, tipo_operacao, busca } = result.data

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const ctx      = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const tenant_id  = ctx.idOrganizacao
      const company_id = (req.headers['x-id-workspace'] as string | undefined) ?? tenant_id

      // WHERE base (tenant_id injetado também pelo $extends após fix do count)
      const whereBase: Record<string, unknown> = { tenant_id, company_id, deleted_at: null }
      if (status) {
        const statusList = status.split(',').map(s => s.trim()).filter(Boolean)
        whereBase.status = statusList.length > 1 ? { in: statusList } : statusList[0]
      }
      if (tipo_operacao) whereBase.tipo_operacao = tipo_operacao
      if (busca) whereBase.numero_pedido = { contains: busca, mode: 'insensitive' }

      // Parâmetro ILIKE — % escapado para evitar interpretação especial
      const ilike = `%${termo.replace(/[%_\\]/g, '\\$&')}%`

      // ── Campos textuais do Pedido (ORM — coberto pelo $extends count) ────────────
      const pedidoOR = [
        { numero_pedido:         { contains: termo, mode: 'insensitive' as const } },
        { tipo_operacao:         { contains: termo, mode: 'insensitive' as const } },
        { status:                { contains: termo, mode: 'insensitive' as const } },
        { incoterm:              { contains: termo, mode: 'insensitive' as const } },
        { moeda_pedido:          { contains: termo, mode: 'insensitive' as const } },
        { numero_proforma:       { contains: termo, mode: 'insensitive' as const } },
        { numero_invoice:        { contains: termo, mode: 'insensitive' as const } },
        { referencia_importador: { contains: termo, mode: 'insensitive' as const } },
        { referencia_exportador: { contains: termo, mode: 'insensitive' as const } },
        { referencia_fabricante: { contains: termo, mode: 'insensitive' as const } },
      ]

      // ── Campos textuais do PedidoItem (ORM) ─────────────────────────────────────
      const itemOR = [
        { part_number_item:                 { contains: termo, mode: 'insensitive' as const } },
        { ncm_item:                         { contains: termo, mode: 'insensitive' as const } },
        { descricao_item:              { contains: termo, mode: 'insensitive' as const } },
        { unidade_comercializada_item: { contains: termo, mode: 'insensitive' as const } },
        { moeda_item:                  { contains: termo, mode: 'insensitive' as const } },
      ]

      const [
        totalPedidos,
        totalItens,
        jsonbRows,
        colunaRows,
        valorRows,
      ] = await Promise.all([
        // Pedidos que batem em campos textuais simples
        db.pedido.count({ where: { ...whereBase, OR: pedidoOR } }),

        // Itens que batem em campos textuais simples
        db.pedidoItem.count({
          where: {
            id_organizacao: tenant_id,
            pedido_item: { company_id, deleted_at: null },
            OR: itemOR,
          },
        }),

        // JSONB detalhes_operacionais: nome_exportador, nome_importador, nome_fabricante
        // $queryRaw com tagged template = prepared statement, sem risco de SQL injection
        db.$queryRaw`
          SELECT COUNT(*)::int AS count
          FROM pedidos_comerciais
          WHERE tenant_id = ${tenant_id}
            AND company_id = ${company_id}
            AND deleted_at IS NULL
            AND (
              detalhes_operacionais->>'nome_exportador' ILIKE ${ilike}
              OR detalhes_operacionais->>'nome_importador' ILIKE ${ilike}
              OR detalhes_operacionais->>'nome_fabricante' ILIKE ${ilike}
            )
        `,

        // Labels de colunas criadas pelo usuário (PedidoColuna.rotulo_pedido_coluna)
        db.pedidoColuna.count({
          where: { id_organizacao: tenant_id, rotulo_pedido_coluna: { contains: termo, mode: 'insensitive' } },
        }),

        // Valores de colunas customizadas do usuário (campos_custom por vinculo)
        db.$queryRaw`
          SELECT COUNT(*)::int AS count
          FROM valores_colunas_usuario_pedido v
          INNER JOIN pedidos_comerciais p ON p.id = v.vinculo_id
          WHERE v.tenant_id = ${tenant_id}
            AND p.company_id = ${company_id}
            AND p.deleted_at IS NULL
            AND v.valor ILIKE ${ilike}
        `,
      ])

      const total =
        totalPedidos +
        totalItens +
        Number((jsonbRows[0] as { count: bigint | number }).count ?? 0) +
        colunaRows +
        Number((valorRows[0] as { count: bigint | number }).count ?? 0)

      res.json({ total })
    })
  } catch (err) {
    next(err)
  }
})

// ── GET /:id — Detalhe do pedido ──────────────────────────────────────────────

pedidosRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const ctx      = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const tenant_id  = ctx.idOrganizacao
      const company_id = (req.headers['x-id-workspace'] as string | undefined) ?? tenant_id

      const pedido = await db.pedido.findFirst({
        where: { id: req.params.id, tenant_id, company_id },
        include: { itens_pedido: { orderBy: { sequencia_item_pedido: 'asc' } } },
      })

      if (!pedido) {
        throw new AppError(404, 'Pedido nao encontrado')
      }

      res.json(mapPedido(pedido))
    })
  } catch (err) {
    next(err)
  }
})

// ── GET /:id/itens — Listar itens de um pedido (usado por expand de linha) ────

pedidosRouter.get('/:id/itens', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const ctx      = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const tenant_id  = ctx.idOrganizacao
      const company_id = (req.headers['x-id-workspace'] as string | undefined) ?? tenant_id

      // Garante que o pedido existe e pertence ao tenant/company antes de expor itens.
      const pedido = await db.pedido.findFirst({
        where: { id: req.params.id, tenant_id, company_id },
        select: { id: true },
      })
      if (!pedido) {
        throw new AppError(404, 'Pedido nao encontrado')
      }

      const itens = await db.pedidoItem.findMany({
        where: { id_pedido: req.params.id, id_organizacao: tenant_id, id_workspace: company_id },
        orderBy: { sequencia_item_pedido: 'asc' },
      })

      res.json(itens.map(mapItem))
    })
  } catch (err) {
    next(err)
  }
})

// ── POST / — Criar pedido com itens ───────────────────────────────────────────

pedidosRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  const result = criarPedidoSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: { message: 'Dados invalidos', details: result.error.flatten() } })
  }

  const {
    itens,
    suid_importador,
    suid_exportador,
    suid_fabricante,
    ...pedidoData
  } = result.data

  try {
    // ── Fase 4 DDD: busca Empresas no Cadastros ANTES do $transaction ─────
    // I/O de rede não pode segurar conexão Prisma (mesma regra da saga
    // Cadastros-primeiro da Fase 3).
    const ctxTenant = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
    const correlation_id =
      (req.headers['x-correlation-id'] as string | undefined) ?? randomUUID()

    const papeisPorSuid: Array<{ suid: string; papel: PapelEmpresa }> = []
    if (suid_importador) papeisPorSuid.push({ suid: suid_importador, papel: 'importador' })
    if (suid_exportador) papeisPorSuid.push({ suid: suid_exportador, papel: 'exportador' })
    if (suid_fabricante) papeisPorSuid.push({ suid: suid_fabricante, papel: 'fabricante' })

    const empresasMap = await buscarEmpresasPorSuids(
      papeisPorSuid.map((p) => p.suid),
      { id_organizacao: ctxTenant.idOrganizacao, correlation_id },
    )

    // ── FASE 06E (Frente 1, Agente 4): snapshots iniciais de NCM/Moeda/Unidade ─
    // Best-effort: falhas no Cadastros NÃO bloqueiam a criação do Pedido. O
    // re-snapshot via webhook (Frente 2 — Agente 5) corrige depois.
    //
    // OPE: o payload de criação do Pedido hoje não carrega `suid_ope`, então
    // não há snapshot de OPE neste fluxo. Quando o campo for adicionado em
    // criarPedidoSchema, plugar `montarSnapshotOpe` aqui usando o mesmo
    // padrão best-effort.
    const ctxCadastros: CadastrosRequestContext = {
      id_organizacao: ctxTenant.idOrganizacao,
      correlation_id,
    }

    // Coleta códigos distintos a partir do pedido + itens
    const ncmsDistintos = Array.from(
      new Set(itens.map((i) => i.ncm).filter((c): c is string => !!c && c.length > 0)),
    )
    const moedasDistintas = Array.from(
      new Set(
        [
          pedidoData.moeda_pedido,
          ...itens.map((i) => i.moeda_item),
        ].filter((c): c is string => !!c && c.length > 0),
      ),
    )
    const unidadesDistintas = Array.from(
      new Set(
        [
          pedidoData.unidade_comercializada_pedido,
          ...itens.map((i) => i.unidade_comercializada_item),
        ].filter((c): c is string => !!c && c.length > 0),
      ),
    )

    async function buscarSeguro<T>(
      label: string,
      codigo: string,
      fn: () => Promise<T | null>,
    ): Promise<T | null> {
      try {
        const r = await fn()
        if (r === null) {
          console.warn(
            `[POST /pedidos] snapshot ${label}: registro nao encontrado no Cadastros (codigo=${codigo}); seguindo sem snapshot inicial`,
          )
        }
        return r
      } catch (err) {
        console.warn(
          `[POST /pedidos] snapshot ${label}: falha ao buscar no Cadastros (codigo=${codigo}); seguindo sem snapshot inicial`,
          err instanceof Error ? err.message : err,
        )
        return null
      }
    }

    const [ncmsBuscados, moedasBuscadas, unidadesBuscadas] = await Promise.all([
      Promise.all(
        ncmsDistintos.map(async (codigo) => ({
          codigo,
          ncm: await buscarSeguro('NCM', codigo, () => buscarNcmPorCodigo(codigo, ctxCadastros)),
        })),
      ),
      Promise.all(
        moedasDistintas.map(async (codigo) => ({
          codigo,
          moeda: await buscarSeguro('Moeda', codigo, () => buscarMoedaPorCodigo(codigo, ctxCadastros)),
        })),
      ),
      Promise.all(
        unidadesDistintas.map(async (codigo) => ({
          codigo,
          unidade: await buscarSeguro('Unidade', codigo, () =>
            buscarUnidadePorCodigo(codigo, ctxCadastros),
          ),
        })),
      ),
    ])

    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const ctx      = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const tenant_id  = ctx.idOrganizacao
      const company_id = (req.headers['x-id-workspace'] as string | undefined) ?? tenant_id

      const pedidoId = gerarId('pedi')

      // Calcular totais automaticamente
      const valorTotal = itens.reduce((acc, item) => {
        const qty = item.quantidade_inicial_pedido ?? 0
        const valorItem = item.valor_total_item ?? (item.valor_por_unidade_item ?? 0) * qty
        return acc + valorItem
      }, 0)

      const qtdTotal = itens.reduce((acc, item) => acc + (item.quantidade_inicial_pedido ?? 0), 0)

      const snapshotsData = papeisPorSuid
        .map(({ suid, papel }) => {
          const empresa = empresasMap.get(suid)
          if (!empresa) return null
          return montarSnapshotEmpresa(empresa, papel, tenant_id, company_id)
        })
        .filter((s): s is NonNullable<typeof s> => s !== null)

      // FASE 06E — monta snapshots iniciais de NCM/Moeda/Unidade a partir das
      // entidades que vieram do Cadastros (ou pula se a busca falhou).
      const snapshotsNcmData: SnapshotNcmData[] = ncmsBuscados
        .map(({ ncm }) => {
          if (!ncm) return null
          try {
            return montarSnapshotNcm(ncm, tenant_id, company_id)
          } catch (err) {
            console.warn(
              `[POST /pedidos] snapshot NCM: contrato invalido (codigo=${ncm.codigo_ncm}); seguindo sem snapshot inicial`,
              err instanceof Error ? err.message : err,
            )
            return null
          }
        })
        .filter((s): s is SnapshotNcmData => s !== null)

      const snapshotsMoedaData: SnapshotMoedaData[] = moedasBuscadas
        .map(({ moeda }) => {
          if (!moeda) return null
          try {
            return montarSnapshotMoeda(moeda, tenant_id, company_id)
          } catch (err) {
            console.warn(
              `[POST /pedidos] snapshot Moeda: contrato invalido (codigo=${moeda.codigo_moeda}); seguindo sem snapshot inicial`,
              err instanceof Error ? err.message : err,
            )
            return null
          }
        })
        .filter((s): s is SnapshotMoedaData => s !== null)

      const snapshotsUnidadeData: SnapshotUnidadeData[] = unidadesBuscadas
        .map(({ unidade }) => {
          if (!unidade) return null
          try {
            return montarSnapshotUnidade(unidade, tenant_id, company_id)
          } catch (err) {
            console.warn(
              `[POST /pedidos] snapshot Unidade: contrato invalido (codigo=${unidade.codigo_unidade}); seguindo sem snapshot inicial`,
              err instanceof Error ? err.message : err,
            )
            return null
          }
        })
        .filter((s): s is SnapshotUnidadeData => s !== null)

      const novoPedido = await db.pedido.create({
        data: {
          id: pedidoId,
          tenant_id,
          company_id,
          ...pedidoData,
          valor_total_pedido: pedidoData.valor_total_pedido ?? valorTotal,
          quantidade_total_inicial_pedido: pedidoData.quantidade_total_inicial_pedido ?? qtdTotal,
          status: 'draft',
          itens: {
            create: itens.map((item, index) => ({
              id_item: gerarId('pite'),
              id_organizacao: tenant_id,
              id_workspace: company_id,
              sequencia_item_pedido: item.sequencia_item ?? (index + 1),
              part_number_item: item.part_number ?? '',
              ncm_item: item.ncm ?? '',
              descricao_item: item.descricao_item ?? '',
              quantidade_inicial_item: item.quantidade_inicial_pedido ?? 0,
              quantidade_atual_item: item.quantidade_inicial_pedido ?? 0,
              casas_decimais_quantidade_item: item.casas_decimais_quantidade_item,
              unidade_comercializada_item: item.unidade_comercializada_item,
              moeda_item: item.moeda_item,
              valor_por_unidade_item: item.valor_por_unidade_item,
              valor_total_item: item.valor_total_item ?? (item.valor_por_unidade_item ?? 0) * (item.quantidade_inicial_pedido ?? 0),
              casas_decimais_valor_item: item.casas_decimais_valor_item,
            })),
          },
          snapshots_empresa: snapshotsData.length
            ? { create: snapshotsData }
            : undefined,
          snapshots_ncm_pedido: snapshotsNcmData.length
            ? { create: snapshotsNcmData }
            : undefined,
          snapshots_moeda_pedido: snapshotsMoedaData.length
            ? { create: snapshotsMoedaData }
            : undefined,
          snapshots_unidade_pedido: snapshotsUnidadeData.length
            ? { create: snapshotsUnidadeData }
            : undefined,
        },
        include: {
          itens_pedido: { orderBy: { sequencia_item_pedido: 'asc' } },
          snapshots_empresa: true,
          snapshots_ncm_pedido: true,
          snapshots_moeda_pedido: true,
          snapshots_unidade_pedido: true,
        },
      })

      res.status(201).json(mapPedido(novoPedido))
    })
  } catch (err) {
    next(err)
  }
})

// ── PUT /:id — Atualizar pedido ───────────────────────────────────────────────

pedidosRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  const result = atualizarPedidoSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: { message: 'Dados invalidos', details: result.error.flatten() } })
  }

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const ctx      = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const tenant_id  = ctx.idOrganizacao
      const company_id = (req.headers['x-id-workspace'] as string | undefined) ?? tenant_id

      const pedido = await db.pedido.findFirst({
        where: { id: req.params.id, tenant_id, company_id },
      })

      if (!pedido) {
        throw new AppError(404, 'Pedido nao encontrado')
      }

      if (!['draft', 'aberto'].includes(pedido.status)) {
        throw new AppError(400, 'Pedido so pode ser editado nos status Draft ou Aberto')
      }

      const updated = await db.pedido.update({
        where: { id: req.params.id },
        data: result.data,
        include: { itens_pedido: { orderBy: { sequencia_item_pedido: 'asc' } } },
      })

      res.json(mapPedido(updated))
    })
  } catch (err) {
    next(err)
  }
})

// ── DELETE /:id — Deletar pedido ──────────────────────────────────────────────

pedidosRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const ctx      = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const tenant_id  = ctx.idOrganizacao
      const company_id = (req.headers['x-id-workspace'] as string | undefined) ?? tenant_id

      const pedido = await db.pedido.findFirst({
        where: { id: req.params.id, tenant_id, company_id },
      })

      if (!pedido) {
        throw new AppError(404, 'Pedido nao encontrado')
      }

      if (pedido.status !== 'draft') {
        throw new AppError(400, 'Apenas pedidos com status Draft podem ser deletados')
      }

      await db.pedido.delete({ where: { id: req.params.id } })
      res.status(204).send()
    })
  } catch (err) {
    next(err)
  }
})

// ── PATCH /:id/status — Transicao de status ───────────────────────────────────

pedidosRouter.patch('/:id/status', async (req: Request, res: Response, next: NextFunction) => {
  const result = statusTransicaoSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: { message: 'Status invalido', details: result.error.flatten() } })
  }

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const ctx      = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const tenant_id  = ctx.idOrganizacao
      const company_id = (req.headers['x-id-workspace'] as string | undefined) ?? tenant_id

      const pedido = await db.pedido.findFirst({
        where: { id: req.params.id, tenant_id, company_id },
      })

      if (!pedido) {
        throw new AppError(404, 'Pedido nao encontrado')
      }

      // Validar transicoes permitidas
      const transicoesValidas: Record<string, string[]> = {
        draft: ['aberto', 'cancelado'],
        aberto: ['cancelado'],
      }

      const permitidas = transicoesValidas[pedido.status] ?? []
      if (!permitidas.includes(result.data.status)) {
        throw new AppError(400,
          `Transicao de "${pedido.status}" para "${result.data.status}" nao permitida`
        )
      }

      const updated = await db.pedido.update({
        where: { id: req.params.id },
        data: { status: result.data.status },
        include: { itens_pedido: { orderBy: { sequencia_item: 'asc' } } },
      })

      res.json(mapPedido(updated))
    })
  } catch (err) {
    next(err)
  }
})

// ── PATCH /:id/campo — Editar campo inline (cell editing) ────────────────────

// Campos editados diretamente no banco via PATCH /:id/campo
const CAMPOS_EDITAVEIS = new Set([
  'numero_pedido',
  'numero_proforma',
  'numero_invoice',
  'tipo_operacao',
  'referencia_importador',
  'referencia_exportador',
  'referencia_fabricante',
  // nome_exportador e nome_importador: validação condicional por tipo_operacao feita no handler
  'nome_exportador',
  'nome_importador',
  'nome_fabricante',
  'incoterm',
  'moeda_pedido',
  'condicao_pagamento',
  'importacao_exportador_id',
  'exportacao_importador_id',
  'data_emissao_pedido',
  'campos_custom',
  'unidade_comercializada_pedido',
  'status',
  // Datas (43)
  'data_prevista_pedido_pronto',
  'data_confirmada_pedido_pronto',
  'data_meta_pedido_pronto',
  'data_prevista_inspecao_pedido',
  'data_confirmada_inspecao_pedido',
  'data_meta_inspecao_pedido',
  'data_prevista_coleta_pedido',
  'data_confirmada_coleta_pedido',
  'data_meta_coleta_pedido',
  'data_transferencia_saldo_pedido',
  'data_prevista_recebimento_draft_pedido',
  'data_confirmada_recebimento_draft_pedido',
  'data_meta_recebimento_draft_pedido',
  'data_prevista_aprovacao_draft_pedido',
  'data_confirmada_aprovacao_draft_pedido',
  'data_meta_aprovacao_draft_pedido',
  'data_documento_pedido',
  'data_prevista_recebimento_draft_proforma',
  'data_confirmada_recebimento_draft_proforma',
  'data_meta_recebimento_draft_proforma',
  'data_prevista_aprovacao_draft_proforma',
  'data_confirmada_aprovacao_draft_proforma',
  'data_meta_aprovacao_draft_proforma',
  'data_prevista_envio_original_proforma',
  'data_confirmada_envio_original_proforma',
  'data_meta_envio_original_proforma',
  'data_prevista_recebimento_original_proforma',
  'data_confirmada_recebimento_original_proforma',
  'data_meta_recebimento_original_proforma',
  'data_proforma_invoice',
  'data_prevista_recebimento_draft_invoice',
  'data_confirmada_recebimento_draft_invoice',
  'data_meta_recebimento_draft_invoice',
  'data_prevista_aprovacao_draft_invoice',
  'data_confirmada_aprovacao_draft_invoice',
  'data_meta_aprovacao_draft_invoice',
  'data_prevista_envio_original_invoice',
  'data_confirmada_envio_original_invoice',
  'data_meta_envio_original_invoice',
  'data_prevista_recebimento_original_invoice',
  'data_confirmada_recebimento_original_invoice',
  'data_meta_recebimento_original_invoice',
  'data_invoice',
  // Partes (27)
  'pais_exportador',
  'estado_exportador',
  'cidade_exportador',
  'endereco_exportador',
  'zip_code_exportador',
  'exportador_ou_fabricante',
  'relacao_exportador_fabricante',
  'nome_contato_exportador',
  'email_contato_exportador',
  'whatsapp_contato_exportador',
  'cargo_contato_exportador',
  'departamento_contato_exportador',
  'pais_fabricante',
  'estado_fabricante',
  'cidade_fabricante',
  'endereco_fabricante',
  'zip_code_fabricante',
  'cnpj_raiz_empresa_responsavel',
  'codigo_ope',
  'situacao_ope',
  'versao_ope',
  'nome_ope',
  'pais_ope',
  'estado_ope',
  'cidade_ope',
  'endereco_ope',
  'zip_code_ope',
  'tin_ope',
  'email_ope',
  // Anexos (3)
  'anexo_pedido',
  'anexo_proforma',
  'anexo_invoice',
  // Outros (3)
  'cobertura_cambial_pedido',
  'quantidade_volumes_pedido',
  'quantidade_transferida_total',
])

// isPropagavel importado de produto/pedido/shared/columnPropagationConfig.ts

// isAlertavel / getAlertavelKeys importados de produto/pedido/shared/columnAlertConfig.ts

// Campos calculados a partir dos itens — valor do cliente é ignorado; backend recalcula
const CAMPOS_RECALCULAVEIS = new Set([
  'quantidade_pronta_itens_pedido_total',
  'quantidade_total_inicial_pedido',
  'valor_total_pedido',
  'peso_liquido_total_pedido',
  'peso_bruto_total_pedido',
  'cubagem_total_pedido',
  'quantidade_transferida_total',
])

const editarCampoSchema = z.object({
  campo: z.string().min(1),
  valor: z.unknown(),
})

pedidosRouter.patch('/:id_pedido/campo', async (req: Request, res: Response, next: NextFunction) => {
  const result = editarCampoSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: { message: 'Dados invalidos', details: result.error.flatten() } })
  }

  const { campo, valor } = result.data

  if (!CAMPOS_EDITAVEIS.has(campo) && !CAMPOS_RECALCULAVEIS.has(campo)) {
    return next(new AppError(400, `Campo "${campo}" nao pode ser editado inline. Campos permitidos: ${[...CAMPOS_EDITAVEIS, ...CAMPOS_RECALCULAVEIS].join(', ')}`))
  }

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const ctx      = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const tenant_id = ctx.idOrganizacao

      const pedido = await db.pedido.findFirst({
        where: { id: req.params.id_pedido, tenant_id },
      })

      if (!pedido) {
        throw new AppError(404, 'Pedido nao encontrado')
      }

      // Validação de tipo_operacao
      if (campo === 'tipo_operacao' && valor !== 'importacao' && valor !== 'exportacao') {
        throw new AppError(400, 'tipo_operacao deve ser "importacao" ou "exportacao"')
      }

      // Validação de status
      const STATUS_VALIDOS = new Set(['draft', 'aberto', 'em_andamento', 'aprovado', 'transferencia', 'consolidado', 'cancelado'])
      if (campo === 'status' && !STATUS_VALIDOS.has(valor as string)) {
        throw new AppError(400, `status invalido: "${valor}". Valores aceitos: ${[...STATUS_VALIDOS].join(', ')}`)
      }

      // Validação por tipo_operacao para campos de parceiros
      if (campo === 'nome_exportador' && pedido.tipo_operacao === 'exportacao') {
        throw new AppError(400, 'nome_exportador nao pode ser editado em pedidos de exportacao — vem do Configurador')
      }
      if (campo === 'nome_importador' && pedido.tipo_operacao === 'importacao') {
        throw new AppError(400, 'nome_importador nao pode ser editado em pedidos de importacao — vem do Configurador')
      }

      // ── Campos recalculados a partir dos itens (valor do cliente ignorado) ──────
      if (CAMPOS_RECALCULAVEIS.has(campo)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const itens = await db.pedidoItem.findMany({
          where: { id_pedido: req.params.id_pedido, id_organizacao: tenant_id },
        }) as any[]

        const dadosRecalc: Record<string, unknown> = {}

        if (campo === 'quantidade_total_inicial_pedido') {
          const soma = itens.reduce((acc, i) => acc + Number(i.quantidade_inicial_item ?? 0), 0)
          const casas = pedido.casas_decimais_quantidade_pedido ?? 0
          dadosRecalc.quantidade_total_inicial_pedido = parseFloat(soma.toFixed(casas))
        } else if (campo === 'valor_total_pedido') {
          const soma = itens.reduce((acc, i) => acc + Number(i.valor_total_item ?? 0), 0)
          const casas = pedido.casas_decimais_valor_pedido ?? 2
          dadosRecalc.valor_total_pedido = parseFloat(soma.toFixed(casas))
        } else if (campo === 'peso_liquido_total_pedido') {
          const soma = itens.reduce((acc, i) => acc + Number(i.peso_liquido_unitario_item ?? 0), 0)
          const casas = pedido.casas_decimais_peso_pedido ?? 3
          dadosRecalc.peso_liquido_total_pedido = parseFloat(soma.toFixed(casas))
        } else if (campo === 'peso_bruto_total_pedido') {
          const soma = itens.reduce((acc, i) => acc + Number(i.peso_bruto_unitario_item ?? 0), 0)
          const casas = pedido.casas_decimais_peso_pedido ?? 3
          dadosRecalc.peso_bruto_total_pedido = parseFloat(soma.toFixed(casas))
        } else if (campo === 'cubagem_total_pedido') {
          const soma = itens.reduce((acc, i) => acc + Number(i.cubagem_unitaria_item ?? 0), 0)
          const casas = pedido.casas_decimais_cubagem_pedido ?? 4
          dadosRecalc.cubagem_total_pedido = parseFloat(soma.toFixed(casas))
        } else if (campo === 'quantidade_transferida_total') {
          const soma = itens.reduce((acc, i) => acc + Number(i.quantidade_transferida_item ?? 0), 0)
          const casas = pedido.casas_decimais_quantidade_pedido ?? 0
          dadosRecalc.quantidade_transferida_total = parseFloat(soma.toFixed(casas))
        }
        // quantidade_pronta_itens_pedido_total → virtual, sem coluna Prisma, computado em mapPedido

        if (Object.keys(dadosRecalc).length > 0) {
          await db.pedido.update({
            where: { id: req.params.id_pedido },
            data: dadosRecalc,
          })
        }

        const updatedRecalc = await db.pedido.findFirst({
          where: { id: req.params.id_pedido, tenant_id },
          include: { itens_pedido: { orderBy: { sequencia_item_pedido: 'asc' } } },
        })
        return res.json(mapPedido(updatedRecalc))
      }

      // ── Campos editados diretamente no banco ────────────────────────────────────
      // ACL: traduz alias legado (contrato JSON do frontend) → coluna Prisma DDD
      const ALIAS_LEGADO_PARA_PRISMA: Record<string, string> = {
        importacao_exportador_id: 'id_importacao_exportador_pedido',
        exportacao_importador_id: 'id_exportacao_importador_pedido',
        // Sub-onda 7c — datas Draft Pedido (alias prevista/confirmada → previsao/confirmacao DB)
        data_prevista_recebimento_draft_pedido:    'data_previsao_recebimento_draft_pedido',
        data_confirmada_recebimento_draft_pedido:  'data_confirmacao_recebimento_draft_pedido',
        data_prevista_aprovacao_draft_pedido:      'data_previsao_aprovacao_draft_pedido',
        data_confirmada_aprovacao_draft_pedido:    'data_confirmacao_aprovacao_draft_pedido',
        // campos_custom é tratado em branch próprio
      }
      let dadosUpdate: Record<string, unknown>
      if (campo === 'campos_custom') {
        if (typeof valor !== 'object' || valor === null || Array.isArray(valor)) {
          throw new AppError(400, 'campos_custom deve ser um objeto')
        }
        const customAtual = (typeof pedido.dados_extras_importacao_pedido === 'object' && pedido.dados_extras_importacao_pedido !== null)
          ? pedido.dados_extras_importacao_pedido as Record<string, unknown>
          : {}
        dadosUpdate = { dados_extras_importacao_pedido: { ...customAtual, ...(valor as Record<string, unknown>) } }
      } else if (campo === 'nome_exportador' || campo === 'nome_importador' || campo === 'nome_fabricante') {
        // Armazenados em detalhes_operacionais — merge para não perder outros campos
        const detAtual = (typeof pedido.detalhes_operacionais === 'object' && pedido.detalhes_operacionais !== null)
          ? pedido.detalhes_operacionais as Record<string, unknown>
          : {}
        dadosUpdate = { detalhes_operacionais: { ...detAtual, [campo]: valor } }
      } else {
        const colunaPrisma = ALIAS_LEGADO_PARA_PRISMA[campo] ?? campo
        dadosUpdate = { [colunaPrisma]: valor }
      }

      const updated = await db.pedido.update({
        where: { id: req.params.id_pedido },
        data: dadosUpdate,
        include: { itens_pedido: { orderBy: { sequencia_item_pedido: 'asc' } } },
      })

      // Propaga o valor actualizado para todos os itens filhos (atómico, mesma transacção implícita)
      if (isPropagavel(campo)) {
        await db.pedidoItem.updateMany({
          where: { id_pedido: req.params.id_pedido, id_organizacao: tenant_id },
          data: { [campo]: valor === undefined ? null : valor },
        })
      }

      res.json(mapPedido(updated))
    })
  } catch (err) {
    next(err)
  }
})

// ── POST /:id_pedido/duplicar — Duplicar pedido ──────────────────────────────

pedidosRouter.post('/:id_pedido/duplicar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const ctx      = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const tenant_id  = ctx.idOrganizacao
      const company_id = (req.headers['x-id-workspace'] as string | undefined) ?? tenant_id

      const original = await db.pedido.findFirst({
        where: { id: req.params.id_pedido, tenant_id, company_id },
        include: {
          itens_pedido: { orderBy: { sequencia_item: 'asc' } },
          snapshots_empresa: true,
        },
      })

      if (!original) {
        throw new AppError(404, 'Pedido nao encontrado')
      }

      const novoPedidoId = gerarId('pedi')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const itensOriginais = (original.itens_pedido ?? []) as any[]
      // Fase 4: snapshots duplicados carregam o estado CONGELADO do original.
      // Duplicar não é re-emitir — não re-consulta Cadastros.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const snapshotsOriginais = (original.snapshots_empresa_pedido ?? []) as any[]

      const duplicado = await db.pedido.create({
        data: {
          id: novoPedidoId,
          tenant_id,
          company_id,
          tipo_operacao: original.tipo_operacao,
          numero_pedido: `${original.numero_pedido}-COPIA`,
          status: 'draft',
          incoterm: original.incoterm,
          moeda_pedido: original.moeda_pedido,
          valor_total_pedido: original.valor_total_pedido,
          casas_decimais_valor_pedido: original.casas_decimais_valor_pedido,
          quantidade_total_inicial_pedido: original.quantidade_total_inicial_pedido,
          casas_decimais_quantidade_pedido: original.casas_decimais_quantidade_pedido,
          unidade_comercializada_pedido: original.unidade_comercializada_pedido,
          condicao_pagamento: original.condicao_pagamento,
          detalhes_operacionais: original.detalhes_operacionais,
          itens: {
            create: itensOriginais.map((item) => ({
              id: gerarId('pite'),
              tenant_id,
              company_id,
              sequencia_item: item.sequencia_item,
              part_number: item.part_number,
              ncm: item.ncm,
              descricao_item: item.descricao_item,
              quantidade_inicial_pedido: item.quantidade_inicial_pedido,
              quantidade_atual_pedido: item.quantidade_inicial_pedido,
              casas_decimais_quantidade_item: item.casas_decimais_quantidade_item,
              unidade_comercializada_item: item.unidade_comercializada_item,
              moeda_item: item.moeda_item,
              valor_por_unidade_item: item.valor_por_unidade_item,
              valor_total_item: item.valor_total_item,
              casas_decimais_valor_item: item.casas_decimais_valor_item,
              cobertura_cambial: item.cobertura_cambial,
            })),
          },
          snapshots_empresa: snapshotsOriginais.length
            ? {
                create: snapshotsOriginais.map((snap) => ({
                  id_organizacao: snap.id_organizacao,
                  id_workspace: snap.id_workspace,
                  papel: snap.papel,
                  suid_empresa: snap.suid_empresa,
                  nome_empresa: snap.nome_empresa,
                  nome_fantasia: snap.nome_fantasia,
                  documento_principal: snap.documento_principal,
                  tipo_documento: snap.tipo_documento,
                  cnpj_raiz: snap.cnpj_raiz,
                  endereco_logradouro: snap.endereco_logradouro,
                  endereco_numero: snap.endereco_numero,
                  endereco_complemento: snap.endereco_complemento,
                  endereco_bairro: snap.endereco_bairro,
                  endereco_cidade: snap.endereco_cidade,
                  endereco_uf: snap.endereco_uf,
                  endereco_cep: snap.endereco_cep,
                  endereco_pais: snap.endereco_pais,
                  contato_nome: snap.contato_nome,
                  contato_email: snap.contato_email,
                  contato_whatsapp: snap.contato_whatsapp,
                  contato_cargo: snap.contato_cargo,
                  contato_departamento: snap.contato_departamento,
                  exportador_e_fabricante: snap.exportador_e_fabricante,
                  relacao_exportador_fabricante: snap.relacao_exportador_fabricante,
                  motivo_congelamento: snap.motivo_congelamento,
                })),
              }
            : undefined,
        },
        include: {
          itens_pedido: { orderBy: { sequencia_item_pedido: 'asc' } },
          snapshots_empresa: true,
        },
      })

      res.status(201).json(mapPedido(duplicado))
    })
  } catch (err) {
    next(err)
  }
})

// ── POST /:id/itens — Adicionar item ──────────────────────────────────────────

pedidosRouter.post('/:id/itens', async (req: Request, res: Response, next: NextFunction) => {
  const result = criarItemSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: { message: 'Dados invalidos', details: result.error.flatten() } })
  }

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const ctx      = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const tenant_id  = ctx.idOrganizacao
      const company_id = (req.headers['x-id-workspace'] as string | undefined) ?? tenant_id

      const pedido = await db.pedido.findFirst({
        where: { id: req.params.id, tenant_id, company_id },
      })

      if (!pedido) {
        throw new AppError(404, 'Pedido nao encontrado')
      }

      if (!['draft', 'aberto'].includes(pedido.status)) {
        throw new AppError(400, 'Itens so podem ser adicionados em pedidos Draft ou Aberto')
      }

      const itemCount = await db.pedidoItem.count({
        where: { id_pedido: req.params.id, id_organizacao: tenant_id, id_workspace: company_id },
      })

      // Traduz chaves do schema público (criarItemSchema) para nomes DDD Prisma
      const itemData: Record<string, unknown> = {
        id_item: gerarId('pite'),
        id_organizacao: tenant_id,
        id_workspace:   company_id,
        id_pedido:      req.params.id,
        sequencia_item_pedido: result.data.sequencia_item ?? (itemCount + 1),
        part_number_item:                 result.data.part_number,
        ncm_item:                         result.data.ncm,
        descricao_item:              result.data.descricao_item,
        unidade_comercializada_item: result.data.unidade_comercializada_item,
        quantidade_inicial_item:   result.data.quantidade_inicial_pedido,
        quantidade_atual_item:     result.data.quantidade_inicial_pedido,
        quantidade_pronta_item:      0,
        quantidade_transferida_item: 0,
        quantidade_cancelada_item:   0,
        casas_decimais_quantidade_item: result.data.casas_decimais_quantidade_item,
        moeda_item:                     result.data.moeda_item,
        valor_por_unidade_item:         result.data.valor_por_unidade_item,
        valor_total_item:               result.data.valor_total_item ?? (result.data.valor_por_unidade_item ?? 0) * result.data.quantidade_inicial_pedido,
        casas_decimais_valor_item:      result.data.casas_decimais_valor_item,
      }
      const item = await db.pedidoItem.create({ data: itemData })

      res.status(201).json(mapItem(item))
    })
  } catch (err) {
    next(err)
  }
})

// ── ACL: chaves do contrato público (JSON API) → colunas DDD do PedidoItem ───
// Mapeia apenas campos editáveis via API (ver atualizarItemSchema e
// CAMPOS_EDITAVEIS_ITEM/CAMPOS_EDITAVEIS_ITEM_NUMERICOS). Chaves ausentes aqui
// são ignoradas no update (pass-through não suportado após rename DDD).
const publicToDddItem: Record<string, string> = {
  part_number:                 'part_number_item',
  ncm:                         'ncm_item',
  descricao_item:              'descricao_item',
  unidade_comercializada_item: 'unidade_comercializada_item',
  moeda_item:                  'moeda_item',
  valor_por_unidade_item:      'valor_por_unidade_item',
  valor_total_item:            'valor_total_item',
  quantidade_inicial_pedido:   'quantidade_inicial_item',
  quantidade_atual_pedido:     'quantidade_atual_item',
  cobertura_cambial:           'cobertura_cambial_item',
  nome_exportador:             'nome_exportador_item',
  nome_importador:             'nome_importador_item',
  nome_fabricante:             'nome_fabricante_item',
  referencia_importador:       'referencia_importador_item',
  referencia_exportador:       'referencia_exportador_item',
  referencia_fabricante:       'referencia_fabricante_item',
  incoterm:                    'incoterm_item',
  condicao_pagamento:          'condicao_pagamento_item',
  data_emissao_pedido:         'data_emissao_item',
  peso_liquido_unitario:       'peso_liquido_unitario_item',
  peso_bruto_unitario:         'peso_bruto_unitario_item',
  cubagem_unitaria:            'cubagem_unitaria_item',
}

// ── PUT /:id/itens/:itemId — Atualizar item ──────────────────────────────────

pedidosRouter.put('/:id/itens/:itemId', async (req: Request, res: Response, next: NextFunction) => {
  const result = atualizarItemSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: { message: 'Dados invalidos', details: result.error.flatten() } })
  }

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const ctx      = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const tenant_id = ctx.idOrganizacao

      const item = await db.pedidoItem.findFirst({
        where: { id_item: req.params.itemId, id_pedido: req.params.id, id_organizacao: tenant_id },
      })

      if (!item) {
        throw new AppError(404, 'Item do pedido nao encontrado')
      }

      // ACL: traduz chaves do contrato público (atualizarItemSchema) para nomes DDD Prisma
      const prismaData: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(result.data)) {
        const dddKey = publicToDddItem[k]
        if (dddKey) prismaData[dddKey] = v
      }

      if (result.data.quantidade_inicial_pedido !== undefined) {
        // Recalcular saldo: inicial - transferida - cancelada (nunca negativo)
        const novoAtual = result.data.quantidade_inicial_pedido
          - Number(item.quantidade_transferida_item)
          - Number(item.quantidade_cancelada_item)
        prismaData.quantidade_atual_item = Math.max(0, novoAtual)
      }

      const updated = await db.pedidoItem.update({
        where: { id_item: req.params.itemId },
        data: prismaData,
      })

      res.json(mapItem(updated))
    })
  } catch (err) {
    next(err)
  }
})

// ── PATCH /:id/itens/:itemId/campo — Editar campo único do item ───────────────

// Campos texto/enum editáveis inline
const CAMPOS_EDITAVEIS_ITEM = new Set([
  'tipo_operacao',
  'nome_exportador', 'nome_importador', 'nome_fabricante',
  'referencia_importador', 'referencia_exportador', 'referencia_fabricante',
  'cobertura_cambial', 'ncm', 'descricao_item', 'part_number',
  'incoterm', 'condicao_pagamento', 'data_emissao_pedido',
  'numero_proforma', 'numero_invoice', 'data_consolidacao_pedido',
  // Datas (43)
  'data_prevista_pedido_pronto',
  'data_confirmada_pedido_pronto',
  'data_meta_pedido_pronto',
  'data_prevista_inspecao_pedido',
  'data_confirmada_inspecao_pedido',
  'data_meta_inspecao_pedido',
  'data_prevista_coleta_pedido',
  'data_confirmada_coleta_pedido',
  'data_meta_coleta_pedido',
  'data_transferencia_saldo_pedido',
  'data_prevista_recebimento_draft_pedido',
  'data_confirmada_recebimento_draft_pedido',
  'data_meta_recebimento_draft_pedido',
  'data_prevista_aprovacao_draft_pedido',
  'data_confirmada_aprovacao_draft_pedido',
  'data_meta_aprovacao_draft_pedido',
  'data_documento_pedido',
  'data_prevista_recebimento_draft_proforma',
  'data_confirmada_recebimento_draft_proforma',
  'data_meta_recebimento_draft_proforma',
  'data_prevista_aprovacao_draft_proforma',
  'data_confirmada_aprovacao_draft_proforma',
  'data_meta_aprovacao_draft_proforma',
  'data_prevista_envio_original_proforma',
  'data_confirmada_envio_original_proforma',
  'data_meta_envio_original_proforma',
  'data_prevista_recebimento_original_proforma',
  'data_confirmada_recebimento_original_proforma',
  'data_meta_recebimento_original_proforma',
  'data_proforma_invoice',
  'data_prevista_recebimento_draft_invoice',
  'data_confirmada_recebimento_draft_invoice',
  'data_meta_recebimento_draft_invoice',
  'data_prevista_aprovacao_draft_invoice',
  'data_confirmada_aprovacao_draft_invoice',
  'data_meta_aprovacao_draft_invoice',
  'data_prevista_envio_original_invoice',
  'data_confirmada_envio_original_invoice',
  'data_meta_envio_original_invoice',
  'data_prevista_recebimento_original_invoice',
  'data_confirmada_recebimento_original_invoice',
  'data_meta_recebimento_original_invoice',
  'data_invoice',
  // Partes (27)
  'pais_exportador',
  'estado_exportador',
  'cidade_exportador',
  'endereco_exportador',
  'zip_code_exportador',
  'exportador_ou_fabricante',
  'relacao_exportador_fabricante',
  'nome_contato_exportador',
  'email_contato_exportador',
  'whatsapp_contato_exportador',
  'cargo_contato_exportador',
  'departamento_contato_exportador',
  'pais_fabricante',
  'estado_fabricante',
  'cidade_fabricante',
  'endereco_fabricante',
  'zip_code_fabricante',
  'cnpj_raiz_empresa_responsavel',
  'codigo_ope',
  'situacao_ope',
  'versao_ope',
  'nome_ope',
  'pais_ope',
  'estado_ope',
  'cidade_ope',
  'endereco_ope',
  'zip_code_ope',
  'tin_ope',
  'email_ope',
  // Anexos (3)
  'anexo_pedido',
  'anexo_proforma',
  'anexo_invoice',
  // Outros (2)
  'cobertura_cambial_pedido',
  'quantidade_volumes_pedido',
])

// Campos numéricos editáveis inline que disparam cascata:
//   quantidade_inicial_pedido  → recalcula quantidade_atual_pedido (via fórmula do config) + valor_total_item
//   valor_por_unidade_item             → recalcula valor_total_item (unit × A)
const CAMPOS_EDITAVEIS_ITEM_NUMERICOS = new Set([
  'quantidade_inicial_pedido',
  'valor_por_unidade_item',
])

pedidosRouter.patch('/:id/itens/:itemId/campo', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { campo, valor } = req.body as { campo: string; valor: unknown }
    const ehTexto   = CAMPOS_EDITAVEIS_ITEM.has(campo)
    const ehNumero  = CAMPOS_EDITAVEIS_ITEM_NUMERICOS.has(campo)
    if (!campo || (!ehTexto && !ehNumero)) {
      throw new AppError(400, `Campo "${campo}" nao pode ser editado inline em item`)
    }
    if (campo === 'tipo_operacao' && valor !== 'importacao' && valor !== 'exportacao') {
      throw new AppError(400, 'tipo_operacao deve ser "importacao" ou "exportacao"')
    }
    // Validação dos campos numéricos com cascata
    let valorNumerico: number | null = null
    if (ehNumero) {
      if (typeof valor !== 'number' || !Number.isFinite(valor) || valor < 0) {
        throw new AppError(400, `Campo "${campo}" deve ser um numero finito maior ou igual a zero`)
      }
      valorNumerico = valor
    }

    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const ctx      = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const tenant_id = ctx.idOrganizacao

      const item = await db.pedidoItem.findFirst({
        where: { id_item: req.params.itemId, id_pedido: req.params.id, id_organizacao: tenant_id },
      })
      if (!item) throw new AppError(404, 'Item do pedido nao encontrado')

      // ACL: traduz chave pública → coluna DDD. Campos pedido-level (tipo_operacao,
      // datas, ope_*, etc.) que estão em CAMPOS_EDITAVEIS_ITEM não pertencem ao
      // PedidoItem e nunca foram aplicáveis a este endpoint — pass-through era
      // rejeitado pelo Prisma antes do rename e continua inválido agora.
      const campoDdd = publicToDddItem[campo] ?? campo

      // ── Campos texto/enum — update simples ────────────────────────────────────
      if (ehTexto) {
        const updated = await db.pedidoItem.update({
          where: { id_item: req.params.itemId },
          data: { [campoDdd]: valor === undefined ? null : valor },
        })
        return res.json(mapItem(updated))
      }

      // ── Campos numéricos — update + cascata lendo config ──────────────────────
      // Fonte de verdade: tela /configuracoes do produto Pedido.
      //
      // Passo 1: lê a fórmula do saldo do workspace (PedidoSaldoFormula).
      //          Se ainda não configurado, usa SALDO_FORMULA_PADRAO.
      // Passo 2: lê as casas decimais do workspace (PedidoCasasDecimais)
      //          para arredondar valor_total_item com a precisão configurada.
      // Passo 3: constrói o contexto do item com os valores pós-edição e
      //          avalia a fórmula via formulaEngine (avaliarFormula).
      // Passo 4: valida invariante (não permitir saldo negativo) e grava.
      //
      // Importante: o evaluator do backend é port do client — ambos devem
      // produzir os mesmos resultados para a mesma fórmula e contexto.
      const [saldoCfg, casasCfg] = await Promise.all([
        db.pedidoSaldoFormulaConfig.findUnique({ where: { id_organizacao: tenant_id } }),
        db.pedidoCasasDecimaisConfig.findUnique({ where: { tenant_id } }),
      ])

      const formulaExpressao: string = saldoCfg?.formula_expressao_pedido_saldo_formula ?? SALDO_FORMULA_PADRAO
      const casasValor: number       = Number(casasCfg?.valor_total_pedido ?? 2)

      let formulaAST
      try {
        formulaAST = parsearFormula(formulaExpressao)
      } catch (e) {
        // Se a fórmula salva está inválida (improvável — PUT valida),
        // cai para o default para não travar a edição.
        console.error('[pedido PATCH item] formula salva invalida, usando default:', e)
        formulaAST = parsearFormula(SALDO_FORMULA_PADRAO)
      }

      const A_novo = campo === 'quantidade_inicial_pedido'
        ? (valorNumerico ?? 0)
        : Number(item.quantidade_inicial_item ?? 0)
      const C = Number(item.quantidade_cancelada_item ?? 0)
      const D = Number(item.quantidade_transferida_item ?? 0)
      const unit_novo = campo === 'valor_por_unidade_item'
        ? (valorNumerico ?? 0)
        : Number(item.valor_por_unidade_item ?? 0)

      // Constrói o contexto do item pós-edição para avaliar a fórmula.
      // O contexto usa os tokens pedido-level (quantidade_total_inicial_pedido etc.)
      // e mapeia para os valores do item via TOKEN_PEDIDO_PARA_ITEM no buildContextoItem.
      // O campo editado é passado pela chave DDD para alinhar com a leitura do item.
      const itemPosEdicao = {
        ...item,
        [campoDdd]: valorNumerico,
      }
      const contexto = buildContextoItem(itemPosEdicao as Record<string, unknown>)

      const { valor: saldo_avaliado } = avaliarFormula(formulaAST, contexto)
      const saldo_novo = Math.max(0, saldo_avaliado)

      // Invariante: editar quantidade inicial não pode deixar o saldo negativo.
      // (pelo menos com a fórmula padrão — se a fórmula custom aceita negativos,
      //  a proteção ainda aplica para manter consistência visual.)
      if (campo === 'quantidade_inicial_pedido' && saldo_avaliado < 0) {
        throw new AppError(
          400,
          `quantidade_inicial_pedido (${A_novo}) resulta em saldo negativo ` +
          `(${saldo_avaliado.toFixed(2)}) pela formula configurada. ` +
          `Ja efetivado: cancelada=${C}, transferida=${D}.`,
        )
      }

      // valor_total_item usa as casas decimais configuradas
      const fator = Math.pow(10, casasValor)
      const valor_total_novo = Math.round(unit_novo * A_novo * fator) / fator

      const updated = await db.pedidoItem.update({
        where: { id_item: req.params.itemId },
        data: {
          [campoDdd]:                          valorNumerico,
          quantidade_atual_item: saldo_novo,
          valor_total_item:        valor_total_novo,
        },
      })
      return res.json(mapItem(updated))
    })
  } catch (err) {
    next(err)
  }
})

// ── DELETE /:id/itens/:itemId — Remover item ──────────────────────────────────

pedidosRouter.delete('/:id/itens/:itemId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const ctx      = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const tenant_id = ctx.idOrganizacao

      const item = await db.pedidoItem.findFirst({
        where: { id_item: req.params.itemId, id_pedido: req.params.id, id_organizacao: tenant_id },
      })

      if (!item) {
        throw new AppError(404, 'Item do pedido nao encontrado')
      }

      if (Number(item.quantidade_transferida_item) > 0) {
        throw new AppError(400, 'Item com quantidade transferida nao pode ser removido')
      }

      await db.pedidoItem.delete({ where: { id_item: req.params.itemId } })
      res.status(204).send()
    })
  } catch (err) {
    next(err)
  }
})

// ── PATCH /:id/itens/:itemId/cancelar — Cancelar quantidade ───────────────────

pedidosRouter.patch('/:id/itens/:itemId/cancelar', async (req: Request, res: Response, next: NextFunction) => {
  const result = cancelarQuantidadeSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: { message: 'Dados invalidos', details: result.error.flatten() } })
  }

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const ctx      = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const tenant_id  = ctx.idOrganizacao
      const company_id = (req.headers['x-id-workspace'] as string | undefined) ?? tenant_id

      const saldo = await saldoEngine.cancelar(db, {
        pedido_item_id: req.params.itemId,
        quantidade: result.data.quantidade,
        tenant_id,
        company_id,
      })

      res.json(mapItem(saldo as unknown as PedidoItemRaw))
    })
  } catch (err) {
    next(err)
  }
})

// ── PATCH /:id/itens/:itemId/pronta — Atualizar quantidade pronta ─────────────

pedidosRouter.patch('/:id/itens/:itemId/pronta', async (req: Request, res: Response, next: NextFunction) => {
  const result = atualizarProntaSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: { message: 'Dados invalidos', details: result.error.flatten() } })
  }

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const ctx      = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const tenant_id  = ctx.idOrganizacao
      const company_id = (req.headers['x-id-workspace'] as string | undefined) ?? tenant_id

      const saldo = await saldoEngine.atualizarPronta(db, {
        pedido_item_id: req.params.itemId,
        quantidade_pronta: result.data.quantidade_pronta_pedido,
        tenant_id,
        company_id,
      })

      res.json(mapItem(saldo as unknown as PedidoItemRaw))
    })
  } catch (err) {
    next(err)
  }
})
