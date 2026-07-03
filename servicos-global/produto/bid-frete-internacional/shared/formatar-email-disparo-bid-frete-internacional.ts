/**
 * Formatação do e-mail de disparo de cotação — SSOT server-side (sem i18n).
 * Paridade de rótulos com MAPAS_ROTULO_ENUM_IMPORTACAO_BID e tela pública.
 */

import { MAPAS_ROTULO_ENUM_IMPORTACAO_BID } from './template-importacao-config-bid-frete-internacional.js'
import type { ModalRotaCotacao } from './rota-cotacao-bid-frete-internacional.js'

const ROTULOS_MODAL = MAPAS_ROTULO_ENUM_IMPORTACAO_BID.modal_cotacao_bid_frete_internacional ?? {}
const ROTULOS_MODALIDADE = MAPAS_ROTULO_ENUM_IMPORTACAO_BID.modalidade_cotacao_bid_frete_internacional ?? {}

const ROTULOS_EMBALAGEM: Readonly<Record<string, string>> = {
  UNIDADE: 'Unidade (UN)',
  CAIXA: 'Caixa',
  PALLET: 'Palete / Pallet',
  VOLUME: 'Volume',
  FARDO: 'Fardo',
  SACO: 'Saco / Bag',
  TAMBOR: 'Tambor',
  BIG_BAG: 'Big Bag',
}

const COR_INDIGO = '#4F46E5'
const COR_TEXTO = '#0f172a'
const COR_MUTED = '#64748b'
const COR_BORDA = '#e2e8f0'
const COR_FUNDO = '#f8fafc'

export interface ParametrosEmailDisparoBidFreteInternacional {
  nomeFornecedor: string
  numeroCotacao: string
  modal: string
  modalidade?: string | null
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
  cubagemM3?: number | null
  dataLimiteResposta?: string | null
  dataExpiracaoToken?: string | Date | null
  nomeClienteOperacao?: string | null
  anonimaCotacao?: boolean
  linkResposta: string
}

export function escapeHtmlTextoEmailBidFrete(valor: string): string {
  return valor
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function rotuloModalEmailDisparoBidFrete(modal: string): string {
  const chave = modal.trim().toUpperCase()
  return ROTULOS_MODAL[chave] ?? modal
}

export function rotuloModalidadeEmailDisparoBidFrete(modalidade: string | null | undefined): string | null {
  if (!modalidade?.trim()) return null
  const chave = modalidade.trim().toUpperCase()
  return ROTULOS_MODALIDADE[chave] ?? modalidade.trim()
}

export function rotuloCampoVolumeEmailDisparoBidFrete(modal: string): string {
  const m = modal.trim().toUpperCase() as ModalRotaCotacao
  if (m === 'MARITIMO') return 'Container'
  if (m === 'AEREO') return 'Volume'
  return 'Embalagem'
}

function rotuloTipoVolumeEmailDisparo(modal: string, tipo: string | null | undefined): string {
  if (!tipo?.trim()) return '—'
  const codigo = tipo.trim().toUpperCase()
  if (ROTULOS_EMBALAGEM[codigo]) return ROTULOS_EMBALAGEM[codigo]
  return tipo.trim()
}

export function formatarLinhaVolumeEmailDisparoBidFrete(params: {
  modal: string
  tipoContainer?: string | null
  quantidade?: number | null
}): string | null {
  const { modal, tipoContainer, quantidade } = params
  if (!tipoContainer?.trim() || quantidade == null || quantidade <= 0) return null
  const tipo = rotuloTipoVolumeEmailDisparo(modal, tipoContainer)
  return `${quantidade.toLocaleString('pt-BR')}× ${tipo}`
}

export function formatarResumoCargaEmailDisparoBidFrete(params: {
  mercadoria: string
  quantidade?: number | null
  pesoKg?: number | null
  cubagemM3?: number | null
  linhaVolume?: string | null
}): string {
  const partes: string[] = []
  const mercadoria = params.mercadoria?.trim()
  if (mercadoria) partes.push(mercadoria)
  if (params.linhaVolume) partes.push(params.linhaVolume)
  else if (params.quantidade != null && params.quantidade > 0) {
    partes.push(`${params.quantidade.toLocaleString('pt-BR')} un`)
  }
  if (params.pesoKg != null && params.pesoKg > 0) {
    partes.push(`${params.pesoKg.toLocaleString('pt-BR')} kg`)
  }
  if (params.cubagemM3 != null && params.cubagemM3 > 0) {
    partes.push(`${params.cubagemM3.toLocaleString('pt-BR')} m³`)
  }
  return partes.length > 0 ? partes.join(' · ') : '—'
}

export function formatarDataEmailDisparoBidFrete(
  valor: string | Date | null | undefined,
): string | null {
  if (valor == null || valor === '') return null
  const data = valor instanceof Date ? valor : new Date(valor)
  if (Number.isNaN(data.getTime())) return null
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function formatarModalExibicaoEmailDisparoBidFrete(modal: string, modalidade?: string | null): string {
  const rotuloModal = rotuloModalEmailDisparoBidFrete(modal)
  const rotuloModalidade = rotuloModalidadeEmailDisparoBidFrete(modalidade)
  return rotuloModalidade ? `${rotuloModal} · ${rotuloModalidade}` : rotuloModal
}

export function formatarRotaEmailDisparoBidFrete(
  origemNome: string,
  origemPais: string,
  destinoNome: string,
  destinoPais: string,
): string {
  return `${origemNome.trim()} (${origemPais.trim()}) → ${destinoNome.trim()} (${destinoPais.trim()})`
}

function linhasResumoEmailDisparo(params: ParametrosEmailDisparoBidFreteInternacional): Array<[string, string]> {
  const linhaVolume = formatarLinhaVolumeEmailDisparoBidFrete({
    modal: params.modal,
    tipoContainer: params.tipoContainer,
    quantidade: params.quantidade,
  })
  const resumoCarga = formatarResumoCargaEmailDisparoBidFrete({
    mercadoria: params.mercadoria,
    quantidade: params.quantidade,
    pesoKg: params.pesoKg,
    cubagemM3: params.cubagemM3,
    linhaVolume,
  })
  const prazoResposta = formatarDataEmailDisparoBidFrete(params.dataLimiteResposta)
  const validadeLink = formatarDataEmailDisparoBidFrete(params.dataExpiracaoToken)

  const linhas: Array<[string, string]> = [
    ['Número', params.numeroCotacao],
    ['Rota', formatarRotaEmailDisparoBidFrete(
      params.origemNome,
      params.origemPais,
      params.destinoNome,
      params.destinoPais,
    )],
    ['Modal', formatarModalExibicaoEmailDisparoBidFrete(params.modal, params.modalidade)],
    ['Incoterm', params.incoterm.trim() || '—'],
    ['Carga', resumoCarga],
  ]

  if (linhaVolume) {
    linhas.push([rotuloCampoVolumeEmailDisparoBidFrete(params.modal), linhaVolume])
  }
  if (params.opcoesOrigemTexto?.trim()) {
    linhas.push(['Alternativas (origem)', params.opcoesOrigemTexto.trim()])
  }
  if (params.opcoesDestinoTexto?.trim()) {
    linhas.push(['Alternativas (destino)', params.opcoesDestinoTexto.trim()])
  }
  if (prazoResposta) {
    linhas.push(['Prazo de resposta', prazoResposta])
  }
  if (validadeLink) {
    linhas.push(['Link válido até', validadeLink])
  }

  return linhas
}

export function montarAssuntoEmailDisparo(
  params: ParametrosEmailDisparoBidFreteInternacional | string,
): string {
  if (typeof params === 'string') {
    return `Cotação de frete — ${params}`
  }
  const rota = formatarRotaEmailDisparoBidFrete(
    params.origemNome,
    params.origemPais,
    params.destinoNome,
    params.destinoPais,
  )
  const modal = formatarModalExibicaoEmailDisparoBidFrete(params.modal, params.modalidade)
  return `Cotação ${params.numeroCotacao} · ${rota} · ${modal}`
}

export function montarPreheaderEmailDisparo(params: ParametrosEmailDisparoBidFreteInternacional): string {
  const cliente = params.anonimaCotacao ? 'Um cliente' : (params.nomeClienteOperacao?.trim() || 'Um cliente')
  return `${cliente} solicitou cotação ${params.numeroCotacao}. Responda pelo link — válido por 7 dias.`
}

export function montarTextoPlanoEmailDisparo(params: ParametrosEmailDisparoBidFreteInternacional): string {
  const cliente = params.anonimaCotacao
    ? 'Um cliente'
    : (params.nomeClienteOperacao?.trim() || 'Um cliente')
  const linhas = linhasResumoEmailDisparo(params)
  const validade = formatarDataEmailDisparoBidFrete(params.dataExpiracaoToken)

  const corpo = [
    'Gravity — BID Frete Internacional',
    '',
    `Olá, ${params.nomeFornecedor.trim()},`,
    '',
    `${cliente} enviou uma solicitação de cotação de frete internacional.`,
    '',
    ...linhas.map(([rotulo, valor]) => `${rotulo}: ${valor}`),
    '',
    'Responder cotação:',
    params.linkResposta,
    '',
    validade ? `Este link é válido até ${validade}.` : 'Este link expira em 7 dias.',
    '',
    'Não responda este e-mail — use o link acima para enviar sua proposta.',
    '',
    '— Equipe Gravity',
  ]

  return corpo.join('\n')
}

function linhaTabelaHtml(rotulo: string, valor: string): string {
  return `
    <tr>
      <td style="padding:10px 14px;color:${COR_MUTED};font-size:13px;width:38%;vertical-align:top;border-bottom:1px solid ${COR_BORDA};">${escapeHtmlTextoEmailBidFrete(rotulo)}</td>
      <td style="padding:10px 14px;color:${COR_TEXTO};font-size:14px;font-weight:500;vertical-align:top;border-bottom:1px solid ${COR_BORDA};">${escapeHtmlTextoEmailBidFrete(valor)}</td>
    </tr>`
}

export function montarHtmlEmailDisparo(params: ParametrosEmailDisparoBidFreteInternacional): string {
  const cliente = params.anonimaCotacao
    ? 'Um cliente'
    : (params.nomeClienteOperacao?.trim() || 'Um cliente')
  const linhas = linhasResumoEmailDisparo(params)
  const validade = formatarDataEmailDisparoBidFrete(params.dataExpiracaoToken)
  const preheader = montarPreheaderEmailDisparo(params)
  const link = escapeHtmlTextoEmailBidFrete(params.linkResposta)

  const tabelaLinhas = linhas.map(([rotulo, valor]) => linhaTabelaHtml(rotulo, valor)).join('')

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtmlTextoEmailBidFrete(montarAssuntoEmailDisparo(params))}</title>
</head>
<body style="margin:0;padding:0;background:${COR_FUNDO};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtmlTextoEmailBidFrete(preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${COR_FUNDO};padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:12px;border:1px solid ${COR_BORDA};overflow:hidden;">
          <tr>
            <td style="padding:28px 28px 20px;background:linear-gradient(135deg,#312e81 0%,${COR_INDIGO} 100%);">
              <p style="margin:0 0 6px;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">Gravity</p>
              <p style="margin:0;font-size:15px;color:#e0e7ff;">Nova cotação de frete internacional</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <p style="margin:0 0 8px;font-size:16px;color:${COR_TEXTO};">Olá, <strong>${escapeHtmlTextoEmailBidFrete(params.nomeFornecedor.trim())}</strong>,</p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.5;color:${COR_MUTED};">
                <strong style="color:${COR_TEXTO};">${escapeHtmlTextoEmailBidFrete(cliente)}</strong> enviou uma solicitação de cotação. Confira o resumo abaixo e envie sua proposta pelo botão.
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:28px;border:1px solid ${COR_BORDA};border-radius:8px;overflow:hidden;">
                ${tabelaLinhas}
              </table>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 20px;">
                <tr>
                  <td style="border-radius:8px;background:${COR_INDIGO};">
                    <a href="${link}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">Responder cotação</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:${COR_MUTED};word-break:break-all;">
                Se o botão não funcionar, copie e cole este link no navegador:<br />
                <a href="${link}" style="color:${COR_INDIGO};">${link}</a>
              </p>
              ${validade ? `<p style="margin:16px 0 0;font-size:13px;color:${COR_MUTED};">Link válido até <strong style="color:${COR_TEXTO};">${escapeHtmlTextoEmailBidFrete(validade)}</strong>.</p>` : `<p style="margin:16px 0 0;font-size:13px;color:${COR_MUTED};">Este link expira em 7 dias.</p>`}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px;background:${COR_FUNDO};border-top:1px solid ${COR_BORDA};">
              <p style="margin:0;font-size:12px;line-height:1.5;color:${COR_MUTED};">
                Não responda este e-mail — use o link acima para enviar sua proposta.<br />
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
