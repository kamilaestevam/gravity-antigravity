/**
 * SSOT — hubs marítimos/aéreos sugeridos por país (ISO-2) quando o documento não traz porto/aeroporto.
 * Heurística de produto; usuário confirma no formulário (status sugerido).
 */
export type HubLogisticoPaisPrefillBidFrete = {
  porto_unlocode: string | null
  aeroporto_iata: string | null
  nome_hub: string
}

/** Principais hubs COMEX por país de origem/destino. */
const HUBS_POR_PAIS: Record<string, HubLogisticoPaisPrefillBidFrete> = {
  AE: { porto_unlocode: 'AEJEA', aeroporto_iata: 'DXB', nome_hub: 'Jebel Ali / Dubai' },
  AR: { porto_unlocode: 'ARBUE', aeroporto_iata: 'EZE', nome_hub: 'Buenos Aires' },
  BR: { porto_unlocode: 'BRSSZ', aeroporto_iata: 'GRU', nome_hub: 'Santos / Guarulhos' },
  CL: { porto_unlocode: 'CLSAI', aeroporto_iata: 'SCL', nome_hub: 'San Antonio / Santiago' },
  CN: { porto_unlocode: 'CNSHA', aeroporto_iata: 'PVG', nome_hub: 'Shanghai / Pudong' },
  CO: { porto_unlocode: 'COCTG', aeroporto_iata: 'BOG', nome_hub: 'Cartagena / Bogotá' },
  DE: { porto_unlocode: 'DEHAM', aeroporto_iata: 'FRA', nome_hub: 'Hamburg / Frankfurt' },
  ES: { porto_unlocode: 'ESVLC', aeroporto_iata: 'MAD', nome_hub: 'Valencia / Madrid' },
  FR: { porto_unlocode: 'FRLEH', aeroporto_iata: 'CDG', nome_hub: 'Le Havre / CDG' },
  GB: { porto_unlocode: 'GBFXT', aeroporto_iata: 'LHR', nome_hub: 'Felixstowe / Heathrow' },
  HK: { porto_unlocode: 'HKHKG', aeroporto_iata: 'HKG', nome_hub: 'Hong Kong' },
  IN: { porto_unlocode: 'INNSA', aeroporto_iata: 'BOM', nome_hub: 'Nhava Sheva / Mumbai' },
  IT: { porto_unlocode: 'ITGOA', aeroporto_iata: 'MXP', nome_hub: 'Genova / Milano' },
  JP: { porto_unlocode: 'JPTYO', aeroporto_iata: 'NRT', nome_hub: 'Tokyo' },
  KR: { porto_unlocode: 'KRPUS', aeroporto_iata: 'ICN', nome_hub: 'Busan / Incheon' },
  MX: { porto_unlocode: 'MXZLO', aeroporto_iata: 'MEX', nome_hub: 'Manzanillo / Ciudad de México' },
  NL: { porto_unlocode: 'NLRTM', aeroporto_iata: 'AMS', nome_hub: 'Rotterdam / Schiphol' },
  PE: { porto_unlocode: 'PECLL', aeroporto_iata: 'LIM', nome_hub: 'Callao / Lima' },
  SG: { porto_unlocode: 'SGSIN', aeroporto_iata: 'SIN', nome_hub: 'Singapore' },
  TW: { porto_unlocode: 'TWKHH', aeroporto_iata: 'TPE', nome_hub: 'Kaohsiung / Taipei' },
  US: { porto_unlocode: 'USNYC', aeroporto_iata: 'JFK', nome_hub: 'New York / JFK' },
  UY: { porto_unlocode: 'UYMVD', aeroporto_iata: 'MVD', nome_hub: 'Montevideo' },
  VN: { porto_unlocode: 'VNSGN', aeroporto_iata: 'SGN', nome_hub: 'Ho Chi Minh / Tan Son Nhat' },
}

/** Nomes comuns (sem acento/espaço) → ISO-2, quando o OCR não devolve código. */
const NOME_PAIS_PARA_ISO2: Record<string, string> = {
  BRASIL: 'BR',
  BRAZIL: 'BR',
  CHINA: 'CN',
  HONGKONG: 'HK',
  HONGKONGSAR: 'HK',
  HONGKONGCHINA: 'HK',
  ESTADOSUNIDOS: 'US',
  UNITEDSTATES: 'US',
  UNITEDSTATESOFAMERICA: 'US',
  USA: 'US',
  ALEMANHA: 'DE',
  GERMANY: 'DE',
  FRANCA: 'FR',
  FRANCE: 'FR',
  ITALIA: 'IT',
  ITALY: 'IT',
  ESPANHA: 'ES',
  SPAIN: 'ES',
  JAPAO: 'JP',
  JAPAN: 'JP',
  COREIADOSUL: 'KR',
  SOUTHKOREA: 'KR',
  KOREA: 'KR',
  INDIA: 'IN',
  MEXICO: 'MX',
  SINGAPURA: 'SG',
  SINGAPORE: 'SG',
  HOLANDA: 'NL',
  PAIXESBAIXOS: 'NL',
  NETHERLANDS: 'NL',
  ARGENTINA: 'AR',
  CHILE: 'CL',
  COLOMBIA: 'CO',
  PERU: 'PE',
  URUGUAI: 'UY',
  URUGUAY: 'UY',
  EMIRADOSARABES: 'AE',
  EMIRADOSARABESUNIDOS: 'AE',
  UNITEDARABEMIRATES: 'AE',
  UAE: 'AE',
  REINOUNIDO: 'GB',
  UNITEDKINGDOM: 'GB',
  UK: 'GB',
  TAIWAN: 'TW',
  VIETNA: 'VN',
  VIETNAM: 'VN',
}

function normalizarChaveNomePais(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
}

export function normalizarCodigoPaisIso2Prefill(valor: string | null | undefined): string | null {
  if (!valor) return null
  const bruto = valor.trim()
  if (!bruto) return null

  const soLetras = bruto.toUpperCase().replace(/[^A-Z]/g, '')
  if (soLetras.length === 2 && HUBS_POR_PAIS[soLetras]) return soLetras
  if (soLetras.length === 2) return soLetras

  const porNome = NOME_PAIS_PARA_ISO2[normalizarChaveNomePais(bruto)]
  if (porNome) return porNome

  if (soLetras.length >= 2) return soLetras.slice(0, 2)
  return null
}

export function sugerirHubLogisticoPorPaisPrefillBidFrete(
  codigoPais: string | null | undefined,
): HubLogisticoPaisPrefillBidFrete | null {
  const iso = normalizarCodigoPaisIso2Prefill(codigoPais)
  if (!iso) return null
  return HUBS_POR_PAIS[iso] ?? null
}
