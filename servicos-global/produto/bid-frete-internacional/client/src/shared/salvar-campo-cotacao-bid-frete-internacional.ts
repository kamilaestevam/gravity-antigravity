import { atualizarCotacao, mudarStatusCotacao } from './api'
import { resolverPatchEdicaoLocalizacao } from './lista-bid-frete-edicao-logistica'
import type { Cotacao, StatusCotacao } from './types'
import type { AeroportoCadastro, PortoCadastro } from './cadastrosApi'

/** Campos que não entram na edição inline (técnicos ou geridos pelo servidor). */
export const CAMPOS_NAO_EDITAVEIS_COTACAO = new Set([
  'id_cotacao_bid_frete_internacional',
  'data_atualizacao_cotacao_bid_frete_internacional',
])

export const CAMPOS_DATA_COTACAO = new Set([
  'data_limite_resposta_cotacao_bid_frete_internacional',
  'data_criacao_cotacao_bid_frete_internacional',
  'data_aprovacao_cotacao_bid_frete_internacional',
  'data_cancelamento_cotacao_bid_frete_internacional',
])

const CAMPOS_NUMERICOS_COTACAO = new Set([
  'quantidade_volume_cotacao_bid_frete_internacional',
  'peso_kg_cotacao_bid_frete_internacional',
  'cubagem_m3_cotacao_bid_frete_internacional',
  'ganho_percentual_cotacao_bid_frete_internacional',
])

/** Campos exibidos em Dados gerais que espelham a lista (edição compartilhada). */
export const CAMPOS_ESPELHO_PAINEL_DADOS_GERAIS = [
  'referencia_interna_cotacao_bid_frete_internacional',
  'status_cotacao_bid_frete_internacional',
  'data_criacao_cotacao_bid_frete_internacional',
  'data_limite_resposta_cotacao_bid_frete_internacional',
  'data_aprovacao_cotacao_bid_frete_internacional',
  'data_cancelamento_cotacao_bid_frete_internacional',
] as const

export type CampoEspelhoPainelDadosGerais = (typeof CAMPOS_ESPELHO_PAINEL_DADOS_GERAIS)[number]

export function cotacaoCampoEditavel(campo: string): boolean {
  return !CAMPOS_NAO_EDITAVEIS_COTACAO.has(campo)
}

function normalizarDataIsoEdicao(valor: unknown): string | null {
  if (valor == null || valor === '') return null
  if (typeof valor === 'string') {
    const soData = valor.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (soData) {
      return new Date(
        Date.UTC(Number(soData[1]), Number(soData[2]) - 1, Number(soData[3]), 12, 0, 0, 0),
      ).toISOString()
    }
    const parsed = new Date(valor)
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString()
    return valor
  }
  if (valor instanceof Date && !Number.isNaN(valor.getTime())) {
    return valor.toISOString()
  }
  return String(valor)
}

export function normalizarValorEdicaoCotacao(campo: string, valor: unknown): unknown {
  if (campo === 'anonima_cotacao_bid_frete_internacional') {
    if (typeof valor === 'boolean') return valor
    return valor === true || valor === 'true' || valor === 'Sim'
  }
  if (CAMPOS_DATA_COTACAO.has(campo)) {
    return normalizarDataIsoEdicao(valor)
  }
  if (CAMPOS_NUMERICOS_COTACAO.has(campo)) {
    if (valor == null || valor === '') return null
    const n =
      typeof valor === 'number'
        ? valor
        : Number(String(valor).replace(/\./g, '').replace(',', '.'))
    return Number.isFinite(n) ? n : null
  }
  if (valor === '' || valor === '—') return null
  return valor
}

export interface SalvarCampoCotacaoBidFreteParams {
  id: string
  campo: string
  valor: unknown
  cotacaoAtual: Cotacao
  portosCadastro?: PortoCadastro[]
  aeroportosCadastro?: AeroportoCadastro[]
}

/** Mesma regra de persistência da lista (inline) — fonte única para lista e Dados gerais. */
export async function salvarCampoCotacaoBidFreteInternacional({
  id,
  campo,
  valor,
  cotacaoAtual,
  portosCadastro = [],
  aeroportosCadastro = [],
}: SalvarCampoCotacaoBidFreteParams): Promise<Cotacao> {
  const patchLocalizacao = resolverPatchEdicaoLocalizacao(
    cotacaoAtual,
    campo,
    normalizarValorEdicaoCotacao(campo, valor),
    portosCadastro,
    aeroportosCadastro,
  )

  if (campo === 'status_cotacao_bid_frete_internacional') {
    return mudarStatusCotacao(id, normalizarValorEdicaoCotacao(campo, valor) as StatusCotacao)
  }

  if (
    valor != null &&
    typeof valor === 'object' &&
    'currency' in (valor as object) &&
    (campo === 'valor_meta_cotacao_bid_frete_internacional'
      || campo === 'ganho_valor_cotacao_bid_frete_internacional')
  ) {
    const mv = valor as { currency: string; amount: number }
    const amount = typeof mv.amount === 'number' ? mv.amount : Number(mv.amount)
    const valorNumerico = Number.isFinite(amount) && amount > 0 ? amount : null
    if (campo === 'valor_meta_cotacao_bid_frete_internacional') {
      return atualizarCotacao(id, {
        moeda_meta_cotacao_bid_frete_internacional: String(mv.currency || 'USD'),
        valor_meta_cotacao_bid_frete_internacional: valorNumerico,
      })
    }
    return atualizarCotacao(id, {
      ganho_valor_cotacao_bid_frete_internacional: valorNumerico,
    })
  }

  if (patchLocalizacao) {
    return atualizarCotacao(id, patchLocalizacao)
  }

  return atualizarCotacao(id, {
    [campo]: normalizarValorEdicaoCotacao(campo, valor),
  } as Partial<Cotacao>)
}
