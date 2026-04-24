import { describe, it, expect } from 'vitest'
import { derivarTipoVisual } from '../../server/src/utils/derivar-tipo-visual.js'

const flagsZeradas = {
  pode_ser_importador_empresa: false,
  pode_ser_exportador_empresa: false,
  pode_ser_fabricante_empresa: false,
  pode_ser_agente_empresa: false,
  pode_ser_despachante_empresa: false,
  pode_ser_armador_empresa: false,
}

describe('derivarTipoVisual', () => {
  it('retorna apenas Importador quando só essa flag está ligada', () => {
    expect(derivarTipoVisual({ ...flagsZeradas, pode_ser_importador_empresa: true })).toBe('Importador')
  })

  it('combina Importador + Exportador na ordem fixa', () => {
    expect(
      derivarTipoVisual({ ...flagsZeradas, pode_ser_importador_empresa: true, pode_ser_exportador_empresa: true }),
    ).toBe('Importador + Exportador')
  })

  it('mantém ordem fixa mesmo quando flags são ligadas em outra sequência', () => {
    expect(
      derivarTipoVisual({
        ...flagsZeradas,
        pode_ser_armador_empresa: true,
        pode_ser_importador_empresa: true,
        pode_ser_agente_empresa: true,
      }),
    ).toBe('Importador + Agente + Armador')
  })

  it('lista todos os papéis em ordem quando tudo está ligado', () => {
    const tudo = {
      pode_ser_importador_empresa: true,
      pode_ser_exportador_empresa: true,
      pode_ser_fabricante_empresa: true,
      pode_ser_agente_empresa: true,
      pode_ser_despachante_empresa: true,
      pode_ser_armador_empresa: true,
    }
    expect(derivarTipoVisual(tudo)).toBe(
      'Importador + Exportador + Agente + Armador + Despachante + Fabricante',
    )
  })

  it('falha alto quando nenhuma flag está ativa (Mandamento 08)', () => {
    expect(() => derivarTipoVisual(flagsZeradas)).toThrow(/sem nenhuma flag/i)
  })
})
