/**
 * Utilitários do motor de disparo — link público e corpo do e-mail.
 * Exportados para testes unitários e reutilização pelo motor.
 */

import axios from 'axios'
export {
  montarAssuntoEmailDisparo,
  montarHtmlEmailDisparo,
  montarTextoPlanoEmailDisparo,
  type ParametrosEmailDisparoBidFreteInternacional,
} from '../../../shared/formatar-email-disparo-bid-frete-internacional.js'

/** Paridade com worker de notificações (Hub) — SSOT de resolução S2S do serviço de e-mail. */
export function resolverUrlServicoEmailDisparoBidFrete(): string {
  // Sidecar embutido no site-usegravity — sempre loopback (ignora URL externa legada no Railway).
  if (process.env.BID_FRETE_SIDECAR === '1') {
    return 'http://127.0.0.1:8008'
  }
  // TENANT_EMAIL antes de EMAIL: .env legado do produto às vezes aponta :3001 (org) por engano.
  return (
    process.env.TENANT_EMAIL_SERVICE_URL?.trim()
    || process.env.EMAIL_SERVICE_URL?.trim()
    || 'http://127.0.0.1:8008'
  )
}

export function extrairMensagemErroDisparo(
  err: unknown,
  emailServiceUrl = resolverUrlServicoEmailDisparoBidFrete(),
): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: { message?: string }; message?: string } | undefined
    const apiMsg = data?.error?.message ?? data?.message
    if (apiMsg) return `Falha ao enviar e-mail: ${apiMsg}`
    if (err.code === 'ECONNREFUSED') {
      return `Serviço de e-mail indisponível em ${emailServiceUrl} (ECONNREFUSED)`
    }
    if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
      return `Serviço de e-mail não respondeu a tempo (${emailServiceUrl}) — verifique se está rodando e se RESEND_API_KEY está configurada`
    }
    return err.message?.trim() || 'Falha de rede ao chamar serviço de e-mail'
  }
  if (err instanceof Error) {
    const msg = err.message.trim()
    return msg || 'Erro desconhecido ao enviar disparo'
  }
  const text = String(err).trim()
  return text || 'Erro desconhecido ao enviar disparo'
}

export function montarLinkRespostaDisparo(appUrl: string, token: string): string {
  const base = appUrl.replace(/\/$/, '')
  return `${base}/bid-frete/visao-fornecedor-bid-frete-internacional/publico/${token}`
}
