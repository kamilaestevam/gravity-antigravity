/**
 * Persiste registro append-only de alteração de proposta.
 */
import type { PrismaClient } from '@prisma/client'
import {
  calcularAlteracoesSnapshotProposta,
  extrairSnapshotPropostaAlteracao,
  type ItemAlteracaoPropostaBidFreteInternacional,
  type SnapshotPropostaAlteracaoBidFreteInternacional,
} from '../../../shared/alteracao-proposta-bid-frete-internacional.js'

export type TipoRegistroAlteracaoProposta = 'CRIAR' | 'ATUALIZAR'
export type OrigemRegistroAlteracaoProposta = 'PORTAL' | 'LINK_PUBLICO'

export interface ResultadoRegistroAlteracaoProposta {
  id_registro_alteracao_proposta_bid_frete_internacional: string
  tipo: TipoRegistroAlteracaoProposta
  alteracoes: ItemAlteracaoPropostaBidFreteInternacional[]
  snapshot_depois: SnapshotPropostaAlteracaoBidFreteInternacional
}

export async function registrarAlteracaoPropostaBidFreteInternacional(
  prisma: PrismaClient,
  opcoes: {
    id_organizacao: string
    id_produto_gravity?: string | null
    id_proposta_bid_frete_internacional: string
    id_cotacao_bid_frete_internacional: string
    tipo: TipoRegistroAlteracaoProposta
    origem: OrigemRegistroAlteracaoProposta
    propostaAntes?: Record<string, unknown> | null
    propostaDepois: Record<string, unknown>
  },
): Promise<ResultadoRegistroAlteracaoProposta> {
  const snapshotDepois = extrairSnapshotPropostaAlteracao(opcoes.propostaDepois)
  const snapshotAntes = opcoes.propostaAntes
    ? extrairSnapshotPropostaAlteracao(opcoes.propostaAntes)
    : null

  const alteracoes =
    snapshotAntes && opcoes.tipo === 'ATUALIZAR'
      ? calcularAlteracoesSnapshotProposta(snapshotAntes, snapshotDepois)
      : calcularAlteracoesSnapshotProposta(
          {
            moeda_proposta_bid_frete_internacional: snapshotDepois.moeda_proposta_bid_frete_internacional,
            valor_frete_proposta_bid_frete_internacional: 0,
            taxas_origem_proposta_bid_frete_internacional: 0,
            taxas_destino_proposta_bid_frete_internacional: 0,
            valor_total_proposta_bid_frete_internacional: 0,
            dias_transito_proposta_bid_frete_internacional: 0,
          },
          snapshotDepois,
        )

  const registro = await (prisma as any).registroAlteracaoPropostaBidFreteInternacional.create({
    data: {
      id_organizacao: opcoes.id_organizacao,
      id_produto_gravity: opcoes.id_produto_gravity ?? 'bid-frete-internacional',
      id_proposta_bid_frete_internacional: opcoes.id_proposta_bid_frete_internacional,
      id_cotacao_bid_frete_internacional: opcoes.id_cotacao_bid_frete_internacional,
      tipo_registro_alteracao_proposta_bid_frete_internacional: opcoes.tipo,
      origem_registro_alteracao_proposta_bid_frete_internacional: opcoes.origem,
      snapshot_antes_registro_alteracao_proposta_bid_frete_internacional: snapshotAntes,
      snapshot_depois_registro_alteracao_proposta_bid_frete_internacional: snapshotDepois,
      alteracoes_registro_alteracao_proposta_bid_frete_internacional: alteracoes,
    },
  })

  return {
    id_registro_alteracao_proposta_bid_frete_internacional:
      registro.id_registro_alteracao_proposta_bid_frete_internacional,
    tipo: opcoes.tipo,
    alteracoes,
    snapshot_depois: snapshotDepois,
  }
}
