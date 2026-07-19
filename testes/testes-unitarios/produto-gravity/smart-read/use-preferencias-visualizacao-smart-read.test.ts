import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  GRAFICOS_CATALOGO_INSIGHTS_SMART_READ,
  PREFERENCIAS_VISUALIZACAO_PADRAO_SMART_READ,
  PREFIXO_COLUNA_PERSONALIZADA_SMART_READ,
  carregarPreferenciasVisualizacaoSmartRead,
  chaveColunaPersonalizadaSmartRead,
  normalizarPreferenciasVisualizacaoSmartRead,
  salvarPreferenciasVisualizacaoSmartRead,
} from '../../../../servicos-global/produto/smart-read/client/src/shared/use-preferencias-visualizacao-smart-read.ts'

const STORAGE_KEY = 'smart-read:config:visualizacao-v1'
const lsStore: Record<string, string> = {}

beforeEach(() => {
  Object.keys(lsStore).forEach((k) => delete lsStore[k])
  vi.stubGlobal('localStorage', {
    getItem: vi.fn((k: string) => lsStore[k] ?? null),
    setItem: vi.fn((k: string, v: string) => {
      lsStore[k] = v
    }),
    removeItem: vi.fn((k: string) => {
      delete lsStore[k]
    }),
    clear: vi.fn(() => {
      Object.keys(lsStore).forEach((k) => delete lsStore[k])
    }),
  })
  vi.stubGlobal('window', {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('use-preferencias-visualizacao-smart-read', () => {
  it('carrega padrão quando storage vazio', () => {
    expect(carregarPreferenciasVisualizacaoSmartRead()).toEqual(
      PREFERENCIAS_VISUALIZACAO_PADRAO_SMART_READ,
    )
  })

  it('persiste as três abas e dispara evento de sync para os consumidores', () => {
    salvarPreferenciasVisualizacaoSmartRead({
      graficos_ocultos: ['tipos_documento'],
      linhas_pagina: 25,
      densidade: 'compacto',
      colunas_personalizadas: [{ id: 'abc', nome: 'Referência interna', visible: true }],
    })

    expect(window.dispatchEvent).toHaveBeenCalled()
    const salvo = carregarPreferenciasVisualizacaoSmartRead()
    expect(salvo.graficos_ocultos).toEqual(['tipos_documento'])
    expect(salvo.linhas_pagina).toBe(25)
    expect(salvo.densidade).toBe('compacto')
    expect(salvo.colunas_personalizadas).toEqual([
      { id: 'abc', nome: 'Referência interna', visible: true },
    ])
  })

  it('descarta gráfico oculto fora do catálogo do Insights', () => {
    salvarPreferenciasVisualizacaoSmartRead({
      ...PREFERENCIAS_VISUALIZACAO_PADRAO_SMART_READ,
      graficos_ocultos: ['grafico_que_nao_existe', 'evolucao_diaria'],
    })

    expect(carregarPreferenciasVisualizacaoSmartRead().graficos_ocultos).toEqual([
      'evolucao_diaria',
    ])
  })

  it('normaliza linhas por página inválida para o padrão (50)', () => {
    lsStore[STORAGE_KEY] = JSON.stringify({ linhas_pagina: 999, densidade: 'compacto' })

    const salvo = carregarPreferenciasVisualizacaoSmartRead()
    expect(salvo.linhas_pagina).toBe(50)
    expect(salvo.densidade).toBe('compacto')
  })

  it('normaliza colunas personalizadas: nome vazio, duplicadas e visible ausente', () => {
    lsStore[STORAGE_KEY] = JSON.stringify({
      colunas_personalizadas: [
        { id: 'a', nome: '   ' },
        { id: 'a', nome: 'Duplicada' },
        { id: 'b', nome: 'OK', visible: false },
        { nome: 'Sem id', visible: true },
      ],
    })

    expect(carregarPreferenciasVisualizacaoSmartRead().colunas_personalizadas).toEqual([
      { id: 'a', nome: 'Nova coluna', visible: true },
      { id: 'b', nome: 'OK', visible: false },
    ])
  })

  it('storage corrompido volta ao padrão sem lançar', () => {
    lsStore[STORAGE_KEY] = '{nao-e-json'
    expect(carregarPreferenciasVisualizacaoSmartRead()).toEqual(
      PREFERENCIAS_VISUALIZACAO_PADRAO_SMART_READ,
    )
  })

  it('normalizar aceita payload não-objeto', () => {
    expect(normalizarPreferenciasVisualizacaoSmartRead(null)).toEqual(
      PREFERENCIAS_VISUALIZACAO_PADRAO_SMART_READ,
    )
    expect(normalizarPreferenciasVisualizacaoSmartRead([1, 2])).toEqual({
      ...PREFERENCIAS_VISUALIZACAO_PADRAO_SMART_READ,
    })
  })

  it('chave de coluna personalizada usa o prefixo reservado da tabela', () => {
    const chave = chaveColunaPersonalizadaSmartRead({ id: 'xyz', nome: 'X', visible: true })
    expect(chave).toBe(`${PREFIXO_COLUNA_PERSONALIZADA_SMART_READ}xyz`)
  })

  it('catálogo de gráficos cobre os cinco painéis reais do Insights', () => {
    expect(GRAFICOS_CATALOGO_INSIGHTS_SMART_READ.map((g) => g.id)).toEqual([
      'evolucao_diaria',
      'campos_acertos',
      'tipos_documento',
      'economia_estimada',
      'rankings_fornecedor',
    ])
  })
})
