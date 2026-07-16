/**
 * passo-1-validacao-codigo-pedido-compra-smart-read.ts — motor Código + Cross-Doc da matriz PC (PC1–PC9).
 */

import {
  regraMatrizPedidoCompraPorId,
  type RegraMatrizPedidoCompra,
} from './matriz-validacao-pedido-compra-smart-read.js'
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

const TOLERANCIA_NUMERICA = 0.02 // 2% — cruzamentos PO × invoice/PV

let contadorRiscoPc = 0

function criarRiscoPc(parcial: {
  regra: RegraMatrizPedidoCompra
  severidade: RiscoAduaneiroLeitura['severidade']
  categoria: RiscoAduaneiroLeitura['categoria']
  titulo: string
  motivo: string
  analise: string
  evidencias: RiscoAduaneiroLeitura['evidencias']
  status?: 'vermelho' | 'amarelo'
}): RiscoAduaneiroLeitura {
  contadorRiscoPc += 1
  return {
    id: `risco-pc-${contadorRiscoPc}`,
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

/** Detecta Pedido de Compra (Purchase Order / PO). */
export function ehTipoPedidoCompra(tipo: string): boolean {
  const norm = tipo.toUpperCase()
  if (norm.includes('SALES') || norm.includes('VENDA') || norm.includes('ORDER CONFIRMATION')) return false
  return (
    norm.includes('PURCHASE ORDER') ||
    norm.includes('PEDIDO DE COMPRA') ||
    norm.includes('PEDIDO_COMPRA') ||
    (/\bPO\b/.test(norm) && !norm.includes('PROFORMA'))
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
        valorTextoComparacaoCampo(r.quantity ?? r.qty ?? r.itemQuantity ?? r.orderedQuantity),
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

function extrairNumeroPo(mapa: Map<string, unknown>): string | null {
  return valorCampo(mapa, [
    'document.purchaseOrderNumber',
    'purchaseOrderNumber',
    'document.orderNumber',
    'orderNumber',
    'document.poNumber',
    'poNumber',
    'document.documentNumber',
    'document.number',
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

/** Passo 1 PC — motor Código + Cross-Doc: regras determinísticas da matriz PC1–PC9. */
export function executarPasso1ValidacaoCodigoPedidoCompra(
  documentosEntrada: DocumentoAnaliseRisco[],
): { resumo: ResumoRiscosAduaneirosLeitura; contexto: ContextoAuditoriaV1Leitura } {
  contadorRiscoPc = 0
  const riscos: RiscoAduaneiroLeitura[] = []
  const regras: RegraAuditoriaV1[] = []

  const todos = coletarDocumentos(documentosEntrada)
  const pedidos = todos.filter((d) => ehTipoPedidoCompra(d.tipo))
  const invoices = todos.filter((d) => d.tipo.includes('INVOICE'))
  const pedidosVenda = todos.filter((d) => ehTipoPedidoVendaInterno(d.tipo))

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
    const regra = regraMatrizPedidoCompraPorId(params.regraId)
    if (!regra) return
    const severidade =
      (params.status ?? (regra.severidade === 'bloq' ? 'vermelho' : 'amarelo')) === 'vermelho'
        ? 'critico'
        : 'atencao'
    riscos.push(
      criarRiscoPc({
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

  for (const pc of pedidos) {
    const r = pc.rotulo
    const invoicePrincipal = invoices[0] ?? null
    const pvPrincipal = pedidosVenda[0] ?? null
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const itens = extrairItens(pc.dados)

    // ── PC1-01 — Número do PO ─────────────────────────────────────────────────
    const numeroPo = extrairNumeroPo(pc.mapa)
    if (numeroPo) {
      registrar('PC1-01', r, true, `PO ${numeroPo} identificado`)
    } else {
      registrar('PC1-01', r, false, 'Número do pedido de compra não identificado na extração')
      falhar({
        regraId: 'PC1-01',
        doc: pc,
        titulo: 'Número do PO ausente',
        motivo: 'A extração não identificou o número único do pedido de compra.',
        analise: 'O número do PO é requisito de rastreabilidade comercial e aduaneira (IN 680/06 art. 15, §1º).',
        campo: 'document.purchaseOrderNumber',
      })
    }

    // ── PC1-02 — Data de emissão ──────────────────────────────────────────────
    const dataEmissaoTexto = valorCampo(pc.mapa, [
      'document.issueDate',
      'document.date',
      'issueDate',
      'date',
      'document.orderDate',
    ])
    const dataEmissao = parseData(dataEmissaoTexto)
    const dataInvoiceTexto = invoicePrincipal
      ? valorCampo(invoicePrincipal.mapa, ['document.issueDate', 'document.date', 'issueDate'])
      : null
    const dataInvoice = parseData(dataInvoiceTexto)
    if (dataEmissao) {
      const futura = dataEmissao > hoje
      const anteriorInvoice = dataInvoice ? dataEmissao < dataInvoice : true
      const ok = !futura && anteriorInvoice
      registrar(
        'PC1-02',
        r,
        ok,
        ok
          ? `Emissão ${dataEmissaoTexto} coerente (anterior à invoice quando disponível)`
          : futura
            ? `Data de emissão futura: ${dataEmissaoTexto}`
            : `Emissão do PO (${dataEmissaoTexto}) posterior à invoice (${dataInvoiceTexto})`,
      )
      if (!ok) {
        falhar({
          regraId: 'PC1-02',
          doc: pc,
          titulo: futura ? 'Data de emissão do PO no futuro' : 'PO emitido após a invoice',
          motivo: futura
            ? `O pedido de compra traz data futura (${dataEmissaoTexto}).`
            : `O PO foi emitido em ${dataEmissaoTexto}, após a invoice (${dataInvoiceTexto}).`,
          analise: 'A ordem cronológica esperada é PO → confirmação/invoice → embarque (CISG art. 14).',
          campo: 'document.issueDate',
          valor: dataEmissaoTexto,
          evidenciasExtras: invoicePrincipal
            ? [{ documento: invoicePrincipal.rotulo, campo: 'document.issueDate', valor: dataInvoiceTexto }]
            : [],
        })
      }
    } else {
      registrar('PC1-02', r, false, 'Data de emissão do PO não identificada na extração')
      falhar({
        regraId: 'PC1-02',
        doc: pc,
        titulo: 'Data de emissão do PO ausente',
        motivo: 'A extração não identificou a data de emissão do pedido de compra.',
        analise: 'A data de emissão ancora a formação do contrato e a ordem cronológica do dossiê.',
        campo: 'document.issueDate',
      })
    }

    // ── PC1-03 — Vínculo PO × invoice × PV (gate) ───────────────────────────
    const poInvoice = invoicePrincipal
      ? valorCampo(invoicePrincipal.mapa, [
          'document.poNumber',
          'document.purchaseOrder',
          'poNumber',
          'purchaseOrder',
          'items[].poNumber',
        ])
      : null
    const poPv = pvPrincipal
      ? valorCampo(pvPrincipal.mapa, [
          'document.purchaseOrderReference',
          'purchaseOrderReference',
          'document.poNumber',
          'poNumber',
          'document.customerPurchaseOrder',
        ])
      : null
    if (numeroPo) {
      const coincideInvoice = !poInvoice || referenciasCoincidem(numeroPo, poInvoice)
      const coincidePv = !poPv || referenciasCoincidem(numeroPo, poPv)
      const ok = coincideInvoice && coincidePv
      registrar(
        'PC1-03',
        r,
        ok,
        ok
          ? `PO ${numeroPo} vinculado ao dossiê`
          : `PO ${numeroPo} diverge da referência na invoice (${poInvoice ?? '—'}) ou PV (${poPv ?? '—'})`,
      )
      if (!ok) {
        falhar({
          regraId: 'PC1-03',
          doc: pc,
          titulo: 'PO órfão ou divergente no dossiê',
          motivo: `O PO ${numeroPo} não casa com a referência na invoice (${poInvoice ?? 'ausente'}) ou no pedido de venda (${poPv ?? 'ausente'}).`,
          analise:
            'Pedido de compra sem vínculo com invoice/PV é red flag de interposição ou valoração (IN 680/06 art. 15, §1º).',
          campo: 'document.purchaseOrderNumber',
          valor: numeroPo,
          evidenciasExtras: [
            ...(invoicePrincipal && poInvoice
              ? [{ documento: invoicePrincipal.rotulo, campo: 'document.poNumber', valor: poInvoice }]
              : []),
            ...(pvPrincipal && poPv
              ? [{ documento: pvPrincipal.rotulo, campo: 'document.purchaseOrderReference', valor: poPv }]
              : []),
          ],
        })
      }
    } else {
      registrar('PC1-03', r, true, 'N/A — número do PO ausente para cruzar')
    }

    // ── PC1-05 — Moeda do pedido ──────────────────────────────────────────────
    const moedaPo = valorCampo(pc.mapa, [
      'currency.type',
      'currency',
      'document.currency',
    ])?.toUpperCase()
    const moedaInvoice = invoicePrincipal
      ? valorCampo(invoicePrincipal.mapa, ['currency.type', 'currency', 'document.currency'])?.toUpperCase()
      : null
    const moedaOk = moedaPo != null && MOEDAS_ISO_4217.has(moedaPo)
    const moedaCoerente = !moedaInvoice || !moedaPo || moedaPo === moedaInvoice
    registrar(
      'PC1-05',
      r,
      moedaOk && moedaCoerente,
      moedaOk
        ? moedaCoerente
          ? `Moeda ${moedaPo} coerente com invoice`
          : `Moeda do PO (${moedaPo}) difere da invoice (${moedaInvoice})`
        : 'Moeda do PO ausente ou fora do ISO 4217',
    )
    if (!moedaOk) {
      falhar({
        regraId: 'PC1-05',
        doc: pc,
        titulo: 'Moeda do PO inválida ou ausente',
        motivo: moedaPo
          ? `Moeda «${moedaPo}» não reconhecida no padrão ISO 4217.`
          : 'Moeda do pedido de compra não identificada na extração.',
        analise: 'A moeda do PO deve ser explícita e coerente com invoice e câmbio (ISO 4217).',
        campo: 'currency',
        valor: moedaPo,
      })
    } else if (!moedaCoerente) {
      falhar({
        regraId: 'PC1-05',
        doc: pc,
        titulo: 'Moeda do PO diverge da invoice',
        motivo: `PO em ${moedaPo}, invoice em ${moedaInvoice}.`,
        analise: 'Divergência de moeda entre PO e invoice impede amarração cambial e valoração.',
        campo: 'currency',
        valor: moedaPo,
        evidenciasExtras: invoicePrincipal
          ? [{ documento: invoicePrincipal.rotulo, campo: 'currency', valor: moedaInvoice }]
          : [],
      })
    }

    // ── PC3-01 — Incoterm × invoice/PV ──────────────────────────────────────
    const incotermPo = valorCampo(pc.mapa, ['document.incoterm', 'incoterm', 'terms.incoterm'])
    const incotermInvoice = invoicePrincipal
      ? valorCampo(invoicePrincipal.mapa, ['document.incoterm', 'incoterm'])
      : null
    const incotermPv = pvPrincipal
      ? valorCampo(pvPrincipal.mapa, ['document.incoterm', 'incoterm'])
      : null
    if (incotermPo) {
      const sigla = extrairIncoterm(incotermPo)
      const siglaValida = sigla != null && INCOTERMS_VALIDOS.has(sigla)
      const coincideInvoice = !incotermInvoice || incotermsCoincidem(incotermPo, incotermInvoice)
      const coincidePv = !incotermPv || incotermsCoincidem(incotermPo, incotermPv)
      const ok = siglaValida && coincideInvoice && coincidePv
      registrar(
        'PC3-01',
        r,
        ok,
        ok
          ? `Incoterm ${incotermPo} coerente com invoice/PV`
          : `Incoterm do PO (${incotermPo}) diverge ou é inválido`,
      )
      if (!siglaValida) {
        falhar({
          regraId: 'PC3-01',
          doc: pc,
          titulo: 'Incoterm do PO inválido',
          motivo: `Incoterm «${incotermPo}» não é sigla Incoterms® 2020 reconhecida.`,
          analise: 'Incoterm define transferência de risco, frete e seguro na importação (AVA-GATT art. 8º).',
          campo: 'document.incoterm',
          valor: incotermPo,
        })
      } else if (!coincideInvoice || !coincidePv) {
        falhar({
          regraId: 'PC3-01',
          doc: pc,
          titulo: 'Incoterm do PO diverge da invoice ou PV',
          motivo: `PO declara ${incotermPo}; invoice ${incotermInvoice ?? '—'}; PV ${incotermPv ?? '—'}.`,
          analise: 'Incoterm deve ser consistente em todo o dossiê comercial.',
          campo: 'document.incoterm',
          valor: incotermPo,
          evidenciasExtras: [
            ...(invoicePrincipal && incotermInvoice
              ? [{ documento: invoicePrincipal.rotulo, campo: 'document.incoterm', valor: incotermInvoice }]
              : []),
            ...(pvPrincipal && incotermPv
              ? [{ documento: pvPrincipal.rotulo, campo: 'document.incoterm', valor: incotermPv }]
              : []),
          ],
        })
      }
    } else {
      registrar('PC3-01', r, false, 'Incoterm do PO não identificado na extração')
      falhar({
        regraId: 'PC3-01',
        doc: pc,
        titulo: 'Incoterm ausente no PO',
        motivo: 'A extração não identificou Incoterm no pedido de compra.',
        analise: 'Incoterm é termo essencial do contrato internacional (Incoterms® 2020).',
        campo: 'document.incoterm',
      })
    }

    // ── PC4-03 — Quantidade × invoice (invoice ≤ PO) ──────────────────────────
    const qtdPo = somaQuantidadeItens(itens) ?? parseNumero(
      valorCampo(pc.mapa, ['document.totalQuantity', 'totals.quantity', 'quantity']),
    )
    const itensInvoice = invoicePrincipal ? extrairItens(invoicePrincipal.dados) : []
    const qtdInvoice =
      somaQuantidadeItens(itensInvoice) ??
      (invoicePrincipal
        ? parseNumero(
            valorCampo(invoicePrincipal.mapa, [
              'document.totalQuantity',
              'totals.quantity',
              'goods.totalQuantity',
            ]),
          )
        : null)
    if (qtdPo != null && qtdInvoice != null) {
      const ok = qtdInvoice <= qtdPo || valoresProximos(qtdInvoice, qtdPo)
      registrar(
        'PC4-03',
        r,
        ok,
        ok
          ? `Quantidade invoice (${qtdInvoice}) ≤ PO (${qtdPo})`
          : `Quantidade faturada (${qtdInvoice}) excede o pedido (${qtdPo})`,
      )
      if (!ok) {
        falhar({
          regraId: 'PC4-03',
          doc: pc,
          titulo: 'Quantidade faturada excede o PO',
          motivo: `O PO prevê ${qtdPo} unidades, mas a invoice declara ${qtdInvoice}.`,
          analise: 'A invoice não deve exceder a quantidade acordada no pedido (CISG art. 35).',
          campo: 'items[].quantity',
          valor: String(qtdPo),
          evidenciasExtras: invoicePrincipal
            ? [{ documento: invoicePrincipal.rotulo, campo: 'items[].quantity', valor: String(qtdInvoice) }]
            : [],
        })
      }
    } else {
      registrar('PC4-03', r, true, 'N/A — quantidade do PO e/ou invoice não disponível para cruzar')
    }

    // ── PC4-04 — Preço unitário × invoice (gate) ──────────────────────────────
    const precoPo = mediaPrecoUnitario(itens) ?? parseNumero(
      valorCampo(pc.mapa, ['document.unitPrice', 'items[].unitPrice']),
    )
    const precoInvoice =
      mediaPrecoUnitario(itensInvoice) ??
      (invoicePrincipal
        ? parseNumero(valorCampo(invoicePrincipal.mapa, ['document.unitPrice', 'items[].unitPrice']))
        : null)
    if (precoPo != null && precoInvoice != null) {
      const ok = valoresProximos(precoPo, precoInvoice)
      registrar(
        'PC4-04',
        r,
        ok,
        ok
          ? `Preço unitário PO (${precoPo}) coerente com invoice (${precoInvoice})`
          : `Preço unitário PO (${precoPo}) diverge da invoice (${precoInvoice})`,
      )
      if (!ok) {
        falhar({
          regraId: 'PC4-04',
          doc: pc,
          titulo: 'Preço unitário do PO diverge da invoice',
          motivo: `PO: ${precoPo} · Invoice: ${precoInvoice} (tolerância 2%).`,
          analise:
            'Divergência de preço unitário é red flag de valoração aduaneira (AVA-GATT art. 1º; RA art. 711).',
          campo: 'items[].unitPrice',
          valor: String(precoPo),
          evidenciasExtras: invoicePrincipal
            ? [{ documento: invoicePrincipal.rotulo, campo: 'items[].unitPrice', valor: String(precoInvoice) }]
            : [],
        })
      }
    } else {
      registrar('PC4-04', r, true, 'N/A — preço unitário do PO e/ou invoice não disponível para cruzar')
    }

    // ── PC5-01 — Multiplicação de linha ───────────────────────────────────────
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
        'PC5-01',
        r,
        ok,
        ok
          ? `${linhasVerificaveis} linha(s) com multiplicação coerente`
          : `${linhasDivergentes}/${linhasVerificaveis} linha(s) com qtd × preço ≠ total`,
      )
      if (!ok) {
        falhar({
          regraId: 'PC5-01',
          doc: pc,
          titulo: 'Multiplicação de linha inconsistente no PO',
          motivo: `${linhasDivergentes} linha(s) onde quantidade × preço unitário ≠ total da linha.`,
          analise: 'Inconsistência aritmética no PO compromete a valoração e o câmbio.',
          campo: 'items[].unitPrice',
        })
      }
    } else {
      registrar('PC5-01', r, true, 'N/A — linhas com qtd, preço e total não disponíveis')
    }

    // ── PC5-02 — Somatório e total ───────────────────────────────────────────
    let somaLinhas = 0
    let linhasComTotal = 0
    for (const item of itens) {
      if (item.totalLinha != null) {
        somaLinhas += item.totalLinha
        linhasComTotal += 1
      }
    }
    const totalPo = extrairTotal(pc.mapa)
    if (linhasComTotal > 0 && totalPo != null) {
      const ok = valoresProximos(somaLinhas, totalPo)
      registrar(
        'PC5-02',
        r,
        ok,
        ok
          ? `Σ linhas (${somaLinhas}) = total PO (${totalPo})`
          : `Σ linhas (${somaLinhas}) diverge do total PO (${totalPo})`,
      )
      if (!ok) {
        falhar({
          regraId: 'PC5-02',
          doc: pc,
          titulo: 'Total do PO diverge da soma das linhas',
          motivo: `Soma das linhas: ${somaLinhas} · Total declarado: ${totalPo}.`,
          analise: 'O total do pedido deve fechar com a soma das linhas (consistência aritmética).',
          campo: 'document.totalAmount',
          valor: String(totalPo),
        })
      }
    } else {
      registrar('PC5-02', r, true, 'N/A — soma de linhas e/ou total do PO não disponíveis')
    }

    // ── PC5-03 — Total PO × total invoice (gate) ──────────────────────────────
    const totalInvoice = invoicePrincipal ? extrairTotal(invoicePrincipal.mapa) : null
    if (totalPo != null && totalInvoice != null) {
      const ok = valoresProximos(totalPo, totalInvoice)
      registrar(
        'PC5-03',
        r,
        ok,
        ok
          ? `Total PO (${totalPo}) coerente com invoice (${totalInvoice})`
          : `Total PO (${totalPo}) diverge da invoice (${totalInvoice})`,
      )
      if (!ok) {
        falhar({
          regraId: 'PC5-03',
          doc: pc,
          titulo: 'Total do PO diverge da invoice',
          motivo: `PO: ${totalPo} · Invoice: ${totalInvoice} (tolerância 2%).`,
          analise:
            'Divergência global de valor é red flag de valoração aduaneira (AVA-GATT art. 1º; RA art. 711).',
          campo: 'document.totalAmount',
          valor: String(totalPo),
          evidenciasExtras: invoicePrincipal
            ? [{ documento: invoicePrincipal.rotulo, campo: 'document.totalAmount', valor: String(totalInvoice) }]
            : [],
        })
      }
    } else {
      registrar('PC5-03', r, true, 'N/A — total do PO e/ou invoice não disponível para cruzar')
    }

    // ── PC9-04 — Risco consolidado de valoração (gate) ───────────────────────
    const falhasDoPc = riscos.filter((risco) =>
      risco.evidencias.some((e) => e.documento === r),
    )
    const gatesDoPc = falhasDoPc.filter((risco) => {
      const regra = risco.id_regra_matriz
        ? regraMatrizPedidoCompraPorId(risco.id_regra_matriz)
        : undefined
      return regra?.severidade === 'bloq' && risco.status_matriz === 'vermelho'
    })
    registrar(
      'PC9-04',
      r,
      gatesDoPc.length === 0,
      gatesDoPc.length === 0
        ? 'Sem gate disparado — risco de valoração controlável se demais regras conformes'
        : `${gatesDoPc.length} gate(s) disparado(s) — risco de valoração/interposição`,
    )
    if (gatesDoPc.length > 0) {
      falhar({
        regraId: 'PC9-04',
        doc: pc,
        titulo: 'Risco consolidado de valoração aduaneira',
        motivo: `${gatesDoPc.length} gate(s) falharam: ${gatesDoPc.map((g) => g.id_regra_matriz).join(', ')}.`,
        analise:
          'Divergências materiais PO×invoice indicam risco de valoração, interposição ou pagamento indevido (AVA-GATT; RA arts. 711/725).',
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

/** Detecção interna de PV — espelha ehTipoPedidoVenda sem export circular. */
function ehTipoPedidoVendaInterno(tipo: string): boolean {
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
