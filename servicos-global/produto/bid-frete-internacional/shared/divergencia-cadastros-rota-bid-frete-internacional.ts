/**
 * Detecta divergência entre snapshot da cotação e Cadastros (mapa + validação de gravação).
 */

import {
  ehCodigoUnlocode,
  paisDeCodigoUnlocode,
} from './resolver-cadastro-rota-importacao-bid-frete-internacional'

const REGEX_ISO_ALPHA2 = /^[A-Z]{2}$/

export interface LocalCadastrosResolvido {
  codigo: string
  nome: string
  pais: string
}

function trim(val: string | null | undefined): string {
  return (val ?? '').trim()
}

/** Normaliza país para ISO alpha-2 quando possível — evita falso positivo `Brasil` vs `BR`. */
export function normalizarPaisIsoParaComparacao(
  paisBruto: string,
  codigoTerminal: string,
): string | null {
  const pais = trim(paisBruto).toUpperCase()
  const codigo = trim(codigoTerminal).toUpperCase()

  if (REGEX_ISO_ALPHA2.test(pais)) return pais
  if (ehCodigoUnlocode(codigo)) {
    const inferido = trim(paisDeCodigoUnlocode(codigo)).toUpperCase()
    if (REGEX_ISO_ALPHA2.test(inferido)) return inferido
  }
  return null
}

function normalizarTextoComparacao(valor: string): string {
  return valor
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

export function limparNomeTerminalParaComparacao(nome: string, codigo: string): string {
  const nomeLimpo = nome.trim()
  const codigoUpper = codigo.trim().toUpperCase()
  if (!nomeLimpo) return ''

  const sufixoCodigo = `(${codigoUpper})`
  let resultado = nomeLimpo
  if (resultado.toUpperCase().endsWith(sufixoCodigo)) {
    resultado = resultado.slice(0, -sufixoCodigo.length).trim()
  }

  const prefixoCodigo = new RegExp(`^${codigoUpper}\\s*[—\\-–]\\s*`, 'i')
  resultado = resultado.replace(prefixoCodigo, '').trim()

  const separadorNome = resultado.indexOf(' — ')
  if (separadorNome >= 0) {
    resultado = resultado.slice(separadorNome + 3).trim()
  }

  return resultado || nomeLimpo
}

function nomesCompativeis(nomeCotacao: string, nomeCadastros: string): boolean {
  const a = normalizarTextoComparacao(nomeCotacao)
  const b = normalizarTextoComparacao(nomeCadastros)
  if (!a || !b) return true
  if (a === b) return true
  if (b.includes(a) || a.includes(b)) return true
  return false
}

export function montarAlertaDivergenciaCadastrosMapa(opcoes: {
  codigo: string
  nomeCotacao: string
  paisCotacao: string
  nomeCadastros: string
  paisCadastros: string
}): string | null {
  const alertas: string[] = []
  const isoCotacao = normalizarPaisIsoParaComparacao(opcoes.paisCotacao, opcoes.codigo)
  const isoCadastros = normalizarPaisIsoParaComparacao(opcoes.paisCadastros, opcoes.codigo)

  if (isoCotacao && isoCadastros && isoCotacao !== isoCadastros) {
    alertas.push(`País gravado (${isoCotacao}) difere do Cadastros (${isoCadastros})`)
  }

  const nomeCotacao = limparNomeTerminalParaComparacao(opcoes.nomeCotacao, opcoes.codigo)
  const nomeCadastros = limparNomeTerminalParaComparacao(opcoes.nomeCadastros, opcoes.codigo)
  if (nomeCotacao && nomeCadastros && !nomesCompativeis(nomeCotacao, nomeCadastros)) {
    alertas.push(`Nome gravado (${nomeCotacao}) não corresponde ao Cadastros (${nomeCadastros})`)
  }

  return alertas.length > 0 ? alertas.join(' · ') : null
}

export function validarConsistenciaLocalRotaCadastros(
  lado: 'origem' | 'destino',
  snapshot: { codigo: string; nome: string; pais: string },
  cadastros: LocalCadastrosResolvido | null,
): { path: string; message: string } | null {
  const codigo = trim(snapshot.codigo).toUpperCase()
  if (!codigo) return null

  const pathCodigo =
    lado === 'origem'
      ? 'origem_codigo_cotacao_bid_frete_internacional'
      : 'destino_codigo_cotacao_bid_frete_internacional'

  if (!cadastros) {
    return {
      path: pathCodigo,
      message: `Código ${codigo} não encontrado no Cadastros`,
    }
  }

  const alerta = montarAlertaDivergenciaCadastrosMapa({
    codigo,
    nomeCotacao: snapshot.nome,
    paisCotacao: snapshot.pais,
    nomeCadastros: cadastros.nome,
    paisCadastros: cadastros.pais,
  })

  if (!alerta) return null

  if (alerta.includes('País gravado')) {
    return {
      path:
        lado === 'origem'
          ? 'origem_pais_cotacao_bid_frete_internacional'
          : 'destino_pais_cotacao_bid_frete_internacional',
      message: alerta,
    }
  }

  return {
    path:
      lado === 'origem'
        ? 'origem_nome_cotacao_bid_frete_internacional'
        : 'destino_nome_cotacao_bid_frete_internacional',
    message: alerta,
  }
}
