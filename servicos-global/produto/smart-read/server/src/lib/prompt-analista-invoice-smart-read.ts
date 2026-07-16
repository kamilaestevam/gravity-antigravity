/**
 * prompt-analista-invoice-smart-read.ts — Passo 3: prompt do Agente Analista (LLM)
 */

import type { ContextoAuditoriaV1Leitura, DocumentoAnaliseRisco } from '../../../shared/analise-riscos-leitura-smart-read.js'
import { montarItensParaClassificacaoFiscal } from '../../../shared/analise-riscos-leitura-smart-read.js'
import {
  compactarDocumentoParaPromptLlmAnaliseRiscos,
  serializarPayloadPromptLlm,
} from '../../../shared/compactar-documento-prompt-llm-analise-riscos-smart-read.js'
import { DISCLAIMER_CLASSIFICACAO_FISCAL } from '../../../shared/texto-analise-riscos-leitura-smart-read.js'

export const SYSTEM_PROMPT_ANALISTA_INVOICE = `Voce e especialista em auditoria aduaneira e atua como inteligencia analitica do Gravity Smart Docs.
Voce recebe dados extraidos de uma Commercial Invoice e dados oficiais do CNPJ do importador (quando disponiveis).

REGRAS ABSOLUTAS:
1. NAO recalcule matematica — os relatorios aritmeticos do Passo 1 (motor Codigo) sao verdade absoluta.
2. Execute analise semantica entre razao social e endereco da fatura vs dados oficiais do CNPJ (S2-03, S2-04).
   - Ignore abreviacoes padrao: S/A vs S.A., Ltda vs Limitada, Av. vs Avenida.
   - Alerta CRITICO se bairro, cidade, raiz do endereco ou designacao matriz vs filial divergirem.
3. Analise descricao de cada item — valide se capitulo/posicao do NCM declarado condiz semanticamente.
   - Se componente eletronico com NCM quimico, alerta de classificacao incorreta.
   - NCM ausente: sugira codigo de 8 digitos com de/para e justificativa tecnica.
4. Procure gatilhos regulatorios: embalagem madeira (MAPA/NIMF 15), Drawback, Suframa/ZFM.
5. Exportador (S2-05), endereco do exportador (S2-06), fabricante (S2-07), endereco do fabricante (S2-08), notify party (S2-09), termos de pagamento, assinatura — completude logica.
6. NAO invente leis, IN ou portarias — citacoes_normativas somente se fornecidas em tributos_ncm ou RAG.
7. Mapeamento UI:
   - motivo = o que foi encontrado (factual)
   - analise = justificativa tecnica (NUNCA "a IA deve")
   - correcao_sugerida = acao de/para + disclaimer fiscal quando classificacao: "${DISCLAIMER_CLASSIFICACAO_FISCAL}"
8. Cada alerta deve incluir: secao_matriz, id_regra_matriz (ex: S2-03), motor_validacao ("llm" ou "rag"), status_matriz ("vermelho"|"amarelo"|"verde").
9. Responda APENAS JSON: { "riscos": [ ... ] }`

export function montarPromptAnalistaInvoice(params: {
  documentos: DocumentoAnaliseRisco[]
  contexto: ContextoAuditoriaV1Leitura
  errosAritmeticos: string[]
  chunksRag?: string[]
}): string {
  const itens = montarItensParaClassificacaoFiscal(params.documentos)
  const documentosCompactos = params.documentos.map(compactarDocumentoParaPromptLlmAnaliseRiscos)
  return `PASSO 1 — ERROS ARITMETICOS (NAO RECALCULAR):
${serializarPayloadPromptLlm(params.errosAritmeticos)}

PASSO 2 — CNPJ OFICIAL (RFB):
${serializarPayloadPromptLlm(params.contexto.cnpj_oficial ?? null)}

ITENS PARA CLASSIFICACAO FISCAL:
${serializarPayloadPromptLlm(itens)}

TRIBUTOS NCM (Siscomex):
${serializarPayloadPromptLlm(params.contexto.tributos_ncm)}

RAG NORMATIVO:
${params.chunksRag?.length ? serializarPayloadPromptLlm(params.chunksRag) : 'nenhum'}

INVOICE EXTRAIDA:
${serializarPayloadPromptLlm(documentosCompactos)}

Retorne JSON: { "riscos": [{ "severidade": "critico|atencao|informativo", "categoria": "ncm|cnpj|incoterm|documental|cruzado|matematico|comercial|normativo", "titulo": "...", "motivo": "...", "analise": "...", "correcao_sugerida": "...", "evidencias": [...], "secao_matriz": "identificacao|cadastral|logistica|itens_fiscais|financeiro|bancario|pesos_embalagens|legitimidade", "id_regra_matriz": "S#-##", "motor_validacao": "llm", "status_matriz": "vermelho|amarelo|verde", "citacoes_normativas": [] }] }`
}
