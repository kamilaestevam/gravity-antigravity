import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  ALIAS_CAMPO_PEDIDO_CONVERSAO,
  CAMPOS_ITEM_CONVERSAO_PERMITIDOS,
  CAMPOS_PEDIDO_CONVERSAO_PERMITIDOS,
  montarCreatePedidoDeConversaoSmartRead,
} from '../../../../servicos-global/produto/pedido/server/src/lib/montar-create-pedido-de-conversao-smart-read.ts'

const FRAGMENT = readFileSync(
  join(process.cwd(), 'servicos-global/produto/pedido/prisma/fragment.prisma'),
  'utf8',
)

function extrairCamposEscalaresModelPrisma(modelName: string): Set<string> {
  const re = new RegExp(`model ${modelName}\\s*\\{([\\s\\S]*?)^\\}`, 'm')
  const match = FRAGMENT.match(re)
  if (!match?.[1]) throw new Error(`Model ${modelName} não encontrado no fragment.prisma`)
  const campos = new Set<string>()
  for (const line of match[1].split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('@@')) continue
    const scalar = trimmed.match(
      /^(\w+)\s+(String|Int|Decimal|DateTime|Json|Boolean|Float)/,
    )
    if (scalar?.[1]) campos.add(scalar[1])
  }
  return campos
}

const CAMPOS_PEDIDO_PRISMA = extrairCamposEscalaresModelPrisma('Pedido')
const CAMPOS_ITEM_PRISMA = extrairCamposEscalaresModelPrisma('PedidoItem')
const CAMPOS_SNAPSHOT_NCM_PRISMA = extrairCamposEscalaresModelPrisma('PedidoSnapshotNcm')
const CAMPOS_SNAPSHOT_MOEDA_PRISMA = extrairCamposEscalaresModelPrisma('PedidoSnapshotMoeda')

describe('montar-create-pedido-de-conversao-smart-read', () => {
  it('whitelist do converter cobre só campos que existem no Pedido Prisma', () => {
    for (const campo of CAMPOS_PEDIDO_CONVERSAO_PERMITIDOS) {
      expect(CAMPOS_PEDIDO_PRISMA.has(campo), `campo pedido invalido: ${campo}`).toBe(true)
    }
    for (const destino of Object.values(ALIAS_CAMPO_PEDIDO_CONVERSAO)) {
      expect(CAMPOS_PEDIDO_PRISMA.has(destino), `alias destino invalido: ${destino}`).toBe(true)
    }
    for (const alias of Object.keys(ALIAS_CAMPO_PEDIDO_CONVERSAO)) {
      expect(CAMPOS_PEDIDO_PRISMA.has(alias), `alias legado vazou para Prisma: ${alias}`).toBe(false)
    }
  })

  it('whitelist de item cobre só campos que existem no PedidoItem Prisma', () => {
    for (const campo of CAMPOS_ITEM_CONVERSAO_PERMITIDOS) {
      expect(CAMPOS_ITEM_PRISMA.has(campo), `campo item invalido: ${campo}`).toBe(true)
    }
  })

  it('payload montado usa apenas campos escalares validos do fragment.prisma', () => {
    const { data } = montarCreatePedidoDeConversaoSmartRead({
      pedidoId: 'pedi_id_0000001-26',
      idOrganizacao: 'org-1',
      idWorkspace: 'ws-1',
      idStatusPedido: 'status-rascunho',
      gerarIdItem: () => 'pite_id_0000001-26',
      snapshotsNcm: [
        {
          id_organizacao: 'org-1',
          id_workspace: 'ws-1',
          codigo_ncm: '84713012',
          descricao_ncm: 'Notebook',
          ipi_ncm: null,
          ii_ncm: null,
          pis_ncm: null,
          cofins_ncm: null,
          motivo_congelamento: 'emissao',
        },
      ],
      snapshotsMoeda: [
        {
          id_organizacao: 'org-1',
          id_workspace: 'ws-1',
          codigo_moeda: 'USD',
          nome_moeda: 'Dolar',
          simbolo_moeda: 'US$',
          motivo_congelamento: 'emissao',
        },
      ],
      snapshotsUnidade: [],
      grupo: {
        numero_pedido: 'PO-9001',
        dados_pedido: {
          incoterm_pedido: 'FOB',
          codigo_moeda_pedido: 'USD',
          condicao_pagamento_pedido: '30 dias',
          campo_fantasma: 'nao-deve-vazar',
        },
        itens: [
          {
            part_number_item: 'PN-001',
            descricao_item: null,
            ncm_item: null,
            quantidade_inicial_item: 5,
            valor_por_unidade_item: 100,
            campo_extra_item: 'x',
          },
        ],
      },
    })

    for (const campo of Object.keys(data)) {
      if (campo.startsWith('snapshots_') || campo === 'itens_pedido') continue
      expect(CAMPOS_PEDIDO_PRISMA.has(campo), `campo pedido nao Prisma: ${campo}`).toBe(true)
    }

    expect(data.codigo_moeda_pedido).toBeUndefined()
    expect(data.campo_fantasma).toBeUndefined()
    expect(data.moeda_pedido).toBe('USD')
    expect(data.data_emissao_pedido).toBeDefined()

    const item = (data.itens_pedido as { create: Record<string, unknown>[] }).create[0]
    for (const campo of Object.keys(item)) {
      expect(CAMPOS_ITEM_PRISMA.has(campo), `campo item nao Prisma: ${campo}`).toBe(true)
    }
    expect(item.campo_extra_item).toBeUndefined()
    expect(item.descricao_item).toBe('')
    expect(item.ncm_item).toBe('')
    expect(item.incoterm_item).toBe('FOB')
    expect(item.moeda_item).toBe('USD')

    const snapNcm = (data.snapshots_ncm_pedido as { create: Record<string, unknown>[] }).create[0]
    for (const campo of Object.keys(snapNcm)) {
      expect(CAMPOS_SNAPSHOT_NCM_PRISMA.has(campo), `campo snapshot ncm invalido: ${campo}`).toBe(true)
    }

    const snapMoeda = (data.snapshots_moeda_pedido as { create: Record<string, unknown>[] }).create[0]
    for (const campo of Object.keys(snapMoeda)) {
      expect(CAMPOS_SNAPSHOT_MOEDA_PRISMA.has(campo), `campo snapshot moeda invalido: ${campo}`).toBe(true)
    }
  })
})
