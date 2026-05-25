/**
 * Normaliza texto colado no popover de edição inline.
 * Descrições longas (Word/HTML/Excel) frequentemente trazem \n no clipboard;
 * em campos de texto livre isso deve ir inteiro para UMA célula — não smart paste.
 */
export type ResultadoColagemPopover =
  | { tipo: 'aplicar'; valor: string }
  | { tipo: 'smart_paste'; linhas: string[] }

export function resolverColagemPopover(
  texto: string,
  opts: { textoLivre: boolean },
): ResultadoColagemPopover | null {
  const normalizado = texto.replace(/\r\n/g, '\n').trim()
  if (!normalizado) return null

  const linhas = normalizado.split('\n').map(l => l.trim()).filter(Boolean)

  if (opts.textoLivre) {
    return { tipo: 'aplicar', valor: normalizado }
  }

  if (linhas.length > 1) {
    return { tipo: 'smart_paste', linhas }
  }

  return { tipo: 'aplicar', valor: linhas[0] ?? normalizado }
}

export function lerTextoClipboard(data: DataTransfer): string {
  return (
    data.getData('text/plain') ||
    data.getData('Text') ||
    data.getData('text') ||
    ''
  )
}
