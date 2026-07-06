/**
 * E-mail ao comprador quando o ganhador confirma "Recebi e estou de acordo".
 */

import { escapeHtmlTextoEmailBidFrete } from './formatar-email-disparo-bid-frete-internacional.js'

export type ParametrosEmailAceiteRecebidoCompradorBidFreteInternacional = {
  numeroCotacao: string
  nomeFornecedor: string
  nomeComprador: string
  dataAceite: Date
  linkComparativo: string
}

export function montarAssuntoEmailAceiteRecebidoCompradorBidFreteInternacional(
  numeroCotacao: string,
): string {
  return `Aceite confirmado — cotação ${numeroCotacao}`
}

export function montarTextoPlanoEmailAceiteRecebidoCompradorBidFreteInternacional(
  params: ParametrosEmailAceiteRecebidoCompradorBidFreteInternacional,
): string {
  const dataFmt = params.dataAceite.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  return [
    `Olá, ${params.nomeComprador},`,
    '',
    `O fornecedor ${params.nomeFornecedor} confirmou o recebimento da aprovação na cotação ${params.numeroCotacao}.`,
    `Data do aceite: ${dataFmt}`,
    '',
    'Você já pode confirmar o fechamento do frete na plataforma Gravity, se aplicável.',
    '',
    `Abrir comparativo: ${params.linkComparativo}`,
    '',
    'Gravity · Bid Frete Internacional',
  ].join('\n')
}

export function montarHtmlEmailAceiteRecebidoCompradorBidFreteInternacional(
  params: ParametrosEmailAceiteRecebidoCompradorBidFreteInternacional,
): string {
  const dataFmt = params.dataAceite.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  const numero = escapeHtmlTextoEmailBidFrete(params.numeroCotacao)
  const fornecedor = escapeHtmlTextoEmailBidFrete(params.nomeFornecedor)
  const comprador = escapeHtmlTextoEmailBidFrete(params.nomeComprador)
  const link = escapeHtmlTextoEmailBidFrete(params.linkComparativo)

  return `<!DOCTYPE html>
<html lang="pt-BR">
<body style="margin:0;padding:24px;font-family:Segoe UI,Arial,sans-serif;background:#0f172a;color:#e2e8f0;">
  <div style="max-width:560px;margin:0 auto;background:#1e293b;border-radius:12px;padding:28px;border:1px solid #334155;">
    <p style="margin:0 0 16px;font-size:15px;">Olá, <strong>${comprador}</strong>,</p>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#cbd5e1;">
      O fornecedor <strong>${fornecedor}</strong> confirmou o recebimento da aprovação na cotação
      <strong>${numero}</strong>.
    </p>
    <p style="margin:0 0 20px;font-size:14px;color:#94a3b8;">Aceite registrado em ${dataFmt}.</p>
    <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#cbd5e1;">
      Você já pode confirmar o fechamento do frete na plataforma, se aplicável.
    </p>
    <p style="margin:0;">
      <a href="${link}" style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;font-size:14px;">
        Abrir comparativo
      </a>
    </p>
  </div>
</body>
</html>`
}
