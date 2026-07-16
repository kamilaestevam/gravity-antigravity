import type { Request } from 'express'
import type { ContextoIdentificacaoFornecedorContratoBidFreteInternacional } from '../../../shared/identificacao-eletronica-contrato-bid-frete-internacional.js'

type FornecedorContrato = {
  nome_fornecedor_bid_frete_internacional?: string | null
  email_fornecedor_bid_frete_internacional?: string | null
  cnpj_fornecedor_bid_frete_internacional?: string | null
}

type CotacaoContrato = {
  numero_cotacao_bid_frete_internacional?: string | null
}

export function montarContextoIdentificacaoFornecedorContratoBidFreteInternacional(params: {
  fornecedor?: FornecedorContrato | null
  cotacao?: CotacaoContrato | null
  token_disparo?: string | null
  token_aceite?: string | null
}): ContextoIdentificacaoFornecedorContratoBidFreteInternacional | null {
  const nome = params.fornecedor?.nome_fornecedor_bid_frete_internacional?.trim()
  const numero = params.cotacao?.numero_cotacao_bid_frete_internacional?.trim()
  if (!nome || !numero) return null

  return {
    nome_empresa_fornecedor: nome,
    numero_cotacao: numero,
    email_contato_fornecedor: params.fornecedor?.email_fornecedor_bid_frete_internacional?.trim() ?? '',
    cnpj_fornecedor: params.fornecedor?.cnpj_fornecedor_bid_frete_internacional ?? null,
    token_disparo_cotacao_bid_frete_internacional: params.token_disparo?.trim() || null,
    token_aceite_aprovacao_proposta_bid_frete_internacional: params.token_aceite?.trim() || null,
  }
}

export function extrairIpRequisicaoBidFreteInternacional(req: Request): string {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0]?.trim() ?? ''
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return String(forwarded[0]).trim()
  }
  return req.socket.remoteAddress ?? ''
}

export function extrairUserAgentRequisicaoBidFreteInternacional(req: Request): string {
  const ua = req.headers['user-agent']
  return typeof ua === 'string' ? ua.slice(0, 512) : ''
}
