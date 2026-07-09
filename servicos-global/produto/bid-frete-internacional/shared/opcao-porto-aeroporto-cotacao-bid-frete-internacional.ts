import { z } from 'zod'

export const entradaOpcaoPortoAeroportoObjetoSchema = z.object({
  codigo: z.string().min(1),
  rotulo: z.string().min(1).optional(),
})

export const entradaOpcaoPortoAeroportoSchema = z.union([
  z.string().min(1),
  entradaOpcaoPortoAeroportoObjetoSchema,
])

export type EntradaOpcaoPortoAeroporto = z.infer<typeof entradaOpcaoPortoAeroportoSchema>

/** @deprecated Preferir parseEntradasOpcaoPortoAeroportoFromDb — mantém retrocompat com string[]. */
export const codigosOpcaoPortoAeroportoCotacaoSchema = z.array(z.string().min(1))

export type CodigosOpcaoPortoAeroportoCotacao = z.infer<typeof codigosOpcaoPortoAeroportoCotacaoSchema>

function chaveCodigoOpcaoPortoAeroporto(codigo: string): string {
  return codigo.trim().toUpperCase()
}

export function extrairCodigoEntradaOpcaoPortoAeroporto(entrada: EntradaOpcaoPortoAeroporto): string {
  return typeof entrada === 'string' ? entrada.trim() : entrada.codigo.trim()
}

export function extrairRotuloEntradaOpcaoPortoAeroporto(entrada: EntradaOpcaoPortoAeroporto): string | null {
  if (typeof entrada === 'string') return null
  const rotulo = entrada.rotulo?.trim()
  return rotulo || null
}

export function parseEntradasOpcaoPortoAeroportoFromDb(valor: unknown): EntradaOpcaoPortoAeroporto[] {
  if (valor == null || !Array.isArray(valor)) return []
  return valor.flatMap((item) => {
    const parsed = entradaOpcaoPortoAeroportoSchema.safeParse(item)
    return parsed.success ? [parsed.data] : []
  })
}

export function parseCodigosOpcaoPortoAeroportoFromDb(valor: unknown): string[] {
  return parseEntradasOpcaoPortoAeroportoFromDb(valor).map(extrairCodigoEntradaOpcaoPortoAeroporto)
}

export function mapaRotulosOpcionaisPersistidosCotacaoBidFrete(
  ctx: Pick<
    ContextoLocaisOpcionaisCotacaoBidFrete,
    | 'codigos_opcao_porto_aeroporto_origem_cotacao_bid_frete_internacional'
    | 'codigos_opcao_porto_aeroporto_destino_cotacao_bid_frete_internacional'
  >,
): Record<string, string> {
  const mapa: Record<string, string> = {}
  for (const raw of [
    ctx.codigos_opcao_porto_aeroporto_origem_cotacao_bid_frete_internacional,
    ctx.codigos_opcao_porto_aeroporto_destino_cotacao_bid_frete_internacional,
  ]) {
    for (const entrada of parseEntradasOpcaoPortoAeroportoFromDb(raw)) {
      const rotulo = extrairRotuloEntradaOpcaoPortoAeroporto(entrada)
      if (!rotulo) continue
      mapa[chaveCodigoOpcaoPortoAeroporto(extrairCodigoEntradaOpcaoPortoAeroporto(entrada))] = rotulo
    }
  }
  return mapa
}

export function codigosOpcaoPortoAeroportoParaPersistencia(
  habilitado: boolean,
  entradas: Array<string | { codigo: string; rotulo?: string | null }>,
): unknown[] | null {
  if (!habilitado) return null
  const limpos = entradas
    .map((entrada) => {
      if (typeof entrada === 'string') {
        const codigo = entrada.trim()
        return codigo ? { codigo, rotulo: null as string | null } : null
      }
      const codigo = entrada.codigo.trim()
      const rotulo = entrada.rotulo?.trim() || null
      return codigo ? { codigo, rotulo } : null
    })
    .filter((item): item is { codigo: string; rotulo: string | null } => item != null)
  if (limpos.length === 0) return null
  return limpos.map(({ codigo, rotulo }) => (rotulo ? { codigo, rotulo } : codigo))
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
