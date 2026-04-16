// server/lib/test-schemas.ts
// Schemas Zod compartilhados para output do Gemini (analyzer + agente-plano)
// Anti-alucinacao: regras de validacao embutidas no schema

import { z } from 'zod'

// ─── Escopos e Tipos ────────────────────────────────────────────────────────

export const EscopoSchema = z.enum([
  'LOGIN', 'CONFIG', 'ADMIN', 'HUB', 'CORE',
  'MARKET', 'TENANT', 'DBASE',
  'PEDIDO', 'NFIMP', 'LPCO', 'BIDFRT', 'BIDCAM',
  'SIMCUS', 'FINCOM', 'PROCSO',
])

export const TipoTesteSchema = z.enum(['UNI', 'CON', 'FUN', 'CRO', 'E2E', 'PEN'])

export const AmbienteSchema = z.enum(['Local', 'Staging', 'Producao'])

export const CriticidadeSchema = z.enum(['baixa', 'media', 'alta', 'critica'])

// ─── Categorias de erro (Analyzer) ──────────────────────────────────────────

export const CategoriaErroSchema = z.enum([
  'BUG_REAL', 'TESTE_DESATUALIZADO', 'FLAKY_TIMING',
  'REGRESSAO_RECENTE', 'INFRA', 'NAO_CLASSIFICAVEL',
])

export const ConfiancaSchema = z.enum(['alta', 'media', 'baixa'])

// ─── Schema de saida do Gemini Analyzer ─────────────────────────────────────

export const AiAnalysisSchema = z.object({
  erroResumo:       z.string().min(10).max(160),
  motivo:           z.string().min(50).max(800),
  sugestaoCorrecao: z.string().min(20).max(500),
  arquivo:          z.string().refine(
    (v) => !v.includes(':') || /:\d+$/.test(v),
    { message: 'arquivo deve conter ":" apenas seguido de numero de linha' },
  ),
  codigoDiff: z.object({
    arquivo:     z.string(),
    linha:       z.number().int().positive().optional(),
    old:         z.string().min(1),
    new:         z.string().min(1),
    explicacao:  z.string().max(200),
  }).nullable(),
  categoria:      CategoriaErroSchema,
  confianca:      ConfiancaSchema,
  commitSuspeito: z.object({
    hash:     z.string(),
    autor:    z.string(),
    data:     z.string(),
    mensagem: z.string(),
  }).nullable(),
  tokensUsados: z.number().int().nonnegative().optional(),
  modeloUsado:  z.string().optional(),
})

export type AiAnalysis = z.infer<typeof AiAnalysisSchema>

// ─── Validacao extra anti-alucinacao ────────────────────────────────────────

/**
 * Valida que codigoDiff.old existe literalmente nos arquivos de input.
 * Se nao encontrar, rebaixa confianca e remove diff.
 */
export function validateDiffAgainstSource(
  analysis: AiAnalysis,
  sourceContents: string,
): AiAnalysis {
  if (analysis.codigoDiff && analysis.confianca === 'alta') {
    if (!sourceContents.includes(analysis.codigoDiff.old)) {
      return {
        ...analysis,
        codigoDiff: null,
        confianca: 'media',
      }
    }
  }
  // codigoDiff obrigatorio quando confianca=alta
  if (analysis.confianca === 'alta' && !analysis.codigoDiff) {
    return {
      ...analysis,
      confianca: 'media',
    }
  }
  return analysis
}

// ─── Schemas do Plano de Teste ──────────────────────────────────────────────

export const AssercaoSchema = z.discriminatedUnion('tipo', [
  z.object({ tipo: z.literal('visible'),    testid: z.string() }),
  z.object({ tipo: z.literal('hidden'),     testid: z.string() }),
  z.object({ tipo: z.literal('enabled'),    testid: z.string() }),
  z.object({ tipo: z.literal('disabled'),   testid: z.string() }),
  z.object({ tipo: z.literal('hasText'),    testid: z.string(), texto: z.string() }),
  z.object({ tipo: z.literal('hasValue'),   testid: z.string(), valor: z.string() }),
  z.object({ tipo: z.literal('hasClass'),   testid: z.string(), classe: z.string() }),
  z.object({ tipo: z.literal('count'),      testid: z.string(), count: z.number() }),
  z.object({ tipo: z.literal('urlMatches'), regex: z.string() }),
  z.object({ tipo: z.literal('toastShown'), texto: z.string() }),
  z.object({ tipo: z.literal('apiResponse'), rota: z.string(), status: z.number() }),
  z.object({ tipo: z.literal('dbContains'),  modelo: z.string(), where: z.record(z.unknown()) }),
])

export const InteracaoSchema = z.discriminatedUnion('tipo', [
  z.object({ tipo: z.literal('goto'),    rota: z.string() }),
  z.object({ tipo: z.literal('click'),   testid: z.string() }),
  z.object({ tipo: z.literal('fill'),    testid: z.string(), valor: z.string() }),
  z.object({ tipo: z.literal('select'),  testid: z.string(), opcao: z.string() }),
  z.object({ tipo: z.literal('check'),   testid: z.string() }),
  z.object({ tipo: z.literal('uncheck'), testid: z.string() }),
  z.object({ tipo: z.literal('upload'),  testid: z.string(), arquivo: z.string() }),
  z.object({ tipo: z.literal('hover'),   testid: z.string() }),
  z.object({ tipo: z.literal('press'),   tecla: z.string() }),
  z.object({ tipo: z.literal('reload') }),
  z.object({ tipo: z.literal('resize'),  largura: z.number(), altura: z.number() }),
  z.object({ tipo: z.literal('setRole'), role: z.string() }),
  z.object({ tipo: z.literal('setLocale'), locale: z.enum(['pt', 'en', 'es']) }),
  z.object({ tipo: z.literal('verificacao') }),
])

export const PassoSchema = z.object({
  numero:            z.number().int().positive(),
  acao:              z.string().min(5).max(200),
  categoria:         z.number().int().min(1).max(20),
  origem:            z.enum(['humano-original', 'agente-adicionado', 'agente-expandido']),
  interacao:         InteracaoSchema,
  assercao:          AssercaoSchema.optional(),
  resultadoEsperado: z.string().min(10).max(300),
  screenshot:        z.string().nullable(),
  tiposAplicaveis:   z.array(TipoTesteSchema).min(1),
  preCondicoes:      z.array(z.string()).optional(),
  requerNovoTestid:  z.boolean().optional(),
  requerNovoTestidNome: z.string().optional(),
  notas:             z.string().optional(),
})

export const CoberturaCategoriaSchema = z.object({
  categoria:        z.number().int().min(1).max(20),
  nome:             z.string(),
  status:           z.enum(['coberta', 'parcial', 'ausente', 'nao_aplicavel']),
  passosAssociados: z.array(z.number()).optional(),
  justificativa:    z.string().optional(),
})

export const PreRequisitosSchema = z.object({
  ambiente:         AmbienteSchema,
  organizacao:      z.string(),
  workspace:        z.string(),
  roleUsuario:      z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']),
  dadosNecessarios: z.array(z.object({
    descricao: z.string(),
    fixture:   z.string().optional(),
  })).optional(),
  servicosAtivos:   z.array(z.string()),
  notas:            z.string().optional(),
})

export const ElementoMapeadoSchema = z.object({
  testid:      z.string(),
  tipo:        z.enum([
    'input', 'textarea', 'select', 'botao', 'link', 'navegacao',
    'feedback', 'tabela', 'linha', 'celula', 'modal', 'tab', 'accordion', 'outro',
  ]),
  descricao:   z.string(),
  texto:       z.string().optional(),
  i18nKey:     z.string().optional(),
  label:       z.string().optional(),
  placeholder: z.string().optional(),
  required:    z.boolean().optional(),
  mascara:     z.string().optional(),
  opcoes:      z.array(z.string()).optional(),
  posicao:     z.string().optional(),
})

export const MapeamentoTestidsSchema = z.object({
  componente:      z.string(),
  extraidoEm:      z.string(),
  elementos:       z.record(z.string(), ElementoMapeadoSchema),
  testidsFaltando: z.array(z.string()).optional(),
})

export const PlanoTesteSchema = z.object({
  id:          z.string().regex(/^TST-(UNI|CON|FUN|CRO|E2E|PEN)-(LOGIN|CONFIG|ADMIN|HUB|CORE|MARKET|TENANT|DBASE|PEDIDO|NFIMP|LPCO|BIDFRT|BIDCAM|SIMCUS|FINCOM|PROCSO)-\d{6}$/),
  versao:      z.string(),
  geradoEm:    z.string(),
  geradoPor:   z.literal('agente-plano-teste'),
  alteradoPor: z.array(z.string()).optional(),

  escopo:    EscopoSchema,
  sublocal:  z.string(),
  tela:      z.string(),
  rota:      z.string(),

  componenteFilePath: z.string(),
  specFilePath:       z.string().optional(),
  mapeamentoFilePath: z.string(),

  ambientes:   z.array(AmbienteSchema).min(1),
  criticidade: CriticidadeSchema,
  temDinheiro: z.boolean().default(false),

  resumoExecutivo: z.string().min(50).max(800),
  preRequisitos:   PreRequisitosSchema,
  mapeamentoTestids: MapeamentoTestidsSchema,

  cobertura:           z.array(CoberturaCategoriaSchema).length(20),
  coberturaPercentual: z.number().min(0).max(100),

  passos: z.array(PassoSchema).min(1),

  estimativaDuracao: z.string(),
  estimativaCustoIA: z.number(),
  ultimaExecucao:    z.string().nullable(),
  ultimoResultado:   z.enum(['APROVADO', 'REPROVADO', 'ERRO', 'NAO_EXECUTADO']).nullable(),
})

export type PlanoTeste = z.infer<typeof PlanoTesteSchema>
export type Passo = z.infer<typeof PassoSchema>
export type MapeamentoTestids = z.infer<typeof MapeamentoTestidsSchema>
export type ElementoMapeado = z.infer<typeof ElementoMapeadoSchema>
