// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { parseDataNcmSiscomex } from '../../../servicos-global/cadastros/server/src/connectors/portalUnicoNcm.js'

describe('parseDataNcmSiscomex', () => {
  it('parseia DD/MM/YYYY do Portal Único', () => {
    const d = parseDataNcmSiscomex('01/04/2022')
    expect(d?.toISOString()).toBe('2022-04-01T00:00:00.000Z')
  })

  it('retorna null para vigência aberta 31/12/9999', () => {
    expect(parseDataNcmSiscomex('31/12/9999')).toBeNull()
  })

  it('retorna null para string inválida', () => {
    expect(parseDataNcmSiscomex('invalid')).toBeNull()
  })
})
