/**
 * prompt-analista-pedido-compra-smart-read.ts — Analista LLM da matriz PC (PC1–PC9).
 */

import type {
  ContextoAuditoriaV1Leitura,
  DocumentoAnaliseRisco,
} from '../../../shared/analise-riscos-leitura-smart-read.js'
import {
  compactarDocumentoParaPromptLlmAnaliseRiscos,
  serializarPayloadPromptLlm,
} from '../../../shared/compactar-documento-prompt-llm-analise-riscos-smart-read.js'

export const SYSTEM_PROMPT_ANALISTA_PEDIDO_COMPRA = `Voce e especialista em comercio exterior e valoração aduaneira, atuando como inteligencia analitica do Gravity Smart Docs.
Voce recebe dados extraidos de um Pedido de Compra (Purchase Order / PO) e, quando disponiveis, do Pedido de Venda, da Commercial Invoice e demais documentos da mesma leitura.

REGRAS ABSOLUTAS:
1. NAO recalcule matematica — os resultados do motor Codigo (datas, moeda, incoterm, quantidades, precos, totais, gates) sao verdade absoluta.
2. Consequencia de falha grave aqui inclui risco de VALORACAO ADUANEIRA, interposição de pessoa e inconsistencia cambial. PC9-04 deve expressar exposicao quando possivel.
3. Regras da matriz PC sob sua responsabilidade (motor IA/RAG/cross_doc semantico):
   - PC1-04: revisao/versao do PO — detectar versoes divergentes e exigir a vigente.
   - PC2-01/PC2-03: comprador e vendedor — coerencia semantica com importador/exportador da invoice (ignore abreviacoes: Ltd vs Limited, S/A vs S.A.).
   - PC2-04: comprador do PO difere do importador DUIMP sem declaracao de conta e ordem/encomenda — gate de interposicao.
   - PC2-05: indicios de partes relacionadas (intercompany) para verificacao de valoração AVA-GATT art. 1º §2º.
   - PC3-02: prazo de entrega/embarque acordado — coerencia com BL/AWB quando disponivel.
   - PC3-03: origem/destino acordados — coerencia com CO e rota.
   - PC3-04: termos de pagamento — coerencia com invoice e câmbio.
   - PC4-01/PC4-02: part number/SKU e descricao especifica por item — rejeitar genericos.
   - PC4-05: marca e modelo por item quando presentes — atributos Catálogo DUIMP.
   - PC5-04/PC5-05: descontos com natureza declarada; royalties, ferramental, assists que compoem valor aduaneiro.
   - PC6-01/PC6-03: dados bancarios e pre-pagamento — coerencia cambial.
   - PC7-01/PC7-03: aprovacao/assinatura do comprador e T&C anexos.
   - PC8-01 a PC8-03: NCM esperada, anuencias antecipadas, bens usados/remanufaturados.
   - PC9-01/PC9-02/PC9-03: legibilidade, coerencia global PC×PV×invoice, plausibilidade de preco vs mercado.
4. Regras condicionais (COND) sem gatilho: NAO gere risco — N/A.
5. NAO invente leis — citacoes_normativas somente com base no contexto.
6. Mapeamento UI: motivo=factual, analise=justificativa tecnica, correcao_sugerida=acao objetiva.
7. Cada alerta: secao_matriz, id_regra_matriz (PC#-##), motor_validacao, status_matriz.
8. BLOQ = "critico"; demais = "atencao" ou "informativo".
9. Responda APENAS JSON: { "riscos": [ ... ] }`

export function montarPromptAnalistaPedidoCompra(params: {
  documentosPc: DocumentoAnaliseRisco[]
  documentosPv: DocumentoAnaliseRisco[]
  documentosInvoice: DocumentoAnaliseRisco[]
  contexto: ContextoAuditoriaV1Leitura
  chunksRag?: string[]
}): string {
  const regrasCodigoPc = params.contexto.regras.filter((regra) => /^PC\d+-\d+/.test(regra.id))
  const pcCompacto = params.documentosPc.map(compactarDocumentoParaPromptLlmAnaliseRiscos)
  const pvCompacto = params.documentosPv.map(compactarDocumentoParaPromptLlmAnaliseRiscos)
  const invoiceCompacto = params.documentosInvoice.map(compactarDocumentoParaPromptLlmAnaliseRiscos)
  return `MOTOR CODIGO PC — RESULTADOS DETERMINISTICOS (NAO RECALCULAR):
${serializarPayloadPromptLlm(regrasCodigoPc)}

RAG NORMATIVO (valoração, cambio, anuencias):
${params.chunksRag?.length ? serializarPayloadPromptLlm(params.chunksRag) : 'nenhum'}

PEDIDO DE COMPRA (PO) EXTRAIDO:
${serializarPayloadPromptLlm(pcCompacto)}

PEDIDO(S) DE VENDA DA MESMA LEITURA:
${serializarPayloadPromptLlm(pvCompacto)}

INVOICE(S) DA MESMA LEITURA:
${serializarPayloadPromptLlm(invoiceCompacto)}

Retorne JSON: { "riscos": [{ "severidade": "critico|atencao|informativo", "categoria": "documental|cruzado|comercial|normativo", "titulo": "...", "motivo": "...", "analise": "...", "correcao_sugerida": "...", "evidencias": [{ "documento": "...", "campo": "...", "valor": "..." }], "secao_matriz": "...", "id_regra_matriz": "PC#-##", "motor_validacao": "llm|rag|cross_doc", "status_matriz": "vermelho|amarelo|verde", "citacoes_normativas": [] }] }`
}
