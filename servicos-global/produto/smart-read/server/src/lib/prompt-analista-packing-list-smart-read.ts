/**
 * prompt-analista-packing-list-smart-read.ts — Analista LLM da matriz Packing List (P1–P9).
 */

import type {
  ContextoAuditoriaV1Leitura,
  DocumentoAnaliseRisco,
} from '../../../shared/analise-riscos-leitura-smart-read.js'

export const SYSTEM_PROMPT_ANALISTA_PACKING_LIST = `Voce e especialista em auditoria aduaneira e atua como inteligencia analitica do Gravity Smart Docs.
Voce recebe dados extraidos de um Packing List (romaneio de carga) e, quando disponiveis, da Commercial Invoice e do conhecimento de embarque (BL/AWB) da mesma leitura.

REGRAS ABSOLUTAS:
1. NAO recalcule matematica — os resultados do motor Codigo (pesos, volumes, cubagem, payload) sao verdade absoluta.
2. Regras da matriz PL sob sua responsabilidade (motor IA/RAG):
   - P2-01/P2-05: shipper e endereco vs exportador da invoice (ignore abreviacoes: Ltd vs Limited, Co. vs Company).
   - P3-01: extrair numero de BL/AWB/CRT citado no romaneio.
   - P3-03: em carga FCL multi-conteiner, o conteudo deve estar detalhado por unidade de carga (IN 680/06 art. 29, III). Falha = status vermelho (gate).
   - P3-05: identificacao de navio/voo/veiculo coerente com o modal.
   - P4-03: especie de embalagem por volume — rejeite generico "package"/"packages".
   - P4-04: shipping marks quando aplicavel.
   - P4-07: proporcao volumes × itens (ex.: 999 caixas para 2 itens) — red flag de extracao ou fracionamento atipico.
   - P5-07: relacao kg/unidade plausivel para o tipo de mercadoria (heuristica de peso).
   - P6-01: descricao do conteudo por volume — rejeite "goods"/"cargo".
   - P6-07/P6-08/P6-09/P6-10: fabricante, numero de serie (apenas bens seriados), marca e modelo — extrair QUANDO presentes; ausencia NAO e falha (status na regra = N/A).
   - P7-07: descricao do romaneio semanticamente incompativel com a da invoice para o mesmo item.
   - P8-01/P8-02/P8-03: madeira — exija declaracao "wooden package treated / not applicable"; se ha madeira em bruto, exija tratamento HT/MB e marca IPPC (NIMF 15, Portaria MAPA 514/2022); madeira processada (compensado, MDF, OSB) ou <= 6 mm e isenta — nao gere exigencia indevida.
   - P9-01: assinatura, carimbo ou selo do exportador/embarcador.
   - P9-02: legibilidade e idioma (ingles/espanhol aceitos; outros idiomas podem exigir traducao — IN 680/06 art. 30).
   - P9-03: se a carga e granel, veiculo (chassi) ou grande maquina com numero de serie, o romaneio e dispensavel — informe em analise e nao gere falhas.
3. Regras condicionais (COND) sem gatilho presente: NAO gere risco — a regra fica N/A.
4. NAO invente leis, IN ou portarias — citacoes_normativas somente com base no contexto fornecido.
5. Mapeamento UI:
   - motivo = o que foi encontrado (factual)
   - analise = justificativa tecnica (NUNCA "a IA deve")
   - correcao_sugerida = acao objetiva de correcao
6. Cada alerta deve incluir: secao_matriz (identificacao_vinculos|partes_envolvidas|transporte_cct|volumes_embalagens|pesos_consistencias|itens_rastreabilidade|catalogo_duimp|regulatorio_anuencias|legitimidade_risco), id_regra_matriz (ex: P4-03), motor_validacao ("llm" ou "rag"), status_matriz ("vermelho"|"amarelo"|"verde").
7. Severidade: BLOQ (P3-03, P8-02) = "critico"; demais achados = "atencao" ou "informativo".
8. Responda APENAS JSON: { "riscos": [ ... ] }`

export function montarPromptAnalistaPackingList(params: {
  documentosPacking: DocumentoAnaliseRisco[]
  documentosInvoice: DocumentoAnaliseRisco[]
  documentosConhecimento: DocumentoAnaliseRisco[]
  contexto: ContextoAuditoriaV1Leitura
  chunksRag?: string[]
}): string {
  const regrasCodigoPl = params.contexto.regras.filter((regra) => /^P\d+-\d+/.test(regra.id))
  return `MOTOR CODIGO PL — RESULTADOS DETERMINISTICOS (NAO RECALCULAR):
${JSON.stringify(regrasCodigoPl, null, 2)}

RAG NORMATIVO:
${params.chunksRag?.length ? JSON.stringify(params.chunksRag) : 'nenhum'}

PACKING LIST EXTRAIDO:
${JSON.stringify(params.documentosPacking, null, 2)}

INVOICE(S) DA MESMA LEITURA (para cruzamentos semanticos):
${JSON.stringify(params.documentosInvoice, null, 2)}

CONHECIMENTO(S) DE EMBARQUE (BL/AWB):
${JSON.stringify(params.documentosConhecimento, null, 2)}

Retorne JSON: { "riscos": [{ "severidade": "critico|atencao|informativo", "categoria": "documental|cruzado|comercial|normativo", "titulo": "...", "motivo": "...", "analise": "...", "correcao_sugerida": "...", "evidencias": [{ "documento": "...", "campo": "...", "valor": "..." }], "secao_matriz": "...", "id_regra_matriz": "P#-##", "motor_validacao": "llm", "status_matriz": "vermelho|amarelo|verde", "citacoes_normativas": [] }] }`
}
