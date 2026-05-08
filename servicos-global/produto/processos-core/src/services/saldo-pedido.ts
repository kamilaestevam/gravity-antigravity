/**
 * saldo-pedido.ts — Motor de saldo do PedidoItem
 *
 * Implementa a Matematica de Saldo Imutavel:
 *   quantidade_inicial = quantidade_atual + quantidade_transferida + quantidade_cancelada
 *
 * Todas as operacoes sao atomicas (Prisma $transaction)
 * Anti-sobre-execucao: rejeita operacao se quantidade_atual_item < solicitada
 *
 * Retorno: shape DDD (nomes físicos da tabela). Callers usam mapItem em pedidos.ts
 * para traduzir para o contrato JSON público antes de responder.
 *
 * Referencia: documentos-tecnicos/produto/itens-pedido-processo/arquitetura-3-tier.md
 */

import type { PrismaClient } from '@prisma/client'

// Workaround Prisma 5.22.0: Prisma.TransactionClient = Omit<DefaultPrismaClient, ITXClientDenyList>
// perde delegates de modelo por instantiation depth. Usar literal Omit preserva os delegates.
type Tx = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface TransferirInput {
  pedido_item_id: string
  quantidade: number
  id_organizacao: string
  id_workspace: string
}

interface CancelarInput {
  pedido_item_id: string
  quantidade: number
  id_organizacao: string
  id_workspace: string
}

interface AtualizarProntaInput {
  pedido_item_id: string
  quantidade_pronta: number
  id_organizacao: string
  id_workspace: string
}

// Shape DDD — alinhado com colunas físicas de "pedido_item" (rename Onda 3 + rename de tabela 2026-05-07).
// O caller (pedidos.ts) aplica mapItem() para produzir o contrato JSON público.
interface SaldoResult {
  id_item: string
  quantidade_inicial_item:     number
  quantidade_atual_item:       number
  quantidade_transferida_item: number
  quantidade_cancelada_item:   number
  quantidade_pronta_item:      number
}

// ── Engine ────────────────────────────────────────────────────────────────────

export const saldoPedido = {
  /**
   * Transferir quantidade de um PedidoItem para um Processo.
   * Debita quantidade_atual, credita quantidade_transferida.
   * Operacao atomica com validacao anti-sobre-execucao.
   */
  async transferir(prisma: PrismaClient, input: TransferirInput): Promise<SaldoResult> {
    const { pedido_item_id, quantidade, id_organizacao, id_workspace } = input

    if (quantidade <= 0) {
      throw new AppError(400, 'Quantidade deve ser maior que zero')
    }

    return prisma.$transaction(async (tx0: unknown) => {
      const tx = tx0 as Tx
      const item = await tx.pedidoItem.findFirst({
        where: { id_item: pedido_item_id, id_organizacao, id_workspace },
      })

      if (!item) {
        throw new AppError(404, 'Item do pedido nao encontrado')
      }

      const atualAtual = Number(item.quantidade_atual_item)
      if (atualAtual < quantidade) {
        throw new AppError(400,
          `Quantidade solicitada (${quantidade}) excede saldo disponivel (${atualAtual})`
        )
      }

      const updated = await tx.pedidoItem.update({
        where: { id_item: pedido_item_id },
        data: {
          quantidade_atual_item:       atualAtual - quantidade,
          quantidade_transferida_item: Number(item.quantidade_transferida_item) + quantidade,
        },
      })

      // Atualizar status do pedido pai se necessario
      await atualizarStatusPedido(tx, item.id_pedido, id_organizacao, id_workspace)

      return {
        id_item:                            updated.id_item,
        quantidade_inicial_item:     Number(updated.quantidade_inicial_item),
        quantidade_atual_item:       Number(updated.quantidade_atual_item),
        quantidade_transferida_item: Number(updated.quantidade_transferida_item),
        quantidade_cancelada_item:   Number(updated.quantidade_cancelada_item),
        quantidade_pronta_item:      Number(updated.quantidade_pronta_item),
      }
    })
  },

  /**
   * Cancelar quantidade de um PedidoItem.
   * Debita quantidade_atual, credita quantidade_cancelada.
   * Operacao irreversivel.
   */
  async cancelar(prisma: PrismaClient, input: CancelarInput): Promise<SaldoResult> {
    const { pedido_item_id, quantidade, id_organizacao, id_workspace } = input

    if (quantidade <= 0) {
      throw new AppError(400, 'Quantidade deve ser maior que zero')
    }

    return prisma.$transaction(async (tx0: unknown) => {
      const tx = tx0 as Tx
      const item = await tx.pedidoItem.findFirst({
        where: { id_item: pedido_item_id, id_organizacao, id_workspace },
      })

      if (!item) {
        throw new AppError(404, 'Item do pedido nao encontrado')
      }

      const atualAtual = Number(item.quantidade_atual_item)
      if (atualAtual < quantidade) {
        throw new AppError(400,
          `Quantidade a cancelar (${quantidade}) excede saldo disponivel (${atualAtual})`
        )
      }

      const updated = await tx.pedidoItem.update({
        where: { id_item: pedido_item_id },
        data: {
          quantidade_atual_item:     atualAtual - quantidade,
          quantidade_cancelada_item: Number(item.quantidade_cancelada_item) + quantidade,
        },
      })

      await atualizarStatusPedido(tx, item.id_pedido, id_organizacao, id_workspace)

      return {
        id_item:                            updated.id_item,
        quantidade_inicial_item:     Number(updated.quantidade_inicial_item),
        quantidade_atual_item:       Number(updated.quantidade_atual_item),
        quantidade_transferida_item: Number(updated.quantidade_transferida_item),
        quantidade_cancelada_item:   Number(updated.quantidade_cancelada_item),
        quantidade_pronta_item:      Number(updated.quantidade_pronta_item),
      }
    })
  },

  /**
   * Atualizar quantidade pronta de um PedidoItem.
   * Informativo — nao afeta a formula de saldo.
   */
  async atualizarPronta(prisma: PrismaClient, input: AtualizarProntaInput): Promise<SaldoResult> {
    const { pedido_item_id, quantidade_pronta, id_organizacao, id_workspace } = input

    if (quantidade_pronta < 0) {
      throw new AppError(400, 'Quantidade pronta nao pode ser negativa')
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = prisma as any

    const item = await db.pedidoItem.findFirst({
      where: { id_item: pedido_item_id, id_organizacao, id_workspace },
    })

    if (!item) {
      throw new AppError(404, 'Item do pedido nao encontrado')
    }

    const updated = await db.pedidoItem.update({
      where: { id_item: pedido_item_id },
      data: { quantidade_pronta_item: quantidade_pronta },
    })

    return {
      id_item:                            updated.id_item,
      quantidade_inicial_item:     Number(updated.quantidade_inicial_item),
      quantidade_atual_item:       Number(updated.quantidade_atual_item),
      quantidade_transferida_item: Number(updated.quantidade_transferida_item),
      quantidade_cancelada_item:   Number(updated.quantidade_cancelada_item),
      quantidade_pronta_item:      Number(updated.quantidade_pronta_item),
    }
  },

  /**
   * Validar integridade do saldo de um PedidoItem.
   * Retorna true se a formula imutavel esta valida.
   */
  validarIntegridade(item: SaldoResult): boolean {
    const soma =
      item.quantidade_atual_item +
      item.quantidade_transferida_item +
      item.quantidade_cancelada_item
    return Math.abs(item.quantidade_inicial_item - soma) < 0.001
  },
}

// ── Helpers internos ──────────────────────────────────────────────────────────

async function atualizarStatusPedido(
  tx: Tx,
  pedido_id: string,
  id_organizacao: string,
  id_workspace: string,
): Promise<void> {
  const itens = await tx.pedidoItem.findMany({
    where: { id_pedido: pedido_id, id_organizacao, id_workspace },
  })

  if (itens.length === 0) return

  const todosLiquidados  = itens.every((i: Record<string, unknown>) => Number(i.quantidade_atual_item) === 0)
  const algumTransferido = itens.some((i: Record<string, unknown>)  => Number(i.quantidade_transferida_item) > 0)

  let novoStatus: string
  if (todosLiquidados) {
    novoStatus = 'consolidado'
  } else if (algumTransferido) {
    novoStatus = 'transferencia'
  } else {
    novoStatus = 'aberto'
  }

  await tx.pedido.update({
    where: { id_pedido: pedido_id },
    data: { status_pedido: novoStatus },
  })
}
