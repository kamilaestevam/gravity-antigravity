/**
 * Rótulos de porto/aeroporto — evita sigla duplicada entre parênteses ou prefixo "COD — Nome".
 * Ex.: "Buenos Aires Ezeiza (EZE) (EZE)" → "Buenos Aires Ezeiza" + linha "EZE"
 * Ex.: "VNHPH — Hai Phong" + código VNHPH → "Hai Phong" + linha "VNHPH"
 */

function variantesCodigoLogistico(codigo: string): string[] {
  const normalizado = codigo.trim().toUpperCase()
  if (!normalizado) return []
  const variantes = new Set<string>([normalizado])
  if (normalizado.length === 5 && /^[A-Z]{5}$/.test(normalizado)) {
    variantes.add(`${normalizado.slice(0, 2)} ${normalizado.slice(2)}`)
  }
  return [...variantes]
}

function removerPrefixoCodigoDoTitulo(titulo: string, codigo: string): string {
  let resultado = titulo.trim()
  for (const variante of variantesCodigoLogistico(codigo)) {
    const varianteEscapada = variante.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const padraoPrefixo = new RegExp(`^${varianteEscapada}\\s*[—–-]\\s*`, 'i')
    resultado = resultado.replace(padraoPrefixo, '').trim()
  }
  return resultado
}

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

  titulo = removerPrefixoCodigoDoTitulo(titulo, sigla)

  const siglaEscapada = sigla.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const padraoSufixoEntreParenteses = new RegExp(`\\s*\\(\\s*${siglaEscapada}\\s*\\)\\s*$`, 'i')

  let anterior = ''
  while (titulo !== anterior) {
    anterior = titulo
    titulo = titulo.replace(padraoSufixoEntreParenteses, '').trim()
  }

  for (const variante of variantesCodigoLogistico(sigla)) {
    if (titulo.toUpperCase() === variante) {
      return { titulo: variante, sigla: null }
    }
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
