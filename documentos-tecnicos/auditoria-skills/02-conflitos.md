# 02 — Conflitos Diretos

> ⚠️ **NOTA DE PROCEDÊNCIA:** Este arquivo foi sincronizado de `master` (commit `707c7c5a`) na branch `claude/cool-elbakyan-ff8ae6` em 2026-04-28. **O conteúdo descreve o estado de master**, não o estado isolado desta branch. Skills no worktree desta branch ainda são da pré-Fase-3 (64 SKILL.md, sem `database-governance` em `lei/`, com nomes antigos `caching-strategy`/`state-management`/`resilience-patterns`/`i18n`). Conflitos marcados ✅ Resolvido foram resolvidos em master, e só ficarão verdadeiros nesta branch quando o merge acontecer.



> 8 conflitos onde 2+ skills dão instruções **opostas** ao agente.
> Cada conflito tem `Decisão do Dono:` e `Aplicado no Commit:` para rastreabilidade.
> Status só pode ser `✅ Resolvido` se **grep forense** retornou limpo.

---

## C1 — Models de produto: 3 índices vs sem índices

| Aspecto | Conteúdo |
|---|---|
| **Severidade** | 🔴 CRÍTICA |
| **Skill A** | `processos/criar-produto` (description, linha 24, linha 92): "models DEVE ter id_organizacao + 3 índices" |
| **Skill B** | `governanca/lei/isolamento-organizacao` + `arquitetura/schema-composition` (pós-pivô 2026-04-17): "Models de produto NÃO têm campo nem @@index de organizacao — schema isola fisicamente" |
| **Decisão do Dono** | Pivô Schema-per-Organizacao (2026-04-17) é a regra atual. Skills devem alinhar com Skill B. Models do **Configurador** (single-schema) são exceção legítima e mantêm índices. |
| **Aplicado no Commit** | ✅ Resolvido nesta sessão — 3 ocorrências em `criar-produto/SKILL.md` corrigidas (description, linha 24, linha 92). Grep forense `grep -rn "@@index(\[id_organizacao" skills/` retornou apenas matches em (a) Configurador exceção, (b) texto "SEM @@index" correto, (c) blocos "❌ proibido". |
| **Status Atual** | ✅ Resolvido nesta sessão |

---

## C2 — `@@map` em models: obrigatório vs proibido

| Aspecto | Conteúdo |
|---|---|
| **Severidade** | 🔴 CRÍTICA |
| **Skill A** | `governanca/lei/ddd-nomenclatura` REGRA 2 (atualizada 24/04/2026): "PascalCase + `@@map('snake_case')` obrigatório em todo model; `@map` de coluna proibido" |
| **Skill B** | `papeis/coordenador` linha 89: "Nenhum `@map` ou `@@map` (mantém naming canônico)" |
| **Decisão do Dono** | Memory `feedback_prisma_casing` (24/04/2026) é a regra atual: PascalCase + `@@map` obrigatório. `coordenador` linha 89 estava desatualizada. |
| **Aplicado no Commit** | ✅ Resolvido nesta sessão — `coordenador` linha 89 atualizada para "PascalCase nos models + `@@map('snake_case')` obrigatório (regra atualizada 2026-04-24, ver memory feedback_prisma_casing); `@map` de coluna continua proibido". Grep `grep -rn "Nenhum.*@@map\|sem @@map" skills/` retornou apenas matches em texto histórico de `ddd-nomenclatura` (falsos positivos aceitáveis). |
| **Status Atual** | ✅ Resolvido nesta sessão |

---

## C3 — Stripe como dependência: presente vs ausente

| Aspecto | Conteúdo |
|---|---|
| **Severidade** | 🟡 ALTA |
| **Skill A** | `visao-geral` + `code-standards`: cita Stripe como dependência da plataforma |
| **Skill B** | `produtos-gravity/configurador`: "Stripe NÃO é mais dependência — provedor de pagamento será definido pelo dono" |
| **Decisão do Dono** | _Pendente decisão explícita do dono — provedor de pagamento ainda não escolhido_ |
| **Aplicado no Commit** | ❌ Pendente — atualizar `visao-geral` e `code-standards` para remover Stripe das listas de dependências, mantendo placeholder "provedor de pagamento (a definir)" |
| **Status Atual** | ❌ Pendente |

---

## C4 — Master / UsuarioWorkspace via Bulk Insert vs sem vínculo

| Aspecto | Conteúdo |
|---|---|
| **Severidade** | 🟡 ALTA |
| **Skill A** | `seguranca/permissoes` (antes desta sessão): "Master é convidado → Bulk Insert para cada Workspace ativo" |
| **Skill B** | `produtos-gravity/configurador` + `database-governance`: "Master tem acesso global SEM `UsuarioWorkspace`; legado Bulk Insert removido" + Mandamento 04 (Lógica do Limbo) |
| **Decisão do Dono** | Mandamento 04 é a regra suprema: Master/Super Admin têm acesso global por `tipo_usuario`, sem precisar de `UsuarioWorkspace`. Padrão Bulk Insert para Master era legado. |
| **Aplicado no Commit** | ✅ Resolvido nesta sessão — `seguranca/permissoes` reescrita: (a) comentário do middleware checkAccess; (b) fluxo de convite Master; (c) tabela "MASTER vs Standard/Supplier" reescrita; (d) checklist final. Grep `grep -rn "Master.*Bulk Insert\|Master.*UsuarioWorkspace" skills/seguranca/permissoes/` retornou apenas matches nas regras NOVAS ("Master NÃO tem UsuarioWorkspace"). |
| **Status Atual** | ✅ Resolvido nesta sessão |

---

## C5 — `tipo_usuario` admin: `ADMIN` vs `GRAVITY_ADMIN`

| Aspecto | Conteúdo |
|---|---|
| **Severidade** | 🟢 MÉDIA |
| **Skill A** | `seguranca/permissoes`: usa `ADMIN` |
| **Skill B (anterior)** | `produtos-gravity/configurador` + `configurador/admin`: usavam `GRAVITY_ADMIN` |
| **Decisão do Dono** | Enum canônico per `permissoes`: `{SUPER_ADMIN, ADMIN, MASTER, STANDARD, SUPPLIER}` |
| **Aplicado no Commit** | ✅ Resolvido em sessão anterior (commits `56d2ca5d`, `578e0e87`) — `configurador` e `configurador/admin` já trocaram `GRAVITY_ADMIN` → `ADMIN` |
| **Status Atual** | ✅ Resolvido em sessão anterior |

---

## C6 — Cor `#f472b6` Pink 400 duplicada (Configurador + Financeiro COMEX)

| Aspecto | Conteúdo |
|---|---|
| **Severidade** | 🟢 MÉDIA |
| **Skill** | `ux/design-system/SKILL.md` (mesmo arquivo, 2 produtos atribuem a mesma cor) |
| **Decisão do Dono** | _Pendente_ — escolher cor única para um dos dois produtos. Sugestão: Configurador é Workspace admin (Tier 1), Financeiro COMEX é produto comum (Tier 2). Trocar Financeiro COMEX para outra cor da paleta Pink/Magenta. |
| **Aplicado no Commit** | ❌ Pendente |
| **Status Atual** | ❌ Pendente |

---

## C7 — Cobertura mínima de testes: 70% vs 80%

| Aspecto | Conteúdo |
|---|---|
| **Severidade** | 🟢 BAIXA |
| **Skill A** | `papeis/qa`: "Mínimo 80% em lógica crítica" |
| **Skill B** | `processos/code-review`: "Cobertura ≥ 70%" |
| **Skill C** | `testes/SKILL.md` (overview): "nucleo-global 80%, demais 70%" |
| **Decisão do Dono** | Política unificada (Skill C): nucleo-global 80%, demais 70%. `papeis/qa` e `code-review` devem referenciar Skill C em vez de citar números próprios. |
| **Aplicado no Commit** | ❌ Pendente |
| **Status Atual** | ❌ Pendente |

---

## C8 — Termo `tenant` no DDD

| Aspecto | Conteúdo |
|---|---|
| **Severidade** | ~~🟡 ALTA~~ → **⚠️ Reclassificado** |
| **Reclassificação** | Não é conflito. É **Dívida Técnica Consciente** documentada em múltiplas skills como nomes preservados por retrocompatibilidade física: pacote NPM `@gravity/resolver-organizacao`, prefixo de schema PG `tenant_<cuid>`, eventos `TenantProvisioned`, script `migrate-all-tenants.ts`, coluna física legada `tenant_id`. |
| **Decisão do Dono** | Manter como dívida técnica até ADR futuro de migração. NÃO trocar ad-hoc. Documentado em `04-lacunas-divida.md`. |
| **Aplicado no Commit** | ⚠️ Reclassificado nesta sessão (não exige ação imediata) |
| **Status Atual** | ⚠️ Dívida técnica consciente — sem ação |

---

## Resumo executivo

| # | Severidade | Status |
|:---|:---:|:---|
| C1 | 🔴 | ✅ Resolvido nesta sessão |
| C2 | 🔴 | ✅ Resolvido nesta sessão |
| C3 | 🟡 | ❌ Pendente |
| C4 | 🟡 | ✅ Resolvido nesta sessão |
| C5 | 🟢 | ✅ Resolvido em sessão anterior |
| C6 | 🟢 | ❌ Pendente |
| C7 | 🟢 | ❌ Pendente |
| C8 | ⚠️ | Reclassificado para dívida técnica |

**4 conflitos resolvidos, 3 pendentes (C3, C6, C7), 1 reclassificado.**
