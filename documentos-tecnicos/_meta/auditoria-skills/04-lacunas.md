# Auditoria — Lacunas Normativas

> **3 lacunas detectadas na pré-passada** (regras conhecidas no projeto que não estão cobertas por nenhuma skill).
>
> Este documento **cresce ao longo das ondas A-D**: cada ciclo de skill que detectar regra implementada em código sem skill correspondente registra aqui.

---

## Metadados

| Campo | Valor |
|---|---|
| Data inicial | 2026-04-28 |
| Commit inicial | `75e0b4a5` |
| Skills lidas | 53/64 |
| Lacunas iniciais | **3** |
| Lacunas detectadas em código (pendente — depende das ondas) | 0 (será preenchido durante ciclos) |

---

## Tipo 5 vs Tipo Inicial

Lacunas de auditoria têm dois subtipos:

| Subtipo | Como é detectado | Quando |
|---|---|---|
| **Inicial (cruzamento de skills)** | Tema mencionado em skills mas sem skill dedicada | Pré-passada (este momento) |
| **Por código (Tipo 5 da auditoria)** | Regra implementada em código sem skill cobrindo | Ciclos das ondas A-D |

---

## Lacunas Iniciais (3)

### L1 — Webhooks recebidos (validação HMAC, idempotência, raw body)

**Severidade:** 🟡 **Média**

**Indicadores no código/skills:**
- `arquitetura/servicos-organizacao/SKILL.md:108`: `app.use('/webhook', express.raw(...))` (Raw body para webhooks — antes do json)
- `governanca/convencao-tecnica/criptografia/SKILL.md`: descreve webhooks **enviados** (HMAC-SHA256, X-Gravity-Signature)
- Mas **não há skill** sobre webhooks **recebidos** (Stripe, Clerk, Meta WhatsApp, NF-e APIs)

**O que falta:**
- Como validar assinatura HMAC de webhook recebido (especialmente Clerk, Stripe se voltar)
- Padrão de idempotência em webhook receiver
- Tratamento de raw body antes do `express.json()`
- Retry/backoff do lado do receiver
- Tabela de eventos esperados por provider externo

**Skill sugerida (se você quiser cobrir):**
- `seguranca/webhooks-recebidos/SKILL.md` ou seção dedicada em `seguranca/cross-boundary/SKILL.md`

---

### L2 — BullMQ / Jobs assíncronos com Redis

**Severidade:** 🟡 **Média**

**Indicadores no código/skills:**
- `seguranca/cross-boundary/SKILL.md:181-211`: descreve BullMQ como "Fase 3"
- `arquitetura/resilience-patterns/SKILL.md:117-134`: idem
- `governanca/operacao/auto-scaling/SKILL.md`: menciona Redis para session/cache
- Mas **não há skill** sobre como configurar e operar BullMQ quando chegar a Fase 3

**O que falta:**
- Padrão de Worker (concurrency, retry, backoff config)
- Padrão de Queue (priority, removeOnComplete, removeOnFail)
- DLQ explícita (Redis ou tabela?)
- Observabilidade de filas (BullBoard? métricas Prometheus?)
- Migration estratégia: tabela `FailedOrgAction` → BullMQ
- Quando NÃO usar BullMQ (ações síncronas, retries simples cabem em fetch retry)

**Skill sugerida:**
- `arquitetura/jobs-assincronos/SKILL.md` (a criar quando entrar em Fase 3)

**Status atual:** **diferir** — Fase 3 ainda não chegou. Apenas registrar a lacuna.

---

### L3 — Graceful shutdown / Hot reload de servidor

**Severidade:** 🟢 **Baixa**

**Indicadores:**
- Nenhuma skill menciona SIGTERM, drain de conexões, hot reload
- `processos/deploy/SKILL.md` fala de rollback mas não de shutdown gracioso
- `arquitetura/observabilidade/SKILL.md` fala de health check `/health` mas não de comportamento durante shutdown

**O que falta:**
- Como o servidor responde a SIGTERM
- Drain de conexões DB ativas durante shutdown
- Health check retorna 503 durante drain
- Hot reload em dev (nodemon? tsx watch?)

**Skill sugerida:**
- Tolerável **não criar** até que apareça regressão concreta. Adicionar em `processos/deploy/` se virar problema.

---

## Lacunas Detectadas Durante as Ondas (vazio inicialmente)

> Esta seção será preenchida pelo agente de ciclo de cada onda. Formato:

```markdown
### LN — [Título da lacuna]

**Detectado em:** [data]
**Ciclo da onda:** [ex: Onda A — produtos-gravity/configurador]
**Severidade:** Crítica / Alta / Média / Baixa

**Indicador no código:**
- Arquivo: `path/to/file.ts:123`
- Função: `nomeDaFuncao()`
- Trecho: [3-5 linhas com a regra implementada]

**O que falta:**
- Descrição da regra que está em código mas não em skill

**Skill onde deveria estar (se existir):**
- `[caminho/da/skill/SKILL.md]`

**Decisão pendente:**
- [ ] Atualizar skill X com a regra?
- [ ] Criar skill nova?
- [ ] É bug de implementação (regra inventada, deve sair do código)?
```

---

## Estatísticas (atualizadas a cada ciclo)

| Onda | Skills processadas | Lacunas detectadas em código |
|---|---:|---:|
| Pré-passada | 53/64 | 3 |
| Onda A | 0/4 | 0 |
| Onda B | 0/11 | 0 |
| Onda C | 0/12 | 0 |
| Onda D | 0/16 | 0 |
| **Total** | **53/64** | **3** |

---

## Como o Agente de Ciclo Atualiza Este Arquivo

Durante a Fase 2 (Produção) de cada ciclo:

1. Ler o código do módulo sendo documentado
2. Identificar regras de negócio (validações, condições, guards)
3. Para cada regra encontrada:
   - Existe skill cobrindo? → continuar (não é lacuna)
   - Não existe skill? → adicionar entrada nova nesta seção do arquivo
4. No fim do ciclo, atualizar o contador na tabela "Estatísticas"

---

## Anti-padrões (NÃO registrar como lacuna)

- ❌ Validação Zod específica de uma rota — é aplicação de regra geral
- ❌ Naming de variável local — é aplicação de DDD nomenclatura
- ❌ Verificação de permissão pontual — é aplicação de `seguranca/permissoes`
- ❌ Try/catch específico — é aplicação de error handler global

**Critério para registrar:** a regra é **genérica** (afeta múltiplos arquivos/módulos), está **implementada em código**, e **nenhuma skill atual cobre**.
