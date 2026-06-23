/**
 * Rótulos de porto/aeroporto nos dropdowns — país visível para homônimos (ex.: Athens US vs GR).
 */

export function rotuloPortoCadastroLogistica(opcoes: {
  codigo_unlocode_porto: string
  nome_porto: string
  codigo_pais_porto?: string | null
}): string {
  const codigo = opcoes.codigo_unlocode_porto.trim()
  const pais = opcoes.codigo_pais_porto?.trim().toUpperCase()
  const sufixoPais = pais ? `, ${pais}` : ''
  return `${codigo} — ${opcoes.nome_porto.trim()}${sufixoPais}`
}

export function rotuloAeroportoCadastroLogistica(opcoes: {
  codigo_iata_aeroporto?: string | null
  codigo_unlocode_aeroporto: string
  nome_aeroporto: string
  codigo_pais_aeroporto?: string | null
}): string {
  const codigo =
    opcoes.codigo_iata_aeroporto?.trim() || opcoes.codigo_unlocode_aeroporto.trim()
  const pais = opcoes.codigo_pais_aeroporto?.trim().toUpperCase()
  const sufixoPais = pais ? `, ${pais}` : ''
  return `${codigo} — ${opcoes.nome_aeroporto.trim()}${sufixoPais}`
}
