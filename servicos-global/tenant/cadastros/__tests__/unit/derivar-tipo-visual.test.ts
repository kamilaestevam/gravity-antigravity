import { describe, it, expect } from 'vitest'
import { derivarTipoVisual } from '../../server/src/utils/derivar-tipo-visual.js'

const flagsZeradas = {
  pode_ser_importador: false,
  pode_ser_exportador: false,
  pode_ser_fabricante: false,
  pode_ser_agente: false,
  pode_ser_despachante: false,
  pode_ser_armador: false,
}

describe('derivarTipoVisual', () => {
  it('retorna apenas Importador quando só essa flag está ligada', () => {
    expect(derivarTipoVisual({ ...flagsZeradas, pode_ser_importador: true })).toBe('Importador')
  })

  it('combina Importador + Exportador na ordem fixa', () => {
    expect(
      derivarTipoVisual({ ...flagsZeradas, pode_ser_importador: true, pode_ser_exportador: true }),
    ).toBe('Importador + Exportador')
  })

  it('mantém ordem fixa mesmo quando flags são ligadas em outra sequência', () => {
    expect(
      derivarTipoVisual({
        ...flagsZeradas,
        pode_ser_armador: true,
        pode_ser_importador: true,
        pode_ser_agente: true,
      }),
    ).toBe('Importador + Agente + Armador')
  })

  it('lista todos os papéis em ordem quando tudo está ligado', () => {
    const tudo = {
      pode_ser_importador: true,
      pode_ser_exportador: true,
      pode_ser_fabricante: true,
      pode_ser_agente: true,
      pode_ser_despachante: true,
      pode_ser_armador: true,
    }
    expect(derivarTipoVisual(tudo)).toBe(
      'Importador + Exportador + Agente + Armador + Despachante + Fabricante',
    )
  })

  it('falha alto quando nenhuma flag está ativa (Mandamento 08)', () => {
    expect(() => derivarTipoVisual(flagsZeradas)).toThrow(/sem nenhuma flag/i)
  })
})
