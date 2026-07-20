import { describe, expect, it } from 'vitest'
import {
  definirValorPorCaminho,
  lerValorPorCaminho,
  sincronizarValorLegadoPorCaminho,
} from '../../../../servicos-global/produto/smart-read/client/src/shared/definir-valor-por-caminho-dados-leitura-smart-read.ts'

describe('Smart Read — definirValorPorCaminho', () => {
  it('grava caminho simples com ponto', () => {
    const dados: Record<string, unknown> = { exporter: { name: 'Acme' } }
    expect(definirValorPorCaminho(dados, 'exporter.name', 'Nova Corp')).toBe(true)
    expect((dados.exporter as Record<string, unknown>).name).toBe('Nova Corp')
  })

  it('grava caminho indexado de item (conferência Item 1)', () => {
    const dados: Record<string, unknown> = {
      items: [
        {
          descriptions: { english: 'Ball bearing', portuguese: '' },
          weights: { net: '', gross: '' },
          volume: { dimensions: '' },
        },
      ],
    }

    expect(definirValorPorCaminho(dados, 'items[0].descriptions.portuguese', 'Rolamento')).toBe(true)
    expect(definirValorPorCaminho(dados, 'items[0].weights.net', '1.2')).toBe(true)
    expect(definirValorPorCaminho(dados, 'items[0].weights.gross', '1.5')).toBe(true)
    expect(definirValorPorCaminho(dados, 'items[0].volume.dimensions', '10x20x30')).toBe(true)

    const item0 = (dados.items as Record<string, unknown>[])[0]
    expect((item0.descriptions as Record<string, unknown>).portuguese).toBe('Rolamento')
    expect((item0.weights as Record<string, unknown>).net).toBe('1.2')
    expect((item0.weights as Record<string, unknown>).gross).toBe('1.5')
    expect((item0.volume as Record<string, unknown>).dimensions).toBe('10x20x30')
  })

  it('cria estrutura ausente ao editar item novo', () => {
    const dados: Record<string, unknown> = { items: [{}] }
    expect(definirValorPorCaminho(dados, 'items[0].descriptions.portuguese', 'Peça')).toBe(true)
    const item0 = (dados.items as Record<string, unknown>[])[0]
    expect((item0.descriptions as Record<string, unknown>).portuguese).toBe('Peça')
  })

  it('rejeita caminho inválido', () => {
    const dados: Record<string, unknown> = {}
    expect(definirValorPorCaminho(dados, '', 'x')).toBe(false)
    expect(definirValorPorCaminho(dados, 'items[].ncm', '1234')).toBe(false)
  })

  it('lê valor indexado em items', () => {
    const dados: Record<string, unknown> = {
      items: [{ weights: { gross: '9.8' } }],
    }
    expect(lerValorPorCaminho(dados, 'items[0].weights.gross')).toBe('9.8')
  })

  it('espelha edição no snapshot legado sections.fields', () => {
    const dados: Record<string, unknown> = {
      sections: [
        {
          title: 'Item 1',
          fields: [
            { key: 'items[0].weights.gross', label: 'Gross', value: '' },
            { key: 'items[0].volume.dimensions', label: 'Dimensions', value: '' },
          ],
        },
      ],
      items: [{ weights: { gross: '' }, volume: { dimensions: '' } }],
    }

    expect(definirValorPorCaminho(dados, 'items[0].weights.gross', '12.5')).toBe(true)
    sincronizarValorLegadoPorCaminho(dados, 'items[0].weights.gross', '12.5')

    const fields = ((dados.sections as Record<string, unknown>[])[0].fields as Record<string, unknown>[])
    expect(fields[0].value).toBe('12.5')
    expect(lerValorPorCaminho(dados, 'items[0].weights.gross')).toBe('12.5')
  })
})
