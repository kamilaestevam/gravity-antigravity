/**
 * Layout HTML compartilhado — e-mails ao comprador (BID Frete Internacional).
 * Paridade visual com formatar-email-disparo-bid-frete-internacional.
 */

import { escapeHtmlTextoEmailBidFrete } from './formatar-email-disparo-bid-frete-internacional.js'

const COR_INDIGO = '#4F46E5'
const COR_TEXTO = '#0f172a'
const COR_MUTED = '#64748b'
const COR_BORDA = '#e2e8f0'
const COR_FUNDO = '#f8fafc'

export type LinhaResumoEmailCompradorBidFreteInternacional = [rotulo: string, valor: string]

export type LinhaFornecedorDisparoEmailCompradorBidFreteInternacional = {
  nomeFornecedor: string
  canal: string
  dataHoraEnvio?: string | Date | null
  status: 'ENVIADO' | 'ERRO_ENVIO'
}

const COR_SUCESSO_FUNDO = '#dcfce7'
const COR_SUCESSO_TEXTO = '#166534'
const COR_ERRO_FUNDO = '#fee2e2'
const COR_ERRO_TEXTO = '#991b1b'
const COR_CABECALHO_FUNDO = '#eef2ff'

export function linhaTabelaResumoEmailCompradorBidFreteInternacional(
  rotulo: string,
  valor: string,
): string {
  return `
    <tr>
      <td style="padding:10px 14px;color:${COR_MUTED};font-size:13px;width:38%;vertical-align:top;border-bottom:1px solid ${COR_BORDA};">${escapeHtmlTextoEmailBidFrete(rotulo)}</td>
      <td style="padding:10px 14px;color:${COR_TEXTO};font-size:14px;font-weight:500;vertical-align:top;border-bottom:1px solid ${COR_BORDA};">${escapeHtmlTextoEmailBidFrete(valor)}</td>
    </tr>`
}

function rotuloCanalDisparoEmailCompradorBidFreteInternacional(canal: string): string {
  if (canal === 'WHATSAPP') return 'WhatsApp'
  if (canal === 'EMAIL') return 'E-mail'
  return canal.trim() || '—'
}

function montarBadgeStatusDisparoEmailCompradorBidFreteInternacional(
  status: LinhaFornecedorDisparoEmailCompradorBidFreteInternacional['status'],
): string {
  if (status === 'ENVIADO') {
    return `<span style="display:inline-block;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:600;background:${COR_SUCESSO_FUNDO};color:${COR_SUCESSO_TEXTO};">Enviado</span>`
  }
  return `<span style="display:inline-block;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:600;background:${COR_ERRO_FUNDO};color:${COR_ERRO_TEXTO};">Falha</span>`
}

export function montarTabelaFornecedoresDisparoEmailCompradorBidFreteInternacional(input: {
  titulo: string
  linhas: LinhaFornecedorDisparoEmailCompradorBidFreteInternacional[]
  formatarDataHora: (valor: string | Date | null | undefined) => string
}): string {
  if (input.linhas.length === 0) return ''

  const corpo = input.linhas
    .map((linha, indice) => {
      const fundo = indice % 2 === 0 ? '#ffffff' : COR_FUNDO
      return `
    <tr style="background:${fundo};">
      <td style="padding:10px 12px;color:${COR_TEXTO};font-size:13px;font-weight:500;border-bottom:1px solid ${COR_BORDA};">${escapeHtmlTextoEmailBidFrete(linha.nomeFornecedor.trim() || '—')}</td>
      <td style="padding:10px 12px;color:${COR_MUTED};font-size:13px;border-bottom:1px solid ${COR_BORDA};">${escapeHtmlTextoEmailBidFrete(rotuloCanalDisparoEmailCompradorBidFreteInternacional(linha.canal))}</td>
      <td style="padding:10px 12px;color:${COR_TEXTO};font-size:13px;white-space:nowrap;border-bottom:1px solid ${COR_BORDA};">${escapeHtmlTextoEmailBidFrete(input.formatarDataHora(linha.dataHoraEnvio))}</td>
      <td style="padding:10px 12px;border-bottom:1px solid ${COR_BORDA};">${montarBadgeStatusDisparoEmailCompradorBidFreteInternacional(linha.status)}</td>
    </tr>`
    })
    .join('')

  return `
              <p style="margin:0 0 10px;font-size:14px;font-weight:600;color:${COR_TEXTO};">${escapeHtmlTextoEmailBidFrete(input.titulo)}</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;border:1px solid ${COR_BORDA};border-radius:8px;overflow:hidden;">
                <tr style="background:${COR_CABECALHO_FUNDO};">
                  <th align="left" style="padding:10px 12px;color:${COR_MUTED};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;border-bottom:1px solid ${COR_BORDA};">Fornecedor</th>
                  <th align="left" style="padding:10px 12px;color:${COR_MUTED};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;border-bottom:1px solid ${COR_BORDA};">Canal</th>
                  <th align="left" style="padding:10px 12px;color:${COR_MUTED};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;border-bottom:1px solid ${COR_BORDA};">Enviado em</th>
                  <th align="left" style="padding:10px 12px;color:${COR_MUTED};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;border-bottom:1px solid ${COR_BORDA};">Status</th>
                </tr>
                ${corpo}
              </table>`
}

export function montarTabelaResumoEmailCompradorBidFreteInternacional(
  linhas: LinhaResumoEmailCompradorBidFreteInternacional[],
): string {
  if (linhas.length === 0) return ''
  const tabelaLinhas = linhas
    .map(([rotulo, valor]) => linhaTabelaResumoEmailCompradorBidFreteInternacional(rotulo, valor))
    .join('')
  return `
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;border:1px solid ${COR_BORDA};border-radius:8px;overflow:hidden;">
                ${tabelaLinhas}
              </table>`
}

export type ParametrosLayoutEmailCompradorBidFreteInternacional = {
  assunto: string
  preheader: string
  subtituloHeader: string
  nomeComprador: string
  introHtml: string
  linhasResumo?: LinhaResumoEmailCompradorBidFreteInternacional[]
  textoPosResumoHtml?: string
  rotuloBotao: string
  linkAcao: string
  rodapeExtraHtml?: string
}

export function montarHtmlLayoutEmailCompradorBidFreteInternacional(
  params: ParametrosLayoutEmailCompradorBidFreteInternacional,
): string {
  const link = escapeHtmlTextoEmailBidFrete(params.linkAcao)
  const tabela = montarTabelaResumoEmailCompradorBidFreteInternacional(params.linhasResumo ?? [])
  const posResumo = params.textoPosResumoHtml ?? ''
  const rodapeExtra = params.rodapeExtraHtml ?? ''

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtmlTextoEmailBidFrete(params.assunto)}</title>
</head>
<body style="margin:0;padding:0;background:${COR_FUNDO};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtmlTextoEmailBidFrete(params.preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${COR_FUNDO};padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:12px;border:1px solid ${COR_BORDA};overflow:hidden;">
          <tr>
            <td style="padding:28px 28px 20px;background:linear-gradient(135deg,#312e81 0%,${COR_INDIGO} 100%);">
              <p style="margin:0 0 6px;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">Gravity</p>
              <p style="margin:0;font-size:15px;color:#e0e7ff;">${escapeHtmlTextoEmailBidFrete(params.subtituloHeader)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <p style="margin:0 0 8px;font-size:16px;color:${COR_TEXTO};">Olá, <strong>${escapeHtmlTextoEmailBidFrete(params.nomeComprador.trim())}</strong>,</p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.5;color:${COR_MUTED};">
                ${params.introHtml}
              </p>
              ${tabela}
              ${posResumo}
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 20px;">
                <tr>
                  <td style="border-radius:8px;background:${COR_INDIGO};">
                    <a href="${link}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">${escapeHtmlTextoEmailBidFrete(params.rotuloBotao)}</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:${COR_MUTED};word-break:break-all;">
                Se o botão não funcionar, copie e cole este link no navegador:<br />
                <a href="${link}" style="color:${COR_INDIGO};">${link}</a>
              </p>
              ${rodapeExtra}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px;background:${COR_FUNDO};border-top:1px solid ${COR_BORDA};">
              <p style="margin:0;font-size:12px;line-height:1.5;color:${COR_MUTED};">
                Este e-mail foi enviado automaticamente. Não responda.<br />
                Enviado por Gravity · BID Frete Internacional
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function montarRodapeTextoPlanoEmailCompradorBidFreteInternacional(
  rotuloBotao: string,
  linkAcao: string,
): string[] {
  return [
    '',
    `${rotuloBotao}:`,
    linkAcao,
    '',
    'Este e-mail foi enviado automaticamente. Não responda.',
    '',
    '— Equipe Gravity · BID Frete Internacional',
  ]
}
