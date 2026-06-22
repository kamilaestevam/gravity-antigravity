/**
 * Resolve caminho legado → nome_prisma SOMENTE se o campo existir no fragment.prisma.
 * Regras explícitas; sem correspondência = vazio (nunca inventar).
 */
import {
  type CampoPrismaGravity,
  indicePorNomeCampo,
  validarCampoExiste,
} from './carregar-campos-prisma-gravity.js'

export type ResultadoMapeamentoPrisma = {
  nome_prisma: string
  tabela_prisma: string
  confianca: 'alta' | 'sugestao' | ''
  observacao: string
}

type Regra = {
  pattern: RegExp
  prisma: string
  model: string
  tipos?: string[]
}

/** Regras curadas — cada `prisma` deve existir no fragment (validado na carga). */
const REGRAS: Regra[] = [
  // Documento / BL
  {
    pattern: /^document\.(number|billOfLadingNumber|bookingReference)$/,
    prisma: 'numero_bl_processo',
    model: 'DocumentoProcesso',
    tipos: ['BL'],
  },
  {
    pattern: /^document\.masterBillOfLadingNumber$/,
    prisma: 'numero_mbl_processo',
    model: 'DocumentoProcesso',
    tipos: ['BL'],
  },
  {
    pattern: /^document\.documentNumber$/,
    prisma: 'numero_invoice_pedido',
    model: 'PedidoGeral',
    tipos: ['INVOICE', 'PACKING_LIST'],
  },
  {
    pattern: /^document\.documentNumber$/,
    prisma: 'numero_invoice_item',
    model: 'PedidoItem',
    tipos: ['INVOICE'],
  },
  {
    pattern: /^document\.incoterm$/,
    prisma: 'incoterm_processo',
    model: 'LogisticaInternacionalProcesso',
  },
  {
    pattern: /^document\.incoterm$/,
    prisma: 'incoterm_pedido',
    model: 'PedidoGeral',
    tipos: ['INVOICE', 'PACKING_LIST'],
  },
  {
    pattern: /^document\.incoterm$/,
    prisma: 'incoterm_item',
    model: 'PedidoItem',
    tipos: ['INVOICE'],
  },
  // Partes — texto em PedidoItem ou Cadastros Fornecedor
  { pattern: /^exporter\.name$/, prisma: 'nome_exportador_item', model: 'PedidoItem' },
  { pattern: /^exporter\.name$/, prisma: 'nome_fornecedor', model: 'Fornecedor' },
  { pattern: /^importer\.name$/, prisma: 'nome_importador_item', model: 'PedidoItem' },
  { pattern: /^importer\.name$/, prisma: 'nome_fornecedor', model: 'Fornecedor' },
  { pattern: /^carrier\.name$/, prisma: 'nome_fornecedor', model: 'Fornecedor' },
  { pattern: /^notify_party\.name$/, prisma: 'nome_fornecedor', model: 'Fornecedor' },
  { pattern: /^exporter\.address$/, prisma: 'endereco_fornecedor', model: 'Fornecedor' },
  { pattern: /^importer\.address$/, prisma: 'endereco_fornecedor', model: 'Fornecedor' },
  { pattern: /^notify_party\.address$/, prisma: 'endereco_fornecedor', model: 'Fornecedor' },
  { pattern: /^exporter\.country$/, prisma: 'pais_fornecedor', model: 'Fornecedor' },
  { pattern: /^importer\.country$/, prisma: 'pais_fornecedor', model: 'Fornecedor' },
  { pattern: /^exporter\.city$/, prisma: 'cidade_fornecedor', model: 'Fornecedor' },
  { pattern: /^importer\.city$/, prisma: 'cidade_fornecedor', model: 'Fornecedor' },
  {
    pattern: /^exporter\.(state_province|state)$/,
    prisma: 'estado_provincia_fornecedor',
    model: 'Fornecedor',
  },
  {
    pattern: /^importer\.(state_province|state)$/,
    prisma: 'estado_provincia_fornecedor',
    model: 'Fornecedor',
  },
  { pattern: /^exporter\.zip_code$|^exporter\.zipCode$/, prisma: 'cep_zipcode_fornecedor', model: 'Fornecedor' },
  { pattern: /^importer\.zip_code$|^importer\.zipCode$/, prisma: 'cep_zipcode_fornecedor', model: 'Fornecedor' },
  { pattern: /^importer\.cnpj$/, prisma: 'cnpj_importador_pedido', model: 'PedidoGeral' },
  { pattern: /^importer\.cnpj$/, prisma: 'cnpj_fornecedor', model: 'Fornecedor' },
  { pattern: /^importer\.taxId$/, prisma: 'cnpj_importador_pedido', model: 'PedidoGeral' },
  { pattern: /^importer\.taxId$/, prisma: 'cnpj_fornecedor', model: 'Fornecedor' },
  { pattern: /^exporter\.taxId$/, prisma: 'tin_fornecedor', model: 'Fornecedor' },
  { pattern: /^exporter\.email$|^importer\.email$/, prisma: 'email_fornecedor', model: 'Fornecedor' },
  { pattern: /^exporter\.phone$|^importer\.phone$/, prisma: 'telefone_fornecedor', model: 'Fornecedor' },
  // Embarque
  {
    pattern: /^shipment\.(port_of_origin|ports\.origin|ports\.loading)$/,
    prisma: 'porto_origem_processo',
    model: 'LogisticaInternacionalProcesso',
  },
  {
    pattern: /^shipment\.(port_of_destination|ports\.destination|ports\.discharge)$/,
    prisma: 'porto_destino_processo',
    model: 'LogisticaInternacionalProcesso',
  },
  { pattern: /^shipment\.place_of_origin$/, prisma: 'local_de_origem', model: 'PedidoGeral' },
  { pattern: /^shipment\.place_of_destination$/, prisma: 'local_de_destino', model: 'PedidoGeral' },
  { pattern: /^shipment\.modal$/, prisma: 'modal_frete_internacional_processo', model: 'LogisticaInternacionalProcesso' },
  { pattern: /^shipmentDetails\.transportMode$/, prisma: 'modal_frete_internacional_processo', model: 'LogisticaInternacionalProcesso' },
  // AWB
  { pattern: /^document\.number$/, prisma: 'numero_awb_processo', model: 'DocumentoProcesso', tipos: ['AWB'] },
  // Containers
  { pattern: /^containerNumbers$/, prisma: 'container_numero_processo_container', model: 'ContainerProcesso' },
  {
    pattern: /^containers\[\]\.container_number$/,
    prisma: 'container_numero_processo_container',
    model: 'ContainerProcesso',
  },
  { pattern: /^containers\[\]\.container_seal$/, prisma: 'container_lacre_processo_container', model: 'ContainerProcesso' },
  {
    pattern: /^containers\[\]\.container_gross_weight$/,
    prisma: 'container_peso_bruto_processo_container',
    model: 'ContainerProcesso',
  },
  {
    pattern: /^containers\[\]\.container_net_weight$/,
    prisma: 'container_peso_liquido_processo_container',
    model: 'ContainerProcesso',
  },
  {
    pattern: /^containers\[\]\.container_volume$/,
    prisma: 'container_metragem_cubica_processo_container',
    model: 'ContainerProcesso',
  },
  {
    pattern: /^containers\[\]\.container_type$/,
    prisma: 'container_tipo_processo_container',
    model: 'ContainerProcesso',
  },
  // Mercadorias / NCM / pesos
  { pattern: /^goods\.ncm_code$|^goods\.items\[\]\.ncm$/, prisma: 'ncm_item', model: 'PedidoItem' },
  { pattern: /^goods\.hs_code$/, prisma: 'ncm_item', model: 'PedidoItem' },
  {
    pattern: /^goods\.shipment_gross_weight$|^packageSummary\.totalGrossWeight$/,
    prisma: 'peso_bruto_total_pedido',
    model: 'PedidoGeral',
  },
  {
    pattern: /^goods\.shipment_net_weight$|^packageSummary\.totalNetWeight$/,
    prisma: 'peso_liquido_total_pedido',
    model: 'PedidoGeral',
  },
  {
    pattern: /^goods\.total_shipment_volume$|^packageSummary\.totalCubicMeasurement$/,
    prisma: 'cubagem_total_pedido',
    model: 'PedidoGeral',
  },
  { pattern: /^goods\.total_packages$|^packageSummary\.totalPackages$/, prisma: 'quantidade_volumes_pedido', model: 'PedidoGeral' },
  { pattern: /^goods\.items\[\]\.description$|^items\[\]\.productDescription$/, prisma: 'descricao_item', model: 'PedidoItem' },
  { pattern: /^items\[\]\.descriptions\.english$/, prisma: 'descricao_completa_item_en', model: 'PedidoItem' },
  { pattern: /^items\[\]\.descriptions\.portuguese$/, prisma: 'descricao_completa_item_pt', model: 'PedidoItem' },
  { pattern: /^items\[\]\.partNumber$|^items\[\]\.part_number$/, prisma: 'part_number_item', model: 'PedidoItem' },
  { pattern: /^payment\.terms$/, prisma: 'condicao_pagamento_pedido', model: 'PedidoGeral' },
  { pattern: /^payment\.terms$/, prisma: 'condicao_pagamento_item', model: 'PedidoItem' },
  { pattern: /^currency\.type$/, prisma: 'moeda_pedido', model: 'PedidoGeral' },
  { pattern: /^currency\.type$/, prisma: 'moeda_item', model: 'PedidoItem' },
  { pattern: /^currency\.exchangeRate$/, prisma: 'taxa_cambio_estimada_pedido', model: 'PedidoGeral' },
]

let regrasValidadas: Regra[] | null = null

async function regrasAtivas(): Promise<Regra[]> {
  if (regrasValidadas) return regrasValidadas
  const indice = await indicePorNomeCampo()
  regrasValidadas = REGRAS.filter((r) => {
    const hits = validarCampoExiste(indice, r.prisma)
    return hits.some((h) => h.model === r.model)
  })
  return regrasValidadas
}

function escolherMelhor(
  candidatos: Array<{ regra: Regra; campo: CampoPrismaGravity }>,
  tipoDocumento: string,
  caminho: string,
): { regra: Regra; campo: CampoPrismaGravity; alternativas: string[] } | null {
  if (candidatos.length === 0) return null

  const filtrados = candidatos.filter(
    (c) => !c.regra.tipos || c.regra.tipos.includes(tipoDocumento),
  )
  const pool = filtrados.length > 0 ? filtrados : candidatos

  const ordemPreferencia = (c: { regra: Regra }) => {
    if (/^exporter\.name$|^importer\.name$/.test(caminho)) {
      if (c.regra.model.startsWith('Pedido')) return 0
      if (c.regra.model === 'Fornecedor') return 1
      return 2
    }
    if (/^carrier\.name$|^notify_party\.name$/.test(caminho)) {
      if (c.regra.model === 'Fornecedor') return 0
      return 1
    }
    if (tipoDocumento === 'BL') {
      if (c.regra.model.includes('Documento') || c.regra.model.includes('Logistica') || c.regra.model.includes('Container')) return 0
      if (c.regra.model.startsWith('Pedido')) return 1
      if (c.regra.model === 'Fornecedor') return 2
      return 3
    }
    if (tipoDocumento === 'INVOICE' || tipoDocumento === 'PACKING_LIST') {
      if (c.regra.model.startsWith('Pedido')) return 0
      if (c.regra.model === 'Fornecedor') return 1
      return 2
    }
    return 0
  }

  pool.sort((a, b) => ordemPreferencia(a) - ordemPreferencia(b))
  const escolhido = pool[0]
  const alternativas = pool
    .slice(1)
    .map((c) => `${c.regra.prisma} (${c.regra.model})`)
    .filter((a, i, arr) => arr.indexOf(a) === i)

  return { regra: escolhido.regra, campo: escolhido.campo, alternativas }
}

export async function resolverNomePrismaCampoLegado(
  caminho: string,
  tipoDocumento: string,
): Promise<ResultadoMapeamentoPrisma> {
  const indice = await indicePorNomeCampo()
  const regras = await regrasAtivas()

  const candidatos: Array<{ regra: Regra; campo: CampoPrismaGravity }> = []
  for (const regra of regras) {
    if (!regra.pattern.test(caminho)) continue
    const hits = validarCampoExiste(indice, regra.prisma).filter((h) => h.model === regra.model)
    for (const campo of hits) {
      candidatos.push({ regra, campo })
    }
  }

  const melhor = escolherMelhor(candidatos, tipoDocumento, caminho)
  if (!melhor) {
    return { nome_prisma: '', tabela_prisma: '', confianca: '', observacao: '' }
  }

  const confianca = melhor.alternativas.length > 0 ? 'sugestao' : 'alta'
  const observacao =
    melhor.alternativas.length > 0 ? `Alternativas: ${melhor.alternativas.join('; ')}` : ''

  return {
    nome_prisma: melhor.regra.prisma,
    tabela_prisma: melhor.regra.model,
    confianca,
    observacao,
  }
}
