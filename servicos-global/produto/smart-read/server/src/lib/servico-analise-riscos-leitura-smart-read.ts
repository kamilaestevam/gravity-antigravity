/**
 * servico-analise-riscos-leitura-smart-read.ts — Pipeline Matriz Invoice: P1 Código → P2 API CNPJ → P3 LLM
 */

import { z } from 'zod'
import {
  AnaliseRiscosLeituraResponseSchema,
  RiscoAduaneiroLeituraSchema,
  executarPasso1ValidacaoCodigoInvoice,
  mesclarRiscosAnaliseLeitura,
  montarItensParaClassificacaoFiscal,
  type AnaliseRiscosLeituraRequest,
  type AnaliseRiscosLeituraResponse,
  type RiscoAduaneiroLeitura,
} from '../../../shared/analise-riscos-leitura-smart-read.js'
import { aplicarFalhasMatrizAoResumoRiscos } from '../../../shared/montar-checklist-matriz-invoice-smart-read.js'
import {
  anexarDisclaimerClassificacao,
  DISCLAIMER_CLASSIFICACAO_FISCAL,
  ehRiscoClassificacaoFiscal,
  textoContemDisclaimerClassificacao,
  textoPareceInstrucaoParaIa,
} from '../../../shared/texto-analise-riscos-leitura-smart-read.js'
import { buscarTributosNcmsLeituraSmartRead } from './cliente-cadastros-smart-read.js'
import { executarPasso2ApiCnpjInvoice } from './passo-2-api-cnpj-invoice-smart-read.js'
import {
  SYSTEM_PROMPT_ANALISTA_INVOICE,
  montarPromptAnalistaInvoice,
} from './prompt-analista-invoice-smart-read.js'
import {
  buscarChunksRagNormativoAnaliseRiscos,
  precisaRagNormativoAnaliseRiscos,
} from './rag-normativo-analise-riscos-smart-read.js'
import { executarClassificacaoFiscalLlmLeituraSmartRead } from './servico-classificacao-fiscal-leitura-smart-read.js'
import { gerarConteudoGeminiSmartRead } from './gemini-gerar-conteudo-smart-read.js'
import {
  consultarResumoTokensLeituraSmartRead,
  registrarUsoLlmLeituraSmartRead,
  type ContextoRegistroUsoLlmLeituraSmartRead,
} from './servico-uso-llm-leitura-smart-read.js'
import {
  somarUsoLlmChamadasLeituraSmartRead,
  type UsoLlmChamadaLeituraSmartRead,
} from '../../../shared/uso-llm-leitura-smart-read.js'

const GEMINI_MODEL = 'gemini-2.5-flash'
const GEMINI_TIMEOUT_MS = 45_000

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

async function chamarLlmAnalistaInvoice(
  promptUsuario: string,
  contextoRegistro: ContextoRegistroUsoLlmLeituraSmartRead,
): Promise<{ riscos: RiscoAduaneiroLeitura[]; uso_llm: UsoLlmChamadaLeituraSmartRead | null }> {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) return { riscos: [], uso_llm: null }

  const llm = await gerarConteudoGeminiSmartRead({
    modelo: GEMINI_MODEL,
    systemInstruction: SYSTEM_PROMPT_ANALISTA_INVOICE,
    promptUsuario,
    generationConfig: {
      temperature: 0.15,
      responseMimeType: 'application/json',
    },
    timeoutMs: GEMINI_TIMEOUT_MS,
  })

  await registrarUsoLlmLeituraSmartRead({
    ...contextoRegistro,
    acao: 'analise_riscos',
    modelo: llm.modelo,
    uso: llm.uso,
    custo_usd: llm.custo_usd,
  })

  const texto = llm.texto
  const raw = extrairJsonDaRespostaGemini(texto) as { riscos?: unknown }
  const envelope = LlmRiscosEnvelopeSchema.safeParse(
    Array.isArray(raw) ? { riscos: raw } : raw,
  )
  if (!envelope.success) {
    console.warn('[smart-read][analise-riscos] LLM schema invalido', envelope.error.flatten())
    return { riscos: [], uso_llm: llm.uso }
  }
  const riscos = envelope.data.riscos.map((r, i) => normalizarRiscoClassificacaoFiscal({
    ...r,
    id: r.id ?? `risco-llm-${i + 1}`,
    origem: 'llm' as const,
    evidencias: r.evidencias ?? [],
  }))
  return { riscos, uso_llm: llm.uso }
}

function limparCampoAnaliseClassificacao(texto: string | undefined): string | undefined {
  if (!texto?.trim()) return undefined
  if (textoPareceInstrucaoParaIa(texto)) return undefined
  let limpo = texto.trim()
  if (textoContemDisclaimerClassificacao(limpo)) {
    limpo = limpo.replace(DISCLAIMER_CLASSIFICACAO_FISCAL, '').trim()
  }
  return limpo || undefined
}

function normalizarRiscoClassificacaoFiscal(risco: RiscoAduaneiroLeitura): RiscoAduaneiroLeitura {
  if (!ehRiscoClassificacaoFiscal(risco.titulo, risco.categoria)) return risco

  const analiseLimpa = limparCampoAnaliseClassificacao(risco.analise)
  const motivoLimpo = textoPareceInstrucaoParaIa(risco.motivo) ? undefined : risco.motivo?.trim()
  let correcao = risco.correcao_sugerida?.trim()
  if (correcao && textoContemDisclaimerClassificacao(correcao)) {
    correcao = correcao.replace(DISCLAIMER_CLASSIFICACAO_FISCAL, '').trim()
  }
  if (correcao && textoPareceInstrucaoParaIa(correcao)) {
    correcao = undefined
  }

  return {
    ...risco,
    motivo: motivoLimpo ?? risco.motivo,
    analise: analiseLimpa,
    correcao_sugerida: correcao ? anexarDisclaimerClassificacao(correcao) : undefined,
  }
}

export async function executarAnaliseRiscosLeituraSmartRead(
  entrada: AnaliseRiscosLeituraRequest,
  idOrganizacao: string,
  contextoRegistro: ContextoRegistroUsoLlmLeituraSmartRead,
): Promise<AnaliseRiscosLeituraResponse> {
  // Passo 1 — motor Código (aritmética, formatos, ISO, CNPJ módulo 11)
  const { resumo: p1Resumo, contexto } = executarPasso1ValidacaoCodigoInvoice(entrada.documentos)

  // Passo 2 — API CNPJ Receita Federal
  const passo2 = await executarPasso2ApiCnpjInvoice(entrada.documentos)
  contexto.cnpj_oficial = passo2.cnpj_oficial
  contexto.regras = [...contexto.regras, ...passo2.regras]

  const tributos = await buscarTributosNcmsLeituraSmartRead(contexto.ncms_encontrados, idOrganizacao)
  contexto.tributos_ncm = tributos

  const riscosV3Tributos = riscosNormativosDeTributos(tributos)
  const errosAritmeticos = p1Resumo.riscos
    .filter((r) => r.categoria === 'matematico' || r.id_regra_matriz?.startsWith('S5'))
    .map((r) => `${r.titulo}: ${r.analise}`)

  let aviso: string | null = null
  let riscosLlm: RiscoAduaneiroLeitura[] = []
  let riscosClassificacao: RiscoAduaneiroLeitura[] = []
  const llmAtivo = entrada.incluir_llm !== false && !!process.env.GEMINI_API_KEY?.trim()

  if (entrada.incluir_llm !== false && !process.env.GEMINI_API_KEY?.trim()) {
    aviso =
      'GEMINI_API_KEY ausente — Passo 3 (Analista IA) indisponível. Configure a chave e reinicie o BFF.'
  }

  const idLeitura = entrada.id_leitura_legado ?? contextoRegistro.id_leitura_legado
  const registroComLeitura: ContextoRegistroUsoLlmLeituraSmartRead = {
    ...contextoRegistro,
    id_leitura_legado: idLeitura,
  }
  const chamadasUso: UsoLlmChamadaLeituraSmartRead[] = []

  if (llmAtivo) {
    const itensClassificacao = montarItensParaClassificacaoFiscal(entrada.documentos)
    try {
      const classificacao = await executarClassificacaoFiscalLlmLeituraSmartRead(
        itensClassificacao,
        idOrganizacao,
        registroComLeitura,
      )
      riscosClassificacao = classificacao.riscos
      if (classificacao.uso_llm) chamadasUso.push(classificacao.uso_llm)
    } catch (erro) {
      aviso = `Classificação fiscal indisponível: ${erro instanceof Error ? erro.message : 'erro desconhecido'}`
      console.error('[smart-read][classificacao-fiscal]', aviso)
    }

    try {
      const riscosBase = [...p1Resumo.riscos, ...passo2.riscos, ...riscosV3Tributos, ...riscosClassificacao]
      const chunksRag = precisaRagNormativoAnaliseRiscos(riscosBase, contexto)
        ? buscarChunksRagNormativoAnaliseRiscos(riscosBase, contexto)
        : undefined

      const prompt = montarPromptAnalistaInvoice({
        documentos: entrada.documentos,
        contexto,
        errosAritmeticos,
        chunksRag,
      })
      const analista = await chamarLlmAnalistaInvoice(prompt, registroComLeitura)
      riscosLlm = analista.riscos
      if (analista.uso_llm) chamadasUso.push(analista.uso_llm)
    } catch (erro) {
      if (!aviso) {
        aviso = `Passo 3 (Analista IA) indisponível: ${erro instanceof Error ? erro.message : 'erro desconhecido'}`
      }
      console.error('[smart-read][analise-riscos]', aviso)
    }
  }

  const mesclado = mesclarRiscosAnaliseLeitura(
    [...p1Resumo.riscos, ...passo2.riscos, ...riscosV3Tributos],
    [...riscosClassificacao, ...riscosLlm],
  )
  const resumoFinal = aplicarFalhasMatrizAoResumoRiscos(contexto.regras, mesclado)

  const uso_llm_chamada =
    chamadasUso.length > 0 ? somarUsoLlmChamadasLeituraSmartRead(chamadasUso) : null
  const uso_llm_leitura = idLeitura
    ? await consultarResumoTokensLeituraSmartRead(contextoRegistro.prisma, idLeitura)
    : null

  return AnaliseRiscosLeituraResponseSchema.parse({
    resumo: resumoFinal,
    contexto_v1: contexto,
    llm_ativo: llmAtivo,
    aviso,
    uso_llm_chamada,
    uso_llm_leitura,
  })
}
