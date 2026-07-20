import { describe, expect, it } from 'vitest'
import { DOC_BID_FRETE_SECAO } from './manual-bid-frete-conteudo'
import {
  GALERIA_BID_FRETE_COMPARAR_FECHAR_COTACAO,
  GALERIAS_BID_FRETE_COMPARAR_FECHAR_COTACAO,
  PASSO_BID_FRETE_COMPARAR_FECHAR_COTACAO,
  TEXTO_BID_FRETE_DECISAO_APROVAR_COTACAO,
  TEXTO_BID_FRETE_FORNECEDOR_CONFIRMACAO_ACEITE_FINAL,
  TEXTO_BID_FRETE_OUTROS_COLOCADOS_AVISADOS,
  TEXTO_BID_FRETE_PAINEL_ATUALIZADO_ACEITE_VENCEDOR,
  TITULO_ETAPA_BID_FRETE_ACEITE_VENCEDOR,
  TITULO_ETAPA_BID_FRETE_APROVAR_COTACAO,
  TITULO_ETAPA_BID_FRETE_COMPARAR_PROPOSTAS,
  TITULO_ETAPA_BID_FRETE_DEMAIS_COLOCADOS,
  TITULO_ETAPA_BID_FRETE_PAINEL_ATUALIZADO,
  TITULO_ETAPA_BID_FRETE_RESPOSTAS_FORNECEDOR,
} from './manual-bid-frete-comparar-fechar-conteudo'

const TITULOS_ETAPA_POS_ENVIO = [
  TITULO_ETAPA_BID_FRETE_RESPOSTAS_FORNECEDOR,
  TITULO_ETAPA_BID_FRETE_COMPARAR_PROPOSTAS,
  TITULO_ETAPA_BID_FRETE_APROVAR_COTACAO,
  TITULO_ETAPA_BID_FRETE_ACEITE_VENCEDOR,
  TITULO_ETAPA_BID_FRETE_DEMAIS_COLOCADOS,
  TITULO_ETAPA_BID_FRETE_PAINEL_ATUALIZADO,
] as const

describe('manual BID Frete — comparar e respostas fornecedor', () => {
  it('Comparar e fechar usa 5 blocos temáticos com 16 telas', () => {
    expect(PASSO_BID_FRETE_COMPARAR_FECHAR_COTACAO.galeriaComparacaoAposParagrafo).toHaveLength(5)
    expect(GALERIAS_BID_FRETE_COMPARAR_FECHAR_COTACAO.map((g) => g.tituloEtapa)).toEqual([
      TITULO_ETAPA_BID_FRETE_COMPARAR_PROPOSTAS,
      TITULO_ETAPA_BID_FRETE_APROVAR_COTACAO,
      TITULO_ETAPA_BID_FRETE_ACEITE_VENCEDOR,
      TITULO_ETAPA_BID_FRETE_DEMAIS_COLOCADOS,
      TITULO_ETAPA_BID_FRETE_PAINEL_ATUALIZADO,
    ])
    expect(GALERIA_BID_FRETE_COMPARAR_FECHAR_COTACAO.telas).toHaveLength(16)
    expect(GALERIA_BID_FRETE_COMPARAR_FECHAR_COTACAO.telas[0]?.imagem).toContain('analise-fornecedor-1')
  })

  it('Manual e Smart Doc — pós-envio em 6 blocos temáticos (21 telas)', () => {
    const fluxo = DOC_BID_FRETE_SECAO.fluxos!.find((f) => f.ancoraPassosPrefix === 'nova-cotacao')
    const passos = fluxo?.passosVisuais ?? []
    for (const tituloCurto of ['Cotação manual', 'Cotação via Smart Doc'] as const) {
      const passo = passos.find((p) => p.tituloCurto === tituloCurto)
      expect(passo, tituloCurto).toBeDefined()
      const galerias = passo!.galeriaComparacaoAposParagrafo ?? []
      const idxRespostas = galerias.findIndex((g) => g.tituloEtapa === TITULO_ETAPA_BID_FRETE_RESPOSTAS_FORNECEDOR)
      expect(idxRespostas, `${tituloCurto} bloco respostas`).toBeGreaterThanOrEqual(0)

      const blocosPosEnvio = galerias.slice(idxRespostas)
      expect(blocosPosEnvio.map((g) => g.tituloEtapa)).toEqual([...TITULOS_ETAPA_POS_ENVIO])

      const telas = blocosPosEnvio.flatMap((g) => g.telas)
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
