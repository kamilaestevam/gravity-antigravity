import { describe, expect, it, beforeEach, vi } from 'vitest'
import {
  CHAVES_COLUNAS_PADRAO_VISIVEIS_LISTA,
  normalizarColunasVisiveisListaBidFrete,
  ordemColunasVisiveisDivergeDaCanonica,
  ORDEM_COLUNAS_LISTA_BID_FRETE_INTERNACIONAL,
} from '../../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/ordem-colunas-lista-bid-frete-internacional'
import {
  mesclarColunasManuaisNasPreferenciasListaBidFrete,
  migrarOrdemColunasPainelListaBidFrete,
  migrarPreferenciasColunasListaBidFreteSeNecessario,
  STORAGE_COLUNAS_VERSAO_BID_FRETE,
  STORAGE_PAINEL_ORDEM_COLUNAS_BID_FRETE,
  VERSAO_COLUNAS_LISTA_BID_FRETE,
} from '../../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/preferencias-colunas-lista-bid-frete-internacional'

describe('normalizarColunasVisiveisListaBidFrete', () => {
  it('retorna ordem canônica quando prefs legado ou inválidas', () => {
    expect(normalizarColunasVisiveisListaBidFrete(['status_cotacao_bid_frete_internacional'])).toEqual(
      [...CHAVES_COLUNAS_PADRAO_VISIVEIS_LISTA],
    )
  })

  it('reordena colunas salvas para a sequência SSOT preservando visibilidade', () => {
    const salvas = [
      'modal_cotacao_bid_frete_internacional',
      'numero_cotacao_bid_frete_internacional',
      'status_cotacao_bid_frete_internacional',
    ]
    const normalizadas = normalizarColunasVisiveisListaBidFrete(salvas)
    expect(normalizadas.indexOf('numero_cotacao_bid_frete_internacional')).toBe(0)
    expect(normalizadas.indexOf('status_cotacao_bid_frete_internacional')).toBe(1)
    expect(normalizadas.indexOf('modal_cotacao_bid_frete_internacional')).toBe(3)
  })

  it('adiciona colunas padrão faltantes ao final do bloco visível', () => {
    const salvas = [
      'numero_cotacao_bid_frete_internacional',
      'status_cotacao_bid_frete_internacional',
      'tipo_operacao_cotacao_bid_frete_internacional',
    ]
    const normalizadas = normalizarColunasVisiveisListaBidFrete(salvas)
    expect(normalizadas.length).toBe(CHAVES_COLUNAS_PADRAO_VISIVEIS_LISTA.length)
    expect(normalizadas.slice(0, 3)).toEqual(salvas)
  })

  it('ordemColunasVisiveisDivergeDaCanonica detecta ordem errada', () => {
    const salvas = [
      'modal_cotacao_bid_frete_internacional',
      'numero_cotacao_bid_frete_internacional',
      'status_cotacao_bid_frete_internacional',
      'tipo_operacao_cotacao_bid_frete_internacional',
    ]
    expect(ordemColunasVisiveisDivergeDaCanonica(salvas)).toBe(true)
    expect(ordemColunasVisiveisDivergeDaCanonica(
      normalizarColunasVisiveisListaBidFrete(salvas),
    )).toBe(false)
  })

  it('colunas custom fora do catálogo permanecem ao final', () => {
    const custom = 'coluna_usuario_teste'
    const salvas = [
      'numero_cotacao_bid_frete_internacional',
      'status_cotacao_bid_frete_internacional',
      'tipo_operacao_cotacao_bid_frete_internacional',
      custom,
    ]
    const catalogo = [...ORDEM_COLUNAS_LISTA_BID_FRETE_INTERNACIONAL, custom]
    const normalizadas = normalizarColunasVisiveisListaBidFrete(salvas, catalogo)
    expect(normalizadas.at(-1)).toBe(custom)
  })

  it('colunas custom fora do catálogo SSOT permanecem visíveis ao normalizar', () => {
    const custom = 'nova_coluna_texto'
    const salvas = [
      'numero_cotacao_bid_frete_internacional',
      'status_cotacao_bid_frete_internacional',
      'tipo_operacao_cotacao_bid_frete_internacional',
      custom,
    ]
    const normalizadas = normalizarColunasVisiveisListaBidFrete(salvas)
    expect(normalizadas).toContain(custom)
    expect(normalizadas.at(-1)).toBe(custom)
  })
})

describe('mesclarColunasManuaisNasPreferenciasListaBidFrete', () => {
  it('seleciona automaticamente coluna manual nova', () => {
    const merged = mesclarColunasManuaisNasPreferenciasListaBidFrete(
      [{
        id: 'col_1',
        chave: 'nova_coluna_texto',
        nome: 'Nova coluna texto',
        tipo: 'texto',
        escopo: 'pedido',
        ativo: true,
      }],
      {
        colunas_visiveis: [
          'numero_cotacao_bid_frete_internacional',
          'status_cotacao_bid_frete_internacional',
        ],
      },
    )
    expect(merged?.colunas_visiveis).toContain('nova_coluna_texto')
    expect(merged?.colunas_manuais_conhecidas).toContain('nova_coluna_texto')
  })

  it('não reexibe coluna manual que o usuário ocultou', () => {
    const prev = {
      colunas_visiveis: ['numero_cotacao_bid_frete_internacional'],
      colunas_manuais_conhecidas: ['nova_coluna_texto'],
    }
    const merged = mesclarColunasManuaisNasPreferenciasListaBidFrete(
      [{
        id: 'col_1',
        chave: 'nova_coluna_texto',
        nome: 'Nova coluna texto',
        tipo: 'texto',
        escopo: 'pedido',
        ativo: true,
      }],
      prev,
    )
    expect(merged).toBe(prev)
    expect(merged?.colunas_visiveis).not.toContain('nova_coluna_texto')
  })
})

describe('migrarOrdemColunasPainelListaBidFrete', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      store: {} as Record<string, string>,
      getItem(key: string) {
        return this.store[key] ?? null
      },
      setItem(key: string, value: string) {
        this.store[key] = value
      },
      removeItem(key: string) {
        delete this.store[key]
      },
    })
    localStorage.setItem(STORAGE_COLUNAS_VERSAO_BID_FRETE, String(VERSAO_COLUNAS_LISTA_BID_FRETE))
    localStorage.removeItem(STORAGE_PAINEL_ORDEM_COLUNAS_BID_FRETE)
  })

  it('migra ordem uma vez por painel e não repete na segunda chamada', () => {
    const salvas = [
      'modal_cotacao_bid_frete_internacional',
      'numero_cotacao_bid_frete_internacional',
      'status_cotacao_bid_frete_internacional',
      'tipo_operacao_cotacao_bid_frete_internacional',
    ]
    const primeira = migrarOrdemColunasPainelListaBidFrete('painel-1', salvas)
    expect(primeira).not.toBeNull()
    expect(primeira?.indexOf('numero_cotacao_bid_frete_internacional')).toBe(0)

    const segunda = migrarOrdemColunasPainelListaBidFrete('painel-1', salvas)
    expect(segunda).toBeNull()
  })

  it('migrarPreferenciasColunasListaBidFreteSeNecessario limpa tracker de painéis no bump', () => {
    localStorage.setItem(STORAGE_COLUNAS_VERSAO_BID_FRETE, '5')
    localStorage.setItem(STORAGE_PAINEL_ORDEM_COLUNAS_BID_FRETE, JSON.stringify(['painel-antigo']))
    expect(migrarPreferenciasColunasListaBidFreteSeNecessario()).toBe(true)
    expect(localStorage.getItem(STORAGE_COLUNAS_VERSAO_BID_FRETE)).toBe(String(VERSAO_COLUNAS_LISTA_BID_FRETE))
    expect(localStorage.getItem(STORAGE_PAINEL_ORDEM_COLUNAS_BID_FRETE)).toBeNull()
  })
})
