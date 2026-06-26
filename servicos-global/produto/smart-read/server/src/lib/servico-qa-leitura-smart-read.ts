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
import { gerarConteudoGeminiSmartRead } from './gemini-gerar-conteudo-smart-read.js'
import {
  SYSTEM_PROMPT_QA_LEITURA_SMART_READ,
  montarPromptUsuarioQaLeituraSmartRead,
} from './prompt-qa-leitura-smart-read.js'
import {
  consultarResumoTokensLeituraSmartRead,
  registrarUsoLlmLeituraSmartRead,
  type ContextoRegistroUsoLlmLeituraSmartRead,
} from './servico-uso-llm-leitura-smart-read.js'

const GEMINI_MODEL = 'gemini-2.5-flash'

async function chamarLlmQaLeitura(params: {
  documentos: DocumentoAnaliseRisco[]
  contextoV1: Awaited<ReturnType<typeof executarAuditoriaV1AnaliseRiscosLeitura>>['contexto']
  pergunta: string
  historico: MensagemHistoricoQaLeitura[]
}): Promise<Awaited<ReturnType<typeof gerarConteudoGeminiSmartRead>>> {
  const promptUsuario = montarPromptUsuarioQaLeituraSmartRead({
    documentos: params.documentos,
    contextoV1: params.contextoV1,
    pergunta: params.pergunta,
    historico: params.historico,
  })

  const resultado = await gerarConteudoGeminiSmartRead({
    modelo: GEMINI_MODEL,
    systemInstruction: SYSTEM_PROMPT_QA_LEITURA_SMART_READ,
    promptUsuario,
    generationConfig: { temperature: 0.35 },
    timeoutMs: 60_000,
  })

  if (!resultado.texto) {
    throw new Error('Resposta vazia do modelo')
  }

  return resultado
}

export async function executarQaLeituraSmartRead(
  entrada: QaLeituraRequest,
  idOrganizacao: string,
  contextoRegistro: ContextoRegistroUsoLlmLeituraSmartRead,
): Promise<QaLeituraResponse> {
  const { contexto } = executarAuditoriaV1AnaliseRiscosLeitura(entrada.documentos)
  const tributos = await buscarTributosNcmsLeituraSmartRead(contexto.ncms_encontrados, idOrganizacao)
  contexto.tributos_ncm = tributos

  const historico = entrada.historico ?? []
  const idLeitura = entrada.id_leitura_legado ?? contextoRegistro.id_leitura_legado
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
    const llm = await chamarLlmQaLeitura({
      documentos: entrada.documentos,
      contextoV1: contexto,
      pergunta: entrada.pergunta,
      historico,
    })

    await registrarUsoLlmLeituraSmartRead({
      ...contextoRegistro,
      id_leitura_legado: idLeitura,
      acao: 'qa_consultor',
      modelo: llm.modelo,
      uso: llm.uso,
      custo_usd: llm.custo_usd,
    })

    const uso_llm_leitura = idLeitura
      ? await consultarResumoTokensLeituraSmartRead(contextoRegistro.prisma, idLeitura)
      : null

    return QaLeituraResponseSchema.parse({
      resposta: llm.texto,
      llm_ativo: true,
      aviso: null,
      uso_llm_chamada: llm.uso,
      uso_llm_leitura,
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
