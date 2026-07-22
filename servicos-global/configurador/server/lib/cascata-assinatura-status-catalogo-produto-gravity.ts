/**
 * Cascata de assinaturas ao mudar status_produto_gravity no Admin.
 *
 * Decisões dono TASK-000429:
 * - ATIVO → EM_BREVE | SUSPENSO | LEGADO | INATIVO: suspende ATIVA/EM_TESTE
 * - EM_BREVE | SUSPENSO → ATIVO: reativa SUSPENSA → ATIVA
 * - LEGADO | INATIVO → ATIVO: sem reativação automática
 * - CANCELADA nunca é alterada (paridade toggleStatus 2026-05-04)
 */

import type { Prisma } from '../../../../configurador/generated/index.js'

export type StatusCatalogoProdutoGravity =
  | 'ATIVO'
  | 'EM_BREVE'
  | 'SUSPENSO'
  | 'LEGADO'
  | 'INATIVO'

const STATUS_COM_ACESSO_BLOQUEADO = new Set<StatusCatalogoProdutoGravity>([
  'EM_BREVE',
  'SUSPENSO',
  'LEGADO',
  'INATIVO',
])

function normalizarStatusCatalogo(status: string): string {
  return (status ?? '').toUpperCase()
}

/** Resolve ação de cascata — função pura (testável). */
export function resolverAcaoCascataAssinaturasStatusCatalogo(
  statusAnterior: string,
  statusNovo: string,
): 'suspender' | 'reativar' | null {
  const anterior = normalizarStatusCatalogo(statusAnterior)
  const novo = normalizarStatusCatalogo(statusNovo)
  if (anterior === novo) return null

  if (
    novo === 'ATIVO' &&
    (anterior === 'EM_BREVE' || anterior === 'SUSPENSO')
  ) {
    return 'reativar'
  }

  if (STATUS_COM_ACESSO_BLOQUEADO.has(novo as StatusCatalogoProdutoGravity)) {
    return 'suspender'
  }

  return null
}

export async function aplicarCascataAssinaturasStatusCatalogo(
  tx: Prisma.TransactionClient,
  id_produto_gravity: string,
  acao: 'suspender' | 'reativar',
): Promise<void> {
  if (acao === 'suspender') {
    await tx.produtoGravityAssinatura.updateMany({
      where: {
        id_produto_gravity,
        status_assinatura_produto_gravity: { in: ['ATIVA', 'EM_TESTE'] },
      },
      data: { status_assinatura_produto_gravity: 'SUSPENSA' },
    })
    return
  }

  await tx.produtoGravityAssinatura.updateMany({
    where: {
      id_produto_gravity,
      status_assinatura_produto_gravity: 'SUSPENSA',
    },
    data: { status_assinatura_produto_gravity: 'ATIVA' },
  })
}
