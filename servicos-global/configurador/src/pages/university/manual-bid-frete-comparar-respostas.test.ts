import { describe, expect, it } from 'vitest'
import { DOC_BID_FRETE_SECAO } from './manual-bid-frete-conteudo'
import {
  GALERIA_BID_FRETE_COMPARAR_FECHAR_COTACAO,
  PASSO_BID_FRETE_COMPARAR_FECHAR_COTACAO,
  TEXTO_BID_FRETE_COMPARAR_COTACOES_RESPONDIDAS,
  TEXTO_BID_FRETE_HORA_COMPARAR_E_FECHAR,
} from './manual-bid-frete-comparar-fechar-conteudo'

describe('manual BID Frete — comparar e respostas fornecedor', () => {
  it('Comparar e fechar usa galeria única com 16 telas', () => {
    expect(PASSO_BID_FRETE_COMPARAR_FECHAR_COTACAO.galeriaComparacaoAposParagrafo).toHaveLength(1)
    expect(GALERIA_BID_FRETE_COMPARAR_FECHAR_COTACAO.telas).toHaveLength(16)
    expect(GALERIA_BID_FRETE_COMPARAR_FECHAR_COTACAO.telas[0]?.imagem).toContain('analise-fornecedor-1')
  })

  it('Manual e Smart Doc — respostas + analise 1–5 na mesma galeria', () => {
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
      expect(telas).toHaveLength(10)

      const email = telas.find((t) => t.imagem?.includes('email-comprador-fornecedor-respondeu-cotacao'))
      expect(email?.paragrafoDepois).toBe(TEXTO_BID_FRETE_HORA_COMPARAR_E_FECHAR)

      const analise1Idx = telas.findIndex((t) => t.imagem?.includes('analise-fornecedor-1'))
      const analise5Idx = telas.findIndex((t) => t.imagem?.includes('analise-fornecedor-5'))
      expect(analise1Idx).toBe(5)
      expect(analise5Idx).toBe(9)

      for (let n = 1; n <= 5; n += 1) {
        const tela = telas.find((t) => t.imagem?.includes(`analise-fornecedor-${n}`))
        expect(tela?.paragrafoAntes, `analise_fornecedor_${n}`).toBeTruthy()
      }

      const solicitacao = telas.find((t) => t.imagem?.includes('painel-cotacao-solicitacao-cotacao'))
      expect(solicitacao?.paragrafoAntes).toBe(TEXTO_BID_FRETE_COMPARAR_COTACOES_RESPONDIDAS)
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
