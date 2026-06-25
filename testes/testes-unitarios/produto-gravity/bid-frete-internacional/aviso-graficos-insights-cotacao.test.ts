import { describe, expect, it } from 'vitest'
import { montarConteudoAvisoGraficosInsights } from '../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/infograficos-fluxo-cotacao-bid-frete-internacional'

const t = (_key: string, defaultValue?: string | Record<string, unknown>) =>
  typeof defaultValue === 'string' ? defaultValue : _key

describe('aviso gráficos insights — cockpit cotação', () => {
  it('não exibe aviso com 2 ou mais propostas', () => {
    expect(montarConteudoAvisoGraficosInsights('EM_COTACAO', 2, 3, t)).toBeNull()
  })

  it('variante rascunho sem disparos', () => {
    const aviso = montarConteudoAvisoGraficosInsights('RASCUNHO', 0, 0, t)
    expect(aviso?.variante).toBe('rascunho')
    expect(aviso?.passos.length).toBeGreaterThanOrEqual(2)
  })

  it('variante aguardando com disparos e zero propostas', () => {
    const aviso = montarConteudoAvisoGraficosInsights('EM_COTACAO', 0, 4, t)
    expect(aviso?.variante).toBe('aguardando')
    expect(aviso?.passos.length).toBe(2)
  })

  it('variante comparativo parcial com 1 proposta', () => {
    const aviso = montarConteudoAvisoGraficosInsights('EM_COTACAO', 1, 4, t)
    expect(aviso?.variante).toBe('comparativo_parcial')
  })

  it('não exibe aviso quando status APROVADA', () => {
    expect(montarConteudoAvisoGraficosInsights('APROVADA', 1, 4, t)).toBeNull()
  })
})
