/**
 * Normaliza texto colado no popover de edição inline.
 * Descrições longas (Word/HTML/Excel) frequentemente trazem \n no clipboard;
 * em campos de texto livre isso deve ir inteiro para UMA célula — não smart paste.
 */
export type ResultadoColagemPopover =
  | { tipo: 'aplicar'; valor: string }
  | { tipo: 'smart_paste'; linhas: string[] }

/** Campo de coluna NCM (legado `ncm` ou DDD `*_ncm_*` / `ncm_*`). */
export function campoEhNcm(campo: string): boolean {
  return campo === 'ncm' || campo.includes('ncm_') || campo.endsWith('_ncm')
}

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

/** Converte HTML do clipboard (Word/Excel) em texto plano com quebras de linha. */
export function extrairTextoDeHtml(html: string): string {
  if (!html.trim()) return ''
  if (typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    const body = doc.body
    body.querySelectorAll('br').forEach(br => br.replaceWith('\n'))
    body.querySelectorAll('tr').forEach((tr, rowIdx) => {
      if (rowIdx > 0) tr.before(doc.createTextNode('\n'))
      tr.querySelectorAll('td, th').forEach((cell, colIdx) => {
        if (colIdx > 0) cell.prepend(doc.createTextNode('\t'))
      })
    })
    return (body.textContent ?? '').replace(/\r\n/g, '\n')
  }
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<\/t[dh]>/gi, '\t')
    .replace(/<[^>]+>/g, '')
    .replace(/\r\n/g, '\n')
}

function temConteudoClipboard(texto: string): boolean {
  return texto.trim().length > 0 || texto.includes('\n') || texto.includes('\t')
}

export function lerTextoClipboard(data: DataTransfer | null): string {
  if (!data) return ''
  const plain =
    data.getData('text/plain') ||
    data.getData('Text') ||
    data.getData('text') ||
    ''
  if (temConteudoClipboard(plain)) return plain

  const html = data.getData('text/html')
  if (html) {
    const fromHtml = extrairTextoDeHtml(html)
    if (temConteudoClipboard(fromHtml)) return fromHtml
  }

  return plain
}

/** Fallback assíncrono quando `clipboardData` vem vazio (comum no Windows / Office). */
export async function lerTextoClipboardAsync(data: DataTransfer | null): Promise<string> {
  const sync = lerTextoClipboard(data)
  if (temConteudoClipboard(sync)) return sync
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.readText) {
      const asyncText = await navigator.clipboard.readText()
      if (temConteudoClipboard(asyncText)) return asyncText
    }
  } catch {
    /* gesto do usuário ou permissão — ignorar */
  }
  return sync
}
