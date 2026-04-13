// @vitest-environment node
/**
 * Testes de Integridade — Casas Decimais (sincronização config ↔ pedidos/itens)
 *
 * Verifica que os campos casas_decimais_* nos pedidos e itens no banco
 * batem EXATAMENTE com o que está salvo em PedidoCasasDecimaisConfig.
 *
 * Cobre:
 *   - MAP_CONFIG_PEDIDO: cada campo config → campo real no banco do pedido
 *   - MAP_CONFIG_ITEM: cada campo config → campo real no banco do item
 *   - Migração com confirmar=true: updateMany recebe os valores corretos
 *   - Campos virtuais (pronta, saldo, transferida, cancelada): NÃO entram no update
 *   - Deduplicação: peso_liquido e peso_bruto → mesmo campo casas_decimais_peso_*
 *   - Tenant isolation: update filtra por tenant_id
 *   - Batch: cursor correto na segunda chamada
 *   - Nenhum update quando não há pedidos
 *   - GET retorna config salva; PUT persiste e retorna auditoria correta
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express, { type Request, type Response, type NextFunction } from 'express'
import { casasDecimaisRouter } from '../../../produto/pedido/server/src/routes/casasDecimais.js'

// ── Helpers ───────────────────────────────────────────────────────────────────

function criarApp(prismaMock: unknown) {
  const app = express()
  app.use(express.json())
  app.use((req, _res, next) => {
    ;(req as any).prisma = prismaMock
    req.headers['x-tenant-id'] = req.headers['x-tenant-id'] || 'tenant-A'
    next()
  })
  app.use('/api/v1/pedidos/configuracoes', casasDecimaisRouter)
  app.use((err: { statusCode?: number; message?: string }, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.statusCode || 500).json({ error: { message: err.message } })
  })
  return app
}

/** Config com todos os 9 campos setados em valores distintos e fáceis de rastrear */
const CONFIG_RASTREAVEL = {
  valor_total_pedido:              1,
  quantidade_total_inicial_pedido: 2,
  quantidade_pronta_pedido_total:  3, // virtual — não vai ao banco
  saldo_itens_do_pedido:           4, // virtual — não vai ao banco
  quantidade_transferida_total:    5, // virtual — não vai ao banco
  quantidade_cancelada_total_pedido: 6, // virtual — não vai ao banco
  peso_liquido_total_pedido:       3,
  peso_bruto_total_pedido:         3, // mesmo campo que peso_liquido no banco
  cubagem_total_pedido:            4,
}

/** Mapeamento esperado: campo config → campo no banco do PEDIDO */
const MAPA_PEDIDO_ESPERADO: Record<string, number> = {
  casas_decimais_valor_pedido:      CONFIG_RASTREAVEL.valor_total_pedido,
  casas_decimais_quantidade_pedido: CONFIG_RASTREAVEL.quantidade_total_inicial_pedido,
  casas_decimais_peso_pedido:       CONFIG_RASTREAVEL.peso_liquido_total_pedido, // peso_bruto deduplica no mesmo campo
  casas_decimais_cubagem_pedido:    CONFIG_RASTREAVEL.cubagem_total_pedido,
}

/** Mapeamento esperado: campo config → campo no banco do ITEM */
const MAPA_ITEM_ESPERADO: Record<string, number> = {
  casas_decimais_valor_item:      CONFIG_RASTREAVEL.valor_total_pedido,
  casas_decimais_quantidade_item: CONFIG_RASTREAVEL.quantidade_total_inicial_pedido,
  casas_decimais_peso_item:       CONFIG_RASTREAVEL.peso_liquido_total_pedido,
  casas_decimais_cubagem_item:    CONFIG_RASTREAVEL.cubagem_total_pedido,
}

// ── Suite: Mapeamento de campos ────────────────────────────────────────────────

describe('Integridade: mapeamento config → banco', () => {
  it('pedido.updateMany recebe exatamente os 4 campos mapeados com os valores corretos', async () => {
    const pedidoUpdateMany = vi.fn().mockResolvedValue({ count: 1 })
    const itemUpdateMany   = vi.fn().mockResolvedValue({ count: 2 })
    const prismaMock = {
      pedidoCasasDecimaisConfig: { upsert: vi.fn().mockResolvedValue({ id: 'cfg-1', tenant_id: 'tenant-A', ...CONFIG_RASTREAVEL }) },
      pedido: {
        count:      vi.fn().mockResolvedValue(1),
        findMany:   vi.fn().mockResolvedValueOnce([{ id: 'ped-1' }]).mockResolvedValue([]),
        updateMany: pedidoUpdateMany,
      },
      pedidoItem: {
        count:      vi.fn().mockResolvedValue(2),
        updateMany: itemUpdateMany,
      },
    }

    const app = criarApp(prismaMock)
    const res = await request(app)
      .put('/api/v1/pedidos/configuracoes/casas-decimais')
      .set('x-tenant-id', 'tenant-A')
      .send({ ...CONFIG_RASTREAVEL, confirmar: true })

    expect(res.status).toBe(200)

    // Aguarda o setImmediate do job de migração terminar
    await new Promise(r => setTimeout(r, 50))

    // Verificar campos do UPDATE no pedido
    expect(pedidoUpdateMany).toHaveBeenCalled()
    const dataUpdatePedido = pedidoUpdateMany.mock.calls[0][0].data
    expect(dataUpdatePedido).toEqual(MAPA_PEDIDO_ESPERADO)

    // Verificar campos do UPDATE no item
    expect(itemUpdateMany).toHaveBeenCalled()
    const dataUpdateItem = itemUpdateMany.mock.calls[0][0].data
    expect(dataUpdateItem).toEqual(MAPA_ITEM_ESPERADO)
  })

  it('campos virtuais (pronta, saldo, transferida, cancelada) NÃO entram no updateMany', async () => {
    const pedidoUpdateMany = vi.fn().mockResolvedValue({ count: 1 })
    const itemUpdateMany   = vi.fn().mockResolvedValue({ count: 1 })
    const prismaMock = {
      pedidoCasasDecimaisConfig: { upsert: vi.fn().mockResolvedValue({ id: 'cfg-1', tenant_id: 'tenant-A', ...CONFIG_RASTREAVEL }) },
      pedido: {
        count:      vi.fn().mockResolvedValue(1),
        findMany:   vi.fn().mockResolvedValueOnce([{ id: 'ped-1' }]).mockResolvedValue([]),
        updateMany: pedidoUpdateMany,
      },
      pedidoItem: {
        count:      vi.fn().mockResolvedValue(1),
        updateMany: itemUpdateMany,
      },
    }

    await request(criarApp(prismaMock))
      .put('/api/v1/pedidos/configuracoes/casas-decimais')
      .set('x-tenant-id', 'tenant-A')
      .send({ ...CONFIG_RASTREAVEL, confirmar: true })

    await new Promise(r => setTimeout(r, 50))

    const dataPedido = pedidoUpdateMany.mock.calls[0][0].data
    const dataItem   = itemUpdateMany.mock.calls[0][0].data

    // Campos virtuais não devem aparecer
    expect(dataPedido).not.toHaveProperty('quantidade_pronta_pedido_total')
    expect(dataPedido).not.toHaveProperty('saldo_itens_do_pedido')
    expect(dataPedido).not.toHaveProperty('quantidade_transferida_total')
    expect(dataPedido).not.toHaveProperty('quantidade_cancelada_total_pedido')

    expect(dataItem).not.toHaveProperty('quantidade_pronta_pedido_total')
    expect(dataItem).not.toHaveProperty('saldo_itens_do_pedido')
    expect(dataItem).not.toHaveProperty('quantidade_transferida_total')
    expect(dataItem).not.toHaveProperty('quantidade_cancelada_total_pedido')
  })

  it('peso_liquido e peso_bruto convergem para o mesmo campo casas_decimais_peso_pedido (último valor vence — ambos iguais)', async () => {
    const pedidoUpdateMany = vi.fn().mockResolvedValue({ count: 1 })
    const configComPesosDiferentes = {
      ...CONFIG_RASTREAVEL,
      peso_liquido_total_pedido: 2,
      peso_bruto_total_pedido:   4, // diferente — o segundo sobrescreve no loop
    }
    const prismaMock = {
      pedidoCasasDecimaisConfig: { upsert: vi.fn().mockResolvedValue({ id: 'cfg-1', tenant_id: 'tenant-A', ...configComPesosDiferentes }) },
      pedido: {
        count:      vi.fn().mockResolvedValue(1),
        findMany:   vi.fn().mockResolvedValueOnce([{ id: 'ped-1' }]).mockResolvedValue([]),
        updateMany: pedidoUpdateMany,
      },
      pedidoItem: { count: vi.fn().mockResolvedValue(0), updateMany: vi.fn().mockResolvedValue({ count: 0 }) },
    }

    await request(criarApp(prismaMock))
      .put('/api/v1/pedidos/configuracoes/casas-decimais')
      .set('x-tenant-id', 'tenant-A')
      .send({ ...configComPesosDiferentes, confirmar: true })

    await new Promise(r => setTimeout(r, 50))

    const data = pedidoUpdateMany.mock.calls[0][0].data
    // O campo existe e tem um dos dois valores (o loop itera sobre as chaves do objeto)
    expect(data).toHaveProperty('casas_decimais_peso_pedido')
    expect([2, 4]).toContain(data.casas_decimais_peso_pedido)
  })
})

// ── Suite: Tenant isolation ────────────────────────────────────────────────────

describe('Integridade: tenant isolation no updateMany', () => {
  it('pedido.updateMany filtra por tenant_id correto — não toca em outros tenants', async () => {
    const pedidoUpdateMany = vi.fn().mockResolvedValue({ count: 1 })
    const prismaMock = {
      pedidoCasasDecimaisConfig: { upsert: vi.fn().mockResolvedValue({ id: 'cfg-1', tenant_id: 'tenant-X', ...CONFIG_RASTREAVEL }) },
      pedido: {
        count:      vi.fn().mockResolvedValue(1),
        findMany:   vi.fn().mockResolvedValueOnce([{ id: 'ped-99' }]).mockResolvedValue([]),
        updateMany: pedidoUpdateMany,
      },
      pedidoItem: { count: vi.fn().mockResolvedValue(0), updateMany: vi.fn().mockResolvedValue({ count: 0 }) },
    }

    await request(criarApp(prismaMock))
      .put('/api/v1/pedidos/configuracoes/casas-decimais')
      .set('x-tenant-id', 'tenant-X')
      .send({ ...CONFIG_RASTREAVEL, confirmar: true })

    await new Promise(r => setTimeout(r, 50))

    const where = pedidoUpdateMany.mock.calls[0][0].where
    expect(where.tenant_id).toBe('tenant-X')
    expect(where.id.in).toEqual(['ped-99'])
  })

  it('pedidoItem.updateMany usa pedido_id:{in} + tenant_id — isolamento garantido', async () => {
    const itemUpdateMany = vi.fn().mockResolvedValue({ count: 3 })
    const prismaMock = {
      pedidoCasasDecimaisConfig: { upsert: vi.fn().mockResolvedValue({ id: 'cfg-1', tenant_id: 'tenant-X', ...CONFIG_RASTREAVEL }) },
      pedido: {
        count:      vi.fn().mockResolvedValue(2),
        findMany:   vi.fn().mockResolvedValueOnce([{ id: 'ped-1' }, { id: 'ped-2' }]).mockResolvedValue([]),
        updateMany: vi.fn().mockResolvedValue({ count: 2 }),
      },
      pedidoItem: { count: vi.fn().mockResolvedValue(3), updateMany: itemUpdateMany },
    }

    await request(criarApp(prismaMock))
      .put('/api/v1/pedidos/configuracoes/casas-decimais')
      .set('x-tenant-id', 'tenant-X')
      .send({ ...CONFIG_RASTREAVEL, confirmar: true })

    await new Promise(r => setTimeout(r, 50))

    const where = itemUpdateMany.mock.calls[0][0].where
    expect(where.tenant_id).toBe('tenant-X')
    expect(where.pedido_id.in).toEqual(['ped-1', 'ped-2'])
  })
})

// ── Suite: Comportamento de batch ─────────────────────────────────────────────

describe('Integridade: job de migração em batches', () => {
  it('processa todos os pedidos em 2 batches e aplica updateMany em cada um', async () => {
    const pedidoUpdateMany = vi.fn().mockResolvedValue({ count: 100 })
    const itemUpdateMany   = vi.fn().mockResolvedValue({ count: 200 })

    let chamada = 0
    const prismaMock = {
      pedidoCasasDecimaisConfig: { upsert: vi.fn().mockResolvedValue({ id: 'cfg-1', tenant_id: 'tenant-A', ...CONFIG_RASTREAVEL }) },
      pedido: {
        count:    vi.fn().mockResolvedValue(120),
        findMany: vi.fn().mockImplementation(async () => {
          chamada++
          if (chamada === 1) return Array.from({ length: 100 }, (_, i) => ({ id: `ped-${i}` }))
          if (chamada === 2) return Array.from({ length: 20 },  (_, i) => ({ id: `ped-extra-${i}` }))
          return []
        }),
        updateMany: pedidoUpdateMany,
      },
      pedidoItem: { count: vi.fn().mockResolvedValue(240), updateMany: itemUpdateMany },
    }

    await request(criarApp(prismaMock))
      .put('/api/v1/pedidos/configuracoes/casas-decimais')
      .set('x-tenant-id', 'tenant-A')
      .send({ ...CONFIG_RASTREAVEL, confirmar: true })

    await new Promise(r => setTimeout(r, 100))

    // 2 batches → 2 chamadas cada
    expect(pedidoUpdateMany).toHaveBeenCalledTimes(2)
    expect(itemUpdateMany).toHaveBeenCalledTimes(2)

    // Segundo batch usa cursor
    const findMany = prismaMock.pedido.findMany
    expect(findMany.mock.calls[0][0]).not.toHaveProperty('cursor')
    expect(findMany.mock.calls[1][0]).toHaveProperty('cursor')
    expect(findMany.mock.calls[1][0].cursor).toEqual({ id: 'ped-99' })

    // Ambos os batches aplicam os mesmos valores de config
    for (const call of pedidoUpdateMany.mock.calls) {
      expect(call[0].data).toEqual(MAPA_PEDIDO_ESPERADO)
    }
    for (const call of itemUpdateMany.mock.calls) {
      expect(call[0].data).toEqual(MAPA_ITEM_ESPERADO)
    }
  })

  it('não chama updateMany quando não há pedidos no tenant', async () => {
    const pedidoUpdateMany = vi.fn()
    const itemUpdateMany   = vi.fn()
    const prismaMock = {
      pedidoCasasDecimaisConfig: { upsert: vi.fn().mockResolvedValue({ id: 'cfg-1', tenant_id: 'tenant-vazio', ...CONFIG_RASTREAVEL }) },
      pedido: {
        count:      vi.fn().mockResolvedValue(0),
        findMany:   vi.fn().mockResolvedValue([]),
        updateMany: pedidoUpdateMany,
      },
      pedidoItem: { count: vi.fn().mockResolvedValue(0), updateMany: itemUpdateMany },
    }

    await request(criarApp(prismaMock))
      .put('/api/v1/pedidos/configuracoes/casas-decimais')
      .set('x-tenant-id', 'tenant-vazio')
      .send({ ...CONFIG_RASTREAVEL, confirmar: true })

    await new Promise(r => setTimeout(r, 50))

    expect(pedidoUpdateMany).not.toHaveBeenCalled()
    expect(itemUpdateMany).not.toHaveBeenCalled()
  })
})

// ── Suite: Consistência dos valores salvos vs retornados ──────────────────────

describe('Integridade: valor salvo = valor retornado', () => {
  it('PUT salva exatamente o payload e GET retorna o mesmo objeto', async () => {
    const CONFIG_SALVA = {
      valor_total_pedido:              3,
      quantidade_total_inicial_pedido: 3,
      quantidade_pronta_pedido_total:  3,
      saldo_itens_do_pedido:           3,
      quantidade_transferida_total:    3,
      quantidade_cancelada_total_pedido: 3,
      peso_liquido_total_pedido:       4,
      peso_bruto_total_pedido:         4,
      cubagem_total_pedido:            4,
    }
    const registroSalvo = { id: 'cfg-abc', tenant_id: 'tenant-A', ...CONFIG_SALVA }

    const prismaMock = {
      pedidoCasasDecimaisConfig: {
        upsert:     vi.fn().mockResolvedValue(registroSalvo),
        findUnique: vi.fn().mockResolvedValue(registroSalvo),
      },
      pedido:      { count: vi.fn().mockResolvedValue(0), findMany: vi.fn().mockResolvedValue([]), updateMany: vi.fn() },
      pedidoItem:  { count: vi.fn().mockResolvedValue(0), updateMany: vi.fn() },
    }

    const app = criarApp(prismaMock)

    // PUT salva
    const resPut = await request(app)
      .put('/api/v1/pedidos/configuracoes/casas-decimais')
      .set('x-tenant-id', 'tenant-A')
      .send(CONFIG_SALVA)
    expect(resPut.status).toBe(200)

    // Verificar que upsert recebeu exatamente os valores do payload
    const upsertCall = (prismaMock.pedidoCasasDecimaisConfig.upsert as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(upsertCall.create).toMatchObject(CONFIG_SALVA)
    expect(upsertCall.update).toMatchObject(CONFIG_SALVA)

    // GET retorna o mesmo registro
    const resGet = await request(app)
      .get('/api/v1/pedidos/configuracoes/casas-decimais')
      .set('x-tenant-id', 'tenant-A')
    expect(resGet.status).toBe(200)
    expect(resGet.body.data).toMatchObject(CONFIG_SALVA)
  })

  it('todos os 9 campos do payload chegam ao banco — nenhum é descartado silenciosamente', async () => {
    const upsert = vi.fn().mockResolvedValue({ id: 'cfg-1', tenant_id: 'tenant-A', ...CONFIG_RASTREAVEL })
    const prismaMock = {
      pedidoCasasDecimaisConfig: { upsert },
      pedido:     { count: vi.fn().mockResolvedValue(0) },
      pedidoItem: { count: vi.fn().mockResolvedValue(0) },
    }

    await request(criarApp(prismaMock))
      .put('/api/v1/pedidos/configuracoes/casas-decimais')
      .set('x-tenant-id', 'tenant-A')
      .send(CONFIG_RASTREAVEL)

    const chamada = upsert.mock.calls[0][0]
    const camposEsperados = [
      'valor_total_pedido',
      'quantidade_total_inicial_pedido',
      'quantidade_pronta_pedido_total',
      'saldo_itens_do_pedido',
      'quantidade_transferida_total',
      'quantidade_cancelada_total_pedido',
      'peso_liquido_total_pedido',
      'peso_bruto_total_pedido',
      'cubagem_total_pedido',
    ]
    for (const campo of camposEsperados) {
      expect(chamada.create).toHaveProperty(campo)
      expect(chamada.update).toHaveProperty(campo)
    }
    // Exatamente 9 campos (sem extras, sem o campo "confirmar")
    expect(Object.keys(chamada.update)).toHaveLength(9)
  })

  it('auditoria reporta totais corretos de pedidos e itens afetados', async () => {
    const prismaMock = {
      pedidoCasasDecimaisConfig: {
        upsert: vi.fn().mockResolvedValue({ id: 'cfg-1', tenant_id: 'tenant-A', ...CONFIG_RASTREAVEL }),
      },
      pedido:     { count: vi.fn().mockResolvedValue(78) },
      pedidoItem: { count: vi.fn().mockResolvedValue(412) },
    }

    const res = await request(criarApp(prismaMock))
      .put('/api/v1/pedidos/configuracoes/casas-decimais')
      .set('x-tenant-id', 'tenant-A')
      .send(CONFIG_RASTREAVEL)

    expect(res.status).toBe(200)
    expect(res.body.auditoria.total_pedidos).toBe(78)
    expect(res.body.auditoria.total_itens).toBe(412)
    expect(res.body.auditoria.migracao_iniciada).toBe(false)
  })

  it('migracao_iniciada=true quando confirmar=true', async () => {
    const prismaMock = {
      pedidoCasasDecimaisConfig: {
        upsert: vi.fn().mockResolvedValue({ id: 'cfg-1', tenant_id: 'tenant-A', ...CONFIG_RASTREAVEL }),
      },
      pedido:     { count: vi.fn().mockResolvedValue(5), findMany: vi.fn().mockResolvedValue([]), updateMany: vi.fn() },
      pedidoItem: { count: vi.fn().mockResolvedValue(10), updateMany: vi.fn() },
    }

    const res = await request(criarApp(prismaMock))
      .put('/api/v1/pedidos/configuracoes/casas-decimais')
      .set('x-tenant-id', 'tenant-A')
      .send({ ...CONFIG_RASTREAVEL, confirmar: true })

    expect(res.status).toBe(200)
    expect(res.body.auditoria.migracao_iniciada).toBe(true)
  })
})

// ── Suite: GET defaults quando não há config ──────────────────────────────────

describe('Integridade: defaults sem config no banco', () => {
  it('retorna defaults corretos (valor=2, quantidade=2, peso=3, cubagem=3) quando não há registro', async () => {
    const prismaMock = {
      pedidoCasasDecimaisConfig: { findUnique: vi.fn().mockResolvedValue(null) },
    }

    const res = await request(criarApp(prismaMock))
      .get('/api/v1/pedidos/configuracoes/casas-decimais')
      .set('x-tenant-id', 'tenant-sem-config')

    expect(res.status).toBe(200)
    const d = res.body.data
    expect(d.valor_total_pedido).toBe(2)
    expect(d.quantidade_total_inicial_pedido).toBe(2)
    expect(d.quantidade_pronta_pedido_total).toBe(2)
    expect(d.saldo_itens_do_pedido).toBe(2)
    expect(d.quantidade_transferida_total).toBe(2)
    expect(d.quantidade_cancelada_total_pedido).toBe(2)
    expect(d.peso_liquido_total_pedido).toBe(3)
    expect(d.peso_bruto_total_pedido).toBe(3)
    expect(d.cubagem_total_pedido).toBe(3)
  })

  it('defaults não têm id (não são registro do banco)', async () => {
    const prismaMock = {
      pedidoCasasDecimaisConfig: { findUnique: vi.fn().mockResolvedValue(null) },
    }

    const res = await request(criarApp(prismaMock))
      .get('/api/v1/pedidos/configuracoes/casas-decimais')
      .set('x-tenant-id', 'tenant-sem-config')

    expect(res.body.data.id).toBeUndefined()
  })
})
