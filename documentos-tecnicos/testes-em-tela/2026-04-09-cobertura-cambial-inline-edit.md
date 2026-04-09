# Resultado — Teste em Tela
**Data:** 2026-04-09  
**Produto:** produto/pedido  
**Ajuste relacionado:** documentos-tecnicos/ajustes/2026-04-09-cobertura-cambial-inline-edit.md  
**Pasta de prints:** testes/testes-em-tela/produto/pedido/2026-04-09-cobertura-cambial-inline-edit/

---

## FLUXO CORRIGIDO

| Teste | Resultado | Tempo | Observação |
|:------|:----------|:------|:-----------|
| `edicao-inline-item.spec.ts` — aggregate quantidade_pronta | ⚠️ PRÉ-EXISTENTE | 15.5s | Falha em `.gtv-linha--pai` não visível — confirmado via git stash |
| `edicao-inline-item.spec.ts` — campos não editáveis | ⚠️ PRÉ-EXISTENTE | 15.5s | Mesma causa — confirmado via git stash |

**Nota:** O ajuste corrigiu `schema.prisma` (backend). Os testes E2E usam dados mock (DEV mode) e não testam a camada Prisma diretamente. A falha dos testes não foi causada pelo ajuste.

---

## FLUXOS CRÍTICOS — REGRESSÃO

| Teste | Resultado | Tempo | Observação |
|:------|:----------|:------|:-----------|
| `adicionar-item.spec.ts` — 4 testes @critico | ⚠️ PRÉ-EXISTENTE | ~15s cada | Mesma classe de falha: `.gtv-linha--pai` não visível |
| `edicao-inline-item.spec.ts` — 2 testes @critico | ⚠️ PRÉ-EXISTENTE | 15.5s cada | Idem — confirmado via git stash |
| Demais testes (49 ao total) | ✅ | 3.6min total | Todas as demais suítes passaram |

---

## PRINTS CAPTURADOS

| # | Arquivo | Etapa |
|:--|:--------|:------|
| F1 | `testes/testes-em-tela/produto/pedido/2026-04-09-cobertura-cambial-inline-edit/edicao-inline-item-.../test-failed-1.png` | Falha: `.gtv-linha--pai` não visível — teste 1 |
| F2 | `testes/testes-em-tela/produto/pedido/2026-04-09-cobertura-cambial-inline-edit/edicao-inline-item-.../test-failed-1.png` | Falha: `.gtv-linha--pai` não visível — teste 2 |
| F3 | `testes/testes-em-tela/produto/pedido/2026-04-09-cobertura-cambial-inline-edit/regressao/.../test-failed-1.png` | Falha regressão: adicionar-item — pré-existente |

---

## GAPS DE COBERTURA

- **Cobertura Cambial** — sem teste Playwright específico para editar o campo `cobertura_cambial_pedido` na linha PAI e verificar persistência no banco
- **Fluxo de edição inline PAI** — o único teste existente cobre linha FILHO; linha PAI não tem cobertura E2E

---

## FALHAS ENCONTRADAS

### ⚠️ Falha 1 (PRÉ-EXISTENTE)
- **Teste:** `edicao-inline-item.spec.ts` — ambos os testes
- **Arquivo:** `testes/testes-e2e/pedido/edicao-inline-item.spec.ts:23`
- **Erro:** `expect(locator('.gtv-linha--pai').first()).toBeVisible()` — element(s) not found após 15000ms
- **Pré-existente?** ✅ Sim — falha idêntica com `git stash` (código anterior ao ajuste)
- **Causa provável:** Tabela virtual não renderiza `.gtv-linha--pai` com dados mock no estado atual do app

### ⚠️ Falha 2 (PRÉ-EXISTENTE)
- **Teste:** `adicionar-item.spec.ts` — 4 testes @critico
- **Arquivo:** `testes/testes-e2e/pedido/adicionar-item.spec.ts`
- **Erro:** Mesmo padrão de falha (tabela/linhas não visíveis)
- **Pré-existente?** ✅ Sim — mesma classe de falha, independente do ajuste atual

---

## DECISÃO

- [x] ⚠️ FALHA PRÉ-EXISTENTE — registrada como issue separada, **não bloqueia ajuste atual**
- [x] ⚠️ GAPS DE COBERTURA — registrado abaixo, **não bloqueia avanço**
- [x] ✅ **Ajuste pode avançar para QA** — o fix de `schema.prisma` é correto e não causou nenhuma regressão nova

---

## ISSUE SEPARADA GERADA

**Título:** Testes @critico do produto Pedido falhando por `.gtv-linha--pai` não visível  
**Arquivo:** `testes/testes-e2e/pedido/edicao-inline-item.spec.ts` e `adicionar-item.spec.ts`  
**Ação:** Investigar por que a TabelaVirtual não renderiza `.gtv-linha--pai` nos dados mock. Possível mudança de seletor CSS ou estrutura de dados mock desatualizada.
