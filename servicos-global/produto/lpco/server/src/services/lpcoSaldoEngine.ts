/**
 * lpcoSaldoEngine.ts — Controle de saldo para LPCO Flex
 *
 * Formula: saldo_disponivel = quantidade_deferida - SUM(quantidade_vinculada)
 *
 * REGRAS:
 * - Se saldo_disponivel < quantidade_solicitada → REJEITAR com erro 400
 * - Se data_vigencia_fim < hoje → REJEITAR vinculo
 * - Cada LpcoVinculo consome parte do saldo
 * - Cancelar vinculo devolve saldo
 */

import { PrismaClient, Prisma } from '@prisma/client'
import { AppError } from './lpcoStatusEngine.js'

interface SaldoInfo {
  deferida: number
  vinculada: number
  disponivel: number
  expirada: boolean
}

export async function calcularSaldo(
  prisma: PrismaClient,
  lpcoId: string,
  tenantId: string,
  companyId: string
): Promise<SaldoInfo> {
  const lpco = await prisma.lpco.findFirst({
    where: { id: lpcoId, id_organizacao: tenantId, company_id: companyId },
    include: {
      vinculos: { where: { status: 'ativo' } },
    },
  })

  if (!lpco) {
    throw new AppError('LPCO nao encontrado', 404, 'NOT_FOUND')
  }

  if (lpco.tipo_lpco !== 'FLEX') {
    throw new AppError('Controle de saldo so se aplica a LPCO Flex', 400, 'NOT_FLEX')
  }

  const deferida = lpco.quantidade_deferida ? Number(lpco.quantidade_deferida) : 0

  const vinculada = lpco.vinculos.reduce((sum, v) => {
    return sum + (v.quantidade_vinculada ? Number(v.quantidade_vinculada) : 0)
  }, 0)

  const disponivel = deferida - vinculada
  const expirada = lpco.data_vigencia_fim ? new Date(lpco.data_vigencia_fim) < new Date() : false

  return { deferida, vinculada, disponivel, expirada }
}

export async function validarVinculo(
  prisma: PrismaClient,
  lpcoId: string,
  tenantId: string,
  companyId: string,
  quantidadeSolicitada: number | null
): Promise<void> {
  const lpco = await prisma.lpco.findFirst({
    where: { id: lpcoId, id_organizacao: tenantId, company_id: companyId },
  })

  if (!lpco) {
    throw new AppError('LPCO nao encontrado', 404, 'NOT_FOUND')
  }

  if (lpco.status !== 'deferida') {
    throw new AppError('Vinculo so pode ser criado em LPCO deferida', 400, 'NOT_DEFERIDA')
  }

  // Verificar vigencia
  if (lpco.data_vigencia_fim && new Date(lpco.data_vigencia_fim) < new Date()) {
    throw new AppError('LPCO com vigencia expirada', 400, 'VIGENCIA_EXPIRADA')
  }

  // Para LPCO Flex, verificar saldo
  if (lpco.tipo_lpco === 'FLEX' && quantidadeSolicitada != null) {
    const saldo = await calcularSaldo(prisma, lpcoId, tenantId, companyId)

    if (saldo.disponivel < quantidadeSolicitada) {
      throw new AppError(
        `Saldo insuficiente. Disponivel: ${saldo.disponivel}, Solicitado: ${quantidadeSolicitada}`,
        400,
        'SALDO_INSUFICIENTE'
      )
    }
  }

  // Para POR_OPERACAO, verificar se ja tem vinculo ativo (1:1)
  if (lpco.tipo_lpco === 'POR_OPERACAO') {
    const vinculoExistente = await prisma.lpcoVinculo.findFirst({
      where: { lpco_id: lpcoId, id_organizacao: tenantId, status: 'ativo' },
    })
    if (vinculoExistente) {
      throw new AppError('LPCO por operacao ja possui vinculo ativo', 400, 'VINCULO_EXISTENTE')
    }
  }
}
