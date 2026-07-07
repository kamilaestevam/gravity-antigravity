import {
  formatarMoeda,
  formatarPeso,
  gerarItensBolSimulador,
  gerarItensInvoiceSimulador,
  gerarItensPackingSimulador,
  type DocumentoSimulador,
  type TipoDocumentoSimulador,
} from './documentos-preview-simulador-smart-doc'

export type StatusCampoConferenciaSimulador = 'preenchido' | 'vazio-obrig' | 'vazio-opc'

export type CampoConferenciaSimulador = {
  chave: string
  rotulo: string
  valor: string | null
  status: StatusCampoConferenciaSimulador
}

export type SecaoConferenciaSimulador = {
  id: string
  titulo: string
  campos: CampoConferenciaSimulador[]
}

const ORDEM_SECOES = [
  'Dados gerais',
  'Nome do transportador',
  'Exportador',
  'Importador',
  'Notify',
  'Origem e destino',
  'Mercadoria',
  'Embalagem',
  'Frete',
  'Embarque',
  'Valores declarados',
  'Dados bancários',
  'Campos adicionais',
  'Containers',
] as const

function slugSecao(titulo: string, indice: number): string {
  const base = titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return base ? `${base}-${indice}` : `secao-${indice}`
}

function ordenarSecoes(secoes: SecaoConferenciaSimulador[]): SecaoConferenciaSimulador[] {
  const peso = (titulo: string): number => {
    const item = /^Item (\d+)$/i.exec(titulo.trim())
    if (item) {
      const baseMercadoria = ORDEM_SECOES.indexOf('Mercadoria')
      const ancora = baseMercadoria === -1 ? ORDEM_SECOES.length : baseMercadoria + 1
      return ancora + Number(item[1]) / 1000
    }
    const container = /^Container (\d+)$/i.exec(titulo.trim())
    if (container) {
      const baseContainers = ORDEM_SECOES.indexOf('Containers')
      const ancora = baseContainers === -1 ? ORDEM_SECOES.length + 50 : baseContainers + 1
      return ancora + Number(container[1]) / 1000
    }
    const idx = ORDEM_SECOES.indexOf(titulo as (typeof ORDEM_SECOES)[number])
    return idx === -1 ? ORDEM_SECOES.length + 0.5 : idx
  }
  return [...secoes].sort((a, b) => peso(a.titulo) - peso(b.titulo))
}

function campo(
  chave: string,
  rotulo: string,
  valor: string | null,
  status: StatusCampoConferenciaSimulador = 'preenchido',
): CampoConferenciaSimulador {
  return { chave, rotulo, valor, status }
}

function secao(titulo: string, campos: CampoConferenciaSimulador[], indice: number): SecaoConferenciaSimulador {
  return { id: slugSecao(titulo, indice), titulo, campos }
}

function montarSecoesInvoice(quantidadeItens: number): SecaoConferenciaSimulador[] {
  const itens = gerarItensInvoiceSimulador(quantidadeItens)
  const totalGeral = itens.reduce((acc, item) => acc + item.total, 0)

  const secoes: SecaoConferenciaSimulador[] = [
    secao('Dados gerais', [
      campo('document.documentNumber', 'Invoice No.', 'INV-2026-4482'),
      campo('document.documentDate', 'Invoice Date', '18/06/2026'),
      campo('document.poReference', 'PO Reference', 'PO-9821'),
      campo('document.proforma', 'Proforma', 'PF-2026-0318'),
      campo('document.incoterm', 'Incoterm', 'FOB Hamburg'),
      campo('document.incotermLocation', 'Incoterm Location', 'Hamburg, Germany'),
      campo('currency.type', 'Currency', 'USD'),
      campo('document.paymentTerms', 'Payment Terms', '30 days net — T/T remittance'),
      campo('document.originCountry', 'Country of Origin', 'Germany'),
      campo('document.countryOfProvenance', 'Country of Provenance', 'Germany'),
      campo('isSigned', 'Signed', 'Sim'),
    ], 0),
    secao('Exportador', [
      campo('exporter.name', 'Name', 'MEYER INDUSTRIAL COMPONENTS GMBH'),
      campo('exporter.address', 'Address', 'Hafenstraße 42, 20457 Hamburg, Germany'),
      campo('exporter.city', 'City', 'Hamburg'),
      campo('exporter.country', 'Country', 'Germany'),
      campo('exporter.taxId', 'Tax ID', 'DE298374651'),
      campo('exporter.email', 'E-mail', 'export@meyer-industrial.de'),
      campo('exporter.phone', 'Phone', '+49 40 8821 4400'),
    ], 1),
    secao('Importador', [
      campo('importer.name', 'Consignee', 'IMPORTADORA GLOBAL LTDA'),
      campo('importer.cnpj', 'CNPJ', '47.829.103/0001-56'),
      campo('importer.address', 'Address', 'Av. das Palmeiras 1200 — São Paulo/SP'),
      campo('importer.city', 'City', 'São Paulo'),
      campo('importer.state_province', 'State', 'SP'),
      campo('importer.country', 'Country', 'Brazil'),
      campo('importer.stateRegistration', 'State Registration', '112.884.559.018'),
    ], 2),
    secao('Notify', [
      campo('notify_party.name', 'Name', 'Porto Norte Armazéns S.A.'),
      campo('notify_party.address', 'Address', 'Rod. Anchieta km 18, Galpão 7 — Santos/SP'),
      campo('notify_party.city', 'City', 'Santos'),
      campo('notify_party.country', 'Country', 'Brazil'),
    ], 3),
    secao('Origem e destino', [
      campo('routing.portOfLoading', 'Port of Loading', 'Hamburg, DE'),
      campo('routing.portOfDischarge', 'Port of Discharge', 'Santos, BR'),
      campo('routing.finalDestination', 'Final Destination', 'São Paulo, BR'),
      campo('routing.countryOfOrigin', 'Country of Origin', 'Germany'),
    ], 4),
    secao('Mercadoria', [
      campo('totals.netWeight', 'Net Weight', '18.420,00 KG', 'vazio-obrig'),
      campo('totals.grossWeight', 'Gross Weight', '19.120,00 KG'),
      campo('totals.totalPackages', 'Total Packages', '24'),
      campo('totals.subtotal', 'Subtotal', `USD ${formatarMoeda(totalGeral)}`),
      campo('totals.total', 'Total Amount', `USD ${formatarMoeda(totalGeral)}`),
      campo('packageSummary.description', 'Goods Description', 'Industrial machinery parts and components'),
    ], 5),
    secao('Valores declarados', [
      campo('declaredValues.transportValue', 'Transport Value', `USD ${formatarMoeda(totalGeral * 1.02)}`),
      campo('declaredValues.customsValue', 'Customs Value', `USD ${formatarMoeda(totalGeral)}`),
      campo('declaredValues.insuranceValue', 'Insurance Value', `USD ${formatarMoeda(totalGeral * 0.015)}`),
    ], 6),
    secao('Dados bancários', [
      campo('bankingDetails.bankName', 'Bank Name', 'COMMERZBANK AG'),
      campo('bankingDetails.swift', 'SWIFT', 'COBADEFFXXX'),
      campo('bankingDetails.iban', 'IBAN', 'DE89370400440532013000'),
      campo('bankingDetails.beneficiary', 'Beneficiary', 'MEYER INDUSTRIAL COMPONENTS GMBH'),
      campo('bankingDetails.accountNumber', 'Account Number', '532013000'),
    ], 7),
    secao('Campos adicionais', [
      campo('additionalFields.Fabricante', 'Fabricante', 'MEYER INDUSTRIAL COMPONENTS GMBH'),
      campo('additionalFields.Porto de Entrega', 'Porto de Entrega', 'SANTOS, BRAZIL'),
      campo('additionalFields.Ordem de Trabalho', 'Ordem de Trabalho', 'OT-9821-BR'),
      campo('additionalFields.Vendedor Beneficiário', 'Vendedor Beneficiário', 'MEYER INDUSTRIAL COMPONENTS GMBH'),
    ], 8),
  ]

  itens.forEach((item, indice) => {
    const numero = indice + 1
    const pesoNet =
      numero === 12
        ? campo('items[].weights.net', 'Net Weight', null, 'vazio-obrig')
        : campo('items[].weights.net', 'Net Weight', `${formatarPeso(item.quantidade * 1.42)} KG`)
    secoes.push(
      secao(
        `Item ${numero}`,
        [
          campo('items[].partNumber', 'Part Number', item.partNumber),
          campo('items[].description', 'Description', item.descricao),
          campo('items[].ncm', 'NCM', item.ncm),
          campo('items[].itemQuantity', 'Quantity', String(item.quantidade)),
          campo('items[].weights.unit', 'Unit', item.unidade),
          campo('items[].itemUnitPriceWithCurrency', 'Unit Price', `USD ${formatarMoeda(item.precoUnitario)}`),
          campo('items[].itemTotalPriceWithCurrency', 'Total Price', `USD ${formatarMoeda(item.total)}`),
          pesoNet,
          campo('items[].originCountry', 'Origin Country', 'Germany'),
          campo('items[].poNumber', 'PO Number', 'PO-9821'),
        ],
        100 + indice,
      ),
    )
  })

  return ordenarSecoes(secoes)
}

function montarSecoesPacking(quantidadeItens: number): SecaoConferenciaSimulador[] {
  const itens = gerarItensPackingSimulador(quantidadeItens)
  const pesoLiquidoTotal = itens.reduce((acc, i) => acc + i.pesoLiquidoKg, 0)
  const pesoBrutoTotal = itens.reduce((acc, i) => acc + i.pesoBrutoKg, 0)

  const secoes: SecaoConferenciaSimulador[] = [
    secao('Dados gerais', [
      campo('document.documentNumber', 'Packing List No.', 'PL-2026-4482'),
      campo('document.documentDate', 'Date', '18/06/2026'),
      campo('document.poReference', 'PO Reference', 'PO-9821'),
      campo('document.incoterm', 'Incoterm', 'FOB Hamburg'),
    ], 0),
    secao('Exportador', [
      campo('exporter.name', 'Shipper', 'MEYER INDUSTRIAL COMPONENTS GMBH'),
      campo('exporter.address', 'Address', 'Hafenstraße 42, 20457 Hamburg, Germany'),
      campo('exporter.country', 'Country', 'Germany'),
    ], 1),
    secao('Importador', [
      campo('importer.name', 'Consignee', 'IMPORTADORA GLOBAL LTDA'),
      campo('importer.cnpj', 'CNPJ', '47.829.103/0001-56'),
      campo('importer.address', 'Address', 'Av. das Palmeiras 1200 — São Paulo/SP'),
    ], 2),
    secao('Embalagem', [
      campo('totals.totalPackages', 'Total Packages', String(itens.reduce((a, i) => a + i.caixas, 0))),
      campo('totals.netWeight', 'Net Weight', `${formatarPeso(pesoLiquidoTotal)} KG`),
      campo('totals.grossWeight', 'Gross Weight', `${formatarPeso(pesoBrutoTotal)} KG`),
      campo('packageSummary.packageType', 'Package Type', 'Pallets + Cartons'),
    ], 3),
  ]

  itens.forEach((item, indice) => {
    const numero = indice + 1
    secoes.push(
      secao(
        `Item ${numero}`,
        [
          campo('items[].partNumber', 'Part Number', item.partNumber),
          campo('items[].description', 'Description', item.descricao),
          campo('items[].quantity', 'Quantity', String(item.quantidade)),
          campo('items[].packages', 'Packages', String(item.caixas)),
          campo('items[].netWeight', 'Net Weight', `${formatarPeso(item.pesoLiquidoKg)} KG`),
          campo('items[].grossWeight', 'Gross Weight', `${formatarPeso(item.pesoBrutoKg)} KG`),
        ],
        100 + indice,
      ),
    )
  })

  return ordenarSecoes(secoes)
}

function montarSecoesBol(quantidadeItens: number): SecaoConferenciaSimulador[] {
  const containers = gerarItensBolSimulador(quantidadeItens)

  const secoes: SecaoConferenciaSimulador[] = [
    secao('Dados gerais', [
      campo('document.billOfLadingNumber', 'B/L Number', 'HBL4492'),
      campo('document.documentDate', 'Date of Issue', '18/06/2026'),
      campo('document.bookingReference', 'Booking Reference', 'BK-982144'),
      campo('document.type', 'Document Type', 'BILL OF LADING'),
      campo('document.shippedOnBoardDate', 'Shipped on Board', '16/06/2026'),
    ], 0),
    secao('Nome do transportador', [
      campo('carrier.name', 'Carrier', 'MSC MEDITERRANEAN SHIPPING COMPANY'),
      campo('carrier.scac', 'SCAC Code', 'MSCU'),
    ], 1),
    secao('Exportador', [
      campo('exporter.name', 'Shipper', 'MEYER INDUSTRIAL COMPONENTS GMBH'),
      campo('exporter.address', 'Address', 'Hafenstraße 42, 20457 Hamburg, Germany'),
      campo('exporter.country', 'Country', 'Germany'),
    ], 2),
    secao('Importador', [
      campo('importer.name', 'Consignee', 'IMPORTADORA GLOBAL LTDA'),
      campo('importer.cnpj', 'CNPJ', '47.829.103/0001-56'),
      campo('importer.address', 'Address', 'Av. das Palmeiras 1200 — São Paulo/SP'),
    ], 3),
    secao('Notify', [
      campo('notify_party.name', 'Notify Party', 'Porto Norte Armazéns S.A.'),
      campo('notify_party.address', 'Address', 'Rod. Anchieta km 18 — Santos/SP'),
    ], 4),
    secao('Origem e destino', [
      campo('routing.portOfLoading', 'Port of Loading', 'Hamburg, DE'),
      campo('routing.portOfDischarge', 'Port of Discharge', 'Santos, BR'),
      campo('routing.vessel', 'Vessel', 'MSC BRASILIA VII'),
      campo('routing.voyage', 'Voyage', 'NX428W'),
    ], 5),
    secao('Embarque', [
      campo('shipment.receivedForShipment', 'Received for Shipment', '16/06/2026'),
      campo('shipment.freightPayable', 'Freight Payable', 'Collect'),
      campo('shipment.numberOfOriginals', 'Number of Originals', '3/3'),
    ], 6),
    secao('Mercadoria', [
      campo('goods.description', 'Description of Goods', 'Industrial machinery parts — SAY 24 PACKAGES'),
      campo('goods.marksAndNumbers', 'Marks & Numbers', 'INV-9821 / PO-9821'),
      campo('totals.totalPackages', 'Total Packages', '24'),
      campo('totals.grossWeight', 'Gross Weight', '19.120,00 KG'),
    ], 7),
    secao('Frete', [
      campo('payment.freightTerms', 'Freight Terms', 'FREIGHT COLLECT'),
      campo('payment.currency', 'Currency', 'USD'),
      campo('payment.oceanFreight', 'Ocean Freight', 'USD 2.840,00'),
    ], 8),
  ]

  containers.forEach((c, indice) => {
    const numero = indice + 1
    secoes.push(
      secao(
        `Container ${numero}`,
        [
          campo('containers[].container_number', 'Container Number', c.container),
          campo('containers[].container_seal', 'Seal', c.selo),
          campo('containers[].container_type', 'Type', c.tipo),
          campo('containers[].packaging.quantity', 'Packages', String(c.volumes)),
          campo('containers[].container_gross_weight', 'Gross Weight', `${formatarPeso(c.pesoKg)} KG`),
          campo('containers[].container_volume', 'Volume', c.medida),
        ],
        200 + indice,
      ),
    )
  })

  return ordenarSecoes(secoes)
}

export function obterSecoesConferenciaSimulador(
  tipoOuDocumento: TipoDocumentoSimulador | DocumentoSimulador,
): SecaoConferenciaSimulador[] {
  const tipo = typeof tipoOuDocumento === 'string' ? tipoOuDocumento : tipoOuDocumento.tipo
  const quantidadeItens =
    typeof tipoOuDocumento === 'string' ? (tipo === 'invoice' ? 100 : 10) : tipoOuDocumento.quantidadeItens

  if (tipo === 'packing-list') return montarSecoesPacking(quantidadeItens)
  if (tipo === 'bill-of-lading') return montarSecoesBol(quantidadeItens)
  return montarSecoesInvoice(quantidadeItens)
}

export function calcularEstatisticasConferenciaSimulador(secoes: SecaoConferenciaSimulador[]) {
  const campos = secoes.flatMap((s) => s.campos)
  const total = campos.length
  const preenchidos = campos.filter((c) => c.status === 'preenchido').length
  const vazios = campos.filter((c) => c.status !== 'preenchido').length
  const percentual = total > 0 ? Math.round((preenchidos / total) * 100) : 0
  return { total, preenchidos, vazios, preenchidosAlterados: 0, percentual }
}
