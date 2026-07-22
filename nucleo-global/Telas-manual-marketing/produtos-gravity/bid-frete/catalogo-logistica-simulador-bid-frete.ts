/**
 * catalogo-logistica-simulador-bid-frete.ts — catálogo de portos/aeroportos do
 * simulador de marketing usando o MESMO dado de produção (snapshot UN/LOCODE do
 * serviço Cadastros) e a MESMA lógica de busca do backend real:
 * - resolução de país por nome ("china" → CN) — busca-porto-por-pais-cadastros
 * - match direto por UN/LOCODE exato (ex.: "CNSHA")
 * - paginação por scroll (100/página) + busca indexada (150) — limites do BID
 * O snapshot (~1 MB) é carregado sob demanda via dynamic import para não pesar
 * o bundle inicial do marketplace.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { SelectOpcao } from '../../../Campos/campo-select-global/src/tipos'
import type { PortoSimuladorBidFrete } from './dados-simulador-bid-frete'

// Limites — paridade com shared/limites-catalogo-logistica-bid-frete-internacional.ts
const LIMITE_PAGINA_CATALOGO = 100
const LIMITE_BUSCA_CATALOGO = 150
const MIN_CARACTERES_BUSCA_CATALOGO = 2
const DEBOUNCE_MS_BUSCA_CATALOGO = 280

export type PortoCatalogoSimulador = {
  codigo_unlocode_porto: string
  codigo_pais_porto: string
  nome_porto: string
  nome_ascii_porto: string
  latitude_porto: number | null
  longitude_porto: number | null
}

export type AeroportoCatalogoSimulador = {
  codigo_iata_aeroporto: string
  codigo_unlocode_aeroporto: string
  codigo_pais_aeroporto: string
  nome_aeroporto: string
  nome_ascii_aeroporto: string
  latitude_aeroporto: number | null
  longitude_aeroporto: number | null
}

export type PaisCatalogoSimulador = {
  codigo_pais_iso_alpha2: string
  codigo_pais_iso_alpha3: string
  nome_pais_portugues: string
  nome_pais_ingles: string
}

type CatalogoCarregado = {
  portos: PortoCatalogoSimulador[]
  aeroportos: AeroportoCatalogoSimulador[]
  paises: PaisCatalogoSimulador[]
}

let catalogoCache: CatalogoCarregado | null = null
let catalogoPromise: Promise<CatalogoCarregado> | null = null

async function carregarCatalogo(): Promise<CatalogoCarregado> {
  if (catalogoCache) return catalogoCache
  if (!catalogoPromise) {
    catalogoPromise = import('./dados-catalogo-logistica-producao-simulador-bid-frete').then((m) => {
      const portos: PortoCatalogoSimulador[] = m.PORTOS_CATALOGO_PRODUCAO.map((t) => ({
        codigo_unlocode_porto: t[0],
        codigo_pais_porto: t[1],
        nome_porto: t[2],
        nome_ascii_porto: t[3] === 0 ? t[2] : t[3],
        latitude_porto: t[4] === 0 ? null : t[4],
        longitude_porto: t[5] === 0 ? null : t[5],
      }))
      const aeroportos: AeroportoCatalogoSimulador[] = m.AEROPORTOS_CATALOGO_PRODUCAO.map((t) => ({
        codigo_iata_aeroporto: t[0],
        codigo_unlocode_aeroporto: t[1],
        codigo_pais_aeroporto: t[2],
        nome_aeroporto: t[3],
        nome_ascii_aeroporto: t[4] === 0 ? t[3] : t[4],
        latitude_aeroporto: t[5] === 0 ? null : t[5],
        longitude_aeroporto: t[6] === 0 ? null : t[6],
      }))
      const paises: PaisCatalogoSimulador[] = m.PAISES_CATALOGO_PRODUCAO.map((t) => ({
        codigo_pais_iso_alpha2: t[0],
        codigo_pais_iso_alpha3: t[1],
        nome_pais_portugues: t[2],
        nome_pais_ingles: t[3],
      }))
      catalogoCache = { portos, aeroportos, paises }
      return catalogoCache
    })
  }
  return catalogoPromise
}

// ─── Busca de país por termo — paridade com busca-porto-por-pais-cadastros ────

function normalizarTermoBuscaCatalogoSimulador(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

function nomePortoCatalogoBateBusca(
  nomePorto: string,
  nomeAscii: string,
  busca: string,
): boolean {
  const lower = busca.toLowerCase()
  const ascii = normalizarTermoBuscaCatalogoSimulador(busca)
  return (
    nomePorto.toLowerCase().includes(lower)
    || normalizarTermoBuscaCatalogoSimulador(nomePorto).includes(ascii)
    || nomeAscii.toLowerCase().includes(ascii)
  )
}

function paisesQueBatemTermo(q: string, paises: PaisCatalogoSimulador[]): PaisCatalogoSimulador[] {
  const termo = q.trim()
  const upper = termo.toUpperCase()
  const lower = termo.toLowerCase()
  return paises.filter((p) => {
    if (p.nome_pais_portugues.toLowerCase().includes(lower)) return true
    if (p.nome_pais_ingles.toLowerCase().includes(lower)) return true
    if (termo.length === 2 && p.codigo_pais_iso_alpha2.toUpperCase() === upper) return true
    if (termo.length === 3 && p.codigo_pais_iso_alpha3.toUpperCase() === upper) return true
    return false
  })
}

function filtrarCodigosPaisPorBusca(q: string, paises: PaisCatalogoSimulador[]): string[] {
  const termo = q.trim()
  if (termo.length < 2) return []
  const upper = termo.toUpperCase()
  const lower = termo.toLowerCase()
  const codigos = new Set<string>()
  for (const pais of paises) {
    const iso2 = pais.codigo_pais_iso_alpha2?.trim().toUpperCase()
    if (!iso2) continue
    const iso3 = pais.codigo_pais_iso_alpha3?.trim().toUpperCase()
    const bateIso2 = termo.length === 2 && iso2 === upper
    const bateIso3 = termo.length === 3 && iso3 === upper
    const bateNomePt = pais.nome_pais_portugues.toLowerCase().includes(lower)
    const nomeEn = pais.nome_pais_ingles.toLowerCase()
    const bateNomeEn =
      nomeEn === lower || nomeEn.startsWith(`${lower},`) || nomeEn.startsWith(`${lower} `) || nomeEn.startsWith(lower)
    if (bateIso2 || bateIso3 || bateNomePt || bateNomeEn) codigos.add(iso2)
  }
  return [...codigos]
}

/** UN/LOCODE marítimo — paridade com busca-porto-por-pais-cadastros (só MAIÚSCULAS). */
function ehBuscaUnlocodeExato(q: string): boolean {
  const termo = q.trim()
  if (!/^[A-Za-z]{2}[A-Za-z0-9]{3}$/.test(termo)) return false
  if (termo !== termo.toUpperCase()) return false
  return true
}

function buscaUnlocodeExatoDeveUsarMatchDireto(q: string, codigosPaisResolvidos: string[]): boolean {
  if (!ehBuscaUnlocodeExato(q)) return false
  const codigo = q.trim().toUpperCase()
  const paisDoCodigo = codigo.slice(0, 2)
  if (codigosPaisResolvidos.length === 0) return true
  return codigosPaisResolvidos.includes(paisDoCodigo)
}

/** Evita falso positivo curto ("san" → Santos, não só San Marino). */
function buscaDeveFiltrarSomentePorPais(
  q: string,
  codigosPaisResolvidos: string[],
  paises: PaisCatalogoSimulador[],
): boolean {
  if (codigosPaisResolvidos.length === 0) return false
  const termo = q.trim()
  const upper = termo.toUpperCase()
  if (termo.length === 2 && codigosPaisResolvidos.includes(upper)) return true
  if (termo.length === 3 && paises.some((p) => p.codigo_pais_iso_alpha3?.trim().toUpperCase() === upper)) return true
  if (termo.length >= 4) return true
  return false
}

// ─── Busca no catálogo — paridade com as rotas /portos e /aeroportos ──────────

function buscarPortos(
  catalogo: CatalogoCarregado,
  q: string,
  limit: number,
  offset: number,
): { itens: PortoCatalogoSimulador[]; total: number } {
  let filtrados = catalogo.portos
  if (q) {
    const paisesReferencia = paisesQueBatemTermo(q, catalogo.paises)
    const codigosPaisResolvidos = filtrarCodigosPaisPorBusca(q, paisesReferencia)
    if (buscaUnlocodeExatoDeveUsarMatchDireto(q, codigosPaisResolvidos)) {
      const codigo = q.trim().toUpperCase()
      filtrados = catalogo.portos.filter((p) => p.codigo_unlocode_porto === codigo)
    } else if (buscaDeveFiltrarSomentePorPais(q, codigosPaisResolvidos, paisesReferencia)) {
      filtrados = catalogo.portos.filter((p) => codigosPaisResolvidos.includes(p.codigo_pais_porto))
    } else {
      const upper = q.toUpperCase()
      filtrados = catalogo.portos.filter(
        (p) =>
          p.codigo_unlocode_porto.includes(upper) ||
          nomePortoCatalogoBateBusca(p.nome_porto, p.nome_ascii_porto, q) ||
          (codigosPaisResolvidos.length > 0 && codigosPaisResolvidos.includes(p.codigo_pais_porto)),
      )
    }
  }
  return { itens: filtrados.slice(offset, offset + limit), total: filtrados.length }
}

function buscarAeroportos(
  catalogo: CatalogoCarregado,
  q: string,
  limit: number,
  offset: number,
): { itens: AeroportoCatalogoSimulador[]; total: number } {
  let filtrados = catalogo.aeroportos
  if (q) {
    const upper = q.toUpperCase()
    filtrados = catalogo.aeroportos.filter(
      (a) =>
        a.codigo_unlocode_aeroporto.includes(upper) ||
        a.codigo_iata_aeroporto.includes(upper) ||
        nomePortoCatalogoBateBusca(a.nome_aeroporto, a.nome_ascii_aeroporto, q),
    )
  }
  return { itens: filtrados.slice(offset, offset + limit), total: filtrados.length }
}

/** Busca assíncrona exposta para testes/validação — mesma lógica do hook. */
export async function buscarPortosCatalogoSimulador(q: string, limit = LIMITE_BUSCA_CATALOGO, offset = 0) {
  const catalogo = await carregarCatalogo()
  return buscarPortos(catalogo, q, limit, offset)
}

export async function buscarAeroportosCatalogoSimulador(q: string, limit = LIMITE_BUSCA_CATALOGO, offset = 0) {
  const catalogo = await carregarCatalogo()
  return buscarAeroportos(catalogo, q, limit, offset)
}

/** Lista completa de países do snapshot de produção (para os campos extras de localização). */
export async function listarPaisesCatalogoSimulador(): Promise<PaisCatalogoSimulador[]> {
  const catalogo = await carregarCatalogo()
  return [...catalogo.paises].sort((a, b) =>
    a.nome_pais_portugues.localeCompare(b.nome_pais_portugues, 'pt-BR'),
  )
}

// ─── Rótulos — paridade com rotulo-cadastro-logistica-bid-frete-internacional ─

export function rotuloPortoCatalogoSimulador(p: PortoCatalogoSimulador): string {
  return `${p.codigo_unlocode_porto} — ${p.nome_porto.trim()}, ${p.codigo_pais_porto.toUpperCase()}`
}

export function rotuloAeroportoCatalogoSimulador(a: AeroportoCatalogoSimulador): string {
  return `${a.codigo_iata_aeroporto} — ${a.nome_aeroporto.trim()}, ${a.codigo_pais_aeroporto.toUpperCase()}`
}

// ─── Conversão para o domínio do simulador (mapa/lista) ───────────────────────

function bandeiraDePais(iso2: string): string {
  const code = iso2.trim().toUpperCase()
  if (!/^[A-Z]{2}$/.test(code)) return '🏳️'
  return String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65))
}

function coordenadaFallbackPais(catalogo: CatalogoCarregado, iso2: string): { lat: number; lng: number } {
  let somaLat = 0
  let somaLng = 0
  let n = 0
  for (const p of catalogo.portos) {
    if (p.codigo_pais_porto === iso2 && p.latitude_porto != null && p.longitude_porto != null) {
      somaLat += p.latitude_porto
      somaLng += p.longitude_porto
      n += 1
    }
  }
  if (n === 0) {
    for (const a of catalogo.aeroportos) {
      if (a.codigo_pais_aeroporto === iso2 && a.latitude_aeroporto != null && a.longitude_aeroporto != null) {
        somaLat += a.latitude_aeroporto
        somaLng += a.longitude_aeroporto
        n += 1
      }
    }
  }
  if (n === 0) return { lat: 0, lng: 0 }
  return { lat: somaLat / n, lng: somaLng / n }
}

/** Resolve um código (UN/LOCODE de porto ou IATA de aeroporto) para o domínio do simulador. */
export function portoSimuladorDeCatalogo(codigo: string): PortoSimuladorBidFrete | null {
  if (!catalogoCache) return null
  const upper = codigo.trim().toUpperCase()
  const porto = catalogoCache.portos.find((p) => p.codigo_unlocode_porto === upper)
  if (porto) {
    const coord =
      porto.latitude_porto != null && porto.longitude_porto != null
        ? { lat: porto.latitude_porto, lng: porto.longitude_porto }
        : coordenadaFallbackPais(catalogoCache, porto.codigo_pais_porto)
    return {
      codigo: porto.codigo_unlocode_porto,
      cidade: porto.nome_porto,
      pais: porto.codigo_pais_porto,
      flag: bandeiraDePais(porto.codigo_pais_porto),
      lat: coord.lat,
      lng: coord.lng,
    }
  }
  const aeroporto = catalogoCache.aeroportos.find(
    (a) => a.codigo_iata_aeroporto === upper || a.codigo_unlocode_aeroporto === upper,
  )
  if (!aeroporto) return null
  const coord =
    aeroporto.latitude_aeroporto != null && aeroporto.longitude_aeroporto != null
      ? { lat: aeroporto.latitude_aeroporto, lng: aeroporto.longitude_aeroporto }
      : coordenadaFallbackPais(catalogoCache, aeroporto.codigo_pais_aeroporto)
  return {
    codigo: aeroporto.codigo_iata_aeroporto,
    cidade: aeroporto.nome_aeroporto,
    pais: aeroporto.codigo_pais_aeroporto,
    flag: bandeiraDePais(aeroporto.codigo_pais_aeroporto),
    lat: coord.lat,
    lng: coord.lng,
  }
}

// ─── Hook — paridade com use-select-catalogo-logistica-cadastros ──────────────

type TipoCatalogoLogisticaSimulador = 'porto' | 'aeroporto'

type ItemCatalogo = PortoCatalogoSimulador | AeroportoCatalogoSimulador

function codigoDeItem(tipo: TipoCatalogoLogisticaSimulador, item: ItemCatalogo): string {
  if (tipo === 'porto') return (item as PortoCatalogoSimulador).codigo_unlocode_porto
  return (item as AeroportoCatalogoSimulador).codigo_iata_aeroporto
}

export function useSelectCatalogoLogisticaSimuladorBidFrete({
  tipo,
  ativo = true,
  codigoSelecionado = null,
}: {
  tipo: TipoCatalogoLogisticaSimulador
  ativo?: boolean
  codigoSelecionado?: string | null
}) {
  const [itens, setItens] = useState<ItemCatalogo[]>([])
  const [totalCatalogo, setTotalCatalogo] = useState(0)
  const [carregando, setCarregando] = useState(false)
  const [aguardandoMinimoBusca, setAguardandoMinimoBusca] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reqIdRef = useRef(0)
  const offsetRef = useRef(0)
  const termoBuscaRef = useRef('')
  const itemSelecionadoRef = useRef<ItemCatalogo | null>(null)

  const incluirSelecionado = useCallback(
    (lista: ItemCatalogo[]): ItemCatalogo[] => {
      const fixado = itemSelecionadoRef.current
      if (!fixado) return lista
      const codigoFixado = codigoDeItem(tipo, fixado)
      if (lista.some((i) => codigoDeItem(tipo, i) === codigoFixado)) return lista
      return [fixado, ...lista]
    },
    [tipo],
  )

  const buscarPagina = useCallback(
    async (termo: string, offset: number, append: boolean) => {
      if (!ativo) return
      const busca = termo.trim()
      const id = ++reqIdRef.current
      setCarregando(true)
      try {
        const catalogo = await carregarCatalogo()
        if (id !== reqIdRef.current) return
        const emBusca = busca.length >= MIN_CARACTERES_BUSCA_CATALOGO
        const q = emBusca ? busca : ''
        const limit = emBusca ? LIMITE_BUSCA_CATALOGO : LIMITE_PAGINA_CATALOGO
        const off = emBusca ? 0 : offset
        const resp =
          tipo === 'porto'
            ? buscarPortos(catalogo, q, limit, off)
            : buscarAeroportos(catalogo, q, limit, off)
        setTotalCatalogo(resp.total)
        setItens((prev) => {
          const base = !append || emBusca ? resp.itens : [...prev, ...resp.itens.filter(
            (novo) => !prev.some((p) => codigoDeItem(tipo, p) === codigoDeItem(tipo, novo)),
          )]
          return incluirSelecionado(base)
        })
        offsetRef.current = emBusca ? 0 : off + resp.itens.length
        termoBuscaRef.current = busca
      } finally {
        if (id === reqIdRef.current) {
          setCarregando(false)
          setAguardandoMinimoBusca(false)
        }
      }
    },
    [ativo, incluirSelecionado, tipo],
  )

  const reiniciarBusca = useCallback(
    (termo: string) => {
      offsetRef.current = 0
      void buscarPagina(termo, 0, false)
    },
    [buscarPagina],
  )

  const carregarMais = useCallback(() => {
    if (!ativo || carregando) return
    if (termoBuscaRef.current.trim().length >= MIN_CARACTERES_BUSCA_CATALOGO) return
    if (itens.length >= totalCatalogo) return
    void buscarPagina(termoBuscaRef.current, offsetRef.current, true)
  }, [ativo, buscarPagina, carregando, itens.length, totalCatalogo])

  // Pin do item selecionado — sem ele, uma nova página/busca substituiria a
  // lista e o rótulo do selecionado viraria o próprio código.
  useEffect(() => {
    if (!ativo || !codigoSelecionado?.trim()) {
      itemSelecionadoRef.current = null
      return
    }
    const codigo = codigoSelecionado.trim().toUpperCase()
    let cancelado = false
    void carregarCatalogo().then((catalogo) => {
      if (cancelado) return
      const item: ItemCatalogo | undefined =
        tipo === 'porto'
          ? catalogo.portos.find((p) => p.codigo_unlocode_porto === codigo)
          : catalogo.aeroportos.find(
              (a) => a.codigo_iata_aeroporto === codigo || a.codigo_unlocode_aeroporto === codigo,
            )
      if (!item) return
      itemSelecionadoRef.current = item
      setItens((prev) => incluirSelecionado(prev))
    })
    return () => {
      cancelado = true
    }
  }, [ativo, codigoSelecionado, incluirSelecionado, tipo])

  useEffect(() => {
    if (!ativo) {
      setItens([])
      setTotalCatalogo(0)
      offsetRef.current = 0
      termoBuscaRef.current = ''
      return
    }
    reiniciarBusca('')
  }, [ativo, reiniciarBusca])

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    },
    [],
  )

  const aoMudarBusca = useCallback(
    (termo: string) => {
      if (!ativo) return
      if (debounceRef.current) clearTimeout(debounceRef.current)
      const busca = termo.trim()
      if (busca.length === 1) {
        setAguardandoMinimoBusca(true)
        return
      }
      setAguardandoMinimoBusca(false)
      debounceRef.current = setTimeout(() => {
        reiniciarBusca(termo)
      }, DEBOUNCE_MS_BUSCA_CATALOGO)
    },
    [ativo, reiniciarBusca],
  )

  const opcoes = useMemo((): SelectOpcao[] => {
    if (tipo === 'porto') {
      return (itens as PortoCatalogoSimulador[]).map((p) => ({
        valor: p.codigo_unlocode_porto,
        rotulo: rotuloPortoCatalogoSimulador(p),
      }))
    }
    return (itens as AeroportoCatalogoSimulador[]).map((a) => ({
      valor: a.codigo_iata_aeroporto,
      rotulo: rotuloAeroportoCatalogoSimulador(a),
    }))
  }, [itens, tipo])

  const mensagemListaVazia =
    aguardandoMinimoBusca && !carregando
      ? `Digite ao menos ${MIN_CARACTERES_BUSCA_CATALOGO} caracteres para buscar no catálogo completo.`
      : undefined

  return {
    opcoes,
    carregando,
    totalCatalogo,
    aoMudarBusca,
    aoScrollFimLista: carregarMais,
    mensagemListaVazia,
  }
}
