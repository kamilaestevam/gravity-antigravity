// TST-UNI-CONFIG-000429 — cascata assinaturas ao mudar status do catálogo Admin
import { describe, expect, it } from 'vitest'
import { resolverAcaoCascataAssinaturasStatusCatalogo } from '../../../servicos-global/configurador/server/lib/cascata-assinatura-status-catalogo-produto-gravity'

describe('resolverAcaoCascataAssinaturasStatusCatalogo', () => {
  it('ATIVO → EM_BREVE suspende assinaturas', () => {
    expect(resolverAcaoCascataAssinaturasStatusCatalogo('ATIVO', 'EM_BREVE')).toBe('suspender')
  })

  it('EM_BREVE → ATIVO reativa assinaturas SUSPENSA', () => {
    expect(resolverAcaoCascataAssinaturasStatusCatalogo('EM_BREVE', 'ATIVO')).toBe('reativar')
  })

  it('SUSPENSO → ATIVO reativa assinaturas SUSPENSA', () => {
    expect(resolverAcaoCascataAssinaturasStatusCatalogo('SUSPENSO', 'ATIVO')).toBe('reativar')
  })

  it('LEGADO → ATIVO não reativa automaticamente', () => {
    expect(resolverAcaoCascataAssinaturasStatusCatalogo('LEGADO', 'ATIVO')).toBe(null)
  })

  it('INATIVO → ATIVO não reativa automaticamente', () => {
    expect(resolverAcaoCascataAssinaturasStatusCatalogo('INATIVO', 'ATIVO')).toBe(null)
  })

  it('ATIVO → SUSPENSO suspende', () => {
    expect(resolverAcaoCascataAssinaturasStatusCatalogo('ATIVO', 'SUSPENSO')).toBe('suspender')
  })

  it('ATIVO → LEGADO suspende', () => {
    expect(resolverAcaoCascataAssinaturasStatusCatalogo('ATIVO', 'LEGADO')).toBe('suspender')
  })

  it('mesmo status não dispara cascata', () => {
    expect(resolverAcaoCascataAssinaturasStatusCatalogo('EM_BREVE', 'EM_BREVE')).toBe(null)
  })

  it('EM_BREVE → SUSPENSO suspende (idempotente)', () => {
    expect(resolverAcaoCascataAssinaturasStatusCatalogo('EM_BREVE', 'SUSPENSO')).toBe('suspender')
  })
})
