/**
 * Formatação do e-mail de resultado da aprovação — SSOT server-side (sem i18n).
 * Variantes: ganhador (com aceite) e perdedor (ranking + agradecimento).
 */

import {
  montarEixosColocacaoEmailAprovacaoBidFrete,
  montarBlocoValorTotalFreteColocacaoEmail,
  rotuloOrdinalColocacaoEmail,
  formatarMoedaColocacaoEmailBidFrete,
  formatarValorRotaColocacaoEmail,
  type PropostaColocacaoEmailBidFreteInternacional,
  type EixoColocacaoEmailBidFreteInternacional,
} from './colocacao-eixos-aprovacao-bid-frete-internacional.js'
import {
  escapeHtmlTextoEmailBidFrete,
  formatarDataEmailDisparoBidFrete,
  formatarModalExibicaoEmailDisparoBidFrete,
  formatarRotaEmailDisparoBidFrete,
  montarAvisoTaxaPlataformaEmailDisparoBidFrete,
} from './formatar-email-disparo-bid-frete-internacional.js'
import type { EmpresaPagadoraTaxaFechamentoPlataformaGravity } from './empresa-pagadora-taxa-fechamento-plataforma-bid-frete-internacional.js'
import { DIAS_VALIDADE_TOKEN_ACEITE_APROVACAO_BID_FRETE_INTERNACIONAL } from './aceite-aprovacao-proposta-bid-frete-internacional.js'

const COR_INDIGO = '#4F46E5'
const COR_TEXTO = '#0f172a'
const COR_MUTED = '#64748b'
const COR_BORDA = '#e2e8f0'
const COR_FUNDO = '#f8fafc'
const COR_CARD_ESCURO = '#0f172a'

/** Rótulo do botão no e-mail ao ganhador (link para a página de confirmação). */
export const ROTULO_BOTAO_ACEITE_EMAIL_APROVACAO_PROPOSTA_BID_FRETE_INTERNACIONAL = 'Ir para confirmação'
const COR_CARD_BORDA = '#334155'
const COR_CARD_TEXTO = '#f8fafc'
const COR_CARD_MUTED = '#94a3b8'
const COR_MELHOR = '#6ee7b7'

export interface ParametrosEmailAprovacaoPropostaBidFreteInternacional {
  ehGanhador: boolean
  nomeFornecedor: string
  numeroCotacao: string
  nomeCliente: string
  nomeAprovador: string
  dataAprovacao: string | Date
  modal: string
  modalidade?: string | null
  origemNome: string
  origemPais: string
  destinoNome: string
  destinoPais: string
  mercadoria: string
  incoterm: string
  /** Proposta destinatário */
  proposta: PropostaColocacaoEmailBidFreteInternacional
  /** Todas as propostas da cotação (ranking por eixo) */
  propostasTodas: PropostaColocacaoEmailBidFreteInternacional[]
  /** Ganhador — exibido no e-mail do perdedor */
  nomeFornecedorGanhador?: string
  valorTotalGanhador?: number
  moedaGanhador?: string
  linkAceite?: string
  empresaPagadoraTaxaFechamentoPlataformaGravity?: EmpresaPagadoraTaxaFechamentoPlataformaGravity | null
  /** Mensagem opcional do comprador — incluída no e-mail do ganhador. */
  comentariosAprovacaoCotacao?: string | null
}

function formatarValidadeProposta(data: string | Date): string {
  return formatarDataEmailDisparoBidFrete(data) ?? '—'
}

function montarBlocoComentariosAprovacaoEmail(params: ParametrosEmailAprovacaoPropostaBidFreteInternacional): {
  linhaTabelaHtml: string
  linhasTextoPlano: string[]
} {
  const texto = params.comentariosAprovacaoCotacao?.trim()
  if (!params.ehGanhador || !texto) {
    return { linhaTabelaHtml: '', linhasTextoPlano: [] }
  }
  return {
    linhaTabelaHtml: linhaTabelaHtml('Observações', texto),
    linhasTextoPlano: ['Observações', texto],
  }
}

function linhasResumoCotacao(params: ParametrosEmailAprovacaoPropostaBidFreteInternacional): Array<[string, string]> {
  const p = params.proposta
  return [
    ['Modal / Modalidade', formatarModalExibicaoEmailDisparoBidFrete(params.modal, params.modalidade)],
    [
      'Origem → Destino',
      formatarRotaEmailDisparoBidFrete(
        params.origemNome,
        params.origemPais,
        params.destinoNome,
        params.destinoPais,
      ),
    ],
    ['Incoterm', params.incoterm.trim() || '—'],
    ['Mercadoria', params.mercadoria.trim() || '—'],
    ['Valor total', formatarMoedaColocacaoEmailBidFrete(
      p.valor_total_proposta_bid_frete_internacional,
      p.moeda_proposta_bid_frete_internacional,
    )],
    ['Transit time', `${p.dias_transito_proposta_bid_frete_internacional} dias`],
    ['Rota', formatarValorRotaColocacaoEmail(p)],
  ]
}

function linhaTabelaHtml(rotulo: string, valor: string): string {
  return `
    <tr>
      <td style="padding:10px 14px;color:${COR_MUTED};font-size:13px;width:38%;vertical-align:top;border-bottom:1px solid ${COR_BORDA};">${escapeHtmlTextoEmailBidFrete(rotulo)}</td>
      <td style="padding:10px 14px;color:${COR_TEXTO};font-size:14px;font-weight:500;vertical-align:top;border-bottom:1px solid ${COR_BORDA};">${escapeHtmlTextoEmailBidFrete(valor)}</td>
    </tr>`
}

function montarTextoEixosColocacao(eixos: EixoColocacaoEmailBidFreteInternacional[]): string[] {
  return eixos.map((e) => {
    const melhor = e.melhor ? ' [Melhor]' : ''
    return `  ${e.rotulo.padEnd(22)} ${e.valorExibicao}${melhor}`
  })
}

function montarHtmlEixosColocacao(eixos: EixoColocacaoEmailBidFreteInternacional[]): string {
  const linhas = eixos
    .map((e) => {
      const badge = e.melhor
        ? `<span style="display:inline-block;margin-left:8px;padding:2px 8px;font-size:11px;font-weight:600;color:${COR_MELHOR};background:rgba(52,211,153,0.12);border:1px solid rgba(52,211,153,0.25);border-radius:999px;">Melhor</span>`
        : ''
      return `
        <tr>
          <td style="padding:8px 0;color:${COR_CARD_MUTED};font-size:12px;text-transform:uppercase;letter-spacing:0.04em;">${escapeHtmlTextoEmailBidFrete(e.rotulo)}</td>
          <td style="padding:8px 0;color:${COR_CARD_TEXTO};font-size:14px;font-weight:600;text-align:right;">${escapeHtmlTextoEmailBidFrete(e.valorExibicao)}${badge}</td>
        </tr>`
    })
    .join('')
  return `
    <p style="margin:16px 0 8px;font-size:11px;font-weight:700;color:${COR_CARD_MUTED};letter-spacing:0.08em;text-transform:uppercase;">Colocação por eixo</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${linhas}</table>`
}

function montarHtmlValorTotalFrete(proposta: PropostaColocacaoEmailBidFreteInternacional): string {
  const bloco = montarBlocoValorTotalFreteColocacaoEmail(proposta)
  return `
    <p style="margin:20px 0 8px;font-size:11px;font-weight:700;color:${COR_CARD_MUTED};letter-spacing:0.08em;text-transform:uppercase;">Valor total do frete</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:13px;color:${COR_CARD_TEXTO};">
      <tr><td style="padding:4px 0;color:${COR_CARD_MUTED};">Frete base</td><td style="padding:4px 0;text-align:right;">${escapeHtmlTextoEmailBidFrete(bloco.freteBase)}</td></tr>
      <tr><td style="padding:4px 0;color:${COR_CARD_MUTED};">Taxas de origem</td><td style="padding:4px 0;text-align:right;">${escapeHtmlTextoEmailBidFrete(bloco.taxasOrigem)}</td></tr>
      <tr><td style="padding:4px 0;color:${COR_CARD_MUTED};">Taxas de destino</td><td style="padding:4px 0;text-align:right;">${escapeHtmlTextoEmailBidFrete(bloco.taxasDestino)}</td></tr>
    </table>
    <div style="margin-top:12px;padding:12px 14px;background:rgba(79,70,229,0.15);border-radius:8px;text-align:right;">
      <span style="font-size:12px;color:${COR_CARD_MUTED};">Valor total · </span>
      <strong style="font-size:16px;color:${COR_CARD_TEXTO};">${escapeHtmlTextoEmailBidFrete(bloco.valorTotal)}</strong>
    </div>
    <p style="margin:10px 0 0;font-size:11px;color:${COR_CARD_MUTED};">Frete base + taxas de origem + taxas de destino. Valores somados por moeda, sem conversão cambial.</p>`
}

function montarHtmlCardColocacaoFallback(params: ParametrosEmailAprovacaoPropostaBidFreteInternacional): string {
  const p = params.proposta
  const eixos = montarEixosColocacaoEmailAprovacaoBidFrete(params.propostasTodas, p.id_proposta_bid_frete_internacional)
  const moeda = p.moeda_proposta_bid_frete_internacional || 'USD'
  const valorTotal = formatarMoedaColocacaoEmailBidFrete(p.valor_total_proposta_bid_frete_internacional, moeda)
  const rank = rotuloOrdinalColocacaoEmail(p.ranking_geral)

  return `
    <div style="margin:0 0 24px;padding:20px;background:${COR_CARD_ESCURO};border:1px solid ${COR_CARD_BORDA};border-radius:12px;">
      <div style="margin-bottom:16px;">
        <span style="display:inline-block;padding:4px 10px;font-size:13px;font-weight:700;color:#fcd34d;background:rgba(234,179,8,0.12);border-radius:6px;">🏆 ${escapeHtmlTextoEmailBidFrete(rank)} lugar geral</span>
        <span style="margin-left:10px;font-size:15px;font-weight:600;color:${COR_CARD_TEXTO};">${escapeHtmlTextoEmailBidFrete(p.fornecedor_nome)}</span>
        <span style="margin-left:10px;font-size:15px;font-weight:700;color:${COR_CARD_TEXTO};">${escapeHtmlTextoEmailBidFrete(valorTotal)}</span>
      </div>
      ${montarHtmlEixosColocacao(eixos)}
      ${montarHtmlValorTotalFrete(p)}
    </div>`
}

function montarSvgCardColocacaoEmail(params: ParametrosEmailAprovacaoPropostaBidFreteInternacional): string {
  const p = params.proposta
  const eixos = montarEixosColocacaoEmailAprovacaoBidFrete(params.propostasTodas, p.id_proposta_bid_frete_internacional)
  const moeda = p.moeda_proposta_bid_frete_internacional || 'USD'
  const valorTotal = formatarMoedaColocacaoEmailBidFrete(p.valor_total_proposta_bid_frete_internacional, moeda)
  const rank = rotuloOrdinalColocacaoEmail(p.ranking_geral)

  const escapeSvg = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

  const linhasEixo = eixos
    .map((e, i) => {
      const y = 118 + i * 28
      const melhor = e.melhor
        ? `<rect x="430" y="${y - 14}" width="58" height="18" rx="9" fill="rgba(52,211,153,0.15)" stroke="rgba(52,211,153,0.35)"/><text x="459" y="${y}" text-anchor="middle" fill="#6ee7b7" font-size="10" font-weight="600">Melhor</text>`
        : `<text x="488" y="${y}" text-anchor="end" fill="#94a3b8" font-size="12">${escapeSvg(e.valorExibicao)}</text>`
      const valor = e.melhor
        ? `<text x="420" y="${y}" text-anchor="end" fill="#f8fafc" font-size="12" font-weight="600">${escapeSvg(e.valorExibicao)}</text>${melhor}`
        : melhor
      return `
        <text x="32" y="${y}" fill="#94a3b8" font-size="11" font-weight="600">${escapeSvg(e.rotulo.toUpperCase())}</text>
        ${valor}`
    })
    .join('')

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="520" height="280" viewBox="0 0 520 280">
    <rect width="520" height="280" rx="12" fill="#0f172a" stroke="#334155"/>
    <text x="32" y="42" fill="#fcd34d" font-size="14" font-weight="700">${escapeSvg(rank)} lugar geral</text>
    <text x="120" y="42" fill="#f8fafc" font-size="14" font-weight="600">${escapeSvg(p.fornecedor_nome)}</text>
    <text x="488" y="42" text-anchor="end" fill="#f8fafc" font-size="14" font-weight="700">${escapeSvg(valorTotal)}</text>
    <text x="32" y="88" fill="#64748b" font-size="10" font-weight="700" letter-spacing="1">COLOCAÇÃO POR EIXO</text>
    ${linhasEixo}
  </svg>`

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

function montarBlocoCardColocacaoEmail(params: ParametrosEmailAprovacaoPropostaBidFreteInternacional): {
  imgHtml: string
  cardTextoPlano: string[]
  cardHtmlFallback: string
} {
  const p = params.proposta
  const eixos = montarEixosColocacaoEmailAprovacaoBidFrete(params.propostasTodas, p.id_proposta_bid_frete_internacional)
  const blocoFrete = montarBlocoValorTotalFreteColocacaoEmail(p)
  const moeda = p.moeda_proposta_bid_frete_internacional || 'USD'
  const valorTotal = formatarMoedaColocacaoEmailBidFrete(p.valor_total_proposta_bid_frete_internacional, moeda)
  const rank = rotuloOrdinalColocacaoEmail(p.ranking_geral)
  const svgDataUri = montarSvgCardColocacaoEmail(params)
  const alt = `${rank} lugar — ${p.fornecedor_nome} — ${valorTotal}`

  const cardTextoPlano = [
    `🏆 ${rank} lugar geral · ${p.fornecedor_nome} · ${valorTotal}`,
    '',
    'COLOCAÇÃO POR EIXO',
    ...montarTextoEixosColocacao(eixos),
    '',
    'VALOR TOTAL DO FRETE',
    `  Frete base: ${blocoFrete.freteBase}`,
    `  Taxas origem: ${blocoFrete.taxasOrigem}`,
    `  Taxas destino: ${blocoFrete.taxasDestino}`,
    `  Valor total: ${blocoFrete.valorTotal}`,
  ]

  return {
    imgHtml: `<img src="${svgDataUri}" alt="${escapeHtmlTextoEmailBidFrete(alt)}" width="520" style="max-width:100%;height:auto;border-radius:12px;border:1px solid ${COR_CARD_BORDA};margin:0 0 16px;" />`,
    cardTextoPlano,
    cardHtmlFallback: montarHtmlCardColocacaoFallback(params),
  }
}

export function montarAssuntoEmailAprovacaoProposta(params: ParametrosEmailAprovacaoPropostaBidFreteInternacional): string {
  if (params.ehGanhador) {
    return `Parabéns! Sua proposta foi aprovada — ${params.numeroCotacao}`
  }
  return `Resultado da cotação ${params.numeroCotacao} — você ficou em ${rotuloOrdinalColocacaoEmail(params.proposta.ranking_geral)} lugar`
}

export function montarTextoPlanoEmailAprovacaoProposta(
  params: ParametrosEmailAprovacaoPropostaBidFreteInternacional,
): string {
  const dataAprovacao = formatarDataEmailDisparoBidFrete(params.dataAprovacao) ?? '—'
  const { cardTextoPlano } = montarBlocoCardColocacaoEmail(params)
  const linhasCotacao = linhasResumoCotacao(params)
  const { linhasTextoPlano: linhasObservacoes } = montarBlocoComentariosAprovacaoEmail(params)
  const linhas: string[] = [
    'Gravity — BID Frete Internacional',
    '',
    `Olá, ${params.nomeFornecedor.trim()},`,
    '',
  ]

  if (params.ehGanhador) {
    linhas.push(
      `Parabéns! Sua proposta foi aprovada na cotação ${params.numeroCotacao}.`,
      '',
    )
  } else {
    linhas.push(
      `Informamos o resultado da cotação ${params.numeroCotacao}.`,
      '',
      `Proposta vencedora: ${params.nomeFornecedorGanhador ?? '—'} · ${formatarMoedaColocacaoEmailBidFrete(
        params.valorTotalGanhador ?? 0,
        params.moedaGanhador ?? params.proposta.moeda_proposta_bid_frete_internacional,
      )}`,
      '',
      `Sua proposta ficou em ${rotuloOrdinalColocacaoEmail(params.proposta.ranking_geral)} lugar no ranking geral.`,
      '',
    )
  }

  linhas.push(
    `Cliente: ${params.nomeCliente}`,
    `Aprovada por: ${params.nomeAprovador}`,
    `Data da aprovação: ${dataAprovacao}`,
    '',
    '─── Seu resultado ───',
    ...cardTextoPlano,
    '',
    '─── Resumo da cotação ───',
    ...linhasCotacao.map(([r, v]) => `${r}: ${v}`),
    ...(linhasObservacoes.length > 0 ? ['', ...linhasObservacoes] : []),
  )

  if (params.ehGanhador && params.linkAceite) {
    const { avisoTextoPlano } = montarAvisoTaxaPlataformaEmailDisparoBidFrete(
      params.linkAceite,
      params.empresaPagadoraTaxaFechamentoPlataformaGravity ?? undefined,
    )
    linhas.push(
      '',
      ROTULO_BOTAO_ACEITE_EMAIL_APROVACAO_PROPOSTA_BID_FRETE_INTERNACIONAL + ':',
      params.linkAceite,
      '',
      avisoTextoPlano,
      '',
      `Após a confirmação, o status da sua proposta será atualizado para "Aprovação recebida".`,
      `Este link é válido por ${DIAS_VALIDADE_TOKEN_ACEITE_APROVACAO_BID_FRETE_INTERNACIONAL} dias.`,
    )
  } else if (!params.ehGanhador) {
    linhas.push('', 'Agradecemos sua participação. Ficamos à disposição para próximas cotações.')
  }

  linhas.push('', '— Equipe Gravity', '', 'Este e-mail foi enviado automaticamente. Não responda.')
  return linhas.join('\n')
}

export function montarHtmlEmailAprovacaoProposta(
  params: ParametrosEmailAprovacaoPropostaBidFreteInternacional,
): string {
  const dataAprovacao = formatarDataEmailDisparoBidFrete(params.dataAprovacao) ?? '—'
  const assunto = montarAssuntoEmailAprovacaoProposta(params)
  const { cardTextoPlano, cardHtmlFallback } = montarBlocoCardColocacaoEmail(params)
  const linhasCotacao = linhasResumoCotacao(params)
  const { linhaTabelaHtml: linhaObservacoesHtml } = montarBlocoComentariosAprovacaoEmail(params)
  const tabelaLinhas = linhasCotacao.map(([r, v]) => linhaTabelaHtml(r, v)).join('') + linhaObservacoesHtml

  let introHtml = ''
  if (params.ehGanhador) {
    introHtml = `<p style="margin:0 0 16px;font-size:15px;line-height:1.5;color:${COR_TEXTO};">Parabéns! Sua proposta foi aprovada na cotação <strong>${escapeHtmlTextoEmailBidFrete(params.numeroCotacao)}</strong>.</p>`
  } else {
    const valorGanhador = formatarMoedaColocacaoEmailBidFrete(
      params.valorTotalGanhador ?? 0,
      params.moedaGanhador ?? params.proposta.moeda_proposta_bid_frete_internacional,
    )
    introHtml = `
      <p style="margin:0 0 12px;font-size:15px;line-height:1.5;color:${COR_TEXTO};">Informamos o resultado da cotação <strong>${escapeHtmlTextoEmailBidFrete(params.numeroCotacao)}</strong>.</p>
      <p style="margin:0 0 12px;font-size:14px;color:${COR_MUTED};">Proposta vencedora: <strong style="color:${COR_TEXTO};">${escapeHtmlTextoEmailBidFrete(params.nomeFornecedorGanhador ?? '—')}</strong> · ${escapeHtmlTextoEmailBidFrete(valorGanhador)}</p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.5;color:${COR_TEXTO};">Sua proposta ficou em <strong>${escapeHtmlTextoEmailBidFrete(rotuloOrdinalColocacaoEmail(params.proposta.ranking_geral))} lugar</strong> no ranking geral.</p>`
  }

  const metaHtml = `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 20px;font-size:14px;">
      <tr><td style="padding:4px 0;color:${COR_MUTED};width:38%;">Cliente</td><td style="padding:4px 0;color:${COR_TEXTO};font-weight:600;">${escapeHtmlTextoEmailBidFrete(params.nomeCliente)}</td></tr>
      <tr><td style="padding:4px 0;color:${COR_MUTED};">Aprovada por</td><td style="padding:4px 0;color:${COR_TEXTO};font-weight:600;">${escapeHtmlTextoEmailBidFrete(params.nomeAprovador)}</td></tr>
      <tr><td style="padding:4px 0;color:${COR_MUTED};">Data da aprovação</td><td style="padding:4px 0;color:${COR_TEXTO};">${escapeHtmlTextoEmailBidFrete(dataAprovacao)}</td></tr>
    </table>`

  let ctaHtml = ''
  let avisoTaxaHtml = ''
  if (params.ehGanhador && params.linkAceite) {
    const link = escapeHtmlTextoEmailBidFrete(params.linkAceite)
    const { avisoHtml } = montarAvisoTaxaPlataformaEmailDisparoBidFrete(
      params.linkAceite,
      params.empresaPagadoraTaxaFechamentoPlataformaGravity ?? undefined,
    )
    avisoTaxaHtml = avisoHtml
    ctaHtml = `
              <p style="margin:0 0 16px;font-size:14px;line-height:1.5;color:${COR_MUTED};">Para confirmar que recebeu esta aprovação e está de acordo com as condições, clique no botão abaixo:</p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 20px;">
                <tr>
                  <td style="border-radius:8px;background:${COR_INDIGO};">
                    <a href="${link}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">${ROTULO_BOTAO_ACEITE_EMAIL_APROVACAO_PROPOSTA_BID_FRETE_INTERNACIONAL}</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:${COR_MUTED};word-break:break-all;">Se o botão não funcionar, copie e cole este link no navegador:<br /><a href="${link}" style="color:${COR_INDIGO};">${link}</a></p>
              <p style="margin:0 0 20px;font-size:13px;color:${COR_MUTED};">Após a confirmação, o status da sua proposta será atualizado para &quot;Aprovação recebida&quot;. Link válido por <strong>${DIAS_VALIDADE_TOKEN_ACEITE_APROVACAO_BID_FRETE_INTERNACIONAL} dias</strong>.</p>`
  } else if (!params.ehGanhador) {
    ctaHtml = `<p style="margin:0 0 8px;font-size:14px;line-height:1.5;color:${COR_MUTED};">Agradecemos sua participação. Ficamos à disposição para próximas cotações.</p>`
  }

  const tituloHeader = params.ehGanhador ? 'Proposta aprovada' : 'Resultado da cotação'

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtmlTextoEmailBidFrete(assunto)}</title>
</head>
<body style="margin:0;padding:0;background:${COR_FUNDO};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${COR_FUNDO};padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:12px;border:1px solid ${COR_BORDA};overflow:hidden;">
          <tr>
            <td style="padding:28px 28px 20px;background:linear-gradient(135deg,#312e81 0%,${COR_INDIGO} 100%);">
              <p style="margin:0 0 6px;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">Gravity</p>
              <p style="margin:0;font-size:15px;color:#e0e7ff;">${escapeHtmlTextoEmailBidFrete(tituloHeader)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <p style="margin:0 0 8px;font-size:16px;color:${COR_TEXTO};">Olá, <strong>${escapeHtmlTextoEmailBidFrete(params.nomeFornecedor.trim())}</strong>,</p>
              ${introHtml}
              ${metaHtml}
              <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:${COR_MUTED};text-transform:uppercase;letter-spacing:0.06em;">Seu resultado</p>
              ${cardHtmlFallback}
              <p style="margin:24px 0 8px;font-size:13px;font-weight:600;color:${COR_MUTED};">Resumo da cotação</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;border:1px solid ${COR_BORDA};border-radius:8px;overflow:hidden;">
                ${tabelaLinhas}
              </table>
              ${ctaHtml}
              ${avisoTaxaHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px;background:${COR_FUNDO};border-top:1px solid ${COR_BORDA};">
              <p style="margin:0;font-size:12px;color:${COR_MUTED};">Este e-mail foi enviado automaticamente. Não responda.</p>
              <p style="margin:8px 0 0;font-size:12px;color:${COR_MUTED};">— Equipe Gravity · BID Frete Internacional</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
