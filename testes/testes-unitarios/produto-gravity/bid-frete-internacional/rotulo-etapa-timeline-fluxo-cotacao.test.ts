import { describe, it, expect } from 'vitest'
import { rotuloEtapaTimelineFluxoCotacao } from '../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/infograficos-fluxo-cotacao-bid-frete-internacional.js'

describe('rotuloEtapaTimelineFluxoCotacao', () => {
  const etapa4 = {
    indice: 4,
    labelKey: 'bidfrete.detalhe_cotacao.timeline_fornecedor_concordou',
  }
  const t = (_key: string, defaultValue?: string) => defaultValue ?? _key

  it('etapa 4 aguardando aceite usa rótulo curto', () => {
    expect(
      rotuloEtapaTimelineFluxoCotacao(
        etapa4,
        { indiceAtual: 4, statusPropostaGanhadora: 'APROVADA' },
        t,
      ),
    ).toBe('Aguard. fornecedor')
  })

  it('etapa 4 após aceite usa fornecedor concordou', () => {
    expect(
      rotuloEtapaTimelineFluxoCotacao(
        etapa4,
        { indiceAtual: 5, statusPropostaGanhadora: 'APROVACAO_RECEBIDA' },
        t,
      ),
    ).toBe('Fornecedor concordou')
  })
})
