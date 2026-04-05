/**
 * saldoEngine.ts — Motor de saldo do PedidoItem
 *
 * Implementa a Matematica de Saldo Imutavel:
 *   quantidade_inicial_pedido = quantidade_atual_pedido + quantidade_transferida_pedido + quantidade_cancelada_pedido
 *
 * Todas as operacoes sao atomicas (Prisma $transaction)
 * Anti-sobre-execucao: rejeita operacao se quantidade_atual < solicitada
 *
 * Referencia: documentos-tecnicos/produto/itens-pedido-processo/arquitetura-3-tier.md
 */

import type { PrismaClient } from '@prisma/client'

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
  tenant_id: string
  company_id: string
}

interface CancelarInput {
  pedido_item_id: string
  quantidade: number
  tenant_id: string
  company_id: string
}

interface AtualizarProntaInput {
  pedido_item_id: string
  quantidade_pronta: number
  tenant_id: string
  company_id: string
}

interface SaldoResult {
  id: string
  quantidade_inicial_pedido: number
  quantidade_atual_pedido: number
  quantidade_transferida_pedido: number
  quantidade_cancelada_pedido: number
  quantidade_pronta_pedido: number
}

// ── Engine ────────────────────────────────────────────────────────────────────

export const saldoEngine = {
  /**
   * Transferir quantidade de um PedidoItem para um Processo.
   * Debita quantidade_atual_pedido, credita quantidade_transferida_pedido.
   * Operacao atomica com validacao anti-sobre-execucao.
   */
  async transferir(prisma: PrismaClient, input: TransferirInput): Promise<SaldoResult> {
    const { pedido_item_id, quantidade, tenant_id, company_id } = input

    if (quantidade <= 0) {
      throw new AppError(400, 'Quantidade deve ser maior que zero')
    }

    return prisma.$transaction(async (tx) => {
      const item = await tx.pedidoItem.findFirst({
        where: { id: pedido_item_id, tenant_id, company_id },
      })

      if (!item) {
        throw new AppError(404, 'Item do pedido nao encontrado')
      }

      if (item.quantidade_atual_pedido < quantidade) {
        throw new AppError(400,
          `Quantidade solicitada (${quantidade}) excede saldo disponivel (${item.quantidade_atual_pedido})`
        )
      }

      const updated = await tx.pedidoItem.update({
        where: { id: pedido_item_id },
        data: {
          quantidade_atual_pedido: item.quantidade_atual_pedido - quantidade,
          quantidade_transferida_pedido: item.quantidade_transferida_pedido + quantidade,
        },
      })

      // Atualizar status do pedido pai se necessario
      await atualizarStatusPedido(tx, item.pedido_id, tenant_id, company_id)

      return {
        id: updated.id,
        quantidade_inicial_pedido: updated.quantidade_inicial_pedido,
        quantidade_atual_pedido: updated.quantidade_atual_pedido,
        quantidade_transferida_pedido: updated.quantidade_transferida_pedido,
        quantidade_cancelada_pedido: updated.quantidade_cancelada_pedido,
        quantidade_pronta_pedido: updated.quantidade_pronta_pedido,
      }
    })
  },

  /**
   * Cancelar quantidade de um PedidoItem.
   * Debita quantidade_atual_pedido, credita quantidade_cancelada_pedido.
   * Operacao irreversivel.
   */
  async cancelar(prisma: PrismaClient, input: CancelarInput): Promise<SaldoResult> {
    const { pedido_item_id, quantidade, tenant_id, company_id } = input

    if (quantidade <= 0) {
      throw new AppError(400, 'Quantidade deve ser maior que zero')
    }

    return prisma.$transaction(async (tx) => {
      const item = await tx.pedidoItem.findFirst({
        where: { id: pedido_item_id, tenant_id, company_id },
      })

      if (!item) {
        throw new AppError(404, 'Item do pedido nao encontrado')
      }

      if (item.quantidade_atual_pedido < quantidade) {
        throw new AppError(400,
          `Quantidade a cancelar (${quantidade}) excede saldo disponivel (${item.quantidade_atual_pedido})`
        )
      }

      const updated = await tx.pedidoItem.update({
        where: { id: pedido_item_id },
        data: {
          quantidade_atual_pedido: item.quantidade_atual_pedido - quantidade,
          quantidade_cancelada_pedido: item.quantidade_cancelada_pedido + quantidade,
        },
      })

      await atualizarStatusPedido(tx, item.pedido_id, tenant_id, company_id)

      return {
        id: updated.id,
        quantidade_inicial_pedido: updated.quantidade_inicial_pedido,
        quantidade_atual_pedido: updated.quantidade_atual_pedido,
        quantidade_transferida_pedido: updated.quantidade_transferida_pedido,
        quantidade_cancelada_pedido: updated.quantidade_cancelada_pedido,
        quantidade_pronta_pedido: updated.quantidade_pronta_pedido,
      }
    })
  },

  /**
   * Atualizar quantidade pronta de um PedidoItem.
   * Informativo — nao afeta a formula de saldo.
   */
  async atualizarPronta(prisma: PrismaClient, input: AtualizarProntaInput): Promise<SaldoResult> {
    const { pedido_item_id, quantidade_pronta, tenant_id, company_id } = input

    if (quantidade_pronta < 0) {
      throw new AppError(400, 'Quantidade pronta nao pode ser negativa')
    }

    const item = await prisma.pedidoItem.findFirst({
      where: { id: pedido_item_id, tenant_id, company_id },
    })

    if (!item) {
      throw new AppError(404, 'Item do pedido nao encontrado')
    }

    const updated = await prisma.pedidoItem.update({
      where: { id: pedido_item_id },
      data: { quantidade_pronta_pedido: quantidade_pronta },
    })

    return {
      id: updated.id,
      quantidade_inicial_pedido: updated.quantidade_inicial_pedido,
      quantidade_atual_pedido: updated.quantidade_atual_pedido,
      quantidade_transferida_pedido: updated.quantidade_transferida_pedido,
      quantidade_cancelada_pedido: updated.quantidade_cancelada_pedido,
      quantidade_pronta_pedido: updated.quantidade_pronta_pedido,
    }
  },

  /**
   * Validar integridade do saldo de um PedidoItem.
   * Retorna true se a formula imutavel esta valida.
   */
  validarIntegridade(item: SaldoResult): boolean {
    const soma = item.quantidade_atual_pedido + item.quantidade_transferida_pedido + item.quantidade_cancelada_pedido
    return Math.abs(item.quantidade_inicial_pedido - soma) < 0.001
  },
}

// ── Helpers internos ──────────────────────────────────────────────────────────

async function atualizarStatusPedido(
  tx: PrismaClient,
  pedido_id: string,
  tenant_id: string,
  company_id: string,
): Promise<void> {
  const itens = await tx.pedidoItem.findMany({
    where: { pedido_id, tenant_id, company_id },
  })

  if (itens.length === 0) return

  const todosLiquidados = itens.every((i) => i.quantidade_atual_pedido === 0)
  const algumTransferido = itens.some((i) => i.quantidade_transferida_pedido > 0)

  let novoStatus: string
  if (todosLiquidados) {
    novoStatus = 'consolidado'
  } else if (algumTransferido) {
    novoStatus = 'transferencia'
  } else {
    novoStatus = 'aberto'
  }

  await tx.pedido.update({
    where: { id: pedido_id },
    data: { status: novoStatus },
  })
}
