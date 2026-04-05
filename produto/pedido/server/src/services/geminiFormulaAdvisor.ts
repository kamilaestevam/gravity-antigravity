/**
 * geminiFormulaAdvisor.ts — Análise semântica de fórmulas via Gemini
 *
 * DESABILITADO por padrão — ativar via GEMINI_GABI_ENABLED=true no .env
 * Quando desabilitado, retorna null e o frontend usa análise determinística local.
 *
 * Fluxo:
 *   1. Recebe expressão + campos disponíveis + colunas customizadas do tenant
 *   2. Monta prompt especializado com contexto de negócio do produto Pedido
 *   3. Gemini analisa e retorna { titulo, texto, sugestao? } ou null (fórmula ok)
 *   4. Frontend exibe no card GABI
 */

import { GoogleGenerativeAI } from '@google/generative-ai'

// ── Config ────────────────────────────────────────────────────────────────────

const GEMINI_API_KEY      = process.env.GEMINI_API_KEY ?? ''
const GEMINI_GABI_ENABLED = process.env.GEMINI_GABI_ENABLED === 'true'
const MODEL               = 'gemini-2.5-flash'

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface CampoDisponivel {
  chave:    string
  label:    string
  unidade?: string   // 'quantidade' | 'financeiro' | 'peso' | 'volume'
  papel?:   string   // 'total' | 'parcela' | 'calculado'
  tipo?:    string   // tipo da coluna customizada: 'numero' | 'percentual' | etc.
}

export interface GabiResposta {
  titulo:    string
  texto:     string
  sugestao?: string
}

// ── Prompt de sistema ─────────────────────────────────────────────────────────

function buildPrompt(expressao: string, campos: CampoDisponivel[]): string {
  const listaCampos = campos.map(c => {
    const detalhes = [c.label]
    if (c.unidade) detalhes.push(`unidade: ${c.unidade}`)
    if (c.papel)   detalhes.push(`papel: ${c.papel}`)
    if (c.tipo)    detalhes.push(`tipo: ${c.tipo}`)
    return `  - ${c.chave} (${detalhes.join(', ')})`
  }).join('\n')

  return `Você é a Gabi, assistente inteligente de fórmulas do produto Pedido (sistema de gestão de pedidos de exportação/importação).

REGRAS DE NEGÓCIO DO PRODUTO:
- quantidade_total_inicial_pedido: quantidade total solicitada no pedido (o "todo")
- quantidade_cancelada_total_pedido: porção da inicial que foi cancelada (subconjunto de inicial)
- quantidade_transferida_total: porção que foi transferida/embarcada (subconjunto de inicial)
- quantidade_pronta_itens_pedido_total: porção que está pronta para embarque (subconjunto de inicial)
- saldo_itens_do_pedido: calculado automaticamente = inicial - cancelada - transferida
- valor_total_pedido: valor financeiro total (unidade diferente de quantidade — não pode somar com qtd)
- peso_liquido_total_pedido / peso_bruto_total_pedido: peso (não pode somar com quantidade ou valor)
- cubagem_total_pedido: volume em m³ (não pode somar com outros tipos)

CAMPOS DISPONÍVEIS NESTE TENANT:
${listaCampos}

EXPRESSÃO DO USUÁRIO:
${expressao}

INSTRUÇÕES:
Analise a expressão e responda em JSON com este formato exato:
{
  "problema": true | false,
  "titulo": "título curto do aviso (máx 5 palavras)",
  "texto": "explicação direta em 1-2 frases, linguagem simples, sem jargão técnico",
  "sugestao": "expressão corrigida (apenas se houver problema com solução clara, senão omita)"
}

Se a fórmula estiver semanticamente correta, retorne:
{ "problema": false }

REGRAS DE ANÁLISE:
- Não critique sintaxe (o parser já faz isso)
- Foque em: lógica de negócio, unidades incompatíveis, subconjunto somado ao total, divisão arriscada
- Se o usuário soma uma "parcela" ao seu "total pai", explique que está dobrando o valor
- Se mistura unidades físicas diferentes (qtd + financeiro, peso + volume), explique o problema
- Se divide sem SE(), alerte sobre divisão por zero com exemplo de proteção
- Seja direto, humano, sem ser condescendente
- A sugestão deve ser uma expressão válida que resolve o problema, não um texto`
}

// ── Analisador principal ──────────────────────────────────────────────────────

export async function analisarFormulaComGemini(
  expressao: string,
  campos: CampoDisponivel[],
): Promise<GabiResposta | null> {
  if (!GEMINI_GABI_ENABLED || !GEMINI_API_KEY) {
    return null // frontend usa fallback determinístico
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({
      model: MODEL,
      generationConfig: {
        temperature:     0.2,  // baixa temperatura = respostas consistentes
        maxOutputTokens: 256,  // resposta curta
        responseMimeType: 'application/json',
      },
    })

    const prompt = buildPrompt(expressao, campos)
    const result = await model.generateContent(prompt)
    const texto  = result.response.text().trim()

    const json = JSON.parse(
      texto.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()
    )

    if (!json.problema) return null // fórmula ok

    return {
      titulo:   json.titulo  ?? 'Verifique a fórmula',
      texto:    json.texto   ?? '',
      sugestao: json.sugestao,
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.warn(`[GeminiGabi] Falhou — usando fallback determinístico. Erro: ${msg}`)
    return null // fallback transparente
  }
}
