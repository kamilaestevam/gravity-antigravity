/**
 * Utilitários do motor de disparo — link público e corpo do e-mail.
 * Template do e-mail: SSOT em shared/formatar-email-disparo-bid-frete-internacional.
 * Exportados para testes unitários e reutilização pelo motor.
 */

import axios from 'axios'
export {
  montarAssuntoEmailDisparo,
  montarHtmlEmailDisparo,
  montarTextoPlanoEmailDisparo,
  type ParametrosEmailDisparoBidFreteInternacional,
} from '../../../shared/formatar-email-disparo-bid-frete-internacional.js'

export function extrairMensagemErroDisparo(
  err: unknown,
  emailServiceUrl = process.env.EMAIL_SERVICE_URL ?? 'http://localhost:8008',
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
