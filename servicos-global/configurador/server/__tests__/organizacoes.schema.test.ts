// server/__tests__/tenants.schema.test.ts
// Testes unitários do CreateOrganizacaoSchema.
// Foco: regra cross-field BR → CNPJ obrigatório; !BR → CNPJ proibido.

import { describe, it, expect } from 'vitest'
import { CreateOrganizacaoSchema } from '../routes/organizacoes.js'

const baseInput = {
  nome_organizacao: 'Empresa Exemplo',
  subdominio_organizacao: 'empresa-exemplo',
  clerkUserId: 'user_clerk_123',
  owner: { email: 'owner@exemplo.com', name: 'Owner' },
}

describe('CreateOrganizacaoSchema — validação BR / CNPJ', () => {
  it('aceita BR com CNPJ válido', () => {
    const parsed = CreateOrganizacaoSchema.safeParse({
      ...baseInput,
      pais: 'BR',
      cnpj_organizacao: '12.345.678/0001-99',
    })
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.pais).toBe('BR')
      expect(parsed.data.cnpj_organizacao).toBe('12.345.678/0001-99')
    }
  })

  it('aplica default pais=BR quando pais ausente e exige CNPJ', () => {
    const semPais = CreateOrganizacaoSchema.safeParse({
      ...baseInput,
      cnpj_organizacao: '12.345.678/0001-99',
    })
    expect(semPais.success).toBe(true)
    if (semPais.success) expect(semPais.data.pais).toBe('BR')

    const semPaisSemCnpj = CreateOrganizacaoSchema.safeParse({ ...baseInput })
    expect(semPaisSemCnpj.success).toBe(false)
    if (!semPaisSemCnpj.success) {
      const erro = semPaisSemCnpj.error.errors.find((e) => e.path.includes('cnpj_organizacao'))
      expect(erro?.message).toMatch(/CNPJ é obrigatório quando país = BR/)
    }
  })

  it('rejeita BR sem CNPJ', () => {
    const parsed = CreateOrganizacaoSchema.safeParse({ ...baseInput, pais: 'BR' })
    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      const erro = parsed.error.errors.find((e) => e.path.includes('cnpj_organizacao'))
      expect(erro?.message).toMatch(/CNPJ é obrigatório quando país = BR/)
    }
  })

  it('rejeita BR com CNPJ em formato inválido', () => {
    const parsed = CreateOrganizacaoSchema.safeParse({
      ...baseInput,
      pais: 'BR',
      cnpj: '12345678000199',
    })
    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      const erro = parsed.error.errors.find((e) => e.path.includes('cnpj_organizacao'))
      expect(erro?.message).toMatch(/XX\.XXX\.XXX\/XXXX-XX/)
    }
  })

  it('aceita país estrangeiro sem CNPJ (ex: US)', () => {
    const parsed = CreateOrganizacaoSchema.safeParse({ ...baseInput, pais: 'US' })
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.pais).toBe('US')
      expect(parsed.data.cnpj_organizacao).toBeUndefined()
    }
  })

  it('rejeita país estrangeiro com CNPJ preenchido', () => {
    const parsed = CreateOrganizacaoSchema.safeParse({
      ...baseInput,
      pais: 'US',
      cnpj_organizacao: '12.345.678/0001-99',
    })
    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      const erro = parsed.error.errors.find((e) => e.path.includes('cnpj_organizacao'))
      expect(erro?.message).toMatch(/só pode ser preenchido quando país = BR/)
    }
  })

  it('rejeita país em formato inválido (não ISO-2)', () => {
    const parsed = CreateOrganizacaoSchema.safeParse({ ...baseInput, pais: 'Brasil' })
    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      const erro = parsed.error.errors.find((e) => e.path.includes('pais'))
      expect(erro?.message).toMatch(/ISO-2/)
    }
  })

  it('rejeita slug com caracteres inválidos', () => {
    const parsed = CreateOrganizacaoSchema.safeParse({
      ...baseInput,
      subdominio_organizacao: 'Empresa Exemplo!',
      pais: 'BR',
      cnpj_organizacao: '12.345.678/0001-99',
    })
    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      const erro = parsed.error.errors.find((e) => e.path.includes('subdominio_organizacao'))
      expect(erro?.message).toMatch(/lowercase alfanumérico/)
    }
  })
})
