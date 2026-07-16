/** Dados do FORNECEDOR para qualificação eletrônica nos contratos da Plataforma. */
export interface ContextoIdentificacaoFornecedorContratoBidFreteInternacional {
  nome_empresa_fornecedor: string
  numero_cotacao: string
  email_contato_fornecedor: string
  cnpj_fornecedor?: string | null
  token_disparo_cotacao_bid_frete_internacional?: string | null
  token_aceite_aprovacao_proposta_bid_frete_internacional?: string | null
}

export const TEXTO_QUALIFICACAO_FORNECEDOR_SEM_CONTEXTO =
  'pessoa jurídica identificada eletronicamente pelos registros da Plataforma vinculados à cotação em curso, '
  + 'cadastro de fornecedor, e-mail destinatário do convite e token individual de acesso, '
  + 'doravante denominado FORNECEDOR'

export function montarQualificacaoFornecedorContratoBidFreteInternacional(
  contexto?: ContextoIdentificacaoFornecedorContratoBidFreteInternacional | null,
): string {
  if (!contexto?.nome_empresa_fornecedor?.trim() || !contexto.numero_cotacao?.trim()) {
    return TEXTO_QUALIFICACAO_FORNECEDOR_SEM_CONTEXTO
  }

  const nome = contexto.nome_empresa_fornecedor.trim()
  const cotacao = contexto.numero_cotacao.trim()
  const email = contexto.email_contato_fornecedor?.trim() || 'não informado'
  const cnpj = contexto.cnpj_fornecedor?.replace(/\D/g, '')

  const trechoCnpj = cnpj && cnpj.length >= 11
    ? `, inscrita no CNPJ sob nº ${formatarCnpjExibicaoContrato(cnpj)}`
    : ''

  return (
    `${nome}${trechoCnpj}, pessoa jurídica identificada eletronicamente pelos registros da Plataforma `
    + `vinculados à cotação nº ${cotacao}, cadastro de fornecedor, e-mail ${email} destinatário do convite `
    + 'e token individual de acesso, doravante denominado FORNECEDOR'
  )
}

function formatarCnpjExibicaoContrato(digitos: string): string {
  const n = digitos.slice(0, 14)
  if (n.length !== 14) return digitos
  return `${n.slice(0, 2)}.${n.slice(2, 5)}.${n.slice(5, 8)}/${n.slice(8, 12)}-${n.slice(12, 14)}`
}

export const PARAGRAFOS_IDENTIFICACAO_ELETRONICA_CIENCIA_PROPOSTA_BID_FRETE: readonly string[] = [
  'A pessoa que envia a proposta eletronicamente declara estar autorizada a representar o FORNECEDOR nesta cotação, '
  + 'respondendo este pelos atos praticados por meio do e-mail e do token individual a ele endereçados '
  + '(teoria da aparência e boa fé objetiva, art. 422 do Código Civil).',
  'Para os fins do art. 10, § 2º, da Medida Provisória nº 2.200-2/2001, reconhece-se como forma válida de registro '
  + 'de ciência nesta etapa a identificação eletrônica acima e o registro com data, hora, endereço IP e token individual, '
  + 'dispensada qualificação adicional das partes. O FORNECEDOR poderá complementar seus dados cadastrais na Plataforma '
  + 'a qualquer tempo.',
]

export const PARAGRAFOS_IDENTIFICACAO_ELETRONICA_ACEITE_FECHAMENTO_BID_FRETE: readonly string[] = [
  'A pessoa que realiza o aceite eletrônico declara estar autorizada a vincular o FORNECEDOR às obrigações deste contrato de Fechamento, '
  + 'respondendo este pelos atos praticados por meio do e-mail e do token individual a ele endereçados '
  + '(teoria da aparência e boa fé objetiva, art. 422 do Código Civil).',
  'Para os fins do art. 10, § 2º, da Medida Provisória nº 2.200-2/2001, as partes reconhecem como forma válida '
  + 'de celebração deste contrato a identificação eletrônica acima e o registro do aceite («li e aceito») com data, '
  + 'hora, endereço IP e token individual, dispensada qualificação adicional das partes. O FORNECEDOR poderá '
  + 'complementar seus dados cadastrais na Plataforma a qualquer tempo, sem prejuízo da validade deste contrato.',
]

/** @deprecated Use PARAGRAFOS_IDENTIFICACAO_ELETRONICA_CIENCIA_PROPOSTA_BID_FRETE ou PARAGRAFOS_IDENTIFICACAO_ELETRONICA_ACEITE_FECHAMENTO_BID_FRETE */
export const PARAGRAFOS_IDENTIFICACAO_ELETRONICA_ACEITE_CONTRATO_BID_FRETE =
  PARAGRAFOS_IDENTIFICACAO_ELETRONICA_ACEITE_FECHAMENTO_BID_FRETE

export type TipoContratoPlataformaBidFreteInternacional = 'PROPOSTA' | 'FECHAMENTO'

export interface MetadadosVersaoContratoPlataformaBidFreteInternacional {
  tipo_contrato: TipoContratoPlataformaBidFreteInternacional
  versao: string
  data_vigencia: string
  slug_pagador: 'pagamento-fornecedor' | 'pagamento-contratante-gravity'
}


export function serializarTextoContratoPlataformaParaHash(secoes: Array<{ titulo: string; paragrafos: string[] }>): string {
  return secoes
    .flatMap(secao => [secao.titulo, ...secao.paragrafos])
    .join('\n')
}

export function anexarTokenQueryContratoPlataformaBidFreteInternacional(
  rota: string,
  params: {
    token_disparo?: string | null
    token_aceite?: string | null
  },
): string {
  const search = new URLSearchParams()
  if (params.token_disparo?.trim()) {
    search.set('token_disparo', params.token_disparo.trim())
  }
  if (params.token_aceite?.trim()) {
    search.set('token_aceite', params.token_aceite.trim())
  }
  const qs = search.toString()
  return qs ? `${rota}?${qs}` : rota
}
