/**
 * refactor-7a-pedido-item.ts
 *
 * Sub-onda 7a — substitui tokens errados de PedidoItem (sufixo _pedido_item)
 * pelos nomes corretos da planilha DDD (sufixo _item, PK id_item, etc.).
 *
 * Aplicação: regex \b<wrong>\b → <correct> em ordem de tokens mais longos
 * primeiro para evitar colisões.
 *
 * Uso: npx tsx scripts/ativamente/refactor-7a-pedido-item.ts
 */

import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

// Mapping WRONG → CORRECT (ordenado por tamanho, mais longo primeiro)
const RAW_MAPPING: Array<[string, string]> = [
  ['casas_decimais_quantidade_item_pedido_item', 'casas_decimais_quantidade_item'],
  ['unidade_comercializada_item_pedido_item',    'unidade_comercializada_item'],
  ['quantidade_transferida_pedido_pedido_item',  'quantidade_transferida_item'],
  ['quantidade_cancelada_pedido_pedido_item',    'quantidade_cancelada_item'],
  ['casas_decimais_cubagem_item_pedido_item',    'casas_decimais_cubagem_item'],
  ['quantidade_inicial_pedido_pedido_item',      'quantidade_inicial_item'],
  ['quantidade_pronta_pedido_pedido_item',       'quantidade_pronta_item'],
  ['casas_decimais_peso_item_pedido_item',       'casas_decimais_peso_item'],
  ['quantidade_atual_pedido_pedido_item',        'quantidade_atual_item'],
  ['casas_decimais_valor_item_pedido_item',      'casas_decimais_valor_item'],
  ['condicao_pagamento_pedido_pedido_item',      'condicao_pagamento_item'],
  ['referencia_importador_pedido_item',          'referencia_importador_item'],
  ['referencia_exportador_pedido_item',          'referencia_exportador_item'],
  ['referencia_fabricante_pedido_item',          'referencia_fabricante_item'],
  ['data_emissao_pedido_pedido_item',            'data_emissao_item'],
  ['peso_liquido_unitario_pedido_item',          'peso_liquido_unitario_item'],
  ['peso_bruto_unitario_pedido_item',            'peso_bruto_unitario_item'],
  ['descricao_item_pedido_item',                 'descricao_item'],
  ['valor_por_unidade_item_pedido_item',         'valor_por_unidade_item'],
  ['data_atualizacao_pedido_item',               'data_atualizacao_item'],
  ['cobertura_cambial_pedido_item',              'cobertura_cambial_item'],
  ['campos_custom_pedido_item',                  'dados_extras_importacao_item'],
  ['cubagem_unitaria_pedido_item',               'cubagem_unitaria_item'],
  ['nome_exportador_pedido_item',                'nome_exportador_item'],
  ['nome_importador_pedido_item',                'nome_importador_item'],
  ['nome_fabricante_pedido_item',                'nome_fabricante_item'],
  ['valor_total_item_pedido_item',               'valor_total_item'],
  ['data_criacao_pedido_item',                   'data_criacao_item'],
  ['sequencia_item_pedido_item',                 'sequencia_item_pedido'],
  ['part_number_pedido_item',                    'part_number_item'],
  ['moeda_item_pedido_item',                     'moeda_item'],
  ['incoterm_pedido_item',                       'incoterm_item'],
  ['ncm_pedido_item',                            'ncm_item'],
  // Relação back-ref do PedidoItem → Pedido
  ['pedido_pedido_item',                         'pedido_item'],
  // PK
  ['id_pedido_item',                             'id_item'],
]

// Não tocar — é forward-ref de PedidoItem para ProcessoItem[]
const PROTECTED_TOKENS = ['embarques_efetivos_pedido_item']

const FILES = [
  'servicos-global/tenant/processos-core/src/services/saldoEngine.ts',
  'servicos-global/tenant/processos-core/src/services/formulaEngine.ts',
  'servicos-global/tenant/processos-core/src/routes/pedidos.ts',
  'servicos-global/tenant/processos-core/src/routes/importacao.ts',
  'produto/pedido/server/src/services/edicaoEmMassaService.integration.test.ts',
  'produto/pedido/server/src/services/transferirService.ts',
  'produto/pedido/server/src/services/duplicarExcluirService.ts',
  'produto/pedido/server/src/services/transferirService.test.ts',
  'produto/pedido/server/src/services/edicaoEmMassaService.ts',
  'produto/pedido/server/src/routes/pdf.ts',
  'produto/pedido/server/src/routes/init.ts',
  'produto/pedido/server/src/routes/dashboardData.ts',
  'produto/pedido/server/src/routes/casasDecimais.ts',
  'produto/pedido/server/src/routes/consolidar.ts',
  'produto/pedido/server/prisma/seed.ts',
]

const ROOT = path.resolve(import.meta.dirname ?? '.', '..', '..')

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

let totalReplacements = 0
const perFile: Record<string, number> = {}

for (const rel of FILES) {
  const abs = path.join(ROOT, rel)
  let src = readFileSync(abs, 'utf8')
  const original = src
  let fileCount = 0

  // Proteger tokens que não devem ser substituídos com placeholders únicos
  const placeholders: Array<[string, string]> = []
  for (const tok of PROTECTED_TOKENS) {
    const ph = `__PROTECTED_${Math.random().toString(36).slice(2)}_${tok}__`
    placeholders.push([ph, tok])
    src = src.replaceAll(tok, ph)
  }

  for (const [wrong, correct] of RAW_MAPPING) {
    // \b funciona pq todos tokens são [a-z_0-9]
    const re = new RegExp(`\\b${escapeRegExp(wrong)}\\b`, 'g')
    const matches = src.match(re)
    if (matches) {
      fileCount += matches.length
      src = src.replace(re, correct)
    }
  }

  // Restaurar placeholders
  for (const [ph, tok] of placeholders) {
    src = src.replaceAll(ph, tok)
  }

  if (src !== original) {
    writeFileSync(abs, src, 'utf8')
    perFile[rel] = fileCount
    totalReplacements += fileCount
    console.log(`  ✓ ${rel}: ${fileCount} substituições`)
  } else {
    console.log(`  – ${rel}: nenhuma alteração`)
  }
}

console.log(`\nTotal: ${totalReplacements} substituições em ${Object.keys(perFile).length}/${FILES.length} arquivos`)
