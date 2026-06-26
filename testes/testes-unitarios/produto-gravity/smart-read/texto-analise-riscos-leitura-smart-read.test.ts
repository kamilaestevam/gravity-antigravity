import { describe, expect, it } from 'vitest'
import {
  anexarDisclaimerClassificacao,
  ehRiscoClassificacaoFiscal,
  formatarAnaliseDivergenciaLinha,
  formatarAnaliseDivergenciaSoma,
  textoExtracaoEhPlaceholder,
} from '../../../../servicos-global/produto/smart-read/shared/texto-analise-riscos-leitura-smart-read.ts'
import { montarRiscoDeClassificacaoFiscalSugerida } from '../../../../servicos-global/produto/smart-read/shared/analise-riscos-leitura-smart-read.ts'

describe('Smart Read — texto analise riscos', () => {
  it('formata divergencia de linha de forma descritiva com produto e colunas', () => {
    const texto = formatarAnaliseDivergenciaLinha({
      indiceLinha: 0,
      descricao: 'SMALL SIGNAL DIODE 100V',
      qty: 10,
      precoUnit: 0.16,
      totalLido: 2,
      moeda: 'USD',
    })
    expect(texto).toContain('na linha 1')
    expect(texto).toContain('SMALL SIGNAL DIODE')
    expect(texto).toContain('itemQuantity')
    expect(texto).toContain('itemUnitPriceWithCurrency')
    expect(texto).toContain('USD 1,60')
    expect(texto).toContain('USD 2,00')
    expect(texto).toContain('divergência')
  })

  it('formata divergencia de soma de forma descritiva', () => {
    const texto = formatarAnaliseDivergenciaSoma(280.35, 303.08, 'USD')
    expect(texto).toContain('itemTotalPriceWithCurrency')
    expect(texto).toContain('280,35')
    expect(texto).toContain('303,08')
    expect(texto).toContain('divergência')
  })

  it('anexa disclaimer de classificacao fiscal quando ausente', () => {
    const texto = anexarDisclaimerClassificacao('Corrija items[0].ncm de ausente para 85411029 porque diodo semicondutor.')
    expect(texto).toContain('responsabilidade pela classificação fiscal')
  })

  it('detecta placeholders de extracao OCR', () => {
    expect(textoExtracaoEhPlaceholder('descPt')).toBe(true)
    expect(textoExtracaoEhPlaceholder('ncm')).toBe(true)
    expect(textoExtracaoEhPlaceholder('85411029')).toBe(false)
  })

  it('monta risco de classificacao com de/para e correcao sugerida', () => {
    const risco = montarRiscoDeClassificacaoFiscalSugerida({
      documento: 'invoice.pdf · INVOICE',
      indice: 0,
      tipo: 'ncm',
      situacao: 'ausente',
      codigoLido: null,
      codigoSugerido: '85176999',
      motivoTecnico:
        'Interfone/porteiro eletrônico enquadra-se na posição 85.17 — aparelhos elétricos de alarme e intercomunicação.',
      descricao: 'PCI FN OSP 1L PORTEIRO IPR1010MI',
      descricaoNcmOficial: 'Outros aparelhos elétricos de alarme',
    })
    expect(risco.motivo).toContain('de ausente → 85176999')
    expect(risco.analise).toContain('85.17')
    expect(risco.correcao_sugerida).toContain('Corrija items[0].ncm de ausente para 85176999')
    expect(risco.citacoes_normativas?.[0]?.tipo).toBe('ncm_oficial')
  })
})
