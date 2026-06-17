import { describe, it, expect } from 'vitest'
import { AppError } from '../../../servicos-global/produto/bid-frete-internacional/server/src/lib/erros'
import { relancarSeSchemaDrift } from '../../../servicos-global/produto/bid-frete-internacional/server/src/lib/prisma-erro-schema'

describe('relancarSeSchemaDrift', () => {
  it('converte Unknown argument de incluir_armazenagem em SCHEMA_DRIFT acionável', () => {
    const err = new Error(
      'Unknown argument `incluir_armazenagem_cotacao_bid_frete_internacional`. Available options are marked with ?.',
    )
    expect(() => relancarSeSchemaDrift(err)).toThrow(AppError)
    try {
      relancarSeSchemaDrift(err)
    } catch (e) {
      const appErr = e as AppError
      expect(appErr.statusCode).toBe(503)
      expect(appErr.code).toBe('SCHEMA_DRIFT')
      expect(appErr.message).toContain('prisma:generate')
    }
  })

  it('converte P2022 em SCHEMA_DRIFT de banco', () => {
    const err = Object.assign(new Error('Column not found'), { code: 'P2022' })
    expect(() => relancarSeSchemaDrift(err)).toThrow(AppError)
    try {
      relancarSeSchemaDrift(err)
    } catch (e) {
      const appErr = e as AppError
      expect(appErr.statusCode).toBe(503)
      expect(appErr.message).toContain('migrate deploy')
    }
  })

  it('relança erro genérico sem alterar', () => {
    const err = new Error('outro erro')
    expect(() => relancarSeSchemaDrift(err)).toThrow('outro erro')
  })
})
