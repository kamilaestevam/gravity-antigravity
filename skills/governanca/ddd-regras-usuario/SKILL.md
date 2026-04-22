# DDD + Regras Usuario — Plano Mestre de Alinhamento

> **Skill-guia do esforço de alinhamento DDD do Gravity.**
> Tracker oficial de progresso, decisões e bloqueios da operação de limpeza, fundação e propagação.
> **Toda alteração nesta skill exige confirmação explícita do dono do projeto.**

---

## Contexto

Após a refatoração que renomeou entidades legadas (`Tenant`, `Company`, `User`, `Role`) para nomenclatura DDD em português (`Organizacao`, `Workspace`, `Usuario`, `tipo_usuario`), foi identificado que múltiplos artefatos do projeto (CLAUDE.md, skills, slash commands, memory, docs, comentários) ainda contêm nomenclatura legada e regras conflitantes.

Esta skill é o plano oficial para alinhar 100% do projeto ao novo DDD, em fases controladas.

**Fontes da verdade:**
- 9 Mandamentos: `skills/governanca/9-mandamentos/SKILL.md`
- Tabela DDD completa: a ser construída no PASSO 06 (referência será adicionada aqui)

---

## Legenda de Status

- ⬜ **Pendente** — não iniciado
- 🟡 **Em andamento** — em execução
- ✅ **Concluído** — finalizado e verificado
- 🚫 **Bloqueado** — aguardando decisão ou pré-requisito
- ⏭️ **Pulado** — decisão consciente de não executar

---

## 🧹 FASE 1 — LIMPEZA

> **Objetivo:** apagar tudo que vai virar lixo, para não perder tempo atualizando o que será deletado.
> **Estratégia:** sequencial (1 agente).

### ⬜ PASSO 01 — Sub-CLAUDE.md
Excluir `skills/CLAUDE.md` e `skills/agentes/CLAUDE.md`. Deixar apenas o `CLAUDE.md` raiz.
Reversível via git.

### ⬜ PASSO 02 — Skills duplicadas
Comparar `skills/` (raiz) com `.claude/skills/` (10 pastas paralelas).
- Decidir qual árvore é a oficial
- Manter uma, deletar a outra
- ⚠️ Antes de decidir, ver o conteúdo das duas — `.claude/skills/` pode estar mais atualizada

### ⬜ PASSO 03 — Slash commands
Excluir os 11 arquivos em `.claude/commands/`:
`coordenar.md`, `criar-produto.md`, `deploy.md`, `dream-team-detetive-tela.md`, `dream-team-produtos.md`, `dream-team-tecnologia.md`, `lider.md`, `qa.md`, `skill.md`, `terminal.md`, `teste-tela.md`.
Adicionar regra no CLAUDE.md: **proibido criar slash command sem dupla autorização do dono**.

### ⬜ PASSO 04 — Memory persistente
Revisar 25+ arquivos em `~/.claude/projects/C--Users-danie-gravity-antigravity/memory/`.
- Deletar os que mencionam features antigas com nomenclatura legada
- Adicionar regra no CLAUDE.md: **proibido criar memory sem dupla autorização**
- ⚠️ A memory se forma automaticamente — Claude escreve nela quando o usuário diz "lembra que..." ou via auto-memory configurada no system prompt

### ⬜ PASSO 05 — Permissões e settings
Auditar `.claude/settings.local.json` (double-check).
Esperado: só allowlist, sem hooks. Confirmar.

---

## 🏗️ FASE 2 — FUNDAÇÃO (a fonte da verdade)

> **Objetivo:** ter o dicionário DDD completo antes de aplicar em qualquer lugar.
> **Estratégia:** sequencial no caminho crítico (06 → 09); auditorias 07 e 08 podem rodar em paralelo com o 06.

### ⬜ PASSO 06 — Tabela DDD completa **[BLOQUEIA TUDO ABAIXO]**
Construir tabela DDD definitiva, sem ambiguidade, cobrindo:
- **Banco** — Prisma fields, DB columns (via `@map`), model names
- **Backend** — TypeScript types, JSON payloads, route params
- **Frontend** — props, state keys, store keys
- **API** — endpoints, query params, response fields

A tabela é o contrato oficial. Qualquer divergência futura referencia este documento.
Após construída, **a skill `9-mandamentos` precisa ser atualizada** (Regra 03 hoje tem versão parcial).

### ⬜ PASSO 07 — `.claude/agents/`
Auditar se existem subagentes customizados configurados. Desabilitar/remover os não usados.

### ⬜ PASSO 08 — MCP servers
Verificar `.mcp.json` (raiz e `.claude/`). Auditar conteúdo. Desabilitar servers não usados.

### ⬜ PASSO 09 — CLAUDE.md reescrito do zero **[depende do PASSO 06]**
Conteúdo:
- 9 Mandamentos (íntegra)
- Tabela DDD completa (do PASSO 06)
- Regra: proibido criar slash command sem dupla autorização
- Regra: proibido criar memory sem dupla autorização
- Lista mínima de skills obrigatórias

---

## 🏗️ FASE 3 — PROPAGAÇÃO DO DDD (trabalho longo)

> **Objetivo:** aplicar o DDD em todo o projeto.
> **Estratégia:** ALTAMENTE PARALELO. Cada agente recebe escopo de pastas não-sobrepostas + briefing idêntico (link para esta skill + 9 Mandamentos + tabela DDD).

### ⬜ PASSO 10 — Atualizar todas as skills (60+ arquivos)
Releitura de cada skill contra DDD e 9 Mandamentos. Eliminar contradições internas.

### ⬜ PASSO 11 — Documentação técnica
Atualizar todos os arquivos em `documentos-tecnicos/`.

### ⬜ PASSO 12 — README.md (raiz e dos serviços)
Atualizar todos os READMEs do monorepo.

### ⬜ PASSO 13 — Comentários e JSDoc no código
Varrer e atualizar comentários, JSDoc e TSDoc. Inclusive comentários do `schema.prisma` (que ainda dizem "tenant_id" enquanto a coluna real é `id_organizacao`).

### ⬜ PASSO 14 — `.claudeignore`
**Ação a definir** — precisa decidir o que está desatualizado e o que fazer.

### ⬜ PASSO 15 — Testes
Auditoria de nomenclatura legada em test names, fixtures, contratos de teste.

### ⬜ PASSO 16 — Schemas Zod compartilhados
Procurar `packages/contracts/`, `shared/schemas/` ou similar. Se existir, alinhar com DDD. Se não existir, marcar como ⏭️.

---

## ✅ FASE 4 — VALIDAÇÃO FINAL

### ⬜ PASSO 17 — Sweep global de nomenclatura legada
Após tudo, rodar busca global:
```bash
grep -r "tenant_id\|product_id\|user_id\|publicMetadata\|companyId\|tenantId" \
  --include="*.md" --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules --exclude-dir=.git \
  --exclude="schema.prisma"
```
Cada hit vira item da lista de correção residual. Operação só termina quando o sweep retornar zero (ou apenas hits autorizados em `schema.prisma`).

---

## Estratégia de Paralelização (referência para a Fase 3)

| Agente | Escopo |
|--------|--------|
| A | Skills de `governanca/` + `arquitetura/` |
| B | Skills de `seguranca/` + `infra-estrutura/` |
| C | Skills de `servicos/` + `produtos/` + `ux/` + `gestao/` |
| D | Skills de `dream-team-*/` |
| E | `documentos-tecnicos/` inteiro |
| F | READMEs + comentários/JSDoc |
| G | Testes + Zod compartilhados |

**Regras para paralelo funcionar:**
- Escopos não-sobrepostos (cada arquivo pertence a um único agente)
- Briefing idêntico para todos
- Coordenação consolidada ao final por um agente único

---

## Log de Decisões

> Registrar aqui cada decisão importante tomada durante a execução. Formato: `[DATA] PASSO XX — decisão e justificativa`.

_(vazio — preencher conforme a execução avança)_

---

## Bloqueios Ativos

> Registrar aqui qualquer impedimento que pause um passo. Formato: `[DATA] PASSO XX — descrição do bloqueio + o que precisa para destravar`.

_(vazio)_

---

## Princípio de Execução

**Nada é executado sem confirmação explícita do dono do projeto.**
Esta skill é o tracker — não é gatilho de ação. Cada passo só inicia quando o dono der o "ok" para aquele passo específico.
