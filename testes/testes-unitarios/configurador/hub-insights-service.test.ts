import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  classificarInsightHub,
  comporCarrosselInsightsHub,
  intercalarInsightsHubOperacionaisDicas,
  normalizarChavesProdutosAtivosHub,
  type HubInsight,
} from '../../../servicos-global/configurador/server/services/hub-insights-service.js'

const HUB_INSIGHTS_PATH = resolve(
  import.meta.dirname,
  '../../../servicos-global/configurador/server/services/hub-insights-service.ts',
)

function insightOperacional(id: string, score: number): HubInsight {
  return {
    id,
    variante: 'warn',
    tag: `Alerta · ${id}`,
    texto: `Pendência real ${id}`,
    score,
    produto: 'Pedido',
  }
}

function insightPlataforma(id: string): HubInsight {
  return {
    id,
    variante: 'default',
    tag: 'Dica · Plataforma',
    texto: `Ajuda ${id}`,
    score: 2,
  }
}

describe('hub-insights-service', () => {
  it('normaliza aliases de produto para os fetchers do HUB', () => {
    const keys = normalizarChavesProdutosAtivosHub(
      new Set(['pedido', 'bid-frete-internacional', 'nf-import']),
    )
    expect(keys.has('pedido')).toBe(true)
    expect(keys.has('bid-frete')).toBe(true)
    expect(keys.has('bid-frete-internacional')).toBe(true)
    expect(keys.has('nf-importacao')).toBe(true)
    expect(keys.has('nf-import')).toBe(true)
  })

  it('envia headers S2S canônicos nas chamadas inter-serviço', () => {
    const content = readFileSync(HUB_INSIGHTS_PATH, 'utf8')
    expect(content).toContain("'x-chave-interna-servico': ctx.internalKey")
    expect(content).toContain("'x-internal-key': ctx.internalKey")
    expect(content).toContain("'x-id-usuario': ctx.id_usuario")
    expect(content).toContain('bid-frete-internacional/dashboard')
    expect(content).toContain('/api/v1/pedidos/dashboard/insights')
  })

  it('classifica insights de KPI como operacionais e dicas como plataforma', () => {
    expect(classificarInsightHub(insightOperacional('pedidos_atrasados', 90))).toBe('operacional')
    expect(classificarInsightHub(insightPlataforma('hub_dica_gabi'))).toBe('plataforma')
    expect(classificarInsightHub(insightPlataforma('hub_produtos_ativos'))).toBe('plataforma')
    expect(classificarInsightHub(insightPlataforma('feat_pedido'))).toBe('plataforma')
  })

  it('intercala 1 dica a cada 9 insights operacionais', () => {
    const reais = Array.from({ length: 9 }, (_, i) => insightOperacional(`op-${i}`, 100 - i))
    const dicas = [insightPlataforma('hub_dica_gabi')]
    const mix = intercalarInsightsHubOperacionaisDicas(reais, dicas)
    expect(mix).toHaveLength(10)
    expect(classificarInsightHub(mix[8]!)).toBe('operacional')
    expect(classificarInsightHub(mix[9]!)).toBe('plataforma')
  })

  it('mantém carrossel com ~90% operacionais quando há KPIs suficientes', () => {
    const operacionais = Array.from({ length: 9 }, (_, i) =>
      insightOperacional(`kpi-${i}`, 100 - i),
    )
    const carrossel = comporCarrosselInsightsHub(operacionais, new Set(['pedido', 'bid-cambio', 'bid-frete']), {
      algumProdutoRespondeu: true,
    })

    const qtdOperacionais = carrossel.filter(i => classificarInsightHub(i) === 'operacional').length
    const qtdPlataforma = carrossel.filter(i => classificarInsightHub(i) === 'plataforma').length

    expect(qtdOperacionais).toBeGreaterThanOrEqual(8)
    expect(qtdPlataforma).toBeLessThanOrEqual(2)
    expect(qtdOperacionais / carrossel.length).toBeGreaterThanOrEqual(0.8)
  })
})
