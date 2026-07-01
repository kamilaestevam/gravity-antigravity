import { describe, expect, it } from 'vitest'
import { extrairSecoesConferenciaLeitura } from '../../../../servicos-global/produto/smart-read/client/src/shared/extrair-secoes-conferencia-leitura-smart-read.ts'
import {
  auditarParidadeConferenciaDatiGravity,
  calcularCoberturaParidadeConferencia,
  prepararDadosExibicaoLegado,
} from '../../../../servicos-global/produto/smart-read/shared/auditar-paridade-conferencia-dati-gravity-smart-read.ts'

describe('auditar-paridade-conferencia-dati-gravity-smart-read', () => {
  it('detecta gap BFF quando final vazio e IA preenchida (caso NCM invoices.pdf)', () => {
    const dadosIa = {
      items: [{ partNumber: '3100N025201DK19', ncm: '8413.9100', manufacturer: 'PERONI POMPE SpA' }],
    }
    const dadosFinal = {
      items: [{ partNumber: '3100N025201DK19', ncm: '', manufacturer: '' }],
    }

    const relatorioSemMerge = auditarParidadeConferenciaDatiGravity({
      dados_exibicao: dadosFinal,
      secoes_conferencia: extrairSecoesConferenciaLeitura(dadosFinal),
      dados_final: dadosFinal,
      dados_ia: dadosIa,
      tipo_documento: 'INVOICE',
    })

    expect(relatorioSemMerge.por_classe.BFF_FINAL_VAZIO_IA_PREENCHIDO).toBeGreaterThanOrEqual(2)

    const dadosExibicao = prepararDadosExibicaoLegado(dadosFinal, dadosIa)
    const secoes = extrairSecoesConferenciaLeitura(dadosExibicao)
    const relatorioComMerge = auditarParidadeConferenciaDatiGravity({
      dados_exibicao: dadosExibicao,
      secoes_conferencia: secoes,
      tipo_documento: 'INVOICE',
    })

    expect(relatorioComMerge.por_classe.CAMINHO_NAO_RENDERIZADO).toBe(0)
    expect(relatorioComMerge.por_classe.VALOR_PRESENTE_MAS_VAZIO_NA_UI).toBe(0)
    expect(calcularCoberturaParidadeConferencia(relatorioComMerge)).toBe(100)
    expect(secoes.find((s) => s.titulo === 'Item 1')?.campos.find((c) => c.chave.includes('ncm'))?.valor).toBe(
      '8413.9100',
    )
  })

  it('expõe relatório agregado por classe de gap', () => {
    const dados = {
      document: { documentNumber: '2250090' },
      items: [{ partNumber: '3100N025201DK19', ncm: '8413.9100' }],
    }
    const secoes = extrairSecoesConferenciaLeitura(dados)
    const relatorio = auditarParidadeConferenciaDatiGravity({
      dados_exibicao: dados,
      secoes_conferencia: secoes,
      tipo_documento: 'INVOICE',
    })

    expect(relatorio.total_caminhos_preenchidos).toBeGreaterThan(0)
    expect(calcularCoberturaParidadeConferencia(relatorio)).toBeGreaterThanOrEqual(90)
  })
})
