/**
 * De-para caminho legado → label tela (PT) + seção (PT, paridade UI DATI).
 */

const REGRAS_SECAO: Array<{ match: RegExp; secao: string }> = [
  // AWB (paridade DATI)
  { match: /^awbInfo\.flight\b/i, secao: 'Voo' },
  { match: /^awbInfo\b/i, secao: 'Informações AWB' },
  { match: /^handlingInformation$/i, secao: 'Informações AWB' },
  { match: /^cargoAgent\b/i, secao: 'Agente de carga' },
  { match: /^route\b/i, secao: 'Rota' },
  { match: /^declaredValues\b/i, secao: 'Valores declarados' },
  { match: /^shipmentDetails\b/i, secao: 'Embarque' },
  { match: /^charges\b/i, secao: 'Custos' },
  // BL / marítimo — paridade UI DATI (ordem de match importa)
  { match: /^payment\b|^currency\b|^bankingDetails\b|shipment\.costs\b/i, secao: 'Frete' },
  { match: /^shipment\b|^routing\b/i, secao: 'Origem e destino' },
  { match: /^goods\b|^items\b|^packageSummary\b|^totals\b/i, secao: 'Mercadoria' },
  { match: /^notify_party\b/i, secao: 'Notify' },
  { match: /^exporter\b|^shipper\b/i, secao: 'Exportador' },
  { match: /^importer\b|^consignee\b/i, secao: 'Importador' },
  { match: /^carrier\b|^transportadora\b/i, secao: 'Nome do transportador' },
  {
    match: /^document\b|^isSigned$|^observations$|^containerNumbers$|^lcl_cargo$|^items_quantity$|^containers\b/i,
    secao: 'Dados gerais',
  },
  { match: /^additionalFields\b/i, secao: 'Dados gerais' },
  { match: /^issuer\b|^nf\b/i, secao: 'Dados gerais' },
  { match: /^flight\b/i, secao: 'Voo' },
]

/** Ordem das seções na conferência (paridade UI DATI). */
export const ORDEM_SECOES_CONFERENCIA_SMART_READ = [
  'Dados gerais',
  'Nome do transportador',
  'Exportador',
  'Importador',
  'Notify',
  'Origem e destino',
  'Mercadoria',
  'Frete',
  'Informações AWB',
  'Voo',
  'Agente de carga',
  'Rota',
  'Embarque',
  'Valores declarados',
  'Custos',
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
  { match: /document\.masterBillOfLadingNumber$/, label: 'Número do Master BL' },
  { match: /document\.bookingReference$/, label: 'Referência de Booking' },
  { match: /document\.documentType$|^document\.type$/, label: 'Tipo de documento' },
  { match: /document\.documentDate$|^document\.date$/, label: 'Data do documento' },
  { match: /document\.shippedOnBoardDate$/, label: 'Data de Embarque' },
  { match: /document\.incoterm$/, label: 'Incoterm' },
  { match: /document\.incotermLocation$/, label: 'Local incoterm' },
  { match: /^items_quantity$/, label: 'Quantidade de itens' },
  { match: /^observations$/, label: 'Observações' },
  { match: /^isSigned$/, label: 'Documento assinado' },
  { match: /^lcl_cargo$/, label: 'Carga LCL' },
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
  { match: /shipment\.port_of_origin$|shipment\.ports\.origin$|shipment\.ports\.loading$/, label: 'Porto origem' },
  { match: /shipment\.port_of_destination$|shipment\.ports\.destination$|shipment\.ports\.discharge$/, label: 'Porto destino' },
  { match: /shipment\.place_of_origin$/, label: 'Local origem' },
  { match: /shipment\.place_of_destination$/, label: 'Local destino' },
  { match: /goods\.ncm_code$|\.ncm$/, label: 'NCM' },
  { match: /goods\.shipment_gross_weight$/, label: 'Peso bruto total' },
  { match: /goods\.shipment_net_weight$/, label: 'Peso líquido total' },
  { match: /goods\.total_packages$/, label: 'Total de volumes' },
  { match: /containerNumbers$/, label: 'Números dos Containers' },
  { match: /container_number$/, label: 'Número do container' },
  { match: /container_seal$/, label: 'Lacre' },
  { match: /container_type$/, label: 'Tipo do container' },
  { match: /payment\.terms$/, label: 'Condição de pagamento' },
  { match: /currency\.type$/, label: 'Moeda' },
  { match: /shipment\.costs\.freight$/, label: 'Frete' },
  { match: /shipment\.costs\.insurance$/, label: 'Seguro' },
]

export type RotuloCampoLegadoConferencia = {
  label_tela: string
  secao_tela: string
}

const ROTULOS_POR_SECAO: Record<string, Record<string, string>> = {
  Exportador: {
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
  Importador: {
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
  Notify: {
    Nome: 'Nome do notify party',
    Endereço: 'Endereço do notify party',
    País: 'País do notify party',
    Cidade: 'Cidade do notify party',
    CNPJ: 'CNPJ',
  },
  'Nome do transportador': {
    Nome: 'Nome do transportador',
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

  const peso = (titulo: string): number => {
    const item = /^Item (\d+)$/i.exec(titulo.trim())
    if (item) {
      const baseMercadoria = ordem.indexOf('Mercadoria')
      const ancora = baseMercadoria === -1 ? ordem.length : baseMercadoria + 1
      return ancora + Number(item[1]) / 1000
    }
    const idx = ordem.indexOf(titulo as (typeof ordem)[number])
    return idx === -1 ? ordem.length + 0.5 : idx
  }

  return [...secoes].sort((a, b) => peso(a.titulo) - peso(b.titulo))
}
