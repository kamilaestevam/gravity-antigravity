import { describe, expect, it } from 'vitest'
import {
  derivarTituloItemDeTituloPedido,
  ehCampoDataReplicavelLista,
  tituloTooltipItemDataReplicavel,
  tituloTooltipListaPorNivel,
  tituloTooltipPedidoDataReplicavel,
} from '../../../../servicos-global/produto/pedido/client/src/shared/tituloTooltipLista'

const titulosPt: Record<string, string> = {
  'pedido.coluna_pai.data_prevista_pedido_pronto_titulo': 'Data Prevista — Pedido Pronto',
  'pedido.coluna_pai.data_prevista_pedido_pronto_item_titulo': 'Data Prevista — Item Pronto',
  'pedido.coluna_pai.data_confirmada_pedido_pronto_titulo': 'Data Confirmada — Pedido Pronto',
  'pedido.coluna_pai.data_consolidacao_pedido_titulo': 'Data de Consolidação do Pedido',
  'pedido.coluna_pai.data_prevista_recebimento_rascunho_pedido_titulo':
    'Data Prevista — Recebimento Draft do Pedido',
  'pedido.coluna_pai.data_prevista_inspecao_pedido_titulo': 'Data Prevista — Inspeção do Pedido',
  'pedido.coluna_pai.data_documento_pedido_titulo': 'Data do Documento do Pedido',
}

const t = ((key: string, opts?: { defaultValue?: string }) => {
  const hit = titulosPt[key]
  if (hit) return hit
  return opts?.defaultValue ?? key
}) as import('i18next').TFunction

describe('ehCampoDataReplicavelLista', () => {
  it('inclui datas replicáveis e exclui data_emissao_pedido', () => {
    expect(ehCampoDataReplicavelLista('data_confirmada_pedido_pronto')).toBe(true)
    expect(ehCampoDataReplicavelLista('data_emissao_pedido')).toBe(false)
  })
})

describe('derivarTituloItemDeTituloPedido', () => {
  it('Pedido Pronto → Item Pronto', () => {
    expect(derivarTituloItemDeTituloPedido('Data Confirmada — Pedido Pronto')).toBe(
      'Data Confirmada — Item Pronto',
    )
  })

  it('do Pedido → do Item', () => {
    expect(derivarTituloItemDeTituloPedido('Data de Consolidação do Pedido')).toBe(
      'Data de Consolidação do Item',
    )
    expect(derivarTituloItemDeTituloPedido('Data Prevista — Recebimento Draft do Pedido')).toBe(
      'Data Prevista — Recebimento Draft do Item',
    )
  })

  it('Inspeção do Pedido → Inspeção do Item', () => {
    expect(derivarTituloItemDeTituloPedido('Data Prevista — Inspeção do Pedido')).toBe(
      'Data Prevista — Inspeção do Item',
    )
  })
})

describe('tituloTooltipItemDataReplicavel', () => {
  it('prefere i18n explícito _item_titulo', () => {
    expect(tituloTooltipItemDataReplicavel(t, 'data_prevista_pedido_pronto')).toBe(
      'Data Prevista — Item Pronto',
    )
  })

  it('deriva quando não há _item_titulo', () => {
    expect(tituloTooltipItemDataReplicavel(t, 'data_confirmada_pedido_pronto')).toBe(
      'Data Confirmada — Item Pronto',
    )
  })
})

describe('tituloTooltipListaPorNivel — datas replicáveis', () => {
  it('nível pai → título pedido', () => {
    expect(tituloTooltipListaPorNivel(t, 'data_documento_pedido', 'pai')).toBe(
      'Data do Documento do Pedido',
    )
  })

  it('nível item → título item derivado', () => {
    expect(tituloTooltipListaPorNivel(t, 'data_documento_pedido', 'item')).toBe(
      'Data do Documento do Item',
    )
  })
})

describe('tituloTooltipPedidoDataReplicavel', () => {
  it('retorna undefined quando não há _titulo', () => {
    expect(tituloTooltipPedidoDataReplicavel(t, 'data_emissao_pedido')).toBeUndefined()
  })
})
