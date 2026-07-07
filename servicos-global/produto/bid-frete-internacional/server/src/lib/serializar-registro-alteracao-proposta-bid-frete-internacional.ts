/**
 * Serialização de registros de alteração de proposta para respostas da API.
 */
import type { ItemAlteracaoPropostaBidFreteInternacional } from '../../../shared/alteracao-proposta-bid-frete-internacional.js'

export interface RegistroAlteracaoPropostaApiBidFreteInternacional {
  id_registro_alteracao_proposta_bid_frete_internacional: string
  id_proposta_bid_frete_internacional: string
  id_cotacao_bid_frete_internacional: string
  tipo_registro_alteracao_proposta_bid_frete_internacional: 'CRIAR' | 'ATUALIZAR'
  origem_registro_alteracao_proposta_bid_frete_internacional: 'PORTAL' | 'LINK_PUBLICO'
  alteracoes_registro_alteracao_proposta_bid_frete_internacional: ItemAlteracaoPropostaBidFreteInternacional[]
  data_registro_alteracao_proposta_bid_frete_internacional: string
}

export function serializarRegistroAlteracaoPropostaBidFreteInternacional(
  registro: Record<string, unknown>,
): RegistroAlteracaoPropostaApiBidFreteInternacional {
  const alteracoesRaw = registro.alteracoes_registro_alteracao_proposta_bid_frete_internacional
  const alteracoes = Array.isArray(alteracoesRaw)
    ? (alteracoesRaw as ItemAlteracaoPropostaBidFreteInternacional[])
    : []

  const dataRegistro = registro.data_registro_alteracao_proposta_bid_frete_internacional
  const dataIso =
    dataRegistro instanceof Date
      ? dataRegistro.toISOString()
      : String(dataRegistro ?? new Date().toISOString())

  return {
    id_registro_alteracao_proposta_bid_frete_internacional: String(
      registro.id_registro_alteracao_proposta_bid_frete_internacional,
    ),
    id_proposta_bid_frete_internacional: String(registro.id_proposta_bid_frete_internacional),
    id_cotacao_bid_frete_internacional: String(registro.id_cotacao_bid_frete_internacional),
    tipo_registro_alteracao_proposta_bid_frete_internacional: String(
      registro.tipo_registro_alteracao_proposta_bid_frete_internacional,
    ) as 'CRIAR' | 'ATUALIZAR',
    origem_registro_alteracao_proposta_bid_frete_internacional: String(
      registro.origem_registro_alteracao_proposta_bid_frete_internacional,
    ) as 'PORTAL' | 'LINK_PUBLICO',
    alteracoes_registro_alteracao_proposta_bid_frete_internacional: alteracoes,
    data_registro_alteracao_proposta_bid_frete_internacional: dataIso,
  }
}

export async function carregarRegistrosAlteracaoPorCotacao(
  prisma: { registroAlteracaoPropostaBidFreteInternacional?: { findMany: Function } },
  id_cotacao_bid_frete_internacional: string,
): Promise<RegistroAlteracaoPropostaApiBidFreteInternacional[]> {
  const registros = await (prisma as any).registroAlteracaoPropostaBidFreteInternacional.findMany({
    where: { id_cotacao_bid_frete_internacional },
    orderBy: { data_registro_alteracao_proposta_bid_frete_internacional: 'desc' },
  })
  return (registros as Record<string, unknown>[]).map(serializarRegistroAlteracaoPropostaBidFreteInternacional)
}

export async function carregarUltimoRegistroAlteracaoProposta(
  prisma: { registroAlteracaoPropostaBidFreteInternacional?: { findFirst: Function } },
  id_proposta_bid_frete_internacional: string,
): Promise<RegistroAlteracaoPropostaApiBidFreteInternacional | null> {
  const registro = await (prisma as any).registroAlteracaoPropostaBidFreteInternacional.findFirst({
    where: { id_proposta_bid_frete_internacional },
    orderBy: { data_registro_alteracao_proposta_bid_frete_internacional: 'desc' },
  })
  if (!registro) return null
  return serializarRegistroAlteracaoPropostaBidFreteInternacional(registro as Record<string, unknown>)
}
