/**
 * seed.ts — Seed parametrizado do produto Pedido
 *
 * Uso:
 *   TENANT_ID=tenant-dev-gravity-2026 npx tsx prisma/seed.ts --total=500
 *   TENANT_ID=tenant-dev-gravity-2026 npx tsx prisma/seed.ts --total=1000 --clean
 *   TENANT_ID=tenant-dev-gravity-2026 npx tsx prisma/seed.ts --total=10000 --clean
 *
 * Flags:
 *   --total=N   → quantidade total de pedidos (default 1000)
 *   --clean     → apaga TODOS os pedidos/itens do tenant antes de inserir
 *
 * Distribuição automática:
 *   60% pequenos (1-3 itens,  valor 1k-50k)
 *   30% médios   (4-15 itens, valor 50k-500k)
 *   10% grandes  (16-50 itens, valor 500k-5M)
 *
 * IMPORTANTE: todos os campos com valores restritos respeitam
 * estritamente o dicionário do sistema (enums, selects, regex NCM).
 * Dados inventados — formatos reais.
 */

/**
 * ⚠️  FÓRMULA CANÔNICA DE SALDO DO ITEM
 * ─────────────────────────────────────
 * saldo_item_pedido = quantidade_inicial_item_pedido
 *                    − quantidade_cancelada_item_pedido
 *                    − quantidade_transferida_item_pedido
 *
 * ATENÇÃO: quantidade_pronta NÃO entra no saldo. Pronta é independente.
 *
 * Fonte de verdade: saldoEngine.ts em
 * servicos-global/tenant/processos-core/src/services/saldoEngine.ts
 *
 * NUNCA mude essa fórmula sem alinhar com saldoEngine + PedidoSaldoFormulaConfig.
 * Se mudar, atualize também: testes/testes-unitarios/pedido/seed.test.ts
 */

import { PrismaClient } from '@prisma/client'
import { createHash } from 'node:crypto'

const prisma = new PrismaClient()

/** Hash determinístico de 6 chars hex para o tenant_id — usado nos IDs
 *  dos pedidos para evitar colisão entre tenants no @id global do Prisma. */
function hashTenant(tenantId: string): string {
  return createHash('md5').update(tenantId).digest('hex').slice(0, 6)
}

// ─── Dicionários (valores reais do sistema) ──────────────────────────────────

const TIPO_OPERACAO = ['importacao', 'exportacao'] as const

const STATUS_DIST = [
  { valor: 'aberto',        peso: 30 },
  { valor: 'em_andamento',  peso: 25 },
  { valor: 'aprovado',      peso: 20 },
  { valor: 'draft',         peso: 10 },
  { valor: 'transferencia', peso: 7 },
  { valor: 'consolidado',   peso: 5 },
  { valor: 'cancelado',     peso: 3 },
] as const

const INCOTERMS = ['FOB', 'CIF', 'EXW', 'CFR', 'FCA', 'DDP', 'DAP', 'CPT', 'CIP', 'DPU', 'FAS'] as const

const MOEDAS = ['USD', 'EUR', 'CNY', 'JPY', 'GBP', 'BRL'] as const

const UNIDADES = ['UNID', 'KG', 'TON', 'M', 'M2', 'M3', 'LT', 'PARES', 'DUZIA', 'JOGO'] as const

const COBERTURA_CAMBIAL = ['com_cobertura', 'sem_cobertura'] as const

const CONDICOES_PAGAMENTO = [
  '30% antecipado, 70% contra BL',
  '50% antecipado, 50% contra BL',
  '100% antecipado',
  'Carta de Crédito à vista',
  'Carta de Crédito 30 dias',
  '30/60/90 dias',
  'Contra entrega',
] as const

const MODAIS = [
  'Maritimo FCL 20Dry',
  'Maritimo FCL 40HC',
  'Maritimo FCL 40Dry',
  'Maritimo LCL',
  'Aereo',
  'Rodoviario',
] as const

const PORTOS_ORIGEM = [
  'Shanghai (CNSHA)',
  'Shenzhen (CNSZX)',
  'Hamburg (DEHAM)',
  'Rotterdam (NLRTM)',
  'Busan (KRPUS)',
  'Yokohama (JPYOK)',
  'Los Angeles (USLAX)',
  'Hong Kong (HKHKG)',
  'Singapore (SGSIN)',
  'Antwerp (BEANR)',
] as const

const PORTOS_DESTINO = [
  'Santos (BRSSZ)',
  'Paranaguá (BRPNG)',
  'Rio de Janeiro (BRRJO)',
  'Vitoria (BRVIX)',
  'Itajaí (BRITJ)',
  'Rio Grande (BRRIG)',
  'Suape (BRSUA)',
  'Pecém (BRPEC)',
] as const

// NCMs reais (formato 8 dígitos com separadores) — amostra representativa
const NCMS = [
  '8542.31.90', '8471.30.12', '8517.12.31', '8528.72.00', '8544.42.00',
  '3926.90.90', '7326.90.90', '8481.80.95', '8483.40.10', '8708.29.99',
  '6302.60.00', '6109.10.00', '6204.62.00', '6403.99.90', '4202.22.20',
  '2710.19.21', '3901.10.10', '2915.70.10', '3208.90.19', '4016.93.00',
  '7318.15.00', '8504.40.90', '9018.90.99', '3004.90.99', '2208.60.00',
] as const

const EXPORTADORES = [
  { id: 'exp-china-shenzhen-001', nome: 'Shenzhen Electronics Co., Ltd.' },
  { id: 'exp-china-ningbo-001',   nome: 'Ningbo Hardware Supplies Ltd.' },
  { id: 'exp-china-guangzhou-01', nome: 'Guangzhou Plastics Factory' },
  { id: 'exp-taiwan-tsmc-001',    nome: 'Taiwan Semiconductor Supply' },
  { id: 'exp-japao-toyota-001',   nome: 'Toyota Motor Corporation' },
  { id: 'exp-korea-samsung-001',  nome: 'Samsung Electronics Korea' },
  { id: 'exp-alemanha-bosch-001', nome: 'Robert Bosch GmbH' },
  { id: 'exp-italia-pirelli-001', nome: 'Pirelli Tyre S.p.A.' },
  { id: 'exp-india-tata-001',     nome: 'Tata Industries Ltd.' },
  { id: 'exp-vietna-samsung-001', nome: 'Samsung Vietnam Co.' },
] as const

const IMPORTADORES = [
  { id: 'imp-chile-001',   nome: 'Importadora Chile Ltda.' },
  { id: 'imp-argentina-01', nome: 'Argentina Importadora S.A.' },
  { id: 'imp-mexico-001',  nome: 'Distribuidora México S.A. de C.V.' },
  { id: 'imp-paraguay-01', nome: 'Paraguay Trading Co.' },
  { id: 'imp-uruguay-001', nome: 'Uruguay Imports Ltda.' },
] as const

const FABRICANTES = [
  { id: 'fab-foxconn-001',    nome: 'Foxconn Technology Group' },
  { id: 'fab-celestica-001',  nome: 'Celestica Inc.' },
  { id: 'fab-flextronics-01', nome: 'Flex Ltd. (Flextronics)' },
  { id: 'fab-jabil-001',      nome: 'Jabil Circuit Inc.' },
  { id: 'fab-pegatron-001',   nome: 'Pegatron Corporation' },
] as const

const DESCRICOES_ITEM = [
  'Componente eletrônico SMD',
  'Placa de circuito impresso',
  'Cabo flat 20 vias',
  'Conector USB tipo C',
  'Display LCD 7 polegadas',
  'Bateria Li-Ion 3000mAh',
  'Sensor de temperatura',
  'Motor DC 12V',
  'Válvula solenoide',
  'Resistor 10k 1/4W',
  'Capacitor eletrolítico 1000uF',
  'Transformador 220/12V',
  'Rolamento esférico 6205',
  'Parafuso M6 sextavado',
  'Mangueira hidráulica 1/2"',
  'Junta de vedação em borracha',
  'Filtro de óleo industrial',
  'Chapa de aço carbono 2mm',
  'Perfil alumínio anodizado',
  'Tecido sintético poliéster',
] as const

// ─── Helpers de randomização ─────────────────────────────────────────────────

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickWeighted<T extends { valor: string; peso: number }>(arr: readonly T[]): string {
  const total = arr.reduce((s, x) => s + x.peso, 0)
  let r = Math.random() * total
  for (const x of arr) {
    r -= x.peso
    if (r <= 0) return x.valor
  }
  return arr[0].valor
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randFloat(min: number, max: number, decimals = 2): number {
  const v = Math.random() * (max - min) + min
  return Number(v.toFixed(decimals))
}

function randDate(daysAgo: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - randInt(0, daysAgo))
  return d
}

// ─── Perfis de tamanho ───────────────────────────────────────────────────────

export type Perfil = {
  nome: 'pequeno' | 'medio' | 'grande'
  minItens: number
  maxItens: number
  valorMinItem: number
  valorMaxItem: number
}

export const PERFIS: Record<'pequeno' | 'medio' | 'grande', Perfil> = {
  pequeno: { nome: 'pequeno', minItens: 1,  maxItens: 3,  valorMinItem: 200,    valorMaxItem: 20_000 },
  medio:   { nome: 'medio',   minItens: 4,  maxItens: 15, valorMinItem: 500,    valorMaxItem: 50_000 },
  grande:  { nome: 'grande',  minItens: 16, maxItens: 50, valorMinItem: 1_000,  valorMaxItem: 200_000 },
}

// ─── Geração ─────────────────────────────────────────────────────────────────

export function gerarPedido(opts: {
  tenantId: string
  perfil: Perfil
  index: number
  ano: number
}) {
  const { tenantId, perfil, index, ano } = opts
  const tipo = pick(TIPO_OPERACAO)
  const prefix = tipo === 'importacao' ? 'PO' : 'SO'
  const numeroPedido = `${prefix}-${ano}-${String(index).padStart(5, '0')}`
  // Inclui hash md5(6) do tenant no id para evitar colisões entre tenants
  // (o @id do model é UNIQUE global, não composto).
  const tenantHash = hashTenant(tenantId)
  const id = `pedi_${perfil.nome.slice(0, 3)}_${tenantHash}_${String(index).padStart(7, '0')}`

  const moeda = pick(MOEDAS)
  const moedaCambio = 'BRL'
  const taxaCambio = moeda === 'BRL' ? 1 : randFloat(4.5, 6.5, 4)
  const incoterm = pick(INCOTERMS)
  const unidade = pick(UNIDADES)

  const qtdItens = randInt(perfil.minItens, perfil.maxItens)
  const exportador = pick(EXPORTADORES)
  const importador = pick(IMPORTADORES)
  const fabricante = pick(FABRICANTES)

  // Gera itens
  const itens = Array.from({ length: qtdItens }, (_, i) => {
    const quantidade = randFloat(10, 5000, 2)
    const valorUnit = randFloat(perfil.valorMinItem / quantidade, perfil.valorMaxItem / quantidade, 4)
    const valorTotal = Number((quantidade * valorUnit).toFixed(2))
    const prontaPct = Math.random()
    const canceladaPct = Math.random() * 0.1
    const transferidaPct = Math.random() * 0.1
    const pronta = Number((quantidade * prontaPct).toFixed(2))
    const cancelada = Number((quantidade * canceladaPct).toFixed(2))
    const transferida = Number((quantidade * transferidaPct).toFixed(2))
    const saldo = Number(Math.max(0, quantidade - cancelada - transferida).toFixed(2))

    return {
      id_pedido_item: `item_${id}_${String(i + 1).padStart(3, '0')}`,
      id_organizacao: tenantId,
      id_workspace: tenantId,
      id_pedido: id,
      sequencia_item_pedido_item: i + 1,
      part_number_pedido_item: `PN-${randInt(10000, 99999)}-${randInt(100, 999)}`,
      ncm_pedido_item: pick(NCMS),
      descricao_item_pedido_item: pick(DESCRICOES_ITEM),
      unidade_comercializada_item_pedido_item: unidade,
      quantidade_inicial_pedido_pedido_item: quantidade,
      quantidade_atual_pedido_pedido_item: saldo,
      quantidade_pronta_pedido_pedido_item: pronta,
      quantidade_transferida_pedido_pedido_item: transferida,
      quantidade_cancelada_pedido_pedido_item: cancelada,
      casas_decimais_quantidade_item_pedido_item: 2,
      moeda_item_pedido_item: moeda,
      valor_total_item_pedido_item: valorTotal,
      valor_por_unidade_item_pedido_item: valorUnit,
      casas_decimais_valor_item_pedido_item: 2,
      cobertura_cambial_pedido_item: pick(COBERTURA_CAMBIAL),
      peso_liquido_unitario_pedido_item: randFloat(0.1, 50, 3),
      peso_bruto_unitario_pedido_item: randFloat(0.1, 60, 3),
      cubagem_unitaria_pedido_item: randFloat(0.001, 0.5, 4),
      casas_decimais_peso_item_pedido_item: 3,
      casas_decimais_cubagem_item_pedido_item: 4,
      nome_exportador_pedido_item: tipo === 'importacao' ? exportador.nome : null,
      nome_importador_pedido_item: tipo === 'exportacao' ? importador.nome : null,
      nome_fabricante_pedido_item: fabricante.nome,
      referencia_exportador_pedido_item: `REF-EXP-${randInt(1000, 9999)}`,
      referencia_importador_pedido_item: `REF-IMP-${randInt(1000, 9999)}`,
      referencia_fabricante_pedido_item: `REF-FAB-${randInt(1000, 9999)}`,
      incoterm_pedido_item: incoterm,
      condicao_pagamento_pedido_pedido_item: pick(CONDICOES_PAGAMENTO),
      data_emissao_pedido_pedido_item: randDate(730),
      data_criacao_pedido_item: new Date(),
      data_atualizacao_pedido_item: new Date(),
    }
  })

  const valorTotalPedido = Number(itens.reduce((s, it) => s + Number(it.valor_total_item_pedido_item ?? 0), 0).toFixed(2))
  const qtdTotal = Number(itens.reduce((s, it) => s + Number(it.quantidade_inicial_pedido_pedido_item), 0).toFixed(2))
  const pesoLiq = Number(itens.reduce((s, it) => s + Number(it.peso_liquido_unitario_pedido_item ?? 0) * Number(it.quantidade_inicial_pedido_pedido_item), 0).toFixed(3))
  const pesoBruto = Number(itens.reduce((s, it) => s + Number(it.peso_bruto_unitario_pedido_item ?? 0) * Number(it.quantidade_inicial_pedido_pedido_item), 0).toFixed(3))
  const cubagem = Number(itens.reduce((s, it) => s + Number(it.cubagem_unitaria_pedido_item ?? 0) * Number(it.quantidade_inicial_pedido_pedido_item), 0).toFixed(4))

  const pedido = {
    id,
    tenant_id: tenantId,
    company_id: tenantId,
    tipo_operacao: tipo,
    numero_pedido: numeroPedido,
    status: pickWeighted(STATUS_DIST),
    importacao_exportador_id: tipo === 'importacao' ? exportador.id : null,
    exportacao_importador_id: tipo === 'exportacao' ? importador.id : null,
    fabricante_id: fabricante.id,
    incoterm,
    moeda_pedido: moeda,
    valor_total_pedido: valorTotalPedido,
    casas_decimais_valor_pedido: 2,
    quantidade_total_inicial_pedido: qtdTotal,
    casas_decimais_quantidade_pedido: 2,
    unidade_comercializada_pedido: unidade,
    condicao_pagamento_pedido: pick(CONDICOES_PAGAMENTO),
    numero_proforma: `PI-${ano}-${String(index).padStart(5, '0')}`,
    numero_invoice: `CI-${ano}-${String(index).padStart(5, '0')}`,
    referencia_importador: `REF-IMP-${randInt(1000, 9999)}`,
    referencia_exportador: `REF-EXP-${randInt(1000, 9999)}`,
    referencia_fabricante: `REF-FAB-${randInt(1000, 9999)}`,
    valor_total_cambio_pedido: Number((valorTotalPedido * taxaCambio).toFixed(2)),
    moeda_cambio_pedido: moedaCambio,
    taxa_cambio_estimada_pedido: taxaCambio,
    data_emissao_pedido: randDate(730),
    detalhes_operacionais: {
      modal: pick(MODAIS),
      porto_origem: pick(PORTOS_ORIGEM),
      porto_destino: pick(PORTOS_DESTINO),
      transit_time: randInt(15, 45),
      nome_exportador: tipo === 'importacao' ? exportador.nome : null,
      nome_importador: tipo === 'exportacao' ? importador.nome : null,
      nome_fabricante: fabricante.nome,
    },
    peso_liquido_total_pedido: pesoLiq,
    peso_bruto_total_pedido: pesoBruto,
    cubagem_total_pedido: cubagem,
    casas_decimais_peso_pedido: 3,
    casas_decimais_cubagem_pedido: 4,
    pedido_criado_em: new Date(),
    pedido_atualizado_em: new Date(),
  }

  return { pedido, itens }
}

// ─── Cenários Edge ───────────────────────────────────────────────────────────

type PedidoShape = ReturnType<typeof gerarPedido>['pedido']
type ItemShape   = ReturnType<typeof gerarPedido>['itens'][number]

async function gerarCenariosEdge(
  tenantId: string,
  offsetBase: number,
): Promise<{ pedidosCreated: number; itensCreated: number }> {
  const ano = new Date().getFullYear()
  const pedidos: PedidoShape[] = []
  const itens: ItemShape[] = []
  let seq = 0

  type EdgeCfg = {
    label: string
    statusPedido: string
    qtdItens: number
    mkItem: (qtd: number, unit: number) => {
      quantidade: number
      valorUnit: number
      pronta: number
      cancelada: number
      transferida: number
    }
    qtdRange: [number, number]
    unitRange: [number, number]
  }

  const cenarios: EdgeCfg[] = [
    {
      label: 'transferido',
      statusPedido: 'consolidado',
      qtdItens: 3,
      qtdRange: [100, 1000],
      unitRange: [10, 500],
      mkItem: (q, u) => ({ quantidade: q, valorUnit: u, pronta: 0, cancelada: 0, transferida: q }),
    },
    {
      label: 'cancelado',
      statusPedido: 'cancelado',
      qtdItens: 3,
      qtdRange: [100, 1000],
      unitRange: [10, 500],
      mkItem: (q, u) => ({ quantidade: q, valorUnit: u, pronta: 0, cancelada: q, transferida: 0 }),
    },
    {
      label: 'draft',
      statusPedido: 'draft',
      qtdItens: 1,
      qtdRange: [10, 50],
      unitRange: [10, 50],
      mkItem: (q, u) => ({ quantidade: q, valorUnit: u, pronta: 0, cancelada: 0, transferida: 0 }),
    },
    {
      label: 'virgem',
      statusPedido: 'aberto',
      qtdItens: 3,
      qtdRange: [100, 1000],
      unitRange: [10, 500],
      mkItem: (q, u) => ({ quantidade: q, valorUnit: u, pronta: 0, cancelada: 0, transferida: 0 }),
    },
    {
      label: 'unit_alto',
      statusPedido: 'aberto',
      qtdItens: 1,
      qtdRange: [1, 20],
      unitRange: [10_001, 50_000],
      mkItem: (q, u) => ({ quantidade: q, valorUnit: u, pronta: 0, cancelada: 0, transferida: 0 }),
    },
    {
      label: 'unit_baixo',
      statusPedido: 'aberto',
      qtdItens: 1,
      qtdRange: [500, 5000],
      unitRange: [0.5, 9.99],
      mkItem: (q, u) => ({ quantidade: q, valorUnit: u, pronta: 0, cancelada: 0, transferida: 0 }),
    },
  ]

  for (const cfg of cenarios) {
    for (let i = 0; i < 5; i++) {
      seq++
      const tipo = pick(TIPO_OPERACAO)
      const prefix = tipo === 'importacao' ? 'PO' : 'SO'
      const tenantHash = hashTenant(tenantId)
      const id = `pedi_edg_${tenantHash}_${cfg.label.slice(0, 6)}_${String(seq).padStart(4, '0')}`
      const numeroPedido = `${prefix}-${ano}-EDG${String(offsetBase + seq).padStart(5, '0')}`

      const moeda = pick(MOEDAS)
      const moedaCambio = 'BRL'
      const taxaCambio = moeda === 'BRL' ? 1 : randFloat(4.5, 6.5, 4)
      const incoterm = pick(INCOTERMS)
      const unidade = pick(UNIDADES)
      const exportador = pick(EXPORTADORES)
      const importador = pick(IMPORTADORES)
      const fabricante = pick(FABRICANTES)

      const itensPedido: ItemShape[] = []
      for (let k = 0; k < cfg.qtdItens; k++) {
        const qtd = randFloat(cfg.qtdRange[0], cfg.qtdRange[1], 2)
        const unit = randFloat(cfg.unitRange[0], cfg.unitRange[1], 4)
        const v = cfg.mkItem(qtd, unit)
        const valorTotal = Number((v.quantidade * v.valorUnit).toFixed(2))
        const saldo = Number(Math.max(0, v.quantidade - v.cancelada - v.transferida).toFixed(2))

        itensPedido.push({
          id_pedido_item: `item_${id}_${String(k + 1).padStart(3, '0')}`,
          id_organizacao: tenantId,
          id_workspace: tenantId,
          id_pedido: id,
          sequencia_item_pedido_item: k + 1,
          part_number_pedido_item: `PN-${randInt(10000, 99999)}-${randInt(100, 999)}`,
          ncm_pedido_item: pick(NCMS),
          descricao_item_pedido_item: pick(DESCRICOES_ITEM),
          unidade_comercializada_item_pedido_item: unidade,
          quantidade_inicial_pedido_pedido_item: v.quantidade,
          quantidade_atual_pedido_pedido_item: saldo,
          quantidade_pronta_pedido_pedido_item: v.pronta,
          quantidade_transferida_pedido_pedido_item: v.transferida,
          quantidade_cancelada_pedido_pedido_item: v.cancelada,
          casas_decimais_quantidade_item_pedido_item: 2,
          moeda_item_pedido_item: moeda,
          valor_total_item_pedido_item: valorTotal,
          valor_por_unidade_item_pedido_item: v.valorUnit,
          casas_decimais_valor_item_pedido_item: 2,
          cobertura_cambial_pedido_item: pick(COBERTURA_CAMBIAL),
          peso_liquido_unitario_pedido_item: randFloat(0.1, 50, 3),
          peso_bruto_unitario_pedido_item: randFloat(0.1, 60, 3),
          cubagem_unitaria_pedido_item: randFloat(0.001, 0.5, 4),
          casas_decimais_peso_item_pedido_item: 3,
          casas_decimais_cubagem_item_pedido_item: 4,
          nome_exportador_pedido_item: tipo === 'importacao' ? exportador.nome : null,
          nome_importador_pedido_item: tipo === 'exportacao' ? importador.nome : null,
          nome_fabricante_pedido_item: fabricante.nome,
          referencia_exportador_pedido_item: `REF-EXP-${randInt(1000, 9999)}`,
          referencia_importador_pedido_item: `REF-IMP-${randInt(1000, 9999)}`,
          referencia_fabricante_pedido_item: `REF-FAB-${randInt(1000, 9999)}`,
          incoterm_pedido_item: incoterm,
          condicao_pagamento_pedido_pedido_item: pick(CONDICOES_PAGAMENTO),
          data_emissao_pedido_pedido_item: randDate(730),
          data_criacao_pedido_item: new Date(),
          data_atualizacao_pedido_item: new Date(),
        })
      }

      const valorTotalPedido = Number(itensPedido.reduce((s, it) => s + Number(it.valor_total_item_pedido_item ?? 0), 0).toFixed(2))
      const qtdTotal = Number(itensPedido.reduce((s, it) => s + Number(it.quantidade_inicial_pedido_pedido_item), 0).toFixed(2))
      const pesoLiq = Number(itensPedido.reduce((s, it) => s + Number(it.peso_liquido_unitario_pedido_item ?? 0) * Number(it.quantidade_inicial_pedido_pedido_item), 0).toFixed(3))
      const pesoBruto = Number(itensPedido.reduce((s, it) => s + Number(it.peso_bruto_unitario_pedido_item ?? 0) * Number(it.quantidade_inicial_pedido_pedido_item), 0).toFixed(3))
      const cubagem = Number(itensPedido.reduce((s, it) => s + Number(it.cubagem_unitaria_pedido_item ?? 0) * Number(it.quantidade_inicial_pedido_pedido_item), 0).toFixed(4))

      const pedido: PedidoShape = {
        id,
        tenant_id: tenantId,
        company_id: tenantId,
        tipo_operacao: tipo,
        numero_pedido: numeroPedido,
        status: cfg.statusPedido,
        importacao_exportador_id: tipo === 'importacao' ? exportador.id : null,
        exportacao_importador_id: tipo === 'exportacao' ? importador.id : null,
        fabricante_id: fabricante.id,
        incoterm,
        moeda_pedido: moeda,
        valor_total_pedido: valorTotalPedido,
        casas_decimais_valor_pedido: 2,
        quantidade_total_inicial_pedido: qtdTotal,
        casas_decimais_quantidade_pedido: 2,
        unidade_comercializada_pedido: unidade,
        condicao_pagamento_pedido: pick(CONDICOES_PAGAMENTO),
        numero_proforma: `PI-${ano}-EDG${String(offsetBase + seq).padStart(5, '0')}`,
        numero_invoice: `CI-${ano}-EDG${String(offsetBase + seq).padStart(5, '0')}`,
        referencia_importador: `REF-IMP-${randInt(1000, 9999)}`,
        referencia_exportador: `REF-EXP-${randInt(1000, 9999)}`,
        referencia_fabricante: `REF-FAB-${randInt(1000, 9999)}`,
        valor_total_cambio_pedido: Number((valorTotalPedido * taxaCambio).toFixed(2)),
        moeda_cambio_pedido: moedaCambio,
        taxa_cambio_estimada_pedido: taxaCambio,
        data_emissao_pedido: randDate(730),
        detalhes_operacionais: {
          modal: pick(MODAIS),
          porto_origem: pick(PORTOS_ORIGEM),
          porto_destino: pick(PORTOS_DESTINO),
          transit_time: randInt(15, 45),
          nome_exportador: tipo === 'importacao' ? exportador.nome : null,
          nome_importador: tipo === 'exportacao' ? importador.nome : null,
          nome_fabricante: fabricante.nome,
        },
        peso_liquido_total_pedido: pesoLiq,
        peso_bruto_total_pedido: pesoBruto,
        cubagem_total_pedido: cubagem,
        casas_decimais_peso_pedido: 3,
        casas_decimais_cubagem_pedido: 4,
        pedido_criado_em: new Date(),
        pedido_atualizado_em: new Date(),
      }

      pedidos.push(pedido)
      itens.push(...itensPedido)
    }
  }

  await prisma.pedido.createMany({ data: pedidos as any, skipDuplicates: true })
  await prisma.pedidoItem.createMany({ data: itens as any, skipDuplicates: true })

  return { pedidosCreated: pedidos.length, itensCreated: itens.length }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2)
  const totalArg = args.find(a => a.startsWith('--total='))
  const total = totalArg ? parseInt(totalArg.split('=')[1], 10) : 1000
  const clean = args.includes('--clean')

  const tenantId = process.env.TENANT_ID
  if (!tenantId) {
    console.error('❌ TENANT_ID é obrigatório. Ex: TENANT_ID=tenant-dev-gravity-2026 npx tsx prisma/seed.ts --total=1000')
    process.exit(1)
  }

  if (!Number.isFinite(total) || total <= 0) {
    console.error('❌ --total inválido:', totalArg)
    process.exit(1)
  }

  // Idempotência — não duplica dados se já existem e não é --clean
  if (!clean) {
    const existentes = await prisma.pedido.count({ where: { tenant_id: tenantId } })
    if (existentes > 0) {
      console.error(`❌ Tenant "${tenantId}" já possui ${existentes} pedidos.`)
      console.error(`   Use --clean para apagar antes de regenerar, ou rode em outro tenant.`)
      process.exit(1)
    }
  }

  console.log(`\n🌱 Seed Pedido — tenant: ${tenantId} | total: ${total.toLocaleString('pt-BR')} | clean: ${clean}\n`)

  if (clean) {
    console.log('🧹 Limpando dados existentes do tenant...')
    const delItens = await prisma.$executeRaw`DELETE FROM pedido.pedido_itens WHERE id_organizacao = ${tenantId}`
    const delPedidos = await prisma.$executeRaw`DELETE FROM pedido.pedidos_comerciais WHERE tenant_id = ${tenantId}`
    console.log(`   → ${delItens} itens e ${delPedidos} pedidos removidos\n`)
  }

  // Distribuição: 60/30/10
  const qtdPequenos = Math.round(total * 0.6)
  const qtdMedios = Math.round(total * 0.3)
  const qtdGrandes = total - qtdPequenos - qtdMedios

  console.log(`📊 Distribuição:`)
  console.log(`   Pequenos: ${qtdPequenos.toLocaleString('pt-BR')} (1-3 itens)`)
  console.log(`   Médios:   ${qtdMedios.toLocaleString('pt-BR')} (4-15 itens)`)
  console.log(`   Grandes:  ${qtdGrandes.toLocaleString('pt-BR')} (16-50 itens)\n`)

  const plano: Array<{ perfil: Perfil; count: number }> = [
    { perfil: PERFIS.pequeno, count: qtdPequenos },
    { perfil: PERFIS.medio,   count: qtdMedios },
    { perfil: PERFIS.grande,  count: qtdGrandes },
  ]

  let index = 1
  let totalItens = 0
  const BATCH = 100
  const anoBase = new Date().getFullYear()

  for (const { perfil, count } of plano) {
    console.log(`⏳ Gerando ${count.toLocaleString('pt-BR')} pedidos ${perfil.nome}s...`)
    const t0 = Date.now()

    type PedidoGerado = ReturnType<typeof gerarPedido>['pedido']
    type ItemGerado   = ReturnType<typeof gerarPedido>['itens'][number]
    let bufPedidos: PedidoGerado[] = []
    let bufItens: ItemGerado[]   = []

    for (let i = 0; i < count; i++) {
      const ano = Math.random() < 0.6 ? anoBase : anoBase - 1
      const { pedido, itens } = gerarPedido({ tenantId, perfil, index, ano })
      bufPedidos.push(pedido)
      bufItens.push(...itens)
      totalItens += itens.length
      index++

      if (bufPedidos.length >= BATCH) {
        await prisma.pedido.createMany({ data: bufPedidos as any, skipDuplicates: true })
        await prisma.pedidoItem.createMany({ data: bufItens as any, skipDuplicates: true })
        bufPedidos = []
        bufItens = []
      }
    }
    if (bufPedidos.length > 0) {
      await prisma.pedido.createMany({ data: bufPedidos as any, skipDuplicates: true })
      await prisma.pedidoItem.createMany({ data: bufItens as any, skipDuplicates: true })
    }

    const dt = ((Date.now() - t0) / 1000).toFixed(1)
    console.log(`   ✓ ${count} pedidos ${perfil.nome}s em ${dt}s`)
  }

  const { pedidosCreated: edgePedidos, itensCreated: edgeItens } = await gerarCenariosEdge(tenantId, total)
  totalItens += edgeItens
  console.log(`\n🎯 Cenários edge: ${edgePedidos} pedidos extras, ${edgeItens} itens`)

  console.log(`\n✅ Seed concluído: ${(total + edgePedidos).toLocaleString('pt-BR')} pedidos | ${totalItens.toLocaleString('pt-BR')} itens\n`)
}

// Guarda — só executa main() quando rodado direto via CLI (não em import de test)
const isMainModule = (() => {
  try {
    return process.argv[1] && (
      process.argv[1].endsWith('seed.ts') ||
      process.argv[1].endsWith('seed.js')
    )
  } catch { return false }
})()

if (isMainModule) {
  main()
    .catch(e => {
      console.error('\n❌ Erro no seed:', e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
