// @vitest-environment node
import { describe, expect, it } from 'vitest'
import {
  buscaPortoDeveFiltrarSomentePorPais,
  buscaUnlocodeExatoDeveUsarMatchDireto,
  ehBuscaUnlocodeExato,
  filtrarCodigosPaisPorBuscaPorto,
  montarWhereBuscaPortoCadastros,
  type PaisReferenciaBuscaPorto,
} from '../../../servicos-global/cadastros/server/src/lib/busca-porto-por-pais-cadastros.js'

const PAISES_REF: PaisReferenciaBuscaPorto[] = [
  {
    codigo_pais_iso_alpha2: 'CN',
    codigo_pais_iso_alpha3: 'CHN',
    nome_pais_portugues: 'China, Republica Popular',
    nome_pais_ingles: 'China',
  },
  {
    codigo_pais_iso_alpha2: 'TW',
    codigo_pais_iso_alpha3: 'TWN',
    nome_pais_portugues: 'Formosa (Taiwan)',
    nome_pais_ingles: 'Taiwan, Province of China',
  },
  {
    codigo_pais_iso_alpha2: 'BR',
    codigo_pais_iso_alpha3: 'BRA',
    nome_pais_portugues: 'Brasil',
    nome_pais_ingles: 'Brazil',
  },
  {
    codigo_pais_iso_alpha2: 'SM',
    codigo_pais_iso_alpha3: 'SMR',
    nome_pais_portugues: 'San Marino',
    nome_pais_ingles: 'San Marino',
  },
]

describe('filtrarCodigosPaisPorBuscaPorto', () => {
  it('resolve china para CN (e TW pelo nome em ingles)', () => {
    expect(filtrarCodigosPaisPorBuscaPorto('china', PAISES_REF)).toEqual(['CN'])
  })

  it('resolve CN como iso alpha-2', () => {
    expect(filtrarCodigosPaisPorBuscaPorto('CN', PAISES_REF)).toEqual(['CN'])
  })

  it('resolve brasil para BR', () => {
    expect(filtrarCodigosPaisPorBuscaPorto('brasil', PAISES_REF)).toEqual(['BR'])
  })
})

describe('montarWhereBuscaPortoCadastros', () => {
  it('filtra somente por pais quando busca china', () => {
    const codigos = filtrarCodigosPaisPorBuscaPorto('china', PAISES_REF)
    const where = montarWhereBuscaPortoCadastros({
      q: 'china',
      apenasAtivos: true,
      codigosPaisResolvidos: codigos,
      paisesReferencia: PAISES_REF,
    })
    expect(where).toEqual({
      ativo_porto: true,
      codigo_pais_porto: { in: ['CN'] },
    })
  })

  it('mantem busca por nome curto san sem restringir so ao pais', () => {
    const codigos = filtrarCodigosPaisPorBuscaPorto('san', PAISES_REF)
    expect(codigos).toEqual(['SM'])
    expect(
      buscaPortoDeveFiltrarSomentePorPais('san', codigos, PAISES_REF),
    ).toBe(false)

    const where = montarWhereBuscaPortoCadastros({
      q: 'san',
      apenasAtivos: true,
      codigosPaisResolvidos: codigos,
      paisesReferencia: PAISES_REF,
    })
    expect(where.OR).toHaveLength(4)
  })

  it('busca UN/LOCODE usa match exato quando prefixo bate com pais resolvido', () => {
    expect(ehBuscaUnlocodeExato('BRRIO')).toBe(true)
    expect(buscaUnlocodeExatoDeveUsarMatchDireto('BRRIO', ['BR'])).toBe(true)
    expect(buscaUnlocodeExatoDeveUsarMatchDireto('CHINA', ['CN'])).toBe(false)

    const where = montarWhereBuscaPortoCadastros({
      q: 'BRRIO',
      apenasAtivos: true,
      codigosPaisResolvidos: ['BR'],
      paisesReferencia: PAISES_REF,
    })
    expect(where).toEqual({
      ativo_porto: true,
      OR: [
        { codigo_unlocode_porto: 'BRRIO' },
        { codigo_iata_porto: 'BRRIO' },
      ],
    })
  })
})
