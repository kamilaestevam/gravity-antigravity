/**
 * documentos-comerciais-pedido.ts — Layouts dos documentos comerciais do Pedido
 *
 * Gera o HTML (A4, pronto para Puppeteer) dos 6 documentos comerciais:
 *   pedido_de_compra · pedido_de_venda · proforma_invoice · invoice ·
 *   packing_list · certificado_origem
 *
 * Módulo puro (sem I/O, sem Prisma) — testável em unidade.
 * Consumido por routes/template-pedido.ts (POST /documentos/gerar).
 */

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type TipoDocumentoComercialPedido =
  | 'pedido_de_compra'
  | 'pedido_de_venda'
  | 'proforma_invoice'
  | 'invoice'
  | 'packing_list'
  | 'certificado_origem'

export type IdiomaDocumentoPedido = 'pt' | 'en' | 'es' | 'zh' | 'ja' | 'ar'

export const TIPOS_DOCUMENTO_COMERCIAL_PEDIDO: TipoDocumentoComercialPedido[] = [
  'pedido_de_compra',
  'pedido_de_venda',
  'proforma_invoice',
  'invoice',
  'packing_list',
  'certificado_origem',
]

/** Nome-base do arquivo gerado por tipo (kebab, sem acento — vira nome de PDF). */
export const NOME_ARQUIVO_DOCUMENTO_COMERCIAL: Record<TipoDocumentoComercialPedido, string> = {
  pedido_de_compra:   'purchase-order',
  pedido_de_venda:    'sales-order',
  proforma_invoice:   'proforma-invoice',
  invoice:            'commercial-invoice',
  packing_list:       'packing-list',
  certificado_origem: 'certificate-of-origin',
}

export interface ItemDocumentoComercialPedido {
  part_number: string
  descricao: string
  ncm: string
  quantidade: number
  unidade: string | null
  moeda: string | null
  valor_unitario: number | null
  valor_total: number | null
  peso_liquido_total: number | null
  peso_bruto_total: number | null
  cubagem_total: number | null
  tipo_embalagem: string | null
  tipo_volume: string | null
  numero_certificado_origem: string | null
}

export interface DadosDocumentoComercialPedido {
  numero_pedido: string
  tipo_operacao: string
  nome_organizacao: string
  nome_exportador: string | null
  nome_importador: string | null
  nome_fabricante: string | null
  incoterm: string | null
  moeda: string
  condicao_pagamento: string | null
  numero_proforma: string | null
  numero_invoice: string | null
  referencia_importador: string | null
  referencia_exportador: string | null
  data_emissao: string | null
  itens: ItemDocumentoComercialPedido[]
}

// ── Mapper Prisma → dados do documento ───────────────────────────────────────

/**
 * Converte o registro Prisma do Pedido (com itens_pedido incluídos e já
 * filtrados por seleção, se houver) para o shape consumido pelos layouts.
 */
export function montarDadosDocumentoComercialPedido(
  pedido: Record<string, unknown>,
  nomeOrganizacao: string,
): DadosDocumentoComercialPedido {
  const detalhes = (pedido.detalhes_operacionais_pedido ?? {}) as Record<string, unknown>
  const itensBrutos = (pedido.itens_pedido ?? []) as Array<Record<string, unknown>>

  const paraNumero = (v: unknown): number | null => {
    if (v === null || v === undefined) return null
    const n = Number(v)
    return Number.isFinite(n) ? n : null
  }
  const paraTexto = (v: unknown): string | null => {
    if (v === null || v === undefined) return null
    const s = String(v).trim()
    return s.length > 0 ? s : null
  }

  const primeiroTextoItem = (campo: string): string | null => {
    for (const it of itensBrutos) {
      const v = paraTexto(it[campo])
      if (v) return v
    }
    return null
  }

  const itens: ItemDocumentoComercialPedido[] = itensBrutos.map((it) => {
    const quantidade = paraNumero(it.quantidade_atual_item) ?? 0
    const pesoLiqUnit = paraNumero(it.peso_liquido_unitario_item)
    const pesoBrutoUnit = paraNumero(it.peso_bruto_unitario_item)
    const cubagemUnit = paraNumero(it.cubagem_unitaria_item)
    const valorUnitario = paraNumero(it.valor_por_unidade_item)
    const valorTotal = paraNumero(it.valor_total_item)
      ?? (valorUnitario !== null && quantidade > 0 ? valorUnitario * quantidade : null)
    return {
      part_number:               String(it.part_number_item ?? ''),
      descricao:                 String(it.descricao_item ?? ''),
      ncm:                       String(it.ncm_item ?? ''),
      quantidade,
      unidade:                   paraTexto(it.unidade_comercializada_item),
      moeda:                     paraTexto(it.moeda_item),
      valor_unitario:            valorUnitario,
      valor_total:               valorTotal,
      peso_liquido_total:        pesoLiqUnit !== null ? pesoLiqUnit * quantidade : null,
      peso_bruto_total:          pesoBrutoUnit !== null ? pesoBrutoUnit * quantidade : null,
      cubagem_total:             cubagemUnit !== null ? cubagemUnit * quantidade : null,
      tipo_embalagem:            paraTexto(it.tipo_embalagem),
      tipo_volume:               paraTexto(it.tipo_volume_item),
      numero_certificado_origem: paraTexto(it.numero_certificado_origem),
    }
  })

  const dataEmissao = pedido.data_emissao_pedido instanceof Date
    ? pedido.data_emissao_pedido.toISOString()
    : paraTexto(pedido.data_emissao_pedido)

  return {
    numero_pedido:         String(pedido.numero_pedido ?? ''),
    tipo_operacao:         String(pedido.tipo_operacao_pedido ?? ''),
    nome_organizacao:      nomeOrganizacao,
    nome_exportador:       paraTexto(detalhes.nome_exportador) ?? primeiroTextoItem('nome_exportador_item'),
    nome_importador:       paraTexto(detalhes.nome_importador) ?? primeiroTextoItem('nome_importador_item'),
    nome_fabricante:       paraTexto(detalhes.nome_fabricante) ?? primeiroTextoItem('nome_fabricante_item'),
    incoterm:              paraTexto(pedido.incoterm_pedido) ?? paraTexto(detalhes.incoterm) ?? primeiroTextoItem('incoterm_item'),
    moeda:                 String(pedido.moeda_pedido ?? primeiroTextoItem('moeda_item') ?? 'USD'),
    condicao_pagamento:    paraTexto(pedido.condicao_pagamento_pedido) ?? primeiroTextoItem('condicao_pagamento_item'),
    numero_proforma:       paraTexto(pedido.numero_proforma_pedido) ?? primeiroTextoItem('numero_proforma_item'),
    numero_invoice:        paraTexto(pedido.numero_invoice_pedido) ?? primeiroTextoItem('numero_invoice_item'),
    referencia_importador: paraTexto(pedido.referencia_importador_pedido) ?? primeiroTextoItem('referencia_importador_item'),
    referencia_exportador: paraTexto(pedido.referencia_exportador_pedido) ?? primeiroTextoItem('referencia_exportador_item'),
    data_emissao:          dataEmissao,
    itens,
  }
}

// ── Rótulos por idioma ────────────────────────────────────────────────────────

type ChaveRotulo =
  | 'titulo_pedido_de_compra' | 'titulo_pedido_de_venda' | 'titulo_proforma_invoice'
  | 'titulo_invoice' | 'titulo_packing_list' | 'titulo_certificado_origem'
  | 'pedido' | 'data_emissao' | 'exportador' | 'importador' | 'fabricante'
  | 'incoterm' | 'moeda' | 'condicao_pagamento'
  | 'referencia_importador' | 'referencia_exportador'
  | 'numero_proforma' | 'numero_invoice'
  | 'item' | 'part_number' | 'descricao' | 'ncm' | 'quantidade' | 'unidade'
  | 'valor_unitario' | 'valor_total'
  | 'peso_liquido' | 'peso_bruto' | 'cubagem' | 'embalagem' | 'volume'
  | 'numero_certificado' | 'total' | 'total_quantidade'
  | 'total_peso_liquido' | 'total_peso_bruto' | 'total_cubagem'
  | 'declaracao_origem' | 'assinatura_autorizada' | 'local_data' | 'data_geracao'

const ROTULOS: Record<IdiomaDocumentoPedido, Record<ChaveRotulo, string>> = {
  pt: {
    titulo_pedido_de_compra: 'Pedido de Compra', titulo_pedido_de_venda: 'Pedido de Venda',
    titulo_proforma_invoice: 'Proforma Invoice', titulo_invoice: 'Invoice Comercial',
    titulo_packing_list: 'Packing List', titulo_certificado_origem: 'Certificado de Origem',
    pedido: 'Pedido', data_emissao: 'Data de Emissão', exportador: 'Exportador',
    importador: 'Importador', fabricante: 'Fabricante', incoterm: 'Incoterm', moeda: 'Moeda',
    condicao_pagamento: 'Condição de Pagamento',
    referencia_importador: 'Ref. Importador', referencia_exportador: 'Ref. Exportador',
    numero_proforma: 'Nº Proforma', numero_invoice: 'Nº Invoice',
    item: 'Item', part_number: 'Part Number', descricao: 'Descrição', ncm: 'NCM',
    quantidade: 'Quantidade', unidade: 'Unidade', valor_unitario: 'Valor Unitário', valor_total: 'Valor Total',
    peso_liquido: 'Peso Líquido', peso_bruto: 'Peso Bruto', cubagem: 'Cubagem',
    embalagem: 'Embalagem', volume: 'Volume', numero_certificado: 'Nº Certificado',
    total: 'Total', total_quantidade: 'Quantidade Total',
    total_peso_liquido: 'Peso Líquido Total', total_peso_bruto: 'Peso Bruto Total', total_cubagem: 'Cubagem Total',
    declaracao_origem: 'Declaramos que as mercadorias descritas acima são originárias do país indicado e atendem aos requisitos de origem aplicáveis.',
    assinatura_autorizada: 'Assinatura Autorizada', local_data: 'Local e Data', data_geracao: 'Gerado em',
  },
  en: {
    titulo_pedido_de_compra: 'Purchase Order', titulo_pedido_de_venda: 'Sales Order',
    titulo_proforma_invoice: 'Proforma Invoice', titulo_invoice: 'Commercial Invoice',
    titulo_packing_list: 'Packing List', titulo_certificado_origem: 'Certificate of Origin',
    pedido: 'Order', data_emissao: 'Issue Date', exportador: 'Exporter',
    importador: 'Importer', fabricante: 'Manufacturer', incoterm: 'Incoterm', moeda: 'Currency',
    condicao_pagamento: 'Payment Terms',
    referencia_importador: 'Importer Ref.', referencia_exportador: 'Exporter Ref.',
    numero_proforma: 'Proforma No.', numero_invoice: 'Invoice No.',
    item: 'Item', part_number: 'Part Number', descricao: 'Description', ncm: 'HS Code',
    quantidade: 'Quantity', unidade: 'Unit', valor_unitario: 'Unit Price', valor_total: 'Total Amount',
    peso_liquido: 'Net Weight', peso_bruto: 'Gross Weight', cubagem: 'Volume (CBM)',
    embalagem: 'Packing', volume: 'Package', numero_certificado: 'Certificate No.',
    total: 'Total', total_quantidade: 'Total Quantity',
    total_peso_liquido: 'Total Net Weight', total_peso_bruto: 'Total Gross Weight', total_cubagem: 'Total Volume',
    declaracao_origem: 'We hereby declare that the goods described above originate from the indicated country and comply with the applicable rules of origin.',
    assinatura_autorizada: 'Authorized Signature', local_data: 'Place and Date', data_geracao: 'Generated on',
  },
  es: {
    titulo_pedido_de_compra: 'Orden de Compra', titulo_pedido_de_venda: 'Orden de Venta',
    titulo_proforma_invoice: 'Factura Proforma', titulo_invoice: 'Factura Comercial',
    titulo_packing_list: 'Lista de Empaque', titulo_certificado_origem: 'Certificado de Origen',
    pedido: 'Pedido', data_emissao: 'Fecha de Emisión', exportador: 'Exportador',
    importador: 'Importador', fabricante: 'Fabricante', incoterm: 'Incoterm', moeda: 'Moneda',
    condicao_pagamento: 'Condiciones de Pago',
    referencia_importador: 'Ref. Importador', referencia_exportador: 'Ref. Exportador',
    numero_proforma: 'Nº Proforma', numero_invoice: 'Nº Factura',
    item: 'Ítem', part_number: 'Número de Parte', descricao: 'Descripción', ncm: 'Código NCM',
    quantidade: 'Cantidad', unidade: 'Unidad', valor_unitario: 'Precio Unitario', valor_total: 'Importe Total',
    peso_liquido: 'Peso Neto', peso_bruto: 'Peso Bruto', cubagem: 'Volumen (CBM)',
    embalagem: 'Embalaje', volume: 'Bulto', numero_certificado: 'Nº Certificado',
    total: 'Total', total_quantidade: 'Cantidad Total',
    total_peso_liquido: 'Peso Neto Total', total_peso_bruto: 'Peso Bruto Total', total_cubagem: 'Volumen Total',
    declaracao_origem: 'Declaramos que las mercancías descritas arriba son originarias del país indicado y cumplen con las reglas de origen aplicables.',
    assinatura_autorizada: 'Firma Autorizada', local_data: 'Lugar y Fecha', data_geracao: 'Generado el',
  },
  zh: {
    titulo_pedido_de_compra: '采购订单', titulo_pedido_de_venda: '销售订单',
    titulo_proforma_invoice: '形式发票', titulo_invoice: '商业发票',
    titulo_packing_list: '装箱单', titulo_certificado_origem: '原产地证书',
    pedido: '订单', data_emissao: '签发日期', exportador: '出口商',
    importador: '进口商', fabricante: '制造商', incoterm: '贸易术语', moeda: '币种',
    condicao_pagamento: '付款条件',
    referencia_importador: '进口商参考号', referencia_exportador: '出口商参考号',
    numero_proforma: '形式发票号', numero_invoice: '发票号',
    item: '项', part_number: '零件号', descricao: '品名', ncm: 'HS编码',
    quantidade: '数量', unidade: '单位', valor_unitario: '单价', valor_total: '总金额',
    peso_liquido: '净重', peso_bruto: '毛重', cubagem: '体积 (CBM)',
    embalagem: '包装', volume: '件数', numero_certificado: '证书编号',
    total: '合计', total_quantidade: '总数量',
    total_peso_liquido: '总净重', total_peso_bruto: '总毛重', total_cubagem: '总体积',
    declaracao_origem: '兹声明上述货物原产于所示国家，并符合适用的原产地规则。',
    assinatura_autorizada: '授权签字', local_data: '地点和日期', data_geracao: '生成日期',
  },
  ja: {
    titulo_pedido_de_compra: '発注書', titulo_pedido_de_venda: '注文請書',
    titulo_proforma_invoice: 'プロフォーマインボイス', titulo_invoice: 'コマーシャルインボイス',
    titulo_packing_list: 'パッキングリスト', titulo_certificado_origem: '原産地証明書',
    pedido: '注文', data_emissao: '発行日', exportador: '輸出者',
    importador: '輸入者', fabricante: '製造者', incoterm: 'インコタームズ', moeda: '通貨',
    condicao_pagamento: '支払条件',
    referencia_importador: '輸入者参照番号', referencia_exportador: '輸出者参照番号',
    numero_proforma: 'プロフォーマ番号', numero_invoice: 'インボイス番号',
    item: '項目', part_number: '品番', descricao: '品名', ncm: 'HSコード',
    quantidade: '数量', unidade: '単位', valor_unitario: '単価', valor_total: '合計金額',
    peso_liquido: '正味重量', peso_bruto: '総重量', cubagem: '容積 (CBM)',
    embalagem: '梱包', volume: '個数', numero_certificado: '証明書番号',
    total: '合計', total_quantidade: '総数量',
    total_peso_liquido: '総正味重量', total_peso_bruto: '総総重量', total_cubagem: '総容積',
    declaracao_origem: '上記の貨物は表示された国を原産地とし、適用される原産地規則に適合することを宣言します。',
    assinatura_autorizada: '権限者署名', local_data: '場所および日付', data_geracao: '生成日',
  },
  ar: {
    titulo_pedido_de_compra: 'أمر شراء', titulo_pedido_de_venda: 'أمر بيع',
    titulo_proforma_invoice: 'فاتورة مبدئية', titulo_invoice: 'فاتورة تجارية',
    titulo_packing_list: 'قائمة التعبئة', titulo_certificado_origem: 'شهادة المنشأ',
    pedido: 'الطلب', data_emissao: 'تاريخ الإصدار', exportador: 'المُصدِّر',
    importador: 'المستورد', fabricante: 'الشركة المصنعة', incoterm: 'إنكوترم', moeda: 'العملة',
    condicao_pagamento: 'شروط الدفع',
    referencia_importador: 'مرجع المستورد', referencia_exportador: 'مرجع المُصدِّر',
    numero_proforma: 'رقم الفاتورة المبدئية', numero_invoice: 'رقم الفاتورة',
    item: 'البند', part_number: 'رقم القطعة', descricao: 'الوصف', ncm: 'الرمز الجمركي',
    quantidade: 'الكمية', unidade: 'الوحدة', valor_unitario: 'سعر الوحدة', valor_total: 'المبلغ الإجمالي',
    peso_liquido: 'الوزن الصافي', peso_bruto: 'الوزن الإجمالي', cubagem: 'الحجم (CBM)',
    embalagem: 'التغليف', volume: 'الطرد', numero_certificado: 'رقم الشهادة',
    total: 'الإجمالي', total_quantidade: 'إجمالي الكمية',
    total_peso_liquido: 'إجمالي الوزن الصافي', total_peso_bruto: 'إجمالي الوزن الإجمالي', total_cubagem: 'إجمالي الحجم',
    declaracao_origem: 'نقر بموجب هذا أن البضائع الموصوفة أعلاه منشؤها البلد المشار إليه وتستوفي قواعد المنشأ المعمول بها.',
    assinatura_autorizada: 'التوقيع المعتمد', local_data: 'المكان والتاريخ', data_geracao: 'تم الإنشاء في',
  },
}

const LOCALE_POR_IDIOMA: Record<IdiomaDocumentoPedido, string> = {
  pt: 'pt-BR', en: 'en-US', es: 'es-ES', zh: 'zh-CN', ja: 'ja-JP', ar: 'ar-EG',
}

// ── Helpers de formatação/escape ─────────────────────────────────────────────

function escaparHtml(valor: string): string {
  return valor
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function fmtNumero(valor: number | null, idioma: IdiomaDocumentoPedido, casas = 2): string {
  if (valor === null) return '—'
  return valor.toLocaleString(LOCALE_POR_IDIOMA[idioma], {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  })
}

function fmtData(iso: string | null, idioma: IdiomaDocumentoPedido): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(LOCALE_POR_IDIOMA[idioma])
}

function texto(valor: string | null): string {
  return valor && valor.trim().length > 0 ? escaparHtml(valor) : '—'
}

// ── Blocos de layout ─────────────────────────────────────────────────────────

const ESTILOS = `
  * { box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1e293b; margin: 0; padding: 32px 40px; font-size: 12px; }
  .doc-cabecalho { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1e293b; padding-bottom: 16px; margin-bottom: 20px; }
  .doc-organizacao { font-size: 18px; font-weight: 700; }
  .doc-titulo { font-size: 22px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; text-align: end; }
  .doc-numero { font-size: 13px; color: #475569; text-align: end; margin-top: 4px; }
  .doc-partes { display: flex; gap: 16px; margin-bottom: 16px; }
  .doc-parte { flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px 12px; }
  .doc-parte-rotulo { font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b; margin-bottom: 4px; }
  .doc-parte-valor { font-size: 13px; font-weight: 600; }
  .doc-detalhes { display: flex; flex-wrap: wrap; gap: 8px 24px; margin-bottom: 20px; }
  .doc-detalhe { min-width: 140px; }
  .doc-detalhe-rotulo { font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b; }
  .doc-detalhe-valor { font-size: 12px; font-weight: 600; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  th { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.04em; text-align: start; }
  td { border: 1px solid #e2e8f0; padding: 6px 8px; font-size: 11px; vertical-align: top; }
  td.num, th.num { text-align: end; white-space: nowrap; }
  tfoot td { font-weight: 700; background: #f8fafc; }
  .doc-declaracao { border: 1px solid #cbd5e1; border-radius: 6px; padding: 14px 16px; font-size: 12px; line-height: 1.6; margin: 24px 0; }
  .doc-assinaturas { display: flex; gap: 40px; margin-top: 48px; }
  .doc-assinatura { flex: 1; border-top: 1px solid #1e293b; padding-top: 6px; font-size: 11px; color: #475569; text-align: center; }
  .doc-rodape { margin-top: 32px; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px; display: flex; justify-content: space-between; }
`

function blocoCabecalho(
  dados: DadosDocumentoComercialPedido,
  r: Record<ChaveRotulo, string>,
  tituloDocumento: string,
): string {
  return `<div class="doc-cabecalho">
    <div>
      <div class="doc-organizacao">${escaparHtml(dados.nome_organizacao)}</div>
    </div>
    <div>
      <div class="doc-titulo">${escaparHtml(tituloDocumento)}</div>
      <div class="doc-numero">${escaparHtml(r.pedido)}: ${texto(dados.numero_pedido)}</div>
    </div>
  </div>`
}

function blocoPartes(dados: DadosDocumentoComercialPedido, r: Record<ChaveRotulo, string>): string {
  const partes: string[] = []
  const parte = (rotulo: string, valor: string | null) =>
    `<div class="doc-parte"><div class="doc-parte-rotulo">${escaparHtml(rotulo)}</div><div class="doc-parte-valor">${texto(valor)}</div></div>`
  partes.push(parte(r.exportador, dados.nome_exportador))
  partes.push(parte(r.importador, dados.nome_importador))
  if (dados.nome_fabricante) partes.push(parte(r.fabricante, dados.nome_fabricante))
  return `<div class="doc-partes">${partes.join('')}</div>`
}

function blocoDetalhes(
  dados: DadosDocumentoComercialPedido,
  r: Record<ChaveRotulo, string>,
  idioma: IdiomaDocumentoPedido,
  tipo: TipoDocumentoComercialPedido,
): string {
  const detalhes: Array<[string, string]> = [
    [r.data_emissao, fmtData(dados.data_emissao, idioma)],
    [r.incoterm, texto(dados.incoterm)],
    [r.moeda, texto(dados.moeda)],
  ]
  if (tipo !== 'packing_list' && tipo !== 'certificado_origem') {
    detalhes.push([r.condicao_pagamento, texto(dados.condicao_pagamento)])
  }
  if (dados.referencia_importador) detalhes.push([r.referencia_importador, texto(dados.referencia_importador)])
  if (dados.referencia_exportador) detalhes.push([r.referencia_exportador, texto(dados.referencia_exportador)])
  if ((tipo === 'proforma_invoice' || tipo === 'invoice') && dados.numero_proforma) {
    detalhes.push([r.numero_proforma, texto(dados.numero_proforma)])
  }
  if (tipo === 'invoice' && dados.numero_invoice) {
    detalhes.push([r.numero_invoice, texto(dados.numero_invoice)])
  }
  const celulas = detalhes
    .map(([rotulo, valor]) => `<div class="doc-detalhe"><div class="doc-detalhe-rotulo">${escaparHtml(rotulo)}</div><div class="doc-detalhe-valor">${valor}</div></div>`)
    .join('')
  return `<div class="doc-detalhes">${celulas}</div>`
}

function tabelaFinanceira(
  dados: DadosDocumentoComercialPedido,
  r: Record<ChaveRotulo, string>,
  idioma: IdiomaDocumentoPedido,
): string {
  const linhas = dados.itens.map((it, indice) => `<tr>
    <td>${indice + 1}</td>
    <td>${texto(it.part_number)}</td>
    <td>${texto(it.descricao)}</td>
    <td>${texto(it.ncm)}</td>
    <td class="num">${fmtNumero(it.quantidade, idioma)}</td>
    <td>${texto(it.unidade)}</td>
    <td class="num">${fmtNumero(it.valor_unitario, idioma)}</td>
    <td class="num">${fmtNumero(it.valor_total, idioma)}</td>
  </tr>`).join('')

  const totalQuantidade = dados.itens.reduce((soma, it) => soma + it.quantidade, 0)
  const totalValor = dados.itens.reduce((soma, it) => soma + (it.valor_total ?? 0), 0)

  return `<table>
    <thead><tr>
      <th>${escaparHtml(r.item)}</th><th>${escaparHtml(r.part_number)}</th>
      <th>${escaparHtml(r.descricao)}</th><th>${escaparHtml(r.ncm)}</th>
      <th class="num">${escaparHtml(r.quantidade)}</th><th>${escaparHtml(r.unidade)}</th>
      <th class="num">${escaparHtml(r.valor_unitario)}</th><th class="num">${escaparHtml(r.valor_total)}</th>
    </tr></thead>
    <tbody>${linhas}</tbody>
    <tfoot><tr>
      <td colspan="4">${escaparHtml(r.total)} (${escaparHtml(dados.moeda)})</td>
      <td class="num">${fmtNumero(totalQuantidade, idioma)}</td>
      <td></td><td></td>
      <td class="num">${fmtNumero(totalValor, idioma)}</td>
    </tr></tfoot>
  </table>`
}

function tabelaPackingList(
  dados: DadosDocumentoComercialPedido,
  r: Record<ChaveRotulo, string>,
  idioma: IdiomaDocumentoPedido,
): string {
  const linhas = dados.itens.map((it, indice) => `<tr>
    <td>${indice + 1}</td>
    <td>${texto(it.part_number)}</td>
    <td>${texto(it.descricao)}</td>
    <td class="num">${fmtNumero(it.quantidade, idioma)}</td>
    <td>${texto(it.unidade)}</td>
    <td>${texto(it.tipo_embalagem)}</td>
    <td>${texto(it.tipo_volume)}</td>
    <td class="num">${fmtNumero(it.peso_liquido_total, idioma, 3)}</td>
    <td class="num">${fmtNumero(it.peso_bruto_total, idioma, 3)}</td>
    <td class="num">${fmtNumero(it.cubagem_total, idioma, 3)}</td>
  </tr>`).join('')

  const soma = (seletor: (it: ItemDocumentoComercialPedido) => number | null): number =>
    dados.itens.reduce((acumulado, it) => acumulado + (seletor(it) ?? 0), 0)

  return `<table>
    <thead><tr>
      <th>${escaparHtml(r.item)}</th><th>${escaparHtml(r.part_number)}</th>
      <th>${escaparHtml(r.descricao)}</th>
      <th class="num">${escaparHtml(r.quantidade)}</th><th>${escaparHtml(r.unidade)}</th>
      <th>${escaparHtml(r.embalagem)}</th><th>${escaparHtml(r.volume)}</th>
      <th class="num">${escaparHtml(r.peso_liquido)}</th>
      <th class="num">${escaparHtml(r.peso_bruto)}</th>
      <th class="num">${escaparHtml(r.cubagem)}</th>
    </tr></thead>
    <tbody>${linhas}</tbody>
    <tfoot><tr>
      <td colspan="3">${escaparHtml(r.total)}</td>
      <td class="num">${fmtNumero(soma(it => it.quantidade), idioma)}</td>
      <td></td><td></td><td></td>
      <td class="num">${fmtNumero(soma(it => it.peso_liquido_total), idioma, 3)}</td>
      <td class="num">${fmtNumero(soma(it => it.peso_bruto_total), idioma, 3)}</td>
      <td class="num">${fmtNumero(soma(it => it.cubagem_total), idioma, 3)}</td>
    </tr></tfoot>
  </table>`
}

function tabelaCertificadoOrigem(
  dados: DadosDocumentoComercialPedido,
  r: Record<ChaveRotulo, string>,
  idioma: IdiomaDocumentoPedido,
): string {
  const linhas = dados.itens.map((it, indice) => `<tr>
    <td>${indice + 1}</td>
    <td>${texto(it.part_number)}</td>
    <td>${texto(it.descricao)}</td>
    <td>${texto(it.ncm)}</td>
    <td class="num">${fmtNumero(it.quantidade, idioma)}</td>
    <td>${texto(it.unidade)}</td>
    <td>${texto(it.numero_certificado_origem)}</td>
  </tr>`).join('')

  return `<table>
    <thead><tr>
      <th>${escaparHtml(r.item)}</th><th>${escaparHtml(r.part_number)}</th>
      <th>${escaparHtml(r.descricao)}</th><th>${escaparHtml(r.ncm)}</th>
      <th class="num">${escaparHtml(r.quantidade)}</th><th>${escaparHtml(r.unidade)}</th>
      <th>${escaparHtml(r.numero_certificado)}</th>
    </tr></thead>
    <tbody>${linhas}</tbody>
  </table>`
}

// ── Montagem final ────────────────────────────────────────────────────────────

const TITULO_POR_TIPO: Record<TipoDocumentoComercialPedido, ChaveRotulo> = {
  pedido_de_compra:   'titulo_pedido_de_compra',
  pedido_de_venda:    'titulo_pedido_de_venda',
  proforma_invoice:   'titulo_proforma_invoice',
  invoice:            'titulo_invoice',
  packing_list:       'titulo_packing_list',
  certificado_origem: 'titulo_certificado_origem',
}

/**
 * Monta o HTML completo (A4) do documento comercial no idioma pedido.
 * Determinístico exceto pela data de geração (rodapé).
 */
export function montarHtmlDocumentoComercialPedido(
  tipo: TipoDocumentoComercialPedido,
  idioma: IdiomaDocumentoPedido,
  dados: DadosDocumentoComercialPedido,
): string {
  const r = ROTULOS[idioma]
  const tituloDocumento = r[TITULO_POR_TIPO[tipo]]
  const dir = idioma === 'ar' ? 'rtl' : 'ltr'

  let corpo: string
  if (tipo === 'packing_list') {
    corpo = tabelaPackingList(dados, r, idioma)
  } else if (tipo === 'certificado_origem') {
    corpo = `${tabelaCertificadoOrigem(dados, r, idioma)}
      <div class="doc-declaracao">${escaparHtml(r.declaracao_origem)}</div>
      <div class="doc-assinaturas">
        <div class="doc-assinatura">${escaparHtml(r.local_data)}</div>
        <div class="doc-assinatura">${escaparHtml(r.assinatura_autorizada)}</div>
      </div>`
  } else {
    corpo = tabelaFinanceira(dados, r, idioma)
  }

  const dataGeracao = new Date().toLocaleDateString(LOCALE_POR_IDIOMA[idioma])

  return `<!DOCTYPE html>
<html lang="${idioma}" dir="${dir}">
<head>
  <meta charset="utf-8">
  <title>${escaparHtml(tituloDocumento)} — ${escaparHtml(dados.numero_pedido)}</title>
  <style>${ESTILOS}</style>
</head>
<body>
  ${blocoCabecalho(dados, r, tituloDocumento)}
  ${blocoPartes(dados, r)}
  ${blocoDetalhes(dados, r, idioma, tipo)}
  ${corpo}
  <div class="doc-rodape">
    <span>${escaparHtml(dados.nome_organizacao)}</span>
    <span>${escaparHtml(r.data_geracao)}: ${escaparHtml(dataGeracao)}</span>
  </div>
</body>
</html>`
}
