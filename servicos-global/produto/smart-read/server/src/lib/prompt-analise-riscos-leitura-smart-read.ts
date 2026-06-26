/**
 * prompt-analise-riscos-leitura-smart-read.ts — system/user prompts V2a + V3a
 */

import type { ContextoAuditoriaV1Leitura, DocumentoAnaliseRisco } from '../../../shared/analise-riscos-leitura-smart-read.js'

export const SYSTEM_PROMPT_ANALISE_RISCOS_LEITURA = `Voce e um auditor senior de comercio exterior da plataforma Gravity Smart Read.
Analise o JSON extraido de Commercial Invoice(s) e documentos correlatos da mesma leitura.

REGRAS ABSOLUTAS:
1. NAO recalcule totais matematicos — a auditoria V1 ja validou qty x preco e somas. Assuma matematica correta salvo indicao explicita no JSON.
2. NAO repita riscos ja listados em "riscos_v1_ja_detectados" (mesmo titulo ou mesma evidencia).
3. Foque em: completude comercial, coerencia logistica, semantica de itens, risco documental, conformidade aduaneira com base em "tributos_ncm" e "normas_injetadas".
4. Cards normativos (categoria "normativo") EXIGEM citacoes_normativas com referencia rastreavel (NCM oficial, portal_unico, kb_gravity).
5. Responda APENAS JSON valido no schema solicitado — array "riscos" em portugues brasileiro.
6. Nao e parecer juridico — use linguagem de alerta operacional para conferencia.
7. Todo risco DEVE incluir "correcao_sugerida": acao concreta e curta (1-3 frases) que o conferente pode executar na aba Conferencia de Campos ou no processo.`

export function montarPromptUsuarioAnaliseRiscosLeitura(params: {
  documentos: DocumentoAnaliseRisco[]
  contextoV1: ContextoAuditoriaV1Leitura
  riscosV1Titulos: string[]
  pergunta?: string
  chunksRag?: string[]
}): string {
  const normasInjetadas = [
    'Incoterms 2020: EXW — comprador assume frete/seguro do local do vendedor; FOB — vendedor entrega no porto origem; CIF — vendedor paga frete e seguro ate porto destino.',
    'Importacao Brasil: NCM de 8 digitos obrigatorio para classificacao fiscal (Tabela TI/Siscomex).',
    'Importador em Manaus/AM (ZFM/Suframa): verificar documentacao e beneficio fiscal aplicavel.',
    'Invoice para despacho: exportador, importador, descricao mercadoria, quantidades, valores, moeda, Incoterm, origem quando aplicavel.',
    'Produtos sujeitos a anuencia (Anvisa, Mapa, Inmetro): descricao e laudos podem ser exigidos conforme NCM — sinalizar se descricao indicar alimentos, cosmeticos, eletronicos, agro.',
  ]

  const blocoPergunta = params.pergunta
    ? `\n\nPERGUNTA SOB DEMANDA DO USUARIO:\n${params.pergunta}\nInclua riscos ou resposta estruturada que respondam a pergunta.`
    : ''

  return `AUDITORIA V1 JA EXECUTADA (nao recalcular — apenas contexto):
${JSON.stringify(
  {
    regras_v1: params.contextoV1.regras,
    ncms_encontrados: params.contextoV1.ncms_encontrados,
    tributos_ncm: params.contextoV1.tributos_ncm,
    riscos_v1_ja_detectados: params.riscosV1Titulos,
    normas_injetadas: normasInjetadas,
    chunks_rag_normativo: params.chunksRag?.length ? params.chunksRag : undefined,
  },
  null,
  2,
)}

DOCUMENTOS (resultado_extracao.dados):
${JSON.stringify(params.documentos, null, 2)}

Retorne JSON: { "riscos": [ { "severidade": "critico|atencao|informativo", "categoria": "ncm|cnpj|incoterm|documental|cruzado|matematico|comercial|normativo", "titulo": "...", "motivo": "...", "analise": "...", "correcao_sugerida": "acao concreta para o conferente", "evidencias": [{"documento":"...","campo":"...","valor":"..."}], "citacoes_normativas": [{"tipo":"ncm_oficial|kb_gravity|portal_unico|instrucao_normativa","referencia":"...","trecho":"..."}] } ] }
${blocoPergunta}`
}
