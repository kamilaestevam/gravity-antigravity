/**
 * gerar-csv-colunas.mjs
 *
 * Lê auditoria-colunas-pai.json + auditoria-colunas-filho.json e gera
 * um CSV unificado para abrir no Google Sheets / Excel.
 *
 * Uso:
 *   cd documentos-tecnicos && node gerar-csv-colunas.mjs
 *
 * Saída: documentos-tecnicos/auditoria-colunas-pedido.csv
 *
 * Colunas do CSV (cabeçalho):
 *   nivel, grupo, key, label, tipo,
 *   editavel, condicao_editavel,
 *   propaga_para_item, edicao_item_recalcula_pedido,
 *   alerta_divergencia, regra_alerta,
 *   soma_no_pedido, regra_soma,
 *   campo_pai_correspondente, observacao
 */

import fs from 'node:fs'
import path from 'node:path'

const DIR = path.dirname(new URL(import.meta.url).pathname.replace(/^\//, ''))
const paiPath  = path.join(DIR, 'auditoria-colunas-pai.json')
const filhoPath = path.join(DIR, 'auditoria-colunas-filho.json')
const outPath  = path.join(DIR, 'auditoria-colunas-pedido.csv')

function csvCell(v) {
  if (v === null || v === undefined) return ''
  const s = String(v)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

function row(cells) {
  return cells.map(csvCell).join(',')
}

const HEADER = [
  'nivel',
  'grupo',
  'key',
  'label',
  'tipo',
  'editavel',
  'condicao_editavel',
  'propaga_pai_para_item',
  'edicao_item_recalcula_pedido',
  'alerta_divergencia',
  'regra_alerta',
  'soma_no_pedido',
  'regra_soma',
  'campo_pai_correspondente',
  'observacao',
]

const lines = [HEADER.join(',')]

// PAI
if (fs.existsSync(paiPath)) {
  const pai = JSON.parse(fs.readFileSync(paiPath, 'utf-8'))
  console.log(`PAI: ${pai.length} colunas`)
  for (const c of pai) {
    lines.push(row([
      'pedido',
      c.grupo ?? '',
      c.key ?? '',
      c.label ?? '',
      c.tipo ?? '',
      c.editavel === true ? 'sim'
        : c.editavel === false ? 'nao'
        : c.editavel === 'condicional' ? 'condicional'
        : c.editavel ?? '',
      c.condicao_editavel ?? '',
      c.propaga_para_item === true ? 'sim'
        : c.propaga_para_item === false ? 'nao'
        : c.propaga_para_item === 'declarado_mas_nao_implementado' ? 'BUG: tooltip diz sim mas backend nao implementa'
        : c.propaga_para_item ?? '',
      c.edicao_item_recalcula_pedido === true ? 'sim'
        : c.edicao_item_recalcula_pedido === false ? 'nao'
        : c.edicao_item_recalcula_pedido ?? '',
      c.alerta_divergencia === true ? 'sim'
        : c.alerta_divergencia === false ? 'nao'
        : c.alerta_divergencia ?? '',
      c.regra_alerta ?? '',
      c.soma_itens === true ? 'sim'
        : c.soma_itens === false ? 'nao'
        : c.soma_itens === 'configuravel' ? 'configuravel'
        : c.soma_itens ?? '',
      c.regra_soma ?? '',
      '', // campo_pai_correspondente — só faz sentido para filho
      c.observacao ?? '',
    ]))
  }
} else {
  console.warn(`AVISO: ${paiPath} nao encontrado`)
}

// FILHO
if (fs.existsSync(filhoPath)) {
  const filho = JSON.parse(fs.readFileSync(filhoPath, 'utf-8'))
  console.log(`FILHO: ${filho.length} colunas`)
  for (const c of filho) {
    // Tenta pegar valores em formatos diferentes (o agente pode usar
    // editavel_inline + editavel_backend OU só editavel)
    const editavelFinal = c.editavel_inline !== undefined ? c.editavel_inline : c.editavel
    const observacaoExtra = c.editavel_inline !== undefined && c.editavel_backend !== undefined && c.editavel_inline !== c.editavel_backend
      ? `BUG: inline=${c.editavel_inline}, backend=${c.editavel_backend}. ${c.observacao ?? ''}`.trim()
      : c.observacao ?? ''
    lines.push(row([
      'item',
      c.grupo ?? '',
      c.key ?? '',
      c.label ?? '',
      c.tipo ?? '',
      editavelFinal === true ? 'sim'
        : editavelFinal === false ? 'nao'
        : editavelFinal === 'condicional' ? 'condicional'
        : editavelFinal ?? '',
      c.condicao_editavel ?? '',
      c.propagado_do_pedido_pai === true ? 'sim'
        : c.propagado_do_pedido_pai === false ? 'nao'
        : c.propaga_do_pedido_pai === true ? 'sim'
        : c.propaga_do_pedido_pai === false ? 'nao'
        : '',
      c.edicao_recalcula_pedido === true ? 'sim'
        : c.edicao_recalcula_pedido === false ? 'nao'
        : '',
      c.alerta_pai_se_divergente === true ? 'sim'
        : c.alerta_pai_se_divergente === false ? 'nao'
        : '',
      c.regra_alerta ?? '',
      c.soma_no_pedido_pai === true ? 'sim'
        : c.soma_no_pedido_pai === false ? 'nao'
        : '',
      c.regra_soma ?? '',
      c.campo_pai_correspondente ?? '',
      observacaoExtra,
    ]))
  }
} else {
  console.warn(`AVISO: ${filhoPath} nao encontrado — CSV terá só PAI`)
}

fs.writeFileSync(outPath, lines.join('\n') + '\n')
console.log(`\n✅ CSV salvo em: ${outPath}`)
console.log(`   ${lines.length - 1} linhas (incluindo cabeçalho: ${lines.length})`)
