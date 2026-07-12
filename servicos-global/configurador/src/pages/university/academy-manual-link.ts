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
): DestinoManualAcademy {
  const origem = `/university-gravity/academy/${produtoSlug}/${faseSlug}`
  return {
    pathname: `/university-gravity/docs/${produtoSlug}`,
    search: `?origem=${encodeURIComponent(origem)}`,
    hash: `#doc-sec-${manualSecao}`,
  }
}

/** @deprecated Preferir `construirDestinoManualAcademy` com `navigate(destino)`. */
export function construirLinkManualAcademy(
  produtoSlug: string,
  faseSlug: string,
  manualSecao: number,
): string {
  const destino = construirDestinoManualAcademy(produtoSlug, faseSlug, manualSecao)
  return `${destino.pathname}${destino.search}${destino.hash}`
}
