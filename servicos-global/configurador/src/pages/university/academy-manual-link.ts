export interface DestinoManualAcademy {
  pathname: string
  search: string
  hash: string
}

/** Destino do manual com retorno à aula de origem (query `origem` + hash da seção). */
export function construirDestinoManualAcademy(
  produtoSlug: string,
  faseSlug: string,
  manualSecao: number,
  manualCapitulo?: string,
): DestinoManualAcademy {
  const origem = `/university-gravity/academy/${produtoSlug}/${faseSlug}`
  const pathname = manualCapitulo
    ? `/university-gravity/docs/${produtoSlug}/${manualCapitulo}`
    : `/university-gravity/docs/${produtoSlug}`
  return {
    pathname,
    search: `?origem=${encodeURIComponent(origem)}`,
    hash: `#doc-sec-${manualSecao}`,
  }
}

/** @deprecated Preferir `construirDestinoManualAcademy` com `navigate(destino)`. */
export function construirLinkManualAcademy(
  produtoSlug: string,
  faseSlug: string,
  manualSecao: number,
  manualCapitulo?: string,
): string {
  const destino = construirDestinoManualAcademy(produtoSlug, faseSlug, manualSecao, manualCapitulo)
  return `${destino.pathname}${destino.search}${destino.hash}`
}
