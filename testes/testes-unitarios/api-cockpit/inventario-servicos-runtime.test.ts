import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  descobrirServicosInventario,
  dominioCanonico,
  INVENTARIO_SERVICOS_RUNTIME,
} from '../../../servicos-global/servicos-plataforma/api-cockpit/server/src/lib/inventario-servicos-runtime.ts'

describe('inventario-servicos-runtime', () => {
  const envOriginal = { ...process.env }

  beforeEach(() => {
    process.env = { ...envOriginal }
    delete process.env.CANONICAL_DOMAIN
    delete process.env.PEDIDO_SERVICE_URL
    delete process.env.CONFIGURADOR_BASE_URL
  })

  afterEach(() => {
    process.env = envOriginal
  })

  it('lista um registro por sidecar (sem duplicar rotas do contracts.json)', () => {
    expect(INVENTARIO_SERVICOS_RUNTIME.length).toBe(9)
    const nomes = descobrirServicosInventario().map((s) => s.nome_servico_plataforma)
    expect(nomes).toContain('configurador')
    expect(nomes).toContain('pedido')
    expect(nomes).not.toContain('configurador-me')
    expect(nomes).not.toContain('configurador-organizacoes')
  })

  it('monta endpoint público com domínio canônico', () => {
    process.env.CANONICAL_DOMAIN = 'usegravity.com.br'
    const pedido = descobrirServicosInventario().find((s) => s.nome_servico_plataforma === 'pedido')
    expect(pedido?.endpoint_publico_servico_plataforma).toBe('https://usegravity.com.br/api/v1/pedidos')
  })

  it('usa env var de URL quando definida', () => {
    process.env.PEDIDO_SERVICE_URL = 'http://127.0.0.1:8030'
    const pedido = descobrirServicosInventario().find((s) => s.nome_servico_plataforma === 'pedido')
    expect(pedido?.base_url_health_servico_plataforma).toBe('http://127.0.0.1:8030')
  })

  it('dominioCanonico cai em usegravity.com.br', () => {
    expect(dominioCanonico()).toBe('usegravity.com.br')
  })
})
