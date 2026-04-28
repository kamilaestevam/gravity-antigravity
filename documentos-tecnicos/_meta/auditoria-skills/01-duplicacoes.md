# Auditoria — Duplicações entre Skills

> 9 grupos de regras que aparecem em múltiplas skills (literal ou parafraseado).
> Cada grupo identifica a **skill canônica** (onde a regra deve viver) e as skills que **repetem** (deveriam apenas referenciar).

---

## Metadados

| Campo | Valor |
|---|---|
| Data | 2026-04-28 |
| Commit | `75e0b4a5` |
| Skills lidas | 53/64 |
| Total de duplicações detectadas | **9 grupos** |
| Total de instâncias de repetição | **>110 menções** distribuídas |

---

## Convenção da Tabela

- **Tipo**: `literal` (cópia textual) ou `parafraseada` (mesma regra, palavras diferentes)
- **Ação sugerida**: Vertical/operação **referencia** canonical em vez de redefinir; lei pode redefinir mas com link explícito

---

## Grupo 1 — Mandamento 01 (Clerk APENAS para autenticação)

**Skill canônica:** `governanca/lei/9-mandamentos/SKILL.md` (REGRA 01)

**Skills que repetem (22):**

| # | Skill | Linhas aproximadas | Tipo |
|---:|---|---|---|
| 1 | `governanca/lei/agent-policy/SKILL.md` | 127-133 | literal |
| 2 | `governanca/lei/visao-geral/SKILL.md` | 52, 219-220 | parafraseada |
| 3 | `governanca/lei/isolamento-organizacao/SKILL.md` | 99, 211 | parafraseada |
| 4 | `governanca/lei/sdk-resolvedor-organizacao/SKILL.md` | 21, 305-306 | parafraseada |
| 5 | `governanca/convencao-tecnica/lint-tenant-safety/SKILL.md` | 142-163 (Regra 5) | implementação técnica (justificável) |
| 6 | `governanca/convencao-tecnica/code-standards/SKILL.md` | 270, 307-345 | parafraseada |
| 7 | `seguranca/tier1-security/SKILL.md` | 11, 202 | parafraseada |
| 8 | `seguranca/seguranca-5-camadas/SKILL.md` | 55-74 (Camada 2) | parafraseada |
| 9 | `seguranca/permissoes/SKILL.md` | 17, 358-360 | literal |
| 10 | `produtos-gravity/configurador/SKILL.md` | 13-14, 376 | parafraseada |
| 11 | `produtos-gravity/configurador/admin/SKILL.md` | 13-14, 42-47 | parafraseada |
| 12 | `seguranca/autenticacao-s2s/SKILL.md` | 56-66 | parafraseada |
| 13 | `processos/deploy/SKILL.md` | 54, 58, 64, 72, 113-116 | parafraseada |
| 14 | `governanca/operacao/performance-monitoring/SKILL.md` | (refs cruzadas) | parafraseada |
| 15 | `papeis/qa/SKILL.md` | 42-44, 327 | literal |
| 16 | `processos/code-review/SKILL.md` | 36-37 | literal |
| 17 | `arquitetura/schema-composition/SKILL.md` | (referência) | parafraseada |
| 18 | `arquitetura/servicos-organizacao/SKILL.md` | 19-20 | parafraseada |
| 19 | `testes/SKILL.md` | (em cobertura crítica) | parafraseada |
| 20 | `seguranca/pentest/SKILL.md` | 71 | parafraseada |
| 21 | `processos/criar-produto/SKILL.md` | 32 | parafraseada |
| 22 | `governanca/convencao-tecnica/database-governance/SKILL.md` | 8 | parafraseada |

**Ação sugerida:** verticais/operação **referenciam** o Mandamento 01 com link `[Mandamento 01](../../governanca/lei/9-mandamentos/SKILL.md#regra-01)` em vez de repetir o texto. Implementação técnica em `lint-tenant-safety` é JUSTIFICÁVEL (codifica a regra para detecção).

---

## Grupo 2 — Acesso ao banco só via SDK (`withTenant`/`withTenantContext`)

**Skill canônica:** `governanca/lei/sdk-resolvedor-organizacao/SKILL.md`

**Skills que repetem (18):**

| # | Skill | Tipo |
|---:|---|---|
| 1 | `governanca/lei/isolamento-organizacao/SKILL.md` | literal (~50% sobreposição) |
| 2 | `governanca/convencao-tecnica/code-standards/SKILL.md` | parafraseada |
| 3 | `governanca/convencao-tecnica/lint-tenant-safety/SKILL.md` | implementação técnica |
| 4 | `governanca/convencao-tecnica/database-governance/SKILL.md` | parafraseada |
| 5 | `arquitetura/servicos-organizacao/SKILL.md` | literal |
| 6 | `arquitetura/schema-composition/SKILL.md` | literal |
| 7 | `seguranca/tier1-security/SKILL.md` | literal (~60% sobreposição com `isolamento-organizacao`) |
| 8 | `seguranca/seguranca-5-camadas/SKILL.md` | parafraseada |
| 9 | `seguranca/pentest/SKILL.md` | literal (item OWASP 1) |
| 10 | `produtos-gravity/configurador/SKILL.md` | parafraseada |
| 11 | `produtos-gravity/api-cockpit/SKILL.md` | parcial |
| 12 | `seguranca/cross-boundary/SKILL.md` | parafraseada |
| 13 | `arquitetura/resilience-patterns/SKILL.md` | parafraseada |
| 14 | `arquitetura/observabilidade/SKILL.md` | parafraseada |
| 15 | `testes/SKILL.md` | em testes anti-cross-organização |
| 16 | `processos/deploy/SKILL.md` | parafraseada |
| 17 | `processos/code-review/SKILL.md` | literal (checklist) |
| 18 | `processos/criar-produto/SKILL.md` | literal (Passo 12, 19) |

**Ação sugerida:** consolidar exemplos de uso e contrato em `sdk-resolvedor-organizacao`; outras skills referenciam.

---

## Grupo 3 — `import { PrismaClient }` direto proibido

**Skill canônica:** `governanca/convencao-tecnica/lint-tenant-safety/SKILL.md` (Regra 1)

**Skills que repetem (10):**

| # | Skill | Tipo |
|---:|---|---|
| 1 | `governanca/lei/isolamento-organizacao/SKILL.md` | literal |
| 2 | `governanca/lei/sdk-resolvedor-organizacao/SKILL.md` | literal |
| 3 | `governanca/convencao-tecnica/code-standards/SKILL.md` | literal (linha 60-61) |
| 4 | `governanca/convencao-tecnica/database-governance/SKILL.md` | parafraseada |
| 5 | `seguranca/tier1-security/SKILL.md` | literal |
| 6 | `seguranca/seguranca-5-camadas/SKILL.md` | parafraseada |
| 7 | `seguranca/pentest/SKILL.md` | literal |
| 8 | `arquitetura/servicos-organizacao/SKILL.md` | parafraseada |
| 9 | `processos/code-review/SKILL.md` | literal (checklist) |
| 10 | `papeis/qa/SKILL.md` | literal (checklist) |

**Ação sugerida:** essa regra é **codificada no linter** — o linter É a fonte de verdade. Outras skills referenciam `lint-tenant-safety` Regra 1.

---

## Grupo 4 — Validação Zod obrigatória em toda rota

**Skill canônica:** `governanca/lei/9-mandamentos/SKILL.md` (REGRA 06)

**Skills que repetem (13):**

| # | Skill | Tipo |
|---:|---|---|
| 1 | `governanca/lei/agent-policy/SKILL.md` | literal |
| 2 | `governanca/convencao-tecnica/code-standards/SKILL.md` | literal + exemplo (60-95) |
| 3 | `governanca/convencao-tecnica/api-design/SKILL.md` | parafraseada (parte de "validação com Zod") |
| 4 | `governanca/lei/visao-geral/SKILL.md` | parafraseada |
| 5 | `governanca/lei/isolamento-organizacao/SKILL.md` | parafraseada |
| 6 | `seguranca/seguranca-5-camadas/SKILL.md` | parafraseada |
| 7 | `seguranca/pentest/SKILL.md` | item OWASP 1 + 8 |
| 8 | `arquitetura/servicos-organizacao/SKILL.md` | parafraseada |
| 9 | `produtos-gravity/configurador/SKILL.md` | parafraseada |
| 10 | `processos/criar-produto/SKILL.md` | Passo 15 |
| 11 | `papeis/qa/SKILL.md` | literal (checklist) |
| 12 | `processos/code-review/SKILL.md` | literal (checklist) |
| 13 | `testes/SKILL.md` | em contract testing |

**Ação sugerida:** Zod é **lei** (Mandamento 06). Verticais referenciam.

---

## Grupo 5 — Mandamento 02 — `schema.prisma` INTOCÁVEL

**Skill canônica:** `governanca/lei/9-mandamentos/SKILL.md` (REGRA 02)

**Skills que repetem (14):**

| Skill | Tipo |
|---|---|
| `governanca/lei/agent-policy/SKILL.md` | literal |
| `governanca/lei/visao-geral/SKILL.md` | parafraseada |
| `governanca/lei/ddd-nomenclatura/SKILL.md` | referência (linha 324, 334) |
| `governanca/convencao-tecnica/code-standards/SKILL.md` | parafraseada |
| `governanca/convencao-tecnica/database-governance/SKILL.md` | linhas 39, 226 |
| `arquitetura/schema-composition/SKILL.md` | literal (várias) |
| `seguranca/permissoes/SKILL.md` | linha 226 |
| `produtos-gravity/configurador/SKILL.md` | linha 83 |
| `produtos-gravity/configurador/admin/SKILL.md` | linha 187 |
| `arquitetura/servicos-organizacao/SKILL.md` | parafraseada |
| `papeis/coordenador/SKILL.md` | literal |
| `papeis/qa/SKILL.md` | literal |
| `processos/code-review/SKILL.md` | literal |
| `processos/criar-produto/SKILL.md` | Passo 13 |

**Ação sugerida:** Lei. Verticais referenciam.

---

## Grupo 6 — DDD nomenclatura

**Skill canônica:** `governanca/lei/ddd-nomenclatura/SKILL.md`

**Skills que repetem o glossário (id_organizacao, tipo_usuario, etc.) (11):**

| Skill | Tipo |
|---|---|
| `governanca/lei/9-mandamentos/SKILL.md` | parafraseada (REGRA 03) |
| `governanca/lei/agent-policy/SKILL.md` | parafraseada |
| `governanca/lei/visao-geral/SKILL.md` | parafraseada |
| `governanca/convencao-tecnica/api-design/SKILL.md` | aplicação (justificável) |
| `governanca/convencao-tecnica/code-standards/SKILL.md` | tabela linhas 206-220 |
| `governanca/convencao-tecnica/database-governance/SKILL.md` | tabela linhas 234-244 |
| `produtos-gravity/configurador/SKILL.md` | parafraseada (várias seções) |
| `seguranca/permissoes/SKILL.md` | aplicação |
| `arquitetura/i18n/SKILL.md` | aplicação parcial |
| `papeis/qa/SKILL.md` | checklist |
| `processos/code-review/SKILL.md` | checklist |

**Ação sugerida:** DDD nomenclatura é a lei. Tabelas em outras skills devem ser **subset aplicado** (ex: api-design exemplifica como rotear), nunca contradizer ou redefinir.

---

## Grupo 7 — `x-chave-interna` obrigatória S2S

**Skill canônica:** `seguranca/autenticacao-s2s/SKILL.md`

**Skills que repetem (9):**

| Skill | Linha aproximada | Tipo |
|---|---|---|
| `seguranca/seguranca-5-camadas/SKILL.md` | 26-49 (Camada 1) | literal |
| `governanca/convencao-tecnica/code-standards/SKILL.md` | linha 322 | parafraseada |
| `governanca/convencao-tecnica/api-design/SKILL.md` | tabela headers | parafraseada |
| `seguranca/cross-boundary/SKILL.md` | parafraseada |
| `seguranca/rate-limiting/SKILL.md` | bypass interno | parafraseada |
| `arquitetura/servicos-organizacao/SKILL.md` | linha 109 | parafraseada |
| `processos/deploy/SKILL.md` | parafraseada |
| `processos/criar-produto/SKILL.md` | Passo 12 | parafraseada |
| `processos/code-review/SKILL.md` | checklist | literal |

**Ação sugerida:** lei de segurança vive em `autenticacao-s2s`. Outras referenciam.

---

## Grupo 8 — Backup pré-migration destrutiva

**Skill canônica:** `governanca/lei/backup-policy/SKILL.md`

**Skills que repetem (5):**

| Skill | Comportamento |
|---|---|
| `governanca/operacao/backup-disaster-recovery/SKILL.md` | ✅ **Referencia corretamente** (boa prática) |
| `processos/deploy/SKILL.md` | ❌ Repete inteiro (linhas 387-407) |
| `arquitetura/schema-composition/SKILL.md` | menção parafraseada |
| `governanca/convencao-tecnica/database-governance/SKILL.md` | menção parafraseada |
| `papeis/coordenador/SKILL.md` | menção em fluxo de migration |

**Ação sugerida:** `backup-disaster-recovery` é o modelo correto (referencia em vez de repetir). `deploy` precisa adotar o mesmo padrão.

---

## Grupo 9 — SLA 200ms p95

**Skill canônica:** `governanca/lei/sla-metas/SKILL.md`

**Skills que repetem (5):**

| Skill | Comportamento |
|---|---|
| `governanca/operacao/performance-monitoring/SKILL.md` | ✅ Referencia corretamente |
| `governanca/convencao-tecnica/observabilidade-minima/SKILL.md` | ✅ Referencia corretamente |
| `arquitetura/observabilidade/SKILL.md` | ❌ Repete tabela inteira (linhas 248-256) |
| `arquitetura/resilience-patterns/SKILL.md` | menção parafraseada |
| `arquitetura/caching-strategy/SKILL.md` | menção em "atingir 200ms" |

**Ação sugerida:** `arquitetura/observabilidade` deve referenciar `sla-metas` em vez de repetir. As outras estão OK.

---

## Conclusão

| Padrão | Volume | Ação principal |
|---|---:|---|
| Verticais/operação repetem leis | 9 grupos × média 12 skills | Refactor: substituir repetição por link |
| Lei repete lei (entre `9-mandamentos`, `agent-policy`, `visao-geral`) | ~30 menções | Aceitável (introdução) — mas remover desatualizadas |
| Implementação técnica repete contrato | 4 grupos | **Justificável** (linter, schemas, SDKs, testes) |

**Próximo passo:** após decisão sua sobre os 8 conflitos (`02-conflitos.md`) e 10 violações SSOT (`03-violacoes-ssot.md`), agente de refactor de skills usa este arquivo como guia para a operação de "substituir repetição por referência".
