import { describe, it, expect } from 'vitest'
import { slugificar, formatarSequencial, montarSuid, gerarSuid } from '../../server/src/utils/gerar-suid.js'

describe('slugificar', () => {
  it('remove acentos, uppercase, troca não-alfanuméricos por hífen', () => {
    expect(slugificar('CAOA Montadora Ltda.')).toBe('CAOA-MONTADORA-LTDA')
  })

  it('remove hífens nas pontas e colapsa repetidos', () => {
    expect(slugificar('  -- Foo  Bar --  ')).toBe('FOO-BAR')
  })

  it('aceita números', () => {
    expect(slugificar('Empresa 123')).toBe('EMPRESA-123')
  })
})

describe('formatarSequencial', () => {
  it('preenche com zeros à esquerda até 5 dígitos', () => {
    expect(formatarSequencial(1)).toBe('00001')
    expect(formatarSequencial(99)).toBe('00099')
    expect(formatarSequencial(99999)).toBe('99999')
  })
})

describe('montarSuid', () => {
  it('produz formato PAIS-SLUG-SEQ', () => {
    expect(montarSuid('br', 'CAOA Montadora', 1)).toBe('BR-CAOA-MONTADORA-00001')
  })
})

describe('gerarSuid', () => {
  it('parte de count+1 e retorna primeiro candidato livre', async () => {
    const fakePrisma = {
      empresa: {
        count: async () => 0,
        findUnique: async () => null,
      },
    } as unknown as Parameters<typeof gerarSuid>[0]
    const suid = await gerarSuid(fakePrisma, { id_organizacao: 'org1', pais: 'BR', nome_empresa: 'Foo' })
    expect(suid).toBe('BR-FOO-00001')
  })

  it('avança o sequencial em caso de colisão', async () => {
    let chamadas = 0
    const fakePrisma = {
      empresa: {
        count: async () => 0,
        findUnique: async () => {
          chamadas++
          // primeiros 2 SUIDs já existem; terceiro está livre
          return chamadas <= 2 ? ({} as unknown) : null
        },
      },
    } as unknown as Parameters<typeof gerarSuid>[0]
    const suid = await gerarSuid(fakePrisma, { id_organizacao: 'org1', pais: 'BR', nome_empresa: 'Foo' })
    expect(suid).toBe('BR-FOO-00003')
  })

  it('lança erro após 50 tentativas frustradas', async () => {
    const fakePrisma = {
      empresa: {
        count: async () => 0,
        findUnique: async () => ({} as unknown),
      },
    } as unknown as Parameters<typeof gerarSuid>[0]
    await expect(
      gerarSuid(fakePrisma, { id_organizacao: 'org1', pais: 'BR', nome_empresa: 'Foo' }),
    ).rejects.toThrow(/50 tentativas/)
  })
})
