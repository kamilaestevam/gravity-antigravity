/**
 * seed.ts — Dados realistas para o produto Pedido
 * Uso: tsx --env-file=.env prisma/seed.ts
 *
 * Cria 6 pedidos (4 importacao + 2 exportacao) com todos os campos preenchidos.
 */

import { PrismaClient } from '@prisma/client'
import { Decimal } from 'decimal.js'

const prisma = new PrismaClient()

const TENANT_ID   = 'tenant-dev-gravity-2026'
const COMPANY_ID  = 'tenant-dev-gravity-2026'

let seqCounter = 1000

function gerarId(prefixo: string): string {
  const seq = String(seqCounter++).padStart(7, '0')
  const ano  = String(new Date().getFullYear()).slice(-2)
  return `${prefixo}_id_${seq}/${ano}`
}

// ── Parceiros fictícios ─────────────────────────────────────────────────────
const EXP_CHINA    = 'parceiro_china_electronics_001'
const EXP_ALEMANHA = 'parceiro_bosch_germany_002'
const EXP_EUA      = 'parceiro_3m_usa_003'
const IMP_BRASIL   = 'parceiro_cliente_brasil_001'
const FABR_CHINA   = 'fabricante_foxconn_001'

// ── Seed data ───────────────────────────────────────────────────────────────

const pedidos = [
  // ─── 1. Importação de eletrônicos — status: aberto ──────────────────────
  {
    id: gerarId('pedi'),
    tenant_id:  TENANT_ID,
    company_id: COMPANY_ID,

    tipo_operacao: 'importacao',
    numero_pedido: 'PO-2026-0101',
    status:        'aberto',

    importacao_exportador_id: EXP_CHINA,
    fabricante_id:            FABR_CHINA,

    incoterm:       'CIF',
    moeda_pedido:   'USD',
    condicao_pagamento_pedido: '30% antecipado, 70% contra-entrega',

    numero_proforma:       'PI-CHN-2026-0101',
    numero_invoice:        'CI-CHN-2026-0101',
    referencia_importador: 'IMP-ELET-2026-001',
    referencia_exportador: 'SO-GRAVITY-001',
    referencia_fabricante: 'FAB-GR-2026-001',

    moeda_cambio_pedido:         'BRL',
    taxa_cambio_estimada_pedido: new Decimal('5.8500'),
    valor_total_cambio_pedido:   new Decimal('117000.000000'),

    data_emissao_pedido: new Date('2026-02-10'),

    detalhes_operacionais: {
      porto_origem:     'Shanghai (CNSHA)',
      porto_destino:    'Santos (BRSSZ)',
      modal:            'Maritimo FCL',
      transit_time:     28,
      numero_di_previa: 'DI-2026-10001',
    },

    itens: [
      {
        id: gerarId('pite'),
        tenant_id:  TENANT_ID,
        company_id: COMPANY_ID,
        part_number: 'IC-ESP32-WROOM-32E',
        ncm:         '8542.31.90',
        descricao_item:   'Módulo Wi-Fi + Bluetooth ESP32-WROOM-32E 4MB Flash',
        unidade_comercializada_item: 'PCS',
        quantidade_inicial_item_pedido:     new Decimal('5000'),
        saldo_item_pedido:                  new Decimal('5000'),
        quantidade_pronta_total_item_pedido: new Decimal('0'),
        quantidade_transferida_item_pedido: new Decimal('0'),
        quantidade_cancelada_item_pedido:   new Decimal('0'),
        casas_decimais_quantidade_item: 0,
        moeda_item:         'USD',
        valor_unitario_item: new Decimal('2.450000'),
        valor_total_itens:         new Decimal('12250.000000'),
        casas_decimais_valor_item: 2,
        cobertura_cambial: 'com_cobertura',
      },
      {
        id: gerarId('pite'),
        tenant_id:  TENANT_ID,
        company_id: COMPANY_ID,
        part_number: 'DISP-TFT-3.5-ILI9488',
        ncm:         '8524.12.00',
        descricao_item:   'Display TFT 3.5" ILI9488 480x320 SPI Touch',
        unidade_comercializada_item: 'PCS',
        quantidade_inicial_item_pedido:new Decimal('2000'),
        saldo_item_pedido:new Decimal('2000'),
        quantidade_pronta_total_item_pedido:new Decimal('0'),
        quantidade_transferida_item_pedido:new Decimal('0'),
        quantidade_cancelada_item_pedido:new Decimal('0'),
        casas_decimais_quantidade_item:0,
        moeda_item:         'USD',
        valor_unitario_item:new Decimal('8.750000'),
        valor_total_itens:         new Decimal('17500.000000'),
        casas_decimais_valor_item: 2,
        cobertura_cambial: 'com_cobertura',
      },
      {
        id: gerarId('pite'),
        tenant_id:  TENANT_ID,
        company_id: COMPANY_ID,
        part_number: 'PSU-220-5V-10A-DIN',
        ncm:         '8504.40.30',
        descricao_item:   'Fonte de Alimentação Chaveada 220V→5V 10A DIN Rail',
        unidade_comercializada_item: 'PCS',
        quantidade_inicial_item_pedido:new Decimal('500'),
        saldo_item_pedido:new Decimal('500'),
        quantidade_pronta_total_item_pedido:new Decimal('0'),
        quantidade_transferida_item_pedido:new Decimal('0'),
        quantidade_cancelada_item_pedido:new Decimal('0'),
        casas_decimais_quantidade_item:0,
        moeda_item:         'USD',
        valor_unitario_item:new Decimal('24.500000'),
        valor_total_itens:         new Decimal('12250.000000'),
        casas_decimais_valor_item: 2,
        cobertura_cambial: 'com_cobertura',
      },
    ],
  },

  // ─── 2. Importação de químicos — status: transferencia ──────────────────
  {
    id: gerarId('pedi'),
    tenant_id:  TENANT_ID,
    company_id: COMPANY_ID,

    tipo_operacao: 'importacao',
    numero_pedido: 'PO-2026-0202',
    status:        'transferencia',

    importacao_exportador_id: EXP_ALEMANHA,

    incoterm:       'FOB',
    moeda_pedido:   'EUR',
    condicao_pagamento_pedido: 'Carta de Crédito à vista',

    numero_proforma:       'PI-BOSCH-2026-0045',
    numero_invoice:        'CI-BOSCH-2026-0045',
    referencia_importador: 'IMP-QUIM-2026-002',
    referencia_exportador: 'BOSCH-ORDER-45200',

    moeda_cambio_pedido:         'BRL',
    taxa_cambio_estimada_pedido: new Decimal('6.2100'),
    valor_total_cambio_pedido:   new Decimal('93150.000000'),

    data_emissao_pedido: new Date('2026-01-15'),

    detalhes_operacionais: {
      porto_origem:  'Hamburg (DEHAM)',
      porto_destino: 'Vitoria (BRVIX)',
      modal:         'Maritimo LCL',
      transit_time:  35,
      licenca_ibama: 'LI-2026-00890',
    },

    itens: [
      {
        id: gerarId('pite'),
        tenant_id:  TENANT_ID,
        company_id: COMPANY_ID,
        part_number: 'LUBT-SYNTH-5W40-20L',
        ncm:         '2710.19.32',
        descricao_item:   'Óleo Lubrificante Sintético SAE 5W-40 — Tambor 20L',
        unidade_comercializada_item: 'L',
        quantidade_inicial_item_pedido:new Decimal('4000.000'),
        saldo_item_pedido:new Decimal('2500.000'),
        quantidade_pronta_total_item_pedido:new Decimal('0'),
        quantidade_transferida_item_pedido:new Decimal('1500.000'),
        quantidade_cancelada_item_pedido:new Decimal('0'),
        casas_decimais_quantidade_item:3,
        moeda_item:         'EUR',
        valor_unitario_item:new Decimal('3.750000'),
        valor_total_itens:         new Decimal('15000.000000'),
        casas_decimais_valor_item: 2,
        cobertura_cambial: 'com_cobertura',
      },
      {
        id: gerarId('pite'),
        tenant_id:  TENANT_ID,
        company_id: COMPANY_ID,
        part_number: 'GRAX-HI-TEMP-500G',
        ncm:         '2710.19.99',
        descricao_item:   'Graxa Alta Temperatura Base Lítio EP2 — Bisnaga 500g',
        unidade_comercializada_item: 'KG',
        quantidade_inicial_item_pedido:new Decimal('200.000'),
        saldo_item_pedido:new Decimal('200.000'),
        quantidade_pronta_total_item_pedido:new Decimal('0'),
        quantidade_transferida_item_pedido:new Decimal('0'),
        quantidade_cancelada_item_pedido:new Decimal('0'),
        casas_decimais_quantidade_item:3,
        moeda_item:         'EUR',
        valor_unitario_item:new Decimal('12.800000'),
        valor_total_itens:         new Decimal('2560.000000'),
        casas_decimais_valor_item: 2,
        cobertura_cambial: 'com_cobertura',
      },
    ],
  },

  // ─── 3. Importação de EPI — status: consolidado ──────────────────────────
  {
    id: gerarId('pedi'),
    tenant_id:  TENANT_ID,
    company_id: COMPANY_ID,

    tipo_operacao: 'importacao',
    numero_pedido: 'PO-2026-0305',
    status:        'consolidado',

    importacao_exportador_id: EXP_EUA,

    incoterm:       'CIF',
    moeda_pedido:   'USD',
    condicao_pagamento_pedido: '60 dias data embarque',

    numero_proforma:       'PI-3M-2026-00112',
    numero_invoice:        'CI-3M-2026-00112',
    referencia_importador: 'IMP-EPI-2026-003',
    referencia_exportador: '3M-BR-2026-00112',

    moeda_cambio_pedido:         'BRL',
    taxa_cambio_estimada_pedido: new Decimal('5.7800'),
    valor_total_cambio_pedido:   new Decimal('57800.000000'),

    data_emissao_pedido: new Date('2025-12-20'),

    detalhes_operacionais: {
      porto_origem:  'Los Angeles (USLAX)',
      porto_destino: 'Santos (BRSSZ)',
      modal:         'Aereo',
      transit_time:  5,
      certif_ca:     'CA-15888',
    },

    itens: [
      {
        id: gerarId('pite'),
        tenant_id:  TENANT_ID,
        company_id: COMPANY_ID,
        part_number: '3M-9501V-N95-CX20',
        ncm:         '6307.90.10',
        descricao_item:   'Máscara Respiratória N95 3M 9501V — Caixa 20un',
        unidade_comercializada_item: 'CX',
        quantidade_inicial_item_pedido:new Decimal('500'),
        saldo_item_pedido:new Decimal('0'),
        quantidade_pronta_total_item_pedido:new Decimal('0'),
        quantidade_transferida_item_pedido:new Decimal('500'),
        quantidade_cancelada_item_pedido:new Decimal('0'),
        casas_decimais_quantidade_item:0,
        moeda_item:         'USD',
        valor_unitario_item:new Decimal('28.600000'),
        valor_total_itens:         new Decimal('14300.000000'),
        casas_decimais_valor_item: 2,
        cobertura_cambial: 'com_cobertura',
      },
      {
        id: gerarId('pite'),
        tenant_id:  TENANT_ID,
        company_id: COMPANY_ID,
        part_number: '3M-PELTOR-X5-FONE',
        ncm:         '8518.10.90',
        descricao_item:   'Protetor Auricular Tipo Concha 3M PELTOR X5 31dB',
        unidade_comercializada_item: 'PCS',
        quantidade_inicial_item_pedido:new Decimal('300'),
        saldo_item_pedido:new Decimal('0'),
        quantidade_pronta_total_item_pedido:new Decimal('0'),
        quantidade_transferida_item_pedido:new Decimal('300'),
        quantidade_cancelada_item_pedido:new Decimal('0'),
        casas_decimais_quantidade_item:0,
        moeda_item:         'USD',
        valor_unitario_item:new Decimal('42.000000'),
        valor_total_itens:         new Decimal('12600.000000'),
        casas_decimais_valor_item: 2,
        cobertura_cambial: 'com_cobertura',
      },
      {
        id: gerarId('pite'),
        tenant_id:  TENANT_ID,
        company_id: COMPANY_ID,
        part_number: '3M-SOLARIS-OCUL-UV',
        ncm:         '9004.10.10',
        descricao_item:   'Óculos de Proteção 3M Solaris Anti-UV Incolor',
        unidade_comercializada_item: 'PCS',
        quantidade_inicial_item_pedido:new Decimal('1000'),
        saldo_item_pedido:new Decimal('0'),
        quantidade_pronta_total_item_pedido:new Decimal('0'),
        quantidade_transferida_item_pedido:new Decimal('1000'),
        quantidade_cancelada_item_pedido:new Decimal('0'),
        casas_decimais_quantidade_item:0,
        moeda_item:         'USD',
        valor_unitario_item:new Decimal('7.900000'),
        valor_total_itens:         new Decimal('7900.000000'),
        casas_decimais_valor_item: 2,
        cobertura_cambial: 'com_cobertura',
      },
    ],
  },

  // ─── 4. Importação de máquinas — status: aberto ──────────────────────────
  {
    id: gerarId('pedi'),
    tenant_id:  TENANT_ID,
    company_id: COMPANY_ID,

    tipo_operacao: 'importacao',
    numero_pedido: 'PO-2026-0412',
    status:        'aberto',

    importacao_exportador_id: EXP_ALEMANHA,
    fabricante_id:            EXP_ALEMANHA,

    incoterm:       'EXW',
    moeda_pedido:   'EUR',
    condicao_pagamento_pedido: '50% adiantado, 50% após FAT',

    numero_proforma: 'PI-BOSCH-2026-0089',
    referencia_importador: 'IMP-MAQ-2026-004',
    referencia_exportador: 'BOSCH-ORDER-89700',

    taxa_cambio_estimada_pedido: new Decimal('6.1500'),

    data_emissao_pedido: new Date('2026-03-01'),

    detalhes_operacionais: {
      porto_origem:  'Bremerhaven (DEBRV)',
      porto_destino: 'Santos (BRSSZ)',
      modal:         'Maritimo FCL 40HQ',
      transit_time:  42,
      peso_total_kg: 8400,
      nota_tecnica:  'Requer vistoria INMETRO na origem',
    },

    itens: [
      {
        id: gerarId('pite'),
        tenant_id:  TENANT_ID,
        company_id: COMPANY_ID,
        part_number: 'BOSCH-CNC-VF3-VERT',
        ncm:         '8457.10.10',
        descricao_item:   'Centro de Usinagem Vertical CNC Bosch VF3 — 3 Eixos 12k RPM',
        unidade_comercializada_item: 'UN',
        quantidade_inicial_item_pedido:new Decimal('1'),
        saldo_item_pedido:new Decimal('1'),
        quantidade_pronta_total_item_pedido:new Decimal('0'),
        quantidade_transferida_item_pedido:new Decimal('0'),
        quantidade_cancelada_item_pedido:new Decimal('0'),
        casas_decimais_quantidade_item:0,
        moeda_item:         'EUR',
        valor_unitario_item:new Decimal('78500.000000'),
        valor_total_itens:         new Decimal('78500.000000'),
        casas_decimais_valor_item: 2,
        cobertura_cambial: 'com_cobertura',
      },
      {
        id: gerarId('pite'),
        tenant_id:  TENANT_ID,
        company_id: COMPANY_ID,
        part_number: 'BOSCH-TOOL-HOLDER-KIT',
        ncm:         '8466.20.00',
        descricao_item:   'Kit Porta-Ferramentas BT40 (12 peças) para CNC VF3',
        unidade_comercializada_item: 'KIT',
        quantidade_inicial_item_pedido:new Decimal('2'),
        saldo_item_pedido:new Decimal('2'),
        quantidade_pronta_total_item_pedido:new Decimal('0'),
        quantidade_transferida_item_pedido:new Decimal('0'),
        quantidade_cancelada_item_pedido:new Decimal('0'),
        casas_decimais_quantidade_item:0,
        moeda_item:         'EUR',
        valor_unitario_item:new Decimal('3200.000000'),
        valor_total_itens:         new Decimal('6400.000000'),
        casas_decimais_valor_item: 2,
        cobertura_cambial: 'com_cobertura',
      },
    ],
  },

  // ─── 5. Exportação de calçados — status: aberto ──────────────────────────
  {
    id: gerarId('pedi'),
    tenant_id:  TENANT_ID,
    company_id: COMPANY_ID,

    tipo_operacao: 'exportacao',
    numero_pedido: 'SO-2026-0501',
    status:        'aberto',

    exportacao_importador_id: 'parceiro_zapatos_chile_001',

    incoterm:       'FOB',
    moeda_pedido:   'USD',
    condicao_pagamento_pedido: 'Pagamento antecipado 100%',

    numero_proforma:       'PROF-EXP-2026-501',
    numero_invoice:        'INV-EXP-2026-501',
    referencia_importador: 'ZAPATOS-PO-2026-1100',
    referencia_exportador: 'EXP-CALC-2026-501',

    moeda_cambio_pedido:         'BRL',
    taxa_cambio_estimada_pedido: new Decimal('5.9000'),
    valor_total_cambio_pedido:   new Decimal('35400.000000'),

    data_emissao_pedido: new Date('2026-03-10'),

    detalhes_operacionais: {
      porto_origem:  'Rio Grande (BRRGA)',
      porto_destino: 'Valparaíso (CLVAP)',
      modal:         'Maritimo FCL 20Dry',
      transit_time:  7,
      drawback:      'DRW-2026-0101',
      re_siscomex:   'RE-2026-0000501',
    },

    itens: [
      {
        id: gerarId('pite'),
        tenant_id:  TENANT_ID,
        company_id: COMPANY_ID,
        part_number: 'CALC-COURO-MASC-38-44',
        ncm:         '6403.99.90',
        descricao_item:   'Calçado Masculino Couro Bovino Sola Borracha N°38-44',
        unidade_comercializada_item: 'PAR',
        quantidade_inicial_item_pedido:new Decimal('600'),
        saldo_item_pedido:new Decimal('600'),
        quantidade_pronta_total_item_pedido:new Decimal('400'),
        quantidade_transferida_item_pedido:new Decimal('0'),
        quantidade_cancelada_item_pedido:new Decimal('0'),
        casas_decimais_quantidade_item:0,
        moeda_item:         'USD',
        valor_unitario_item:new Decimal('45.000000'),
        valor_total_itens:         new Decimal('27000.000000'),
        casas_decimais_valor_item: 2,
        cobertura_cambial: 'com_cobertura',
      },
      {
        id: gerarId('pite'),
        tenant_id:  TENANT_ID,
        company_id: COMPANY_ID,
        part_number: 'CALC-FEM-SALTO-36-41',
        ncm:         '6403.99.90',
        descricao_item:   'Calçado Feminino Salto 7cm Couro Sintético N°36-41',
        unidade_comercializada_item: 'PAR',
        quantidade_inicial_item_pedido:new Decimal('200'),
        saldo_item_pedido:new Decimal('200'),
        quantidade_pronta_total_item_pedido:new Decimal('100'),
        quantidade_transferida_item_pedido:new Decimal('0'),
        quantidade_cancelada_item_pedido:new Decimal('0'),
        casas_decimais_quantidade_item:0,
        moeda_item:         'USD',
        valor_unitario_item:new Decimal('30.000000'),
        valor_total_itens:         new Decimal('6000.000000'),
        casas_decimais_valor_item: 2,
        cobertura_cambial: 'com_cobertura',
      },
    ],
  },

  // ─── 6. Exportação de grãos — status: transferencia ─────────────────────
  {
    id: gerarId('pedi'),
    tenant_id:  TENANT_ID,
    company_id: COMPANY_ID,

    tipo_operacao: 'exportacao',
    numero_pedido: 'SO-2026-0612',
    status:        'transferencia',

    exportacao_importador_id: 'parceiro_nidera_argentina_001',

    incoterm:       'CFR',
    moeda_pedido:   'USD',
    condicao_pagamento_pedido: '100% carta de crédito irrevogável',

    numero_proforma:       'PROF-EXP-2026-612',
    numero_invoice:        'INV-EXP-2026-612',
    referencia_importador: 'NIDERA-PO-612',
    referencia_exportador: 'EXP-SOJA-2026-612',

    moeda_cambio_pedido:         'BRL',
    taxa_cambio_estimada_pedido: new Decimal('5.8700'),
    valor_total_cambio_pedido:   new Decimal('469600.000000'),

    data_emissao_pedido: new Date('2026-02-28'),

    detalhes_operacionais: {
      porto_origem:  'Paranaguá (BRPNG)',
      porto_destino: 'Buenos Aires (ARBUE)',
      modal:         'Maritimo Graneleiro',
      transit_time:  3,
      romaneio:      'ROM-2026-0612',
      laudo_qualidade: 'LQ-EMBRAPA-2026-0612',
    },

    itens: [
      {
        id: gerarId('pite'),
        tenant_id:  TENANT_ID,
        company_id: COMPANY_ID,
        part_number: 'SOJA-GRAO-DESCAS-NON-GMO',
        ncm:         '1201.10.00',
        descricao_item:   'Soja em Grão Descascada Non-GMO — Umidade ≤14% Pureza ≥99%',
        unidade_comercializada_item: 'TON',
        quantidade_inicial_item_pedido:new Decimal('2000.000'),
        saldo_item_pedido:new Decimal('800.000'),
        quantidade_pronta_total_item_pedido:new Decimal('0'),
        quantidade_transferida_item_pedido:new Decimal('1200.000'),
        quantidade_cancelada_item_pedido:new Decimal('0'),
        casas_decimais_quantidade_item:3,
        moeda_item:         'USD',
        valor_unitario_item:new Decimal('400.000000'),
        valor_total_itens:         new Decimal('800000.000000'),
        casas_decimais_valor_item: 2,
        cobertura_cambial: 'com_cobertura',
      },
    ],
  },
]

// ── Executar seed ────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Iniciando seed de pedidos...\n')

  for (const pedido of pedidos) {
    const { itens, ...pedidoData } = pedido

    // Calcular totais
    const valor_total = itens.reduce((acc, item) => acc.add(item.valor_total_itens), new Decimal(0))
    const qtd_total   = itens.reduce((acc, item) => acc + Number(item.quantidade_inicial_item_pedido), 0)

    const created = await prisma.pedido.create({
      data: {
        ...pedidoData,
        valor_total_pedido:     valor_total,
        quantidade_total_inicial_pedido: qtd_total,
        itens: {
          create: itens.map(({ id, pedido_id: _ignored, ...item }, index) => ({
            id,
            ...item,
            sequencia_item: index + 1,
          })),
        },
      },
      include: { itens: true },
    })

    console.log(`✅ ${created.numero_pedido} [${created.tipo_operacao}/${created.status}]`)
    console.log(`   ${created.itens.length} iten(s) | Total: ${created.moeda_pedido} ${Number(created.valor_total_pedido).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
  }

  console.log('\n✨ Seed concluído!')
}

main()
  .catch(e => { console.error('❌ Erro no seed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
