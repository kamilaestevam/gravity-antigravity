import { describe, expect, it } from 'vitest'
import { compararCamposEdicaoLeitura } from '../../../../servicos-global/produto/smart-read/client/src/shared/comparar-campos-edicao-leitura-smart-read.ts'

describe('Smart Read — comparar campos edição (fonte única acerto/erro)', () => {
  it('conta acerto quando valor não foi alterado e erro quando foi editado', () => {
    const original = {
      exportador: 'Asia Shipping LTDA',
      importador: 'Importadora Brasil SA',
      numero_bl: 'BL-001',
      porto_embarque: 'Shenzhen',
    }
    const final = {
      exportador: 'Asia Shipping LTDA',
      importador: 'Importadora Brasil SA',
      numero_bl: 'BL-001',
      porto_embarque: 'Shanghai',
    }

    const resultado = compararCamposEdicaoLeitura(original, final)

    expect(resultado.total).toBe(4)
    expect(resultado.corretos).toBe(3)
    expect(resultado.errados).toBe(1)
    expect(resultado.taxa_acerto).toBeCloseTo(0.75)
    expect(resultado.campos.find((c) => c.caminho_campo === 'porto_embarque')?.editado).toBe(true)
  })

  it('ignora metadados como accuracy e score', () => {
    const original = { accuracy: 0.96, exportador: 'Foo' }
    const final = { accuracy: 0.5, exportador: 'Bar' }

    const resultado = compararCamposEdicaoLeitura(original, final)

    expect(resultado.total).toBe(1)
    expect(resultado.errados).toBe(1)
  })

  it('compara campos aninhados achatados por caminho', () => {
    const original = { agente_carga: { nome: 'Maersk' } }
    const final = { agente_carga: { nome: 'Maersk BR' } }

    const resultado = compararCamposEdicaoLeitura(original, final)

    expect(resultado.errados).toBe(1)
    expect(resultado.campos[0]?.caminho_campo).toBe('agente_carga.nome')
  })
})
