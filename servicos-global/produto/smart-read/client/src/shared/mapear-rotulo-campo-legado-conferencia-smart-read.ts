/**
 * De-para caminho legado → label tela (PT) + seção (EN, paridade UI dati).
 */

const REGRAS_SECAO: Array<{ match: RegExp; secao: string }> = [
  // AWB (paridade dati)
  { match: /^awbInfo\.flight\b/i, secao: 'Voo' },
  { match: /^awbInfo\b/i, secao: 'Informações AWB' },
  { match: /^handlingInformation$/i, secao: 'Informações AWB' },
  { match: /^cargoAgent\b/i, secao: 'Agente de carga' },
  { match: /^route\b/i, secao: 'Rota' },
  { match: /^declaredValues\b/i, secao: 'Valores declarados' },
  { match: /^charges\b/i, secao: 'Custos' },
  { match: /^shipmentDetails\b/i, secao: 'Embarque' },
  // Comuns
  { match: /^document\b/i, secao: 'Document' },
  { match: /^isSigned$|^observations$/i, secao: 'Document' },
  { match: /^carrier\b/i, secao: 'Carrier' },
  { match: /^exporter\b|^shipper\b/i, secao: 'Exporter' },
  { match: /^importer\b|^consignee\b/i, secao: 'Importer' },
  { match: /^notify_party\b/i, secao: 'Notify Party' },
  { match: /^shipment\b/i, secao: 'Shipment' },
  { match: /^goods\b/i, secao: 'Goods' },
  { match: /^containers\b|^containerNumbers\b/i, secao: 'Containers' },
  { match: /^lcl_cargo\b/i, secao: 'LCL Cargo' },
  { match: /^packageSummary\b/i, secao: 'Package Summary' },
  { match: /^payment\b/i, secao: 'Payment' },
  { match: /^bankingDetails\b/i, secao: 'Banking' },
  { match: /^currency\b/i, secao: 'Currency' },
  { match: /^totals\b/i, secao: 'Totals' },
  { match: /^items\b|^items_quantity$/i, secao: 'Items' },
  { match: /^additionalFields\b/i, secao: 'Additional Fields' },
  { match: /^issuer\b/i, secao: 'Issuer' },
  { match: /^flight\b/i, secao: 'Voo' },
  { match: /^routing\b/i, secao: 'Rota' },
  { match: /^nf\b/i, secao: 'Invoice NF' },
  { match: /^transportadora\b/i, secao: 'Carrier' },
]

/** Ordem das seções na conferência (paridade legado dati). */
export const ORDEM_SECOES_CONFERENCIA_SMART_READ = [
  'Document',
  'Informações AWB',
  'Voo',
  'Carrier',
  'Exporter',
  'Importer',
  'Notify Party',
  'Origem e destino',
  'Agente de carga',
  'Rota',
  'Shipment',
  'Embarque',
  'Goods',
  'Containers',
  'LCL Cargo',
  'Package Summary',
  'Items',
  'Valores declarados',
  'Custos',
  'Payment',
  'Currency',
  'Banking',
  'Totals',
  'Additional Fields',
  'Issuer',
  'Invoice NF',
  'Dados gerais',
] as const

const REGRAS_CAMPO: Array<{ match: RegExp; label: string }> = [
  // AWB
  { match: /^awbInfo\.mawbNumber$/, label: 'Número MAWB' },
  { match: /^awbInfo\.hawbNumber$/, label: 'Número HAWB' },
  { match: /^awbInfo\.awbDate$/, label: 'Data do AWB' },
  { match: /^awbInfo\.shippedOnBoardDate$/, label: 'Data shipped on board' },
  { match: /^awbInfo\.flight\.flightNumber$/, label: 'Número do voo' },
  { match: /^awbInfo\.flight\.flightDate$/, label: 'Data do voo' },
  { match: /^handlingInformation$/, label: 'Informações de manuseio' },
  { match: /^cargoAgent\.name$/, label: 'Nome do Agente de carga' },
  { match: /^cargoAgent\.iataCode$/, label: 'Código IATA' },
  { match: /^cargoAgent\.accountingInfo$/, label: 'Informações contábeis' },
  { match: /^route\.originAirport$/, label: 'Aeroporto de origem' },
  { match: /^route\.destinationAirport$/, label: 'Aeroporto de destino' },
  { match: /^declaredValues\.transportValue$/, label: 'Valor para transporte' },
  { match: /^declaredValues\.customsValue$/, label: 'Valor para alfândega' },
  { match: /^shipmentDetails\.totalPackages$/, label: 'Total de volumes' },
  { match: /^shipmentDetails\.totalGrossWeight$/, label: 'Peso bruto total' },
  { match: /^shipmentDetails\.totalCubedWeight$/, label: 'Peso cubado total' },
  { match: /^shipmentDetails\.cargoDescription$/, label: 'Descrição da carga' },
  { match: /^shipmentDetails\.tariffClass$/, label: 'Classe tarifária' },
  { match: /charges\..*\.paymentType$/, label: 'Tipo de pagamento' },
  { match: /charges\..*\.currency$/, label: 'Moeda' },
  { match: /charges\..*\.rate$/, label: 'Tarifa' },
  { match: /charges\..*\.basicFreightAmount$/, label: 'Frete básico' },
  { match: /charges\..*\.agentOtherCharges$/, label: 'Outras taxas do agente' },
  { match: /charges\..*\.totalFreightAmount$/, label: 'Total do frete' },
  { match: /charges\..*\.totalAmountToCollect$/, label: 'Total a coletar' },
  { match: /charges\..*\.destinationCharges$/, label: 'Taxas de destino' },
  { match: /charges\..*\.currencyConversionRates$/, label: 'Taxa de conversão' },
  { match: /document\.documentNumber$|^document\.number$/, label: 'Número do documento' },
  { match: /document\.billOfLadingNumber$/, label: 'Número do BL' },
  { match: /document\.masterBillOfLadingNumber$/, label: 'Número do BL master' },
  { match: /document\.bookingReference$/, label: 'Referência booking' },
  { match: /document\.documentType$|^document\.type$/, label: 'Tipo do documento' },
  { match: /document\.documentDate$|^document\.date$/, label: 'Data do documento' },
  { match: /document\.shippedOnBoardDate$/, label: 'Data shipped on board' },
  { match: /document\.incoterm$/, label: 'Incoterm' },
  { match: /document\.incotermLocation$/, label: 'Local incoterm' },
  { match: /^items_quantity$/, label: 'Quantidade de itens' },
  { match: /^observations$/, label: 'Observações' },
  { match: /^isSigned$/, label: 'Documento assinado' },
  { match: /\.name$/, label: 'Nome' },
  { match: /\.address$/, label: 'Endereço' },
  { match: /\.country$/, label: 'País' },
  { match: /\.state$|\.state_province$/, label: 'Estado ou província' },
  { match: /\.city$/, label: 'Cidade' },
  { match: /\.zipCode$|\.zip_code$/, label: 'CEP/Zipcode' },
  { match: /\.taxId$/, label: 'ID Fiscal' },
  { match: /\.cnpj$/, label: 'CNPJ' },
  { match: /\.phone$/, label: 'Telefone' },
  { match: /\.email$/, label: 'E-mail' },
  { match: /shipment\.vessel_name$|shipment\.vesselName$/, label: 'Nome do navio' },
  { match: /shipment\.voyage_number$/, label: 'Número da viagem' },
  { match: /shipment\.port_of_origin$/, label: 'Porto origem' },
  { match: /shipment\.port_of_destination$/, label: 'Porto destino' },
  { match: /goods\.ncm_code$|\.ncm$/, label: 'NCM' },
  { match: /goods\.shipment_gross_weight$/, label: 'Peso bruto total' },
  { match: /goods\.shipment_net_weight$/, label: 'Peso líquido total' },
  { match: /goods\.total_packages$/, label: 'Total de volumes' },
  { match: /containerNumbers$/, label: 'Números de container' },
  { match: /container_number$/, label: 'Número do container' },
  { match: /container_seal$/, label: 'Lacre' },
  { match: /container_type$/, label: 'Tipo do container' },
  { match: /payment\.terms$/, label: 'Condição de pagamento' },
  { match: /currency\.type$/, label: 'Moeda' },
]

export type RotuloCampoLegadoConferencia = {
  label_tela: string
  secao_tela: string
}

const ROTULOS_POR_SECAO: Record<string, Record<string, string>> = {
  Exporter: {
    Nome: 'Nome do exportador',
    Endereço: 'Endereço do exportador',
    País: 'País do exportador',
    'Estado ou província': 'Estado ou província do exportador',
    Cidade: 'Cidade do exportador',
    'CEP/Zipcode': 'CEP/Zipcode',
    'ID Fiscal': 'ID Fiscal',
    Telefone: 'Telefone',
    'E-mail': 'E-mail',
  },
  Importer: {
    Nome: 'Nome do importador',
    Endereço: 'Endereço do importador',
    País: 'País do importador',
    'Estado ou província': 'Estado ou província do importador',
    Cidade: 'Cidade do importador',
    'CEP/Zipcode': 'CEP/Zipcode',
    CNPJ: 'CNPJ',
    'ID Fiscal': 'CNPJ',
    Telefone: 'Telefone',
    'E-mail': 'E-mail',
  },
  'Notify Party': {
    Nome: 'Nome do notify party',
    Endereço: 'Endereço do notify party',
    País: 'País do notify party',
    Cidade: 'Cidade do notify party',
    CNPJ: 'CNPJ',
  },
  Carrier: {
    Nome: 'Nome da transportadora',
  },
}

function inferirSecao(caminho: string): string {
  const raiz = caminho.split('.')[0] ?? caminho
  for (const r of REGRAS_SECAO) {
    if (r.match.test(caminho) || r.match.test(raiz)) return r.secao
  }
  return 'Dados gerais'
}

function humanizarUltimoSegmento(caminho: string): string {
  const leaf = caminho.split('.').pop()?.replace(/\[\]/g, '') ?? caminho
  return leaf
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function rotuloComSecao(label: string, secao: string): string {
  return ROTULOS_POR_SECAO[secao]?.[label] ?? label
}

export function mapearRotuloCampoLegadoConferencia(caminho: string): RotuloCampoLegadoConferencia {
  const secao = inferirSecao(caminho)

  if (caminho.startsWith('additionalFields.')) {
    return { label_tela: caminho.replace('additionalFields.', ''), secao_tela: secao }
  }

  for (const r of REGRAS_CAMPO) {
    if (r.match.test(caminho)) {
      return { label_tela: rotuloComSecao(r.label, secao), secao_tela: secao }
    }
  }

  return { label_tela: humanizarUltimoSegmento(caminho), secao_tela: secao }
}

export function ordenarSecoesConferencia<T extends { titulo: string }>(secoes: T[]): T[] {
  const ordem = ORDEM_SECOES_CONFERENCIA_SMART_READ
  return [...secoes].sort((a, b) => {
    const ia = ordem.indexOf(a.titulo as (typeof ordem)[number])
    const ib = ordem.indexOf(b.titulo as (typeof ordem)[number])
    const pa = ia === -1 ? ordem.length : ia
    const pb = ib === -1 ? ordem.length : ib
    return pa - pb
  })
}
