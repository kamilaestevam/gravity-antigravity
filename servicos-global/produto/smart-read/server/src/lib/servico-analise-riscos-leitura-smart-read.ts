/**
 * servico-analise-riscos-leitura-smart-read.ts — orquestra V1 + Cadastros + LLM (V2a/V3a)
 */

import { z } from 'zod'
import {
  AnaliseRiscosLeituraResponseSchema,
  RiscoAduaneiroLeituraSchema,
  executarAuditoriaV1AnaliseRiscosLeitura,
  mesclarRiscosAnaliseLeitura,
  type AnaliseRiscosLeituraRequest,
  type AnaliseRiscosLeituraResponse,
  type RiscoAduaneiroLeitura,
} from '../../../shared/analise-riscos-leitura-smart-read.js'
import { buscarTributosNcmsLeituraSmartRead } from './cliente-cadastros-smart-read.js'
import {
  SYSTEM_PROMPT_ANALISE_RISCOS_LEITURA,
  montarPromptUsuarioAnaliseRiscosLeitura,
} from './prompt-analise-riscos-leitura-smart-read.js'

const GEMINI_MODEL = 'gemini-2.5-flash'

const LlmRiscosEnvelopeSchema = z.object({
  riscos: z.array(RiscoAduaneiroLeituraSchema),
})

function extrairJsonDaRespostaGemini(texto: string): unknown {
  const limpo = texto.trim()
  const fence = limpo.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const corpo = fence?.[1]?.trim() ?? limpo
  const inicio = corpo.indexOf('{')
  const fim = corpo.lastIndexOf('}')
  if (inicio === -1 || fim === -1) throw new Error('Resposta LLM sem JSON')
  return JSON.parse(corpo.slice(inicio, fim + 1))
}

function riscosNormativosDeTributos(
  tributos: Awaited<ReturnType<typeof buscarTributosNcmsLeituraSmartRead>>,
): RiscoAduaneiroLeitura[] {
  const saida: RiscoAduaneiroLeitura[] = []
  for (const ncm of tributos) {
    if (!ncm.valido) {
      saida.push({
        id: `risco-v3-ncm-invalido-${ncm.codigo_ncm}`,
        origem: 'llm',
        severidade: 'critico',
        categoria: 'normativo',
        titulo: `NCM ${ncm.codigo_ncm} inválido ou inativo no Siscomex`,
        motivo: 'O código não foi validado na tabela oficial do Portal Único.',
        analise: 'Revise classificação fiscal antes do despacho — código pode estar revogado ou digitado incorretamente.',
        evidencias: [{ documento: 'Cadastros/Siscomex', campo: 'ncm', valor: ncm.codigo_ncm }],
        citacoes_normativas: [
          {
            tipo: 'portal_unico',
            referencia: `NCM ${ncm.codigo_ncm}`,
            trecho: ncm.descricao_ncm ?? 'Não encontrado',
          },
        ],
      })
      continue
    }
    if (ncm.ii != null && ncm.ii >= 20) {
      saida.push({
        id: `risco-v3-ii-alto-${ncm.codigo_ncm}`,
        origem: 'llm',
        severidade: 'informativo',
        categoria: 'normativo',
        titulo: `NCM ${ncm.codigo_ncm} com II elevado (${ncm.ii}%)`,
        motivo: 'Alíquota de Imposto de Importação acima de 20% na tabela TEC.',
        analise: 'Impacto fiscal relevante — confirme classificação e simule landed cost.',
        evidencias: [{ documento: 'Cadastros/Siscomex', campo: 'ii_ncm', valor: String(ncm.ii) }],
        citacoes_normativas: [
          {
            tipo: 'ncm_oficial',
            referencia: `NCM ${ncm.codigo_ncm}`,
            trecho: ncm.descricao_ncm ?? undefined,
          },
        ],
      })
    }
  }
  return saida
}

async function chamarLlmAnaliseRiscos(
  promptUsuario: string,
): Promise<RiscoAduaneiroLeitura[]> {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) return []

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT_ANALISE_RISCOS_LEITURA }] },
        contents: [{ parts: [{ text: promptUsuario }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
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
  const texto = payload.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  const raw = extrairJsonDaRespostaGemini(texto) as { riscos?: unknown }
  const envelope = LlmRiscosEnvelopeSchema.safeParse(
    Array.isArray(raw) ? { riscos: raw } : raw,
  )
  if (!envelope.success) {
    console.warn('[smart-read][analise-riscos] LLM schema invalido', envelope.error.flatten())
    return []
  }
  return envelope.data.riscos.map((r, i) => ({
    ...r,
    id: r.id ?? `risco-llm-${i + 1}`,
    origem: 'llm' as const,
    evidencias: r.evidencias ?? [],
  }))
}

export async function executarAnaliseRiscosLeituraSmartRead(
  entrada: AnaliseRiscosLeituraRequest,
  idOrganizacao: string,
): Promise<AnaliseRiscosLeituraResponse> {
  const { resumo: v1Resumo, contexto } = executarAuditoriaV1AnaliseRiscosLeitura(entrada.documentos)

  const tributos = await buscarTributosNcmsLeituraSmartRead(contexto.ncms_encontrados, idOrganizacao)
  contexto.tributos_ncm = tributos

  const riscosV3Tributos = riscosNormativosDeTributos(tributos)

  let aviso: string | null = null
  let riscosLlm: RiscoAduaneiroLeitura[] = []
  const llmAtivo = entrada.incluir_llm !== false && !!process.env.GEMINI_API_KEY?.trim()

  if (entrada.incluir_llm !== false && !process.env.GEMINI_API_KEY?.trim()) {
    aviso = 'GEMINI_API_KEY ausente — apenas auditoria V1 e validação NCM foram executadas.'
  }

  if (llmAtivo) {
    try {
      const prompt = montarPromptUsuarioAnaliseRiscosLeitura({
        documentos: entrada.documentos,
        contextoV1: contexto,
        riscosV1Titulos: [...v1Resumo.riscos, ...riscosV3Tributos].map((r) => r.titulo),
        pergunta: entrada.pergunta,
      })
      riscosLlm = await chamarLlmAnaliseRiscos(prompt)
    } catch (erro) {
      aviso = `LLM indisponível: ${erro instanceof Error ? erro.message : 'erro desconhecido'}`
      console.error('[smart-read][analise-riscos]', aviso)
    }
  }

  const mesclado = mesclarRiscosAnaliseLeitura(
    [...v1Resumo.riscos, ...riscosV3Tributos],
    riscosLlm,
  )

  return AnaliseRiscosLeituraResponseSchema.parse({
    resumo: mesclado,
    contexto_v1: contexto,
    llm_ativo: llmAtivo && riscosLlm.length >= 0,
    aviso,
  })
}
