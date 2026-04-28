# INDEX — Painel Mestre de Documentação Técnica

> Tabela mestre da documentação. Espelha a árvore de `skills/` (68 skills em 11 grupos após Fase 3) + adiciona pastas para produtos físicos do codebase + `ddd-atlas/` (atlas DDD consolidado, fonte única dos nomes finais).

---

## Metadados

| Campo | Valor |
|---|---|
| Data inicial | 2026-04-28 |
| Última atualização | 2026-04-28 (alinhamento de paths para reduzir conflitos no merge com master) |
| Skills totais | **68 (master)** após Fase 3 — promoção de `database-governance` para `lei/` + 4 outros itens consolidados |
| Total de entradas | **68 skills + 11 produtos físicos + ddd-atlas (10 arq) + meta = ~90** |
| Branch atual | `claude/cool-elbakyan-ff8ae6` |
| Status vs master | Estrutural divergente (mirror tree vs flat) MAS paths-chave alinhados: `auditoria-skills/`, `historico-alteracoes/`, `ddd-atlas/`, `seguranca/auditoria-seguranca-*.md` agora batem com onde master skills apontam |

---

## Sincronização com Master (2026-04-28)

Master (`707c7c5a`) avançou paralelamente. Itens trazidos:
- `auditoria-skills/00-matriz.md` — atualizado com 68 skills, 4 conflitos resolvidos
- `auditoria-skills/01-duplicacoes.md` — 9 grupos com SDK renomeado para `withOrganizacao` (master usa novo nome)
- `auditoria-skills/02-conflitos.md` — C1, C2, C4, C5 marcados ✅ Resolvido com greps forenses
- `auditoria-skills/03-violacoes-ssot.md` — S10 ✅ Resolvido (database-governance promovido para lei/)
- `auditoria-skills/04-lacunas-divida.md` — renomeado de `04-lacunas.md`; L1/L2/L3 + dívidas técnicas
- `ddd-atlas/` — 10 arquivos novos (atlas DDD gerado da planilha mestre, fonte única dos nomes)

---

## Convenção da Tabela

| Status | Significado |
|---|---|
| ✅ migrado | Pasta nova criada com docs migrados do legado |
| ⚠️ desatualizado | Doc existe mas precisa atualização (após ondas A-D) |
| ❌ pendente | Sem doc — produzir durante onda correspondente |
| n/a | Sem doc previsto (skill normativa, meta-agente, etc.) |
| 🚫 bloqueado | Aguarda decisão (ver `auditoria-skills/02-conflitos.md`) |

---

## 1. Governança › Lei (11 skills após Fase 3)

| Caminho da skill | Doc esperado | Status |
|---|---|---|
| `governanca/lei/9-mandamentos/` | n/a (normativa pura) | n/a |
| `governanca/lei/agent-policy/` | n/a (meta-agente) | n/a |
| `governanca/lei/visao-geral/` | n/a (consolidado em outras) | n/a |
| `governanca/lei/ddd-nomenclatura/` | técnico + auditorias-execucao/ (7 arq) + `ddd-atlas/` como fonte de nomes | ✅ migrado + atlas |
| `governanca/lei/terminal/` | n/a (meta-agente) | n/a |
| `governanca/lei/isolamento-organizacao/` | técnico + incidentes-e-auditoria.md (a recriar — agente skills decide) | ❌ pendente |
| `governanca/lei/sdk-resolvedor-organizacao/` | referencia.md (a recriar — agente skills decide) | ❌ pendente |
| `governanca/lei/sla-metas/` | n/a (lei pura) | n/a |
| `governanca/lei/cost-budget/` | n/a (lei pura) | n/a |
| `governanca/lei/backup-policy/` | n/a (lei pura) | n/a |
| **`governanca/lei/database-governance/` ⬆️ promovida** | dicionarios/ (substituídos pelo `ddd-atlas/`) | ✅ via ddd-atlas |

---

## 2. Governança › Convenção Técnica (7 skills, sem `database-governance`)

| Caminho | Doc esperado | Status |
|---|---|---|
| `governanca/convencao-tecnica/code-standards/` | n/a (convenção pura) | n/a |
| `governanca/convencao-tecnica/monorepo/` | n/a (convenção pura) | n/a |
| `governanca/convencao-tecnica/lint-tenant-safety/` | n/a (linter) | n/a |
| `governanca/convencao-tecnica/api-design/` | `ddd-atlas/02-rotas-api.md` substitui `contratos/` planejado | ✅ via ddd-atlas |
| `governanca/convencao-tecnica/criptografia/` | n/a (lei pura) | n/a |
| `governanca/convencao-tecnica/observabilidade-minima/` | n/a (lei pura) | n/a |

> Outros 4 mapas adicionados na Fase 3 (mapa-componentes-locais, mapa-nucleo-global, mapa-paginas, modais) — ver lista completa em `auditoria-skills/00-matriz.md`.

---

## 3. Governança › Operação (4 skills)

| Caminho | Status |
|---|---|
| `governanca/operacao/auto-scaling/` | n/a |
| `governanca/operacao/backup-disaster-recovery/` | n/a |
| `governanca/operacao/performance-monitoring/` | n/a |
| `governanca/operacao/service-registry/` | n/a |

---

## 4. Processos (4 skills)

| Caminho | Doc esperado | Status |
|---|---|---|
| `processos/deploy/` | n/a (operacional) | n/a |
| `processos/code-review/` | n/a (operacional) | n/a |
| `processos/criar-produto/` | nova-tela-produto.md + novo-produto.md (vindos de produto/) | ✅ migrado |
| `processos/incident-response/` | n/a (operacional) | n/a |

---

## 5. Papéis (4 skills) — todas n/a

`papeis/{lider, coordenador, qa, analista-erros-testes}/` — n/a

---

## 6. Arquitetura (8 skills)

| Caminho | Doc esperado | Status |
|---|---|---|
| `arquitetura/nucleo-global/` | TabelaGlobal.md, ToastGlobal.md, README.md + `ddd-atlas/08-nucleo-global.md` | ✅ migrado |
| `arquitetura/schema-composition/` | adr-001/003 (a recriar — agente skills decide) | ❌ pendente |
| `arquitetura/servicos-organizacao/` | técnico (a produzir nas ondas) | ❌ pendente |
| `arquitetura/state-management/` | n/a (referência) | n/a |
| `arquitetura/caching-strategy/` | n/a (referência) | n/a |
| `arquitetura/resilience-patterns/` | n/a (referência) | n/a |
| `arquitetura/observabilidade/` | n/a (referência) | n/a |
| `arquitetura/traducao/` ⚠️ skill é `i18n` em master, pasta DDD é `traducao` | 9 arquivos i18n | ✅ migrado |

---

## 7. Segurança (7 skills)

| Caminho | Doc esperado | Status |
|---|---|---|
| `seguranca/seguranca-5-camadas/` | n/a (consolidador) | n/a |
| `seguranca/permissoes/` | técnico (a produzir nas ondas) | ❌ pendente |
| `seguranca/autenticacao-s2s/` | técnico (a produzir nas ondas) | ❌ pendente |
| `seguranca/cross-boundary/` | n/a (referência) | n/a |
| `seguranca/rate-limiting/` | n/a (referência) | n/a |
| `seguranca/pentest/` | n/a (auditoria-seguranca-2026-03-29.md restaurada para `seguranca/` raiz, alinhada com refs em master skills) | n/a |
| `seguranca/tier1-security/` | 🚫 bloqueado — ver S5 em `auditoria-skills/03-violacoes-ssot.md` | 🚫 bloqueado |

> **Pendente skill nova (P0):** `seguranca/webhooks-recebidos/` — ver `04-lacunas-divida.md` L1 (risco ALTO).

---

## 8. Testes (8 skills)

`testes/` — todos n/a (estrutura `regras/`, `tecnico/`, `README.md` migrada).

---

## 9. UX (5 skills)

| Caminho | Doc esperado | Status |
|---|---|---|
| `ux/design-system/` | cores.html, light-theme-token-mapping.md, manual-marca/ | ✅ migrado |
| `ux/componentes/` | n/a (referência ao nucleo-global) | n/a |
| `ux/criacao-telas/` | layout-e-margens.md, fluxograma_telas_gravity.pdf | ✅ migrado |
| `ux/tooltip/` | README.md + 3 PNG | ✅ migrado |
| `ux/acessibilidade/` | n/a (referência WCAG) | n/a |

---

## 10. Produtos Gravity (5 skills + 11 produtos físicos)

### Com skill formal (5)

| Caminho | Status |
|---|---|
| `produtos-gravity/configurador/` | ❌ pendente (Onda A) |
| `produtos-gravity/configurador/admin/` | ❌ pendente (Onda A) |
| `produtos-gravity/api-cockpit/` | ❌ pendente (Onda A) |
| `produtos-gravity/marketplace/` | ❌ pendente (Onda A) |
| `produtos-gravity/simulador-comex/` | ✅ migrado (skill ainda bloqueada) |

### Produtos físicos sem skill formal (10)

`produtos-gravity/{pedido, lpco, nf-importacao, processo, bid-cambio, bid-frete, financeiro-comex, dashboard, gabi, cadastros}/` — todos ✅ migrado.

---

## 11. Dream Team (sub-projetos) — todas n/a

`dream-team/{ajustes, detetive-tela, produtos, tecnologia}/` — todos n/a.

---

## Pastas META + DDD-ATLAS (fora do espelho de skills)

| Caminho | Conteúdo | Status |
|---|---|---|
| `auditoria-skills/` (root) | 5 relatórios sincronizados de master — alinhado com path de master skills | ✅ atualizado |
| `historico-alteracoes/` (root) | 2 arquivos — alinhado com path em master `dream-team/ajustes/SKILL.md` | ✅ migrado |
| `seguranca/auditoria-seguranca-2026-03-29.md` | arquivo restaurado ao path original (raiz de `seguranca/`) — alinhado com ref em master `governanca/lei/isolamento-organizacao/SKILL.md` | ✅ migrado |
| `_meta/INDEX.md` | este arquivo | ✅ existe |
| `_meta/auditorias-historicas/` | ~17 artefatos antigos (CSVs, JSONs, baselines, mapas) | ✅ migrado |
| `_legado/` | 3 arquivos sem destino claro | ✅ existe |
| **`ddd-atlas/`** (root) | 10 arquivos — atlas DDD consolidado (campos/rotas/models/enums/paginas/modais/componentes) gerado da planilha mestre | ✅ trazido de master |

---

## Conflitos & SSOT — Status

| Item | Status |
|---|---|
| C1 (3 índices) | ✅ Resolvido |
| C2 (`@@map` obrigatório) | ✅ Resolvido |
| C3 (Stripe) | ❌ Pendente — decisão do dono sobre provedor de pagamento |
| C4 (Master/UsuarioWorkspace) | ✅ Resolvido |
| C5 (`ADMIN` vs `GRAVITY_ADMIN`) | ✅ Resolvido |
| C6 (cor duplicada) | ❌ Pendente |
| C7 (cobertura 70/80) | ❌ Pendente |
| C8 (termo `tenant`) | ⚠️ Reclassificado — dívida técnica consciente |
| S10 (database-governance taxonomia) | ✅ Resolvido (promovido para `lei/`) |
| S1-S9 | ❌ Pendente (refactor de skills) |

**Resolvidos: 5/8 conflitos + 1/10 violações SSOT.**

---

## Próximas Ações (do briefing do dono)

| Prioridade | Item | Onde |
|---|---|---|
| **P0** | Criar skill `seguranca/webhooks-recebidos/` (L1) | skills/ — escopo do agente de skills |
| P1 | Resolver C3 (Stripe em visao-geral + code-standards) | skills/ |
| P1 | Decidir fronteira S4 (isolamento-organizacao ↔ sdk-resolvedor-organizacao) | Decisão arquitetural antes |
| P2 | Refatorar S5 (tier1-security duplica isolamento) | skills/ |
| P2 | Resolver C6 + C7 | skills/ |

> **Escopo do agente de documentos-tecnicos (eu):** atualizar este INDEX e relatórios de `auditoria-skills/` quando conflitos pendentes forem resolvidos. **Não toco em `skills/`** — esse é escopo do agente paralelo.

---

## Histórico

| Data | Commit | Mudança |
|---|---|---|
| 2026-04-28 | `0fa79382` | Pré-passada de auditoria gravada |
| 2026-04-28 | `98032104` | Refatoração física de documentos-tecnicos |
| 2026-04-28 | `bf4444c1` | INDEX inicial |
| 2026-04-28 | (este commit) | Sincronização com master: 5 relatórios atualizados + ddd-atlas/ trazido |
