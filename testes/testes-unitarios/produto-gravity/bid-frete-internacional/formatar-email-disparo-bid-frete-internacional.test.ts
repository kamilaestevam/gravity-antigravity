import { describe, it, expect } from 'vitest'
import {
  formatarCargaPerigosaEmailDisparoBidFrete,
  formatarDimensoesCubagemEmailDisparoBidFrete,
  montarHtmlEmailDisparo,
  montarTextoPlanoEmailDisparo,
  type ParametrosEmailDisparoBidFreteInternacional,
} from '../../../../servicos-global/produto/bid-frete-internacional/shared/formatar-email-disparo-bid-frete-internacional'

const base: ParametrosEmailDisparoBidFreteInternacional = {
  nomeFornecedor: 'Maersk',
  numeroCotacao: 'COT-20260705-0001',
  modal: 'MARITIMO',
  modalidade: 'FCL',
  origemNome: 'Santos',
  origemPais: 'BR',
  destinoNome: 'Shanghai',
  destinoPais: 'CN',
  mercadoria: 'Peças',
  incoterm: 'FOB',
  linkResposta: 'http://localhost:8000/bid-frete/visao-fornecedor-bid-frete-internacional/publico/tok',
}

describe('formatarDimensoesCubagemEmailDisparoBidFrete', () => {
  it('monta texto com as 3 dimensões e unidade em minúsculo', () => {
    expect(
      formatarDimensoesCubagemEmailDisparoBidFrete({
        comprimento: 120,
        largura: 100,
        altura: 90,
        codigoUnidade: 'CM',
      }),
    ).toBe('120 × 100 × 90 cm')
  })

  it('retorna null quando falta alguma dimensão', () => {
    expect(
      formatarDimensoesCubagemEmailDisparoBidFrete({ comprimento: 120, largura: 100, altura: null }),
    ).toBeNull()
  })

  it('usa metro como unidade padrão', () => {
    expect(
      formatarDimensoesCubagemEmailDisparoBidFrete({ comprimento: 1, largura: 2, altura: 3 }),
    ).toBe('1 × 2 × 3 m')
  })
})

describe('formatarCargaPerigosaEmailDisparoBidFrete', () => {
  it('retorna null quando não é carga perigosa', () => {
    expect(formatarCargaPerigosaEmailDisparoBidFrete({ ehCargaPerigosa: false })).toBeNull()
  })

  it('monta texto completo com UN, classe, divisão e GE', () => {
    const texto = formatarCargaPerigosaEmailDisparoBidFrete({
      ehCargaPerigosa: true,
      numeroOnu: '1263',
      nomeTecnicoEmbarque: 'Tintas',
      classe: 3,
      divisao: '1.4',
      grupoEmbalagem: 'II',
    })
    expect(texto).toContain('UN 1263')
    expect(texto).toContain('Tintas')
    expect(texto).toContain('Classe 3')
    expect(texto).toContain('Divisão 1.4')
    expect(texto).toContain('GE II')
    expect(texto?.startsWith('Sim — ')).toBe(true)
  })

  it('retorna "Sim" quando marcada sem detalhes', () => {
    expect(formatarCargaPerigosaEmailDisparoBidFrete({ ehCargaPerigosa: true })).toBe('Sim')
  })
})

describe('montarHtmlEmailDisparo — todos os campos preenchidos', () => {
  it('exibe apenas os campos preenchidos (mínimo)', () => {
    const html = montarHtmlEmailDisparo(base)
    expect(html).toContain('COT-20260705-0001')
    expect(html).not.toContain('NCM')
    expect(html).not.toContain('Carga perigosa')
    expect(html).not.toContain('Referência interna')
    expect(html).not.toContain('Armazenagem')
  })

  it('exibe todas as linhas quando os campos estão preenchidos', () => {
    const html = montarHtmlEmailDisparo({
      ...base,
      referenciaInterna: 'IMP023/22',
      ncm: '8471.30.19',
      hsCode: '8471.30',
      pesoTon: 12.5,
      dimensoesCubagemTexto: '120 × 100 × 90 cm',
      cargaPerigosaTexto: 'Sim — UN 1263 · Classe 3',
      incluirArmazenagem: true,
      opcoesOrigemTexto: 'BRSSZ — Santos, BR · BRPNG — Paranaguá, BR',
      opcoesDestinoTexto: 'CNNGB — Ningbo, CN',
      data_limite_resposta_cotacao_bid_frete_internacional: '2026-07-20T12:00:00.000Z',
      dataExpiracaoToken: new Date('2026-07-20T12:00:00.000Z'),
    })
    expect(html).toContain('Referência interna')
    expect(html).toContain('IMP023/22')
    expect(html).toContain('NCM')
    expect(html).toContain('8471.30.19')
    expect(html).toContain('HS Code')
    expect(html).toContain('8471.30')
    expect(html).toContain('Peso (ton)')
    expect(html).toContain('Dimensões (C × L × A)')
    expect(html).toContain('120 × 100 × 90 cm')
    expect(html).toContain('Carga perigosa')
    expect(html).toContain('UN 1263')
    expect(html).toContain('Armazenagem')
    expect(html).toContain('Alternativas (origem)')
    expect(html).toContain('Paranaguá')
    expect(html).toContain('Alternativas (destino)')
    expect(html).toContain('Ningbo')
    expect(html).toContain('Prazo de resposta')
    expect(html).not.toContain('>Link válido até</td>')
  })

  it('exibe Link válido até separado quando difere do prazo de resposta', () => {
    const html = montarHtmlEmailDisparo({
      ...base,
      data_limite_resposta_cotacao_bid_frete_internacional: '2026-08-08T12:00:00.000Z',
      dataExpiracaoToken: new Date('2026-06-30T12:00:00.000Z'),
    })
    expect(html).toContain('Prazo de resposta')
    expect(html).toContain('>Link válido até</td>')
  })

  it('texto plano acompanha as mesmas linhas', () => {
    const texto = montarTextoPlanoEmailDisparo({
      ...base,
      ncm: '8471.30.19',
      hsCode: '8471.30',
      cargaPerigosaTexto: 'Sim — UN 1263',
    })
    expect(texto).toContain('NCM: 8471.30.19')
    expect(texto).toContain('HS Code: 8471.30')
    expect(texto).toContain('Carga perigosa: Sim — UN 1263')
  })
})
