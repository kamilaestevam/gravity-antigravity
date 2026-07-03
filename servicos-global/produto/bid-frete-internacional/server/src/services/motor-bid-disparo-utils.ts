/**
 * Utilitários do motor de disparo — link público e corpo do e-mail.
 * Exportados para testes unitários e reutilização pelo motor.
 */

import axios from 'axios'

/** Paridade com worker de notificações (Hub) — SSOT de resolução S2S do serviço de e-mail. */
export function resolverUrlServicoEmailDisparoBidFrete(): string {
  return (
    process.env.EMAIL_SERVICE_URL?.trim()
    || process.env.TENANT_EMAIL_SERVICE_URL?.trim()
    || process.env.SERVIDOR_PLATAFORMA_URL?.trim()
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

export function montarAssuntoEmailDisparo(numeroCotacao: string): string {
  return `Solicitação de Cotação de Frete — ${numeroCotacao}`
}

export function montarHtmlEmailDisparo(params: {
  nomeFornecedor: string
  numeroCotacao: string
  modal: string
  origemNome: string
  origemPais: string
  destinoNome: string
  destinoPais: string
  opcoesOrigemTexto?: string | null
  opcoesDestinoTexto?: string | null
  mercadoria: string
  incoterm: string
  tipoContainer?: string | null
  quantidade?: number | null
  pesoKg?: number | null
  dataLimiteResposta?: string | null
  linkResposta: string
}): string {
  const {
    nomeFornecedor,
    numeroCotacao,
    modal,
    origemNome,
    origemPais,
    destinoNome,
    destinoPais,
    opcoesOrigemTexto,
    opcoesDestinoTexto,
    mercadoria,
    incoterm,
    tipoContainer,
    quantidade,
    pesoKg,
    dataLimiteResposta,
    linkResposta,
  } = params

  const prazoHtml = dataLimiteResposta
    ? `<li><strong>Prazo de resposta:</strong> ${new Date(dataLimiteResposta).toLocaleDateString('pt-BR')}</li>`
    : ''
  const containerHtml =
    tipoContainer && quantidade
      ? `<li><strong>Container:</strong> ${quantidade}x ${tipoContainer}</li>`
      : ''
  const pesoHtml = pesoKg ? `<li><strong>Peso:</strong> ${pesoKg} kg</li>` : ''
  const opcoesOrigemHtml = opcoesOrigemTexto
    ? `<li><strong>Portos/aeroportos alternativos aceitos (origem):</strong> ${opcoesOrigemTexto}</li>`
    : ''
  const opcoesDestinoHtml = opcoesDestinoTexto
    ? `<li><strong>Portos/aeroportos alternativos aceitos (destino):</strong> ${opcoesDestinoTexto}</li>`
    : ''

  return `
    <h2>Solicitação de Cotação de Frete Internacional</h2>
    <p>Prezado(a) ${nomeFornecedor},</p>
    <p>Recebemos uma solicitação de cotação com os seguintes dados:</p>
    <ul>
      <li><strong>Número:</strong> ${numeroCotacao}</li>
      <li><strong>Modal:</strong> ${modal}</li>
      <li><strong>Origem:</strong> ${origemNome} (${origemPais})</li>
      ${opcoesOrigemHtml}
      <li><strong>Destino:</strong> ${destinoNome} (${destinoPais})</li>
      ${opcoesDestinoHtml}
      <li><strong>Mercadoria:</strong> ${mercadoria}</li>
      <li><strong>Incoterm:</strong> ${incoterm}</li>
      ${containerHtml}
      ${pesoHtml}
      ${prazoHtml}
    </ul>
    <p><a href="${linkResposta}" style="background:#4F46E5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">Responder cotação</a></p>
    <p>Ou acesse o portal para ver todas as cotações pendentes.</p>
  `
}
