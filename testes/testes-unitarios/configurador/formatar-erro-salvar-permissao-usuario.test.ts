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

  it('expõe mensagem acionável para UNAUTHORIZED (token ausente)', () => {
    const err = new GravityApiError('Token de autenticação ausente', 'UNAUTHORIZED')
    const fmt = formatarErroSalvarPermissaoUsuario(err)
    expect(fmt.toast).toContain('Sessão expirada')
    expect(fmt.toast).toContain('Token de autenticação ausente')
    expect(fmt.modal).toContain('Recarregue a página')
  })

  it('expõe mensagem acionável para FORBIDDEN (workspaces)', () => {
    const err = new GravityApiError(
      'Um ou mais workspaces não pertencem a esta organização',
      'FORBIDDEN',
    )
    const fmt = formatarErroSalvarPermissaoUsuario(err)
    expect(fmt.toast).toContain('Não foi possível atualizar vínculos')
    expect(fmt.toast).toContain('não pertencem a esta organização')
    expect(fmt.modal).toContain('Workspaces Vinculados')
  })
})
