import { describe, expect, it } from 'vitest'
import { DOC_BID_FRETE_SECAO } from './manual-bid-frete-conteudo'
import {
  GALERIA_BID_FRETE_COMPARAR_FECHAR_COTACAO,
  PASSO_BID_FRETE_COMPARAR_FECHAR_COTACAO,
  TEXTO_BID_FRETE_COMPARAR_COTACOES_RESPONDIDAS,
  TEXTO_BID_FRETE_DECISAO_APROVAR_COTACAO,
  TEXTO_BID_FRETE_FORNECEDOR_CONFIRMACAO_ACEITE_FINAL,
  TEXTO_BID_FRETE_HORA_COMPARAR_E_FECHAR,
  TEXTO_BID_FRETE_OUTROS_COLOCADOS_AVISADOS,
  TEXTO_BID_FRETE_PAINEL_ATUALIZADO_ACEITE_VENCEDOR,
} from './manual-bid-frete-comparar-fechar-conteudo'

describe('manual BID Frete — comparar e respostas fornecedor', () => {
  it('Comparar e fechar usa galeria única com 16 telas', () => {
    expect(PASSO_BID_FRETE_COMPARAR_FECHAR_COTACAO.galeriaComparacaoAposParagrafo).toHaveLength(1)
    expect(GALERIA_BID_FRETE_COMPARAR_FECHAR_COTACAO.telas).toHaveLength(16)
    expect(GALERIA_BID_FRETE_COMPARAR_FECHAR_COTACAO.telas[0]?.imagem).toContain('analise-fornecedor-1')
  })

  it('Manual e Smart Doc — respostas até painel aprovado final na mesma galeria', () => {
    const fluxo = DOC_BID_FRETE_SECAO.fluxos!.find((f) => f.ancoraPassosPrefix === 'nova-cotacao')
    const passos = fluxo?.passosVisuais ?? []
    for (const tituloCurto of ['Cotação manual', 'Cotação via Smart Doc'] as const) {
      const passo = passos.find((p) => p.tituloCurto === tituloCurto)
      expect(passo, tituloCurto).toBeDefined()
      const galerias = passo!.galeriaComparacaoAposParagrafo ?? []
      const respostas = galerias.find((g) =>
        g.telas.some((t) => t.imagem?.includes('email-comprador-fornecedor-respondeu-cotacao')),
      )
      expect(respostas, `${tituloCurto} galeria respostas`).toBeDefined()
      const telas = respostas!.telas
      expect(telas).toHaveLength(21)

      const aprovacao5 = telas.find((t) => t.imagem?.includes('aprovacao-5'))
      expect(aprovacao5?.paragrafoDepois).toBe(TEXTO_BID_FRETE_FORNECEDOR_CONFIRMACAO_ACEITE_FINAL)

      const aprovado3 = telas.find((t) => t.imagem?.includes('aprovado-fornecedor-3'))
      expect(aprovado3?.paragrafoDepois).toBe(TEXTO_BID_FRETE_OUTROS_COLOCADOS_AVISADOS)

      const terceiroLugar = telas.find((t) => t.imagem?.includes('aprovado-fornecedor-terceiro-lugar'))
      expect(terceiroLugar?.paragrafoDepois).toBe(TEXTO_BID_FRETE_PAINEL_ATUALIZADO_ACEITE_VENCEDOR)

      expect(telas.findIndex((t) => t.imagem?.includes('aprovado-fornecedor-1'))).toBe(15)
      expect(telas.findIndex((t) => t.imagem?.includes('aprovado-fornecedor-segundo-lugar'))).toBe(18)
      expect(telas.findIndex((t) => t.imagem?.includes('aprovado-fornecedor-terceiro-lugar'))).toBe(19)
      expect(telas.findIndex((t) => t.imagem?.includes('aprovado-final'))).toBe(20)

      const analise5 = telas.find((t) => t.imagem?.includes('analise-fornecedor-5'))
      expect(analise5?.paragrafoDepois).toBe(TEXTO_BID_FRETE_DECISAO_APROVAR_COTACAO)
    }
  })

  it('Manual — painel solicitação no wizard (painel_cotacao_solicitacao_cotacao)', () => {
    const fluxo = DOC_BID_FRETE_SECAO.fluxos!.find((f) => f.ancoraPassosPrefix === 'nova-cotacao')
    const passo = fluxo?.passosVisuais?.find((p) => p.tituloCurto === 'Cotação manual')
    const galerias = passo!.galeriaComparacaoAposParagrafo ?? []
    const painel = galerias
      .flatMap((g) => g.telas)
      .find((t) => t.imagem?.includes('painel-cotacao-solicitacao-cotacao') && t.paragrafoAntes?.includes('**emails**'))
    expect(painel?.paragrafoAntes).toContain('**emails**')
    expect(painel?.paragrafoDepois).toContain('**Configurações**')
  })
})
