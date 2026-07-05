import { z } from 'zod'

const MARCADOR_INICIO = '__GRAVITY_BID_LOCAIS__'
const MARCADOR_FIM = '__GRAVITY_BID_LOCAIS__'

export const locaisPropostaRespostaSchema = z.object({
  codigo_porto_aeroporto_origem_proposta_bid_frete_internacional: z.string().min(1).optional(),
  codigo_porto_aeroporto_destino_proposta_bid_frete_internacional: z.string().min(1).optional(),
})

export type LocaisPropostaRespostaBidFrete = z.infer<typeof locaisPropostaRespostaSchema>

export function serializarLocaisPropostaObservacoes(
  locais: LocaisPropostaRespostaBidFrete,
  observacoesUsuario?: string | null,
): string | null {
  const temLocais =
    !!locais.codigo_porto_aeroporto_origem_proposta_bid_frete_internacional?.trim()
    || !!locais.codigo_porto_aeroporto_destino_proposta_bid_frete_internacional?.trim()

  const obsLimpa = observacoesUsuario?.trim() ?? ''
  if (!temLocais) return obsLimpa || null

  const bloco = `${MARCADOR_INICIO}${JSON.stringify(locais)}${MARCADOR_FIM}`
  return obsLimpa ? `${bloco}\n\n${obsLimpa}` : bloco
}

export function parseObservacoesPropostaComLocais(observacoes?: string | null): {
  locais: LocaisPropostaRespostaBidFrete
  observacoes: string
} {
  const bruto = observacoes ?? ''
  const regex = new RegExp(`${MARCADOR_INICIO}(\\{.*?\\})${MARCADOR_FIM}`, 's')
  const match = bruto.match(regex)
  if (!match) {
    return { locais: {}, observacoes: bruto.trim() }
  }

  let locais: LocaisPropostaRespostaBidFrete = {}
  try {
    locais = locaisPropostaRespostaSchema.parse(JSON.parse(match[1] ?? '{}'))
  } catch {
    locais = {}
  }

  const observacoesLimpa = bruto.replace(regex, '').replace(/^\s*\n+/, '').trim()
  return { locais, observacoes: observacoesLimpa }
}

export interface LinhaLocalUtilizadoPropostaComprador {
  lado: 'origem' | 'destino'
  codigo: string
  rotulo: string
}

/** Extrai locais escolhidos pelo fornecedor e observações livres (sem marcador estruturado). */
export function montarExibicaoLocaisPropostaComprador(
  observacoes: string | null | undefined,
  resolverRotulo: (codigo: string) => string,
): {
  observacoesUsuario: string
  locaisUtilizados: LinhaLocalUtilizadoPropostaComprador[]
} {
  const { locais, observacoes: observacoesUsuario } = parseObservacoesPropostaComLocais(observacoes)
  const locaisUtilizados: LinhaLocalUtilizadoPropostaComprador[] = []

  const origem = locais.codigo_porto_aeroporto_origem_proposta_bid_frete_internacional?.trim()
  if (origem) {
    locaisUtilizados.push({ lado: 'origem', codigo: origem, rotulo: resolverRotulo(origem) })
  }

  const destino = locais.codigo_porto_aeroporto_destino_proposta_bid_frete_internacional?.trim()
  if (destino) {
    locaisUtilizados.push({ lado: 'destino', codigo: destino, rotulo: resolverRotulo(destino) })
  }

  return { observacoesUsuario, locaisUtilizados }
}
