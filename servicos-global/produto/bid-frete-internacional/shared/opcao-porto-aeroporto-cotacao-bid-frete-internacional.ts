import { z } from 'zod'

export const codigosOpcaoPortoAeroportoCotacaoSchema = z.array(z.string().min(1))

export type CodigosOpcaoPortoAeroportoCotacao = z.infer<typeof codigosOpcaoPortoAeroportoCotacaoSchema>

export function parseCodigosOpcaoPortoAeroportoFromDb(valor: unknown): string[] {
  if (valor == null) return []
  const parsed = codigosOpcaoPortoAeroportoCotacaoSchema.safeParse(valor)
  return parsed.success ? parsed.data : []
}

export function codigosOpcaoPortoAeroportoParaPersistencia(
  habilitado: boolean,
  codigos: string[],
): string[] | null {
  if (!habilitado) return null
  const limpos = codigos.map((c) => c.trim()).filter(Boolean)
  return limpos.length > 0 ? limpos : null
}

export function formatarCodigosOpcaoPortoAeroportoExibicao(
  codigos: string[],
  resolverRotulo: (codigo: string) => string,
): string {
  if (codigos.length === 0) return ''
  return codigos.map(resolverRotulo).join(', ')
}

export function montarTextoLocaisOpcionaisDisparo(
  habilitado: boolean | null | undefined,
  codigosRaw: unknown,
  resolverRotulo: (codigo: string) => string,
): string | null {
  if (!habilitado) return null
  const codigos = parseCodigosOpcaoPortoAeroportoFromDb(codigosRaw)
  if (codigos.length === 0) return null
  return formatarCodigosOpcaoPortoAeroportoExibicao(codigos, resolverRotulo)
}

export type ModalLocalLogisticoCotacao = 'MARITIMO' | 'AEREO' | 'RODOVIARIO'

export interface ContextoLocaisOpcionaisCotacaoBidFrete {
  modal_cotacao_bid_frete_internacional?: ModalLocalLogisticoCotacao | null
  porto_origem_cotacao_bid_frete_internacional?: string | null
  porto_destino_cotacao_bid_frete_internacional?: string | null
  aeroporto_origem_cotacao_bid_frete_internacional?: string | null
  aeroporto_destino_cotacao_bid_frete_internacional?: string | null
  habilitar_opcao_porto_aeroporto_origem_cotacao_bid_frete_internacional?: boolean | null
  habilitar_opcao_porto_aeroporto_destino_cotacao_bid_frete_internacional?: boolean | null
  codigos_opcao_porto_aeroporto_origem_cotacao_bid_frete_internacional?: unknown
  codigos_opcao_porto_aeroporto_destino_cotacao_bid_frete_internacional?: unknown
}

export function modalCotacaoExigePortoLocal(
  modal?: ModalLocalLogisticoCotacao | null,
): boolean {
  return modal === 'MARITIMO'
}

export function modalCotacaoExigeAeroportoLocal(
  modal?: ModalLocalLogisticoCotacao | null,
): boolean {
  return modal === 'AEREO'
}

export function codigoLocalPrincipalCotacaoBidFrete(
  ctx: ContextoLocaisOpcionaisCotacaoBidFrete,
  lado: 'origem' | 'destino',
): string | null {
  const modal = ctx.modal_cotacao_bid_frete_internacional
  if (modalCotacaoExigePortoLocal(modal)) {
    const codigo = lado === 'origem'
      ? ctx.porto_origem_cotacao_bid_frete_internacional
      : ctx.porto_destino_cotacao_bid_frete_internacional
    return codigo?.trim() || null
  }
  if (modalCotacaoExigeAeroportoLocal(modal)) {
    const codigo = lado === 'origem'
      ? ctx.aeroporto_origem_cotacao_bid_frete_internacional
      : ctx.aeroporto_destino_cotacao_bid_frete_internacional
    return codigo?.trim() || null
  }
  return null
}

export function codigosLocaisOpcionaisCotacaoBidFrete(
  ctx: ContextoLocaisOpcionaisCotacaoBidFrete,
  lado: 'origem' | 'destino',
): string[] {
  const habilitado = lado === 'origem'
    ? ctx.habilitar_opcao_porto_aeroporto_origem_cotacao_bid_frete_internacional
    : ctx.habilitar_opcao_porto_aeroporto_destino_cotacao_bid_frete_internacional
  if (!habilitado) return []
  const raw = lado === 'origem'
    ? ctx.codigos_opcao_porto_aeroporto_origem_cotacao_bid_frete_internacional
    : ctx.codigos_opcao_porto_aeroporto_destino_cotacao_bid_frete_internacional
  return parseCodigosOpcaoPortoAeroportoFromDb(raw)
}

export function exigeExibirLocaisOpcionaisCotacaoBidFrete(
  ctx: ContextoLocaisOpcionaisCotacaoBidFrete,
  lado: 'origem' | 'destino',
): boolean {
  return codigosLocaisOpcionaisCotacaoBidFrete(ctx, lado).length > 0
}

export function codigosElegiveisSelecaoLocalFornecedorBidFrete(
  ctx: ContextoLocaisOpcionaisCotacaoBidFrete,
  lado: 'origem' | 'destino',
): string[] {
  const principal = codigoLocalPrincipalCotacaoBidFrete(ctx, lado)
  const opcionais = codigosLocaisOpcionaisCotacaoBidFrete(ctx, lado)
  const vistos = new Set<string>()
  const resultado: string[] = []
  for (const codigo of [principal, ...opcionais]) {
    if (!codigo || vistos.has(codigo)) continue
    vistos.add(codigo)
    resultado.push(codigo)
  }
  return resultado
}

export function exigeSelecaoLocalFornecedorRespostaBidFrete(
  ctx: ContextoLocaisOpcionaisCotacaoBidFrete,
  lado: 'origem' | 'destino',
): boolean {
  return exigeExibirLocaisOpcionaisCotacaoBidFrete(ctx, lado)
}

export function montarTextoLocaisOpcionaisCotacaoBidFrete(
  ctx: ContextoLocaisOpcionaisCotacaoBidFrete,
  lado: 'origem' | 'destino',
  resolverRotulo: (codigo: string) => string,
): string | null {
  const habilitado = lado === 'origem'
    ? ctx.habilitar_opcao_porto_aeroporto_origem_cotacao_bid_frete_internacional
    : ctx.habilitar_opcao_porto_aeroporto_destino_cotacao_bid_frete_internacional
  return montarTextoLocaisOpcionaisDisparo(
    habilitado,
    lado === 'origem'
      ? ctx.codigos_opcao_porto_aeroporto_origem_cotacao_bid_frete_internacional
      : ctx.codigos_opcao_porto_aeroporto_destino_cotacao_bid_frete_internacional,
    resolverRotulo,
  )
}

export function refinamentoOpcoesPortoAeroportoCotacao(
  habilitado: boolean,
  codigos: string[] | undefined,
  path: string,
  ctx: z.RefinementCtx,
): void {
  if (!habilitado) return
  const limpos = (codigos ?? []).map((c) => c.trim()).filter(Boolean)
  if (limpos.length === 0) {
    ctx.addIssue({
      code: 'custom',
      message: 'Selecione ao menos um porto ou aeroporto alternativo',
      path: [path],
    })
  }
}
