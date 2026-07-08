import { describe, expect, it } from 'vitest'
import { buscarNcmSimuladorPedido, validarNcmSimuladorPedido } from '../../../nucleo-global/Telas-manual-marketing/produtos-gravity/pedido/motor-ncm-simulador-pedido'

describe('motor-ncm-simulador-pedido', () => {
  it('busca por código com startsWith', () => {
    const r = buscarNcmSimuladorPedido('8471', 20)
    expect(r.fuzzy).toBe(false)
    expect(r.itens.length).toBeGreaterThan(0)
    expect(r.itens.every((i) => i.codigo.startsWith('8471'))).toBe(true)
  })

  it('busca por descrição com contains', () => {
    const r = buscarNcmSimuladorPedido('processador', 20)
    expect(r.itens.length).toBeGreaterThan(0)
    expect(r.itens.some((i) => i.descricao.toLowerCase().includes('processador'))).toBe(true)
  })

  it('ativa fuzzy quando busca exata por texto não encontra', () => {
    const r = buscarNcmSimuladorPedido('celular telefone', 20)
    expect(r.fuzzy).toBe(true)
    expect(r.itens.length).toBeGreaterThan(0)
  })

  it('valida NCM conhecido no catálogo', () => {
    const r = validarNcmSimuladorPedido('84713012')
    expect(r.valido).toBe(true)
    expect(r.fonte).toBe('cache')
    expect(r.descricao).toContain('processamento de dados')
  })

  it('rejeita NCM inexistente', () => {
    const r = validarNcmSimuladorPedido('00000000')
    expect(r.valido).toBe(false)
    expect(r.motivo).toContain('NCM não encontrado')
  })
})
