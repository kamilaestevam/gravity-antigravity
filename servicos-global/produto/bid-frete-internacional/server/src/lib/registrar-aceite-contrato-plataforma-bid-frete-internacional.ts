import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import type { ContextoIdentificacaoFornecedorContratoBidFreteInternacional } from '../../../shared/identificacao-eletronica-contrato-bid-frete-internacional.js'
import type { EmpresaPagadoraTaxaFechamentoPlataformaGravity } from '../../../shared/empresa-pagadora-taxa-fechamento-plataforma-bid-frete-internacional.js'

const PASTA_REGISTROS = path.join(
  process.cwd(),
  'data',
  'registros-aceite-contrato-plataforma-bid-frete-internacional',
)

export type TipoEventoAceiteContratoPlataformaBidFreteInternacional =
  | 'CIENCIA_PROPOSTA'
  | 'ACEITE_FECHAMENTO'

export type TipoContratoPlataformaRegistroBidFreteInternacional = 'PROPOSTA' | 'FECHAMENTO'

export interface RegistroAceiteContratoPlataformaBidFreteInternacional {
  id_registro_aceite_contrato_plataforma_bid_frete_internacional: string
  tipo_evento_aceite_contrato_plataforma_bid_frete_internacional: TipoEventoAceiteContratoPlataformaBidFreteInternacional
  tipo_contrato_plataforma_bid_frete_internacional: TipoContratoPlataformaRegistroBidFreteInternacional
  data_hora_aceite_utc: string
  email_contato_fornecedor: string
  token_disparo_cotacao_bid_frete_internacional: string | null
  token_aceite_aprovacao_proposta_bid_frete_internacional: string | null
  nome_empresa_fornecedor: string
  cnpj_fornecedor: string | null
  numero_cotacao_bid_frete_internacional: string
  id_proposta_bid_frete_internacional: string | null
  id_cotacao_bid_frete_internacional: string | null
  endereco_ip_aceite_contrato_plataforma_bid_frete_internacional: string
  user_agent_aceite_contrato_plataforma_bid_frete_internacional: string
  versao_contrato_plataforma_bid_frete_internacional: string
  hash_contrato_aceito_plataforma_bid_frete_internacional: string
  slug_pagador_taxa_fechamento_plataforma_bid_frete_internacional: string
  empresa_pagadora_taxa_fechamento_plataforma_gravity: EmpresaPagadoraTaxaFechamentoPlataformaGravity
  snapshot_proposta_fechada_bid_frete_internacional: Record<string, unknown> | null
}

export function registrarAceiteContratoPlataformaBidFreteInternacional(
  registro: Omit<
    RegistroAceiteContratoPlataformaBidFreteInternacional,
    'id_registro_aceite_contrato_plataforma_bid_frete_internacional'
  >,
): RegistroAceiteContratoPlataformaBidFreteInternacional {
  fs.mkdirSync(PASTA_REGISTROS, { recursive: true })
  const completo: RegistroAceiteContratoPlataformaBidFreteInternacional = {
    id_registro_aceite_contrato_plataforma_bid_frete_internacional: randomUUID(),
    ...registro,
  }
  const arquivo = path.join(
    PASTA_REGISTROS,
    `${completo.id_registro_aceite_contrato_plataforma_bid_frete_internacional}.json`,
  )
  fs.writeFileSync(arquivo, JSON.stringify(completo, null, 2), 'utf8')
  return completo
}

export function montarSnapshotPropostaFechadaBidFreteInternacional(
  proposta: Record<string, unknown> | null | undefined,
  ultimoRegistroAlteracao?: Record<string, unknown> | null,
): Record<string, unknown> | null {
  if (!proposta) return null
  return {
    id_proposta_bid_frete_internacional: proposta.id_proposta_bid_frete_internacional ?? null,
    moeda_proposta_bid_frete_internacional: proposta.moeda_proposta_bid_frete_internacional ?? null,
    valor_total_proposta_bid_frete_internacional: proposta.valor_total_proposta_bid_frete_internacional ?? null,
    dias_transito_proposta_bid_frete_internacional: proposta.dias_transito_proposta_bid_frete_internacional ?? null,
    status_proposta_bid_frete_internacional: proposta.status_proposta_bid_frete_internacional ?? null,
    ultimo_registro_alteracao_proposta_bid_frete_internacional: ultimoRegistroAlteracao ?? null,
  }
}

export function montarRegistroAceiteFromContexto(params: {
  tipo_evento: TipoEventoAceiteContratoPlataformaBidFreteInternacional
  tipo_contrato: TipoContratoPlataformaRegistroBidFreteInternacional
  data_hora_aceite_utc: Date
  contexto: ContextoIdentificacaoFornecedorContratoBidFreteInternacional | null
  endereco_ip: string
  user_agent: string
  versao_contrato: string
  hash_contrato: string
  slug_pagador: string
  empresa_pagadora: EmpresaPagadoraTaxaFechamentoPlataformaGravity
  id_proposta_bid_frete_internacional?: string | null
  id_cotacao_bid_frete_internacional?: string | null
  snapshot_proposta?: Record<string, unknown> | null
}): RegistroAceiteContratoPlataformaBidFreteInternacional {
  return registrarAceiteContratoPlataformaBidFreteInternacional({
    tipo_evento_aceite_contrato_plataforma_bid_frete_internacional: params.tipo_evento,
    tipo_contrato_plataforma_bid_frete_internacional: params.tipo_contrato,
    data_hora_aceite_utc: params.data_hora_aceite_utc.toISOString(),
    email_contato_fornecedor: params.contexto?.email_contato_fornecedor?.trim() ?? '',
    token_disparo_cotacao_bid_frete_internacional:
      params.contexto?.token_disparo_cotacao_bid_frete_internacional ?? null,
    token_aceite_aprovacao_proposta_bid_frete_internacional:
      params.contexto?.token_aceite_aprovacao_proposta_bid_frete_internacional ?? null,
    nome_empresa_fornecedor: params.contexto?.nome_empresa_fornecedor?.trim() ?? '',
    cnpj_fornecedor: params.contexto?.cnpj_fornecedor?.replace(/\D/g, '') || null,
    numero_cotacao_bid_frete_internacional: params.contexto?.numero_cotacao?.trim() ?? '',
    id_proposta_bid_frete_internacional: params.id_proposta_bid_frete_internacional ?? null,
    id_cotacao_bid_frete_internacional: params.id_cotacao_bid_frete_internacional ?? null,
    endereco_ip_aceite_contrato_plataforma_bid_frete_internacional: params.endereco_ip,
    user_agent_aceite_contrato_plataforma_bid_frete_internacional: params.user_agent,
    versao_contrato_plataforma_bid_frete_internacional: params.versao_contrato,
    hash_contrato_aceito_plataforma_bid_frete_internacional: params.hash_contrato,
    slug_pagador_taxa_fechamento_plataforma_bid_frete_internacional: params.slug_pagador,
    empresa_pagadora_taxa_fechamento_plataforma_gravity: params.empresa_pagadora,
    snapshot_proposta_fechada_bid_frete_internacional: params.snapshot_proposta ?? null,
  })
}
