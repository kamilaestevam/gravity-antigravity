/// <reference types="vitest/globals" />
// @vitest-environment node

/**
 * rotas-estimativa-custo.test.ts — Helpers de rota absoluta do client.
 * Regressão do bug de menu (links relativos duplicavam /simula-custo na URL).
 */
import { describe, expect, it } from 'vitest'
import {
  BASE_ROTA_SIMULA_CUSTO,
  rotaSimulaCusto,
  rotaDetalheEstimativaCusto,
} from '../../../../servicos-global/produto/simula-custo/client/src/shared/rotas-estimativa-custo'

describe('rotas-estimativa-custo', () => {
  it('gera caminhos absolutos com o prefixo canônico /simula-custo', () => {
    expect(BASE_ROTA_SIMULA_CUSTO).toBe('/simula-custo')
    expect(rotaSimulaCusto('insights')).toBe('/simula-custo/insights')
    expect(rotaSimulaCusto('lista')).toBe('/simula-custo/lista')
    expect(rotaSimulaCusto('estimativas/nova')).toBe('/simula-custo/estimativas/nova')
  })

  it('gera rota de detalhe por id', () => {
    expect(rotaDetalheEstimativaCusto('abc123')).toBe('/simula-custo/estimativas/abc123')
  })
})
