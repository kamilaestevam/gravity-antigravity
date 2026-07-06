// @vitest-environment jsdom
import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import {
  CHAVE_LOCAL_STORAGE_STATUS_COTACAO_BID_FRETE_INTERNACIONAL,
  STATUS_COTACAO_CONFIG_PADRAO_BID_FRETE_INTERNACIONAL,
  contagemStatusNoFunilBidFreteInternacional,
  contagemAguardandoAprovacaoNoFunilBidFreteInternacional,
  contagemAguardandoRespostaNoFunilBidFreteInternacional,
  detalharAguardandoRespostaNoFunilBidFreteInternacional,
  resolverContagemKpiInsightsAguardandoAprovacaoBidFreteInternacional,
  resolverContagemKpiInsightsAguardandoRespostaBidFreteInternacional,
  resolverDetalheKpiInsightsAguardandoRespostaBidFreteInternacional,
  lerStatusCotacaoConfigBidFreteInternacional,
  montarEtapasFunilInsightsBidFreteInternacional,
  resolverCorStatusConfigBidFreteInternacional,
  resolverRotuloStatusConfigBidFreteInternacional,
  TITULO_KPI_INSIGHTS_AGUARDANDO_APROVACAO_BID_FRETE_INTERNACIONAL,
  TITULO_KPI_INSIGHTS_AGUARDANDO_RESPOSTA_BID_FRETE_INTERNACIONAL,
} from '../../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/status-config-bid-frete-internacional'

describe('lerStatusCotacaoConfigBidFreteInternacional', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('retorna padrão quando localStorage está vazio', () => {
    expect(lerStatusCotacaoConfigBidFreteInternacional()).toEqual(
      STATUS_COTACAO_CONFIG_PADRAO_BID_FRETE_INTERNACIONAL,
    )
  })

  it('retorna padrão quando JSON é inválido para o schema', () => {
    localStorage.setItem(
      CHAVE_LOCAL_STORAGE_STATUS_COTACAO_BID_FRETE_INTERNACIONAL,
      JSON.stringify([{ id: 'x' }]),
    )
    expect(lerStatusCotacaoConfigBidFreteInternacional()).toEqual(
      STATUS_COTACAO_CONFIG_PADRAO_BID_FRETE_INTERNACIONAL,
    )
  })

  it('lê config válida do localStorage', () => {
    const custom = [
      {
        id: 'rascunho',
        nome: 'RASCUNHO',
        rotulo: 'Meu rascunho',
        cor: '#111111',
        ordem: 1,
        gerenciado_sistema: true,
      },
    ]
    localStorage.setItem(
      CHAVE_LOCAL_STORAGE_STATUS_COTACAO_BID_FRETE_INTERNACIONAL,
      JSON.stringify(custom),
    )
    expect(lerStatusCotacaoConfigBidFreteInternacional()).toEqual(custom)
  })
})

describe('montarEtapasFunilInsightsBidFreteInternacional', () => {
  const config = [
    { id: 'b', nome: 'EM_COTACAO', rotulo: 'Em cotação custom', cor: '#f00', ordem: 2, gerenciado_sistema: true },
    { id: 'a', nome: 'RASCUNHO', rotulo: 'Rascunho custom', cor: '#0f0', ordem: 1, gerenciado_sistema: true },
    { id: 'c', nome: 'APROVADA', rotulo: 'Aprovada', cor: '#00f', ordem: 3, gerenciado_sistema: false },
  ]

  it('respeita ordem, rótulo e cor da config para status com contagem > 0', () => {
    const etapas = montarEtapasFunilInsightsBidFreteInternacional(config, [
      { status: 'RASCUNHO', count: 5 },
      { status: 'EM_COTACAO', count: 3 },
    ])
    expect(etapas).toEqual([
      { codigo_status: 'RASCUNHO', rotulo: 'Rascunho custom', quantidade: 5, cor: '#0f0' },
      { codigo_status: 'EM_COTACAO', rotulo: 'Em cotação custom', quantidade: 3, cor: '#f00' },
    ])
  })

  it('omite status com contagem zero', () => {
    const etapas = montarEtapasFunilInsightsBidFreteInternacional(config, [
      { status: 'APROVADA', count: 0 },
      { status: 'RASCUNHO', count: 2 },
    ])
    expect(etapas).toHaveLength(1)
    expect(etapas[0]?.codigo_status).toBe('RASCUNHO')
  })

  it('inclui status da API ausente na config com fallback de rótulo', () => {
    const etapas = montarEtapasFunilInsightsBidFreteInternacional(config, [
      { status: 'CANCELADA', count: 4 },
    ])
    expect(etapas).toEqual([
      { codigo_status: 'CANCELADA', rotulo: 'Cancelada', quantidade: 4, cor: '#94a3b8' },
    ])
  })
})

describe('KPI Insights — contagem e rótulo por Configurações', () => {
  const funil = [
    { status: 'RASCUNHO', count: 5 },
    { status: 'EM_COTACAO', count: 3 },
    { status: 'APROVADA', count: 2 },
  ]
  const config = [
    { id: 'a', nome: 'RASCUNHO', rotulo: 'Rascunho', cor: '#0f0', ordem: 1, gerenciado_sistema: true },
    { id: 'b', nome: 'APROVADA', rotulo: 'Ganhas', cor: '#00f', ordem: 2, gerenciado_sistema: false },
  ]

  it('conta status configurado no funil', () => {
    expect(contagemStatusNoFunilBidFreteInternacional(funil, 'RASCUNHO')).toBe(5)
    expect(contagemStatusNoFunilBidFreteInternacional(funil, 'EXPIRADA')).toBe(0)
  })

  it('resolve rótulo e cor da config para o card KPI', () => {
    expect(resolverRotuloStatusConfigBidFreteInternacional(config, 'RASCUNHO', 'Em andamento')).toBe('Rascunho')
    expect(resolverCorStatusConfigBidFreteInternacional(config, 'APROVADA', '#34d399')).toBe('#00f')
    expect(resolverRotuloStatusConfigBidFreteInternacional(config, 'DESCONHECIDO', 'Fallback')).toBe('Fallback')
  })
})

describe('KPI Insights — cards fixos aguardando aprovação e resposta', () => {
  const configComCustom = [
    ...STATUS_COTACAO_CONFIG_PADRAO_BID_FRETE_INTERNACIONAL,
    {
      id: 'status_custom',
      nome: 'COTACAO_RESPONDIDA',
      rotulo: 'Cotação respondida',
      cor: '#818cf8',
      ordem: 10,
      gerenciado_sistema: false,
    },
  ]

  const funil = [
    { status: 'AGUARDANDO_APROVACAO', count: 4 },
    { status: 'COTACAO_RESPONDIDA', count: 6 },
    { status: 'ENVIADA_FORNECEDORES', count: 7 },
    { status: 'EM_COTACAO', count: 3 },
    { status: 'RASCUNHO', count: 29 },
  ]

  it('expõe títulos fixos dos dois primeiros cards', () => {
    expect(TITULO_KPI_INSIGHTS_AGUARDANDO_APROVACAO_BID_FRETE_INTERNACIONAL).toBe(
      'Cotações aguardando aprovação',
    )
    expect(TITULO_KPI_INSIGHTS_AGUARDANDO_RESPOSTA_BID_FRETE_INTERNACIONAL).toBe(
      'Cotações aguardando resposta',
    )
  })

  it('conta aguardando aprovação incluindo status custom da config', () => {
    expect(contagemAguardandoAprovacaoNoFunilBidFreteInternacional(funil, configComCustom)).toBe(10)
    expect(contagemStatusNoFunilBidFreteInternacional(funil, 'AGUARDANDO_APROVACAO')).toBe(4)
  })

  it('soma enviadas e em cotação para aguardando resposta', () => {
    expect(contagemAguardandoRespostaNoFunilBidFreteInternacional(funil, configComCustom)).toBe(10)
    expect(detalharAguardandoRespostaNoFunilBidFreteInternacional(funil, configComCustom)).toEqual({
      enviadaFornecedores: 7,
      emCotacao: 3,
      total: 10,
    })
  })

  it('ignora rascunho no card aguardando resposta', () => {
    expect(contagemAguardandoRespostaNoFunilBidFreteInternacional(funil, configComCustom)).not.toBe(29)
  })
})

describe('KPI Insights — resolverContagem Math.max(api, funil)', () => {
  const funil = [
    { status: 'AGUARDANDO_APROVACAO', count: 4 },
    { status: 'ENVIADA_FORNECEDORES', count: 7 },
    { status: 'EM_COTACAO', count: 3 },
  ]
  const config = STATUS_COTACAO_CONFIG_PADRAO_BID_FRETE_INTERNACIONAL

  it('usa funil quando API não envia contagem', () => {
    expect(
      resolverContagemKpiInsightsAguardandoAprovacaoBidFreteInternacional(funil, config),
    ).toBe(4)
    expect(
      resolverContagemKpiInsightsAguardandoRespostaBidFreteInternacional(funil, config),
    ).toBe(10)
  })

  it('usa Math.max quando API retorna 0 mas funil tem contagem', () => {
    expect(
      resolverContagemKpiInsightsAguardandoAprovacaoBidFreteInternacional(funil, config, 0),
    ).toBe(4)
    expect(
      resolverContagemKpiInsightsAguardandoRespostaBidFreteInternacional(funil, config, 0),
    ).toBe(10)
  })

  it('prefere API quando maior que funil', () => {
    expect(
      resolverContagemKpiInsightsAguardandoAprovacaoBidFreteInternacional(funil, config, 12),
    ).toBe(12)
  })

  it('detalhe resposta combina API e funil com Math.max', () => {
    expect(
      resolverDetalheKpiInsightsAguardandoRespostaBidFreteInternacional(
        funil,
        config,
        { enviada_fornecedores: 0, em_cotacao: 0 },
        0,
      ),
    ).toEqual({
      enviadaFornecedores: 7,
      emCotacao: 3,
      total: 10,
    })
  })
})
