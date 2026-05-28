/**
 * Utilitários do motor de disparo — link público e corpo do e-mail.
 * Exportados para testes unitários e reutilização pelo motor.
 */

export function montarLinkRespostaDisparo(appUrl: string, token: string): string {
  const base = appUrl.replace(/\/$/, '')
  return `${base}/produto/bid-frete-internacional/visao-fornecedor-bid-frete-internacional/publico/${token}`
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

  return `
    <h2>Solicitação de Cotação de Frete Internacional</h2>
    <p>Prezado(a) ${nomeFornecedor},</p>
    <p>Recebemos uma solicitação de cotação com os seguintes dados:</p>
    <ul>
      <li><strong>Número:</strong> ${numeroCotacao}</li>
      <li><strong>Modal:</strong> ${modal}</li>
      <li><strong>Origem:</strong> ${origemNome} (${origemPais})</li>
      <li><strong>Destino:</strong> ${destinoNome} (${destinoPais})</li>
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
