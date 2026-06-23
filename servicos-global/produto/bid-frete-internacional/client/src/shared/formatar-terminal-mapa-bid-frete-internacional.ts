/**
 * Rótulos de terminal e rota no mapa Insights — evita código duplicado na UI.
 */

export function limparNomeTerminalMapa(nome: string, codigo: string): string {
  const nomeLimpo = nome.trim()
  const codigoUpper = codigo.trim().toUpperCase()
  if (!nomeLimpo) return codigoUpper

  const sufixoCodigo = `(${codigoUpper})`
  let resultado = nomeLimpo
  if (resultado.toUpperCase().endsWith(sufixoCodigo)) {
    resultado = resultado.slice(0, -sufixoCodigo.length).trim()
  }

  const prefixoCodigo = new RegExp(`^${codigoUpper}\\s*[—\\-–]\\s*`, 'i')
  resultado = resultado.replace(prefixoCodigo, '').trim()

  return resultado || nomeLimpo
}

export function formatarTerminalMapa(nome: string, codigo: string): string {
  const codigoUpper = codigo.trim().toUpperCase()
  const nomeLimpo = limparNomeTerminalMapa(nome, codigoUpper)
  if (!nomeLimpo || nomeLimpo.toUpperCase() === codigoUpper) return codigoUpper
  return `${nomeLimpo} (${codigoUpper})`
}

export function formatarRotaMapa(
  origemNome: string,
  origemCodigo: string,
  destinoNome: string,
  destinoCodigo: string,
): string {
  return `${formatarTerminalMapa(origemNome, origemCodigo)} → ${formatarTerminalMapa(destinoNome, destinoCodigo)}`
}

export function rotuloContagemMapaInsights(opcoes: {
  quantidadeCotacoes: number
  quantidadeBids: number
}): string {
  const { quantidadeCotacoes, quantidadeBids } = opcoes
  const partes: string[] = []

  if (quantidadeCotacoes > 0) {
    partes.push(`${quantidadeCotacoes} ${quantidadeCotacoes === 1 ? 'cotação' : 'cotações'}`)
  }
  if (quantidadeBids > 0) {
    partes.push(`${quantidadeBids} ${quantidadeBids === 1 ? 'BID' : 'BIDs'}`)
  }

  if (partes.length === 0) return 'Nenhuma resposta'
  return partes.join(' · ')
}

export function rotuloMelhorPrecoMapa(valor: number | null | undefined): string {
  if (valor == null || !Number.isFinite(valor) || valor <= 0) {
    return 'Nenhuma resposta'
  }
  return `USD ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(valor)}`
}

function rotuloDocumentoComPrefixo(
  prefixo: string,
  numero: string,
): string {
  const numeroLimpo = numero.trim()
  if (!numeroLimpo) return prefixo
  const numeroUpper = numeroLimpo.toUpperCase()
  const prefixoUpper = prefixo.toUpperCase()
  if (
    numeroUpper.startsWith(`${prefixoUpper}-`) ||
    numeroUpper.startsWith(`${prefixoUpper} `)
  ) {
    return numeroLimpo
  }
  if (prefixoUpper === 'COTAÇÃO' && numeroUpper.startsWith('COT-')) {
    return numeroLimpo
  }
  return `${prefixo} ${numeroLimpo}`
}

export function rotuloDocumentoMapaInsights(opcoes: {
  numeroCotacao?: string | null
  numeroBid?: string | null
}): string | null {
  const numeroBid = opcoes.numeroBid?.trim()
  if (numeroBid) return rotuloDocumentoComPrefixo('BID', numeroBid)

  const numeroCotacao = opcoes.numeroCotacao?.trim()
  if (numeroCotacao) return rotuloDocumentoComPrefixo('Cotação', numeroCotacao)

  return null
}
