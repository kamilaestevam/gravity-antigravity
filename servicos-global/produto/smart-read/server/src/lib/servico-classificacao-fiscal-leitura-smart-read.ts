/**
 * servico-classificacao-fiscal-leitura-smart-read.ts — LLM dedicado NCM/HS com de/para
 */

import { z } from 'zod'
import {
  montarRiscoDeClassificacaoFiscalSugerida,
  type ItemClassificacaoFiscalLeitura,
  type RiscoAduaneiroLeitura,
  type SituacaoCodigoFiscal,
} from '../../../shared/analise-riscos-leitura-smart-read.js'
import { anexarDisclaimerClassificacao } from '../../../shared/texto-analise-riscos-leitura-smart-read.js'
import { gerarConteudoGeminiSmartRead } from './gemini-gerar-conteudo-smart-read.js'
import { PRAZO_GEMINI_ANALISE_RISCOS_MS } from './controle-prazo-pipeline-analise-riscos-smart-read.js'
import { validarNcmCadastrosSmartRead } from './cliente-cadastros-smart-read.js'
import {
  registrarUsoLlmLeituraSmartRead,
  type ContextoRegistroUsoLlmLeituraSmartRead,
} from './servico-uso-llm-leitura-smart-read.js'
import type { UsoLlmChamadaLeituraSmartRead } from '../../../shared/uso-llm-leitura-smart-read.js'

const GEMINI_MODEL = 'gemini-2.5-flash'
const GEMINI_TIMEOUT_MS = PRAZO_GEMINI_ANALISE_RISCOS_MS

const ClassificacaoFiscalItemRespostaSchema = z.object({
  documento: z.string().min(1),
  indice: z.number().int().min(0),
  tipo: z.enum(['ncm', 'hs']),
  codigo_sugerido: z.string().min(4),
  motivo_tecnico: z.string().min(20),
})

const ClassificacaoFiscalEnvelopeSchema = z.object({
  classificacoes: z.array(ClassificacaoFiscalItemRespostaSchema),
})

const SYSTEM_PROMPT_CLASSIFICACAO_FISCAL = `Voce e classificador fiscal senior de comercio exterior (Brasil — Tabela TI NCM / Siscomex).
Para CADA entrada do array "itens", sugira o codigo fiscal mais aderente a descricao tecnica.

REGRAS:
1. tipo "ncm": codigo_sugerido com EXATAMENTE 8 digitos numericos (NCM brasileiro).
2. tipo "hs": codigo_sugerido com 6 a 10 digitos (HS harmonizado, sem pontos).
3. motivo_tecnico: justificativa TECNICA (capitulo, posicao, familia de produto, RGI aplicavel). NUNCA escreva "a IA deve" ou instrucoes meta.
4. Uma entrada por (documento, indice, tipo) solicitado — nao omita itens.
5. Seja assertivo: escolha o codigo mais especifico suportado pela descricao.
6. Responda APENAS JSON valido: { "classificacoes": [ ... ] }`

function extrairJsonDaRespostaGemini(texto: string): unknown {
  const limpo = texto.trim()
  const fence = limpo.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const corpo = fence?.[1]?.trim() ?? limpo
  const inicio = corpo.indexOf('{')
  const fim = corpo.lastIndexOf('}')
  if (inicio === -1 || fim === -1) throw new Error('Resposta LLM sem JSON')
  return JSON.parse(corpo.slice(inicio, fim + 1))
}

type ItemClassificacaoPendente = ItemClassificacaoFiscalLeitura & {
  tipo: 'ncm' | 'hs'
  situacao: SituacaoCodigoFiscal
  codigo_lido: string | null
}

function montarItensPendentesClassificacao(
  itens: ItemClassificacaoFiscalLeitura[],
): ItemClassificacaoPendente[] {
  const saida: ItemClassificacaoPendente[] = []
  for (const item of itens) {
    if (item.situacao_ncm !== 'completo') {
      saida.push({
        ...item,
        tipo: 'ncm',
        situacao: item.situacao_ncm,
        codigo_lido: item.ncm_lido,
      })
    }
    if (item.situacao_hs !== 'completo') {
      saida.push({
        ...item,
        tipo: 'hs',
        situacao: item.situacao_hs,
        codigo_lido: item.hs_lido,
      })
    }
  }
  return saida
}

function chaveItemClassificacao(item: { documento: string; indice: number; tipo: string }): string {
  return `${item.documento}|${item.indice}|${item.tipo}`
}

export async function executarClassificacaoFiscalLlmLeituraSmartRead(
  itens: ItemClassificacaoFiscalLeitura[],
  idOrganizacao: string,
  contextoRegistro?: ContextoRegistroUsoLlmLeituraSmartRead,
): Promise<{
  riscos: RiscoAduaneiroLeitura[]
  uso_llm: UsoLlmChamadaLeituraSmartRead | null
}> {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) return { riscos: [], uso_llm: null }

  const pendentes = montarItensPendentesClassificacao(itens)
  if (pendentes.length === 0) return { riscos: [], uso_llm: null }

  const payloadItens = pendentes.map((item) => ({
    documento: item.documento,
    indice: item.indice,
    tipo: item.tipo,
    situacao: item.situacao,
    codigo_lido: item.codigo_lido,
    descricao: item.descricao,
  }))

  const llm = await gerarConteudoGeminiSmartRead({
    modelo: GEMINI_MODEL,
    systemInstruction: SYSTEM_PROMPT_CLASSIFICACAO_FISCAL,
    promptUsuario: `Classifique os itens abaixo. Retorne uma entrada em "classificacoes" para cada item do array.\n\n${JSON.stringify({ itens: payloadItens }, null, 2)}`,
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
    },
    timeoutMs: GEMINI_TIMEOUT_MS,
  })

  if (contextoRegistro) {
    await registrarUsoLlmLeituraSmartRead({
      ...contextoRegistro,
      acao: 'classificacao_fiscal',
      modelo: llm.modelo,
      uso: llm.uso,
      custo_usd: llm.custo_usd,
    })
  }

  const texto = llm.texto
  const raw = extrairJsonDaRespostaGemini(texto)
  const envelope = ClassificacaoFiscalEnvelopeSchema.safeParse(raw)
  if (!envelope.success) {
    console.warn(
      '[smart-read][classificacao-fiscal] schema invalido',
      envelope.error.flatten(),
    )
    return { riscos: [], uso_llm: llm.uso }
  }

  const mapaPendentes = new Map(pendentes.map((p) => [chaveItemClassificacao(p), p]))
  const riscos: RiscoAduaneiroLeitura[] = []

  for (const classificacao of envelope.data.classificacoes) {
    const pendente = mapaPendentes.get(
      chaveItemClassificacao({
        documento: classificacao.documento,
        indice: classificacao.indice,
        tipo: classificacao.tipo,
      }),
    )
    if (!pendente) continue

    const codigoSugerido = classificacao.codigo_sugerido.replace(/\D/g, '') || classificacao.codigo_sugerido.trim()
    let descricaoNcmOficial: string | null = null

    if (classificacao.tipo === 'ncm' && /^\d{8}$/.test(codigoSugerido)) {
      const tributo = await validarNcmCadastrosSmartRead(codigoSugerido, idOrganizacao)
      if (tributo.descricao_ncm) descricaoNcmOficial = tributo.descricao_ncm
    }

    const risco = montarRiscoDeClassificacaoFiscalSugerida({
      documento: pendente.documento,
      indice: pendente.indice,
      tipo: pendente.tipo,
      situacao: pendente.situacao,
      codigoLido: pendente.codigo_lido,
      codigoSugerido,
      motivoTecnico: classificacao.motivo_tecnico,
      descricao: pendente.descricao,
      descricaoNcmOficial,
    })

    riscos.push({
      ...risco,
      correcao_sugerida: risco.correcao_sugerida
        ? anexarDisclaimerClassificacao(risco.correcao_sugerida)
        : undefined,
    })
  }

  return { riscos, uso_llm: llm.uso }
}
