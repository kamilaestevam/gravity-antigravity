/**
 * passo-1-validacao-codigo-pedido-venda-smart-read.ts — motor Código + Cross-Doc da matriz PV (PV1–PV9).
 */

import {
  regraMatrizPedidoVendaPorId,
  type RegraMatrizPedidoVenda,
} from './matriz-validacao-pedido-venda-smart-read.js'
import type {
  ContextoAuditoriaV1Leitura,
  DocumentoAnaliseRisco,
  RegraAuditoriaV1,
  ResumoRiscosAduaneirosLeitura,
  RiscoAduaneiroLeitura,
} from './analise-riscos-leitura-smart-read.js'
import {
  achatarCamposDadosLeitura,
  valorTextoComparacaoCampo,
} from './analise-riscos-leitura-smart-read.js'
import { ehTipoPedidoCompra } from './passo-1-validacao-codigo-pedido-compra-smart-read.js'

type DocumentoLeitura = {
  rotulo: string
  tipo: string
  mapa: Map<string, unknown>
  dados: Record<string, unknown>
}

type ItemLinha = {
  indice: number
  partNumber: string | null
  qty: number | null
  precoUnit: number | null
  totalLinha: number | null
}

const MOEDAS_ISO_4217 = new Set([
  'USD', 'EUR', 'GBP', 'BRL', 'JPY', 'CNY', 'CHF', 'CAD', 'AUD', 'MXN', 'ARS', 'CLP', 'COP', 'PEN',
])

const INCOTERMS_VALIDOS = new Set([
  'EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF',
])

const TOLERANCIA_NUMERICA = 0.02 // 2% — cruzamentos PV × PO × invoice

let contadorRiscoPv = 0

function criarRiscoPv(parcial: {
  regra: RegraMatrizPedidoVenda
  severidade: RiscoAduaneiroLeitura['severidade']
  categoria: RiscoAduaneiroLeitura['categoria']
  titulo: string
  motivo: string
  analise: string
  evidencias: RiscoAduaneiroLeitura['evidencias']
  status?: 'vermelho' | 'amarelo'
}): RiscoAduaneiroLeitura {
  contadorRiscoPv += 1
  return {
    id: `risco-pv-${contadorRiscoPv}`,
    origem: 'v1',
    severidade: parcial.severidade,
    categoria: parcial.categoria,
    titulo: parcial.titulo,
    motivo: parcial.motivo,
    analise: parcial.analise,
    evidencias: parcial.evidencias,
    secao_matriz: parcial.regra.secao,
    id_regra_matriz: parcial.regra.id,
    motor_validacao: parcial.regra.motor,
    status_matriz:
      parcial.status ?? (parcial.severidade === 'critico' ? 'vermelho' : 'amarelo'),
  }
}

function rotuloDocumento(nomeArquivo: string, tipo: string, indice: number): string {
  return `${nomeArquivo} · ${tipo.trim() || `Documento ${indice + 1}`}`
}

function coletarDocumentos(documentos: DocumentoAnaliseRisco[]): DocumentoLeitura[] {
  return documentos.map((doc) => ({
    rotulo: rotuloDocumento(doc.nome_arquivo, doc.tipo_documento, doc.indice),
    tipo: doc.tipo_documento.toUpperCase(),
    mapa: achatarCamposDadosLeitura(doc.dados),
    dados: doc.dados,
  }))
}

/** Detecta Pedido de Venda (Sales Order / Order Confirmation). */
export function ehTipoPedidoVenda(tipo: string): boolean {
  const norm = tipo.toUpperCase()
  if (norm.includes('PURCHASE') || norm.includes('COMPRA')) return false
  return (
    norm.includes('SALES ORDER') ||
    norm.includes('PEDIDO DE VENDA') ||
    norm.includes('PEDIDO_VENDA') ||
    norm.includes('ORDER CONFIRMATION') ||
    norm.includes('ORDER ACKNOWLEDGMENT') ||
    norm.includes('ORDER ACKNOWLEDGEMENT') ||
    /\bSO\b/.test(norm)
  )
}

function valorCampo(mapa: Map<string, unknown>, caminhos: string[]): string | null {
  for (const caminho of caminhos) {
    const direto = mapa.get(caminho)
    if (direto !== undefined) {
      const texto = valorTextoComparacaoCampo(direto)
      if (texto) return texto
    }
  }
  for (const [chave, valor] of mapa) {
    for (const caminho of caminhos) {
      const base = caminho.replace(/\[\]/g, '')
      if (chave.includes(base) || chave.toLowerCase().includes(caminho.toLowerCase())) {
        const texto = valorTextoComparacaoCampo(valor)
        if (texto) return texto
      }
    }
  }
  return null
}

function parseNumero(valor: string | null | undefined): number | null {
  if (!valor) return null
  const limpo = valor.replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.')
  const n = Number.parseFloat(limpo)
  return Number.isFinite(n) ? n : null
}

function parseData(valor: string | null): Date | null {
  if (!valor?.trim()) return null
  const iso = valor.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]))
  const br = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})/)
  if (br) return new Date(Number(br[3]), Number(br[2]) - 1, Number(br[1]))
  const d = new Date(valor)
  return Number.isNaN(d.getTime()) ? null : d
}

function normalizarReferencia(texto: string): string {
  return texto.replace(/[\s\-./#]/g, '').toUpperCase()
}

function referenciasCoincidem(a: string, b: string): boolean {
  const na = normalizarReferencia(a)
  const nb = normalizarReferencia(b)
  if (!na || !nb) return false
  return na === nb || na.includes(nb) || nb.includes(na)
}

function extrairIncoterm(texto: string | null): string | null {
  if (!texto) return null
  const match = texto.toUpperCase().match(/\b(EXW|FCA|CPT|CIP|DAP|DPU|DDP|FAS|FOB|CFR|CIF)\b/)
  return match?.[1] ?? texto.trim().toUpperCase().slice(0, 3)
}

function incotermsCoincidem(a: string | null, b: string | null): boolean {
  const ia = extrairIncoterm(a)
  const ib = extrairIncoterm(b)
  if (!ia || !ib) return true
  return ia === ib
}

function valoresProximos(a: number, b: number, tolerancia = TOLERANCIA_NUMERICA): boolean {
  if (a === b) return true
  const base = Math.max(Math.abs(a), Math.abs(b), 0.0001)
  return Math.abs(a - b) / base <= tolerancia
}

function extrairItens(dados: Record<string, unknown>): ItemLinha[] {
  const rows = dados.items ?? dados.itens ?? dados.lineItems
  if (!Array.isArray(rows)) return []
  return rows.map((row, indice) => {
    const r = row as Record<string, unknown>
    return {
      indice,
      partNumber: valorTextoComparacaoCampo(r.partNumber ?? r.sku ?? r.itemCode ?? r.productCode),
      qty: parseNumero(
        valorTextoComparacaoCampo(r.quantity ?? r.qty ?? r.itemQuantity ?? r.confirmedQuantity),
      ),
      precoUnit: parseNumero(
        valorTextoComparacaoCampo(r.unitPrice ?? r.price ?? r.itemUnitPriceWithCurrency),
      ),
      totalLinha: parseNumero(
        valorTextoComparacaoCampo(r.totalPrice ?? r.total ?? r.lineTotal ?? r.itemTotalPriceWithCurrency),
      ),
    }
  })
}

function somaQuantidadeItens(itens: ItemLinha[]): number | null {
  let soma = 0
  let tem = false
  for (const item of itens) {
    if (item.qty != null) {
      soma += item.qty
      tem = true
    }
  }
  return tem ? soma : null
}

function mediaPrecoUnitario(itens: ItemLinha[]): number | null {
  const comPreco = itens.filter((i) => i.precoUnit != null)
  if (comPreco.length === 0) return null
  const soma = comPreco.reduce((acc, i) => acc + (i.precoUnit ?? 0), 0)
  return soma / comPreco.length
}

function extrairNumeroPv(mapa: Map<string, unknown>): string | null {
  return valorCampo(mapa, [
    'document.salesOrderNumber',
    'salesOrderNumber',
    'document.orderConfirmationNumber',
    'orderConfirmationNumber',
    'document.documentNumber',
    'document.number',
  ])
}

function extrairReferenciaPo(mapa: Map<string, unknown>): string | null {
  return valorCampo(mapa, [
    'document.purchaseOrderReference',
    'purchaseOrderReference',
    'document.poNumber',
    'poNumber',
    'document.customerPurchaseOrder',
    'customerPurchaseOrder',
    'document.orderNumber',
  ])
}

function extrairTotal(mapa: Map<string, unknown>): number | null {
  return parseNumero(
    valorCampo(mapa, [
      'document.totalAmount',
      'totalAmount',
      'document.grandTotal',
      'grandTotal',
      'document.total',
      'total',
      'totals.grandTotal',
    ]),
  )
}

/** Passo 1 PV — motor Código + Cross-Doc: regras determinísticas da matriz PV1–PV9. */
export function executarPasso1ValidacaoCodigoPedidoVenda(
  documentosEntrada: DocumentoAnaliseRisco[],
): { resumo: ResumoRiscosAduaneirosLeitura; contexto: ContextoAuditoriaV1Leitura } {
  contadorRiscoPv = 0
  const riscos: RiscoAduaneiroLeitura[] = []
  const regras: RegraAuditoriaV1[] = []

  const todos = coletarDocumentos(documentosEntrada)
  const pedidosVenda = todos.filter((d) => ehTipoPedidoVenda(d.tipo))
  const pedidosCompra = todos.filter((d) => ehTipoPedidoCompra(d.tipo))
  const invoices = todos.filter((d) => d.tipo.includes('INVOICE'))

  function registrar(regraId: string, rotulo: string, passou: boolean, detalhe: string) {
    regras.push({ id: `${regraId}-${rotulo}`, passou, detalhe })
  }

  function falhar(params: {
    regraId: string
    doc: DocumentoLeitura
    titulo: string
    motivo: string
    analise: string
    campo: string
    valor?: string | null
    status?: 'vermelho' | 'amarelo'
    evidenciasExtras?: RiscoAduaneiroLeitura['evidencias']
  }) {
    const regra = regraMatrizPedidoVendaPorId(params.regraId)
    if (!regra) return
    const severidade =
      (params.status ?? (regra.severidade === 'bloq' ? 'vermelho' : 'amarelo')) === 'vermelho'
        ? 'critico'
        : 'atencao'
    riscos.push(
      criarRiscoPv({
        regra,
        severidade,
        categoria: 'documental',
        titulo: params.titulo,
        motivo: params.motivo,
        analise: params.analise,
        evidencias: [
          { documento: params.doc.rotulo, campo: params.campo, valor: params.valor ?? undefined },
          ...(params.evidenciasExtras ?? []),
        ],
        status: params.status ?? (regra.severidade === 'bloq' ? 'vermelho' : 'amarelo'),
      }),
    )
  }

  for (const pv of pedidosVenda) {
    const r = pv.rotulo
    const pcPrincipal = pedidosCompra[0] ?? null
    const invoicePrincipal = invoices[0] ?? null
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const itens = extrairItens(pv.dados)
    const itensPc = pcPrincipal ? extrairItens(pcPrincipal.dados) : []
    const itensInvoice = invoicePrincipal ? extrairItens(invoicePrincipal.dados) : []

    // ── PV1-01 — Número do pedido de venda ────────────────────────────────────
    const numeroPv = extrairNumeroPv(pv.mapa)
    if (numeroPv) {
      registrar('PV1-01', r, true, `Pedido de venda ${numeroPv} identificado`)
    } else {
      registrar('PV1-01', r, false, 'Número do pedido de venda não identificado na extração')
      falhar({
        regraId: 'PV1-01',
        doc: pv,
        titulo: 'Número do pedido de venda ausente',
        motivo: 'A extração não identificou o número único do sales order / order confirmation.',
        analise: 'O número do PV é requisito de rastreabilidade comercial (IN 680/06 art. 15, §1º).',
        campo: 'document.salesOrderNumber',
      })
    }

    // ── PV1-03 — Vínculo PV × PO × invoice (gate) ─────────────────────────────
    const refPoPv = extrairReferenciaPo(pv.mapa)
    const numeroPo = pcPrincipal
      ? valorCampo(pcPrincipal.mapa, [
          'document.purchaseOrderNumber',
          'purchaseOrderNumber',
          'document.orderNumber',
          'orderNumber',
          'document.poNumber',
        ])
      : null
    const poInvoice = invoicePrincipal
      ? valorCampo(invoicePrincipal.mapa, [
          'document.poNumber',
          'document.purchaseOrder',
          'poNumber',
          'purchaseOrder',
        ])
      : null
    const refPo = refPoPv ?? numeroPo
    if (refPo) {
      const coincidePo = !numeroPo || referenciasCoincidem(refPo, numeroPo)
      const coincideInvoice = !poInvoice || referenciasCoincidem(refPo, poInvoice)
      const ok = coincidePo && coincideInvoice
      registrar(
        'PV1-03',
        r,
        ok,
        ok
          ? `PV referencia PO ${refPo} coerente com dossiê`
          : `Referência ao PO (${refPo}) diverge do PC (${numeroPo ?? '—'}) ou invoice (${poInvoice ?? '—'})`,
      )
      if (!ok) {
        falhar({
          regraId: 'PV1-03',
          doc: pv,
          titulo: 'PV sem vínculo coerente com PO/invoice',
          motivo: `PV referencia PO ${refPo}; PC traz ${numeroPo ?? 'ausente'}; invoice ${poInvoice ?? 'ausente'}.`,
          analise:
            'Pedido de venda sem vínculo com PO/invoice é red flag de contrato não fechado (CISG art. 18; IN 680/06 art. 15).',
          campo: 'document.purchaseOrderReference',
          valor: refPo,
          evidenciasExtras: [
            ...(pcPrincipal && numeroPo
              ? [{ documento: pcPrincipal.rotulo, campo: 'document.purchaseOrderNumber', valor: numeroPo }]
              : []),
            ...(invoicePrincipal && poInvoice
              ? [{ documento: invoicePrincipal.rotulo, campo: 'document.poNumber', valor: poInvoice }]
              : []),
          ],
        })
      }
    } else {
      registrar('PV1-03', r, false, 'PV sem referência ao PO — red flag')
      falhar({
        regraId: 'PV1-03',
        doc: pv,
        titulo: 'PV sem referência ao pedido de compra',
        motivo: 'O pedido de venda não traz referência ao número do PO na extração.',
        analise: 'PV órfão indica aceite não vinculado ao pedido do importador (CISG art. 18).',
        campo: 'document.purchaseOrderReference',
      })
    }

    // ── PV1-04 — Data de emissão ──────────────────────────────────────────────
    const dataEmissaoTexto = valorCampo(pv.mapa, [
      'document.issueDate',
      'document.date',
      'issueDate',
      'date',
      'document.confirmationDate',
    ])
    const dataEmissao = parseData(dataEmissaoTexto)
    const dataPoTexto = pcPrincipal
      ? valorCampo(pcPrincipal.mapa, ['document.issueDate', 'document.date', 'issueDate'])
      : null
    const dataPo = parseData(dataPoTexto)
    const dataInvoiceTexto = invoicePrincipal
      ? valorCampo(invoicePrincipal.mapa, ['document.issueDate', 'document.date', 'issueDate'])
      : null
    const dataInvoice = parseData(dataInvoiceTexto)
    if (dataEmissao) {
      const futura = dataEmissao > hoje
      const posteriorPo = dataPo ? dataEmissao >= dataPo : true
      const anteriorInvoice = dataInvoice ? dataEmissao <= dataInvoice : true
      const ok = !futura && posteriorPo && anteriorInvoice
      registrar(
        'PV1-04',
        r,
        ok,
        ok
          ? `Emissão ${dataEmissaoTexto} coerente (PO → PV → invoice)`
          : futura
            ? `Data futura: ${dataEmissaoTexto}`
            : `Ordem cronológica divergente: PV ${dataEmissaoTexto}, PO ${dataPoTexto ?? '—'}, invoice ${dataInvoiceTexto ?? '—'}`,
      )
      if (!ok) {
        falhar({
          regraId: 'PV1-04',
          doc: pv,
          titulo: futura ? 'Data de emissão do PV no futuro' : 'Ordem cronológica PO → PV → invoice divergente',
          motivo: futura
            ? `O pedido de venda traz data futura (${dataEmissaoTexto}).`
            : `PV emitido em ${dataEmissaoTexto} fora da sequência PO (${dataPoTexto ?? '—'}) / invoice (${dataInvoiceTexto ?? '—'}).`,
          analise: 'A ordem esperada é PO → confirmação de venda → invoice (CISG art. 18).',
          campo: 'document.issueDate',
          valor: dataEmissaoTexto,
        })
      }
    } else {
      registrar('PV1-04', r, false, 'Data de emissão do PV não identificada na extração')
      falhar({
        regraId: 'PV1-04',
        doc: pv,
        titulo: 'Data de emissão do PV ausente',
        motivo: 'A extração não identificou a data de emissão do pedido de venda.',
        analise: 'A data de confirmação ancora a formação do contrato internacional.',
        campo: 'document.issueDate',
      })
    }

    // ── PV1-05 — Moeda ────────────────────────────────────────────────────────
    const moedaPv = valorCampo(pv.mapa, ['currency.type', 'currency', 'document.currency'])?.toUpperCase()
    const moedaPo = pcPrincipal
      ? valorCampo(pcPrincipal.mapa, ['currency.type', 'currency', 'document.currency'])?.toUpperCase()
      : null
    const moedaInvoice = invoicePrincipal
      ? valorCampo(invoicePrincipal.mapa, ['currency.type', 'currency', 'document.currency'])?.toUpperCase()
      : null
    const moedaOk = moedaPv != null && MOEDAS_ISO_4217.has(moedaPv)
    const moedaCoerentePo = !moedaPo || !moedaPv || moedaPv === moedaPo
    const moedaCoerenteInvoice = !moedaInvoice || !moedaPv || moedaPv === moedaInvoice
    registrar(
      'PV1-05',
      r,
      moedaOk && moedaCoerentePo && moedaCoerenteInvoice,
      moedaOk
        ? moedaCoerentePo && moedaCoerenteInvoice
          ? `Moeda ${moedaPv} coerente com PO e invoice`
          : `Moeda do PV (${moedaPv}) diverge do PO (${moedaPo ?? '—'}) ou invoice (${moedaInvoice ?? '—'})`
        : 'Moeda do PV ausente ou fora do ISO 4217',
    )
    if (!moedaOk) {
      falhar({
        regraId: 'PV1-05',
        doc: pv,
        titulo: 'Moeda do PV inválida ou ausente',
        motivo: moedaPv
          ? `Moeda «${moedaPv}» não reconhecida no padrão ISO 4217.`
          : 'Moeda do pedido de venda não identificada na extração.',
        analise: 'A moeda confirmada deve ser igual à do PO e da invoice (ISO 4217).',
        campo: 'currency',
        valor: moedaPv,
      })
    } else if (!moedaCoerentePo || !moedaCoerenteInvoice) {
      falhar({
        regraId: 'PV1-05',
        doc: pv,
        titulo: 'Moeda do PV diverge do PO ou invoice',
        motivo: `PV: ${moedaPv} · PO: ${moedaPo ?? '—'} · Invoice: ${moedaInvoice ?? '—'}.`,
        analise: 'Divergência de moeda entre documentos comerciais impede amarração cambial.',
        campo: 'currency',
        valor: moedaPv,
      })
    }

    // ── PV3-01 — Incoterm × PO × invoice (gate) ───────────────────────────────
    const incotermPv = valorCampo(pv.mapa, ['document.incoterm', 'incoterm', 'terms.incoterm'])
    const incotermPo = pcPrincipal
      ? valorCampo(pcPrincipal.mapa, ['document.incoterm', 'incoterm'])
      : null
    const incotermInvoice = invoicePrincipal
      ? valorCampo(invoicePrincipal.mapa, ['document.incoterm', 'incoterm'])
      : null
    if (incotermPv) {
      const sigla = extrairIncoterm(incotermPv)
      const siglaValida = sigla != null && INCOTERMS_VALIDOS.has(sigla)
      const coincidePo = !incotermPo || incotermsCoincidem(incotermPv, incotermPo)
      const coincideInvoice = !incotermInvoice || incotermsCoincidem(incotermPv, incotermInvoice)
      const ok = siglaValida && coincidePo && coincideInvoice
      registrar(
        'PV3-01',
        r,
        ok,
        ok
          ? `Incoterm ${incotermPv} confirmado coerente com PO/invoice`
          : `Incoterm do PV (${incotermPv}) diverge ou é inválido`,
      )
      if (!siglaValida || !coincidePo || !coincideInvoice) {
        falhar({
          regraId: 'PV3-01',
          doc: pv,
          titulo: !siglaValida
            ? 'Incoterm confirmado inválido'
            : 'Incoterm confirmado diverge do PO ou invoice',
          motivo: `PV: ${incotermPv} · PO: ${incotermPo ?? '—'} · Invoice: ${incotermInvoice ?? '—'}.`,
          analise:
            'Incoterm confirmado diferente do pedido pode configurar contraproposta (CISG art. 19; Incoterms® 2020).',
          campo: 'document.incoterm',
          valor: incotermPv,
        })
      }
    } else {
      registrar('PV3-01', r, false, 'Incoterm do PV não identificado na extração')
      falhar({
        regraId: 'PV3-01',
        doc: pv,
        titulo: 'Incoterm ausente no pedido de venda',
        motivo: 'A extração não identificou Incoterm confirmado no PV.',
        analise: 'Incoterm confirmado é termo essencial do aceite (Incoterms® 2020).',
        campo: 'document.incoterm',
      })
    }

    // ── PV4-03 — Quantidade confirmada × PO × invoice (gate) ──────────────────
    const qtdPv = somaQuantidadeItens(itens) ?? parseNumero(
      valorCampo(pv.mapa, ['document.totalQuantity', 'totals.quantity', 'quantity']),
    )
    const qtdPo =
      somaQuantidadeItens(itensPc) ??
      (pcPrincipal
        ? parseNumero(valorCampo(pcPrincipal.mapa, ['document.totalQuantity', 'totals.quantity']))
        : null)
    const qtdInvoice =
      somaQuantidadeItens(itensInvoice) ??
      (invoicePrincipal
        ? parseNumero(valorCampo(invoicePrincipal.mapa, ['document.totalQuantity', 'totals.quantity']))
        : null)
    if (qtdPv != null && (qtdPo != null || qtdInvoice != null)) {
      const okPo = qtdPo == null || valoresProximos(qtdPv, qtdPo)
      const okInvoice = qtdInvoice == null || valoresProximos(qtdPv, qtdInvoice)
      const ok = okPo && okInvoice
      registrar(
        'PV4-03',
        r,
        ok,
        ok
          ? `Quantidade confirmada (${qtdPv}) coerente com PO (${qtdPo ?? '—'}) e invoice (${qtdInvoice ?? '—'})`
          : `Quantidade confirmada (${qtdPv}) diverge do PO (${qtdPo ?? '—'}) ou invoice (${qtdInvoice ?? '—'})`,
      )
      if (!ok) {
        falhar({
          regraId: 'PV4-03',
          doc: pv,
          titulo: 'Quantidade confirmada diverge do PO ou invoice',
          motivo: `PV: ${qtdPv} · PO: ${qtdPo ?? '—'} · Invoice: ${qtdInvoice ?? '—'}.`,
          analise: 'Quantidade confirmada deve casar com a pedida e a faturada (CISG art. 19).',
          campo: 'items[].quantity',
          valor: String(qtdPv),
        })
      }
    } else {
      registrar('PV4-03', r, true, 'N/A — quantidade do PV e/ou referências não disponíveis')
    }

    // ── PV4-04 — Preço unitário confirmado × PO × invoice (gate) ──────────────
    const precoPv = mediaPrecoUnitario(itens) ?? parseNumero(
      valorCampo(pv.mapa, ['document.unitPrice', 'items[].unitPrice']),
    )
    const precoPo =
      mediaPrecoUnitario(itensPc) ??
      (pcPrincipal ? parseNumero(valorCampo(pcPrincipal.mapa, ['document.unitPrice'])) : null)
    const precoInvoice =
      mediaPrecoUnitario(itensInvoice) ??
      (invoicePrincipal
        ? parseNumero(valorCampo(invoicePrincipal.mapa, ['document.unitPrice']))
        : null)
    if (precoPv != null && (precoPo != null || precoInvoice != null)) {
      const okPo = precoPo == null || valoresProximos(precoPv, precoPo)
      const okInvoice = precoInvoice == null || valoresProximos(precoPv, precoInvoice)
      const ok = okPo && okInvoice
      registrar(
        'PV4-04',
        r,
        ok,
        ok
          ? `Preço unitário confirmado (${precoPv}) coerente`
          : `Preço confirmado (${precoPv}) diverge do PO (${precoPo ?? '—'}) ou invoice (${precoInvoice ?? '—'})`,
      )
      if (!ok) {
        falhar({
          regraId: 'PV4-04',
          doc: pv,
          titulo: 'Preço unitário confirmado diverge do PO ou invoice',
          motivo: `PV: ${precoPv} · PO: ${precoPo ?? '—'} · Invoice: ${precoInvoice ?? '—'} (tolerância 2%).`,
          analise:
            'Divergência de preço confirmado é red flag de valoração (AVA-GATT art. 1º; CISG art. 19).',
          campo: 'items[].unitPrice',
          valor: String(precoPv),
        })
      }
    } else {
      registrar('PV4-04', r, true, 'N/A — preço unitário do PV e/ou referências não disponíveis')
    }

    // ── PV5-01 — Multiplicação de linha ───────────────────────────────────────
    let linhasVerificaveis = 0
    let linhasDivergentes = 0
    for (const item of itens) {
      if (item.qty != null && item.precoUnit != null && item.totalLinha != null) {
        linhasVerificaveis += 1
        const esperado = item.qty * item.precoUnit
        if (!valoresProximos(esperado, item.totalLinha)) linhasDivergentes += 1
      }
    }
    if (linhasVerificaveis > 0) {
      const ok = linhasDivergentes === 0
      registrar(
        'PV5-01',
        r,
        ok,
        ok
          ? `${linhasVerificaveis} linha(s) com multiplicação coerente`
          : `${linhasDivergentes}/${linhasVerificaveis} linha(s) com qtd × preço ≠ total`,
      )
      if (!ok) {
        falhar({
          regraId: 'PV5-01',
          doc: pv,
          titulo: 'Multiplicação de linha inconsistente no PV',
          motivo: `${linhasDivergentes} linha(s) onde quantidade × preço unitário ≠ total da linha.`,
          analise: 'Inconsistência aritmética no pedido de venda compromete valoração e câmbio.',
          campo: 'items[].unitPrice',
        })
      }
    } else {
      registrar('PV5-01', r, true, 'N/A — linhas com qtd, preço e total não disponíveis')
    }

    // ── PV5-02 — Somatório e total ───────────────────────────────────────────
    let somaLinhas = 0
    let linhasComTotal = 0
    for (const item of itens) {
      if (item.totalLinha != null) {
        somaLinhas += item.totalLinha
        linhasComTotal += 1
      }
    }
    const totalPv = extrairTotal(pv.mapa)
    if (linhasComTotal > 0 && totalPv != null) {
      const ok = valoresProximos(somaLinhas, totalPv)
      registrar(
        'PV5-02',
        r,
        ok,
        ok
          ? `Σ linhas (${somaLinhas}) = total PV (${totalPv})`
          : `Σ linhas (${somaLinhas}) diverge do total PV (${totalPv})`,
      )
      if (!ok) {
        falhar({
          regraId: 'PV5-02',
          doc: pv,
          titulo: 'Total do PV diverge da soma das linhas',
          motivo: `Soma das linhas: ${somaLinhas} · Total confirmado: ${totalPv}.`,
          analise: 'O total confirmado deve fechar com a soma das linhas.',
          campo: 'document.totalAmount',
          valor: String(totalPv),
        })
      }
    } else {
      registrar('PV5-02', r, true, 'N/A — soma de linhas e/ou total do PV não disponíveis')
    }

    // ── PV5-03 — Total PV × PO × invoice (gate) ───────────────────────────────
    const totalPo = pcPrincipal ? extrairTotal(pcPrincipal.mapa) : null
    const totalInvoice = invoicePrincipal ? extrairTotal(invoicePrincipal.mapa) : null
    if (totalPv != null && (totalPo != null || totalInvoice != null)) {
      const okPo = totalPo == null || valoresProximos(totalPv, totalPo)
      const okInvoice = totalInvoice == null || valoresProximos(totalPv, totalInvoice)
      const ok = okPo && okInvoice
      registrar(
        'PV5-03',
        r,
        ok,
        ok
          ? `Total PV (${totalPv}) coerente com PO (${totalPo ?? '—'}) e invoice (${totalInvoice ?? '—'})`
          : `Total PV (${totalPv}) diverge do PO (${totalPo ?? '—'}) ou invoice (${totalInvoice ?? '—'})`,
      )
      if (!ok) {
        falhar({
          regraId: 'PV5-03',
          doc: pv,
          titulo: 'Total confirmado diverge do PO ou invoice',
          motivo: `PV: ${totalPv} · PO: ${totalPo ?? '—'} · Invoice: ${totalInvoice ?? '—'} (tolerância 2%).`,
          analise:
            'Divergência global de valor entre PV, PO e invoice é red flag de valoração (AVA-GATT art. 1º; RA art. 711).',
          campo: 'document.totalAmount',
          valor: String(totalPv),
        })
      }
    } else {
      registrar('PV5-03', r, true, 'N/A — total do PV e/ou referências não disponíveis')
    }

    // ── PV7-02 — Aceite com modificações / contraproposta (gate) ──────────────
    const divergenciasMateriais: string[] = []
    if (incotermPv && incotermPo && !incotermsCoincidem(incotermPv, incotermPo)) {
      divergenciasMateriais.push(`Incoterm PV (${incotermPv}) ≠ PO (${incotermPo})`)
    }
    if (qtdPv != null && qtdPo != null && !valoresProximos(qtdPv, qtdPo)) {
      divergenciasMateriais.push(`Quantidade PV (${qtdPv}) ≠ PO (${qtdPo})`)
    }
    if (precoPv != null && precoPo != null && !valoresProximos(precoPv, precoPo)) {
      divergenciasMateriais.push(`Preço PV (${precoPv}) ≠ PO (${precoPo})`)
    }
    if (totalPv != null && totalPo != null && !valoresProximos(totalPv, totalPo)) {
      divergenciasMateriais.push(`Total PV (${totalPv}) ≠ PO (${totalPo})`)
    }
    const okContraproposta = divergenciasMateriais.length === 0
    registrar(
      'PV7-02',
      r,
      okContraproposta,
      okContraproposta
        ? 'Sem divergência material PO↔PV — aceite presumivelmente válido'
        : `Divergências materiais PO↔PV: ${divergenciasMateriais.join('; ')}`,
    )
    if (!okContraproposta) {
      falhar({
        regraId: 'PV7-02',
        doc: pv,
        titulo: 'Possível contraproposta (aceite com modificações)',
        motivo: divergenciasMateriais.join(' · '),
        analise:
          'Divergências materiais entre PO e PV configuram contraproposta CISG art. 19 — contrato pode não estar fechado.',
        campo: 'document.totalAmount',
        evidenciasExtras: pcPrincipal
          ? [{ documento: pcPrincipal.rotulo, campo: 'document.purchaseOrderNumber', valor: numeroPo }]
          : [],
      })
    }

    // ── PV9-04 — Risco consolidado de valoração/contrato (gate) ───────────────
    const falhasDoPv = riscos.filter((risco) =>
      risco.evidencias.some((e) => e.documento === r),
    )
    const gatesDoPv = falhasDoPv.filter((risco) => {
      const regra = risco.id_regra_matriz
        ? regraMatrizPedidoVendaPorId(risco.id_regra_matriz)
        : undefined
      return regra?.severidade === 'bloq' && risco.status_matriz === 'vermelho'
    })
    registrar(
      'PV9-04',
      r,
      gatesDoPv.length === 0,
      gatesDoPv.length === 0
        ? 'Sem gate disparado — risco de contrato/valoração controlável'
        : `${gatesDoPv.length} gate(s) disparado(s) — risco de contrato, valoração ou câmbio`,
    )
    if (gatesDoPv.length > 0) {
      falhar({
        regraId: 'PV9-04',
        doc: pv,
        titulo: 'Risco consolidado de contrato, valoração ou câmbio',
        motivo: `${gatesDoPv.length} gate(s) falharam: ${gatesDoPv.map((g) => g.id_regra_matriz).join(', ')}.`,
        analise:
          'Divergências materiais ou pagamento a terceiro indicam contrato não fechado ou valoração incorreta (CISG art. 19; AVA-GATT; DL 1.455/76 art. 23).',
        campo: 'document.totalAmount',
      })
    }
  }

  const criticos = riscos.filter((r) => r.severidade === 'critico').length
  const atencao = riscos.filter((r) => r.severidade === 'atencao').length
  const informativos = riscos.filter((r) => r.severidade === 'informativo').length

  return {
    resumo: { riscos, total: riscos.length, criticos, atencao, informativos },
    contexto: { regras, ncms_encontrados: [], tributos_ncm: [] },
  }
}
