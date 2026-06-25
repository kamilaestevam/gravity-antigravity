import { describe, expect, it } from 'vitest'
import {
  deveSalvarRenomearPainelLista,
  rotuloExibicaoPainelLista,
  valorInputRenomearPainelLista,
} from '../../../../servicos-global/produto/pedido/client/src/shared/rotuloPainelLista'

const paineis = [
  { id: 'p1', nome: 'Principal', ordem: 0 },
  { id: 'p2', nome: 'Exportação Q2', ordem: 1 },
]

describe('rotuloPainelLista', () => {
  it('exibe Padrão para painel Principal na primeira posição', () => {
    const rotulo = rotuloExibicaoPainelLista(paineis[0], paineis)
    expect(rotulo.exibicao).toBe('Padrão')
    expect(rotulo.ehGenerico).toBe(true)
    expect(rotulo.nomeSalvo).toBe('Principal')
  })

  it('exibe nome customizado para painéis não genéricos', () => {
    const rotulo = rotuloExibicaoPainelLista(paineis[1], paineis)
    expect(rotulo.exibicao).toBe('Exportação Q2')
    expect(rotulo.ehGenerico).toBe(false)
  })

  it('valorInputRenomearPainelLista retorna vazio para painel genérico Principal', () => {
    expect(valorInputRenomearPainelLista(paineis[0], paineis)).toBe('')
  })

  it('valorInputRenomearPainelLista retorna nome salvo para painel customizado', () => {
    expect(valorInputRenomearPainelLista(paineis[1], paineis)).toBe('Exportação Q2')
  })

  it('deveSalvarRenomearPainelLista ignora vazio e nome inalterado', () => {
    expect(deveSalvarRenomearPainelLista('Principal', '')).toBe(false)
    expect(deveSalvarRenomearPainelLista('Principal', 'Principal')).toBe(false)
    expect(deveSalvarRenomearPainelLista('Principal', '  Principal  ')).toBe(false)
  })

  it('deveSalvarRenomearPainelLista aceita nome novo', () => {
    expect(deveSalvarRenomearPainelLista('Principal', 'Minha Lista')).toBe(true)
    expect(deveSalvarRenomearPainelLista('Exportação Q2', 'Outro nome')).toBe(true)
  })
})
