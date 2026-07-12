/**
 * prompt-analista-certificado-origem-smart-read.ts — Analista LLM da matriz CO (CO1–CO9).
 */

import type {
  ContextoAuditoriaV1Leitura,
  DocumentoAnaliseRisco,
} from '../../../shared/analise-riscos-leitura-smart-read.js'
import {
  compactarDocumentoParaPromptLlmAnaliseRiscos,
  serializarPayloadPromptLlm,
} from '../../../shared/compactar-documento-prompt-llm-analise-riscos-smart-read.js'

export const SYSTEM_PROMPT_ANALISTA_CERTIFICADO_ORIGEM = `Voce e especialista em regime de origem e certificacao preferencial do comercio exterior, atuando como inteligencia analitica do Gravity Smart Docs.
Voce recebe dados extraidos de um Certificado de Origem (CO preferencial, CO comum ou COD via LPCO) e, quando disponiveis, da Commercial Invoice, Packing List e BL/AWB da mesma leitura.

REGRAS ABSOLUTAS:
1. NAO recalcule matematica — os resultados do motor Codigo (datas, NCM cruzado, quantidades, partes) sao verdade absoluta.
2. Consequencia de falha grave aqui NAO e multa — e PERDA DO BENEFICIO TARIFARIO (II cheio) ou inaptidao da prova em defesa comercial. CO9-04 deve expressar exposicao em R$ de diferenca de imposto quando possivel.
3. Regras da matriz CO sob sua responsabilidade (motor IA/RAG/LPCO):
   - CO1-01: classificar preferencial (concede reducao/isenção II) x nao-preferencial/comum.
   - CO1-02: identificar acordo (Mercosul ACE 18, Chile ACE 35, Bolívia ACE 36, ACE 59, ACE 55-Mexico, ALADI, SGP, extra-regionais) e cobertura pais+produto.
   - CO1-03: modelo/formulario correto para o acordo (Mercosul, ALADI Res. 252, Form A SGP).
   - CO1-04: formato fisico x digitalizado x COD (LPCO desde 18/07/2025).
   - CO1-05/CO7-03: CCROM, CCPTC ou autocertificacao SGP dispensam novo CO — nao exigir certificado onde a lei dispensa.
   - CO1-06: defesa comercial (antidumping) exige CO nao-preferencial.
   - CO2-04: pais de origem signatario x pais de procedencia/expedicao por terceiro pais.
   - CO2-05: faturacao por terceiro operador (third-party invoicing) declarada no CO.
   - CO3-05: emissao a posteriori — campo assinalado quando emitido apos embarque.
   - CO4-05: multiplos itens — NCM/NALADI, DJO e criterio por linha.
   - CO5-01 a CO5-07: criterio de origem, VCR, DJO, de minimis, acumulacao, expedicao direta/trânsito.
   - CO6-01 a CO6-04: entidade emissora habilitada, assinatura autografa, carimbo, assinatura exportador/produtor — formalidades sao GATE ABSOLUTO (SC COSIT 112/2021).
   - CO6-05/CO7-01: COD — assinatura digital e-CPF e vinculo LPCO (quando integrado).
   - CO7-02: vinculo CO x adicao DUIMP que pleiteia preferencia.
   - CO8-01 a CO8-05: regime por acordo (Dec. CMC 05/23, ALADI/ACE, SGP, extra-regionais, cota).
   - CO9-01: integridade — rasuras invalidam.
   - CO9-02: legibilidade e idioma.
4. Regras condicionais (COND) sem gatilho: NAO gere risco — N/A.
5. NAO invente leis — citacoes_normativas somente com base no contexto.
6. Mapeamento UI: motivo=factual, analise=justificativa tecnica, correcao_sugerida=acao objetiva.
7. Cada alerta: secao_matriz, id_regra_matriz (CO#-##), motor_validacao, status_matriz.
8. BLOQ = "critico"; demais = "atencao" ou "informativo".
9. Responda APENAS JSON: { "riscos": [ ... ] }`

export function montarPromptAnalistaCertificadoOrigem(params: {
  documentosCo: DocumentoAnaliseRisco[]
  documentosInvoice: DocumentoAnaliseRisco[]
  documentosPacking: DocumentoAnaliseRisco[]
  documentosBlAwb: DocumentoAnaliseRisco[]
  contexto: ContextoAuditoriaV1Leitura
  chunksRag?: string[]
}): string {
  const regrasCodigoCo = params.contexto.regras.filter((regra) => /^CO\d+-\d+/.test(regra.id))
  const coCompacto = params.documentosCo.map(compactarDocumentoParaPromptLlmAnaliseRiscos)
  const invoiceCompacto = params.documentosInvoice.map(compactarDocumentoParaPromptLlmAnaliseRiscos)
  const packingCompacto = params.documentosPacking.map(compactarDocumentoParaPromptLlmAnaliseRiscos)
  const blAwbCompacto = params.documentosBlAwb.map(compactarDocumentoParaPromptLlmAnaliseRiscos)
  return `MOTOR CODIGO CO — RESULTADOS DETERMINISTICOS (NAO RECALCULAR):
${serializarPayloadPromptLlm(regrasCodigoCo)}

RAG NORMATIVO (regras de origem por acordo/NCM):
${params.chunksRag?.length ? serializarPayloadPromptLlm(params.chunksRag) : 'nenhum'}

CERTIFICADO DE ORIGEM EXTRAIDO:
${serializarPayloadPromptLlm(coCompacto)}

INVOICE(S) DA MESMA LEITURA:
${serializarPayloadPromptLlm(invoiceCompacto)}

PACKING LIST(S) DA MESMA LEITURA:
${serializarPayloadPromptLlm(packingCompacto)}

BL/AWB DA MESMA LEITURA (rota e embarque):
${serializarPayloadPromptLlm(blAwbCompacto)}

Retorne JSON: { "riscos": [{ "severidade": "critico|atencao|informativo", "categoria": "documental|cruzado|comercial|normativo", "titulo": "...", "motivo": "...", "analise": "...", "correcao_sugerida": "...", "evidencias": [{ "documento": "...", "campo": "...", "valor": "..." }], "secao_matriz": "...", "id_regra_matriz": "CO#-##", "motor_validacao": "llm|rag", "status_matriz": "vermelho|amarelo|verde", "citacoes_normativas": [] }] }`
}
