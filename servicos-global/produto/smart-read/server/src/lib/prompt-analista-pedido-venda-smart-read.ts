/**
 * prompt-analista-pedido-venda-smart-read.ts — Analista LLM da matriz PV (PV1–PV9).
 */

import type {
  ContextoAuditoriaV1Leitura,
  DocumentoAnaliseRisco,
} from '../../../shared/analise-riscos-leitura-smart-read.js'
import {
  compactarDocumentoParaPromptLlmAnaliseRiscos,
  serializarPayloadPromptLlm,
} from '../../../shared/compactar-documento-prompt-llm-analise-riscos-smart-read.js'

export const SYSTEM_PROMPT_ANALISTA_PEDIDO_VENDA = `Voce e especialista em comercio exterior e formacao de contratos internacionais (CISG), atuando como inteligencia analitica do Gravity Smart Docs.
Voce recebe dados extraidos de um Pedido de Venda (Sales Order / Order Confirmation) e, quando disponiveis, do Pedido de Compra, da Commercial Invoice e demais documentos da mesma leitura.

REGRAS ABSOLUTAS:
1. NAO recalcule matematica — os resultados do motor Codigo (datas, moeda, incoterm, quantidades, precos, totais, contraproposta PV7-02, gates) sao verdade absoluta.
2. Simetria PV↔PO↔invoice e a regra-mae. Falha grave aqui indica contrato nao fechado, valoração incorreta ou triangulacao financeira. PV9-04 deve expressar exposicao quando possivel.
3. Regras da matriz PV sob sua responsabilidade (motor IA/RAG/cross_doc semantico):
   - PV1-02: classificar natureza — order confirmation, sales order, proforma ou quotation; proforma nao substitui invoice.
   - PV2-01/PV2-03: vendedor e comprador — coerencia semantica com exportador/importador da invoice e PO.
   - PV2-02/PV2-04: fabricante quando vendedor ≠ fabricante; consignatario/entrega a terceiro — cruza notify da invoice.
   - PV2-05: indicios de partes relacionadas (intercompany).
   - PV3-02/PV3-03/PV3-04: prazo de embarque, origem confirmada e termos de pagamento — coerencia com PO, invoice, BL/AWB e cambio.
   - PV3-05: validade da confirmacao/oferta (CISG art. 18 §2º).
   - PV4-01/PV4-02: part number/SKU e descricao confirmada — coerencia com PO e base da invoice.
   - PV4-05: marca e modelo por item — atributos Catálogo DUIMP.
   - PV5-04: frete e seguro em CIF/CIP — coerencia com Incoterm e invoice.
   - PV5-05: descontos com natureza; royalties/ferramental/assists.
   - PV6-01/PV6-02: beneficiario bancario e SWIFT/IBAN quando presentes.
   - PV7-01/PV7-03: assinatura/aprovacao do vendedor e T&C de venda.
   - PV8-01 a PV8-03: HS/NCM informada, anuencias antecipadas, certificados/laudos prometidos.
   - PV9-01/PV9-03: legibilidade e plausibilidade de preco vs mercado.
4. Regras condicionais (COND) sem gatilho: NAO gere risco — N/A.
5. NAO invente leis — citacoes_normativas somente com base no contexto.
6. Mapeamento UI: motivo=factual, analise=justificativa tecnica, correcao_sugerida=acao objetiva.
7. Cada alerta: secao_matriz, id_regra_matriz (PV#-##), motor_validacao, status_matriz.
8. BLOQ = "critico"; demais = "atencao" ou "informativo".
9. Responda APENAS JSON: { "riscos": [ ... ] }`

export function montarPromptAnalistaPedidoVenda(params: {
  documentosPv: DocumentoAnaliseRisco[]
  documentosPc: DocumentoAnaliseRisco[]
  documentosInvoice: DocumentoAnaliseRisco[]
  contexto: ContextoAuditoriaV1Leitura
  chunksRag?: string[]
}): string {
  const regrasCodigoPv = params.contexto.regras.filter((regra) => /^PV\d+-\d+/.test(regra.id))
  const pvCompacto = params.documentosPv.map(compactarDocumentoParaPromptLlmAnaliseRiscos)
  const pcCompacto = params.documentosPc.map(compactarDocumentoParaPromptLlmAnaliseRiscos)
  const invoiceCompacto = params.documentosInvoice.map(compactarDocumentoParaPromptLlmAnaliseRiscos)
  return `MOTOR CODIGO PV — RESULTADOS DETERMINISTICOS (NAO RECALCULAR):
${serializarPayloadPromptLlm(regrasCodigoPv)}

RAG NORMATIVO (CISG, valoração, cambio, anuencias):
${params.chunksRag?.length ? serializarPayloadPromptLlm(params.chunksRag) : 'nenhum'}

PEDIDO DE VENDA (SO/OC) EXTRAIDO:
${serializarPayloadPromptLlm(pvCompacto)}

PEDIDO(S) DE COMPRA DA MESMA LEITURA:
${serializarPayloadPromptLlm(pcCompacto)}

INVOICE(S) DA MESMA LEITURA:
${serializarPayloadPromptLlm(invoiceCompacto)}

Retorne JSON: { "riscos": [{ "severidade": "critico|atencao|informativo", "categoria": "documental|cruzado|comercial|normativo", "titulo": "...", "motivo": "...", "analise": "...", "correcao_sugerida": "...", "evidencias": [{ "documento": "...", "campo": "...", "valor": "..." }], "secao_matriz": "...", "id_regra_matriz": "PV#-##", "motor_validacao": "llm|rag|cross_doc", "status_matriz": "vermelho|amarelo|verde", "citacoes_normativas": [] }] }`
}
