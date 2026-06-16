/// <reference types="vitest/globals" />

import { LINHA_EXEMPLO_TEMPLATE_IMPORTACAO_BID } from '../../../../servicos-global/produto/bid-frete-internacional/shared/parsear-planilha-importacao-bid-frete-internacional'
import {
  ajustarLinhaExemploParaListasTemplateBid,
  garantirValoresExemploNasListasTemplateBid,
  rotuloCanonicoNaListaCadastro,
} from '../../../../servicos-global/produto/bid-frete-internacional/shared/preparar-listas-template-importacao-bid-frete-internacional'

describe('preparar-listas-template-importacao-bid-frete-internacional', () => {
  it('injeta porto da linha exemplo quando ausente na lista do Cadastros', () => {
    const listas = garantirValoresExemploNasListasTemplateBid(
      {
        portos: ['USMIA — Miami'],
        aeroportos: [],
        paises: [],
        containers: [],
        moedas: [],
      },
      LINHA_EXEMPLO_TEMPLATE_IMPORTACAO_BID,
    )

    expect(listas.portos).toContain('BRSSZ — Santos')
    expect(listas.portos).toContain('CNSHA — Shanghai')
  })

  it('ajusta linha exemplo para rótulo completo da moeda no Cadastros', () => {
    const listas = {
      portos: ['BRSSZ — Santos', 'CNSHA — Shanghai'],
      aeroportos: [],
      paises: ['BR — Brasil', 'CN — China'],
      containers: ["45G1 — Dry · 40' HC"],
      moedas: ['USD — Dólar dos Estados Unidos', 'EUR — Euro'],
    }

    const linha = ajustarLinhaExemploParaListasTemplateBid(
      LINHA_EXEMPLO_TEMPLATE_IMPORTACAO_BID,
      listas,
    )

    expect(linha.moeda_meta_cotacao_bid_frete_internacional).toBe('USD — Dólar dos Estados Unidos')
    expect(linha.porto_origem_cotacao_bid_frete_internacional).toBe('BRSSZ — Santos')
  })

  it('resolve código curto para rótulo canonico na lista', () => {
    const lista = ['USD — Dólar dos Estados Unidos']
    expect(rotuloCanonicoNaListaCadastro('USD', lista)).toBe('USD — Dólar dos Estados Unidos')
  })
})
