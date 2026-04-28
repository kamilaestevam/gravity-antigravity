# Auditoria — Conflitos entre Skills

> **8 conflitos diretos detectados.** Skills se contradizem entre si. Estas são as decisões mais urgentes — bloqueiam ciclos das ondas A-D até serem resolvidas.
>
> **Eu não decido qual está certo.** Eu apenas reporto. A decisão é do dono do projeto.

---

## Metadados

| Campo | Valor |
|---|---|
| Data | 2026-04-28 |
| Commit | `75e0b4a5` |
| Skills lidas | 53/64 |
| Total de conflitos | **8** |
| Críticos | **2** (C1, C2) |
| Altos | **4** (C3, C4, C8) |
| Médios | **2** (C5, C6) |
| Baixos | **1** (C7) |

---

## Convenção da Tabela de Conflito

Cada conflito tem:
- **Tema**: o que está sendo contradito
- **Skill A** + citação literal
- **Skill B** + citação literal
- **Severidade**: Crítica / Alta / Média / Baixa
- **Decisão pendente**: campo a ser preenchido pelo dono

---

## C1 — 3 índices obrigatórios em models de produto

**Severidade:** 🔴 **CRÍTICA** (afeta toda criação de model novo)

### Skill A — exige 3 índices

**`governanca/lei/agent-policy/SKILL.md`** (regra ainda ativa) e **`processos/criar-produto/SKILL.md`** (Passo 13):

> "Todo model tem 3 índices: `@@index([id_organizacao])`, `@@index([id_organizacao, id_produto])`, `@@index([id_organizacao, id_usuario])`"

> "todo model DEVE ter `id_organizacao`, `id_produto`, `id_usuario` e os **3 índices obrigatórios**"

### Skill B — proíbe campo de organização e índice

**`governanca/lei/isolamento-organizacao/SKILL.md`** (linha 82, pós-pivô 2026-04-17):

> "Coluna `tenant_id` ou campo Prisma `id_organizacao` em tabelas de produto" → **PROIBIDO**

**`arquitetura/schema-composition/SKILL.md`** (linha 88-98):

> "Models de produto **não têm campo de Organização**. O **schema é a Organização**."
> "Models não têm campo `id_organizacao` (o schema É a Organização)"
> "Models não têm `@@index([id_organizacao, ...])` (o schema isola fisicamente)"

### Origem do conflito

Pivô arquitetural de 2026-04-17 (Schema-per-Organização) tornou os 3 índices desnecessários — o schema isola fisicamente, removendo a necessidade de filtro por `id_organizacao`. Mas `agent-policy` e `criar-produto` não foram atualizados.

### Decisão pendente
- [ ] Atualizar `agent-policy` e `criar-produto/Passo 13` removendo a exigência de 3 índices?
- [ ] Manter como "transição" durante janela de migração ADR-003 (Fases 2-3)?
- [ ] Outra abordagem?

---

## C2 — `@@map` em models Prisma

**Severidade:** 🔴 **CRÍTICA** (afeta toda alteração de schema)

### Skill A — `@@map` OBRIGATÓRIO

**`governanca/lei/ddd-nomenclatura/SKILL.md`** (REGRA 2 + REGRA 10):

> "Model Prisma em PascalCase + `@@map("snake_case")`"
> "**`@@map("tabela_snake_case")` é obrigatório em todo model**"
> "Atualizada em 24/04/2026 (fix_model_casing_revert)"

**`governanca/convencao-tecnica/database-governance/SKILL.md`** (linha 88):

> "**`@@map("tabela_snake_case")` é obrigatório em todo model** — o model fica em PascalCase (convenção Prisma), a tabela PG em snake_case"

### Skill B — sem `@@map`

**`papeis/coordenador/SKILL.md`** (linha 90, checklist de validação de schema):

> "Nenhum `@map` ou `@@map` (mantém naming canônico)"

### Origem do conflito

Skill `coordenador` está desatualizada. Em 22/04/2026 a regra anterior ("model em lowercase, sem `@@map`") foi revertida em `fix_model_casing_revert` (PascalCase + `@@map` obrigatório). Coordenador ainda reflete a regra antiga.

### Decisão pendente
- [ ] Atualizar `coordenador/SKILL.md` linha 90 para refletir REGRA 2 atual de `ddd-nomenclatura`?

---

## C3 — Stripe como dependência da plataforma

**Severidade:** 🟠 **Alta** (variáveis de ambiente, código de exemplo, README)

### Skill A — Stripe é dependência

**`governanca/lei/visao-geral/SKILL.md`** (não menciona explicitamente Stripe na seção de stack, mas é referenciado nas ondas)

**`governanca/convencao-tecnica/code-standards/SKILL.md`** (provavelmente em exemplos de env)

**Vários docs e CLAUDE.md** mencionam "Stripe" como provedor de pagamento.

### Skill B — Stripe NÃO é dependência

**`produtos-gravity/configurador/SKILL.md`** (linhas 16, 271-273):

> "Assinaturas, planos e billing (provedor de pagamento será definido pelo dono; boleto/PIX/cartão — Stripe NÃO é mais dependência da plataforma)"
> "# Provedor de pagamento: definido pelo dono — Stripe NÃO é mais dependência"

### Origem do conflito

Decisão recente removeu Stripe como dependência fixa, mas várias skills/docs ainda referenciam.

### Decisão pendente
- [ ] Confirmar: Stripe está fora da plataforma? Provedor a definir?
- [ ] Quais skills precisam atualizar (visao-geral, code-standards, deploy)?

---

## C4 — `UsuarioWorkspace` para Master (Bulk Insert vs sem vínculo)

**Severidade:** 🟠 **Alta** (afeta lógica de convite + acesso)

### Skill A — Master recebe Bulk Insert

**`seguranca/permissoes/SKILL.md`** (linha 376):

> "Master é convidado para a organização → Sistema cria UsuarioWorkspace para CADA Workspace ativo da organização (Bulk Insert snapshot) → Master tem acesso imediato a todos os Workspaces sem nenhuma FK nullable"

### Skill B — Master NÃO tem `UsuarioWorkspace`

**`produtos-gravity/configurador/SKILL.md`** (linha 120):

> "**MASTER** tem acesso a todos os Workspaces da organização SEM `UsuarioWorkspace` (Mandamento 04). O legado de Bulk Insert para MASTER foi removido — acesso é reconhecido pelo `tipo_usuario`, não pelo vínculo."

**`governanca/convencao-tecnica/database-governance/SKILL.md`** (linha 217):

> "ao criar um novo `Workspace` na organização, disparar um job que cria `UsuarioWorkspace` para todos os usuários cujo `tipo_usuario` exige vínculo explícito. **Master/Super Admin são ignorados**"

### Origem do conflito

Mudança de comportamento — `permissoes` ainda documenta o legado.

### Decisão pendente
- [ ] Atualizar `seguranca/permissoes/SKILL.md` removendo "Bulk Insert para Master"?
- [ ] Confirmar regra atual: Master = sem UsuarioWorkspace, acesso reconhecido por `tipo_usuario`?

---

## C5 — Nome do tipo de usuário admin Gravity (`ADMIN` vs `GRAVITY_ADMIN`)

**Severidade:** 🟡 **Média** (inconsistência de enum)

### Skill A — `ADMIN`

**`seguranca/permissoes/SKILL.md`** (linha 31, 56-71, tabela linha 127):

> "Gravity (equipe interna)
> ├── Super Admin → acesso total irrestrito (is_gravity_admin = true)
> └── **Admin** → acesso total, edição conforme permissões..."

### Skill B — `GRAVITY_ADMIN`

**`produtos-gravity/configurador/SKILL.md`** (linhas 97, 103-106):

> "1. **Cadeia 1 — `tipo_usuario` Global:** quem o usuário é (`SUPER_ADMIN`, `**GRAVITY_ADMIN**`, `MASTER`, `STANDARD`, `SUPPLIER`)"

**`produtos-gravity/configurador/admin/SKILL.md`** (linha 12):

> "**Quem acessa:** apenas usuários com `tipo_usuario = 'GRAVITY_ADMIN'` (ou `is_gravity_admin = true`)"

### Origem do conflito

Provável renomeação de `ADMIN` → `GRAVITY_ADMIN` para clareza, mas `seguranca/permissoes` não acompanhou.

### Decisão pendente
- [ ] Confirmar enum atual: `GRAVITY_ADMIN` (5 valores: SUPER_ADMIN, GRAVITY_ADMIN, MASTER, STANDARD, SUPPLIER)?
- [ ] Atualizar `seguranca/permissoes` para usar `GRAVITY_ADMIN`?

---

## C6 — Cor `#f472b6` (Pink 400) usada em DOIS produtos

**Severidade:** 🟡 **Média** (UX — confusão visual)

### Conflito interno em UMA skill

**`ux/design-system/SKILL.md`** (Seção 10):

> Tier 1 — Plataforma: Configurador → `#f472b6` (Pink 400)
> Cores por Produto: Financeiro COMEX → `#f472b6` Pink 400

A mesma cor está atribuída a **dois "produtos"** (Configurador como produto da plataforma + Financeiro COMEX como produto vertical). Visualmente, no chip do produto e dot da sidebar, fica indistinguível.

### Origem do conflito

Provavelmente duas decisões em momentos diferentes sem cross-check.

### Decisão pendente
- [ ] Trocar a cor de Configurador OU de Financeiro COMEX?
- [ ] Sugestão técnica: Configurador é "produto especial da plataforma" (não compete com produtos verticais), poderia usar `#f472b6` exclusivamente. Financeiro COMEX recebe nova cor (ex: `#fb923c` Orange 400 — não usado por outro produto).

---

## C7 — Cobertura de testes (80% vs 70%)

**Severidade:** 🟢 **Baixa** (apenas inconsistência de threshold)

### Skill A — 80% para lógica crítica

**`papeis/qa/SKILL.md`** (linha 22):

> "**Cobertura de Testes** — Obrigatório. Mínimo 80% em lógica crítica."

### Skill B — 70% geral

**`processos/code-review/SKILL.md`** (linha 64):

> "Cobertura ≥ 70%?"

**`testes/SKILL.md`** (linhas 111-112):

> "`nucleo-global/`: **80%**"
> "Demais módulos: **70%**"

**`governanca/lei/agent-policy/SKILL.md`** (linha):

> "Cobertura mínima: `nucleo-global` 80%, demais 70%"

### Origem do conflito

`qa` diz "80% em lógica crítica" sem definir o que é "crítica". As outras skills convergem em "80% nucleo, 70% demais". O `qa` provavelmente quis dizer a mesma coisa, mas a redação destoa.

### Decisão pendente
- [ ] Padronizar `qa/SKILL.md` linha 22 para "80% nucleo-global, 70% demais módulos, 100% rotas críticas (auth, financeiro, isolamento)"?

---

## C8 — `tenant`/`tenant_<cuid>` em DDD

**Severidade:** 🟠 **Alta** (afeta toda referência a SDK e schema)

### Skill A — `tenant` é termo abandonado

**`governanca/lei/ddd-nomenclatura/SKILL.md`** (Glossário canônico):

> "❌ Termo abandonado: `Tenant`, `tenant_id`, `tenantId`"
> "✅ DDD canônico: `Organizacao`, `id_organizacao`"

### Skill B — `tenant_<cuid>` é nome técnico preservado

**`governanca/lei/sdk-resolvedor-organizacao/SKILL.md`** (várias linhas):

> "**Notas sobre nomes técnicos preservados:** o pacote npm continua sendo `@gravity/tenant-resolver` (identificador real registrado), o prefixo de schema PostgreSQL continua sendo `tenant_<cuid>` (objeto físico do banco)"

**`governanca/lei/isolamento-organizacao/SKILL.md`** + 12 outras skills repetem o mesmo padrão.

### Origem do conflito

Decisão pragmática: termo `tenant` está em **identificadores físicos** (npm package, schema name PostgreSQL, env var `TENANT_DATABASE_URL`, header `x-organização-id` que ainda usa "tenant" internamente). Renomear esses identificadores físicos é roadmap.

DDD diz "termo abandonado", mas SDK diz "preservado por compatibilidade".

### Decisão pendente
- [ ] Adicionar exceção formal em `ddd-nomenclatura/SKILL.md` com lista dos identificadores físicos preservados (`@gravity/tenant-resolver`, schema `tenant_<cuid>`, etc.) e roadmap de migração?
- [ ] Ou aceitar que "termo abandonado" se aplica apenas a **código de aplicação** (variáveis, props, payloads), não a **identificadores físicos** (npm package, schema PG)?
- [ ] Definir condição/data para concluir migração desses identificadores?

---

## Resumo Executivo

| # | Tema | Severidade | Bloqueia ciclo de... |
|---|---|---|---|
| C1 | 3 índices em models | **Crítica** | qualquer ciclo que toque banco de produto |
| C2 | `@@map` obrigatório vs nenhum | **Crítica** | qualquer ciclo de schema |
| C3 | Stripe | Alta | onboarding, deploy, configurador |
| C4 | UsuarioWorkspace para Master | Alta | configurador, permissoes |
| C5 | `ADMIN` vs `GRAVITY_ADMIN` | Média | configurador, permissoes |
| C6 | Cor duplicada | Média | configurador (UX), financeiro-comex (UX) |
| C7 | Cobertura 80% vs 70% | Baixa | nenhum (cosmético) |
| C8 | `tenant` em identificadores físicos | Alta | qualquer ciclo de schema/SDK |

**Recomendação:** decidir C1 e C2 antes de iniciar Onda B (arquitetura). Os outros podem ser resolvidos em paralelo.
