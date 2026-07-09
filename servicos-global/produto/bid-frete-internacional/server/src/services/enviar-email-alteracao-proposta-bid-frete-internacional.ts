/**
 * Envia e-mail de confirmação ao fornecedor (criação ou alteração de proposta).
 */
import axios from 'axios'
import {
  montarAssuntoEmailAlteracaoProposta,
  montarHtmlEmailAlteracaoProposta,
  montarTextoPlanoEmailAlteracaoProposta,
} from '../../../shared/formatar-email-alteracao-proposta-bid-frete-internacional.js'
import type { ItemAlteracaoPropostaBidFreteInternacional } from '../../../shared/alteracao-proposta-bid-frete-internacional.js'
import { montarLinkRespostaDisparo } from './motor-bid-disparo-utils.js'

const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL ?? 'http://localhost:8008'
const INTERNAL_KEY = process.env.CHAVE_INTERNA_SERVICO ?? ''
const APP_URL = process.env.APP_URL ?? 'http://localhost:5173'

export async function enviarEmailAlteracaoPropostaBidFreteInternacional(opcoes: {
  id_organizacao: string
  id_usuario?: string | null
  email_destino: string
  numero_cotacao: string
  nome_fornecedor: string
  token_resposta: string
  tipo: 'criar' | 'atualizar'
  moeda: string
  alteracoes: ItemAlteracaoPropostaBidFreteInternacional[]
}): Promise<void> {
  const email = opcoes.email_destino.trim()
  if (!email || !INTERNAL_KEY) return

  const linkResposta = montarLinkRespostaDisparo(APP_URL, opcoes.token_resposta)
  const params = {
    numeroCotacao: opcoes.numero_cotacao,
    nomeFornecedor: opcoes.nome_fornecedor,
    tipo: opcoes.tipo,
    moeda: opcoes.moeda,
    alteracoes: opcoes.alteracoes,
    linkResposta,
  }

  try {
    await axios.post(
      `${EMAIL_SERVICE_URL}/api/v1/envios-email`,
      {
        to: email,
        subject: montarAssuntoEmailAlteracaoProposta(params),
        body_html: montarHtmlEmailAlteracaoProposta(params),
        body: montarTextoPlanoEmailAlteracaoProposta(params),
        product_id: 'bid-frete-internacional',
      },
      {
        headers: {
          'x-chave-interna-servico': INTERNAL_KEY,
          'x-id-organizacao': opcoes.id_organizacao,
          'x-id-usuario': opcoes.id_usuario ?? 'system',
          'Content-Type': 'application/json',
        },
        timeout: 15000,
        validateStatus: () => true,
      },
    )
  } catch (err: unknown) {
    console.warn(
      '[BidFrete] Falha e-mail alteração proposta:',
      err instanceof Error ? err.message : 'erro',
    )
  }
}
