# 📋 Plano de Teste Unitário — RBAC Workspaces + Permissões Granulares

**ID:** TST-UNI-CONFIG-RBAC-WORKSPACES-000141  
**Task:** TASK-000305  
**Escopo pasta:** `testes/testes-unitarios/configurador/permissoes/rbac-workspaces-cobertura/`  
**Spec:** `plano-de-teste/TST-UNI-CONFIG-RBAC-WORKSPACES-000141.test.ts`  
**Matriz compartilhada:** `../MATRIZ-COBERTURA-RBAC.md`  
**Código-alvo:** `servicos-global/configurador/shared/` (`permissao-bypass.ts`, `permissoes-canonicas.ts`) + schemas Zod correlatos  
**Tipo:** [x] Unitário | [ ] Funcional | [ ] E2E | [ ] CRO | [ ] EMT

> O modal Admin («O que será testado») agrupa os passos pelos títulos `### ETAPA …` abaixo. **Não remover** essa estrutura.

---

## Escopo

Validar **funções puras** e **contratos Zod** que sustentam as duas cadeias de permissão, antes de qualquer integração HTTP ou Playwright. Garante paridade front↔back (Mand. 07/09) e que bypass / defaults / regex canônico não regredem.

**Objetivo geral:** provar matematicamente que a matriz §5–§6 de `MATRIZ-COBERTURA-RBAC.md` tem base correta no código compartilhado.

---

## Roteiro de execução

### ETAPA 1 — `temBypassPermissao` (Mand. 04)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **U01** | `temBypassPermissao({ tipo_usuario: 'SUPER_ADMIN' })` | `true` |
| **U02** | `temBypassPermissao({ tipo_usuario: 'ADMIN' })` | `true` |
| **U03** | `temBypassPermissao({ tipo_usuario: 'MASTER' })` | `true` |
| **U04** | `temBypassPermissao({ tipo_usuario: 'PADRAO' })` | `false` |
| **U05** | `temBypassPermissao({ tipo_usuario: 'FORNECEDOR' })` | `false` |
| **U06** | `temBypassPermissao({ tipo_usuario: null })` | `false` — sem fallback silencioso (Mand. 08) |

### ETAPA 2 — Regex e `buildPermissaoString` (formato canônico)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **U07** | Regex aceita `pedido:lista:ver` | match |
| **U08** | Regex aceita `pedido:historico:editar` | match |
| **U09** | Regex aceita Portão 3 `pedido:acesso_usuario_produtos_gravity:permitido` | match |
| **U10** | Regex aceita `bid-frete:visao_fornecedor:cotar` | match |
| **U11** | Regex **rejeita** `Pedido:lista:ver` (case) | no match |
| **U12** | Regex **rejeita** `pedido:foo:ver` (seção inválida) | no match |
| **U13** | Regex **rejeita** `pedido:lista:delete` (ação inválida) | no match |
| **U14** | `buildPermissaoString('pedido','lista','ver')` | `'pedido:lista:ver'` |

### ETAPA 3 — Defaults granulares por tipo (least-privilege)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **U15** | `chavesDefaultGranulares('pedido','PADRAO')` | `['pedido:lista:ver']` apenas |
| **U16** | `chavesDefaultGranulares('pedido','FORNECEDOR')` | dashboard+lista+historico `:ver`, zero `:editar` |
| **U17** | PADRAO defaults **não** incluem `configuracao:ver` | assert |
| **U18** | FORNECEDOR defaults **não** incluem `kanban:ver` | assert |

### ETAPA 4 — Helpers de verificação em Set

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **U19** | `usuarioTemPermissaoGranularProduto(set, 'pedido', 'lista', 'ver')` com chave presente | `true` |
| **U20** | Mesmo helper com chave ausente | `false` |
| **U21** | `usuarioTemPermissaoCotarFrete` com `bid-frete:visao_fornecedor:cotar` | `true` / `false` conforme Set |
| **U22** | `ehPermissaoAcessoUsuarioProdutoGravity('pedido:acesso_usuario_produtos_gravity:permitido')` | `true` |
| **U23** | `extrairSlugDaPermissao('pedido:lista:ver')` | `'pedido'` |

### ETAPA 5 — `PRODUTOS_COM_PERMISSOES_IMPLEMENTADAS`

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **U24** | Set contém `pedido`, `bid-frete`, `bid-frete-internacional` | snapshot estável |
| **U25** | `togglesGranularesPorProduto('pedido')` | 12 entradas (6×2) |
| **U26** | Produto **fora** do Set → helper UI trataria como «Em breve» (mock front) | documentado / teste de contrato se existir helper |

### ETAPA 6 — Schemas Zod (payload PUT permissões)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **U27** | Body válido com array de chaves canônicas | `safeParse.success === true` |
| **U28** | Body com chave duplicada | `success === false` |
| **U29** | Body com string fora do regex | `success === false` |
| **U30** | Body `permissoes: []` (wipe) | `success === true` — wipe atômico permitido |

### ETAPA 7 — Filtro lógico workspace (função pura se existir helper)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **U31** | Dado memberships `[A]` e lista workspaces `[A,B,C]` → filtro PADRAO | retorna `[A]` |
| **U32** | Dado bypass MASTER + mesma lista | retorna `[A,B,C]` |
| **U33** | Membership vazio + PADRAO | `[]` — Limbo correto, não «todos» |

> Se filtro só existir inline em rota, ETAPA 7 vira caso FUN-142; manter `it.todo` até extração ou teste via função exportada.

---

## Como rodar

```bash
npx vitest run --config testes/testes-unitarios/configurador/vitest.config.ts TST-UNI-CONFIG-RBAC-WORKSPACES-000141
```

## 📊 Resultado: [ ] APROVADO | [ ] REPROVADO | [ ] RESSALVAS
