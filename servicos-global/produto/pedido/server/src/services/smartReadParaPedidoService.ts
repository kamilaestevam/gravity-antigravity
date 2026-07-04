/**
 * smartReadParaPedidoService — converte snapshot Smart Read e grava pedido(s).
 * Espelha padrão SmartImportService (domínio Pedido).
 */
import { randomUUID } from 'node:crypto'
import { auditLog } from '../../../../../../servicos-global/servicos-plataforma/historico-global/src/audit-client.js'
import {
  converterLeituraParaPedido,
  type LeituraParaConversaoPedido,
} from '../../../../smart-read/shared/converter-leitura-para-pedido-smart-read.js'
import {
  CriarPedidoDeLeituraSmartReadRespostaSchema,
  type CriarPedidoDeLeituraSmartReadRequest,
  type CriarPedidoDeLeituraSmartReadResposta,
  type PedidoCriadoSmartReadResumo,
} from '../../../../smart-read/shared/conversao-leitura-pedido-smart-read-schema.js'
import { AppError } from '../errors/AppError.js'
import { obterIdSnapshotSmartReadS2s, obterLeituraSmartReadS2s } from '../lib/cliente-leitura-smart-read-pedido.js'
import { buscarSnapshotsCadastrosIniciaisPedido } from '../lib/buscar-snapshots-cadastros-iniciais-pedido.js'
import { recalcularAgregadosPedido } from '../../../../processos-core/src/services/recalcularAgregadosPedido.js'

function gerarId(prefixo: string): string {
  const seq = String(Math.floor(Math.random() * 9999999)).padStart(7, '0')
  const ano = String(new Date().getFullYear()).slice(-2)
  return `${prefixo}_id_${seq}-${ano}`
}

type GrupoPedido = {
  numero_pedido: string
  dados_pedido: Record<string, unknown>
  itens: Record<string, unknown>[]
}

type DbPedido = Record<string, unknown>

export class SmartReadParaPedidoService {
  constructor(private readonly db: DbPedido) {}

  async criarDeLeitura(params: {
    idOrganizacao: string
    idUsuario: string
    idWorkspace: string
    nomeUsuario: string
    payload: CriarPedidoDeLeituraSmartReadRequest
  }): Promise<CriarPedidoDeLeituraSmartReadResposta> {
    const { idOrganizacao, idUsuario, idWorkspace, nomeUsuario, payload } = params

    const leitura = await obterLeituraSmartReadS2s({
      idOrganizacao,
      idUsuario,
      idWorkspace,
      idLeitura: payload.id_leitura,
    })

    if (leitura.status_leitura !== 'COMPLETED') {
      throw new AppError('Leitura ainda nao concluida', 400, 'LEITURA_INCOMPLETA')
    }

    const conversao = converterLeituraParaPedido(leitura as LeituraParaConversaoPedido)
    if (conversao.erros_bloqueantes.length > 0) {
      throw new AppError(conversao.erros_bloqueantes.join('; '), 422, 'CONVERSAO_INVALIDA')
    }

    const gruposValidos = conversao.grupos.filter((g) => g.itens.length > 0)
    if (gruposValidos.length === 0) {
      throw new AppError('Nenhum item mapeado para criar pedido', 422, 'SEM_ITENS')
    }

    const idSnapshot =
      payload.id_snapshot_leitura_smart_read ??
      (await obterIdSnapshotSmartReadS2s({
        idOrganizacao,
        idLeitura: payload.id_leitura,
        idWorkspace,
      }))

    const correlationId = randomUUID()
    const pedidosCriados: PedidoCriadoSmartReadResumo[] = []

    for (const grupo of gruposValidos) {
      const resumo = await this.criarPedidoDeGrupo({
        grupo,
        idOrganizacao,
        idWorkspace,
        idUsuario,
        nomeUsuario,
        idLeitura: payload.id_leitura,
        idSnapshot,
        correlationId,
      })
      pedidosCriados.push(resumo)
    }

    const primeiro = pedidosCriados[0]
    if (!primeiro) {
      throw new AppError('Nenhum pedido criado', 500, 'CRIACAO_FALHOU')
    }

    return CriarPedidoDeLeituraSmartReadRespostaSchema.parse({
      id_pedido: primeiro.id_pedido,
      numero_pedido: primeiro.numero_pedido,
      ids_itens: pedidosCriados.flatMap((p) => p.ids_itens),
      id_leitura: payload.id_leitura,
      id_snapshot_leitura_smart_read: idSnapshot,
      detalhe_mapeamento: conversao.detalhe_mapeamento,
      pedidos_criados: pedidosCriados.length > 1 ? pedidosCriados : undefined,
    })
  }

  private async criarPedidoDeGrupo(params: {
    grupo: GrupoPedido
    idOrganizacao: string
    idWorkspace: string
    idUsuario: string
    nomeUsuario: string
    idLeitura: string
    idSnapshot: string | null
    correlationId: string
  }): Promise<PedidoCriadoSmartReadResumo> {
    const { grupo, idOrganizacao, idWorkspace, idUsuario, nomeUsuario, idLeitura, idSnapshot, correlationId } =
      params

    const moedaPedido = (grupo.dados_pedido.codigo_moeda_pedido as string | undefined) ?? 'USD'
    const itensPreparados = grupo.itens.map((item) => ({
      ...item,
      moeda_item: (item.moeda_item as string | undefined) ?? moedaPedido,
    }))

    const { snapshotsNcm, snapshotsMoeda, snapshotsUnidade } =
      await buscarSnapshotsCadastrosIniciaisPedido({
        idOrganizacao,
        idWorkspace,
        correlationId,
        entrada: {
          moedaPedido,
          itens: itensPreparados.map((item) => ({
            ncm_item: item.ncm_item as string | undefined,
            moeda_item: item.moeda_item as string | undefined,
            unidade_comercializada_item: item.unidade_comercializada_item as string | undefined,
          })),
        },
      })

    const statusRascunho = await (this.db as { statusPedido: { findFirst: Function } }).statusPedido.findFirst({
      where: { id_organizacao: idOrganizacao, nome_pedido_status: 'rascunho' },
      select: { id_pedido_status: true },
    })

    const pedidoId = gerarId('pedi')
    const idsItens: string[] = []

    const pedidoCriado = await (this.db as { pedido: { create: Function } }).pedido.create({
      data: {
        id_pedido: pedidoId,
        id_organizacao: idOrganizacao,
        id_workspace: idWorkspace,
        numero_pedido: grupo.numero_pedido,
        tipo_operacao_pedido: 'importacao',
        status_pedido: 'rascunho',
        id_status_pedido: statusRascunho?.id_pedido_status ?? null,
        incoterm_pedido: (grupo.dados_pedido.incoterm_pedido as string | undefined) ?? null,
        condicao_pagamento_pedido: (grupo.dados_pedido.condicao_pagamento_pedido as string | undefined) ?? null,
        codigo_moeda_pedido: moedaPedido,
        moeda_pedido: moedaPedido,
        valor_total_pedido: 0,
        quantidade_total_pedido: 0,
        itens_pedido: {
          create: itensPreparados.map((item, index) => {
            const idItem = gerarId('pite')
            idsItens.push(idItem)
            const qty = Number(item.quantidade_inicial_item ?? 1)
            const valorUnit = (item.valor_por_unidade_item as number | undefined) ?? null
            return {
              id_item: idItem,
              id_organizacao: idOrganizacao,
              id_workspace: idWorkspace,
              sequencia_item_pedido: index + 1,
              part_number_item: String(item.part_number_item),
              descricao_item: (item.descricao_item as string | undefined) ?? null,
              quantidade_inicial_item: qty,
              quantidade_atual_item: qty,
              ncm_item: (item.ncm_item as string | undefined) ?? null,
              moeda_item: (item.moeda_item as string | undefined) ?? moedaPedido,
              valor_por_unidade_item: valorUnit,
              valor_total_item: valorUnit != null ? valorUnit * qty : null,
              peso_bruto_unitario_item: (item.peso_bruto_unitario_item as number | undefined) ?? null,
              peso_liquido_unitario_item: (item.peso_liquido_unitario_item as number | undefined) ?? null,
            }
          }),
        },
        snapshots_ncm_pedido: snapshotsNcm.length ? { create: snapshotsNcm } : undefined,
        snapshots_moeda_pedido: snapshotsMoeda.length ? { create: snapshotsMoeda } : undefined,
        snapshots_unidade_pedido: snapshotsUnidade.length ? { create: snapshotsUnidade } : undefined,
      },
      select: { id_pedido: true, numero_pedido: true },
    })

    await recalcularAgregadosPedido(
      this.db as Parameters<typeof recalcularAgregadosPedido>[0],
      pedidoId,
      idOrganizacao,
    )

    auditLog({
      id_organizacao: idOrganizacao,
      tipo_ator_historico_log: 'USUARIO',
      id_ator_historico_log: idUsuario,
      nome_ator_historico_log: nomeUsuario,
      modulo_historico_log: 'pedido',
      tipo_recurso_historico_log: 'Pedido',
      id_recurso_historico_log: pedidoCriado.id_pedido,
      acao_historico_log: 'CRIAR',
      detalhe_acao_historico_log: `Pedido ${pedidoCriado.numero_pedido} criado via Smart Docs (canal smart_read, leitura ${idLeitura})`,
      estado_posterior_historico_log: {
        canal_criacao: 'smart_read',
        id_leitura: idLeitura,
        id_snapshot_leitura_smart_read: idSnapshot,
      },
    })

    return {
      id_pedido: pedidoCriado.id_pedido,
      numero_pedido: pedidoCriado.numero_pedido,
      ids_itens: idsItens,
    }
  }
}

export function criarSmartReadParaPedidoService(db: DbPedido): SmartReadParaPedidoService {
  return new SmartReadParaPedidoService(db)
}
