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
import { withOrganizacao, type ContextoOrganizacao, obterWorkspacesHabilitadosDoUsuario } from '@gravity/resolver-organizacao'
import { saldoPedido, AppError } from '../services/saldo-pedido.js'
import {
  parsearFormula,
  avaliarFormula,
  buildContextoItem,
  SALDO_FORMULA_PADRAO,
} from '../services/formulaEngine.js'
import {
  isPropagavel,
  obterCampoItemPropagado,
  obterCampoItemComLegado,
  construirCamposPropagadosParaItem,
  derivarNomesEmpresaParaItem,
} from '../../../pedido/shared/mapaPropagacaoPedidoItem.js'
import {
  buscarEmpresasPorSuids,
  buscarMoedaPorCodigo,
  buscarNcmPorCodigo,
  buscarOpePorSuid,
  buscarUnidadePorCodigo,
  type CadastrosRequestContext,
} from '../services/cadastrosClient.js'
import { validarUnidadesItem } from '../services/validarUnidadesItem.js'
import { validarIncotermPedidoItem } from '../services/validarIncotermPedidoItem.js'
import { validarLogisticaPedidoCampo } from '../services/validarLogisticaPedidoCampo.js'
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
import {
  recalcularAgregadosPedido,
  campoItemAfetaAgregado,
} from '../services/recalcularAgregadosPedido.js'
import { LIMITE_ABSOLUTO_DECIMAL_18_6 } from '../services/decimalPedido.js'
// FASE 06E (Frente 1, completa): OPE agora vem via `suid_ope` no payload.
// montarSnapshotOpe é plugado no fluxo POST quando suid_ope está presente.
// SnapshotOpeData usado no array de snapshots tipados.
import { randomUUID } from 'node:crypto'

export const pedidosRouter = Router()

// ── Schemas Zod ───────────────────────────────────────────────────────────────

// Schemas Zod — Mandamento 03: nomenclatura DDD pura. Nomes legados
// (tenant_id, company_id, tipo_operacao, status, incoterm, etc.) NÃO são
// mais aceitos. Front, smart import e tests precisam enviar DDD.
//
// IMPORTANTE — campos que propagam do Pedido (ver mapaPropagacaoPedidoItem.ts)
// são `.optional()` SEM `.default()`: defaults aqui invalidariam a propagação.
// A precedência aplicada no create é: item-explicit > pedido-herdado > default técnico.
const criarItemSchema = z.object({
  part_number_item:               z.string().optional().nullable().default(''),
  ncm_item:                       z.string().optional().nullable().default(''),
  descricao_item:                 z.string().optional().nullable().default(''),
  quantidade_inicial_item:        z.number().min(0).max(LIMITE_ABSOLUTO_DECIMAL_18_6).optional().default(0),
  unidade_comercializada_item:    z.string().optional().nullable(),
  moeda_item:                     z.string().optional(),  // propagado de moeda_pedido se ausente
  valor_por_unidade_item:         z.number().min(0).max(LIMITE_ABSOLUTO_DECIMAL_18_6).optional().nullable(),
  valor_total_item:               z.number().min(0).max(LIMITE_ABSOLUTO_DECIMAL_18_6).optional().nullable(),
  casas_decimais_quantidade_item: z.number().int().optional(),  // propagado de casas_decimais_quantidade_pedido se ausente
  casas_decimais_valor_item:      z.number().int().optional(),  // propagado de casas_decimais_valor_pedido se ausente
  sequencia_item_pedido:          z.number().int().optional().nullable(),
})

const criarPedidoObjectSchema = z.object({
  tipo_operacao_pedido:             z.enum(['importacao', 'exportacao']),
  numero_pedido:                    z.string().min(1).max(100),
  // SUIDs referenciam Empresas no serviço Cadastros — gravam PedidoSnapshotEmpresa.
  // Os campos *_id legados não são mais aceitos; snapshots são a fonte da verdade.
  suid_importador:                  z.string().min(1).optional().nullable(),
  suid_exportador:                  z.string().min(1).optional().nullable(),
  suid_fabricante:                  z.string().min(1).optional().nullable(),
  suid_ope:                         z.string().min(1).optional().nullable(),
  numero_proforma_pedido:           z.string().optional().nullable(),
  numero_invoice_pedido:            z.string().optional().nullable(),
  referencia_importador_pedido:     z.string().optional().nullable(),
  referencia_exportador_pedido:     z.string().optional().nullable(),
  referencia_fabricante_pedido:     z.string().optional().nullable(),
  incoterm_pedido:                  z.string().optional().nullable(),
  moeda_pedido:                     z.string().default('USD'),
  // valor_total_pedido e quantidade_total_pedido REMOVIDOS do contrato — são
  // agregados derivados dos itens, calculados server-side por
  // `recalcularAgregadosPedido`. Cliente que tentar enviar recebe Zod error.
  // Idem para os 3 agregados peso/cubagem (que já não estavam no schema).
  // Mandamento 09: schema reflete contrato real.
  casas_decimais_valor_pedido:      z.number().int().default(2),
  casas_decimais_quantidade_pedido: z.number().int().default(2),
  unidade_comercializada_pedido:    z.string().optional().nullable(),
  condicao_pagamento_pedido:        z.string().optional().nullable(),
  data_emissao_pedido:              z.string().datetime().optional(),
  detalhes_operacionais_pedido:     z.any().optional().nullable(),
  itens:                            z.array(criarItemSchema).optional().default([]),
  /** Quando true, autoriza criar pedido mesmo com numero_pedido já existente na org. */
  confirmar_numero_duplicado:       z.boolean().optional(),
})

/**
 * Regra cross-field Fase 4 + Regra empresa-da-org (lado-da-organização):
 *   - importacao → exige suid_importador (empresa-da-org) E suid_exportador
 *     (contraparte estrangeira). Os dois SUIDs devem ser DIFERENTES.
 *   - exportacao → exige suid_exportador (empresa-da-org) E suid_importador
 *     (contraparte). Idem.
 *   - suid_fabricante permanece opcional nos dois tipos.
 *
 * O frontend (ModalPedidoNovo) preenche o lado-da-org automaticamente via
 * cadastrosApi.obterEmpresaDaOrganizacao(); aqui apenas garantimos que o
 * payload chega consistente — Mand. 08 (sem fallback silencioso).
 */
export const criarPedidoSchema = criarPedidoObjectSchema.superRefine((data, ctx) => {
  // Importação exige AMBOS os lados (org=importador, contraparte=exportador)
  if (data.tipo_operacao_pedido === 'importacao') {
    if (!data.suid_importador) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['suid_importador'],
        message: 'suid_importador (empresa-da-org) e obrigatorio quando tipo_operacao_pedido = importacao',
      })
    }
    if (!data.suid_exportador) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['suid_exportador'],
        message: 'suid_exportador e obrigatorio quando tipo_operacao_pedido = importacao',
      })
    }
  }

  // Exportação exige AMBOS os lados (org=exportador, contraparte=importador)
  if (data.tipo_operacao_pedido === 'exportacao') {
    if (!data.suid_exportador) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['suid_exportador'],
        message: 'suid_exportador (empresa-da-org) e obrigatorio quando tipo_operacao_pedido = exportacao',
      })
    }
    if (!data.suid_importador) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['suid_importador'],
        message: 'suid_importador e obrigatorio quando tipo_operacao_pedido = exportacao',
      })
    }
  }

  // Auto-referência: a mesma empresa nao pode ser importador E exportador no mesmo pedido
  if (
    data.suid_importador &&
    data.suid_exportador &&
    data.suid_importador === data.suid_exportador
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['suid_exportador'],
      message: 'suid_importador e suid_exportador devem ser empresas diferentes',
    })
  }
})

// `.strict()` — Mandamento 09 (contrato bilateral): rejeita campos não declarados.
// Em especial bloqueia `_colunas_usuario` em PUT genérico — valores de colunas
// personalizadas são gravados via rota dedicada `POST /colunas-usuario/valores`,
// nunca pelo PUT do Pedido. Sem o `.strict()`, payload com `_colunas_usuario`
// passava silenciosamente e era descartado, dando ilusão de sucesso (bug 2026-05-13).
export const atualizarPedidoSchema = criarPedidoObjectSchema.partial().omit({ itens: true }).strict()

export const atualizarItemSchema = z.object({
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
  // Dados físicos unitários — sigla validada cruzada com cadastros.unidade
  // (categoria=peso para peso_*; categorias=comprimento|area|volume para cubagem).
  // Validação cruzada com Cadastros é feita em runtime no handler (validarUnidades).
  peso_liquido_unitario:     z.number().optional().nullable(),
  peso_liquido_unidade_item: z.string().min(1).max(8).optional().nullable(),
  peso_bruto_unitario:       z.number().optional().nullable(),
  peso_bruto_unidade_item:   z.string().min(1).max(8).optional().nullable(),
  cubagem_unitaria:          z.number().optional().nullable(),
  cubagem_unidade_item:      z.string().min(1).max(8).optional().nullable(),
}).strict() // Mand. 09 — bloqueia `_colunas_usuario` no PUT (rota dedicada cuida).

const cancelarQuantidadeSchema = z.object({
  quantidade: z.number().positive(),
})

const atualizarProntaSchema = z.object({
  quantidade_pronta_pedido: z.number().min(0),
})

const statusTransicaoSchema = z.object({
  status: z.string().min(1).max(100).regex(/^[a-z0-9_]+$/, 'Nome de status inválido'),
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

// Mapa pré-construído: chave frontend pai → coluna DDD do item.
// Usado por mapItem (output) e publicToDddItem (PATCH). obterCampoItemComLegado
// resolve prevista→previsao, confirmada→confirmacao, proforma→proforma_pedido, etc.
const DATAS_FRONT_PARA_ITEM: ReadonlyArray<[string, string]> = ([
  'data_prevista_pedido_pronto', 'data_confirmada_pedido_pronto', 'data_meta_pedido_pronto',
  'data_prevista_inspecao_pedido', 'data_confirmada_inspecao_pedido', 'data_meta_inspecao_pedido',
  'data_prevista_coleta_pedido', 'data_confirmada_coleta_pedido', 'data_meta_coleta_pedido',
  'data_consolidacao_pedido', 'data_transferencia_saldo_pedido',
  'data_prevista_recebimento_rascunho_pedido', 'data_confirmada_recebimento_rascunho_pedido', 'data_meta_recebimento_rascunho_pedido',
  'data_prevista_aprovacao_rascunho_pedido', 'data_confirmada_aprovacao_rascunho_pedido', 'data_meta_aprovacao_rascunho_pedido',
  'data_documento_pedido',
  'data_prevista_recebimento_rascunho_proforma', 'data_confirmada_recebimento_rascunho_proforma', 'data_meta_recebimento_rascunho_proforma',
  'data_prevista_aprovacao_rascunho_proforma', 'data_confirmada_aprovacao_rascunho_proforma', 'data_meta_aprovacao_rascunho_proforma',
  'data_prevista_envio_original_proforma', 'data_confirmada_envio_original_proforma', 'data_meta_envio_original_proforma',
  'data_prevista_recebimento_original_proforma', 'data_confirmada_recebimento_original_proforma', 'data_meta_recebimento_original_proforma',
  'data_proforma_invoice',
  'data_prevista_recebimento_rascunho_invoice', 'data_confirmada_recebimento_rascunho_invoice', 'data_meta_recebimento_rascunho_invoice',
  'data_prevista_aprovacao_rascunho_invoice', 'data_confirmada_aprovacao_rascunho_invoice', 'data_meta_aprovacao_rascunho_invoice',
  'data_prevista_envio_original_invoice', 'data_confirmada_envio_original_invoice', 'data_meta_envio_original_invoice',
  'data_prevista_recebimento_original_invoice', 'data_confirmada_recebimento_original_invoice', 'data_meta_recebimento_original_invoice',
  'data_invoice',
] as string[]).map(fk => [fk, obterCampoItemComLegado(fk)] as [string, string | null]).filter((x): x is [string, string] => x[1] != null)

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
    tipo_operacao_item:          item.tipo_operacao_item,
    tipo_operacao:               item.tipo_operacao_item,
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
    data_embarque_item:        normDate(item.data_embarque_item),

    // Decimal → number (dados físicos unitários) + unidade
    // Unidades vêm de cadastros.unidade (SSOT). Front lê via
    // row.peso_liquido_unidade_item, row.peso_bruto_unidade_item,
    // row.cubagem_unidade_item — usados pelo dropdown e badge.
    peso_liquido_unitario:     num(item.peso_liquido_unitario_item, null),
    peso_liquido_unidade_item: item.peso_liquido_unidade_item ?? 'KG',
    peso_bruto_unitario:       num(item.peso_bruto_unitario_item, null),
    peso_bruto_unidade_item:   item.peso_bruto_unidade_item ?? 'KG',
    cubagem_unitaria:          num(item.cubagem_unitaria_item, null),
    cubagem_unidade_item:      item.cubagem_unidade_item ?? 'M3',

    casas_decimais_peso_item:    item.casas_decimais_peso_item,
    casas_decimais_cubagem_item: item.casas_decimais_cubagem_item,
    campos_custom:               item.dados_extras_importacao_item,
    created_at:                  item.data_criacao_item,
    updated_at:                  item.data_atualizacao_item,

    // Pass-through das colunas personalizadas. Quando o caller injetou via
    // `injetarValoresColunasUsuario(..., { vinculo: 'item' })` antes de chamar
    // `mapItem`, esse campo carrega os valores; senão, fica `{}`. Mand. 09.
    _colunas_usuario: (item as Record<string, unknown>)._colunas_usuario ?? {},

    ...Object.fromEntries(
      DATAS_FRONT_PARA_ITEM.map(([frontKey, itemField]) => [frontKey, normDate(item[itemField])])
    ),
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
function normDate(v: unknown): string | null {
  if (v == null) return null
  if (v instanceof Date) return v.toISOString()
  const s = String(v)
  return s === '' ? null : s
}

export function mapPedido(pedido: PedidoRaw | null | undefined): PedidoRaw | null | undefined {
  if (!pedido) return pedido
  const rawItens = pedido.itens_pedido as PedidoItemRaw[] | undefined
  const itens = Array.isArray(rawItens) ? rawItens.map(mapItem) : rawItens
  const det = (pedido.detalhes_operacionais_pedido as Record<string, unknown> | null)
    ?? (pedido.detalhes_operacionais as Record<string, unknown> | null)
    ?? {}

  // Nomes das contrapartes vêm dos snapshots (Fase 4 DDD: SUID + snapshot em vez
  // de FK direto). Front lê `row.nome_importador/exportador/fabricante` nas
  // colunas da lista (ColunasPai.tsx), então surfaceamos esses 3 nomes aqui.
  const snaps = (pedido.snapshots_empresa_pedido as Array<{ papel: string; nome_empresa: string }> | undefined) ?? []
  const findNome = (papel: 'importador' | 'exportador' | 'fabricante'): string | null => {
    const s = snaps.find((x) => x.papel === papel)
    return s?.nome_empresa ?? null
  }

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
    valor_total_cambio_pedido:  pedido.valor_total_cambio_pedido  ?? null,
    moeda_cambio_pedido:        pedido.moeda_cambio_pedido        ?? null,
    contrato_cambio_id_pedido:  pedido.contrato_cambio_id_pedido  ?? null,
    detalhes_operacionais:    pedido.detalhes_operacionais_pedido ?? pedido.detalhes_operacionais,
    campos_custom:            pedido.dados_extras_importacao_pedido ?? pedido.campos_custom_pedido         ?? pedido.campos_custom,
    pedidos_origem_id:        pedido.ids_origem_consolidacao_pedido ?? pedido.id_pedidos_origem            ?? pedido.pedidos_origem_id,
    cnpj_importador:          pedido.cnpj_importador_pedido       ?? pedido.cnpj_importador,
    deleted_at:               pedido.data_exclusao_pedido         ?? pedido.deleted_at,
    created_at:               pedido.data_criacao_pedido          ?? pedido.created_at,
    updated_at:               pedido.data_atualizacao_pedido      ?? pedido.updated_at,
    data_documento_proforma:  normDate(pedido.data_documento_proforma_pedido ?? pedido.data_documento_proforma),
    data_documento_invoice:   normDate(pedido.data_documento_invoice_pedido  ?? pedido.data_documento_invoice),
    data_emissao_pedido:           normDate(pedido.data_emissao_pedido),
    data_prevista_pedido_pronto:   normDate(pedido.data_prevista_pedido_pronto),
    data_confirmada_pedido_pronto: normDate(pedido.data_confirmada_pedido_pronto),
    data_meta_pedido_pronto:       normDate(pedido.data_meta_pedido_pronto),
    data_prevista_inspecao_pedido:  normDate(pedido.data_prevista_inspecao_pedido),
    data_confirmada_inspecao_pedido: normDate(pedido.data_confirmada_inspecao_pedido),
    data_meta_inspecao_pedido:     normDate(pedido.data_meta_inspecao_pedido),
    data_prevista_coleta_pedido:   normDate(pedido.data_prevista_coleta_pedido),
    data_confirmada_coleta_pedido: normDate(pedido.data_confirmada_coleta_pedido),
    data_meta_coleta_pedido:       normDate(pedido.data_meta_coleta_pedido),
    data_consolidacao_pedido:      normDate(pedido.data_consolidacao_pedido),
    data_transferencia_saldo_pedido: normDate(pedido.data_transferencia_saldo_pedido),
    // Rascunho Pedido — frontend usa prevista/confirmada, Prisma usa previsao/confirmacao
    data_prevista_recebimento_rascunho_pedido:   normDate(pedido.data_previsao_recebimento_rascunho_pedido),
    data_confirmada_recebimento_rascunho_pedido: normDate(pedido.data_confirmacao_recebimento_rascunho_pedido),
    data_meta_recebimento_rascunho_pedido:       normDate(pedido.data_meta_recebimento_rascunho_pedido),
    data_prevista_aprovacao_rascunho_pedido:     normDate(pedido.data_previsao_aprovacao_rascunho_pedido),
    data_confirmada_aprovacao_rascunho_pedido:   normDate(pedido.data_confirmacao_aprovacao_rascunho_pedido),
    data_meta_aprovacao_rascunho_pedido:         normDate(pedido.data_meta_aprovacao_rascunho_pedido),
    data_documento_pedido:                       normDate(pedido.data_documento_pedido),
    // Proforma
    data_prevista_recebimento_rascunho_proforma:   normDate(pedido.data_previsao_recebimento_rascunho_proforma_pedido),
    data_confirmada_recebimento_rascunho_proforma: normDate(pedido.data_confirmacao_recebimento_rascunho_proforma_pedido),
    data_meta_recebimento_rascunho_proforma:       normDate(pedido.data_meta_recebimento_rascunho_proforma_pedido),
    data_prevista_aprovacao_rascunho_proforma:     normDate(pedido.data_previsao_aprovacao_rascunho_proforma_pedido),
    data_confirmada_aprovacao_rascunho_proforma:   normDate(pedido.data_confirmacao_aprovacao_rascunho_proforma_pedido),
    data_meta_aprovacao_rascunho_proforma:         normDate(pedido.data_meta_aprovacao_rascunho_proforma_pedido),
    data_prevista_envio_original_proforma:          normDate(pedido.data_previsao_envio_original_proforma_pedido),
    data_confirmada_envio_original_proforma:        normDate(pedido.data_confirmacao_envio_original_proforma_pedido),
    data_meta_envio_original_proforma:              normDate(pedido.data_meta_envio_original_proforma_pedido),
    data_prevista_recebimento_original_proforma:    normDate(pedido.data_previsao_recebimento_original_proforma_pedido),
    data_confirmada_recebimento_original_proforma:  normDate(pedido.data_confirmacao_recebimento_original_proforma_pedido),
    data_meta_recebimento_original_proforma:        normDate(pedido.data_meta_recebimento_original_proforma_pedido),
    data_proforma_invoice:                          normDate(pedido.data_documento_proforma_pedido),
    // Invoice
    data_prevista_recebimento_rascunho_invoice:   normDate(pedido.data_previsao_recebimento_rascunho_invoice_pedido),
    data_confirmada_recebimento_rascunho_invoice: normDate(pedido.data_confirmacao_recebimento_rascunho_invoice_pedido),
    data_meta_recebimento_rascunho_invoice:       normDate(pedido.data_meta_recebimento_rascunho_invoice_pedido),
    data_prevista_aprovacao_rascunho_invoice:     normDate(pedido.data_previsao_aprovacao_rascunho_invoice_pedido),
    data_confirmada_aprovacao_rascunho_invoice:   normDate(pedido.data_confirmacao_aprovacao_rascunho_invoice_pedido),
    data_meta_aprovacao_rascunho_invoice:         normDate(pedido.data_meta_aprovacao_rascunho_invoice_pedido),
    data_prevista_envio_original_invoice:          normDate(pedido.data_previsao_envio_original_invoice_pedido),
    data_confirmada_envio_original_invoice:        normDate(pedido.data_confirmacao_envio_original_invoice_pedido),
    data_meta_envio_original_invoice:              normDate(pedido.data_meta_envio_original_invoice_pedido),
    data_prevista_recebimento_original_invoice:    normDate(pedido.data_previsao_recebimento_original_invoice_pedido),
    data_confirmada_recebimento_original_invoice:  normDate(pedido.data_confirmacao_recebimento_original_invoice_pedido),
    data_meta_recebimento_original_invoice:        normDate(pedido.data_meta_recebimento_original_invoice_pedido),
    data_invoice:                                   normDate(pedido.data_documento_invoice_pedido),
    itens,
    // Nomes das contrapartes: prioriza snapshots (Fase 4 DDD — fonte canônica
    // de empresas via SUID+snapshot), faz fallback pra detalhes_operacionais
    // legado pra pedidos antigos que ainda não têm snapshot. Front consome
    // via colunas Pai/Filho (ColunasPai.tsx:row.nome_exportador).
    nome_exportador: findNome('exportador') ?? (det.nome_exportador as string | null | undefined) ?? null,
    nome_importador: findNome('importador') ?? (det.nome_importador as string | null | undefined) ?? null,
    nome_fabricante: findNome('fabricante') ?? (det.nome_fabricante as string | null | undefined) ?? null,
    // CNPJ exportador vive no JSON detalhes_operacionais (auto-fill em EXP)
    cnpj_exportador: (det.cnpj_exportador as string | null | undefined) ?? null,
    // Virtual: somatório de quantidade_pronta dos itens (não persistido no Pedido)
    quantidade_pronta_itens_pedido_total: Array.isArray(itens)
      ? itens.reduce((s: number, i: PedidoItemRaw) => s + Number(i.quantidade_pronta_pedido ?? 0), 0)
      : (pedido.quantidade_pronta_itens_pedido_total ?? null),
    // Virtual: somatório de quantidade_transferida dos itens (não persistido no Pedido)
    quantidade_transferida_total: Array.isArray(itens)
      ? itens.reduce((s: number, i: PedidoItemRaw) => s + Number(i.quantidade_transferida_pedido ?? 0), 0)
      : (pedido.quantidade_transferida_total ?? null),
    // Virtual: somatório de quantidade_cancelada dos itens (não persistido no Pedido)
    quantidade_cancelada_total_pedido: Array.isArray(itens)
      ? itens.reduce((s: number, i: PedidoItemRaw) => s + Number(i.quantidade_cancelada_pedido ?? 0), 0)
      : (pedido.quantidade_cancelada_total_pedido ?? null),
    // Virtuais: agregação de NCM por pedido seguindo o padrão renderAgregado
    // do front (ColunasPai.tsx). `ncm_valor_unico` populado quando todos os
    // itens compartilham o mesmo NCM; `ncm_divergente=true` quando há mais
    // de um NCM distinto (front mostra "⚠ N NCMs"); contagem para o badge.
    ...(() => {
      if (!Array.isArray(itens)) {
        return {
          ncm_valor_unico:      pedido.ncm_valor_unico ?? null,
          ncm_divergente:       pedido.ncm_divergente ?? false,
          ncms_distintos_count: pedido.ncms_distintos_count ?? null,
        }
      }
      const ncmsUnicos = new Set(
        itens.map((i: PedidoItemRaw) => i.ncm as string | null | undefined).filter((x): x is string => !!x && x.length > 0),
      )
      return {
        ncm_valor_unico:      ncmsUnicos.size === 1 ? [...ncmsUnicos][0] : null,
        ncm_divergente:       ncmsUnicos.size > 1,
        ncms_distintos_count: ncmsUnicos.size,
      }
    })(),
    // Descrição agregada (sem alerta na UI — só exibe quando todos os itens coincidem).
    ...(() => {
      if (!Array.isArray(itens)) {
        return {
          descricao_item_valor_unico: (pedido as { descricao_item_valor_unico?: string | null }).descricao_item_valor_unico ?? null,
        }
      }
      const descUnicas = new Set(
        itens
          .map((i: PedidoItemRaw) => i.descricao_item as string | null | undefined)
          .filter((x): x is string => !!x && x.trim().length > 0),
      )
      return {
        descricao_item_valor_unico: descUnicas.size === 1 ? [...descUnicas][0] : null,
      }
    })(),
  }
}

// ── Helper: injeta _colunas_usuario nos registros retornados ─────────────────
// Faz um único batch query para buscar todos os valores de colunas personalizadas
// associadas aos registros, evitando N+1 queries.
//
// Suporta DOIS vínculos (mesma tabela `PedidoListaColunaUsuarioValor`, distintos
// apenas pelo `vinculo_valor_coluna_usuario_pedido`):
//   - `'pedido'` (default): valores associados ao Pedido pai. Usar `idField='id_pedido'`.
//   - `'item'`            : valores associados a um PedidoItem. Usar `idField='id_item'`
//     (nome da PK no banco — confirmado em queries `where: { id_item: ... }`).
//
// Por que generalizar: tabela é única, `vinculo` é discriminador no banco. Sem
// generalização, item ficava sem injeção e bug "edita coluna do item, valor
// some" não fechava. Mand. 09 — contrato bilateral também na leitura.
export async function injetarValoresColunasUsuario<T extends Record<string, unknown>>(
  prisma: PrismaClient,
  registros: T[],
  tenant_id: string,
  opcoes: {
    vinculo?: 'pedido' | 'item'
    idField?: string
  } = {},
): Promise<(T & { _colunas_usuario: Record<string, string> })[]> {
  const vinculo = opcoes.vinculo ?? 'pedido'
  const idField = opcoes.idField ?? 'id_pedido'

  if (registros.length === 0) return []
  const ids = registros
    .map(r => r[idField])
    .filter((x): x is string => typeof x === 'string' && x.length > 0)
  if (ids.length === 0) return registros.map(r => ({ ...r, _colunas_usuario: {} }))

  const valores: { id_vinculo_valor_coluna_usuario_pedido: string; id_coluna_usuario_pedido: string; valor_coluna_usuario_pedido: string }[] =
    await prisma.pedidoListaColunaUsuarioValor.findMany({
      where: {
        id_organizacao: tenant_id,
        vinculo_valor_coluna_usuario_pedido: vinculo,
        id_vinculo_valor_coluna_usuario_pedido: { in: ids },
      },
      select: { id_vinculo_valor_coluna_usuario_pedido: true, id_coluna_usuario_pedido: true, valor_coluna_usuario_pedido: true },
    })

  const mapa: Record<string, Record<string, string>> = {}
  for (const v of valores) {
    const vinculoId = v.id_vinculo_valor_coluna_usuario_pedido
    if (!mapa[vinculoId]) mapa[vinculoId] = {}
    mapa[vinculoId][v.id_coluna_usuario_pedido] = v.valor_coluna_usuario_pedido
  }

  return registros.map(r => {
    const key = r[idField]
    // Defensive: registros sem id válido (string vazia, null, undefined) recebem
    // `{}` — não `''` (bug do `??` que só coalesce null/undefined, não falsy).
    const valoresParaEste = typeof key === 'string' && key.length > 0 ? mapa[key] : undefined
    return { ...r, _colunas_usuario: valoresParaEste ?? {} }
  })
}

// ── Helper: injeta colunas em PEDIDOS + nos ITENS embarcados em uma única passada
//
// Pattern reusado em 3 listagens (GET /pedidos cursor, GET /pedidos offset,
// GET /inicializacao): cada pedido tem `itens_pedido` embarcado, e ambos os
// níveis precisam de `_colunas_usuario`. Sem isso, views como Kanban (que lê
// a lista base via GET /pedidos) perde colunas de escopo 'item' (bug 2026-05-13).
//
// Faz 2 queries batch — 1 para pedidos (vinculo='pedido', idField='id_pedido')
// + 1 para todos os itens da página coletados (vinculo='item', idField='id_item').
export async function injetarColunasPedidoEItens<
  P extends { id_pedido: string; itens_pedido?: Array<Record<string, unknown>> | undefined }
>(
  prisma: PrismaClient,
  pedidos: P[],
  tenant_id: string,
): Promise<Array<P & { _colunas_usuario: Record<string, string>; itens_pedido?: Array<Record<string, unknown>> }>> {
  if (pedidos.length === 0) return []
  // 1) Nível pedido
  const pedidosComCol = await injetarValoresColunasUsuario(prisma, pedidos, tenant_id)
  // 2) Coleta todos os itens em 1 array, faz query batch, remapeia
  const todosItens: Array<Record<string, unknown>> = []
  for (const p of pedidosComCol) {
    const itens = (p.itens_pedido as Array<Record<string, unknown>> | undefined) ?? []
    for (const it of itens) todosItens.push(it)
  }
  if (todosItens.length === 0) {
    return pedidosComCol as Array<P & { _colunas_usuario: Record<string, string> }>
  }
  const itensComCol = await injetarValoresColunasUsuario(
    prisma, todosItens, tenant_id, { vinculo: 'item', idField: 'id_item' },
  )
  const mapaItens = new Map<string, Record<string, unknown>>()
  for (const it of itensComCol) {
    const key = it.id_item as string | undefined
    if (key) mapaItens.set(key, it)
  }
  return pedidosComCol.map(p => ({
    ...p,
    itens_pedido: ((p.itens_pedido as Array<Record<string, unknown>> | undefined) ?? []).map(
      it => mapaItens.get(it.id_item as string) ?? it,
    ),
  })) as Array<P & { _colunas_usuario: Record<string, string>; itens_pedido?: Array<Record<string, unknown>> }>
}

// ── Cursor pagination helpers ─────────────────────────────────────────────────

// Campos suportados como sort key no cursor pagination
// P19/Q2 — `data_atualizacao_pedido` adicionado e promovido a sort default em
// inicializacao-pedido.ts. Garante que pedidos recem-criados ou recem-editados
// aparecam no topo da lista (Prisma @updatedAt atualiza em todo write).
// `created_at` e `updated_at` mantidos por compat com clientes antigos, mas
// nao mapeiam para colunas reais do banco — uso desencorajado.
export const CURSOR_SORT_FIELDS = [
  'data_emissao_pedido',
  'data_atualizacao_pedido',
  'data_criacao_pedido',
  'numero_pedido',
  'valor_total_pedido',
  'created_at',
  'updated_at',
] as const
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

// ── Helper: parse de query param CSV ─────────────────────────────────────────
//
// Express expõe `req.query[chave]` como `string | string[] | ParsedQs | undefined`.
// Para CSV (ex: ?ids_workspaces=cmo1,cmo2,cmo3) precisamos normalizar.
// Retorna `string[]` válido (trim, dedup, sem vazios) ou `undefined` se ausente.
function parseCsvQueryParam(raw: unknown): string[] | undefined {
  if (raw === undefined || raw === null) return undefined
  // Express pode entregar array (ex: ?ids=a&ids=b) ou string ("a,b"). Aceita ambos.
  const items = Array.isArray(raw)
    ? raw.flatMap((v) => (typeof v === 'string' ? v.split(',') : []))
    : typeof raw === 'string'
      ? raw.split(',')
      : []
  const limpos = Array.from(new Set(items.map((s) => s.trim()).filter(Boolean)))
  return limpos.length > 0 ? limpos : undefined
}

// ── Validação multi-workspace ────────────────────────────────────────────────
//
// Quando o query param `ids_workspaces` vem na requisição, chamamos o
// Configurador (S2S) para obter a lista de workspaces que o usuário pode
// acessar. Cruzamos com o que foi solicitado:
//   - SUPER_ADMIN/ADMIN/MASTER → S2S retorna todos os workspaces ATIVOS da org
//   - PADRAO/FORNECEDOR        → S2S retorna apenas habilitados (UsuarioWorkspace.ativo)
//
// IDs solicitados que não estão em `habilitados` = bloqueados → resposta 403
// com a lista explícita (Mand. 08 — falha ruidosa, sem fallback silencioso).
// Cross-org coberto automaticamente: workspace de outra org não aparece em
// `habilitados`, cai em `bloqueados`.
async function validarMultiWorkspace(
  ctx: ContextoOrganizacao,
  idsSolicitados: string[],
): Promise<{ valido: true } | { valido: false; bloqueados: string[] }> {
  const baseUrl = process.env.CONFIGURATOR_URL
  const chave = process.env.CHAVE_INTERNA_SERVICO
  if (!baseUrl || !chave) {
    throw new AppError(
      'Configuração ausente: CONFIGURATOR_URL ou CHAVE_INTERNA_SERVICO',
      500,
      'CONFIG_ERROR',
    )
  }
  const { workspacesHabilitados } = await obterWorkspacesHabilitadosDoUsuario({
    configuradorBaseUrl: baseUrl,
    chaveInterna: chave,
    idOrganizacao: ctx.idOrganizacao,
    idUsuario: ctx.idUsuario,
  })
  const habilitadosSet = new Set(workspacesHabilitados)
  const bloqueados = idsSolicitados.filter((id) => !habilitadosSet.has(id))
  if (bloqueados.length > 0) return { valido: false, bloqueados }
  return { valido: true }
}

// ── Helper: tagear pedidos com indicadores de transferência ──────────────────
// Consulta PedidoTransferencia uma única vez para todo o lote (evita N+1).
// Popula campos virtuais `enviou_transferencia` e `recebeu_transferencia`.
async function tagTransferencias(
  db: unknown,
  pedidosMapped: PedidoRaw[],
  idOrganizacao: string,
): Promise<PedidoRaw[]> {
  if (pedidosMapped.length === 0) return pedidosMapped
  const pedidoIds = pedidosMapped.map(p => p.id as string).filter(Boolean)
  if (pedidoIds.length === 0) return pedidosMapped

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prisma = db as any

  // Busca transferências não-revertidas que envolvem estes pedidos como ORIGEM
  const transferencias = await prisma.pedidoTransferencia.findMany({
    where: { id_organizacao: idOrganizacao, revertido_pedido_transferencia: false },
    select: {
      id_pedido_origem: true,
      destinos_pedido_transferencia: true,
    },
  })

  // Set de pedidos que ENVIARAM (são origem de uma transferência)
  const origemIds = new Set<string>()
  // Set de pedidos que RECEBERAM (aparecem como destino em alguma transferência)
  const destinoIds = new Set<string>()
  const pedidoIdsSet = new Set(pedidoIds)

  for (const t of transferencias) {
    if (pedidoIdsSet.has(t.id_pedido_origem)) {
      origemIds.add(t.id_pedido_origem)
    }
    try {
      const destinos = JSON.parse(t.destinos_pedido_transferencia) as Array<{ pedido_id?: string }>
      for (const d of destinos) {
        if (d.pedido_id && pedidoIdsSet.has(d.pedido_id)) {
          destinoIds.add(d.pedido_id)
        }
      }
    } catch (_e) { /* JSON inválido — ignora */ }
  }

  // Tagear cada pedido com os flags virtuais
  return pedidosMapped.map(p => {
    const pid = p.id as string
    return {
      ...p,
      enviou_transferencia: origemIds.has(pid) || (Number(p.quantidade_transferida_total ?? 0) > 0),
      recebeu_transferencia: destinoIds.has(pid),
    }
  })
}

// ── GET / — Listar pedidos ────────────────────────────────────────────────────
// Suporta dois modos de paginação:
//   - Cursor: ?cursor=<base64>&sort=data_emissao_pedido&dir=desc&limit=50
//   - Offset: ?page=1&limit=20 (backward compat)
// Suporta filtro multi-workspace via ?ids_workspaces=cmo1,cmo2 (CSV).
// Header x-id-workspace continua single (Portão 3 exige). Query param vence
// sobre header quando ambos vêm.

pedidosRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const ctx      = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const idOrganizacao = ctx.idOrganizacao
      // Mand. 08 — sem fallback silencioso: se header nao vier, lista consolidada da
      // organizacao (todos os workspaces). Se vier, filtra. Antes era `?? idOrganizacao`
      // que criava filtro impossivel (id_workspace = id_organizacao nunca bate).
      const idWorkspace = req.headers['x-id-workspace'] as string | undefined

      const { status, tipo_operacao, busca, cursor, page, limit, sort, dir, ids_workspaces } = req.query

      // Filtro multi-workspace (query param vence sobre header). Header continua
      // single para o Portão 3. Quando ids_workspaces vem com >= 1 valor, ele
      // substitui o filtro do header — validado a seguir contra permissões.
      const idsWorkspacesQuery = parseCsvQueryParam(ids_workspaces)

      if (idsWorkspacesQuery && idsWorkspacesQuery.length > 0) {
        const validacao = await validarMultiWorkspace(ctx, idsWorkspacesQuery)
        if (!validacao.valido) {
          return res.status(403).json({
            error: {
              code: 'WORKSPACE_NAO_AUTORIZADO',
              message:
                `${validacao.bloqueados.length} workspace(s) não autorizado(s) para este usuário`,
              workspaces_bloqueados: validacao.bloqueados,
            },
          })
        }
      }

      const where: Record<string, unknown> = { id_organizacao: idOrganizacao, data_exclusao_pedido: null }
      if (idsWorkspacesQuery && idsWorkspacesQuery.length > 0) {
        where.id_workspace = { in: idsWorkspacesQuery }
      } else if (idWorkspace) {
        where.id_workspace = idWorkspace
      }
      if (status) {
        const statusList = (status as string).split(',').map(s => s.trim()).filter(Boolean)
        where.status_pedido = statusList.length > 1 ? { in: statusList } : statusList[0]
      }
      if (tipo_operacao) where.tipo_operacao_pedido = tipo_operacao
      if (busca) {
        where.numero_pedido = { contains: busca as string, mode: 'insensitive' }
      }

      // ── Cursor pagination ──
      if (cursor !== undefined) {
        // P19/Q2 — default `data_atualizacao_pedido` para garantir que criados/editados
        // apareçam no topo. Consistente com inicializacao-pedido.ts.
        const sortField = (CURSOR_SORT_FIELDS.includes(sort as CursorSortField) ? sort : 'data_atualizacao_pedido') as CursorSortField
        const sortDir = dir === 'asc' ? 'asc' : 'desc'
        const limitNum = Math.min(Math.max(Number(limit ?? 50), 1), 200)

        // Montar condição de keyset se cursor presente
        if (typeof cursor === 'string' && cursor.length > 0) {
          const payload = decodeCursor(cursor)
          if (!payload) {
            return res.status(400).json({ error: { message: 'Cursor invalido' } })
          }

          // WHERE (sort_field < last_val) OR (sort_field = last_val AND id_pedido < last_id)
          // Para sortDir=asc, usa-se > e para desc, usa-se <
          const op = payload.sort_dir === 'desc' ? 'lt' : 'gt'

          where.OR = [
            { [payload.sort_field]: { [op]: payload.sort_value } },
            {
              [payload.sort_field]: payload.sort_value,
              id_pedido: { [op]: payload.id },
            },
          ]
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await db.pedido.findMany({
          where,
          include: {
            itens_pedido: { orderBy: { sequencia_item_pedido: 'asc' } },
            snapshots_empresa_pedido: { select: { papel: true, nome_empresa: true, suid_empresa: true } },
          },
          orderBy: [
            { [sortField]: sortDir },
            { id_pedido: sortDir },
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
            id: ultimo.id_pedido,
          })
        }

        // Injeta nos 2 níveis (pedido + itens) — Kanban e demais views que
        // consomem a lista base precisam dos `_colunas_usuario` nos itens
        // embarcados também. Fix 2026-05-13.
        const registrosComColunas = await injetarColunasPedidoEItens(db, registros, idOrganizacao)
        const mapped = registrosComColunas.map(mapPedido).filter(Boolean) as PedidoRaw[]
        const comTransferencias = await tagTransferencias(db, mapped, idOrganizacao)
        return res.json({ data: comTransferencias, nextCursor: cursor_proximo, hasMore: tem_mais })
      }

      // ── Offset pagination (backward compat) ──
      const pageNum = Number(page ?? 1)
      const limitNum = Number(limit ?? 20)
      const skip = (pageNum - 1) * limitNum

      // Contagem de itens: SQL raw para evitar bug do Prisma 5.22 com filtro relation
      // aninhado (`{ pedido_item: where }` retornava 539 em vez dos ~57k reais).
      // O filtro raw garante que conta APENAS itens cujo pedido pai bate id_organizacao
      // (e id_workspace / ids_workspaces quando vier) E não está excluído.
      // OWASP A01: whitelist validada — wsCondicao é branch estático (não interpola user input),
      // wsParam são params posicionais ($1, $2). Sem nomes dinâmicos de coluna/tabela.
      let totalItensSql: string
      let totalItensParams: unknown[]
      if (idsWorkspacesQuery && idsWorkspacesQuery.length > 0) {
        const placeholders = idsWorkspacesQuery.map((_, i) => `$${i + 2}`).join(', ')
        totalItensSql = `
        SELECT COUNT(*)::int AS n
        FROM "public"."pedido_item" i
        JOIN "public"."pedido" p ON p.id_pedido = i.id_pedido
        WHERE p.id_organizacao = $1
          AND p.id_workspace IN (${placeholders})
          AND p.data_exclusao_pedido IS NULL
      `
        totalItensParams = [idOrganizacao, ...idsWorkspacesQuery]
      } else if (idWorkspace) {
        totalItensSql = `
        SELECT COUNT(*)::int AS n
        FROM "public"."pedido_item" i
        JOIN "public"."pedido" p ON p.id_pedido = i.id_pedido
        WHERE p.id_organizacao = $1
          AND p.id_workspace = $2
          AND p.data_exclusao_pedido IS NULL
      `
        totalItensParams = [idOrganizacao, idWorkspace]
      } else {
        totalItensSql = `
        SELECT COUNT(*)::int AS n
        FROM "public"."pedido_item" i
        JOIN "public"."pedido" p ON p.id_pedido = i.id_pedido
        WHERE p.id_organizacao = $1
          AND p.data_exclusao_pedido IS NULL
      `
        totalItensParams = [idOrganizacao]
      }

      const [dataRaw, total, totalItensRaw] = await Promise.all([
        db.pedido.findMany({
          where,
          include: {
            itens_pedido: { orderBy: { sequencia_item_pedido: 'asc' } },
            snapshots_empresa_pedido: { select: { papel: true, nome_empresa: true, suid_empresa: true } },
          },
          // Ordenação padrão da lista: mais recém-criado primeiro. Garante que
          // o pedido que o usuário acabou de criar aparece no topo, mesmo
          // quando a data_emissao_pedido bate empate com pedidos antigos
          // (ex: vários pedidos com data_emissao = hoje).
          orderBy: [
            { data_criacao_pedido: 'desc' },
            { id_pedido: 'desc' },
          ],
          skip,
          take: limitNum,
        }),
        db.pedido.count({ where }),
        db.$queryRawUnsafe(totalItensSql, ...totalItensParams) as Promise<Array<{ n: number | bigint | string }>>,
      ])
      // Number(...) cobre bigint/string que Prisma raw pode retornar para COUNT.
      const totalItens = Number(totalItensRaw[0]?.n ?? 0)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = dataRaw as any[]
      // Mesma injeção 2-níveis do branch cursor — fecha o gap da Kanban (fix 2026-05-13).
      const dataComColunas = await injetarColunasPedidoEItens(db, data, idOrganizacao)
      const mapped = dataComColunas.map(mapPedido).filter(Boolean) as PedidoRaw[]
      const comTransferencias = await tagTransferencias(db, mapped, idOrganizacao)
      res.json({ data: comTransferencias, total, totalItens, page: pageNum, limit: limitNum })
    })
  } catch (err) {
    next(err)
  }
})

// ── GET /localizar — Contar total de matches find-in-page (pedidos + itens) ───
// Deve ficar ANTES de /:id para que Express não interprete "localizar" como param.

pedidosRouter.get('/localizar', async (req: Request, res: Response, next: NextFunction) => {
  const localizarSchema = z.object({
    termo:           z.string().min(1).max(200),
    status:          z.string().optional(),
    tipo_operacao:   z.string().optional(),
    busca:           z.string().optional(),
    ids_workspaces:  z.string().optional(),    // CSV — filtro multi-workspace
  })
  const result = localizarSchema.safeParse(req.query)
  if (!result.success) {
    return res.status(400).json({ error: { message: 'Parametros invalidos', details: result.error.flatten() } })
  }

  const { termo, status, tipo_operacao, busca, ids_workspaces } = result.data

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const ctx      = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const tenant_id  = ctx.idOrganizacao
      const company_id = (req.headers['x-id-workspace'] as string | undefined) ?? tenant_id

      // Filtro multi-workspace (query param vence sobre header). Mesma regra
      // do GET principal — valida permissões antes de aplicar.
      const idsWorkspacesQuery = parseCsvQueryParam(ids_workspaces)
      if (idsWorkspacesQuery && idsWorkspacesQuery.length > 0) {
        const validacao = await validarMultiWorkspace(ctx, idsWorkspacesQuery)
        if (!validacao.valido) {
          return res.status(403).json({
            error: {
              code: 'WORKSPACE_NAO_AUTORIZADO',
              message:
                `${validacao.bloqueados.length} workspace(s) não autorizado(s) para este usuário`,
              workspaces_bloqueados: validacao.bloqueados,
            },
          })
        }
      }

      // WHERE base. Mantém nomes legacy (tenant_id/company_id) para
      // compatibilidade com o resto desta rota — refactor DDD pendente.
      const whereBase: Record<string, unknown> = { tenant_id, deleted_at: null }
      if (idsWorkspacesQuery && idsWorkspacesQuery.length > 0) {
        whereBase.company_id = { in: idsWorkspacesQuery }
      } else {
        whereBase.company_id = company_id
      }
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

// ── GET /duplicatas-numero — Pedidos existentes com mesmo numero_pedido (org) ─
// Deve ficar ANTES de /:id para que Express não interprete como param.

const duplicatasNumeroSchema = z.object({
  numero_pedido: z.string().min(1).max(100),
})

pedidosRouter.get('/duplicatas-numero', async (req: Request, res: Response, next: NextFunction) => {
  const result = duplicatasNumeroSchema.safeParse(req.query)
  if (!result.success) {
    return res.status(400).json({ error: { message: 'Parametros invalidos', details: result.error.flatten() } })
  }

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = rawDb as any
      const ctx = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const idOrganizacao = ctx.idOrganizacao

      const pedidos_existentes = await db.pedido.findMany({
        where: {
          id_organizacao: idOrganizacao,
          numero_pedido: result.data.numero_pedido,
          data_exclusao_pedido: null,
        },
        select: { id_pedido: true, numero_pedido: true },
        orderBy: { data_criacao_pedido: 'desc' },
        take: 20,
      })

      res.json({ pedidos_existentes })
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
        where: { id_pedido: req.params.id, id_organizacao: tenant_id, id_workspace: company_id },
        include: { itens_pedido: { orderBy: { sequencia_item_pedido: 'asc' } } },
      })

      if (!pedido) {
        throw new AppError(404, 'Pedido nao encontrado')
      }

      // Injeção em 2 níveis (Mand. 09 — leitura espelha a escrita):
      //  1) o próprio Pedido recebe `_colunas_usuario` do escopo='pedido'
      //  2) cada item embarcado em `itens_pedido` recebe `_colunas_usuario`
      //     do escopo='item' (batch IN nos id_item)
      // Sem isso, o frontend recarrega o detail/snapshot e perde tudo.
      const [pedidoComCol] = await injetarColunasPedidoEItens(db, [pedido], tenant_id)

      res.json(mapPedido(pedidoComCol))
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

      // Garante que o pedido existe e pertence à organização (e ao workspace, se vier
      // no header) antes de expor itens. Nomes legados `id`/`tenant_id`/`company_id`
      // causavam `Unknown argument 'id'` no Prisma → 500 → frontend mostrava itens vazios.
      const pedido = await db.pedido.findFirst({
        where: {
          id_pedido: req.params.id,
          id_organizacao: tenant_id,
          ...(company_id && company_id !== tenant_id ? { id_workspace: company_id } : {}),
        },
        select: { id_pedido: true },
      })
      if (!pedido) {
        throw new AppError(404, 'Pedido nao encontrado')
      }

      const itens = await db.pedidoItem.findMany({
        where: { id_pedido: req.params.id, id_organizacao: tenant_id, id_workspace: company_id },
        orderBy: { sequencia_item_pedido: 'asc' },
      })

      // Injeta `_colunas_usuario` ANTES do `mapItem` — vinculo='item' busca
      // valores ligados ao `id_item` de cada PedidoItem. Sem isso, expandir
      // pedido na lista vinha com itens sem colunas personalizadas (bug 2026-05-13).
      const itensComCol = await injetarValoresColunasUsuario(
        db,
        itens as Array<Record<string, unknown>>,
        tenant_id,
        { vinculo: 'item', idField: 'id_item' },
      )

      res.json(itensComCol.map(mapItem))
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
    suid_ope,
    confirmar_numero_duplicado,
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
      new Set(itens.map((i) => i.ncm_item).filter((c): c is string => !!c && c.length > 0)),
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

    const [ncmsBuscados, moedasBuscadas, unidadesBuscadas, opeBuscado] = await Promise.all([
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
      // FASE 06E (Frente 1): OPE — agora `suid_ope` vem do payload
      suid_ope
        ? buscarSeguro('OPE', suid_ope, () => buscarOpePorSuid(suid_ope, ctxCadastros))
        : Promise.resolve(null),
    ])

    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const ctx      = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const tenant_id  = ctx.idOrganizacao
      const company_id = (req.headers['x-id-workspace'] as string | undefined) ?? tenant_id

      const pedidoId = gerarId('pedi')

      const pedidosComMesmoNumero = await db.pedido.findMany({
        where: {
          id_organizacao: tenant_id,
          numero_pedido: pedidoData.numero_pedido,
          data_exclusao_pedido: null,
        },
        select: { id_pedido: true, numero_pedido: true },
        take: 20,
      })

      if (pedidosComMesmoNumero.length > 0 && !confirmar_numero_duplicado) {
        return res.status(409).json({
          error: {
            message: 'Ja existem pedidos com este numero na organizacao',
            code: 'DUPLICATE_NUMERO_PEDIDO_CONFIRM_REQUIRED',
            pedidos_existentes: pedidosComMesmoNumero,
          },
        })
      }

      // Calcular totais para o INSERT inicial (placeholder). O valor real é
      // gravado pelo `recalcularAgregadosPedido` logo após o create — fonte
      // única de verdade. O override do cliente em `pedidoData.valor_total_pedido`
      // é ignorado: agregados são server-side-only (Onda A3 remove do schema).
      const valorTotal = itens.reduce((acc, item) => {
        const qty = item.quantidade_inicial_item ?? 0
        const valorItem = item.valor_total_item ?? (item.valor_por_unidade_item ?? 0) * qty
        return acc + valorItem
      }, 0)

      const qtdTotal = itens.reduce((acc, item) => acc + (item.quantidade_inicial_item ?? 0), 0)

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

      // FASE 06E — snapshot inicial de OPE (best-effort)
      const snapshotOpeData: SnapshotOpeData | null = opeBuscado
        ? (() => {
            try {
              return montarSnapshotOpe(opeBuscado, tenant_id, company_id)
            } catch (err) {
              console.warn(
                `[POST /pedidos] snapshot OPE: contrato invalido (suid=${suid_ope}); seguindo sem snapshot inicial`,
                err instanceof Error ? err.message : err,
              )
              return null
            }
          })()
        : null

      // `db` (vindo de withOrganizacao) JÁ É um `Prisma.TransactionClient` —
      // o helper resolver-organizacao abre `prisma.$transaction(...)` e nos
      // entrega o `tx` aqui. Não tentar wrap interno com `db.$transaction(...)`
      // (TransactionClient não expõe esse método — falha "is not a function").
      // O nested-write Prisma + recalcularAgregadosPedido + re-fetch já rodam
      // todos na mesma transação que o resolver abriu pra nós.

      // Débito 2B — resolver FK do status (catalogo StatusPedido) antes de criar.
      const statusRascunho = await db.statusPedido.findFirst({
        where: { id_organizacao: tenant_id, nome_pedido_status: 'rascunho' },
        select: { id_pedido_status: true },
      })
      if (!statusRascunho) {
        console.warn(
          `[POST /pedidos] StatusPedido 'rascunho' nao encontrado na organizacao=${tenant_id}; ` +
          `pedido sera criado sem vinculo id_status_pedido.`,
        )
      }

      const pedidoCriado = await db.pedido.create({
        // @lint-agregados: allow-create-placeholder — recalcularAgregadosPedido
        // roda logo depois do create na mesma $transaction (sobrescreve).
        data: {
          id_pedido:                    pedidoId,
          id_organizacao:               tenant_id,
          id_workspace:                 company_id,
          ...pedidoData,  // Zod já validou em DDD: tipo_operacao_pedido, numero_pedido, etc.
          // Valores iniciais: serão sobrescritos pelo helper logo abaixo. Mantemos
          // só por compatibilidade com schemas que possam ter NOT NULL futuro.
          valor_total_pedido:           valorTotal,
          quantidade_total_pedido:      qtdTotal,
          status_pedido:                'rascunho',
          id_status_pedido:             statusRascunho?.id_pedido_status ?? null,
          itens_pedido: (() => {
            // Propagação Pedido → Item (Mandamento 03 — fonte da verdade em
            // shared/mapaPropagacaoPedidoItem.ts). Os 22 campos diretos +
            // 3 nomes derivados de snapshot são herdados aqui no CREATE.
            const propagacaoPedido = construirCamposPropagadosParaItem(pedidoData as Record<string, unknown>)
            const nomesEmpresa     = derivarNomesEmpresaParaItem(snapshotsData)
            const camposHerdados   = { ...propagacaoPedido, ...nomesEmpresa }

            return {
              create: itens.map((item, index) => ({
                // 1. Identidade do item
                id_item:                  gerarId('pite'),
                id_organizacao:           tenant_id,
                id_workspace:             company_id,

                // 2. Campos herdados do Pedido (defaults — podem ser sobrescritos abaixo)
                ...camposHerdados,

                // 3. Campos sempre item-specific
                sequencia_item_pedido:    item.sequencia_item_pedido ?? (index + 1),
                part_number_item:         item.part_number_item ?? '',
                ncm_item:                 item.ncm_item ?? '',
                descricao_item:           item.descricao_item ?? '',
                quantidade_inicial_item:  item.quantidade_inicial_item ?? 0,
                quantidade_atual_item:    item.quantidade_inicial_item ?? 0,
                valor_por_unidade_item:   item.valor_por_unidade_item ?? null,
                valor_total_item:         item.valor_total_item ?? ((item.valor_por_unidade_item ?? 0) * (item.quantidade_inicial_item ?? 0)),

                // 4. Sobrescritas item-explicit (precedência: item > pedido > default técnico)
                ...(item.moeda_item                     !== undefined ? { moeda_item:                     item.moeda_item }                     : { moeda_item: (camposHerdados as Record<string, unknown>).moeda_item ?? 'USD' }),
                ...(item.casas_decimais_quantidade_item !== undefined ? { casas_decimais_quantidade_item: item.casas_decimais_quantidade_item } : { casas_decimais_quantidade_item: (camposHerdados as Record<string, unknown>).casas_decimais_quantidade_item ?? 2 }),
                ...(item.casas_decimais_valor_item      !== undefined ? { casas_decimais_valor_item:      item.casas_decimais_valor_item }      : { casas_decimais_valor_item: (camposHerdados as Record<string, unknown>).casas_decimais_valor_item ?? 2 }),
                ...(item.unidade_comercializada_item    != null       ? { unidade_comercializada_item:    item.unidade_comercializada_item }    : {}),
              })),
            }
          })(),
          snapshots_empresa_pedido: snapshotsData.length
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
          snapshots_ope_pedido: snapshotOpeData
            ? { create: [snapshotOpeData] }
            : undefined,
        },
        include: {
          itens_pedido: { orderBy: { sequencia_item_pedido: 'asc' } },
          snapshots_empresa_pedido: true,
          snapshots_ncm_pedido: true,
          snapshots_moeda_pedido: true,
          snapshots_unidade_pedido: true,
          snapshots_ope_pedido: true,
        },
      })

      // Recalcular os 5 agregados a partir dos itens recém-criados — fonte
      // única de verdade. Se o cliente enviou `valor_total_pedido` (legado)
      // o valor é sobrescrito aqui (Onda A3 remove do schema Zod).
      await recalcularAgregadosPedido(db, pedidoId, tenant_id)

      // Re-fetch para devolver o pedido COM os agregados corretos no JSON
      // de resposta (helper grava no banco mas não reflete em pedidoCriado).
      const novoPedido = await db.pedido.findUnique({
        where: { id_pedido: pedidoCriado.id_pedido },
        include: {
          itens_pedido: { orderBy: { sequencia_item_pedido: 'asc' } },
          snapshots_empresa_pedido: true,
          snapshots_ncm_pedido: true,
          snapshots_moeda_pedido: true,
          snapshots_unidade_pedido: true,
          snapshots_ope_pedido: true,
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
        where: { id_pedido: req.params.id, id_organizacao: tenant_id, id_workspace: company_id },
      })

      if (!pedido) {
        throw new AppError(404, 'Pedido nao encontrado')
      }

      if (!['rascunho', 'aberto'].includes(pedido.status)) {
        throw new AppError(400, 'Pedido so pode ser editado nos status Rascunho ou Aberto')
      }

      // Validação cruzada Incoterm (Mandamentos 06+09) — incoterm_pedido
      // contra cadastros.incoterm. Falha alta se sigla inexistente/inativa.
      const correlationIdPed = (req.headers['x-correlation-id'] as string | undefined) ?? 'no-corr'
      const ctxCadastrosPed: CadastrosRequestContext = {
        id_organizacao: tenant_id,
        correlation_id: correlationIdPed,
      }
      await validarIncotermPedidoItem(result.data as Record<string, unknown>, ctxCadastrosPed)

      // Defesa em profundidade: mesmo que o schema Zod já não aceite agregados
      // (Onda A3), filtramos explicitamente — quem tentar passar via campo
      // dinâmico/legado não consegue sobrescrever os agregados derivados.
      // Ver: regra de ouro do `recalcularAgregadosPedido` (escrita centralizada).
      const dataLimpa: Record<string, unknown> = { ...result.data }
      delete dataLimpa.valor_total_pedido
      delete dataLimpa.quantidade_total_pedido
      delete dataLimpa.peso_liquido_total_pedido
      delete dataLimpa.peso_bruto_total_pedido
      delete dataLimpa.cubagem_total_pedido

      const updated = await db.pedido.update({
        where: { id_pedido: req.params.id },
        data: dataLimpa,
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
        where: { id_pedido: req.params.id, id_organizacao: tenant_id, id_workspace: company_id },
      })

      if (!pedido) {
        throw new AppError(404, 'Pedido nao encontrado')
      }

      if (pedido.status !== 'rascunho') {
        throw new AppError(400, 'Apenas pedidos com status Rascunho podem ser deletados')
      }

      await db.pedido.delete({ where: { id_pedido: req.params.id } })
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
      const db  = rawDb as any
      const ctx = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao

      const pedido = await db.pedido.findFirst({
        where: { id_pedido: req.params.id, id_organizacao: ctx.idOrganizacao },
      })

      if (!pedido) {
        throw new AppError(404, 'Pedido nao encontrado')
      }

      if (pedido.status_pedido === result.data.status) {
        return res.json(mapPedido(pedido))
      }

      const updated = await db.pedido.update({
        where: { id_pedido: req.params.id },
        data: { status_pedido: result.data.status },
        include: { itens_pedido: { orderBy: { sequencia_item_pedido: 'asc' } } },
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
  'id_workspace',
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
  'porto_origem',
  'porto_destino',
  'local_de_origem',
  'local_de_destino',
  'aeroporto_origem',
  'aeroporto_destino',
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
  'data_prevista_recebimento_rascunho_pedido',
  'data_confirmada_recebimento_rascunho_pedido',
  'data_meta_recebimento_rascunho_pedido',
  'data_prevista_aprovacao_rascunho_pedido',
  'data_confirmada_aprovacao_rascunho_pedido',
  'data_meta_aprovacao_rascunho_pedido',
  'data_documento_pedido',
  'data_prevista_recebimento_rascunho_proforma',
  'data_confirmada_recebimento_rascunho_proforma',
  'data_meta_recebimento_rascunho_proforma',
  'data_prevista_aprovacao_rascunho_proforma',
  'data_confirmada_aprovacao_rascunho_proforma',
  'data_meta_aprovacao_rascunho_proforma',
  'data_prevista_envio_original_proforma',
  'data_confirmada_envio_original_proforma',
  'data_meta_envio_original_proforma',
  'data_prevista_recebimento_original_proforma',
  'data_confirmada_recebimento_original_proforma',
  'data_meta_recebimento_original_proforma',
  'data_proforma_invoice',
  'data_prevista_recebimento_rascunho_invoice',
  'data_confirmada_recebimento_rascunho_invoice',
  'data_meta_recebimento_rascunho_invoice',
  'data_prevista_aprovacao_rascunho_invoice',
  'data_confirmada_aprovacao_rascunho_invoice',
  'data_meta_aprovacao_rascunho_invoice',
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
  // Quando true, replica o valor para TODOS os itens do pedido na mesma
  // transação. Default false — preserva o comportamento divergente (item
  // mantém seu valor próprio, pedido pai pode mostrar alerta de divergência).
  // Decisão UX 2026-05-13: usuário marca checkbox no popover de edição da
  // linha pai para acionar a replicação. Whitelist em CAMPOS_PEDIDO_PROPAGAVEIS.
  replicar_em_itens: z.boolean().optional().default(false),
})

pedidosRouter.patch('/:id_pedido/campo', async (req: Request, res: Response, next: NextFunction) => {
  const result = editarCampoSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: { message: 'Dados invalidos', details: result.error.flatten() } })
  }

  const { campo, valor, replicar_em_itens } = result.data

  if (!CAMPOS_EDITAVEIS.has(campo) && !CAMPOS_RECALCULAVEIS.has(campo)) {
    return next(new AppError(400, `Campo "${campo}" nao pode ser editado inline. Campos permitidos: ${[...CAMPOS_EDITAVEIS, ...CAMPOS_RECALCULAVEIS].join(', ')}`))
  }

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const ctx      = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const idOrganizacao = ctx.idOrganizacao

      const pedido = await db.pedido.findFirst({
        where: { id_pedido: req.params.id_pedido, id_organizacao: idOrganizacao },
      })

      if (!pedido) {
        throw new AppError(404, 'Pedido nao encontrado')
      }

      // Validação de tipo_operacao
      if (campo === 'tipo_operacao' && valor !== 'importacao' && valor !== 'exportacao') {
        throw new AppError(400, 'tipo_operacao deve ser "importacao" ou "exportacao"')
      }

      // Validação de status
      const STATUS_VALIDOS = new Set(['rascunho', 'aberto', 'em_andamento', 'aprovado', 'transferencia', 'consolidado', 'cancelado'])
      if (campo === 'status' && !STATUS_VALIDOS.has(valor as string)) {
        throw new AppError(400, `status invalido: "${valor}". Valores aceitos: ${[...STATUS_VALIDOS].join(', ')}`)
      }

      // Validação por tipo_operacao para campos de parceiros
      if (campo === 'nome_exportador' && pedido.tipo_operacao_pedido === 'exportacao') {
        throw new AppError(400, 'nome_exportador nao pode ser editado em pedidos de exportacao — vem do Configurador')
      }
      if (campo === 'nome_importador' && pedido.tipo_operacao_pedido === 'importacao') {
        throw new AppError(400, 'nome_importador nao pode ser editado em pedidos de importacao — vem do Configurador')
      }

      const correlation_id =
        (req.headers['x-correlation-id'] as string | undefined) ?? randomUUID()
      await validarLogisticaPedidoCampo(campo, valor, {
        id_organizacao: idOrganizacao,
        correlation_id,
      })

      // ── Campos recalculados a partir dos itens (valor do cliente ignorado) ──────
      // Os 5 agregados oficiais (valor/qty/peso_liq/peso_br/cubagem) são
      // recomputados pelo helper canônico — fonte única de verdade. Quaisquer
      // 2 campos legados (quantidade_total_inicial_pedido, quantidade_transferida_total)
      // mantêm cálculo local (não fazem parte dos 5 cobertos pelo helper).
      if (CAMPOS_RECALCULAVEIS.has(campo)) {
        const CINCO_AGREGADOS = new Set([
          'valor_total_pedido',
          'quantidade_total_pedido',
          'peso_liquido_total_pedido',
          'peso_bruto_total_pedido',
          'cubagem_total_pedido',
        ])

        // withOrganizacao já garante atomicidade — `db` é TransactionClient.
        // Não criar $transaction aninhada (Prisma proíbe).
        if (CINCO_AGREGADOS.has(campo)) {
          // Caminho oficial: chama helper, que cobre TODOS os 5 de uma vez
          // (não recalcula só o solicitado — recomputar todos é trivial e
          // mantém os 5 sempre consistentes entre si).
          await recalcularAgregadosPedido(db, req.params.id_pedido, idOrganizacao)
        } else {
          // Caminho legado: 2 campos não cobertos pelo helper
          // (quantidade_total_inicial_pedido, quantidade_transferida_total).
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const itens = await db.pedidoItem.findMany({
            where: { id_pedido: req.params.id_pedido, id_organizacao: idOrganizacao },
          }) as any[]

          const dadosRecalc: Record<string, unknown> = {}
          if (campo === 'quantidade_total_inicial_pedido') {
            const soma = itens.reduce((acc, i) => acc + Number(i.quantidade_inicial_item ?? 0), 0)
            const casas = pedido.casas_decimais_quantidade_pedido ?? 0
            dadosRecalc.quantidade_total_inicial_pedido = parseFloat(soma.toFixed(casas))
          } else if (campo === 'quantidade_transferida_total') {
            const soma = itens.reduce((acc, i) => acc + Number(i.quantidade_transferida_item ?? 0), 0)
            const casas = pedido.casas_decimais_quantidade_pedido ?? 0
            dadosRecalc.quantidade_transferida_total = parseFloat(soma.toFixed(casas))
          }
          // quantidade_pronta_itens_pedido_total → virtual, sem coluna Prisma, computado em mapPedido

          if (Object.keys(dadosRecalc).length > 0) {
            await db.pedido.update({
              where: { id_pedido: req.params.id_pedido },
              data: dadosRecalc,
            })
          }
        }

        const updatedRecalc = await db.pedido.findFirst({
          where: { id_pedido: req.params.id_pedido, id_organizacao: idOrganizacao },
          include: {
            itens_pedido: { orderBy: { sequencia_item_pedido: 'asc' } },
            snapshots_empresa_pedido: { select: { papel: true, nome_empresa: true, suid_empresa: true } },
          },
        })

        return res.json(mapPedido(updatedRecalc))
      }

      // ── Campos editados diretamente no banco ────────────────────────────────────
      // ACL: traduz alias legado (contrato JSON do frontend) → coluna Prisma DDD
      const ALIAS_LEGADO_PARA_PRISMA: Record<string, string> = {
        importacao_exportador_id: 'id_importacao_exportador_pedido',
        exportacao_importador_id: 'id_exportacao_importador_pedido',
        // Sub-onda 7c — datas Draft Pedido (alias prevista/confirmada → previsao/confirmacao DB)
        data_prevista_recebimento_rascunho_pedido:    'data_previsao_recebimento_rascunho_pedido',
        data_confirmada_recebimento_rascunho_pedido:  'data_confirmacao_recebimento_rascunho_pedido',
        data_prevista_aprovacao_rascunho_pedido:      'data_previsao_aprovacao_rascunho_pedido',
        data_confirmada_aprovacao_rascunho_pedido:    'data_confirmacao_aprovacao_rascunho_pedido',
        // ─── BLOCO 1: campos simples (frontend usa nome legado, banco usa _pedido) ───
        tipo_operacao:           'tipo_operacao_pedido',
        numero_proforma:         'numero_proforma_pedido',
        numero_invoice:          'numero_invoice_pedido',
        referencia_importador:   'referencia_importador_pedido',
        referencia_exportador:   'referencia_exportador_pedido',
        referencia_fabricante:   'referencia_fabricante_pedido',
        incoterm:                'incoterm_pedido',
        condicao_pagamento:      'condicao_pagamento_pedido',
        status:                  'status_pedido',
        // ─── BLOCO 3: datas Proforma (prevista/confirmada → previsao/confirmacao + _pedido) ───
        data_prevista_recebimento_rascunho_proforma:      'data_previsao_recebimento_rascunho_proforma_pedido',
        data_confirmada_recebimento_rascunho_proforma:    'data_confirmacao_recebimento_rascunho_proforma_pedido',
        data_meta_recebimento_rascunho_proforma:          'data_meta_recebimento_rascunho_proforma_pedido',
        data_prevista_aprovacao_rascunho_proforma:        'data_previsao_aprovacao_rascunho_proforma_pedido',
        data_confirmada_aprovacao_rascunho_proforma:      'data_confirmacao_aprovacao_rascunho_proforma_pedido',
        data_meta_aprovacao_rascunho_proforma:            'data_meta_aprovacao_rascunho_proforma_pedido',
        data_prevista_envio_original_proforma:         'data_previsao_envio_original_proforma_pedido',
        data_confirmada_envio_original_proforma:       'data_confirmacao_envio_original_proforma_pedido',
        data_meta_envio_original_proforma:             'data_meta_envio_original_proforma_pedido',
        data_prevista_recebimento_original_proforma:   'data_previsao_recebimento_original_proforma_pedido',
        data_confirmada_recebimento_original_proforma: 'data_confirmacao_recebimento_original_proforma_pedido',
        data_meta_recebimento_original_proforma:       'data_meta_recebimento_original_proforma_pedido',
        // ─── BLOCO 4: datas Invoice (mesmo padrão) ───
        data_prevista_recebimento_rascunho_invoice:       'data_previsao_recebimento_rascunho_invoice_pedido',
        data_confirmada_recebimento_rascunho_invoice:     'data_confirmacao_recebimento_rascunho_invoice_pedido',
        data_meta_recebimento_rascunho_invoice:           'data_meta_recebimento_rascunho_invoice_pedido',
        data_prevista_aprovacao_rascunho_invoice:         'data_previsao_aprovacao_rascunho_invoice_pedido',
        data_confirmada_aprovacao_rascunho_invoice:       'data_confirmacao_aprovacao_rascunho_invoice_pedido',
        data_meta_aprovacao_rascunho_invoice:             'data_meta_aprovacao_rascunho_invoice_pedido',
        data_prevista_envio_original_invoice:          'data_previsao_envio_original_invoice_pedido',
        data_confirmada_envio_original_invoice:        'data_confirmacao_envio_original_invoice_pedido',
        data_meta_envio_original_invoice:              'data_meta_envio_original_invoice_pedido',
        data_prevista_recebimento_original_invoice:    'data_previsao_recebimento_original_invoice_pedido',
        data_confirmada_recebimento_original_invoice:  'data_confirmacao_recebimento_original_invoice_pedido',
        data_meta_recebimento_original_invoice:        'data_meta_recebimento_original_invoice_pedido',
        // ─── BLOCO 5: datas documento ───
        data_proforma_invoice:   'data_documento_proforma_pedido',
        data_invoice:            'data_documento_invoice_pedido',
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
        // Armazenados em detalhes_operacionais_pedido (JSON) — merge para não perder outros campos
        const detAtual = (typeof pedido.detalhes_operacionais_pedido === 'object' && pedido.detalhes_operacionais_pedido !== null)
          ? pedido.detalhes_operacionais_pedido as Record<string, unknown>
          : {}
        dadosUpdate = { detalhes_operacionais_pedido: { ...detAtual, [campo]: valor } }
      } else {
        const colunaPrisma = ALIAS_LEGADO_PARA_PRISMA[campo] ?? campo
        // Campos de data Prisma exigem ISO-8601 completo (YYYY-MM-DDTHH:mm:ss.sssZ),
        // mas o frontend envia apenas YYYY-MM-DD (date-only). Convertemos aqui em
        // Date para o Prisma serializar corretamente. Decisão UX 2026-05-13: backend
        // tolerante a date-only (start-of-day UTC), fronts não precisam saber.
        // Mandamento 06: parsing local; null/string vazia → null (limpa o campo).
        const ehCampoData = campo.startsWith('data_') || colunaPrisma.startsWith('data_')
        let valorFinal: unknown = valor
        if (ehCampoData) {
          if (valor === null || valor === undefined || valor === '') {
            valorFinal = null
          } else if (typeof valor === 'string') {
            // Aceita 'YYYY-MM-DD' (date-only) e 'YYYY-MM-DDTHH:mm:ssZ' (já ISO).
            // new Date('YYYY-MM-DD') é interpretado como UTC pelo JS — OK.
            const d = new Date(valor)
            if (isNaN(d.getTime())) {
              throw new AppError(400, `Data invalida para o campo "${campo}": "${valor}". Esperado YYYY-MM-DD ou ISO-8601.`)
            }
            valorFinal = d
          }
        }
        dadosUpdate = { [colunaPrisma]: valorFinal }
      }

      const updated = await db.pedido.update({
        where: { id_pedido: req.params.id_pedido },
        data: dadosUpdate,
        include: { itens_pedido: { orderBy: { sequencia_item_pedido: 'asc' } } },
      })

      // Replicação pai → todos os itens (decisão UX 2026-05-13).
      //
      // Antes: SEMPRE tentava propagar (linha legada com bug — usava o nome
      // legado do campo (e.g. 'incoterm') diretamente no updateMany do item,
      // mas a coluna do item é 'incoterm_item'. Resultado: Prisma rejeitava
      // silenciosamente, propagação nunca funcionou.
      //
      // Agora: replica quando `replicar_em_itens=true` (checkbox no popover)
      // OU quando o campo é id_workspace (regra de negócio: item = mesmo workspace).
      const deveReplicarItens = replicar_em_itens || campo === 'id_workspace'
      if (deveReplicarItens) {
        // Traduz: campo legado (ex: 'incoterm') → campo DDD pedido (ex:
        // 'incoterm_pedido') → campo DDD item (ex: 'incoterm_item').
        const campoPedido = ALIAS_LEGADO_PARA_PRISMA[campo] ?? campo
        if (!isPropagavel(campoPedido)) {
          // Campo não tem correspondente no PedidoItem — skip gracioso.
          // Antes lançava AppError 400, mas agora o UI mostra checkbox
          // "Aplicar a todos" em TODAS as colunas (blacklist de 8). Para
          // campos sem coluna no item (ex: numero_proforma, workspace),
          // a edição do pai já foi aplicada acima; simplesmente não há
          // updateMany a fazer. Log para auditoria.
          console.log(JSON.stringify({
            event: 'PEDIDO_FIELD_REPLICATION_SKIPPED',
            id_organizacao: idOrganizacao,
            id_pedido: req.params.id_pedido,
            campo,
            campo_pedido: campoPedido,
            motivo: 'Campo não existe em MAPA_PROPAGACAO_PEDIDO_ITEM — sem coluna correspondente no PedidoItem',
            ts: new Date().toISOString(),
          }))
        } else {
          const campoItem = obterCampoItemPropagado(campoPedido)
          if (!campoItem) {
            throw new AppError(
              500,
              `Inconsistência: "${campoPedido}" está em isPropagavel mas obterCampoItemPropagado retornou null.`,
            )
          }
          // Mesma conversão de data ISO-8601 aplicada ao pai (acima): se o
          // campoItem é DateTime, string YYYY-MM-DD → Date object.
          const ehDataItem = campoItem.startsWith('data_')
          let valorItem: unknown = valor === undefined ? null : valor
          if (ehDataItem && typeof valorItem === 'string' && valorItem !== '') {
            const d = new Date(valorItem)
            if (!isNaN(d.getTime())) valorItem = d
          } else if (ehDataItem && valorItem === '') {
            valorItem = null
          }
          const resultado = await db.pedidoItem.updateMany({
            where: { id_pedido: req.params.id_pedido, id_organizacao: idOrganizacao },
            data: { [campoItem]: valorItem },
          })
          // Audit log agregado (1 evento por replicação, não N por item) —
          // economiza espaço e facilita auditoria pela equipe.
          console.log(JSON.stringify({
            event: 'PEDIDO_FIELD_REPLICATED_TO_ITEMS',
            id_organizacao: idOrganizacao,
            id_pedido: req.params.id_pedido,
            campo_pedido: campoPedido,
            campo_item: campoItem,
            itens_afetados: resultado.count,
            valor_novo: valor,
            ts: new Date().toISOString(),
          }))
        }
      }

      const pedidoResposta = deveReplicarItens
        ? await db.pedido.findUnique({
            where: { id_pedido: req.params.id_pedido },
            include: { itens_pedido: { orderBy: { sequencia_item_pedido: 'asc' } } },
          })
        : updated

      if (!pedidoResposta) {
        throw new AppError(404, 'Pedido não encontrado após atualização.')
      }

      res.json(mapPedido(pedidoResposta))
    })
  } catch (err) {
    // Logging detalhado para diagnosticar erros 500 difíceis de reproduzir.
    // O usuário consegue ver a stack trace no response (DEV) sem precisar de
    // acesso ao terminal do backend.
    const isPrismaErr = err && typeof err === 'object' && 'code' in err
    const detalhe = {
      mensagem: err instanceof Error ? err.message : String(err),
      codigo: isPrismaErr ? (err as { code?: string }).code : undefined,
      meta:    isPrismaErr ? (err as { meta?: unknown }).meta  : undefined,
      stack:   err instanceof Error ? err.stack?.split('\n').slice(0, 6) : undefined,
      campo:   req.body?.campo,
      replicar_em_itens: req.body?.replicar_em_itens,
    }
    console.error('[PATCH /pedidos/:id/campo] ERRO:', JSON.stringify(detalhe, null, 2))
    // Se for AppError, deixa o handler padrão tratar. Se for erro genérico
    // (500), devolve o detalhe no response pra facilitar diagnóstico.
    if (err instanceof AppError) {
      return next(err)
    }
    return res.status(500).json({ error: { message: detalhe.mensagem, detalhe } })
  }
})

// ── POST /:id_pedido/duplicar — Duplicar pedido ──────────────────────────────

pedidosRouter.post('/:id_pedido/duplicar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const ctx      = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const idOrganizacao = ctx.idOrganizacao
      const idWorkspace   = (req.headers['x-id-workspace'] as string | undefined) ?? idOrganizacao

      const original = await db.pedido.findFirst({
        where: { id_pedido: req.params.id_pedido, id_organizacao: idOrganizacao, id_workspace: idWorkspace },
        include: {
          itens_pedido: { orderBy: { sequencia_item_pedido: 'asc' } },
          snapshots_empresa_pedido: true,
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

      // Débito 2B — FK do status (duplicação sempre nasce em 'rascunho').
      const statusRascunhoDup = await db.statusPedido.findFirst({
        where: { id_organizacao: idOrganizacao, nome_pedido_status: 'rascunho' },
        select: { id_pedido_status: true },
      })
      if (!statusRascunhoDup) {
        console.warn(
          `[POST /pedidos/:id/duplicar] StatusPedido 'rascunho' nao encontrado na organizacao=${idOrganizacao}; ` +
          `duplicado sera criado sem vinculo id_status_pedido.`,
        )
      }

      // withOrganizacao já garante atomicidade — `db` é TransactionClient.
      // Não criar $transaction aninhada (Prisma proíbe).
      // Defesa em profundidade: chamamos o helper após o create — se o
      // original tinha agregados desatualizados, o duplicado nasce correto.
      const dup = await db.pedido.create({
        // @lint-agregados: allow-create-placeholder — recalcularAgregadosPedido
        // roda logo depois do create na mesma transação implícita.
        data: {
          id_pedido: novoPedidoId,
          id_organizacao: idOrganizacao,
          id_workspace: idWorkspace,
          tipo_operacao_pedido: original.tipo_operacao_pedido,
          numero_pedido: `${original.numero_pedido}-COPIA`,
          status_pedido: 'rascunho',
          id_status_pedido: statusRascunhoDup?.id_pedido_status ?? null,
          incoterm_pedido: original.incoterm_pedido,
          moeda_pedido: original.moeda_pedido,
          valor_total_pedido: original.valor_total_pedido,
          casas_decimais_valor_pedido: original.casas_decimais_valor_pedido,
          quantidade_total_pedido: original.quantidade_total_pedido,
          casas_decimais_quantidade_pedido: original.casas_decimais_quantidade_pedido,
          unidade_comercializada_pedido: original.unidade_comercializada_pedido,
          condicao_pagamento_pedido: original.condicao_pagamento_pedido,
          detalhes_operacionais_pedido: original.detalhes_operacionais_pedido,
          itens_pedido: {
            create: itensOriginais.map((item) => ({
              id_item: gerarId('pite'),
              id_organizacao: idOrganizacao,
              id_workspace: idWorkspace,
              sequencia_item_pedido: item.sequencia_item_pedido,
              part_number_item: item.part_number_item,
              ncm_item: item.ncm_item,
              descricao_item: item.descricao_item,
              quantidade_inicial_item: item.quantidade_inicial_item,
              quantidade_atual_item: item.quantidade_inicial_item,
              casas_decimais_quantidade_item: item.casas_decimais_quantidade_item,
              unidade_comercializada_item: item.unidade_comercializada_item,
              moeda_item: item.moeda_item,
              valor_por_unidade_item: item.valor_por_unidade_item,
              valor_total_item: item.valor_total_item,
              casas_decimais_valor_item: item.casas_decimais_valor_item,
              cobertura_cambial_item: item.cobertura_cambial_item,
            })),
          },
          snapshots_empresa_pedido: snapshotsOriginais.length
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
          snapshots_empresa_pedido: true,
        },
      })

      // Recalcular os 5 agregados a partir dos itens copiados.
      await recalcularAgregadosPedido(db, novoPedidoId, idOrganizacao)

      // Re-fetch para retornar com os agregados corretos.
      const duplicado = await db.pedido.findUnique({
        where: { id_pedido: dup.id_pedido },
        include: {
          itens_pedido: { orderBy: { sequencia_item_pedido: 'asc' } },
          snapshots_empresa_pedido: true,
        },
      })

      res.status(201).json(mapPedido(duplicado))
    })
  } catch (err) {
    next(err)
  }
})

// ── POST /:id/itens — Adicionar item ──────────────────────────────────────────

pedidosRouter.post('/:id_pedido/itens', async (req: Request, res: Response, next: NextFunction) => {
  const result = criarItemSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: { message: 'Dados invalidos', details: result.error.flatten() } })
  }

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const ctx      = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const idOrganizacao = ctx.idOrganizacao
      const idWorkspace   = (req.headers['x-id-workspace'] as string | undefined) ?? idOrganizacao

      const pedido = await db.pedido.findFirst({
        where: { id_pedido: req.params.id_pedido, id_organizacao: idOrganizacao, id_workspace: idWorkspace },
        include: {
          snapshots_empresa_pedido: { select: { papel: true, nome_empresa: true } },
        },
      })

      if (!pedido) {
        throw new AppError(404, 'Pedido nao encontrado')
      }

      if (!['rascunho', 'aberto'].includes(pedido.status_pedido)) {
        throw new AppError(400, 'Itens so podem ser adicionados em pedidos Rascunho ou Aberto')
      }

      const itemCount = await db.pedidoItem.count({
        where: { id_pedido: req.params.id_pedido, id_organizacao: idOrganizacao, id_workspace: idWorkspace },
      })

      const propagacaoPedido = construirCamposPropagadosParaItem(pedido as Record<string, unknown>)
      const nomesEmpresa = derivarNomesEmpresaParaItem(
        (pedido.snapshots_empresa_pedido ?? []) as Array<{ papel: string; nome_empresa: string }>,
      )
      const camposHerdados = { ...propagacaoPedido, ...nomesEmpresa }

      const qtdInicial = result.data.quantidade_inicial_item ?? 0
      const valorUnit = result.data.valor_por_unidade_item ?? null
      const valorTotalItem =
        result.data.valor_total_item ?? ((valorUnit ?? 0) * qtdInicial)

      const moedaItemExplicita = result.data.moeda_item?.trim()
      const moedaItem =
        moedaItemExplicita && moedaItemExplicita.length > 0
          ? moedaItemExplicita
          : (camposHerdados.moeda_item as string | undefined) ?? pedido.moeda_pedido ?? 'USD'

      const itemData: Record<string, unknown> = {
        id_item:                        gerarId('pite'),
        id_organizacao:                 idOrganizacao,
        id_workspace:                   idWorkspace,
        id_pedido:                      req.params.id_pedido,
        ...camposHerdados,
        sequencia_item_pedido:          result.data.sequencia_item_pedido ?? (itemCount + 1),
        part_number_item:               result.data.part_number_item ?? '',
        ncm_item:                       result.data.ncm_item ?? '',
        descricao_item:                 result.data.descricao_item ?? '',
        quantidade_inicial_item:        qtdInicial,
        quantidade_atual_item:          qtdInicial,
        quantidade_pronta_item:         0,
        quantidade_transferida_item:    0,
        quantidade_cancelada_item:      0,
        moeda_item:                     moedaItem,
        valor_por_unidade_item:         valorUnit,
        valor_total_item:               valorTotalItem,
        ...(result.data.unidade_comercializada_item != null
          ? { unidade_comercializada_item: result.data.unidade_comercializada_item }
          : camposHerdados.unidade_comercializada_item != null
            ? { unidade_comercializada_item: camposHerdados.unidade_comercializada_item }
            : {}),
        ...(result.data.casas_decimais_quantidade_item !== undefined
          ? { casas_decimais_quantidade_item: result.data.casas_decimais_quantidade_item }
          : {
              casas_decimais_quantidade_item:
                (camposHerdados.casas_decimais_quantidade_item as number | undefined)
                ?? pedido.casas_decimais_quantidade_pedido
                ?? 2,
            }),
        ...(result.data.casas_decimais_valor_item !== undefined
          ? { casas_decimais_valor_item: result.data.casas_decimais_valor_item }
          : {
              casas_decimais_valor_item:
                (camposHerdados.casas_decimais_valor_item as number | undefined)
                ?? pedido.casas_decimais_valor_pedido
                ?? 2,
            }),
      }

      // withOrganizacao já garante atomicidade — `db` é TransactionClient.
      const item = await db.pedidoItem.create({ data: itemData })
      await recalcularAgregadosPedido(db, req.params.id_pedido, idOrganizacao)

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
  peso_liquido_unidade_item:   'peso_liquido_unidade_item',
  peso_bruto_unitario:         'peso_bruto_unitario_item',
  peso_bruto_unidade_item:     'peso_bruto_unidade_item',
  cubagem_unitaria:            'cubagem_unitaria_item',
  cubagem_unidade_item:        'cubagem_unidade_item',
  ...Object.fromEntries(DATAS_FRONT_PARA_ITEM),
}

// Validação cruzada de unidades com cadastros.unidade — extraída para
// `services/validarUnidadesItem` (Mandamentos 06+09).

// ── PUT /:id/itens/:itemId — Atualizar item ──────────────────────────────────

pedidosRouter.put('/:id_pedido/itens/:id_item', async (req: Request, res: Response, next: NextFunction) => {
  const result = atualizarItemSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: { message: 'Dados invalidos', details: result.error.flatten() } })
  }

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const ctx      = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const idOrganizacao = ctx.idOrganizacao

      const item = await db.pedidoItem.findFirst({
        where: { id_item: req.params.id_item, id_pedido: req.params.id_pedido, id_organizacao: idOrganizacao },
      })

      if (!item) {
        throw new AppError(404, 'Item do pedido nao encontrado')
      }

      // Validação cruzada de unidades contra cadastros.unidade (SSOT).
      // Mandamento 06 + 09 — Zod só valida o shape; runtime valida o conteúdo.
      // Falha alta (HTTP 400) se sigla inexistente ou categoria errada.
      const correlationId = (req.headers['x-correlation-id'] as string | undefined) ?? 'no-corr'
      const ctxCadastros: CadastrosRequestContext = {
        id_organizacao: idOrganizacao,
        correlation_id: correlationId,
      }
      await validarUnidadesItem(result.data as Record<string, unknown>, ctxCadastros)
      // Validação cruzada Incoterm — mesma estratégia das unidades.
      await validarIncotermPedidoItem(result.data as Record<string, unknown>, ctxCadastros)

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

      // Recalc condicional: só dispara se algum campo do payload afeta agregado.
      // withOrganizacao já garante atomicidade via $transaction — `db` é o
      // TransactionClient, NÃO criar $transaction aninhada (Prisma proíbe).
      const algumCampoAfetaAgregado = Object.keys(result.data).some(campoItemAfetaAgregado)

      const updated = await db.pedidoItem.update({
        where: { id_item: req.params.id_item },
        data: prismaData,
      })
      if (algumCampoAfetaAgregado) {
        await recalcularAgregadosPedido(db, req.params.id_pedido, idOrganizacao)
      }

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
  'data_prevista_recebimento_rascunho_pedido',
  'data_confirmada_recebimento_rascunho_pedido',
  'data_meta_recebimento_rascunho_pedido',
  'data_prevista_aprovacao_rascunho_pedido',
  'data_confirmada_aprovacao_rascunho_pedido',
  'data_meta_aprovacao_rascunho_pedido',
  'data_documento_pedido',
  'data_prevista_recebimento_rascunho_proforma',
  'data_confirmada_recebimento_rascunho_proforma',
  'data_meta_recebimento_rascunho_proforma',
  'data_prevista_aprovacao_rascunho_proforma',
  'data_confirmada_aprovacao_rascunho_proforma',
  'data_meta_aprovacao_rascunho_proforma',
  'data_prevista_envio_original_proforma',
  'data_confirmada_envio_original_proforma',
  'data_meta_envio_original_proforma',
  'data_prevista_recebimento_original_proforma',
  'data_confirmada_recebimento_original_proforma',
  'data_meta_recebimento_original_proforma',
  'data_proforma_invoice',
  'data_prevista_recebimento_rascunho_invoice',
  'data_confirmada_recebimento_rascunho_invoice',
  'data_meta_recebimento_rascunho_invoice',
  'data_prevista_aprovacao_rascunho_invoice',
  'data_confirmada_aprovacao_rascunho_invoice',
  'data_meta_aprovacao_rascunho_invoice',
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

pedidosRouter.patch('/:id_pedido/itens/:id_item/campo', async (req: Request, res: Response, next: NextFunction) => {
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
      const idOrganizacao = ctx.idOrganizacao

      const item = await db.pedidoItem.findFirst({
        where: { id_item: req.params.id_item, id_pedido: req.params.id_pedido, id_organizacao: idOrganizacao },
      })
      if (!item) throw new AppError(404, 'Item do pedido nao encontrado')

      // ACL: traduz chave pública → coluna DDD. Campos pedido-level (tipo_operacao,
      // datas, ope_*, etc.) que estão em CAMPOS_EDITAVEIS_ITEM não pertencem ao
      // PedidoItem e nunca foram aplicáveis a este endpoint — pass-through era
      // rejeitado pelo Prisma antes do rename e continua inválido agora.
      const campoDdd = publicToDddItem[campo] ?? campo

      // ── Campos texto/enum — update simples ────────────────────────────────────
      // withOrganizacao já garante atomicidade — `db` é TransactionClient.
      // Recalc condicional: campos texto/enum não afetam os 5 agregados
      // (campoItemAfetaAgregado retorna false para todos eles), economiza lock.
      if (ehTexto) {
        let valorFinalItem: unknown = valor === undefined ? null : valor
        if (campoDdd.startsWith('data_')) {
          if (valorFinalItem === null || valorFinalItem === '') {
            valorFinalItem = null
          } else if (typeof valorFinalItem === 'string') {
            const d = new Date(valorFinalItem)
            if (isNaN(d.getTime())) throw new AppError(400, `Data invalida para "${campo}": "${valorFinalItem}". Esperado YYYY-MM-DD.`)
            valorFinalItem = d
          }
        }
        const updated = await db.pedidoItem.update({
          where: { id_item: req.params.id_item },
          data: { [campoDdd]: valorFinalItem },
        })
        if (campoItemAfetaAgregado(campo)) {
          await recalcularAgregadosPedido(db, req.params.id_pedido, idOrganizacao)
        }
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
        db.pedidoSaldoFormula.findUnique({ where: { id_organizacao: idOrganizacao } }),
        db.pedidoCasasDecimais.findUnique({ where: { id_organizacao: idOrganizacao } }),
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

      // withOrganizacao já garante atomicidade — `db` é TransactionClient.
      // Aqui o campo SEMPRE afeta agregado (CAMPOS_EDITAVEIS_ITEM_NUMERICOS =
      // {quantidade_inicial_pedido, valor_por_unidade_item}), recalc incondicional.
      const updated = await db.pedidoItem.update({
        where: { id_item: req.params.id_item },
        data: {
          [campoDdd]:                          valorNumerico,
          quantidade_atual_item: saldo_novo,
          valor_total_item:        valor_total_novo,
        },
      })
      await recalcularAgregadosPedido(db, req.params.id_pedido, idOrganizacao)
      return res.json(mapItem(updated))
    })
  } catch (err) {
    next(err)
  }
})

// ── DELETE /:id/itens/:itemId — Remover item ──────────────────────────────────

pedidosRouter.delete('/:id_pedido/itens/:id_item', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const ctx      = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const idOrganizacao = ctx.idOrganizacao

      const item = await db.pedidoItem.findFirst({
        where: { id_item: req.params.id_item, id_pedido: req.params.id_pedido, id_organizacao: idOrganizacao },
      })

      if (!item) {
        throw new AppError(404, 'Item do pedido nao encontrado')
      }

      if (Number(item.quantidade_transferida_item) > 0) {
        throw new AppError(400, 'Item com quantidade transferida nao pode ser removido')
      }

      // withOrganizacao já garante atomicidade — `db` é TransactionClient.
      // Delete reduz `quantidade_inicial_item` (item some) → afeta valor/qty/peso/cubagem.
      await db.pedidoItem.delete({ where: { id_item: req.params.id_item } })
      await recalcularAgregadosPedido(db, req.params.id_pedido, idOrganizacao)
      res.status(204).send()
    })
  } catch (err) {
    next(err)
  }
})

// ── PATCH /:id/itens/:itemId/cancelar — Cancelar quantidade ───────────────────
// Nota: cancelamento muda `quantidade_atual_item` e `quantidade_cancelada_item`,
// NÃO `quantidade_inicial_item`. Os 5 agregados do helper são todos baseados
// em `quantidade_inicial_item` — portanto NÃO precisam de recalc aqui.

pedidosRouter.patch('/:id_pedido/itens/:id_item/cancelar', async (req: Request, res: Response, next: NextFunction) => {
  const result = cancelarQuantidadeSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: { message: 'Dados invalidos', details: result.error.flatten() } })
  }

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const ctx      = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const idOrganizacao = ctx.idOrganizacao
      const idWorkspace   = (req.headers['x-id-workspace'] as string | undefined) ?? idOrganizacao

      const saldo = await saldoPedido.cancelar(db, {
        pedido_item_id: req.params.id_item,
        quantidade: result.data.quantidade,
        id_organizacao: idOrganizacao,
        id_workspace: idWorkspace,
      })

      res.json(mapItem(saldo as unknown as PedidoItemRaw))
    })
  } catch (err) {
    next(err)
  }
})

// ── PATCH /:id/itens/:itemId/pronta — Atualizar quantidade pronta ─────────────

pedidosRouter.patch('/:id_pedido/itens/:id_item/pronta', async (req: Request, res: Response, next: NextFunction) => {
  const result = atualizarProntaSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: { message: 'Dados invalidos', details: result.error.flatten() } })
  }

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const ctx      = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const idOrganizacao = ctx.idOrganizacao
      const idWorkspace   = (req.headers['x-id-workspace'] as string | undefined) ?? idOrganizacao

      const saldo = await saldoPedido.atualizarPronta(db, {
        pedido_item_id: req.params.id_item,
        quantidade_pronta: result.data.quantidade_pronta_pedido,
        id_organizacao: idOrganizacao,
        id_workspace: idWorkspace,
      })

      res.json(mapItem(saldo as unknown as PedidoItemRaw))
    })
  } catch (err) {
    next(err)
  }
})
