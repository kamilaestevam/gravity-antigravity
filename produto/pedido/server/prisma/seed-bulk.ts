/**
 * seed-bulk.ts — Gera 60 pedidos de teste para validar paginação / find cross-page
 * Uso: tsx --env-file=.env prisma/seed-bulk.ts
 */

import { PrismaClient } from '@prisma/client'
import { Decimal } from 'decimal.js'

const prisma = new PrismaClient()

const TENANT_ID  = process.env.SEED_TENANT_ID  ?? (() => { throw new Error('SEED_TENANT_ID não definido') })()
const COMPANY_ID = process.env.SEED_COMPANY_ID ?? TENANT_ID

let seq = 2000
function uid(p: string) { return `${p}_bulk_${String(seq++).padStart(7,'0')}` }

const EXPORTADORES = [
  { id: 'exp-china-001',    nome: 'Shenzhen Electronics Co.' },
  { id: 'exp-alemanha-001', nome: 'Bosch Automotive GmbH' },
  { id: 'exp-eua-001',      nome: '3M Industrial Supply USA' },
  { id: 'exp-taiwan-001',   nome: 'Taiwan Semiconductor Supply' },
  { id: 'exp-japao-001',    nome: 'Toyota Components Japan' },
  { id: 'exp-coreia-001',   nome: 'Samsung Electronics Korea' },
]

const IMPORTADORES = [
  { id: 'imp-br-001', nome: 'Gravity Soluções Ltda.' },
  { id: 'imp-br-002', nome: 'ABC Importadora Brasil' },
  { id: 'imp-ar-001', nome: 'Argentina Importadora S.A.' },
]

const FABRICANTES = [
  { id: 'fab-foxconn',  nome: 'Foxconn Technology Group' },
  { id: 'fab-flex',     nome: 'Flex Ltd.' },
  { id: 'fab-jabil',    nome: 'Jabil Circuit Inc.' },
]

const STATUS = ['rascunho','aberto','em_andamento','aprovado','transferencia','consolidado'] as const
const INCOTERMS = ['FOB','CIF','CFR','EXW','DDP']
const MOEDAS = ['USD','EUR','CNY']
const PORTOS_ORIGEM = ['Shanghai (CNSHA)','Hamburg (DEHAM)','Rotterdam (NLRTM)','Busan (KRPUS)','Yokohama (JPYOK)']
const PORTOS_DESTINO = ['Santos (BRSSZ)','Paranaguá (BRPNG)','Rio de Janeiro (BRRJO)']

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function rnd(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min }

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('seed-bulk.ts BLOQUEADO em produção — use apenas em desenvolvimento local')
  }
  console.log('🌱 Gerando 60 pedidos bulk...\n')

  const total = 60
  for (let i = 1; i <= total; i++) {
    const isExport = i % 4 === 0   // ~25% exportação
    const exp  = pick(EXPORTADORES)
    const imp  = pick(IMPORTADORES)
    const fab  = pick(FABRICANTES)
    const status = pick(STATUS)
    const incoterm = pick(INCOTERMS)
    const moeda = pick(MOEDAS)
    const porto_origem = pick(PORTOS_ORIGEM)
    const porto_destino = pick(PORTOS_DESTINO)
    const ano = 2026
    const num = String(i).padStart(3, '0')

    const numero_pedido = isExport ? `SO-${ano}-BULK-${num}` : `PO-${ano}-BULK-${num}`

    const qtdItem = rnd(100, 5000)
    const valorUnit = new Decimal(rnd(5, 500)).div(10)    // 0.5 ~ 50.0
    const valorTotal = valorUnit.mul(qtdItem)
    const taxaCambio = new Decimal('5.85')
    const valorCambio = valorTotal.mul(taxaCambio)

    const dataEmissao = new Date(ano, rnd(0, 2), rnd(1, 28))

    const pedidoId = uid('pedi')
    const itemId   = uid('pite')

    const pedidoData = {
      id: pedidoId,
      tenant_id:  TENANT_ID,
      company_id: COMPANY_ID,
      tipo_operacao: isExport ? 'exportacao' : 'importacao',
      numero_pedido,
      status,
      ...(isExport
        ? { exportacao_importador_id: imp.id }
        : {
            importacao_exportador_id: exp.id,
            fabricante_id: fab.id,
          }
      ),
      incoterm,
      moeda_pedido: moeda,
      condicao_pagamento_pedido: i % 2 === 0 ? '30% antecipado, 70% BL' : '100% carta de crédito',
      numero_proforma:       `PI-BULK-${ano}-${num}`,
      numero_invoice:        `CI-BULK-${ano}-${num}`,
      referencia_importador: `IMP-REF-${ano}-${num}`,
      referencia_exportador: `EXP-REF-${ano}-${num}`,
      moeda_cambio_pedido: 'BRL',
      taxa_cambio_estimada_pedido: taxaCambio,
      valor_total_cambio_pedido: valorCambio,
      valor_total_pedido: valorTotal,
      quantidade_total_inicial_pedido: qtdItem,
      data_emissao_pedido: dataEmissao,
      detalhes_operacionais: {
        porto_origem,
        porto_destino,
        modal: 'Maritimo FCL',
        transit_time: rnd(10, 35),
      },
    }

    const itemData = {
      id: itemId,
      tenant_id:  TENANT_ID,
      company_id: COMPANY_ID,
      sequencia_item: 1,
      part_number: `PART-BULK-${num}`,
      ncm: '8542.31.90',
      descricao_item: `Produto Teste Bulk ${num} — ${isExport ? exp.nome : fab.nome}`,
      unidade_comercializada_item: 'PCS',
      quantidade_inicial_item_pedido:     new Decimal(qtdItem),
      saldo_item_pedido:                  new Decimal(qtdItem),
      quantidade_pronta_total_item_pedido: new Decimal(0),
      quantidade_transferida_item_pedido: new Decimal(0),
      quantidade_cancelada_item_pedido:   new Decimal(0),
      casas_decimais_quantidade_item: 0,
      moeda_item: moeda,
      valor_unitario_item: valorUnit,
      valor_total_itens: valorTotal,
      casas_decimais_valor_item: 2,
      cobertura_cambial: i % 3 === 0 ? 'sem_cobertura' : 'com_cobertura',
    }

    await prisma.pedido.create({
      data: {
        ...pedidoData,
        itens: { create: [itemData] },
      },
    })

    process.stdout.write(`\r  ✅ ${i}/${total} — ${numero_pedido}`)
  }

  console.log('\n\n✨ 60 pedidos criados!')
}

main()
  .catch(e => { console.error('\n❌ Erro:', e instanceof Error ? e.message : String(e)); process.exit(1) })
  .finally(() => prisma.$disconnect().catch(() => {/* ignora erro no disconnect */}))
