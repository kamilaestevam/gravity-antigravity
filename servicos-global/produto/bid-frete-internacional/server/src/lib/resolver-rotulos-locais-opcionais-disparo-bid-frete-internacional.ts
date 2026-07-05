/**
 * Resolve códigos de portos/aeroportos opcionais para rótulos completos
 * ("CODE — Nome, País") consultando o Cadastros. Fallback: o próprio código.
 * Usado pelo motor de disparo (e-mail) e pelo enriquecimento da resposta pública.
 */

import { fetchCadastrosJson } from './cadastros-client.js'

type ListaCadastros<T> = { itens: T[]; total: number }

type PortoCadastros = {
  codigo_unlocode_porto: string
  nome_porto: string
  codigo_pais_porto?: string | null
}

type AeroportoCadastros = {
  codigo_iata_aeroporto?: string | null
  codigo_unlocode_aeroporto: string
  nome_aeroporto: string
  codigo_pais_aeroporto?: string | null
}

async function resolverRotuloPorto(codigo: string): Promise<string> {
  const resp = await fetchCadastrosJson<ListaCadastros<PortoCadastros>>(
    '/api/v1/cadastros/portos',
    { q: codigo, limit: '10' },
  )
  const alvo = codigo.trim().toUpperCase()
  const hit = resp.itens.find((p) => p.codigo_unlocode_porto?.trim().toUpperCase() === alvo)
  if (!hit) return codigo
  const pais = hit.codigo_pais_porto?.trim()
  return `${alvo} — ${hit.nome_porto}${pais ? `, ${pais}` : ''}`
}

async function resolverRotuloAeroporto(codigo: string): Promise<string> {
  const resp = await fetchCadastrosJson<ListaCadastros<AeroportoCadastros>>(
    '/api/v1/cadastros/aeroportos',
    { q: codigo, limit: '10' },
  )
  const alvo = codigo.trim().toUpperCase()
  const hit = resp.itens.find(
    (a) =>
      a.codigo_iata_aeroporto?.trim().toUpperCase() === alvo
      || a.codigo_unlocode_aeroporto?.trim().toUpperCase() === alvo,
  )
  if (!hit) return codigo
  const pais = hit.codigo_pais_aeroporto?.trim()
  return `${alvo} — ${hit.nome_aeroporto}${pais ? `, ${pais}` : ''}`
}

/**
 * Resolve a lista de códigos para rótulos completos. Modal MARITIMO consulta
 * portos; AEREO consulta aeroportos; demais modais mantêm os códigos.
 */
export async function resolverRotulosLocaisOpcionaisDisparoBidFrete(
  modal: string | null | undefined,
  codigos: string[],
): Promise<string[]> {
  const m = modal?.trim().toUpperCase()
  if (codigos.length === 0) return []
  return Promise.all(
    codigos.map(async (codigo) => {
      try {
        if (m === 'MARITIMO') return await resolverRotuloPorto(codigo)
        if (m === 'AEREO') return await resolverRotuloAeroporto(codigo)
        return codigo
      } catch {
        return codigo
      }
    }),
  )
}

/** Junta os rótulos em um texto único para e-mail/tela ("A · B · C"). */
export function montarTextoRotulosLocaisOpcionaisDisparoBidFrete(rotulos: string[]): string | null {
  const limpos = rotulos.map((r) => r.trim()).filter(Boolean)
  return limpos.length > 0 ? limpos.join(' · ') : null
}
