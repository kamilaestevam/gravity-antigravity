# 01 — Duplicações de Regras (drift risk)

> 9 grupos de regras absolutas que aparecem em múltiplas skills.
> Cada duplicação = vetor de drift quando uma cópia é atualizada e as outras não.
> Resolução: skill canônica fica com a regra; demais **referenciam** com `> ⚠️ REGRA ABSOLUTA: Ver [...]`.

## Convenção

- **Skill canônica** = onde a regra DEVE viver (SSOT)
- **Skills que repetem** = devem ser refatoradas para virar referência

---

## #1 — Mandamento 01 (Clerk APENAS autenticação)

| Aspecto | Conteúdo |
|---|---|
| **Skill canônica** | `governanca/lei/9-mandamentos/SKILL.md` (Regra 01) |
| **Repetições** | 22 skills (literal + parafraseada) |
| **Skills repetidoras** | `agent-policy`, `isolamento-organizacao`, `sdk-resolvedor-organizacao`, `lint-tenant-safety`, `code-standards`, `visao-geral`, `seguranca/permissoes`, `seguranca-5-camadas`, `tier1-security`, `produtos-gravity/configurador`, `papeis/qa`, `processos/code-review`, `processos/criar-produto`, `arquitetura/observabilidade`, `arquitetura/estado`, `cross-boundary`, `autenticacao-s2s`, `padroes-vitest-playwright`, `agente-plano-teste-funcional`, `agente-plano-teste-unitario`, `dream-team/ajustes`, `dream-team/detetive-tela` |
| **Tipo** | Literal + parafraseada |
| **Status** | ❌ Pendente |

---

## #2 — Acesso ao banco só via SDK (`withOrganizacao`/`withOrganizacaoContext`)

| Aspecto | Conteúdo |
|---|---|
| **Skill canônica** | `governanca/lei/sdk-resolvedor-organizacao/SKILL.md` |
| **Repetições** | 18 skills (literal) |
| **Skills repetidoras** | `isolamento-organizacao`, `tier1-security`, `seguranca-5-camadas`, `lint-tenant-safety`, `agent-policy`, `code-standards`, `processos/code-review`, `papeis/qa`, `papeis/coordenador`, `database-governance`, `cross-boundary`, `autenticacao-s2s`, `arquitetura/cache`, `processos/deploy`, `criar-produto`, `dream-team/ajustes`, `dream-team/detetive-tela`, vários `agente-plano-teste*` |
| **Tipo** | Literal |
| **Status** | ❌ Pendente |

---

## #3 — `import { PrismaClient }` direto proibido

| Aspecto | Conteúdo |
|---|---|
| **Skill canônica** | `governanca/convencao-tecnica/lint-tenant-safety/SKILL.md` |
| **Repetições** | 10+ skills (literal) |
| **Skills repetidoras** | `code-standards`, `agent-policy`, `isolamento-organizacao`, `sdk-resolvedor-organizacao`, `database-governance`, `tier1-security`, `seguranca-5-camadas`, `processos/code-review`, `papeis/qa`, vários `agente-plano-teste*` |
| **Tipo** | Literal |
| **Status** | ❌ Pendente |

---

## #4 — Validação Zod obrigatória em toda rota

| Aspecto | Conteúdo |
|---|---|
| **Skill canônica** | `governanca/lei/9-mandamentos/SKILL.md` (Regra 06) |
| **Repetições** | 13 skills (parafraseada) |
| **Skills repetidoras** | `code-standards`, `agent-policy`, `api-design`, `isolamento-organizacao`, `seguranca-5-camadas`, `tier1-security`, `papeis/qa`, `processos/code-review`, `processos/criar-produto`, `contract-testing`, `cross-boundary`, `autenticacao-s2s`, `padroes-vitest-playwright` |
| **Tipo** | Parafraseada |
| **Status** | ❌ Pendente |

---

## #5 — Mandamento 02 (`schema.prisma` INTOCÁVEL)

| Aspecto | Conteúdo |
|---|---|
| **Skill canônica** | `governanca/lei/9-mandamentos/SKILL.md` (Regra 02) |
| **Repetições** | 14 skills (literal) |
| **Skills repetidoras** | `agent-policy`, `papeis/coordenador`, `papeis/qa`, `processos/code-review`, `processos/criar-produto`, `processos/deploy`, `arquitetura/schema-composition`, `database-governance`, `isolamento-organizacao`, `produtos-gravity/configurador`, `produtos-gravity/configurador/admin`, `seguranca/permissoes`, `dream-team/ajustes`, `dream-team/detetive-tela` |
| **Tipo** | Literal |
| **Status** | ❌ Pendente |

---

## #6 — DDD nomenclatura (`id_organizacao`, `id_workspace`, `id_usuario`, `tipo_usuario`)

| Aspecto | Conteúdo |
|---|---|
| **Skill canônica** | `governanca/lei/ddd-nomenclatura/SKILL.md` |
| **Repetições** | 11 skills (parafraseada) |
| **Skills repetidoras** | `agent-policy`, `code-standards`, `9-mandamentos` (Regra 03), `database-governance`, `processos/criar-produto`, `processos/code-review`, `papeis/qa`, `seguranca/permissoes`, `produtos-gravity/configurador`, `dream-team/ajustes`, `dream-team/detetive-tela` |
| **Tipo** | Parafraseada |
| **Status** | ❌ Pendente |

---

## #7 — `x-chave-interna` obrigatória em chamadas S2S

| Aspecto | Conteúdo |
|---|---|
| **Skill canônica** | `seguranca/autenticacao-s2s/SKILL.md` |
| **Repetições** | 9 skills (literal) |
| **Skills repetidoras** | `seguranca-5-camadas`, `tier1-security`, `cross-boundary`, `produtos-gravity/configurador`, `produtos-gravity/configurador/admin`, `produtos-gravity/api-cockpit`, `processos/code-review`, `papeis/qa`, `processos/deploy` |
| **Tipo** | Literal |
| **Status** | ❌ Pendente |

---

## #8 — Backup pré-migration destrutiva

| Aspecto | Conteúdo |
|---|---|
| **Skill canônica** | `governanca/lei/backup-policy/SKILL.md` |
| **Repetições** | 5 skills (1 referência correta, 4 literais) |
| **Skills repetidoras** | `processos/deploy`, `governanca/operacao/backup-disaster-recovery`, `papeis/coordenador`, `database-governance`, `processos/incident-response` |
| **Tipo** | Literal |
| **Status** | ❌ Pendente |

---

## #9 — SLA 200ms p95

| Aspecto | Conteúdo |
|---|---|
| **Skill canônica** | `governanca/lei/sla-metas/SKILL.md` |
| **Repetições** | 5 skills (parafraseada — maioria já referência correta) |
| **Skills repetidoras** | `governanca/operacao/performance-monitoring`, `arquitetura/observabilidade`, `papeis/qa`, `dream-team/ajustes`, `processos/incident-response` |
| **Tipo** | Parafraseada (boas referências em maioria) |
| **Status** | ⚠️ Parcial — boa adesão a referências; ainda há 1-2 que repetem |

---

## Próxima ação recomendada

Para cada grupo, abrir PR único que:
1. Mantém a regra **só** na skill canônica
2. Substitui em cada skill repetidora por bloco padronizado:
   ```
   > ⚠️ **REGRA ABSOLUTA:** Ver [`<skill-canonica>`](caminho) — <resumo de 1 linha>
   ```
3. Verifica via grep que zero conteúdo da regra mora fora da canônica

Priorização: começar pelas duplicações de **Mandamentos 01, 02, 06** (drift mais perigoso por afetarem segurança) — top 3 do checklist.
