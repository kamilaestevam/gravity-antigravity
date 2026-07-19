import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  carregarTabelaConfigBidFrete,
  codificarLimiteDestaqueExpiracao,
  decodificarLimiteDestaqueExpiracao,
  DEFAULT_TABELA_CONFIG_BID_FRETE,
  formatarAntecedenciaDestaqueExpiracao,
  formatarAntecedenciaDestaqueExpiracaoConfig,
  montarGruposSelectLimiteDestaqueExpiracao,
  normalizarLimiteDestaqueExpiracao,
  obterLimiteDestaqueExpiracaoHoras,
  salvarTabelaConfigBidFrete,
  STORAGE_KEY_TABELA_BID_FRETE,
  SYNC_EVENT_TABELA_BID_FRETE,
} from '../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/tabela-config-bid-frete'

const lsStore: Record<string, string> = {}

beforeEach(() => {
  Object.keys(lsStore).forEach(k => delete lsStore[k])
  vi.stubGlobal('localStorage', {
    getItem: vi.fn((k: string) => lsStore[k] ?? null),
    setItem: vi.fn((k: string, v: string) => {
      lsStore[k] = v
    }),
    removeItem: vi.fn((k: string) => {
      delete lsStore[k]
    }),
  })
})

describe('tabela-config-bid-frete', () => {
  it('retorna padrão quando storage vazio', () => {
    expect(carregarTabelaConfigBidFrete()).toEqual(DEFAULT_TABELA_CONFIG_BID_FRETE)
  })

  it('carrega valor/unidade salvos', () => {
    lsStore[STORAGE_KEY_TABELA_BID_FRETE] = JSON.stringify({
      linhasPorPagina: 50,
      destacarAtrasados: false,
      limiteDestaqueExpiracaoValor: 7,
      limiteDestaqueExpiracaoUnidade: 'dias',
    })
    expect(carregarTabelaConfigBidFrete()).toEqual({
      linhasPorPagina: 50,
      destacarAtrasados: false,
      limiteDestaqueExpiracaoValor: 7,
      limiteDestaqueExpiracaoUnidade: 'dias',
    })
  })

  it('migra limite legado em horas totais para dias', () => {
    lsStore[STORAGE_KEY_TABELA_BID_FRETE] = JSON.stringify({
      linhasPorPagina: 100,
      destacarAtrasados: true,
      limiteDestaqueExpiracaoHoras: 168,
    })
    expect(carregarTabelaConfigBidFrete()).toMatchObject({
      limiteDestaqueExpiracaoValor: 7,
      limiteDestaqueExpiracaoUnidade: 'dias',
    })
  })

  it('normaliza limites inválidos', () => {
    expect(normalizarLimiteDestaqueExpiracao(999, 'horas')).toEqual({
      limiteDestaqueExpiracaoValor: 24,
      limiteDestaqueExpiracaoUnidade: 'horas',
    })
    expect(normalizarLimiteDestaqueExpiracao(999, 'dias')).toEqual({
      limiteDestaqueExpiracaoValor: 100,
      limiteDestaqueExpiracaoUnidade: 'dias',
    })
  })

  it('codifica e decodifica select', () => {
    const codigo = codificarLimiteDestaqueExpiracao(12, 'horas')
    expect(decodificarLimiteDestaqueExpiracao(codigo)).toEqual({
      limiteDestaqueExpiracaoValor: 12,
      limiteDestaqueExpiracaoUnidade: 'horas',
    })
  })

  it('converte dias para horas na lista', () => {
    expect(obterLimiteDestaqueExpiracaoHoras({
      ...DEFAULT_TABELA_CONFIG_BID_FRETE,
      limiteDestaqueExpiracaoValor: 3,
      limiteDestaqueExpiracaoUnidade: 'dias',
    })).toBe(72)
  })

  it('monta grupos com 24 horas e 100 dias', () => {
    const grupos = montarGruposSelectLimiteDestaqueExpiracao()
    expect(grupos).toHaveLength(2)
    expect(grupos[0]?.opcoes).toHaveLength(24)
    expect(grupos[1]?.opcoes).toHaveLength(100)
  })

  it('formata antecedência em horas e dias', () => {
    expect(formatarAntecedenciaDestaqueExpiracao(1, 'horas')).toBe('1 hora')
    expect(formatarAntecedenciaDestaqueExpiracao(6, 'horas')).toBe('6 horas')
    expect(formatarAntecedenciaDestaqueExpiracao(1, 'dias')).toBe('1 dia')
    expect(formatarAntecedenciaDestaqueExpiracaoConfig({
      ...DEFAULT_TABELA_CONFIG_BID_FRETE,
      limiteDestaqueExpiracaoValor: 15,
      limiteDestaqueExpiracaoUnidade: 'dias',
    })).toBe('15 dias')
  })

  it('salvarTabelaConfigBidFrete persiste e dispara evento de sync', () => {
    const dispatch = vi.fn()
    vi.stubGlobal('window', { dispatchEvent: dispatch })
    salvarTabelaConfigBidFrete({
      linhasPorPagina: 25,
      destacarAtrasados: false,
      limiteDestaqueExpiracaoValor: 18,
      limiteDestaqueExpiracaoUnidade: 'horas',
    })
    expect(carregarTabelaConfigBidFrete()).toEqual({
      linhasPorPagina: 25,
      destacarAtrasados: false,
      limiteDestaqueExpiracaoValor: 18,
      limiteDestaqueExpiracaoUnidade: 'horas',
    })
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: SYNC_EVENT_TABELA_BID_FRETE }))
  })
})
