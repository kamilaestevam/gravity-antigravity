import { describe, expect, it } from 'vitest'
import { resolverNomeExibicaoUsuario } from '../../../../servicos-global/shell/utils/resolver-nome-exibicao-usuario'

describe('resolverNomeExibicaoUsuario', () => {
  it('aplica override para conta prodmaster01', () => {
    expect(
      resolverNomeExibicaoUsuario(
        'dmmltda+prodmaster01@gmail.com dmmltda+prodmaster01@gmail.com',
        'dmmltda+prodmaster01@gmail.com',
      ),
    ).toBe('Usuário Teste Gravity')
  })

  it('remove nome duplicado token a token', () => {
    expect(resolverNomeExibicaoUsuario('Daniel Daniel', '')).toBe('Daniel')
  })
})
