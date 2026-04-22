# Integração — Como o Backend Chama o Gemini

> Tudo que precisa existir no código pra essa skill funcionar de verdade. Inclui setup, cache, custo, fallback, e onde plugar.

---

## Arquivos a Criar

### 1. `servicos-global/configurador/server/lib/gemini-test-analyzer.ts`

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai'
import { z } from 'zod'
import crypto from 'crypto'
import { generateAiAnalysis as fallbackHeuristic } from '../utils/playwright-parser.js'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

// ─── Schema de saída (idêntico ao definido no SKILL.md) ──────────────────────
const AiAnalysisSchema = z.object({
  erroResumo:       z.string().min(10).max(160),
  motivo:           z.string().min(50).max(800),
  sugestaoCorrecao: z.string().min(20).max(500),
  arquivo:          z.string(),
  codigoDiff: z.object({
    arquivo:     z.string(),
    linha:       z.number().int().positive().optional(),
    old:         z.string(),
    new:         z.string(),
    explicacao:  z.string().max(200),
  }).nullable(),
  categoria: z.enum([
    'BUG_REAL', 'TESTE_DESATUALIZADO', 'FLAKY_TIMING',
    'REGRESSAO_RECENTE', 'INFRA', 'NAO_CLASSIFICAVEL'
  ]),
  confianca:      z.enum(['alta', 'media', 'baixa']),
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

// ─── Inputs ──────────────────────────────────────────────────────────────────
export interface AnalyzeInput {
  errorLog:              string
  testName:              string
  specFilePath:          string
  specFileContent:       string
  componentFilePath?:    string | null
  componentFileContent?: string | null
  mapeamentoTestids?:    Record<string, unknown> | null
  lastCommitsTouching?:  Array<{ hash: string; autor: string; data: string; mensagem: string }>
  screenshot?:           string | null
  forceRefresh?:         boolean
}

// ─── Cache em memória (TTL 24h) ──────────────────────────────────────────────
const cache = new Map<string, { analysis: AiAnalysis; expires: number }>()
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

function hashError(input: AnalyzeInput): string {
  return crypto
    .createHash('sha256')
    .update(`${input.errorLog}::${input.testName}`)
    .digest('hex')
    .slice(0, 16)
}

// ─── Cliente Gemini ──────────────────────────────────────────────────────────
const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) {
  console.warn('[gemini-test-analyzer] GEMINI_API_KEY não definida — usando apenas fallback heurístico')
}
const genai = apiKey ? new GoogleGenerativeAI(apiKey) : null

// Carrega o prompt mestre uma vez na inicialização
const PROMPT_MESTRE = existsSync(resolve(__dirname, '../../../../skills/arquitetura/analista-erros-testes-gemini/prompt-mestre.md'))
  ? extractSystemPrompt(readFileSync(resolve(__dirname, '../../../../skills/arquitetura/analista-erros-testes-gemini/prompt-mestre.md'), 'utf-8'))
  : ''

function extractSystemPrompt(markdown: string): string {
  // Extrai apenas o bloco entre "## System Prompt" e o próximo "##"
  const match = markdown.match(/## System Prompt[\s\S]*?```\n([\s\S]*?)\n```/)
  return match?.[1] ?? ''
}

// ─── Função principal ────────────────────────────────────────────────────────
export async function analyzeTestFailure(input: AnalyzeInput): Promise<AiAnalysis> {
  const hash = hashError(input)

  // 1. Cache
  if (!input.forceRefresh) {
    const cached = cache.get(hash)
    if (cached && cached.expires > Date.now()) {
      return cached.analysis
    }
  }

  // 2. Sem API key → fallback direto
  if (!genai) {
    return toFullAnalysis(fallbackHeuristic(input.errorLog, input.specFilePath))
  }

  // 3. Tenta Gemini Flash
  try {
    const analysis = await callGemini(input, 'gemini-2.0-flash')
    if (analysis.confianca === 'baixa') {
      // Escala pro Pro
      try {
        const proAnalysis = await callGemini(input, 'gemini-2.0-pro')
        if (proAnalysis.confianca !== 'baixa') {
          cache.set(hash, { analysis: proAnalysis, expires: Date.now() + CACHE_TTL_MS })
          return proAnalysis
        }
      } catch { /* mantém o do flash */ }
    }
    cache.set(hash, { analysis, expires: Date.now() + CACHE_TTL_MS })
    return analysis
  } catch (err) {
    console.error('[gemini-test-analyzer] Falha no Gemini, usando fallback:', err)
    return toFullAnalysis(fallbackHeuristic(input.errorLog, input.specFilePath))
  }
}

// ─── Chamada ao Gemini com retry ─────────────────────────────────────────────
async function callGemini(input: AnalyzeInput, modelName: string): Promise<AiAnalysis> {
  const model = genai!.getGenerativeModel({
    model: modelName,
    systemInstruction: PROMPT_MESTRE,
    generationConfig: {
      temperature:        0.2,
      topP:               0.8,
      topK:               40,
      maxOutputTokens:    2048,
      responseMimeType:   'application/json',
    },
  })

  const userMessage = JSON.stringify({
    errorLog:             input.errorLog.slice(0, 4000),  // corta logs muito longos
    testName:             input.testName,
    specFilePath:         input.specFilePath,
    specFileContent:      input.specFileContent.slice(0, 8000),
    componentFilePath:    input.componentFilePath ?? null,
    componentFileContent: input.componentFileContent?.slice(0, 8000) ?? null,
    mapeamentoTestids:    input.mapeamentoTestids ?? null,
    lastCommitsTouching:  input.lastCommitsTouching ?? [],
  })

  // Retry com backoff: 1s, 3s, 9s
  let lastErr: Error | null = null
  for (const delay of [0, 1000, 3000, 9000]) {
    if (delay) await new Promise(r => setTimeout(r, delay))
    try {
      const result = await model.generateContent(userMessage)
      const text = result.response.text()
      const json = JSON.parse(text)
      const parsed = AiAnalysisSchema.parse(json)

      // Validação extra: o codigoDiff.old deve existir no input
      if (parsed.codigoDiff && parsed.confianca === 'alta') {
        const haystack = (input.specFileContent + '\n' + (input.componentFileContent ?? ''))
        if (!haystack.includes(parsed.codigoDiff.old)) {
          // Modelo alucinou — rebaixa confiança e remove diff
          parsed.codigoDiff = null
          parsed.confianca = 'media'
        }
      }

      parsed.modeloUsado = modelName as 'gemini-2.0-flash' | 'gemini-2.0-pro'
      parsed.tokensUsados = result.response.usageMetadata?.totalTokenCount ?? 0
      return parsed
    } catch (e) {
      lastErr = e as Error
    }
  }
  throw lastErr ?? new Error('Gemini call failed after retries')
}

// ─── Conversão do legado heurístico pro formato novo ─────────────────────────
function toFullAnalysis(heuristic: ReturnType<typeof fallbackHeuristic>): AiAnalysis {
  if (!heuristic) {
    return {
      erroResumo:       'Falha não classificada',
      motivo:           'Análise indisponível — Gemini fora e heurística não conseguiu classificar.',
      sugestaoCorrecao: 'Abra o erro bruto no expansão do log e investigue manualmente.',
      arquivo:          'desconhecido',
      codigoDiff:       null,
      categoria:        'NAO_CLASSIFICAVEL',
      confianca:        'baixa',
      commitSuspeito:   null,
    }
  }
  return {
    erroResumo:       heuristic.erroResumo,
    motivo:           heuristic.motivo,
    sugestaoCorrecao: heuristic.sugestaoCorrecao,
    arquivo:          heuristic.arquivo,
    codigoDiff:       heuristic.codigoDiff
      ? { arquivo: heuristic.arquivo, old: heuristic.codigoDiff.old, new: heuristic.codigoDiff.new, explicacao: 'Sugestão heurística (sem Gemini)' }
      : null,
    categoria:  'NAO_CLASSIFICAVEL',
    confianca:  'baixa',
    commitSuspeito: null,
  }
}

// ─── Métricas (expostas via /admin/metrics/gemini) ───────────────────────────
export function getMetrics() {
  return {
    cacheSize: cache.size,
    hitRate:   /* calculado externamente */ 0,
  }
}
```

### 2. Plug no `playwright-parser.ts`

Não substitui o `generateAiAnalysis` heurístico — **complementa**. O parser continua devolvendo a análise heurística rápida, e o backend chama o Gemini de forma assíncrona depois pra **enriquecer** a entry.

```typescript
// servicos-global/configurador/server/routes/admin.ts

import { analyzeTestFailure } from '../lib/gemini-test-analyzer.js'

// Após salvar o JSON do dia (linha ~847 do admin.ts atual):
// Dispara análise Gemini em paralelo para cada falha
for (const entry of novosLogs.filter(e => e.result === 'REPROVADO' || e.result === 'ERRO')) {
  analyzeTestFailure({
    errorLog:        entry.error_log ?? '',
    testName:        entry.test_name,
    specFilePath:    entry.module + '/' + entry.test_name,
    specFileContent: readSpecFile(entry),
    componentFileContent: readComponentFile(entry),
    lastCommitsTouching:  await gitLogTouching(entry),
  }).then(analysis => {
    // Atualiza a entry no arquivo persistido
    updateLogEntry(entry.id, { ai_analysis: analysis })
  }).catch(err => {
    console.error('[gemini] análise falhou para', entry.id, err)
  })
}
```

### 3. Variável de ambiente

```bash
# servicos-global/configurador/.env
GEMINI_API_KEY=AIza...   # do https://aistudio.google.com/apikey
```

E adicionar `GEMINI_API_KEY` na **whitelist** de env vars permitidas no `buildSafeTestEnv()` se for usado dentro de testes (provavelmente não — o analisador roda no server, não no Playwright spawn).

### 4. Endpoint manual de re-análise

```typescript
// POST /admin/test-logs/:id/reanalyze
adminRouter.post('/test-logs/:id/reanalyze', async (req, res, next) => {
  try {
    if (req.auth.tipoUsuario !== 'SUPER_ADMIN') {
      // tipoUsuario lido do banco via /api/v1/me — nunca do publicMetadata (Mandamento 01)
      throw new AppError('Apenas Super Admin', 403, 'FORBIDDEN')
    }
    const entry = await loadEntry(req.params.id)
    if (!entry || entry.result === 'APROVADO') {
      throw new AppError('Entry não existe ou passou', 400, 'INVALID')
    }
    const analysis = await analyzeTestFailure({
      ...buildInputFromEntry(entry),
      forceRefresh: true,
    })
    await updateLogEntry(req.params.id, { ai_analysis: analysis })
    res.json({ analysis })
  } catch (err) {
    next(err)
  }
})
```

E botão "Reanalizar" no `LogTestes.tsx` na expansão da linha de erro.

---

## Custo Real

### Por análise (Gemini 2.0 Flash, abril 2026)

| Item | Tokens | Custo |
|---|---|---|
| Input — system prompt | ~1.500 | $0.000113 |
| Input — error + spec + component | ~3.000-6.000 | $0.000225-0.00045 |
| Output — JSON estruturado | ~500-1.000 | $0.00015-0.0003 |
| **Total por análise** | **~5.000-8.500** | **~$0.0005-0.0009** |

**Em escala (100 falhas/dia):** ~$0.05-0.09/dia = **$1.50-2.70/mês**.

**Com cache hit rate de 40%:** **$0.90-1.60/mês**.

Mesmo se você multiplicar por 10 (suite muito flaky, 1.000 falhas/dia): **~$15/mês**. É barato.

### Quando escalar pro Pro

Se Flash devolver `confianca: baixa`, retenta uma vez no Pro. Pro custa ~10x mais (~$0.005-0.009 por análise) mas é melhor em código complexo. Ainda fica em **~$5-15/mês** no pior caso.

---

## Cache — Estratégia

### Memória (in-process, atual)
- Map<hash, analysis> com TTL 24h
- Reset no restart do server
- **Pro:** zero infra, latência zero
- **Contra:** perde no restart, não é compartilhado entre instâncias

### Próximo passo: Redis (quando tiver Staging)
- Mesmo hash key, mas em Redis
- TTL 7 dias
- Compartilhado entre instâncias do server
- Skill `arquitetura/caching-strategy` já cobre o padrão

### Bypass de cache
- `forceRefresh: true` no input
- Botão "Reanalizar" no UI
- Toda mudança do `prompt-mestre.md` invalida cache (versão no hash key)

---

## Fallback — Garantia de "sempre devolve algo"

```
1. Tenta Gemini Flash com retry (3x, backoff 1s/3s/9s)
   ├─ Sucesso → valida JSON → valida diff → cacheia → devolve
   └─ Falha
       ↓
2. Tenta Gemini Pro (1x)
   ├─ Sucesso → cacheia → devolve
   └─ Falha
       ↓
3. Cai no fallback heurístico (generateAiAnalysis em playwright-parser.ts)
   └─ Sempre devolve algo (mesmo que confianca: baixa)
```

**Nunca deixa o frontend sem análise.** Pior caso, o usuário vê a análise heurística antiga (regex + template).

---

## Métricas Obrigatórias

Toda chamada ao analyzer registra em `data/test-logs/_metrics/AAAA-MM-DD.json`:

```json
{
  "timestamp": "2026-04-15T14:23:00Z",
  "modelo": "gemini-2.0-flash",
  "cacheHit": false,
  "tokensInput": 5234,
  "tokensOutput": 743,
  "duracaoMs": 2341,
  "confianca": "alta",
  "categoria": "REGRESSAO_RECENTE",
  "validouDiff": true,
  "validouSchema": true
}
```

Endpoint `GET /admin/gemini-metrics` agrega tudo e devolve dashboard:
- Custo do dia/mês
- Cache hit rate
- Distribuição de confiança (% alta/media/baixa)
- Distribuição de categoria
- P50/P95 de latência
- Taxa de fallback (heurística usada)

Esse dashboard **mora em uma sub-tela do Admin/Testes** — você consegue ver se o analyzer está saudável.

---

## Onde Plugar no Frontend

[LogTestes.tsx](../../../servicos-global/configurador/src/pages/admin/LogTestes.tsx) já tem o card "Análise Especialista IA" com `motivo` e `sugestaoCorrecao`. Adicionar:

1. **Badge de categoria**: pill colorida (vermelho BUG_REAL, amarelo TESTE_DESATUALIZADO, etc.)
2. **Badge de confiança**: pill (alta = verde, media = amarelo, baixa = cinza)
3. **Bloco de diff**: renderizar `codigoDiff.old` (vermelho) e `codigoDiff.new` (verde) com syntax highlight
4. **Botão "Aplicar correção"**: só visível quando `confianca === 'alta'` e `codigoDiff !== null`. Clica → POST `/admin/test-logs/:id/apply-fix` → backend faz o Edit no arquivo + roda o teste de novo
5. **Botão "Reanalizar"**: chama o endpoint de re-análise com `forceRefresh: true`
6. **Botão "Rejeitar análise"**: marca a análise como ruim no feedback loop (alimenta `exemplos-ruins.md` em PRs futuros)
7. **Bloco "Commit suspeito"**: se `commitSuspeito !== null`, mostra hash + autor + data + link pro git log
