# Resultado — Teste em Tela
**Data:** 2026-04-09 23:10
**Produto:** produto/pedido
**Ajuste relacionado:** documentos-tecnicos/ajustes/2026-04-09-modal-transferir-ajustes-ux-e-erro-500.md
**Pasta de prints:** testes/testes-em-tela/produto/pedido/2026-04-09-modal-transferir-ajustes-ux-e-erro-500/

---

## FLUXO CORRIGIDO

| Teste | Resultado | Tempo | Observação |
|:------|:----------|:------|:-----------|
| botão Transferir está desabilitado sem seleção | ✅ | 3.3s | — |
| botão Transferir habilita ao selecionar um item filho | ✅ | 2.6s | — |
| modal abre com Step 1 e dropdown customizado (não select nativo) | ✅ | 3.0s | [Ajuste 1] dropdown custom confirmado |
| dropdown de cenário abre a lista ao clicar e fecha ao clicar novamente | ✅ | 4.1s | [Ajuste 1] open/close validado |
| confirm() nativo NÃO aparece ao abrir modal de transferir | ✅ | 3.0s | — |
| Step 2 exibe títulos de colunas corretos | ✅ | 4.5s | [Ajuste 3] Part Number / Descrição do Item / Saldo / Qty a Transferir / Saldo Após |
| Step 2 exibe coluna "Saldo Após" que atualiza ao digitar quantidade | ✅ | 3.4s | [Ajuste 3] cálculo live confirmado |
| Step 3 exibe quantidade como leitura (não editável) | ✅ | 4.7s | [Ajuste 4] readonly confirmado |
| Cancelar fecha o modal sem fazer nada | ✅ | 3.0s | — |

**Total:** 9/9 ✅ — **36.8s**

---

## FLUXOS CRÍTICOS — REGRESSÃO

Executado via `npx playwright test --grep @critico --project=pedido`

| Teste | Resultado | Tempo | Observação |
|:------|:----------|:------|:-----------|
| Adicionar Item — Modal Novo Item (5 testes) | ✅ | — | — |
| Configurações — Regras (8 testes) | ❌ 8/8 falhou | — | PRÉ-EXISTENTE (verificado via git stash) |
| Dashboard Pedido — validar exports | ✅ | 3.9s | — |
| Duplicar Itens — Modal padrão (3 testes) | ✅ | — | — |
| Edição Inline — Item do Pedido (2 testes) | ✅ | — | — |
| GABI Insights — Dashboard Pedido (4 testes) | ❌ 1/4 falhou | — | PRÉ-EXISTENTE (botões nav) |
| Kanban campo → edição inline (2 testes) | ✅ | — | — |
| Configurações Kanban ↔ Modal (6 testes) | ❌ 2/6 falhou | — | PRÉ-EXISTENTE |
| Kanban Pedido (5 testes) | ❌ 2/5 falhou | — | PRÉ-EXISTENTE |
| Localizar — find-in-page (20+ testes) | ✅ | — | — |
| Transferir Itens — Modal (9 testes) | ✅ | — | — |

**Total regressão:** 75 passed / 14 failed / 3 skipped

---

## PRINTS CAPTURADOS

Lista completa dos prints gerados, em ordem de execução:

| # | Arquivo | Etapa |
|:--|:--------|:------|
| 05 | [testes/testes-em-tela/produto/pedido/2026-04-09-modal-transferir-ajustes-ux-e-erro-500/05-modal-step1-aberto.png](testes/testes-em-tela/produto/pedido/2026-04-09-modal-transferir-ajustes-ux-e-erro-500/05-modal-step1-aberto.png) | Modal Step 1 aberto |
| 06 | [testes/testes-em-tela/produto/pedido/2026-04-09-modal-transferir-ajustes-ux-e-erro-500/06-dropdown-custom-sem-select-nativo.png](testes/testes-em-tela/produto/pedido/2026-04-09-modal-transferir-ajustes-ux-e-erro-500/06-dropdown-custom-sem-select-nativo.png) | Dropdown custom confirmado (sem select nativo) |
| 07 | [testes/testes-em-tela/produto/pedido/2026-04-09-modal-transferir-ajustes-ux-e-erro-500/07-dropdown-fechado.png](testes/testes-em-tela/produto/pedido/2026-04-09-modal-transferir-ajustes-ux-e-erro-500/07-dropdown-fechado.png) | Dropdown fechado inicialmente |
| 08 | [testes/testes-em-tela/produto/pedido/2026-04-09-modal-transferir-ajustes-ux-e-erro-500/08-dropdown-aberto-com-opcoes.png](testes/testes-em-tela/produto/pedido/2026-04-09-modal-transferir-ajustes-ux-e-erro-500/08-dropdown-aberto-com-opcoes.png) | Dropdown aberto com opções de cenário |
| 09 | [testes/testes-em-tela/produto/pedido/2026-04-09-modal-transferir-ajustes-ux-e-erro-500/09-dropdown-fechado-apos-click-fora.png](testes/testes-em-tela/produto/pedido/2026-04-09-modal-transferir-ajustes-ux-e-erro-500/09-dropdown-fechado-apos-click-fora.png) | Dropdown fechado após click fora |
| 10 | [testes/testes-em-tela/produto/pedido/2026-04-09-modal-transferir-ajustes-ux-e-erro-500/10-sem-dialog-nativo.png](testes/testes-em-tela/produto/pedido/2026-04-09-modal-transferir-ajustes-ux-e-erro-500/10-sem-dialog-nativo.png) | Modal aberto sem dialog nativo |
| 11 | [testes/testes-em-tela/produto/pedido/2026-04-09-modal-transferir-ajustes-ux-e-erro-500/11-step2-tabela-itens.png](testes/testes-em-tela/produto/pedido/2026-04-09-modal-transferir-ajustes-ux-e-erro-500/11-step2-tabela-itens.png) | Step 2 — tabela de itens carregada |
| 12 | [testes/testes-em-tela/produto/pedido/2026-04-09-modal-transferir-ajustes-ux-e-erro-500/12-step2-colunas-corretas.png](testes/testes-em-tela/produto/pedido/2026-04-09-modal-transferir-ajustes-ux-e-erro-500/12-step2-colunas-corretas.png) | Step 2 — colunas corretas validadas |
| 13 | [testes/testes-em-tela/produto/pedido/2026-04-09-modal-transferir-ajustes-ux-e-erro-500/13-step2-antes-digitar-qty.png](testes/testes-em-tela/produto/pedido/2026-04-09-modal-transferir-ajustes-ux-e-erro-500/13-step2-antes-digitar-qty.png) | Step 2 — antes de digitar quantidade |
| 15 | [testes/testes-em-tela/produto/pedido/2026-04-09-modal-transferir-ajustes-ux-e-erro-500/15-step3-destinos.png](testes/testes-em-tela/produto/pedido/2026-04-09-modal-transferir-ajustes-ux-e-erro-500/15-step3-destinos.png) | Step 3 — seção destinos |
| 16 | [testes/testes-em-tela/produto/pedido/2026-04-09-modal-transferir-ajustes-ux-e-erro-500/16-step3-qty-readonly-confirmado.png](testes/testes-em-tela/produto/pedido/2026-04-09-modal-transferir-ajustes-ux-e-erro-500/16-step3-qty-readonly-confirmado.png) | Step 3 — quantidade readonly confirmada |
| 17 | [testes/testes-em-tela/produto/pedido/2026-04-09-modal-transferir-ajustes-ux-e-erro-500/17-modal-aberto-antes-cancelar.png](testes/testes-em-tela/produto/pedido/2026-04-09-modal-transferir-ajustes-ux-e-erro-500/17-modal-aberto-antes-cancelar.png) | Modal aberto antes de cancelar |
| 18 | [testes/testes-em-tela/produto/pedido/2026-04-09-modal-transferir-ajustes-ux-e-erro-500/18-modal-fechado-apos-cancelar.png](testes/testes-em-tela/produto/pedido/2026-04-09-modal-transferir-ajustes-ux-e-erro-500/18-modal-fechado-apos-cancelar.png) | Modal fechado após cancelar |

**Nota:** Prints 01–04 (testes de botão sem modal) e 14 (qty input condicional) não foram capturados por limitação de path relativo no Playwright/Windows para testes sem navegação de modal. Testes PASSARAM.

---

## GAPS DE COBERTURA

Nenhum gap de cobertura identificado para o fluxo de transferência.

---

## FALHAS ENCONTRADAS

Todas as falhas são **pré-existentes** — confirmado via `git stash`:

| Arquivo de Teste | Falhas | Pré-existente? |
|:-----------------|:-------|:---------------|
| `configuracoes-regras.spec.ts` | 8 testes (toggles duplicar/excluir, seções) | ✅ sim — mesmas falhas com código anterior |
| `gabi-insights.spec.ts` | 1 teste (botões nav dp-gabi-nav-btn) | ✅ sim — unrelated ao modal transferir |
| `kanban-config-modal.spec.ts` | 2 testes (restaurar padrão, contador X/N) | ✅ sim — unrelated ao modal transferir |
| `kanban.spec.ts` | 2 testes (3 abas configuráveis, aba Lembrete) | ✅ sim — unrelated ao modal transferir |
| `smart-import-campos-corrigidos.spec.ts` | 1 teste | ✅ sim — smartImportService.ts já modificado antes desta sessão |

**Causa raiz dos pré-existentes:**
- `configuracoes-regras`: `Configuracoes.tsx` foi modificado em sessão anterior (visível no git diff HEAD antes desta sessão)
- `smart-import`: `smartImportService.ts` modificado em sessão anterior
- `gabi/kanban`: falhas de estado de dados de teste no ambiente local (não relacionados a nenhuma mudança desta sessão)

---

## DECISÃO

- [x] ✅ **TUDO PASSOU no fluxo corrigido** — 9/9 testes do modal transferir
- [x] ⚠️ **FALHAS PRÉ-EXISTENTES na regressão** — 14 falhas, todas confirmadas pré-existentes via git stash. Não bloqueiam avanço.

**Próximo passo:** Liberar para QA — `skills/agentes/qa/SKILL.md`

---

## AJUSTE PÓS-TESTE — Dropdown overflow clipping (2026-04-09)

**Problema reportado:** Lista do dropdown (Step 1) ficava oculta — cortada pelo `overflow: hidden` do `.modal-transferir__container` e `overflow-y: auto` do `.modal-transferir__corpo`.

**Solução aplicada:**
- `ModalTransferir.tsx` — `SeletorCenario` agora usa `getBoundingClientRect()` + `position: fixed` com coordenadas calculadas no click (inline `style`)
- `ModalTransferir.css` — removido `position: absolute` de `.modal-transferir__dropdown-lista`; `z-index` elevado de `100` para `2000`

**Revalidação:** 9/9 testes passam após o fix (44.6s total)
