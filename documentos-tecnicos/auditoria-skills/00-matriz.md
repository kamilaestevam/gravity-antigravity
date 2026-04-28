# 00 — Matriz Mestre da Auditoria de Skills

> ⚠️ **NOTA DE PROCEDÊNCIA:** Este arquivo foi sincronizado de `master` (commit `707c7c5a`) na branch `claude/cool-elbakyan-ff8ae6` em 2026-04-28. **O conteúdo descreve o estado de master**, não o estado isolado desta branch. Skills no worktree desta branch ainda são da pré-Fase-3 (64 SKILL.md, sem `database-governance` em `lei/`, com nomes antigos `caching-strategy`/`state-management`/`resilience-patterns`/`i18n`). Conflitos marcados ✅ Resolvido foram resolvidos em master, e só ficarão verdadeiros nesta branch quando o merge acontecer.



> Auditoria executada em 2026-04-28. Cobertura: **68/68 skills (100%)**.
> Branch de execução: `master` (após merge de `refactor/ddd-ubiquo`).
> Artefato vivo — atualizar `[Status Atual]` à medida que ações são executadas.

## Resumo Numérico

| Tipo de achado | Total | Resolvidos nesta sessão | Pendentes |
|:---|:---:|:---:|:---:|
| Conflitos diretos (P0) | 8 | 4 (C1, C2, C4, C5) | 4 |
| Violações SSOT (vertical repete lei) | 10 | 1 (S10) | 9 |
| Duplicações em N skills | 9 grupos | 0 | 9 |
| Lacunas conceituais | 3 | 0 | 3 |
| **Total** | **30** | **5** | **25** |

---

## Matriz Regra × Skill (top achados com Status Atual)

| # | Tema | Tipo | Skills envolvidas | Status Atual |
|:---|:---|:---|:---|:---|
| C1 | 3 índices obrigatórios em models de produto | Conflito P0 | `agent-policy`, `processos/criar-produto`, `schema-composition`, `isolamento-organizacao` | ✅ Resolvido nesta sessão (commit pendente) — `criar-produto` editado, demais skills já alinhadas; greps limpos |
| C2 | `@@map` em models | Conflito P0 | `papeis/coordenador` (proibia) vs `ddd-nomenclatura` (obriga) | ✅ Resolvido nesta sessão — `coordenador` linha 89 atualizada para "PascalCase + @@map obrigatório"; greps limpos |
| C3 | Stripe como dependência | Conflito Alto | `visao-geral`, `code-standards` (mantêm) vs `produtos-gravity/configurador` (removeu) | ❌ Pendente — atualizar `visao-geral` e `code-standards` |
| C4 | Master/UsuarioWorkspace via Bulk Insert | Conflito Alto | `seguranca/permissoes` (Bulk Insert) vs `produtos-gravity/configurador` + `database-governance` (sem vínculo) | ✅ Resolvido nesta sessão — `permissoes` reescrita: Master NÃO tem UsuarioWorkspace (Mandamento 04); greps limpos |
| C5 | `ADMIN` vs `GRAVITY_ADMIN` (tipo_usuario) | Conflito Médio | `seguranca/permissoes`, `produtos-gravity/configurador`, `configurador/admin` | ✅ Resolvido em sessão anterior (commits `56d2ca5d`, `578e0e87`) — todos usam `ADMIN` |
| C6 | Cor `#f472b6` Pink 400 duplicada | Conflito Médio | `ux/design-system` (mesmo arquivo: Configurador + Financeiro COMEX) | ❌ Pendente — escolher cor única para um dos dois |
| C7 | Cobertura mínima de testes (70 vs 80) | Conflito Baixo | `papeis/qa` (80% crítico), `processos/code-review` (≥70%), `testes/SKILL.md` (80% nucleo, 70% demais) | ❌ Pendente — definir 1 política única e referenciar |
| C8 | Termo `tenant` no DDD | **Dívida Técnica** | `sdk-resolvedor-organizacao`, `isolamento-organizacao`, `database-governance`, `lint-tenant-safety` | ⚠️ **Reclassificado** — não é conflito, é dívida técnica consciente (retrocompatibilidade NPM/schema/eventos). Ver 04-lacunas-divida.md |
| S10 | `database-governance` em `convencao-tecnica/` | Violação SSOT | Promoção para `governanca/lei/database-governance` | ✅ Resolvido nesta sessão — `git mv` aplicado, CLAUDE.md + 2 referências em dream-team atualizadas |
| S1-S9 | 9 violações SSOT restantes | Violação SSOT | Detalhe em [03-violacoes-ssot.md](03-violacoes-ssot.md) | ❌ Pendente |
| L1 | Webhooks recebidos (HMAC, raw body, idempotência) | Lacuna | Skill ausente — conteúdo distribuído em `cross-boundary` | ❌ Pendente — criar `seguranca/webhooks-recebidos/SKILL.md` |
| L2 | BullMQ / Jobs assíncronos | Lacuna | Mencionada como "Fase 3" em `cross-boundary`, `resiliencia`, `auto-scaling` | ❌ Pendente |
| L3 | Graceful shutdown / drain de conexões | Lacuna | Ausente | ❌ Pendente (baixa prioridade) |

---

## Cobertura

68 SKILL.md auditados. Lista completa:

- arquitetura/ (8): cache, estado, nucleo-global, observabilidade, resiliencia, schema-composition, servicos-organizacao, traducao
- dream-team/ (2): ajustes, detetive-tela
- governanca/convencao-tecnica/ (10 após Fase 3): code-standards, monorepo, lint-tenant-safety, api-design, criptografia, observabilidade-minima, mapa-componentes-locais, mapa-nucleo-global, mapa-paginas, modais
- governanca/lei/ (11 após Fase 3): 9-mandamentos, agent-policy, backup-policy, cost-budget, ddd-nomenclatura, isolamento-organizacao, sdk-resolvedor-organizacao, sla-metas, terminal, visao-geral, **database-governance** (promovida)
- governanca/operacao/ (4): auto-scaling, backup-disaster-recovery, performance-monitoring, service-registry
- papeis/ (4): analista-erros-testes, coordenador, lider, qa
- processos/ (4): code-review, criar-produto, deploy, incident-response
- produtos-gravity/ (5): api-cockpit, configurador, configurador/admin, marketplace, simulador-comex
- seguranca/ (7): autenticacao-s2s, cross-boundary, pentest, permissoes, rate-limiting, seguranca-5-camadas, tier1-security
- testes/ (8): SKILL, agente-plano-teste, agente-plano-teste-e2e, agente-plano-teste-funcional, agente-plano-teste-unitario, contract-testing, padroes-vitest-playwright, teste-em-tela
- ux/ (5): acessibilidade, componentes, criacao-telas, design-system, tooltip
