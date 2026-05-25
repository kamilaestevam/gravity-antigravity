import { describe, expect, it } from 'vitest'
import {
  AVISO_ESCOPO_HUB_META_KEY,
  ESCOPO_WORKSPACES_META_KEY,
  colunasLarguraParaCliente,
  extrairEscopoWorkspacesDeColunasLargura,
  extrairSuprimirAvisoEscopoHubDeColunasLargura,
  mesclarEscopoEmColunasLargura,
  mesclarLargurasNumericas,
  mesclarSuprimirAvisoEscopoHubEmColunasLargura,
} from '../../../servicos-global/produto/pedido/shared/preferenciasUsuarioColunaPedido'

describe('preferenciasUsuarioColunaPedido — escopo em colunas_largura', () => {
  it('extrai ids_workspaces da meta key', () => {
    const gravacao = {
      numero_pedido: 120,
      [ESCOPO_WORKSPACES_META_KEY]: { _v: 1, ids_workspaces: ['ws-a', 'ws-b'] },
    }
    expect(extrairEscopoWorkspacesDeColunasLargura(gravacao)).toEqual(['ws-a', 'ws-b'])
  })

  it('colunasLarguraParaCliente omite meta key', () => {
    const gravacao = {
      numero_pedido: 120,
      [ESCOPO_WORKSPACES_META_KEY]: { _v: 1, ids_workspaces: ['ws-a'] },
    }
    expect(colunasLarguraParaCliente(gravacao)).toEqual({ numero_pedido: 120 })
  })

  it('mescla larguras numéricas preservando escopo existente', () => {
    const existente = {
      numero_pedido: 100,
      [ESCOPO_WORKSPACES_META_KEY]: { _v: 1, ids_workspaces: ['ws-x'] },
    }
    const mesclado = mesclarLargurasNumericas(existente, { status: 80 })
    expect(mesclado).toEqual({
      numero_pedido: 100,
      status: 80,
      [ESCOPO_WORKSPACES_META_KEY]: { _v: 1, ids_workspaces: ['ws-x'] },
    })
  })

  it('mescla escopo sem apagar larguras numéricas', () => {
    const existente = { numero_pedido: 100 }
    const mesclado = mesclarEscopoEmColunasLargura(existente, ['ws-1', 'ws-2'])
    expect(mesclado).toEqual({
      numero_pedido: 100,
      [ESCOPO_WORKSPACES_META_KEY]: { _v: 1, ids_workspaces: ['ws-1', 'ws-2'] },
    })
  })

  it('atualizar só larguras não remove escopo salvo', () => {
    const existente = {
      numero_pedido: 100,
      [ESCOPO_WORKSPACES_META_KEY]: { _v: 1, ids_workspaces: ['ws-salvo'] },
    }
    const soLargura = mesclarLargurasNumericas(existente, { status: 90 })
    const semEscopoNoBody = mesclarEscopoEmColunasLargura(soLargura, undefined)
    expect(extrairEscopoWorkspacesDeColunasLargura(semEscopoNoBody)).toEqual(['ws-salvo'])
    expect(colunasLarguraParaCliente(semEscopoNoBody)).toEqual({ numero_pedido: 100, status: 90 })
  })
})

describe('preferenciasUsuarioColunaPedido — aviso escopo Hub', () => {
  it('extrai suprimir da meta key', () => {
    const gravacao = {
      [AVISO_ESCOPO_HUB_META_KEY]: { _v: 1, suprimir: true },
    }
    expect(extrairSuprimirAvisoEscopoHubDeColunasLargura(gravacao)).toBe(true)
  })

  it('mescla suprimir sem apagar escopo existente', () => {
    const existente = {
      [ESCOPO_WORKSPACES_META_KEY]: { _v: 1, ids_workspaces: ['ws-a'] },
    }
    const mesclado = mesclarSuprimirAvisoEscopoHubEmColunasLargura(existente, true)
    expect(extrairEscopoWorkspacesDeColunasLargura(mesclado)).toEqual(['ws-a'])
    expect(extrairSuprimirAvisoEscopoHubDeColunasLargura(mesclado)).toBe(true)
  })
})
