/**
 * Coordenadas de fallback para o mapa — quando Cadastros não retorna lat/long.
 */

import { COORDENADAS_TERMINAIS_CATALOGO_BID_FRETE } from './coordenadas-terminais-catalogo-bid-frete-internacional.js'
import type { LocalCadastrosBidFreteInternacional } from './resolver-local-cadastros-bid-frete-internacional.js'

const MAPA_COORDENADAS_FALLBACK = new Map<string, LocalCadastrosBidFreteInternacional>()

for (const terminal of COORDENADAS_TERMINAIS_CATALOGO_BID_FRETE) {
  const codigo = terminal.codigo.trim().toUpperCase()
  if (!codigo || MAPA_COORDENADAS_FALLBACK.has(codigo)) continue
  MAPA_COORDENADAS_FALLBACK.set(codigo, {
    codigo,
    nome: terminal.nome,
    pais: terminal.pais,
    latitude: terminal.latitude,
    longitude: terminal.longitude,
  })
}

export function resolverCoordenadasFallbackTerminalBidFreteInternacional(
  codigo: string,
): LocalCadastrosBidFreteInternacional | null {
  const codigoUpper = codigo.trim().toUpperCase()
  if (!codigoUpper) return null

  const direto = MAPA_COORDENADAS_FALLBACK.get(codigoUpper)
  if (direto) return direto

  if (codigoUpper.length === 3) {
    for (const [chave, coords] of MAPA_COORDENADAS_FALLBACK) {
      if (chave.endsWith(codigoUpper)) return coords
    }
  }

  return null
}
