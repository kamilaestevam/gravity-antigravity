import { describe, it, expect } from 'vitest'
import {
  gerarId,
  parseId,
  PREFIXOS,
} from '../../../produto/nf-importacao/server/src/lib/idGenerator'

const ANO_ATUAL = new Date().getFullYear().toString().slice(-2)

// ============================================
// gerarId
// ============================================
describe('gerarId', () => {
  it('gera ID com prefixo NF', () => {
    const id = gerarId(PREFIXOS.NF, 1)
    expect(id).toBe(`nfim_id_0000001/${ANO_ATUAL}`)
  })

  it('gera ID com prefixo ITEM', () => {
    const id = gerarId(PREFIXOS.ITEM, 42)
    expect(id).toBe(`nfit_id_0000042/${ANO_ATUAL}`)
  })

  it('gera ID com prefixo DESPESA', () => {
    const id = gerarId(PREFIXOS.DESPESA, 100)
    expect(id).toBe(`nfdp_id_0000100/${ANO_ATUAL}`)
  })

  it('gera ID com prefixo RATEIO', () => {
    const id = gerarId(PREFIXOS.RATEIO, 999)
    expect(id).toBe(`nfrt_id_0000999/${ANO_ATUAL}`)
  })

  it('padding sequencial: 1 -> 0000001', () => {
    const id = gerarId(PREFIXOS.NF, 1)
    expect(id).toMatch(/nfim_id_0000001\//)
  })

  it('padding sequencial: 123456 -> 0123456', () => {
    const id = gerarId(PREFIXOS.NF, 123456)
    expect(id).toMatch(/nfim_id_0123456\//)
  })

  it('sequencial maximo 9999999', () => {
    const id = gerarId(PREFIXOS.NF, 9999999)
    expect(id).toBe(`nfim_id_9999999/${ANO_ATUAL}`)
  })

  it('formato geral: prefixo + 7 digitos + / + 2 digitos ano', () => {
    const id = gerarId(PREFIXOS.ITEM, 5)
    expect(id).toMatch(/^[a-z]+_id_\d{7}\/\d{2}$/)
  })
})

// ============================================
// parseId
// ============================================
describe('parseId', () => {
  it('parseId roundtrip com NF', () => {
    const id = gerarId(PREFIXOS.NF, 42)
    const parsed = parseId(id)
    expect(parsed).not.toBeNull()
    expect(parsed!.prefixo).toBe('nfim_id_')
    expect(parsed!.sequencial).toBe(42)
    expect(parsed!.ano).toBe(ANO_ATUAL)
  })

  it('parseId roundtrip com DESPESA', () => {
    const id = gerarId(PREFIXOS.DESPESA, 7777)
    const parsed = parseId(id)
    expect(parsed).not.toBeNull()
    expect(parsed!.prefixo).toBe('nfdp_id_')
    expect(parsed!.sequencial).toBe(7777)
  })

  it('parseId retorna null para formato invalido', () => {
    expect(parseId('invalid')).toBeNull()
    expect(parseId('nfim_id_123/26')).toBeNull() // sequencial curto
    expect(parseId('nfim_id_00000001/26')).toBeNull() // 8 digitos
    expect(parseId('NFIM_ID_0000001/26')).toBeNull() // uppercase
    expect(parseId('')).toBeNull()
  })

  it('parseId com sequencial grande 9999999', () => {
    const id = gerarId(PREFIXOS.RATEIO, 9999999)
    const parsed = parseId(id)
    expect(parsed).not.toBeNull()
    expect(parsed!.sequencial).toBe(9999999)
  })

  it('parseId sequencial com leading zeros', () => {
    const parsed = parseId('nfim_id_0000001/26')
    expect(parsed).not.toBeNull()
    expect(parsed!.sequencial).toBe(1)
  })
})
