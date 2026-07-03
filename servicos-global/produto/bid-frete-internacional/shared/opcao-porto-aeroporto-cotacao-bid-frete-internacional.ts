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
