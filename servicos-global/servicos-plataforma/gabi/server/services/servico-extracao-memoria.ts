// server/services/servico-extracao-memoria.ts
// Extracao automatica de memoria pos-turno: depois de cada resposta da Gabi,
// um modelo barato (flash-lite) le o par pergunta/resposta e extrai fatos
// duraveis sobre o usuario (preferencias, contexto de trabalho, padroes).
// Roda em background (fire-and-forget) para nao adicionar latencia ao chat.

import { GoogleGenAI, Type } from '@google/genai'
import { MODELO_AUXILIAR } from '../lib/modelos-gemini.js'
import { salvarMemoria, type TipoMemoria } from './servico-memoria.js'

interface ContextoExtracao {
  id_organizacao: string
  id_usuario: string
}

interface FatoExtraido {
  tipo: TipoMemoria
  chave: string
  valor: string
}

const TIPOS_VALIDOS: TipoMemoria[] = ['preferencia', 'contexto', 'onboarding', 'padrao', 'feedback']
const MAX_FATOS_POR_TURNO = 3

let _genAI: GoogleGenAI | null = null
function getGenAI(): GoogleGenAI {
  if (!_genAI) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error('GEMINI_API_KEY obrigatoria para extracao de memoria')
    _genAI = new GoogleGenAI({ apiKey })
  }
  return _genAI
}

const PROMPT_EXTRACAO = `Voce extrai fatos DURAVEIS sobre o usuario a partir de uma conversa com a assistente Gabi (plataforma de comercio exterior).

Extraia SOMENTE fatos que valem lembrar em conversas futuras:
- preferencia: como o usuario gosta de trabalhar (ex: "prefere ver valores em USD", "quer respostas curtas")
- contexto: fatos estaveis do trabalho dele (ex: "importa da China", "atua com produtos eletronicos")
- padrao: comportamento recorrente (ex: "costuma consultar pedidos atrasados as segundas")
- feedback: correcoes que ele deu a Gabi

NAO extraia: perguntas pontuais, dados transitorios (um numero de pedido especifico), saudacoes, ou qualquer coisa efemera.
Se NADA vale lembrar, retorne lista vazia.

Cada fato tem: tipo (um dos acima), chave (identificador curto em snake_case, ex: "moeda_preferida"), valor (frase curta em portugues).
No maximo ${MAX_FATOS_POR_TURNO} fatos, os mais relevantes.`

const schemaResposta = {
  type: Type.OBJECT,
  properties: {
    fatos: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          tipo: { type: Type.STRING, enum: TIPOS_VALIDOS as string[] },
          chave: { type: Type.STRING },
          valor: { type: Type.STRING },
        },
        required: ['tipo', 'chave', 'valor'],
      },
    },
  },
  required: ['fatos'],
}

function validarFato(f: unknown): FatoExtraido | null {
  if (!f || typeof f !== 'object') return null
  const o = f as Record<string, unknown>
  const tipo = o.tipo as TipoMemoria
  const chave = typeof o.chave === 'string' ? o.chave.trim() : ''
  const valor = typeof o.valor === 'string' ? o.valor.trim() : ''
  if (!TIPOS_VALIDOS.includes(tipo) || !chave || !valor) return null
  return { tipo, chave: chave.slice(0, 80), valor: valor.slice(0, 500) }
}

/**
 * Extrai e salva memorias do turno. Fire-and-forget: chamar sem await no fluxo
 * do chat (ou com void). Falhas sao engolidas — extracao e best-effort.
 */
export async function extrairMemoriasDoTurno(
  ctx: ContextoExtracao,
  mensagemUsuario: string,
  respostaAssistente: string,
): Promise<{ salvos: number }> {
  try {
    const resposta = await getGenAI().models.generateContent({
      model: MODELO_AUXILIAR,
      contents: `Usuario: ${mensagemUsuario}\n\nGabi: ${respostaAssistente}`,
      config: {
        systemInstruction: PROMPT_EXTRACAO,
        responseMimeType: 'application/json',
        responseSchema: schemaResposta,
        temperature: 0,
      },
    })

    const texto = resposta.text
    if (!texto) return { salvos: 0 }

    const parsed = JSON.parse(texto) as { fatos?: unknown[] }
    const fatos = (parsed.fatos ?? [])
      .map(validarFato)
      .filter((f): f is FatoExtraido => f !== null)
      .slice(0, MAX_FATOS_POR_TURNO)

    let salvos = 0
    for (const fato of fatos) {
      await salvarMemoria(ctx, fato.tipo, fato.chave, fato.valor, 'inferido')
      salvos++
    }
    return { salvos }
  } catch (err) {
    console.warn('[GABI/memoria] extrairMemoriasDoTurno falhou:', (err as Error).message)
    return { salvos: 0 }
  }
}
