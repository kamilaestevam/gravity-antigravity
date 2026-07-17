/**
 * Fase 2 — equivalências determinísticas por caminho (portos UN/LOCODE COMEX).
 */
import { normalizarValorComparacaoCampoLeituraSmartRead } from './normalizar-valor-comparacao-campo-leitura-smart-read.js'

const PADROES_CAMINHO_PORTO = [
  /shipment\.port_of_origin$/i,
  /shipment\.port_of_destination$/i,
  /shipment\.ports\.(origin|destination|loading|discharge)$/i,
  /porto_embarque$/i,
  /porto_destino$/i,
  /port_of_loading$/i,
  /port_of_discharge$/i,
  /origin_port$/i,
  /destination_port$/i,
]

/** Grupos de aliases → primeiro item é o id canônico do grupo. */
const GRUPOS_PORTO_COMEX: readonly (readonly string[])[] = [
  ['itj', 'itj', 'itajai', 'itaja'],
  ['ssz', 'ssz', 'santos'],
  ['nvt', 'nvt', 'navegantes'],
  ['png', 'png', 'paranagua', 'paranaguá'],
  ['itp', 'itp', 'itapoa'],
  ['rio', 'rio', 'rio de janeiro', 'gig'],
  ['ssa', 'ssa', 'salvador'],
  ['pec', 'pec', 'pecem', 'pecém'],
  ['sua', 'sua', 'suape'],
  ['vix', 'vix', 'vitoria', 'vitória', 'tubarao', 'tubarão'],
  ['mao', 'mao', 'manaus'],
  ['bel', 'bel', 'belem', 'belém'],
  ['for', 'for', 'fortaleza'],
  ['rec', 'rec', 'recife'],
  ['cwb', 'cwb', 'curitiba'],
  ['gru', 'gru', 'guarulhos', 'sao paulo', 'são paulo'],
]

const INDICE_ALIAS_PORTO = new Map<string, string>()

for (const grupo of GRUPOS_PORTO_COMEX) {
  const canonico = grupo[0]
  for (const alias of grupo) {
    const norm = normalizarValorComparacaoCampoLeituraSmartRead(alias)
    if (norm) INDICE_ALIAS_PORTO.set(norm, canonico)
  }
}

export function caminhoEhCampoPortoConferenciaLeituraSmartRead(caminhoCampo: string): boolean {
  return PADROES_CAMINHO_PORTO.some((padrao) => padrao.test(caminhoCampo))
}

function tokensPortoComparacaoLeituraSmartRead(valor: string | null): string[] {
  const norm = normalizarValorComparacaoCampoLeituraSmartRead(valor)
  if (!norm) return []
  const tokens = norm.split(/[\s,;/]+/).filter((parte) => parte.length >= 2)
  if (/^[a-z0-9]{2,5}$/.test(norm)) tokens.unshift(norm)
  return [...new Set(tokens)]
}

function resolverGrupoPortoComparacaoLeituraSmartRead(valor: string | null): string | null {
  for (const token of tokensPortoComparacaoLeituraSmartRead(valor)) {
    const grupo = INDICE_ALIAS_PORTO.get(token)
    if (grupo) return grupo
  }
  return null
}

export function valoresEquivalentesCampoConferenciaLeituraSmartRead(
  caminhoCampo: string,
  valorOriginal: string | null,
  valorFinal: string | null,
): boolean {
  if (!caminhoEhCampoPortoConferenciaLeituraSmartRead(caminhoCampo)) return false
  const grupoOriginal = resolverGrupoPortoComparacaoLeituraSmartRead(valorOriginal)
  const grupoFinal = resolverGrupoPortoComparacaoLeituraSmartRead(valorFinal)
  return grupoOriginal != null && grupoOriginal === grupoFinal
}
