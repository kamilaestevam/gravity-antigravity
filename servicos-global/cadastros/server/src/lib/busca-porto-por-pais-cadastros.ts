/**
 * Busca de portos por nome/sigla de país — resolve "China" → CN via tabela `pais`.
 */
import type { Prisma } from '../../../generated/index.js'

export type PaisReferenciaBuscaPorto = {
  codigo_pais_iso_alpha2: string | null
  codigo_pais_iso_alpha3: string | null
  nome_pais_portugues: string
  nome_pais_ingles: string
}

export function filtrarCodigosPaisPorBuscaPorto(
  q: string,
  paises: PaisReferenciaBuscaPorto[],
): string[] {
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
      nomeEn === lower ||
      nomeEn.startsWith(`${lower},`) ||
      nomeEn.startsWith(`${lower} `) ||
      nomeEn.startsWith(lower)

    if (bateIso2 || bateIso3 || bateNomePt || bateNomeEn) {
      codigos.add(iso2)
    }
  }

  return [...codigos]
}

/** UN/LOCODE marítimo (2 letras país + 3 letras local). */
export function ehBuscaUnlocodeExato(q: string): boolean {
  return /^[A-Za-z]{2}[A-Za-z0-9]{3}$/.test(q.trim())
}

/** Match direto por código — exceto quando prefixo não bate com país resolvido por nome ("CHINA" → CN, não CH). */
export function buscaUnlocodeExatoDeveUsarMatchDireto(
  q: string,
  codigosPaisResolvidos: string[],
): boolean {
  if (!ehBuscaUnlocodeExato(q)) return false
  const codigo = q.trim().toUpperCase()
  const paisDoCodigo = codigo.slice(0, 2)
  if (codigosPaisResolvidos.length === 0) return true
  return codigosPaisResolvidos.includes(paisDoCodigo)
}

/** Evita falso positivo curto ("san" → Santos, não só San Marino). */
export function buscaPortoDeveFiltrarSomentePorPais(
  q: string,
  codigosPaisResolvidos: string[],
  paises: PaisReferenciaBuscaPorto[],
): boolean {
  if (codigosPaisResolvidos.length === 0) return false

  const termo = q.trim()
  const upper = termo.toUpperCase()

  if (termo.length === 2 && codigosPaisResolvidos.includes(upper)) return true
  if (
    termo.length === 3 &&
    paises.some((p) => p.codigo_pais_iso_alpha3?.trim().toUpperCase() === upper)
  ) {
    return true
  }
  if (termo.length >= 4) return true

  return false
}

export function montarWhereBuscaPortoCadastros(opcoes: {
  q: string
  paisFiltro?: string
  apenasAtivos: boolean
  codigosPaisResolvidos: string[]
  paisesReferencia: PaisReferenciaBuscaPorto[]
}): Prisma.PortoWhereInput {
  const { q, paisFiltro, apenasAtivos, codigosPaisResolvidos, paisesReferencia } = opcoes

  const base: Prisma.PortoWhereInput = {
    ...(apenasAtivos ? { ativo_porto: true } : {}),
    ...(paisFiltro ? { codigo_pais_porto: paisFiltro } : {}),
  }

  if (!q) return base

  if (buscaUnlocodeExatoDeveUsarMatchDireto(q, codigosPaisResolvidos)) {
    const codigo = q.trim().toUpperCase()
    return {
      ...base,
      OR: [
        { codigo_unlocode_porto: codigo },
        { codigo_iata_porto: codigo },
      ],
    }
  }

  if (
    !paisFiltro &&
    buscaPortoDeveFiltrarSomentePorPais(q, codigosPaisResolvidos, paisesReferencia)
  ) {
    return {
      ...base,
      codigo_pais_porto: { in: codigosPaisResolvidos },
    }
  }

  const or: Prisma.PortoWhereInput[] = [
    { codigo_unlocode_porto: { contains: q.toUpperCase() } },
    { nome_porto: { contains: q, mode: 'insensitive' } },
    { nome_ascii_porto: { contains: q, mode: 'insensitive' } },
  ]

  if (codigosPaisResolvidos.length > 0 && !paisFiltro) {
    or.push({ codigo_pais_porto: { in: codigosPaisResolvidos } })
  }

  return { ...base, OR: or }
}

export function montarWhereBuscaPaisPorTermoPorto(q: string): Prisma.PaisWhereInput {
  const termo = q.trim()
  const upper = termo.toUpperCase()
  const or: Prisma.PaisWhereInput[] = [
    { nome_pais_portugues: { contains: termo, mode: 'insensitive' } },
    { nome_pais_ingles: { contains: termo, mode: 'insensitive' } },
  ]
  if (termo.length === 2) {
    or.push({ codigo_pais_iso_alpha2: { equals: upper } })
  }
  if (termo.length === 3) {
    or.push({ codigo_pais_iso_alpha3: { equals: upper } })
  }
  return { ativo_pais: true, OR: or }
}
