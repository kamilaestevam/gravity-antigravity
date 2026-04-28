# Auditoria — Violações SSOT

> **10 violações detectadas.** Skills verticais ou de operação que **redefinem** regras absolutas que vivem em `governanca/lei/`.
>
> O CLAUDE.md é explícito: "regras absolutas moram em governanca, verticais referenciam — nunca redefinem". Cada item aqui é um desvio desse princípio.

---

## Metadados

| Campo | Valor |
|---|---|
| Data | 2026-04-28 |
| Commit | `75e0b4a5` |
| Skills lidas | 53/64 |
| Total de violações | **10** |
| Críticas | **3** (S1, S2, S10) |
| Altas | **5** (S3, S5, S6, S7, S9) |
| Médias | **2** (S4, S8) |

---

## Princípio SSOT do CLAUDE.md

> "**NENHUMA REGRA ABSOLUTA DEVE SER ESCRITA EM SKILLS DE OPERAÇÃO OU VERTICAIS. REGRAS MORAM EM GOVERNANÇA.**"
>
> "Toda regra absoluta vive em `skills/governanca/lei/` (regras de negócio/arquitetura) ou `skills/governanca/convencao-tecnica/` (convenções de código). Skills em `produtos-gravity/`, `arquitetura/`, `seguranca/`, `governanca/operacao/` etc. **referenciam** as regras via blocos `> ⚠️ REGRA ABSOLUTA: Ver [...]`. **Nunca redefinem.**"

---

## S1 — `governanca/convencao-tecnica/code-standards/SKILL.md` repete 4 Mandamentos inteiros

**Severidade:** 🔴 **Crítica**

**O que é repetido:**
- Mandamento 01 (Clerk APENAS autenticação) — linhas 270, 307, 322, 344-345
- Mandamento 02 (schema.prisma INTOCÁVEL) — múltiplas menções
- Mandamento 03 (DDD) — tabela de naming linhas 206-220
- Mandamento 06 (Zod obrigatório) — exemplo completo linhas 60-95
- Regras de isolamento (linhas 343-349)

**Skill canônica:**
- `governanca/lei/9-mandamentos/SKILL.md` (Mandamentos 01, 02, 03, 06)
- `governanca/lei/ddd-nomenclatura/SKILL.md` (naming)
- `governanca/lei/sdk-resolvedor-organizacao/SKILL.md` (isolamento)

**Refactor sugerido:**
- Substituir blocos de regra por `> ⚠️ REGRA ABSOLUTA: Ver [Mandamento NN](../../../lei/9-mandamentos/SKILL.md#regra-NN)`
- Manter apenas: tsconfig base, formato AppError, error handler global, naming conventions de TS (camelCase/PascalCase), estrutura de servidor Express, env vars convention, versionamento de API, comentários, console.log, tamanho de funções
- Reduzir de ~382 linhas para ~150

---

## S2 — `governanca/lei/agent-policy/SKILL.md` redefine Mandamento 01 e regras desatualizadas

**Severidade:** 🔴 **Crítica** (porque está em `governanca/lei/` e deveria SER fonte, mas conflita com `9-mandamentos`)

**O que é repetido + desatualizado:**
- Mandamento 01 inteiro (linhas 127-133)
- Mandamento 02, 06, 07, 08 reduzidos
- **3 índices obrigatórios** — conflita com pivô Schema-per-Organização (ver C1 em `02-conflitos.md`)
- Lista de regras de schema antiga (`id_organizacao` obrigatório em todo model — pós-pivô não é mais)

**Skill canônica:**
- `governanca/lei/9-mandamentos/SKILL.md` para mandamentos
- `governanca/lei/isolamento-organizacao/SKILL.md` para schema-per-organização

**Refactor sugerido:**
- Manter: ordem de prioridade, escopo por agente, regras de pasta, regras universais agente-policy-específicas
- Remover: detalhamento dos mandamentos (referenciar)
- Atualizar: regras de schema pós-pivô
- Reduzir de ~241 linhas para ~120

---

## S3 — `governanca/lei/visao-geral/SKILL.md` repete várias regras absolutas

**Severidade:** 🟠 **Alta**

**O que é repetido + desatualizado:**
- Mandamentos 01, 02, 03, 06 (linhas 209-222)
- Stack inteira incluindo Stripe (desatualizado — ver C3)
- Estrutura monorepo (também em `agent-policy` e `00-projeto-gravity`)
- 4 Ondas (também em `agent-policy`, `coordenador`)

**Skill canônica:**
- `governanca/lei/9-mandamentos/SKILL.md`
- `governanca/lei/agent-policy/SKILL.md` (estrutura monorepo + ondas)
- `governanca/operacao/service-registry/SKILL.md` (stack tecnológica)

**Refactor sugerido:**
- Manter: introdução do projeto, propósito, mapa de skills (linhas 226-253)
- Remover: detalhe dos mandamentos, stack completa (referenciar), regras arquiteturais (referenciar)
- Atualizar: Stripe → "provedor de pagamento (definir)"
- Reduzir de ~253 linhas para ~80

---

## S4 — `governanca/lei/isolamento-organizacao/SKILL.md` ↔ `sdk-resolvedor-organizacao/SKILL.md`

**Severidade:** 🟡 **Média** (ambas são lei — sobreposição parcial é tolerável, mas há ~40% de duplicação)

**O que é duplicado:**
- Conceito de Schema-per-Organização (ambas explicam)
- Implementação de `withTenant` (`isolamento-organizacao` mostra exemplo + sdk explica contrato)
- Lista do que é proibido (idêntico)
- Defense-in-depth com `SET LOCAL`

**Decisão pendente:**
- **Opção A**: fundir em uma skill única (~700 linhas combinadas)
- **Opção B**: manter ambas com fronteira clara — `isolamento-organizacao` = **conceito + por quê**, `sdk-resolvedor-organizacao` = **API contract + como usar**. Eliminar duplicação editorial entre as duas.

**Recomendação:** Opção B — separar conceito de implementação, mas com link explícito de uma para a outra.

---

## S5 — `seguranca/tier1-security/SKILL.md` duplica `isolamento-organizacao` quase inteiro

**Severidade:** 🟠 **Alta** (~80% de sobreposição)

**O que é duplicado:**
- Schema-per-Organização (linhas 18-72)
- `SET LOCAL search_path` em transação
- Linter custom como gatekeeper
- Background jobs com `withTenantContext`
- Cache Redis com prefixo
- Pre-signed URLs S3
- Endpoints `/admin/*`

**Skill canônica:**
- `governanca/lei/isolamento-organizacao/SKILL.md`
- `governanca/convencao-tecnica/lint-tenant-safety/SKILL.md`
- `governanca/lei/sdk-resolvedor-organizacao/SKILL.md`

**Refactor sugerido:**
- Considerar **deletar** `tier1-security` e mesclar conteúdo único (se houver) em `isolamento-organizacao`
- Ou transformar em skill **resumo executivo** (~40 linhas) com links para todas as fontes

---

## S6 — `seguranca/seguranca-5-camadas/SKILL.md` duplica regras de isolamento e auth

**Severidade:** 🟠 **Alta**

**O que é duplicado:**
- Camada 1 (Rede + `x-chave-interna`) — repete `seguranca/autenticacao-s2s`
- Camada 2 (Autenticação Clerk) — repete Mandamento 01
- Camada 3 (Autorização Prisma) — repete `seguranca/permissoes`
- Camada 4 (Isolamento) — repete `isolamento-organizacao` linhas 105-126
- Camada 5 (Auditoria) — única seção razoavelmente única

**Skill canônica:**
- Cada camada tem skill própria

**Refactor sugerido:**
- Manter como **mapa de checklist** (resumo de 5 camadas com link cada)
- Reduzir cada seção para 5-10 linhas + link
- Manter Camada 5 (Auditoria) com mais detalhe se não houver skill dedicada

---

## S7 — `processos/criar-produto/SKILL.md` Passo 13 conflita com pós-pivô

**Severidade:** 🟠 **Alta** (gera produto novo COM regras antigas)

**O que está desatualizado:**
- Passo 13: "todo model DEVE ter `id_organizacao`, `id_produto`, `id_usuario` e os 3 índices obrigatórios" — viola Schema-per-Organização (C1)
- Passo 19: usa `withTenantContext` corretamente
- Passo 12 (11 middlewares): inclui `tenantIsolationMiddleware` — nome do middleware mudou para `tenantResolver` (verificar se ainda é o mesmo)

**Skill canônica:**
- `governanca/lei/isolamento-organizacao/SKILL.md` para padrão de model
- `governanca/lei/sdk-resolvedor-organizacao/SKILL.md` para middleware

**Refactor sugerido:**
- Atualizar Passo 13 — fragment.prisma sem `id_organizacao` em models de produto
- Atualizar Passo 12 — `tenantResolver` (não `tenantIsolationMiddleware`)
- Adicionar bloco `> ⚠️ REGRA ABSOLUTA` apontando para `isolamento-organizacao`

---

## S8 — `papeis/qa/SKILL.md` + `processos/code-review/SKILL.md` repetem dezenas de checklists

**Severidade:** 🟡 **Média** (justificável como checklist consolidado, mas alto risco de drift)

**O que é duplicado:**
- `qa` tem **~70 checks** repetindo Mandamentos, Isolamento, Cobertura, Padrões
- `code-review` tem **~30 checks** quase idênticos a `qa`
- Quando uma regra absoluta muda, ambas ficam desatualizadas

**Decisão pendente:**
- Manter checklists consolidados (justificável) mas **gerar automaticamente** a partir das skills canônicas via script
- Ou **referenciar diretamente** a skill canônica em cada item: "[ ] Mandamento 01 respeitado (ver [Regra 01](...))"

**Recomendação:** referenciar via link em vez de repetir o texto — checklist fica mais curto e drift desaparece.

---

## S9 — `processos/deploy/SKILL.md` repete auto-scaling e backup inteiros

**Severidade:** 🟠 **Alta**

**O que é duplicado:**
- "Auto-Scaling Rules (Dream Team)" linhas 343-368 — repete `governanca/operacao/auto-scaling/SKILL.md` inteiro
- "Backup Antes de Migration Destrutiva" linhas 387-407 — repete `governanca/lei/backup-policy/SKILL.md` + `governanca/operacao/backup-disaster-recovery/SKILL.md`
- Health check linhas 318-326 — duplica `arquitetura/observabilidade/SKILL.md`

**Skill canônica:**
- `governanca/operacao/auto-scaling/SKILL.md`
- `governanca/lei/backup-policy/SKILL.md`
- `governanca/operacao/backup-disaster-recovery/SKILL.md`

**Refactor sugerido:**
- Substituir seções por blocos `> ⚠️ REGRA ABSOLUTA: Ver [...]`
- Manter apenas: protocolo de migrations passo-a-passo, ordem de deploy entre serviços, CI/CD com GitHub Actions, protocolo de emergência
- Reduzir de ~430 linhas para ~250

---

## S10 — `governanca/convencao-tecnica/database-governance/SKILL.md` define LEIS

**Severidade:** 🔴 **Crítica** (taxonomia errada)

**O que está em "convenção técnica" mas é LEI:**
- **Regra Zero — CUID Obrigatório** (linha 13-44) — decisão arquitetural inviolável
- **Regra 1 — Paridade Nominal Absoluta** (linha 49-89) — "A regra mais importante do projeto"
- **Regra 2 — Database-per-Service** (linha 92-131) — decisão arquitetural
- **Regra 3 — `public` 100% vazio** (linha 135-170) — decisão arquitetural
- **Regra de Ouro — FK Nullable Proibida** (linha 174-218) — "decisão arquitetural inviolável"
- **Regras de Migrations** (linha 293-368) — "aprendizado validado em produção"

**Análise:**
A skill está em `governanca/convencao-tecnica/` mas o conteúdo é normativo absoluto, não convenção técnica. O CLAUDE.md diz que `convencao-tecnica/` é "como escrever código" — mas esta skill define **arquitetura de banco**, não como escrever.

**Decisão pendente:**
- [ ] **Mover skill para `governanca/lei/database-governance/`**?
- [ ] Ou **dividir**: regras absolutas (CUID, paridade, DB-per-service, public vazio, FK nullable) viram **Mandamentos novos** (ou skill em `lei/`); migrations + naming voltam para `convencao-tecnica/`?
- [ ] Manter onde está e aceitar que "convencao-tecnica" também aceita lei?

**Recomendação:** dividir. A regra "paridade Front=Back=Banco" é citada como "a regra mais importante do projeto" — deveria ser **Mandamento 10**.

---

## Resumo Executivo

| # | Skill | Severidade | Refactor estimado |
|---|---|---|---|
| S1 | `code-standards` | **Crítica** | -60% linhas |
| S2 | `agent-policy` | **Crítica** | -50% linhas + atualização |
| S3 | `visao-geral` | Alta | -70% linhas |
| S4 | `isolamento-organizacao` ↔ `sdk-resolvedor-organizacao` | Média | fronteira clara |
| S5 | `tier1-security` | Alta | -80% ou deletar |
| S6 | `seguranca-5-camadas` | Alta | -70% ou virar mapa |
| S7 | `criar-produto` Passo 13 | Alta | atualização pós-pivô |
| S8 | `qa` + `code-review` | Média | links em vez de repetição |
| S9 | `deploy` (auto-scaling + backup) | Alta | -40% linhas |
| S10 | `database-governance` (taxonomia) | **Crítica** | mover para `lei/` |

---

## Ações sugeridas (em ordem)

1. **Decidir taxonomia de `database-governance`** (S10) — afeta onde outras skills referenciam
2. **Atualizar `agent-policy` e `criar-produto`** com regras pós-pivô (S2, S7) — destrava ondas
3. **Refactor de `code-standards`** removendo redundância (S1)
4. **Decidir destino de `tier1-security`** (S5) — manter, fundir, ou deletar
5. **Reduzir `visao-geral`, `seguranca-5-camadas`, `deploy`** (S3, S6, S9) — substituir blocos por links
6. **Definir fronteira `isolamento-organizacao` ↔ `sdk-resolvedor-organizacao`** (S4)
7. **Substituir checklists de `qa` e `code-review` por links** (S8) — opcional, baixo risco

> **Nota:** este refactor é trabalho do **agente de refactor de skills** (não meu — eu apenas audito). Quando você tiver decidido cada item, dispara o agente com este arquivo + `02-conflitos.md` como input.
