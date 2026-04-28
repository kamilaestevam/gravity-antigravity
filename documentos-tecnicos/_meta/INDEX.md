# INDEX — Painel Mestre de Documentação Técnica

> Tabela mestre da documentação. Espelha a árvore de `skills/` (64 skills em 11 grupos) + adiciona pastas para produtos físicos do codebase que ainda não têm skill formal.

---

## Metadados

| Campo | Valor |
|---|---|
| Data inicial | 2026-04-28 |
| Commit inicial | `0fa79382` |
| Total de entradas | **64 skills + 11 produtos físicos = 75** |

---

## Convenção da Tabela

| Status | Significado |
|---|---|
| ✅ migrado | Pasta nova criada com docs migrados do legado |
| ⚠️ desatualizado | Doc existe mas precisa atualização (após ondas A-D) |
| ❌ pendente | Sem doc — produzir durante onda correspondente |
| n/a | Sem doc previsto (skill normativa, meta-agente, etc.) |
| 🚫 bloqueado | Aguarda decisão (ver `_meta/auditoria-skills/02-conflitos.md`) |

---

## 1. Governança › Lei (10 skills)

| Caminho da skill | Doc esperado | Status |
|---|---|---|
| `governanca/lei/9-mandamentos/` | n/a (normativa pura) | n/a |
| `governanca/lei/agent-policy/` | n/a (meta-agente) | n/a |
| `governanca/lei/visao-geral/` | n/a (consolidado em outras) | n/a |
| `governanca/lei/ddd-nomenclatura/` | técnico + auditorias-execucao/ (7 arq) | ✅ migrado |
| `governanca/lei/terminal/` | n/a (meta-agente) | n/a |
| `governanca/lei/isolamento-organizacao/` | técnico + incidentes-e-auditoria.md (a recriar — agente skills decide) | ❌ pendente |
| `governanca/lei/sdk-resolvedor-organizacao/` | referencia.md (a recriar — agente skills decide) | ❌ pendente |
| `governanca/lei/sla-metas/` | n/a (lei pura) | n/a |
| `governanca/lei/cost-budget/` | n/a (lei pura) | n/a |
| `governanca/lei/backup-policy/` | n/a (lei pura) | n/a |

---

## 2. Governança › Convenção Técnica (7 skills)

| Caminho | Doc esperado | Status |
|---|---|---|
| `governanca/convencao-tecnica/code-standards/` | n/a (convenção pura) | n/a |
| `governanca/convencao-tecnica/monorepo/` | n/a (convenção pura) | n/a |
| `governanca/convencao-tecnica/lint-tenant-safety/` | n/a (linter) | n/a |
| `governanca/convencao-tecnica/database-governance/` | dicionarios/ (4 arq a recriar — agente skills decide) | ❌ pendente |
| `governanca/convencao-tecnica/api-design/` | contratos/ (a recriar — agente skills decide) | ❌ pendente |
| `governanca/convencao-tecnica/criptografia/` | n/a (lei pura) | n/a |
| `governanca/convencao-tecnica/observabilidade-minima/` | n/a (lei pura) | n/a |

---

## 3. Governança › Operação (4 skills)

| Caminho | Doc esperado | Status |
|---|---|---|
| `governanca/operacao/auto-scaling/` | n/a (referencia cost-budget) | n/a |
| `governanca/operacao/backup-disaster-recovery/` | n/a (referencia backup-policy) | n/a |
| `governanca/operacao/performance-monitoring/` | n/a (referencia sla-metas) | n/a |
| `governanca/operacao/service-registry/` | n/a (config) | n/a |

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

| Caminho | Status |
|---|---|
| `papeis/lider/` | n/a |
| `papeis/coordenador/` | n/a |
| `papeis/qa/` | n/a |
| `papeis/analista-erros-testes/` | n/a |

---

## 6. Arquitetura (8 skills)

| Caminho | Doc esperado | Status |
|---|---|---|
| `arquitetura/nucleo-global/` | TabelaGlobal.md, ToastGlobal.md, README.md | ✅ migrado |
| `arquitetura/schema-composition/` | adr-001/003 (a recriar — agente skills decide) | ❌ pendente |
| `arquitetura/servicos-organizacao/` | técnico (a produzir nas ondas) | ❌ pendente |
| `arquitetura/state-management/` | n/a (referência) | n/a |
| `arquitetura/caching-strategy/` | n/a (referência) | n/a |
| `arquitetura/resilience-patterns/` | n/a (referência) | n/a |
| `arquitetura/observabilidade/` | n/a (referência) | n/a |
| `arquitetura/traducao/` ⚠️ skill é `i18n` mas pasta DDD é `traducao` | 9 arquivos i18n | ✅ migrado |

---

## 7. Segurança (7 skills)

| Caminho | Doc esperado | Status |
|---|---|---|
| `seguranca/seguranca-5-camadas/` | n/a (consolidador) | n/a |
| `seguranca/permissoes/` | técnico (a produzir nas ondas) | ❌ pendente |
| `seguranca/autenticacao-s2s/` | técnico (a produzir nas ondas) | ❌ pendente |
| `seguranca/cross-boundary/` | n/a (referência) | n/a |
| `seguranca/rate-limiting/` | n/a (referência) | n/a |
| `seguranca/pentest/` | auditoria-2026-03-29.md | ✅ migrado |
| `seguranca/tier1-security/` | 🚫 bloqueado — ver S5 em `auditoria-skills/03` | 🚫 bloqueado |

---

## 8. Testes (8 skills)

| Caminho | Doc esperado | Status |
|---|---|---|
| `testes/` (raiz) | regras/, tecnico/, README.md | ✅ migrado |
| `testes/padroes-vitest-playwright/` | n/a (já documentado em testes/) | n/a |
| `testes/teste-em-tela/` | n/a | n/a |
| `testes/contract-testing/` | n/a | n/a |
| `testes/agente-plano-teste/` | n/a (meta) | n/a |
| `testes/agente-plano-teste-e2e/` | n/a (meta) | n/a |
| `testes/agente-plano-teste-funcional/` | n/a (meta) | n/a |
| `testes/agente-plano-teste-unitario/` | n/a (meta) | n/a |

---

## 9. UX (5 skills)

| Caminho | Doc esperado | Status |
|---|---|---|
| `ux/design-system/` | cores.html, light-theme-token-mapping.md, manual-marca/ | ✅ migrado |
| `ux/componentes/` | n/a (referência ao nucleo-global) | n/a |
| `ux/criacao-telas/` | layout-e-margens.md, fluxograma_telas_gravity.pdf | ✅ migrado |
| `ux/tooltip/` | README.md | ✅ migrado |
| `ux/acessibilidade/` | n/a (referência WCAG) | n/a |

---

## 10. Produtos Gravity (5 skills + 11 produtos físicos)

### Com skill formal (5)

| Caminho | Doc esperado | Status |
|---|---|---|
| `produtos-gravity/configurador/` | técnico + negócio (a produzir Onda A) | ❌ pendente |
| `produtos-gravity/configurador/admin/` | técnico (a produzir Onda A) | ❌ pendente |
| `produtos-gravity/api-cockpit/` | técnico + negócio (a produzir Onda A) | ❌ pendente |
| `produtos-gravity/marketplace/` | técnico (a produzir Onda A) | ❌ pendente |
| `produtos-gravity/simulador-comex/` | técnico de simula-custo + estimativa-de-custo | ✅ migrado (skill ainda bloqueada) |

### Produtos físicos sem skill (11) — pasta de docs preserva histórico

| Caminho | Doc esperado | Status |
|---|---|---|
| `produtos-gravity/pedido/` | 16 arquivos vindos de produto/pedido/ | ✅ migrado |
| `produtos-gravity/lpco/` | 8 arquivos vindos de produto/lpco/ | ✅ migrado |
| `produtos-gravity/nf-importacao/` | 6+2 arquivos (consolidado de produto/nf-importacao + produtos/NF Import) | ✅ migrado |
| `produtos-gravity/processo/` | 2+1 arquivos (produto/processo + itens-pedido-processo) | ✅ migrado |
| `produtos-gravity/bid-cambio/` | 3 arquivos | ✅ migrado |
| `produtos-gravity/bid-frete/` | 4 arquivos | ✅ migrado |
| `produtos-gravity/financeiro-comex/` | 3 arquivos | ✅ migrado |
| `produtos-gravity/dashboard/` | 5 arquivos | ✅ migrado |
| `produtos-gravity/gabi/` | 6 arquivos | ✅ migrado |
| `produtos-gravity/cadastros/` | cadastros-arquitetura.md + tipo-de-operacao.md | ✅ migrado |

> **Nota:** estas 10 pastas existem para preservar a documentação atual. Não criam skill nova — quando uma skill formal for criada (decisão do dono), os docs já estão na pasta correspondente.

---

## 11. Dream Team (4 sub-projetos) — todas n/a

| Caminho | Status |
|---|---|
| `dream-team/produtos/` | n/a (meta-time) |
| `dream-team/tecnologia/` | n/a (meta-time) |
| `dream-team/detetive-tela/` | n/a (meta) |
| `dream-team/ajustes/` | relatorios/ (criada quando primeiro relatório for gerado) | n/a |

---

## Pastas META (fora do espelho de skills)

| Caminho | Conteúdo | Status |
|---|---|---|
| `_meta/auditoria-skills/` | 5 relatórios de pré-passada | ✅ existe |
| `_meta/INDEX.md` | este arquivo | ✅ existe |
| `_meta/historico-alteracoes/` | 2 arquivos vindos de historico-alteracoes/ | ✅ migrado |
| `_meta/auditorias-historicas/` | ~17 artefatos (CSVs, JSONs, baselines, mapas) | ✅ migrado |
| `_legado/` | docs sem destino claro (~3-5 arquivos) | ✅ existe |

---

## Resumo numérico

| Status | Quantidade |
|---|---:|
| ✅ migrado | ~30 entradas com conteúdo migrado |
| ❌ pendente (a produzir nas ondas) | ~12 entradas |
| 🚫 bloqueado (aguarda decisão) | 1 entrada (tier1-security) |
| n/a (sem doc previsto) | ~32 entradas |
| **Total** | **75** |

---

## Próximas Ações

1. **Agente de skills** corrige refs nas 12 skills (tabela já enviada).
2. **Onda A** começa por `produtos-gravity/configurador/` (resposta a conflitos C1-C8 destrava).
3. Cada ciclo atualiza este INDEX.md mudando status `❌ pendente` → `✅ migrado`.

---

## Histórico

| Data | Commit | Mudança |
|---|---|---|
| 2026-04-28 | `0fa79382` | Pré-passada de auditoria gravada |
| 2026-04-28 | (este commit) | Estrutura espelho criada + INDEX inicial |
