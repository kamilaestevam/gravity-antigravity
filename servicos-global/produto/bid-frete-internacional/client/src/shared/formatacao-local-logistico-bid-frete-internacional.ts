/**
 * Rótulos de porto/aeroporto — evita sigla duplicada entre parênteses.
 * Ex.: "Buenos Aires Ezeiza (EZE) (EZE)" → "Buenos Aires Ezeiza (EZE)"
 */

/** Evita "Buenos Aires (EZE)" + linha "EZE" — sigla aparece só uma vez. */
export function normalizarTextoPontoRota(
  nome: string,
  codigo: string,
): { titulo: string; sigla: string | null } {
  const sigla = codigo.trim()
  let titulo = nome.trim()

  if (!sigla) {
    return { titulo: titulo || '—', sigla: null }
  }

  const siglaEscapada = sigla.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const padraoSufixoEntreParenteses = new RegExp(`\\s*\\(\\s*${siglaEscapada}\\s*\\)\\s*$`, 'i')

  let anterior = ''
  while (titulo !== anterior) {
    anterior = titulo
    titulo = titulo.replace(padraoSufixoEntreParenteses, '').trim()
  }

  if (!titulo || titulo.toUpperCase() === sigla.toUpperCase()) {
    return { titulo: sigla, sigla: null }
  }

  return { titulo, sigla }
}

/** Monta rótulo único "Nome (SIGLA)" sem repetir a sigla já presente no nome. */
export function formatarRotuloLocalLogistico(nome: string, codigo: string): string {
  const { titulo, sigla } = normalizarTextoPontoRota(nome, codigo)
  if (sigla == null) return titulo
  return `${titulo} (${sigla})`
}

/** Normaliza texto já persistido (sem código separado) removendo sufixos duplicados. */
export function normalizarTextoExibicaoLocalLogistico(texto: string): string {
  let atual = texto.trim()
  if (!atual) return '—'

  const duplicataSufixo = /\(\s*([A-Za-z0-9]{2,12})\s*\)\s*\(\s*\1\s*\)\s*$/i
  while (duplicataSufixo.test(atual)) {
    atual = atual.replace(duplicataSufixo, '($1)').trim()
  }

  return atual
}

/** Texto "Origem → Destino" para resumo de cotação. */
export function formatarRotaExibicaoCotacao(origem: string, destino: string): string {
  const o = normalizarTextoExibicaoLocalLogistico(origem)
  const d = normalizarTextoExibicaoLocalLogistico(destino)
  if (o === '—' && d === '—') return '—'
  return `${o} → ${d}`
}
