/** Preferências da aba Configurações → Tabela (lista de cotações). */

export type UnidadeLimiteDestaqueExpiracao = 'horas' | 'dias'

export interface OpcaoSelectLimiteDestaqueExpiracao {
  valor: string
  rotulo: string
}

export interface GrupoSelectLimiteDestaqueExpiracao {
  rotulo: string
  opcoes: OpcaoSelectLimiteDestaqueExpiracao[]
}

export interface TabelaConfigBidFrete {
  linhasPorPagina: 25 | 50 | 100 | 200
  destacarAtrasados: boolean
  limiteDestaqueExpiracaoValor: number
  limiteDestaqueExpiracaoUnidade: UnidadeLimiteDestaqueExpiracao
}

export const STORAGE_KEY_TABELA_BID_FRETE = 'bid-frete:config:tabela'
export const SYNC_EVENT_TABELA_BID_FRETE = 'bid-frete:tabela-updated'

export const LIMITE_DESTAQUE_MIN_HORAS = 1
export const LIMITE_DESTAQUE_MAX_HORAS = 24
export const LIMITE_DESTAQUE_MIN_DIAS = 1
export const LIMITE_DESTAQUE_MAX_DIAS = 100

/** Padrão histórico — 2 horas de antecedência. */
export const HORAS_LIMITE_DESTAQUE_EXPIRACAO = 2

export const DEFAULT_TABELA_CONFIG_BID_FRETE: TabelaConfigBidFrete = {
  linhasPorPagina: 100,
  destacarAtrasados: true,
  limiteDestaqueExpiracaoValor: HORAS_LIMITE_DESTAQUE_EXPIRACAO,
  limiteDestaqueExpiracaoUnidade: 'horas',
}

const LINHAS_VALIDAS = new Set([25, 50, 100, 200])

export function codificarLimiteDestaqueExpiracao(
  valor: number,
  unidade: UnidadeLimiteDestaqueExpiracao,
): string {
  return `${unidade}:${valor}`
}

export function decodificarLimiteDestaqueExpiracao(
  codigo: string,
): { valor: number; unidade: UnidadeLimiteDestaqueExpiracao } | null {
  const [unidadeRaw, valorRaw] = codigo.split(':')
  if (unidadeRaw !== 'horas' && unidadeRaw !== 'dias') return null
  const valor = Number(valorRaw)
  if (!Number.isFinite(valor)) return null
  return normalizarLimiteDestaqueExpiracao(valor, unidadeRaw)
}

export function normalizarLimiteDestaqueExpiracao(
  valor: unknown,
  unidade: unknown,
): Pick<TabelaConfigBidFrete, 'limiteDestaqueExpiracaoValor' | 'limiteDestaqueExpiracaoUnidade'> {
  const unidadeNorm: UnidadeLimiteDestaqueExpiracao = unidade === 'dias' ? 'dias' : 'horas'
  const n = Math.trunc(Number(valor))
  if (unidadeNorm === 'dias') {
    const dias = Number.isFinite(n)
      ? Math.min(LIMITE_DESTAQUE_MAX_DIAS, Math.max(LIMITE_DESTAQUE_MIN_DIAS, n))
      : LIMITE_DESTAQUE_MIN_DIAS
    return { limiteDestaqueExpiracaoValor: dias, limiteDestaqueExpiracaoUnidade: 'dias' }
  }
  const horas = Number.isFinite(n)
    ? Math.min(LIMITE_DESTAQUE_MAX_HORAS, Math.max(LIMITE_DESTAQUE_MIN_HORAS, n))
    : HORAS_LIMITE_DESTAQUE_EXPIRACAO
  return { limiteDestaqueExpiracaoValor: horas, limiteDestaqueExpiracaoUnidade: 'horas' }
}

function migrarLimiteDestaqueLegado(
  parsed: Partial<TabelaConfigBidFrete> & { limiteDestaqueExpiracaoHoras?: number },
): Pick<TabelaConfigBidFrete, 'limiteDestaqueExpiracaoValor' | 'limiteDestaqueExpiracaoUnidade'> {
  if (parsed.limiteDestaqueExpiracaoValor != null && parsed.limiteDestaqueExpiracaoUnidade != null) {
    return normalizarLimiteDestaqueExpiracao(
      parsed.limiteDestaqueExpiracaoValor,
      parsed.limiteDestaqueExpiracaoUnidade,
    )
  }

  const legadoHoras = Number(parsed.limiteDestaqueExpiracaoHoras)
  if (Number.isFinite(legadoHoras) && legadoHoras > 0) {
    if (legadoHoras >= 24 && legadoHoras % 24 === 0) {
      const dias = legadoHoras / 24
      if (dias >= LIMITE_DESTAQUE_MIN_DIAS && dias <= LIMITE_DESTAQUE_MAX_DIAS) {
        return { limiteDestaqueExpiracaoValor: dias, limiteDestaqueExpiracaoUnidade: 'dias' }
      }
    }
    if (legadoHoras >= LIMITE_DESTAQUE_MIN_HORAS && legadoHoras <= LIMITE_DESTAQUE_MAX_HORAS) {
      return { limiteDestaqueExpiracaoValor: legadoHoras, limiteDestaqueExpiracaoUnidade: 'horas' }
    }
  }

  return {
    limiteDestaqueExpiracaoValor: HORAS_LIMITE_DESTAQUE_EXPIRACAO,
    limiteDestaqueExpiracaoUnidade: 'horas',
  }
}

export function obterLimiteDestaqueExpiracaoHoras(config: TabelaConfigBidFrete): number {
  return config.limiteDestaqueExpiracaoUnidade === 'dias'
    ? config.limiteDestaqueExpiracaoValor * 24
    : config.limiteDestaqueExpiracaoValor
}

export function formatarAntecedenciaDestaqueExpiracao(
  valor: number,
  unidade: UnidadeLimiteDestaqueExpiracao,
): string {
  if (unidade === 'dias') {
    return valor === 1 ? '1 dia' : `${valor} dias`
  }
  return valor === 1 ? '1 hora' : `${valor} horas`
}

export function formatarAntecedenciaDestaqueExpiracaoConfig(config: TabelaConfigBidFrete): string {
  return formatarAntecedenciaDestaqueExpiracao(
    config.limiteDestaqueExpiracaoValor,
    config.limiteDestaqueExpiracaoUnidade,
  )
}

export function montarGruposSelectLimiteDestaqueExpiracao(): GrupoSelectLimiteDestaqueExpiracao[] {
  const opcoesHoras = Array.from({ length: LIMITE_DESTAQUE_MAX_HORAS }, (_, indice) => {
    const valor = indice + LIMITE_DESTAQUE_MIN_HORAS
    return {
      valor: codificarLimiteDestaqueExpiracao(valor, 'horas'),
      rotulo: formatarAntecedenciaDestaqueExpiracao(valor, 'horas'),
    }
  })

  const opcoesDias = Array.from({ length: LIMITE_DESTAQUE_MAX_DIAS }, (_, indice) => {
    const valor = indice + LIMITE_DESTAQUE_MIN_DIAS
    return {
      valor: codificarLimiteDestaqueExpiracao(valor, 'dias'),
      rotulo: formatarAntecedenciaDestaqueExpiracao(valor, 'dias'),
    }
  })

  return [
    { rotulo: 'Horas', opcoes: opcoesHoras },
    { rotulo: 'Dias', opcoes: opcoesDias },
  ]
}

export function carregarTabelaConfigBidFrete(): TabelaConfigBidFrete {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TABELA_BID_FRETE)
    if (!raw) return DEFAULT_TABELA_CONFIG_BID_FRETE
    const parsed = JSON.parse(raw) as Partial<TabelaConfigBidFrete> & { limiteDestaqueExpiracaoHoras?: number }
    const linhas = Number(parsed.linhasPorPagina)
    const limite = migrarLimiteDestaqueLegado(parsed)
    return {
      linhasPorPagina: LINHAS_VALIDAS.has(linhas)
        ? (linhas as TabelaConfigBidFrete['linhasPorPagina'])
        : DEFAULT_TABELA_CONFIG_BID_FRETE.linhasPorPagina,
      destacarAtrasados: parsed.destacarAtrasados ?? DEFAULT_TABELA_CONFIG_BID_FRETE.destacarAtrasados,
      ...limite,
    }
  } catch {
    return DEFAULT_TABELA_CONFIG_BID_FRETE
  }
}

export function salvarTabelaConfigBidFrete(config: TabelaConfigBidFrete): void {
  localStorage.setItem(STORAGE_KEY_TABELA_BID_FRETE, JSON.stringify(config))
  notificarTabelaConfigBidFreteAtualizada()
}

export function notificarTabelaConfigBidFreteAtualizada(): void {
  window.dispatchEvent(new CustomEvent(SYNC_EVENT_TABELA_BID_FRETE))
}
