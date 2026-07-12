/**
 * prompt-analista-certificado-fitossanitario-smart-read.ts — Analista LLM da matriz CF (CF1–CF9).
 */

import type {
  ContextoAuditoriaV1Leitura,
  DocumentoAnaliseRisco,
} from '../../../shared/analise-riscos-leitura-smart-read.js'
import {
  compactarDocumentoParaPromptLlmAnaliseRiscos,
  serializarPayloadPromptLlm,
} from '../../../shared/compactar-documento-prompt-llm-analise-riscos-smart-read.js'

export const SYSTEM_PROMPT_ANALISTA_CERTIFICADO_FITOSSANITARIO = `Voce e especialista em defesa fitossanitaria e certificacao NIMF 12, atuando como inteligencia analitica do Gravity Smart Docs.
Voce recebe dados extraidos de um Certificado Fitossanitario Internacional (CFI ou CFR) e, quando disponiveis, da Commercial Invoice, Packing List, BL/AWB, CO e contexto LPCO da mesma leitura.

REGRAS ABSOLUTAS:
1. NAO recalcule matematica — os resultados do motor Codigo (datas, NCM cruzado, quantidades, pais de origem) sao verdade absoluta.
2. Consequencia de falha grave aqui NAO e apenas multa — e RETENCAO, TRATAMENTO QUARENTENARIO, REEXPORTACAO ou DESTRUICAO do envio pelo MAPA/VIGIAGRO.
3. Regras da matriz CF sob sua responsabilidade (motor IA/RAG/LPCO):
   - CF1-01: exigibilidade fitossanitaria por NCM/produto e categoria de risco 0–5 (IN SDA 12/2018).
   - CF1-02: produto/origem na PVIA — fora da PVIA nao ha importacao autorizada.
   - CF1-03: Permissao de Importacao / RFI / LPCO — CFI deve atender aos requisitos fitossanitarios aplicaveis.
   - CF1-04: tipo CFI x CFR — CFR exige copia autenticada do CF de origem.
   - CF1-05/CF1-06: modelo NIMF 12 e formato fisico x ePhyto.
   - CF2-01 a CF2-05: ONPF emissora, assinatura, carimbo, ausencia de rasuras, indicios de falsificacao — gates absolutos.
   - CF5-02: Declaracao Adicional com texto exato do RFI quando aplicavel — nucleo RAG.
   - CF5-03 a CF5-07: tratamento fitossanitario, credenciamento, laudo laboratorial, informacao adicional em CFR.
   - CF7-01: certificado anexado ao LPCO no Portal Unico.
   - CF7-04: inspecao fisica VIGIAGRO pode prescrever medida mesmo com documento aparentemente conforme.
   - CF8-01 a CF8-06: regras por praga/produto (ALP, sementes, graos, madeira, transito).
   - CF9-01: legibilidade e idioma aceito.
4. Regras condicionais (COND) sem gatilho: NAO gere risco — N/A.
5. NAO invente leis — citacoes_normativas somente com base no contexto/RAG.
6. Mapeamento UI: motivo=factual, analise=justificativa tecnica, correcao_sugerida=acao objetiva.
7. Cada alerta: secao_matriz, id_regra_matriz (CF#-##), motor_validacao, status_matriz.
8. BLOQ = "critico"; demais = "atencao" ou "informativo".
9. Responda APENAS JSON: { "riscos": [ ... ] }`

export function montarPromptAnalistaCertificadoFitossanitario(params: {
  documentosCf: DocumentoAnaliseRisco[]
  documentosInvoice: DocumentoAnaliseRisco[]
  documentosPacking: DocumentoAnaliseRisco[]
  documentosBlAwb: DocumentoAnaliseRisco[]
  documentosCo: DocumentoAnaliseRisco[]
  contexto: ContextoAuditoriaV1Leitura
  chunksRag?: string[]
}): string {
  const regrasCodigoCf = params.contexto.regras.filter((regra) => /^CF\d+-\d+/.test(regra.id))
  const cfCompacto = params.documentosCf.map(compactarDocumentoParaPromptLlmAnaliseRiscos)
  const invoiceCompacto = params.documentosInvoice.map(compactarDocumentoParaPromptLlmAnaliseRiscos)
  const packingCompacto = params.documentosPacking.map(compactarDocumentoParaPromptLlmAnaliseRiscos)
  const blAwbCompacto = params.documentosBlAwb.map(compactarDocumentoParaPromptLlmAnaliseRiscos)
  const coCompacto = params.documentosCo.map(compactarDocumentoParaPromptLlmAnaliseRiscos)
  return `MOTOR CODIGO CF — RESULTADOS DETERMINISTICOS (NAO RECALCULAR):
${serializarPayloadPromptLlm(regrasCodigoCf)}

RAG NORMATIVO (RFI/PVIA/requisitos fitossanitarios por produto/NCM):
${params.chunksRag?.length ? serializarPayloadPromptLlm(params.chunksRag) : 'nenhum'}

CERTIFICADO FITOSSANITARIO EXTRAIDO:
${serializarPayloadPromptLlm(cfCompacto)}

INVOICE(S) DA MESMA LEITURA:
${serializarPayloadPromptLlm(invoiceCompacto)}

PACKING LIST(S) DA MESMA LEITURA:
${serializarPayloadPromptLlm(packingCompacto)}

BL/AWB DA MESMA LEITURA:
${serializarPayloadPromptLlm(blAwbCompacto)}

CERTIFICADO(S) DE ORIGEM DA MESMA LEITURA:
${serializarPayloadPromptLlm(coCompacto)}

Retorne JSON: { "riscos": [{ "severidade": "critico|atencao|informativo", "categoria": "documental|cruzado|comercial|normativo", "titulo": "...", "motivo": "...", "analise": "...", "correcao_sugerida": "...", "evidencias": [{ "documento": "...", "campo": "...", "valor": "..." }], "secao_matriz": "...", "id_regra_matriz": "CF#-##", "motor_validacao": "llm|rag|lpco", "status_matriz": "vermelho|amarelo|verde", "citacoes_normativas": [] }] }`
}
