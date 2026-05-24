/**
 * visaoGeralMapaPedido.ts — Agregação geográfica para o globo da Visão Geral
 *
 * Deriva pins, rotas e rankings a partir de pedidos reais (sem mocks).
 * Padrão visual alinhado ao BID Frete: origens estrangeiras → hubs no Brasil.
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

/** Hubs brasileiros no globo — mesmo conceito do BID Frete (Guarulhos, Itajaí, Recife). */
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

function locOrigem(p: Pedido): LocPedido | null {
  if (p.tipo_operacao === 'exportacao') {
    return {
      key: 'orig|brasil|',
      label: 'Brasil',
      country: 'Brasil',
      cidade: null,
      tipo: 'exportacao',
      parceiro: p.nome_importador?.trim() ?? '—',
    }
  }

  const country =
    p.pais_exportador?.trim() ||
    p.pais_fabricante?.trim() ||
    p.pais_ope?.trim() ||
    null
  const cidade =
    p.cidade_exportador?.trim() ||
    p.cidade_fabricante?.trim() ||
    p.cidade_ope?.trim() ||
    null
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
    parceiro: p.nome_exportador?.trim() ?? p.nome_fabricante?.trim() ?? '—',
  }
}

function locDestinoImport(hubIndex: number): LocPedido {
  const hub = HUBS_BR_DESTINO[hubIndex % HUBS_BR_DESTINO.length]
  return {
    key: hub.key,
    label: hub.label,
    country: 'Brasil',
    cidade: hub.label,
    tipo: 'importacao',
    parceiro: '—',
  }
}

function locDestinoExport(p: Pedido): LocPedido {
  const nome = p.nome_importador?.trim() || 'Destino não informado'
  return {
    key: `dest|ext|${normTexto(nome)}`,
    label: nome,
    country: nome,
    cidade: null,
    tipo: 'exportacao',
    parceiro: nome,
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
    } else if (estrangeiras.length < 5) {
      estrangeiras.push(loc)
    }
  }

  return [...estrangeiras, ...brasil.slice(0, 1)]
}

function selecionarPinsDestino(destinosMap: Map<string, LocAgg>, temImportacao: boolean): LocAgg[] {
  if (!temImportacao) {
    return [...destinosMap.values()]
      .filter(l => l.geoLat != null && l.geoLng != null)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
  }

  const hubs: LocAgg[] = []
  for (const hub of HUBS_BR_DESTINO) {
    const agg = destinosMap.get(hub.key)
    if (agg && agg.count > 0) {
      hubs.push(agg)
    }
  }

  if (hubs.length > 0) return hubs

  return HUBS_BR_DESTINO.map(hub => ({
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
}

function construirRotasGlobo(
  origemPins: LocAgg[],
  destPins: LocAgg[],
  pinByKey: Map<string, number>,
): VisaoGeralArcRoute[] {
  const origensEstrangeiras = origemPins.filter(o => !isBrasil(o.country))
  const destinosBr = destPins.filter(d => isBrasil(d.country))
  const routes: VisaoGeralArcRoute[] = []
  let altura = 0.14

  if (origensEstrangeiras.length > 0 && destinosBr.length > 0) {
    origensEstrangeiras.forEach((orig, idx) => {
      const dest = destinosBr[idx % destinosBr.length]
      const fromId = pinByKey.get(orig.key)
      const toId = pinByKey.get(dest.key)
      if (!fromId || !toId || fromId === toId) return

      routes.push({
        fromId,
        toId,
        color: 'rgba(245, 158, 11, 0.85)',
        heightFactor: altura,
        mode: 'importacao',
      })
      altura = altura >= 0.24 ? 0.14 : altura + 0.03
    })
    return routes
  }

  const brOrigem = origemPins.find(o => isBrasil(o.country))
  const extDest = destPins.find(d => !isBrasil(d.country))
  if (brOrigem && extDest) {
    const fromId = pinByKey.get(brOrigem.key)
    const toId = pinByKey.get(extDest.key)
    if (fromId && toId && fromId !== toId) {
      routes.push({
        fromId,
        toId,
        color: 'rgba(167, 139, 250, 0.85)',
        heightFactor: 0.16,
        mode: 'exportacao',
      })
    }
  }

  return routes
}

export function buildVisaoGeralMapa(pedidos: Pedido[]): VisaoGeralMapaData {
  if (pedidos.length === 0) return MAPA_VAZIO

  const origensMap = new Map<string, LocAgg>()
  const destinosMap = new Map<string, LocAgg>()
  const cambioPorLoc = new Map<string, CambioLocAgg>()
  const rotasMap = new Map<string, RotaAggInterna>()

  let valorGlobal = 0
  let importIdx = 0
  const temImportacao = pedidos.some(p => p.tipo_operacao === 'importacao')
  const hojeIso = formatDataIso(new Date())

  for (const p of pedidos) {
    const valor = toNumero(p.valor_total_pedido)
    const moeda = p.moeda_pedido ?? 'BRL'
    valorGlobal += valor

    const orig = locOrigem(p)
    if (orig) acumularLoc(origensMap, orig, valor, moeda)

    let dest: LocPedido
    if (p.tipo_operacao === 'importacao') {
      const hub = HUBS_BR_DESTINO[importIdx % HUBS_BR_DESTINO.length]
      importIdx += 1
      dest = locDestinoImport(importIdx - 1)
      acumularHub(destinosMap, hub, valor, moeda)
    } else {
      dest = locDestinoExport(p)
      acumularLoc(destinosMap, dest, valor, moeda)
    }

    if (orig) acumularCambio(cambioPorLoc, orig.key, p)
    acumularCambio(cambioPorLoc, dest.key, p)

    if (!orig) continue

    const rotaKey = `${orig.key}→${dest.key}|${p.tipo_operacao}`
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

  for (const loc of origemPinCandidates) {
    pins.push(montarPin(loc, 'origem'))
  }

  for (const loc of destPinCandidates) {
    if (pinByKey.has(loc.key)) continue
    pins.push(montarPin(loc, 'destino'))
  }

  const globeRoutes = construirRotasGlobo(origemPinCandidates, destPinCandidates, pinByKey)

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
