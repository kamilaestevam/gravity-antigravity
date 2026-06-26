/**
 * servico-qa-leitura-smart-read.ts — Q&A conversacional (Rafa) no passo Conferência
 */

import {
  executarAuditoriaV1AnaliseRiscosLeitura,
  type DocumentoAnaliseRisco,
} from '../../../shared/analise-riscos-leitura-smart-read.js'
import {
  QaLeituraResponseSchema,
  type QaLeituraRequest,
  type QaLeituraResponse,
  type MensagemHistoricoQaLeitura,
} from '../../../shared/qa-leitura-smart-read.js'
import { buscarTributosNcmsLeituraSmartRead } from './cliente-cadastros-smart-read.js'
import {
  SYSTEM_PROMPT_QA_LEITURA_SMART_READ,
  montarPromptUsuarioQaLeituraSmartRead,
} from './prompt-qa-leitura-smart-read.js'

const GEMINI_MODEL = 'gemini-2.5-flash'

async function chamarLlmQaLeitura(params: {
  documentos: DocumentoAnaliseRisco[]
  contextoV1: Awaited<ReturnType<typeof executarAuditoriaV1AnaliseRiscosLeitura>>['contexto']
  pergunta: string
  historico: MensagemHistoricoQaLeitura[]
}): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY ausente')
  }

  const promptUsuario = montarPromptUsuarioQaLeituraSmartRead({
    documentos: params.documentos,
    contextoV1: params.contextoV1,
    pergunta: params.pergunta,
    historico: params.historico,
  })

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT_QA_LEITURA_SMART_READ }] },
        contents: [{ parts: [{ text: promptUsuario }] }],
        generationConfig: {
          temperature: 0.35,
        },
      }),
    },
  )

  if (!response.ok) {
    const detalhe = await response.text()
    throw new Error(`Gemini HTTP ${response.status}: ${detalhe.slice(0, 200)}`)
  }

  const payload = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }
  const texto = payload.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''
  if (!texto) {
    throw new Error('Resposta vazia do modelo')
  }
  return texto
}

export async function executarQaLeituraSmartRead(
  entrada: QaLeituraRequest,
  idOrganizacao: string,
): Promise<QaLeituraResponse> {
  const { contexto } = executarAuditoriaV1AnaliseRiscosLeitura(entrada.documentos)
  const tributos = await buscarTributosNcmsLeituraSmartRead(contexto.ncms_encontrados, idOrganizacao)
  contexto.tributos_ncm = tributos

  const historico = entrada.historico ?? []
  const apiKey = process.env.GEMINI_API_KEY?.trim()

  if (!apiKey) {
    return QaLeituraResponseSchema.parse({
      resposta:
        'O assistente Rafa não está disponível no momento — a chave de IA não está configurada no servidor. Peça ao administrador para configurar GEMINI_API_KEY.',
      llm_ativo: false,
      aviso: 'GEMINI_API_KEY ausente — apenas a interface está ativa.',
    })
  }

  try {
    const resposta = await chamarLlmQaLeitura({
      documentos: entrada.documentos,
      contextoV1: contexto,
      pergunta: entrada.pergunta,
      historico,
    })
    return QaLeituraResponseSchema.parse({
      resposta,
      llm_ativo: true,
      aviso: null,
    })
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : 'erro desconhecido'
    console.error('[smart-read][qa-leitura]', mensagem)
    return QaLeituraResponseSchema.parse({
      resposta: `Não foi possível obter resposta da Rafa agora. Tente novamente em instantes.`,
      llm_ativo: false,
      aviso: `LLM indisponível: ${mensagem}`,
    })
  }
}
