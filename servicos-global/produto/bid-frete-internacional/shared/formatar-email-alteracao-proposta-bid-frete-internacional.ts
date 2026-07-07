/**
 * E-mail de confirmação — proposta criada ou alterada (fornecedor externo).
 */

import type { ItemAlteracaoPropostaBidFreteInternacional } from './alteracao-proposta-bid-frete-internacional.js'
import { montarLinhasTextoAlteracaoProposta } from './alteracao-proposta-bid-frete-internacional.js'

export interface ParametrosEmailAlteracaoPropostaBidFreteInternacional {
  numeroCotacao: string
  nomeFornecedor: string
  tipo: 'criar' | 'atualizar'
  moeda: string
  alteracoes: ItemAlteracaoPropostaBidFreteInternacional[]
  linkResposta: string
}

export function montarAssuntoEmailAlteracaoProposta(
  params: ParametrosEmailAlteracaoPropostaBidFreteInternacional,
): string {
  if (params.tipo === 'criar') {
    return `Proposta enviada — ${params.numeroCotacao}`
  }
  return `Proposta atualizada — ${params.numeroCotacao}`
}

export function montarTextoPlanoEmailAlteracaoProposta(
  params: ParametrosEmailAlteracaoPropostaBidFreteInternacional,
): string {
  const linhasAlteracao = montarLinhasTextoAlteracaoProposta(params.alteracoes, params.moeda)
  const intro =
    params.tipo === 'criar'
      ? `Sua proposta para a cotação ${params.numeroCotacao} foi registrada com sucesso.`
      : `Você alterou sua proposta para a cotação ${params.numeroCotacao}.`

  const corpoAlteracoes =
    linhasAlteracao.length > 0
      ? `\n\nValores:\n${linhasAlteracao.map(l => `- ${l}`).join('\n')}`
      : ''

  return (
    `${intro}${corpoAlteracoes}\n\n` +
    `Link para revisar ou editar (enquanto o prazo estiver aberto):\n${params.linkResposta}\n\n` +
    '— Gravity · Bid Frete Internacional'
  )
}

export function montarHtmlEmailAlteracaoProposta(
  params: ParametrosEmailAlteracaoPropostaBidFreteInternacional,
): string {
  const linhasAlteracao = montarLinhasTextoAlteracaoProposta(params.alteracoes, params.moeda)
  const titulo =
    params.tipo === 'criar' ? 'Proposta registrada' : 'Proposta atualizada'
  const intro =
    params.tipo === 'criar'
      ? `Sua proposta para <strong>${params.numeroCotacao}</strong> foi registrada.`
      : `Você alterou sua proposta para <strong>${params.numeroCotacao}</strong>.`

  const lista =
    linhasAlteracao.length > 0
      ? `<ul style="margin:16px 0;padding-left:20px;">${linhasAlteracao
          .map(l => `<li style="margin:6px 0;">${l}</li>`)
          .join('')}</ul>`
      : ''

  return `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;color:#1e293b;line-height:1.5;">
<p style="font-size:18px;font-weight:700;color:#4f46e5;">${titulo}</p>
<p>${intro}</p>
${lista}
<p style="margin-top:24px;">
<a href="${params.linkResposta}" style="display:inline-block;background:#4f46e5;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600;">
Abrir cotação
</a>
</p>
<p style="font-size:12px;color:#64748b;margin-top:32px;">Gravity · Bid Frete Internacional</p>
</body></html>`
}
