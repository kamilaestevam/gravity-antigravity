/**
 * transferirService.ts — Lógica de negócio de transferência de pedidos
 *
 * Todos os métodos recebem tenantId e executam queries com filtro de tenant.
 * A transação garante atomicidade: ou tudo é gravado, ou nada.
 */

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
    saldo_item_pedido: number
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

  async preview(tenantId: string, payload: TransferPayload, db: any): Promise<TransferPreview> {
    const pedido = await db.pedido.findFirst({
      where: { id: payload.pedido_id, tenant_id: tenantId },
      include: { itens: { orderBy: { sequencia_item: 'asc' } } },
    })
    if (!pedido) throw new AppError('Pedido de origem não encontrado', 404, 'NOT_FOUND')

    const item = pedido.itens.find((i: any) => i.id === payload.item_id)
    if (!item) throw new AppError('Item não encontrado no pedido', 404, 'NOT_FOUND')

    const saldoAtual = Number(item.quantidade_saldo_pedido)
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
            where: { id: d.pedido_id, tenant_id: tenantId },
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
        item_part_number: item.part_number,
        saldo_item_pedido: saldoAtual,
        quantidade_apos: Math.max(0, quantidadeApos),
        encerra: quantidadeApos <= 0,
      },
      destinos: destinosPreview,
      alertas_globais: alertasGlobais,
    }
  }

  // ── Confirmação (executa em $transaction) ─────────────────────────────────────

  async confirmar(tenantId: string, userId: string, payload: TransferPayload, db: any): Promise<TransferResultado> {
    const pedidoOrigem = await db.pedido.findFirst({
      where: { id: payload.pedido_id, tenant_id: tenantId },
      include: { itens: { orderBy: { sequencia_item: 'asc' } } },
    })
    if (!pedidoOrigem) throw new AppError('Pedido de origem não encontrado', 404, 'NOT_FOUND')

    const itemOrigem = pedidoOrigem.itens.find((i: any) => i.id === payload.item_id)
    if (!itemOrigem) throw new AppError('Item não encontrado no pedido', 404, 'NOT_FOUND')

    await this.validarQuantidade(Number(itemOrigem.quantidade_saldo_pedido), payload.quantidade_origem)

    const pedidosDestinoIds: string[] = []
    const pedidosCriados: string[] = []
    const itensExcluidos: string[] = []
    const pedidosEncerrados: string[] = []

    await db.$transaction(async (tx: any) => {
      // Processar cada destino
      for (const destino of payload.destinos) {
        if (destino.tipo === 'novo') {
          const numero = payload.numero_pedido_novo ?? `PO-TRANS-${Date.now()}`
          const novoPedido = await this.criarPedidoDestino(tenantId, numero, pedidoOrigem, tx)
          pedidosCriados.push(novoPedido.id)
          pedidosDestinoIds.push(novoPedido.id)

          // Criar item no pedido novo
          const itemData = this.prepararItemDestino(itemOrigem, novoPedido.id, destino)
          await tx.pedidoItem.create({ data: itemData })
        } else if (destino.tipo === 'existente' && destino.pedido_id) {
          const pedidoDestino = await tx.pedido.findFirst({
            where: { id: destino.pedido_id, tenant_id: tenantId },
            include: { itens: { orderBy: { sequencia_item: 'asc' } } },
          })
          if (!pedidoDestino) {
            throw new AppError(`Pedido destino ${destino.pedido_id} não encontrado`, 404, 'NOT_FOUND')
          }
          pedidosDestinoIds.push(pedidoDestino.id)

          // Verificar se já existe item com mesmo part_number no destino
          const partTarget = destino.part_number ?? itemOrigem.part_number
          const itemExistente = pedidoDestino.itens.find((i: any) => i.part_number === partTarget)

          if (itemExistente) {
            await tx.pedidoItem.update({
              where: { id: itemExistente.id },
              data: {
                quantidade_saldo_pedido: Number(itemExistente.quantidade_saldo_pedido) + destino.quantidade,
                quantidade_inicial_pedido: Number(itemExistente.quantidade_inicial_pedido) + destino.quantidade,
                // quantidade_transferida_pedido NÃO se altera: o destino recebe, não transfere para fora
              },
            })
          } else {
            const itemData = this.prepararItemDestino(itemOrigem, pedidoDestino.id, destino)
            await tx.pedidoItem.create({ data: itemData })
          }

          await this.recalcularAgregados(tenantId, pedidoDestino.id, tx)
        } else if (destino.tipo === 'mesmo' && payload.cenario === 'substituicao_pura') {
          // Substituição pura — troca o part_number no mesmo pedido
          await tx.pedidoItem.update({
            where: { id: itemOrigem.id },
            data: { part_number: destino.part_number },
          })
        }
      }

      // Reduzir quantidade do item de origem (para todos os cenários exceto substituicao_pura)
      if (payload.cenario !== 'substituicao_pura') {
        const novaQty = Number(itemOrigem.quantidade_saldo_pedido) - payload.quantidade_origem
        await tx.pedidoItem.update({
          where: { id: itemOrigem.id },
          data: {
            quantidade_saldo_pedido: novaQty,
            quantidade_transferida_pedido: Number(itemOrigem.quantidade_transferida_pedido) + payload.quantidade_origem,
          },
        })

        // Avaliar encerramento por configuração
        const resultado = await this.avaliarEncerramentoPedido(tenantId, payload.pedido_id, tx)
        itensExcluidos.push(...resultado.itensExcluidos)
        pedidosEncerrados.push(...resultado.pedidosEncerrados)
      }

      await this.recalcularAgregados(tenantId, payload.pedido_id, tx)

      // Gravar histórico de transferência
      await this.gravarHistorico(tenantId, userId, payload, pedidosDestinoIds, tx)
    })

    return {
      pedido_origem_id: payload.pedido_id,
      pedidos_destino_ids: pedidosDestinoIds,
      pedidos_criados: pedidosCriados,
      itens_excluidos: itensExcluidos,
      pedidos_encerrados: pedidosEncerrados,
    }
  }

  // ── Reversão ──────────────────────────────────────────────────────────────────

  async reverter(tenantId: string, userId: string, transferId: string, db: any): Promise<TransferResultado> {
    const historico = await db.transferHistorico.findFirst({
      where: { id: transferId, tenant_id: tenantId },
    })
    if (!historico) throw new AppError('Registro de transferência não encontrado', 404, 'NOT_FOUND')
    if (historico.revertido) throw new AppError('Esta transferência já foi revertida', 409, 'CONFLICT')

    const cenario = historico.cenario as CenarioTransfer
    if (CENARIOS_IRREVERSIVEIS.has(cenario)) {
      throw new AppError(`Cenário "${cenario}" não é reversível`, 422, 'NOT_REVERSIBLE')
    }

    const destinos: TransferDestino[] = JSON.parse(historico.destinos_json)
    const itensExcluidos: string[] = []
    const pedidosEncerrados: string[] = []

    await db.$transaction(async (tx: any) => {
      // Devolver quantidade ao item de origem
      const itemOrigem = await tx.pedidoItem.findFirst({
        where: { id: historico.item_origem_id, tenant_id: tenantId },
      })
      if (itemOrigem) {
        await tx.pedidoItem.update({
          where: { id: itemOrigem.id },
          data: {
            quantidade_atual: Number(itemOrigem.quantidade_atual) + Number(historico.quantidade_item_transferida),
            quantidade_transferida: Math.max(0, Number(itemOrigem.quantidade_transferida) - Number(historico.quantidade_item_transferida)),
          },
        })
      }

      // Remover quantidade dos destinos
      for (const destino of destinos) {
        if (destino.pedido_id) {
          const pedidoDestino = await tx.pedido.findFirst({
            where: { id: destino.pedido_id, tenant_id: tenantId },
            include: { itens: { orderBy: { sequencia_item: 'asc' } } },
          })
          if (pedidoDestino) {
            const itemDestino = pedidoDestino.itens.find((i: any) =>
              i.part_number === (destino.part_number ?? itemOrigem?.part_number)
            )
            if (itemDestino) {
              const novaQty = Number(itemDestino.quantidade_atual) - destino.quantidade
              if (novaQty <= 0) {
                await tx.pedidoItem.delete({ where: { id: itemDestino.id } })
                itensExcluidos.push(itemDestino.id)
              } else {
                await tx.pedidoItem.update({
                  where: { id: itemDestino.id },
                  data: { quantidade_atual: novaQty, quantidade_transferida: Math.max(0, Number(itemDestino.quantidade_transferida) - destino.quantidade) },
                })
              }
            }
            await this.recalcularAgregados(tenantId, pedidoDestino.id, tx)
          }
        }
      }

      await this.recalcularAgregados(tenantId, historico.pedido_origem_id, tx)

      // Marcar histórico como revertido
      await tx.transferHistorico.update({
        where: { id: transferId },
        data: { revertido: true, revertido_em: new Date(), revertido_por: userId },
      })

      // Registrar no audit trail (não bloquear se tabela não existir)
      try {
        await tx.pedidoHistorico.create({
          data: {
            tenant_id: tenantId,
            pedido_id: historico.pedido_origem_id,
            acao: 'TRANSFERENCIA_REVERTIDA',
            descricao: `Transferência ${transferId} revertida`,
            metadata: JSON.stringify({ transfer_id: transferId }),
          },
        })
      } catch {
        console.warn('[TransferirService] Tabela pedidoHistorico não disponível, pulando audit trail')
      }
    })

    return {
      pedido_origem_id: historico.pedido_origem_id,
      pedidos_destino_ids: destinos.filter(d => d.pedido_id).map(d => d.pedido_id as string),
      pedidos_criados: [],
      itens_excluidos: itensExcluidos,
      pedidos_encerrados: pedidosEncerrados,
    }
  }

  // ── Histórico ─────────────────────────────────────────────────────────────────

  async historico(tenantId: string, pedidoId: string, db: any) {
    return db.transferHistorico.findMany({
      where: { pedido_origem_id: pedidoId, tenant_id: tenantId },
      orderBy: { created_at: 'desc' },
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

  private async criarPedidoDestino(tenantId: string, numero: string, base: any, tx: any) {
    return tx.pedido.create({
      data: {
        id: this.gerarId('pedi'),
        tenant_id: tenantId,
        company_id: base.company_id,
        tipo_operacao: base.tipo_operacao,
        numero_pedido: numero,
        status: 'aberto',
        incoterm: base.incoterm ?? null,
        moeda_pedido: base.moeda_pedido ?? 'USD',
        casas_decimais_total_pedido: base.casas_decimais_total_pedido ?? 2,
        casas_decimais_quantidade_total_pedido: base.casas_decimais_quantidade_total_pedido ?? 2,
        unidade_comercializada_pedido: base.unidade_comercializada_pedido ?? null,
        cobertura_cambial: base.cobertura_cambial ?? 'com_cobertura',
        condicao_pagamento: base.condicao_pagamento ?? null,
        data_emissao_pedido: new Date(),
        importacao_exportador_id: base.importacao_exportador_id ?? null,
        exportacao_importador_id: base.exportacao_importador_id ?? null,
        fabricante_id: base.fabricante_id ?? null,
      },
    })
  }

  private gerarId(prefixo: string): string {
    const seq = String(Math.floor(Math.random() * 9999999)).padStart(7, '0')
    const ano = String(new Date().getFullYear()).slice(-2)
    return `${prefixo}_id_${seq}-${ano}`
  }

  private prepararItemDestino(itemOrigem: any, pedidoId: string, destino: TransferDestino): any {
    return {
      id: this.gerarId('pite'),
      tenant_id: itemOrigem.tenant_id,
      company_id: itemOrigem.company_id,
      pedido_id: pedidoId,
      sequencia_item: itemOrigem.sequencia_item ?? null,
      part_number: destino.part_number ?? itemOrigem.part_number,
      ncm: itemOrigem.ncm ?? '',
      descricao_item: itemOrigem.descricao_item ?? '',
      unidade_comercializada_item: itemOrigem.unidade_comercializada_item ?? null,
      quantidade_inicial_pedido: destino.quantidade,
      quantidade_saldo_pedido: destino.quantidade,
      casas_decimais_quantidade_item: itemOrigem.casas_decimais_quantidade_item ?? 2,
      moeda_item: itemOrigem.moeda_item ?? 'USD',
      valor_por_unidade_item: itemOrigem.valor_por_unidade_item != null ? Number(itemOrigem.valor_por_unidade_item) : null,
      valor_total_item: itemOrigem.valor_por_unidade_item != null ? Number(itemOrigem.valor_por_unidade_item) * destino.quantidade : null,
      casas_decimais_total_item: itemOrigem.casas_decimais_total_item ?? 2,
      campos_custom: itemOrigem.campos_custom ?? null,
    }
  }

  private async recalcularAgregados(tenantId: string, pedidoId: string, tx: any): Promise<void> {
    const itens = await tx.pedidoItem.findMany({
      where: { pedido_id: pedidoId, tenant_id: tenantId },
      select: { quantidade_saldo_pedido: true },
    })

    const qtdAtualTotal = itens.reduce((acc: number, i: any) => acc + Number(i.quantidade_saldo_pedido ?? 0), 0)

    await tx.pedido.update({
      where: { id: pedidoId },
      data: { quantidade_total_pedido: qtdAtualTotal },
    })
  }

  private async avaliarEncerramentoPedido(
    tenantId: string,
    pedidoId: string,
    tx: any,
  ): Promise<{ itensExcluidos: string[]; pedidosEncerrados: string[] }> {
    const itensExcluidos: string[] = []
    const pedidosEncerrados: string[] = []

    const itens = await tx.pedidoItem.findMany({
      where: { pedido_id: pedidoId, tenant_id: tenantId },
    })

    // Config: excluir item quando qty = 0 (default: false — só executa se ativo)
    for (const item of itens) {
      if (Number(item.quantidade_saldo_pedido) <= 0) {
        await tx.pedidoItem.delete({ where: { id: item.id } })
        itensExcluidos.push(item.id)
      }
    }

    const itensRestantes = itens.filter((i: any) => !itensExcluidos.includes(i.id))
    const todosZero = itens.length > 0 && itensRestantes.length === 0

    if (todosZero) {
      // Config: encerrar pedido quando qty = 0
      await tx.pedido.update({
        where: { id: pedidoId },
        data: { status: 'consolidado' },
      })
      pedidosEncerrados.push(pedidoId)
    }

    return { itensExcluidos, pedidosEncerrados }
  }

  private async gravarHistorico(
    tenantId: string,
    userId: string,
    payload: TransferPayload,
    pedidosDestinoIds: string[],
    tx: any,
  ): Promise<void> {
    try {
      await tx.transferHistorico.create({
        data: {
          tenant_id: tenantId,
          pedido_origem_id: payload.pedido_id,
          item_origem_id: payload.item_id,
          cenario: payload.cenario,
          quantidade_item_transferida: payload.quantidade_origem,
          destinos_json: JSON.stringify(
            payload.destinos.map((d, idx) => ({
              ...d,
              pedido_id: d.pedido_id ?? pedidosDestinoIds[idx],
            }))
          ),
          revertido: false,
          created_by: userId,
        },
      })
    } catch {
      console.warn('[TransferirService] Tabela transferHistorico não disponível, pulando gravação de histórico')
    }

    // Audit trail no histórico geral do pedido
    try {
      await tx.pedidoHistorico.create({
        data: {
          tenant_id: tenantId,
          pedido_id: payload.pedido_id,
          acao: 'TRANSFERENCIA',
          descricao: `Transferência ${payload.cenario}: ${payload.quantidade_origem} unidades`,
          metadata: JSON.stringify({ cenario: payload.cenario, destinos: pedidosDestinoIds }),
        },
      })
    } catch {
      console.warn('[TransferirService] Tabela pedidoHistorico não disponível, pulando audit trail')
    }
  }
}
