/** Padrão lista inline — `BRSSZ — Santos` (em dash U+2014). */
export const SEPARADOR_ROTULO_CADASTRO_IMPORTACAO = ' — '

export function formatarRotuloCodigoNomeImportacao(codigo: string, nome: string): string {
  const cod = codigo.trim()
  const nom = nome.trim()
  if (!cod) return nom
  if (!nom) return cod
  return `${cod}${SEPARADOR_ROTULO_CADASTRO_IMPORTACAO}${nom}`
}

/** Extrai código/sigla quando célula usa rótulo composto ou valor puro. */
export function extrairCodigoDeRotuloImportacao(valor: string | undefined | null): string {
  if (!valor) return ''
  const t = valor.trim()
  if (!t) return ''

  const emDash = t.indexOf(SEPARADOR_ROTULO_CADASTRO_IMPORTACAO)
  if (emDash > 0) return t.slice(0, emDash).trim()

  const enDash = t.indexOf(' – ')
  if (enDash > 0) return t.slice(0, enDash).trim()

  const hifen = t.indexOf(' - ')
  if (hifen > 0) return t.slice(0, hifen).trim()

  return t
}
