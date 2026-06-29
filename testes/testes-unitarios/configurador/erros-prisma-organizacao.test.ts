// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { isErroPrismaSchemaOrganizacao } from '../../../servicos-global/configurador/server/lib/erros-prisma-organizacao.js'

describe('isErroPrismaSchemaOrganizacao', () => {
  it('detecta P2022 coluna ausente', () => {
    expect(isErroPrismaSchemaOrganizacao({ code: 'P2022', message: 'column id_organizacao' })).toBe(true)
  })

  it('detecta P2021 tabela ausente', () => {
    expect(isErroPrismaSchemaOrganizacao({ code: 'P2021' })).toBe(true)
  })

  it('ignora erro genérico', () => {
    expect(isErroPrismaSchemaOrganizacao(new Error('timeout'))).toBe(false)
  })
})
