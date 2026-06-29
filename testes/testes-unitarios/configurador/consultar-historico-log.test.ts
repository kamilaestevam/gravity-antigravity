// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { montarWhereHistoricoLog } from '../../../servicos-global/configurador/server/lib/consultar-historico-log.js'

const usuarioMaster = {
  id_usuario: 'usr_1',
  nome_usuario: 'Master',
  tipo_usuario: 'MASTER' as const,
  id_organizacao: 'org_1',
}

const usuarioPadrao = {
  ...usuarioMaster,
  tipo_usuario: 'PADRAO' as const,
}

describe('montarWhereHistoricoLog', () => {
  it('MASTER bypass sem produto na URL filtra só por id_organizacao', () => {
    expect(
      montarWhereHistoricoLog({
        usuario: usuarioMaster,
        limit: 25,
        bypassPermissao: true,
      }),
    ).toEqual({ id_organizacao: 'org_1' })
  })

  it('PADRAO combina visibilidade OR com filtro produto via AND', () => {
    expect(
      montarWhereHistoricoLog({
        usuario: usuarioPadrao,
        limit: 25,
        bypassPermissao: false,
      }),
    ).toEqual({
      AND: [
        {
          id_organizacao: 'org_1',
          OR: [
            { id_usuario: 'usr_1' },
            { id_ator_historico_log: 'usr_1' },
          ],
        },
        {
          OR: [
            { id_produto_historico_log: 'configurador' },
            { id_produto_historico_log: null },
          ],
        },
      ],
    })
  })

  it('produto explícito na URL aplica filtro único', () => {
    expect(
      montarWhereHistoricoLog({
        usuario: usuarioMaster,
        limit: 25,
        idProdutoHistoricoLog: 'pedido',
        bypassPermissao: true,
      }),
    ).toEqual({
      AND: [
        { id_organizacao: 'org_1' },
        { id_produto_historico_log: 'pedido' },
      ],
    })
  })
})
