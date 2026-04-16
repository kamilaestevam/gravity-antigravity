---
name: analista-erros-testes-gemini
description: "Use sempre que um teste falhar (E2E, funcional, unitário, contract, cross-tenant ou pentest) e for necessário diagnosticar causa raiz com sugestão de correção aplicável em 1 clique. Especialista no Gemini 2.0 Flash com prompt engineering otimizado para devolver análise estruturada (resumo, motivo, diff aplicável, classificação, confiança). Substitui a heurística regex em servicos-global/configurador/server/utils/playwright-parser.ts. NUNCA aplica correção sozinha — humano valida e clica Aplicar."
---

# Analista de Erros de Testes — Gemini

> **Missão:** transformar a leitura de uma falha de teste em **uma decisão de 5 segundos** para o humano. Ler erro bruto, código do spec, código do componente e devolver: o que quebrou, por quê, o que mudar, e um diff pronto pra aplicar.

---

## Quando Usar

**SEMPRE** quando:
- Um teste do `LogTestes` (admin/testes) terminar com `result: REPROVADO` ou `ERRO`
- Um teste falhar em CI noturno e for persistido em `data/test-logs/AAAA-MM-DD.json`
- Um humano clicar em "Reanalizar" numa falha já existente (cache miss forçado)
- Um agente gerar um teste novo e quiser pré-validar mensagens de erro hipotéticas

**NUNCA** quando:
- O teste passou (`APROVADO`) — desperdiça token
- O `error_log` está vazio ou nulo — não tem o que analisar
- Já existe `ai_analysis` em cache para o mesmo hash de erro (a menos que o usuário force re-análise)

---

## Inputs Obrigatórios

| Campo | Tipo | Por quê |
|---|---|---|
| `errorLog` | string | Mensagem + stack trace do Playwright/Vitest |
| `testName` | string | Nome do `test()` que falhou — orienta o foco |
| `specFilePath` | string | Path absoluto do `.spec.ts`/`.test.ts` que falhou |
| `specFileContent` | string | Conteúdo completo do arquivo de teste |
| `componentFilePath` | string \| null | Path do componente React que o teste tenta acessar (se aplicável) |
| `componentFileContent` | string \| null | Conteúdo do componente (se aplicável) |
| `mapeamentoTestids` | object \| null | JSON do `_mapeamentos/<escopo>/<tela>.testids.json` da tela testada |
| `lastCommitsTouching` | array | Últimos 3 commits que alteraram o spec OU o componente (autor, hash, mensagem, data) |
| `screenshot` | string \| null | Path do PNG do momento da falha |
| `previousAiAnalysis` | object \| null | Análise anterior pra esse mesmo hash (se existir) — pra validar consistência |

**Sem esses inputs não chama Gemini.** Se faltar `componentFileContent`, devolve análise parcial com `confianca: 'baixa'` e sugere ao humano fornecer o componente.

---

## Output Obrigatório

JSON validado por Zod. **Qualquer desvio do schema = rejeita e não persiste.**

```typescript
const AiAnalysisSchema = z.object({
  // O que aconteceu (1 frase, max 160 chars)
  erroResumo: z.string().min(10).max(160),

  // Por que aconteceu (1-3 parágrafos, max 800 chars, em português)
  motivo: z.string().min(50).max(800),

  // O que fazer (instrução acionável, max 500 chars)
  sugestaoCorrecao: z.string().min(20).max(500),

  // Onde está o problema (path:linha)
  arquivo: z.string().regex(/^.+\.(ts|tsx|js|jsx)(:\d+)?$/),

  // Diff aplicável (obrigatório quando confianca = alta, opcional senão)
  codigoDiff: z.object({
    arquivo: z.string(),
    linha: z.number().int().positive().optional(),
    old: z.string(),
    new: z.string(),
    explicacao: z.string().max(200),
  }).nullable(),

  // Classificação da falha (decide o que o humano faz a seguir)
  categoria: z.enum([
    'BUG_REAL',           // bug no produto — corrige código de produção
    'TESTE_DESATUALIZADO', // teste velho — atualiza assertion/seletor
    'FLAKY_TIMING',        // race condition — adiciona waitFor
    'REGRESSAO_RECENTE',   // commit X dos últimos N dias quebrou
    'INFRA',               // banco/rede/auth — não é bug de código
    'NAO_CLASSIFICAVEL',   // confiança baixa — abrir erro bruto
  ]),

  // Score de confiança (não é prosa — é número)
  confianca: z.enum(['alta', 'media', 'baixa']),

  // Commit suspeito (se categoria = REGRESSAO_RECENTE)
  commitSuspeito: z.object({
    hash: z.string(),
    autor: z.string(),
    data: z.string(),
    mensagem: z.string(),
  }).nullable(),

  // Tempo da análise (debug)
  tokensUsados: z.number().int().nonnegative(),
  modeloUsado: z.enum(['gemini-2.0-flash', 'gemini-2.0-pro']),
})
```

---

## As 12 Regras Invioláveis

### 1. **Sempre cita arquivo:linha**
Nunca aceita "verifique o componente". Sempre `Organizacao.tsx:147`. Se não consegue identificar a linha, devolve só o arquivo e marca `confianca: 'media'`.

### 2. **Diff sempre que confiança = alta**
Se o modelo está confiante na causa, **deve** devolver `codigoDiff` aplicável. Sem diff em alta confiança = rejeita o output.

### 3. **Português, sempre**
Toda string textual é em pt-BR. O sistema é brasileiro, o time é brasileiro.

### 4. **Nunca aluciona código**
O `codigoDiff.old` **deve existir literalmente** no `specFileContent` ou `componentFileContent` que foi passado de input. Validador faz string match antes de aceitar a resposta. Se não bate, rejeita.

### 5. **Sempre classifica em uma das 6 categorias**
Não inventa categoria nova. Se nenhuma se encaixa, usa `NAO_CLASSIFICAVEL` com confiança baixa.

### 6. **Confiança honesta**
- `alta` = consigo apontar arquivo, linha, causa e diff. Aposto $1k que está certo.
- `media` = sei a causa, sei o arquivo, mas o diff pode estar errado.
- `baixa` = só consigo descrever os sintomas. Humano precisa investigar.

### 7. **Temperature 0.2 máximo**
Quero respostas determinísticas. Mesmo erro → mesma análise. Score de qualidade vale mais que criatividade.

### 8. **Cache por hash do errorLog**
Antes de chamar o Gemini: `hash = sha256(errorLog + testName)`. Se o hash já tem análise cacheada nas últimas 24h, devolve cached. Economia massiva — o mesmo bug aparece em N runs até alguém corrigir.

### 9. **Fallback heurístico obrigatório**
Se Gemini falhar (timeout, quota, 5xx, JSON inválido), cai pro `generateAiAnalysis()` heurístico atual em `playwright-parser.ts`. Nunca devolve erro pra UI — sempre devolve **alguma** análise.

### 10. **Retry com backoff**
3 tentativas com 1s, 3s, 9s. Se as 3 falharem, fallback heurístico.

### 11. **Detecta regressão olhando o git log**
Se 1+ commits dos últimos 7 dias mexeram em `componentFilePath`, o prompt é instruído a investigar **especificamente esses commits** como causa provável. Devolve no `commitSuspeito`.

### 12. **Não toca em produção**
Esta skill **NUNCA** aplica o diff. Apenas devolve o JSON. Aplicar é responsabilidade do humano clicando "Aplicar" na UI, ou de outro processo (que precisa ter sua própria autorização explícita).

---

## Fluxo Completo

```
1. Teste falha → playwright-parser.ts captura entry com error_log
   ↓
2. Backend chama analyzeWithGemini(input) em server/lib/gemini-test-analyzer.ts
   ↓
3. Cache lookup por hash(errorLog + testName)
   ├─ HIT → devolve cached, fim
   └─ MISS → continua
   ↓
4. Monta prompt mestre (ver prompt-mestre.md) com todos os inputs
   ↓
5. POST gemini-2.0-flash com temperature: 0.2, response_mime_type: application/json
   ↓
6. Recebe JSON → valida com AiAnalysisSchema (Zod)
   ├─ Inválido → retry (até 3x) → falhou → fallback heurístico
   └─ Válido → continua
   ↓
7. Validação adicional: codigoDiff.old existe literalmente nos arquivos de input?
   ├─ Não → rejeita, marca confianca: 'baixa', remove diff
   └─ Sim → continua
   ↓
8. Persiste no cache + atualiza entry no data/test-logs/AAAA-MM-DD.json
   ↓
9. Frontend renderiza: resumo, motivo, diff (com botão "Aplicar"), categoria, confiança
```

---

## Critérios de "10 de 10"

Esta skill é **avaliada automaticamente** a cada 100 análises. Métricas obrigatórias:

| Métrica | Meta | Como medir |
|---|---|---|
| **Especificidade** | ≥90% das análises citam `arquivo:linha` exato | Regex no campo `arquivo` |
| **Acionabilidade** | ≥80% das análises com `confianca: alta` têm `codigoDiff` não-nulo | Contagem |
| **Aceitação humana** | ≥70% dos diffs sugeridos são aceitos sem edição | Track de "Aplicar" vs "Editar" vs "Rejeitar" |
| **Cache hit rate** | ≥40% após 30 dias | Logs do cache |
| **Custo médio** | ≤$0.005 por análise | Token usage / chamadas |
| **Latência P95** | ≤8s end-to-end | Métrica do server |
| **Falsos negativos** | 0% — nunca devolver "está tudo certo" para um teste reprovado | Auditoria manual |

Falhar 2 métricas seguidas dispara alerta → revisar prompt mestre.

---

## Arquivos Relacionados

- [prompt-mestre.md](./prompt-mestre.md) — o prompt completo enviado ao Gemini
- [exemplos.md](./exemplos.md) — 3 análises exemplares (boas e ruins)
- [integracao.md](./integracao.md) — código de integração + cache + custo

---

## Onde Está Implementado

- **Heurístico legado:** [servicos-global/configurador/server/utils/playwright-parser.ts](../../../servicos-global/configurador/server/utils/playwright-parser.ts) (função `generateAiAnalysis`)
- **Novo (a criar):** `servicos-global/configurador/server/lib/gemini-test-analyzer.ts`
- **Frontend:** [servicos-global/configurador/src/pages/admin/LogTestes.tsx](../../../servicos-global/configurador/src/pages/admin/LogTestes.tsx) (campo `aiAnalise`)

---

## Modelo de IA

- **Modelo principal:** `gemini-2.0-flash`
- **Modelo escalável:** `gemini-2.0-pro` (se Flash devolveu `confianca: baixa`, retenta uma vez no Pro)
- **Por que Gemini, não Claude/GPT:** custo ~10x menor para Flash, latência ~3x menor, suporte nativo a `response_mime_type: application/json` que elimina parse de markdown.
- **API key:** `GEMINI_API_KEY` no `.env` do server do Configurador
