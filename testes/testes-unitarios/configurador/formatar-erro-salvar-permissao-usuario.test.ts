import { describe, expect, it } from 'vitest'
import { GravityApiError } from '../../../servicos-global/configurador/src/utils/gravity-api-error.js'
import { formatarErroSalvarPermissaoUsuario } from '../../../servicos-global/configurador/src/utils/formatar-erro-salvar-permissao-usuario.js'
import { CODIGO_ERRO_FORNECEDOR_NAO_PROVISIONADO } from '../../../servicos-global/configurador/shared/mensagens-erro-visao-fornecedor-permissao.js'

describe('formatarErroSalvarPermissaoUsuario', () => {
  it('expõe motivo e passos para FORNECEDOR_NAO_PROVISIONADO', () => {
    const err = new GravityApiError(
      'Este usuário ainda não tem vínculo ativo entre conta Gravity e empresa fornecedora no Cadastros.',
      CODIGO_ERRO_FORNECEDOR_NAO_PROVISIONADO,
      [
        'Abra Configurador → Fornecedores e confirme que a empresa do agente existe no cartório.',
        'Convide o usuário como tipo Fornecedor, selecionando categoria e a empresa do cartório.',
      ],
    )

    const fmt = formatarErroSalvarPermissaoUsuario(err, {
      nomeProduto: 'Bid Frete Internacional',
      nomeWorkspace: 'FIDES LTDA',
    })

    expect(fmt.toast).toContain('Fornecedor não provisionado')
    expect(fmt.toast).toContain('FIDES LTDA')
    expect(fmt.modal).toContain('O que fazer:')
    expect(fmt.modal).toContain('• Abra Configurador → Fornecedores')
  })
})
