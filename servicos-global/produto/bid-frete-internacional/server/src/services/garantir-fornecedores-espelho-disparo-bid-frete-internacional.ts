/**
 * Garante espelho BID antes do disparo — a lista na UI vem do Cadastros,
 * mas o motor persiste/lê fornecedor_bid_frete_internacional no Prisma tenant.
 */

import type { PrismaClient } from '../generated/client/index.js'
import {
  obterParceiroFreteCadastros,
  sincronizarFornecedorCadastros,
} from './sincronizar-fornecedores-cadastros.js'

export async function garantirFornecedoresEspelhoDisparoBidFrete(
  prisma: PrismaClient,
  id_organizacao: string,
  fornecedor_ids: string[],
): Promise<void> {
  if (fornecedor_ids.length === 0) return

  const existentes = await (prisma as any).fornecedorBidFreteInternacional.findMany({
    where: { id_fornecedor_bid_frete_internacional: { in: fornecedor_ids } },
    select: { id_fornecedor_bid_frete_internacional: true },
  })

  const idsExistentes = new Set(
    (existentes as Array<{ id_fornecedor_bid_frete_internacional: string }>).map(
      (f) => f.id_fornecedor_bid_frete_internacional,
    ),
  )

  const faltantes = fornecedor_ids.filter((id) => !idsExistentes.has(id))
  if (faltantes.length === 0) return

  await Promise.all(
    faltantes.map(async (id_fornecedor) => {
      const parceiro = await obterParceiroFreteCadastros(id_organizacao, id_fornecedor)
      if (parceiro) {
        await sincronizarFornecedorCadastros(prisma as never, id_organizacao, parceiro)
      }
    }),
  )
}
