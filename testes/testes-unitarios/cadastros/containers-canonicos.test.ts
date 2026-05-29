import { describe, expect, it } from 'vitest'
import {
  CONTAINERS_CANONICOS,
  type ContainerTipoCanonico,
} from '../../../servicos-global/cadastros/prisma/data/containers-canonicos.js'

const TIPOS_VALIDOS: ContainerTipoCanonico[] = [
  'DRY',
  'REEFER',
  'OPEN_TOP',
  'FLAT_RACK',
  'TANK',
  'BULK',
  'PLATAFORMA',
]

describe('CONTAINERS_CANONICOS — catálogo ISO 6346', () => {
  it('contém exatamente 26 tipos práticos', () => {
    expect(CONTAINERS_CANONICOS).toHaveLength(26)
  })

  it('códigos ISO são únicos e com 4 caracteres', () => {
    const codigos = CONTAINERS_CANONICOS.map((c) => c.codigo_iso_container)
    expect(new Set(codigos).size).toBe(26)
    for (const codigo of codigos) {
      expect(codigo).toMatch(/^[A-Z0-9]{4}$/)
    }
  })

  it('todos os tipos pertencem ao enum ContainerTipo', () => {
    for (const c of CONTAINERS_CANONICOS) {
      expect(TIPOS_VALIDOS).toContain(c.tipo_container)
    }
  })

  it('cobre os 7 tipos funcionais do enum', () => {
    const tiposPresentes = new Set(CONTAINERS_CANONICOS.map((c) => c.tipo_container))
    for (const tipo of TIPOS_VALIDOS) {
      expect(tiposPresentes.has(tipo)).toBe(true)
    }
  })

  it('mapeia legado MVP para ISO 6346', () => {
    const mapaLegado: Record<string, string> = {
      '20DRY': '22G0',
      '40DRY': '42G0',
      '40HC': '45G0',
      '20RF': '22R1',
      '40RF': '45R1',
      '20OT': '22U1',
      '40OT': '42U1',
      '20FR': '22P1',
      '40FR': '42P1',
      '20TK': '22T6',
    }
    const codigos = new Set(CONTAINERS_CANONICOS.map((c) => c.codigo_iso_container))
    for (const iso of Object.values(mapaLegado)) {
      expect(codigos.has(iso)).toBe(true)
    }
  })
})
