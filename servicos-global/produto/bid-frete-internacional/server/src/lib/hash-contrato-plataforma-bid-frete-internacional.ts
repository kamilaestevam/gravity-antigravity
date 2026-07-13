import { createHash } from 'node:crypto'
import type { ContextoIdentificacaoFornecedorContratoBidFreteInternacional } from '../../../shared/identificacao-eletronica-contrato-bid-frete-internacional.js'
import { serializarTextoContratoPlataformaParaHash } from '../../../shared/identificacao-eletronica-contrato-bid-frete-internacional.js'
import type { EmpresaPagadoraTaxaFechamentoPlataformaGravity } from '../../../shared/empresa-pagadora-taxa-fechamento-plataforma-bid-frete-internacional.js'
import {
  montarDocumentoContratoFechamentoPlataformaBidFreteInternacional,
  VERSAO_CONTRATO_FECHAMENTO_PLATAFORMA_BID_FRETE_INTERNACIONAL,
  DATA_VIGENCIA_CONTRATO_FECHAMENTO_PLATAFORMA_BID_FRETE_INTERNACIONAL,
} from '../../../shared/contrato-fechamento-plataforma-bid-frete-internacional.js'
import {
  montarDocumentoContratoPropostaPlataformaBidFreteInternacional,
  VERSAO_CONTRATO_PROPOSTA_PLATAFORMA_BID_FRETE_INTERNACIONAL,
  DATA_VIGENCIA_CONTRATO_PROPOSTA_PLATAFORMA_BID_FRETE_INTERNACIONAL,
} from '../../../shared/contrato-proposta-plataforma-bid-frete-internacional.js'

export function calcularHashTextoContratoPlataformaBidFreteInternacional(texto: string): string {
  return createHash('sha256').update(texto, 'utf8').digest('hex')
}

export function calcularHashDocumentoContratoFechamentoPlataformaBidFreteInternacional(
  pagador: EmpresaPagadoraTaxaFechamentoPlataformaGravity | null | undefined,
  contexto?: ContextoIdentificacaoFornecedorContratoBidFreteInternacional | null,
): string {
  const documento = montarDocumentoContratoFechamentoPlataformaBidFreteInternacional(pagador, contexto)
  const corpo = serializarTextoContratoPlataformaParaHash(documento.secoes)
  const cabecalho = [
    VERSAO_CONTRATO_FECHAMENTO_PLATAFORMA_BID_FRETE_INTERNACIONAL,
    DATA_VIGENCIA_CONTRATO_FECHAMENTO_PLATAFORMA_BID_FRETE_INTERNACIONAL,
    documento.slug,
  ].join('\n')
  return calcularHashTextoContratoPlataformaBidFreteInternacional(`${cabecalho}\n${corpo}`)
}

export function calcularHashDocumentoContratoPropostaPlataformaBidFreteInternacional(
  pagador: EmpresaPagadoraTaxaFechamentoPlataformaGravity | null | undefined,
  contexto?: ContextoIdentificacaoFornecedorContratoBidFreteInternacional | null,
): string {
  const documento = montarDocumentoContratoPropostaPlataformaBidFreteInternacional(pagador, contexto)
  const corpo = serializarTextoContratoPlataformaParaHash(documento.secoes)
  const cabecalho = [
    VERSAO_CONTRATO_PROPOSTA_PLATAFORMA_BID_FRETE_INTERNACIONAL,
    DATA_VIGENCIA_CONTRATO_PROPOSTA_PLATAFORMA_BID_FRETE_INTERNACIONAL,
    documento.slug,
  ].join('\n')
  return calcularHashTextoContratoPlataformaBidFreteInternacional(`${cabecalho}\n${corpo}`)
}
