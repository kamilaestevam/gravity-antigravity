/**
 * visaoGeralMapaPedido.ts — Agregação geográfica para o globo da Visão Geral
 *
 * Deriva pins, rotas e rankings a partir de pedidos reais (sem mocks).
 * Padrão visual alinhado ao BID Frete Internacional: origens estrangeiras → hubs no Brasil.
 */

import type { Pedido } from './types'

export type TipoOperacaoMapa = 'importacao' | 'exportacao'

export type PapelPinMapa = 'origem' | 'destino'

export interface VisaoGeralMapPin {
  id: number
  locKey: string
  label: string
  portCode: string
  country: string
  lat: number
  lng: number
  geoLat: number
  geoLng: number
  pedidosCount: number
  maiorValor: number
  moeda: string
  pctVolume: number
  tipoOperacao: TipoOperacaoMapa
  parceiro: string
  flag: string
  papel: PapelPinMapa
  contratosCambioCount: number
  totalAReceber: number
  totalAPagar: number
  moedaCambio: string
}

export interface VisaoGeralRankingLocal {
  rank: number
  name: string
  code: string
  flag: string
  count: number
  pct: number
  pinId: number | null
  locKey: string
}

export interface VisaoGeralDetalheLocal {
  locKey: string
  label: string
  code: string
  flag: string
  country: string
  pedidosCount: number
  contratosCambioCount: number
  totalAReceber: number
  totalAPagar: number
  moedaCambio: string
  pinId: number | null
  rotas: VisaoGeralRotaDetalhe[]
}

export interface VisaoGeralVencimentoCambio {
  data: string
  valor: number
  moeda: string
}

export interface VisaoGeralTimelineVencimento {
  chave: string
  label: string
  receber: number
  pagar: number
}

export interface VisaoGeralResumoVencimentos {
  quantidade: number
  valorTotal: number
  moeda: string
  proximoData: string | null
  vencidos: number
  proximos7Dias: number
}

export interface VisaoGeralRotaDetalhe {
  fromPort: string
  fromFlag: string
  toPort: string
  toFlag: string
  nome_workspace: string
  tipoOperacao: TipoOperacaoMapa
  pedidos: number
  valorTotal: number
  moeda: string
  incoterm: string
  parceiro: string
  vencimentosReceber: VisaoGeralVencimentoCambio[]
  vencimentosPagar: VisaoGeralVencimentoCambio[]
  resumoVencimentosReceber: VisaoGeralResumoVencimentos
  resumoVencimentosPagar: VisaoGeralResumoVencimentos
  timelineVencimentos: VisaoGeralTimelineVencimento[]
}

export interface VisaoGeralArcRoute {
  fromId: number
  toId: number
  color: string
  heightFactor?: number
  mode: TipoOperacaoMapa
}

export interface VisaoGeralModalGlobo {
  key: TipoOperacaoMapa
  label: string
  count: number
  pct: number
  cor: string
}

export interface FornecedorMapaGeo {
  paisIso: string
  nome: string
}

export interface VisaoGeralMapaData {
  pins: VisaoGeralMapPin[]
  globeRoutes: VisaoGeralArcRoute[]
  conexoesPorPin: Record<number, VisaoGeralRotaDetalhe[]>
  detalhesPorLocKey: Record<string, VisaoGeralDetalheLocal>
  topOrigens: VisaoGeralRankingLocal[]
  topDestinos: VisaoGeralRankingLocal[]
  modaisGlobo: VisaoGeralModalGlobo[]
}

interface GeoCoord {
  lat: number
  lng: number
  flag: string
  label: string
}

interface LocAgg {
  key: string
  label: string
  country: string
  code: string
  flag: string
  geoLat: number | null
  geoLng: number | null
  count: number
  valorTotal: number
  moeda: string
  parceiro: string
  tipoOperacao: TipoOperacaoMapa
}

interface LocPedido {
  key: string
  label: string
  country: string
  cidade: string | null
  tipo: TipoOperacaoMapa
  parceiro: string
}

interface CambioLocAgg {
  contratoIds: Set<string>
  totalAReceber: number
  totalAPagar: number
  maiorValor: number
  moedaCambio: string
}

/** Hubs brasileiros no globo — mesmo conceito do BID Frete Internacional (Guarulhos, Itajaí, Recife). */
const HUBS_BR_DESTINO: ReadonlyArray<{
  key: string
  label: string
  code: string
  geoLat: number
  geoLng: number
  flag: string
}> = [
  { key: 'hub|br|gru', label: 'Guarulhos', code: 'BRGRU', geoLat: -23.4543, geoLng: -46.5337, flag: '🇧🇷' },
  { key: 'hub|br|iti', label: 'Itajaí', code: 'BRITI', geoLat: -26.907, geoLng: -48.6619, flag: '🇧🇷' },
  { key: 'hub|br|rec', label: 'Recife', code: 'BRREC', geoLat: -8.0476, geoLng: -34.877, flag: '🇧🇷' },
]

const BRASIL_GEO: GeoCoord = { lat: -15.7942, lng: -47.8822, flag: '🇧🇷', label: 'Brasil' }

const PAIS_GEO: Record<string, GeoCoord> = {
  brasil: BRASIL_GEO,
  brazil: BRASIL_GEO,
  br: BRASIL_GEO,
  china: { lat: 31.2304, lng: 121.4737, flag: '🇨🇳', label: 'China' },
  cn: { lat: 31.2304, lng: 121.4737, flag: '🇨🇳', label: 'China' },
  'estados unidos': { lat: 25.7617, lng: -80.1918, flag: '🇺🇸', label: 'Estados Unidos' },
  eua: { lat: 25.7617, lng: -80.1918, flag: '🇺🇸', label: 'Estados Unidos' },
  usa: { lat: 25.7617, lng: -80.1918, flag: '🇺🇸', label: 'Estados Unidos' },
  us: { lat: 25.7617, lng: -80.1918, flag: '🇺🇸', label: 'Estados Unidos' },
  argentina: { lat: -34.6037, lng: -58.3816, flag: '🇦🇷', label: 'Argentina' },
  ar: { lat: -34.6037, lng: -58.3816, flag: '🇦🇷', label: 'Argentina' },
  alemanha: { lat: 53.5511, lng: 9.9937, flag: '🇩🇪', label: 'Alemanha' },
  germany: { lat: 53.5511, lng: 9.9937, flag: '🇩🇪', label: 'Alemanha' },
  de: { lat: 53.5511, lng: 9.9937, flag: '🇩🇪', label: 'Alemanha' },
  italia: { lat: 45.4642, lng: 9.19, flag: '🇮🇹', label: 'Itália' },
  italy: { lat: 45.4642, lng: 9.19, flag: '🇮🇹', label: 'Itália' },
  it: { lat: 45.4642, lng: 9.19, flag: '🇮🇹', label: 'Itália' },
  japao: { lat: 35.6762, lng: 139.6503, flag: '🇯🇵', label: 'Japão' },
  japan: { lat: 35.6762, lng: 139.6503, flag: '🇯🇵', label: 'Japão' },
  jp: { lat: 35.6762, lng: 139.6503, flag: '🇯🇵', label: 'Japão' },
  'coreia do sul': { lat: 37.5665, lng: 126.978, flag: '🇰🇷', label: 'Coreia do Sul' },
  'south korea': { lat: 37.5665, lng: 126.978, flag: '🇰🇷', label: 'Coreia do Sul' },
  kr: { lat: 37.5665, lng: 126.978, flag: '🇰🇷', label: 'Coreia do Sul' },
  india: { lat: 19.076, lng: 72.8777, flag: '🇮🇳', label: 'Índia' },
  in: { lat: 19.076, lng: 72.8777, flag: '🇮🇳', label: 'Índia' },
  mexico: { lat: 19.4326, lng: -99.1332, flag: '🇲🇽', label: 'México' },
  mx: { lat: 19.4326, lng: -99.1332, flag: '🇲🇽', label: 'México' },
  chile: { lat: -33.4489, lng: -70.6693, flag: '🇨🇱', label: 'Chile' },
  cl: { lat: -33.4489, lng: -70.6693, flag: '🇨🇱', label: 'Chile' },
  paraguai: { lat: -25.2637, lng: -57.5759, flag: '🇵🇾', label: 'Paraguai' },
  py: { lat: -25.2637, lng: -57.5759, flag: '🇵🇾', label: 'Paraguai' },
  uruguai: { lat: -34.9011, lng: -56.1645, flag: '🇺🇾', label: 'Uruguai' },
  uy: { lat: -34.9011, lng: -56.1645, flag: '🇺🇾', label: 'Uruguai' },
  portugal: { lat: 38.7223, lng: -9.1393, flag: '🇵🇹', label: 'Portugal' },
  pt: { lat: 38.7223, lng: -9.1393, flag: '🇵🇹', label: 'Portugal' },
  espana: { lat: 40.4168, lng: -3.7038, flag: '🇪🇸', label: 'Espanha' },
  spain: { lat: 40.4168, lng: -3.7038, flag: '🇪🇸', label: 'Espanha' },
  es: { lat: 40.4168, lng: -3.7038, flag: '🇪🇸', label: 'Espanha' },
  franca: { lat: 48.8566, lng: 2.3522, flag: '🇫🇷', label: 'França' },
  france: { lat: 48.8566, lng: 2.3522, flag: '🇫🇷', label: 'França' },
  fr: { lat: 48.8566, lng: 2.3522, flag: '🇫🇷', label: 'França' },
  'reino unido': { lat: 51.5074, lng: -0.1278, flag: '🇬🇧', label: 'Reino Unido' },
  uk: { lat: 51.5074, lng: -0.1278, flag: '🇬🇧', label: 'Reino Unido' },
  gb: { lat: 51.5074, lng: -0.1278, flag: '🇬🇧', label: 'Reino Unido' },
  holanda: { lat: 52.3676, lng: 4.9041, flag: '🇳🇱', label: 'Holanda' },
  netherlands: { lat: 52.3676, lng: 4.9041, flag: '🇳🇱', label: 'Holanda' },
  nl: { lat: 52.3676, lng: 4.9041, flag: '🇳🇱', label: 'Holanda' },
  belgica: { lat: 50.8503, lng: 4.3517, flag: '🇧🇪', label: 'Bélgica' },
  be: { lat: 50.8503, lng: 4.3517, flag: '🇧🇪', label: 'Bélgica' },
  suica: { lat: 47.3769, lng: 8.5417, flag: '🇨🇭', label: 'Suíça' },
  ch: { lat: 47.3769, lng: 8.5417, flag: '🇨🇭', label: 'Suíça' },
  canada: { lat: 43.6532, lng: -79.3832, flag: '🇨🇦', label: 'Canadá' },
  ca: { lat: 43.6532, lng: -79.3832, flag: '🇨🇦', label: 'Canadá' },
  taiwan: { lat: 25.033, lng: 121.5654, flag: '🇹🇼', label: 'Taiwan' },
  tw: { lat: 25.033, lng: 121.5654, flag: '🇹🇼', label: 'Taiwan' },
  vietna: { lat: 10.8231, lng: 106.6297, flag: '🇻🇳', label: 'Vietnã' },
  vn: { lat: 10.8231, lng: 106.6297, flag: '🇻🇳', label: 'Vietnã' },
  turquia: { lat: 41.0082, lng: 28.9784, flag: '🇹🇷', label: 'Turquia' },
  tr: { lat: 41.0082, lng: 28.9784, flag: '🇹🇷', label: 'Turquia' },
  singapura: { lat: 1.3521, lng: 103.8198, flag: '🇸🇬', label: 'Singapura' },
  sg: { lat: 1.3521, lng: 103.8198, flag: '🇸🇬', label: 'Singapura' },
  australia: { lat: -33.8688, lng: 151.2093, flag: '🇦🇺', label: 'Austrália' },
  au: { lat: -33.8688, lng: 151.2093, flag: '🇦🇺', label: 'Austrália' },
  'hong kong': { lat: 22.3193, lng: 114.1694, flag: '🇭🇰', label: 'Hong Kong' },
  hk: { lat: 22.3193, lng: 114.1694, flag: '🇭🇰', label: 'Hong Kong' },
  malasia: { lat: 3.139, lng: 101.6869, flag: '🇲🇾', label: 'Malásia' },
  my: { lat: 3.139, lng: 101.6869, flag: '🇲🇾', label: 'Malásia' },
  tailandia: { lat: 13.7563, lng: 100.5018, flag: '🇹🇭', label: 'Tailândia' },
  th: { lat: 13.7563, lng: 100.5018, flag: '🇹🇭', label: 'Tailândia' },
  indonesia: { lat: -6.2088, lng: 106.8456, flag: '🇮🇩', label: 'Indonésia' },
  id: { lat: -6.2088, lng: 106.8456, flag: '🇮🇩', label: 'Indonésia' },
  filipinas: { lat: 14.5995, lng: 120.9842, flag: '🇵🇭', label: 'Filipinas' },
  ph: { lat: 14.5995, lng: 120.9842, flag: '🇵🇭', label: 'Filipinas' },
  polonia: { lat: 52.2297, lng: 21.0122, flag: '🇵🇱', label: 'Polônia' },
  pl: { lat: 52.2297, lng: 21.0122, flag: '🇵🇱', label: 'Polônia' },
  colombia: { lat: 4.711, lng: -74.0721, flag: '🇨🇴', label: 'Colômbia' },
  co: { lat: 4.711, lng: -74.0721, flag: '🇨🇴', label: 'Colômbia' },
  peru: { lat: -12.0464, lng: -77.0428, flag: '🇵🇪', label: 'Peru' },
  pe: { lat: -12.0464, lng: -77.0428, flag: '🇵🇪', label: 'Peru' },
  'emirados arabes unidos': { lat: 25.2048, lng: 55.2708, flag: '🇦🇪', label: 'Emirados Árabes Unidos' },
  ae: { lat: 25.2048, lng: 55.2708, flag: '🇦🇪', label: 'Emirados Árabes Unidos' },
  'arabia saudita': { lat: 24.7136, lng: 46.6753, flag: '🇸🇦', label: 'Arábia Saudita' },
  sa: { lat: 24.7136, lng: 46.6753, flag: '🇸🇦', label: 'Arábia Saudita' },
  'africa do sul': { lat: -26.2041, lng: 28.0473, flag: '🇿🇦', label: 'África do Sul' },
  za: { lat: -26.2041, lng: 28.0473, flag: '🇿🇦', label: 'África do Sul' },
  bangladesh: { lat: 23.8103, lng: 90.4125, flag: '🇧🇩', label: 'Bangladesh' },
  bd: { lat: 23.8103, lng: 90.4125, flag: '🇧🇩', label: 'Bangladesh' },
  paquistao: { lat: 24.8607, lng: 67.0011, flag: '🇵🇰', label: 'Paquistão' },
  pk: { lat: 24.8607, lng: 67.0011, flag: '🇵🇰', label: 'Paquistão' },
  israel: { lat: 32.0853, lng: 34.7818, flag: '🇮🇱', label: 'Israel' },
  il: { lat: 32.0853, lng: 34.7818, flag: '🇮🇱', label: 'Israel' },
  egito: { lat: 30.0444, lng: 31.2357, flag: '🇪🇬', label: 'Egito' },
  eg: { lat: 30.0444, lng: 31.2357, flag: '🇪🇬', label: 'Egito' },
  romenia: { lat: 44.4268, lng: 26.1025, flag: '🇷🇴', label: 'Romênia' },
  ro: { lat: 44.4268, lng: 26.1025, flag: '🇷🇴', label: 'Romênia' },
  suecia: { lat: 59.3293, lng: 18.0686, flag: '🇸🇪', label: 'Suécia' },
  se: { lat: 59.3293, lng: 18.0686, flag: '🇸🇪', label: 'Suécia' },
  noruega: { lat: 59.9139, lng: 10.7522, flag: '🇳🇴', label: 'Noruega' },
  no: { lat: 59.9139, lng: 10.7522, flag: '🇳🇴', label: 'Noruega' },
  austria: { lat: 48.2082, lng: 16.3738, flag: '🇦🇹', label: 'Áustria' },
  at: { lat: 48.2082, lng: 16.3738, flag: '🇦🇹', label: 'Áustria' },
  irlanda: { lat: 53.3498, lng: -6.2603, flag: '🇮🇪', label: 'Irlanda' },
  ie: { lat: 53.3498, lng: -6.2603, flag: '🇮🇪', label: 'Irlanda' },
  'nova zelandia': { lat: -36.8485, lng: 174.7633, flag: '🇳🇿', label: 'Nova Zelândia' },
  nz: { lat: -36.8485, lng: 174.7633, flag: '🇳🇿', label: 'Nova Zelândia' },
  albânia: { lat: 41.3275, lng: 19.8187, flag: '🇦🇱', label: 'Albânia' },
  albania: { lat: 41.3275, lng: 19.8187, flag: '🇦🇱', label: 'Albânia' },
  al: { lat: 41.3275, lng: 19.8187, flag: '🇦🇱', label: 'Albânia' },
  'ilhas cayman': { lat: 19.3133, lng: -81.2546, flag: '🇰🇾', label: 'Ilhas Cayman' },
  cayman: { lat: 19.3133, lng: -81.2546, flag: '🇰🇾', label: 'Ilhas Cayman' },
  ky: { lat: 19.3133, lng: -81.2546, flag: '🇰🇾', label: 'Ilhas Cayman' },
}

/** UN/LOCODE → coordenada de porto (refina origem/destino marítimo). */
const PORTO_UNLOCODE_GEO: Record<
  string,
  { lat: number; lng: number; country: string; label: string; iso: string }
> = {
  ARBUE: { lat: -34.6037, lng: -58.3816, country: 'Argentina', label: 'Buenos Aires', iso: 'AR' },
  BRSSZ: { lat: -23.9608, lng: -46.3336, country: 'Brasil', label: 'Santos', iso: 'BR' },
  BRITJ: { lat: -26.907, lng: -48.6619, country: 'Brasil', label: 'Itajaí', iso: 'BR' },
  BRREC: { lat: -8.0476, lng: -34.877, country: 'Brasil', label: 'Recife', iso: 'BR' },
  MXMEX: { lat: 19.4326, lng: -99.1332, country: 'México', label: 'México', iso: 'MX' },
  CNSHA: { lat: 31.2304, lng: 121.4737, country: 'China', label: 'Shanghai', iso: 'CN' },
  USMIA: { lat: 25.7617, lng: -80.1918, country: 'Estados Unidos', label: 'Miami', iso: 'US' },
  DEHAM: { lat: 53.5511, lng: 9.9937, country: 'Alemanha', label: 'Hamburgo', iso: 'DE' },
  NLRTM: { lat: 51.9244, lng: 4.4777, country: 'Holanda', label: 'Rotterdam', iso: 'NL' },
}

/** IATA → país/cidade para destinos aéreos sem `local_de_destino`. */
const AEROPORTO_IATA_GEO: Record<string, { lat: number; lng: number; country: string; label: string; iso: string }> = {
  GRU: { lat: -23.4543, lng: -46.5337, country: 'Brasil', label: 'Guarulhos', iso: 'BR' },
  VCP: { lat: -23.0074, lng: -47.1345, country: 'Brasil', label: 'Campinas', iso: 'BR' },
  REC: { lat: -8.0476, lng: -34.877, country: 'Brasil', label: 'Recife', iso: 'BR' },
  MIA: { lat: 25.7959, lng: -80.287, country: 'Estados Unidos', label: 'Miami', iso: 'US' },
  JFK: { lat: 40.6413, lng: -73.7781, country: 'Estados Unidos', label: 'Nova York', iso: 'US' },
  LAX: { lat: 33.9416, lng: -118.4085, country: 'Estados Unidos', label: 'Los Angeles', iso: 'US' },
  ORD: { lat: 41.9742, lng: -87.9073, country: 'Estados Unidos', label: 'Chicago', iso: 'US' },
  FRA: { lat: 50.0379, lng: 8.5622, country: 'Alemanha', label: 'Frankfurt', iso: 'DE' },
  AMS: { lat: 52.3105, lng: 4.7683, country: 'Holanda', label: 'Amsterdam', iso: 'NL' },
  LHR: { lat: 51.47, lng: -0.4543, country: 'Reino Unido', label: 'Londres', iso: 'GB' },
  CDG: { lat: 49.0097, lng: 2.5479, country: 'França', label: 'Paris', iso: 'FR' },
  DXB: { lat: 25.2532, lng: 55.3657, country: 'Emirados Árabes Unidos', label: 'Dubai', iso: 'AE' },
  HKG: { lat: 22.308, lng: 113.9185, country: 'Hong Kong', label: 'Hong Kong', iso: 'HK' },
  SIN: { lat: 1.3644, lng: 103.9915, country: 'Singapura', label: 'Singapura', iso: 'SG' },
  PVG: { lat: 31.1443, lng: 121.8083, country: 'China', label: 'Shanghai', iso: 'CN' },
  NRT: { lat: 35.772, lng: 140.3929, country: 'Japão', label: 'Tóquio', iso: 'JP' },
  EZE: { lat: -34.8222, lng: -58.5358, country: 'Argentina', label: 'Buenos Aires', iso: 'AR' },
  SCL: { lat: -33.393, lng: -70.7858, country: 'Chile', label: 'Santiago', iso: 'CL' },
  BOG: { lat: 4.7016, lng: -74.1469, country: 'Colômbia', label: 'Bogotá', iso: 'CO' },
  LIM: { lat: -12.0219, lng: -77.1143, country: 'Peru', label: 'Lima', iso: 'PE' },
}

const CIDADE_GEO: Record<string, { lat: number; lng: number }> = {
  'shanghai|china': { lat: 31.2304, lng: 121.4737 },
  'shenzhen|china': { lat: 22.5431, lng: 114.0579 },
  'santos|brasil': { lat: -23.9608, lng: -46.3336 },
  'sao paulo|brasil': { lat: -23.5505, lng: -46.6333 },
  'guarulhos|brasil': { lat: -23.4543, lng: -46.5337 },
  'itajai|brasil': { lat: -26.907, lng: -48.6619 },
  'recife|brasil': { lat: -8.0476, lng: -34.877 },
  'miami|estados unidos': { lat: 25.7617, lng: -80.1918 },
  'buenos aires|argentina': { lat: -34.6037, lng: -58.3816 },
  'rotterdam|holanda': { lat: 51.9244, lng: 4.4777 },
  'hamburgo|alemanha': { lat: 53.5511, lng: 9.9937 },
  'singapura|singapura': { lat: 1.3521, lng: 103.8198 },
}

const MAPA_VAZIO: VisaoGeralMapaData = {
  pins: [],
  globeRoutes: [],
  conexoesPorPin: {},
  detalhesPorLocKey: {},
  topOrigens: [],
  topDestinos: [],
  modaisGlobo: [],
}

function normTexto(raw: string | null | undefined): string {
  return (raw ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

function isBrasil(country: string): boolean {
  const n = normTexto(country)
  return n === 'brasil' || n === 'brazil' || n === 'br'
}

const PAIS_GEO_CHAVES_ORDENADAS = Object.keys(PAIS_GEO).sort((a, b) => b.length - a.length)

/** Infere país a partir do nome do importador (ex.: "Argentina Importadora S.A." → Argentina). */
function inferirPaisDoTexto(texto: string): string | null {
  const norm = normTexto(texto)
  if (!norm) return null
  for (const key of PAIS_GEO_CHAVES_ORDENADAS) {
    if (key.length < 3) continue
    if (norm.includes(key)) return PAIS_GEO[key].label
  }
  return null
}

function keySuffixDePais(country: string): string {
  const norm = normTexto(country)
  for (const [key, geo] of Object.entries(PAIS_GEO)) {
    if (key.length === 2 && normTexto(geo.label) === norm) return key
  }
  return norm
}

function geoPorIso(raw: string | null | undefined): GeoCoord | null {
  if (!raw?.trim()) return null
  const iso = normTexto(raw).slice(0, 2)
  return PAIS_GEO[iso] ?? null
}

function isoDeUnLocode(codigo: string | null | undefined): string | null {
  if (!codigo?.trim() || codigo.trim().length < 2) return null
  const iso = codigo.trim().toUpperCase().slice(0, 2)
  return geoPorIso(iso) ? iso : null
}

function normalizarCodigoLogistica(codigo: string | null | undefined): string {
  return codigo?.trim().toUpperCase() ?? ''
}

function locPedidoDeIso(
  isoRaw: string,
  tipo: TipoOperacaoMapa,
  parceiro: string,
  keyPrefix: string,
  labelOverride?: string | null,
): LocPedido | null {
  const geo = geoPorIso(isoRaw)
  if (!geo) return null
  const iso = normTexto(isoRaw).slice(0, 2)
  return {
    key: `${keyPrefix}|iso|${iso}`,
    label: labelOverride?.trim() || geo.label,
    country: geo.label,
    cidade: null,
    tipo,
    parceiro,
  }
}

function locPedidoDePorto(
  codigoRaw: string | null | undefined,
  tipo: TipoOperacaoMapa,
  parceiro: string,
  keyPrefix: string,
): LocPedido | null {
  const codigo = normalizarCodigoLogistica(codigoRaw)
  if (!codigo) return null

  const portoHit = PORTO_UNLOCODE_GEO[codigo]
  if (portoHit) {
    return {
      key: `${keyPrefix}|porto|${codigo}`,
      label: portoHit.label,
      country: portoHit.country,
      cidade: portoHit.label,
      tipo,
      parceiro,
    }
  }

  const iso = isoDeUnLocode(codigo)
  if (!iso) return null
  const geo = geoPorIso(iso)
  if (!geo) return null
  return {
    key: `${keyPrefix}|porto|${codigo}`,
    label: codigo,
    country: geo.label,
    cidade: null,
    tipo,
    parceiro,
  }
}

function locPedidoDeAeroporto(
  iataRaw: string | null | undefined,
  tipo: TipoOperacaoMapa,
  parceiro: string,
  keyPrefix: string,
): LocPedido | null {
  const iata = normalizarCodigoLogistica(iataRaw)
  if (!iata) return null
  const apt = AEROPORTO_IATA_GEO[iata]
  if (!apt) return null
  return {
    key: `${keyPrefix}|apt|${iata}`,
    label: `${apt.label} (${iata})`,
    country: apt.country,
    cidade: apt.label,
    tipo,
    parceiro,
  }
}

function hubBrasilPorCodigo(hubKey: string): (typeof HUBS_BR_DESTINO)[number] {
  return HUBS_BR_DESTINO.find(h => h.key === hubKey) ?? HUBS_BR_DESTINO[0]
}

/** Hub BR a partir de porto/aeroporto de origem (exportação) ou destino (importação). */
function resolverHubBrasilPorLogistica(p: Pedido, sentido: 'origem' | 'destino'): (typeof HUBS_BR_DESTINO)[number] {
  const porto = (sentido === 'origem' ? p.porto_origem : p.porto_destino)?.trim().toUpperCase() ?? ''
  const aeroporto = (sentido === 'origem' ? p.aeroporto_origem : p.aeroporto_destino)?.trim().toUpperCase() ?? ''

  if (porto.includes('ITJ') || porto.includes('NVT') || porto.startsWith('BRIT')) {
    return hubBrasilPorCodigo('hub|br|iti')
  }
  if (porto.includes('REC') || porto.startsWith('BRRE') || aeroporto === 'REC') {
    return hubBrasilPorCodigo('hub|br|rec')
  }
  if (
    porto.includes('SSZ') ||
    porto.includes('SANTOS') ||
    porto.startsWith('BRSS') ||
    aeroporto === 'GRU' ||
    aeroporto === 'VCP'
  ) {
    return hubBrasilPorCodigo('hub|br|gru')
  }

  const seed = p.company_id ?? p.id
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash + seed.charCodeAt(i)) | 0
  return HUBS_BR_DESTINO[Math.abs(hash) % HUBS_BR_DESTINO.length]
}

interface DestinoExportResolvido {
  keySuffix: string
  label: string
  country: string
  cidade: string | null
}

/** País destino: logística (lista) → cadastro importador → porto/aeroporto → heurística. */
function resolverDestinoExportacao(
  p: Pedido,
  fornecedoresPorId: ReadonlyMap<string, FornecedorMapaGeo>,
): DestinoExportResolvido {
  const nomeImportador = p.nome_importador?.trim() || 'Destino não informado'

  const isoDest = p.local_de_destino?.trim()
  if (isoDest && !isBrasil(isoDest)) {
    const geo = geoPorIso(isoDest)
    if (geo) {
      return {
        keySuffix: keySuffixDePais(geo.label),
        label: geo.label,
        country: geo.label,
        cidade: null,
      }
    }
  }

  const portoDest = p.porto_destino?.trim()
  if (portoDest) {
    const portoHit = PORTO_UNLOCODE_GEO[normalizarCodigoLogistica(portoDest)]
    if (portoHit && !isBrasil(portoHit.country)) {
      return {
        keySuffix: normTexto(portoHit.iso),
        label: portoHit.label,
        country: portoHit.country,
        cidade: portoHit.label,
      }
    }
  }

  const aptDest = p.aeroporto_destino?.trim().toUpperCase()
  if (aptDest && AEROPORTO_IATA_GEO[aptDest]) {
    const apt = AEROPORTO_IATA_GEO[aptDest]
    if (!isBrasil(apt.country)) {
      return {
        keySuffix: normTexto(apt.iso),
        label: `${apt.label} (${aptDest})`,
        country: apt.country,
        cidade: apt.label,
      }
    }
  }

  const idImportador = p.exportacao_importador_id?.trim()
  if (idImportador) {
    const forn = fornecedoresPorId.get(idImportador)
    if (forn && !isBrasil(forn.paisIso)) {
      const geo = geoPorIso(forn.paisIso)
      if (geo) {
        return {
          keySuffix: keySuffixDePais(geo.label),
          label: forn.nome || nomeImportador,
          country: geo.label,
          cidade: null,
        }
      }
    }
  }

  if (portoDest) {
    const iso = isoDeUnLocode(portoDest)
    if (iso && !isBrasil(iso)) {
      const geo = geoPorIso(iso)
      if (geo) {
        return {
          keySuffix: normTexto(iso),
          label: portoDest.toUpperCase(),
          country: geo.label,
          cidade: null,
        }
      }
    }
  }

  if (aptDest && AEROPORTO_IATA_GEO[aptDest]) {
    const apt = AEROPORTO_IATA_GEO[aptDest]
    return {
      keySuffix: normTexto(apt.iso),
      label: `${apt.label} (${aptDest})`,
      country: apt.country,
      cidade: apt.label,
    }
  }

  const inferido = inferirPaisDoTexto(nomeImportador)
  if (inferido) {
    return {
      keySuffix: keySuffixDePais(inferido),
      label: nomeImportador,
      country: inferido,
      cidade: null,
    }
  }

  return {
    keySuffix: normTexto(nomeImportador),
    label: nomeImportador,
    country: nomeImportador,
    cidade: null,
  }
}

function resolverGeo(pais: string, cidade: string | null): { geoLat: number | null; geoLng: number | null; flag: string; label: string; code: string } {
  const paisNorm = normTexto(pais)
  const cidadeNorm = normTexto(cidade)
  const cidadeKey = cidadeNorm ? `${cidadeNorm}|${paisNorm}` : ''
  const cidadeHit = cidadeKey ? CIDADE_GEO[cidadeKey] : undefined
  const paisHit = PAIS_GEO[paisNorm]

  if (cidadeHit) {
    return {
      geoLat: cidadeHit.lat,
      geoLng: cidadeHit.lng,
      flag: paisHit?.flag ?? '🌍',
      label: cidade ?? paisHit?.label ?? pais,
      code: (cidade ?? pais).slice(0, 6).toUpperCase(),
    }
  }

  if (paisHit) {
    return {
      geoLat: paisHit.lat,
      geoLng: paisHit.lng,
      flag: paisHit.flag,
      label: cidade ?? paisHit.label,
      code: paisNorm.slice(0, 2).toUpperCase() || 'XX',
    }
  }

  return {
    geoLat: null,
    geoLng: null,
    flag: '🌍',
    label: cidade ?? pais,
    code: '—',
  }
}

function locOrigem(
  p: Pedido,
  fornecedoresPorId: ReadonlyMap<string, FornecedorMapaGeo>,
): LocPedido | null {
  const parceiroImport = p.nome_exportador?.trim() ?? p.nome_fabricante?.trim() ?? '—'
  const parceiroExport = p.nome_exportador?.trim() ?? '—'

  if (p.tipo_operacao === 'exportacao') {
    const isoOrig = p.local_de_origem?.trim()
    if (isoOrig && !isBrasil(isoOrig)) {
      const deIso = locPedidoDeIso(isoOrig, 'exportacao', parceiroExport, 'orig-exp')
      if (deIso) return deIso
    }

    const dePorto = locPedidoDePorto(p.porto_origem, 'exportacao', parceiroExport, 'orig-exp')
    if (dePorto && isBrasil(dePorto.country)) {
      const hub = resolverHubBrasilPorLogistica(p, 'origem')
      return {
        key: `orig-exp|${hub.key}`,
        label: hub.label,
        country: 'Brasil',
        cidade: hub.label,
        tipo: 'exportacao',
        parceiro: parceiroExport,
      }
    }

    const deApt = locPedidoDeAeroporto(p.aeroporto_origem, 'exportacao', parceiroExport, 'orig-exp')
    if (deApt && isBrasil(deApt.country)) {
      const hub = resolverHubBrasilPorLogistica(p, 'origem')
      return {
        key: `orig-exp|${hub.key}`,
        label: hub.label,
        country: 'Brasil',
        cidade: hub.label,
        tipo: 'exportacao',
        parceiro: parceiroExport,
      }
    }

    const hub = resolverHubBrasilPorLogistica(p, 'origem')
    return {
      key: `orig-exp|${hub.key}`,
      label: hub.label,
      country: 'Brasil',
      cidade: hub.label,
      tipo: 'exportacao',
      parceiro: parceiroExport,
    }
  }

  const parceiro = parceiroImport

  const dePorto = locPedidoDePorto(p.porto_origem, 'importacao', parceiro, 'orig')
  if (dePorto && !isBrasil(dePorto.country)) return dePorto

  const deApt = locPedidoDeAeroporto(p.aeroporto_origem, 'importacao', parceiro, 'orig')
  if (deApt && !isBrasil(deApt.country)) return deApt

  const isoOrig = p.local_de_origem?.trim()
  if (isoOrig && !isBrasil(isoOrig)) {
    const deIso = locPedidoDeIso(isoOrig, 'importacao', parceiro, 'orig')
    if (deIso) return deIso
  }

  let country =
    p.pais_exportador?.trim() ||
    p.pais_fabricante?.trim() ||
    p.pais_ope?.trim() ||
    null
  const cidade =
    p.cidade_exportador?.trim() ||
    p.cidade_fabricante?.trim() ||
    p.cidade_ope?.trim() ||
    null

  if (!country) {
    const idExportador = p.importacao_exportador_id?.trim()
    if (idExportador) {
      const forn = fornecedoresPorId.get(idExportador)
      if (forn && !isBrasil(forn.paisIso)) {
        const geo = geoPorIso(forn.paisIso)
        if (geo) country = geo.label
      }
    }
  }

  if (!country && !cidade) {
    const dePortoBr = locPedidoDePorto(p.porto_origem, 'importacao', parceiro, 'orig')
    if (dePortoBr) return dePortoBr
    return null
  }

  const label =
    cidade ??
    p.nome_exportador?.trim() ??
    p.nome_fabricante?.trim() ??
    country

  if (!label) return null

  return {
    key: `orig|${normTexto(country ?? label)}|${normTexto(cidade)}|${normTexto(label)}`,
    label,
    country: country ?? label,
    cidade,
    tipo: 'importacao',
    parceiro,
  }
}

function locDestinoImport(hub: (typeof HUBS_BR_DESTINO)[number]): LocPedido {
  return {
    key: hub.key,
    label: hub.label,
    country: 'Brasil',
    cidade: hub.label,
    tipo: 'importacao',
    parceiro: '—',
  }
}

function locDestinoExport(
  p: Pedido,
  fornecedoresPorId: ReadonlyMap<string, FornecedorMapaGeo>,
): LocPedido {
  const destino = resolverDestinoExportacao(p, fornecedoresPorId)
  return {
    key: `dest|ext|${destino.keySuffix}`,
    label: destino.label,
    country: destino.country,
    cidade: destino.cidade,
    tipo: 'exportacao',
    parceiro: p.nome_importador?.trim() ?? '—',
  }
}

function toNumero(valor: unknown): number {
  const n = Number(valor)
  return Number.isFinite(n) ? n : 0
}

function acumularCambio(map: Map<string, CambioLocAgg>, locKey: string, p: Pedido) {
  let agg = map.get(locKey)
  const moedaCambio = p.moeda_cambio_pedido?.trim() || p.moeda_pedido?.trim() || 'BRL'
  const valorCambio = toNumero(p.valor_total_cambio_pedido) || toNumero(p.valor_total_pedido)

  if (!agg) {
    agg = {
      contratoIds: new Set<string>(),
      totalAReceber: 0,
      totalAPagar: 0,
      maiorValor: 0,
      moedaCambio,
    }
    map.set(locKey, agg)
  }

  const contratoId = p.contrato_cambio_id_pedido?.trim()
  if (contratoId) agg.contratoIds.add(contratoId)

  if (p.tipo_operacao === 'importacao') {
    agg.totalAPagar += valorCambio
  } else {
    agg.totalAReceber += valorCambio
  }

  if (valorCambio > agg.maiorValor) agg.maiorValor = valorCambio
}

function acumularLoc(map: Map<string, LocAgg>, loc: LocPedido, valor: number, moeda: string) {
  const valorSeguro = toNumero(valor)
  const geo = resolverGeo(loc.country, loc.cidade)
  const existente = map.get(loc.key)
  if (existente) {
    existente.count += 1
    existente.valorTotal += valorSeguro
    if (valorSeguro > 0 && existente.parceiro === '—') existente.parceiro = loc.parceiro
    return
  }
  map.set(loc.key, {
    key: loc.key,
    label: geo.label,
    country: loc.country,
    code: geo.code,
    flag: geo.flag,
    geoLat: geo.geoLat,
    geoLng: geo.geoLng,
    count: 1,
    valorTotal: valorSeguro,
    moeda,
    parceiro: loc.parceiro,
    tipoOperacao: loc.tipo,
  })
}

function acumularHub(map: Map<string, LocAgg>, hub: (typeof HUBS_BR_DESTINO)[number], valor: number, moeda: string) {
  const valorSeguro = toNumero(valor)
  const existente = map.get(hub.key)
  if (existente) {
    existente.count += 1
    existente.valorTotal += valorSeguro
    return
  }
  map.set(hub.key, {
    key: hub.key,
    label: hub.label,
    country: 'Brasil',
    code: hub.code,
    flag: hub.flag,
    geoLat: hub.geoLat,
    geoLng: hub.geoLng,
    count: 1,
    valorTotal: valorSeguro,
    moeda,
    parceiro: '—',
    tipoOperacao: 'importacao',
  })
}

interface RotaAggInterna {
  fromKey: string
  toKey: string
  fromPort: string
  fromFlag: string
  toPort: string
  toFlag: string
  nome_workspace: string
  tipoOperacao: TipoOperacaoMapa
  pedidos: number
  valorTotal: number
  moeda: string
  incoterm: string
  parceiro: string
  vencimentosReceber: VisaoGeralVencimentoCambio[]
  vencimentosPagar: VisaoGeralVencimentoCambio[]
}

const MESES_CURTOS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function extrairDiasCondicaoPagamento(condicao: string | null | undefined): number | null {
  if (!condicao?.trim()) return null
  const texto = condicao.trim()
  const net = texto.match(/net\s*(\d+)/i)
  if (net) return Number(net[1])
  const dias = texto.match(/(\d+)\s*(?:dias?|days?|dd\b)/i)
  if (dias) return Number(dias[1])
  const aposPct = texto.match(/\d+\s*%\s*[^0-9]*(\d+)\s*(?:dias?|days?)/i)
  if (aposPct) return Number(aposPct[1])
  return null
}

function resolverDataBaseVencimento(p: Pedido): Date | null {
  const candidatas = [
    p.data_invoice,
    p.data_documento_invoice,
    p.data_prevista_recebimento_original_invoice,
    p.data_emissao_pedido,
  ]
  for (const raw of candidatas) {
    if (!raw) continue
    const d = new Date(raw)
    if (!Number.isNaN(d.getTime())) return d
  }
  return null
}

function formatDataIso(d: Date): string {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function inferirVencimentoPedido(p: Pedido): VisaoGeralVencimentoCambio & { tipo: 'receber' | 'pagar' } | null {
  const base = resolverDataBaseVencimento(p)
  if (!base) return null

  const dias = extrairDiasCondicaoPagamento(p.condicao_pagamento) ?? 30
  const venc = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate() + dias))

  const valor = toNumero(p.valor_total_cambio_pedido) || toNumero(p.valor_total_pedido)
  if (valor <= 0) return null

  const moeda = p.moeda_cambio_pedido?.trim() || p.moeda_pedido?.trim() || 'USD'
  return {
    data: formatDataIso(venc),
    valor,
    moeda,
    tipo: p.tipo_operacao === 'importacao' ? 'pagar' : 'receber',
  }
}

function montarTimelineVencimentos(
  receber: VisaoGeralVencimentoCambio[],
  pagar: VisaoGeralVencimentoCambio[],
): VisaoGeralTimelineVencimento[] {
  const map = new Map<string, { receber: number; pagar: number }>()

  for (const v of receber) {
    const chave = v.data.slice(0, 7)
    const agg = map.get(chave) ?? { receber: 0, pagar: 0 }
    agg.receber += v.valor
    map.set(chave, agg)
  }
  for (const v of pagar) {
    const chave = v.data.slice(0, 7)
    const agg = map.get(chave) ?? { receber: 0, pagar: 0 }
    agg.pagar += v.valor
    map.set(chave, agg)
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, 6)
    .map(([chave, vals]) => {
      const [ano, mes] = chave.split('-').map(Number)
      return {
        chave,
        label: `${MESES_CURTOS[(mes ?? 1) - 1]}/${String(ano ?? '').slice(-2)}`,
        receber: vals.receber,
        pagar: vals.pagar,
      }
    })
}

function diasEntreIso(iso: string, hojeIso: string): number {
  const a = new Date(`${iso}T00:00:00Z`).getTime()
  const b = new Date(`${hojeIso}T00:00:00Z`).getTime()
  return Math.round((a - b) / 86_400_000)
}

function montarResumoVencimentos(
  lista: VisaoGeralVencimentoCambio[],
  hojeIso: string,
): VisaoGeralResumoVencimentos {
  if (lista.length === 0) {
    return {
      quantidade: 0,
      valorTotal: 0,
      moeda: 'USD',
      proximoData: null,
      vencidos: 0,
      proximos7Dias: 0,
    }
  }

  const ordenada = [...lista].sort((a, b) => a.data.localeCompare(b.data))
  let valorTotal = 0
  let vencidos = 0
  let proximos7Dias = 0
  const moeda = ordenada[0]?.moeda ?? 'USD'

  for (const v of ordenada) {
    valorTotal += v.valor
    const diff = diasEntreIso(v.data, hojeIso)
    if (diff < 0) vencidos += 1
    else if (diff <= 7) proximos7Dias += 1
  }

  const proximoFuturo = ordenada.find(v => diasEntreIso(v.data, hojeIso) >= 0)
  const proximoData = proximoFuturo?.data ?? ordenada[ordenada.length - 1]?.data ?? null

  return {
    quantidade: ordenada.length,
    valorTotal,
    moeda,
    proximoData,
    vencidos,
    proximos7Dias,
  }
}

function finalizarRotaDetalhe(rota: RotaAggInterna, hojeIso: string): VisaoGeralRotaDetalhe {
  const vencimentosReceber = [...rota.vencimentosReceber].sort((a, b) => a.data.localeCompare(b.data))
  const vencimentosPagar = [...rota.vencimentosPagar].sort((a, b) => a.data.localeCompare(b.data))
  const { fromKey: _f, toKey: _t, ...resto } = rota
  return {
    ...resto,
    vencimentosReceber,
    vencimentosPagar,
    resumoVencimentosReceber: montarResumoVencimentos(vencimentosReceber, hojeIso),
    resumoVencimentosPagar: montarResumoVencimentos(vencimentosPagar, hojeIso),
    timelineVencimentos: montarTimelineVencimentos(vencimentosReceber, vencimentosPagar),
  }
}

function acumularVencimentoRota(rota: RotaAggInterna, p: Pedido) {
  const venc = inferirVencimentoPedido(p)
  if (!venc) return
  const item = { data: venc.data, valor: venc.valor, moeda: venc.moeda }
  if (venc.tipo === 'pagar') rota.vencimentosPagar.push(item)
  else rota.vencimentosReceber.push(item)
}

function montarRanking(lista: LocAgg[], total: number, pinByKey: Map<string, number>): VisaoGeralRankingLocal[] {
  return [...lista]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map((item, idx) => ({
      rank: idx + 1,
      name: item.label,
      code: item.code,
      flag: item.flag,
      count: item.count,
      pct: total > 0 ? Math.round((item.count / total) * 1000) / 10 : 0,
      pinId: pinByKey.get(item.key) ?? null,
      locKey: item.key,
    }))
}

function rotasParaLoc(
  locKey: string,
  rotasMap: Map<string, RotaAggInterna>,
  hojeIso: string,
): VisaoGeralRotaDetalhe[] {
  return [...rotasMap.values()]
    .filter(r => r.fromKey === locKey || r.toKey === locKey)
    .sort((a, b) => b.pedidos - a.pedidos)
    .slice(0, 12)
    .map(r => finalizarRotaDetalhe(r, hojeIso))
}

function montarDetalheLoc(
  loc: LocAgg,
  cambio: CambioLocAgg | undefined,
  pinId: number | null,
  rotasMap: Map<string, RotaAggInterna>,
  hojeIso: string,
): VisaoGeralDetalheLocal {
  return {
    locKey: loc.key,
    label: loc.label,
    code: loc.code,
    flag: loc.flag,
    country: loc.country,
    pedidosCount: loc.count,
    contratosCambioCount: cambio?.contratoIds.size ?? 0,
    totalAReceber: cambio?.totalAReceber ?? 0,
    totalAPagar: cambio?.totalAPagar ?? 0,
    moedaCambio: cambio?.moedaCambio ?? loc.moeda,
    pinId,
    rotas: rotasParaLoc(loc.key, rotasMap, hojeIso),
  }
}

function montarDetalheModal(
  tipo: TipoOperacaoMapa,
  pedidos: Pedido[],
  rotasMap: Map<string, RotaAggInterna>,
  hojeIso: string,
): VisaoGeralDetalheLocal {
  const locKey = `modal|${tipo}`
  const filtrados = pedidos.filter(p => p.tipo_operacao === tipo)
  const contratoIds = new Set<string>()
  let totalAReceber = 0
  let totalAPagar = 0
  let moedaCambio = 'BRL'

  for (const p of filtrados) {
    const moeda = p.moeda_cambio_pedido?.trim() || p.moeda_pedido?.trim() || 'BRL'
    moedaCambio = moeda
    const valor = toNumero(p.valor_total_cambio_pedido) || toNumero(p.valor_total_pedido)
    const contratoId = p.contrato_cambio_id_pedido?.trim()
    if (contratoId) contratoIds.add(contratoId)
    if (tipo === 'importacao') totalAPagar += valor
    else totalAReceber += valor
  }

  return {
    locKey,
    label: tipo === 'importacao' ? 'Importação' : 'Exportação',
    code: tipo === 'importacao' ? 'IMP' : 'EXP',
    flag: tipo === 'importacao' ? '📥' : '📤',
    country: '—',
    pedidosCount: filtrados.length,
    contratosCambioCount: contratoIds.size,
    totalAReceber,
    totalAPagar,
    moedaCambio,
    pinId: null,
    rotas: [...rotasMap.values()]
      .filter(r => r.tipoOperacao === tipo)
      .sort((a, b) => b.pedidos - a.pedidos)
      .slice(0, 12)
      .map(r => finalizarRotaDetalhe(r, hojeIso)),
  }
}

function selecionarPinsOrigem(origensMap: Map<string, LocAgg>): LocAgg[] {
  const sorted = [...origensMap.values()].sort((a, b) => b.count - a.count)
  const estrangeiras: LocAgg[] = []
  const brasil: LocAgg[] = []

  for (const loc of sorted) {
    if (loc.geoLat == null || loc.geoLng == null) continue
    if (isBrasil(loc.country)) {
      brasil.push(loc)
    } else if (estrangeiras.length < 15) {
      estrangeiras.push(loc)
    }
  }

  return [...estrangeiras, ...brasil.slice(0, 3)]
}

function selecionarPinsDestino(destinosMap: Map<string, LocAgg>, temImportacao: boolean): LocAgg[] {
  const comGeo = [...destinosMap.values()]
    .filter(l => l.geoLat != null && l.geoLng != null)
    .sort((a, b) => b.count - a.count)

  const destinosExport = comGeo.filter(l => l.tipoOperacao === 'exportacao')

  if (!temImportacao) {
    return destinosExport.slice(0, 10)
  }

  const hubs: LocAgg[] = []
  for (const hub of HUBS_BR_DESTINO) {
    const agg = destinosMap.get(hub.key)
    if (agg && agg.count > 0) {
      hubs.push(agg)
    }
  }

  const hubsOuFallback = hubs.length > 0
    ? hubs
    : HUBS_BR_DESTINO.map(hub => ({
        key: hub.key,
        label: hub.label,
        country: 'Brasil',
        code: hub.code,
        flag: hub.flag,
        geoLat: hub.geoLat,
        geoLng: hub.geoLng,
        count: 0,
        valorTotal: 0,
        moeda: 'BRL',
        parceiro: '—',
        tipoOperacao: 'importacao' as const,
      }))

  const byKey = new Map<string, LocAgg>()
  for (const hub of hubsOuFallback) byKey.set(hub.key, hub)
  for (const dest of destinosExport.slice(0, 10)) byKey.set(dest.key, dest)

  return [...byKey.values()]
}

function construirRotasGlobo(
  rotasMap: Map<string, RotaAggInterna>,
  pinByKey: Map<string, number>,
): VisaoGeralArcRoute[] {
  const routes: VisaoGeralArcRoute[] = []
  let alturaImport = 0.14
  let alturaExport = 0.16

  const agregadas = [...rotasMap.values()].sort((a, b) => b.pedidos - a.pedidos)
  const imports = agregadas.filter(r => r.tipoOperacao === 'importacao')
  const exports = agregadas.filter(r => r.tipoOperacao === 'exportacao')
  const interleaved: RotaAggInterna[] = []
  const maxLen = Math.max(imports.length, exports.length)

  for (let i = 0; i < maxLen && interleaved.length < 20; i++) {
    if (i < imports.length) interleaved.push(imports[i])
    if (i < exports.length && interleaved.length < 20) interleaved.push(exports[i])
  }

  for (const rota of interleaved) {
    const fromId = pinByKey.get(rota.fromKey)
    const toId = pinByKey.get(rota.toKey)
    if (!fromId || !toId || fromId === toId) continue

    if (rota.tipoOperacao === 'importacao') {
      routes.push({
        fromId,
        toId,
        color: 'rgba(245, 158, 11, 0.85)',
        heightFactor: alturaImport,
        mode: 'importacao',
      })
      alturaImport = alturaImport >= 0.24 ? 0.14 : alturaImport + 0.03
    } else {
      routes.push({
        fromId,
        toId,
        color: 'rgba(167, 139, 250, 0.85)',
        heightFactor: alturaExport,
        mode: 'exportacao',
      })
      alturaExport = alturaExport >= 0.26 ? 0.16 : alturaExport + 0.03
    }
  }

  return routes
}

/** Garante pin para cada extremo das rotas mais relevantes (exportação não fica sem linha). */
function enriquecerPinsDasRotas(
  origemPins: LocAgg[],
  destPins: LocAgg[],
  origensMap: Map<string, LocAgg>,
  destinosMap: Map<string, LocAgg>,
  rotasMap: Map<string, RotaAggInterna>,
): { origens: LocAgg[]; destinos: LocAgg[] } {
  const origensByKey = new Map(origemPins.map(o => [o.key, o]))
  const destinosByKey = new Map(destPins.map(d => [d.key, d]))

  const rotas = [...rotasMap.values()].sort((a, b) => b.pedidos - a.pedidos).slice(0, 20)
  for (const rota of rotas) {
    const orig = origensMap.get(rota.fromKey)
    if (orig?.geoLat != null && orig.geoLng != null && !origensByKey.has(orig.key)) {
      origensByKey.set(orig.key, orig)
    }
    const dest = destinosMap.get(rota.toKey)
    if (dest?.geoLat != null && dest.geoLng != null && !destinosByKey.has(dest.key)) {
      destinosByKey.set(dest.key, dest)
    }
  }

  return {
    origens: [...origensByKey.values()],
    destinos: [...destinosByKey.values()],
  }
}

export function buildVisaoGeralMapa(
  pedidos: Pedido[],
  nomesWorkspacePorId: ReadonlyMap<string, string> = new Map(),
  fornecedoresPorId: ReadonlyMap<string, FornecedorMapaGeo> = new Map(),
): VisaoGeralMapaData {
  if (pedidos.length === 0) return MAPA_VAZIO

  const origensMap = new Map<string, LocAgg>()
  const destinosMap = new Map<string, LocAgg>()
  const cambioPorLoc = new Map<string, CambioLocAgg>()
  const rotasMap = new Map<string, RotaAggInterna>()

  let valorGlobal = 0
  const temImportacao = pedidos.some(p => p.tipo_operacao === 'importacao')
  const hojeIso = formatDataIso(new Date())

  for (const p of pedidos) {
    const valor = toNumero(p.valor_total_pedido)
    const moeda = p.moeda_pedido ?? 'BRL'
    valorGlobal += valor

    const orig = locOrigem(p, fornecedoresPorId)
    if (orig) acumularLoc(origensMap, orig, valor, moeda)

    let dest: LocPedido
    if (p.tipo_operacao === 'importacao') {
      const hub = resolverHubBrasilPorLogistica(p, 'destino')
      dest = locDestinoImport(hub)
      acumularHub(destinosMap, hub, valor, moeda)
    } else {
      dest = locDestinoExport(p, fornecedoresPorId)
      acumularLoc(destinosMap, dest, valor, moeda)
    }

    if (orig) acumularCambio(cambioPorLoc, orig.key, p)
    acumularCambio(cambioPorLoc, dest.key, p)

    if (!orig) continue
    if (isBrasil(orig.country) && isBrasil(dest.country)) continue

    const idWorkspace = p.company_id?.trim() || 'sem-workspace'
    const nomeWorkspace = nomesWorkspacePorId.get(idWorkspace) ?? '—'
    const rotaKey = `${orig.key}→${dest.key}|${p.tipo_operacao}|${idWorkspace}`
    const geoOrig = resolverGeo(orig.country, orig.cidade)
    const geoDest = resolverGeo(dest.country, dest.cidade)
    const existente = rotasMap.get(rotaKey)
    if (existente) {
      existente.pedidos += 1
      existente.valorTotal += valor
      acumularVencimentoRota(existente, p)
    } else {
      const nova: RotaAggInterna = {
        fromKey: orig.key,
        toKey: dest.key,
        fromPort: `${orig.label} (${geoOrig.code})`,
        fromFlag: geoOrig.flag,
        toPort: `${dest.label} (${geoDest.code})`,
        toFlag: geoDest.flag,
        nome_workspace: nomeWorkspace,
        tipoOperacao: p.tipo_operacao,
        pedidos: 1,
        valorTotal: valor,
        moeda,
        incoterm: (p.incoterm ?? '—').toUpperCase(),
        parceiro: orig.parceiro,
        vencimentosReceber: [],
        vencimentosPagar: [],
      }
      acumularVencimentoRota(nova, p)
      rotasMap.set(rotaKey, nova)
    }
  }

  const origemPinCandidates = selecionarPinsOrigem(origensMap)
  const destPinCandidates = selecionarPinsDestino(destinosMap, temImportacao)
  const { origens: origemPinsFinal, destinos: destPinsFinal } = enriquecerPinsDasRotas(
    origemPinCandidates,
    destPinCandidates,
    origensMap,
    destinosMap,
    rotasMap,
  )

  const pins: VisaoGeralMapPin[] = []
  const pinByKey = new Map<string, number>()

  const montarPin = (loc: LocAgg, papel: PapelPinMapa): VisaoGeralMapPin => {
    const cambio = cambioPorLoc.get(loc.key)
    const id = pins.length + 1
    pinByKey.set(loc.key, id)
    return {
      id,
      locKey: loc.key,
      label: loc.label,
      portCode: loc.code,
      country: loc.country,
      lat: 0,
      lng: 0,
      geoLat: loc.geoLat!,
      geoLng: loc.geoLng!,
      pedidosCount: loc.count,
      maiorValor: cambio?.maiorValor ?? loc.valorTotal,
      moeda: loc.moeda,
      pctVolume: valorGlobal > 0 ? Math.round((loc.valorTotal / valorGlobal) * 1000) / 10 : 0,
      tipoOperacao: loc.tipoOperacao,
      parceiro: loc.parceiro,
      flag: loc.flag,
      papel,
      contratosCambioCount: cambio?.contratoIds.size ?? 0,
      totalAReceber: cambio?.totalAReceber ?? 0,
      totalAPagar: cambio?.totalAPagar ?? 0,
      moedaCambio: cambio?.moedaCambio ?? loc.moeda,
    }
  }

  for (const loc of origemPinsFinal) {
    pins.push(montarPin(loc, 'origem'))
  }

  for (const loc of destPinsFinal) {
    if (pinByKey.has(loc.key)) continue
    pins.push(montarPin(loc, 'destino'))
  }

  const globeRoutes = construirRotasGlobo(rotasMap, pinByKey)

  const detalhesPorLocKey: Record<string, VisaoGeralDetalheLocal> = {}
  for (const loc of [...origensMap.values(), ...destinosMap.values()]) {
    detalhesPorLocKey[loc.key] = montarDetalheLoc(
      loc,
      cambioPorLoc.get(loc.key),
      pinByKey.get(loc.key) ?? null,
      rotasMap,
      hojeIso,
    )
  }
  detalhesPorLocKey['modal|importacao'] = montarDetalheModal('importacao', pedidos, rotasMap, hojeIso)
  detalhesPorLocKey['modal|exportacao'] = montarDetalheModal('exportacao', pedidos, rotasMap, hojeIso)

  const conexoesPorPin: Record<number, VisaoGeralRotaDetalhe[]> = {}
  for (const pin of pins) {
    conexoesPorPin[pin.id] = detalhesPorLocKey[pin.locKey]?.rotas ?? []
  }

  const impCount = pedidos.filter(p => p.tipo_operacao === 'importacao').length
  const expCount = pedidos.filter(p => p.tipo_operacao === 'exportacao').length
  const totalModal = impCount + expCount
  const modaisGlobo: VisaoGeralModalGlobo[] = [
    { key: 'importacao', label: 'Importação', count: impCount, cor: '#f59e0b', pct: totalModal ? Math.round((impCount / totalModal) * 100) : 0 },
    { key: 'exportacao', label: 'Exportação', count: expCount, cor: '#a78bfa', pct: totalModal ? Math.round((expCount / totalModal) * 100) : 0 },
  ]

  return {
    pins,
    globeRoutes,
    conexoesPorPin,
    detalhesPorLocKey,
    topOrigens: montarRanking([...origensMap.values()], pedidos.length, pinByKey),
    topDestinos: montarRanking([...destinosMap.values()], pedidos.length, pinByKey),
    modaisGlobo,
  }
}
