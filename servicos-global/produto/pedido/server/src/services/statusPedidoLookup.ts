/**
 * statusPedidoLookup.ts — helper para resolver id_pedido_status a partir do nome.
 *
 * Contexto (Débito 2B, Coordenador):
 *   - Pedido.id_status_pedido é uma FK real para StatusPedido.id_pedido_status
 *     (migration 20260508010000_pedido_status_fk_real_e_backfill).
 *   - Toda rota que cria/duplica pedido deve popular este campo, senão o pedido
 *     fica sem vínculo com o catálogo de status (id_status_pedido NULL é tolerado
 *     pelo schema atual, mas é débito — em PR futuro vira NOT NULL).
 *   - Catálogo (StatusPedido) é auto-seedado pelo Configurador com 7 nomes
 *     (rascunho, aberto, em_andamento, aprovado, transferencia, consolidado,
 *     cancelado), unique por (id_organizacao, nome_pedido_status).
 *
 * Uso:
 *   const idStatusRascunho = await resolverIdStatusPedido(db, idOrganizacao, 'rascunho')
 *   await db.pedido.create({ data: { ..., id_status_pedido: idStatusRascunho } })
 *
 * Falha alta (Mandamento 08): se o nome não existir no catálogo da organização,
 * lança erro em vez de retornar null silencioso. Quem chama decide se segue
 * sem o vínculo (via try/catch) ou aborta a criação.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DbContext = any

export async function resolverIdStatusPedido(
  db: DbContext,
  idOrganizacao: string,
  nomeStatus: string,
): Promise<string> {
  const status = await db.statusPedido.findFirst({
    where: {
      id_organizacao: idOrganizacao,
      nome_pedido_status: nomeStatus,
    },
    select: { id_pedido_status: true },
  })

  if (!status) {
    throw new Error(
      `[statusPedidoLookup] StatusPedido.nome_pedido_status='${nomeStatus}' nao encontrado na organizacao=${idOrganizacao}. ` +
      `Verifique se o auto-seed do catalogo de status rodou para esta organizacao.`,
    )
  }

  return status.id_pedido_status
}

/**
 * Versão tolerante: retorna null se não encontrar, em vez de lançar.
 * Útil para criações em lote (importação) onde queremos persistir o pedido
 * mesmo sem o vínculo de status, e logar o problema separadamente.
 */
export async function resolverIdStatusPedidoOpcional(
  db: DbContext,
  idOrganizacao: string,
  nomeStatus: string,
): Promise<string | null> {
  const status = await db.statusPedido.findFirst({
    where: {
      id_organizacao: idOrganizacao,
      nome_pedido_status: nomeStatus,
    },
    select: { id_pedido_status: true },
  })

  if (!status) {
    console.warn(
      `[statusPedidoLookup] StatusPedido.nome_pedido_status='${nomeStatus}' ` +
      `nao encontrado na organizacao=${idOrganizacao}. Pedido sera criado sem vinculo.`,
    )
    return null
  }

  return status.id_pedido_status
}
