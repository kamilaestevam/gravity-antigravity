/**
 * Último recurso — toda cotação com código de terminal DEVE aparecer no mapa.
 * Usa centro do país + deslocamento determinístico por código quando catálogo/Cadastros falham.
 */

import type { LocalCadastrosBidFreteInternacional } from './resolver-local-cadastros-bid-frete-internacional.js'

const CENTRO_PAIS_MAPA_BID_FRETE: Record<string, { latitude: number; longitude: number; nome: string }> = {
  AE: { latitude: 23.4241, longitude: 53.8478, nome: 'Emirados Árabes' },
  AR: { latitude: -38.4161, longitude: -63.6167, nome: 'Argentina' },
  AU: { latitude: -25.2744, longitude: 133.7751, nome: 'Austrália' },
  BE: { latitude: 50.5039, longitude: 4.4699, nome: 'Bélgica' },
  BR: { latitude: -14.235, longitude: -51.9253, nome: 'Brasil' },
  CA: { latitude: 56.1304, longitude: -106.3468, nome: 'Canadá' },
  CL: { latitude: -35.6751, longitude: -71.543, nome: 'Chile' },
  CN: { latitude: 35.8617, longitude: 104.1954, nome: 'China' },
  CO: { latitude: 4.5709, longitude: -74.2973, nome: 'Colômbia' },
  DE: { latitude: 51.1657, longitude: 10.4515, nome: 'Alemanha' },
  ES: { latitude: 40.4637, longitude: -3.7492, nome: 'Espanha' },
  FR: { latitude: 46.2276, longitude: 2.2137, nome: 'França' },
  GB: { latitude: 55.3781, longitude: -3.436, nome: 'Reino Unido' },
  HK: { latitude: 22.3193, longitude: 114.1694, nome: 'Hong Kong' },
  ID: { latitude: -0.7893, longitude: 113.9213, nome: 'Indonésia' },
  IN: { latitude: 20.5937, longitude: 78.9629, nome: 'Índia' },
  IT: { latitude: 41.8719, longitude: 12.5674, nome: 'Itália' },
  JP: { latitude: 36.2048, longitude: 138.2529, nome: 'Japão' },
  KR: { latitude: 35.9078, longitude: 127.7669, nome: 'Coreia do Sul' },
  MX: { latitude: 23.6345, longitude: -102.5528, nome: 'México' },
  MY: { latitude: 4.2105, longitude: 101.9758, nome: 'Malásia' },
  NL: { latitude: 52.1326, longitude: 5.2913, nome: 'Países Baixos' },
  PE: { latitude: -9.19, longitude: -75.0152, nome: 'Peru' },
  PL: { latitude: 51.9194, longitude: 19.1451, nome: 'Polônia' },
  PT: { latitude: 39.3999, longitude: -8.2245, nome: 'Portugal' },
  SG: { latitude: 1.3521, longitude: 103.8198, nome: 'Singapura' },
  TH: { latitude: 15.87, longitude: 100.9925, nome: 'Tailândia' },
  TR: { latitude: 38.9637, longitude: 35.2433, nome: 'Turquia' },
  TW: { latitude: 23.6978, longitude: 120.9605, nome: 'Taiwan' },
  US: { latitude: 37.0902, longitude: -95.7129, nome: 'Estados Unidos' },
  VN: { latitude: 14.0583, longitude: 108.2772, nome: 'Vietnã' },
  ZA: { latitude: -30.5595, longitude: 22.9375, nome: 'África do Sul' },
  XX: { latitude: 0, longitude: 0, nome: 'Internacional' },
}

function deslocamentoDeterministico(codigo: string): { latitude: number; longitude: number } {
  let hash = 0
  for (let i = 0; i < codigo.length; i += 1) {
    hash = (hash * 31 + codigo.charCodeAt(i)) >>> 0
  }
  const latDelta = ((hash % 1000) / 1000 - 0.5) * 3.5
  const lngDelta = (((Math.floor(hash / 1000) % 1000) / 1000) - 0.5) * 3.5
  return { latitude: latDelta, longitude: lngDelta }
}

function normalizarPaisIso2(pais: string | undefined): string {
  const bruto = pais?.trim().toUpperCase() ?? ''
  if (/^[A-Z]{2}$/.test(bruto)) return bruto
  return 'XX'
}

export function resolverCoordenadasGarantidasMapaBidFreteInternacional(
  codigo: string,
  contexto?: { nome?: string; pais?: string },
): LocalCadastrosBidFreteInternacional {
  const codigoUpper = codigo.trim().toUpperCase()
  const pais = normalizarPaisIso2(contexto?.pais)
  const centro = CENTRO_PAIS_MAPA_BID_FRETE[pais] ?? CENTRO_PAIS_MAPA_BID_FRETE.XX
  const deslocamento = deslocamentoDeterministico(codigoUpper)
  const nome = contexto?.nome?.trim() || codigoUpper

  console.warn('[bid-frete/mapa] coordenadas garantidas por país — terminal fora do catálogo', {
    codigo: codigoUpper,
    pais,
  })

  return {
    codigo: codigoUpper,
    nome,
    pais,
    latitude: centro.latitude + deslocamento.latitude,
    longitude: centro.longitude + deslocamento.longitude,
  }
}
