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
import { executarPasso1ValidacaoCodigoPackingList } from '../../../shared/passo-1-validacao-codigo-packing-list-smart-read.js'
import { executarPasso1ValidacaoCodigoAwb } from '../../../shared/passo-1-validacao-codigo-awb-smart-read.js'
import { executarPasso1ValidacaoCodigoBl } from '../../../shared/passo-1-validacao-codigo-bl-smart-read.js'
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
  SYSTEM_PROMPT_ANALISTA_PACKING_LIST,
  montarPromptAnalistaPackingList,
} from './prompt-analista-packing-list-smart-read.js'
import {
  SYSTEM_PROMPT_ANALISTA_AWB,
  montarPromptAnalistaAwb,
} from './prompt-analista-awb-smart-read.js'
import {
  SYSTEM_PROMPT_ANALISTA_BL,
  montarPromptAnalistaBl,
} from './prompt-analista-bl-smart-read.js'
import {
  buscarChunksRagNormativoAnaliseRiscos,
  precisaRagNormativoAnaliseRiscos,
} from './rag-normativo-analise-riscos-smart-read.js'
import { criarControlePrazoPipelineAnaliseRiscos, PRAZO_FASE_RAPIDA_ANALISE_RISCOS_MS, PRAZO_GEMINI_ANALISE_RISCOS_MS, PRAZO_MAXIMO_PIPELINE_ANALISE_RISCOS_MS } from './controle-prazo-pipeline-analise-riscos-smart-read.js'
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
const GEMINI_TIMEOUT_MS = PRAZO_GEMINI_ANALISE_RISCOS_MS

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

async function chamarLlmAnalistaMatriz(
  systemInstruction: string,
  promptUsuario: string,
  contextoRegistro: ContextoRegistroUsoLlmLeituraSmartRead,
): Promise<{ riscos: RiscoAduaneiroLeitura[]; uso_llm: UsoLlmChamadaLeituraSmartRead | null }> {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) return { riscos: [], uso_llm: null }

  const llm = await gerarConteudoGeminiSmartRead({
    modelo: GEMINI_MODEL,
    systemInstruction,
    promptUsuario,
    generationConfig: {
      temperature: 0.15,
      responseMimeType: 'application/json',
      maxOutputTokens: 8192,
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
  const somenteLlm = entrada.somente_llm === true && !!entrada.contexto_v1_referencia
  const faseRapidaSemLlm = entrada.incluir_llm === false && !somenteLlm
  const prazoMs = faseRapidaSemLlm
    ? PRAZO_FASE_RAPIDA_ANALISE_RISCOS_MS
    : PRAZO_MAXIMO_PIPELINE_ANALISE_RISCOS_MS
  const prazoPipeline = criarControlePrazoPipelineAnaliseRiscos(prazoMs)

  let p1Resumo: ReturnType<typeof executarPasso1ValidacaoCodigoInvoice>['resumo']
  let contexto: ReturnType<typeof executarPasso1ValidacaoCodigoInvoice>['contexto']
  let passo1Pl: ReturnType<typeof executarPasso1ValidacaoCodigoPackingList>
  let passo1Awb: ReturnType<typeof executarPasso1ValidacaoCodigoAwb>
  let passo1Bl: ReturnType<typeof executarPasso1ValidacaoCodigoBl>
  let passo2: Awaited<ReturnType<typeof executarPasso2ApiCnpjInvoice>>
  let tributos: Awaited<ReturnType<typeof buscarTributosNcmsLeituraSmartRead>>

  if (somenteLlm && entrada.contexto_v1_referencia) {
    contexto = { ...entrada.contexto_v1_referencia }
    p1Resumo = entrada.resumo_base_sem_llm ?? {
      riscos: [],
      total: 0,
      criticos: 0,
      atencao: 0,
      informativos: 0,
    }
    passo1Pl = {
      resumo: { riscos: [], total: 0, criticos: 0, atencao: 0, informativos: 0 },
      contexto: { regras: [], ncms_encontrados: [], tributos_ncm: [], cnpj_oficial: null },
    }
    passo1Awb = {
      resumo: { riscos: [], total: 0, criticos: 0, atencao: 0, informativos: 0 },
      contexto: { regras: [], ncms_encontrados: [], tributos_ncm: [] },
    }
    passo1Bl = {
      resumo: { riscos: [], total: 0, criticos: 0, atencao: 0, informativos: 0 },
      contexto: { regras: [], ncms_encontrados: [], tributos_ncm: [] },
    }
    passo2 = { cnpj_oficial: contexto.cnpj_oficial ?? null, riscos: [], regras: [] }
    tributos = contexto.tributos_ncm ?? []
  } else {
    const passo1 = executarPasso1ValidacaoCodigoInvoice(entrada.documentos)
    p1Resumo = passo1.resumo
    contexto = passo1.contexto

    passo1Pl = executarPasso1ValidacaoCodigoPackingList(entrada.documentos)
    passo1Awb = executarPasso1ValidacaoCodigoAwb(entrada.documentos)
    passo1Bl = executarPasso1ValidacaoCodigoBl(entrada.documentos)
    contexto.regras = [
      ...contexto.regras,
      ...passo1Pl.contexto.regras,
      ...passo1Awb.contexto.regras,
      ...passo1Bl.contexto.regras,
    ]

    passo2 = { cnpj_oficial: null, riscos: [], regras: [] }
    tributos = []
    if (!prazoPipeline.esgotado()) {
      const [passo2Resultado, tributosResultado] = await Promise.all([
        executarPasso2ApiCnpjInvoice(entrada.documentos),
        buscarTributosNcmsLeituraSmartRead(contexto.ncms_encontrados, idOrganizacao),
      ])
      passo2 = passo2Resultado
      contexto.cnpj_oficial = passo2.cnpj_oficial
      contexto.regras = [...contexto.regras, ...passo2.regras]
      tributos = tributosResultado
      contexto.tributos_ncm = tributos
    }
  }

  const riscosV3Tributos = riscosNormativosDeTributos(tributos)
  const errosAritmeticos = p1Resumo.riscos
    .filter((r) => r.categoria === 'matematico' || r.id_regra_matriz?.startsWith('S5'))
    .map((r) => `${r.titulo}: ${r.analise}`)

  let aviso: string | null = null
  let riscosLlm: RiscoAduaneiroLeitura[] = []
  let riscosLlmPackingList: RiscoAduaneiroLeitura[] = []
  let riscosLlmAwb: RiscoAduaneiroLeitura[] = []
  let riscosLlmBl: RiscoAduaneiroLeitura[] = []
  let riscosClassificacao: RiscoAduaneiroLeitura[] = []
  const llmAtivo =
    (somenteLlm || entrada.incluir_llm !== false) && !!process.env.GEMINI_API_KEY?.trim()

  if (!somenteLlm && entrada.incluir_llm !== false && !process.env.GEMINI_API_KEY?.trim()) {
    aviso =
      'GEMINI_API_KEY ausente — Passo 3 (Analista IA) indisponível. Configure a chave e reinicie o BFF.'
  }

  const idLeitura = entrada.id_leitura_legado ?? contextoRegistro.id_leitura_legado
  const registroComLeitura: ContextoRegistroUsoLlmLeituraSmartRead = {
    ...contextoRegistro,
    id_leitura_legado: idLeitura,
  }
  const chamadasUso: UsoLlmChamadaLeituraSmartRead[] = []
  const promessaResumoTokensLeitura = idLeitura
    ? consultarResumoTokensLeituraSmartRead(contextoRegistro.prisma, idLeitura)
    : Promise.resolve(null)

  if (llmAtivo) {
    if (prazoPipeline.esgotado()) {
      aviso = prazoPipeline.marcarAvisoEsgotado(aviso)
      console.warn('[smart-read][analise-riscos]', aviso)
    } else {
      const itensClassificacao = montarItensParaClassificacaoFiscal(entrada.documentos)
      const riscosBase = [...p1Resumo.riscos, ...passo2.riscos, ...riscosV3Tributos]
      const chunksRag = precisaRagNormativoAnaliseRiscos(riscosBase, contexto)
        ? buscarChunksRagNormativoAnaliseRiscos(riscosBase, contexto)
        : undefined

      const documentosPacking = entrada.documentos.filter((d) =>
        d.tipo_documento.toUpperCase().includes('PACKING'),
      )
      const documentosInvoice = entrada.documentos.filter((d) =>
        d.tipo_documento.toUpperCase().includes('INVOICE'),
      )
      const documentosAwb = entrada.documentos.filter((d) => {
        const tipo = d.tipo_documento.toUpperCase()
        return tipo.includes('AWB') || tipo.includes('AIR WAYBILL')
      })
      const documentosBl = entrada.documentos.filter((d) => {
        const tipo = d.tipo_documento.toUpperCase()
        if (tipo.includes('AWB') || tipo.includes('AIR WAYBILL')) return false
        return (
          tipo.includes('BILL OF LADING') ||
          tipo.includes('SEA WAYBILL') ||
          /(^|[^A-Z])(BL|MBL|HBL|B\/L)([^A-Z]|$)/.test(tipo)
        )
      })

      const promptInvoice = montarPromptAnalistaInvoice({
        documentos: entrada.documentos,
        contexto,
        errosAritmeticos,
        chunksRag,
      })

      type ResultadoTarefaLlm = {
        riscos: RiscoAduaneiroLeitura[]
        uso_llm: UsoLlmChamadaLeituraSmartRead | null
      }
      type TarefaLlm = {
        rotulo: string
        destino: 'classificacao' | 'invoice' | 'packing_list' | 'awb' | 'bl'
        promessa: Promise<ResultadoTarefaLlm>
      }

      const tarefasLlm: TarefaLlm[] = [
        {
          rotulo: 'Classificação fiscal',
          destino: 'classificacao',
          promessa: executarClassificacaoFiscalLlmLeituraSmartRead(
            itensClassificacao,
            idOrganizacao,
            registroComLeitura,
          ).then((classificacao) => ({
            riscos: classificacao.riscos,
            uso_llm: classificacao.uso_llm,
          })),
        },
        {
          rotulo: 'Analista IA (invoice)',
          destino: 'invoice',
          promessa: chamarLlmAnalistaMatriz(
            SYSTEM_PROMPT_ANALISTA_INVOICE,
            promptInvoice,
            registroComLeitura,
          ),
        },
      ]

      if (documentosPacking.length > 0) {
        const promptPl = montarPromptAnalistaPackingList({
          documentosPacking,
          documentosInvoice,
          documentosConhecimento: entrada.documentos.filter((d) => {
            const tipo = d.tipo_documento.toUpperCase()
            return tipo.includes('BL') || tipo.includes('AWB')
          }),
          contexto,
        })
        tarefasLlm.push({
          rotulo: 'Analista IA (packing list)',
          destino: 'packing_list',
          promessa: chamarLlmAnalistaMatriz(
            SYSTEM_PROMPT_ANALISTA_PACKING_LIST,
            promptPl,
            registroComLeitura,
          ),
        })
      }

      if (documentosAwb.length > 0) {
        const promptAwb = montarPromptAnalistaAwb({
          documentosAwb,
          documentosInvoice,
          documentosPacking,
          contexto,
        })
        tarefasLlm.push({
          rotulo: 'Analista IA (AWB)',
          destino: 'awb',
          promessa: chamarLlmAnalistaMatriz(
            SYSTEM_PROMPT_ANALISTA_AWB,
            promptAwb,
            registroComLeitura,
          ),
        })
      }

      if (documentosBl.length > 0) {
        const promptBl = montarPromptAnalistaBl({
          documentosBl,
          documentosInvoice,
          documentosPacking,
          contexto,
        })
        tarefasLlm.push({
          rotulo: 'Analista IA (BL)',
          destino: 'bl',
          promessa: chamarLlmAnalistaMatriz(
            SYSTEM_PROMPT_ANALISTA_BL,
            promptBl,
            registroComLeitura,
          ),
        })
      }

      try {
        const resultadosLlm = await Promise.allSettled(tarefasLlm.map((t) => t.promessa))
        for (const [indice, resultado] of resultadosLlm.entries()) {
          const tarefa = tarefasLlm[indice]
          if (resultado.status === 'fulfilled') {
            if (tarefa.destino === 'classificacao') riscosClassificacao = resultado.value.riscos
            else if (tarefa.destino === 'invoice') riscosLlm = resultado.value.riscos
            else if (tarefa.destino === 'packing_list') riscosLlmPackingList = resultado.value.riscos
            else if (tarefa.destino === 'awb') riscosLlmAwb = resultado.value.riscos
            else riscosLlmBl = resultado.value.riscos
            if (resultado.value.uso_llm) chamadasUso.push(resultado.value.uso_llm)
            continue
          }
          const msg = `${tarefa.rotulo} indisponível: ${resultado.reason instanceof Error ? resultado.reason.message : 'erro desconhecido'}`
          if (!aviso) aviso = msg
          console.error('[smart-read][analise-riscos]', msg)
        }
      } catch (erro) {
        if (!aviso) {
          aviso = `Passo 3 (Analista IA) indisponível: ${erro instanceof Error ? erro.message : 'erro desconhecido'}`
        }
        console.error('[smart-read][analise-riscos]', aviso)
      }
    }
  }

  const mesclado = mesclarRiscosAnaliseLeitura(
    [
      ...p1Resumo.riscos,
      ...passo1Pl.resumo.riscos,
      ...passo1Awb.resumo.riscos,
      ...passo1Bl.resumo.riscos,
      ...passo2.riscos,
      ...riscosV3Tributos,
    ],
    [...riscosClassificacao, ...riscosLlm, ...riscosLlmPackingList, ...riscosLlmAwb, ...riscosLlmBl],
  )
  const resumoFinal = aplicarFalhasMatrizAoResumoRiscos(contexto.regras, mesclado)

  const uso_llm_chamada =
    chamadasUso.length > 0 ? somarUsoLlmChamadasLeituraSmartRead(chamadasUso) : null
  const uso_llm_leitura = await promessaResumoTokensLeitura

  return AnaliseRiscosLeituraResponseSchema.parse({
    resumo: resumoFinal,
    contexto_v1: contexto,
    llm_ativo: llmAtivo,
    aviso,
    uso_llm_chamada,
    uso_llm_leitura,
  })
}
