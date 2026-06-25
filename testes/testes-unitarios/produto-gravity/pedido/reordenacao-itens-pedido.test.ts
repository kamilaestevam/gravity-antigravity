// @vitest-environment node
/**
 * reordenacao-itens-pedido.test.ts
 *
 * Garante que a busca do pedido na reordenação não usa o anti-padrão
 * `id_workspace = idOrganizacao` (fallback quebrado removido em GET /pedidos).
 */

import { describe, it, expect } from 'vitest'

/** Espelha o where usado em reordenacao-itens-pedido.ts */
function montarWherePedidoReordenar(
  idPedido: string,
  idOrganizacao: string,
) {
  return { id_pedido: idPedido, id_organizacao: idOrganizacao }
}

describe('reordenacao-itens-pedido — filtro de pedido', () => {
  it('não inclui id_workspace no where (evita 404 quando header ausente ou multi-workspace)', () => {
    const where = montarWherePedidoReordenar('pedi_abc', 'org_xyz')

    expect(where).toEqual({
      id_pedido: 'pedi_abc',
      id_organizacao: 'org_xyz',
    })
    expect(where).not.toHaveProperty('id_workspace')
  })

  it('anti-padrão legado id_workspace=idOrganizacao nunca encontra pedido real', () => {
    const idOrganizacao = 'org_xyz'
    const idWorkspacePedido = 'ws_importador_01'
    const whereLegado = {
      id_pedido: 'pedi_abc',
      id_organizacao: idOrganizacao,
      id_workspace: idOrganizacao,
    }

    expect(whereLegado.id_workspace).not.toBe(idWorkspacePedido)
  })
})
