/// <reference types="vitest/globals" />

import {
  listasCadastroParciaisTemplateBid,
  validarListasObrigatoriasTemplateBid,
} from '../../../../../servicos-global/produto/bid-frete-internacional/shared/template-importacao-config-bid-frete-internacional'

describe('template-listas-cadastros-bid-frete-internacional', () => {
  const listasCompletas = {
    portos: ['BRSSZ — Santos'],
    aeroportos: ['GRU — Guarulhos'],
    paises: ['BR — Brasil'],
    containers: ['45G1 — Dry · 40\' HC'],
    moedas: ['USD'],
  }

  it('listas completas não têm faltantes', () => {
    expect(listasCadastroParciaisTemplateBid(listasCompletas)).toEqual([])
    expect(() => validarListasObrigatoriasTemplateBid(listasCompletas)).not.toThrow()
  })

  it('identifica listas ausentes sem bloquear geração', () => {
    expect(listasCadastroParciaisTemplateBid({
      ...listasCompletas,
      portos: [],
    })).toEqual(['portos'])

    expect(listasCadastroParciaisTemplateBid({
      ...listasCompletas,
      aeroportos: [],
      paises: [],
    })).toEqual(['aeroportos', 'paises'])

    expect(() => validarListasObrigatoriasTemplateBid({
      ...listasCompletas,
      portos: [],
    })).not.toThrow()
  })
})
