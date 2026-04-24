import { describe, it, expect } from 'vitest'
import { criarEmpresaSchema, atualizarEmpresaSchema } from '../../shared/schemas/empresa.schema.js'

const empresaBR = {
  id_organizacao: 'org-1',
  nome_empresa: 'CAOA Montadora',
  cnpj_empresa: '12.345.678/0001-90',
  pais_empresa: 'BR',
  pode_ser_importador_empresa: true,
}

describe('criarEmpresaSchema — país BR', () => {
  it('aceita CNPJ válido com flag importador', () => {
    expect(() => criarEmpresaSchema.parse(empresaBR)).not.toThrow()
  })

  it('exige CNPJ quando pais=BR', () => {
    const { cnpj_empresa: _drop, ...semCnpj } = empresaBR
    expect(() => criarEmpresaSchema.parse(semCnpj)).toThrow(/cnpj_empresa é obrigatório/)
  })

  it('rejeita CNPJ em formato inválido', () => {
    expect(() => criarEmpresaSchema.parse({ ...empresaBR, cnpj_empresa: '12345678000190' })).toThrow(
      /XX\.XXX\.XXX/,
    )
  })

  it('exige pelo menos uma flag pode_ser_*', () => {
    expect(() =>
      criarEmpresaSchema.parse({ ...empresaBR, pode_ser_importador_empresa: false }),
    ).toThrow(/flag pode_ser_/)
  })
})

describe('criarEmpresaSchema — país estrangeiro', () => {
  it('aceita empresa estrangeira sem CNPJ, com TIN', () => {
    const empresaCN = {
      id_organizacao: 'org-1',
      nome_empresa: 'Shenzhen Trading',
      tin_empresa: 'CN-12345',
      pais_empresa: 'CN',
      pode_ser_exportador_empresa: true,
    }
    expect(() => criarEmpresaSchema.parse(empresaCN)).not.toThrow()
  })

  it('rejeita CNPJ preenchido com país != BR', () => {
    expect(() =>
      criarEmpresaSchema.parse({
        id_organizacao: 'org-1',
        nome_empresa: 'Foo',
        cnpj_empresa: '12.345.678/0001-90',
        pais_empresa: 'US',
        pode_ser_exportador_empresa: true,
      }),
    ).toThrow(/cnpj_empresa só pode ser preenchido/)
  })
})

describe('atualizarEmpresaSchema', () => {
  it('aceita objeto vazio (atualização opcional)', () => {
    expect(() => atualizarEmpresaSchema.parse({})).not.toThrow()
  })

  it('aceita atualização parcial de campo único', () => {
    expect(() => atualizarEmpresaSchema.parse({ telefone_empresa: '11 9999-9999' })).not.toThrow()
  })

  it('rejeita pais=BR com cnpj=null', () => {
    expect(() => atualizarEmpresaSchema.parse({ pais_empresa: 'BR', cnpj_empresa: null })).toThrow(/cnpj_empresa não pode ser nulo/)
  })

  it('rejeita pais não-BR com cnpj presente', () => {
    expect(() => atualizarEmpresaSchema.parse({ pais_empresa: 'US', cnpj_empresa: '12.345.678/0001-90' })).toThrow(/só pode existir/)
  })
})
