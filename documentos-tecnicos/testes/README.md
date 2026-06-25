# Documentação do Sistema de Testes do Gravity

> Documentação completa, técnica e de regras, do sistema de testes automatizados do Gravity. Esta pasta é a fonte de verdade. Toda dúvida sobre testes deve começar aqui.

---

## Estrutura

```
documentos-tecnicos/testes/
│
├── README.md                                      ← este arquivo
│
├── tecnico/                                       ← COMO funciona
│   ├── 01-arquitetura-sistema-testes.md           ← Visão macro + componentes + testes/infra/admin
│   ├── 02-fluxo-execucao-detalhado.md             ← Passo a passo de uma execução
│   ├── 03-integracao-gemini.md                    ← Análise de falhas via IA
│   ├── 04-cron-externo.md                         ← Setup Railway/GitHub Actions
│   ├── 05-tabelas-banco.md                        ← TestLog, TestSchedule, TestPlan
│   ├── 06-frontend-admin-testes.md                ← UI: LogTestes, modais, badges
│   └── 07-pentest-zap.md                          ← Setup OWASP ZAP
│
└── regras/                                        ← O QUE pode/não pode
    ├── 01-convencao-ids.md                        ← Formato TST-{TIPO}-{ESCOPO}-{NNNNNN}
    ├── 02-cobertura-obrigatoria.md                ← 6 camadas × 20 categorias
    ├── 03-mapeamento-testids.md                   ← Single source of truth UI ↔ teste
    ├── 04-fluxo-criacao-tela-nova.md              ← Ordem obrigatória pra tela nova
    ├── 05-revisao-humana.md                       ← Quando humano valida vs IA aplica
    ├── 06-custo-e-circuit-breakers.md             ← Limites de token, retry, fallback
    ├── 07-organizacao-plano-resultado-por-escopo.md ← plano-teste/ + resultado-teste/ por feature
    └── 08-regras-prints-em-tela.md                  ← -selecao/-resultado + verde/vermelho no Admin
```

---

## Por onde começar

| Você quer... | Leia primeiro |
|---|---|
| Entender o sistema todo | [tecnico/01-arquitetura-sistema-testes.md](tecnico/01-arquitetura-sistema-testes.md) |
| Favoritos do modal «Rodar Testes» | [testes/infra/admin/README.md](../../testes/infra/admin/README.md) + `testes-favoritos-admin.ts` |
| Convite Super Admin (Admin › Usuários) | [arquitetura/convite-admin-cross-org.md](../arquitetura/convite-admin-cross-org.md) · pacote `TST-*-CONVITE-SUPER-ADMIN-ADMIN-000116`–`000120` |
| Cobertura RBAC (workspaces + permissões granulares) | [MATRIZ-COBERTURA-RBAC.md](../../testes/testes-unitarios/configurador/permissoes/rbac-workspaces-cobertura/MATRIZ-COBERTURA-RBAC.md) · pacote `TST-*-CONFIG-RBAC-WORKSPACES-000141`–`000145` (TASK-000305) |
| Criar um teste novo | [regras/01-convencao-ids.md](regras/01-convencao-ids.md) + [regras/02-cobertura-obrigatoria.md](regras/02-cobertura-obrigatoria.md) |
| Onde guardar plano e prints | [regras/07-organizacao-plano-resultado-por-escopo.md](regras/07-organizacao-plano-resultado-por-escopo.md) |
| Pares `-selecao`/`-resultado` e cor dos prints | [regras/08-regras-prints-em-tela.md](regras/08-regras-prints-em-tela.md) |
| Adicionar uma tela nova | [regras/04-fluxo-criacao-tela-nova.md](regras/04-fluxo-criacao-tela-nova.md) |
| Entender por que a IA sugeriu X | [tecnico/03-integracao-gemini.md](tecnico/03-integracao-gemini.md) |
| Configurar o cron diário | [tecnico/04-cron-externo.md](tecnico/04-cron-externo.md) |
| Ver o exemplo do plano da Organização | `testes/_planos/configurador/organizacao.json` + [skills/testes/agente-plano-teste/exemplo-organizacao.md](../../skills/testes/agente-plano-teste/exemplo-organizacao.md) |
| **Modal «Detalhe do plano» (Objetivo / casos / Script)** | [tecnico/06-frontend-admin-testes.md](tecnico/06-frontend-admin-testes.md) |
| Mexer no analisador Gemini | [skills/testes/analista-erros-testes-gemini/SKILL.md](../../skills/testes/analista-erros-testes-gemini/SKILL.md) |
| Criar/expandir um plano de teste | [skills/testes/agente-plano-teste/SKILL.md](../../skills/testes/agente-plano-teste/SKILL.md) |
| Seletor universal (pills / SLA 1s) | [arquitetura/seletor-universal-visualizacoes.md](../arquitetura/seletor-universal-visualizacoes.md) + `TST-*-MBOTO-*` |

---

## Skills relacionadas

- **`skills/testes/SKILL.md`** — Skill geral de testes em tela (já existia)
- **`skills/testes/analista-erros-testes-gemini/`** — Análise de falhas via Gemini 2.0 Flash
- **`skills/testes/agente-plano-teste/`** — Geração de planos 10/10 a partir de telas
- **`skills/testes/padroes-vitest-playwright/`** — Estrutura técnica de Vitest/Playwright
- **`skills/testes/contract-testing/`** — Contract tests com Zod
- **`skills/governanca/lei/isolamento-organizacao/`** — Cross-organização testing
- **`skills/seguranca/pentest/`** — Pentest (OWASP)

---

## Resumo executivo do sistema

- **6 tipos de teste** (UNI, CON, FUN, CRO, E2E, PEN)
- **17 escopos** (LOGIN, CONFIG, ADMIN, HUB, CORE, MARKET, TENANT, DBASE + 8 produtos + **MBOTO** seletor universal)
- **20 categorias obrigatórias** por plano de teste
- **3 ambientes** (Local, Staging, Produção)
- **1 cron externo** (Opção C — Railway/GitHub Actions, 1x/dia)
- **Análise IA via Gemini 2.0 Flash** (~$0.0005-0.0009 por análise; ~$15/mês no pior caso)
- **Humano como validador final** — IA sugere, humano aplica
- **CI bloqueia** PRs que violam convenção, cobertura, mapeamento de testids ou preservação de planos antigos

---

## Infra compartilhada — `testes/infra/admin/`

Lógica **sem React** consumida pela UI Admin/Testes no Configurador. Hoje: favoritos de execução manual (`testes-favoritos-admin.ts`). Ver [README da pasta](../../testes/infra/admin/README.md).

---

## Estado atual (2026-06-03)

| Item | Status |
|---|---|
| Skills criadas | ✅ `analista-erros-testes-gemini` + `agente-plano-teste` em `skills/testes/` |
| Documentação técnica | ✅ Esta pasta (parcial — 3 docs criados, 4 a criar nas ondas) |
| Plano de exemplo | ✅ `testes/_planos/configurador/organizacao.json` (122 passos, 18/20 categorias) |
| Convenção de IDs | ✅ `regras/01-convencao-ids.md` |
| **Suites Configurador (17 unit + 14 funcional)** | ✅ `testes/testes-unitarios/configurador/` + `testes/testes-funcionais/configurador/` |
| **Contract test `/api/v1/me` (DDD)** | ✅ `me-contract.test.ts` — 7 testes, `meResponseSchema` Zod |
| **Unit test `useCarregarTipoUsuario`** | ✅ 17 testes — cache, erros, anti-regressão DDD, `isGravityAdmin` |
| **`testes/infra/admin/` (favoritos Rodar Testes)** | ✅ SSOT em `testes-favoritos-admin.ts` + 8 testes Vitest |
| Estrutura `testes/` nova | ❌ Pendente — apagar antiga e criar nova |
| Migrations Prisma (TestLog, TestSchedule, TestPlan) | ❌ Pendente |
| Backend `/admin/test-plans/generate` | ❌ Pendente |
| Backend `/admin/test-logs/:id/reanalyze` | ❌ Pendente |
| `lib/gemini-test-analyzer.ts` | ❌ Pendente |
| `lib/agente-plano-teste.ts` | ❌ Pendente |
| Cron worker externo (Railway) | ❌ Pendente |
| Frontend: badges, diff, botões | ❌ Pendente |
| `GEMINI_API_KEY` no `.env` | ❓ A confirmar |

A execução de tudo que está pendente está organizada em ondas no documento de Líder (Dream Team Tecnologia).
