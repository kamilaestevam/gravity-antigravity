/**
 * parcelaEngine.ts — Motor de Gestao de Parcelas de Cambio
 * Gerencia o ciclo: PENDENTE -> AGENDADO -> PAGO
 * Inclui recalculo de saldo, pagamento parcial e retorno a pendente.
 *
 * Regras do legado DATI portadas:
 * - RN-100 a RN-110 (ver PRD)
 */

import { PrismaClient } from '@prisma/client'
import { AppError } from '../lib/errors.js'
import { calcularDataVencimento } from './vencimentoEngine.js'

interface AgendarInput {
  parcela_ids: string[]
  data_agendamento: string // ISO date
}

interface PagarInput {
  parcela_id: string
  valor_pago: number         // 2 casas decimais
  taxa_fechamento: number    // 4 casas decimais
  banco_corretora: string
  numero_contrato?: string
  anexos?: Array<{ nome_arquivo?: string; nome_original: string; url: string; categoria?: string }>
}

/**
 * Agendar uma ou mais parcelas
 * Status: PENDENTE -> AGENDADO
 * Atualiza data de vencimento
 */
export async function agendarParcelas(
  prisma: PrismaClient,
  tenantId: string,
  userId: string,
  input: AgendarInput
) {
  const parcelas = await (prisma as any).parcelaCambio.findMany({
    where: {
      id: { in: input.parcela_ids },
      status: 'PENDENTE',
    },
  })

  if (parcelas.length === 0) {
    throw new AppError('Nenhuma parcela pendente encontrada', 404, 'NOT_FOUND')
  }

  if (parcelas.length !== input.parcela_ids.length) {
    throw new AppError('Algumas parcelas nao estao pendentes', 400, 'INVALID_STATUS')
  }

  const dataAgendamento = new Date(input.data_agendamento)

  const updated = await (prisma as any).parcelaCambio.updateMany({
    where: {
      id: { in: input.parcela_ids },
      status: 'PENDENTE',
    },
    data: {
      status: 'AGENDADO',
      data_agendamento: dataAgendamento,
      data_vencimento: dataAgendamento,
    },
  })

  return { agendadas: updated.count, data: input.data_agendamento }
}

/**
 * Registrar pagamento de uma parcela
 * Status: PENDENTE|AGENDADO -> PAGO
 *
 * Regras:
 * - Valor pode ser diferente do valor da parcela
 * - Nao pode ultrapassar (cambio_total - parcelas ja pagas do pedido)
 * - Se valor menor: diferenca vai para proxima parcela pendente
 * - Se valor maior (dentro do limite): proxima parcela ajustada
 */
export async function pagarParcela(
  prisma: PrismaClient,
  tenantId: string,
  userId: string,
  input: PagarInput
) {
  const parcela = await (prisma as any).parcelaCambio.findFirst({
    where: {
      id: input.parcela_id,
      status: { in: ['PENDENTE', 'AGENDADO'] },
    },
  })

  if (!parcela) {
    throw new AppError('Parcela nao encontrada ou ja paga', 404, 'NOT_FOUND')
  }

  // Calcular limite: cambio_total - soma de parcelas ja pagas do mesmo pedido
  const parcelasPagas = await (prisma as any).parcelaCambio.aggregate({
    where: {
      referencia_processo: parcela.referencia_processo,
      numero_pedido: parcela.numero_pedido,
      status: 'PAGO',
    },
    _sum: { valor_pago: true },
  })

  const totalPago = Number(parcelasPagas._sum?.valor_pago ?? 0)
  const cambioTotal = Number(parcela.cambio_total)
  const limiteRestante = cambioTotal - totalPago

  if (input.valor_pago > limiteRestante) {
    throw new AppError(
      `Valor ${input.valor_pago} excede o limite restante ${limiteRestante.toFixed(2)}`,
      400,
      'EXCEEDS_LIMIT'
    )
  }

  const valorBrl = input.valor_pago * input.taxa_fechamento

  // Atualizar parcela para PAGO
  await (prisma as any).parcelaCambio.update({
    where: { id: input.parcela_id },
    data: {
      status: 'PAGO',
      valor_pago: input.valor_pago,
      valor_pago_brl: Math.round(valorBrl * 100) / 100,
      taxa_fechamento: input.taxa_fechamento,
      banco_corretora: input.banco_corretora,
      numero_contrato_cambio: input.numero_contrato,
      data_pagamento: new Date(),
    },
  })

  // Ajustar proxima parcela pendente se valor diferente
  const diferenca = input.valor_pago - Number(parcela.valor_a_pagar)
  if (diferenca !== 0) {
    const proximaParcela = await (prisma as any).parcelaCambio.findFirst({
      where: {
        referencia_processo: parcela.referencia_processo,
        numero_pedido: parcela.numero_pedido,
        status: { in: ['PENDENTE', 'AGENDADO'] },
        numero_parcela: { gt: parcela.numero_parcela },
      },
      orderBy: { numero_parcela: 'asc' },
    })

    if (proximaParcela) {
      const novoValor = Number(proximaParcela.valor_a_pagar) - diferenca
      if (novoValor <= 0) {
        // Parcela zerada: eliminar (RN-105)
        await (prisma as any).parcelaCambio.delete({
          where: { id: proximaParcela.id },
        })
      } else {
        await (prisma as any).parcelaCambio.update({
          where: { id: proximaParcela.id },
          data: {
            valor_a_pagar: Math.round(novoValor * 100) / 100,
            valor_a_pagar_brl: Math.round(novoValor * input.taxa_fechamento * 100) / 100,
          },
        })
      }
    }
  }

  // Criar anexos se fornecidos
  if (input.anexos && input.anexos.length > 0) {
    await (prisma as any).anexoCambio.createMany({
      data: input.anexos.map(a => ({
        parcela_id: input.parcela_id,
        nome_arquivo: a.nome_arquivo ?? null,
        nome_original: a.nome_original,
        url: a.url,
        categoria: a.categoria ?? 'Contrato de Cambio',
      })),
    })
  }

  return {
    parcela_id: input.parcela_id,
    status: 'PAGO',
    valor_pago: input.valor_pago,
    valor_pago_brl: Math.round(valorBrl * 100) / 100,
    taxa: input.taxa_fechamento,
  }
}

/**
 * Retornar parcela para PENDENTE
 * RN-106: volta com valor original, data original, sem recalculo automatico
 */
export async function retornarParaPendente(
  prisma: PrismaClient,
  parcela_id: string,
) {
  const parcela = await (prisma as any).parcelaCambio.findFirst({
    where: { id: parcela_id, status: 'PAGO' },
  })

  if (!parcela) {
    throw new AppError('Parcela nao encontrada ou nao esta paga', 404, 'NOT_FOUND')
  }

  await (prisma as any).parcelaCambio.update({
    where: { id: parcela_id },
    data: {
      status: 'PENDENTE',
      valor_pago: null,
      valor_pago_brl: null,
      taxa_fechamento: null,
      data_pagamento: null,
      data_agendamento: null,
      // RN-106: valor original mantido (valor_a_pagar nao muda)
      // Data de vencimento volta para a original
      data_vencimento: parcela.data_vencimento_original ?? parcela.data_vencimento,
    },
  })

  return { parcela_id, status: 'PENDENTE' }
}

/**
 * Recalcular parcelas quando "Cambio Total" do pedido muda
 * RN-110: diferenca reflete proporcionalmente nas parcelas pendentes/agendadas
 */
export async function recalcularParcelas(
  prisma: PrismaClient,
  referencia_processo: string,
  numero_pedido: string,
  novo_cambio_total: number,
) {
  const parcelas = await (prisma as any).parcelaCambio.findMany({
    where: {
      referencia_processo,
      numero_pedido,
      status: { in: ['PENDENTE', 'AGENDADO'] },
    },
    orderBy: { numero_parcela: 'asc' },
  })

  for (const parcela of parcelas) {
    const novoValor = (Number(parcela.porcentagem_parcela) / 100) * novo_cambio_total
    const rounded = Math.round(novoValor * 100) / 100

    if (rounded <= 0) {
      // RN-105: parcela zerada, eliminar
      await (prisma as any).parcelaCambio.delete({
        where: { id: parcela.id },
      })
    } else {
      await (prisma as any).parcelaCambio.update({
        where: { id: parcela.id },
        data: {
          cambio_total: novo_cambio_total,
          valor_a_pagar: rounded,
        },
      })
    }
  }

  return { recalculadas: parcelas.length }
}
