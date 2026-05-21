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
  data_agendamento_parcela_bid_cambio: string // ISO date
}

interface PagarInput {
  id_parcela_bid_cambio: string
  valor_pago_parcela_bid_cambio: number         // 2 casas decimais
  taxa_fechamento_parcela_bid_cambio: number    // 4 casas decimais
  banco_corretora_parcela_bid_cambio: string
  numero_contrato_cambio_parcela_bid_cambio?: string
  anexos?: Array<{ nome_arquivo_anexo_bid_cambio?: string; nome_original_anexo_bid_cambio: string; url_anexo_bid_cambio: string; categoria_anexo_bid_cambio?: string }>
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
  const parcelas = await (prisma as any).bidCambioParcela.findMany({
    where: {
      id_parcela_bid_cambio: { in: input.parcela_ids },
      status_parcela_bid_cambio: 'PENDENTE',
    },
  })

  if (parcelas.length === 0) {
    throw new AppError('Nenhuma parcela pendente encontrada', 404, 'NOT_FOUND')
  }

  if (parcelas.length !== input.parcela_ids.length) {
    throw new AppError('Algumas parcelas nao estao pendentes', 400, 'INVALID_STATUS')
  }

  const dataAgendamento = new Date(input.data_agendamento_parcela_bid_cambio)

  const updated = await (prisma as any).bidCambioParcela.updateMany({
    where: {
      id_parcela_bid_cambio: { in: input.parcela_ids },
      status_parcela_bid_cambio: 'PENDENTE',
    },
    data: {
      status_parcela_bid_cambio: 'AGENDADO',
      data_agendamento_parcela_bid_cambio: dataAgendamento,
      data_vencimento_parcela_bid_cambio: dataAgendamento,
    },
  })

  return { agendadas: updated.count, data: input.data_agendamento_parcela_bid_cambio }
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
  const parcela = await (prisma as any).bidCambioParcela.findFirst({
    where: {
      id_parcela_bid_cambio: input.id_parcela_bid_cambio,
      status_parcela_bid_cambio: { in: ['PENDENTE', 'AGENDADO'] },
    },
  })

  if (!parcela) {
    throw new AppError('Parcela nao encontrada ou ja paga', 404, 'NOT_FOUND')
  }

  // Calcular limite: cambio_total - soma de parcelas ja pagas do mesmo pedido
  const parcelasPagas = await (prisma as any).bidCambioParcela.aggregate({
    where: {
      referencia_processo_parcela_bid_cambio: parcela.referencia_processo_parcela_bid_cambio,
      numero_pedido_parcela_bid_cambio: parcela.numero_pedido_parcela_bid_cambio,
      status_parcela_bid_cambio: 'PAGO',
    },
    _sum: { valor_pago_parcela_bid_cambio: true },
  })

  const totalPago = Number(parcelasPagas._sum?.valor_pago_parcela_bid_cambio ?? 0)
  const cambioTotal = Number(parcela.cambio_total_parcela_bid_cambio)
  const limiteRestante = cambioTotal - totalPago

  if (input.valor_pago_parcela_bid_cambio > limiteRestante) {
    throw new AppError(
      `Valor ${input.valor_pago_parcela_bid_cambio} excede o limite restante ${limiteRestante.toFixed(2)}`,
      400,
      'EXCEEDS_LIMIT'
    )
  }

  const valorBrl = input.valor_pago_parcela_bid_cambio * input.taxa_fechamento_parcela_bid_cambio

  // Atualizar parcela para PAGO
  await (prisma as any).bidCambioParcela.update({
    where: { id_parcela_bid_cambio: input.id_parcela_bid_cambio },
    data: {
      status_parcela_bid_cambio: 'PAGO',
      valor_pago_parcela_bid_cambio: input.valor_pago_parcela_bid_cambio,
      valor_pago_brl_parcela_bid_cambio: Math.round(valorBrl * 100) / 100,
      taxa_fechamento_parcela_bid_cambio: input.taxa_fechamento_parcela_bid_cambio,
      banco_corretora_parcela_bid_cambio: input.banco_corretora_parcela_bid_cambio,
      numero_contrato_cambio_parcela_bid_cambio: input.numero_contrato_cambio_parcela_bid_cambio,
      data_pagamento_parcela_bid_cambio: new Date(),
    },
  })

  // Ajustar proxima parcela pendente se valor diferente
  const diferenca = input.valor_pago_parcela_bid_cambio - Number(parcela.valor_a_pagar_parcela_bid_cambio)
  if (diferenca !== 0) {
    const proximaParcela = await (prisma as any).bidCambioParcela.findFirst({
      where: {
        referencia_processo_parcela_bid_cambio: parcela.referencia_processo_parcela_bid_cambio,
        numero_pedido_parcela_bid_cambio: parcela.numero_pedido_parcela_bid_cambio,
        status_parcela_bid_cambio: { in: ['PENDENTE', 'AGENDADO'] },
        numero_parcela_bid_cambio: { gt: parcela.numero_parcela_bid_cambio },
      },
      orderBy: { numero_parcela_bid_cambio: 'asc' },
    })

    if (proximaParcela) {
      const novoValor = Number(proximaParcela.valor_a_pagar_parcela_bid_cambio) - diferenca
      if (novoValor <= 0) {
        // Parcela zerada: eliminar (RN-105)
        await (prisma as any).bidCambioParcela.delete({
          where: { id_parcela_bid_cambio: proximaParcela.id_parcela_bid_cambio },
        })
      } else {
        await (prisma as any).bidCambioParcela.update({
          where: { id_parcela_bid_cambio: proximaParcela.id_parcela_bid_cambio },
          data: {
            valor_a_pagar_parcela_bid_cambio: Math.round(novoValor * 100) / 100,
            valor_a_pagar_brl_parcela_bid_cambio: Math.round(novoValor * input.taxa_fechamento_parcela_bid_cambio * 100) / 100,
          },
        })
      }
    }
  }

  // Criar anexos se fornecidos
  if (input.anexos && input.anexos.length > 0) {
    await (prisma as any).bidCambioAnexo.createMany({
      data: input.anexos.map(a => ({
        id_parcela_bid_cambio: input.id_parcela_bid_cambio,
        nome_arquivo_anexo_bid_cambio: a.nome_arquivo_anexo_bid_cambio ?? null,
        nome_original_anexo_bid_cambio: a.nome_original_anexo_bid_cambio,
        url_anexo_bid_cambio: a.url_anexo_bid_cambio,
        categoria_anexo_bid_cambio: a.categoria_anexo_bid_cambio ?? 'Contrato de Cambio',
      })),
    })
  }

  return {
    id_parcela_bid_cambio: input.id_parcela_bid_cambio,
    status_parcela_bid_cambio: 'PAGO',
    valor_pago_parcela_bid_cambio: input.valor_pago_parcela_bid_cambio,
    valor_pago_brl_parcela_bid_cambio: Math.round(valorBrl * 100) / 100,
    taxa_fechamento_parcela_bid_cambio: input.taxa_fechamento_parcela_bid_cambio,
  }
}

/**
 * Retornar parcela para PENDENTE
 * RN-106: volta com valor original, data original, sem recalculo automatico
 */
export async function retornarParaPendente(
  prisma: PrismaClient,
  id_parcela_bid_cambio: string,
) {
  const parcela = await (prisma as any).bidCambioParcela.findFirst({
    where: { id_parcela_bid_cambio, status_parcela_bid_cambio: 'PAGO' },
  })

  if (!parcela) {
    throw new AppError('Parcela nao encontrada ou nao esta paga', 404, 'NOT_FOUND')
  }

  await (prisma as any).bidCambioParcela.update({
    where: { id_parcela_bid_cambio },
    data: {
      status_parcela_bid_cambio: 'PENDENTE',
      valor_pago_parcela_bid_cambio: null,
      valor_pago_brl_parcela_bid_cambio: null,
      taxa_fechamento_parcela_bid_cambio: null,
      data_pagamento_parcela_bid_cambio: null,
      data_agendamento_parcela_bid_cambio: null,
      // RN-106: valor original mantido (valor_a_pagar_parcela_bid_cambio nao muda)
      // Data de vencimento volta para a original
      data_vencimento_parcela_bid_cambio: parcela.data_vencimento_original_parcela_bid_cambio ?? parcela.data_vencimento_parcela_bid_cambio,
    },
  })

  return { id_parcela_bid_cambio, status_parcela_bid_cambio: 'PENDENTE' }
}

/**
 * Recalcular parcelas quando "Cambio Total" do pedido muda
 * RN-110: diferenca reflete proporcionalmente nas parcelas pendentes/agendadas
 */
export async function recalcularParcelas(
  prisma: PrismaClient,
  referencia_processo_parcela_bid_cambio: string,
  numero_pedido_parcela_bid_cambio: string,
  novo_cambio_total: number,
) {
  const parcelas = await (prisma as any).bidCambioParcela.findMany({
    where: {
      referencia_processo_parcela_bid_cambio,
      numero_pedido_parcela_bid_cambio,
      status_parcela_bid_cambio: { in: ['PENDENTE', 'AGENDADO'] },
    },
    orderBy: { numero_parcela_bid_cambio: 'asc' },
  })

  for (const parcela of parcelas) {
    const novoValor = (Number(parcela.porcentagem_parcela_bid_cambio) / 100) * novo_cambio_total
    const rounded = Math.round(novoValor * 100) / 100

    if (rounded <= 0) {
      // RN-105: parcela zerada, eliminar
      await (prisma as any).bidCambioParcela.delete({
        where: { id_parcela_bid_cambio: parcela.id_parcela_bid_cambio },
      })
    } else {
      await (prisma as any).bidCambioParcela.update({
        where: { id_parcela_bid_cambio: parcela.id_parcela_bid_cambio },
        data: {
          cambio_total_parcela_bid_cambio: novo_cambio_total,
          valor_a_pagar_parcela_bid_cambio: rounded,
        },
      })
    }
  }

  return { recalculadas: parcelas.length }
}
