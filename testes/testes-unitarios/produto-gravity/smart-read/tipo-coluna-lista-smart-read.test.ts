import { describe, expect, it } from 'vitest'
import {
  resolverCasasDecimaisColunaListaSmartRead,
  resolverTipoColunaListaSmartRead,
} from '../../../../servicos-global/produto/smart-read/shared/tipo-coluna-lista-smart-read'

describe('tipo-coluna-lista-smart-read', () => {
  it('classifica datas por chave e caminho', () => {
    expect(
      resolverTipoColunaListaSmartRead({
        key: 'data_documento',
        caminhos: ['invoice.date'],
      }),
    ).toBe('periodo')

    expect(
      resolverTipoColunaListaSmartRead({
        key: 'campo_custom',
        caminhos: ['invoice.dueDate'],
      }),
    ).toBe('periodo')
  })

  it('classifica moeda ISO como select_moeda', () => {
    expect(
      resolverTipoColunaListaSmartRead({
        key: 'moeda_moeda',
        caminhos: ['currency.type'],
      }),
    ).toBe('select_moeda')
  })

  it('classifica valores numéricos', () => {
    expect(
      resolverTipoColunaListaSmartRead({
        key: 'valor_total_documento',
        caminhos: ['invoice.total'],
      }),
    ).toBe('numero')

    expect(resolverCasasDecimaisColunaListaSmartRead('quantidade_volumes')).toBe(0)
    expect(resolverCasasDecimaisColunaListaSmartRead('valor_total_documento')).toBe(2)
  })

  it('numero_documento permanece texto', () => {
    expect(
      resolverTipoColunaListaSmartRead({
        key: 'numero_documento',
        caminhos: ['invoice.number'],
      }),
    ).toBe('texto')
  })
})
