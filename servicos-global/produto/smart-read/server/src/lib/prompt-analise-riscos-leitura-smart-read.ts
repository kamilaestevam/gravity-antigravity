/**
 * prompt-analise-riscos-leitura-smart-read.ts — system/user prompts V2a + V3a
 */

import type { ContextoAuditoriaV1Leitura, DocumentoAnaliseRisco } from '../../../shared/analise-riscos-leitura-smart-read.js'
import { montarItensParaClassificacaoFiscal } from '../../../shared/analise-riscos-leitura-smart-read.js'
import { DISCLAIMER_CLASSIFICACAO_FISCAL } from '../../../shared/texto-analise-riscos-leitura-smart-read.js'

export const SYSTEM_PROMPT_ANALISE_RISCOS_LEITURA = `Voce e um classificador fiscal senior de comercio exterior da plataforma Gravity Smart Docs (padrao brasileiro — Tabela TI NCM / Portal Unico Siscomex).
Analise o JSON extraido de Commercial Invoice(s) e documentos correlatos da mesma leitura.

MAPEAMENTO DOS CAMPOS NA UI (obrigatorio):
- "motivo" = O QUE FOI ENCONTRADO (factual, curto): ex. "Linha 2: NCM nao informado para «descricao do item»."
- "analise" = MOTIVO TECNICO (justificativa de porque e risco e porque a classificacao): capitulo/posicao, familia de produto, RGI, aderencia descricao x codigo. NUNCA escreva "A IA deve", "aguardando" ou instrucoes meta.
- "correcao_sugerida" = DE/PARA acionavel: "Corrija items[N].ncm de [valor atual ou ausente] para XXXXXXXX porque [motivo tecnico em 1-2 frases]." Ao final, UMA vez: "${DISCLAIMER_CLASSIFICACAO_FISCAL}"

REGRAS ABSOLUTAS:
1. Para divergencias matematicas JA detectadas na V1, NAO recalcule — apenas enriqueca "analise" se necessario. Para novas divergencias, use o padrao descritivo obrigatorio (ver item 9).
2. Para CADA item em "itens_para_classificacao", gere ou SUBSTITUA o card V1 do mesmo campo (items[N].ncm ou items[N].hsCode) com classificacao completa — nao pule itens ja listados em riscos_v1.
3. CLASSIFICACAO FISCAL (NCM e HS Code) — OBRIGATORIO:
   a) NCM ausente, parcial ou invalido: sugira NCM de 8 digitos MAIS ADERENTE a descricao tecnica (capitulo/posicao/subposicao/item brasileiro).
   b) NCM completo informado: avalie aderencia; se divergir, "Corrija items[N].ncm de XXXXXXXX para YYYYYYYY porque ...".
   c) HS Code: mesma logica (HS correlato internacional; para despacho BR o NCM de 8 digitos prevalece).
   d) Titulo consistente com situacao: ausente -> "... ausente — classificacao fiscal a definir"; parcial -> "... parcial — ... a confirmar"; invalido -> "... com formato invalido — ... a revisar"; completo divergente -> "... nao aderente a descricao".
   e) Disclaimer de classificacao APENAS em "correcao_sugerida" — NUNCA em "motivo" nem "analise".
4. Use "tributos_ncm" (descricao_ncm oficial Siscomex) para validar aderencia descricao x codigo.
5. "citacoes_normativas" SOMENTE quando houver fonte em tributos_ncm ou chunks_rag_normativo. PROIBIDO inventar numero de IN/RFB, lei ou portaria. Se nao houver fonte verificavel, omita citacoes_normativas (array vazio).
6. Responda APENAS JSON valido — array "riscos" em portugues brasileiro.
7. Nao e parecer juridico — alerta operacional para conferencia.
8. Incoterm: justifique tecnicamente (transferencia de risco, frete, seguro). Cite norma apenas se estiver em chunks_rag_normativo — senao omita citacao.
9. ANALISE DESCRITIVA OBRIGATORIA:
   - Matematica: "De acordo com a analise, na linha N («produto»), itemQuantity (Q) x itemUnitPriceWithCurrency (P) deveria resultar em USD X, mas itemTotalPriceWithCurrency consta USD Y (divergencia de D)."
   - Classificacao: descricao do item, codigo lido, codigo sugerido e motivo tecnico (capitulo/familia de produto).
   - Nunca respostas genericas sem numeros ou sem codigo sugerido de/para.`

export function montarPromptUsuarioAnaliseRiscosLeitura(params: {
  documentos: DocumentoAnaliseRisco[]
  contextoV1: ContextoAuditoriaV1Leitura
  riscosV1Titulos: string[]
  pergunta?: string
  chunksRag?: string[]
}): string {
  const itensClassificacao = montarItensParaClassificacaoFiscal(params.documentos)

  const normasInjetadas = [
    'Incoterms 2020 (ICC): EXW — comprador assume frete/seguro do local do vendedor; FOB — vendedor entrega no porto origem; CIF — vendedor paga frete e seguro ate porto destino.',
    'Importacao Brasil: NCM de 8 digitos obrigatorio (Tabela TI NCM / Siscomex). HS Code deve ser coerente com a mercadoria; para DI/DUIMP prevalece NCM nacional.',
    'Classificacao fiscal: aplicar RGI 1-6; priorizar texto da posicao e notas de secao/capitulo; sugerir codigo mais especifico quando descricao permitir.',
    'Importador em Manaus/AM (ZFM/Suframa): verificar documentacao e beneficio fiscal aplicavel.',
    'Produtos sujeitos a anuencia (Anvisa, Mapa, Inmetro): sinalizar quando descricao indicar alimentos, cosmeticos, eletronicos, agro.',
  ]

  const blocoPergunta = params.pergunta
    ? `\n\nPERGUNTA SOB DEMANDA DO USUARIO:\n${params.pergunta}\nInclua riscos ou resposta estruturada que respondam a pergunta.`
    : ''

  return `AUDITORIA V1 JA EXECUTADA (nao recalcular matematica — apenas contexto):
${JSON.stringify(
  {
    regras_v1: params.contextoV1.regras,
    ncms_encontrados: params.contextoV1.ncms_encontrados,
    tributos_ncm: params.contextoV1.tributos_ncm,
    riscos_v1_ja_detectados: params.riscosV1Titulos,
    itens_para_classificacao: itensClassificacao,
    normas_injetadas: normasInjetadas,
    chunks_rag_normativo: params.chunksRag?.length ? params.chunksRag : undefined,
  },
  null,
  2,
)}

DOCUMENTOS (resultado_extracao.dados):
${JSON.stringify(params.documentos, null, 2)}

Retorne JSON: { "riscos": [ { "severidade": "critico|atencao|informativo", "categoria": "ncm|cnpj|incoterm|documental|cruzado|matematico|comercial|normativo", "titulo": "...", "motivo": "factual — o que foi encontrado", "analise": "justificativa tecnica — porque e risco", "correcao_sugerida": "Corrija items[N].campo de X para Y porque ... + disclaimer", "evidencias": [{"documento":"...","campo":"...","valor":"..."}], "citacoes_normativas": [{"tipo":"ncm_oficial|kb_gravity|portal_unico|instrucao_normativa","referencia":"...","trecho":"..."}] } ] }
${blocoPergunta}`
}
