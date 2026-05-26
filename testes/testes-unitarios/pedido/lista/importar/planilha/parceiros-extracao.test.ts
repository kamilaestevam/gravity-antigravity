// @vitest-environment node
// TST-UNIT-PEDIDO-IMPORTAR-PLANILHA — extração parceiros (U-PAR)
import { describe, it, expect } from 'vitest'
import {
  extrairCamposParceirosPorNumeroPedido,
  normalizarPaisIso2,
} from '../../../../../../servicos-global/produto/pedido/server/src/services/smartImportParceirosService.js'
import type { SmartImportLinha } from '../../../../../../servicos-global/produto/pedido/server/src/services/smartImportService.js'

function linha(
  linhaArquivo: number,
  numero: string,
  dados: Record<string, unknown>,
): SmartImportLinha {
  return {
    linha_arquivo: linhaArquivo,
    numero_pedido: numero,
    status: 'ok',
    alertas: [],
    dados,
  }
}

describe('normalizarPaisIso2 (U-PAR-03)', () => {
  it('aceita ISO-2 direto', () => {
    expect(normalizarPaisIso2('US')).toBe('US')
    expect(normalizarPaisIso2('br')).toBe('BR')
  })

  it('mapeia nomes comuns', () => {
    expect(normalizarPaisIso2('Estados Unidos')).toBe('US')
    expect(normalizarPaisIso2('Brasil')).toBe('BR')
  })
})

describe('extrairCamposParceirosPorNumeroPedido (U-PAR)', () => {
  it('U-PAR-01: agrega exportador e fabricante de linhas ITEM Detroit', () => {
    const linhas = [
      linha(7, 'D-1382', {
        tipo_linha: 'ITEM',
        numero_pedido: 'D-1382',
        nome_exportador: 'DETROIT USA INTERNATIONAL LLC',
        nome_fabricante: 'KONGSBERG',
      }),
    ]
    const entry = extrairCamposParceirosPorNumeroPedido(linhas).get('D-1382')
    expect(entry?.campos.nome_exportador).toBe('DETROIT USA INTERNATIONAL LLC')
    expect(entry?.campos.nome_fabricante).toBe('KONGSBERG')
  })

  it('U-PAR-02: agrega primeiro fabricante quando pedido tem fabricantes distintos', () => {
    const linhas = [
      linha(1, 'D-1105', { numero_pedido: 'D-1105', nome_fabricante: 'KONGSBERG' }),
      linha(2, 'D-1105', { numero_pedido: 'D-1105', nome_fabricante: 'ROLLS ROYCE' }),
    ]
    const entry = extrairCamposParceirosPorNumeroPedido(linhas).get('D-1105')
    expect(entry?.campos.nome_fabricante).toBe('KONGSBERG')
  })
})
