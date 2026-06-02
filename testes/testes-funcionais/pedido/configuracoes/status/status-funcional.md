# Plano de Testes Funcionais — Pedido / Configurações / Status (API)

**ID:** TST-FUN-PEDIDO-CONFIG-STATUS-001  
**Data:** 2026-06-02  
**Versão:** 1.0  
**Criticidade:** alta  
**Ambiente:** Vitest + Supertest + mocks Prisma (`@vitest-environment node`)  
**SSOT índice:** `testes/testes-unitarios/pedido/_planos/PLANO-PEDIDO-CONFIG-STATUS-SSOT.md`  
**Referência:** `testes/testes-funcionais/bid-frete-internacional/lista/config-status-routes.test.ts`  
**Status:** Aguardando aprovação do dono

---

## Resumo executivo

Testes funcionais das rotas `pedidos-config.ts` em `processos-core`: CRUD de status, reordenar, sync, lazy seed, guards de sistema (403), validação Zod e limite de 20 status. Espelha contrato BID Frete.

**Spec alvo:** `testes/testes-funcionais/pedido/configuracoes/status/config-status-routes.test.ts`

**Base URL mock:** `/api/v1/pedidos/config`

---

## Rotas cobertas

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/status` | Listar + auto-seed + `garantirStatusSistemaPedido` |
| POST | `/status` | Criar custom |
| PUT | `/status/:id` | Atualizar custom |
| DELETE | `/status/:id` | Excluir custom |
| PUT | `/status/sync` | Sync lista completa |
| PATCH | `/status/reordenar` | Reordenar por IDs |

---

## Casos de teste

### 1. GET /status — listagem e seed

| ID | Cenário | HTTP | Assert |
|----|---------|------|--------|
| F-ST-01 | Tenant sem status | 200 | 7 status padrão retornados |
| F-ST-02 | Tenant existente | 200 | Ordenado por `ordem` asc |
| F-ST-03 | Slugs sistema após GET | 200 | 5 com `is_sistema: true` |
| F-ST-04 | `garantirStatusSistemaPedido` — falta `consolidado` no banco | 200 | Cria ou promove flag sistema |
| F-ST-05 | Response shape | 200 | Campos `id`, `nome`, `rotulo`, `cor`, `ordem`, `is_sistema` |

### 2. POST /status — criação

| ID | Cenário | HTTP | Assert |
|----|---------|------|--------|
| F-ST-06 | Criar `teste_qa` válido | 201 | `is_sistema: false` |
| F-ST-07 | Nome reservado `rascunho` | 400 | Mensagem nome reservado |
| F-ST-08 | Nome reservado `cancelado` | 400 | idem |
| F-ST-09 | Cor inválida `#GGG` | 400 | Zod flatten |
| F-ST-10 | Nome com maiúscula `Teste` | 400 | Regex slug |
| F-ST-11 | 20 status já existentes | 400 | Limite atingido |
| F-ST-12 | Body vazio | 400 | Zod |

### 3. PUT /status/:id — atualização

| ID | Cenário | HTTP | Assert |
|----|---------|------|--------|
| F-ST-13 | Atualizar `em_andamento` rotulo+cor | 200 | Persistido |
| F-ST-14 | Atualizar status sistema `rascunho` | 403 | AppError sistema |
| F-ST-15 | Atualizar status sistema `aberto` | 403 | idem |
| F-ST-16 | ID inexistente | 404 | |
| F-ST-17 | Outro tenant (cross-org) | 404 | Não vaza |

### 4. DELETE /status/:id — exclusão

| ID | Cenário | HTTP | Assert |
|----|---------|------|--------|
| F-ST-18 | Excluir custom `teste_qa` | 200/204 | Removido |
| F-ST-19 | Excluir sistema `consolidado` | 403 | |
| F-ST-20 | Excluir sistema `transferencia` | 403 | |
| F-ST-21 | Excluir custom inexistente | 404 | |

### 5. PUT /status/sync — sincronização

| ID | Cenário | HTTP | Assert |
|----|---------|------|--------|
| F-ST-22 | Sync com reorder + edit custom | 200 | Ordem e rotulo atualizados |
| F-ST-23 | Sync tenta mudar rotulo de `rascunho` | 200 | Rotulo **não** alterado no banco |
| F-ST-24 | Sync tenta mudar cor de `cancelado` | 200 | Cor **não** alterada |
| F-ST-25 | Sync omite custom da lista | 200 | Custom deletado |
| F-ST-26 | Sync omite `rascunho` da lista | 200 | Sistema **não** deletado |
| F-ST-27 | Sync payload inválido (cor) | 400 | Zod |
| F-ST-28 | Sync > 20 itens | 400 | Zod max |

### 6. PATCH /status/reordenar

| ID | Cenário | HTTP | Assert |
|----|---------|------|--------|
| F-ST-29 | Reordenar todos IDs válidos | 200 | Nova ordem persistida |
| F-ST-30 | Array vazio | 400 | Zod |
| F-ST-31 | ID de outro tenant no array | 400/404 | Rejeita |

### 7. Isolamento organização (CRO — referência)

| ID | Cenário | HTTP | Assert |
|----|---------|------|--------|
| F-ST-32 | Org A lista status | 200 | Só status org A |
| F-ST-33 | Org B PUT id de Org A | 404 | Sem cross-tenant |

---

## Setup do mock

- Mock `withOrganizacao` injetando `id_organizacao` fixo por teste
- Mock Prisma `statusPedido` in-memory (padrão BID)
- Import dinâmico `pedidosConfigRouter` após mocks

---

## Execução

```bash
npx vitest run testes/testes-funcionais/pedido/configuracoes/status/
```

**Estado atual:** 0/33 implementados
