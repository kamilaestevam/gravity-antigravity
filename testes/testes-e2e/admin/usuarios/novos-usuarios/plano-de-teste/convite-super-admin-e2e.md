# 📋 Plano de Teste E2E — Convite Super Admin (Admin › Usuários)

**ID:** TST-E2E-CONVITE-SUPER-ADMIN-ADMIN-000118  
**Task:** TASK-000302  
**Escopo pasta:** `testes/testes-e2e/admin/usuarios/novos-usuarios/`  
**Spec:** `plano-de-teste/TST-E2E-CONVITE-SUPER-ADMIN-ADMIN-000118.spec.ts`  
**Tela:** Admin › Usuários Globais → modal «Convidar Usuário»  
**Rota:** `/admin/usuarios`  
**Tipo:** [ ] Unitário | [ ] Funcional | [x] E2E | [ ] CRO | [ ] EMT

> O modal Admin («O que será testado») agrupa os passos pelos títulos `### ETAPA …` abaixo. **Não remover** essa estrutura.

---

## Escopo

Fluxo Playwright (+ Percy) do convite **Super Admin** na gestora de usuários globais.
Pré-condição: sessão de **Super Admin** Gravity (`storageState` ou Clerk em staging).

**Objetivo geral:** provar que a UI não exige seleção de organização para Super Admin,
habilita Salvar com nome+e-mail e conclui convite com feedback visual (toast) e POST 201.

---

## Roteiro de execução

### ETAPA 0 — Navegação

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **E01** | Abrir `/admin/usuarios` autenticado como Super Admin | Listagem visível · botão «Convidar Usuário» presente · Percy `Admin/Usuarios — listagem` |

### ETAPA 1 — Modal e tipo Super Admin

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **E02** | Clicar «Convidar Usuário» · selecionar tipo **Super Admin** | Modal aberto · campo Organização alvo **não** bloqueia Salvar (sem requisito `fOrg`) · Percy `Admin/Usuarios — modal convite Super Admin` |

### ETAPA 2 — Preenchimento mínimo

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **E03** | Preencher nome e e-mail únicos (timestamp) sem selecionar org | Botão «Convidar Usuário» habilitado (`podesSalvar` + `modoCriacao`) |

### ETAPA 3 — Submit e rede

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **E04** | Clicar «Convidar Usuário» · interceptar `POST .../admin/usuarios/convidar` | Resposta **201** · body contém `usuario.tipo_usuario === 'SUPER_ADMIN'` |
| **E05** | Verificar toast de sucesso e fechamento/atualização da lista | Toast visível · modal fecha ou lista refetch · Percy `Admin/Usuarios — convite Super Admin ok` |

---

## Como rodar

```bash
npx playwright test testes/testes-e2e/admin/usuarios/novos-usuarios/plano-de-teste/TST-E2E-CONVITE-SUPER-ADMIN-ADMIN-000118.spec.ts
```

## 📊 Resultado: [ ] APROVADO | [ ] REPROVADO | [ ] RESSALVAS
