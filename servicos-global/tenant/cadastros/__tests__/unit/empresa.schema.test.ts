import { describe, it, expect } from 'vitest'
import { criarEmpresaSchema, atualizarEmpresaSchema } from '../../shared/schemas/empresa.schema.js'

const empresaBR = {
  id_organizacao: 'org-1',
  nome_empresa: 'CAOA Montadora',
  cnpj: '12.345.678/0001-90',
  pais: 'BR',
  pode_ser_importador: true,
}

describe('criarEmpresaSchema — país BR', () => {
  it('aceita CNPJ válido com flag importador', () => {
    expect(() => criarEmpresaSchema.parse(empresaBR)).not.toThrow()
  })

  it('exige CNPJ quando pais=BR', () => {
    const { cnpj: _drop, ...semCnpj } = empresaBR
    expect(() => criarEmpresaSchema.parse(semCnpj)).toThrow(/cnpj é obrigatório/)
  })

  it('rejeita CNPJ em formato inválido', () => {
    expect(() => criarEmpresaSchema.parse({ ...empresaBR, cnpj: '12345678000190' })).toThrow(
      /XX\.XXX\.XXX/,
    )
  })

  it('exige pelo menos uma flag pode_ser_*', () => {
    expect(() =>
      criarEmpresaSchema.parse({ ...empresaBR, pode_ser_importador: false }),
    ).toThrow(/flag pode_ser_/)
  })
})

describe('criarEmpresaSchema — país estrangeiro', () => {
  it('aceita empresa estrangeira sem CNPJ, com TIN', () => {
    const empresaCN = {
      id_organizacao: 'org-1',
      nome_empresa: 'Shenzhen Trading',
      tin: 'CN-12345',
      pais: 'CN',
      pode_ser_exportador: true,
    }
    expect(() => criarEmpresaSchema.parse(empresaCN)).not.toThrow()
  })

  it('rejeita CNPJ preenchido com país != BR', () => {
    expect(() =>
      criarEmpresaSchema.parse({
        id_organizacao: 'org-1',
        nome_empresa: 'Foo',
        cnpj: '12.345.678/0001-90',
        pais: 'US',
        pode_ser_exportador: true,
      }),
    ).toThrow(/cnpj só pode ser preenchido/)
  })
})

describe('atualizarEmpresaSchema', () => {
  it('aceita objeto vazio (atualização opcional)', () => {
    expect(() => atualizarEmpresaSchema.parse({})).not.toThrow()
  })

  it('aceita atualização parcial de campo único', () => {
    expect(() => atualizarEmpresaSchema.parse({ telefone: '11 9999-9999' })).not.toThrow()
  })

  it('rejeita pais=BR com cnpj=null', () => {
    expect(() => atualizarEmpresaSchema.parse({ pais: 'BR', cnpj: null })).toThrow(/cnpj não pode ser nulo/)
  })

  it('rejeita pais não-BR com cnpj presente', () => {
    expect(() => atualizarEmpresaSchema.parse({ pais: 'US', cnpj: '12.345.678/0001-90' })).toThrow(/só pode existir/)
  })
})
