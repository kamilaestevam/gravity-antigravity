import {
  codigoLocalPrincipalCotacaoBidFrete,
  codigosElegiveisSelecaoLocalFornecedorBidFrete,
  codigosLocaisOpcionaisCotacaoBidFrete,
  modalCotacaoExigeAeroportoLocal,
  modalCotacaoExigePortoLocal,
  type ContextoLocaisOpcionaisCotacaoBidFrete,
} from './opcao-porto-aeroporto-cotacao-bid-frete-internacional.js'
import {
  rotuloAeroportoCadastroLogistica,
  rotuloPortoCadastroLogistica,
} from './rotulo-cadastro-logistica-bid-frete-internacional.js'

export type ContextoLocaisComNomesSnapshot = ContextoLocaisOpcionaisCotacaoBidFrete & {
  origem_nome_cotacao_bid_frete_internacional?: string | null
  destino_nome_cotacao_bid_frete_internacional?: string | null
  /** Preenchido pelo enriquecimento do disparo — rótulos já resolvidos no server. */
  mapa_rotulos_locais_resposta_bid_frete_internacional?: Record<string, string> | null
}

export type PortoRotuloCadastro = {
  codigo_unlocode_porto: string
  nome_porto: string
  codigo_pais_porto?: string | null
}

export type AeroportoRotuloCadastro = {
  codigo_iata_aeroporto?: string | null
  codigo_unlocode_aeroporto: string
  nome_aeroporto: string
  codigo_pais_aeroporto?: string | null
}

export function chaveCodigoLocalBidFrete(codigo: string): string {
  return codigo.trim().toUpperCase()
}

export function coletarCodigosLocaisCotacaoBidFrete(
  ctx: ContextoLocaisOpcionaisCotacaoBidFrete,
): string[] {
  const vistos = new Set<string>()
  const resultado: string[] = []
  const incluir = (codigo: string | null | undefined) => {
    const limpo = codigo?.trim()
    if (!limpo) return
    const chave = chaveCodigoLocalBidFrete(limpo)
    if (vistos.has(chave)) return
    vistos.add(chave)
    resultado.push(limpo)
  }

  for (const lado of ['origem', 'destino'] as const) {
    incluir(codigoLocalPrincipalCotacaoBidFrete(ctx, lado))
    for (const codigo of codigosLocaisOpcionaisCotacaoBidFrete(ctx, lado)) {
      incluir(codigo)
    }
    for (const codigo of codigosElegiveisSelecaoLocalFornecedorBidFrete(ctx, lado)) {
      incluir(codigo)
    }
  }

  return resultado
}

export function rotuloLocalFromSnapshotCotacaoBidFrete(
  ctx: ContextoLocaisComNomesSnapshot,
  lado: 'origem' | 'destino',
  codigo: string,
): string | null {
  const codigoPrincipal = codigoLocalPrincipalCotacaoBidFrete(ctx, lado)
  if (chaveCodigoLocalBidFrete(codigoPrincipal ?? '') !== chaveCodigoLocalBidFrete(codigo)) return null

  const nomeSnapshot = lado === 'origem'
    ? ctx.origem_nome_cotacao_bid_frete_internacional
    : ctx.destino_nome_cotacao_bid_frete_internacional
  const nome = nomeSnapshot?.trim()
  if (!nome) return null

  const codigoFmt = chaveCodigoLocalBidFrete(codigo)
  if (nome.toUpperCase().startsWith(`${codigoFmt} —`) || nome.toUpperCase().startsWith(`${codigoFmt} -`)) {
    return nome
  }
  return `${codigoFmt} — ${nome}`
}

export function rotuloPortoCadastroPorCodigo(
  codigo: string,
  portos: PortoRotuloCadastro[],
): string | null {
  const alvo = chaveCodigoLocalBidFrete(codigo)
  const hit = portos.find((p) => chaveCodigoLocalBidFrete(p.codigo_unlocode_porto) === alvo)
  return hit ? rotuloPortoCadastroLogistica(hit) : null
}

export function rotuloAeroportoCadastroPorCodigo(
  codigo: string,
  aeroportos: AeroportoRotuloCadastro[],
): string | null {
  const alvo = chaveCodigoLocalBidFrete(codigo)
  const hit = aeroportos.find(
    (a) =>
      chaveCodigoLocalBidFrete(a.codigo_iata_aeroporto ?? '') === alvo
      || chaveCodigoLocalBidFrete(a.codigo_unlocode_aeroporto) === alvo,
  )
  return hit ? rotuloAeroportoCadastroLogistica(hit) : null
}

export function resolverRotuloLocalFornecedorRespostaBidFrete(
  ctx: ContextoLocaisComNomesSnapshot,
  codigo: string,
  portos: PortoRotuloCadastro[],
  aeroportos: AeroportoRotuloCadastro[],
  mapaRemoto: ReadonlyMap<string, string> = new Map(),
): string {
  const chave = chaveCodigoLocalBidFrete(codigo)
  const rotuloServidor = ctx.mapa_rotulos_locais_resposta_bid_frete_internacional?.[chave]
  if (rotuloServidor) return rotuloServidor

  const remoto = mapaRemoto.get(chave)
  if (remoto) return remoto

  if (modalCotacaoExigePortoLocal(ctx.modal_cotacao_bid_frete_internacional)) {
    const porto = rotuloPortoCadastroPorCodigo(codigo, portos)
    if (porto) return porto
  }
  if (modalCotacaoExigeAeroportoLocal(ctx.modal_cotacao_bid_frete_internacional)) {
    const aeroporto = rotuloAeroportoCadastroPorCodigo(codigo, aeroportos)
    if (aeroporto) return aeroporto
  }

  for (const lado of ['origem', 'destino'] as const) {
    const snapshot = rotuloLocalFromSnapshotCotacaoBidFrete(ctx, lado, codigo)
    if (snapshot) return snapshot
  }

  return codigo
}
