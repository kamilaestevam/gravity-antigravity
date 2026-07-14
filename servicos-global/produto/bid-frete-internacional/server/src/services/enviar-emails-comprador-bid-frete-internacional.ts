/**
 * E-mails transacionais ao comprador (preferências por usuário).
 */
import axios from 'axios'
import type { PrismaClient } from '@prisma/client'
import {
  montarAssuntoEmailDisparoCompradorBidFreteInternacional,
  montarHtmlEmailDisparoCompradorBidFreteInternacional,
  montarTextoPlanoEmailDisparoCompradorBidFreteInternacional,
  type ParametrosEmailDisparoCompradorBidFreteInternacional,
} from '../../../shared/formatar-email-disparo-comprador-bid-frete-internacional.js'
import {
  montarAssuntoEmailRespostaFornecedorCompradorBidFreteInternacional,
  montarHtmlEmailRespostaFornecedorCompradorBidFreteInternacional,
  montarTextoPlanoEmailRespostaFornecedorCompradorBidFreteInternacional,
  type ParametrosEmailRespostaFornecedorCompradorBidFreteInternacional,
} from '../../../shared/formatar-email-resposta-fornecedor-comprador-bid-frete-internacional.js'
import { REMETENTE_EMAIL_BID_FRETE_INTERNACIONAL } from '../../../shared/remetente-email-bid-frete-internacional.js'
import { lerPreferenciasNotificacaoBidFreteInternacional } from '../lib/ler-preferencias-notificacao-bid-frete-internacional.js'
import { resolverUsuarioOrganizacaoBidFreteInternacional } from '../lib/resolver-usuario-organizacao-bid-frete-internacional.js'

const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL ?? 'http://localhost:8008'
const INTERNAL_KEY = process.env.CHAVE_INTERNA_SERVICO ?? ''
const APP_URL = process.env.APP_URL ?? process.env.BID_FRETE_APP_URL ?? 'http://localhost:8000'

export function montarLinkDetalheCotacaoCompradorBidFreteInternacional(
  id_cotacao_bid_frete_internacional: string,
): string {
  return `${APP_URL.replace(/\/$/, '')}/bid-frete/cotacoes/${id_cotacao_bid_frete_internacional}`
}

async function postEmailCompradorBidFreteInternacional(input: {
  id_organizacao: string
  id_usuario: string
  email_destino: string
  subject: string
  body_html: string
  body: string
  metadata_tipo: string
  id_cotacao_bid_frete_internacional: string
}): Promise<void> {
  if (!input.email_destino.trim()) {
    console.warn('[email-comprador] E-mail destino vazio — envio omitido', {
      tipo: input.metadata_tipo,
      id_cotacao_bid_frete_internacional: input.id_cotacao_bid_frete_internacional,
    })
    return
  }
  if (!INTERNAL_KEY) {
    console.warn('[email-comprador] CHAVE_INTERNA_SERVICO ausente — envio omitido', {
      tipo: input.metadata_tipo,
      id_cotacao_bid_frete_internacional: input.id_cotacao_bid_frete_internacional,
    })
    return
  }

  const response = await axios.post(
    `${EMAIL_SERVICE_URL}/api/v1/envios-email`,
    {
      to: input.email_destino,
      subject: input.subject,
      body_html: input.body_html,
      body: input.body,
      product_id: 'bid-frete-internacional',
      from: REMETENTE_EMAIL_BID_FRETE_INTERNACIONAL,
      metadata: {
        produto: 'bid-frete-internacional',
        tipo: input.metadata_tipo,
        id_cotacao_bid_frete_internacional: input.id_cotacao_bid_frete_internacional,
      },
    },
    {
      headers: {
        'x-chave-interna-servico': INTERNAL_KEY,
        'x-id-organizacao': input.id_organizacao,
        'x-id-usuario': input.id_usuario,
        'Content-Type': 'application/json',
      },
      timeout: 25_000,
      validateStatus: () => true,
    },
  )

  if (response.status < 200 || response.status >= 300) {
    throw new Error(
      `Email service respondeu ${response.status}: ${JSON.stringify(response.data)}`,
    )
  }
}

export async function enviarEmailDisparoCompradorBidFreteInternacional(
  prisma: PrismaClient,
  input: {
    id_organizacao: string
    id_usuario: string
    id_cotacao_bid_frete_internacional: string
    quantidadeFornecedores: number
    parametros: Omit<
      ParametrosEmailDisparoCompradorBidFreteInternacional,
      'linkDetalheCotacao' | 'quantidadeFornecedores' | 'nomeComprador'
    >
  },
): Promise<void> {
  const prefs = await lerPreferenciasNotificacaoBidFreteInternacional(
    prisma,
    input.id_organizacao,
    input.id_usuario,
  )
  if (!prefs.email_envio_solicitacao_cotacao) {
    console.info('[email-comprador] Preferência desligada — confirmação de disparo omitida', {
      id_cotacao_bid_frete_internacional: input.id_cotacao_bid_frete_internacional,
      id_usuario: input.id_usuario,
    })
    return
  }

  const usuario = await resolverUsuarioOrganizacaoBidFreteInternacional(
    input.id_organizacao,
    input.id_usuario,
  )
  if (!usuario?.email_usuario) {
    console.warn('[email-comprador] E-mail do comprador não resolvido — confirmação de disparo omitida', {
      id_cotacao_bid_frete_internacional: input.id_cotacao_bid_frete_internacional,
      id_organizacao: input.id_organizacao,
      id_usuario: input.id_usuario,
    })
    return
  }

  const params: ParametrosEmailDisparoCompradorBidFreteInternacional = {
    ...input.parametros,
    nomeComprador: usuario.nome_usuario,
    quantidadeFornecedores: input.quantidadeFornecedores,
    linkDetalheCotacao: montarLinkDetalheCotacaoCompradorBidFreteInternacional(
      input.id_cotacao_bid_frete_internacional,
    ),
  }

  try {
    await postEmailCompradorBidFreteInternacional({
      id_organizacao: input.id_organizacao,
      id_usuario: input.id_usuario,
      email_destino: usuario.email_usuario,
      subject: montarAssuntoEmailDisparoCompradorBidFreteInternacional(params),
      body_html: montarHtmlEmailDisparoCompradorBidFreteInternacional(params),
      body: montarTextoPlanoEmailDisparoCompradorBidFreteInternacional(params),
      metadata_tipo: 'disparo_comprador',
      id_cotacao_bid_frete_internacional: input.id_cotacao_bid_frete_internacional,
    })
  } catch (err: unknown) {
    console.warn(
      '[email-comprador] Falha ao enviar confirmação de disparo:',
      err instanceof Error ? err.message : err,
    )
  }
}

export async function enviarEmailRespostaFornecedorCompradorBidFreteInternacional(
  prisma: PrismaClient,
  input: {
    id_organizacao: string
    id_usuario: string
    id_cotacao_bid_frete_internacional: string
    parametros: Omit<
      ParametrosEmailRespostaFornecedorCompradorBidFreteInternacional,
      'linkDetalheCotacao' | 'nomeComprador'
    >
  },
): Promise<void> {
  const prefs = await lerPreferenciasNotificacaoBidFreteInternacional(
    prisma,
    input.id_organizacao,
    input.id_usuario,
  )
  if (!prefs.email_resposta_fornecedor) return

  const usuario = await resolverUsuarioOrganizacaoBidFreteInternacional(
    input.id_organizacao,
    input.id_usuario,
  )
  if (!usuario?.email_usuario) return

  const params: ParametrosEmailRespostaFornecedorCompradorBidFreteInternacional = {
    ...input.parametros,
    nomeComprador: usuario.nome_usuario,
    linkDetalheCotacao: montarLinkDetalheCotacaoCompradorBidFreteInternacional(
      input.id_cotacao_bid_frete_internacional,
    ),
  }

  try {
    await postEmailCompradorBidFreteInternacional({
      id_organizacao: input.id_organizacao,
      id_usuario: input.id_usuario,
      email_destino: usuario.email_usuario,
      subject: montarAssuntoEmailRespostaFornecedorCompradorBidFreteInternacional(params),
      body_html: montarHtmlEmailRespostaFornecedorCompradorBidFreteInternacional(params),
      body: montarTextoPlanoEmailRespostaFornecedorCompradorBidFreteInternacional(params),
      metadata_tipo: 'resposta_fornecedor_comprador',
      id_cotacao_bid_frete_internacional: input.id_cotacao_bid_frete_internacional,
    })
  } catch (err: unknown) {
    console.warn(
      '[email-comprador] Falha ao enviar aviso de resposta do fornecedor:',
      err instanceof Error ? err.message : err,
    )
  }
}

export async function compradorDesejaEmailConfirmacaoFornecedorVencedor(
  prisma: PrismaClient,
  id_organizacao: string,
  id_usuario: string,
): Promise<boolean> {
  const prefs = await lerPreferenciasNotificacaoBidFreteInternacional(
    prisma,
    id_organizacao,
    id_usuario,
  )
  return prefs.email_confirmacao_fornecedor_vencedor
}
