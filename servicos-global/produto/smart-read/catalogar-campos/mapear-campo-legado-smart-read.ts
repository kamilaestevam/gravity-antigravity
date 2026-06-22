/** De-para caminho legado (JSON IA) → campo canônico Gravity / Prisma proposto + label tela. */

const REGRAS_SECAO: Array<{ match: RegExp; secao: string }> = [
  { match: /^document\b/i, secao: 'Documento' },
  { match: /^exporter\b/i, secao: 'Exportador' },
  { match: /^importer\b/i, secao: 'Importador' },
  { match: /^notify_party\b/i, secao: 'Notify party' },
  { match: /^carrier\b/i, secao: 'Transportadora' },
  { match: /^shipment\b/i, secao: 'Embarque' },
  { match: /^shipmentDetails\b/i, secao: 'Embarque' },
  { match: /^goods\b/i, secao: 'Mercadorias' },
  { match: /^containers\b/i, secao: 'Containers' },
  { match: /^containerNumbers\b/i, secao: 'Containers' },
  { match: /^lcl_cargo\b/i, secao: 'Carga LCL' },
  { match: /^packageSummary\b/i, secao: 'Resumo volumes' },
  { match: /^payment\b/i, secao: 'Pagamento' },
  { match: /^bankingDetails\b/i, secao: 'Dados bancários' },
  { match: /^currency\b/i, secao: 'Moeda' },
  { match: /^totals\b/i, secao: 'Totais' },
  { match: /^items\b/i, secao: 'Itens' },
  { match: /^additionalFields\b/i, secao: 'Campos adicionais' },
  { match: /^observations\b/i, secao: 'Observações' },
  { match: /^isSigned\b/i, secao: 'Documento' },
  { match: /^shipper\b/i, secao: 'Shipper' },
  { match: /^consignee\b/i, secao: 'Consignatário' },
  { match: /^issuer\b/i, secao: 'Emissor' },
  { match: /^flight\b/i, secao: 'Voo' },
  { match: /^routing\b/i, secao: 'Roteamento' },
  { match: /^charges\b/i, secao: 'Taxas' },
  { match: /^nf\b/i, secao: 'Nota fiscal' },
  { match: /^transportadora\b/i, secao: 'Transportadora' },
]

const REGRAS_CAMPO: Array<{ match: RegExp; campo: string; label: string }> = [
  { match: /document\.documentNumber$|^document\.number$/, campo: 'numero_documento', label: 'Número do documento' },
  { match: /document\.billOfLadingNumber$/, campo: 'numero_bl', label: 'Número do BL' },
  { match: /document\.masterBillOfLadingNumber$/, campo: 'numero_bl_master', label: 'Número do BL master' },
  { match: /document\.bookingReference$/, campo: 'referencia_booking', label: 'Referência booking' },
  { match: /document\.documentType$|^document\.type$/, campo: 'tipo_documento', label: 'Tipo do documento' },
  { match: /document\.documentDate$|^document\.date$/, campo: 'data_documento', label: 'Data do documento' },
  { match: /document\.shippedOnBoardDate$/, campo: 'data_embarque', label: 'Data shipped on board' },
  { match: /document\.incoterm$/, campo: 'incoterm', label: 'Incoterm' },
  { match: /document\.incotermLocation$/, campo: 'local_incoterm', label: 'Local incoterm' },
  { match: /document\.originCountry$/, campo: 'pais_origem', label: 'País de origem' },
  { match: /document\.countryOfAcquisition$/, campo: 'pais_aquisicao', label: 'País de aquisição' },
  { match: /document\.countryOfProvenance$/, campo: 'pais_procedencia', label: 'País de procedência' },
  { match: /\.name$/, campo: 'nome', label: 'Nome' },
  { match: /\.address$/, campo: 'endereco', label: 'Endereço' },
  { match: /\.country$/, campo: 'pais', label: 'País' },
  { match: /\.state$|\.state_province$/, campo: 'estado', label: 'Estado / UF' },
  { match: /\.city$/, campo: 'cidade', label: 'Cidade' },
  { match: /\.zipCode$|\.zip_code$/, campo: 'cep', label: 'CEP / Código postal' },
  { match: /\.taxId$/, campo: 'documento_fiscal', label: 'CNPJ / Tax ID' },
  { match: /\.cnpj$/, campo: 'cnpj', label: 'CNPJ' },
  { match: /\.phone$/, campo: 'telefone', label: 'Telefone' },
  { match: /\.email$/, campo: 'email', label: 'E-mail' },
  { match: /shipment\.vessel_name$|shipment\.vesselName$/, campo: 'nome_navio', label: 'Nome do navio' },
  { match: /shipment\.voyage_number$/, campo: 'numero_viagem', label: 'Número da viagem' },
  { match: /shipment\.port_of_origin$|shipment\.ports\.origin$|shipment\.ports\.loading$/, campo: 'porto_origem', label: 'Porto origem' },
  { match: /shipment\.port_of_destination$|shipment\.ports\.destination$|shipment\.ports\.discharge$/, campo: 'porto_destino', label: 'Porto destino' },
  { match: /shipment\.place_of_origin$/, campo: 'local_origem', label: 'Local origem' },
  { match: /shipment\.place_of_destination$/, campo: 'local_destino', label: 'Local destino' },
  { match: /shipment\.origin_country$/, campo: 'pais_origem_embarque', label: 'País origem embarque' },
  { match: /shipment\.destination_state$/, campo: 'estado_destino', label: 'Estado destino' },
  { match: /shipment\.marksAndNumbers$/, campo: 'marcas_numeros', label: 'Marcas e números' },
  { match: /shipment\.modal$|shipmentDetails\.transportMode$/, campo: 'modal_transporte', label: 'Modal de transporte' },
  { match: /shipment\.carrier$/, campo: 'transportadora', label: 'Transportadora' },
  { match: /shipment\.costs\.freight$/, campo: 'valor_frete', label: 'Frete' },
  { match: /shipment\.costs\.insurance$/, campo: 'valor_seguro', label: 'Seguro' },
  { match: /goods\.ncm_code$|\.ncm$/, campo: 'ncm', label: 'NCM' },
  { match: /goods\.hs_code$|\.hsCode$/, campo: 'hs_code', label: 'HS Code' },
  { match: /goods\.bl_description$/, campo: 'descricao_bl', label: 'Descrição BL' },
  { match: /goods\.total_packages$/, campo: 'total_volumes', label: 'Total de volumes' },
  { match: /goods\.package_unit$/, campo: 'unidade_volume', label: 'Unidade de volume' },
  { match: /goods\.shipment_gross_weight$/, campo: 'peso_bruto_total', label: 'Peso bruto total' },
  { match: /goods\.shipment_net_weight$/, campo: 'peso_liquido_total', label: 'Peso líquido total' },
  { match: /goods\.total_shipment_volume$/, campo: 'volume_total', label: 'Volume total' },
  { match: /goods\.volume_unit$/, campo: 'unidade_volume_cubico', label: 'Unidade cubagem' },
  { match: /containerNumbers$/, campo: 'numeros_container', label: 'Números de container' },
  { match: /container_number$/, campo: 'numero_container', label: 'Número do container' },
  { match: /container_type$/, campo: 'tipo_container', label: 'Tipo do container' },
  { match: /container_seal$/, campo: 'lacre_container', label: 'Lacre' },
  { match: /container_gross_weight$/, campo: 'peso_bruto_container', label: 'Peso bruto container' },
  { match: /container_net_weight$/, campo: 'peso_liquido_container', label: 'Peso líquido container' },
  { match: /container_volume$/, campo: 'volume_container', label: 'Volume container' },
  { match: /packageSummary\.totalGrossWeight$/, campo: 'peso_bruto_total', label: 'Peso bruto total' },
  { match: /packageSummary\.totalNetWeight$/, campo: 'peso_liquido_total', label: 'Peso líquido total' },
  { match: /packageSummary\.totalPackages$/, campo: 'total_volumes', label: 'Total de volumes' },
  { match: /packageSummary\.commercialUnit$/, campo: 'unidade_comercial', label: 'Unidade comercial' },
  { match: /payment\.terms$/, campo: 'condicao_pagamento', label: 'Condição de pagamento' },
  { match: /payment\.method$/, campo: 'metodo_pagamento', label: 'Método de pagamento' },
  { match: /currency\.type$/, campo: 'moeda', label: 'Moeda' },
  { match: /currency\.exchangeRate$/, campo: 'taxa_cambio', label: 'Taxa de câmbio' },
  { match: /bankingDetails\.bankName$/, campo: 'nome_banco', label: 'Nome do banco' },
  { match: /bankingDetails\.iban$/, campo: 'iban', label: 'IBAN' },
  { match: /bankingDetails\.swift$/, campo: 'swift', label: 'SWIFT' },
  { match: /items\[\]\.description$/, campo: 'descricao_item', label: 'Descrição item' },
  { match: /items\[\]\.gross_weight$/, campo: 'peso_bruto_item', label: 'Peso bruto item' },
  { match: /items\[\]\.net_weight$/, campo: 'peso_liquido_item', label: 'Peso líquido item' },
  { match: /items\[\]\.volume$/, campo: 'volume_item', label: 'Volume item' },
  { match: /items\[\]\.quantity$/, campo: 'quantidade_item', label: 'Quantidade item' },
  { match: /items\[\]\.shipper$/, campo: 'shipper_item', label: 'Shipper item' },
  { match: /items\[\]\.invoice$/, campo: 'invoice_item', label: 'Invoice item' },
  { match: /containers\[\]\.container_type$/, campo: 'tipo_container', label: 'Tipo do container' },
  { match: /containers\[\]\.container_number$/, campo: 'numero_container', label: 'Número do container' },
  { match: /containers\[\]\.container_seal$/, campo: 'lacre_container', label: 'Lacre' },
  { match: /containers\[\]\.container_gross_weight$/, campo: 'peso_bruto_container', label: 'Peso bruto container' },
  { match: /containers\[\]\.container_net_weight$/, campo: 'peso_liquido_container', label: 'Peso líquido container' },
  { match: /containers\[\]\.container_volume$/, campo: 'volume_container', label: 'Volume container' },
  { match: /containers\[\]\.dangerous_goods_indicator$/, campo: 'indicador_carga_perigosa', label: 'Carga perigosa' },
  { match: /containers\[\]\.dangerous_goods_class$/, campo: 'classe_carga_perigosa', label: 'Classe carga perigosa' },
  { match: /containers\[\]\.packaging\[\]\.type$/, campo: 'tipo_embalagem', label: 'Tipo embalagem' },
  { match: /containers\[\]\.packaging\[\]\.quantity$/, campo: 'quantidade_embalagem', label: 'Quantidade embalagem' },
  { match: /goods\.packaging_summary\[\]\.type$/, campo: 'tipo_embalagem_resumo', label: 'Tipo embalagem (resumo)' },
  { match: /goods\.packaging_summary\[\]\.total_quantity$/, campo: 'quantidade_embalagem_resumo', label: 'Qtd embalagem (resumo)' },
  { match: /items\..*\.descriptions\.english$/, campo: 'descricao_item_en', label: 'Descrição item (EN)' },
  { match: /items\..*\.descriptions\.portuguese$/, campo: 'descricao_item_pt', label: 'Descrição item (PT)' },
  { match: /items\..*\.productDescription$/, campo: 'descricao_produto', label: 'Descrição do produto' },
  { match: /items\..*\.partNumber$/, campo: 'codigo_peca', label: 'Código peça / Part number' },
  { match: /items\..*\.gross_weight$|items\..*\.weights\.gross$/, campo: 'peso_bruto_item', label: 'Peso bruto item' },
  { match: /items\..*\.net_weight$|items\..*\.weights\.net$/, campo: 'peso_liquido_item', label: 'Peso líquido item' },
  { match: /items\..*\.volume$/, campo: 'volume_item', label: 'Volume item' },
  { match: /items\..*\.quantity$/, campo: 'quantidade_item', label: 'Quantidade item' },
  { match: /observations$/, campo: 'observacoes', label: 'Observações' },
  { match: /isSigned$/, campo: 'documento_assinado', label: 'Documento assinado' },
]

export type MapeamentoCampoLegado = {
  prisma: string
  label_tela: string
  secao_tela: string
  status: 'mapeado' | 'pendente'
}

function inferirSecao(caminho: string): string {
  const raiz = caminho.split('.')[0] ?? caminho
  for (const r of REGRAS_SECAO) {
    if (r.match.test(caminho) || r.match.test(raiz)) return r.secao
  }
  return 'Outros'
}

function humanizarUltimoSegmento(caminho: string): string {
  const leaf = caminho.split('.').pop()?.replace(/\[\]/g, '') ?? caminho
  return leaf
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function chaveJson(caminho: string): string {
  return caminho.split('.').pop()?.replace(/\[\]/g, '') ?? caminho
}

export function mapearCampoLegadoSmartRead(caminho: string): MapeamentoCampoLegado {
  const secao = inferirSecao(caminho)

  if (caminho.startsWith('additionalFields.')) {
    const label = caminho.replace('additionalFields.', '')
    const slug = label
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '')
    return { prisma: `campo_adicional_${slug}`, label_tela: label, secao_tela: secao, status: 'mapeado' }
  }

  for (const r of REGRAS_CAMPO) {
    if (r.match.test(caminho)) {
      const prefixo = secao
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
      return {
        prisma: `${r.campo}_${prefixo}`.replace(/_documento_documento/g, '_documento'),
        label_tela: `${r.label} (${secao})`,
        secao_tela: secao,
        status: 'mapeado',
      }
    }
  }

  const slug = caminho
    .replace(/\[\d+\]/g, '_item')
    .replace(/\./g, '_')
    .toLowerCase()
  return {
    prisma: slug,
    label_tela: humanizarUltimoSegmento(caminho),
    secao_tela: secao,
    status: 'pendente',
  }
}
