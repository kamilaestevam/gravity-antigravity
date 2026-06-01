/**
 * Múltiplos containers FCL em um único registro de cotação (sem migration).
 * - 1 linha: tipo = ISO (ex. 22G0), quantidade = número no campo quantidade.
 * - N linhas: tipo = "22G0:2|45G0:1", quantidade = soma das quantidades.
 */

export interface LinhaContainerCotacao {
  id: number
  tipo_container: string
  quantidade: number
}

export function linhaContainerCotacaoVazia(id: number): LinhaContainerCotacao {
  return { id, tipo_container: '', quantidade: 1 }
}

export function serializarLinhasContainersFcl(
  linhas: Array<Pick<LinhaContainerCotacao, 'tipo_container' | 'quantidade'>>,
): { tipo_container_cotacao_bid_frete_internacional: string; quantidade_volume_cotacao_bid_frete_internacional: number } {
  const validas = linhas.filter((l) => l.tipo_container.trim() && l.quantidade > 0)
  if (validas.length === 0) {
    return { tipo_container_cotacao_bid_frete_internacional: '', quantidade_volume_cotacao_bid_frete_internacional: 1 }
  }
  const quantidadeTotal = validas.reduce((acc, l) => acc + l.quantidade, 0)
  if (validas.length === 1) {
    return {
      tipo_container_cotacao_bid_frete_internacional: validas[0].tipo_container.trim(),
      quantidade_volume_cotacao_bid_frete_internacional: validas[0].quantidade,
    }
  }
  const tipo = validas.map((l) => `${l.tipo_container.trim()}:${l.quantidade}`).join('|')
  return {
    tipo_container_cotacao_bid_frete_internacional: tipo,
    quantidade_volume_cotacao_bid_frete_internacional: quantidadeTotal,
  }
}

export function parseContainersPersistidos(
  tipo: string | null | undefined,
  quantidadeFallback = 1,
): LinhaContainerCotacao[] {
  const raw = (tipo ?? '').trim()
  if (!raw) {
    return [linhaContainerCotacaoVazia(1)]
  }
  if (raw.includes('|')) {
    let id = 1
    return raw.split('|').map((parte) => {
      const [tipoParte, qtdStr] = parte.split(':')
      const qtd = parseInt(qtdStr ?? '', 10)
      return {
        id: id++,
        tipo_container: (tipoParte ?? '').trim(),
        quantidade: Number.isFinite(qtd) && qtd > 0 ? qtd : 1,
      }
    })
  }
  const colonIdx = raw.indexOf(':')
  if (colonIdx > 0) {
    const tipoParte = raw.slice(0, colonIdx).trim()
    const qtd = parseInt(raw.slice(colonIdx + 1), 10)
    if (tipoParte && Number.isFinite(qtd) && qtd > 0) {
      return [{ id: 1, tipo_container: tipoParte, quantidade: qtd }]
    }
  }
  return [
    {
      id: 1,
      tipo_container: raw,
      quantidade: quantidadeFallback > 0 ? quantidadeFallback : 1,
    },
  ]
}

export function formatarLinhasContainersParaExibicao(
  linhas: Array<Pick<LinhaContainerCotacao, 'tipo_container' | 'quantidade'>>,
  rotuloTipo: (codigo: string) => string,
): string {
  const validas = linhas.filter((l) => l.tipo_container.trim() && l.quantidade > 0)
  if (validas.length === 0) return '—'
  return validas
    .map((l) => `${l.quantidade}× ${rotuloTipo(l.tipo_container)}`)
    .join(' + ')
}

export function formatarContainersPersistidosParaExibicao(
  tipo: string | null | undefined,
  quantidade: number,
  rotuloTipo: (codigo: string) => string,
): string {
  return formatarLinhasContainersParaExibicao(
    parseContainersPersistidos(tipo, quantidade),
    rotuloTipo,
  )
}

/** Primeiro ISO para integrações que aceitam um único container. */
export function primeiroTipoContainerPersistido(tipo: string | null | undefined): string | undefined {
  const linhas = parseContainersPersistidos(tipo)
  const codigo = linhas[0]?.tipo_container?.trim()
  return codigo || undefined
}
