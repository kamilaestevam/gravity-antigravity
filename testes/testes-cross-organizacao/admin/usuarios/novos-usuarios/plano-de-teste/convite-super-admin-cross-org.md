# 📋 Plano de Teste Cross-Organização — Convite Super Admin (Admin › Usuários)

**ID:** TST-CRO-CONVITE-SUPER-ADMIN-ADMIN-000119  
**Task:** TASK-000302  
**Escopo pasta:** `testes/testes-cross-organizacao/admin/usuarios/novos-usuarios/`  
**Spec:** `plano-de-teste/TST-CRO-CONVITE-SUPER-ADMIN-ADMIN-000119.test.ts`  
**Rotas-alvo:** `POST /api/v1/admin/usuarios/convidar`  
**Tipo:** [ ] Unitário | [ ] Funcional | [ ] E2E | [x] CRO | [ ] EMT

> O modal Admin («O que será testado») agrupa os passos pelos títulos `### ETAPA …` abaixo. **Não remover** essa estrutura.

---

## Escopo

Isolamento cross-org no convite admin: ator pode pertencer a org cliente A, payload pode
informar org B — mas convite **SUPER_ADMIN** sempre persiste na org Gravity-interna
(`hospeda_colaboradores_gravity`). Convites **MASTER** respeitam `id_organizacao_alvo` do body.

**Objetivo geral:** garantir fronteira de tenant correta — override só para Super Admin interno;
demais tipos usam org explícita do payload.

---

## Roteiro de execução

### ETAPA 1 — Override Gravity (SUPER_ADMIN convidado)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **C01** | Ator `SUPER_ADMIN` com `id_organizacao = org_cliente_A` · body `id_organizacao_alvo = org_cliente_B` · `tipo_usuario: SUPER_ADMIN` | **201** · serviço recebe `id_organizacao_alvo = ORG_GRAVITY` (não A nem B) |
| **C02** | Mesmo ator · body com terceira org `org_cliente_C` | **201** · serviço **sempre** recebe `ORG_GRAVITY` — front não escolhe destino |

### ETAPA 2 — Sem override (MASTER)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **C03** | Ator `SUPER_ADMIN` · `tipo_usuario: MASTER` · `id_organizacao_alvo = org_cliente_D` | **201** · serviço recebe **exatamente** `org_cliente_D` · `resolverIdOrganizacaoGravity` **não** chamado |

### ETAPA 3 — Ator cross-org bloqueado

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **C04** | Ator `ADMIN` (org Gravity) tenta convite em qualquer org | **403** `ADMIN_SOMENTE_LEITURA` — impossível convidar cross-org como read-only |

---

## Como rodar

```bash
npx vitest run --config testes/testes-cross-organizacao/admin/vitest.config.ts TST-CRO-CONVITE-SUPER-ADMIN-ADMIN-000119
```

## 📊 Resultado: [ ] APROVADO | [ ] REPROVADO | [ ] RESSALVAS
