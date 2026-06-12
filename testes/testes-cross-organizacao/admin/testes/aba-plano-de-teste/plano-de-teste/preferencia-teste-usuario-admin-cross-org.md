# 📋 Plano de Teste Cross-Organização — Preferência de Teste do Usuário (Admin)

**ID:** TST-CRO-PREFERENCIA-TESTE-USUARIO-ADMIN-000094
**Escopo pasta:** `testes/testes-cross-organizacao/admin/testes/aba-plano-de-teste/`
**Spec:** `plano-de-teste/TST-CRO-PREFERENCIA-TESTE-USUARIO-ADMIN-000094.test.ts`
**Rotas-alvo:** `GET/POST/DELETE /api/v1/admin/testes-favoritos`
**Tipo:** [ ] Unitário | [ ] Funcional | [ ] E2E | [x] CRO | [ ] EMT

> O modal Admin («O que será testado») agrupa os passos pelos títulos `### ETAPA …` abaixo. **Não remover** essa estrutura.

---

## Escopo e justificativa

A tabela `teste_favorito_usuario` mora no banco do Configurador (schema `public`) e é escopada
por `id_usuario` — **não há schema-per-organização** neste recurso. Portanto a fronteira de
isolamento aplicável é **cross-usuário**: dois admins Gravity de organizações distintas não podem
enxergar nem remover os favoritos um do outro. Os dois usuários do teste pertencem a organizações
diferentes (`org_alpha` / `org_beta`), cobrindo também o recorte cross-organização.

**Objetivo geral:** provar a fronteira de isolamento — nenhuma operação (leitura, escrita ou remoção) de um usuário pode tocar nos favoritos de outro, mesmo entre organizações diferentes.

---

## Roteiro de execução

### ETAPA 1 — Isolamento de leitura (GET)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **C01** | Usuário A (`org_alpha`) cria um favorito; usuário B (`org_beta`) faz `GET /testes-favoritos` | Lista de B **não contém** o favorito de A — GET sempre escopado por `id_usuario` do autenticado |
| **C02** | Usuário A faz `GET /testes-favoritos` | A continua enxergando o próprio favorito intacto — o isolamento não "esconde" o dado do dono |

### ETAPA 2 — Isolamento de remoção (DELETE)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **C03** | Usuário B tenta `DELETE` no id do favorito de A | **404** (`deleteMany` com `{ id, id_usuario: usr_B }` → `count: 0`) e o registro de A permanece intacto no banco |

### ETAPA 3 — Isolamento de escrita (POST)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **C04** | Usuário B cria um favorito via `POST` | Registro gravado com `id_usuario = usr_B` (vindo do token, nunca do payload) — impossível plantar favorito em nome de A |

---

## Como rodar

```bash
npx vitest run --config testes/testes-cross-organizacao/admin/vitest.config.ts TST-CRO-PREFERENCIA-TESTE-USUARIO-ADMIN-000094
```

## 📊 Resultado: [x] APROVADO | [ ] REPROVADO | [ ] RESSALVAS
