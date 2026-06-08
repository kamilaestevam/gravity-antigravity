import { describe, expect, it } from 'vitest'
import {
  mesclarEntradaRegistryAutomacao,
  novaEntradaRegistryComPropriedadeDono,
} from '../../../servicos-global/configurador/server/lib/registry-propriedade-dono.js'

describe('registry-propriedade-dono', () => {
  it('nova entrada nasce com propriedade_dono', () => {
    const entry = novaEntradaRegistryComPropriedadeDono({ id: 'TST-EMT-X-000001', modulo: 'A' })
    expect(entry.propriedade_dono).toBe(true)
  })

  it('mescla preserva modulo e casosTotal quando propriedade_dono', () => {
    const existente = {
      id: 'TST-EMT-PEDIDO-000045',
      propriedade_dono: true,
      modulo: 'Título do dono',
      casosTotal: 200,
    }
    const proposta = {
      id: 'TST-EMT-PEDIDO-000045',
      modulo: 'Título do agente',
      casosTotal: 164,
      status: 'pendente_validacao',
    }
    const merged = mesclarEntradaRegistryAutomacao(existente, proposta)
    expect(merged.modulo).toBe('Título do dono')
    expect(merged.casosTotal).toBe(200)
    expect(merged.status).toBe('pendente_validacao')
  })
})
