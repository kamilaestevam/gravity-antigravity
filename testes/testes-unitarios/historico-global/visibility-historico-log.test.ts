// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { montarFiltroVisibilidadeHistoricoLog } from '../../../servicos-global/servicos-plataforma/historico-global/server/lib/visibility.js'

describe('montarFiltroVisibilidadeHistoricoLog', () => {
  const usuarioBase = {
    id_usuario: 'usr_1',
    nome_usuario: 'Teste',
    id_organizacao: 'org_1',
  }

  it('MASTER filtra só por id_organizacao', () => {
    expect(
      montarFiltroVisibilidadeHistoricoLog({
        ...usuarioBase,
        tipo_usuario: 'MASTER',
      }),
    ).toEqual({ id_organizacao: 'org_1' })
  })

  it('PADRAO filtra por id_usuario OU id_ator_historico_log', () => {
    expect(
      montarFiltroVisibilidadeHistoricoLog({
        ...usuarioBase,
        tipo_usuario: 'PADRAO',
      }),
    ).toEqual({
      id_organizacao: 'org_1',
      OR: [
        { id_usuario: 'usr_1' },
        { id_ator_historico_log: 'usr_1' },
      ],
    })
  })
})
