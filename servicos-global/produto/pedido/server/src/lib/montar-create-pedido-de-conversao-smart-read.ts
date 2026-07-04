/**
 * Monta payload Prisma para pedido.create() a partir da conversão Smart Read.
 * Whitelist explícita — nunca faz spread cego de dados_pedido/item do converter.
 */
import {
  construirCamposPropagadosParaItem,
  MAPA_PROPAGACAO_PEDIDO_ITEM,
} from '../../../shared/mapaPropagacaoPedidoItem.js'
import type {
  SnapshotMoedaData,
  SnapshotNcmData,
  SnapshotUnidadeData,
} from '../../../../processos-core/src/services/pedidoSnapshots.js'

/** Campos do converter (REGRAS_PEDIDO) permitidos no create do Pedido. */
export const CAMPOS_PEDIDO_CONVERSAO_PERMITIDOS = [
  'incoterm_pedido',
  'moeda_pedido',
  'condicao_pagamento_pedido',
  'data_documento_proforma_pedido',
  'data_documento_invoice_pedido',
  'data_emissao_pedido',
  'numero_proforma_pedido',
  'numero_invoice_pedido',
] as const

/** Campos do converter (REGRAS_ITEM) permitidos no create do PedidoItem. */
export const CAMPOS_ITEM_CONVERSAO_PERMITIDOS = [
  'part_number_item',
  'descricao_item',
  'ncm_item',
  'quantidade_inicial_item',
  'valor_por_unidade_item',
  'valor_total_item',
  'peso_bruto_unitario_item',
  'peso_liquido_unitario_item',
  'unidade_comercializada_item',
  'moeda_item',
  'casas_decimais_quantidade_item',
  'casas_decimais_valor_item',
] as const

/** Aliases legados do converter → nome Prisma real (nunca gravar alias). */
export const ALIAS_CAMPO_PEDIDO_CONVERSAO: Readonly<Record<string, string>> = {
  codigo_moeda_pedido: 'moeda_pedido',
}

const CAMPOS_PEDIDO_STRING_OBRIGATORIOS = new Set<string>()
const CAMPOS_ITEM_STRING_OBRIGATORIOS = new Set(['part_number_item', 'ncm_item', 'descricao_item'])

const CAMPOS_PEDIDO_DATETIME = new Set([
  'data_documento_proforma_pedido',
  'data_documento_invoice_pedido',
  'data_emissao_pedido',
])

/** Campos escalares permitidos no pedido.create — espelha Smart Import (montarDadosPedido). */
export const CAMPOS_PEDIDO_CREATE_PERMITIDOS = new Set<string>([
  'id_pedido',
  'id_organizacao',
  'id_workspace',
  'numero_pedido',
  'tipo_operacao_pedido',
  'status_pedido',
  'id_status_pedido',
  'moeda_pedido',
  'data_emissao_pedido',
  'casas_decimais_valor_pedido',
  'casas_decimais_quantidade_pedido',
  'casas_decimais_peso_pedido',
  'casas_decimais_cubagem_pedido',
  ...CAMPOS_PEDIDO_CONVERSAO_PERMITIDOS,
])

/** Campos escalares permitidos em cada item do nested create. */
export const CAMPOS_ITEM_CREATE_PERMITIDOS = new Set<string>([
  'id_item',
  'id_organizacao',
  'id_workspace',
  'sequencia_item_pedido',
  'quantidade_atual_item',
  ...CAMPOS_ITEM_CONVERSAO_PERMITIDOS,
  ...Object.values(MAPA_PROPAGACAO_PEDIDO_ITEM),
])

function filtrarCamposPermitidos(
  origem: Record<string, unknown>,
  permitidos: ReadonlySet<string>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [campo, valor] of Object.entries(origem)) {
    if (permitidos.has(campo)) out[campo] = valor
  }
  return out
}

export type GrupoConversaoSmartRead = {
  numero_pedido: string
  dados_pedido: Record<string, unknown>
  itens: Record<string, unknown>[]
}

function normalizarStringObrigatoria(valor: unknown): string {
  if (valor == null) return ''
  return String(valor)
}

function normalizarData(valor: unknown): Date | null {
  if (valor == null || valor === '') return null
  if (valor instanceof Date) return valor
  const parsed = new Date(String(valor))
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function extrairCamposPedidoWhitelisted(dadosPedido: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}

  for (const [origem, destino] of Object.entries(ALIAS_CAMPO_PEDIDO_CONVERSAO)) {
    if (origem in dadosPedido && !(destino in dadosPedido)) {
      out[destino] = dadosPedido[origem]
    }
  }

  for (const campo of CAMPOS_PEDIDO_CONVERSAO_PERMITIDOS) {
    if (campo in dadosPedido) {
      out[campo] = dadosPedido[campo]
    }
  }

  for (const [campo, valor] of Object.entries(out)) {
    if (CAMPOS_PEDIDO_DATETIME.has(campo)) {
      out[campo] = normalizarData(valor)
    } else if (CAMPOS_PEDIDO_STRING_OBRIGATORIOS.has(campo)) {
      out[campo] = normalizarStringObrigatoria(valor)
    }
  }

  return out
}

function extrairCamposItemWhitelisted(item: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const campo of CAMPOS_ITEM_CONVERSAO_PERMITIDOS) {
    if (campo in item) {
      out[campo] = item[campo]
    }
  }
  for (const campo of CAMPOS_ITEM_STRING_OBRIGATORIOS) {
    out[campo] = normalizarStringObrigatoria(out[campo])
  }
  return out
}

export function resolverMoedaPedidoDeGrupo(dadosPedido: Record<string, unknown>): string {
  const bruto =
    dadosPedido.moeda_pedido ??
    dadosPedido.codigo_moeda_pedido ??
    'USD'
  const texto = String(bruto).trim()
  return texto.length > 0 ? texto : 'USD'
}

export type MontarCreatePedidoDeConversaoParams = {
  pedidoId: string
  idOrganizacao: string
  idWorkspace: string
  idStatusPedido: string | null
  grupo: GrupoConversaoSmartRead
  gerarIdItem: () => string
  snapshotsNcm: SnapshotNcmData[]
  snapshotsMoeda: SnapshotMoedaData[]
  snapshotsUnidade: SnapshotUnidadeData[]
}

export function montarCreatePedidoDeConversaoSmartRead(
  params: MontarCreatePedidoDeConversaoParams,
): Record<string, unknown> {
  const {
    pedidoId,
    idOrganizacao,
    idWorkspace,
    idStatusPedido,
    grupo,
    gerarIdItem,
    snapshotsNcm,
    snapshotsMoeda,
    snapshotsUnidade,
  } = params

  const camposPedidoConversao = extrairCamposPedidoWhitelisted(grupo.dados_pedido)
  const moedaPedido = resolverMoedaPedidoDeGrupo({
    ...grupo.dados_pedido,
    ...camposPedidoConversao,
  })

  const pedidoBaseBruto: Record<string, unknown> = {
    id_pedido: pedidoId,
    id_organizacao: idOrganizacao,
    id_workspace: idWorkspace,
    numero_pedido: grupo.numero_pedido,
    tipo_operacao_pedido: 'importacao',
    status_pedido: 'rascunho',
    moeda_pedido: moedaPedido,
    data_emissao_pedido: camposPedidoConversao.data_emissao_pedido ?? new Date(),
    casas_decimais_valor_pedido: 2,
    casas_decimais_quantidade_pedido: 2,
    casas_decimais_peso_pedido: 3,
    casas_decimais_cubagem_pedido: 3,
    ...camposPedidoConversao,
    ...(idStatusPedido ? { id_status_pedido: idStatusPedido } : {}),
  }

  const pedidoBase = filtrarCamposPermitidos(pedidoBaseBruto, CAMPOS_PEDIDO_CREATE_PERMITIDOS)
  const propagacaoPedido = filtrarCamposPermitidos(
    construirCamposPropagadosParaItem(pedidoBase),
    CAMPOS_ITEM_CREATE_PERMITIDOS,
  )
  const idsItens: string[] = []

  const itensCreate = grupo.itens.map((itemBruto, index) => {
    const itemWhitelisted = extrairCamposItemWhitelisted(itemBruto)
    const moedaItem = (itemWhitelisted.moeda_item as string | undefined) ?? moedaPedido
    const qty = Number(itemWhitelisted.quantidade_inicial_item ?? 1)
    const valorUnit = (itemWhitelisted.valor_por_unidade_item as number | undefined) ?? null
    const idItem = gerarIdItem()
    idsItens.push(idItem)

    return filtrarCamposPermitidos(
      {
        ...propagacaoPedido,
        id_item: idItem,
        id_organizacao: idOrganizacao,
        id_workspace: idWorkspace,
        sequencia_item_pedido: index + 1,
        part_number_item: itemWhitelisted.part_number_item,
        descricao_item: itemWhitelisted.descricao_item,
        ncm_item: itemWhitelisted.ncm_item,
        quantidade_inicial_item: qty,
        quantidade_atual_item: qty,
        moeda_item: moedaItem,
        valor_por_unidade_item: valorUnit,
        valor_total_item:
          itemWhitelisted.valor_total_item ??
          (valorUnit != null ? valorUnit * qty : null),
        peso_bruto_unitario_item: itemWhitelisted.peso_bruto_unitario_item ?? null,
        peso_liquido_unitario_item: itemWhitelisted.peso_liquido_unitario_item ?? null,
        casas_decimais_quantidade_item:
          itemWhitelisted.casas_decimais_quantidade_item ??
          pedidoBase.casas_decimais_quantidade_pedido ??
          2,
        casas_decimais_valor_item:
          itemWhitelisted.casas_decimais_valor_item ?? pedidoBase.casas_decimais_valor_pedido ?? 2,
        ...(itemWhitelisted.unidade_comercializada_item != null
          ? { unidade_comercializada_item: itemWhitelisted.unidade_comercializada_item }
          : {}),
      },
      CAMPOS_ITEM_CREATE_PERMITIDOS,
    )
  })

  return {
    data: {
      ...pedidoBase,
      itens_pedido: { create: itensCreate },
      snapshots_ncm_pedido: snapshotsNcm.length ? { create: snapshotsNcm } : undefined,
      snapshots_moeda_pedido: snapshotsMoeda.length ? { create: snapshotsMoeda } : undefined,
      snapshots_unidade_pedido: snapshotsUnidade.length ? { create: snapshotsUnidade } : undefined,
    },
    idsItens,
  }
}
