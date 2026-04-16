// server/lib/agente-plano-teste.ts
// Gera planos de teste estruturados via Gemini seguindo o checklist 20/20
// Template: skills/testes/agente-plano-teste/SKILL.md

import { GoogleGenerativeAI } from '@google/generative-ai'
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import {
  PlanoTesteSchema,
  type PlanoTeste,
  type Passo,
  type MapeamentoTestids,
  EscopoSchema,
  CriticidadeSchema,
} from './test-schemas.js'
import { generateTestidMapping, loadTestidMapping } from './extrator-testids.js'

// ─── Categorias do checklist 20/20 ──────────────────────────────────────────

const CATEGORIAS_20 = [
  { num: 1,  nome: 'Carregamento da tela',         minimos: { baixa: 2, media: 3, alta: 4, critica: 5 } },
  { num: 2,  nome: 'Identidade visual',             minimos: { baixa: 3, media: 5, alta: 7, critica: 8 } },
  { num: 3,  nome: 'Navegacao lateral / breadcrumb', minimos: { baixa: 2, media: 4, alta: 6, critica: 8 } },
  { num: 4,  nome: 'Read / Listagem / Visualizacao', minimos: { baixa: 3, media: 5, alta: 8, critica: 12 } },
  { num: 5,  nome: 'Update / Edicao',               minimos: { baixa: 0, media: 5, alta: 10, critica: 15 } },
  { num: 6,  nome: 'Create / Criacao',               minimos: { baixa: 0, media: 4, alta: 8, critica: 12 } },
  { num: 7,  nome: 'Delete / Exclusao',              minimos: { baixa: 0, media: 3, alta: 6, critica: 10 } },
  { num: 8,  nome: 'Validacoes de campo',            minimos: { baixa: 2, media: 5, alta: 10, critica: 15 } },
  { num: 9,  nome: 'Estados de erro',                minimos: { baixa: 1, media: 3, alta: 6, critica: 10 } },
  { num: 10, nome: 'Estados vazios',                 minimos: { baixa: 1, media: 2, alta: 3, critica: 4 } },
  { num: 11, nome: 'Estados de loading',             minimos: { baixa: 1, media: 2, alta: 3, critica: 4 } },
  { num: 12, nome: 'Filtros e busca',                minimos: { baixa: 0, media: 3, alta: 6, critica: 10 } },
  { num: 13, nome: 'Ordenacao',                      minimos: { baixa: 0, media: 2, alta: 4, critica: 6 } },
  { num: 14, nome: 'Permissoes / RBAC',              minimos: { baixa: 1, media: 3, alta: 6, critica: 10 } },
  { num: 15, nome: 'Multi-tenant / isolamento',      minimos: { baixa: 1, media: 2, alta: 4, critica: 6 } },
  { num: 16, nome: 'Acessibilidade (a11y)',           minimos: { baixa: 2, media: 4, alta: 6, critica: 8 } },
  { num: 17, nome: 'Responsividade',                 minimos: { baixa: 1, media: 3, alta: 4, critica: 5 } },
  { num: 18, nome: 'Internacionalizacao (i18n)',      minimos: { baixa: 1, media: 2, alta: 4, critica: 5 } },
  { num: 19, nome: 'Performance',                    minimos: { baixa: 0, media: 2, alta: 4, critica: 6 } },
  { num: 20, nome: 'Persistencia e refresh',          minimos: { baixa: 1, media: 2, alta: 3, critica: 4 } },
]

// ─── Input ──────────────────────────────────────────────────────────────────

export interface GeneratePlanInput {
  escopo:              string
  sublocal:            string
  tela:                string
  rota:                string
  componenteFilePath:  string
  criticidade:         string
  temDinheiro?:        boolean
  existingPlan?:       PlanoTeste | null
}

// ─── Cliente Gemini ──────────────────────────────────────────────────────────

const apiKey = process.env.GEMINI_API_KEY
const genai = apiKey ? new GoogleGenerativeAI(apiKey) : null

const __filename_esm = fileURLToPath(import.meta.url)
const __dirname_esm = dirname(__filename_esm)

// Carrega o checklist como contexto
const CHECKLIST_PATH = resolve(
  __dirname_esm,
  '../../../../skills/testes/agente-plano-teste/checklist-10-de-10.md',
)
const CHECKLIST_CONTENT = existsSync(CHECKLIST_PATH)
  ? readFileSync(CHECKLIST_PATH, 'utf-8')
  : ''

const FORMATO_PATH = resolve(
  __dirname_esm,
  '../../../../skills/testes/agente-plano-teste/formato-plano.md',
)
const FORMATO_CONTENT = existsSync(FORMATO_PATH)
  ? readFileSync(FORMATO_PATH, 'utf-8')
  : ''

// ─── System prompt para o agente ─────────────────────────────────────────────

function buildSystemPrompt(): string {
  return `Voce e o Agente Plano de Teste do Gravity — um especialista senior em QA, Playwright, React e TypeScript.

# SUA TAREFA
Dado um componente React (.tsx), seus data-testid mapeados, e a criticidade da tela, voce gera um plano de teste JSON que cobre as 20 categorias obrigatorias do checklist.

# REGRAS INVIOLAVEIS
1. RESPONDA EM PORTUGUES BRASILEIRO.
2. Devolva APENAS JSON puro. Sem markdown, sem prosa.
3. O JSON deve seguir ESTRITAMENTE o schema PlanoTesteSchema (fornecido no contexto).
4. NUNCA remova passos com origem "humano-original" de um plano existente.
5. Cubra TODAS as 20 categorias. Se nao aplicavel, marque como "nao_aplicavel" com justificativa.
6. Cada passo referencia testids REAIS do mapeamento fornecido.
7. Numere passos sequencialmente sem buracos.
8. Todo passo novo tem origem "agente-adicionado" (ou "agente-expandido" se expande um existente).
9. Screenshot segue formato: "NN_descricao_curta" (numero do passo + snake_case).
10. Calcule coberturaPercentual = (categorias com status coberta ou parcial) / 20 * 100.
11. resumoExecutivo tem 50-800 chars, descreve a tela, riscos e cobertura.
12. Respeite os minimos de passos por categoria conforme a criticidade.

# CHECKLIST 20 CATEGORIAS
${CHECKLIST_CONTENT}

# FORMATO DO PLANO (Schema Zod)
${FORMATO_CONTENT}
`
}

// ─── Gerador de ID ──────────────────────────────────────────────────────────

function generatePlanId(tipo: string, escopo: string, registry: PlanRegistryEntry[]): string {
  const existing = registry.filter(p => p.escopo === escopo)
  const nextNum = String(existing.length + 1).padStart(6, '0')
  return `TST-${tipo}-${escopo}-${nextNum}`
}

interface PlanRegistryEntry {
  id: string
  tipo: string
  escopo: string
  sublocal: string
}

// ─── Funcao principal ────────────────────────────────────────────────────────

export async function generateTestPlan(input: GeneratePlanInput): Promise<PlanoTeste> {
  // Validar inputs
  const escopo = EscopoSchema.parse(input.escopo)
  const criticidade = CriticidadeSchema.parse(input.criticidade)

  // Ler componente
  const componentePath = resolve(process.cwd(), input.componenteFilePath)
  if (!existsSync(componentePath)) {
    throw new Error(`Componente nao encontrado: ${input.componenteFilePath}`)
  }
  const componenteContent = readFileSync(componentePath, 'utf-8')

  // Extrair ou carregar mapeamento de testids
  let mapping = loadTestidMapping(escopo, input.sublocal)
  if (!mapping) {
    mapping = generateTestidMapping(input.componenteFilePath, escopo, input.sublocal)
  }

  // Carregar registry
  const registryPath = resolve(process.cwd(), 'testes/test-plans-registry.json')
  const registry = existsSync(registryPath)
    ? (JSON.parse(readFileSync(registryPath, 'utf-8')) as { planos: PlanRegistryEntry[] }).planos
    : []

  // Gerar ID
  const planId = input.existingPlan?.id ?? generatePlanId('E2E', escopo, registry)

  if (!genai) {
    throw new Error('GEMINI_API_KEY nao definida — nao e possivel gerar plano de teste')
  }

  const model = genai.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: buildSystemPrompt(),
    generationConfig: {
      temperature:      0.3,
      topP:             0.8,
      topK:             40,
      maxOutputTokens:  8192,
      responseMimeType: 'application/json',
    },
  })

  const userMessage = JSON.stringify({
    planId,
    escopo,
    sublocal:            input.sublocal,
    tela:                input.tela,
    rota:                input.rota,
    componenteFilePath:  input.componenteFilePath,
    componenteContent:   componenteContent.slice(0, 12000),
    criticidade,
    temDinheiro:         input.temDinheiro ?? false,
    mapeamentoTestids:   mapping,
    existingPlan:        input.existingPlan ? {
      passos:   input.existingPlan.passos,
      cobertura: input.existingPlan.cobertura,
    } : null,
    categoriasMinimos:   CATEGORIAS_20.map(c => ({
      num:    c.num,
      nome:   c.nome,
      minimo: c.minimos[criticidade as keyof typeof c.minimos],
    })),
  })

  // Retry ate 3x
  let lastErr: Error | null = null
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await new Promise(r => setTimeout(r, 2000 * attempt))
    try {
      const result = await model.generateContent(userMessage)
      const text = result.response.text()
      const json: unknown = JSON.parse(text)
      let plan = PlanoTesteSchema.parse(json)

      // REGRA INVIOLAVEL: preservar passos humano-original
      if (input.existingPlan) {
        plan = preserveHumanSteps(plan, input.existingPlan)
      }

      // Validar cobertura
      validateCoverage(plan, criticidade)

      // Persistir plano
      persistPlan(plan, escopo, input.sublocal)

      return plan
    } catch (e) {
      lastErr = e as Error
      console.error(`[agente-plano-teste] Tentativa ${attempt + 1} falhou:`, (e as Error).message)
    }
  }
  throw lastErr ?? new Error('Falha ao gerar plano apos 3 tentativas')
}

// ─── Expandir plano existente ────────────────────────────────────────────────

export async function expandTestPlan(
  existingPlan: PlanoTeste,
  componenteFilePath: string,
): Promise<PlanoTeste> {
  return generateTestPlan({
    escopo:             existingPlan.escopo,
    sublocal:           existingPlan.sublocal,
    tela:               existingPlan.tela,
    rota:               existingPlan.rota,
    componenteFilePath,
    criticidade:        existingPlan.criticidade,
    temDinheiro:        existingPlan.temDinheiro,
    existingPlan,
  })
}

// ─── Preservar passos humano-original ────────────────────────────────────────

function preserveHumanSteps(newPlan: PlanoTeste, oldPlan: PlanoTeste): PlanoTeste {
  const humanSteps = oldPlan.passos.filter(p => p.origem === 'humano-original')
  const agentSteps = newPlan.passos.filter(p => p.origem !== 'humano-original')

  // Combina: humano-original primeiro (na ordem original), depois agente
  const allSteps: Passo[] = []
  let numero = 1

  for (const step of humanSteps) {
    allSteps.push({ ...step, numero })
    numero++
  }
  for (const step of agentSteps) {
    allSteps.push({ ...step, numero })
    numero++
  }

  // Recalcula cobertura
  const cobertura = newPlan.cobertura.map(cat => {
    const associados = allSteps
      .filter(s => s.categoria === cat.categoria)
      .map(s => s.numero)
    return {
      ...cat,
      passosAssociados: associados,
      status: associados.length > 0 ? cat.status : cat.status,
    }
  })

  return {
    ...newPlan,
    passos: allSteps,
    cobertura,
    alteradoPor: [...(newPlan.alteradoPor ?? []), 'agente-plano-teste-expand'],
  }
}

// ─── Validacao de cobertura ──────────────────────────────────────────────────

function validateCoverage(plan: PlanoTeste, criticidade: string): void {
  for (const cat of CATEGORIAS_20) {
    const coverage = plan.cobertura.find(c => c.categoria === cat.num)
    if (!coverage) {
      throw new Error(`Categoria ${cat.num} (${cat.nome}) ausente na cobertura`)
    }
    if (coverage.status === 'nao_aplicavel') {
      if (!coverage.justificativa) {
        throw new Error(`Categoria ${cat.num} marcada como nao_aplicavel sem justificativa`)
      }
      continue
    }
    const minimo = cat.minimos[criticidade as keyof typeof cat.minimos]
    const passos = plan.passos.filter(p => p.categoria === cat.num)
    if (passos.length < minimo) {
      console.warn(
        `[agente-plano-teste] Categoria ${cat.num} (${cat.nome}): ${passos.length} passos, minimo ${minimo}`,
      )
    }
  }
}

// ─── Persistencia ────────────────────────────────────────────────────────────

function persistPlan(plan: PlanoTeste, escopo: string, sublocal: string): void {
  const planDir = resolve(process.cwd(), `testes/_planos/${escopo.toLowerCase()}`)
  const planFile = resolve(planDir, `${sublocal.toLowerCase().replace(/\s+/g, '-')}.json`)

  if (!existsSync(planDir)) {
    mkdirSync(planDir, { recursive: true })
  }
  writeFileSync(planFile, JSON.stringify(plan, null, 2), 'utf-8')

  // Atualizar registry
  updateRegistry(plan, escopo, sublocal)
}

function updateRegistry(plan: PlanoTeste, escopo: string, sublocal: string): void {
  const registryPath = resolve(process.cwd(), 'testes/test-plans-registry.json')
  const registry = existsSync(registryPath)
    ? JSON.parse(readFileSync(registryPath, 'utf-8')) as Record<string, unknown>
    : {
        '$schema': './test-plans-registry.schema.json',
        versao: '1.0.0',
        atualizadoEm: new Date().toISOString(),
        totalPlanos: 0,
        totalPorTipo: { UNI: 0, CON: 0, FUN: 0, CRO: 0, E2E: 0, PEN: 0 },
        totalPorEscopo: {},
        deletados: [],
        planos: [],
      }

  const planos = (registry.planos as Array<Record<string, unknown>>) ?? []
  const existingIdx = planos.findIndex(p => p.id === plan.id)

  const entry = {
    id:                 plan.id,
    tipo:               plan.id.split('-')[1],
    escopo,
    sublocal,
    tela:               plan.tela,
    rota:               plan.rota,
    criticidade:        plan.criticidade,
    ambientes:          plan.ambientes,
    planoFile:          `_planos/${escopo.toLowerCase()}/${sublocal.toLowerCase().replace(/\s+/g, '-')}.json`,
    specFile:           plan.specFilePath ?? null,
    mapeamentoFile:     plan.mapeamentoFilePath,
    componenteFile:     plan.componenteFilePath,
    passosTotal:        plan.passos.length,
    coberturaPercentual: plan.coberturaPercentual,
    status:             'pendente_validacao',
    criadoEm:           plan.geradoEm,
    ultimaExecucao:     plan.ultimaExecucao,
    ultimoResultado:    plan.ultimoResultado,
  }

  if (existingIdx >= 0) {
    planos[existingIdx] = entry
  } else {
    planos.push(entry)
  }

  registry.planos = planos
  registry.totalPlanos = planos.length
  registry.atualizadoEm = new Date().toISOString()

  writeFileSync(registryPath, JSON.stringify(registry, null, 2), 'utf-8')
}
