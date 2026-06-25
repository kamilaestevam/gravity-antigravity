# 📋 Plano de Testes Funcionais — Excluir Coluna Manual (Configurações)

**ID:** TST-FUN-EXCLUIR-COLUNA-MANUAL-CONFIGURACOES-LISTA-PEDIDO-001  
**Produto:** Pedido  
**Tela:** Configurações → Colunas → Personalizadas  
**Feature:** `DELETE /api/v1/pedidos/colunas-usuario/:id` (soft delete)  
**Tipo:** Funcional (Vitest + Supertest + mock Prisma)  
**Data:** 2026-06-09  
**Ambiente:** `@vitest-environment node`  
**Criticidade:** alta  
**Status:** Aguardando aprovação do dono

---

## Resumo executivo

Testes funcionais da rota de exclusão de coluna personalizada e integração com o service. Valida soft delete (`ativo=false`), preservação de valores, isolamento por organização na camada de rota e contrato HTTP 204/404.

**Fora do escopo:** teste em tela (`testes-em-tela`) — outro agente.

---

## Rotas cobertas

| Método | Rota | Descrição |
|--------|------|-----------|
| DELETE | `/api/v1/pedidos/colunas-usuario/:id_coluna_usuario` | Soft delete — `ativo_coluna_usuario_pedido = false` |
| GET | `/api/v1/pedidos/colunas-usuario` | Listagem pós-exclusão (coluna inativa ausente) |

**Arquivos fonte:**

- `servicos-global/produto/pedido/server/src/routes/colunas-usuario-pedido.ts`
- `servicos-global/produto/pedido/server/src/services/colunasUsuarioService.ts`
- `servicos-global/produto/pedido/server/src/routes/colunas-usuario-pedido-schemas.ts`

**Spec alvo:** `testes/testes-funcionais/produto-gravity/pedido/configuracoes/colunas/personalizadas/TST-FUN-EXCLUIR-COLUNA-MANUAL-CONFIGURACOES-LISTA-PEDIDO-001.test.ts`

**Base URL mock:** `/api/v1/pedidos/colunas-usuario`

---

## Setup do mock

- Mock `withOrganizacao` injetando `id_organizacao` fixo por teste
- Mock Prisma `pedidoListaColunaUsuario` in-memory
- Seed: 1 coluna ativa `COLUNA MANUAL %` + valores vinculados opcionais
- Import dinâmico `colunasUsuarioRouter` após mocks

---

## Casos de teste — DELETE soft delete

| ID | Cenário | Pré-condição | HTTP | Assert |
|----|---------|--------------|------|--------|
| F-ECM-01 | Excluir coluna ativa válida | Coluna `id=A` ativa na org | 204 | `ativo_coluna_usuario_pedido=false` no banco |
| F-ECM-02 | Coluna some da listagem GET | Após F-ECM-01 | GET 200 | Array **não** contém coluna `A` |
| F-ECM-03 | Valores preservados | Coluna com 3 valores em pedidos | 204 | Registros de valor **intactos** no banco |
| F-ECM-04 | Re-excluir coluna já inativa | `ativo=false` | 404 | `NOT_FOUND` |
| F-ECM-05 | ID inexistente (CUID inválido) | UUID/CUID aleatório | 404 | `Coluna não encontrada` |
| F-ECM-06 | ID malformado | `id=""` ou path inválido | 404/400 | Handler global |

---

## Casos de teste — persistência e reativação

| ID | Cenário | Ação | Assert |
|----|---------|------|--------|
| F-ECM-07 | Criar coluna com mesma chave após soft delete | POST nova coluna mesmo nome | Reativa registro inativo OU cria novo conforme service |
| F-ECM-08 | Dados históricos na lista de pedidos | GET valores após delete | Valores ainda consultáveis por `vinculo_id` (se rota expõe inativos) |

---

## Casos de teste — segurança e validação

| ID | Cenário | HTTP | Assert |
|----|---------|------|--------|
| F-ECM-09 | Sem JWT / sessão inválida | 401 | Não toca banco |
| F-ECM-10 | Request sem `withOrganizacao` | — | Rota usa SDK — reprova se `PrismaClient` direto |
| F-ECM-11 | Response shape erro 404 | 404 | `{ error: { code, message } }` via `AppError` |

---

## Casos de teste — integração front (mock fetch)

| ID | Cenário | Simulação | Assert |
|----|---------|-----------|--------|
| F-ECM-12 | `colunasUsuarioApi.excluir` sucesso | fetch 204 | Resolve sem body |
| F-ECM-13 | `colunasUsuarioApi.excluir` falha rede | fetch throw | Promise rejeitada; log `[colunasUsuarioApi.excluir]` |
| F-ECM-14 | Fluxo pós-delete listar | excluir + listar | Lista reflete remoção |

---

## Execução

```bash
npx vitest run testes/testes-funcionais/produto-gravity/pedido/configuracoes/colunas/personalizadas/TST-FUN-EXCLUIR-COLUNA-MANUAL-CONFIGURACOES-LISTA-PEDIDO-001.test.ts
```

---

## Resultado final

- [ ] **APROVADO**
- [ ] **REPROVADO**
- [ ] **RESSALVAS**
