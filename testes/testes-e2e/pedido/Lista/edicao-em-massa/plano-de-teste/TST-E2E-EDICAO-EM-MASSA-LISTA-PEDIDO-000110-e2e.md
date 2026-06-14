# Plano E2E — Edição em Massa Lista Pedido

**ID:** TST-E2E-EDICAO-EM-MASSA-LISTA-PEDIDO-000110  
**Escopo pasta:** `testes/testes-e2e/pedido/Lista/edicao-em-massa/plano-de-teste/`  
**Spec:** `TST-E2E-EDICAO-EM-MASSA-LISTA-PEDIDO-000110.spec.ts`  
**JSON cenários:** `PLANO-EDICAO-MASSA-COMPLETA.json`  

**Objetivo geral:** validar fluxo Playwright do modal em `http://localhost:8000` conforme cenários C01–C10 do JSON.

## Ambiente de execução

| Campo | Valor |
|-------|-------|
| **Local** | `http://localhost:8000` |
| **Pré-requisito** | Stack dev + `E2E_CLERK_USER_EMAIL` |

```bash
$env:PLAYWRIGHT_BASE_URL='http://localhost:8000'
npx playwright test testes/testes-e2e/pedido/Lista/edicao-em-massa/plano-de-teste/TST-E2E-EDICAO-EM-MASSA-LISTA-PEDIDO-000110.spec.ts --project=pedido
```

---

## Roteiro de execução

### ETAPA 0 — PREPARAÇÃO

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **E01** | Login + abrir Lista de Pedidos | URL `/pedido/pedidos/lista` · Print implícito no spec |

### ETAPA 1 — Smoke modal (C01)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **E02** | Selecionar 1 pedido → Edição em Massa | Modal «Editar em Massa» visível |
| **E03** | Adicionar campo `numero_pedido` + Revisar | Preview de→para visível |

### ETAPA 2 — Volume (C03)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **E04** | Selecionar 4+ pedidos + campo substituir | Botão Revisar habilita após preview |

---

## Como rodar

```bash
npx playwright test testes/testes-e2e/pedido/Lista/edicao-em-massa/plano-de-teste/TST-E2E-EDICAO-EM-MASSA-LISTA-PEDIDO-000110.spec.ts --project=pedido
```

## 📊 Resultado: [ ] APROVADO | [ ] REPROVADO | [ ] RESSALVAS
