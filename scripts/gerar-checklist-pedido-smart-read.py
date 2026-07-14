#!/usr/bin/env python3
"""Gera montar-checklist a partir do template BL com substituições seguras."""

from pathlib import Path

BL = Path(
    r'C:\Users\danie\worthree-ajuste-smartdoc-03\servicos-global\produto\smart-read\shared\montar-checklist-matriz-bl-smart-read.ts'
).read_text(encoding='utf-8')

CONFIGS = [
    {
        'file': 'montar-checklist-matriz-pedido-compra-smart-read.ts',
        'header': 'montar-checklist-matriz-pedido-compra-smart-read.ts — checklist da matriz PC (PC1–PC9)',
        'replacements': [
            ('matriz-validacao-bl-smart-read', 'matriz-validacao-pedido-compra-smart-read'),
            ('GATES_MATRIZ_BL', 'GATES_MATRIZ_PEDIDO_COMPRA'),
            ('MATRIZ_VALIDACAO_BL', 'MATRIZ_VALIDACAO_PEDIDO_COMPRA'),
            ('ORDEM_SECOES_MATRIZ_BL', 'ORDEM_SECOES_MATRIZ_PEDIDO_COMPRA'),
            ('ROTULO_CLASSIFICACAO_RISCO_BL', 'ROTULO_CLASSIFICACAO_RISCO_PEDIDO_COMPRA'),
            ('classificacaoRiscoBl', 'classificacaoRiscoPedidoCompra'),
            ('ClassificacaoRiscoBl', 'ClassificacaoRiscoPedidoCompra'),
            ('RegraMatrizBl', 'RegraMatrizPedidoCompra'),
            ('SecaoMatrizBl', 'SecaoMatrizPedidoCompra'),
            ('StatusChecklistMatrizBl', 'StatusChecklistMatrizPedidoCompra'),
            ('ItemChecklistMatrizBl', 'ItemChecklistMatrizPedidoCompra'),
            ('ParametrosChecklistMatrizBl', 'ParametrosChecklistMatrizPedidoCompra'),
            ('ScoreChecklistBl', 'ScoreChecklistPedidoCompra'),
            ('ehTipoBlChecklist', 'ehTipoPedidoCompraChecklist'),
            ('montarChecklistMatrizBl', 'montarChecklistMatrizPedidoCompra'),
            ('calcularScoreChecklistBl', 'calcularScoreChecklistPedidoCompra'),
            ('agruparChecklistBlPorSecao', 'agruparChecklistPedidoCompraPorSecao'),
            ('BlOpcaoChecklist', 'PedidoCompraOpcaoChecklist'),
            ('listarBlsChecklist', 'listarPedidosCompraChecklist'),
            ('ResumoBlChecklist', 'ResumoPedidoCompraChecklist'),
            ('percentualConformeChecklistBl', 'percentualConformeChecklistPedidoCompra'),
            ('montarResumoChecklistBls', 'montarResumoChecklistPedidosCompra'),
            ('combinarResumoGeralComBls', 'combinarResumoGeralComPedidosCompra'),
            ('BL9-05', 'PC9-05'),
            ('BL9-06', 'PC9-06'),
            ('document.billOfLadingNumber', 'document.purchaseOrderNumber'),
            ('document.masterBillOfLadingNumber', 'document.orderNumber'),
            ('BL (Bill of Lading)', 'Pedido de Compra (PO)'),
            ('BL1–BL9', 'PC1–PC9'),
            ('BL', 'PC'),
            ('Bls', 'PedidosCompra'),
            ('bl)', 'pc)'),
            ('(bl', '(pc'),
        ],
        'tipo_fn': """/** Detecta Pedido de Compra (Purchase Order / PO). */
export function ehTipoPedidoCompraChecklist(tipo: string): boolean {
  const norm = tipo.toUpperCase()
  if (norm.includes('SALES') || norm.includes('VENDA') || norm.includes('ORDER CONFIRMATION')) return false
  return (
    norm.includes('PURCHASE ORDER') ||
    norm.includes('PEDIDO DE COMPRA') ||
    norm.includes('PEDIDO_COMPRA') ||
    (/\\bPO\\b/.test(norm) && !norm.includes('PROFORMA'))
  )
}""",
    },
    {
        'file': 'montar-checklist-matriz-pedido-venda-smart-read.ts',
        'header': 'montar-checklist-matriz-pedido-venda-smart-read.ts — checklist da matriz PV (PV1–PV9)',
        'replacements': [
            ('matriz-validacao-bl-smart-read', 'matriz-validacao-pedido-venda-smart-read'),
            ('GATES_MATRIZ_BL', 'GATES_MATRIZ_PEDIDO_VENDA'),
            ('MATRIZ_VALIDACAO_BL', 'MATRIZ_VALIDACAO_PEDIDO_VENDA'),
            ('ORDEM_SECOES_MATRIZ_BL', 'ORDEM_SECOES_MATRIZ_PEDIDO_VENDA'),
            ('ROTULO_CLASSIFICACAO_RISCO_BL', 'ROTULO_CLASSIFICACAO_RISCO_PEDIDO_VENDA'),
            ('classificacaoRiscoBl', 'classificacaoRiscoPedidoVenda'),
            ('ClassificacaoRiscoBl', 'ClassificacaoRiscoPedidoVenda'),
            ('RegraMatrizBl', 'RegraMatrizPedidoVenda'),
            ('SecaoMatrizBl', 'SecaoMatrizPedidoVenda'),
            ('StatusChecklistMatrizBl', 'StatusChecklistMatrizPedidoVenda'),
            ('ItemChecklistMatrizBl', 'ItemChecklistMatrizPedidoVenda'),
            ('ParametrosChecklistMatrizBl', 'ParametrosChecklistMatrizPedidoVenda'),
            ('ScoreChecklistBl', 'ScoreChecklistPedidoVenda'),
            ('ehTipoBlChecklist', 'ehTipoPedidoVendaChecklist'),
            ('montarChecklistMatrizBl', 'montarChecklistMatrizPedidoVenda'),
            ('calcularScoreChecklistBl', 'calcularScoreChecklistPedidoVenda'),
            ('agruparChecklistBlPorSecao', 'agruparChecklistPedidoVendaPorSecao'),
            ('BlOpcaoChecklist', 'PedidoVendaOpcaoChecklist'),
            ('listarBlsChecklist', 'listarPedidosVendaChecklist'),
            ('ResumoBlChecklist', 'ResumoPedidoVendaChecklist'),
            ('percentualConformeChecklistBl', 'percentualConformeChecklistPedidoVenda'),
            ('montarResumoChecklistBls', 'montarResumoChecklistPedidosVenda'),
            ('combinarResumoGeralComBls', 'combinarResumoGeralComPedidosVenda'),
            ('BL9-05', 'PV9-05'),
            ('BL9-06', 'PV9-06'),
            ('document.billOfLadingNumber', 'document.salesOrderNumber'),
            ('document.masterBillOfLadingNumber', 'document.orderConfirmationNumber'),
            ('BL (Bill of Lading)', 'Pedido de Venda (SO / Order Confirmation)'),
            ('BL1–BL9', 'PV1–PV9'),
            ('BL', 'PV'),
            ('Bls', 'PedidosVenda'),
            ('bl)', 'pv)'),
            ('(bl', '(pv'),
        ],
        'tipo_fn': """/** Detecta Pedido de Venda (Sales Order / Order Confirmation). */
export function ehTipoPedidoVendaChecklist(tipo: string): boolean {
  const norm = tipo.toUpperCase()
  if (norm.includes('PURCHASE') || norm.includes('COMPRA')) return false
  return (
    norm.includes('SALES ORDER') ||
    norm.includes('PEDIDO DE VENDA') ||
    norm.includes('PEDIDO_VENDA') ||
    norm.includes('ORDER CONFIRMATION') ||
    norm.includes('ORDER ACKNOWLEDGMENT') ||
    norm.includes('ORDER ACKNOWLEDGEMENT') ||
    /\\bSO\\b/.test(norm)
  )
}""",
    },
]

BASE = Path(
    r'C:\Users\danie\worthree-ajuste-smartdoc-03\servicos-global\produto\smart-read\shared'
)

import re

for cfg in CONFIGS:
    out = BL
    out = re.sub(r'^/\*\*[\s\S]*?\*/', f'/**\n * {cfg["header"]}\n */', out, count=1)
    for old, new in cfg['replacements']:
        out = out.replace(old, new)
    out = re.sub(
        r'/\*\* Detecta[\s\S]*?export function ehTipo\w+Checklist\(tipo: string\): boolean \{[\s\S]*?\n\}',
        cfg['tipo_fn'],
        out,
        count=1,
    )
    (BASE / cfg['file']).write_text(out, encoding='utf-8')
    print('wrote', cfg['file'])
