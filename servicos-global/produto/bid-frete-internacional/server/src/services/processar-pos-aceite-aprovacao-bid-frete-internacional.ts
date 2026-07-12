/**
 * Pós-aceite do ganhador: notifica comprador (sininho + e-mail).
 */

import axios from 'axios'
import type { PrismaClient } from '../generated/client/index.js'
import { notificacoesIntegration, historicoIntegration } from './integracoes-tenant.js'
import { resolverUsuarioOrganizacaoBidFreteInternacional } from '../lib/resolver-usuario-organizacao-bid-frete-internacional.js'
import { nomeFornecedorGanhadorEstadoAceiteBidFreteInternacional } from '../../../shared/estado-aceite-ganhador-comparativo-bid-frete-internacional.js'
import {
  montarAssuntoEmailAceiteRecebidoCompradorBidFreteInternacional,
  montarHtmlEmailAceiteRecebidoCompradorBidFreteInternacional,
  montarTextoPlanoEmailAceiteRecebidoCompradorBidFreteInternacional,
} from '../../../shared/formatar-email-aceite-recebido-comprador-bid-frete-internacional.js'
import { REMETENTE_EMAIL_BID_FRETE_INTERNACIONAL } from '../../../shared/remetente-email-bid-frete-internacional.js'
import { compradorDesejaEmailConfirmacaoFornecedorVencedor } from './enviar-emails-comprador-bid-frete-internacional.js'

const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL ?? 'http://localhost:8008'
const INTERNAL_KEY = process.env.CHAVE_INTERNA_SERVICO ?? ''
const APP_URL = process.env.APP_URL ?? process.env.BID_FRETE_APP_URL ?? 'http://localhost:8023'

export async function processarPosAceiteAprovacaoBidFreteInternacional(input: {
  prisma: PrismaClient
  id_proposta_bid_frete_internacional: string
  data_aceite: Date
}): Promise<void> {
  const proposta = await (input.prisma as any).propostaBidFreteInternacional.findFirst({
    where: { id_proposta_bid_frete_internacional: input.id_proposta_bid_frete_internacional },
    include: {
      fornecedor: {
        select: { nome_fornecedor_bid_frete_internacional: true },
      },
      cotacao: {
        select: {
          id_cotacao_bid_frete_internacional: true,
          id_organizacao: true,
          numero_cotacao_bid_frete_internacional: true,
        },
      },
    },
  })

  if (!proposta?.cotacao?.id_organizacao) return

  const idOrganizacao = String(proposta.cotacao.id_organizacao)
  const idCotacao = String(proposta.cotacao.id_cotacao_bid_frete_internacional)
  const numeroCotacao = String(proposta.cotacao.numero_cotacao_bid_frete_internacional ?? idCotacao)
  const nomeFornecedor = nomeFornecedorGanhadorEstadoAceiteBidFreteInternacional({
    fornecedor: proposta.fornecedor,
  })

  const ganho = await (input.prisma as any).ganhoBidFreteInternacional.findFirst({
    where: { id_cotacao_bid_frete_internacional: idCotacao },
    orderBy: { data_criacao_ganho_bid_frete_internacional: 'desc' },
    select: { id_usuario: true },
  })
  const idUsuarioNotificar = ganho?.id_usuario ? String(ganho.id_usuario) : null

  if (!idUsuarioNotificar) {
    console.warn('[Aceite] id_usuario do aprovador não encontrado — notificação omitida', idCotacao)
    return
  }

  void notificacoesIntegration.aprovacaoRecebidaFornecedor(idOrganizacao, idUsuarioNotificar, {
    cotacao_numero: numeroCotacao,
    fornecedor_nome: nomeFornecedor,
    id_cotacao_bid_frete_internacional: idCotacao,
    data_aceite: input.data_aceite.toISOString(),
  })

  void historicoIntegration.aceiteAprovacaoRecebida(
    idOrganizacao,
    idUsuarioNotificar,
    { id: idCotacao, numero_cotacao_bid_frete_internacional: numeroCotacao },
    nomeFornecedor,
    input.data_aceite,
  )

  const usuario = await resolverUsuarioOrganizacaoBidFreteInternacional(idOrganizacao, idUsuarioNotificar)
  if (!usuario?.email_usuario || !INTERNAL_KEY) return

  const desejaEmail = await compradorDesejaEmailConfirmacaoFornecedorVencedor(
    input.prisma,
    idOrganizacao,
    idUsuarioNotificar,
  )
  if (!desejaEmail) return

  const linkComparativo = `${APP_URL.replace(/\/$/, '')}/bid-frete/cotacoes/${idCotacao}/comparativo`
  const paramsEmail = {
    numeroCotacao,
    nomeFornecedor,
    nomeComprador: usuario.nome_usuario,
    dataAceite: input.data_aceite,
    linkComparativo,
  }

  try {
    await axios.post(
      `${EMAIL_SERVICE_URL}/api/v1/envios-email`,
      {
        to: usuario.email_usuario,
        subject: montarAssuntoEmailAceiteRecebidoCompradorBidFreteInternacional(numeroCotacao),
        body_html: montarHtmlEmailAceiteRecebidoCompradorBidFreteInternacional(paramsEmail),
        body: montarTextoPlanoEmailAceiteRecebidoCompradorBidFreteInternacional(paramsEmail),
        product_id: 'bid-frete-internacional',
        from: REMETENTE_EMAIL_BID_FRETE_INTERNACIONAL,
        metadata: {
          produto: 'bid-frete-internacional',
          tipo: 'aceite_recebido_comprador',
          id_cotacao_bid_frete_internacional: idCotacao,
        },
      },
      {
        headers: {
          'x-chave-interna-servico': INTERNAL_KEY,
          'x-id-organizacao': idOrganizacao,
          'x-id-usuario': idUsuarioNotificar,
          'Content-Type': 'application/json',
        },
        timeout: 25_000,
      },
    )
  } catch (err: unknown) {
    console.warn(
      '[Aceite] Falha ao enviar e-mail ao comprador:',
      err instanceof Error ? err.message : err,
    )
  }
}
