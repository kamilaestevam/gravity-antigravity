import { describe, expect, it } from 'vitest'
import { GravityApiError } from '../../../servicos-global/configurador/src/utils/gravity-api-error.js'
import { formatarErroSalvarWorkspacesUsuario } from '../../../servicos-global/configurador/src/utils/formatar-erro-salvar-workspaces-usuario.js'

describe('formatarErroSalvarWorkspacesUsuario', () => {
  it('expõe mensagem acionável para FORBIDDEN', () => {
    const err = new GravityApiError(
      'Um ou mais workspaces não pertencem a esta organização',
      'FORBIDDEN',
    )
    const fmt = formatarErroSalvarWorkspacesUsuario(err)
    expect(fmt.toast).toContain('workspaces vinculados')
    expect(fmt.toast).toContain('não pertencem a esta organização')
    expect(fmt.modal).toContain('O que fazer:')
    expect(fmt.modal).toContain('Workspaces Vinculados')
    expect(fmt.modal).not.toContain('salvar as permissões')
  })

  it('expõe mensagem acionável para UNAUTHORIZED', () => {
    const err = new GravityApiError('Token de autenticação ausente', 'UNAUTHORIZED')
    const fmt = formatarErroSalvarWorkspacesUsuario(err)
    expect(fmt.toast).toContain('Sessão expirada')
    expect(fmt.modal).toContain('workspaces vinculados')
  })

  it('não usa replace sobre texto de permissão', () => {
    const err = new GravityApiError('Falha genérica de vínculo', 'BAD_REQUEST')
    const fmt = formatarErroSalvarWorkspacesUsuario(err)
    expect(fmt.toast).toContain('workspaces vinculados')
    expect(fmt.toast).not.toContain('salvar as permissões')
  })
})
