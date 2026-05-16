/**
 * transferirService.ts — Lógica de negócio de transferência de pedidos
 *
 * Todos os métodos recebem id_organizacao e executam queries com filtro de tenant.
 * A transação garante atomicidade: ou tudo é gravado, ou nada.
 */

import { PrismaClient, Prisma } from '@prisma/client'
import { auditLog } from '../../../../../../servicos-global/servicos-plataforma/historico-global/src/audit-client.js'
import { recalcularAgregadosPedido as recalcularAgregadosCanonico } from '../../../../../../servicos-global/produto/processos-core/src/services/recalcularAgregadosPedido.js'

type Tx = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>

// ── Erro local (padrão project) ───────────────────────────────────────────────

class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code: string = 'BAD_REQUEST',
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export { AppError }

// ── Tipos de entrada (espelha o frontend mas sem importar do client) ────────────

export type CenarioTransfer =
  | 'reducao_simples'
  | 'split_novo_pedido'
  | 'split_pedido_existente'
  | 'multi_split'
  | 'substituicao_pura'
  | 'split_substituicao'
  | 'split_data'
  | 'split_destino_logistico'
  | 'transfer_intercompany'
  | 'reversao'
  | 'agrupamento_inverso'

export interface TransferDestino {
  tipo: 'novo' | 'existente' | 'mesmo'
  pedido_id?: string
  quantidade: number
  part_number?: string
  data_embarque?: string
  porto_destino?: string
  company_id?: string
}

export interface TransferPayload {
  cenario: CenarioTransfer
  pedido_id: string
  item_id: string
  quantidade_origem: number
  destinos: TransferDestino[]
  numero_pedido_novo?: string
  reverter_transfer_id?: string
}

export interface TransferPreview {
  cenario: CenarioTransfer
  origem: {
    pedido_numero: string
    item_part_number: string
    quantidade_atual_pedido: number
    quantidade_apos: number
    encerra: boolean
  }
  destinos: {
    tipo: 'novo' | 'existente'
    pedido_numero?: string
    quantidade: number
    alertas: string[]
  }[]
  alertas_globais: string[]
}

export interface TransferResultado {
  pedido_origem_id: string
  pedidos_destino_ids: string[]
  pedidos_criados: string[]
  itens_excluidos: string[]
  pedidos_encerrados: string[]
}

// Cenários que não podem ser revertidos
const CENARIOS_IRREVERSIVEIS = new Set<CenarioTransfer>([
  'reducao_simples',
  'transfer_intercompany',
])

// ── Serviço ───────────────────────────────────────────────────────────────────

export class TransferirService {
  // ── Pré-visualização (sem alterar banco) ─────────────────────────────────────

  async preview(id_organizacao: string, payload: TransferPayload, db: PrismaClient): Promise<TransferPreview> {
    const pedido = await db.pedido.findFirst({
      where: { id_pedido: payload.pedido_id, id_organizacao: id_organizacao },
      include: { itens_pedido: { orderBy: { sequencia_item_pedido: 'asc' } } },
    }) as unknown as { numero_pedido: string; itens_pedido: Array<Record<string, unknown>> } | null
    if (!pedido) throw new AppError('Pedido de origem não encontrado', 404, 'NOT_FOUND')

    const item = pedido.itens_pedido.find((i) => i.id_item === payload.item_id)
    if (!item) throw new AppError('Item não encontrado no pedido', 404, 'NOT_FOUND')

    const saldoAtual = Number(item.quantidade_atual_item)
    const quantidadeApos = saldoAtual - payload.quantidade_origem
    const alertasGlobais: string[] = []

    if (payload.quantidade_origem > saldoAtual) {
      alertasGlobais.push(`Quantidade solicitada (${payload.quantidade_origem}) excede a disponível (${saldoAtual})`)
    }

    if (quantidadeApos <= 0) {
      alertasGlobais.push('Pedido de origem ficará com quantidade zero após a transferência')
    }

    const destinosPreview = await Promise.all(
      payload.destinos.map(async (d) => {
        const alertas: string[] = []
        let pedidoNumero: string | undefined

        if (d.tipo === 'existente' && d.pedido_id) {
          const pedidoDestino = await db.pedido.findFirst({
            where: { id_pedido: d.pedido_id, id_organizacao: id_organizacao },
          })
          if (!pedidoDestino) {
            alertas.push('Pedido destino não encontrado')
          } else {
            pedidoNumero = pedidoDestino.numero_pedido
          }
        }

        return {
          tipo: (d.tipo === 'mesmo' ? 'existente' : d.tipo) as 'novo' | 'existente',
          pedido_numero: pedidoNumero,
          quantidade: d.quantidade,
          alertas,
        }
      })
    )

    return {
      cenario: payload.cenario,
      origem: {
        pedido_numero: pedido.numero_pedido,
        item_part_number: String(item.part_number_item ?? ''),
        quantidade_atual_pedido: saldoAtual,
        quantidade_apos: Math.max(0, quantidadeApos),
        encerra: quantidadeApos <= 0,
      },
      destinos: destinosPreview,
      alertas_globais: alertasGlobais,
    }
  }

  // ── Confirmação (executa em $transaction) ─────────────────────────────────────

  async confirmar(id_organizacao: string, id_usuario: string, nome_usuario: string, payload: TransferPayload, db: PrismaClient): Promise<TransferResultado> {
    const pedidoOrigem = await db.pedido.findFirst({
      where: { id_pedido: payload.pedido_id, id_organizacao: id_organizacao },
      include: { itens_pedido: { orderBy: { sequencia_item_pedido: 'asc' } } },
    }) as unknown as { id_pedido: string; itens_pedido: Array<Record<string, unknown>> } & Record<string, unknown> | null
    if (!pedidoOrigem) throw new AppError('Pedido de origem não encontrado', 404, 'NOT_FOUND')

    const itemOrigem = pedidoOrigem.itens_pedido.find((i) => i.id_item === payload.item_id) as Record<string, unknown> | undefined
    if (!itemOrigem) throw new AppError('Item não encontrado no pedido', 404, 'NOT_FOUND')

    await this.validarQuantidade(Number(itemOrigem.quantidade_atual_item), payload.quantidade_origem)

    // Validar número do novo pedido antes de iniciar a transação
    if (payload.numero_pedido_novo) {
      const jaExiste = await db.pedido.findFirst({
        where: { id_organizacao: id_organizacao, numero_pedido: payload.numero_pedido_novo },
      })
      if (jaExiste) {
        throw new AppError(
          `Já existe um pedido com o número "${payload.numero_pedido_novo}". Escolha outro número.`,
          409,
          'NUMERO_PEDIDO_DUPLICADO',
        )
      }
    }

    const pedidosDestinoIds: string[] = []
    const pedidosCriados: string[] = []
    const itensExcluidos: string[] = []
    const pedidosEncerrados: string[] = []

    // Fase C fix: o `db` já vem dentro de uma transação (`withOrganizacao` no
    // handler de rota), então `$transaction` aninhado quebra com
    // "db.$transaction is not a function" (Prisma.TransactionClient não expõe).
    // Usar `db` direto como `tx`.
    {
      const tx: Tx = db as unknown as Tx
      // Processar cada destino
      for (const destino of payload.destinos) {
        if (destino.tipo === 'novo') {
          const numero = payload.numero_pedido_novo ?? `PO-TRANS-${Date.now()}`
          const novoPedido = await this.criarPedidoDestino(id_organizacao, numero, pedidoOrigem, tx)
          pedidosCriados.push(novoPedido.id_pedido)
          pedidosDestinoIds.push(novoPedido.id_pedido)

          // Criar item no pedido novo — sequencia começa em 1
          const itemData = this.prepararItemDestino(itemOrigem, novoPedido.id_pedido, destino, 1)
          await tx.pedidoItem.create({ data: itemData as unknown as Prisma.PedidoItemUncheckedCreateInput })
        } else if (destino.tipo === 'existente' && destino.pedido_id) {
          const pedidoDestino = await tx.pedido.findFirst({
            where: { id_pedido: destino.pedido_id, id_organizacao: id_organizacao },
            include: { itens_pedido: { orderBy: { sequencia_item_pedido: 'asc' } } },
          })
          if (!pedidoDestino) {
            throw new AppError(`Pedido destino ${destino.pedido_id} não encontrado`, 404, 'NOT_FOUND')
          }
          pedidosDestinoIds.push(pedidoDestino.id_pedido)

          // Verificar se já existe item com mesmo part_number no destino
          const partTarget = destino.part_number ?? itemOrigem.part_number_item
          const itemExistente = pedidoDestino.itens_pedido.find((i: Record<string, unknown>) => i.part_number_item === partTarget)

          if (itemExistente) {
            await tx.pedidoItem.update({
              where: { id_item: itemExistente.id_item as string },
              data: {
                quantidade_atual_item: Number(itemExistente.quantidade_atual_item) + destino.quantidade,
                quantidade_inicial_item: Number(itemExistente.quantidade_inicial_item) + destino.quantidade,
                // quantidade_transferida_item NÃO se altera: o destino recebe, não transfere para fora
              },
            })
          } else {
            // sequencia = próxima após os itens já existentes no destino
            const sequenciaDestino = (pedidoDestino.itens_pedido?.length ?? 0) + 1
            const itemData = this.prepararItemDestino(itemOrigem, pedidoDestino.id_pedido, destino, sequenciaDestino)
            await tx.pedidoItem.create({ data: itemData as unknown as Prisma.PedidoItemUncheckedCreateInput })
          }

          await this.recalcularAgregados(id_organizacao, pedidoDestino.id_pedido, tx)
        } else if (destino.tipo === 'mesmo' && payload.cenario === 'substituicao_pura') {
          // Substituição pura — troca o part_number no mesmo pedido
          await tx.pedidoItem.update({
            where: { id_item: itemOrigem.id_item as string },
            data: { part_number_item: destino.part_number },
          })
        }
      }

      // Reduzir quantidade do item de origem (para todos os cenários exceto substituicao_pura)
      if (payload.cenario !== 'substituicao_pura') {
        const novaQty = Number(itemOrigem.quantidade_atual_item) - payload.quantidade_origem
        await tx.pedidoItem.update({
          where: { id_item: itemOrigem.id_item as string },
          data: {
            quantidade_atual_item: novaQty,
            quantidade_transferida_item: Number(itemOrigem.quantidade_transferida_item) + payload.quantidade_origem,
          },
        })

        // Avaliar encerramento por configuração
        const resultado = await this.avaliarEncerramentoPedido(id_organizacao, payload.pedido_id, tx)
        itensExcluidos.push(...resultado.itensExcluidos)
        pedidosEncerrados.push(...resultado.pedidosEncerrados)
      }

      await this.recalcularAgregados(id_organizacao, payload.pedido_id, tx)

      // Gravar histórico de transferência
      await this.gravarHistorico(id_organizacao, id_usuario, nome_usuario, payload, pedidosDestinoIds, tx)
    }

    return {
      pedido_origem_id: payload.pedido_id,
      pedidos_destino_ids: pedidosDestinoIds,
      pedidos_criados: pedidosCriados,
      itens_excluidos: itensExcluidos,
      pedidos_encerrados: pedidosEncerrados,
    }
  }

  // ── Reversão ──────────────────────────────────────────────────────────────────

  async reverter(id_organizacao: string, id_usuario: string, nome_usuario: string, transferId: string, db: PrismaClient): Promise<TransferResultado> {
    // Tabela: pedido_transferencia (renomeada de tracking_items_transferidos).
    // Model: PedidoTransferencia.
    const historico = await db.pedidoTransferencia.findFirst({
      where: { id_pedido_transferencia: transferId, id_organizacao: id_organizacao },
    })
    if (!historico) throw new AppError('Registro de transferência não encontrado', 404, 'NOT_FOUND')
    if (historico.revertido_pedido_transferencia) throw new AppError('Esta transferência já foi revertida', 409, 'CONFLICT')

    const cenario = historico.cenario_pedido_transferencia as CenarioTransfer
    if (CENARIOS_IRREVERSIVEIS.has(cenario)) {
      throw new AppError(`Cenário "${cenario}" não é reversível`, 422, 'NOT_REVERSIBLE')
    }

    const destinos: TransferDestino[] = JSON.parse(historico.destinos_pedido_transferencia)
    const itensExcluidos: string[] = []
    const pedidosEncerrados: string[] = []

    // Fase C fix: o `db` já vem dentro de uma transação (`withOrganizacao` no
    // handler de rota), então `$transaction` aninhado quebra com
    // "db.$transaction is not a function" (Prisma.TransactionClient não expõe).
    // Usar `db` direto como `tx`.
    {
      const tx: Tx = db as unknown as Tx
      // Devolver quantidade ao item de origem
      const itemOrigem = await tx.pedidoItem.findFirst({
        where: { id_item: historico.id_item_origem, id_organizacao: id_organizacao },
      })
      if (itemOrigem) {
        await tx.pedidoItem.update({
          where: { id_item: itemOrigem.id_item },
          data: {
            quantidade_atual_item: Number(itemOrigem.quantidade_atual_item) + Number(historico.quantidade_pedido_transferencia),
            quantidade_transferida_item: Math.max(0, Number(itemOrigem.quantidade_transferida_item) - Number(historico.quantidade_pedido_transferencia)),
          },
        })
      }

      // Remover quantidade dos destinos
      for (const destino of destinos) {
        if (destino.pedido_id) {
          const pedidoDestino = await tx.pedido.findFirst({
            where: { id_pedido: destino.pedido_id, id_organizacao: id_organizacao },
            include: { itens_pedido: { orderBy: { sequencia_item_pedido: 'asc' } } },
          })
          if (pedidoDestino) {
            const itemDestino = pedidoDestino.itens_pedido.find((i: Record<string, unknown>) =>
              i.part_number_item === (destino.part_number ?? itemOrigem?.part_number_item)
            )
            if (itemDestino) {
              const novaQty = Number(itemDestino.quantidade_atual_item) - destino.quantidade
              if (novaQty <= 0) {
                await tx.pedidoItem.delete({ where: { id_item: itemDestino.id_item as string } })
                itensExcluidos.push(itemDestino.id_item as string)
                // Resequenciar itens restantes para manter sequência contínua (1, 2, 3...)
                await this.resequenciarItens(id_organizacao, pedidoDestino.id_pedido, tx)
              } else {
                await tx.pedidoItem.update({
                  where: { id_item: itemDestino.id_item as string },
                  data: { quantidade_atual_item: novaQty, quantidade_transferida_item: Math.max(0, Number(itemDestino.quantidade_transferida_item) - destino.quantidade) },
                })
              }
            }
            await this.recalcularAgregados(id_organizacao, pedidoDestino.id_pedido, tx)
          }
        }
      }

      await this.recalcularAgregados(id_organizacao, historico.id_pedido_origem, tx)

      // Marcar histórico como revertido
      await tx.pedidoTransferencia.update({
        where: { id_pedido_transferencia: transferId },
        data: {
          revertido_pedido_transferencia: true,
          data_reversao_pedido_transferencia: new Date(),
          revertido_por_pedido_transferencia: id_usuario,
        },
      })

      // Audit trail via historico-global (fire-and-forget)
      auditLog({
        id_organizacao:               id_organizacao,
        tipo_ator_historico_log:      'USUARIO',
        id_ator_historico_log:        id_usuario,
        nome_ator_historico_log:      nome_usuario,
        modulo_historico_log:         'pedido',
        tipo_recurso_historico_log:   'PedidoTransferencia',
        id_recurso_historico_log:     transferId,
        acao_historico_log:           'REVERTER_TRANSFERENCIA',
        detalhe_acao_historico_log:   `Transferência ${transferId} revertida`,
        estado_posterior_historico_log: { transfer_id: transferId, id_pedido: historico.id_pedido_origem },
      })
    }

    return {
      pedido_origem_id: historico.id_pedido_origem,
      pedidos_destino_ids: destinos.filter(d => d.pedido_id).map(d => d.pedido_id as string),
      pedidos_criados: [],
      itens_excluidos: itensExcluidos,
      pedidos_encerrados: pedidosEncerrados,
    }
  }

  // ── Histórico ─────────────────────────────────────────────────────────────────

  async historico(id_organizacao: string, pedidoId: string, db: PrismaClient) {
    return db.pedidoTransferencia.findMany({
      where:   { id_pedido_origem: pedidoId, id_organizacao: id_organizacao },
      orderBy: { data_criacao_pedido_transferencia: 'desc' },
    })
  }

  // ── Privados ──────────────────────────────────────────────────────────────────

  private async validarQuantidade(disponivel: number, solicitada: number): Promise<void> {
    if (solicitada <= 0) throw new AppError('Quantidade deve ser maior que zero', 422, 'INVALID_QTY')
    if (solicitada > disponivel) {
      throw new AppError(
        `Quantidade solicitada (${solicitada}) excede a disponível (${disponivel})`,
        422,
        'INSUFFICIENT_QTY',
      )
    }
  }

  private async criarPedidoDestino(id_organizacao: string, numero: string, base: Record<string, unknown>, tx: Tx) {
    // Débito 2B — FK do status (transferência cria pedido destino em 'aberto')
    const statusAbertoFK = await tx.statusPedido.findFirst({
      where: { id_organizacao, nome_pedido_status: 'aberto' },
      select: { id_pedido_status: true },
    })
    if (!statusAbertoFK) {
      console.warn(
        `[transferirService] StatusPedido 'aberto' nao encontrado na organizacao=${id_organizacao}; ` +
        `pedido destino sera criado sem vinculo id_status_pedido.`,
      )
    }

    return tx.pedido.create({
      data: {
        id_pedido: this.gerarId('pedi'),
        id_organizacao: id_organizacao,
        id_workspace: (base.id_workspace ?? base.company_id) as string,
        tipo_operacao_pedido: (base.tipo_operacao_pedido ?? base.tipo_operacao) as string,
        numero_pedido: numero,
        status_pedido: 'aberto',
        id_status_pedido: statusAbertoFK?.id_pedido_status ?? null,
        incoterm_pedido: ((base.incoterm_pedido ?? base.incoterm) as string | null) ?? null,
        moeda_pedido: (base.moeda_pedido as string | null) ?? 'USD',
        casas_decimais_valor_pedido: (base.casas_decimais_valor_pedido as number | null) ?? 2,
        casas_decimais_quantidade_pedido: (base.casas_decimais_quantidade_pedido as number | null) ?? 2,
        unidade_comercializada_pedido: (base.unidade_comercializada_pedido as string | null) ?? null,
        condicao_pagamento_pedido: ((base.condicao_pagamento_pedido ?? base.condicao_pagamento) as string | null) ?? null,
        data_emissao_pedido: new Date(),
        id_importacao_exportador_pedido: ((base.id_importacao_exportador_pedido ?? base.id_importacao_exportador ?? base.importacao_exportador_id) as string | null) ?? null,
        id_exportacao_importador_pedido: ((base.id_exportacao_importador_pedido ?? base.id_exportacao_importador ?? base.exportacao_importador_id) as string | null) ?? null,
        id_fabricante_pedido: ((base.id_fabricante_pedido ?? base.id_fabricante ?? base.fabricante_id) as string | null) ?? null,
      },
    })
  }

  private gerarId(prefixo: string): string {
    const seq = String(Math.floor(Math.random() * 9999999)).padStart(7, '0')
    const ano = String(new Date().getFullYear()).slice(-2)
    return `${prefixo}_id_${seq}-${ano}`
  }

  private prepararItemDestino(itemOrigem: Record<string, unknown>, pedidoId: string, destino: TransferDestino, sequenciaDestino?: number): Record<string, unknown> {
    return {
      id_item: this.gerarId('pite'),
      id_organizacao: itemOrigem.id_organizacao,
      id_workspace: itemOrigem.id_workspace,
      id_pedido: pedidoId,
      sequencia_item_pedido: sequenciaDestino ?? null,
      part_number_item: destino.part_number ?? itemOrigem.part_number_item,
      ncm_item: itemOrigem.ncm_item ?? '',
      descricao_item: itemOrigem.descricao_item ?? '',
      unidade_comercializada_item: itemOrigem.unidade_comercializada_item ?? null,
      quantidade_inicial_item: destino.quantidade,
      quantidade_atual_item: destino.quantidade,
      casas_decimais_quantidade_item: itemOrigem.casas_decimais_quantidade_item ?? 2,
      moeda_item: itemOrigem.moeda_item ?? 'USD',
      valor_por_unidade_item: itemOrigem.valor_por_unidade_item != null ? Number(itemOrigem.valor_por_unidade_item) : null,
      valor_total_item: itemOrigem.valor_por_unidade_item != null ? Number(itemOrigem.valor_por_unidade_item) * destino.quantidade : null,
      casas_decimais_valor_item: itemOrigem.casas_decimais_valor_item ?? 2,
      dados_extras_importacao_item: itemOrigem.dados_extras_importacao_item ?? null,
    }
  }

  /**
   * Recalcula os 5 agregados oficiais do Pedido a partir dos itens.
   *
   * Substituiu o método privado legado que populava `quantidade_total_pedido`
   * com `SUM(quantidade_atual_item)` — semântica errada (fragmento.prisma define
   * `quantidade_total_pedido` como SUM de quantidade_inicial_item, não atual).
   *
   * Agora delega ao helper canônico `recalcularAgregadosPedido` em
   * `processos-core/services/`. Cobre valor/qty/peso_liq/peso_br/cubagem em
   * uma chamada — fonte única de verdade para todos os pontos do sistema.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async recalcularAgregados(id_organizacao: string, pedidoId: string, tx: Tx): Promise<void> {
    await recalcularAgregadosCanonico(tx as any, pedidoId, id_organizacao)
  }

  private async avaliarEncerramentoPedido(
    id_organizacao: string,
    pedidoId: string,
    tx: Tx,
  ): Promise<{ itensExcluidos: string[]; pedidosEncerrados: string[] }> {
    const itensExcluidos: string[] = []
    const pedidosEncerrados: string[] = []

    const itens = await tx.pedidoItem.findMany({
      where: { id_pedido: pedidoId, id_organizacao: id_organizacao },
      orderBy: { sequencia_item_pedido: 'asc' },
    })

    // Itens com quantidade zero NÃO são deletados — permanecem na lista
    // com saldo zerado para rastreabilidade. O usuário vê "0,00" na coluna Saldo.
    const todosZero = itens.length > 0 && itens.every(
      (i: Record<string, unknown>) => Number(i.quantidade_atual_item) <= 0,
    )

    if (todosZero) {
      // Encerrar pedido quando TODOS os itens ficam com quantidade zero
      await tx.pedido.update({
        where: { id_pedido: pedidoId },
        data: { status_pedido: 'consolidado' },
      })
      pedidosEncerrados.push(pedidoId)
    }

    return { itensExcluidos, pedidosEncerrados }
  }

  /**
   * Resequencia itens de um pedido para manter sequência contínua (1, 2, 3...).
   * Chamado após exclusão de item (ex: reversão de transferência).
   */
  private async resequenciarItens(id_organizacao: string, pedidoId: string, tx: Tx): Promise<void> {
    const itens = await tx.pedidoItem.findMany({
      where: { id_pedido: pedidoId, id_organizacao: id_organizacao },
      orderBy: { sequencia_item_pedido: 'asc' },
    })
    for (let i = 0; i < itens.length; i++) {
      const seqCorreta = i + 1
      if (Number(itens[i].sequencia_item_pedido) !== seqCorreta) {
        await tx.pedidoItem.update({
          where: { id_item: itens[i].id_item as string },
          data: { sequencia_item_pedido: seqCorreta },
        })
      }
    }
  }

  private async gravarHistorico(
    id_organizacao: string,
    id_usuario: string,
    nome_usuario: string,
    payload: TransferPayload,
    pedidosDestinoIds: string[],
    tx: Tx,
  ): Promise<void> {
    // Tabela: pedido_transferencia (renomeada de tracking_items_transferidos).
    await tx.pedidoTransferencia.create({
      data: {
        id_organizacao:                   id_organizacao,
        id_pedido_origem:                 payload.pedido_id,
        id_item_origem:                   payload.item_id,
        cenario_pedido_transferencia:     payload.cenario,
        quantidade_pedido_transferencia:  payload.quantidade_origem,
        destinos_pedido_transferencia:    JSON.stringify(
          payload.destinos.map((d, idx) => ({
            ...d,
            pedido_id: d.pedido_id ?? pedidosDestinoIds[idx],
          }))
        ),
        revertido_pedido_transferencia:   false,
        criado_por_pedido_transferencia:  id_usuario,
      },
    })

    // Audit trail via historico-global (fire-and-forget)
    auditLog({
      id_organizacao:               id_organizacao,
      tipo_ator_historico_log:      'USUARIO',
      id_ator_historico_log:        id_usuario,
      nome_ator_historico_log:      nome_usuario,
      modulo_historico_log:         'pedido',
      tipo_recurso_historico_log:   'PedidoTransferencia',
      id_recurso_historico_log:     payload.pedido_id,
      acao_historico_log:           'TRANSFERIR',
      detalhe_acao_historico_log:   `Transferência ${payload.cenario}: ${payload.quantidade_origem} unidades`,
      estado_posterior_historico_log: { cenario: payload.cenario, destinos: pedidosDestinoIds, quantidade: payload.quantidade_origem },
    })
  }
}
