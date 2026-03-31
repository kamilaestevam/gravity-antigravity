/**
 * rateioEngine.ts — Orquestrador de rateio com persistencia
 *
 * Usa rateioAlgorithms (funcoes puras) para calcular e persiste no banco.
 * Valida status da NF (deve estar em_composicao) antes de operar.
 */

import { PrismaClient } from '@prisma/client'

type TxClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>
import { calcularRateio, MetodoRateio, ItemRateio, ResultadoRateio } from '../lib/rateioAlgorithms.js'
import { AppError } from './nfStatusEngine.js'

interface DespesaComItens {
  id: string
  tipo: string
  valor_total: number
  metodo_rateio: MetodoRateio
}

interface RateioPreview {
  despesas: Array<{
    despesaId: string
    tipo: string
    valorTotal: number
    metodo: MetodoRateio
    resultado: ResultadoRateio
  }>
  totalGeral: number
  warnings: string[]
}

interface RateioAplicado {
  despesas: Array<{
    despesaId: string
    rateioCriados: number
  }>
  totalRateios: number
}

/**
 * Busca e valida a NF (deve existir e estar em_composicao)
 */
async function buscarNfValidada(
  prisma: PrismaClient,
  nfId: string,
  tenantId: string
): Promise<{ id: string; status: string }> {
  const nf = await prisma.nfImportacao.findFirst({
    where: { id: nfId, tenant_id: tenantId },
    select: { id: true, status: true },
  })

  if (!nf) {
    throw new AppError('NF Importacao nao encontrada', 404, 'NOT_FOUND')
  }

  if (nf.status !== 'em_composicao') {
    throw new AppError(
      `Rateio so pode ser calculado quando NF esta em_composicao (atual: ${nf.status})`,
      422,
      'INVALID_STATUS'
    )
  }

  return nf
}

/**
 * Busca despesas e itens da NF para calculo de rateio
 */
async function buscarDespesasEItens(
  prisma: PrismaClient,
  nfId: string,
  tenantId: string
): Promise<{ despesas: DespesaComItens[]; itens: ItemRateio[] }> {
  const [despesas, itensRaw] = await Promise.all([
    prisma.nfImportacaoDespesa.findMany({
      where: { nf_importacao_id: nfId, tenant_id: tenantId },
      select: { id: true, tipo: true, valor_total: true, metodo_rateio: true },
    }),
    prisma.nfImportacaoItem.findMany({
      where: { nf_importacao_id: nfId, tenant_id: tenantId },
      select: {
        id: true,
        peso_liquido: true,
        peso_bruto: true,
        valor_cif: true,
        valor_fob: true,
        quantidade: true,
        valor_ii: true,
      },
    }),
  ])

  if (despesas.length === 0) {
    throw new AppError('NF nao possui despesas para ratear', 422, 'NO_DESPESAS')
  }

  if (itensRaw.length === 0) {
    throw new AppError('NF nao possui itens para ratear', 422, 'NO_ITEMS')
  }

  const itens: ItemRateio[] = itensRaw.map((item: { id: string; peso_liquido: unknown; peso_bruto: unknown; valor_cif: unknown; valor_fob: unknown; quantidade: unknown; valor_ii: unknown }) => ({
    id: item.id,
    peso_liquido: Number(item.peso_liquido) || 0,
    peso_bruto: Number(item.peso_bruto) || 0,
    valor_cif: Number(item.valor_cif) || 0,
    valor_fob: Number(item.valor_fob) || 0,
    quantidade: Number(item.quantidade) || 0,
    valor_ii: Number(item.valor_ii) || 0,
  }))

  return {
    despesas: despesas.map((d: { id: string; tipo: string; valor_total: unknown; metodo_rateio: string }) => ({
      id: d.id,
      tipo: d.tipo,
      valor_total: Number(d.valor_total) || 0,
      metodo_rateio: d.metodo_rateio as MetodoRateio,
    })),
    itens,
  }
}

/**
 * Preview de rateio: calcula sem salvar no banco
 */
export async function previewRateio(
  prisma: PrismaClient,
  nfId: string,
  tenantId: string
): Promise<RateioPreview> {
  await buscarNfValidada(prisma, nfId, tenantId)
  const { despesas, itens } = await buscarDespesasEItens(prisma, nfId, tenantId)

  const allWarnings: string[] = []
  let totalGeral = 0

  const despesasPreview = despesas.map((despesa) => {
    const resultado = calcularRateio(despesa.metodo_rateio, despesa.valor_total, itens)
    allWarnings.push(...resultado.warnings)
    totalGeral += despesa.valor_total

    return {
      despesaId: despesa.id,
      tipo: despesa.tipo,
      valorTotal: despesa.valor_total,
      metodo: despesa.metodo_rateio,
      resultado,
    }
  })

  return {
    despesas: despesasPreview,
    totalGeral,
    warnings: allWarnings,
  }
}

/**
 * Aplica rateio: deleta rateios antigos e cria novos dentro de uma transacao
 */
export async function aplicarRateio(
  prisma: PrismaClient,
  nfId: string,
  tenantId: string,
  userId: string
): Promise<RateioAplicado> {
  await buscarNfValidada(prisma, nfId, tenantId)
  const { despesas, itens } = await buscarDespesasEItens(prisma, nfId, tenantId)

  return prisma.$transaction(async (tx: TxClient) => {
    // Deleta rateios antigos da NF inteira
    await tx.nfImportacaoRateio.deleteMany({
      where: {
        nf_despesa_id: { in: despesas.map((d) => d.id) },
        tenant_id: tenantId,
      },
    })

    const resultadoDespesas: Array<{ despesaId: string; rateioCriados: number }> = []
    let totalRateios = 0

    for (const despesa of despesas) {
      const resultado = calcularRateio(despesa.metodo_rateio, despesa.valor_total, itens)

      // Validar soma == total
      const somaCalculada = resultado.itens.reduce((s, r) => s + r.valor_rateado, 0)
      const diff = Math.abs(somaCalculada - despesa.valor_total)
      if (diff > 0.01) {
        throw new AppError(
          `Soma do rateio (${somaCalculada}) difere do total da despesa (${despesa.valor_total}) — despesa ${despesa.id}`,
          422,
          'RATEIO_SUM_MISMATCH'
        )
      }

      // Criar rateios
      for (const itemRateio of resultado.itens) {
        await tx.nfImportacaoRateio.create({
          data: {
            tenant_id: tenantId,
            product_id: 'nf-importacao',
            nf_despesa_id: despesa.id,
            nf_item_id: itemRateio.itemId,
            valor_rateado: itemRateio.valor_rateado,
            percentual: itemRateio.percentual,
            metodo: despesa.metodo_rateio,
            created_by: userId,
          },
        })
        totalRateios++
      }

      resultadoDespesas.push({
        despesaId: despesa.id,
        rateioCriados: resultado.itens.length,
      })
    }

    return { despesas: resultadoDespesas, totalRateios }
  })
}

/**
 * Override manual de um rateio especifico
 * Recalcula o percentual baseado no valor total da despesa
 */
export async function overrideManual(
  prisma: PrismaClient,
  rateioId: string,
  novoValor: number,
  tenantId: string,
  userId: string
): Promise<{ rateioId: string; valor_rateado: number; percentual: number }> {
  if (novoValor < 0) {
    throw new AppError('Valor do rateio nao pode ser negativo', 422, 'NEGATIVE_VALUE')
  }

  const rateio = await prisma.nfImportacaoRateio.findFirst({
    where: { id: rateioId, tenant_id: tenantId },
    include: {
      nf_despesa: {
        select: {
          id: true,
          valor_total: true,
          nf_importacao_id: true,
        },
      },
    },
  })

  if (!rateio) {
    throw new AppError('Rateio nao encontrado', 404, 'NOT_FOUND')
  }

  // Validar que a NF esta em_composicao
  const nf = await prisma.nfImportacao.findFirst({
    where: {
      id: (rateio as Record<string, unknown> & { nf_despesa: { nf_importacao_id: string; valor_total: number } }).nf_despesa.nf_importacao_id,
      tenant_id: tenantId,
    },
    select: { status: true },
  })

  if (!nf || nf.status !== 'em_composicao') {
    throw new AppError(
      'Override manual so pode ser feito quando NF esta em_composicao',
      422,
      'INVALID_STATUS'
    )
  }

  const despesaTotal = Number((rateio as Record<string, unknown> & { nf_despesa: { valor_total: number } }).nf_despesa.valor_total) || 0
  const percentual = despesaTotal > 0
    ? Math.round(((novoValor / despesaTotal) * 100 + Number.EPSILON) * 100) / 100
    : 0

  await prisma.nfImportacaoRateio.update({
    where: { id: rateioId },
    data: {
      valor_rateado: novoValor,
      percentual,
      metodo: 'MANUAL',
      updated_by: userId,
    },
  })

  return { rateioId, valor_rateado: novoValor, percentual }
}
