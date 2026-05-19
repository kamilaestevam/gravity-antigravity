// mock-backends.ts — Mock dos backends de produto para teste local da GABI
// Serve endpoints que a GABI espera das tools no catalogo-ferramentas.ts
// Roda na porta 8026 (pedido) e 8025 (configurador) simultaneamente

import express from 'express'

// ── Dados fake ──────────────────────────────────────────────────────────────

const pedidosFake = [
  {
    id_pedido: 'ped_001',
    id_organizacao_pedido: 'org_dev_default',
    numero_pedido: 'PED-2026-001',
    status_pedido: 'em_andamento',
    tipo_pedido: 'importacao',
    importador_pedido: 'Gravity Importadora Ltda',
    exportador_pedido: 'Shanghai Electronics Co.',
    incoterm_pedido: 'FOB',
    moeda_pedido: 'USD',
    valor_total_pedido: 125000.00,
    data_criacao_pedido: '2026-05-10T10:00:00Z',
    data_atualizacao_pedido: '2026-05-17T15:30:00Z',
    itens_pedido: [
      { descricao: 'Componentes eletronicos', ncm: '8542.31.90', quantidade: 5000, valor_unitario: 25.00 },
    ],
  },
  {
    id_pedido: 'ped_002',
    id_organizacao_pedido: 'org_dev_default',
    numero_pedido: 'PED-2026-002',
    status_pedido: 'rascunho',
    tipo_pedido: 'importacao',
    importador_pedido: 'Gravity Importadora Ltda',
    exportador_pedido: 'Tokyo Machinery Inc.',
    incoterm_pedido: 'CIF',
    moeda_pedido: 'USD',
    valor_total_pedido: 89500.00,
    data_criacao_pedido: '2026-05-15T08:00:00Z',
    data_atualizacao_pedido: '2026-05-15T08:00:00Z',
    itens_pedido: [
      { descricao: 'Maquinas industriais', ncm: '8462.10.00', quantidade: 2, valor_unitario: 44750.00 },
    ],
  },
  {
    id_pedido: 'ped_003',
    id_organizacao_pedido: 'org_dev_default',
    numero_pedido: 'PED-2026-003',
    status_pedido: 'finalizado',
    tipo_pedido: 'exportacao',
    importador_pedido: 'Buenos Aires Trading SA',
    exportador_pedido: 'Gravity Exportadora Ltda',
    incoterm_pedido: 'EXW',
    moeda_pedido: 'BRL',
    valor_total_pedido: 320000.00,
    data_criacao_pedido: '2026-04-20T14:00:00Z',
    data_atualizacao_pedido: '2026-05-05T12:00:00Z',
    itens_pedido: [
      { descricao: 'Cafe premium', ncm: '0901.11.10', quantidade: 20000, valor_unitario: 16.00 },
    ],
  },
]

function autenticar(req: express.Request, res: express.Response, next: express.NextFunction): void {
  const key = req.headers['x-internal-key'] ?? req.headers['x-chave-interna-servico']
  if (!key) {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Chave interna ausente' } })
    return
  }
  next()
}

// ── Mock Pedido (porta 8026) ────────────────────────────────────────────────

const pedidoApp = express()
pedidoApp.use(express.json())
pedidoApp.use(autenticar)

// Listar pedidos (com filtro de status opcional)
pedidoApp.get('/api/v1/pedidos', (req, res) => {
  const orgId = req.headers['x-id-organizacao'] as string
  const statusFiltro = req.query.status as string | undefined
  let filtrados = pedidosFake.filter((p) => p.id_organizacao_pedido === orgId)
  if (statusFiltro) {
    filtrados = filtrados.filter((p) => p.status_pedido === statusFiltro)
  }
  res.json({
    pedidos: filtrados,
    total: filtrados.length,
    pagina: 1,
    por_pagina: 20,
  })
})

// KPIs
pedidoApp.get('/api/v1/pedidos/dashboard/kpis', (req, res) => {
  const orgId = req.headers['x-id-organizacao'] as string
  const filtrados = pedidosFake.filter((p) => p.id_organizacao_pedido === orgId)
  res.json({
    total_pedidos: filtrados.length,
    pedidos_em_andamento: filtrados.filter((p) => p.status_pedido === 'em_andamento').length,
    pedidos_rascunho: filtrados.filter((p) => p.status_pedido === 'rascunho').length,
    pedidos_finalizados: filtrados.filter((p) => p.status_pedido === 'finalizado').length,
    valor_total_usd: filtrados.reduce((s, p) => s + (p.moeda_pedido === 'USD' ? p.valor_total_pedido : 0), 0),
    valor_total_brl: filtrados.reduce((s, p) => s + (p.moeda_pedido === 'BRL' ? p.valor_total_pedido : 0), 0),
  })
})

// Detalhar pedido (busca por id_pedido OU numero_pedido)
pedidoApp.get('/api/v1/pedidos/:id', (req, res) => {
  const orgId = req.headers['x-id-organizacao'] as string
  const busca = req.params.id
  const pedido = pedidosFake.find(
    (p) => p.id_organizacao_pedido === orgId && (p.id_pedido === busca || p.numero_pedido === busca),
  )
  if (!pedido) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Pedido nao encontrado' } })
    return
  }
  res.json({ pedido })
})

// Tendencias
pedidoApp.get('/api/v1/pedidos/dashboard/tendencias', (req, res) => {
  res.json({
    tendencias: [
      { mes: '2026-03', total_pedidos: 5, valor_total_usd: 450000 },
      { mes: '2026-04', total_pedidos: 8, valor_total_usd: 720000 },
      { mes: '2026-05', total_pedidos: 3, valor_total_usd: 214500 },
    ],
  })
})

// Criar pedido (WRITE)
pedidoApp.post('/api/v1/pedidos', (req, res) => {
  const orgId = req.headers['x-id-organizacao'] as string
  const novoPedido = {
    id_pedido: `ped_${Date.now()}`,
    id_organizacao_pedido: orgId,
    numero_pedido: `PED-2026-${String(pedidosFake.length + 1).padStart(3, '0')}`,
    status_pedido: 'rascunho',
    tipo_pedido: req.body.tipo_pedido ?? 'importacao',
    importador_pedido: req.body.importador ?? 'Gravity Importadora Ltda',
    exportador_pedido: req.body.exportador ?? 'Fornecedor Teste',
    incoterm_pedido: req.body.incoterm ?? 'FOB',
    moeda_pedido: req.body.moeda ?? 'USD',
    valor_total_pedido: 0,
    data_criacao_pedido: new Date().toISOString(),
    data_atualizacao_pedido: new Date().toISOString(),
    itens_pedido: [],
  }
  pedidosFake.push(novoPedido)
  res.status(201).json({ pedido: novoPedido })
})

// Editar pedido (WRITE)
pedidoApp.put('/api/v1/pedidos/:id', (req, res) => {
  const orgId = req.headers['x-id-organizacao'] as string
  const idx = pedidosFake.findIndex((p) => p.id_pedido === req.params.id && p.id_organizacao_pedido === orgId)
  if (idx === -1) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Pedido nao encontrado' } })
    return
  }
  Object.assign(pedidosFake[idx], req.body, { data_atualizacao_pedido: new Date().toISOString() })
  res.json({ pedido: pedidosFake[idx] })
})

// Excluir pedido (WRITE_DESTRUTIVA)
pedidoApp.delete('/api/v1/pedidos/:id', (req, res) => {
  const orgId = req.headers['x-id-organizacao'] as string
  const idx = pedidosFake.findIndex((p) => p.id_pedido === req.params.id && p.id_organizacao_pedido === orgId)
  if (idx === -1) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Pedido nao encontrado' } })
    return
  }
  pedidosFake.splice(idx, 1)
  res.json({ sucesso: true, mensagem: 'Pedido excluido' })
})

pedidoApp.get('/health', (_req, res) => res.json({ status: 'ok', service: 'pedido-mock' }))

// ── Mock Configurador (porta 8025) ──────────────────────────────────────────

const configApp = express()
configApp.use(express.json())
configApp.use(autenticar)

configApp.get('/api/v1/organizacao', (req, res) => {
  const orgId = req.headers['x-id-organizacao'] as string
  res.json({
    organizacao: {
      id_organizacao: orgId,
      nome_organizacao: 'Gravity Dev Org',
      subdominio_organizacao: 'gravity-dev',
      tipo_organizacao: 'IMPORTADORA',
      cnpj_organizacao: '12.345.678/0001-90',
      email_contato_organizacao: 'contato@gravity.dev',
      plano_organizacao: 'pro',
      ativo_organizacao: true,
      data_criacao_organizacao: '2026-01-01T00:00:00Z',
    },
  })
})

configApp.get('/api/v1/usuarios', (req, res) => {
  const orgId = req.headers['x-id-organizacao'] as string
  res.json({
    usuarios: [
      {
        id_usuario: 'user_dev_default',
        id_organizacao_usuario: orgId,
        nome_usuario: 'Usuario Dev',
        email_usuario: 'dev@gravity.dev',
        tipo_usuario: 'SUPER_ADMIN',
        ativo_usuario: true,
      },
      {
        id_usuario: 'user_fornecedor',
        id_organizacao_usuario: orgId,
        nome_usuario: 'Fornecedor Teste',
        email_usuario: 'fornecedor@teste.com',
        tipo_usuario: 'FORNECEDOR',
        ativo_usuario: true,
      },
    ],
    total: 2,
  })
})

configApp.get('/health', (_req, res) => res.json({ status: 'ok', service: 'configurador-mock' }))

// ── Start ──────────────────────────────────────────────────────────────────

pedidoApp.listen(8026, () => {
  console.log('[MOCK] Pedido mock rodando na porta 8026')
})

configApp.listen(8025, () => {
  console.log('[MOCK] Configurador mock rodando na porta 8025')
})
